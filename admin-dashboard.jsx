// admin-dashboard.jsx — Dashboard principal do painel administrativo

function AdminDashboard() {
  return (
    <div className="dash-frame">
      {/* ============ SIDEBAR ============ */}
      <aside className="dash-sidebar">
        <div className="brand">
          <img src="assets/logo-color.png" alt="Divan Móveis" />
        </div>

        <div className="sec-label">Operação</div>

        <div className="dash-nav active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="9"/>
            <rect x="14" y="3" width="7" height="5"/>
            <rect x="14" y="12" width="7" height="9"/>
            <rect x="3" y="16" width="7" height="5"/>
          </svg>
          Dashboard
        </div>

        <div className="dash-nav">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 3h15v13H1z"/>
            <path d="M16 8h4l3 3v5h-7V8z"/>
            <circle cx="5.5" cy="18.5" r="2.5"/>
            <circle cx="18.5" cy="18.5" r="2.5"/>
          </svg>
          Cargas e entregas
          <span className="badge-count">128</span>
        </div>

        <div className="dash-nav">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2C7.6 2 4 5.6 4 10c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          Mapa ao vivo
        </div>

        <div className="dash-nav">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          Motoristas
        </div>

        <div className="dash-nav">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
          Montadores
          <span className="badge-count">4</span>
        </div>

        <div className="sec-label">Insights</div>

        <div className="dash-nav">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          Relatórios
        </div>

        <div className="dash-nav">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          NPS · Avaliações
        </div>

        <div className="sec-label">Sistema</div>

        <div className="dash-nav">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          Configurações
        </div>

        <div className="dash-user">
          <div className="avatar">DC</div>
          <div>
            <div className="name">Daniel C.</div>
            <div className="role">Supervisor logística</div>
          </div>
        </div>
      </aside>

      {/* ============ MAIN ============ */}
      <main className="dash-main">
        <header className="dash-topbar">
          <div className="crumb">
            <strong>Dashboard</strong> · Visão geral do dia
          </div>
          <div className="topbar-actions">
            <div className="input-with-icon" style={{ width: 260 }}>
              <span className="icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </span>
              <input className="input" placeholder="Buscar nota, cliente, motorista…" style={{ width: "100%", fontSize: 13 }} />
            </div>
            <div className="icon-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span className="dot-red"></span>
            </div>
            <button className="btn btn-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Nova carga
            </button>
          </div>
        </header>

        <div className="dash-content">
          {/* Saudação */}
          <div className="dash-greeting">
            <div>
              <h1>Bom dia, Daniel! ☀️</h1>
              <p>Quarta, 14 de maio · <strong>7 notas chegaram pra hoje</strong> · vamos lá</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-secondary btn-sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Exportar
              </button>
            </div>
          </div>

          {/* KPIs */}
          <section className="dash-kpis">
            <KPI
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>}
              iconColor="#1D4ED8" iconBg="#DBEAFE"
              label="Entregas do dia"
              value="12/20"
              meta="60% da meta de hoje"
              delta="+12%" deltaDir="up"
            />
            <KPI
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 6 8 12 8 12s8-6 8-12a8 8 0 0 0-8-8z"/></svg>}
              iconColor="#FF4D00" iconBg="#FFE9DC" pulsing
              label="Em rota agora"
              value="6"
              meta="motoristas em campo"
              delta="+2 vs ontem" deltaDir="up"
            />
            <KPI
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
              iconColor="#B91C1C" iconBg="#FEE2E2"
              label="Precisam atenção"
              value="3"
              meta="abrir e ver o que houve"
              delta="+1 vs ontem" deltaDir="down"
            />
            <KPI
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}
              iconColor="#B45309" iconBg="#FEF3C7"
              label="NPS médio hoje"
              value="9,2"
              meta={<span className="stars">★★★★★</span>}
              delta="+0,4" deltaDir="up"
            />
          </section>

          {/* Linha 2 — tabela + mini-mapa */}
          <section className="dash-row2">
            <div className="dash-panel">
              <div className="dash-panel-head">
                <h3>Notas importadas recentemente</h3>
                <div className="tab-chips">
                  <span className="tab-chip on">Todas · 24</span>
                  <span className="tab-chip">Separação · 8</span>
                  <span className="tab-chip">Em rota · 6</span>
                  <span className="tab-chip">Problema · 3</span>
                </div>
              </div>

              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Nota</th>
                    <th>Cliente</th>
                    <th>Região</th>
                    <th style={{ textAlign: "right" }}>Valor</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <Row n="DM-2451" cli="Maria F. Souza"   reg="Vila Mariana" val="3.890,00" status={["em-rota","Em rota"]} />
                  <Row n="DM-2450" cli="João P. Lima"      reg="Pinheiros"    val="1.250,00" status={["consolidada","Consolidada"]} />
                  <Row n="DM-2449" cli="Ana C. Ribeiro"    reg="Tatuapé"      val="5.480,00" status={["problema","Problema"]} />
                  <Row n="DM-2448" cli="Lucas Andrade"     reg="Mooca"        val="2.100,00" status={["entregue","Entregue"]} />
                  <Row n="DM-2447" cli="Patrícia Vieira"   reg="Santana"      val="890,00"   status={["separacao","Separação"]} />
                  <Row n="DM-2446" cli="Rodrigo Mendes"    reg="Vila Olímpia" val="6.720,00" status={["em-entrega","Em entrega"]} />
                </tbody>
              </table>

              <div className="dash-pagi">
                <span>Mostrando 6 de 24 notas</span>
                <span>1 · 2 · 3 · 4 →</span>
              </div>
            </div>

            <div className="dash-panel">
              <div className="dash-panel-head">
                <h3>Frota em campo</h3>
                <span className="badge badge-em-rota"><span className="dot"></span>6 ativos</span>
              </div>
              <div className="minimap">
                <div className="map-badge"><span className="live"></span>Ao vivo</div>
                <div className="map-pin truck" style={{ top: 60, left: 80 }}>1</div>
                <div className="map-pin truck" style={{ top: 140, left: 230 }}>2</div>
                <div className="map-pin truck" style={{ top: 200, left: 130 }}>3</div>
                <div className="map-pin dest"  style={{ top: 50, left: 220 }}></div>
                <div className="map-pin dest"  style={{ top: 110, left: 290 }}></div>
                <div className="map-pin done"  style={{ top: 230, left: 280 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
              </div>
              <div style={{ padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Atualizado agora há pouco</span>
                <button className="btn btn-ghost btn-sm">Abrir mapa completo →</button>
              </div>
            </div>
          </section>

          {/* Linha 3 — equipe em campo (motoristas + montadores) */}
          <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
                  <span style={{ color: "var(--color-text-secondary)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 4 }}>Entregas</span>
                  Motoristas ativos
                </h3>
                <button className="btn btn-ghost btn-sm">Ver todos →</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <DriverCard name="Carlos Marques" route="Zona Sul · R1" done={3} total={5} initials="CM" />
                <DriverCard name="Renata Kowalski" route="Zona Oeste · R2" done={4} total={6} initials="RK" />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
                  <span style={{ color: "var(--color-text-secondary)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 4 }}>Pós-entrega</span>
                  Montadores em campo
                </h3>
                <button className="btn btn-ghost btn-sm">Ver todos →</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <AssemblerCard name="Felipe Tavares" task="Sofá retrátil · Vila Mariana" status="em-andamento" eta="~ 40 min" initials="FT" />
                <AssemblerCard name="Juliana Santos" task="Guarda-roupa 6p · Pinheiros" status="a-caminho" eta="chegada 15:20" initials="JS" />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

// ============ Componentes auxiliares ============
function KPI({ icon, iconColor, iconBg, label, value, meta, delta, deltaDir, pulsing }) {
  return (
    <div className="dash-kpi">
      <div className="head">
        <span className="icon" style={{ background: iconBg, color: iconColor, position: "relative" }}>
          {icon}
          {pulsing && (
            <span style={{
              position: "absolute", inset: -4, borderRadius: 12,
              border: `2px solid ${iconColor}`, opacity: 0.35, pointerEvents: "none",
              animation: "pulse 1.8s ease-out infinite"
            }} />
          )}
        </span>
        <span className="label">{label}</span>
      </div>
      <div className="value">{value}</div>
      <div className="meta">
        <span>{meta}</span>
        <span className={`delta ${deltaDir}`}>
          {deltaDir === "up" ? "▲" : "▼"} {delta}
        </span>
      </div>
    </div>
  );
}

function Row({ n, cli, reg, val, status }) {
  const [klass, label] = status;
  return (
    <tr>
      <td><strong>#{n}</strong></td>
      <td>{cli}</td>
      <td>{reg}</td>
      <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>R$ {val}</td>
      <td><span className={`badge badge-${klass}`}><span className="dot"></span>{label}</span></td>
      <td>
        <div className="row-actions">
          <span className="iconbtn-sm" title="Roteirizar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </span>
          <span className="iconbtn-sm" title="Detalhes">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
          </span>
        </div>
      </td>
    </tr>
  );
}

function AssemblerCard({ name, task, status, eta, initials }) {
  const isOnSite = status === "em-andamento";
  return (
    <div className="driver-card">
      <div className="top">
        <div className="avatar" style={{ background: "linear-gradient(135deg, #F7A800, #FF4D00)" }}>{initials}</div>
        <div>
          <div className="name">{name}</div>
          <div className="route">{task}</div>
        </div>
        <span className={`badge ${isOnSite ? "badge-em-entrega" : "badge-consolidada"}`} style={{ marginLeft: "auto" }}>
          <span className="dot"></span>{isOnSite ? "Montando" : "A caminho"}
        </span>
      </div>
      <div className="progress-row">
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          {eta}
        </span>
        <span><strong>1</strong> de 3 hoje</span>
      </div>
      <div className="progress-bar">
        <div className="fill" style={{ width: "33%", background: "linear-gradient(90deg, #F7A800, #CC5500)" }}></div>
      </div>
    </div>
  );
}

function DriverCard({ name, route, done, total, initials }) {
  const pct = (done / total) * 100;
  return (
    <div className="driver-card">
      <div className="top">
        <div className="avatar">{initials}</div>
        <div>
          <div className="name">{name}</div>
          <div className="route">{route}</div>
        </div>
        <span className="badge badge-em-rota" style={{ marginLeft: "auto" }}><span className="dot"></span>Ativo</span>
      </div>
      <div className="progress-row">
        <span>Progresso</span>
        <span><strong>{done}</strong> de {total} entregas</span>
      </div>
      <div className="progress-bar">
        <div className="fill" style={{ width: `${pct}%` }}></div>
      </div>
    </div>
  );
}

window.AdminDashboard = AdminDashboard;
