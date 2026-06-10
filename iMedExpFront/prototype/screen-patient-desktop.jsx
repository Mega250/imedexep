// imedexp · App del paciente (PC) — 13 pantallas, 1440 px
// Mismo lenguaje del móvil: paper, navy hero, bento. Sidebar de 5 ítems
// (Inicio · Historial · Citas · Meds · Perfil) y, dentro de Historial,
// sub-nav horizontal con las 10 categorías.

// ─────────────────────────────────────────────────────────────
// Icon set — versión desktop (PDIcon)
// ─────────────────────────────────────────────────────────────
const PDIcon = ({ kind, size = 18, color = 'currentColor' }) => {
  const p = { fill: 'none', stroke: color, strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const svg = (c) => <svg width={size} height={size} viewBox="0 0 24 24" {...p}>{c}</svg>;
  switch (kind) {
    case 'home':   return svg(<><path d="M4 11 L12 4 L20 11" /><path d="M6 10 L6 20 L18 20 L18 10" /></>);
    case 'folder': return svg(<path d="M3 7 A1.5 1.5 0 0 1 4.5 5.5 L9 5.5 L11 7.5 L19.5 7.5 A1.5 1.5 0 0 1 21 9 L21 18 A1.5 1.5 0 0 1 19.5 19.5 L4.5 19.5 A1.5 1.5 0 0 1 3 18 Z" />);
    case 'cal':    return svg(<><rect x="3.5" y="5.5" width="17" height="15" rx="1.5" /><line x1="3.5" y1="10" x2="20.5" y2="10" /><line x1="8" y1="3" x2="8" y2="7" /><line x1="16" y1="3" x2="16" y2="7" /></>);
    case 'pill':   return svg(<><rect x="3" y="9" width="18" height="6" rx="3" transform="rotate(-30 12 12)" /><line x1="9.5" y1="7.5" x2="14.5" y2="16.5" /></>);
    case 'user':   return svg(<><circle cx="12" cy="8" r="3.5" /><path d="M4 21 C4 17 8 14 12 14 C16 14 20 17 20 21" /></>);
    case 'share':  return svg(<><circle cx="6" cy="12" r="2.2" /><circle cx="18" cy="6" r="2.2" /><circle cx="18" cy="18" r="2.2" /><line x1="8" y1="11" x2="16" y2="7" /><line x1="8" y1="13" x2="16" y2="17" /></>);
    case 'plus':   return svg(<><path d="M12 5 L12 19" /><path d="M5 12 L19 12" /></>);
    case 'chev':   return svg(<path d="M9 6 L15 12 L9 18" />);
    case 'chev-l': return svg(<path d="M15 6 L9 12 L15 18" />);
    case 'check':  return svg(<path d="M5 12 L10 17 L19 7" />);
    case 'alert':  return svg(<><path d="M12 3 L22 20 L2 20 Z" /><line x1="12" y1="9" x2="12" y2="14" /><line x1="12" y1="17" x2="12" y2="17.5" /></>);
    case 'heart':  return svg(<path d="M12 20 L4 12 A4.5 4.5 0 0 1 12 7 A4.5 4.5 0 0 1 20 12 Z" />);
    case 'lung':   return svg(<><path d="M12 4 L12 14" /><path d="M12 8 C12 12 9 16 6 18 C5 17 4 14 4 11 C4 8 6 6 7 6 C8 6 9 7 9 8" /><path d="M12 8 C12 12 15 16 18 18 C19 17 20 14 20 11 C20 8 18 6 17 6 C16 6 15 7 15 8" /></>);
    case 'drop':   return svg(<path d="M12 3 C9 8 6 12 6 15 A6 6 0 0 0 18 15 C18 12 15 8 12 3 Z" />);
    case 'scale':  return svg(<><rect x="4" y="6" width="16" height="14" rx="2" /><path d="M9 11 L15 11" /><circle cx="12" cy="14" r="1.5" /></>);
    case 'spark':  return svg(<path d="M12 4 L13 10 L19 12 L13 14 L12 20 L11 14 L5 12 L11 10 Z" />);
    case 'qr':     return svg(<><rect x="4" y="4" width="6" height="6" /><rect x="14" y="4" width="6" height="6" /><rect x="4" y="14" width="6" height="6" /><rect x="14" y="14" width="2" height="2" /><rect x="18" y="14" width="2" height="2" /><rect x="14" y="18" width="2" height="2" /><rect x="18" y="18" width="2" height="2" /></>);
    case 'doc':    return svg(<><path d="M6 3 L14 3 L18 7 L18 21 L6 21 Z" /><path d="M14 3 L14 7 L18 7" /><line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="15.5" x2="15" y2="15.5" /></>);
    case 'vax':    return svg(<><path d="M14 4 L20 10" /><path d="M9 9 L15 15" /><path d="M16 6 L19 9" /><path d="M3 21 L8 16 L8 14 L10 12 L14 16 L12 18 L10 18 L5 23 Z" transform="translate(0,-2)" /></>);
    case 'cut':    return svg(<><circle cx="6" cy="6" r="2.5" /><circle cx="6" cy="18" r="2.5" /><line x1="8" y1="7.5" x2="20" y2="17" /><line x1="8" y1="16.5" x2="20" y2="7" /></>);
    case 'tree':   return svg(<><circle cx="12" cy="5" r="2" /><circle cx="6" cy="12" r="2" /><circle cx="18" cy="12" r="2" /><circle cx="9" cy="19" r="1.8" /><circle cx="15" cy="19" r="1.8" /><line x1="12" y1="7" x2="12" y2="10" /><line x1="12" y1="10" x2="6" y2="10" /><line x1="12" y1="10" x2="18" y2="10" /><line x1="6" y1="14" x2="9" y2="17" /><line x1="18" y1="14" x2="15" y2="17" /></>);
    case 'edit':   return svg(<path d="M4 20 L4 16 L16 4 L20 8 L8 20 Z" />);
    case 'download': return svg(<><path d="M12 4 L12 16" /><path d="M7 11 L12 16 L17 11" /><path d="M5 20 L19 20" /></>);
    case 'mail':   return svg(<><rect x="3.5" y="5.5" width="17" height="13" rx="1.5" /><path d="M3.5 7 L12 13 L20.5 7" /></>);
    case 'phone':  return svg(<path d="M5 4 L8 4 L10 9 L7.5 11 C8.5 13.5 10.5 15.5 13 16.5 L15 14 L20 16 L20 19 A2 2 0 0 1 18 21 C10.7 21 4 14.3 4 7 A2 2 0 0 1 5 4 Z" />);
    case 'logout': return svg(<><path d="M10 4 L4 4 L4 20 L10 20" /><path d="M14 8 L18 12 L14 16" /><line x1="9" y1="12" x2="18" y2="12" /></>);
    case 'sun':    return svg(<><circle cx="12" cy="12" r="4" /><path d="M12 2 L12 4 M12 20 L12 22 M2 12 L4 12 M20 12 L22 12 M4.5 4.5 L6 6 M18 18 L19.5 19.5 M4.5 19.5 L6 18 M18 6 L19.5 4.5" /></>);
    case 'flame':  return svg(<path d="M12 3 C13 8 17 9 17 14 A5 5 0 0 1 7 14 C7 11 9 11 9 8 C10 9 10 10 11 10 C11 7 12 5 12 3 Z" />);
    case 'pin':    return svg(<><path d="M12 3 C8.5 3 6 5.5 6 9 C6 14 12 21 12 21 C12 21 18 14 18 9 C18 5.5 15.5 3 12 3 Z" /><circle cx="12" cy="9" r="2.2" /></>);
    case 'bell':   return svg(<><path d="M6 17 L18 17 L17 15.5 L17 11 A5 5 0 0 0 7 11 L7 15.5 Z" /><path d="M10 17 A2 2 0 0 0 14 17" /></>);
    case 'search': return svg(<><circle cx="11" cy="11" r="6" /><line x1="15.5" y1="15.5" x2="20" y2="20" /></>);
    case 'arrow':  return svg(<><path d="M5 12 L19 12" /><path d="M14 7 L19 12 L14 17" /></>);
    case 'clock':  return svg(<><circle cx="12" cy="12" r="8" /><path d="M12 7 L12 12 L15 14" /></>);
    default:       return svg(<circle cx="12" cy="12" r="8" />);
  }
};

// ─────────────────────────────────────────────────────────────
// Shell — sidebar 5 ítems + topbar + sub-chips para Historial
// ─────────────────────────────────────────────────────────────
const PNAV = [
  ['home',   'Inicio'],
  ['folder', 'Historial clínico'],
  ['cal',    'Mis citas'],
  ['pill',   'Medicamentos'],
  ['user',   'Mi perfil'],
];

function PSidebar({ active }) {
  const counts = { 'Historial clínico': '8', 'Mis citas': '3', 'Medicamentos': '3' };
  return (
    <aside style={{
      width: 240, height: '100%', background: 'var(--white)', borderRight: '1px solid var(--rule)',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ padding: '22px 22px' }}>
        <window.HomeLogo color="var(--ink)" height={18} />
      </div>
      <nav style={{ flex: 1, padding: '8px 12px' }}>
        {PNAV.map(([icon, label], i) => {
          const isActive = i === active;
          const count = counts[label];
          return (
            <div key={label} style={{
              display: 'grid', gridTemplateColumns: '22px 1fr auto', alignItems: 'center', gap: 11,
              padding: '11px 12px', borderRadius: 'var(--r-md)',
              background: isActive ? 'var(--ink)' : 'transparent',
              color: isActive ? 'var(--paper)' : 'var(--ink)',
              marginBottom: 2, cursor: 'pointer',
            }}>
              <PDIcon kind={icon} size={17} color={isActive ? 'var(--paper)' : 'var(--ink-2)'} />
              <span style={{ fontSize: 13.5, fontWeight: isActive ? 500 : 400 }}>{label}</span>
              {count && (
                <span style={{
                  fontFamily: 'var(--mono)', fontSize: 10,
                  padding: '2px 7px', borderRadius: 999,
                  background: isActive ? 'rgba(255,255,255,0.14)' : 'var(--paper-3)',
                  color: isActive ? 'var(--paper)' : 'var(--accent-deep)',
                }}>{count}</span>
              )}
            </div>
          );
        })}
      </nav>
      <div style={{ padding: '14px 18px', borderTop: '1px solid var(--rule)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <span style={{
            width: 34, height: 34, borderRadius: 10, background: 'var(--accent-bright)', color: 'var(--ink)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--serif)', fontSize: 16,
          }}>DV</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 500 }}>Damián Vega Ríos</div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>paciente · O+</div>
          </div>
          <PDIcon kind="chev" size={13} color="var(--ink-3)" />
        </div>
      </div>
    </aside>
  );
}

