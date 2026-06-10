// imedexp · Mobile versions for screens that only had a PC version
//
// Cubre las pantallas faltantes:
//   1. Home / Landing
//   2. Login
//   3. Registro · tipo de cuenta
//   4. Registro · paciente
//   5. Registro · médico
//   6. Recuperar contraseña
//   7. Consola · dashboard (médico)
//   8. Consola · consulta activa (médico)
//
// Cada pantalla vive dentro de un IOSDevice (390 × 844). Home es la única
// pantalla scrolleable larga — el resto cabe en la primera vista.

// ─────────────────────────────────────────────────────────────
// Icon set local (estilo wireframe, stroke 1.6)
// ─────────────────────────────────────────────────────────────
const MMIcon = ({ kind, size = 18, color = 'currentColor' }) => {
  const p = { fill: 'none', stroke: color, strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const svg = (c) => <svg width={size} height={size} viewBox="0 0 24 24" {...p}>{c}</svg>;
  switch (kind) {
    case 'arrow':   return svg(<><path d="M5 12 L19 12" /><path d="M14 7 L19 12 L14 17" /></>);
    case 'arrow-l': return svg(<><path d="M19 12 L5 12" /><path d="M10 7 L5 12 L10 17" /></>);
    case 'check':   return svg(<path d="M5 12 L10 17 L19 7" />);
    case 'mail':    return svg(<><rect x="3.5" y="5.5" width="17" height="13" rx="1.5" /><path d="M4 7 L12 13 L20 7" /></>);
    case 'lock':    return svg(<><rect x="5.5" y="11" width="13" height="8.5" rx="1" /><path d="M8 11 L8 8 A4 4 0 0 1 16 8 L16 11" /></>);
    case 'eye':     return svg(<><path d="M2 12 C5 6 8 4 12 4 C16 4 19 6 22 12 C19 18 16 20 12 20 C8 20 5 18 2 12 Z" /><circle cx="12" cy="12" r="3" /></>);
    case 'heart':   return svg(<path d="M12 19 L4.5 11.5 A4 4 0 0 1 12 7 A4 4 0 0 1 19.5 11.5 Z" />);
    case 'stetho':  return svg(<><path d="M6 4 L6 11 A4 4 0 0 0 14 11 L14 4" /><circle cx="17" cy="14" r="2" /><path d="M10 15 L10 17 A4 4 0 0 0 17 16.5" /></>);
    case 'shield':  return svg(<><path d="M12 3 L20 6 V12 C20 16 16 19 12 21 C8 19 4 16 4 12 V6 Z" /><path d="M9 12 L11 14 L15 10" /></>);
    case 'doc':     return svg(<><rect x="5" y="3" width="14" height="18" rx="1.5" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="13" y2="16" /></>);
    case 'cal':     return svg(<><rect x="3.5" y="5.5" width="17" height="15" rx="1.5" /><line x1="3.5" y1="10" x2="20.5" y2="10" /><line x1="8" y1="3" x2="8" y2="7" /><line x1="16" y1="3" x2="16" y2="7" /></>);
    case 'send':    return svg(<><path d="M21 4 L11 14" /><path d="M21 4 L15 21 L11 14 L4 10 Z" /></>);
    case 'qr':      return svg(<><rect x="4" y="4" width="6" height="6" /><rect x="14" y="4" width="6" height="6" /><rect x="4" y="14" width="6" height="6" /><rect x="14" y="14" width="2" height="2" /><rect x="18" y="14" width="2" height="2" /><rect x="14" y="18" width="2" height="2" /><rect x="18" y="18" width="2" height="2" /></>);
    case 'plus':    return svg(<><path d="M12 5 L12 19" /><path d="M5 12 L19 12" /></>);
    case 'menu':    return svg(<><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></>);
    case 'chev':    return svg(<path d="M9 6 L15 12 L9 18" />);
    case 'chev-d':  return svg(<path d="M6 9 L12 15 L18 9" />);
    case 'bell':    return svg(<><path d="M6 17 L18 17 L17 15.5 L17 11 A5 5 0 0 0 7 11 L7 15.5 Z" /><path d="M10 17 A2 2 0 0 0 14 17" /></>);
    case 'search':  return svg(<><circle cx="11" cy="11" r="6" /><line x1="15.5" y1="15.5" x2="20" y2="20" /></>);
    case 'pill':    return svg(<><rect x="3" y="9" width="18" height="6" rx="3" transform="rotate(-30 12 12)" /><line x1="9.5" y1="7.5" x2="14.5" y2="16.5" /></>);
    case 'pen':     return svg(<><path d="M4 20 L4 16 L16 4 L20 8 L8 20 Z" /><line x1="13" y1="7" x2="17" y2="11" /></>);
    case 'phone':   return svg(<path d="M5 4 L8 4 L10 9 L7.5 11 C8.5 13.5 10.5 15.5 13 16.5 L15 14 L20 16 L20 19 A2 2 0 0 1 18 21 C10.7 21 4 14.3 4 7 A2 2 0 0 1 5 4 Z" />);
    case 'clock':   return svg(<><circle cx="12" cy="12" r="8" /><path d="M12 7 L12 12 L15 14" /></>);
    case 'link':    return svg(<><path d="M10 14 L14 10" /><path d="M8 11 L6 13 A2.8 2.8 0 0 0 10 17 L12 15" /><path d="M16 13 L18 11 A2.8 2.8 0 0 0 14 7 L12 9" /></>);
    case 'apple':   return svg(<><path d="M14 4 C13 5 12 6 12 7" /><path d="M8 9 C6 9 4 11 4 14 C4 17 6 20 8 20 C9.5 20 10 19.5 11.5 19.5 C13 19.5 13.5 20 15 20 C17 20 19 17 19 14 C19 11 17 9 15 9 C13.5 9 13 9.5 11.5 9.5 C10 9.5 9.5 9 8 9 Z" /></>);
    case 'android': return svg(<><path d="M5 11 L5 17 L19 17 L19 11" /><path d="M7 11 A5 5 0 0 1 17 11" /><circle cx="9" cy="9" r="0.6" fill={color} /><circle cx="15" cy="9" r="0.6" fill={color} /><line x1="6" y1="7" x2="8" y2="9" /><line x1="18" y1="7" x2="16" y2="9" /></>);
    default:        return svg(<circle cx="12" cy="12" r="8" />);
  }
};

const MMLogo = ({ color = 'var(--ink)', height = 18 }) => (
  <span
    aria-label="imedexp"
    className="logo-mask"
    style={{
      width: height * 4.1, height, color,
      '--logo-src': "url('assets/logo-wordmark.svg')",
    }}
  />
);

// Shared FAB-less mobile frame (no bottom tab bar; these are pre-login screens or fullscreen flows)
function MMFrame({ children, bg = 'var(--paper)', height = 844 }) {
  return (
    <div style={{
      width: 390, height, background: bg,
      fontFamily: 'var(--sans)', color: 'var(--ink)',
      position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      {children}
    </div>
  );
}

// Mini header for auth flows: logo left, "Volver" link right
function MMAuthHeader({ back = '← Volver' }) {
  return (
    <div style={{
      padding: '8px 20px 16px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      <MMLogo height={16} />
      <a style={{ fontSize: 12, color: 'var(--ink-2)' }}>{back}</a>
    </div>
  );
}

// Small reusable form input (mobile sized)
function MMInput({ label, placeholder, type = 'text', icon, hint, value = '', rightSlot }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 12, color: 'var(--ink-2)', fontWeight: 500 }}>{label}</span>
      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--ink-3)',
          }}>
            <MMIcon kind={icon} size={15} />
          </span>
        )}
        <input
          type={type} defaultValue={value} placeholder={placeholder}
          style={{
            width: '100%', height: 46, padding: icon ? '0 14px 0 38px' : '0 14px',
            paddingRight: rightSlot ? 44 : 14,
            border: '1px solid var(--rule)',
            background: 'var(--white)',
            borderRadius: 'var(--r-md)',
            fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--ink)',
            outline: 'none',
          }}
        />
        {rightSlot && (
          <div style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}>
            {rightSlot}
          </div>
        )}
      </div>
      {hint && <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{hint}</span>}
    </label>
  );
}

