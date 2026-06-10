// imedexp · Login — v2 (single login, no role selector)
// 1440 × 900 · split: hero left, form right
// Principle: one action. Iniciar sesión. Nada más.

function LoginScreen() {
  const [email, setEmail] = React.useState('');
  const [pwd, setPwd] = React.useState('');
  const [focused, setFocused] = React.useState(null);
  const [showPwd, setShowPwd] = React.useState(false);

  const inputStyle = (k) => ({
    width: '100%', height: 56, padding: '0 16px',
    border: '1px solid', borderColor: focused === k ? 'var(--ink)' : 'var(--rule)',
    background: 'var(--white)',
    borderRadius: 'var(--r-md)',
    fontFamily: 'var(--sans)', fontSize: 15, color: 'var(--ink)',
    transition: 'border-color .2s ease, box-shadow .2s ease',
    boxShadow: focused === k ? '0 0 0 4px var(--accent-soft)' : 'none',
    outline: 'none',
  });

  return (
    <div className="imx" style={{
      width: 1440, height: 900,
      display: 'grid', gridTemplateColumns: '1.15fr 1fr',
      background: 'var(--paper)',
    }} data-screen-label="Login / Acceso">

      {/* ━━━━━━━━━ LEFT — editorial hero ━━━━━━━━━ */}
      <div style={{
        position: 'relative', padding: '40px 56px',
        background: 'var(--paper)', display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Soft decorative blobs */}
        <div style={{
          position: 'absolute', width: 480, height: 480, borderRadius: 999,
          background: 'radial-gradient(circle, var(--paper-3) 0%, transparent 70%)',
          top: -80, right: -120, opacity: 0.7, pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', width: 360, height: 360, borderRadius: 999,
          background: 'radial-gradient(circle, var(--accent-rule) 0%, transparent 70%)',
          bottom: -120, left: -80, opacity: 0.5, pointerEvents: 'none',
        }} />

        {/* Header */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <HomeLogo height={22} />
          <a style={{ fontSize: 13, color: 'var(--ink-2)' }}>← Volver al sitio</a>
        </div>

        {/* Center editorial */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', maxWidth: 580 }}>
          <span className="fadeup" style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '6px 12px 6px 8px', borderRadius: 999,
            background: 'var(--white)', border: '1px solid var(--accent-rule)',
            color: 'var(--accent-deep)', fontSize: 12, fontWeight: 500,
            alignSelf: 'flex-start',
          }}>
            <Pulse />
            Plataforma médica · MX
          </span>

          <h1 className="fadeup" style={{
            animationDelay: '120ms',
            fontFamily: 'var(--sans)', fontWeight: 200, fontSize: 84, lineHeight: 0.96,
            letterSpacing: '-0.04em', marginTop: 28, color: 'var(--ink)',
          }}>
            Bienvenido<br />
            <span className="serif" style={{ fontWeight: 400, color: 'var(--accent-deep)' }}>de vuelta.</span>
          </h1>

          <p className="fadeup" style={{
            animationDelay: '220ms',
            fontSize: 17, lineHeight: 1.5, color: 'var(--ink-2)', marginTop: 24, maxWidth: 460,
            fontWeight: 300,
          }}>
            Tu expediente — o el de tus pacientes — está donde lo dejaste.
            Sin interrogatorios, sin formularios.
          </p>

          {/* light testimonial */}
          <div className="fadeup" style={{
            animationDelay: '340ms',
            marginTop: 56, padding: '20px 22px',
            background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)',
            maxWidth: 480,
          }}>
            <p style={{
              fontFamily: 'var(--serif)', fontSize: 20, lineHeight: 1.25, color: 'var(--ink)',
              fontStyle: 'italic', fontWeight: 400,
            }}>
              "La paciente entró y yo ya sabía lo que tenía que ajustarle. 14 segundos."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
              <span style={{ width: 28, height: 28, borderRadius: 999, background: 'var(--accent)', display: 'inline-block' }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>Dra. Patricia Galván</div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>endocrinología · CDMX</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.08em' }}>
            HIPAA · NOM-024-SSA3 · CIFRADO AES-256
          </span>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>v1.0 · 26.05</span>
        </div>
      </div>

      {/* ━━━━━━━━━ RIGHT — single login form ━━━━━━━━━ */}
      <div style={{
        background: 'var(--white)',
        borderLeft: '1px solid var(--rule)',
        padding: '40px 80px', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>
            ¿No tienes cuenta?{' '}
            <a style={{ color: 'var(--ink)', borderBottom: '1px solid var(--ink)', paddingBottom: 1, fontWeight: 500 }}>Crear cuenta</a>
          </span>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 420, width: '100%', alignSelf: 'center' }}>
          <span className="eyebrow">Iniciar sesión</span>
          <h2 style={{
            fontFamily: 'var(--sans)', fontSize: 40, fontWeight: 500,
            letterSpacing: '-0.03em', marginTop: 10, lineHeight: 1.05,
          }}>
            Entra a tu cuenta.
          </h2>
          <p style={{ fontSize: 14.5, color: 'var(--ink-3)', marginTop: 10, lineHeight: 1.5 }}>
            Una sola entrada para pacientes y médicos.
            Reconocemos tu rol automáticamente.
          </p>

          {/* form */}
          <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 500 }}>Correo electrónico</span>
              <input
                value={email} onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                placeholder="tu@correo.com"
                style={inputStyle('email')}
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 500 }}>Contraseña</span>
                <a style={{ fontSize: 12, color: 'var(--ink-3)' }}>¿Olvidaste tu contraseña?</a>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={pwd} onChange={(e) => setPwd(e.target.value)}
                  onFocus={() => setFocused('pwd')} onBlur={() => setFocused(null)}
                  placeholder="••••••••••••"
                  style={{ ...inputStyle('pwd'), paddingRight: 48 }}
                />
                <button
                  onClick={() => setShowPwd(!showPwd)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    width: 32, height: 32, borderRadius: 6,
                    color: 'var(--ink-3)', fontSize: 11, fontFamily: 'var(--mono)',
                  }}
                >{showPwd ? 'oculta' : 'ver'}</button>
              </div>
            </label>

            <button style={{
              height: 56, marginTop: 8, borderRadius: 'var(--r-md)',
              background: 'var(--ink)', color: 'var(--paper)',
              fontFamily: 'var(--sans)', fontSize: 15, fontWeight: 500, letterSpacing: '-0.005em',
              border: 0, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              transition: 'transform .12s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
            >
              Iniciar sesión
              <span style={{ fontWeight: 300 }}>→</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '6px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--rule)' }} />
              <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', letterSpacing: '0.16em' }}>O</span>
              <div style={{ flex: 1, height: 1, background: 'var(--rule)' }} />
            </div>

            <button style={{
              height: 52, borderRadius: 'var(--r-md)',
              background: 'var(--white)', color: 'var(--ink)',
              border: '1px solid var(--rule)', cursor: 'pointer',
              fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 500,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              transition: 'background .15s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--paper)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--white)'}
            >
              <span style={{ width: 18, height: 18, borderRadius: 4, background: 'var(--ink)' }} />
              Entrar con un vínculo de paciente
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--ink-3)', lineHeight: 1.6 }}>
          Al continuar aceptas los <a style={{ color: 'var(--ink)', borderBottom: '1px solid var(--rule)' }}>términos</a>{' '}
          y la <a style={{ color: 'var(--ink)', borderBottom: '1px solid var(--rule)' }}>política de privacidad</a>.
          <br />
          Tu sesión expira tras 30 min de inactividad.
        </div>
      </div>
    </div>
  );
}

window.LoginScreen = LoginScreen;