function PTopBar({ title, sub, right }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 40px 16px', borderBottom: '1px solid var(--rule-2)' }}>
      <div>
        <span className="eyebrow">{sub}</span>
        <h1 style={{ fontSize: 30, fontWeight: 500, letterSpacing: '-0.025em', marginTop: 4, lineHeight: 1.1 }}>{title}</h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: 280, height: 42, padding: '0 14px', border: '1px solid var(--rule)', background: 'var(--white)', borderRadius: 'var(--r-md)' }}>
          <PDIcon kind="search" size={15} color="var(--ink-3)" />
          <span style={{ fontSize: 13, color: 'var(--ink-3)', flex: 1 }}>Buscar en tu historial…</span>
          <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', border: '1px solid var(--rule)', padding: '2px 6px', borderRadius: 4 }}>⌘K</span>
        </div>
        <button style={{ width: 42, height: 42, borderRadius: 'var(--r-md)', border: '1px solid var(--rule)', background: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
          <PDIcon kind="bell" size={17} color="var(--ink-2)" />
          <span style={{ position: 'absolute', top: 8, right: 8, width: 6, height: 6, borderRadius: 99, background: 'var(--alert)' }} />
        </button>
        {right}
      </div>
    </div>
  );
}

const HIST_TABS = ['Resumen', 'Alergias', 'Enf. crónicas', 'Cirugías', 'Familia', 'Vacunas', 'Signos', 'Peso/IMC', 'Síntomas', 'Glucosa'];

function PHistTabs({ active }) {
  return (
    <div style={{ display: 'flex', gap: 4, padding: '14px 40px 0', borderBottom: '1px solid var(--rule-2)', overflowX: 'auto' }}>
      {HIST_TABS.map((t, i) => (
        <span key={t} style={{
          padding: '10px 14px',
          borderBottom: '2px solid ' + (i === active ? 'var(--ink)' : 'transparent'),
          marginBottom: -1,
          fontSize: 13, fontWeight: i === active ? 500 : 400,
          color: i === active ? 'var(--ink)' : 'var(--ink-3)',
          cursor: 'pointer', whiteSpace: 'nowrap',
        }}>{t}</span>
      ))}
    </div>
  );
}

