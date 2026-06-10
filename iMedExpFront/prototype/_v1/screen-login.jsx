// imedexp · Login — split layout (1440 × 900)

function LoginScreen() {
  const [role, setRole] = React.useState('paciente');
  const [email, setEmail] = React.useState('m.arellano@correo.mx');
  const [pwd, setPwd] = React.useState('••••••••••••');

  const roles = [
    ['paciente', 'Paciente', 'Mi historial'],
    ['medico', 'Médico', 'Mi consola'],
    ['admin', 'Administrador', 'Mi clínica'],
  ];

  return (
    <div className="imx" style={{ width: 1440, height: 900, display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--paper)' }} data-screen-label="Login / Acceso">
      {/* LEFT — ink panel, brand statement */}
      <div style={{
        background: 'var(--ink)', color: 'var(--paper)', position: 'relative',
        padding: '36px 56px', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <HomeLogo color="var(--paper)" height={20} />
          <span className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.08em' }}>
            consola.imedexp.mx
          </span>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <Pulse color="var(--paper)" />
            <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Acceso seguro · sesión cifrada</span>
          </div>
          <h2 style={{
            fontFamily: 'var(--sans)', fontSize: 64, lineHeight: 0.96, fontWeight: 500, letterSpacing: '-0.04em',
            color: 'var(--paper)', maxWidth: 540,
          }}>
            El historial<br />
            <span className="serif" style={{ fontWeight: 400 }}>que el médico</span><br />
            ya leyó antes<br />
            de tu cita.
          </h2>

          <div style={{
            marginTop: 56, padding: '20px 22px',
            border: '1px solid rgba(255,255,255,0.14)', borderRadius: 4,
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0,
          }}>
            {[
              ['12,480', 'expedientes activos'],
              ['1,720', 'médicos en consola'],
              ['≈ 14 s', 'tiempo a comprender al paciente'],
            ].map(([v, k], i) => (
              <div key={i} style={{
                padding: '0 18px', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.14)' : 0,
              }}>
                <div className="mono" style={{ fontSize: 22, letterSpacing: '-0.02em', color: 'var(--paper)' }}>{v}</div>
                <div className="mono" style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 4 }}>{k}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.06em' }}>
            HIPAA · NOM-024-SSA3-2010 · cifrado E2E
          </span>
          <span className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>
            v1.0 · 26.05
          </span>
        </div>
      </div>

      {/* RIGHT — paper, form */}
      <div style={{
        padding: '36px 56px', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 18 }}>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>¿No tienes cuenta?</span>
          <span style={{ fontSize: 13, color: 'var(--ink)', borderBottom: '1px solid var(--ink)', paddingBottom: 1 }}>Crear cuenta →</span>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 460, width: '100%', alignSelf: 'center' }}>
          <span className="eyebrow">Iniciar sesión</span>
          <h1 style={{ fontFamily: 'var(--sans)', fontSize: 40, fontWeight: 500, letterSpacing: '-0.03em', marginTop: 10 }}>
            Bienvenido <span className="serif" style={{ fontWeight: 400 }}>de vuelta</span>.
          </h1>
          <p style={{ fontSize: 14, color: 'var(--ink-3)', marginTop: 8 }}>
            Selecciona tu rol y entra. Tu expediente — o tu agenda — te está esperando.
          </p>

          {/* role selector — segmented */}
          <div style={{ marginTop: 36 }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Soy</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', border: '1px solid var(--rule)', borderRadius: 4, overflow: 'hidden' }}>
              {roles.map(([id, label, sub], i) => {
                const active = role === id;
                return (
                  <button key={id} onClick={() => setRole(id)} style={{
                    padding: '14px 12px',
                    borderRight: i < 2 ? '1px solid var(--rule)' : 0,
                    background: active ? 'var(--ink)' : 'var(--white)',
                    color: active ? 'var(--paper)' : 'var(--ink)',
                    textAlign: 'left',
                  }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{label}</div>
                    <div className="mono" style={{ fontSize: 10.5, color: active ? 'rgba(255,255,255,0.6)' : 'var(--ink-3)', marginTop: 2, letterSpacing: '0.06em' }}>
                      → {sub.toLowerCase()}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* form */}
          <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span className="eyebrow">Correo</span>
              <input
                value={email} onChange={(e) => setEmail(e.target.value)}
                style={{
                  height: 48, padding: '0 14px',
                  border: '1px solid var(--rule)', background: 'var(--white)',
                  borderRadius: 3, fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--ink)',
                }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span className="eyebrow">Contraseña</span>
                <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>¿olvidaste? →</span>
              </div>
              <input
                type="password" value={pwd} onChange={(e) => setPwd(e.target.value)}
                style={{
                  height: 48, padding: '0 14px',
                  border: '1px solid var(--rule)', background: 'var(--white)',
                  borderRadius: 3, fontFamily: 'var(--mono)', fontSize: 14, letterSpacing: '0.15em',
                }}
              />
            </label>

            <button className="btn lg block" style={{ marginTop: 8 }}>
              Entrar a {role === 'paciente' ? 'mi historial' : role === 'medico' ? 'mi consola' : 'mi clínica'} →
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '6px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--rule)' }} />
              <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', letterSpacing: '0.12em' }}>O</span>
              <div style={{ flex: 1, height: 1, background: 'var(--rule)' }} />
            </div>

            <button className="btn ghost lg block">
              Entrar con un vínculo de paciente
            </button>
            <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textAlign: 'center', lineHeight: 1.5 }}>
              ¿Eres médico y un paciente te compartió un vínculo? Pega el código y accede sin cuenta.
            </div>
          </div>
        </div>

        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textAlign: 'center' }}>
          Al continuar aceptas los términos · La sesión expira tras 30 min de inactividad
        </div>
      </div>
    </div>
  );
}

window.LoginScreen = LoginScreen;
