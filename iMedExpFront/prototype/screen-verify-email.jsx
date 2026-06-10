// imedexp · Auth · verificar correo
// Pareja del flujo de registro — cierra el endpoint POST /auth/verify-email
// y /auth/resend-code que aún no tenía pantalla.
// 1440 × 900 — sigue el AuthLayout split (editorial izq · form der).

function VerifyEmailScreen() {
  const HomeLogo = window.HomeLogo;
  const code = ['4', '7', '2', '9', '', ''];
  return (
    <div className="imx" data-screen-label="V · Verificar correo" style={{
      width: 1440, height: 900,
      display: 'grid', gridTemplateColumns: '1.15fr 1fr',
      background: 'var(--paper)',
    }}>
      {/* LEFT — editorial */}
      <div style={{ position: 'relative', padding: '40px 56px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 480, height: 480, borderRadius: 999, background: 'radial-gradient(circle, var(--paper-3) 0%, transparent 70%)', top: -80, right: -120, opacity: 0.7, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 360, height: 360, borderRadius: 999, background: 'radial-gradient(circle, var(--accent-rule) 0%, transparent 70%)', bottom: -120, left: -80, opacity: 0.5, pointerEvents: 'none' }} />

        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <HomeLogo height={22} />
          <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>← Volver al registro</span>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', maxWidth: 580 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '6px 12px 6px 8px', borderRadius: 999,
            background: 'var(--white)', border: '1px solid var(--accent-rule)',
            color: 'var(--accent-deep)', fontSize: 12, fontWeight: 500,
            alignSelf: 'flex-start',
          }}>
            <span style={{ width: 8, height: 8, borderRadius: 99, background: 'var(--accent-bright)' }} />
            Paso 3 de 3 · verificar correo
          </span>

          <h1 style={{
            fontFamily: 'var(--sans)', fontWeight: 200, fontSize: 80, lineHeight: 0.96,
            letterSpacing: '-0.04em', marginTop: 28, color: 'var(--ink)',
          }}>
            Confirmamos<br />
            <span className="serif" style={{ fontWeight: 400, color: 'var(--accent-deep)' }}>tu correo.</span>
          </h1>

          <p style={{ fontSize: 17, lineHeight: 1.5, color: 'var(--ink-2)', marginTop: 22, maxWidth: 460, fontWeight: 300 }}>
            Tu cuenta es la llave de un expediente clínico que se comparte entre médicos. Verificamos tu correo una vez antes de soltar acceso.
          </p>

          <div style={{ marginTop: 32, padding: '14px 18px', background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--paper-3)', color: 'var(--accent-deep)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <window.AdmIcon kind="mail" size={18} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="eyebrow" style={{ fontSize: 10 }}>Te enviamos un código a</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--ink)', marginTop: 2, letterSpacing: '-0.005em' }}>maria.arellano@gmail.com</div>
            </div>
            <span style={{ fontSize: 12, color: 'var(--accent-deep)' }}>Cambiar</span>
          </div>

          <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: '24px 1fr', gap: 12, alignItems: 'start', color: 'var(--ink-3)', fontSize: 13, fontFamily: 'var(--mono)', letterSpacing: '0.02em' }}>
            <span style={{ width: 24, height: 24, borderRadius: 99, background: 'var(--paper-3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-deep)' }}>
              <window.AdmIcon kind="shield-2" size={14} />
            </span>
            <span>
              El código vence en <span style={{ color: 'var(--ink)' }}>9 min 47 s</span>. Si no te llega, revisa la carpeta de promociones o pide que lo enviemos otra vez.
            </span>
          </div>
        </div>

        <div style={{ position: 'relative', fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--mono)' }}>
          POST /api/v1/auth/verify-email  ·  POST /api/v1/auth/resend-code
        </div>
      </div>

      {/* RIGHT — form */}
      <div style={{ background: 'var(--white)', padding: '56px 64px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ maxWidth: 440 }}>
          <span className="eyebrow">Verificación</span>
          <h2 style={{ fontFamily: 'var(--sans)', fontSize: 36, fontWeight: 400, letterSpacing: '-0.02em', marginTop: 6, lineHeight: 1.08 }}>
            Pega tu código de 6 dígitos
          </h2>
          <p style={{ fontSize: 14, color: 'var(--ink-3)', marginTop: 10, lineHeight: 1.5 }}>
            El código se autocompleta si lo copias del correo. También puedes escribir cada dígito.
          </p>

          {/* code boxes */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, marginTop: 28 }}>
            {code.map((d, i) => (
              <div key={i} style={{
                height: 64, borderRadius: 'var(--r-md)',
                border: '1.5px solid ' + (d ? 'var(--ink)' : i === 4 ? 'var(--accent)' : 'var(--rule)'),
                background: i === 4 ? 'var(--paper)' : 'var(--white)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--mono)', fontSize: 28, fontWeight: 500, color: 'var(--ink)',
                position: 'relative',
              }}>
                {d}
                {i === 4 && <span style={{ position: 'absolute', width: 2, height: 28, background: 'var(--ink)', animation: 'imxBlink 1s steps(1,end) infinite' }} />}
              </div>
            ))}
          </div>

          {/* helper row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
            <span className="mono" style={{ fontSize: 11, color: 'var(--ok)' }}>● 4 / 6 dígitos</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>caduca en 09:47</span>
          </div>

          <button className="btn block" style={{ marginTop: 22, height: 52, fontSize: 15, borderRadius: 'var(--r-md)' }}>
            Verificar y entrar <window.AdmIcon kind="arrow" size={15} color="#fff" />
          </button>

          {/* resend */}
          <div style={{ marginTop: 22, padding: '14px 16px', background: 'var(--paper)', borderRadius: 'var(--r-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>¿No te llegó el correo?</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>Podemos reenviarlo · 1 intento restante</div>
            </div>
            <button className="btn sm ghost" style={{ borderRadius: 9 }}>
              <window.AdmIcon kind="send" size={13} /> Reenviar
            </button>
          </div>

          {/* alt */}
          <div style={{ marginTop: 18, fontSize: 12.5, color: 'var(--ink-3)', textAlign: 'center', lineHeight: 1.5 }}>
            ¿Pegaste el código mal varias veces? <span style={{ color: 'var(--accent-deep)' }}>Cambia el correo</span> o <span style={{ color: 'var(--accent-deep)' }}>contacta soporte</span>.
          </div>
        </div>
      </div>
    </div>
  );
}

window.VerifyEmailScreen = VerifyEmailScreen;