function MMPrimaryBtn({ children, accent = false, full = true }) {
  return (
    <button style={{
      height: 50, width: full ? '100%' : 'auto', padding: full ? 0 : '0 18px',
      borderRadius: 'var(--r-md)',
      background: accent ? 'var(--accent)' : 'var(--ink)',
      borderColor: accent ? 'var(--accent)' : 'var(--ink)',
      color: 'var(--paper)', border: 0, cursor: 'pointer',
      fontFamily: 'var(--sans)', fontSize: 14.5, fontWeight: 500,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    }}>{children}</button>
  );
}

function MMGhostBtn({ children, full = true }) {
  return (
    <button style={{
      height: 48, width: full ? '100%' : 'auto', padding: full ? 0 : '0 18px',
      borderRadius: 'var(--r-md)',
      background: 'var(--white)', color: 'var(--ink)',
      border: '1px solid var(--rule)', cursor: 'pointer',
      fontFamily: 'var(--sans)', fontSize: 13.5, fontWeight: 500,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    }}>{children}</button>
  );
}

// Eyebrow + headline pair, mobile-sized
function MMHeadline({ eyebrow, lines, accent }) {
  return (
    <div>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h1 style={{
        fontFamily: 'var(--sans)', fontWeight: 200, fontSize: 44, lineHeight: 0.98,
        letterSpacing: '-0.035em', marginTop: 6, color: 'var(--ink)',
      }}>
        {lines.map((l, i) => (
          <React.Fragment key={i}>
            {i === lines.length - 1 && accent ? (
              <span className="serif" style={{ fontWeight: 400, color: 'var(--accent-deep)' }}>{l}</span>
            ) : l}
            {i < lines.length - 1 && <br />}
          </React.Fragment>
        ))}
      </h1>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 1 · HOME / LANDING — móvil (vista larga · scroll completo)
// ─────────────────────────────────────────────────────────────
function HomeMobileInner() {
  return (
    <MMFrame height={1980} bg="var(--paper)">
      {/* Decorative blobs */}
      <div style={{
        position: 'absolute', width: 360, height: 360, borderRadius: 999,
        background: 'radial-gradient(circle, var(--paper-3) 0%, transparent 70%)',
        top: -120, right: -100, opacity: 0.7, pointerEvents: 'none',
      }} />

      {/* nav */}
      <div style={{
        padding: '8px 18px 14px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(241,250,254,0.85)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--rule-2)',
        position: 'sticky', top: 0, zIndex: 5,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <MMLogo height={16} />
          <span className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', padding: '2px 6px', border: '1px solid var(--rule)', borderRadius: 3, letterSpacing: '0.06em' }}>BETA</span>
        </div>
        <button style={{
          width: 38, height: 38, borderRadius: 10, border: '1px solid var(--rule)',
          background: 'var(--white)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <MMIcon kind="menu" size={16} color="var(--ink-2)" />
        </button>
      </div>

      {/* hero */}
      <div style={{ position: 'relative', padding: '24px 22px 28px' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '5px 11px 5px 8px', borderRadius: 999,
          background: 'var(--paper-3)', border: '1px solid var(--accent-rule)',
          color: 'var(--accent-deep)', fontSize: 11, fontWeight: 500,
        }}>
          <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: 99, background: 'var(--accent-bright)' }} />
          Plataforma médica · MX
        </span>

        <h1 style={{
          fontFamily: 'var(--sans)', fontWeight: 300, fontSize: 48, lineHeight: 0.95,
          letterSpacing: '-0.04em', marginTop: 18, color: 'var(--ink)',
        }}>
          Tu expediente<br />
          médico,<br />
          <span style={{ fontWeight: 700, color: 'var(--accent-deep)' }}>listo</span>{' '}
          <span className="serif" style={{ fontWeight: 400 }}>en cualquier</span>{' '}
          consulta.
        </h1>

        <p style={{ fontSize: 14.5, lineHeight: 1.5, color: 'var(--ink-2)', marginTop: 18, fontWeight: 300 }}>
          Captura tu historial una vez. Compártelo con cualquier médico
          en segundos. Sin formularios, sin información perdida.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 22 }}>
          <MMPrimaryBtn accent>Soy paciente · empezar gratis →</MMPrimaryBtn>
          <MMGhostBtn>Soy médico · acceder</MMGhostBtn>
        </div>

        {/* 3 stat row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 28 }}>
          {[
            ['12.4k', 'expedientes'],
            ['1.7k+', 'médicos'],
            ['98%',   'adherencia'],
          ].map(([n, l]) => (
            <div key={l}>
              <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--ink)' }}>{n}</div>
              <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: '0.06em', marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* dashboard preview card */}
      <div style={{ padding: '0 22px' }}>
        <div style={{
          background: 'var(--white)', borderRadius: 'var(--r-xl)', border: '1px solid var(--rule)',
          boxShadow: '0 20px 50px -20px rgba(3,4,94,0.18)', overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid var(--rule-2)', background: 'var(--paper)' }}>
            <div style={{ display: 'flex', gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: 99, background: '#FF6058' }} />
              <span style={{ width: 8, height: 8, borderRadius: 99, background: '#FFBD2D' }} />
              <span style={{ width: 8, height: 8, borderRadius: 99, background: '#27CA40' }} />
            </div>
            <span className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)' }}>consola.imedexp.mx</span>
            <span />
          </div>
          <div style={{ padding: '14px 16px 16px' }}>
            <span className="eyebrow" style={{ fontSize: 9.5 }}>próxima cita · en 12 min</span>
            <h4 style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 400, lineHeight: 1.02, letterSpacing: '-0.02em', marginTop: 4 }}>
              María F. Arellano
            </h4>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 3 }}>
              ♀ 34a · O+ · primera consulta
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--alert-soft)', border: '1px solid var(--alert-rule)', borderRadius: 'var(--r-md)', padding: '8px 10px', marginTop: 10 }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 9, padding: '2px 7px', background: 'var(--alert)', color: '#fff', borderRadius: 999, letterSpacing: '0.12em' }}>ALERGIA</span>
              <span style={{ fontSize: 11, color: 'var(--ink)' }}><strong>Penicilina</strong> · anafilaxia 2019</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, marginTop: 10, background: 'var(--rule)', borderRadius: 'var(--r-md)', overflow: 'hidden', border: '1px solid var(--rule)' }}>
              {[
                ['Dx activos', 'Hipotiroidismo · SOP', '4'],
                ['Medicación', 'Levotiroxina 75µg', '3'],
                ['Cirugías', 'Apendicectomía 2017', '3'],
                ['Estudios', 'TSH 4.8 mU/L', '4'],
              ].map(([k, body, n], i) => (
                <div key={i} style={{ background: 'var(--white)', padding: '9px 10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span className="eyebrow" style={{ fontSize: 9 }}>{k}</span>
                    <span className="mono" style={{ fontSize: 10, color: 'var(--accent-deep)' }}>{n}</span>
                  </div>
                  <div style={{ fontSize: 10.5, color: 'var(--ink-2)', marginTop: 3, lineHeight: 1.35 }}>{body}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* trust strip */}
      <div style={{ padding: '22px 22px', marginTop: 22, background: 'var(--ink)', color: 'var(--paper)' }}>
        <span className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.16em' }}>CUMPLIMIENTO · MX</span>
        <div className="mono" style={{ fontSize: 13, marginTop: 4, color: 'var(--paper)' }}>HIPAA · NOM-024-SSA3 · ISO 27001</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 16 }}>
          {[
            ['Cifrado',     'AES-256 E2E'],
            ['Datos en MX', '100% soberanía'],
            ['Auditoría',   'Cada acceso'],
            ['Revocable',   'En 1 toque'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <MMIcon kind="check" size={14} color="var(--accent-bright)" />
              <div>
                <div style={{ fontSize: 12, fontWeight: 500 }}>{k}</div>
                <div className="mono" style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.6)', marginTop: 1 }}>{v}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* features mini grid */}
      <div style={{ padding: '36px 22px 28px' }}>
        <span className="eyebrow">02 · características</span>
        <h2 style={{ fontSize: 32, lineHeight: 1, fontWeight: 300, letterSpacing: '-0.03em', marginTop: 8 }}>
          Todo lo que necesitas para{' '}
          <span className="serif" style={{ fontWeight: 400, color: 'var(--accent-deep)' }}>una práctica moderna.</span>
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 18 }}>
          {[
            ['doc',    'Historia clínica digital', 'Expedientes completos, siempre actualizados.', true],
            ['cal',    'Citas inteligentes',       'Agenda + recordatorios automáticos.', false],
            ['shield', 'Seguridad médica',         'AES-256 · auditoría · revocable.', false],
            ['pill',   'Recetas digitales',        'Firma del médico, al expediente al instante.', false],
          ].map(([icon, t, b, hl]) => (
            <div key={t} style={{
              background: 'var(--white)', border: '1px solid var(--rule)',
              borderRadius: 'var(--r-lg)', padding: '14px 16px',
              display: 'grid', gridTemplateColumns: '40px 1fr auto', gap: 12, alignItems: 'center',
            }}>
              <span style={{
                width: 40, height: 40, borderRadius: 'var(--r-md)',
                background: hl ? 'var(--accent)' : 'var(--paper-3)',
                color: hl ? '#fff' : 'var(--accent-deep)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <MMIcon kind={icon} size={18} />
              </span>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{t}</div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2, lineHeight: 1.4 }}>{b}</div>
              </div>
              <MMIcon kind="chev" size={14} color="var(--ink-3)" />
            </div>
          ))}
        </div>
      </div>

      {/* cómo funciona — 3 pasos */}
      <div style={{ padding: '8px 22px 32px', background: 'var(--paper-2)' }}>
        <div style={{ paddingTop: 28 }}>
          <span className="eyebrow">03 · cómo funciona</span>
          <h2 style={{ fontSize: 28, lineHeight: 1, fontWeight: 300, letterSpacing: '-0.03em', marginTop: 8 }}>
            Empieza en <span style={{ fontWeight: 700, color: 'var(--accent-deep)' }}>3 pasos</span>{' '}
            <span className="serif" style={{ fontWeight: 400 }}>simples.</span>
          </h2>
          <ol style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 18 }}>
            {[
              ['01', 'Regístrate en 2 minutos', 'Crea tu cuenta como paciente o médico. Verificación instantánea.'],
              ['02', 'Comparte un vínculo seguro', 'Código único, vencimiento de 22 min, uso único. Nadie más puede acceder.'],
              ['03', 'El médico ya lo leyó',     'Tu expediente jerarquizado: alergias arriba, crónicos en medio.'],
            ].map(([n, t, b]) => (
              <li key={n} style={{
                background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)',
                padding: '14px 16px', position: 'relative',
              }}>
                <span style={{
                  position: 'absolute', top: -12, left: 16,
                  fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 500, letterSpacing: '0.08em',
                  padding: '3px 10px', borderRadius: 999,
                  background: 'var(--ink)', color: 'var(--paper)',
                }}>{n}</span>
                <div style={{ fontSize: 14, fontWeight: 500, marginTop: 6 }}>{t}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4, lineHeight: 1.45 }}>{b}</div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* mini testimonio */}
      <div style={{ padding: '28px 22px 28px' }}>
        <div style={{
          background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)',
          padding: '18px 20px',
        }}>
          <p style={{
            fontFamily: 'var(--serif)', fontSize: 18, lineHeight: 1.25, color: 'var(--ink)',
            fontStyle: 'italic', fontWeight: 400,
          }}>
            "La paciente entró y yo ya sabía lo que tenía que ajustarle. 14 segundos."
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
            <span style={{ width: 28, height: 28, borderRadius: 999, background: 'var(--accent)' }} />
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 500 }}>Dra. Patricia Galván</div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>endocrinología · CDMX</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA dark */}
      <div style={{
        margin: '0 0 0', padding: '36px 22px 40px',
        background: 'var(--ink)', color: 'var(--paper)', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', width: 320, height: 320, borderRadius: 999,
          background: 'radial-gradient(circle, rgba(0,180,216,0.25) 0%, transparent 70%)',
          top: -120, right: -80, pointerEvents: 'none',
        }} />
        <span className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.16em' }}>EMPIEZA HOY</span>
        <h2 style={{ fontSize: 36, lineHeight: 1, fontWeight: 300, letterSpacing: '-0.035em', marginTop: 10 }}>
          Tu salud,<br />
          <span className="serif" style={{ fontWeight: 400, color: 'var(--accent-bright)' }}>en tus manos.</span>
        </h2>
        <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.7)', marginTop: 14, lineHeight: 1.55 }}>
          Sin contratos, sin tarjeta de crédito, sin curva de aprendizaje.
          Empieza tu expediente en 2 minutos.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 22 }}>
          <button style={{
            height: 50, borderRadius: 'var(--r-md)', border: 0, cursor: 'pointer',
            background: 'var(--accent-bright)', color: 'var(--ink)',
            fontFamily: 'var(--sans)', fontSize: 14.5, fontWeight: 600,
          }}>Comenzar gratis →</button>
          <button style={{
            height: 48, borderRadius: 'var(--r-md)', cursor: 'pointer',
            background: 'transparent', color: 'var(--paper)',
            border: '1px solid rgba(255,255,255,0.25)',
            fontFamily: 'var(--sans)', fontSize: 13.5, fontWeight: 500,
          }}>Hablar con ventas</button>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 22 }}>
          <button style={{
            flex: 1, height: 46, borderRadius: 'var(--r-md)', border: 0, cursor: 'pointer',
            background: 'rgba(255,255,255,0.06)', color: 'var(--paper)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            fontFamily: 'inherit', fontSize: 12,
          }}>
            <MMIcon kind="apple" size={16} color="var(--paper)" /> App Store
          </button>
          <button style={{
            flex: 1, height: 46, borderRadius: 'var(--r-md)', border: 0, cursor: 'pointer',
            background: 'rgba(255,255,255,0.06)', color: 'var(--paper)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            fontFamily: 'inherit', fontSize: 12,
          }}>
            <MMIcon kind="android" size={16} color="var(--paper)" /> Google Play
          </button>
        </div>
      </div>

      {/* footer mini */}
      <div style={{ padding: '18px 22px 20px', background: '#02022F', color: 'rgba(255,255,255,0.6)' }}>
        <MMLogo height={14} color="var(--paper)" />
        <div className="mono" style={{ fontSize: 10, marginTop: 10, letterSpacing: '0.06em' }}>
          v1.0 · 26.05 · México
        </div>
      </div>
    </MMFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// 2 · LOGIN — móvil
