// montador-screens.jsx — Agenda do Dia + Montagem Ativa

function MontadorHome() {
  return (
    <div className="phone-frame">
      <div className="phone-screen">
        <div className="phone-status" style={{ color: "#1a1a1a", zIndex: 6 }}>
          <span>9:41</span>
          <div className="dots"><span></span><span></span><span></span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <svg width="16" height="11" viewBox="0 0 17 11" fill="currentColor"><rect y="6" width="3" height="5" rx="0.5"/><rect x="4.5" y="3.5" width="3" height="7.5" rx="0.5"/><rect x="9" y="1" width="3" height="10" rx="0.5"/><rect x="13.5" width="3" height="11" rx="0.5"/></svg>
            <div className="battery"><div className="fill"></div></div>
          </div>
        </div>

        <header className="mont-header">
          <div className="top-row">
            <div>
              <div className="greet">Olá, <strong>Felipe!</strong></div>
              <h1>3 montagens hoje</h1>
              <div className="date">Quarta · 14 de maio</div>
            </div>
            <div className="av-icon">FT</div>
          </div>
          <div className="pay-strip">
            <div>
              <div className="lbl">Repasse do dia</div>
              <div className="val">R$ 480,00</div>
            </div>
            <div className="sep"></div>
            <div>
              <div className="lbl">Fechamento</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>sex · 16/05</div>
            </div>
            <span className="pay-strip"></span>
            <span className="pill" style={{ marginLeft: "auto" }}>Ativo</span>
          </div>
        </header>

        <div className="mont-body">
          <div className="section-h">Em andamento</div>

          <div className="os-card active">
            <div className="head">
              <div className="slot">
                <div className="h">10:30</div>
                <div className="m">2h</div>
              </div>
              <div className="meta">
                <div className="cli">Maria F. Souza</div>
                <div className="addr">R. Vergueiro, 1240 · Apt. 84 · Vila Mariana</div>
              </div>
              <span className="chev"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg></span>
            </div>
            <div className="prods">
              <span className="prod-chip">1× Sofá retrátil</span>
              <span className="prod-chip">1× Mesa de centro</span>
            </div>
            <div className="foot">
              <span className="pay"><small>Repasse</small>R$ 180,00</span>
              <span className="complex media">Média</span>
            </div>
          </div>

          <div className="section-h" style={{ marginTop: 8 }}>Próximas</div>

          <div className="os-card">
            <div className="head">
              <div className="slot">
                <div className="h">14:00</div>
                <div className="m">1h</div>
              </div>
              <div className="meta">
                <div className="cli">Pedro Almeida</div>
                <div className="addr">Av. Brigadeiro, 890 · Cj. 1102 · Itaim</div>
              </div>
              <span className="chev"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg></span>
            </div>
            <div className="prods">
              <span className="prod-chip">1× Cabeceira queen</span>
            </div>
            <div className="foot">
              <span className="pay"><small>Repasse</small>R$ 120,00</span>
              <span className="complex baixa">Baixa</span>
            </div>
          </div>

          <div className="os-card">
            <div className="head">
              <div className="slot">
                <div className="h">16:30</div>
                <div className="m">3h</div>
              </div>
              <div className="meta">
                <div className="cli">Carla Nogueira</div>
                <div className="addr">R. Augusta, 2100 · Cobertura · Consolação</div>
              </div>
              <span className="chev"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg></span>
            </div>
            <div className="prods">
              <span className="prod-chip">1× Guarda-roupa 6p</span>
              <span className="prod-chip">1× Cômoda</span>
            </div>
            <div className="foot">
              <span className="pay"><small>Repasse</small>R$ 180,00</span>
              <span className="complex alta">Alta</span>
            </div>
          </div>
        </div>

        <div className="mot-footer">
          <button className="btn btn-primary" style={{ background: "#1a1a1a", boxShadow: "0 8px 24px rgba(0,0,0,0.32)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            Continuar montagem ativa
          </button>
          <div className="hint">Maria F. Souza · iniciada há 32 min</div>
        </div>
      </div>
    </div>
  );
}

function MontadorAtiva() {
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
          <div className="title">Montagem 1 de 3</div>
          <div className="timer" style={{ color: "#F7A800" }}>⏱ 00:32</div>
        </div>

        <div className="mot-body">
          <div className="client-card">
            <div className="av" style={{ background: "linear-gradient(135deg, #FFB800, #F7A800)", color: "#1a1a1a" }}>MS</div>
            <div className="info">
              <div className="name">Maria F. Souza</div>
              <div className="addr">R. Vergueiro, 1240 · Apt. 84<br/>Vila Mariana · SP</div>
            </div>
            <button className="call">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.91.36 1.81.66 2.67a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.41-1.41a2 2 0 0 1 2.11-.45c.86.3 1.76.53 2.67.66A2 2 0 0 1 22 16.92z"/></svg>
            </button>
          </div>

          <div className="checklist">
            <h4>Peças recebidas <span style={{ fontSize: 11, fontWeight: 600, color: "var(--color-success)", marginLeft: 6 }}>✓ 3 de 3</span></h4>
            <div className="item">
              <div className="ico" style={{ color: "var(--color-success)", background: "#D1FADF" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div className="nm">Estrutura sofá retrátil</div>
              <div className="qty">1×</div>
            </div>
            <div className="item">
              <div className="ico" style={{ color: "var(--color-success)", background: "#D1FADF" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div className="nm">Kit estofamento + almofadas (4)</div>
              <div className="qty">1×</div>
            </div>
            <div className="item">
              <div className="ico" style={{ color: "var(--color-success)", background: "#D1FADF" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div className="nm">Mesa de centro · Carvalho</div>
              <div className="qty">1×</div>
            </div>
          </div>

          <div>
            <div className="section-h" style={{ marginLeft: 4 }}>Fotos da montagem</div>
            <div className="photo-pair">
              <div className="photo-thumb taken">
                <div className="check">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div className="lbl">Antes</div>
              </div>
              <div className="photo-thumb">
                <div className="plus">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                </div>
                <div className="lbl" style={{ background: "#B42318" }}>Depois · obrigatória</div>
              </div>
            </div>
          </div>

          <div className="note-warn">
            <div className="ico">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <div className="txt">
              <strong>Instruções específicas</strong>
              Sofá retrátil deve ficar paralelo à parede com janela. Cliente solicitou kit de pés altos (incluso na caixa).
            </div>
          </div>
        </div>

        <div className="mot-footer-2">
          <button className="btn btn-secondary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            Reportar
          </button>
          <button className="btn btn-primary" style={{ background: "#1a1a1a" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Finalizar montagem
          </button>
        </div>
      </div>
    </div>
  );
}

window.MontadorHome = MontadorHome;
window.MontadorAtiva = MontadorAtiva;
