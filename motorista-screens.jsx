// motorista-screens.jsx — Entregas do Dia + Entrega Ativa

function MotoristaHome() {
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

        <header className="mot-header">
          <div className="top-row">
            <div>
              <div className="greet">Bom dia, <strong>Carlos!</strong></div>
              <h1>5 entregas hoje</h1>
              <div className="date">Quarta · 14 de maio</div>
            </div>
            <div className="av-icon">CM</div>
          </div>
          <div className="inline-stat">
            <span><strong style={{ fontSize: 16 }}>1</strong> concluída</span>
            <span className="sep"></span>
            <span><strong style={{ fontSize: 16 }}>4</strong> restantes</span>
            <span className="sep"></span>
            <span>~ <strong>3h 20min</strong></span>
          </div>
        </header>

        <div className="mot-body">
          <div className="section-h">Próxima entrega</div>

          <div className="delivery active">
            <div className="num">2ª</div>
            <div className="info">
              <div className="cli">Maria F. Souza</div>
              <div className="addr">Rua Vergueiro, 1240 · Vila Mariana</div>
              <span className="badge badge-em-rota" style={{ marginTop: 8 }}><span className="dot"></span>Em rota · 8 min</span>
            </div>
            <span className="chev"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg></span>
          </div>

          <div className="section-h" style={{ marginTop: 8 }}>Próximas</div>

          <div className="delivery">
            <div className="num">3ª</div>
            <div className="info">
              <div className="cli">Carla Nogueira</div>
              <div className="addr">R. Augusta, 2100 · Consolação</div>
            </div>
            <span className="chev"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg></span>
          </div>

          <div className="delivery">
            <div className="num">4ª</div>
            <div className="info">
              <div className="cli">Luiza Mendes</div>
              <div className="addr">Av. Faria Lima, 3200 · V. Olímpia</div>
            </div>
            <span className="chev"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg></span>
          </div>

          <div className="delivery">
            <div className="num">5ª</div>
            <div className="info">
              <div className="cli">Bruno Castro</div>
              <div className="addr">R. Teodoro Sampaio, 770 · Pinheiros</div>
            </div>
            <span className="chev"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg></span>
          </div>

          <div className="section-h" style={{ marginTop: 8 }}>Concluídas</div>

          <div className="delivery done">
            <div className="num">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div className="info">
              <div className="cli">Pedro Almeida</div>
              <div className="addr">Av. Brigadeiro, 890 · Itaim · 09:32</div>
            </div>
          </div>
        </div>

        <div className="mot-footer">
          <button className="btn btn-primary">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 11 22 2 13 21 11 13 3 11"/></svg>
            Iniciar próxima entrega
          </button>
          <div className="hint">Google Maps abrirá para navegação</div>
        </div>
      </div>
    </div>
  );
}

function MotoristaAtiva() {
  return (
    <div className="phone-frame">
      <div className="phone-screen">
        <div className="phone-status" style={{ color: "var(--color-text-primary)" }}>
          <span>9:41</span>
          <div className="dots"><span></span><span></span><span></span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <svg width="16" height="11" viewBox="0 0 17 11" fill="currentColor"><rect y="6" width="3" height="5" rx="0.5"/><rect x="4.5" y="3.5" width="3" height="7.5" rx="0.5"/><rect x="9" y="1" width="3" height="10" rx="0.5"/><rect x="13.5" width="3" height="11" rx="0.5"/></svg>
            <div className="battery"><div className="fill"></div></div>
          </div>
        </div>

        <div className="mot-back-bar">
          <div className="ico">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </div>
          <div className="title">Entrega 2 de 5</div>
          <div className="timer">⏱ 00:32</div>
        </div>

        <div className="mot-body">
          <div className="client-card">
            <div className="av">MS</div>
            <div className="info">
              <div className="name">Maria F. Souza</div>
              <div className="addr">R. Vergueiro, 1240 · Apt. 84<br/>Vila Mariana · SP</div>
            </div>
            <button className="call">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.91.36 1.81.66 2.67a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.41-1.41a2 2 0 0 1 2.11-.45c.86.3 1.76.53 2.67.66A2 2 0 0 1 22 16.92z"/></svg>
            </button>
          </div>

          <div className="mini-map">
            <svg className="route" viewBox="0 0 350 160" preserveAspectRatio="none">
              <path d="M 30 130 Q 100 90 180 80 T 310 40" stroke="#3B82F6" strokeWidth="4" strokeDasharray="8,4" fill="none" />
            </svg>
            <div className="me" style={{ top: 122, left: 22 }}></div>
            <div className="pin" style={{ top: 25, right: 28 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
            </div>
            <div className="map-badge" style={{ position: "absolute", bottom: 10, left: 10, top: "auto", right: "auto" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              8 min · 2,4 km
            </div>
          </div>

          <div className="checklist">
            <h4>Produtos a entregar</h4>
            <div className="item">
              <div className="ico">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M3 12h18"/></svg>
              </div>
              <div className="nm">Sofá retrátil 3 lugares · Cinza</div>
              <div className="qty">1×</div>
            </div>
            <div className="item">
              <div className="ico">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
              </div>
              <div className="nm">Mesa de centro · Carvalho</div>
              <div className="qty">1×</div>
            </div>
            <div className="item">
              <div className="ico">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
              </div>
              <div className="nm">Almofadas decorativas</div>
              <div className="qty">4×</div>
            </div>
          </div>

          <div className="note-warn">
            <div className="ico">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <div className="txt">
              <strong>Observação do cliente</strong>
              Interfone 84 · prefere entrega após 14h. Subir pelo elevador de serviço.
            </div>
          </div>
        </div>

        <div className="mot-footer-2">
          <button className="btn btn-secondary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
            Navegar
          </button>
          <button className="btn btn-primary">Iniciar entrega</button>
        </div>
      </div>
    </div>
  );
}

window.MotoristaHome = MotoristaHome;
window.MotoristaAtiva = MotoristaAtiva;