// ─────────────────────────────────────────────────────────────
function LoginMobileInner() {
  return (
    <MMFrame>
      <MMAuthHeader back="← Sitio" />

      <div style={{ flex: 1, padding: '4px 22px 20px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', width: 320, height: 320, borderRadius: 999,
          background: 'radial-gradient(circle, var(--paper-3) 0%, transparent 70%)',
          top: -120, right: -120, opacity: 0.7, pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '5px 11px 5px 8px', borderRadius: 999,
            background: 'var(--white)', border: '1px solid var(--accent-rule)',
            color: 'var(--accent-deep)', fontSize: 11, fontWeight: 500,
          }}>
            <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: 99, background: 'var(--accent-bright)' }} />
            Plataforma médica · MX
          </span>

          <MMHeadline lines={['Bienvenido', 'de vuelta.']} accent />

          <p style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 14, lineHeight: 1.5, fontWeight: 300 }}>
            Una sola entrada para pacientes y médicos. Reconocemos tu rol automáticamente.
          </p>
        </div>

        <div style={{ position: 'relative', marginTop: 26, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <MMInput label="Correo electrónico" placeholder="tu@correo.com" icon="mail" />
          <MMInput
            label="Contraseña" type="password" placeholder="••••••••••••" icon="lock"
            rightSlot={<button style={{ fontSize: 10.5, fontFamily: 'var(--mono)', color: 'var(--ink-3)', cursor: 'pointer', padding: '4px 8px' }}>ver</button>}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -8 }}>
            <a style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>¿Olvidaste tu contraseña?</a>
          </div>

          <MMPrimaryBtn>Iniciar sesión <span style={{ fontWeight: 300 }}>→</span></MMPrimaryBtn>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--rule)' }} />
            <span className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: '0.16em' }}>O</span>
            <div style={{ flex: 1, height: 1, background: 'var(--rule)' }} />
          </div>

          <MMGhostBtn>
            <MMIcon kind="qr" size={14} color="var(--ink)" />
            Entrar con un vínculo de paciente
          </MMGhostBtn>
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ position: 'relative', textAlign: 'center', fontSize: 11, color: 'var(--ink-3)', lineHeight: 1.5, marginTop: 14 }}>
          ¿No tienes cuenta?{' '}
          <a style={{ color: 'var(--ink)', fontWeight: 500, borderBottom: '1px solid var(--ink)' }}>Crear cuenta</a>
          <div className="mono" style={{ fontSize: 9.5, marginTop: 10, letterSpacing: '0.08em' }}>
            HIPAA · NOM-024-SSA3 · AES-256
          </div>
        </div>
      </div>
    </MMFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// 3 · REGISTRO · TIPO DE CUENTA — móvil
