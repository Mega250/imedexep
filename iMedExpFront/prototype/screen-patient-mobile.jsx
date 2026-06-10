// imedexp · App del paciente — rediseño completo del AI-slop oscuro
// 12 pantallas móviles a 390 × 844 dentro de IOSDevice. Reemplaza:
// "Hola, DAMIAN!", Resumen, Alergias, Enf. crónicas, Cirugías (vacío),
// Antecedentes, Vacunas, Signos (vacío), Peso/IMC, Síntomas, Glucosa,
// Mis Citas, Agendar cita, Mis Medicamentos, Mi Perfil.

// ─────────────────────────────────────────────────────────────
// Icon set
// ─────────────────────────────────────────────────────────────
const PIcon = ({ kind, size = 18, color = 'currentColor' }) => {
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
    case 'clock':  return svg(<><circle cx="12" cy="12" r="8" /><path d="M12 7 L12 12 L15 14" /></>);
    case 'logout': return svg(<><path d="M10 4 L4 4 L4 20 L10 20" /><path d="M14 8 L18 12 L14 16" /><line x1="9" y1="12" x2="18" y2="12" /></>);
    case 'sun':    return svg(<><circle cx="12" cy="12" r="4" /><path d="M12 2 L12 4 M12 20 L12 22 M2 12 L4 12 M20 12 L22 12 M4.5 4.5 L6 6 M18 18 L19.5 19.5 M4.5 19.5 L6 18 M18 6 L19.5 4.5" /></>);
    case 'flame':  return svg(<path d="M12 3 C13 8 17 9 17 14 A5 5 0 0 1 7 14 C7 11 9 11 9 8 C10 9 10 10 11 10 C11 7 12 5 12 3 Z" />);
    case 'pin':    return svg(<><path d="M12 3 C8.5 3 6 5.5 6 9 C6 14 12 21 12 21 C12 21 18 14 18 9 C18 5.5 15.5 3 12 3 Z" /><circle cx="12" cy="9" r="2.2" /></>);
    default:       return svg(<circle cx="12" cy="12" r="8" />);
  }
};

// ─────────────────────────────────────────────────────────────
// Shell
// ─────────────────────────────────────────────────────────────
const TABS = [
  ['home',   'Inicio'],
  ['folder', 'Historial'],
  ['cal',    'Citas'],
  ['pill',   'Meds'],
  ['user',   'Perfil'],
];

