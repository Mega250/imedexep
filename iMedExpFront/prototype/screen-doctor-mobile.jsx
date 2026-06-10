// imedexp · Doctor mobile app — rediseño
// Reemplaza las 6 pantallas "AI-slop" (dark, vacías, "próximamente disponible")
// por la app real: contenido denso, accionable, en el lenguaje bento ocean.
//
// Cada pantalla: 390 × 844, dentro de un IOSDevice.

// ─────────────────────────────────────────────────────────────
// Icon set — mantengo el mismo estilo wireframe (1.6 stroke)
// ─────────────────────────────────────────────────────────────
const MIcon = ({ kind, size = 18, color = 'currentColor' }) => {
  const props = { fill: 'none', stroke: color, strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const svg = (c) => <svg width={size} height={size} viewBox="0 0 24 24" {...props}>{c}</svg>;
  switch (kind) {
    case 'home':     return svg(<><path d="M4 11 L12 4 L20 11" /><path d="M6 10 L6 20 L18 20 L18 10" /></>);
    case 'users':    return svg(<><circle cx="9" cy="9" r="3" /><path d="M3 19 C3 16 6 14 9 14 C12 14 15 16 15 19" /><circle cx="16" cy="8" r="2.5" /><path d="M14 14 C18 14 21 16 21 19" /></>);
    case 'cal':      return svg(<><rect x="3.5" y="5.5" width="17" height="15" rx="1.5" /><line x1="3.5" y1="10" x2="20.5" y2="10" /><line x1="8" y1="3" x2="8" y2="7" /><line x1="16" y1="3" x2="16" y2="7" /></>);
    case 'clip':     return svg(<><rect x="6" y="4" width="12" height="17" rx="2" /><rect x="9" y="2.5" width="6" height="3.5" rx="1" /><line x1="9" y1="11" x2="15" y2="11" /><line x1="9" y1="14.5" x2="15" y2="14.5" /><line x1="9" y1="18" x2="13" y2="18" /></>);
    case 'rx':       return svg(<><path d="M7 4 L7 14" /><path d="M7 4 L12 4 A3 3 0 0 1 12 10 L7 10" /><path d="M10 10 L17 17" /><path d="M14 14 L18 18" /></>);
    case 'shield':   return svg(<><path d="M12 3 L19 6 V12 C19 16 16 19 12 21 C8 19 5 16 5 12 V6 Z" /><path d="M9 12 L11 14 L15 10" /></>);
    case 'user':     return svg(<><circle cx="12" cy="8" r="3.5" /><path d="M4 21 C4 17 8 14 12 14 C16 14 20 17 20 21" /></>);
    case 'search':   return svg(<><circle cx="11" cy="11" r="6" /><line x1="15.5" y1="15.5" x2="20" y2="20" /></>);
    case 'arrow':    return svg(<><path d="M5 12 L19 12" /><path d="M14 7 L19 12 L14 17" /></>);
    case 'plus':     return svg(<><path d="M12 5 L12 19" /><path d="M5 12 L19 12" /></>);
    case 'sparkle':  return svg(<><path d="M12 4 L13 10 L19 12 L13 14 L12 20 L11 14 L5 12 L11 10 Z" /></>);
    case 'check':    return svg(<path d="M5 12 L10 17 L19 7" />);
    case 'pen':      return svg(<><path d="M4 20 L4 16 L16 4 L20 8 L8 20 Z" /><line x1="13" y1="7" x2="17" y2="11" /></>);
    case 'phone':    return svg(<path d="M5 4 L8 4 L10 9 L7.5 11 C8.5 13.5 10.5 15.5 13 16.5 L15 14 L20 16 L20 19 A2 2 0 0 1 18 21 C10.7 21 4 14.3 4 7 A2 2 0 0 1 5 4 Z" />);
    case 'mail':     return svg(<><rect x="3.5" y="5.5" width="17" height="13" rx="1.5" /><path d="M3.5 7 L12 13 L20.5 7" /></>);
    case 'pin':      return svg(<><path d="M12 3 C8.5 3 6 5.5 6 9 C6 14 12 21 12 21 C12 21 18 14 18 9 C18 5.5 15.5 3 12 3 Z" /><circle cx="12" cy="9" r="2.2" /></>);
    case 'edit':     return svg(<><path d="M4 20 L4 16 L16 4 L20 8 L8 20 Z" /></>);
    case 'logout':   return svg(<><path d="M10 4 L4 4 L4 20 L10 20" /><path d="M14 8 L18 12 L14 16" /><line x1="9" y1="12" x2="18" y2="12" /></>);
    case 'star':     return svg(<path d="M12 3 L14.5 9 L21 9.5 L16 13.5 L17.5 20 L12 16.5 L6.5 20 L8 13.5 L3 9.5 L9.5 9 Z" />);
    case 'pill':     return svg(<><rect x="3" y="9" width="18" height="6" rx="3" transform="rotate(-30 12 12)" /><line x1="9.5" y1="7.5" x2="14.5" y2="16.5" /></>);
    case 'doc':      return svg(<><path d="M6 3 L14 3 L18 7 L18 21 L6 21 Z" /><path d="M14 3 L14 7 L18 7" /><line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="15.5" x2="15" y2="15.5" /><line x1="9" y1="19" x2="13" y2="19" /></>);
    case 'qr':       return svg(<><rect x="4" y="4" width="6" height="6" /><rect x="14" y="4" width="6" height="6" /><rect x="4" y="14" width="6" height="6" /><rect x="14" y="14" width="2" height="2" /><rect x="18" y="14" width="2" height="2" /><rect x="14" y="18" width="2" height="2" /><rect x="18" y="18" width="2" height="2" /></>);
    case 'lab':      return svg(<><path d="M9 3 L9 9 L4 19 A2 2 0 0 0 6 21 L18 21 A2 2 0 0 0 20 19 L15 9 L15 3" /><line x1="8" y1="3" x2="16" y2="3" /><line x1="7" y1="14" x2="17" y2="14" /></>);
    case 'filter':   return svg(<path d="M3 5 L21 5 L14 13 L14 20 L10 18 L10 13 Z" />);
    case 'chev':     return svg(<path d="M9 6 L15 12 L9 18" />);
    case 'chev-l':   return svg(<path d="M15 6 L9 12 L15 18" />);
    case 'more':     return svg(<><circle cx="6" cy="12" r="1" fill={color} stroke="none" /><circle cx="12" cy="12" r="1" fill={color} stroke="none" /><circle cx="18" cy="12" r="1" fill={color} stroke="none" /></>);
    case 'download': return svg(<><path d="M12 4 L12 16" /><path d="M7 11 L12 16 L17 11" /><path d="M5 20 L19 20" /></>);
    case 'share':    return svg(<><circle cx="6" cy="12" r="2.2" /><circle cx="18" cy="6" r="2.2" /><circle cx="18" cy="18" r="2.2" /><line x1="8" y1="11" x2="16" y2="7" /><line x1="8" y1="13" x2="16" y2="17" /></>);
    case 'badge':    return svg(<><circle cx="12" cy="9" r="4" /><path d="M9 13 L8 21 L12 18 L16 21 L15 13" /></>);
    default:         return svg(<circle cx="12" cy="12" r="8" />);
  }
};

// ─────────────────────────────────────────────────────────────
// Mobile chrome — top bar y bottom nav, compartidos
// ─────────────────────────────────────────────────────────────
function MobTop({ title, sub, accent, right }) {
  return (
    <div style={{
      padding: '6px 22px 14px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
      borderBottom: '1px solid var(--rule-2)',
    }}>
      <div>
        <span className="eyebrow">{sub}</span>
        <h1 style={{
          fontFamily: 'var(--serif)', fontSize: 34, lineHeight: 1.0, fontWeight: 400,
          letterSpacing: '-0.02em', marginTop: 4,
        }}>
          {accent ? <>{title.split(' ')[0]}<br /><span style={{ color: 'var(--accent-deep)' }}>{title.split(' ').slice(1).join(' ')}</span></> : title}
        </h1>
      </div>
      {right}
    </div>
  );
}

const TABS = [
  ['home',   'Inicio'],
  ['users',  'Pacientes'],
  ['cal',    'Agenda'],
  ['clip',   'Consultas'],
  ['rx',     'Recetas'],
  ['shield', 'Validar'],
  ['user',   'Perfil'],
];

function MobTabBar({ active }) {
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      padding: '8px 6px 28px',
      background: 'rgba(241,250,254,0.92)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--rule-2)',
      display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
    }}>
      {TABS.map(([icon, label], i) => {
        const isActive = i === active;
        return (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '4px 0' }}>
            <span style={{
              width: 32, height: 32, borderRadius: 9,
              background: isActive ? 'var(--ink)' : 'transparent',
              color: isActive ? 'var(--paper)' : 'var(--ink-3)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <MIcon kind={icon} size={16} />
            </span>
            <span style={{
              fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.04em',
              color: isActive ? 'var(--ink)' : 'var(--ink-3)',
              fontWeight: isActive ? 500 : 400,
            }}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

function MobFrame({ children, active, fab }) {
  return (
    <div style={{
      width: 390, height: 844, background: 'var(--paper)',
      fontFamily: 'var(--sans)', color: 'var(--ink)',
      position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      {children}
      {fab}
      <MobTabBar active={active} />
    </div>
  );
}

// floating action button (sustituye los 2 blobs azules genéricos del AI-slop)
function MobFAB({ icon = 'plus', label, bottom = 110 }) {
  return (
    <button style={{
      position: 'absolute', right: 18, bottom,
      display: 'inline-flex', alignItems: 'center', gap: 8,
      height: 48, padding: label ? '0 18px 0 14px' : '0 14px',
      background: 'var(--ink)', color: 'var(--paper)',
      borderRadius: 999, border: 0, cursor: 'pointer',
      fontFamily: 'inherit', fontSize: 13.5, fontWeight: 500,
      boxShadow: '0 14px 30px -10px rgba(3,4,94,0.45), 0 0 0 1px rgba(255,255,255,0.04) inset',
      zIndex: 5,
    }}>
      <MIcon kind={icon} size={18} color="var(--paper)" />
      {label && <span>{label}</span>}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// 1 · MI PERFIL — sustituye al AI-slop con "Cirugía General" enorme
// ─────────────────────────────────────────────────────────────
function MProfile() {
  return (
    <MobFrame active={6}>
      <MobTop sub="Cuenta · imedexp" title="Mi perfil" right={
        <button style={{
          width: 36, height: 36, borderRadius: 10, border: '1px solid var(--rule)',
          background: 'var(--white)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}>
          <MIcon kind="edit" size={16} color="var(--ink-2)" />
        </button>
      } />

      <div style={{ flex: 1, overflow: 'auto', padding: '18px 22px 130px' }}>
        {/* Identidad / hero */}
        <div style={{
          background: 'var(--ink)', color: 'var(--paper)',
          borderRadius: 'var(--r-xl)', padding: '20px 20px 22px',
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 20px 40px -20px rgba(3,4,94,0.5)',
        }}>
          <div style={{
            position: 'absolute', width: 240, height: 240, borderRadius: 999,
            background: 'radial-gradient(circle, rgba(0,180,216,0.32) 0%, transparent 70%)',
            top: -80, right: -60, pointerEvents: 'none',
          }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{
              width: 64, height: 64, borderRadius: 18,
              background: 'var(--accent-bright)', color: 'var(--ink)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--serif)', fontSize: 30, fontWeight: 400,
            }}>DV</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Médico · cirujano</div>
              <div style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 4 }}>
                Dr. Damián Vega Ríos
              </div>
              <div className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
                céd. prof. <strong style={{ color: 'var(--paper)' }}>8 421 776</strong> · activo
              </div>
            </div>
          </div>
          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, marginTop: 18, borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: 14 }}>
            {[
              ['Pacientes', '142'],
              ['Consultas', '2 318'],
              ['Antigüedad', '6 a'],
            ].map(([k, v], i) => (
              <div key={k} style={{ borderRight: i < 2 ? '1px solid rgba(255,255,255,0.1)' : 0, paddingLeft: i === 0 ? 0 : 14 }}>
                <div className="mono" style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{k}</div>
                <div style={{ fontSize: 19, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 4 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Especialidad */}
        <div style={{ marginTop: 14, background: 'var(--paper-3)', border: '1px solid var(--accent-rule)', borderRadius: 'var(--r-lg)', padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="eyebrow">Especialidad</div>
              <div style={{ fontSize: 17, fontWeight: 500, marginTop: 4 }}>Cirugía general</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>
                sub-esp. cirugía hepatobiliar
              </div>
            </div>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em',
              padding: '4px 9px', borderRadius: 999,
              background: 'var(--accent-deep)', color: '#fff', textTransform: 'uppercase',
            }}>
              <MIcon kind="check" size={11} color="#fff" /> verificado
            </span>
          </div>
        </div>

        {/* Contacto */}
        <div style={{ marginTop: 14 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Contacto</div>
          <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
            {[
              ['mail',  'd.vega@imedexp.mx',     'verificado'],
              ['phone', '+52 55 4124 7782',      'móvil principal'],
              ['pin',   'Hospital Ángeles · piso 7 · cons. 712', 'CDMX'],
            ].map(([icon, val, sub], i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '34px 1fr auto', gap: 10, alignItems: 'center',
                padding: '12px 14px',
                borderBottom: i < 2 ? '1px solid var(--rule-2)' : 0,
              }}>
                <span style={{
                  width: 32, height: 32, borderRadius: 8, background: 'var(--paper-3)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <MIcon kind={icon} size={15} color="var(--accent-deep)" />
                </span>
                <div>
                  <div style={{ fontSize: 13.5 }}>{val}</div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 1 }}>{sub}</div>
                </div>
                <MIcon kind="chev" size={14} color="var(--ink-3)" />
              </div>
            ))}
          </div>
        </div>

        {/* Horarios + tarifa */}
        <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', padding: '12px 14px' }}>
            <div className="eyebrow">Atiende</div>
            <div style={{ fontSize: 13, marginTop: 6, lineHeight: 1.4 }}>
              <span className="mono">L–V</span> · 09:00–14:00<br />
              <span className="mono">S</span> · 09:00–13:00
            </div>
          </div>
          <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', padding: '12px 14px' }}>
            <div className="eyebrow">Consulta</div>
            <div style={{ fontSize: 17, fontWeight: 500, marginTop: 6, letterSpacing: '-0.01em' }}>
              $1 200 <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', fontWeight: 400 }}>MXN · 1ª</span>
            </div>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>seguimiento $800</div>
          </div>
        </div>

        {/* Acciones */}
        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 0, background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
          {[
            ['Mi firma electrónica', 'configurada · vigente 11 m', 'pen'],
            ['Plantillas clínicas', '12 plantillas · 4 favoritas', 'doc'],
            ['Notificaciones', 'push activas · email semanal', 'sparkle'],
            ['Privacidad y datos', 'NOM-024 · paciente al centro', 'shield'],
          ].map(([k, sub, icon], i) => (
            <div key={k} style={{
              display: 'grid', gridTemplateColumns: '24px 1fr auto', gap: 12, alignItems: 'center',
              padding: '13px 14px',
              borderBottom: i < 3 ? '1px solid var(--rule-2)' : 0,
              cursor: 'pointer',
            }}>
              <MIcon kind={icon} size={17} color="var(--ink-2)" />
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{k}</div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 1 }}>{sub}</div>
              </div>
              <MIcon kind="chev" size={13} color="var(--ink-3)" />
            </div>
          ))}
        </div>

        {/* Logout */}
        <button style={{
          marginTop: 16, width: '100%', height: 44,
          border: '1px solid var(--alert-rule)', background: 'var(--alert-soft)', color: 'var(--alert)',
          borderRadius: 'var(--r-md)', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 500, cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <MIcon kind="logout" size={15} color="var(--alert)" /> Cerrar sesión
        </button>

        <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', marginTop: 14, textAlign: 'center', letterSpacing: '0.04em' }}>
          imedexp · v 4.1.7 · sesión activa hace 12 min
        </div>
      </div>
    </MobFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// 2 · MIS PACIENTES — sustituye al search + 1 card vacía
// ─────────────────────────────────────────────────────────────
function MPatients() {
  const patients = [
    { name: 'María F. Arellano',   age: 34, sex: '♀', tag: 'tiroides · migraña', last: 'hace 4 m', flag: 'alergia', linked: true },
    { name: 'Carlos Mendoza Vela', age: 58, sex: '♂', tag: 'post-op vesícula',    last: 'hoy 09:00', linked: true, isToday: true },
    { name: 'Patricia Lozano',     age: 47, sex: '♀', tag: 'oncología',           last: 'hoy 09:45', linked: true, isToday: true },
    { name: 'José Luis Padilla',   age: 62, sex: '♂', tag: 'hernia inguinal',     last: 'hace 12 d', linked: true },
    { name: 'Ana Sofía Cortés',    age: 41, sex: '♀', tag: 'cólico biliar',       last: 'hace 3 sem', linked: true },
    { name: 'Damián Vega Ríos',    age: 38, sex: '♂', tag: 'cuenta propia',       last: 'auto', linked: true, self: true },
    { name: 'Luis Ramírez Téllez', age: 29, sex: '♂', tag: '1ª consulta',         last: 'sin vínculo', linked: false },
  ];
  return (
    <MobFrame active={1} fab={<MobFAB icon="qr" label="Vincular" />}>
      <MobTop sub="142 vinculados · 6 nuevos" title="Mis Pacientes" />

      <div style={{ padding: '14px 22px 0' }}>
        {/* search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          height: 44, padding: '0 14px',
          border: '1px solid var(--rule)', background: 'var(--white)', borderRadius: 'var(--r-md)',
        }}>
          <MIcon kind="search" size={16} color="var(--ink-3)" />
          <span style={{ fontSize: 13.5, color: 'var(--ink-3)', flex: 1 }}>Nombre, CURP, código…</span>
          <button style={{
            width: 28, height: 28, borderRadius: 8, border: '1px solid var(--rule)', background: 'var(--paper-3)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <MIcon kind="filter" size={13} color="var(--accent-deep)" />
          </button>
        </div>

        {/* chips */}
        <div style={{ display: 'flex', gap: 6, marginTop: 12, overflowX: 'auto' }}>
          {[['Todos', 142, true], ['Hoy', 5, false], ['Crónicos', 38, false], ['Post-op', 12, false], ['Recientes', 24, false]].map(([k, n, on]) => (
            <span key={k} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 11px', borderRadius: 999, whiteSpace: 'nowrap',
              border: '1px solid ' + (on ? 'var(--ink)' : 'var(--rule)'),
              background: on ? 'var(--ink)' : 'var(--white)',
              color: on ? 'var(--paper)' : 'var(--ink-2)',
              fontSize: 12, fontWeight: 500,
            }}>
              {k} <span className="mono" style={{ fontSize: 10, opacity: 0.65 }}>{n}</span>
            </span>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '14px 22px 130px' }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>Hoy · 5 consultas</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {patients.map((p, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '40px 1fr auto', gap: 12, alignItems: 'center',
              padding: '12px 14px',
              background: p.isToday ? 'var(--paper-3)' : 'var(--white)',
              border: '1px solid ' + (p.isToday ? 'var(--accent-rule)' : 'var(--rule)'),
              borderRadius: 'var(--r-md)',
            }}>
              <span style={{
                width: 40, height: 40, borderRadius: 12,
                background: p.self ? 'var(--ink)' : (p.isToday ? 'var(--accent-bright)' : 'var(--paper-4)'),
                color: p.self ? 'var(--paper)' : 'var(--ink)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 500,
              }}>{p.name.split(' ').map(s => s[0]).slice(0, 2).join('')}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{p.name}</span>
                  {p.flag && <span style={{ fontFamily: 'var(--mono)', fontSize: 9, padding: '2px 6px', borderRadius: 4, background: 'var(--alert-soft)', color: 'var(--alert)', letterSpacing: '0.08em' }}>!</span>}
                  {p.self && <span style={{ fontFamily: 'var(--mono)', fontSize: 9, padding: '2px 6px', borderRadius: 4, background: 'var(--ink)', color: 'var(--paper)', letterSpacing: '0.08em' }}>YO</span>}
                </div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>
                  {p.sex} {p.age}a · {p.tag} · {p.last}
                </div>
              </div>
              {p.linked
                ? <MIcon kind="chev" size={14} color="var(--ink-3)" />
                : <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, padding: '3px 7px', borderRadius: 4, background: 'var(--paper-3)', color: 'var(--accent-deep)', letterSpacing: '0.08em' }}>vincular</span>}
            </div>
          ))}
        </div>
        <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', textAlign: 'center', marginTop: 16, letterSpacing: '0.04em' }}>
          · 135 pacientes más en tu cartera ·
        </div>
      </div>
    </MobFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// 3 · AGENDA — sustituye al calendario mes que sólo dice "día libre"
// ─────────────────────────────────────────────────────────────
function MAgenda() {
  // semana actual con citas
  const week = [
    { dow: 'L',  d: 11, slots: 2 },
    { dow: 'M',  d: 12, slots: 4 },
    { dow: 'X',  d: 13, slots: 3 },
    { dow: 'J',  d: 14, slots: 5, today: true },
    { dow: 'V',  d: 15, slots: 6 },
    { dow: 'S',  d: 16, slots: 1 },
    { dow: 'D',  d: 17, slots: 0 },
  ];
  const slots = [
    { t: '08:30', kind: 'block', label: 'Pre-quirúrgico · revisión' },
    { t: '09:00', name: 'Carlos Mendoza Vela',   tag: 'Control · 6 m post-op', state: 'done' },
    { t: '09:45', name: 'Patricia Lozano',       tag: 'Oncología · seguimiento', state: 'done' },
    { t: '10:30', name: 'María F. Arellano',     tag: 'Primera consulta', state: 'next', mins: 14, room: 'Cons. 712' },
    { t: '11:15', name: 'José L. Padilla',       tag: 'Post-op · día 12',  state: 'queued', virtual: true },
    { t: '12:00', name: 'Ana Sofía Cortés',      tag: 'Control · crónico',  state: 'queued' },
    { t: '13:30', kind: 'free',  label: 'almuerzo' },
    { t: '14:00', name: 'Luis Ramírez Téllez',   tag: 'Primera consulta',   state: 'queued' },
  ];

  return (
    <MobFrame active={2} fab={<MobFAB icon="plus" label="Nueva cita" />}>
      <MobTop sub="Jueves · 14 mayo" title="Mi Agenda" right={
        <button style={{
          height: 32, padding: '0 12px', borderRadius: 999, border: '1px solid var(--rule)',
          background: 'var(--white)', fontFamily: 'inherit', fontSize: 12, fontWeight: 500,
          color: 'var(--ink-2)', cursor: 'pointer',
        }}>Hoy</button>
      } />

      {/* week strip */}
      <div style={{ padding: '14px 22px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button style={{ width: 26, height: 26, borderRadius: 7, border: '1px solid var(--rule)', background: 'var(--white)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <MIcon kind="chev-l" size={12} color="var(--ink-2)" />
            </button>
            <span style={{ fontSize: 13, fontWeight: 500 }}>Mayo 2026 · sem. 20</span>
            <button style={{ width: 26, height: 26, borderRadius: 7, border: '1px solid var(--rule)', background: 'var(--white)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <MIcon kind="chev" size={12} color="var(--ink-2)" />
            </button>
          </div>
          <div style={{ display: 'flex', background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 8, padding: 2 }}>
            {['Día', 'Sem', 'Mes'].map((v, i) => (
              <span key={v} style={{
                padding: '4px 10px', borderRadius: 6,
                background: i === 0 ? 'var(--ink)' : 'transparent',
                color: i === 0 ? 'var(--paper)' : 'var(--ink-3)',
                fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>{v}</span>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5 }}>
          {week.map((w, i) => (
            <div key={i} style={{
              padding: '10px 0 8px', borderRadius: 'var(--r-md)',
              background: w.today ? 'var(--ink)' : 'var(--white)',
              color: w.today ? 'var(--paper)' : 'var(--ink)',
              border: w.today ? '1px solid var(--ink)' : '1px solid var(--rule)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            }}>
              <span className="mono" style={{ fontSize: 9.5, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: w.today ? 0.7 : 0.6 }}>{w.dow}</span>
              <span style={{ fontSize: 17, fontWeight: 500, letterSpacing: '-0.02em' }}>{w.d}</span>
              <div style={{ display: 'flex', gap: 2 }}>
                {w.slots > 0 ? Array.from({ length: Math.min(w.slots, 4) }).map((_, j) => (
                  <span key={j} style={{ width: 3, height: 3, borderRadius: 99, background: w.today ? 'var(--accent-bright)' : 'var(--accent)' }} />
                )) : <span style={{ width: 14, height: 1, background: w.today ? 'rgba(255,255,255,0.2)' : 'var(--rule)' }} />}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '18px 22px 130px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h2 style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em' }}>Hoy · 14 mayo</h2>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>5 confirmadas · 2 hechas</span>
        </div>

        <div style={{ marginTop: 14, position: 'relative' }}>
          {/* timeline rail */}
          <div style={{ position: 'absolute', left: 36, top: 8, bottom: 8, width: 1, background: 'var(--rule)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {slots.map((s, i) => {
              if (s.kind === 'free' || s.kind === 'block') {
                return (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: 12, alignItems: 'center' }}>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{s.t}</span>
                    <div style={{
                      padding: '10px 14px', borderRadius: 'var(--r-md)',
                      border: '1px dashed var(--rule)', background: 'transparent',
                      fontSize: 12, color: 'var(--ink-3)', fontStyle: 'italic',
                    }}>— {s.label} —</div>
                  </div>
                );
              }
              const isNext = s.state === 'next';
              const isDone = s.state === 'done';
              return (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ paddingTop: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--ink-2)', fontWeight: 500 }}>{s.t}</span>
                  </div>
                  <div style={{
                    position: 'relative',
                    padding: '12px 14px',
                    borderRadius: 'var(--r-md)',
                    background: isNext ? 'var(--ink)' : 'var(--white)',
                    color: isNext ? 'var(--paper)' : 'var(--ink)',
                    border: '1px solid ' + (isNext ? 'var(--ink)' : 'var(--rule)'),
                    opacity: isDone ? 0.55 : 1,
                  }}>
                    {/* dot in rail */}
                    <span style={{
                      position: 'absolute', left: -16, top: 18, width: 8, height: 8, borderRadius: 99,
                      background: isNext ? 'var(--accent-bright)' : (isDone ? 'var(--ok)' : 'var(--ink-3)'),
                      border: '2px solid var(--paper)',
                    }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, textDecoration: isDone ? 'line-through' : 'none' }}>{s.name}</div>
                        <div className="mono" style={{ fontSize: 10.5, color: isNext ? 'rgba(255,255,255,0.6)' : 'var(--ink-3)', marginTop: 2 }}>
                          {s.tag}{s.room ? ' · ' + s.room : ''}{s.virtual ? ' · video' : ''}
                        </div>
                      </div>
                      {isNext && (
                        <span style={{
                          fontFamily: 'var(--mono)', fontSize: 10, padding: '3px 8px', borderRadius: 999,
                          background: 'var(--accent-bright)', color: 'var(--ink)', letterSpacing: '0.06em', whiteSpace: 'nowrap',
                        }}>en {s.mins} min</span>
                      )}
                      {isDone && <MIcon kind="check" size={13} color="var(--ok)" />}
                    </div>
                    {isNext && (
                      <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                        <button className="btn sm invert" style={{ height: 30, fontSize: 11.5, padding: '0 12px' }}>Empezar consulta</button>
                        <button className="btn sm dark-ghost" style={{ height: 30, fontSize: 11.5, padding: '0 12px' }}>Expediente</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </MobFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// 4 · CONSULTAS — sustituye al "Sin consultas registradas"
// ─────────────────────────────────────────────────────────────
function MConsultas() {
  const consultas = [
    { date: 'Hoy', items: [
      { t: '09:45', name: 'Patricia Lozano', dx: 'Cáncer mama · seguimiento adyuvancia', tag: ['receta', 'lab'], min: 32 },
      { t: '09:00', name: 'Carlos Mendoza Vela', dx: 'Post-op colecistectomía · 6 m', tag: ['nota'], min: 18 },
    ]},
    { date: 'Ayer · 13 may', items: [
      { t: '14:30', name: 'Sofía Hernández', dx: 'Dolor abdominal RIQ · sospecha cólico biliar', tag: ['receta', 'estudio'], min: 28 },
      { t: '12:15', name: 'Roberto Aguilar', dx: 'Hernia inguinal derecha · pre-quirúrgico', tag: ['estudio'], min: 24 },
      { t: '10:00', name: 'Elena Castaño', dx: 'Control · gastritis crónica', tag: ['receta'], min: 16 },
    ]},
    { date: 'Lunes · 11 may', items: [
      { t: '17:30', name: 'Diego Salinas', dx: 'Cierre quirúrgico · revisión sutura', tag: ['alta'], min: 12 },
    ]},
  ];

  return (
    <MobFrame active={3} fab={<MobFAB icon="plus" label="Nueva consulta" />}>
      <MobTop sub="Tu práctica esta semana" title="Mis Consultas" />

      {/* stats */}
      <div style={{ padding: '14px 22px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 8 }}>
          <div style={{
            background: 'var(--ink)', color: 'var(--paper)', borderRadius: 'var(--r-lg)',
            padding: '12px 14px', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', width: 140, height: 140, borderRadius: 999,
              background: 'radial-gradient(circle, rgba(0,180,216,0.32) 0%, transparent 70%)',
              top: -60, right: -50, pointerEvents: 'none',
            }} />
            <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.55)' }}>Hoy</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6, position: 'relative' }}>
              <span style={{ fontSize: 32, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1 }}>5</span>
              <span className="mono" style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.55)' }}>· 2 hechas</span>
            </div>
            <div className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 6, letterSpacing: '0.08em' }}>
              prox. <strong style={{ color: 'var(--accent-bright)' }}>10:30</strong> · M. Arellano
            </div>
          </div>
          <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', padding: '12px 14px' }}>
            <div className="eyebrow">Semana</div>
            <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.03em', marginTop: 6, lineHeight: 1 }}>42</div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--ok)', marginTop: 6, letterSpacing: '0.04em' }}>+12% vs ant.</div>
          </div>
          <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', padding: '12px 14px' }}>
            <div className="eyebrow">Total</div>
            <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.03em', marginTop: 6, lineHeight: 1 }}>2 318</div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 6, letterSpacing: '0.04em' }}>en 6 años</div>
          </div>
        </div>

        {/* filter chips */}
        <div style={{ display: 'flex', gap: 6, marginTop: 14, overflowX: 'auto' }}>
          {[['Todas', true], ['Hoy', false], ['Con receta', false], ['Pendientes', false], ['Post-op', false]].map(([k, on]) => (
            <span key={k} style={{
              padding: '6px 11px', borderRadius: 999, whiteSpace: 'nowrap',
              border: '1px solid ' + (on ? 'var(--ink)' : 'var(--rule)'),
              background: on ? 'var(--ink)' : 'var(--white)',
              color: on ? 'var(--paper)' : 'var(--ink-2)',
              fontSize: 12, fontWeight: 500,
            }}>{k}</span>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '14px 22px 130px' }}>
        {consultas.map((group, gi) => (
          <div key={gi} style={{ marginBottom: 16 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>{group.date}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {group.items.map((c, i) => (
                <div key={i} style={{
                  background: 'var(--white)', border: '1px solid var(--rule)',
                  borderRadius: 'var(--r-md)', padding: '12px 14px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-2)', fontWeight: 500 }}>{c.t}</span>
                        <span style={{ width: 3, height: 3, borderRadius: 99, background: 'var(--ink-4)' }} />
                        <span style={{ fontSize: 13.5, fontWeight: 500 }}>{c.name}</span>
                      </div>
                      <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 4, lineHeight: 1.35 }}>{c.dx}</div>
                    </div>
                    <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>{c.min} min</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'center' }}>
                    {c.tag.map(t => (
                      <span key={t} style={{
                        fontFamily: 'var(--mono)', fontSize: 9.5, padding: '3px 7px', borderRadius: 4,
                        background: t === 'receta' ? 'var(--paper-3)' : t === 'alta' ? 'rgba(28,140,90,0.12)' : 'var(--paper-2)',
                        color: t === 'receta' ? 'var(--accent-deep)' : t === 'alta' ? 'var(--ok)' : 'var(--ink-2)',
                        letterSpacing: '0.08em', textTransform: 'uppercase',
                      }}>{t}</span>
                    ))}
                    <span style={{ flex: 1 }} />
                    <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>Ver nota ›</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </MobFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// 5 · RECETAS — sustituye al "Sin consultas"
// ─────────────────────────────────────────────────────────────
function MRecetas() {
  const recetas = [
    { date: 'Hoy · 09:45', patient: 'Patricia Lozano', folio: 'RX·2026·05·1142', drugs: [
      { name: 'Tamoxifeno', dose: '20 mg', freq: '1× día · 30 d' },
      { name: 'Ondansetrón', dose: '8 mg', freq: '8 h PRN · 5 d' },
    ], status: 'firmada', valid: 'Vigente 28 d' },
    { date: 'Hoy · 09:00', patient: 'Carlos Mendoza V.', folio: 'RX·2026·05·1141', drugs: [
      { name: 'Omeprazol', dose: '40 mg', freq: '1× día · 30 d' },
    ], status: 'firmada', valid: 'Vigente 28 d' },
    { date: 'Ayer · 14:30', patient: 'Sofía Hernández', folio: 'RX·2026·05·1138', drugs: [
      { name: 'Hioscina', dose: '10 mg', freq: '8 h PRN · 7 d' },
      { name: 'Paracetamol', dose: '500 mg', freq: '8 h PRN · 5 d' },
      { name: 'Esomeprazol', dose: '20 mg', freq: '1× día · 15 d' },
    ], status: 'descargada', valid: 'Vigente 27 d' },
    { date: 'Lun · 11 may', patient: 'Elena Castaño', folio: 'RX·2026·05·1129', drugs: [
      { name: 'Sucralfato', dose: '1 g', freq: '6 h · 21 d' },
    ], status: 'firmada', valid: 'Vence en 22 d' },
  ];
  return (
    <MobFrame active={4} fab={<MobFAB icon="plus" label="Nueva receta" />}>
      <MobTop sub="Firma electrónica activa" title="Mis Recetas" right={
        <button style={{
          width: 36, height: 36, borderRadius: 10, border: '1px solid var(--rule)',
          background: 'var(--white)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <MIcon kind="search" size={15} color="var(--ink-2)" />
        </button>
      } />

      <div style={{ padding: '14px 22px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[
            ['Hoy', '4', 'recetas'],
            ['Semana', '38', '+9 PRN'],
            ['Mes', '147', 'firmadas'],
          ].map(([k, n, s], i) => (
            <div key={i} style={{
              background: i === 0 ? 'var(--paper-3)' : 'var(--white)',
              border: '1px solid ' + (i === 0 ? 'var(--accent-rule)' : 'var(--rule)'),
              borderRadius: 'var(--r-lg)', padding: '12px 12px',
            }}>
              <div className="eyebrow">{k}</div>
              <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.03em', marginTop: 4, lineHeight: 1 }}>{n}</div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 4 }}>{s}</div>
            </div>
          ))}
        </div>

        {/* template shortcuts */}
        <div className="eyebrow" style={{ marginTop: 16, marginBottom: 8 }}>Plantillas frecuentes</div>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          {[
            ['Post-op colecistectomía', '4 fármacos'],
            ['Cólico biliar', '3 fármacos'],
            ['Pre-quirúrgico cir. mayor', '2 fármacos'],
            ['Gastritis crónica', '2 fármacos'],
          ].map(([k, sub], i) => (
            <div key={i} style={{
              background: 'var(--white)', border: '1px solid var(--rule)',
              borderRadius: 'var(--r-md)', padding: '9px 12px', minWidth: 170,
            }}>
              <div style={{ fontSize: 12, fontWeight: 500 }}>{k}</div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 2 }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '14px 22px 130px' }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Recientes</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {recetas.map((r, i) => (
            <div key={i} style={{
              background: 'var(--white)', border: '1px solid var(--rule)',
              borderRadius: 'var(--r-md)', padding: '12px 14px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 500 }}>{r.patient}</div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 2, letterSpacing: '0.04em' }}>{r.folio} · {r.date}</div>
                </div>
                <span style={{
                  fontFamily: 'var(--mono)', fontSize: 9.5, padding: '3px 8px', borderRadius: 999,
                  background: r.status === 'firmada' ? 'var(--paper-3)' : 'var(--paper-2)',
                  color: r.status === 'firmada' ? 'var(--accent-deep)' : 'var(--ink-2)',
                  letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap',
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                }}>
                  {r.status === 'firmada' && <MIcon kind="check" size={10} color="var(--accent-deep)" />}
                  {r.status}
                </span>
              </div>
              <div style={{ marginTop: 8, borderTop: '1px solid var(--rule-2)', paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {r.drugs.map((d, j) => (
                  <div key={j} style={{ display: 'grid', gridTemplateColumns: '14px 1fr auto', gap: 8, alignItems: 'center' }}>
                    <MIcon kind="pill" size={12} color="var(--ink-3)" />
                    <span style={{ fontSize: 12.5 }}>
                      <strong style={{ fontWeight: 500 }}>{d.name}</strong> <span className="mono" style={{ color: 'var(--ink-3)', fontSize: 11 }}>{d.dose}</span>
                    </span>
                    <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>{d.freq}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10, display: 'flex', gap: 6, alignItems: 'center' }}>
                <button style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4, height: 26, padding: '0 9px',
                  borderRadius: 6, border: '1px solid var(--rule)', background: 'var(--white)',
                  fontFamily: 'inherit', fontSize: 11, color: 'var(--ink-2)', cursor: 'pointer',
                }}><MIcon kind="download" size={11} /> PDF</button>
                <button style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4, height: 26, padding: '0 9px',
                  borderRadius: 6, border: '1px solid var(--rule)', background: 'var(--white)',
                  fontFamily: 'inherit', fontSize: 11, color: 'var(--ink-2)', cursor: 'pointer',
                }}><MIcon kind="share" size={11} /> Enviar</button>
                <span style={{ flex: 1 }} />
                <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{r.valid}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MobFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// 6 · VALIDACIONES — sustituye al modal "próximamente disponible"
// Diseño nuevo: certificados médicos digitales (incapacidad, alta,
// constancia, dictamen) + cola de validaciones de docs externos.
// ─────────────────────────────────────────────────────────────
function MValidaciones() {
  const certTypes = [
    { kind: 'incapacidad', label: 'Incapacidad', sub: 'IMSS / ISSSTE / privado', icon: 'doc',   freq: '42 emitidas · este año' },
    { kind: 'alta',        label: 'Alta médica',  sub: 'Post-quirúrgica · valoración', icon: 'check', freq: '88 emitidas' },
    { kind: 'constancia',  label: 'Constancia',   sub: 'Asistencia · aptitud',         icon: 'badge', freq: '17 emitidas' },
    { kind: 'dictamen',    label: 'Dictamen',     sub: 'Pericial · pre-operatorio',    icon: 'pen',   freq: '6 emitidos' },
  ];
  const queue = [
    { patient: 'María F. Arellano', kind: 'USG tiroides', source: 'Lab Carpermor · 12 may', state: 'pending' },
    { patient: 'José L. Padilla',   kind: 'BH + química 24', source: 'Chopo · 13 may',     state: 'pending' },
    { patient: 'Ana S. Cortés',     kind: 'TAC abdominal',     source: 'Médica Sur · 11 may', state: 'flagged' },
  ];
  const recent = [
    { name: 'Carlos Mendoza V.', type: 'Alta médica',  date: 'hoy 09:30',  folio: 'AM-2026-0421' },
    { name: 'Roberto Aguilar',   type: 'Incapacidad 7 d', date: 'ayer',    folio: 'IN-2026-0419' },
    { name: 'Elena Castaño',     type: 'Constancia',  date: '12 may',     folio: 'CN-2026-0418' },
  ];

  return (
    <MobFrame active={5} fab={<MobFAB icon="pen" label="Emitir" />}>
      <MobTop sub="Firma electrónica · NOM-024" title="Validaciones" right={
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em',
          padding: '5px 10px', borderRadius: 999,
          background: 'var(--paper-3)', color: 'var(--accent-deep)', textTransform: 'uppercase',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--ok)' }} /> firma activa
        </span>
      } />

      <div style={{ flex: 1, overflow: 'auto', padding: '16px 22px 130px' }}>
        {/* hero: pending */}
        <div style={{
          background: 'var(--ink)', color: 'var(--paper)',
          borderRadius: 'var(--r-xl)', padding: '18px 18px 18px',
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 20px 40px -20px rgba(3,4,94,0.5)',
        }}>
          <div style={{
            position: 'absolute', width: 220, height: 220, borderRadius: 999,
            background: 'radial-gradient(circle, rgba(0,180,216,0.30) 0%, transparent 70%)',
            top: -70, right: -50,
          }} />
          <div style={{ position: 'relative' }}>
            <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Pendiente de tu firma · 3</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 32, lineHeight: 1, fontWeight: 400, letterSpacing: '-0.02em', marginTop: 8 }}>
              3 documentos<br />en espera
            </div>
            <div className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 8, letterSpacing: '0.04em' }}>
              el más antiguo · hace 26 min
            </div>
            <button style={{
              marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 8,
              height: 38, padding: '0 16px', borderRadius: 'var(--r-md)',
              background: 'var(--accent-bright)', color: 'var(--ink)',
              border: 0, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>
              Validar ahora <MIcon kind="arrow" size={14} color="var(--ink)" />
            </button>
          </div>
        </div>

        {/* cola */}
        <div className="eyebrow" style={{ marginTop: 18, marginBottom: 8 }}>Cola de validación</div>
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
          {queue.map((q, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '36px 1fr auto', gap: 12, alignItems: 'center',
              padding: '12px 14px',
              borderBottom: i < queue.length - 1 ? '1px solid var(--rule-2)' : 0,
            }}>
              <span style={{
                width: 34, height: 34, borderRadius: 10, background: 'var(--paper-3)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <MIcon kind={q.kind.includes('USG') || q.kind.includes('TAC') ? 'doc' : 'lab'} size={16} color="var(--accent-deep)" />
              </span>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{q.kind}</div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>
                  {q.patient} · {q.source}
                </div>
              </div>
              {q.state === 'flagged'
                ? <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, padding: '3px 7px', borderRadius: 4, background: 'var(--alert-soft)', color: 'var(--alert)', letterSpacing: '0.08em' }}>REVISAR</span>
                : <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, padding: '3px 7px', borderRadius: 4, background: 'var(--paper-3)', color: 'var(--accent-deep)', letterSpacing: '0.08em' }}>FIRMAR</span>}
            </div>
          ))}
        </div>

        {/* emitir certificado */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 18, marginBottom: 8 }}>
          <span className="eyebrow">Emitir certificado</span>
          <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>4 plantillas</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {certTypes.map((c, i) => (
            <button key={i} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6,
              padding: '13px 14px', minHeight: 96,
              background: 'var(--white)', border: '1px solid var(--rule)',
              borderRadius: 'var(--r-lg)', textAlign: 'left',
              fontFamily: 'inherit', cursor: 'pointer',
            }}>
              <span style={{
                width: 32, height: 32, borderRadius: 9, background: 'var(--paper-3)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <MIcon kind={c.icon} size={16} color="var(--accent-deep)" />
              </span>
              <div style={{ fontSize: 13.5, fontWeight: 500, lineHeight: 1.2 }}>{c.label}</div>
              <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: '0.04em', lineHeight: 1.3 }}>
                {c.sub}<br />{c.freq}
              </div>
            </button>
          ))}
        </div>

        {/* recientes emitidos */}
        <div className="eyebrow" style={{ marginTop: 18, marginBottom: 8 }}>Emitidos recientemente</div>
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
          {recent.map((r, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, alignItems: 'center',
              padding: '11px 14px',
              borderBottom: i < recent.length - 1 ? '1px solid var(--rule-2)' : 0,
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{r.type} · {r.name}</div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 2, letterSpacing: '0.04em' }}>
                  {r.folio} · {r.date}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--rule)', background: 'var(--white)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <MIcon kind="download" size={12} color="var(--ink-2)" />
                </button>
                <button style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--rule)', background: 'var(--white)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <MIcon kind="share" size={12} color="var(--ink-2)" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MobFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Compose — cada pantalla con su IOSDevice
// ─────────────────────────────────────────────────────────────
function MobProfileScreen()     { return <div data-screen-label="Doctor móvil · perfil">       <IOSDevice width={390} height={844} title="imedexp"><MProfile /></IOSDevice></div>; }
function MobPatientsScreen()    { return <div data-screen-label="Doctor móvil · pacientes">    <IOSDevice width={390} height={844} title="imedexp"><MPatients /></IOSDevice></div>; }
function MobAgendaScreen()      { return <div data-screen-label="Doctor móvil · agenda">       <IOSDevice width={390} height={844} title="imedexp"><MAgenda /></IOSDevice></div>; }
function MobConsultasScreen()   { return <div data-screen-label="Doctor móvil · consultas">    <IOSDevice width={390} height={844} title="imedexp"><MConsultas /></IOSDevice></div>; }
function MobRecetasScreen()     { return <div data-screen-label="Doctor móvil · recetas">      <IOSDevice width={390} height={844} title="imedexp"><MRecetas /></IOSDevice></div>; }
function MobValidacionesScreen(){ return <div data-screen-label="Doctor móvil · validaciones"> <IOSDevice width={390} height={844} title="imedexp"><MValidaciones /></IOSDevice></div>; }

Object.assign(window, {
  MobProfileScreen, MobPatientsScreen, MobAgendaScreen,
  MobConsultasScreen, MobRecetasScreen, MobValidacionesScreen,
});