// ─────────────────────────────────────────────────────────────
function RegRoleMobileInner() {
  const card = (icon, title, body, time) => (
    <div style={{
      padding: '20px 20px',
      border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)',
      background: 'var(--white)',
      boxShadow: '0 1px 0 var(--rule-2)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{
          width: 44, height: 44, borderRadius: 'var(--r-md)',
          background: 'var(--paper-3)', color: 'var(--accent-deep)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <MMIcon kind={icon} size={22} />
        </div>
        <span style={{
          fontFamily: 'var(--mono)', fontSize: 10, padding: '3px 8px',
          background: 'var(--paper-2)', color: 'var(--ink-3)', borderRadius: 999,
          letterSpacing: '0.06em',
        }}>~ {time}</span>
      </div>
      <h3 style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 400, letterSpacing: '-0.02em', marginTop: 14, lineHeight: 1, color: 'var(--ink)' }}>
        {title}
      </h3>
      <p style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 8, lineHeight: 1.5 }}>{body}</p>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginTop: 16,
        fontSize: 12.5, fontWeight: 500, color: 'var(--ink)',
        borderTop: '1px solid var(--rule-2)', paddingTop: 12,
      }}>
        Continuar <span>→</span>
      </div>
    </div>
  );

  return (
    <MMFrame>
      <MMAuthHeader back="← Volver" />
      <div style={{ flex: 1, padding: '4px 22px 22px', overflow: 'auto' }}>
        <span className="eyebrow">Crear cuenta · paso 1 de 2</span>
        <h2 style={{ fontSize: 30, fontWeight: 500, letterSpacing: '-0.03em', marginTop: 6, lineHeight: 1.05 }}>
          ¿Cómo vas a<br />usar imedexp?
        </h2>
        <p style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 10, lineHeight: 1.5 }}>
          Elige tu rol para personalizar tu experiencia.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
          {card('heart',  'Soy paciente', 'Lleva tu historial contigo. Comparte un vínculo con cualquier médico nuevo.', '2 min')}
          {card('stetho', 'Soy médico',   'Recibe a tus pacientes con su expediente ya leído. Verificamos tu cédula.', '4 min')}
        </div>

        <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--ink-3)', lineHeight: 1.6, marginTop: 22 }}>
          ¿Ya tienes cuenta?{' '}
          <a style={{ color: 'var(--ink)', fontWeight: 500, borderBottom: '1px solid var(--ink)' }}>Iniciar sesión</a>
        </div>
      </div>
    </MMFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Stepper móvil — compacto