function PDPage({ active, title, sub, right, children, height = 1100, histTab }) {
  return (
    <div className="imx" style={{
      width: 1440, height, background: 'var(--paper)',
      display: 'grid', gridTemplateColumns: '240px 1fr', overflow: 'hidden',
    }}>
      <PSidebar active={active} />
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <PTopBar title={title} sub={sub} right={right} />
        {histTab !== undefined && <PHistTabs active={histTab} />}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px 40px 32px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 1 · INICIO (PC)
// ─────────────────────────────────────────────────────────────
function PDInicio() {
  return (
    <PDPage active={0} title="Hola, Damián." sub="Viernes · 15 mayo · 09:42" height={1080}>
      {/* alerta + próxima cita en 1 fila */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 14 }}>
        <div style={{ background: 'var(--alert-soft)', border: '1px solid var(--alert-rule)', borderRadius: 'var(--r-xl)', padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--alert)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <PDIcon kind="alert" size={15} color="#fff" />
            </span>
            <span className="mono" style={{ fontSize: 10, color: 'var(--alert)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>3 alergias activas</span>
          </div>
          <div style={{ fontSize: 16, fontWeight: 500, marginTop: 10 }}>Penicilina · grave</div>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 3 }}>+ ácaros (moderada) · látex (leve)</div>
          <a className="mono" style={{ display: 'inline-block', marginTop: 12, fontSize: 11, color: 'var(--accent-deep)', fontWeight: 500, letterSpacing: '0.04em' }}>Ver mis alergias →</a>
        </div>
        <div style={{
          background: 'var(--ink)', color: 'var(--paper)', borderRadius: 'var(--r-xl)',
          padding: '20px 24px', position: 'relative', overflow: 'hidden',
          boxShadow: '0 20px 40px -20px rgba(3,4,94,0.5)',
        }}>
          <div style={{ position: 'absolute', width: 280, height: 280, borderRadius: 999, background: 'radial-gradient(circle, rgba(0,180,216,0.32) 0%, transparent 70%)', top: -100, right: -80 }} />
          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 16 }}>
            <div>
              <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Próxima cita · en 5 días</span>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 36, lineHeight: 1, fontWeight: 400, letterSpacing: '-0.02em', marginTop: 8 }}>
                Dr. Damián Vega Ríos
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10, color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                <span className="mono">mié 20 may · 10:30</span>
                <span style={{ width: 1, height: 11, background: 'rgba(255,255,255,0.2)' }} />
                <span>cirugía general · cons. 712</span>
                <span style={{ width: 1, height: 11, background: 'rgba(255,255,255,0.2)' }} />
                <span>Hospital Ángeles, Reforma 222</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
              <button className="btn sm invert" style={{ height: 36, padding: '0 16px' }}>
                <PDIcon kind="qr" size={14} color="var(--ink)" /> Compartir QR
              </button>
              <button className="btn sm dark-ghost" style={{ height: 36, padding: '0 16px' }}>Cómo llegar</button>
            </div>
          </div>
        </div>
      </div>

      {/* signos en 4 cards */}
      <div className="eyebrow" style={{ marginTop: 22, marginBottom: 10 }}>Tu salud · de un vistazo · última toma 4 mar 2026</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          ['heart', 'Frecuencia',  '72', 'bpm',   'normal',  '60–100'],
          ['drop',  'Glucosa',     '89', 'mg/dL', 'bajo · en ayunas', '70–99'],
          ['scale', 'IMC',         '24.4', '',    'normal',  '18.5–24.9'],
          ['lung',  'Saturación',  '98', '%',    'normal',  '≥ 95'],
        ].map(([icon, k, n, u, tag, range], i) => (
          <div key={i} style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--paper-3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <PDIcon kind={icon} size={15} color="var(--accent-deep)" />
              </span>
              <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{k}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginTop: 12 }}>
              <span style={{ fontSize: 30, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1 }}>{n}</span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{u}</span>
            </div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--ok)', marginTop: 8, letterSpacing: '0.04em' }}>· {tag}</div>
            <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', marginTop: 2, letterSpacing: '0.04em' }}>rango: {range}</div>
          </div>
        ))}
      </div>

      {/* dx + meds en 2 columnas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 22 }}>
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--rule-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 14.5, fontWeight: 500 }}>Mis diagnósticos · 3 activos</h3>
            <a className="mono" style={{ fontSize: 11, color: 'var(--accent-deep)', fontWeight: 500 }}>Ver historial →</a>
          </div>
          {[
            ['Diabetes Mellitus tipo 2',         'medio', 'desde 15 jul 2022 · metformina'],
            ['Hipertensión Arterial Sistémica',  'medio', 'desde 10 ene 2023 · losartán'],
            ['Hipotiroidismo Primario',          'bajo',  'desde 20 sep 2023 · levotiroxina'],
          ].map(([k, pri, sub], i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '3px 1fr auto', gap: 14, alignItems: 'center', padding: '13px 18px', borderBottom: i < 2 ? '1px solid var(--rule-3)' : 0 }}>
              <span style={{ width: 3, height: 28, borderRadius: 99, background: pri === 'medio' ? 'var(--mid)' : 'var(--ok)' }} />
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{k}</div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>{sub}</div>
              </div>
              <PDIcon kind="chev" size={13} color="var(--ink-3)" />
            </div>
          ))}
        </div>
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--rule-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 14.5, fontWeight: 500 }}>Hoy · medicación</h3>
            <span className="mono" style={{ fontSize: 11, color: 'var(--ok)' }}>3 / 4 tomadas</span>
          </div>
          {[
            ['06:30', 'Levotiroxina', '50 µg', 'en ayunas', 'tomado'],
            ['08:00', 'Metformina',   '850 mg', 'desayuno',  'tomado'],
            ['08:00', 'Losartán',     '50 mg',  'oral',      'tomado'],
            ['20:00', 'Metformina',   '850 mg', 'cena',      'pendiente'],
          ].map(([t, name, dose, via, st], i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '60px 1fr auto', gap: 12, alignItems: 'center',
              padding: '11px 18px', borderBottom: i < 3 ? '1px solid var(--rule-3)' : 0,
              background: st === 'pendiente' ? 'var(--paper-3)' : 'transparent',
              opacity: st === 'tomado' ? 0.6 : 1,
            }}>
              <span className="mono" style={{ fontSize: 12, fontWeight: 500, color: st === 'pendiente' ? 'var(--accent-deep)' : 'var(--ink-2)' }}>{t}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, textDecoration: st === 'tomado' ? 'line-through' : 'none' }}>
                  {name} <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 400 }}>{dose}</span>
                </div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{via}</div>
              </div>
              {st === 'pendiente'
                ? <button className="btn sm" style={{ height: 26, fontSize: 11, padding: '0 10px' }}>Tomar</button>
                : <PDIcon kind="check" size={14} color="var(--ok)" />}
            </div>
          ))}
        </div>
      </div>
    </PDPage>
  );
}

// ─────────────────────────────────────────────────────────────
// 2 · HISTORIAL · RESUMEN
// ─────────────────────────────────────────────────────────────
function PDHistResumen() {
  return (
    <PDPage active={1} title="Historial clínico" sub="Damián Vega Ríos · O+ · 21 años" histTab={0} height={1140}
      right={<button className="btn sm ghost" style={{ height: 42, borderRadius: 'var(--r-md)' }}><PDIcon kind="download" size={14} /> Exportar PDF</button>}
    >
      {/* identidad */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', padding: '18px 22px', display: 'grid', gridTemplateColumns: '64px 1fr auto auto auto', gap: 18, alignItems: 'center' }}>
        <span style={{ width: 64, height: 64, borderRadius: 18, background: 'var(--accent-bright)', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 28 }}>DV</span>
        <div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 26, lineHeight: 1, letterSpacing: '-0.02em' }}>Damián Vega Ríos</div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 6, letterSpacing: '0.04em' }}>♂ 21 años · O+ · 175 cm · 74.8 kg · CURP VRD050322HDFGSM05</div>
        </div>
        {[['Alergias', '3', 'var(--alert)'], ['Dx activos', '3', 'var(--mid)'], ['Vacunas', '6', 'var(--ok)']].map(([k, n, c]) => (
          <div key={k} style={{ borderLeft: '1px solid var(--rule-2)', paddingLeft: 18 }}>
            <div className="mono" style={{ fontSize: 9.5, color: c, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{k}</div>
            <div style={{ fontSize: 24, fontWeight: 500, marginTop: 4, letterSpacing: '-0.02em' }}>{n}</div>
          </div>
        ))}
      </div>

      {/* alerta penicilina */}
      <div style={{ marginTop: 14, background: 'var(--alert-soft)', border: '1px solid var(--alert-rule)', borderRadius: 'var(--r-lg)', padding: '14px 20px', display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 14, alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, padding: '3px 8px', borderRadius: 4, background: 'var(--alert)', color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase' }}>ALERGIA GRAVE</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>Penicilina · anafilaxia (2018)</div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>Evitar β-lactámicos. Alternativa: macrólidos. Documentada en hospitalización.</div>
        </div>
        <span className="mono" style={{ fontSize: 11, color: 'var(--accent-deep)', fontWeight: 500 }}>Ver alergia →</span>
      </div>

      {/* 3 columnas: dx · signos · vacunas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 14, marginTop: 16 }}>
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--rule-2)' }}>
            <h3 style={{ fontSize: 14.5, fontWeight: 500 }}>Diagnósticos activos</h3>
          </div>
          {[
            ['Diabetes Mellitus tipo 2',         'En tratamiento · riesgo medio',  '15 jul 2022'],
            ['Hipertensión Arterial Sistémica',  'Controlada · riesgo medio',     '10 ene 2023'],
            ['Hipotiroidismo Primario',          'En tratamiento · riesgo bajo',  '20 sep 2023'],
          ].map(([k, sub, date], i) => (
            <div key={i} style={{ padding: '12px 18px', borderBottom: i < 2 ? '1px solid var(--rule-3)' : 0, display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 10 }}>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{k}</div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>{sub}</div>
              </div>
              <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>{date}</span>
            </div>
          ))}
        </div>
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--rule-2)' }}>
            <h3 style={{ fontSize: 14.5, fontWeight: 500 }}>Signos · última toma</h3>
          </div>
          <div style={{ padding: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              ['heart', 'FC',  '72',  'bpm'],
              ['drop',  'Glu', '89',  'mg/dL'],
              ['scale', 'IMC', '24.4', ''],
              ['lung',  'SpO₂','98',  '%'],
            ].map(([icon, k, n, u], i) => (
              <div key={i} style={{ padding: '10px 12px', background: 'var(--paper)', borderRadius: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <PDIcon kind={icon} size={12} color="var(--accent-deep)" />
                  <span className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: '0.08em' }}>{k}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginTop: 4 }}>
                  <span style={{ fontSize: 19, fontWeight: 500, letterSpacing: '-0.02em' }}>{n}</span>
                  <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{u}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--rule-2)' }}>
            <h3 style={{ fontSize: 14.5, fontWeight: 500 }}>Vacunas · al día</h3>
          </div>
          {[
            ['COVID-19', '3 dosis · ref. moderna'],
            ['Influenza', 'anual · oct 2025'],
            ['Tétanos (Td)', 'refuerzo · 2020'],
            ['Neumococo PCV13', 'única · 2022'],
          ].map(([k, sub], i) => (
            <div key={i} style={{ padding: '11px 18px', borderBottom: i < 3 ? '1px solid var(--rule-3)' : 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 500 }}>{k}</div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 2 }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </PDPage>
  );
}

// ─────────────────────────────────────────────────────────────
// 3 · ALERGIAS (PC) — grid 3 col
// ─────────────────────────────────────────────────────────────
function PDAlergias() {
  const list = [
    { name: 'Penicilina', sev: 'grave', kind: 'medicamento', date: '12 mar 2018', reac: 'Urticaria + angioedema generalizado', tx: 'Adrenalina + evitación', notas: 'Documentada en hospitalización 2018 · anafilaxia · usar macrólidos' },
    { name: 'Ácaros del polvo', sev: 'moderada', kind: 'ambiental', date: '20 jun 2015', reac: 'Rinitis alérgica + conjuntivitis', tx: 'Loratadina PRN', notas: 'Perenne · exacerba en temporada de lluvia' },
    { name: 'Látex', sev: 'leve', kind: 'contacto', date: '1 sep 2020', reac: 'Eritema en manos', tx: 'Guantes libres de látex', notas: 'Notificada para procedimientos médicos' },
  ];
  const sevC = (s) => s === 'grave' ? 'var(--alert)' : s === 'moderada' ? 'var(--mid)' : 'var(--ok)';
  return (
    <PDPage active={1} title="Alergias" sub="3 registradas · 1 grave" histTab={1} height={1080}
      right={<button className="btn sm" style={{ height: 42, borderRadius: 'var(--r-md)' }}><PDIcon kind="plus" size={14} color="#fff" /> Registrar alergia</button>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 18 }}>
        {[['Grave', '1', 'var(--alert)'], ['Moderada', '1', 'var(--mid)'], ['Leve', '1', 'var(--ok)']].map(([k, n, c]) => (
          <div key={k} style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', padding: '14px 18px' }}>
            <div className="mono" style={{ fontSize: 10, color: c, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{k}</div>
            <div style={{ fontSize: 32, fontWeight: 500, letterSpacing: '-0.03em', marginTop: 6 }}>{n}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {list.map((a, i) => (
          <div key={i} style={{
            background: 'var(--white)', border: '1px solid var(--rule)',
            borderTop: '4px solid ' + sevC(a.sev),
            borderRadius: 'var(--r-xl)', padding: '18px 20px',
          }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{
                fontFamily: 'var(--mono)', fontSize: 9.5, padding: '3px 8px', borderRadius: 4,
                background: a.sev === 'grave' ? 'var(--alert-soft)' : a.sev === 'moderada' ? 'rgba(201,122,18,0.12)' : 'rgba(28,140,90,0.12)',
                color: sevC(a.sev), letterSpacing: '0.1em', textTransform: 'uppercase',
              }}>{a.sev}</span>
              <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>· {a.kind}</span>
            </div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 28, lineHeight: 1, letterSpacing: '-0.02em', marginTop: 10 }}>{a.name}</div>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 4 }}>diagnóstico: {a.date}</div>

            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[['Reacción', a.reac], ['Tratamiento', a.tx], ['Notas', a.notas]].map(([k, v], j) => (
                <div key={j}>
                  <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{k}</div>
                  <div style={{ fontSize: 12.5, marginTop: 3, color: 'var(--ink-2)' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PDPage>
  );
}

// ─────────────────────────────────────────────────────────────
// 4 · ENFERMEDADES (PC)
// ─────────────────────────────────────────────────────────────
function PDEnf() {
  const enfs = [
    { dx: 'Diabetes Mellitus tipo 2',         risk: 'medio', dxDate: '15 jul 2022', tx: 'Metformina 850 mg c/12h c/alimentos', freq: 'Mensual', last: '1 abr 2026', next: '15 may 2026', dr: 'Dra. L. Estrada' },
    { dx: 'Hipertensión Arterial Sistémica',  risk: 'medio', dxDate: '10 ene 2023', tx: 'Losartán 50 mg c/24h',                freq: 'Mensual', last: '1 abr 2026', next: '15 may 2026', dr: 'Dra. L. Estrada' },
    { dx: 'Hipotiroidismo Primario',          risk: 'bajo',  dxDate: '20 sep 2023', tx: 'Levotiroxina 50 µg en ayunas',         freq: 'Semestral', last: '15 ene 2026', next: '15 jul 2026', dr: 'Dr. D. Vega Ríos' },
  ];
  return (
    <PDPage active={1} title="Enfermedades crónicas" sub="3 en tratamiento" histTab={2} height={1100}
      right={<button className="btn sm" style={{ height: 42, borderRadius: 'var(--r-md)' }}><PDIcon kind="plus" size={14} color="#fff" /> Registrar</button>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {enfs.map((e, i) => (
          <div key={i} style={{
            background: 'var(--white)', border: '1px solid var(--rule)',
            borderLeft: '4px solid ' + (e.risk === 'medio' ? 'var(--mid)' : 'var(--ok)'),
            borderRadius: 'var(--r-xl)', padding: '18px 24px',
            display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr 1fr', gap: 24, alignItems: 'center',
          }}>
            <div>
              <div style={{ display: 'flex', gap: 6 }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, padding: '3px 7px', borderRadius: 4, background: 'var(--paper-3)', color: 'var(--accent-deep)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>EN TX</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, padding: '3px 7px', borderRadius: 4, background: e.risk === 'medio' ? 'rgba(201,122,18,0.12)' : 'rgba(28,140,90,0.12)', color: e.risk === 'medio' ? 'var(--mid)' : 'var(--ok)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>RIESGO {e.risk}</span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 500, marginTop: 8 }}>{e.dx}</div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>dx: {e.dxDate} · {e.dr}</div>
            </div>
            <div>
              <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Tratamiento</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>{e.tx}</div>
            </div>
            <div>
              <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Frecuencia</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>{e.freq}</div>
            </div>
            <div>
              <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Última</div>
              <div className="mono" style={{ fontSize: 12, marginTop: 4 }}>{e.last}</div>
            </div>
            <div>
              <div className="mono" style={{ fontSize: 9.5, color: 'var(--accent-deep)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Próxima revisión</div>
              <div className="mono" style={{ fontSize: 12, marginTop: 4, color: 'var(--accent-deep)', fontWeight: 500 }}>{e.next}</div>
            </div>
          </div>
        ))}
      </div>
    </PDPage>
  );
}

// ─────────────────────────────────────────────────────────────
// 5 · CIRUGÍAS (PC) — vacío diseñado
// ─────────────────────────────────────────────────────────────
function PDCirugias() {
  return (
    <PDPage active={1} title="Cirugías previas" sub="Antecedentes quirúrgicos" histTab={3} height={1000}
      right={<button className="btn sm" style={{ height: 42, borderRadius: 'var(--r-md)' }}><PDIcon kind="plus" size={14} color="#fff" /> Registrar cirugía</button>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14 }}>
        <div style={{
          background: 'var(--paper-3)', border: '1px solid var(--accent-rule)',
          borderRadius: 'var(--r-xl)', padding: '40px 36px',
          display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
        }}>
          <span style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--white)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <PDIcon kind="check" size={24} color="var(--ok)" />
          </span>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 40, lineHeight: 1, fontWeight: 400, marginTop: 22, letterSpacing: '-0.02em' }}>
            Sin antecedentes<br />quirúrgicos.
          </div>
          <div className="mono" style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 14, letterSpacing: '0.04em' }}>
            no se ha registrado ninguna intervención previa en tu historial
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 22 }}>
            <button className="btn sm">
              <PDIcon kind="plus" size={14} color="#fff" /> Registrar una cirugía
            </button>
            <button className="btn sm ghost">Importar de otro hospital</button>
          </div>
        </div>

        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--rule-2)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 500 }}>Qué necesita tu médico</h3>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 4 }}>los 4 datos clave de cualquier intervención</div>
          </div>
          {[
            ['Procedimiento y fecha',     'p. ej. apendicectomía · 22 abr 2020'],
            ['Hospital y cirujano',       'institución + médico tratante'],
            ['Anestesia y complicaciones','tipo de anestesia, reacciones adversas'],
            ['Cuidados post-operatorios', 'plan de seguimiento si aplica'],
          ].map(([k, sub], i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '36px 1fr', gap: 14, alignItems: 'center',
              padding: '14px 22px',
              borderBottom: i < 3 ? '1px solid var(--rule-3)' : 0,
            }}>
              <span className="mono" style={{ fontSize: 14, color: 'var(--accent-deep)', fontWeight: 500 }}>0{i + 1}</span>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{k}</div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PDPage>
  );
}

// ─────────────────────────────────────────────────────────────
// 6 · FAMILIA (PC)
// ─────────────────────────────────────────────────────────────
function PDFamilia() {
  const ant = [
    { dx: 'Diabetes Mellitus tipo 2', who: 'Padre',           age: '45 a', state: 'vivo' },
    { dx: 'Hipertensión Arterial',    who: 'Padre',           age: '42 a', state: 'vivo' },
    { dx: 'Hipotiroidismo',           who: 'Madre',           age: '38 a', state: 'vivo' },
    { dx: 'Diabetes Mellitus tipo 2', who: 'Abuela materna',  age: '55 a', state: 'falleció', cause: 'IRC por nefropatía diabética' },
    { dx: 'Infarto agudo de miocardio', who: 'Abuelo paterno', age: '68 a', state: 'falleció', cause: 'IAM' },
  ];
  return (
    <PDPage active={1} title="Antecedentes familiares" sub="5 registros en 2 generaciones" histTab={4} height={1080}
      right={<button className="btn sm" style={{ height: 42, borderRadius: 'var(--r-md)' }}><PDIcon kind="plus" size={14} color="#fff" /> Agregar</button>}
    >
      <div style={{ background: 'var(--paper-3)', border: '1px solid var(--accent-rule)', borderRadius: 'var(--r-lg)', padding: '14px 20px', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 14, alignItems: 'center', marginBottom: 18 }}>
        <PDIcon kind="alert" size={22} color="var(--accent-deep)" />
        <div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--accent-deep)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Patrón hereditario detectado</div>
          <div style={{ fontSize: 13.5, marginTop: 4 }}>
            <strong>Diabetes</strong> y <strong>enfermedad cardiometabólica</strong> presentes en línea paterna y materna. Refuerza tu plan de prevención.
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {ant.map((a, i) => (
          <div key={i} style={{
            background: 'var(--white)', border: '1px solid var(--rule)',
            borderTop: '4px solid ' + (a.state === 'vivo' ? 'var(--ok)' : 'var(--alert)'),
            borderRadius: 'var(--r-lg)', padding: '14px 18px',
          }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, padding: '3px 7px', borderRadius: 4, background: a.state === 'vivo' ? 'rgba(28,140,90,0.12)' : 'var(--alert-soft)', color: a.state === 'vivo' ? 'var(--ok)' : 'var(--alert)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{a.state}</span>
              <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>· {a.who} · {a.age}</span>
            </div>
            <div style={{ fontSize: 15, fontWeight: 500, marginTop: 8 }}>{a.dx}</div>
            {a.cause && (
              <div style={{ marginTop: 8, padding: '8px 10px', background: 'var(--alert-soft)', borderRadius: 6 }}>
                <span className="mono" style={{ fontSize: 9.5, color: 'var(--alert)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>causa · </span>
                <span style={{ fontSize: 11.5 }}>{a.cause}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </PDPage>
  );
}

// ─────────────────────────────────────────────────────────────
// 7 · VACUNAS (PC)
// ─────────────────────────────────────────────────────────────
function PDVacunas() {
  const vacs = [
    { name: 'COVID-19', maker: 'Pfizer-BioNTech', dose: '1ª dosis', date: '10 may 2021', age: '16 a', notes: 'Sin eventos adversos' },
    { name: 'COVID-19', maker: 'Pfizer-BioNTech', dose: '2ª dosis', date: '1 jun 2021',  age: '16 a', notes: 'Fiebre leve 24h, autolimitada' },
    { name: 'COVID-19 Refuerzo', maker: 'Moderna', dose: 'Refuerzo', date: '14 feb 2022', age: '17 a', notes: 'Sin reacciones' },
    { name: 'Influenza Estacional', maker: 'Sanofi Pasteur', dose: 'Anual', date: '15 oct 2025', age: '21 a', notes: 'Recomendada por dx diabetes' },
    { name: 'Tétanos (Td)', maker: 'MSD', dose: 'Refuerzo', date: '25 abr 2020', age: '15 a', notes: 'Aplicada durante hospitalización' },
    { name: 'Neumococo (PCV13)', maker: 'Pfizer', dose: 'Dosis única', date: '20 ago 2022', age: '17 a', notes: 'Indicada por condición de base' },
  ];
  return (
    <PDPage active={1} title="Vacunas" sub="Esquema al día · 6 dosis aplicadas" histTab={5} height={1100}
      right={<button className="btn sm" style={{ height: 42, borderRadius: 'var(--r-md)' }}><PDIcon kind="plus" size={14} color="#fff" /> Agregar vacuna</button>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
        <div style={{ background: 'var(--paper-3)', border: '1px solid var(--accent-rule)', borderRadius: 'var(--r-lg)', padding: '16px 18px' }}>
          <div className="eyebrow">Estado del esquema</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 28, marginTop: 6, lineHeight: 1, letterSpacing: '-0.02em' }}>Al día</div>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 6 }}>6 dosis · 5 vacunas distintas</div>
        </div>
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', padding: '16px 18px' }}>
          <div className="eyebrow">Próxima</div>
          <div style={{ fontSize: 14, fontWeight: 500, marginTop: 6 }}>Influenza 2026</div>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--accent-deep)', marginTop: 4 }}>oct 2026 · en 5 m</div>
        </div>
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', padding: '16px 18px' }}>
          <div className="eyebrow">Cobertura COVID</div>
          <div style={{ fontSize: 14, fontWeight: 500, marginTop: 6 }}>3 dosis</div>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 4 }}>refuerzo feb 2022</div>
        </div>
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', padding: '16px 18px' }}>
          <div className="eyebrow">Reacciones adversas</div>
          <div style={{ fontSize: 14, fontWeight: 500, marginTop: 6 }}>1 leve</div>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 4 }}>fiebre · 2ª dosis COVID</div>
        </div>
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr 1.4fr 60px',
          padding: '12px 22px', borderBottom: '1px solid var(--rule-2)',
          fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          <span>Vacuna</span>
          <span>Dosis</span>
          <span>Fabricante</span>
          <span>Fecha</span>
          <span>Notas</span>
          <span></span>
        </div>
        {vacs.map((v, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr 1.4fr 60px',
            padding: '13px 22px', alignItems: 'center', gap: 10,
            borderBottom: i < vacs.length - 1 ? '1px solid var(--rule-3)' : 0,
          }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 500 }}>{v.name}</div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>edad: {v.age}</div>
            </div>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, padding: '3px 8px', borderRadius: 999, background: 'var(--paper-3)', color: 'var(--accent-deep)', letterSpacing: '0.08em', textTransform: 'uppercase', width: 'fit-content' }}>{v.dose}</span>
            <span style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>{v.maker}</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-2)' }}>{v.date}</span>
            <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{v.notes}</span>
            <PDIcon kind="chev" size={13} color="var(--ink-3)" />
          </div>
        ))}
      </div>
    </PDPage>
  );
}

// ─────────────────────────────────────────────────────────────
// 8 · PESO / IMC (PC) — chart grande
// ─────────────────────────────────────────────────────────────
function PDPeso() {
  const data = [
    { d: 'sep 25', w: 73.2, imc: 23.9 },
    { d: 'nov 25', w: 73.8, imc: 24.1 },
    { d: 'ene 26', w: 74.5, imc: 24.3 },
    { d: 'mar 26', w: 74.8, imc: 24.4 },
  ];
  const max = 25, min = 23;
  const W = 920, H = 220;
  const pts = data.map((p, i) => {
    const x = (i / (data.length - 1)) * (W - 60) + 40;
    const y = H - ((p.imc - min) / (max - min)) * (H - 50) - 30;
    return [x, y, p];
  });
  const path = pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ',' + p[1]).join(' ');
  return (
    <PDPage active={1} title="Peso, talla e IMC" sub="4 mediciones · 7 meses" histTab={7} height={1080}
      right={<button className="btn sm" style={{ height: 42, borderRadius: 'var(--r-md)' }}><PDIcon kind="plus" size={14} color="#fff" /> Registrar medición</button>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div style={{ background: 'var(--ink)', color: 'var(--paper)', borderRadius: 'var(--r-lg)', padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: 999, background: 'radial-gradient(circle, rgba(0,180,216,0.3) 0%, transparent 70%)', top: -60, right: -50 }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>IMC actual</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, padding: '3px 8px', borderRadius: 999, background: 'var(--accent-bright)', color: 'var(--ink)', letterSpacing: '0.08em' }}>NORMAL</span>
            </div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 56, lineHeight: 1, letterSpacing: '-0.02em', marginTop: 10 }}>24.4</div>
            <div className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 6 }}>medido 31 mar 2026</div>
          </div>
        </div>
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', padding: '18px 20px' }}>
          <div className="eyebrow">Peso</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 10 }}>
            <span style={{ fontSize: 42, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1 }}>74.8</span>
            <span className="mono" style={{ fontSize: 13, color: 'var(--ink-3)' }}>kg</span>
          </div>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--mid)', marginTop: 8, letterSpacing: '0.04em' }}>+1.6 kg en 7 meses</div>
        </div>
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', padding: '18px 20px' }}>
          <div className="eyebrow">Talla</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 10 }}>
            <span style={{ fontSize: 42, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1 }}>1.75</span>
            <span className="mono" style={{ fontSize: 13, color: 'var(--ink-3)' }}>m</span>
          </div>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 8 }}>estable</div>
        </div>
      </div>

      {/* chart */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: 14.5, fontWeight: 500 }}>Evolución del IMC · últimos 7 meses</h3>
          <div style={{ display: 'flex', gap: 6 }}>
            {['7m', '1a', 'todo'].map((k, i) => (
              <span key={k} style={{
                padding: '5px 12px', borderRadius: 7, fontSize: 11, fontFamily: 'var(--mono)',
                border: '1px solid ' + (i === 0 ? 'var(--ink)' : 'var(--rule)'),
                background: i === 0 ? 'var(--ink)' : 'var(--white)',
                color: i === 0 ? 'var(--paper)' : 'var(--ink-3)',
                cursor: 'pointer',
              }}>{k}</span>
            ))}
          </div>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 220, display: 'block' }}>
          {/* gridlines */}
          {[23, 24, 25].map(v => {
            const y = H - ((v - min) / (max - min)) * (H - 50) - 30;
            return <g key={v}>
              <line x1="36" y1={y} x2={W - 16} y2={y} stroke="var(--rule-2)" strokeDasharray="2 4" />
              <text x="6" y={y + 3} fontSize="10" fill="var(--ink-3)" fontFamily="var(--mono)">{v.toFixed(1)}</text>
            </g>;
          })}
          {/* normal band */}
          <rect x="40" y={H - ((24.9 - min) / (max - min)) * (H - 50) - 30}
            width={W - 60} height={Math.abs(H - ((18.5 - min) / (max - min)) * (H - 50) - 30 - (H - ((24.9 - min) / (max - min)) * (H - 50) - 30))}
            fill="rgba(28,140,90,0.06)" />
          <path d={path} stroke="var(--accent)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {pts.map((p, i) => <g key={i}>
            <circle cx={p[0]} cy={p[1]} r="5" fill="var(--accent-deep)" />
            <text x={p[0]} y={p[1] - 12} textAnchor="middle" fontSize="11" fill="var(--ink)" fontFamily="var(--mono)" fontWeight="500">{p[2].imc}</text>
            <text x={p[0]} y={H - 6} textAnchor="middle" fontSize="10" fill="var(--ink-3)" fontFamily="var(--mono)">{p[2].d}</text>
          </g>)}
        </svg>
      </div>

      {/* mediciones */}
      <div className="eyebrow" style={{ marginTop: 22, marginBottom: 10 }}>Mediciones registradas</div>
      <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
        {data.slice().reverse().map((d, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 100px',
            padding: '13px 22px', alignItems: 'center',
            borderBottom: i < 3 ? '1px solid var(--rule-3)' : 0,
          }}>
            <span className="mono" style={{ fontSize: 12, color: 'var(--ink-2)' }}>{d.d}</span>
            <div>
              <span style={{ fontSize: 15, fontWeight: 500 }}>{d.w}</span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginLeft: 4 }}>kg</span>
            </div>
            <span className="mono" style={{ fontSize: 12, color: 'var(--ink-3)' }}>1.75 m</span>
            <div>
              <span style={{ fontSize: 15, fontWeight: 500 }}>{d.imc}</span>
              <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginLeft: 4 }}>IMC</span>
            </div>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, padding: '3px 8px', borderRadius: 999, background: 'rgba(28,140,90,0.12)', color: 'var(--ok)', letterSpacing: '0.08em', width: 'fit-content' }}>NORMAL</span>
          </div>
        ))}
      </div>
    </PDPage>
  );
}