function PTabBar({ active }) {
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      padding: '8px 10px 28px',
      background: 'rgba(241,250,254,0.94)',
      backdropFilter: 'blur(18px)',
      borderTop: '1px solid var(--rule-2)',
      display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
    }}>
      {TABS.map(([icon, label], i) => {
        const on = i === active;
        return (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '4px 0' }}>
            <span style={{
              width: 36, height: 36, borderRadius: 10,
              background: on ? 'var(--ink)' : 'transparent',
              color: on ? 'var(--paper)' : 'var(--ink-3)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <PIcon kind={icon} size={18} />
            </span>
            <span className="mono" style={{
              fontSize: 9.5, letterSpacing: '0.04em',
              color: on ? 'var(--ink)' : 'var(--ink-3)',
              fontWeight: on ? 500 : 400,
            }}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

function PFrame({ children, active }) {
  return (
    <div style={{
      width: 390, height: 844, background: 'var(--paper)',
      fontFamily: 'var(--sans)', color: 'var(--ink)',
      position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      {children}
      <PTabBar active={active} />
    </div>
  );
}

function PTop({ title, sub, right, accent }) {
  return (
    <div style={{ padding: '8px 22px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--rule-2)' }}>
      <div>
        <span className="eyebrow">{sub}</span>
        <h1 style={{
          fontFamily: 'var(--serif)', fontSize: 32, lineHeight: 1, fontWeight: 400,
          letterSpacing: '-0.02em', marginTop: 4,
          color: accent ? 'var(--accent-deep)' : 'var(--ink)',
        }}>{title}</h1>
      </div>
      {right}
    </div>
  );
}

// chips de subsección para Historial
const HIST_CHIPS = ['Resumen', 'Alergias', 'Enf. crónicas', 'Cirugías', 'Familia', 'Vacunas', 'Signos', 'Peso/IMC', 'Síntomas', 'Glucosa'];

function HistChips({ active }) {
  return (
    <div style={{ padding: '10px 22px 4px', overflowX: 'auto', display: 'flex', gap: 6, borderBottom: '1px solid var(--rule-2)' }}>
      {HIST_CHIPS.map((c, i) => (
        <span key={c} style={{
          padding: '6px 12px', borderRadius: 999, whiteSpace: 'nowrap',
          border: '1px solid ' + (i === active ? 'var(--ink)' : 'var(--rule)'),
          background: i === active ? 'var(--ink)' : 'var(--white)',
          color: i === active ? 'var(--paper)' : 'var(--ink-2)',
          fontSize: 11.5, fontWeight: 500,
        }}>{c}</span>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 1 · INICIO — sustituye al hero azul saturado
// ─────────────────────────────────────────────────────────────
function PInicio() {
  return (
    <PFrame active={0}>
      <div style={{ padding: '8px 22px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="eyebrow">Viernes · 15 mayo</span>
          <span style={{
            width: 32, height: 32, borderRadius: 99, background: 'var(--ink)', color: 'var(--paper)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--mono)', fontSize: 12,
          }}>DV</span>
        </div>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 36, lineHeight: 1, fontWeight: 400, letterSpacing: '-0.02em', marginTop: 8 }}>
          Hola,<br /><span style={{ color: 'var(--accent-deep)' }}>Damián</span>.
        </h1>
        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 8, letterSpacing: '0.04em' }}>
          Tu salud · de un vistazo
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '18px 22px 130px' }}>
        {/* alerta alergia */}
        <div style={{
          background: 'var(--alert-soft)', border: '1px solid var(--alert-rule)',
          borderRadius: 'var(--r-lg)', padding: '12px 14px',
          display: 'grid', gridTemplateColumns: '28px 1fr', gap: 10, alignItems: 'center',
        }}>
          <span style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--alert)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <PIcon kind="alert" size={15} color="#fff" />
          </span>
          <div>
            <div className="mono" style={{ fontSize: 9.5, color: 'var(--alert)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>3 alergias registradas</div>
            <div style={{ fontSize: 13, fontWeight: 500, marginTop: 2 }}>Penicilina · ácaros · látex</div>
          </div>
        </div>

        {/* sin próxima cita pero diseñado bien */}
        <div style={{
          background: 'var(--ink)', color: 'var(--paper)',
          borderRadius: 'var(--r-xl)', padding: '18px 20px', marginTop: 14,
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 20px 40px -20px rgba(3,4,94,0.5)',
        }}>
          <div style={{ position: 'absolute', width: 220, height: 220, borderRadius: 999, background: 'radial-gradient(circle, rgba(0,180,216,0.3) 0%, transparent 70%)', top: -70, right: -50 }} />
          <div style={{ position: 'relative' }}>
            <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Próxima consulta</span>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 26, lineHeight: 1.05, fontWeight: 400, marginTop: 6, letterSpacing: '-0.02em' }}>
              Aún no tienes<br />una cita agendada.
            </div>
            <div className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 10 }}>
              tu último doctor · Dr. Vega Ríos · cirugía general
            </div>
            <button style={{
              marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 8,
              height: 38, padding: '0 16px', borderRadius: 'var(--r-md)',
              background: 'var(--accent-bright)', color: 'var(--ink)', border: 0,
              fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>
              <PIcon kind="plus" size={14} color="var(--ink)" /> Agendar cita
            </button>
          </div>
        </div>

        {/* acceso rápido — 4 tiles grandes */}
        <div className="eyebrow" style={{ marginTop: 20, marginBottom: 10 }}>Acceso rápido</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            ['qr',    'Compartir',     'QR para mi médico', true],
            ['cal',   'Mis citas',     'Ver y agendar',     false],
            ['pill',  'Medicamentos',  'Tomar a tiempo',    false],
            ['folder','Historial',     'Todo en uno',       false],
          ].map(([icon, k, sub, on], i) => (
            <button key={i} style={{
              padding: '14px 14px', minHeight: 92,
              background: on ? 'var(--paper-3)' : 'var(--white)',
              border: '1px solid ' + (on ? 'var(--accent-rule)' : 'var(--rule)'),
              borderRadius: 'var(--r-lg)', textAlign: 'left',
              fontFamily: 'inherit', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', gap: 6,
            }}>
              <span style={{
                width: 32, height: 32, borderRadius: 9,
                background: on ? 'var(--accent-bright)' : 'var(--paper-3)',
                color: on ? 'var(--ink)' : 'var(--accent-deep)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <PIcon kind={icon} size={16} />
              </span>
              <div style={{ fontSize: 13.5, fontWeight: 500, marginTop: 4 }}>{k}</div>
              <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: '0.04em' }}>{sub}</div>
            </button>
          ))}
        </div>

        {/* resumen rápido */}
        <div className="eyebrow" style={{ marginTop: 20, marginBottom: 10 }}>Tu salud · en números</div>
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
          {[
            ['heart', 'Frecuencia',  '72', 'bpm', 'normal',  'ok'],
            ['drop',  'Glucosa',     '89', 'mg/dL', 'en ayunas · bajo', 'ok'],
            ['scale', 'IMC',         '24.4', '',     'normal · 74.8 kg', 'ok'],
            ['lung',  'Saturación',  '98', '%',    'SpO₂ · normal', 'ok'],
          ].map(([icon, k, n, u, sub], i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '34px 1fr auto', gap: 12, alignItems: 'center',
              padding: '13px 16px',
              borderBottom: i < 3 ? '1px solid var(--rule-3)' : 0,
            }}>
              <span style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--paper-3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <PIcon kind={icon} size={15} color="var(--accent-deep)" />
              </span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{k}</div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 2 }}>{sub}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 17, fontWeight: 500, letterSpacing: '-0.02em' }}>{n}</span>
                <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginLeft: 3 }}>{u}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// 2 · HISTORIAL · RESUMEN
// ─────────────────────────────────────────────────────────────
function PHistResumen() {
  return (
    <PFrame active={1}>
      <PTop sub="Mi historial · Damián Vega" title="Resumen" />
      <HistChips active={0} />
      <div style={{ flex: 1, overflow: 'auto', padding: '14px 22px 130px' }}>
        {/* identidad pequeña */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--accent-bright)', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 20 }}>DV</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>Damián Vega Ríos</div>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>♂ 21 años · O+ · 175 cm · 74.8 kg</div>
          </div>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: 9.5, padding: '3px 8px', borderRadius: 999,
            background: 'var(--paper-3)', color: 'var(--accent-deep)', letterSpacing: '0.08em',
          }}>NORMAL</span>
        </div>

        {/* alertas */}
        <div className="eyebrow" style={{ marginTop: 18, marginBottom: 8 }}>Lo importante</div>
        <div style={{ background: 'var(--alert-soft)', border: '1px solid var(--alert-rule)', borderRadius: 'var(--r-lg)', padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, padding: '3px 7px', borderRadius: 4, background: 'var(--alert)', color: '#fff', letterSpacing: '0.08em' }}>ALERGIA GRAVE</span>
            <span className="mono" style={{ fontSize: 10, color: 'var(--alert)' }}>avisa a cualquier médico</span>
          </div>
          <div style={{ marginTop: 8, fontSize: 13.5 }}>
            <strong>Penicilina</strong> · anafilaxia (2018)
          </div>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>
            Evitar β-lactámicos. Alternativa: macrólidos.
          </div>
        </div>

        {/* dx + signos */}
        <div className="eyebrow" style={{ marginTop: 18, marginBottom: 8 }}>Diagnósticos activos · 3</div>
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
          {[
            ['Diabetes Mellitus tipo 2', 'En tratamiento · 15 jul 2022', 'medio'],
            ['Hipertensión Arterial Sistémica', 'Controlada · 10 ene 2023', 'medio'],
            ['Hipotiroidismo Primario', 'En tratamiento · 20 sep 2023', 'bajo'],
          ].map(([k, sub, pri], i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '3px 1fr auto', gap: 12, alignItems: 'center',
              padding: '12px 14px',
              borderBottom: i < 2 ? '1px solid var(--rule-3)' : 0,
            }}>
              <span style={{ width: 3, height: 24, borderRadius: 99, background: pri === 'medio' ? 'var(--mid)' : 'var(--ok)' }} />
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{k}</div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 2 }}>{sub}</div>
              </div>
              <PIcon kind="chev" size={13} color="var(--ink-3)" />
            </div>
          ))}
        </div>

        {/* signos compactos */}
        <div className="eyebrow" style={{ marginTop: 18, marginBottom: 8 }}>Última toma · 4 mar 2026</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            ['heart', 'Frecuencia', '72', 'bpm',   'normal'],
            ['drop',  'Glucosa',    '89', 'mg/dL', 'bajo'],
            ['scale', 'IMC',        '24.4', '',    'normal'],
            ['lung',  'Saturación', '98', '%',    'normal'],
          ].map(([icon, k, n, u, tag], i) => (
            <div key={i} style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)', padding: '10px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <PIcon kind={icon} size={13} color="var(--accent-deep)" />
                <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{k}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 6 }}>
                <span style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em' }}>{n}</span>
                <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>{u}</span>
              </div>
              <div className="mono" style={{ fontSize: 9.5, color: 'var(--ok)', marginTop: 4 }}>· {tag}</div>
            </div>
          ))}
        </div>

        {/* atajos a categorías */}
        <div className="eyebrow" style={{ marginTop: 18, marginBottom: 8 }}>Más detalle</div>
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
          {[
            ['vax',  'Vacunas',           '6 dosis · al día',     '6'],
            ['cut',  'Cirugías',          '0 · sin antecedentes', '—'],
            ['tree', 'Antecedentes',      '5 familiares',         '5'],
            ['spark','Síntomas activos',  '2 leves',              '2'],
          ].map(([icon, k, sub, n], i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '34px 1fr auto auto', gap: 10, alignItems: 'center',
              padding: '12px 14px',
              borderBottom: i < 3 ? '1px solid var(--rule-3)' : 0,
            }}>
              <span style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--paper-3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <PIcon kind={icon} size={14} color="var(--accent-deep)" />
              </span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{k}</div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 1 }}>{sub}</div>
              </div>
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-2)', fontWeight: 500 }}>{n}</span>
              <PIcon kind="chev" size={13} color="var(--ink-3)" />
            </div>
          ))}
        </div>
      </div>
    </PFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// 3 · HISTORIAL · ALERGIAS