// ─────────────────────────────────────────────────────────────
function MMStepper({ steps, current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {steps.map((s, i) => {
        const done = i < current, active = i === current;
        return (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                width: 20, height: 20, borderRadius: 999,
                background: done ? 'var(--accent)' : active ? 'var(--ink)' : 'var(--paper-3)',
                color: done || active ? '#fff' : 'var(--ink-3)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 500,
              }}>
                {done ? <MMIcon kind="check" size={10} color="#fff" /> : i + 1}
              </span>
              <span style={{
                fontSize: 11, fontWeight: 500,
                color: active ? 'var(--ink)' : done ? 'var(--ink-2)' : 'var(--ink-3)',
              }}>{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 1, background: done ? 'var(--accent)' : 'var(--rule)', maxWidth: 18 }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 4 · REGISTRO · PACIENTE — móvil
// ─────────────────────────────────────────────────────────────
function RegPatientMobileInner() {
  return (
    <MMFrame>
      <MMAuthHeader back="← Tipo de cuenta" />
      <div style={{ flex: 1, padding: '4px 22px 22px', overflow: 'auto' }}>
        <MMStepper steps={['Cuenta', 'Verificar']} current={0} />

        <h2 style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.03em', marginTop: 16, lineHeight: 1.05 }}>
          Datos personales.
        </h2>
        <p style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 6, lineHeight: 1.5 }}>
          Estos datos aparecerán en tu expediente. Tu médico podrá verlos al compartir tu vínculo.
        </p>

        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <MMInput label="Nombre(s)" placeholder="Como en tu INE" />
          <MMInput label="Apellidos" placeholder="Paterno y materno" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <MMInput label="Nacimiento" placeholder="dd/mm/aaaa" icon="cal" />
            <MMInput label="CURP" placeholder="opcional" hint="18 caracteres" />
          </div>
          <MMInput label="Correo" placeholder="tu@correo.com" type="email" icon="mail" />
          <MMInput
            label="Contraseña" type="password" placeholder="Mín. 10 caracteres" icon="lock"
            hint="Usa al menos una mayúscula, un número y un símbolo."
          />
        </div>

        <div style={{ marginTop: 16 }}>
          <MMPrimaryBtn>Crear cuenta <span style={{ fontWeight: 300 }}>→</span></MMPrimaryBtn>
        </div>

        <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--ink-3)', lineHeight: 1.55, marginTop: 14 }}>
          Al continuar aceptas los <a style={{ color: 'var(--ink)', borderBottom: '1px solid var(--rule)' }}>términos</a>{' '}
          y la <a style={{ color: 'var(--ink)', borderBottom: '1px solid var(--rule)' }}>privacidad</a>.
        </div>
      </div>
    </MMFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// 5 · REGISTRO · MÉDICO — móvil
// ─────────────────────────────────────────────────────────────
function RegDoctorMobileInner() {
  return (
    <MMFrame>
      <MMAuthHeader back="← Tipo de cuenta" />
      <div style={{ flex: 1, padding: '4px 22px 22px', overflow: 'auto' }}>
        <MMStepper steps={['Datos', 'Cédula', 'Activación']} current={0} />

        <h2 style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.03em', marginTop: 16, lineHeight: 1.05 }}>
          Datos<br />profesionales.
        </h2>
        <p style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 6, lineHeight: 1.5 }}>
          Validamos tu cédula contra el Registro de la SEP. Activación en menos de 24 h.
        </p>

        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <MMInput label="Nombre(s)" placeholder="Como en tu cédula" />
          <MMInput label="Apellidos" placeholder="Paterno y materno" />
          <MMInput label="Cédula profesional" placeholder="Ej. 8842711" icon="doc" hint="Validamos contra el Registro · SEP" />

          {/* select */}
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--ink-2)', fontWeight: 500 }}>Especialidad</span>
            <div style={{
              height: 46, padding: '0 14px',
              border: '1px solid var(--rule)', background: 'var(--white)',
              borderRadius: 'var(--r-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontSize: 14, color: 'var(--ink-3)',
            }}>
              Selecciona…
              <MMIcon kind="chev-d" size={14} color="var(--ink-3)" />
            </div>
          </label>

          <MMInput label="Correo institucional" placeholder="tu@correo.com" type="email" icon="mail" />
          <MMInput label="Contraseña" type="password" placeholder="Mín. 10 caracteres" icon="lock" />
        </div>

        <div style={{ marginTop: 16 }}>
          <MMPrimaryBtn>Continuar con verificación <span style={{ fontWeight: 300 }}>→</span></MMPrimaryBtn>
        </div>

        <div style={{ textAlign: 'center', fontSize: 10.5, color: 'var(--ink-3)', lineHeight: 1.55, marginTop: 14 }}>
          Al continuar aceptas los <a style={{ color: 'var(--ink)', borderBottom: '1px solid var(--rule)' }}>términos</a>,{' '}
          <a style={{ color: 'var(--ink)', borderBottom: '1px solid var(--rule)' }}>privacidad</a> y la{' '}
          <a style={{ color: 'var(--ink)', borderBottom: '1px solid var(--rule)' }}>política clínica</a>.
        </div>
      </div>
    </MMFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// 6 · RECUPERAR CONTRASEÑA — móvil
// ─────────────────────────────────────────────────────────────
function RecoverMobileInner() {
  return (
    <MMFrame>
      <MMAuthHeader back="← Iniciar sesión" />

      <div style={{ flex: 1, padding: '4px 22px 20px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', width: 320, height: 320, borderRadius: 999,
          background: 'radial-gradient(circle, var(--paper-3) 0%, transparent 70%)',
          top: -120, right: -120, opacity: 0.7, pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative' }}>
          <span className="eyebrow">Recuperar acceso</span>
          <MMHeadline lines={['Olvidaste tu', 'contraseña.']} accent />
          <p style={{ fontSize: 13.5, color: 'var(--ink-2)', marginTop: 14, lineHeight: 1.5 }}>
            Te mandamos un enlace seguro a tu correo. El enlace expira en 30 minutos y solo se usa una vez.
          </p>
        </div>

        <div style={{ position: 'relative', marginTop: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <MMInput label="Correo electrónico" placeholder="tu@correo.com" type="email" icon="mail" />
          <MMPrimaryBtn>
            <MMIcon kind="send" size={14} color="var(--paper)" />
            Enviar enlace de recuperación
          </MMPrimaryBtn>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--rule)' }} />
            <span className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: '0.16em' }}>O</span>
            <div style={{ flex: 1, height: 1, background: 'var(--rule)' }} />
          </div>

          <MMGhostBtn>
            <MMIcon kind="shield" size={15} color="var(--accent-deep)" />
            Recuperar con código de respaldo
          </MMGhostBtn>
        </div>

        <div style={{ flex: 1 }} />

        <div style={{
          position: 'relative', padding: '12px 14px', marginTop: 14,
          background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{
            width: 32, height: 32, borderRadius: 99,
            background: 'var(--paper-3)', color: 'var(--accent-deep)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <MMIcon kind="lock" size={15} />
          </span>
          <div style={{ fontSize: 11.5, color: 'var(--ink-2)', lineHeight: 1.4 }}>
            <strong style={{ color: 'var(--ink)' }}>Tu expediente nunca se bloquea.</strong> Toda la información sigue cifrada con AES-256.
          </div>
        </div>

        <div style={{ position: 'relative', textAlign: 'center', fontSize: 11, color: 'var(--ink-3)', marginTop: 12 }}>
          ¿Necesitas ayuda? <a style={{ color: 'var(--ink)', borderBottom: '1px solid var(--rule)' }}>soporte@imedexp.mx</a>
        </div>
      </div>
    </MMFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// 7 · DASHBOARD MÉDICO — móvil (consola entre consultas)
// ─────────────────────────────────────────────────────────────
function DashboardMobileInner() {
  return (
    <MMFrame>
      {/* top bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '6px 20px 12px',
      }}>
        <button style={{
          width: 36, height: 36, borderRadius: 10, border: '1px solid var(--rule)',
          background: 'var(--white)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <MMIcon kind="menu" size={16} color="var(--ink-2)" />
        </button>
        <MMLogo height={14} />
        <button style={{
          width: 36, height: 36, borderRadius: 10, border: '1px solid var(--rule)',
          background: 'var(--white)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative',
        }}>
          <MMIcon kind="bell" size={16} color="var(--ink-2)" />
          <span style={{ position: 'absolute', top: 8, right: 8, width: 6, height: 6, borderRadius: 99, background: 'var(--alert)' }} />
        </button>
      </div>

      <div style={{ flex: 1, padding: '4px 20px 16px', overflow: 'auto' }}>
        {/* greeting */}
        <span className="eyebrow">Miércoles · 14 mayo · 09:42</span>
        <h1 style={{
          fontFamily: 'var(--sans)', fontSize: 28, fontWeight: 500, letterSpacing: '-0.025em',
          marginTop: 4, lineHeight: 1.1,
        }}>
          Buenos días,{' '}
          <span className="serif" style={{ fontWeight: 400, color: 'var(--accent-deep)' }}>Dr. Solís</span>.
        </h1>

        {/* search */}
        <div style={{
          marginTop: 14, height: 42, padding: '0 14px',
          display: 'flex', alignItems: 'center', gap: 10,
          border: '1px solid var(--rule)', background: 'var(--white)',
          borderRadius: 'var(--r-md)',
        }}>
          <MMIcon kind="search" size={15} color="var(--ink-3)" />
          <span style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>Buscar paciente, diagnóstico…</span>
        </div>

        {/* NEXT PATIENT HERO */}
        <div style={{
          marginTop: 14, padding: '18px 18px 18px',
          background: 'var(--ink)', color: 'var(--paper)',
          borderRadius: 'var(--r-xl)', position: 'relative', overflow: 'hidden',
          boxShadow: '0 20px 40px -20px rgba(3,4,94,0.45)',
        }}>
          <div style={{
            position: 'absolute', width: 300, height: 300, borderRadius: 999,
            background: 'radial-gradient(circle, rgba(0,180,216,0.22) 0%, transparent 70%)',
            top: -110, right: -80, pointerEvents: 'none',
          }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.12em' }}>
                PRÓXIMA CITA · EN 12 MIN
              </span>
              <span style={{
                fontFamily: 'var(--mono)', fontSize: 9.5, padding: '3px 8px', borderRadius: 999,
                background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)',
                border: '1px solid rgba(255,255,255,0.18)', letterSpacing: '0.06em',
              }}>10:30</span>
            </div>
            <h3 style={{
              fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 400, lineHeight: 1, letterSpacing: '-0.02em', marginTop: 6,
            }}>María F. Arellano</h3>
            <div className="mono" style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
              ♀ 34a · O+ · primera consulta
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, padding: '8px 10px', background: 'rgba(184,50,50,0.12)', border: '1px solid rgba(184,50,50,0.5)', borderRadius: 'var(--r-md)' }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 9, padding: '2px 6px', background: 'var(--alert)', color: '#fff', borderRadius: 999, letterSpacing: '0.1em' }}>ALERGIA</span>
              <span style={{ fontSize: 11.5, color: 'var(--paper)' }}><strong>Penicilina</strong> · anafilaxia 2019</span>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button style={{
                flex: 1, height: 40, borderRadius: 10, cursor: 'pointer',
                background: 'var(--accent-bright)', color: 'var(--ink)', border: 0,
                fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600,
              }}>Abrir expediente →</button>
              <button style={{
                width: 40, height: 40, borderRadius: 10, cursor: 'pointer',
                background: 'rgba(255,255,255,0.08)', color: 'var(--paper)',
                border: '1px solid rgba(255,255,255,0.18)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <MMIcon kind="phone" size={15} color="var(--paper)" />
              </button>
            </div>
          </div>
        </div>

        {/* stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 14 }}>
          {[
            ['08/12', 'citas hoy'],
            ['142',   'pacientes'],
            ['3',     'pendientes'],
          ].map(([n, l]) => (
            <div key={l} style={{
              background: 'var(--white)', border: '1px solid var(--rule)',
              borderRadius: 'var(--r-md)', padding: '10px 12px',
            }}>
              <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.02em' }}>{n}</div>
              <div className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.06em', marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* agenda mini */}
        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <span className="eyebrow">Agenda · siguen</span>
            <a style={{ fontSize: 11, color: 'var(--ink-3)' }}>ver todo →</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              ['11:15', 'José L. Padilla', 'post-op día 12'],
              ['12:00', 'Ana Sofía Cortés', 'control crónico'],
              ['12:45', 'Carlos M. Vela',  'primera vez'],
            ].map(([t, n, tag]) => (
              <div key={t} style={{
                display: 'grid', gridTemplateColumns: '42px 1fr auto', gap: 10, alignItems: 'center',
                padding: '10px 12px', borderRadius: 'var(--r-md)',
                background: 'var(--white)', border: '1px solid var(--rule-2)',
              }}>
                <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-2)' }}>{t}</span>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 500 }}>{n}</div>
                  <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: '0.04em', marginTop: 1 }}>{tag}</div>
                </div>
                <MMIcon kind="chev" size={13} color="var(--ink-3)" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </MMFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// 8 · CONSULTA ACTIVA — móvil (expediente abierto)
// ─────────────────────────────────────────────────────────────
function DoctorActiveMobileInner() {
  return (
    <MMFrame>
      {/* nav */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '6px 18px 10px',
      }}>
        <button style={{
          height: 32, padding: '0 10px', borderRadius: 8, border: '1px solid var(--rule)',
          background: 'var(--white)', display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
          fontFamily: 'inherit', fontSize: 11.5, color: 'var(--ink-2)',
        }}>
          <MMIcon kind="arrow-l" size={13} color="var(--ink-2)" />
          Agenda
        </button>
        <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.08em' }}>
          CONSULTA · 00:14:28
        </span>
        <span style={{
          padding: '4px 9px', borderRadius: 999,
          background: 'var(--accent-soft)', color: 'var(--accent-deep)',
          fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: '0.06em',
        }}>EN VIVO</span>
      </div>

      <div style={{ flex: 1, padding: '0 18px 86px', overflow: 'auto' }}>
        {/* paciente header */}
        <div style={{ padding: '8px 0 10px', borderBottom: '1px solid var(--rule-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{
              width: 52, height: 52, borderRadius: 16,
              background: 'var(--accent)', color: '#fff',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--serif)', fontSize: 22,
            }}>MA</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span className="eyebrow" style={{ fontSize: 9.5 }}>EXPEDIENTE · VÍNCULO 4 D</span>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1, marginTop: 4 }}>
                María F. Arellano
              </h2>
              <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 3 }}>
                ♀ 34 · O+ · 64 kg · 1.62 m · CDMX
              </div>
            </div>
          </div>
        </div>

        {/* alergia banner */}
        <div style={{
          marginTop: 12, padding: '10px 12px',
          background: 'var(--alert-soft)', border: '1px solid var(--alert-rule)',
          borderRadius: 'var(--r-md)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 9, padding: '3px 7px', background: 'var(--alert)', color: '#fff', borderRadius: 999, letterSpacing: '0.12em' }}>ALERGIA SEVERA</span>
          <span style={{ fontSize: 11.5, color: 'var(--ink)' }}><strong>Penicilina</strong> · anafilaxia 2019</span>
        </div>

        {/* tabs */}
        <div style={{
          display: 'flex', gap: 6, marginTop: 12, padding: '4px 0',
          overflowX: 'auto', borderBottom: '1px solid var(--rule-2)',
        }}>
          {['Resumen', 'Dx', 'Meds', 'Cx', 'Labs', 'Notas'].map((t, i) => (
            <span key={t} style={{
              padding: '6px 11px', borderRadius: 999, whiteSpace: 'nowrap',
              border: '1px solid ' + (i === 0 ? 'var(--ink)' : 'var(--rule)'),
              background: i === 0 ? 'var(--ink)' : 'var(--white)',
              color: i === 0 ? 'var(--paper)' : 'var(--ink-2)',
              fontSize: 11, fontWeight: 500,
            }}>{t}</span>
          ))}
        </div>

        {/* expediente bento */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, marginTop: 14, background: 'var(--rule)', borderRadius: 'var(--r-md)', overflow: 'hidden', border: '1px solid var(--rule)' }}>
          {[
            ['Dx activos',  'Hipotiroidismo · migraña · SOP', '4'],
            ['Medicación',  'Levotiroxina 75µg · 06:30',       '3'],
            ['Cirugías',    'Apendicectomía · 2017',           '3'],
            ['Estudios',    'TSH 4.8 mU/L · BH micro',         '4'],
          ].map(([k, body, n]) => (
            <div key={k} style={{ background: 'var(--white)', padding: '11px 12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span className="eyebrow" style={{ fontSize: 9.5 }}>{k}</span>
                <span className="mono" style={{ fontSize: 10, color: 'var(--accent-deep)' }}>{n}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-2)', marginTop: 4, lineHeight: 1.4 }}>{body}</div>
            </div>
          ))}
        </div>

        {/* nota actual */}
        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
            <span className="eyebrow">Nota de hoy · autosave</span>
            <span className="mono" style={{ fontSize: 10, color: 'var(--ok)', letterSpacing: '0.06em' }}>
              <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: 99, background: 'var(--ok)', marginRight: 5, verticalAlign: 'middle' }} />
              guardado 2 s
            </span>
          </div>
          <div style={{
            background: 'var(--white)', border: '1px solid var(--rule)',
            borderRadius: 'var(--r-md)', padding: '12px 12px', minHeight: 110,
          }}>
            <div style={{ fontSize: 12, color: 'var(--ink)', lineHeight: 1.5 }}>
              Paciente refiere fatiga matutina persistente desde hace 3 semanas, sin asociación a esfuerzo.
              TSH actual <strong>4.8 mU/L</strong> (previo 3.2). Ajustar levotiroxina a 88 µg /día y …
            </div>
            <div style={{ marginTop: 8, height: 1, background: 'var(--rule-2)' }} />
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              {['+ Receta', '+ Estudio', '+ Diagnóstico'].map((t) => (
                <button key={t} style={{
                  height: 30, padding: '0 10px', borderRadius: 8,
                  border: '1px solid var(--rule)', background: 'var(--white)',
                  color: 'var(--ink-2)', cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 10.5, fontWeight: 500,
                }}>{t}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* finalizar — pinned */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '12px 18px 28px',
        background: 'rgba(241,250,254,0.95)', backdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--rule-2)',
        display: 'flex', gap: 8,
      }}>
        <button style={{
          width: 48, height: 48, borderRadius: 12,
          border: '1px solid var(--rule)', background: 'var(--white)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <MMIcon kind="pen" size={18} color="var(--ink-2)" />
        </button>
        <button style={{
          flex: 1, height: 48, borderRadius: 12, border: 0, cursor: 'pointer',
          background: 'var(--ink)', color: 'var(--paper)',
          fontFamily: 'inherit', fontSize: 14, fontWeight: 500,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          Finalizar consulta
          <MMIcon kind="arrow" size={14} color="var(--paper)" />
        </button>
      </div>
    </MMFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Wrap each screen in IOSDevice
// ─────────────────────────────────────────────────────────────
const wrapMM = (Inner, label, height = 844) => () => (
  <div data-screen-label={label}>
    <window.IOSDevice width={390} height={height} title="imedexp">
      <Inner />
    </window.IOSDevice>
  </div>
);

window.HomeMobileScreen        = wrapMM(HomeMobileInner,        'Home · móvil',                1980);
window.LoginMobileScreen       = wrapMM(LoginMobileInner,       'Login · móvil');
window.RegRoleMobileScreen     = wrapMM(RegRoleMobileInner,     'Registro tipo · móvil');
window.RegPatientMobileScreen  = wrapMM(RegPatientMobileInner,  'Registro paciente · móvil');
window.RegDoctorMobileScreen   = wrapMM(RegDoctorMobileInner,   'Registro médico · móvil');
window.RecoverMobileScreen     = wrapMM(RecoverMobileInner,     'Recuperar · móvil');
window.DashboardMobileScreen   = wrapMM(DashboardMobileInner,   'Dashboard médico · móvil');
window.DoctorActiveMobileScreen= wrapMM(DoctorActiveMobileInner,'Consulta activa · móvil');