// ─────────────────────────────────────────────────────────────
// 9 · GLUCOSA (PC) — chart + lecturas
// ─────────────────────────────────────────────────────────────
function PDGlucosa() {
  const reads = [
    { v: 95,  d: '28 abr',  ctx: 'En ayunas',  m: 'Glucómetro',  state: 'bajo',   note: 'Control rutinario matutino', sym: 'ninguno' },
    { v: 142, d: '20 abr',  ctx: 'Postprandial', m: 'Glucómetro', state: 'alto',  note: 'Comida fuera de dieta. Evitar azúcares simples', sym: 'Sed ligera' },
    { v: 102, d: '7 abr',   ctx: 'En ayunas',  m: 'Glucómetro',  state: 'normal', note: 'Buen control', sym: 'ninguno' },
    { v: 89,  d: '5 mar',   ctx: 'En ayunas',  m: 'Laboratorio', state: 'bajo',   note: 'Resultado mensual de laboratorio', sym: 'ninguno' },
  ];
  const sC = (s) => s === 'alto' ? 'var(--mid)' : s === 'bajo' ? 'var(--ok)' : 'var(--accent-deep)';
  // chart: invertir el orden para que el más antiguo quede a la izquierda
  const dataPoints = [{ d: '5 mar', v: 89 }, { d: '7 abr', v: 102 }, { d: '20 abr', v: 142 }, { d: '28 abr', v: 95 }];
  const W = 920, H = 200, max = 160, min = 60;
  const pts = dataPoints.map((p, i) => {
    const x = (i / (dataPoints.length - 1)) * (W - 60) + 40;
    const y = H - ((p.v - min) / (max - min)) * (H - 40) - 20;
    return [x, y, p];
  });
  const path = pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ',' + p[1]).join(' ');
  return (
    <PDPage active={1} title="Glucosa" sub="DM tipo 2 · 4 lecturas · últimos 60 días" histTab={9} height={1100}
      right={<button className="btn sm" style={{ height: 42, borderRadius: 'var(--r-md)' }}><PDIcon kind="plus" size={14} color="#fff" /> Registrar lectura</button>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div style={{ background: 'var(--ink)', color: 'var(--paper)', borderRadius: 'var(--r-lg)', padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', width: 220, height: 220, borderRadius: 999, background: 'radial-gradient(circle, rgba(0,180,216,0.3) 0%, transparent 70%)', top: -70, right: -50 }} />
          <div style={{ position: 'relative' }}>
            <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Última lectura</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 8 }}>
              <span style={{ fontFamily: 'var(--serif)', fontSize: 48, lineHeight: 1, letterSpacing: '-0.02em' }}>95</span>
              <span className="mono" style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>mg/dL</span>
            </div>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--accent-bright)', marginTop: 8, letterSpacing: '0.06em' }}>EN AYUNAS · 28 ABR · BAJO</div>
          </div>
        </div>
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', padding: '16px 18px' }}>
          <div className="eyebrow">Media 30 d</div>
          <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.03em', marginTop: 6, lineHeight: 1 }}>107</div>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--ok)', marginTop: 6 }}>↓ 8 vs mes anterior</div>
        </div>
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', padding: '16px 18px' }}>
          <div className="eyebrow">En rango</div>
          <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.03em', marginTop: 6, lineHeight: 1 }}>78%</div>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 6 }}>objetivo: 70 – 140</div>
        </div>
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', padding: '16px 18px' }}>
          <div className="eyebrow">HbA1c estimada</div>
          <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.03em', marginTop: 6, lineHeight: 1 }}>5.6%</div>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--ok)', marginTop: 6 }}>· control aceptable</div>
        </div>
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', padding: '18px 20px', marginBottom: 18 }}>
        <h3 style={{ fontSize: 14.5, fontWeight: 500, marginBottom: 12 }}>Evolución</h3>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 200, display: 'block' }}>
          {/* objetivo band 70-140 */}
          <rect x="40"
            y={H - ((140 - min) / (max - min)) * (H - 40) - 20}
            width={W - 60}
            height={Math.abs(H - ((70 - min) / (max - min)) * (H - 40) - 20 - (H - ((140 - min) / (max - min)) * (H - 40) - 20))}
            fill="rgba(0,180,216,0.07)" />
          {[60, 100, 140].map(v => {
            const y = H - ((v - min) / (max - min)) * (H - 40) - 20;
            return <g key={v}>
              <line x1="36" y1={y} x2={W - 16} y2={y} stroke="var(--rule-2)" strokeDasharray="2 4" />
              <text x="6" y={y + 3} fontSize="10" fill="var(--ink-3)" fontFamily="var(--mono)">{v}</text>
            </g>;
          })}
          <path d={path} stroke="var(--accent)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {pts.map((p, i) => {
            const v = p[2].v;
            const state = v > 140 ? 'alto' : v < 100 ? 'bajo' : 'normal';
            return <g key={i}>
              <circle cx={p[0]} cy={p[1]} r="5" fill={sC(state)} />
              <text x={p[0]} y={p[1] - 12} textAnchor="middle" fontSize="11" fill="var(--ink)" fontFamily="var(--mono)" fontWeight="500">{v}</text>
              <text x={p[0]} y={H - 4} textAnchor="middle" fontSize="10" fill="var(--ink-3)" fontFamily="var(--mono)">{p[2].d}</text>
            </g>;
          })}
        </svg>
      </div>

      {/* lecturas */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '80px 1fr 1fr 1fr 90px 1.4fr',
          padding: '12px 22px', borderBottom: '1px solid var(--rule-2)',
          fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          <span>Valor</span>
          <span>Fecha</span>
          <span>Contexto</span>
          <span>Método</span>
          <span>Estado</span>
          <span>Nota</span>
        </div>
        {reads.map((r, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '80px 1fr 1fr 1fr 90px 1.4fr',
            padding: '13px 22px', alignItems: 'center', gap: 10,
            borderBottom: i < reads.length - 1 ? '1px solid var(--rule-3)' : 0,
          }}>
            <div>
              <span style={{ fontSize: 19, fontWeight: 500, letterSpacing: '-0.02em' }}>{r.v}</span>
              <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginLeft: 3 }}>mg/dL</span>
            </div>
            <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-2)' }}>{r.d}</span>
            <span style={{ fontSize: 12.5 }}>{r.ctx}</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{r.m}</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, padding: '3px 8px', borderRadius: 999, background: r.state === 'alto' ? 'rgba(201,122,18,0.12)' : r.state === 'bajo' ? 'rgba(28,140,90,0.12)' : 'var(--paper-3)', color: sC(r.state), letterSpacing: '0.08em', textTransform: 'uppercase', width: 'fit-content' }}>{r.state}</span>
            <span style={{ fontSize: 11.5, color: 'var(--ink-3)', fontStyle: 'italic' }}>{r.note}</span>
          </div>
        ))}
      </div>
    </PDPage>
  );
}

