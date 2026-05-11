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
              <div className="greet">Bom dia, <strong>Carlos!</strong> ☀️</div>
              <h1>5 entregas pra hoje</h1>
              <div className="date">Quarta · 14 de maio · tempo bom pra rodar</div>
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
              <strong>Recado do cliente</strong>
              Dona Maria pediu pra subir pelo elevador de serviço. Interfone 84 · prefere depois das 14h.
            </div>
          </div>
        </div>

        <div className="mot-footer-2">
          <button className="btn btn-secondary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
            Navegar
          </button>
          <button className="btn btn-primary" onClick={() => {
            localStorage.setItem("divan.mot.tab", "confirmacao");
            location.reload();
          }}>Iniciar entrega</button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   CONFIRMAÇÃO DE ENTREGA — 3 passos
   1. Assinatura digital
   2. Foto do local
   3. Sucesso + próxima entrega
   ============================================================ */
function MotoristaConfirmacao() {
  const [step, setStep] = React.useState(1);
  const [signed, setSigned] = React.useState(false);
  const [photoTaken, setPhotoTaken] = React.useState(false);
  const canvasRef = React.useRef(null);

  // Mini signature pad
  React.useEffect(() => {
    if (step !== 1) return;
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    let drawing = false;
    let lastX = 0, lastY = 0;
    const pos = (e) => {
      const r = c.getBoundingClientRect();
      const t = e.touches ? e.touches[0] : e;
      return [t.clientX - r.left, t.clientY - r.top];
    };
    const down = (e) => { e.preventDefault(); drawing = true; [lastX, lastY] = pos(e); setSigned(true); };
    const move = (e) => {
      if (!drawing) return;
      e.preventDefault();
      const [x, y] = pos(e);
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();
      lastX = x; lastY = y;
    };
    const up = () => { drawing = false; };
    c.addEventListener("mousedown", down);
    c.addEventListener("mousemove", move);
    c.addEventListener("mouseup", up);
    c.addEventListener("mouseleave", up);
    c.addEventListener("touchstart", down);
    c.addEventListener("touchmove", move);
    c.addEventListener("touchend", up);
    return () => {
      c.removeEventListener("mousedown", down);
      c.removeEventListener("mousemove", move);
      c.removeEventListener("mouseup", up);
      c.removeEventListener("mouseleave", up);
      c.removeEventListener("touchstart", down);
      c.removeEventListener("touchmove", move);
      c.removeEventListener("touchend", up);
    };
  }, [step]);

  const clearSig = () => {
    const c = canvasRef.current;
    if (c) c.getContext("2d").clearRect(0, 0, c.width, c.height);
    setSigned(false);
  };

  const goAgenda = () => {
    localStorage.setItem("divan.mot.tab", "home");
    location.reload();
  };
  const goAtiva = () => {
    localStorage.setItem("divan.mot.tab", "ativa");
    location.reload();
  };

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

        {/* Topbar com progress */}
        <div className="confirm-bar">
          <button className="back-btn" onClick={goAtiva} aria-label="Voltar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div className="confirm-progress">
            {[1,2,3].map(n => (
              <span key={n} className={`pdot ${step >= n ? "on" : ""} ${step === n ? "now" : ""}`} />
            ))}
            <span className="confirm-step-label">Passo {step} de 3</span>
          </div>
          <div className="confirm-cli">
            <span className="av">MS</span>
            <span className="nm">Maria F. Souza</span>
          </div>
        </div>

        <div className="confirm-body">
          {step === 1 && (
            <>
              <h2 className="confirm-h">Peça pra dona Maria assinar</h2>
              <p className="confirm-sub">Vire o celular pra ela e peça uma assininha aqui — vamos registrar a entrega.</p>
              <div className="signature-area">
                <canvas ref={canvasRef} width={320} height={180} className="signature-canvas"/>
                <div className="signature-line">
                  <span>×</span>
                  <span>Assine acima</span>
                </div>
              </div>
              <button className="sig-clear" onClick={clearSig} disabled={!signed}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
                Limpar
              </button>
              <div className="confirm-footer">
                <button className="btn btn-secondary" onClick={goAtiva}>Cancelar</button>
                <button className="btn btn-primary" disabled={!signed} onClick={() => setStep(2)}>
                  Confirmar assinatura
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="confirm-h">Agora uma foto do produto</h2>
              <p className="confirm-sub">Mostre como o produto ficou no local. A foto vai pro cliente como comprovante carinhoso.</p>

              <div className={`photo-frame ${photoTaken ? "done" : ""}`}>
                {!photoTaken ? (
                  <>
                    <div className="cam-grid">
                      <span></span><span></span><span></span>
                      <span></span><span></span><span></span>
                    </div>
                    <div className="cam-target">
                      <span /><span /><span /><span />
                    </div>
                    <div className="cam-hint">Enquadre o produto no local da entrega</div>
                  </>
                ) : (
                  <div className="photo-preview">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    <div>Foto capturada</div>
                    <small>IMG-2026-05-14-1432.jpg · 2,4 MB</small>
                  </div>
                )}
              </div>

              {!photoTaken ? (
                <button className="cam-shutter" onClick={() => setPhotoTaken(true)} aria-label="Capturar">
                  <span/>
                </button>
              ) : (
                <button className="sig-clear" onClick={() => setPhotoTaken(false)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                  Tirar outra
                </button>
              )}

              <div className="confirm-footer">
                <button className="btn btn-secondary" onClick={() => setStep(1)}>Voltar</button>
                <button className="btn btn-primary" disabled={!photoTaken} onClick={() => setStep(3)}>
                  Confirmar entrega
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <div className="confirm-success">
              <div className="confirm-success-burst">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h2>Entrega feita com coração! 💛</h2>
              <p>A dona Maria já recebeu o aviso no WhatsApp. Comprovante e foto vão chegar pra ela em segundos.</p>

              <div className="success-stats">
                <div>
                  <span>Hora</span>
                  <strong>14:32</strong>
                </div>
                <span className="sep" />
                <div>
                  <span>Tempo</span>
                  <strong>18 min</strong>
                </div>
                <span className="sep" />
                <div>
                  <span>Distância</span>
                  <strong>2,4 km</strong>
                </div>
              </div>

              <div className="next-card">
                <div className="next-lbl">Próxima entrega</div>
                <div className="next-row">
                  <span className="num">3ª</span>
                  <div>
                    <div className="cli">Carla Nogueira</div>
                    <div className="addr">R. Augusta, 2100 · Consolação · ~12 min</div>
                  </div>
                </div>
              </div>

              <div className="confirm-footer">
                <button className="btn btn-secondary" onClick={goAgenda}>Voltar à agenda</button>
                <button className="btn btn-primary" onClick={goAtiva}>Próxima entrega</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

window.MotoristaHome = MotoristaHome;
window.MotoristaAtiva = MotoristaAtiva;
window.MotoristaConfirmacao = MotoristaConfirmacao;