// ─────────────────────────────────────────────────────────────
function PHistAlergias() {
  const alergias = [
    { name: 'Penicilina',     sev: 'grave',     kind: 'medicamento', date: '12 mar 2018', reaccion: 'Urticaria + angioedema generalizado', tx: 'Adrenalina + evitación', notas: 'Documentada en hospitalización 2018. Anafilaxia. Usar macrólidos.' },
    { name: 'Ácaros del polvo', sev: 'moderada', kind: 'ambiental',   date: '20 jun 2015', reaccion: 'Rinitis alérgica + conjuntivitis',     tx: 'Loratadina PRN',         notas: 'Perenne, exacerba en temporada de lluvia.' },
    { name: 'Látex',          sev: 'leve',      kind: 'contacto',    date: '1 sep 2020',  reaccion: 'Eritema en manos',                       tx: 'Guantes libres de látex',notas: 'Notificada para procedimientos médicos.' },
  ];
  const sevColor = (s) => s === 'grave' ? 'var(--alert)' : s === 'moderada' ? 'var(--mid)' : 'var(--ok)';
  return (
    <PFrame active={1}>
      <PTop sub="Mi historial" title="Alergias" right={
        <button style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--ink)', color: 'var(--paper)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 0, cursor: 'pointer' }}>
          <PIcon kind="plus" size={16} color="var(--paper)" />
        </button>
      } />
      <HistChips active={1} />
      <div style={{ flex: 1, overflow: 'auto', padding: '14px 22px 130px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
          {[['Grave', '1', 'var(--alert)'], ['Moderada', '1', 'var(--mid)'], ['Leve', '1', 'var(--ok)']].map(([k, n, c]) => (
            <div key={k} style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)', padding: '10px 12px' }}>
              <div className="mono" style={{ fontSize: 9.5, color: c, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{k}</div>
              <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 4, lineHeight: 1 }}>{n}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {alergias.map((a, i) => (
            <div key={i} style={{
              background: 'var(--white)',
              border: '1px solid var(--rule)',
              borderLeft: '4px solid ' + sevColor(a.sev),
              borderRadius: 'var(--r-md)', padding: '13px 14px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      fontFamily: 'var(--mono)', fontSize: 9.5, padding: '3px 7px', borderRadius: 4,
                      background: a.sev === 'grave' ? 'var(--alert-soft)' : a.sev === 'moderada' ? 'rgba(201,122,18,0.12)' : 'rgba(28,140,90,0.12)',
                      color: sevColor(a.sev),
                      letterSpacing: '0.1em', textTransform: 'uppercase',
                    }}>{a.sev}</span>
                    <span className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: '0.06em' }}>· {a.kind}</span>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 500, marginTop: 6 }}>{a.name}</div>
                </div>
                <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>{a.date}</span>
              </div>
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '78px 1fr', gap: 8, fontSize: 12 }}>
                  <span className="mono" style={{ color: 'var(--ink-3)', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Reacción</span>
                  <span>{a.reaccion}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '78px 1fr', gap: 8, fontSize: 12 }}>
                  <span className="mono" style={{ color: 'var(--ink-3)', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Tratamiento</span>
                  <span>{a.tx}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '78px 1fr', gap: 8, fontSize: 12 }}>
                  <span className="mono" style={{ color: 'var(--ink-3)', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Notas</span>
                  <span style={{ color: 'var(--ink-2)' }}>{a.notas}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// 4 · HISTORIAL · ENFERMEDADES CRÓNICAS
// ─────────────────────────────────────────────────────────────
function PHistEnfermedades() {
  const enfs = [
    { dx: 'Diabetes Mellitus tipo 2',         risk: 'medio', dxDate: '15 jul 2022', tx: 'Metformina 850 mg c/12h c/alimentos', freq: 'Mensual', last: '1 abr 2026', next: '15 may 2026' },
    { dx: 'Hipertensión Arterial Sistémica',  risk: 'medio', dxDate: '10 ene 2023', tx: 'Losartán 50 mg c/24h',                freq: 'Mensual', last: '1 abr 2026', next: '15 may 2026' },
    { dx: 'Hipotiroidismo Primario',          risk: 'bajo',  dxDate: '20 sep 2023', tx: 'Levotiroxina 50 µg en ayunas',         freq: 'Semestral', last: '15 ene 2026', next: '15 jul 2026' },
  ];
  const riskColor = (r) => r === 'medio' ? 'var(--mid)' : 'var(--ok)';
  return (
    <PFrame active={1}>
      <PTop sub="Mi historial" title="Enfermedades" right={
        <button style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--ink)', color: 'var(--paper)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 0, cursor: 'pointer' }}>
          <PIcon kind="plus" size={16} color="var(--paper)" />
        </button>
      } />
      <HistChips active={2} />
      <div style={{ flex: 1, overflow: 'auto', padding: '14px 22px 130px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {enfs.map((e, i) => (
            <div key={i} style={{
              background: 'var(--white)', border: '1px solid var(--rule)',
              borderLeft: '4px solid ' + riskColor(e.risk),
              borderRadius: 'var(--r-md)', padding: '14px 14px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      fontFamily: 'var(--mono)', fontSize: 9.5, padding: '3px 7px', borderRadius: 4,
                      background: 'var(--paper-3)', color: 'var(--accent-deep)', letterSpacing: '0.1em', textTransform: 'uppercase',
                    }}>EN TRATAMIENTO</span>
                    <span style={{
                      fontFamily: 'var(--mono)', fontSize: 9.5, padding: '3px 7px', borderRadius: 4,
                      background: e.risk === 'medio' ? 'rgba(201,122,18,0.12)' : 'rgba(28,140,90,0.12)',
                      color: riskColor(e.risk), letterSpacing: '0.1em', textTransform: 'uppercase',
                    }}>RIESGO {e.risk}</span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 500, marginTop: 6 }}>{e.dx}</div>
                </div>
              </div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 2 }}>diagnóstico: {e.dxDate}</div>

              <div style={{ marginTop: 10, padding: '10px 12px', background: 'var(--paper)', borderRadius: 'var(--r-md)' }}>
                <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Tratamiento</div>
                <div style={{ fontSize: 12.5, marginTop: 4 }}>{e.tx}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginTop: 10 }}>
                <div>
                  <div className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Frecuencia</div>
                  <div style={{ fontSize: 12, marginTop: 2 }}>{e.freq}</div>
                </div>
                <div>
                  <div className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Última</div>
                  <div className="mono" style={{ fontSize: 11.5, marginTop: 2 }}>{e.last}</div>
                </div>
                <div>
                  <div className="mono" style={{ fontSize: 9, color: 'var(--accent-deep)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Próxima</div>
                  <div className="mono" style={{ fontSize: 11.5, marginTop: 2, color: 'var(--accent-deep)', fontWeight: 500 }}>{e.next}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// 5 · HISTORIAL · CIRUGÍAS (vacío bien diseñado, no "AI-slop +")
// ─────────────────────────────────────────────────────────────
function PHistCirugias() {
  return (
    <PFrame active={1}>
      <PTop sub="Mi historial" title="Cirugías" right={
        <button style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--ink)', color: 'var(--paper)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 0, cursor: 'pointer' }}>
          <PIcon kind="plus" size={16} color="var(--paper)" />
        </button>
      } />
      <HistChips active={3} />
      <div style={{ flex: 1, overflow: 'auto', padding: '14px 22px 130px' }}>
        {/* mensaje útil — no genérico "sin cirugías +" */}
        <div style={{
          background: 'var(--paper-3)', border: '1px solid var(--accent-rule)',
          borderRadius: 'var(--r-xl)', padding: '18px 18px',
        }}>
          <span style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--white)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <PIcon kind="check" size={18} color="var(--ok)" />
          </span>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 22, lineHeight: 1.1, fontWeight: 400, marginTop: 12, letterSpacing: '-0.02em' }}>
            Sin antecedentes<br />quirúrgicos.
          </div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 8 }}>
            no se ha registrado ninguna intervención previa
          </div>
          <button style={{
            marginTop: 14, height: 36, padding: '0 14px', borderRadius: 'var(--r-md)',
            background: 'var(--ink)', color: 'var(--paper)', border: 0,
            fontFamily: 'inherit', fontSize: 12.5, fontWeight: 500, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            <PIcon kind="plus" size={13} color="var(--paper)" /> Registrar una cirugía
          </button>
        </div>

        {/* qué se podría registrar */}
        <div className="eyebrow" style={{ marginTop: 22, marginBottom: 10 }}>Qué necesita tu médico</div>
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
          {[
            ['Procedimiento y fecha',     'p. ej. apendicectomía, 22 abr 2020'],
            ['Hospital y cirujano',       'institución + médico tratante'],
            ['Anestesia y complicaciones','tipo de anestesia, reacciones'],
            ['Cuidados post-operatorios', 'plan de seguimiento si aplica'],
          ].map(([k, sub], i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '20px 1fr', gap: 12, alignItems: 'flex-start',
              padding: '12px 14px',
              borderBottom: i < 3 ? '1px solid var(--rule-3)' : 0,
            }}>
              <span className="mono" style={{ fontSize: 11, color: 'var(--accent-deep)', fontWeight: 500 }}>0{i + 1}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{k}</div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 2 }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// 6 · HISTORIAL · ANTECEDENTES FAMILIARES
// ─────────────────────────────────────────────────────────────
function PHistAntecedentes() {
  const ant = [
    { dx: 'Diabetes Mellitus tipo 2', who: 'Padre',           age: '45 a', state: 'vivo' },
    { dx: 'Hipertensión Arterial',    who: 'Padre',           age: '42 a', state: 'vivo' },
    { dx: 'Diabetes Mellitus tipo 2', who: 'Abuela materna',  age: '55 a', state: 'falleció', cause: 'IRC por nefropatía diabética' },
    { dx: 'Hipotiroidismo',           who: 'Madre',           age: '38 a', state: 'vivo' },
    { dx: 'Infarto agudo de miocardio', who: 'Abuelo paterno', age: '68 a', state: 'falleció', cause: 'IAM' },
  ];
  return (
    <PFrame active={1}>
      <PTop sub="Mi historial" title="Familia" right={
        <button style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--ink)', color: 'var(--paper)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 0, cursor: 'pointer' }}>
          <PIcon kind="plus" size={16} color="var(--paper)" />
        </button>
      } />
      <HistChips active={4} />
      <div style={{ flex: 1, overflow: 'auto', padding: '14px 22px 130px' }}>
        {/* alerta hereditaria útil */}
        <div style={{
          background: 'var(--paper-3)', border: '1px solid var(--accent-rule)',
          borderRadius: 'var(--r-lg)', padding: '12px 14px',
          display: 'grid', gridTemplateColumns: '32px 1fr', gap: 10, alignItems: 'center',
        }}>
          <PIcon kind="alert" size={18} color="var(--accent-deep)" />
          <div>
            <div className="mono" style={{ fontSize: 9.5, color: 'var(--accent-deep)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Patrón hereditario</div>
            <div style={{ fontSize: 12.5, marginTop: 2 }}>
              <strong>Diabetes</strong> y <strong>cardio-metabólico</strong> en línea paterna y materna.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
          {ant.map((a, i) => (
            <div key={i} style={{
              background: 'var(--white)', border: '1px solid var(--rule)',
              borderRadius: 'var(--r-md)', padding: '12px 14px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{
                    fontFamily: 'var(--mono)', fontSize: 9.5, padding: '3px 7px', borderRadius: 4,
                    background: a.state === 'vivo' ? 'rgba(28,140,90,0.12)' : 'var(--alert-soft)',
                    color: a.state === 'vivo' ? 'var(--ok)' : 'var(--alert)',
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                  }}>{a.state}</span>
                  <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.06em' }}>· {a.who} · {a.age}</span>
                </div>
                <PIcon kind="edit" size={13} color="var(--ink-3)" />
              </div>
              <div style={{ fontSize: 14, fontWeight: 500, marginTop: 6 }}>{a.dx}</div>
              {a.cause && (
                <div style={{ marginTop: 6, padding: '6px 9px', background: 'var(--alert-soft)', borderRadius: 6 }}>
                  <span className="mono" style={{ fontSize: 9.5, color: 'var(--alert)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>causa de fallecimiento · </span>
                  <span style={{ fontSize: 11.5 }}>{a.cause}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </PFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// 7 · HISTORIAL · VACUNAS
// ─────────────────────────────────────────────────────────────
function PHistVacunas() {
  const vacs = [
    { name: 'COVID-19', maker: 'Pfizer-BioNTech', dose: '1ª dosis',     date: '10 may 2021', age: '16 a', notes: 'Sin eventos adversos' },
    { name: 'COVID-19', maker: 'Pfizer-BioNTech', dose: '2ª dosis',     date: '1 jun 2021',  age: '16 a', notes: 'Fiebre leve 24h' },
    { name: 'COVID-19 Refuerzo', maker: 'Moderna', dose: 'Refuerzo',   date: '14 feb 2022', age: '17 a', notes: 'Sin reacciones' },
    { name: 'Influenza Estacional', maker: 'Sanofi', dose: 'Anual',    date: '15 oct 2025', age: '21 a', notes: 'Recomendada por dx diabetes' },
    { name: 'Tétanos (Td)', maker: 'MSD', dose: 'Refuerzo',            date: '25 abr 2020', age: '15 a', notes: 'Hospitalización apendicectomía' },
    { name: 'Neumococo (PCV13)', maker: 'Pfizer', dose: 'Única',       date: '20 ago 2022', age: '17 a', notes: 'Indicada por dx base' },
  ];
  return (
    <PFrame active={1}>
      <PTop sub="Mi historial" title="Vacunas" right={
        <button style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--ink)', color: 'var(--paper)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 0, cursor: 'pointer' }}>
          <PIcon kind="plus" size={16} color="var(--paper)" />
        </button>
      } />
      <HistChips active={5} />
      <div style={{ flex: 1, overflow: 'auto', padding: '14px 22px 130px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
          <div style={{ background: 'var(--paper-3)', border: '1px solid var(--accent-rule)', borderRadius: 'var(--r-md)', padding: '12px 14px' }}>
            <div className="eyebrow">Esquema</div>
            <div style={{ fontSize: 19, fontWeight: 500, marginTop: 6, letterSpacing: '-0.02em' }}>Al día</div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 4 }}>6 dosis · 5 distintas</div>
          </div>
          <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)', padding: '12px 14px' }}>
            <div className="eyebrow">Próxima</div>
            <div style={{ fontSize: 14, fontWeight: 500, marginTop: 6 }}>Influenza 2026</div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--accent-deep)', marginTop: 4 }}>oct 2026 · en 5 m</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {vacs.map((v, i) => (
            <div key={i} style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)', padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500 }}>{v.name}</div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 2 }}>{v.maker} · {v.age}</div>
                </div>
                <span style={{
                  fontFamily: 'var(--mono)', fontSize: 9.5, padding: '3px 8px', borderRadius: 999,
                  background: 'var(--paper-3)', color: 'var(--accent-deep)', letterSpacing: '0.08em', whiteSpace: 'nowrap',
                }}>{v.dose}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--rule-2)' }}>
                <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-2)' }}>{v.date}</span>
                <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>{v.notes}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// 8 · HISTORIAL · PESO / IMC
// ─────────────────────────────────────────────────────────────
function PHistPeso() {
  const data = [
    { d: 'sep 25', w: 73.2, imc: 23.9 },
    { d: 'nov 25', w: 73.8, imc: 24.1 },
    { d: 'ene 26', w: 74.5, imc: 24.3 },
    { d: 'mar 26', w: 74.8, imc: 24.4 },
  ];
  // sparkline
  const max = 25, min = 23.5;
  const W = 320, H = 100;
  const pts = data.map((p, i) => {
    const x = (i / (data.length - 1)) * (W - 20) + 10;
    const y = H - ((p.imc - min) / (max - min)) * (H - 20) - 10;
    return [x, y];
  });
  const path = pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ',' + p[1]).join(' ');
  return (
    <PFrame active={1}>
      <PTop sub="Mi historial" title="Peso e IMC" right={
        <button style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--ink)', color: 'var(--paper)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 0, cursor: 'pointer' }}>
          <PIcon kind="plus" size={16} color="var(--paper)" />
        </button>
      } />
      <HistChips active={7} />
      <div style={{ flex: 1, overflow: 'auto', padding: '14px 22px 130px' }}>
        {/* hero card actual */}
        <div style={{
          background: 'var(--ink)', color: 'var(--paper)',
          borderRadius: 'var(--r-xl)', padding: '18px 20px',
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 20px 40px -20px rgba(3,4,94,0.5)',
        }}>
          <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: 999, background: 'radial-gradient(circle, rgba(0,180,216,0.32) 0%, transparent 70%)', top: -60, right: -50 }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Última toma · 31 mar 2026</span>
              <span style={{
                fontFamily: 'var(--mono)', fontSize: 9.5, padding: '3px 8px', borderRadius: 999,
                background: 'var(--accent-bright)', color: 'var(--ink)', letterSpacing: '0.08em',
              }}>NORMAL</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginTop: 12 }}>
              <div>
                <div className="mono" style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>IMC</div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 40, lineHeight: 1, letterSpacing: '-0.02em', marginTop: 4 }}>24.4</div>
              </div>
              <div>
                <div className="mono" style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Peso</div>
                <div style={{ fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 4 }}>74.8 <span className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>kg</span></div>
              </div>
              <div>
                <div className="mono" style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Talla</div>
                <div style={{ fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 4 }}>1.75 <span className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>m</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* chart */}
        <div className="eyebrow" style={{ marginTop: 18, marginBottom: 8 }}>Evolución del IMC · últimos 7 meses</div>
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', padding: '14px 12px' }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
            {/* normal band 18.5-24.9 → here just gridlines */}
            {[24, 25].map(v => {
              const y = H - ((v - min) / (max - min)) * (H - 20) - 10;
              return <line key={v} x1="10" y1={y} x2={W - 10} y2={y} stroke="var(--rule-2)" strokeDasharray="2 4" />;
            })}
            <path d={path} stroke="var(--accent)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="var(--accent-deep)" />)}
          </svg>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            {data.map(d => <span key={d.d} className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{d.d}</span>)}
          </div>
        </div>

        {/* mediciones */}
        <div className="eyebrow" style={{ marginTop: 18, marginBottom: 8 }}>Mediciones</div>
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
          {data.slice().reverse().map((d, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 14, alignItems: 'center',
              padding: '12px 14px',
              borderBottom: i < 3 ? '1px solid var(--rule-3)' : 0,
            }}>
              <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-2)' }}>{d.d}</span>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{d.w} <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>kg</span></div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>IMC {d.imc}</div>
              </div>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 9, padding: '2px 6px', borderRadius: 4, background: 'rgba(28,140,90,0.12)', color: 'var(--ok)', letterSpacing: '0.08em' }}>NORMAL</span>
            </div>
          ))}
        </div>
      </div>
    </PFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// 9 · HISTORIAL · GLUCOSA