// ─────────────────────────────────────────────────────────────
// 10 · CITAS (PC)
// ─────────────────────────────────────────────────────────────
function PDCitas() {
  const proximas = [
    { t: '10:30', d: 'mié 20 may 2026',  dr: 'Dr. Damián Vega Ríos', esp: 'cirugía general',  tag: 'Seguimiento · cole. lap.', loc: 'Hosp. Ángeles · cons. 712',  state: 'confirmada' },
    { t: '08:00', d: 'lun 8 jun 2026',   dr: 'Dra. Laura Estrada',   esp: 'endocrinología',   tag: 'Control · DM2 + HTA',     loc: 'Cl. Reforma · cons. 4',      state: 'confirmada' },
    { t: '17:00', d: 'jue 25 jun 2026',  dr: 'Dr. Manuel Vargas',    esp: 'cardiología',      tag: 'Primera consulta',         loc: 'CMP · cons. 1208',           state: 'pendiente' },
  ];
  const pasadas = [
    { t: '11:00', d: '14 abr 2026',  dr: 'Dr. D. Vega Ríos',     esp: 'cirugía',         dx: 'Control post-op · cole. lap.' },
    { t: '09:30', d: '01 abr 2026',  dr: 'Dra. L. Estrada',      esp: 'endocrinología',  dx: 'Control mensual · ajuste metformina' },
    { t: '10:00', d: '15 mar 2026',  dr: 'Dr. D. Vega Ríos',     esp: 'cirugía',         dx: 'Post-op día 14 · alta' },
  ];
  return (
    <PDPage active={2} title="Mis citas" sub="3 próximas · 8 pasadas en 2026" height={1100}
      right={<button className="btn sm" style={{ height: 42, borderRadius: 'var(--r-md)' }}><PDIcon kind="plus" size={14} color="#fff" /> Agendar cita</button>}
    >
      {/* hero próxima */}
      <div style={{
        background: 'var(--ink)', color: 'var(--paper)',
        borderRadius: 'var(--r-xl)', padding: '24px 28px',
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 20px 40px -20px rgba(3,4,94,0.5)',
      }}>
        <div style={{ position: 'absolute', width: 360, height: 360, borderRadius: 999, background: 'radial-gradient(circle, rgba(0,180,216,0.32) 0%, transparent 70%)', top: -120, right: -100 }} />
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 7, height: 7, borderRadius: 99, background: 'var(--accent-bright)' }} />
              <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Tu próxima cita · en 5 días</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, padding: '3px 8px', borderRadius: 999, background: 'rgba(255,255,255,0.14)', color: 'var(--paper)', letterSpacing: '0.08em' }}>CONFIRMADA</span>
            </div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 44, lineHeight: 1, fontWeight: 400, letterSpacing: '-0.02em', marginTop: 10 }}>
              Dr. Damián Vega Ríos
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 14, color: 'rgba(255,255,255,0.75)', fontSize: 13.5 }}>
              <span className="mono">mié 20 may · 10:30</span>
              <span style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.2)' }} />
              <span>cirugía general · seguimiento</span>
              <span style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.2)' }} />
              <span>Hospital Ángeles · Reforma 222 · cons. 712</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
            <button className="btn invert" style={{ height: 44, padding: '0 20px' }}>
              <PDIcon kind="qr" size={15} color="var(--ink)" /> Compartir historial
            </button>
            <button className="btn dark-ghost" style={{ height: 44, padding: '0 20px' }}>Cómo llegar</button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14, marginTop: 18 }}>
        {/* próximas */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--rule-2)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 500 }}>Próximas citas · 3</h3>
          </div>
          {proximas.map((c, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '78px 1fr auto', gap: 14, alignItems: 'center',
              padding: '14px 20px',
              borderBottom: i < 2 ? '1px solid var(--rule-3)' : 0,
            }}>
              <div style={{ borderRight: '1px solid var(--rule-2)', paddingRight: 14 }}>
                <div className="mono" style={{ fontSize: 14, fontWeight: 500 }}>{c.t}</div>
                <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', marginTop: 2, letterSpacing: '0.04em' }}>{c.d}</div>
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{c.dr}</div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>{c.esp} · {c.tag}</div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 2, letterSpacing: '0.04em' }}>{c.loc}</div>
              </div>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, padding: '3px 8px', borderRadius: 999, background: c.state === 'confirmada' ? 'rgba(28,140,90,0.12)' : 'rgba(201,122,18,0.12)', color: c.state === 'confirmada' ? 'var(--ok)' : 'var(--mid)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{c.state}</span>
            </div>
          ))}
        </div>

        {/* pasadas */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--rule-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 15, fontWeight: 500 }}>Pasadas · 8 en 2026</h3>
            <a className="mono" style={{ fontSize: 11, color: 'var(--accent-deep)', fontWeight: 500 }}>Ver todas →</a>
          </div>
          {pasadas.map((c, i) => (
            <div key={i} style={{
              padding: '12px 20px',
              borderBottom: i < pasadas.length - 1 ? '1px solid var(--rule-3)' : 0,
              opacity: 0.85,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 12.5, fontWeight: 500 }}>{c.dr}</div>
                <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>{c.d}</span>
              </div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 2 }}>{c.esp} · {c.dx}</div>
            </div>
          ))}
        </div>
      </div>
    </PDPage>
  );
}

