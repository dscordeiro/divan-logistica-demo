// nps-screens.jsx — Cliente NPS Form + Admin NPS Dashboard

function ClienteNPSForm() {
  const [motStar, setMotStar] = React.useState(5);
  const [montStar, setMontStar] = React.useState(4);
  const [score, setScore] = React.useState(9);

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
            <div className="logo">d</div>
            <h1>Como foi sua experiência?</h1>
            <p>Pedido #DM-2451 · entregue hoje</p>
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
              <p className="q">Como foi a entrega? Pontualidade, cuidado com os produtos e atendimento.</p>
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
              <p className="q">Como foi a montagem? Capricho, organização e cuidado com o espaço.</p>
              <div className="stars">
                {[1,2,3,4,5].map(n => (
                  <span key={n} className={`star ${n <= montStar ? "on" : ""}`} onClick={() => setMontStar(n)}>★</span>
                ))}
              </div>
            </div>

            <div className="rating-card">
              <p className="q" style={{ marginBottom: 12, fontWeight: 600 }}>De 0 a 10, quanto você indicaria a Divan a um amigo?</p>
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
              <p className="q" style={{ marginBottom: 10, fontWeight: 600 }}>Quer contar algo mais? <span style={{ color: "var(--color-text-secondary)", fontWeight: 400 }}>(opcional)</span></p>
              <textarea
                className="input"
                placeholder="Conte como foi sua experiência…"
                style={{ width: "100%", minHeight: 80, fontSize: 14, resize: "none" }}
              />
            </div>
          </div>

          <div className="nps-foot">
            <button className="btn btn-primary">Enviar avaliação</button>
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

window.ClienteNPSForm = ClienteNPSForm;
window.AdminNPS = AdminNPS;