// ─────────────────────────────────────────────────────────────
function PHistGlucosa() {
  const reads = [
    { v: 95,  d: '28 abr', ctx: 'En ayunas',  m: 'Glucómetro',  state: 'bajo',  note: 'Control rutinario matutino' },
    { v: 142, d: '20 abr', ctx: 'Postprandial', m: 'Glucómetro', state: 'alto',  note: 'Comida fuera de dieta. Evitar azúcares simples', sym: 'Sed ligera' },
    { v: 102, d: '7 abr',  ctx: 'En ayunas',  m: 'Glucómetro',  state: 'normal', note: 'Buen control' },
    { v: 89,  d: '5 mar',  ctx: 'En ayunas',  m: 'Laboratorio', state: 'bajo',  note: 'Resultado mensual de laboratorio' },
  ];
  const stateColor = (s) => s === 'alto' ? 'var(--mid)' : s === 'bajo' ? 'var(--ok)' : 'var(--accent-deep)';
  return (
    <PFrame active={1}>
      <PTop sub="Mi historial · DM tipo 2" title="Glucosa" right={
        <button style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--ink)', color: 'var(--paper)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 0, cursor: 'pointer' }}>
          <PIcon kind="plus" size={16} color="var(--paper)" />
        </button>
      } />
      <HistChips active={9} />
      <div style={{ flex: 1, overflow: 'auto', padding: '14px 22px 130px' }}>
        {/* stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 8 }}>
          <div style={{ background: 'var(--ink)', color: 'var(--paper)', borderRadius: 'var(--r-md)', padding: '12px 14px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', width: 140, height: 140, borderRadius: 999, background: 'radial-gradient(circle, rgba(0,180,216,0.3) 0%, transparent 70%)', top: -50, right: -40 }} />
            <div style={{ position: 'relative' }}>
              <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.55)' }}>Último</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
                <span style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1 }}>95</span>
                <span className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)' }}>mg/dL</span>
              </div>
              <div className="mono" style={{ fontSize: 9.5, color: 'var(--accent-bright)', marginTop: 6, letterSpacing: '0.06em' }}>EN AYUNAS · 28 abr</div>
            </div>
          </div>
          <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)', padding: '12px 14px' }}>
            <div className="eyebrow">Media 30 d</div>
            <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 4, lineHeight: 1 }}>107</div>
            <div className="mono" style={{ fontSize: 9.5, color: 'var(--ok)', marginTop: 6 }}>↓ 8 vs ant.</div>
          </div>
          <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)', padding: '12px 14px' }}>
            <div className="eyebrow">En rango</div>
            <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 4, lineHeight: 1 }}>78%</div>
            <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', marginTop: 6 }}>70 – 140 mg/dL</div>
          </div>
        </div>

        {/* lecturas */}
        <div className="eyebrow" style={{ marginTop: 18, marginBottom: 8 }}>Lecturas recientes</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {reads.map((r, i) => (
            <div key={i} style={{
              background: 'var(--white)', border: '1px solid var(--rule)',
              borderLeft: '4px solid ' + stateColor(r.state),
              borderRadius: 'var(--r-md)', padding: '12px 14px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{
                    fontFamily: 'var(--mono)', fontSize: 9.5, padding: '3px 7px', borderRadius: 4,
                    background: r.state === 'alto' ? 'rgba(201,122,18,0.12)' : r.state === 'bajo' ? 'rgba(28,140,90,0.12)' : 'var(--paper-3)',
                    color: stateColor(r.state),
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                  }}>{r.state}</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 8 }}>
                    <span style={{ fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1 }}>{r.v}</span>
                    <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>mg/dL</span>
                  </div>
                </div>
                <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{r.d}</span>
              </div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 8, letterSpacing: '0.04em' }}>
                {r.ctx} · {r.m}{r.sym ? ' · síntoma: ' + r.sym : ''}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-2)', marginTop: 4, fontStyle: 'italic' }}>
                {r.note}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// 10 · MIS CITAS