// ─────────────────────────────────────────────────────────────
// 11 · AGENDAR CITA (PC)
// ─────────────────────────────────────────────────────────────
function PDAgendar() {
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  const today = 15;
  return (
    <PDPage active={2} title="Agendar cita" sub="Paso 2 de 3 · selecciona fecha y hora" height={1080}
      right={<button className="btn sm ghost" style={{ height: 42, borderRadius: 'var(--r-md)' }}><PDIcon kind="chev-l" size={13} /> Volver</button>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 14 }}>
        {/* izq: médico + tipo + motivo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', padding: '18px 20px' }}>
            <div className="eyebrow">Tu médico</div>
            <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr auto', gap: 12, alignItems: 'center', marginTop: 10 }}>
              <span style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--accent-bright)', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 22 }}>DV</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 500 }}>Dr. Damián Vega Ríos</div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>cirugía general · céd. 8 421 776 · Hosp. Ángeles</div>
              </div>
              <span style={{ fontSize: 12, color: 'var(--accent-deep)', fontWeight: 500, cursor: 'pointer' }}>cambiar</span>
            </div>
          </div>

          <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', padding: '18px 20px' }}>
            <div className="eyebrow">Tipo de cita</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
              {[['Primera vez', false, '$ 1 200'], ['Seguimiento', true, '$ 800'], ['Urgencia', false, '$ 1 800'], ['Control', false, '$ 800']].map(([k, on, p], i) => (
                <button key={i} style={{
                  padding: '12px 14px', borderRadius: 'var(--r-md)',
                  border: '1px solid ' + (on ? 'var(--ink)' : 'var(--rule)'),
                  background: on ? 'var(--ink)' : 'var(--white)',
                  color: on ? 'var(--paper)' : 'var(--ink)',
                  textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{k}</div>
                  <div className="mono" style={{ fontSize: 10.5, color: on ? 'rgba(255,255,255,0.6)' : 'var(--ink-3)', marginTop: 4 }}>{p}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', padding: '18px 20px' }}>
            <div className="eyebrow">Motivo de consulta</div>
            <div style={{ marginTop: 10, padding: '12px 14px', border: '1px solid var(--rule-2)', borderRadius: 'var(--r-md)', background: 'var(--paper)', fontSize: 12.5, color: 'var(--ink-2)', minHeight: 80 }}>
              Control mensual de glucosa y hipertensión. Llevo registro de mediciones de glucómetro y deseo revisar ajuste de metformina.
            </div>
          </div>
        </div>

        {/* der: calendario + horas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div className="eyebrow">Selecciona la fecha</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--rule)', background: 'var(--white)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PDIcon kind="chev-l" size={12} color="var(--ink-2)" />
                </button>
                <span style={{ fontSize: 13, fontWeight: 500 }}>Mayo 2026</span>
                <button style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--rule)', background: 'var(--white)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PDIcon kind="chev" size={12} color="var(--ink-2)" />
                </button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
              {['D','L','M','M','J','V','S'].map((d, i) => <span key={i} className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', textAlign: 'center', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{d}</span>)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
              {[null, null, null, null].map((_, i) => <span key={'b' + i} />)}
              {days.map(d => {
                const isToday = d === today;
                const isSel = d === 20;
                const past = d < today;
                return (
                  <span key={d} style={{
                    height: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 8, fontSize: 13, fontWeight: isSel ? 500 : 400,
                    background: isSel ? 'var(--accent)' : 'transparent',
                    border: isToday && !isSel ? '1px solid var(--accent)' : 'none',
                    color: isSel ? '#fff' : past ? 'var(--ink-4)' : 'var(--ink)',
                    opacity: past ? 0.5 : 1, cursor: past ? 'default' : 'pointer',
                  }}>{d}</span>
                );
              })}
            </div>
          </div>

          <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', padding: '18px 20px' }}>
            <div className="eyebrow">Selecciona la hora · miércoles 20 may</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6, marginTop: 12 }}>
              {['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30'].map((h) => {
                const sel = h === '10:30';
                const taken = ['11:00', '12:00', '16:00'].includes(h);
                return (
                  <span key={h} style={{
                    padding: '11px 0', textAlign: 'center', borderRadius: 8,
                    background: sel ? 'var(--ink)' : 'var(--white)',
                    color: sel ? 'var(--paper)' : taken ? 'var(--ink-4)' : 'var(--ink)',
                    border: '1px solid ' + (sel ? 'var(--ink)' : 'var(--rule)'),
                    fontFamily: 'var(--mono)', fontSize: 12, fontWeight: sel ? 500 : 400,
                    textDecoration: taken ? 'line-through' : 'none',
                    cursor: taken ? 'default' : 'pointer',
                  }}>{h}</span>
                );
              })}
            </div>
          </div>

          <button style={{
            height: 52, background: 'var(--ink)', color: 'var(--paper)',
            borderRadius: 'var(--r-md)', border: 0, fontFamily: 'inherit',
            fontSize: 15, fontWeight: 500, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            Confirmar cita · 20 may · 10:30 <PDIcon kind="arrow" size={15} color="var(--paper)" />
          </button>
        </div>
      </div>
    </PDPage>
  );
}

// ─────────────────────────────────────────────────────────────
// 12 · MEDICAMENTOS (PC)
// ─────────────────────────────────────────────────────────────
function PDMeds() {
  const today = [
    { t: '06:30', name: 'Levotiroxina', dose: '50 µg', via: 'en ayunas',  state: 'tomado' },
    { t: '08:00', name: 'Metformina',   dose: '850 mg', via: 'desayuno',  state: 'tomado' },
    { t: '08:00', name: 'Losartán',     dose: '50 mg',  via: 'oral',      state: 'tomado' },
    { t: '20:00', name: 'Metformina',   dose: '850 mg', via: 'cena',      state: 'pendiente', next: true },
  ];
  const active = [
    { name: 'Levotiroxina',  dose: '50 µg',   freq: '1× día · en ayunas',     dr: 'Dr. Vega Ríos',   start: '20 sep 2023', tag: 'Hipotiroidismo' },
    { name: 'Metformina',    dose: '850 mg',  freq: '2× día · con alimentos', dr: 'Dra. Estrada',    start: '15 jul 2022', tag: 'Diabetes T2' },
    { name: 'Losartán',      dose: '50 mg',   freq: '1× día',                 dr: 'Dra. Estrada',    start: '10 ene 2023', tag: 'Hipertensión' },
  ];
  return (
    <PDPage active={3} title="Mis medicamentos" sub="3 tratamientos activos · 94% adherencia" height={1100}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 12, marginBottom: 18 }}>
        <div style={{ background: 'var(--ink)', color: 'var(--paper)', borderRadius: 'var(--r-lg)', padding: '20px 22px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', width: 220, height: 220, borderRadius: 999, background: 'radial-gradient(circle, rgba(0,180,216,0.32) 0%, transparent 70%)', top: -70, right: -50 }} />
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Adherencia · 30 días</span>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 56, lineHeight: 1, letterSpacing: '-0.02em', marginTop: 8 }}>94%</div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--accent-bright)', marginTop: 8, letterSpacing: '0.06em' }}>↑ 6 PTS · TU MÉDICO LO VE</div>
            </div>
            <svg viewBox="0 0 80 80" width="80" height="80">
              <circle cx="40" cy="40" r="32" stroke="rgba(255,255,255,0.15)" strokeWidth="7" fill="none" />
              <circle cx="40" cy="40" r="32" stroke="var(--accent-bright)" strokeWidth="7" fill="none"
                strokeDasharray={`${0.94 * 2 * Math.PI * 32} ${2 * Math.PI * 32}`}
                strokeDashoffset={2 * Math.PI * 32 * 0.25} strokeLinecap="round" />
            </svg>
          </div>
        </div>
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', padding: '16px 18px' }}>
          <div className="eyebrow">Tomas hoy</div>
          <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.03em', marginTop: 6, lineHeight: 1 }}>3 / 4</div>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--accent-deep)', marginTop: 6 }}>1 pendiente · 20:00</div>
        </div>
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', padding: '16px 18px' }}>
          <div className="eyebrow">Tratamientos</div>
          <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.03em', marginTop: 6, lineHeight: 1 }}>3</div>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 6 }}>crónicos · activos</div>
        </div>
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', padding: '16px 18px' }}>
          <div className="eyebrow">Renovación próxima</div>
          <div style={{ fontSize: 14.5, fontWeight: 500, marginTop: 8 }}>Metformina</div>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--mid)', marginTop: 4 }}>se acaba en 12 días</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.5fr', gap: 14 }}>
        {/* hoy */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--rule-2)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 500 }}>Hoy · viernes 15 mayo</h3>
          </div>
          {today.map((t, i) => {
            const isPending = t.state === 'pendiente';
            return (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '60px 1fr auto', gap: 14, alignItems: 'center',
                padding: '14px 20px',
                borderBottom: i < 3 ? '1px solid var(--rule-3)' : 0,
                background: t.next ? 'var(--paper-3)' : 'transparent',
                opacity: t.state === 'tomado' ? 0.6 : 1,
              }}>
                <span className="mono" style={{ fontSize: 13, fontWeight: 500, color: t.next ? 'var(--accent-deep)' : 'var(--ink-2)' }}>{t.t}</span>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 500, textDecoration: t.state === 'tomado' ? 'line-through' : 'none' }}>
                    {t.name} <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-3)', fontWeight: 400 }}>{t.dose}</span>
                  </div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>{t.via}</div>
                </div>
                {isPending
                  ? <button className="btn sm" style={{ height: 30, fontSize: 12, padding: '0 12px' }}>Marcar tomado</button>
                  : <PDIcon kind="check" size={15} color="var(--ok)" />}
              </div>
            );
          })}
        </div>

        {/* activos */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--rule-2)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 500 }}>Tratamientos activos</h3>
          </div>
          {active.map((m, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '40px 1.5fr 1fr 1fr auto', gap: 14, alignItems: 'center',
              padding: '14px 20px',
              borderBottom: i < active.length - 1 ? '1px solid var(--rule-3)' : 0,
            }}>
              <span style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--paper-3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <PDIcon kind="pill" size={16} color="var(--accent-deep)" />
              </span>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{m.name} <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 400 }}>{m.dose}</span></div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>{m.freq}</div>
              </div>
              <div>
                <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Para</div>
                <div style={{ fontSize: 12, marginTop: 2 }}>{m.tag}</div>
              </div>
              <div>
                <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Médico</div>
                <div className="mono" style={{ fontSize: 11, marginTop: 2 }}>{m.dr}</div>
                <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)' }}>desde {m.start}</div>
              </div>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, padding: '3px 8px', borderRadius: 999, background: 'rgba(28,140,90,0.12)', color: 'var(--ok)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>activo</span>
            </div>
          ))}
        </div>
      </div>
    </PDPage>
  );
}

