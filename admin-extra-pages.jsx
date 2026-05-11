// admin-extra-pages.jsx — Mapa ao vivo + Motoristas (admin)

function AdminMapa() {
  const [filter, setFilter] = React.useState("todos");

  const trucks = [
    { id: 1, name: "Carlos M.", plate: "FXR-2A47", load: "CR-2401", status: "em-rota",   x: 32, y: 38, stops: "3/7",  eta: "16:42", phone: "(11) 9 8214-..." },
    { id: 2, name: "Pedro L.",  plate: "GTA-7B91", load: "CR-2402", status: "em-entrega", x: 58, y: 28, stops: "5/9",  eta: "16:55", phone: "(11) 9 7711-..." },
    { id: 3, name: "André S.",  plate: "JKM-3C12", load: "CR-2403", status: "em-rota",   x: 70, y: 58, stops: "1/6",  eta: "17:30", phone: "(11) 9 6620-..." },
    { id: 4, name: "Renato V.", plate: "LMN-9P03", load: "CR-2404", status: "problema",  x: 45, y: 70, stops: "4/8",  eta: "—",     phone: "(11) 9 5599-..." },
    { id: 5, name: "Marcos T.", plate: "QWE-4R56", load: "CR-2405", status: "em-rota",   x: 22, y: 65, stops: "2/5",  eta: "17:10", phone: "(11) 9 4488-..." },
  ];

  const filtered = filter === "todos" ? trucks : trucks.filter(t => t.status === filter);
  const counts = {
    todos:        trucks.length,
    "em-rota":    trucks.filter(t => t.status === "em-rota").length,
    "em-entrega": trucks.filter(t => t.status === "em-entrega").length,
    problema:     trucks.filter(t => t.status === "problema").length,
  };

  const statusLabel = { "em-rota": "Em rota", "em-entrega": "Em entrega", problema: "Problema" };
  const statusColor = { "em-rota": "#2A6FDB", "em-entrega": "#F7A800", problema: "#E63946" };

  return (
    <main className="dash-main mapa-main">
      <header className="dash-topbar">
        <div>
          <div className="dash-eyebrow">Operação</div>
          <h1 className="dash-title">Mapa ao vivo</h1>
        </div>
        <div className="dash-tools">
          <div className="dash-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input placeholder="Buscar motorista, placa ou carga" />
          </div>
          <button className="btn btn-secondary btn-md">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9"/><polyline points="3 4 3 12 11 12"/></svg>
            Atualizar
          </button>
          <button className="btn btn-primary btn-md">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="9"/></svg>
            Centralizar frota
          </button>
        </div>
      </header>

      <div className="mapa-layout">
        <div className="mapa-canvas">
          {/* Filter pills */}
          <div className="mapa-filters">
            {[
              ["todos", "Todos"],
              ["em-rota", "Em rota"],
              ["em-entrega", "Em entrega"],
              ["problema", "Problema"],
            ].map(([id, label]) => (
              <button key={id} className={`mapa-pill ${filter === id ? "on" : ""} ${id}`} onClick={() => setFilter(id)}>
                {label} <span className="cnt">{counts[id]}</span>
              </button>
            ))}
          </div>

          {/* Live KPIs floating */}
          <div className="mapa-kpis">
            <div className="mk">
              <div className="mk-val">{trucks.length}</div>
              <div className="mk-lbl">Motoristas em rota</div>
            </div>
            <div className="mk">
              <div className="mk-val">23</div>
              <div className="mk-lbl">Paradas restantes</div>
            </div>
            <div className="mk">
              <div className="mk-val">147</div>
              <div className="mk-lbl">Entregas hoje</div>
            </div>
            <div className="mk warn">
              <div className="mk-val">1</div>
              <div className="mk-lbl">Alerta ativo</div>
            </div>
          </div>

          {/* Map placeholder */}
          <div className="mapa-bg">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position:"absolute", inset:0, width:"100%", height:"100%" }}>
              <defs>
                <pattern id="grid" width="6" height="6" patternUnits="userSpaceOnUse">
                  <path d="M 6 0 L 0 0 0 6" fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth="0.25"/>
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)"/>
              {/* Fake roads */}
              <path d="M 0 35 Q 30 30, 60 38 T 100 42" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="2"/>
              <path d="M 10 0 Q 25 30, 18 60 T 35 100" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="2"/>
              <path d="M 50 0 L 55 100" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="2"/>
              <path d="M 80 0 Q 70 50, 90 90" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="2"/>
              {/* Origin (CD) */}
              <circle cx="50" cy="50" r="2.2" fill="#1a1a1a"/>
              <circle cx="50" cy="50" r="4" fill="none" stroke="#1a1a1a" strokeWidth="0.4" opacity="0.4"/>
            </svg>

            {filtered.map(t => (
              <div
                key={t.id}
                className={`truck-pin ${t.status}`}
                style={{ left: `${t.x}%`, top: `${t.y}%` }}
                title={t.name}
              >
                <span className="pulse" style={{ background: statusColor[t.status] }}></span>
                <span className="dot" style={{ background: statusColor[t.status] }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/></svg>
                </span>
                <span className="label" style={{ borderColor: statusColor[t.status] }}>
                  {t.plate} <strong>· {t.stops}</strong>
                </span>
              </div>
            ))}
          </div>

          <div className="mapa-legend">
            <span className="lg"><i style={{background:"#2A6FDB"}}></i> Em rota</span>
            <span className="lg"><i style={{background:"#F7A800"}}></i> Em entrega</span>
            <span className="lg"><i style={{background:"#E63946"}}></i> Problema</span>
            <span className="lg"><i className="origin"></i> Centro de distribuição</span>
          </div>
        </div>

        <aside className="mapa-side">
          <div className="mapa-side-head">
            <div>
              <div className="mapa-side-eyebrow">Frota ativa</div>
              <h3>{filtered.length} motoristas em campo</h3>
            </div>
            <button className="icon-btn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
          </div>
          <div className="mapa-side-list">
            {filtered.map(t => (
              <div key={t.id} className={`truck-card ${t.status}`}>
                <div className="tc-head">
                  <div className="tc-avatar" style={{ background: statusColor[t.status] }}>
                    {t.name.split(" ").map(p => p[0]).join("")}
                  </div>
                  <div className="tc-info">
                    <div className="tc-name">{t.name}</div>
                    <div className="tc-meta">{t.plate} · {t.load}</div>
                  </div>
                  <span className={`badge badge-${t.status}`}>{statusLabel[t.status]}</span>
                </div>
                <div className="tc-stats">
                  <div><span>Paradas</span><strong>{t.stops}</strong></div>
                  <div><span>ETA término</span><strong>{t.eta}</strong></div>
                </div>
                <div className="tc-actions">
                  <button className="btn btn-ghost btn-sm">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z"/></svg>
                    Ligar
                  </button>
                  <button className="btn btn-ghost btn-sm">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="10" r="3"/><path d="M12 2C7.6 2 4 5.6 4 10c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8z"/></svg>
                    Rota
                  </button>
                  <button className="btn btn-secondary btn-sm">Detalhes →</button>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}

function AdminMotoristas() {
  const drivers = [
    { name: "Carlos Moreira",   plate: "FXR-2A47", status: "em-rota",   load: "CR-2401", deliv: 7, nps: 92, since: "Mar 2022" },
    { name: "Pedro Lima",       plate: "GTA-7B91", status: "em-entrega", load: "CR-2402", deliv: 9, nps: 88, since: "Jul 2021" },
    { name: "André Souza",      plate: "JKM-3C12", status: "em-rota",   load: "CR-2403", deliv: 6, nps: 95, since: "Out 2020" },
    { name: "Renato Vieira",    plate: "LMN-9P03", status: "problema",  load: "CR-2404", deliv: 8, nps: 71, since: "Fev 2023" },
    { name: "Marcos Tavares",   plate: "QWE-4R56", status: "em-rota",   load: "CR-2405", deliv: 5, nps: 90, since: "Mai 2022" },
    { name: "Jonas Ribeiro",    plate: "ZXY-8H22", status: "disponivel", load: "—",       deliv: 0, nps: 86, since: "Jan 2024" },
    { name: "Davi Albuquerque", plate: "RTV-1S08", status: "folga",     load: "—",       deliv: 0, nps: 84, since: "Set 2022" },
  ];
  const statusLabel = { "em-rota": "Em rota", "em-entrega": "Em entrega", problema: "Problema", disponivel: "Disponível", folga: "Folga" };

  const kpis = [
    { label: "Total ativo",   val: 24, sub: "+2 este mês" },
    { label: "Em campo agora", val: 5, sub: "21% da frota" },
    { label: "Disponíveis",    val: 12, sub: "Aguardando carga" },
    { label: "Em folga / off", val: 7, sub: "29% da frota" },
  ];

  return (
    <main className="dash-main">
      <header className="dash-topbar">
        <div>
          <div className="dash-eyebrow">Operação</div>
          <h1 className="dash-title">Motoristas</h1>
        </div>
        <div className="dash-tools">
          <div className="dash-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input placeholder="Buscar motorista ou placa" />
          </div>
          <button className="btn btn-secondary btn-md">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Exportar
          </button>
          <button className="btn btn-primary btn-md">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Novo motorista
          </button>
        </div>
      </header>

      <div className="dash-kpis">
        {kpis.map(k => (
          <div key={k.label} className="kpi">
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-val">{k.val}</div>
            <div className="kpi-sub">{k.sub}</div>
          </div>
        ))}
      </div>

      <section className="dash-card" style={{ marginTop: 24 }}>
        <div className="card-head">
          <h3>Lista de motoristas</h3>
          <div className="card-actions">
            <button className="chip-tab on">Todos · 24</button>
            <button className="chip-tab">Em campo · 5</button>
            <button className="chip-tab">Disponíveis · 12</button>
            <button className="chip-tab">Folga · 7</button>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>Motorista</th><th>Veículo</th><th>Status</th><th>Carga atual</th><th>Entregas hoje</th><th>NPS</th><th>Na Divan desde</th><th></th></tr>
          </thead>
          <tbody>
            {drivers.map(d => (
              <tr key={d.name}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="row-avatar">{d.name.split(" ").map(p => p[0]).slice(0,2).join("")}</div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{d.name}</div>
                      <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>CNH categoria E</div>
                    </div>
                  </div>
                </td>
                <td><span style={{ fontFamily: "var(--font-mono, monospace)", fontWeight: 600 }}>{d.plate}</span></td>
                <td><span className={`badge badge-${d.status}`}>{statusLabel[d.status]}</span></td>
                <td>{d.load === "—" ? <span style={{ color: "var(--color-text-tertiary)" }}>—</span> : <strong>{d.load}</strong>}</td>
                <td>{d.deliv > 0 ? `${d.deliv} entregas` : <span style={{ color: "var(--color-text-tertiary)" }}>—</span>}</td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <strong>{d.nps}</strong>
                    <div style={{ width: 60, height: 5, background: "var(--color-border-soft)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${d.nps}%`, height: "100%", background: d.nps >= 85 ? "#1F8A5B" : d.nps >= 70 ? "#F7A800" : "#E63946" }} />
                    </div>
                  </div>
                </td>
                <td style={{ color: "var(--color-text-secondary)" }}>{d.since}</td>
                <td><button className="icon-btn">→</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}

function AdminMontadores() {
  const assemblers = [
    { name: "Bruno Garcia",     bond: "MEI",   spec: "Estofados · Quartos", status: "em-montagem", task: "OS-2401", deliv: 3, nps: 96, since: "Ago 2021" },
    { name: "Felipe Tavares",   bond: "MEI",   spec: "Cozinhas · Banheiros", status: "em-montagem", task: "OS-2402", deliv: 2, nps: 91, since: "Mar 2022" },
    { name: "Rafael Cunha",     bond: "CLT",   spec: "Móveis planejados",    status: "disponivel",  task: "—",       deliv: 0, nps: 88, since: "Jan 2020" },
    { name: "Diego Oliveira",   bond: "MEI",   spec: "Eletros · TV / áudio", status: "em-montagem", task: "OS-2403", deliv: 4, nps: 93, since: "Out 2022" },
    { name: "Lucas Pereira",    bond: "MEI",   spec: "Quartos · Salas",      status: "problema",    task: "OS-2404", deliv: 1, nps: 74, since: "Jun 2023" },
    { name: "Tiago Bezerra",    bond: "CLT",   spec: "Cozinhas",             status: "disponivel",  task: "—",       deliv: 0, nps: 85, since: "Dez 2021" },
    { name: "Vinicius Martins", bond: "MEI",   spec: "Estofados",            status: "folga",       task: "—",       deliv: 0, nps: 87, since: "Fev 2024" },
  ];
  const statusLabel = {
    "em-montagem": "Em montagem",
    "disponivel":  "Disponível",
    "problema":    "Problema",
    "folga":       "Folga",
  };

  const kpis = [
    { label: "Total ativo",         val: 18, sub: "+1 este mês" },
    { label: "Em montagem agora",   val: 3,  sub: "17% da equipe" },
    { label: "Disponíveis",          val: 9,  sub: "Aguardando agenda" },
    { label: "Em folga / off",      val: 6,  sub: "33% da equipe" },
  ];

  return (
    <main className="dash-main">
      <header className="dash-topbar">
        <div>
          <div className="dash-eyebrow">Operação</div>
          <h1 className="dash-title">Montadores</h1>
        </div>
        <div className="dash-tools">
          <div className="dash-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input placeholder="Buscar montador, CNPJ ou especialidade" />
          </div>
          <button className="btn btn-secondary btn-md">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Exportar
          </button>
          <button className="btn btn-primary btn-md">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Novo montador
          </button>
        </div>
      </header>

      <div className="dash-kpis">
        {kpis.map(k => (
          <div key={k.label} className="kpi">
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-val">{k.val}</div>
            <div className="kpi-sub">{k.sub}</div>
          </div>
        ))}
      </div>

      <section className="dash-card" style={{ marginTop: 24 }}>
        <div className="card-head">
          <h3>Lista de montadores</h3>
          <div className="card-actions">
            <button className="chip-tab on">Todos · 18</button>
            <button className="chip-tab">Em montagem · 3</button>
            <button className="chip-tab">Disponíveis · 9</button>
            <button className="chip-tab">Folga · 6</button>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Montador</th>
              <th>Vínculo</th>
              <th>Especialidade</th>
              <th>Status</th>
              <th>OS atual</th>
              <th>Montagens hoje</th>
              <th>NPS</th>
              <th>Na Divan desde</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {assemblers.map(a => (
              <tr key={a.name}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="row-avatar" style={{ background: "linear-gradient(135deg, #F7A800, #FFC940)", color: "#1a1a1a" }}>
                      {a.name.split(" ").map(p => p[0]).slice(0,2).join("")}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{a.name}</div>
                      <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Montador parceiro</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="chip-tab" style={{
                    background: a.bond === "MEI" ? "rgba(247,168,0,0.12)" : "rgba(42,111,219,0.12)",
                    color: a.bond === "MEI" ? "#B45309" : "#1D4ED8",
                    fontSize: 11, padding: "3px 8px", borderRadius: 999,
                    fontWeight: 700, letterSpacing: "0.04em"
                  }}>{a.bond}</span>
                </td>
                <td style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{a.spec}</td>
                <td><span className={`badge badge-${a.status}`}>{statusLabel[a.status]}</span></td>
                <td>{a.task === "—" ? <span style={{ color: "var(--color-text-tertiary)" }}>—</span> : <strong>{a.task}</strong>}</td>
                <td>{a.deliv > 0 ? `${a.deliv} montagens` : <span style={{ color: "var(--color-text-tertiary)" }}>—</span>}</td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <strong>{a.nps}</strong>
                    <div style={{ width: 60, height: 5, background: "var(--color-border-soft)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${a.nps}%`, height: "100%", background: a.nps >= 85 ? "#1F8A5B" : a.nps >= 70 ? "#F7A800" : "#E63946" }} />
                    </div>
                  </div>
                </td>
                <td style={{ color: "var(--color-text-secondary)" }}>{a.since}</td>
                <td><button className="icon-btn">→</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}

window.AdminMapa = AdminMapa;
window.AdminMotoristas = AdminMotoristas;
window.AdminMontadores = AdminMontadores;