// ─────────────────────────────────────────────────────────────
function PCitas() {
  return (
    <PFrame active={2}>
      <PTop sub="3 próximas · 8 pasadas" title="Mis Citas" right={
        <button style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--ink)', color: 'var(--paper)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 0, cursor: 'pointer' }}>
          <PIcon kind="plus" size={16} color="var(--paper)" />
        </button>
      } />

      {/* tabs Próx/Pasadas */}
      <div style={{ display: 'flex', gap: 0, padding: '12px 22px 0' }}>
        {['Próximas', 'Pasadas', 'Canceladas'].map((t, i) => (
          <span key={t} style={{
            padding: '8px 14px',
            borderBottom: '2px solid ' + (i === 0 ? 'var(--ink)' : 'transparent'),
            fontSize: 13, fontWeight: i === 0 ? 500 : 400,
            color: i === 0 ? 'var(--ink)' : 'var(--ink-3)',
            cursor: 'pointer',
          }}>{t}</span>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '16px 22px 130px' }}>
        {/* primera cita destacada */}
        <div style={{
          background: 'var(--ink)', color: 'var(--paper)',
          borderRadius: 'var(--r-xl)', padding: '18px 20px',
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 20px 40px -20px rgba(3,4,94,0.5)',
        }}>
          <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: 999, background: 'radial-gradient(circle, rgba(0,180,216,0.32) 0%, transparent 70%)', top: -60, right: -50 }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Tu próxima cita · en 5 días</span>
              <span style={{
                fontFamily: 'var(--mono)', fontSize: 9.5, padding: '3px 8px', borderRadius: 999,
                background: 'var(--accent-bright)', color: 'var(--ink)', letterSpacing: '0.08em',
              }}>CONFIRMADA</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 10 }}>
              <span className="mono" style={{ fontSize: 32, letterSpacing: '-0.02em' }}>10:30</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>mié 20 may · seguimiento</span>
            </div>
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 15, fontWeight: 500 }}>Dr. Damián Vega Ríos</div>
              <div className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>cirugía general · consultorio 712</div>
              <div className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>Hospital Ángeles · Reforma 222 · CDMX</div>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
              <button className="btn sm invert" style={{ flex: 1, justifyContent: 'center', height: 32, fontSize: 12 }}>Compartir historial</button>
              <button className="btn sm dark-ghost" style={{ height: 32, padding: '0 12px', fontSize: 12 }}>Cómo llegar</button>
            </div>
          </div>
        </div>

        {/* otras próximas */}
        <div className="eyebrow" style={{ marginTop: 18, marginBottom: 8 }}>También agendadas</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { t: '08:00', d: 'lun 8 jun', dr: 'Dra. Laura Estrada',  esp: 'endocrinología', tag: 'Control · DM2', state: 'confirmada' },
            { t: '17:00', d: 'jue 25 jun', dr: 'Dr. Manuel Vargas',  esp: 'cardiología',    tag: 'Primera consulta', state: 'pendiente' },
          ].map((c, i) => (
            <div key={i} style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)', padding: '12px 14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '54px 1fr auto', gap: 12, alignItems: 'center' }}>
                <div style={{ borderRight: '1px solid var(--rule-2)', paddingRight: 12 }}>
                  <div className="mono" style={{ fontSize: 12.5, fontWeight: 500 }}>{c.t}</div>
                  <div className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.06em', marginTop: 1 }}>{c.d}</div>
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 500 }}>{c.dr}</div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 1 }}>{c.esp} · {c.tag}</div>
                </div>
                <span style={{
                  fontFamily: 'var(--mono)', fontSize: 9, padding: '3px 7px', borderRadius: 4,
                  background: c.state === 'confirmada' ? 'rgba(28,140,90,0.12)' : 'rgba(201,122,18,0.12)',
                  color: c.state === 'confirmada' ? 'var(--ok)' : 'var(--mid)',
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                }}>{c.state.slice(0, 5)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// 11 · AGENDAR CITA (form mejorado)
// ─────────────────────────────────────────────────────────────
function PAgendar() {
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  const today = 15;
  return (
    <PFrame active={2}>
      <div style={{ padding: '8px 22px 12px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--rule-2)' }}>
        <button style={{ width: 32, height: 32, borderRadius: 9, border: '1px solid var(--rule)', background: 'var(--white)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <PIcon kind="chev-l" size={13} color="var(--ink-2)" />
        </button>
        <div>
          <span className="eyebrow">Paso 2 de 3</span>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 400, letterSpacing: '-0.02em', marginTop: 2 }}>
            Agendar cita
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '16px 22px 130px' }}>
        {/* selected médico */}
        <div className="eyebrow" style={{ marginBottom: 8 }}>Tu médico</div>
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)', padding: '12px 14px', display: 'grid', gridTemplateColumns: '40px 1fr auto', gap: 12, alignItems: 'center' }}>
          <span style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--accent-bright)', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 18 }}>DV</span>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 500 }}>Dr. Damián Vega Ríos</div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 1 }}>cirugía general · céd. 8 421 776</div>
          </div>
          <span style={{ fontSize: 12, color: 'var(--accent-deep)', fontWeight: 500 }}>cambiar</span>
        </div>

        {/* tipo */}
        <div className="eyebrow" style={{ marginTop: 18, marginBottom: 8 }}>Tipo de cita</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
          {[['Primera vez', false, '$ 1 200'], ['Seguimiento', true, '$ 800'], ['Urgencia', false, '$ 1 800'], ['Control', false, '$ 800']].map(([k, on, p], i) => (
            <button key={i} style={{
              padding: '12px 12px', borderRadius: 'var(--r-md)',
              border: '1px solid ' + (on ? 'var(--ink)' : 'var(--rule)'),
              background: on ? 'var(--ink)' : 'var(--white)',
              color: on ? 'var(--paper)' : 'var(--ink)',
              textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
            }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{k}</div>
              <div className="mono" style={{ fontSize: 10, color: on ? 'rgba(255,255,255,0.6)' : 'var(--ink-3)', marginTop: 3 }}>{p}</div>
            </button>
          ))}
        </div>

        {/* motivo */}
        <div className="eyebrow" style={{ marginTop: 18, marginBottom: 8 }}>Motivo de consulta</div>
        <div style={{
          background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)',
          padding: '12px 14px', minHeight: 70,
          fontSize: 12.5, color: 'var(--ink-2)',
        }}>
          Control mensual de glucosa y hipertensión. Llevo registro de mediciones de glucómetro.
        </div>

        {/* fecha — mini calendar */}
        <div className="eyebrow" style={{ marginTop: 18, marginBottom: 8 }}>Fecha · mayo 2026</div>
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)', padding: '12px 12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, marginBottom: 4 }}>
            {['D','L','M','M','J','V','S'].map((d, i) => (
              <span key={i} className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', textAlign: 'center', letterSpacing: '0.06em' }}>{d}</span>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
            {[null, null, null, null].map((_, i) => <span key={'b' + i} />)}
            {days.map(d => {
              const isToday = d === today;
              const isSel = d === 20;
              const past = d < today;
              return (
                <span key={d} style={{
                  height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 8, fontSize: 12, fontWeight: isSel ? 500 : 400,
                  background: isSel ? 'var(--accent)' : 'transparent',
                  border: isToday && !isSel ? '1px solid var(--accent)' : 'none',
                  color: isSel ? '#fff' : past ? 'var(--ink-4)' : 'var(--ink)',
                  opacity: past ? 0.5 : 1,
                }}>{d}</span>
              );
            })}
          </div>
        </div>

        {/* hora */}
        <div className="eyebrow" style={{ marginTop: 18, marginBottom: 8 }}>Hora · miércoles 20 may</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
          {['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30'].map((h, i) => {
            const sel = h === '10:30';
            const taken = h === '11:00' || h === '12:00';
            return (
              <span key={h} style={{
                padding: '9px 0', textAlign: 'center', borderRadius: 8,
                background: sel ? 'var(--ink)' : 'var(--white)',
                color: sel ? 'var(--paper)' : taken ? 'var(--ink-4)' : 'var(--ink)',
                border: '1px solid ' + (sel ? 'var(--ink)' : 'var(--rule)'),
                fontFamily: 'var(--mono)', fontSize: 11, fontWeight: sel ? 500 : 400,
                textDecoration: taken ? 'line-through' : 'none',
              }}>{h}</span>
            );
          })}
        </div>

        <button style={{
          marginTop: 18, width: '100%', height: 48,
          background: 'var(--ink)', color: 'var(--paper)',
          borderRadius: 'var(--r-md)', border: 0, fontFamily: 'inherit',
          fontSize: 14, fontWeight: 500, cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          Confirmar cita <PIcon kind="check" size={15} color="var(--paper)" />
        </button>
      </div>
    </PFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// 12 · MIS MEDICAMENTOS
// ─────────────────────────────────────────────────────────────
function PMedicamentos() {
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
    <PFrame active={3}>
      <PTop sub="Asignados por tu médico" title="Mis Meds" />
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 22px 130px' }}>
        {/* adherencia hero */}
        <div style={{ background: 'var(--ink)', color: 'var(--paper)', borderRadius: 'var(--r-xl)', padding: '16px 18px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', width: 220, height: 220, borderRadius: 999, background: 'radial-gradient(circle, rgba(0,180,216,0.3) 0%, transparent 70%)', top: -70, right: -50 }} />
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Adherencia · últimos 30 d</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                <span style={{ fontFamily: 'var(--serif)', fontSize: 42, letterSpacing: '-0.02em', lineHeight: 1 }}>94%</span>
              </div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--accent-bright)', marginTop: 4, letterSpacing: '0.06em' }}>↑ 6 PTS · TU MÉDICO LO VE</div>
            </div>
            <svg viewBox="0 0 60 60" width="60" height="60">
              <circle cx="30" cy="30" r="24" stroke="rgba(255,255,255,0.15)" strokeWidth="6" fill="none" />
              <circle cx="30" cy="30" r="24" stroke="var(--accent-bright)" strokeWidth="6" fill="none"
                strokeDasharray={`${0.94 * 2 * Math.PI * 24} ${2 * Math.PI * 24}`}
                strokeDashoffset={2 * Math.PI * 24 * 0.25} strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* hoy */}
        <div className="eyebrow" style={{ marginTop: 18, marginBottom: 8 }}>Hoy · viernes 15</div>
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
          {today.map((t, i) => {
            const isPending = t.state === 'pendiente';
            return (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '54px 1fr auto', gap: 12, alignItems: 'center',
                padding: '12px 14px',
                borderBottom: i < 3 ? '1px solid var(--rule-3)' : 0,
                background: t.next ? 'var(--paper-3)' : 'transparent',
                opacity: t.state === 'tomado' ? 0.6 : 1,
              }}>
                <span className="mono" style={{ fontSize: 12, fontWeight: 500, color: t.next ? 'var(--accent-deep)' : 'var(--ink-2)' }}>{t.t}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, textDecoration: t.state === 'tomado' ? 'line-through' : 'none' }}>
                    {t.name} <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 400 }}>{t.dose}</span>
                  </div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 1 }}>{t.via}</div>
                </div>
                {isPending
                  ? <button style={{ height: 28, padding: '0 10px', borderRadius: 7, border: 0, background: 'var(--ink)', color: 'var(--paper)', fontFamily: 'inherit', fontSize: 11, fontWeight: 500, cursor: 'pointer' }}>Tomar</button>
                  : <PIcon kind="check" size={14} color="var(--ok)" />}
              </div>
            );
          })}
        </div>

        {/* activos */}
        <div className="eyebrow" style={{ marginTop: 18, marginBottom: 8 }}>Tratamientos activos · 3</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {active.map((m, i) => (
            <div key={i} style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)', padding: '12px 14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr auto', gap: 10, alignItems: 'center' }}>
                <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--paper-3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PIcon kind="pill" size={15} color="var(--accent-deep)" />
                </span>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 500 }}>{m.name} <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 400 }}>{m.dose}</span></div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 1 }}>{m.freq}</div>
                </div>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 9, padding: '3px 7px', borderRadius: 4, background: 'var(--paper-3)', color: 'var(--accent-deep)', letterSpacing: '0.08em' }}>activo</span>
              </div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--rule-2)', letterSpacing: '0.04em' }}>
                {m.tag} · {m.dr} · desde {m.start}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// 13 · MI PERFIL