// ─────────────────────────────────────────────────────────────
// 13 · PERFIL (PC)
// ─────────────────────────────────────────────────────────────
function PDPerfil() {
  return (
    <PDPage active={4} title="Mi perfil" sub="Cuenta · paciente" height={1080}
      right={<button className="btn sm ghost" style={{ height: 42, borderRadius: 'var(--r-md)' }}><PDIcon kind="edit" size={13} /> Editar</button>}
    >
      {/* hero */}
      <div style={{
        background: 'var(--ink)', color: 'var(--paper)',
        borderRadius: 'var(--r-xl)', padding: '28px 32px',
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 20px 40px -20px rgba(3,4,94,0.5)',
      }}>
        <div style={{ position: 'absolute', width: 360, height: 360, borderRadius: 999, background: 'radial-gradient(circle, rgba(0,180,216,0.28) 0%, transparent 70%)', top: -120, right: -90 }} />
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 24, alignItems: 'center' }}>
          <span style={{ width: 96, height: 96, borderRadius: 24, background: 'var(--accent-bright)', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 48 }}>DV</span>
          <div>
            <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Paciente</span>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 44, lineHeight: 1, fontWeight: 400, letterSpacing: '-0.02em', marginTop: 8 }}>
              Damián Vega Ríos
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10, color: 'rgba(255,255,255,0.7)', fontSize: 13.5 }}>
              <span>♂ 21 años · 22 mar 2005</span>
              <span style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.2)' }} />
              <span>O+ · 175 cm · 74.8 kg</span>
              <span style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.2)' }} />
              <span className="mono">CURP VRD050322HDFGSM05</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, padding: '4px 10px', borderRadius: 999, background: 'rgba(184,50,50,0.22)', color: '#FFC1BC', letterSpacing: '0.08em' }}>3 ALERGIAS</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, padding: '4px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.14)', color: 'var(--paper)', letterSpacing: '0.08em' }}>3 DX</span>
          </div>
        </div>
      </div>

      {/* alerta contacto emergencia */}
      <div style={{ marginTop: 14, background: 'var(--alert-soft)', border: '1px solid var(--alert-rule)', borderRadius: 'var(--r-lg)', padding: '16px 22px', display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 16, alignItems: 'center' }}>
        <PDIcon kind="alert" size={20} color="var(--alert)" />
        <div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--alert)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Contacto de emergencia · sin configurar</div>
          <div style={{ fontSize: 13, marginTop: 4, color: 'var(--ink-2)' }}>
            Si pierdes el conocimiento, paramédicos pueden contactar a alguien en segundos.
          </div>
        </div>
        <button style={{ height: 36, padding: '0 14px', borderRadius: 8, background: 'var(--alert)', color: '#fff', border: 0, fontFamily: 'inherit', fontSize: 12.5, fontWeight: 500, cursor: 'pointer' }}>
          Agregar contacto
        </button>
      </div>

      {/* 2 columnas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--rule-2)' }}>
              <h3 style={{ fontSize: 14.5, fontWeight: 500 }}>Datos personales</h3>
            </div>
            {[
              ['Nombre',  'Damián Vega Ríos'],
              ['CURP',    'VRD050322HDFGSM05'],
              ['Edad',    '21 años · 22 mar 2005'],
              ['Género',  'Masculino'],
              ['Sangre',  'O+'],
            ].map(([k, v], i) => (
              <div key={k} style={{ display: 'grid', gridTemplateColumns: '110px 1fr auto', gap: 14, alignItems: 'center', padding: '12px 18px', borderBottom: i < 4 ? '1px solid var(--rule-3)' : 0 }}>
                <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{k}</span>
                <span style={{ fontSize: 13 }}>{v}</span>
                <PDIcon kind="edit" size={12} color="var(--ink-3)" />
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--rule-2)' }}>
              <h3 style={{ fontSize: 14.5, fontWeight: 500 }}>Estilo de vida</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
              {[
                ['flame', 'Actividad física', 'Sedentario'],
                ['sun',   'Sueño',            '6.5 h media'],
              ].map(([icon, k, v], i) => (
                <div key={i} style={{ padding: '14px 18px', borderRight: i === 0 ? '1px solid var(--rule-2)' : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <PDIcon kind={icon} size={14} color="var(--accent-deep)" />
                    <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{k}</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 500, marginTop: 8 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--rule-2)' }}>
              <h3 style={{ fontSize: 14.5, fontWeight: 500 }}>Contacto</h3>
            </div>
            {[
              ['mail',  'd.vega@gmail.com',     'principal · 2FA activo'],
              ['phone', '+52 55 1278 9034',     'móvil · WhatsApp'],
              ['pin',   'Col. Polanco · CDMX',  'dirección registrada'],
            ].map(([icon, v, sub], i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '32px 1fr auto', gap: 12, alignItems: 'center', padding: '12px 18px', borderBottom: i < 2 ? '1px solid var(--rule-3)' : 0 }}>
                <PDIcon kind={icon} size={15} color="var(--ink-2)" />
                <div>
                  <div style={{ fontSize: 13 }}>{v}</div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 1 }}>{sub}</div>
                </div>
                <PDIcon kind="edit" size={12} color="var(--ink-3)" />
              </div>
            ))}
          </div>

          {/* logout */}
          <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--alert)' }}>Cerrar sesión</div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>sesión activa hace 18 min · MacBook · CDMX</div>
            </div>
            <button style={{
              height: 36, padding: '0 14px', borderRadius: 'var(--r-md)',
              border: '1px solid var(--alert-rule)', background: 'var(--alert-soft)', color: 'var(--alert)',
              fontFamily: 'inherit', fontSize: 12.5, fontWeight: 500, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              <PDIcon kind="logout" size={13} color="var(--alert)" /> Salir
            </button>
          </div>

          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', textAlign: 'center', letterSpacing: '0.04em' }}>
            imedexp · paciente · v 4.1.7 · build 2026.05.14
          </div>
        </div>
      </div>
    </PDPage>
  );
}

