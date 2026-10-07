-- Divan Links — schema (PostgreSQL 14+ / PGlite). Idempotente.

CREATE TABLE IF NOT EXISTS users (
  id              SERIAL PRIMARY KEY,
  name            TEXT NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  password_hash   TEXT NOT NULL,
  role            TEXT NOT NULL CHECK (role IN ('admin','viewer')),
  totp_secret_enc TEXT,
  totp_enabled    BOOLEAN NOT NULL DEFAULT false,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','blocked')),
  failed_attempts INT NOT NULL DEFAULT 0,
  locked_until    TIMESTAMPTZ,
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  id          SERIAL PRIMARY KEY,
  user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL UNIQUE,
  stage       TEXT NOT NULL CHECK (stage IN ('full','pending_2fa','setup_2fa')),
  ip_prefix   TEXT,
  ua_summary  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at  TIMESTAMPTZ NOT NULL,
  revoked_at  TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS audit_log (
  id          BIGSERIAL PRIMARY KEY,
  user_id     INT REFERENCES users(id) ON DELETE SET NULL,
  user_email  TEXT,
  action      TEXT NOT NULL,
  entity      TEXT,
  entity_id   TEXT,
  diff        JSONB,
  ip_prefix   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_created_idx ON audit_log(created_at DESC);

CREATE TABLE IF NOT EXISTS ctas (
  id                  SERIAL PRIMARY KEY,
  key                 TEXT NOT NULL UNIQUE,
  label               TEXT NOT NULL,
  subtitle            TEXT,
  icon                TEXT NOT NULL DEFAULT 'link',
  style               TEXT NOT NULL DEFAULT 'dark' CHECK (style IN ('primary','highlight','dark','light')),
  sort_order          INT NOT NULL DEFAULT 0,
  type                TEXT NOT NULL CHECK (type IN ('url','whatsapp','whatsapp_tel','tel')),
  url                 TEXT,
  wa_message          TEXT,
  distribution        TEXT NOT NULL DEFAULT 'round_robin' CHECK (distribution IN ('round_robin','weighted','first')),
  rr_counter          INT NOT NULL DEFAULT 0,
  hours               JSONB,
  outside_hours_msg   TEXT,
  channel             TEXT NOT NULL DEFAULT 'outro',
  is_active           BOOLEAN NOT NULL DEFAULT true,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cta_destinations (
  id          SERIAL PRIMARY KEY,
  cta_id      INT NOT NULL REFERENCES ctas(id) ON DELETE CASCADE,
  label       TEXT,
  phone_e164  TEXT NOT NULL,
  weight      INT NOT NULL DEFAULT 1,
  is_active   BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS stores (
  id               SERIAL PRIMARY KEY,
  slug             TEXT NOT NULL UNIQUE,
  name             TEXT NOT NULL,
  city             TEXT NOT NULL,
  address          TEXT,
  google_place_id  TEXT,
  maps_url         TEXT,
  review_url       TEXT,
  reviews_url      TEXT,
  rating           NUMERIC(2,1),
  rating_count     INT,
  rating_updated_at TIMESTAMPTZ,
  status           TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','coming_soon','hidden')),
  sort_order       INT NOT NULL DEFAULT 0,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS store_rating_history (
  id           BIGSERIAL PRIMARY KEY,
  store_id     INT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  recorded_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  rating       NUMERIC(2,1),
  rating_count INT
);

CREATE TABLE IF NOT EXISTS campaigns (
  id             SERIAL PRIMARY KEY,
  slug           TEXT NOT NULL UNIQUE,
  name           TEXT NOT NULL,
  channel        TEXT NOT NULL DEFAULT 'outro',
  short_code     TEXT,
  default_utm    JSONB NOT NULL DEFAULT '{}'::jsonb,
  landing        TEXT NOT NULL DEFAULT 'page' CHECK (landing IN ('page','cta','review')),
  landing_cta    TEXT,
  landing_store  TEXT,
  starts_at      DATE,
  ends_at        DATE,
  is_active      BOOLEAN NOT NULL DEFAULT true,
  notes          TEXT,
  created_by     INT REFERENCES users(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sessões anônimas de visitantes (sem IP, sem user-agent bruto)
CREATE TABLE IF NOT EXISTS visitor_sessions (
  id              UUID PRIMARY KEY,
  anon_key        TEXT NOT NULL,
  visitor_hash    TEXT NOT NULL,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  campaign_slug   TEXT,
  traffic_source  TEXT,
  referrer_host   TEXT,
  utm             JSONB,
  device_type     TEXT,
  os              TEXT,
  browser         TEXT,
  geo_uf          TEXT,
  geo_city        TEXT,
  consent_level   TEXT,
  is_bot          BOOLEAN NOT NULL DEFAULT false,
  is_internal     BOOLEAN NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS vs_anon_idx ON visitor_sessions(anon_key, last_seen_at DESC);
CREATE INDEX IF NOT EXISTS vs_started_idx ON visitor_sessions(started_at);

-- Eventos (dados brutos com retenção configurável). Campos denormalizados para filtro e CSV.
CREATE TABLE IF NOT EXISTS events (
  id               BIGSERIAL PRIMARY KEY,
  occurred_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  event_type       TEXT NOT NULL,
  session_id       UUID,
  visitor_hash     TEXT,
  cta_key          TEXT,
  channel          TEXT,
  store_slug       TEXT,
  campaign_slug    TEXT,
  destination      TEXT,
  destination_type TEXT,
  traffic_source   TEXT,
  referrer_host    TEXT,
  utm_source       TEXT,
  utm_medium       TEXT,
  utm_campaign     TEXT,
  utm_content      TEXT,
  utm_term         TEXT,
  device_type      TEXT,
  os               TEXT,
  browser          TEXT,
  geo_uf           TEXT,
  geo_city         TEXT,
  consent_level    TEXT,
  is_bot           BOOLEAN NOT NULL DEFAULT false,
  is_internal      BOOLEAN NOT NULL DEFAULT false,
  is_dup           BOOLEAN NOT NULL DEFAULT false,
  meta             JSONB
);
CREATE INDEX IF NOT EXISTS ev_time_idx ON events(occurred_at);
CREATE INDEX IF NOT EXISTS ev_type_time_idx ON events(event_type, occurred_at);
CREATE INDEX IF NOT EXISTS ev_cmp_time_idx ON events(campaign_slug, occurred_at);
CREATE INDEX IF NOT EXISTS ev_store_time_idx ON events(store_slug, occurred_at);
CREATE INDEX IF NOT EXISTS ev_dedup_idx ON events(session_id, cta_key, occurred_at DESC);

-- Agregados diários (mantidos após a limpeza dos dados brutos; sem dado pessoal)
CREATE TABLE IF NOT EXISTS daily_stats (
  day             DATE NOT NULL,
  event_type      TEXT NOT NULL,
  cta_key         TEXT NOT NULL DEFAULT '',
  store_slug      TEXT NOT NULL DEFAULT '',
  campaign_slug   TEXT NOT NULL DEFAULT '',
  traffic_source  TEXT NOT NULL DEFAULT '',
  device_type     TEXT NOT NULL DEFAULT '',
  geo_uf          TEXT NOT NULL DEFAULT '',
  count           INT NOT NULL,
  PRIMARY KEY (day, event_type, cta_key, store_slug, campaign_slug, traffic_source, device_type, geo_uf)
);
CREATE TABLE IF NOT EXISTS daily_totals (
  day       DATE PRIMARY KEY,
  visitors  INT NOT NULL,
  sessions  INT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  updated_by  INT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS consent_stats (
  day     DATE NOT NULL,
  choice  TEXT NOT NULL,
  count   INT NOT NULL DEFAULT 0,
  PRIMARY KEY (day, choice)
);

-- v2: botão de ligação opcional, atalho que abre a lista de lojas, telefone e horário por loja
ALTER TABLE ctas ADD COLUMN IF NOT EXISTS show_call BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE ctas ADD COLUMN IF NOT EXISTS opens_stores BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS hours_text TEXT;