// ─────────────────────────────────────────────────────────────
function PPerfil() {
  return (
    <PFrame active={4}>
      <PTop sub="Cuenta · paciente" title="Mi perfil" right={
        <button style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid var(--rule)', background: 'var(--white)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <PIcon kind="edit" size={15} color="var(--ink-2)" />
        </button>
      } />

      <div style={{ flex: 1, overflow: 'auto', padding: '16px 22px 130px' }}>
        {/* identidad */}
        <div style={{
          background: 'var(--ink)', color: 'var(--paper)',
          borderRadius: 'var(--r-xl)', padding: '18px 18px',
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 20px 40px -20px rgba(3,4,94,0.5)',
        }}>
          <div style={{ position: 'absolute', width: 240, height: 240, borderRadius: 999, background: 'radial-gradient(circle, rgba(0,180,216,0.3) 0%, transparent 70%)', top: -80, right: -60 }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ width: 64, height: 64, borderRadius: 18, background: 'var(--accent-bright)', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 30 }}>DV</span>
            <div>
              <div style={{ fontSize: 19, fontWeight: 500, letterSpacing: '-0.02em' }}>Damián Vega Ríos</div>
              <div className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>♂ 21 años · O+ · 175 cm · 74.8 kg</div>
              <div style={{ marginTop: 6, display: 'inline-flex', gap: 4 }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 9, padding: '2px 6px', borderRadius: 4, background: 'rgba(184,50,50,0.22)', color: '#FFC1BC', letterSpacing: '0.08em' }}>3 ALERGIAS</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 9, padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.12)', color: 'var(--paper)', letterSpacing: '0.08em' }}>3 DX</span>
              </div>
            </div>
          </div>
        </div>

        {/* contacto de emergencia — el AI-slop tenía esto vacío y rojo. Aquí: avisa a configurarlo, con contexto. */}
        <div style={{
          marginTop: 14, background: 'var(--alert-soft)', border: '1px solid var(--alert-rule)',
          borderRadius: 'var(--r-lg)', padding: '14px 16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PIcon kind="alert" size={16} color="var(--alert)" />
            <span className="mono" style={{ fontSize: 10, color: 'var(--alert)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Contacto de emergencia · sin configurar</span>
          </div>
          <div style={{ fontSize: 12.5, marginTop: 8, color: 'var(--ink-2)' }}>
            Si pierdes el conocimiento, paramédicos pueden contactar a alguien en segundos.
          </div>
          <button style={{
            marginTop: 10, height: 32, padding: '0 12px', borderRadius: 8,
            background: 'var(--alert)', color: '#fff', border: 0, fontFamily: 'inherit',
            fontSize: 12, fontWeight: 500, cursor: 'pointer',
          }}>Agregar contacto</button>
        </div>

        {/* info personal */}
        <div className="eyebrow" style={{ marginTop: 18, marginBottom: 8 }}>Datos personales</div>
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
          {[
            ['Nombre',  'Damián Vega Ríos'],
            ['CURP',    'VRD050322HDFGSM05'],
            ['Edad',    '21 años · 22 mar 2005'],
            ['Género',  'Masculino'],
            ['Sangre',  'O+'],
          ].map(([k, v], i) => (
            <div key={k} style={{
              display: 'grid', gridTemplateColumns: '90px 1fr auto', gap: 12, alignItems: 'center',
              padding: '11px 14px',
              borderBottom: i < 4 ? '1px solid var(--rule-3)' : 0,
            }}>
              <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{k}</span>
              <span style={{ fontSize: 13 }}>{v}</span>
              <PIcon kind="edit" size={12} color="var(--ink-3)" />
            </div>
          ))}
        </div>

        {/* contacto */}
        <div className="eyebrow" style={{ marginTop: 18, marginBottom: 8 }}>Contacto</div>
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
          {[
            ['mail',  'd.vega@gmail.com',   'principal · 2FA activo'],
            ['phone', '+52 55 1278 9034',   'móvil · WhatsApp'],
            ['pin',   'Col. Polanco · CDMX', 'dirección registrada'],
          ].map(([icon, v, sub], i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '32px 1fr auto', gap: 10, alignItems: 'center',
              padding: '11px 14px',
              borderBottom: i < 2 ? '1px solid var(--rule-3)' : 0,
            }}>
              <PIcon kind={icon} size={15} color="var(--ink-2)" />
              <div>
                <div style={{ fontSize: 13 }}>{v}</div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 1 }}>{sub}</div>
              </div>
              <PIcon kind="edit" size={12} color="var(--ink-3)" />
            </div>
          ))}
        </div>

        {/* estilo de vida */}
        <div className="eyebrow" style={{ marginTop: 18, marginBottom: 8 }}>Estilo de vida</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            ['flame', 'Actividad', 'Sedentario'],
            ['sun',   'Sueño',     '6.5 h media'],
          ].map(([icon, k, v], i) => (
            <div key={i} style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)', padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <PIcon kind={icon} size={14} color="var(--accent-deep)" />
                <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{k}</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 500, marginTop: 6 }}>{v}</div>
            </div>
          ))}
        </div>

        {/* logout */}
        <button style={{
          marginTop: 16, width: '100%', height: 44,
          border: '1px solid var(--alert-rule)', background: 'var(--alert-soft)', color: 'var(--alert)',
          borderRadius: 'var(--r-md)', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 500, cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <PIcon kind="logout" size={14} color="var(--alert)" /> Cerrar sesión
        </button>
        <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', marginTop: 12, textAlign: 'center', letterSpacing: '0.04em' }}>
          imedexp · paciente · v 4.1.7
        </div>
      </div>
    </PFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Compose — wrappers para canvas
// ─────────────────────────────────────────────────────────────
const wrap = (Screen, label) => () => (
  <div data-screen-label={`Paciente · ${label}`}>
    <IOSDevice width={390} height={844} title="imedexp">
      <Screen />
    </IOSDevice>
  </div>
);

Object.assign(window, {
  PInicioScreen:       wrap(PInicio,         'inicio'),
  PHistResumenScreen:  wrap(PHistResumen,    'hist · resumen'),
  PHistAlergiasScreen: wrap(PHistAlergias,   'hist · alergias'),
  PHistEnfScreen:      wrap(PHistEnfermedades, 'hist · enf. crónicas'),
  PHistCirugiasScreen: wrap(PHistCirugias,   'hist · cirugías'),
  PHistAntScreen:      wrap(PHistAntecedentes,'hist · familia'),
  PHistVacunasScreen:  wrap(PHistVacunas,    'hist · vacunas'),
  PHistPesoScreen:     wrap(PHistPeso,       'hist · peso/IMC'),
  PHistGlucosaScreen:  wrap(PHistGlucosa,    'hist · glucosa'),
  PCitasScreen:        wrap(PCitas,          'citas'),
  PAgendarScreen:      wrap(PAgendar,        'agendar cita'),
  PMedsScreen:         wrap(PMedicamentos,   'medicamentos'),
  PPerfilScreen:       wrap(PPerfil,         'perfil'),
});