// ─────────────────────────────────────────────────────────────
// Compose
// ─────────────────────────────────────────────────────────────
const wrapD = (Screen, label) => () => <div data-screen-label={`Paciente desktop · ${label}`}><Screen /></div>;
Object.assign(window, {
  PDInicioScreen:      wrapD(PDInicio,      'inicio'),
  PDHistResumenScreen: wrapD(PDHistResumen, 'historial · resumen'),
  PDAlergiasScreen:    wrapD(PDAlergias,    'alergias'),
  PDEnfScreen:         wrapD(PDEnf,         'enfermedades'),
  PDCirugiasScreen:    wrapD(PDCirugias,    'cirugías'),
  PDFamiliaScreen:     wrapD(PDFamilia,     'familia'),
  PDVacunasScreen:     wrapD(PDVacunas,     'vacunas'),
  PDPesoScreen:        wrapD(PDPeso,        'peso/IMC'),
  PDGlucosaScreen:     wrapD(PDGlucosa,     'glucosa'),
  PDCitasScreen:       wrapD(PDCitas,       'citas'),
  PDAgendarScreen:     wrapD(PDAgendar,     'agendar cita'),
  PDMedsScreen:        wrapD(PDMeds,        'medicamentos'),
  PDPerfilScreen:      wrapD(PDPerfil,      'perfil'),
});
