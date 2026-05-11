// admin-login.jsx — Tela de login do painel administrativo Divan
// Layout 50/50: painel laranja com diagonal + formulário branco

function AdminLogin() {
  const [showPw, setShowPw] = React.useState(false);
  const [email, setEmail] = React.useState("operador@divanmoveis.com.br");
  const [pw, setPw] = React.useState("••••••••••");

  return (
    <div className="login-frame">
      {/* ============ ESQUERDA · marca ============ */}
      <div className="login-left">
        <div className="login-bg-pattern" />

        <div>
          <div className="login-tag">Sistema Logístico · Operação</div>
          <div className="login-logo-stack">
            <img src="assets/logo-white.png" alt="Divan Móveis" />
          </div>
        </div>

        <div>
          <h1 className="login-headline">Logística que<br/>funciona de coração.</h1>
          <p className="login-tagline">
            Centro de operações para roteirizar, despachar e acompanhar
            cada entrega da Divan Móveis em tempo real.
          </p>
        </div>

        <div className="login-footer-l">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span>Área restrita · Acesso somente por operadores autorizados</span>
        </div>
      </div>

      {/* ============ DIREITA · formulário ============ */}
      <div className="login-right">
        <div className="login-card">
          <img src="assets/logo-color.png" className="logo-color" alt="Divan Móveis" />

          <div>
            <h2>Entrar no sistema</h2>
          </div>
          <p className="sub">Use suas credenciais corporativas para continuar.</p>

          <div className="login-fields">
            <div className="field">
              <label className="field-label">E-mail</label>
              <div className="input-with-icon">
                <span className="icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu.email@divanmoveis.com.br"
                />
              </div>
            </div>

            <div className="field">
              <label className="field-label">Senha</label>
              <div className="password-input">
                <input
                  className="input"
                  style={{ paddingRight: 40, width: "100%" }}
                  type={showPw ? "text" : "password"}
                  value={pw}
                  onChange={e => setPw(e.target.value)}
                  placeholder="Sua senha"
                />
                <span className="eye" onClick={() => setShowPw(s => !s)}>
                  {showPw ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </span>
              </div>
            </div>
          </div>

          <button className="btn btn-primary" style={{ width: "100%" }}>
            Entrar no sistema
          </button>

          <a href="#" className="forgot">Esqueci minha senha</a>

          <div className="login-foot">
            © 2026 Divan Móveis · Sistema Logístico v1.0
          </div>
        </div>
      </div>
    </div>
  );
}

window.AdminLogin = AdminLogin;
