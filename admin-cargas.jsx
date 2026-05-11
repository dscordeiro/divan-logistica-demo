// admin-cargas.jsx — Gestão de Cargas (workflow 3 colunas)

function AdminCargas() {
  const [selected, setSelected] = React.useState([0, 2, 4]);
  const notas = [
    { n: "DM-2451", cli: "Maria F. Souza", addr: "R. Vergueiro, 1240 · Vila Mariana", val: "3.890,00" },
    { n: "DM-2453", cli: "Pedro Almeida", addr: "Av. Brigadeiro, 890 · Itaim", val: "1.580,00" },
    { n: "DM-2455", cli: "Carla Nogueira", addr: "R. Augusta, 2100 · Consolação", val: "5.220,00" },
    { n: "DM-2457", cli: "João P. Lima", addr: "R. dos Pinheiros, 480 · Pinheiros", val: "2.940,00" },
    { n: "DM-2458", cli: "Luiza Mendes", addr: "Av. Faria Lima, 3200 · V. Olímpia", val: "6.180,00" },
    { n: "DM-2460", cli: "Bruno Castro", addr: "R. Teodoro Sampaio, 770 · Pinheiros", val: "1.230,00" },
  ];

  const toggle = i => setSelected(s => s.includes(i) ? s.filter(x => x !== i) : [...s, i]);
  const selNotas = selected.map(i => notas[i]);

  return (
    <div className="cargas-frame">
      {/* sidebar reusada — sem Dashboard ativo, Cargas ativo */}
      <CargasSidebar />

      <div className="cargas-main">
        <header className="cargas-header">
          <div>
            <div className="back">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              Cargas
            </div>
            <h1>Nova carga · Roteirização</h1>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-secondary btn-sm">Salvar rascunho</button>
          </div>
        </header>

        <div className="cargas-grid">
          {/* ============ COL 1 · Notas ============ */}
          <div className="col muted">
            <div className="col-head">
              <h3><span className="num">1</span>Escolha as notas</h3>
              <p>{notas.length} prontas para sair · filtre por região se preferir</p>
            </div>
            <div className="col-search" style={{ display: "flex", gap: 8 }}>
              <div className="input-with-icon" style={{ flex: 1 }}>
                <span className="icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </span>
                <input className="input" placeholder="Buscar nota, cliente…" style={{ width: "100%", height: 36, fontSize: 13 }} />
              </div>
              <button className="icon-btn" style={{ height: 36, width: 36 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              </button>
            </div>
            <div className="col-body">
              {notas.map((nota, i) => (
                <div key={i} className={`nota-card ${selected.includes(i) ? "selected" : ""}`} onClick={() => toggle(i)}>
                  <div className="cb">
                    {selected.includes(i) && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                  <div className="meta">
                    <div className="row1">
                      <span className="num">#{nota.n}</span>
                      <span className="val">R$ {nota.val}</span>
                    </div>
                    <div className="cli">{nota.cli}</div>
                    <div className="addr">{nota.addr}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="col-foot">
              <strong style={{ fontSize: 13 }}>{selected.length} nota(s) selecionadas</strong>
              <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 2 }}>Total: R$ {selNotas.reduce((s, n) => s + parseFloat(n.val.replace(".", "").replace(",", ".")), 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
            </div>
          </div>

          {/* ============ COL 2 · Montar Carga ============ */}
          <div className="col white">
            <div className="col-head">
              <h3><span className="num">2</span>Monte a carga</h3>
              <p>Arraste para reordenar · escolha quem leva e em qual veículo</p>
            </div>
            <div className="col-body">
              <div style={{ fontSize: 11, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: 8 }}>Notas na carga</div>
              {selNotas.map((nota, i) => (
                <div key={i} className="carga-item">
                  <div className="order">{i + 1}</div>
                  <div className="info">
                    <div className="cli">{nota.cli}</div>
                    <div className="addr">#{nota.n} · {nota.addr.split(" · ")[1]}</div>
                  </div>
                  <span className="grip">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="18" r="1"/></svg>
                  </span>
                </div>
              ))}

              <div style={{ fontSize: 11, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginTop: 20, marginBottom: 8 }}>Motorista</div>
              <div className="select-field">
                <span className="av">CM</span>
                <span className="nm">Carlos Marques</span>
                <span className="chev"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg></span>
              </div>

              <div style={{ fontSize: 11, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginTop: 16, marginBottom: 8 }}>Veículo</div>
              <div className="select-field">
                <span style={{ width: 26, height: 26, borderRadius: 6, background: "#FFE9DC", color: "var(--color-brand-orange)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                </span>
                <span className="nm">Iveco Daily · BRA-2E45</span>
                <span className="chev"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg></span>
              </div>

              <div style={{ fontSize: 11, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginTop: 16, marginBottom: 8 }}>Observações (opcional)</div>
              <textarea className="input" placeholder="Ex.: dona Maria prefere entrega depois das 14h · interfone 84" style={{ width: "100%", minHeight: 64, fontSize: 13 }} />
            </div>
            <div className="col-foot">
              <button className="btn btn-primary" style={{ width: "100%", height: 48 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 11 22 2 13 21 11 13 3 11"/></svg>
                Roteirizar e gerar ordem
              </button>
            </div>
          </div>

          {/* ============ COL 3 · Rota Gerada ============ */}
          <div className="col">
            <div className="col-head" style={{ background: "#fff" }}>
              <h3><span className="num" style={{ background: "var(--color-success)" }}>3</span>Pronto, rota traçada</h3>
              <p>3 paradas otimizadas · ordem inversa de carregamento abaixo</p>
            </div>

            <div className="rota-map">
              <svg className="rota-line" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 400 220" preserveAspectRatio="none">
                <path d="M 60 180 Q 130 100, 200 110 T 340 60" stroke="#3B82F6" strokeWidth="3" strokeDasharray="6,4" fill="none" />
              </svg>
              <div className="rota-pin start" style={{ top: 165, left: 47 }}><span>D</span></div>
              <div className="rota-pin" style={{ top: 92, left: 185 }}><span>1</span></div>
              <div className="rota-pin" style={{ top: 70, left: 260 }}><span>2</span></div>
              <div className="rota-pin" style={{ top: 45, left: 325 }}><span>3</span></div>
              <div className="map-badge" style={{ position: "absolute", bottom: 12, left: 12, top: "auto", right: "auto" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                ETA total · 2h 40min
              </div>
            </div>

            <div className="rota-summary">
              <div className="stat">
                <div className="lbl">Distância</div>
                <div className="val">38,2<small>km</small></div>
              </div>
              <div className="stat">
                <div className="lbl">Tempo total</div>
                <div className="val">2h 40<small>min</small></div>
              </div>
              <div className="stat">
                <div className="lbl">Combustível</div>
                <div className="val">R$ 42<small>,80</small></div>
              </div>
            </div>

            <div className="rota-list-head">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              <div>
                <strong>Carregar nesta ordem</strong> — o 1º vai pro fundo do baú (sai por último).
              </div>
            </div>

            <div className="rota-list">
              <div className="rota-item first">
                <div className="order">1º</div>
                <div className="info">
                  <div className="cli">Luiza Mendes · #DM-2458</div>
                  <div className="prods">1× Sofá retrátil · 2× Poltronas reclináveis</div>
                </div>
                <div className="vol">2,4 m³</div>
              </div>
              <div className="rota-item">
                <div className="order">2º</div>
                <div className="info">
                  <div className="cli">Carla Nogueira · #DM-2455</div>
                  <div className="prods">1× Guarda-roupa 6 portas · 1× Cabeceira</div>
                </div>
                <div className="vol">1,8 m³</div>
              </div>
              <div className="rota-item">
                <div className="order">3º</div>
                <div className="info">
                  <div className="cli">Maria F. Souza · #DM-2451</div>
                  <div className="prods">1× Mesa jantar 8 lugares · 8× Cadeiras</div>
                </div>
                <div className="vol">1,2 m³</div>
              </div>
            </div>

            <div className="col-foot" style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Romaneio PDF
              </button>
              <button className="btn btn-primary" style={{ flex: 1 }}>Despachar carga →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CargasSidebar() {
  return (
    <aside className="dash-sidebar">
      <div className="brand"><img src="assets/logo-color.png" alt="" /></div>
      <div className="sec-label">Operação</div>
      <div className="dash-nav"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>Dashboard</div>
      <div className="dash-nav active"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>Cargas e entregas<span className="badge-count">128</span></div>
      <div className="dash-nav"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C7.6 2 4 5.6 4 10c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8z"/><circle cx="12" cy="10" r="3"/></svg>Mapa ao vivo</div>
      <div className="dash-nav"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>Motoristas</div>
      <div className="dash-nav"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>Montadores<span className="badge-count">4</span></div>
      <div className="sec-label">Insights</div>
      <div className="dash-nav"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>Relatórios</div>
      <div className="dash-nav"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>NPS</div>
      <div className="dash-user"><div className="avatar">DC</div><div><div className="name">Daniel C.</div><div className="role">Supervisor</div></div></div>
    </aside>
  );
}

window.AdminCargas = AdminCargas;
