// nps-screens.jsx — Cliente NPS Form + Admin NPS Dashboard

function ClienteNPSForm({ onSubmit } = {}) {
  const [motStar, setMotStar] = React.useState(5);
  const [montStar, setMontStar] = React.useState(4);
  const [score, setScore] = React.useState(9);
  const handleSubmit = () => { if (typeof onSubmit === "function") onSubmit({ motStar, montStar, score }); };

  return (
    <div className="phone-frame">
      <div className="phone-screen">
        <div className="phone-status" style={{ color: "#fff", zIndex: 6 }}>
          <span>9:41</span>
          <div className="dots"><span></span><span></span><span></span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <svg width="16" height="11" viewBox="0 0 17 11" fill="currentColor"><rect y="6" width="3" height="5" rx="0.5"/><rect x="4.5" y="3.5" width="3" height="7.5" rx="0.5"/><rect x="9" y="1" width="3" height="10" rx="0.5"/><rect x="13.5" width="3" height="11" rx="0.5"/></svg>
            <div className="battery"><div className="fill"></div></div>
          </div>
        </div>

        <div className="nps-screen">
          <div className="nps-hero">
            <img src="assets/logo-white.png" alt="Divan Móveis" className="nps-hero-logo" />
            <h1>E aí, gostou da experiência?</h1>
            <p>Pedido #DM-2451 · entregue e montado hoje</p>
          </div>

          <div className="nps-body">
            <div className="rating-card">
              <div className="who">
                <div className="av">CM</div>
                <div className="info">
                  <div className="role">Motorista</div>
                  <div className="nm">Carlos Marques</div>
                </div>
              </div>
              <p className="q">Foi pontual? Cuidou bem dos produtos? Tratou bem você?</p>
              <div className="stars">
                {[1,2,3,4,5].map(n => (
                  <span key={n} className={`star ${n <= motStar ? "on" : ""}`} onClick={() => setMotStar(n)}>★</span>
                ))}
              </div>
            </div>

            <div className="rating-card">
              <div className="who mont">
                <div className="av">FT</div>
                <div className="info">
                  <div className="role">Montador</div>
                  <div className="nm">Felipe Tavares</div>
                </div>
              </div>
              <p className="q">Montou com capricho? Deixou seu espaço limpo no fim?</p>
              <div className="stars">
                {[1,2,3,4,5].map(n => (
                  <span key={n} className={`star ${n <= montStar ? "on" : ""}`} onClick={() => setMontStar(n)}>★</span>
                ))}
              </div>
            </div>

            <div className="rating-card">
              <p className="q" style={{ marginBottom: 12, fontWeight: 600 }}>Numa escala de 0 a 10, indicaria a Divan pra alguém?</p>
              <div className="nps-strip">
                {[0,1,2,3,4,5,6,7,8,9,10].map(n => {
                  const cls = n <= 6 ? "detrator" : n <= 8 ? "neutro" : "promotor";
                  return (
                    <div key={n} className={`nps-cell ${cls} ${score === n ? "selected" : ""}`} onClick={() => setScore(n)}>{n}</div>
                  );
                })}
              </div>
              <div className="scale-row">
                <span>Não indicaria</span>
                <span>Com certeza</span>
              </div>
            </div>

            <div className="rating-card">
              <p className="q" style={{ marginBottom: 10, fontWeight: 600 }}>Quer deixar um recadinho? <span style={{ color: "var(--color-text-secondary)", fontWeight: 400 }}>(opcional, mas a gente lê tudo)</span></p>
              <textarea
                className="input"
                placeholder="Conta pra gente como foi…"
                style={{ width: "100%", minHeight: 80, fontSize: 14, resize: "none" }}
              />
            </div>
          </div>

          <div className="nps-foot">
            <button className="btn btn-primary" onClick={handleSubmit}>Enviar avaliação</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminNPS() {
  return (
    <div className="dash-frame">
      <CargasSidebar />

      <main className="dash-main">
        <header className="dash-topbar">
          <div>
            <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Insights</div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>NPS · Net Promoter Score</h1>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-secondary btn-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Últimos 30 dias
            </button>
            <button className="btn btn-secondary btn-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Exportar
            </button>
          </div>
        </header>

        <div style={{ padding: 24, overflow: "auto", flex: 1 }}>
          <div className="nps-grid">
            <div className="nps-score-card">
              <div className="lbl">NPS · Maio/24</div>
              <div className="big">76</div>
              <span className="tag">Excelente</span>
              <div className="breakdown">
                <div className="cell">
                  <div className="v">82%</div>
                  <div className="k">Promotores</div>
                </div>
                <div className="cell">
                  <div className="v">12%</div>
                  <div className="k">Neutros</div>
                </div>
                <div className="cell">
                  <div className="v">6%</div>
                  <div className="k">Detratores</div>
                </div>
              </div>
            </div>

            <div className="nps-chart">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h3>Tendência semanal</h3>
                  <div className="sub">412 respostas · meta 70</div>
                </div>
                <span className="badge badge-entregue"><span className="dot"></span>+8 vs. abril</span>
              </div>
              <svg className="nps-chart-svg" viewBox="0 0 500 180" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="npsg" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#FF4D00" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#FF4D00" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="60" x2="500" y2="60" stroke="#E5E7EB" strokeDasharray="3,3" />
                <text x="6" y="55" fontSize="10" fill="#9CA3AF">80</text>
                <line x1="0" y1="120" x2="500" y2="120" stroke="#E5E7EB" strokeDasharray="3,3" />
                <text x="6" y="115" fontSize="10" fill="#9CA3AF">60</text>
                <path d="M 30 110 L 110 95 L 190 80 L 270 70 L 350 55 L 430 48 L 480 42 L 480 180 L 30 180 Z" fill="url(#npsg)" />
                <path d="M 30 110 L 110 95 L 190 80 L 270 70 L 350 55 L 430 48 L 480 42" stroke="#FF4D00" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                {[[30,110],[110,95],[190,80],[270,70],[350,55],[430,48],[480,42]].map(([x,y],i) => (
                  <circle key={i} cx={x} cy={y} r="4" fill="#fff" stroke="#FF4D00" strokeWidth="2.5" />
                ))}
                <text x="30" y="172" fontSize="10" fill="#9CA3AF" textAnchor="middle">S1</text>
                <text x="110" y="172" fontSize="10" fill="#9CA3AF" textAnchor="middle">S2</text>
                <text x="190" y="172" fontSize="10" fill="#9CA3AF" textAnchor="middle">S3</text>
                <text x="270" y="172" fontSize="10" fill="#9CA3AF" textAnchor="middle">S4</text>
                <text x="350" y="172" fontSize="10" fill="#9CA3AF" textAnchor="middle">S5</text>
                <text x="430" y="172" fontSize="10" fill="#9CA3AF" textAnchor="middle">S6</text>
                <text x="480" y="172" fontSize="10" fill="#9CA3AF" textAnchor="end">hoje</text>
              </svg>
            </div>
          </div>

          <div className="nps-2col">
            <div className="team-table">
              <h3>Top motoristas <span style={{ fontSize: 11, color: "var(--color-text-secondary)", fontWeight: 500 }}>por nota média (★)</span></h3>
              <TeamRow av="RK" nm="Renata Kowalski" score="4.9" runs="68 entregas" />
              <TeamRow av="CM" nm="Carlos Marques" score="4.8" runs="92 entregas" />
              <TeamRow av="BR" nm="Bruno Rocha" score="4.6" runs="54 entregas" />
              <TeamRow av="LS" nm="Lucas Silveira" score="4.4" runs="71 entregas" />
            </div>

            <div className="team-table">
              <h3>Top montadores <span style={{ fontSize: 11, color: "var(--color-text-secondary)", fontWeight: 500 }}>por nota média (★)</span></h3>
              <TeamRow mont av="JS" nm="Juliana Santos" score="4.9" runs="34 montagens" />
              <TeamRow mont av="FT" nm="Felipe Tavares" score="4.7" runs="47 montagens" />
              <TeamRow mont av="RC" nm="Rafael Costa" score="4.5" runs="29 montagens" />
              <TeamRow mont av="AM" nm="André Moreira" score="4.2" runs="38 montagens" />
            </div>
          </div>

          <div className="comments-list" style={{ marginTop: 20 }}>
            <h3>
              Comentários recentes
              <button className="btn btn-ghost btn-sm">Ver todos →</button>
            </h3>
            <div className="comment-item">
              <div className="top">
                <span className="cli-nm">Maria F. Souza</span>
                <span className="date">há 2h · #DM-2451</span>
              </div>
              <p className="quote">"Equipe muito profissional. O Carlos chegou na hora certa e o Felipe montou o sofá com muito capricho. Recomendo de olhos fechados."</p>
              <div className="tags">
                <span className="ctag promotor">★ 10 · Promotor</span>
                <span className="ctag mot">Carlos M.</span>
                <span className="ctag mont">Felipe T.</span>
              </div>
            </div>
            <div className="comment-item">
              <div className="top">
                <span className="cli-nm">Carla Nogueira</span>
                <span className="date">há 5h · #DM-2455</span>
              </div>
              <p className="quote">"Entrega ótima, mas o montador atrasou 40 min e não avisou. Produto chegou em perfeito estado."</p>
              <div className="tags">
                <span className="ctag neutro">★ 7 · Neutro</span>
                <span className="ctag mot">Renata K.</span>
                <span className="ctag mont">André M.</span>
              </div>
            </div>
            <div className="comment-item">
              <div className="top">
                <span className="cli-nm">Pedro Almeida</span>
                <span className="date">há 1d · #DM-2453</span>
              </div>
              <p className="quote">"Cabeceira chegou riscada na lateral. O motorista foi atencioso e abriu chamado na hora, aguardando retorno."</p>
              <div className="tags">
                <span className="ctag detrator">★ 4 · Detrator</span>
                <span className="ctag mot">Bruno R.</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function TeamRow({ av, nm, score, runs, mont }) {
  const full = Math.floor(parseFloat(score));
  return (
    <div className={`team-row ${mont ? "mont" : ""}`}>
      <div className="av">{av}</div>
      <div className="nm">
        {nm}
        <div className="runs">{runs}</div>
      </div>
      <div className="stars-mini">
        {[1,2,3,4,5].map(n => (
          <svg key={n} width="13" height="13" viewBox="0 0 24 24" fill={n <= full ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className={n > full ? "off" : ""}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        ))}
      </div>
      <div className="score">{score}</div>
    </div>
  );
}

/* ============================================================
   CLIENTE · TRACKING AO VIVO
   Timeline de status + ETA + motorista + pedido
   ============================================================ */
function ClienteTracking() {
  // step atual: 0..5 — 3 = "A caminho de você"
  const [activeStep] = React.useState(3);

  const steps = [
    { id: 0, ico: "📦", title: "Pedido recebido",                 when: "15/05 · 09:42",   done: true,  active: false },
    { id: 1, ico: "🏭", title: "Separação no centro de distribuição", when: "15/05 · 11:14", done: true,  active: false },
    { id: 2, ico: "🚚", title: "Saiu para entrega",                when: "Hoje · 13:20",    done: true,  active: false },
    { id: 3, ico: "📍", title: "Está quase aí!",                   when: "Chega em ~ 14 min", done: false, active: true  },
    { id: 4, ico: "✅", title: "Entregue na sua casa",             when: "Logo logo",       done: false, active: false },
    { id: 5, ico: "🔧", title: "Montagem agendada",                when: "Amanhã · 10h–12h", done: false, active: false, future: true },
  ];

  return (
    <div className="phone-frame">
      <div className="phone-screen">
        <div className="phone-status" style={{ color: "#fff", zIndex: 6 }}>
          <span>9:41</span>
          <div className="dots"><span></span><span></span><span></span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <svg width="16" height="11" viewBox="0 0 17 11" fill="currentColor"><rect y="6" width="3" height="5" rx="0.5"/><rect x="4.5" y="3.5" width="3" height="7.5" rx="0.5"/><rect x="9" y="1" width="3" height="10" rx="0.5"/><rect x="13.5" width="3" height="11" rx="0.5"/></svg>
            <div className="battery"><div className="fill"></div></div>
          </div>
        </div>

        <div className="track-screen">
          {/* Header com gradiente da marca */}
          <div className="track-hero">
            <div className="track-brand">
              <img src="assets/logo-white.png" alt="Divan Móveis" className="track-logo" />
              <div className="track-brand-meta">
                <div className="track-tag">Acompanhe sua entrega</div>
                <div className="track-order">Pedido #DM-2451</div>
              </div>
            </div>
            <h1 className="track-title">Oi, dona Maria! 👋</h1>
            <p className="track-sub">Seu sofá já está a caminho — chega em <strong>~ 14 minutinhos</strong>.</p>

            {/* Mini-mapa do motorista em tempo real */}
            <div className="track-map">
              <div className="track-map-bg">
                <svg viewBox="0 0 100 60" preserveAspectRatio="none" style={{ position:"absolute", inset:0, width:"100%", height:"100%" }}>
                  <path d="M 0 30 Q 30 22, 50 30 T 100 28" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2.5" strokeDasharray="4 3" strokeLinecap="round"/>
                  <path d="M 15 0 Q 30 30, 25 60" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5"/>
                  <path d="M 70 0 Q 60 30, 80 60" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5"/>
                </svg>
                <span className="map-pin truck">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/></svg>
                </span>
                <span className="map-pin home">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l9 8h-3v9h-5v-6h-2v6H6v-9H3z"/></svg>
                </span>
                <span className="map-label">2,4 km · 14 min</span>
              </div>
            </div>
          </div>

          {/* Timeline de status */}
          <div className="track-body">
            <div className="timeline">
              {steps.map((s, i) => (
                <div
                  key={s.id}
                  className={`tl-step ${s.done ? "done" : ""} ${s.active ? "active" : ""} ${s.future ? "future" : ""}`}
                >
                  <div className="tl-rail">
                    <div className="tl-dot">
                      {s.done ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : s.active ? (
                        <span className="tl-pulse" />
                      ) : null}
                    </div>
                    {i < steps.length - 1 && <div className="tl-line" />}
                  </div>
                  <div className="tl-content">
                    <div className="tl-title">
                      <span className="tl-emoji">{s.ico}</span>
                      {s.title}
                    </div>
                    <div className="tl-when">{s.when}</div>
                    {s.active && (
                      <div className="tl-extra">
                        Seu Carlos está a caminho · acompanhe pelo mapa logo acima
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Card motorista */}
            <div className="track-people">
              <div className="track-person mot">
                <div className="av">CM</div>
                <div className="info">
                  <div className="role">Seu motorista</div>
                  <div className="nm">Carlos Marques</div>
                  <div className="meta">Frota Divan · Placa FXR-2A47</div>
                </div>
                <button className="call-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z"/></svg>
                </button>
              </div>
              <div className="track-person mont">
                <div className="av">FT</div>
                <div className="info">
                  <div className="role">Seu montador (amanhã)</div>
                  <div className="nm">Felipe Tavares</div>
                  <div className="meta">Montador parceiro · MEI</div>
                </div>
              </div>
            </div>

            {/* Card pedido */}
            <div className="track-order-card">
              <div className="track-order-head">
                <strong>Seu pedido</strong>
                <span>#DM-2451</span>
              </div>
              <div className="track-prods">
                <div className="track-prod">
                  <div className="pic" style={{ background: "linear-gradient(135deg, #FFB800 10%, #CC5500)" }}>🛋️</div>
                  <div className="info">
                    <div className="nm">Sofá retrátil 3 lugares · Cinza</div>
                    <div className="meta">1× · Inclui montagem</div>
                  </div>
                </div>
                <div className="track-prod">
                  <div className="pic" style={{ background: "linear-gradient(135deg, #F7941D 10%, #1a1a1a)" }}>🪑</div>
                  <div className="info">
                    <div className="nm">Mesa de centro · Carvalho</div>
                    <div className="meta">1× · Inclui montagem</div>
                  </div>
                </div>
                <div className="track-prod">
                  <div className="pic" style={{ background: "#F3F4F6", color: "#1a1a1a" }}>🛏️</div>
                  <div className="info">
                    <div className="nm">Almofadas decorativas</div>
                    <div className="meta">4× · Sem montagem</div>
                  </div>
                </div>
              </div>
              <div className="track-total">
                <span>Total</span>
                <strong>R$ 3.890,00</strong>
              </div>
            </div>

            {/* Suporte */}
            <div className="track-help">
              <div className="track-help-ico">💬</div>
              <div>
                <strong>Precisa de ajuda?</strong>
                <p>Fale com a Divan no WhatsApp</p>
              </div>
              <button className="track-help-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   CLIENTE · OBRIGADO PELO FEEDBACK (pós-NPS)
   ============================================================ */
function ClienteObrigado() {
  return (
    <div className="phone-frame">
      <div className="phone-screen">
        <div className="phone-status" style={{ color: "#fff", zIndex: 6 }}>
          <span>9:41</span>
          <div className="dots"><span></span><span></span><span></span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <svg width="16" height="11" viewBox="0 0 17 11" fill="currentColor"><rect y="6" width="3" height="5" rx="0.5"/><rect x="4.5" y="3.5" width="3" height="7.5" rx="0.5"/><rect x="9" y="1" width="3" height="10" rx="0.5"/><rect x="13.5" width="3" height="11" rx="0.5"/></svg>
            <div className="battery"><div className="fill"></div></div>
          </div>
        </div>

        <div className="thx-screen">
          <div className="thx-hero">
            <img src="assets/logo-color.png" alt="Divan Móveis" className="thx-logo" />
            <div className="thx-heart">💛</div>
          </div>
          <h1 className="thx-h1">Muito obrigado, dona Maria!</h1>
          <p className="thx-p">
            Sua avaliação chegou direitinho aqui. A gente lê uma a uma — é assim
            que a Divan vai ficando cada dia melhor pra você.
          </p>

          <div className="thx-card">
            <div className="thx-card-head">Sua avaliação</div>
            <div className="thx-row">
              <span>Carlos Marques (entrega)</span>
              <span className="stars">★★★★★</span>
            </div>
            <div className="thx-row">
              <span>Felipe Tavares (montagem)</span>
              <span className="stars">★★★★☆</span>
            </div>
            <div className="thx-row">
              <span>Indicaria a Divan</span>
              <strong className="thx-nps">9 / 10</strong>
            </div>
          </div>

          <div className="thx-bonus">
            <div className="thx-bonus-ico">🎁</div>
            <div>
              <strong>Um agrado pra você</strong>
              <p>
                Cupom <code>OBRIGADADA10</code> com 10% na próxima compra.
                Valor até 30/06 · enviamos também por WhatsApp.
              </p>
            </div>
          </div>

          <div className="thx-help">
            Algo não saiu como esperado?
            <button className="thx-help-btn">
              Falar com a Divan
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </div>

          <div className="thx-foot">
            Feito com <span style={{ color: "#FF4D00" }}>♥</span> na Divan Móveis · Cachoeiro de Itapemirim · ES
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ★★ VERSÕES DESKTOP — Portal do cliente online ★★
   ============================================================ */

function ClienteTrackingDesktop() {
  const steps = [
    { ico: "📦", title: "Pedido recebido",                       when: "15/05 · 09:42",   done: true,  active: false },
    { ico: "🏭", title: "Separação no centro de distribuição",   when: "15/05 · 11:14",   done: true,  active: false },
    { ico: "🚚", title: "Saiu para entrega",                     when: "Hoje · 13:20",    done: true,  active: false },
    { ico: "📍", title: "Está quase aí!",                        when: "Chega em ~ 14 min", done: false, active: true  },
    { ico: "✅", title: "Entregue na sua casa",                  when: "Logo logo",       done: false, active: false },
    { ico: "🔧", title: "Montagem agendada",                     when: "Amanhã · 10h–12h", done: false, active: false, future: true },
  ];

  return (
    <div className="cd-page">
      <header className="cd-topbar">
        <div className="cd-wrap cd-topbar-inner">
          <img src="assets/logo-color.png" alt="Divan Móveis" className="cd-logo" />
          <div className="cd-topbar-right">
            <div className="cd-order-chip">
              <span className="cd-order-lbl">Pedido</span>
              <strong>#DM-2451</strong>
            </div>
            <a href="#wpp" className="cd-wpp">
              <span className="cd-wpp-ico">💬</span>
              <span>Falar com a Divan</span>
            </a>
          </div>
        </div>
      </header>

      <section className="cd-hero">
        <div className="cd-wrap cd-hero-inner">
          <div className="cd-hero-text">
            <div className="cd-eyebrow">Acompanhe sua entrega ao vivo</div>
            <h1>Oi, dona Maria! <span className="cd-wave">👋</span></h1>
            <p>Seu sofá já está a caminho — chega em <strong>~ 14 minutinhos</strong>. Pode ficar tranquila aí, o seu Carlos está com tudo.</p>
            <div className="cd-eta-strip">
              <div className="cd-eta">
                <span className="cd-eta-lbl">Distância</span>
                <strong>2,4 km</strong>
              </div>
              <span className="cd-eta-sep" />
              <div className="cd-eta">
                <span className="cd-eta-lbl">Tempo até chegar</span>
                <strong>~ 14 min</strong>
              </div>
              <span className="cd-eta-sep" />
              <div className="cd-eta">
                <span className="cd-eta-lbl">Próxima fase</span>
                <strong>Montagem amanhã</strong>
              </div>
            </div>
          </div>
          <div className="cd-hero-map">
            <div className="cd-map-bg">
              <svg viewBox="0 0 100 60" preserveAspectRatio="none" style={{ position:"absolute", inset:0, width:"100%", height:"100%" }}>
                <path d="M 0 30 Q 30 22, 50 30 T 100 28" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2.5" strokeDasharray="4 3" strokeLinecap="round"/>
                <path d="M 15 0 Q 30 30, 25 60" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5"/>
                <path d="M 70 0 Q 60 30, 80 60" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5"/>
              </svg>
              <span className="cd-map-truck">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/></svg>
              </span>
              <span className="cd-map-home">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l9 8h-3v9h-5v-6h-2v6H6v-9H3z"/></svg>
              </span>
              <span className="cd-map-label">Vila Mariana · São Paulo</span>
            </div>
          </div>
        </div>
      </section>

      <main className="cd-wrap cd-main">
        {/* coluna timeline */}
        <section className="cd-card cd-timeline-card">
          <header className="cd-card-head">
            <h2>Sua jornada Divan</h2>
            <p>Cada etapa registrada com horário. Atualizamos em tempo real.</p>
          </header>
          <div className="cd-tl">
            {steps.map((s, i) => (
              <div key={i} className={`cd-tl-step ${s.done ? "done" : ""} ${s.active ? "active" : ""} ${s.future ? "future" : ""}`}>
                <div className="cd-tl-rail">
                  <div className="cd-tl-dot">
                    {s.done && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                    {s.active && <span className="cd-tl-pulse" />}
                  </div>
                  {i < steps.length - 1 && <div className="cd-tl-line" />}
                </div>
                <div className="cd-tl-content">
                  <div className="cd-tl-title"><span className="cd-tl-emoji">{s.ico}</span>{s.title}</div>
                  <div className="cd-tl-when">{s.when}</div>
                  {s.active && (
                    <div className="cd-tl-extra">
                      <strong>Seu Carlos está chegando</strong>
                      Acompanhe pelo mapa acima · vamos te avisar de novo quando estiver na portaria
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* coluna lateral */}
        <aside className="cd-side">
          <div className="cd-card cd-person">
            <div className="cd-person-head">
              <span className="cd-person-tag">Quem vai te entregar</span>
            </div>
            <div className="cd-person-row">
              <div className="cd-avatar mot">CM</div>
              <div className="cd-person-info">
                <div className="cd-person-nm">Carlos Marques</div>
                <div className="cd-person-meta">Frota Divan · placa FXR-2A47</div>
                <div className="cd-person-meta">★ 4,9 · 147 entregas no mês</div>
              </div>
              <button className="cd-call">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z"/></svg>
              </button>
            </div>
            <div className="cd-person-row mont">
              <div className="cd-avatar mont">FT</div>
              <div className="cd-person-info">
                <div className="cd-person-nm">Felipe Tavares <span className="cd-tag-mini">amanhã</span></div>
                <div className="cd-person-meta">Montador parceiro Divan</div>
                <div className="cd-person-meta">★ 4,8 · especialista em estofados</div>
              </div>
            </div>
          </div>

          <div className="cd-card cd-order">
            <div className="cd-card-head"><h3>Seu pedido</h3><span>#DM-2451</span></div>
            <div className="cd-prods">
              <div className="cd-prod">
                <div className="cd-prod-pic" style={{ background: "linear-gradient(135deg, #FFB800, #CC5500)" }}>🛋️</div>
                <div>
                  <div className="cd-prod-nm">Sofá retrátil 3 lugares</div>
                  <div className="cd-prod-meta">Cor cinza · inclui montagem</div>
                </div>
                <span className="cd-prod-qty">1×</span>
              </div>
              <div className="cd-prod">
                <div className="cd-prod-pic" style={{ background: "linear-gradient(135deg, #F7941D, #1a1a1a)" }}>🪑</div>
                <div>
                  <div className="cd-prod-nm">Mesa de centro</div>
                  <div className="cd-prod-meta">Carvalho · inclui montagem</div>
                </div>
                <span className="cd-prod-qty">1×</span>
              </div>
              <div className="cd-prod">
                <div className="cd-prod-pic" style={{ background: "#F3F4F6", color: "#1a1a1a" }}>🛏️</div>
                <div>
                  <div className="cd-prod-nm">Almofadas decorativas</div>
                  <div className="cd-prod-meta">Kit com 4 · sem montagem</div>
                </div>
                <span className="cd-prod-qty">4×</span>
              </div>
            </div>
            <div className="cd-order-total">
              <span>Total do pedido</span>
              <strong>R$ 3.890,00</strong>
            </div>
          </div>
        </aside>
      </main>

      <footer className="cd-foot">
        <div className="cd-wrap cd-foot-inner">
          <div>
            Feito com <span style={{ color: "#FF4D00" }}>♥</span> na Divan Móveis
            <br/><span className="cd-foot-meta">Cachoeiro de Itapemirim · ES · CNPJ 12.345.678/0001-90</span>
          </div>
          <div className="cd-foot-links">
            <a href="#">Política de entrega</a>
            <a href="#">Trocas e devoluções</a>
            <a href="#">Suporte WhatsApp</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ClienteNPSFormDesktop({ onSubmit } = {}) {
  const [motStar, setMotStar]   = React.useState(5);
  const [montStar, setMontStar] = React.useState(4);
  const [score, setScore]       = React.useState(9);
  const submit = () => { if (typeof onSubmit === "function") onSubmit({ motStar, montStar, score }); };

  return (
    <div className="cd-page">
      <header className="cd-topbar">
        <div className="cd-wrap cd-topbar-inner">
          <img src="assets/logo-color.png" alt="Divan Móveis" className="cd-logo" />
          <div className="cd-order-chip"><span className="cd-order-lbl">Pedido</span><strong>#DM-2451</strong></div>
        </div>
      </header>

      <section className="cd-hero light">
        <div className="cd-wrap cd-hero-narrow">
          <div className="cd-eyebrow">Avaliação carinhosa</div>
          <h1>E aí, dona Maria — gostou da experiência? 💛</h1>
          <p>O seu feedback chega direto pra nossa equipe. A gente lê tudo — é o que faz a Divan ficar cada dia melhor.</p>
        </div>
      </section>

      <main className="cd-wrap cd-nps-main">
        <div className="cd-nps-grid">
          <div className="cd-card cd-rate">
            <div className="cd-rate-head">
              <div className="cd-avatar mot lg">CM</div>
              <div>
                <span className="cd-rate-role">Motorista</span>
                <h3>Carlos Marques</h3>
                <p>147 entregas · ★ 4,9 médio</p>
              </div>
            </div>
            <p className="cd-rate-q">Foi pontual? Cuidou bem dos produtos? Tratou bem você?</p>
            <div className="cd-stars-lg">
              {[1,2,3,4,5].map(n => (
                <span key={n} className={`cd-star ${n <= motStar ? "on" : ""}`} onClick={() => setMotStar(n)}>★</span>
              ))}
            </div>
          </div>

          <div className="cd-card cd-rate">
            <div className="cd-rate-head">
              <div className="cd-avatar mont lg">FT</div>
              <div>
                <span className="cd-rate-role">Montador</span>
                <h3>Felipe Tavares</h3>
                <p>54 montagens · MEI · ★ 4,8 médio</p>
              </div>
            </div>
            <p className="cd-rate-q">Montou com capricho? Deixou seu espaço limpo no fim?</p>
            <div className="cd-stars-lg">
              {[1,2,3,4,5].map(n => (
                <span key={n} className={`cd-star ${n <= montStar ? "on" : ""}`} onClick={() => setMontStar(n)}>★</span>
              ))}
            </div>
          </div>
        </div>

        <div className="cd-card cd-nps-bigq">
          <h3>Numa escala de 0 a 10, indicaria a Divan pra alguém?</h3>
          <p>Quanto maior a nota, mais a gente sabe que tá no caminho certo.</p>
          <div className="cd-nps-strip">
            {[0,1,2,3,4,5,6,7,8,9,10].map(n => {
              const cls = n <= 6 ? "detrator" : n <= 8 ? "neutro" : "promotor";
              return (
                <div key={n} className={`cd-nps-cell ${cls} ${score === n ? "selected" : ""}`} onClick={() => setScore(n)}>{n}</div>
              );
            })}
          </div>
          <div className="cd-nps-scale">
            <span>Não indicaria</span>
            <span>Com certeza</span>
          </div>
        </div>

        <div className="cd-card cd-nps-msg">
          <h3>Quer deixar um recadinho? <span>(opcional, mas a gente lê tudo)</span></h3>
          <textarea placeholder="Conta pra gente como foi…" rows={4} />
          <button className="cd-btn" onClick={submit}>
            Enviar avaliação
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </div>
      </main>

      <footer className="cd-foot">
        <div className="cd-wrap cd-foot-inner">
          <div>Feito com <span style={{ color: "#FF4D00" }}>♥</span> na Divan Móveis · Cachoeiro de Itapemirim · ES</div>
        </div>
      </footer>
    </div>
  );
}

function ClienteObrigadoDesktop() {
  return (
    <div className="cd-page">
      <header className="cd-topbar">
        <div className="cd-wrap cd-topbar-inner">
          <img src="assets/logo-color.png" alt="Divan Móveis" className="cd-logo" />
        </div>
      </header>

      <section className="cd-thx-hero">
        <div className="cd-thx-burst"><span /><span /><span /></div>
        <div className="cd-thx-icon">💛</div>
        <h1>Muito obrigado, dona Maria!</h1>
        <p>Sua avaliação chegou direitinho aqui. A gente lê uma a uma — é assim que a Divan vai ficando cada dia melhor pra você.</p>
      </section>

      <main className="cd-wrap cd-thx-main">
        <div className="cd-thx-grid">
          <div className="cd-card">
            <div className="cd-card-head"><h3>Sua avaliação</h3><span>Registrada hoje · 14:32</span></div>
            <div className="cd-thx-row">
              <div className="cd-avatar mot sm">CM</div>
              <div className="cd-thx-info">
                <strong>Carlos Marques</strong>
                <span>Motorista</span>
              </div>
              <span className="cd-thx-stars">★★★★★</span>
            </div>
            <div className="cd-thx-row">
              <div className="cd-avatar mont sm">FT</div>
              <div className="cd-thx-info">
                <strong>Felipe Tavares</strong>
                <span>Montador</span>
              </div>
              <span className="cd-thx-stars">★★★★☆</span>
            </div>
            <div className="cd-thx-row total">
              <div className="cd-thx-info">
                <strong>Indicaria a Divan</strong>
                <span>Net Promoter Score</span>
              </div>
              <span className="cd-thx-nps">9 / 10</span>
            </div>
          </div>

          <div className="cd-card cd-cupom">
            <div className="cd-cupom-ico">🎁</div>
            <div className="cd-cupom-tag">Um agrado pra você</div>
            <div className="cd-cupom-code">OBRIGADADA10</div>
            <p>
              <strong>10% de desconto</strong> na sua próxima compra na Divan.
              Válido até <strong>30/06/2026</strong> · também enviamos por WhatsApp pra você não perder.
            </p>
            <button className="cd-btn outline">Copiar cupom</button>
          </div>
        </div>

        <div className="cd-thx-help">
          <div>
            <strong>Algo não saiu como esperado?</strong>
            <p>Conta pra gente o que aconteceu — a Divan resolve.</p>
          </div>
          <a href="#wpp" className="cd-btn">
            Falar com a Divan no WhatsApp
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>
        </div>
      </main>

      <footer className="cd-foot">
        <div className="cd-wrap cd-foot-inner">
          <div>Feito com <span style={{ color: "#FF4D00" }}>♥</span> na Divan Móveis · Cachoeiro de Itapemirim · ES</div>
        </div>
      </footer>
    </div>
  );
}

window.ClienteNPSForm = ClienteNPSForm;
window.AdminNPS = AdminNPS;
window.ClienteTracking = ClienteTracking;
window.ClienteObrigado = ClienteObrigado;
window.ClienteTrackingDesktop = ClienteTrackingDesktop;
window.ClienteNPSFormDesktop = ClienteNPSFormDesktop;
window.ClienteObrigadoDesktop = ClienteObrigadoDesktop;
