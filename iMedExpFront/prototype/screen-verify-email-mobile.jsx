// imedexp · Auth · verificar correo (móvil)
// 390 × 844 · sin tab bar (es flujo de onboarding)

function VerifyEmailMobileScreen() {
  const code = ['4', '7', '2', '9', '', ''];
  return (
    <div data-screen-label="V′ · Verificar correo">
      <window.IOSDevice width={390} height={844} title="imedexp">
        <window.MbFrame noTabs>
          {/* hero */}
          <div style={{ padding: '12px 22px 22px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', width: 280, height: 280, borderRadius: 999, background: 'radial-gradient(circle, var(--paper-3) 0%, transparent 70%)', top: -90, right: -100 }} />
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <window.HomeLogo height={18} />
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>3 / 3</span>
            </div>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '5px 10px 5px 7px', borderRadius: 999,
              background: 'var(--white)', border: '1px solid var(--accent-rule)',
              color: 'var(--accent-deep)', fontSize: 10.5, fontWeight: 500,
              marginTop: 24,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: 99, background: 'var(--accent-bright)' }} />
              Verificar correo
            </span>
            <h1 style={{
              fontFamily: 'var(--sans)', fontWeight: 200, fontSize: 56, lineHeight: 0.96,
              letterSpacing: '-0.04em', marginTop: 14, color: 'var(--ink)', position: 'relative',
            }}>
              Confirmamos<br />
              <span className="serif" style={{ fontWeight: 400, color: 'var(--accent-deep)' }}>tu correo.</span>
            </h1>
          </div>

          <div style={{ padding: '4px 20px 24px' }}>
            {/* email */}
            <div style={{ padding: '12px 14px', background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--paper-3)', color: 'var(--accent-deep)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <window.MbIcon kind="mail" size={16} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="eyebrow" style={{ fontSize: 9.5 }}>Te enviamos un código a</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 12.5, color: 'var(--ink)', marginTop: 2 }}>maria.arellano@gmail.com</div>
              </div>
              <span style={{ fontSize: 11, color: 'var(--accent-deep)' }}>Cambiar</span>
            </div>

            <div style={{ marginTop: 22 }}>
              <span className="eyebrow">Código de 6 dígitos</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6, marginTop: 10 }}>
                {code.map((d, i) => (
                  <div key={i} style={{
                    height: 54, borderRadius: 'var(--r-md)',
                    border: '1.5px solid ' + (d ? 'var(--ink)' : i === 4 ? 'var(--accent)' : 'var(--rule)'),
                    background: i === 4 ? 'var(--paper)' : 'var(--white)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--mono)', fontSize: 24, fontWeight: 500, color: 'var(--ink)',
                    position: 'relative',
                  }}>{d}
                    {i === 4 && <span style={{ position: 'absolute', width: 2, height: 24, background: 'var(--ink)', animation: 'imxBlink 1s steps(1,end) infinite' }} />}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <span className="mono" style={{ fontSize: 10.5, color: 'var(--ok)' }}>● 4 / 6 dígitos</span>
                <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>caduca en 09:47</span>
              </div>
            </div>

            <button className="btn block" style={{ marginTop: 22, height: 50, fontSize: 14.5, borderRadius: 'var(--r-md)' }}>
              Verificar y entrar <window.MbIcon kind="arrow" size={14} color="#fff" />
            </button>

            <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 500 }}>¿No te llegó?</div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>1 reenvío restante</div>
              </div>
              <button className="btn sm ghost" style={{ height: 32, fontSize: 11.5, borderRadius: 9 }}>
                <window.MbIcon kind="send" size={12} /> Reenviar
              </button>
            </div>

            <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', textAlign: 'center', marginTop: 16, lineHeight: 1.6 }}>
              POST /auth/verify-email · /resend-code
            </div>
          </div>
        </window.MbFrame>
      </window.IOSDevice>
    </div>
  );
}

window.VerifyEmailMobileScreen = VerifyEmailMobileScreen;
