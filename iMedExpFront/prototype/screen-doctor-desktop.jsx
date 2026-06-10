// imedexp · Doctor desktop app — 6 pantallas para PC
// 1440 × varía (900–1180) — mantienen la voz del Dashboard (sidebar + top + bento)
// pero responden a las mismas necesidades que la versión móvil rediseñada.

// ─────────────────────────────────────────────────────────────
// Icon set (idéntico al móvil — para coherencia visual)
// ─────────────────────────────────────────────────────────────
const DIcon = ({ kind, size = 18, color = 'currentColor' }) => {
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
    case 'edit':     return svg(<path d="M4 20 L4 16 L16 4 L20 8 L8 20 Z" />);
    case 'logout':   return svg(<><path d="M10 4 L4 4 L4 20 L10 20" /><path d="M14 8 L18 12 L14 16" /><line x1="9" y1="12" x2="18" y2="12" /></>);
    case 'pill':     return svg(<><rect x="3" y="9" width="18" height="6" rx="3" transform="rotate(-30 12 12)" /><line x1="9.5" y1="7.5" x2="14.5" y2="16.5" /></>);
    case 'doc':      return svg(<><path d="M6 3 L14 3 L18 7 L18 21 L6 21 Z" /><path d="M14 3 L14 7 L18 7" /><line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="15.5" x2="15" y2="15.5" /><line x1="9" y1="19" x2="13" y2="19" /></>);
    case 'qr':       return svg(<><rect x="4" y="4" width="6" height="6" /><rect x="14" y="4" width="6" height="6" /><rect x="4" y="14" width="6" height="6" /><rect x="14" y="14" width="2" height="2" /><rect x="18" y="14" width="2" height="2" /><rect x="14" y="18" width="2" height="2" /><rect x="18" y="18" width="2" height="2" /></>);
    case 'lab':      return svg(<><path d="M9 3 L9 9 L4 19 A2 2 0 0 0 6 21 L18 21 A2 2 0 0 0 20 19 L15 9 L15 3" /><line x1="8" y1="3" x2="16" y2="3" /><line x1="7" y1="14" x2="17" y2="14" /></>);
    case 'filter':   return svg(<path d="M3 5 L21 5 L14 13 L14 20 L10 18 L10 13 Z" />);
    case 'chev':     return svg(<path d="M9 6 L15 12 L9 18" />);
    case 'chev-l':   return svg(<path d="M15 6 L9 12 L15 18" />);
    case 'bell':     return svg(<><path d="M6 17 L18 17 L17 15.5 L17 11 A5 5 0 0 0 7 11 L7 15.5 Z" /><path d="M10 17 A2 2 0 0 0 14 17" /></>);
    case 'download': return svg(<><path d="M12 4 L12 16" /><path d="M7 11 L12 16 L17 11" /><path d="M5 20 L19 20" /></>);
    case 'share':    return svg(<><circle cx="6" cy="12" r="2.2" /><circle cx="18" cy="6" r="2.2" /><circle cx="18" cy="18" r="2.2" /><line x1="8" y1="11" x2="16" y2="7" /><line x1="8" y1="13" x2="16" y2="17" /></>);
    case 'badge':    return svg(<><circle cx="12" cy="9" r="4" /><path d="M9 13 L8 21 L12 18 L16 21 L15 13" /></>);
    case 'clock':    return svg(<><circle cx="12" cy="12" r="8" /><path d="M12 7 L12 12 L15 14" /></>);
    case 'video':    return svg(<><rect x="3" y="7" width="13" height="10" rx="1.5" /><path d="M16 11 L21 8 L21 16 L16 13 Z" /></>);
    case 'more':     return svg(<><circle cx="6" cy="12" r="1" fill={color} stroke="none" /><circle cx="12" cy="12" r="1" fill={color} stroke="none" /><circle cx="18" cy="12" r="1" fill={color} stroke="none" /></>);
    default:         return svg(<circle cx="12" cy="12" r="8" />);
  }
};

// ─────────────────────────────────────────────────────────────
// Shell — sidebar + topbar reutilizables
// ─────────────────────────────────────────────────────────────
const NAV = [
  ['home',   'Inicio'],
  ['users',  'Pacientes'],
  ['cal',    'Agenda'],
  ['clip',   'Consultas'],
  ['rx',     'Recetas'],
  ['shield', 'Validaciones'],
  ['user',   'Perfil'],
];

function DSidebar({ active }) {
  const counts = { 'Pacientes': '142', 'Agenda': '5', 'Validaciones': '3' };
  return (
    <aside style={{
      width: 240, height: '100%',
      background: 'var(--white)', borderRight: '1px solid var(--rule)',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ padding: '22px 22px 22px' }}>
        <window.HomeLogo color="var(--ink)" height={18} />
      </div>

      <nav style={{ flex: 1, padding: '8px 12px' }}>
        {NAV.map(([icon, label], i) => {
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
              <DIcon kind={icon} size={17} color={isActive ? 'var(--paper)' : 'var(--ink-2)'} />
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
            fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 400,
          }}>DV</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 500 }}>Dr. D. Vega Ríos</div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>cirugía general</div>
          </div>
          <DIcon kind="chev" size={13} color="var(--ink-3)" />
        </div>
      </div>
    </aside>
  );
}

function DTop({ title, sub, right }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '24px 40px 16px',
      borderBottom: '1px solid var(--rule-2)',
    }}>
      <div>
        <span className="eyebrow">{sub}</span>
        <h1 style={{
          fontFamily: 'var(--sans)', fontSize: 30, fontWeight: 500, letterSpacing: '-0.025em',
          marginTop: 4, lineHeight: 1.1,
        }}>{title}</h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, width: 320, height: 42, padding: '0 14px',
          border: '1px solid var(--rule)', background: 'var(--white)', borderRadius: 'var(--r-md)',
        }}>
          <DIcon kind="search" size={15} color="var(--ink-3)" />
          <span style={{ fontSize: 13, color: 'var(--ink-3)', flex: 1 }}>Buscar paciente, diagnóstico…</span>
          <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', border: '1px solid var(--rule)', padding: '2px 6px', borderRadius: 4 }}>⌘K</span>
        </div>
        <button style={{
          width: 42, height: 42, borderRadius: 'var(--r-md)',
          border: '1px solid var(--rule)', background: 'var(--white)', color: 'var(--ink-2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative',
        }}>
          <DIcon kind="bell" size={17} />
          <span style={{ position: 'absolute', top: 8, right: 8, width: 6, height: 6, borderRadius: 99, background: 'var(--alert)' }} />
        </button>
        {right}
      </div>
    </div>
  );
}

function DPage({ active, title, sub, right, children, height = 900 }) {
  return (
    <div className="imx" style={{
      width: 1440, height,
      background: 'var(--paper)',
      display: 'grid', gridTemplateColumns: '240px 1fr',
      overflow: 'hidden',
    }}>
      <DSidebar active={active} />
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <DTop title={title} sub={sub} right={right} />
        <div style={{ flex: 1, overflow: 'auto', padding: '24px 40px 32px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// pill button
const Pill = ({ on, children, count }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '7px 13px', borderRadius: 999,
    border: '1px solid ' + (on ? 'var(--ink)' : 'var(--rule)'),
    background: on ? 'var(--ink)' : 'var(--white)',
    color: on ? 'var(--paper)' : 'var(--ink-2)',
    fontSize: 12.5, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
  }}>{children}{count != null && <span className="mono" style={{ fontSize: 10, opacity: 0.65 }}>{count}</span>}</span>
);

// ─────────────────────────────────────────────────────────────
// 1 · PACIENTES (desktop) — tabla con preview lateral
// ─────────────────────────────────────────────────────────────
function DPatients() {
  const patients = [
    { name: 'María F. Arellano',  age: 34, sex: '♀', curp: 'AERM91…', tag: 'tiroides · migraña', last: 'hace 4 m', next: 'hoy 10:30', flag: 'alergia', isToday: true, selected: true },
    { name: 'Carlos Mendoza Vela',age: 58, sex: '♂', curp: 'MEVC68…', tag: 'post-op vesícula',   last: 'hoy 09:00', next: 'en 6 m',     isToday: true },
    { name: 'Patricia Lozano',    age: 47, sex: '♀', curp: 'LOPP79…', tag: 'oncología',          last: 'hoy 09:45', next: 'sem. 22',   isToday: true },
    { name: 'José Luis Padilla',  age: 62, sex: '♂', curp: 'PALJ64…', tag: 'hernia inguinal',    last: 'hace 12 d', next: 'hoy 11:15', isToday: true },
    { name: 'Ana Sofía Cortés',   age: 41, sex: '♀', curp: 'COCA85…', tag: 'cólico biliar',      last: 'hace 3 sem', next: 'hoy 12:00',isToday: true },
    { name: 'Luis Ramírez Téllez',age: 29, sex: '♂', curp: 'RATL97…', tag: '1ª consulta',        last: 'sin vínculo', next: 'hoy 14:00', linked: false },
    { name: 'Roberto Aguilar',    age: 51, sex: '♂', curp: 'AUGR75…', tag: 'hernia · pre-qx',    last: 'ayer',       next: '21 may' },
    { name: 'Sofía Hernández',    age: 37, sex: '♀', curp: 'HEMS89…', tag: 'cólico biliar',      last: 'ayer',       next: '18 may' },
    { name: 'Elena Castaño',      age: 55, sex: '♀', curp: 'CAEE71…', tag: 'gastritis',          last: '11 may',     next: '4 jun' },
    { name: 'Diego Salinas',      age: 44, sex: '♂', curp: 'SADD82…', tag: 'sutura · alta',      last: '11 may',     next: '—' },
    { name: 'Mariana Ovalle',     age: 33, sex: '♀', curp: 'OAMM93…', tag: 'reflujo',            last: '08 may',     next: 'oct 26' },
    { name: 'Tomás Beltrán',      age: 67, sex: '♂', curp: 'BETT59…', tag: 'colelitiasis',       last: '06 may',     next: '22 may' },
  ];
  const sel = patients[0];
  return (
    <DPage active={1} title="Mis pacientes" sub="142 vinculados · 6 nuevos esta semana"
      height={1180}
      right={<button className="btn sm" style={{ height: 42, borderRadius: 'var(--r-md)' }}><DIcon kind="qr" size={15} color="#fff" /> Vincular paciente</button>}
    >
      {/* stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          ['Total cartera',   '142', '+6 esta sem.'],
          ['Activos 30 d',     '88',  '62% de cartera'],
          ['Crónicos',         '38',  'seguimiento ≥ 6 m'],
          ['Post-quirúrgicos', '14',  'fase aguda'],
        ].map(([k, n, sub], i) => (
          <div key={i} style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', padding: '14px 16px' }}>
            <div className="eyebrow">{k}</div>
            <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.03em', marginTop: 6, lineHeight: 1 }}>{n}</div>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 6 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* filters */}
      <div style={{ display: 'flex', gap: 6, marginTop: 18, alignItems: 'center' }}>
        {[['Todos', 142, true], ['Hoy', 5, false], ['Crónicos', 38, false], ['Post-op', 14, false], ['Nuevos', 6, false], ['Sin vincular', 1, false]].map(([k, n, on]) => (
          <Pill key={k} on={on} count={n}>{k}</Pill>
        ))}
        <span style={{ flex: 1 }} />
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>Ordenar: próxima cita ▾</span>
      </div>

      {/* table + preview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 14, marginTop: 14 }}>
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1fr 40px',
            padding: '12px 18px', borderBottom: '1px solid var(--rule-2)',
            fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            <span>Paciente</span>
            <span>Diagnóstico</span>
            <span>Última</span>
            <span>Próxima</span>
            <span></span>
          </div>
          {patients.map((p, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1fr 40px',
              padding: '12px 18px', alignItems: 'center',
              borderBottom: i < patients.length - 1 ? '1px solid var(--rule-3)' : 0,
              background: p.selected ? 'var(--paper-3)' : 'transparent',
              borderLeft: p.selected ? '3px solid var(--accent)' : '3px solid transparent',
              paddingLeft: p.selected ? 15 : 18,
              cursor: 'pointer',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <span style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: p.isToday ? 'var(--accent-bright)' : 'var(--paper-4)',
                  color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 500,
                }}>{p.name.split(' ').map(s => s[0]).slice(0, 2).join('')}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {p.name}
                    {p.flag && <span style={{ fontFamily: 'var(--mono)', fontSize: 9, padding: '2px 6px', borderRadius: 4, background: 'var(--alert-soft)', color: 'var(--alert)', letterSpacing: '0.08em' }}>!</span>}
                    {p.linked === false && <span style={{ fontFamily: 'var(--mono)', fontSize: 9, padding: '2px 6px', borderRadius: 4, background: 'var(--paper-2)', color: 'var(--ink-3)', letterSpacing: '0.08em' }}>sin vínculo</span>}
                  </div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 1 }}>{p.sex} {p.age}a · {p.curp}</div>
                </div>
              </div>
              <span style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>{p.tag}</span>
              <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{p.last}</span>
              <span className="mono" style={{ fontSize: 11.5, color: p.isToday ? 'var(--accent-deep)' : 'var(--ink-2)', fontWeight: p.isToday ? 500 : 400 }}>{p.next}</span>
              <DIcon kind="more" size={16} color="var(--ink-3)" />
            </div>
          ))}
        </div>

        {/* preview lateral del paciente seleccionado */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden', height: 'fit-content' }}>
          <div style={{
            padding: '20px 20px 18px', background: 'var(--ink)', color: 'var(--paper)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', width: 180, height: 180, borderRadius: 999, background: 'radial-gradient(circle, rgba(0,180,216,0.3) 0%, transparent 70%)', top: -60, right: -50 }} />
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--accent-bright)', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 24 }}>MA</span>
              <div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 24, lineHeight: 1, letterSpacing: '-0.02em' }}>{sel.name}</div>
                <div className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>{sel.sex} {sel.age}a · CURP {sel.curp} · vinculada hace 4 m</div>
              </div>
            </div>
            <div style={{
              marginTop: 14, padding: '8px 12px', borderRadius: 8,
              background: 'rgba(184,50,50,0.18)', border: '1px solid rgba(184,50,50,0.4)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, padding: '3px 7px', borderRadius: 4, background: 'var(--alert)', color: '#fff', letterSpacing: '0.08em' }}>ALERGIA SEVERA</span>
              <span style={{ fontSize: 12, color: '#FFC9C5' }}>Penicilina · anafilaxia 2019</span>
            </div>
          </div>

          <div style={{ padding: 16 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Resumen clínico</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                ['Dx activos', '4',  'tiroides · migraña · SOP · ferropenia'],
                ['Medicación', '3',  'levo · sumatrip · sulfato Fe'],
                ['Cirugías',   '3',  'apendi · septo · biopsia'],
                ['Estudios 90 d', '4', 'TSH · BH · USG · lípidos'],
              ].map(([k, n, body], i) => (
                <div key={i} style={{ padding: '10px 12px', background: 'var(--paper)', borderRadius: 'var(--r-md)' }}>
                  <div className="eyebrow">{k}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                    <span style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.02em' }}>{n}</span>
                  </div>
                  <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', marginTop: 4, lineHeight: 1.4 }}>{body}</div>
                </div>
              ))}
            </div>

            <div className="eyebrow" style={{ marginTop: 16, marginBottom: 8 }}>Próximas citas</div>
            <div style={{ background: 'var(--paper-3)', border: '1px solid var(--accent-rule)', borderRadius: 'var(--r-md)', padding: '10px 12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>Primera consulta</div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>hoy 10:30 · cons. 712 · en 14 min</div>
                </div>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, padding: '3px 8px', borderRadius: 999, background: 'var(--accent-bright)', color: 'var(--ink)', letterSpacing: '0.06em' }}>SIGUE</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
              <button className="btn sm" style={{ flex: 1, justifyContent: 'center' }}>Empezar consulta</button>
              <button className="btn sm ghost" style={{ flex: 1, justifyContent: 'center' }}>Ver expediente</button>
            </div>
          </div>
        </div>
      </div>
    </DPage>
  );
}

// ─────────────────────────────────────────────────────────────
// 2 · AGENDA (desktop) — week view + day side panel
// ─────────────────────────────────────────────────────────────
function DAgenda() {
  const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  const week = [
    { dow: 'lun', d: 11, today: false },
    { dow: 'mar', d: 12 },
    { dow: 'mié', d: 13 },
    { dow: 'jue', d: 14, today: true },
    { dow: 'vie', d: 15 },
    { dow: 'sáb', d: 16 },
    { dow: 'dom', d: 17 },
  ];
  // events: col=day index (0..6), startHr (0..9), span (in 30min units), color
  const events = [
    { col: 0, top: 1.5, h: 1,   t: '09:30', name: 'M. Aragón',  tag: 'Control', state: 'done' },
    { col: 0, top: 3.5, h: 1,   t: '11:30', name: 'R. Quintero', tag: 'Post-op', state: 'done' },
    { col: 0, top: 7,   h: 0.8, t: '15:00', name: 'C. Esquivel', tag: 'Pre-qx', state: 'done' },
    { col: 1, top: 1,   h: 1,   t: '09:00', name: 'L. Mejía',    tag: 'Control', state: 'done' },
    { col: 1, top: 4,   h: 2,   t: '12:00', name: '— quirófano', tag: 'Cole. lap.', state: 'block' },
    { col: 1, top: 7.5, h: 1,   t: '15:30', name: 'J. Reyna',    tag: 'Control', state: 'done' },
    { col: 2, top: 0.5, h: 0.8, t: '08:30', name: 'A. Vidal',    tag: 'Sutura',  state: 'done' },
    { col: 2, top: 2,   h: 1,   t: '10:00', name: 'V. Castaño',  tag: 'Control', state: 'done' },
    { col: 2, top: 5.5, h: 1,   t: '13:30', name: 'M. Salgado',  tag: 'Reflujo', state: 'done' },
    { col: 3, top: 0.5, h: 0.8, t: '08:30', name: '— bloque',    tag: 'Pre-qx',  state: 'block' },
    { col: 3, top: 1,   h: 0.8, t: '09:00', name: 'C. Mendoza',  tag: 'Post-op', state: 'done' },
    { col: 3, top: 1.8, h: 0.8, t: '09:45', name: 'P. Lozano',   tag: 'Oncología', state: 'done' },
    { col: 3, top: 2.5, h: 0.9, t: '10:30', name: 'M. Arellano', tag: '1ª consulta', state: 'next' },
    { col: 3, top: 3.5, h: 0.8, t: '11:15', name: 'J. Padilla',  tag: 'Post-op', virtual: true },
    { col: 3, top: 4,   h: 1,   t: '12:00', name: 'A. Cortés',   tag: 'Control' },
    { col: 3, top: 6,   h: 1,   t: '14:00', name: 'L. Ramírez',  tag: '1ª consulta' },
    { col: 4, top: 1,   h: 1,   t: '09:00', name: 'I. Morales',  tag: 'Control' },
    { col: 4, top: 3,   h: 2,   t: '11:00', name: '— quirófano', tag: 'Hernia',  state: 'block' },
    { col: 4, top: 6.5, h: 0.8, t: '14:30', name: 'D. Reyes',    tag: 'Sutura' },
    { col: 4, top: 7.5, h: 1,   t: '15:30', name: 'E. Castaño',  tag: 'Reflujo' },
    { col: 5, top: 1,   h: 1,   t: '09:00', name: 'B. Tinoco',   tag: 'Control' },
    { col: 5, top: 2.5, h: 1,   t: '10:30', name: 'P. Aguirre',  tag: 'Control' },
  ];
  const ROW = 56;
  return (
    <DPage active={2} title="Agenda · 11 — 17 mayo 2026" sub="Sem. 20 · 22 citas · 3 bloques quirúrgicos"
      height={1160}
      right={<button className="btn sm" style={{ height: 42, borderRadius: 'var(--r-md)' }}><DIcon kind="plus" size={15} color="#fff" /> Nueva cita</button>}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button style={{ width: 34, height: 34, borderRadius: 9, border: '1px solid var(--rule)', background: 'var(--white)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <DIcon kind="chev-l" size={14} color="var(--ink-2)" />
          </button>
          <button style={{ height: 34, padding: '0 14px', borderRadius: 9, border: '1px solid var(--rule)', background: 'var(--white)', fontFamily: 'inherit', fontSize: 12.5, color: 'var(--ink-2)', cursor: 'pointer' }}>Hoy</button>
          <button style={{ width: 34, height: 34, borderRadius: 9, border: '1px solid var(--rule)', background: 'var(--white)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <DIcon kind="chev" size={14} color="var(--ink-2)" />
          </button>
        </div>
        <div style={{ display: 'flex', background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 9, padding: 2 }}>
          {['Día', 'Semana', 'Mes', 'Lista'].map((v, i) => (
            <span key={v} style={{
              padding: '6px 14px', borderRadius: 7,
              background: i === 1 ? 'var(--ink)' : 'transparent',
              color: i === 1 ? 'var(--paper)' : 'var(--ink-3)',
              fontSize: 12, fontFamily: 'var(--mono)', letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>{v}</span>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 14 }}>
        {/* week grid */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
          {/* day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '64px repeat(7, 1fr)', borderBottom: '1px solid var(--rule-2)' }}>
            <div />
            {week.map((w, i) => (
              <div key={i} style={{
                padding: '14px 12px',
                background: w.today ? 'var(--paper-3)' : 'transparent',
                borderLeft: i > 0 ? '1px solid var(--rule-2)' : 0,
              }}>
                <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{w.dow}</div>
                <div style={{ fontSize: 22, fontWeight: 500, marginTop: 4, letterSpacing: '-0.02em', color: w.today ? 'var(--accent-deep)' : 'var(--ink)' }}>{w.d}</div>
              </div>
            ))}
          </div>
          {/* grid body */}
          <div style={{ display: 'grid', gridTemplateColumns: '64px repeat(7, 1fr)', position: 'relative' }}>
            {/* hour column */}
            <div>
              {hours.map((h, i) => (
                <div key={i} style={{ height: ROW, padding: '6px 12px', borderTop: i > 0 ? '1px solid var(--rule-3)' : 0 }}>
                  <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>{h}</span>
                </div>
              ))}
            </div>
            {/* day columns */}
            {week.map((w, ci) => (
              <div key={ci} style={{
                position: 'relative',
                background: w.today ? 'var(--paper-3)' : 'transparent',
                borderLeft: '1px solid var(--rule-2)',
              }}>
                {hours.map((_, i) => (
                  <div key={i} style={{ height: ROW, borderTop: i > 0 ? '1px solid var(--rule-3)' : 0 }} />
                ))}
                {/* now line on today */}
                {w.today && (
                  <div style={{ position: 'absolute', left: 0, right: 0, top: ROW * 2.7, height: 0, borderTop: '1.5px solid var(--accent)', zIndex: 2 }}>
                    <span style={{ position: 'absolute', left: -3, top: -5, width: 9, height: 9, borderRadius: 99, background: 'var(--accent)' }} />
                  </div>
                )}
                {events.filter(e => e.col === ci).map((e, ei) => {
                  const isNext = e.state === 'next';
                  const isDone = e.state === 'done';
                  const isBlock = e.state === 'block';
                  return (
                    <div key={ei} style={{
                      position: 'absolute', top: e.top * ROW + 2, left: 4, right: 4,
                      height: e.h * ROW - 4,
                      background: isNext ? 'var(--ink)' : isBlock ? 'transparent' : 'var(--white)',
                      color: isNext ? 'var(--paper)' : 'var(--ink)',
                      border: isBlock ? '1px dashed var(--ink-3)' : '1px solid ' + (isNext ? 'var(--ink)' : 'var(--accent-rule)'),
                      borderLeft: isBlock ? '1px dashed var(--ink-3)' : '3px solid ' + (isNext ? 'var(--accent-bright)' : 'var(--accent)'),
                      borderRadius: 6, padding: '5px 7px',
                      fontSize: 10.5, lineHeight: 1.2,
                      opacity: isDone ? 0.45 : 1, zIndex: isNext ? 3 : 1,
                      overflow: 'hidden',
                    }}>
                      <div className="mono" style={{ fontSize: 9.5, color: isNext ? 'rgba(255,255,255,0.7)' : 'var(--ink-3)', letterSpacing: '0.04em' }}>{e.t}</div>
                      <div style={{ fontSize: 11, fontWeight: 500, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {e.virtual && <span style={{ marginRight: 4 }}>●</span>}{e.name}
                      </div>
                      <div style={{ fontSize: 9.5, color: isNext ? 'rgba(255,255,255,0.6)' : 'var(--ink-3)' }}>{e.tag}</div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* day side panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* next */}
          <div style={{
            background: 'var(--ink)', color: 'var(--paper)',
            borderRadius: 'var(--r-xl)', padding: '18px 18px 18px',
            position: 'relative', overflow: 'hidden',
            boxShadow: '0 20px 40px -20px rgba(3,4,94,0.45)',
          }}>
            <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: 999, background: 'radial-gradient(circle, rgba(0,180,216,0.32) 0%, transparent 70%)', top: -60, right: -50 }} />
            <div style={{ position: 'relative' }}>
              <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.65)' }}>Sigue · en 14 min</span>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 28, lineHeight: 1, letterSpacing: '-0.02em', marginTop: 8 }}>
                María Fernanda<br />Arellano
              </div>
              <div className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 8 }}>♀ 34a · primera consulta · cons. 712</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button className="btn sm invert" style={{ flex: 1, justifyContent: 'center', height: 34 }}>Empezar</button>
                <button className="btn sm dark-ghost" style={{ height: 34, padding: '0 12px' }}>Expediente</button>
              </div>
            </div>
          </div>

          {/* day timeline mini */}
          <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--rule-2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: 14.5, fontWeight: 500 }}>Hoy · jueves 14</h3>
                <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>2 / 7</span>
              </div>
            </div>
            <div>
              {[
                ['08:30', 'Pre-qx bloque', '', 'block'],
                ['09:00', 'C. Mendoza V.',   'Post-op 6m',   'done'],
                ['09:45', 'P. Lozano',       'Oncología',    'done'],
                ['10:30', 'M. Arellano',     '1ª consulta',  'next'],
                ['11:15', 'J. Padilla',      'Video · post-op', 'queue'],
                ['12:00', 'A. Cortés',       'Control',      'queue'],
                ['14:00', 'L. Ramírez',      '1ª consulta',  'queue'],
              ].map(([t, name, sub, st], i) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '46px 6px 1fr auto', gap: 10, alignItems: 'center',
                  padding: '10px 18px',
                  borderBottom: i < 6 ? '1px solid var(--rule-3)' : 0,
                  background: st === 'next' ? 'var(--paper-3)' : 'transparent',
                  opacity: st === 'done' ? 0.5 : st === 'block' ? 0.7 : 1,
                }}>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--ink-2)', fontWeight: 500 }}>{t}</span>
                  <span style={{
                    width: 5, height: 5, borderRadius: 99,
                    background: st === 'next' ? 'var(--accent)' : st === 'done' ? 'var(--ok)' : st === 'block' ? 'var(--ink-4)' : 'var(--ink-3)',
                  }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: st === 'next' ? 500 : 400, textDecoration: st === 'done' ? 'line-through' : 'none' }}>{name}</div>
                    {sub && <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)' }}>{sub}</div>}
                  </div>
                  {st === 'next' && <span style={{ fontFamily: 'var(--mono)', fontSize: 9, padding: '2px 6px', borderRadius: 999, background: 'var(--accent)', color: '#fff', letterSpacing: '0.06em' }}>SIGUE</span>}
                  {st === 'done' && <DIcon kind="check" size={11} color="var(--ok)" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DPage>
  );
}

// ─────────────────────────────────────────────────────────────
// 3 · CONSULTAS (desktop) — stats + tabla rica
// ─────────────────────────────────────────────────────────────
function DConsultas() {
  const rows = [
    { t: '09:45', date: 'hoy',  name: 'Patricia Lozano',     age: 47, dx: 'CA mama · seguimiento adyuvancia', dur: '32 min', tags: ['receta', 'lab'],  state: 'firmada' },
    { t: '09:00', date: 'hoy',  name: 'Carlos Mendoza Vela', age: 58, dx: 'Post-op colecistectomía · 6 m',    dur: '18 min', tags: ['nota'],            state: 'firmada' },
    { t: '14:30', date: '13 may', name: 'Sofía Hernández',   age: 37, dx: 'Cólico biliar · sospecha',         dur: '28 min', tags: ['receta', 'estudio'], state: 'firmada' },
    { t: '12:15', date: '13 may', name: 'Roberto Aguilar',   age: 51, dx: 'Hernia inguinal · pre-quirúrgico', dur: '24 min', tags: ['estudio'],         state: 'firmada' },
    { t: '10:00', date: '13 may', name: 'Elena Castaño',     age: 55, dx: 'Control · gastritis crónica',      dur: '16 min', tags: ['receta'],          state: 'firmada' },
    { t: '17:30', date: '11 may', name: 'Diego Salinas',     age: 44, dx: 'Cierre quirúrgico · revisión sutura', dur: '12 min', tags: ['alta'],         state: 'firmada' },
    { t: '15:00', date: '11 may', name: 'Tomás Beltrán',     age: 67, dx: 'Colelitiasis · valoración qx',     dur: '22 min', tags: ['estudio', 'receta'], state: 'pendiente' },
    { t: '11:00', date: '11 may', name: 'Mariana Ovalle',    age: 33, dx: 'Reflujo · control 30 d',            dur: '14 min', tags: ['receta'],          state: 'firmada' },
    { t: '16:30', date: '08 may', name: 'Iván Romero',       age: 39, dx: 'Apendicitis post-op · día 10',      dur: '10 min', tags: ['alta'],            state: 'firmada' },
  ];
  return (
    <DPage active={3} title="Consultas" sub="Tu práctica · últimos 30 días"
      height={1160}
      right={<button className="btn sm" style={{ height: 42, borderRadius: 'var(--r-md)' }}><DIcon kind="plus" size={15} color="#fff" /> Nueva consulta</button>}
    >
      {/* stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          ['Hoy',           '5',  '2 hechas · 3 pendientes', 'var(--ink)'],
          ['Esta semana',   '42', '+12% vs anterior',        'var(--white)'],
          ['Este mes',      '178','+8 nuevos pacientes',     'var(--white)'],
          ['Tiempo medio',  '19 min', '−2 min vs antes',     'var(--white)'],
        ].map(([k, n, sub, bg], i) => {
          const isDark = bg === 'var(--ink)';
          return (
            <div key={i} style={{
              background: bg, border: isDark ? '1px solid var(--ink)' : '1px solid var(--rule)',
              borderRadius: 'var(--r-lg)', padding: '16px 18px',
              color: isDark ? 'var(--paper)' : 'var(--ink)',
              position: 'relative', overflow: 'hidden',
            }}>
              {isDark && <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: 999, background: 'radial-gradient(circle, rgba(0,180,216,0.3) 0%, transparent 70%)', top: -60, right: -50 }} />}
              <div style={{ position: 'relative' }}>
                <div className="eyebrow" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'var(--ink-3)' }}>{k}</div>
                <div style={{ fontSize: 30, fontWeight: 500, letterSpacing: '-0.03em', marginTop: 6, lineHeight: 1 }}>{n}</div>
                <div className="mono" style={{ fontSize: 10.5, color: isDark ? 'rgba(255,255,255,0.55)' : 'var(--ink-3)', marginTop: 6 }}>{sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* filters + sort */}
      <div style={{ display: 'flex', gap: 6, marginTop: 18, alignItems: 'center' }}>
        {[['Todas', true], ['Hoy', false], ['Con receta', false], ['Sin firmar', false], ['Post-op', false], ['1ª consulta', false]].map(([k, on]) => (
          <Pill key={k} on={on}>{k}</Pill>
        ))}
        <span style={{ flex: 1 }} />
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>Período: últimos 30 d ▾</span>
      </div>

      {/* table */}
      <div style={{ marginTop: 14, background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '80px 1.4fr 2fr 80px 1fr 90px 40px',
          padding: '12px 20px', borderBottom: '1px solid var(--rule-2)',
          fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          <span>Fecha</span>
          <span>Paciente</span>
          <span>Diagnóstico</span>
          <span>Duración</span>
          <span>Salidas</span>
          <span>Firma</span>
          <span></span>
        </div>
        {rows.map((r, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '80px 1.4fr 2fr 80px 1fr 90px 40px',
            padding: '13px 20px', alignItems: 'center', gap: 10,
            borderBottom: i < rows.length - 1 ? '1px solid var(--rule-3)' : 0,
          }}>
            <div>
              <div className="mono" style={{ fontSize: 11.5, color: 'var(--ink-2)', fontWeight: 500 }}>{r.t}</div>
              <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: '0.04em' }}>{r.date}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--paper-4)', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500 }}>
                {r.name.split(' ').map(s => s[0]).slice(0, 2).join('')}
              </span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{r.name}</div>
                <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)' }}>{r.age}a</div>
              </div>
            </div>
            <span style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>{r.dx}</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{r.dur}</span>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {r.tags.map(t => (
                <span key={t} style={{
                  fontFamily: 'var(--mono)', fontSize: 9, padding: '2px 6px', borderRadius: 4,
                  background: t === 'receta' ? 'var(--paper-3)' : t === 'alta' ? 'rgba(28,140,90,0.12)' : 'var(--paper-2)',
                  color: t === 'receta' ? 'var(--accent-deep)' : t === 'alta' ? 'var(--ok)' : 'var(--ink-2)',
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                }}>{t}</span>
              ))}
            </div>
            <span style={{
              fontFamily: 'var(--mono)', fontSize: 9.5,
              padding: '3px 8px', borderRadius: 999,
              background: r.state === 'firmada' ? 'rgba(28,140,90,0.12)' : 'var(--alert-soft)',
              color: r.state === 'firmada' ? 'var(--ok)' : 'var(--alert)',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              display: 'inline-flex', alignItems: 'center', gap: 4, width: 'fit-content',
            }}>
              {r.state === 'firmada' ? <><DIcon kind="check" size={10} color="var(--ok)" /> firmada</> : 'pendiente'}
            </span>
            <DIcon kind="more" size={16} color="var(--ink-3)" />
          </div>
        ))}
      </div>
    </DPage>
  );
}

// ─────────────────────────────────────────────────────────────
// 4 · RECETAS (desktop)
// ─────────────────────────────────────────────────────────────
function DRecetas() {
  const recetas = [
    { date: 'Hoy · 09:45', patient: 'Patricia Lozano', folio: 'RX·2026·05·1142', drugs: [
      { name: 'Tamoxifeno',   dose: '20 mg', freq: '1× día · 30 d', via: 'oral' },
      { name: 'Ondansetrón',  dose: '8 mg',  freq: '8 h PRN · 5 d',  via: 'oral' },
    ], state: 'firmada', valid: 'Vigente 28 d' },
    { date: 'Hoy · 09:00', patient: 'Carlos Mendoza Vela', folio: 'RX·2026·05·1141', drugs: [
      { name: 'Omeprazol', dose: '40 mg', freq: '1× día · 30 d', via: 'oral' },
    ], state: 'firmada', valid: 'Vigente 28 d' },
    { date: 'Ayer · 14:30', patient: 'Sofía Hernández', folio: 'RX·2026·05·1138', drugs: [
      { name: 'Hioscina',     dose: '10 mg',  freq: '8 h PRN · 7 d', via: 'oral' },
      { name: 'Paracetamol',  dose: '500 mg', freq: '8 h PRN · 5 d', via: 'oral' },
      { name: 'Esomeprazol',  dose: '20 mg',  freq: '1× día · 15 d', via: 'oral' },
    ], state: 'descargada', valid: 'Vigente 27 d' },
    { date: 'Lun · 11 may', patient: 'Elena Castaño', folio: 'RX·2026·05·1129', drugs: [
      { name: 'Sucralfato', dose: '1 g', freq: '6 h · 21 d', via: 'oral' },
    ], state: 'firmada', valid: 'Vence en 22 d' },
  ];

  return (
    <DPage active={4} title="Recetas médicas" sub="Firma electrónica activa · NOM-024"
      height={1180}
      right={<button className="btn sm" style={{ height: 42, borderRadius: 'var(--r-md)' }}><DIcon kind="plus" size={15} color="#fff" /> Nueva receta</button>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
        {[
          ['Hoy',     '4',   'recetas firmadas',  true],
          ['Semana',  '38',  '+9 PRN',            false],
          ['Mes',     '147', 'media 4.9 / día',   false],
          ['Año',     '1 612', 'estado: vigentes 89%', false],
        ].map(([k, n, sub, on], i) => (
          <div key={i} style={{
            background: on ? 'var(--paper-3)' : 'var(--white)',
            border: '1px solid ' + (on ? 'var(--accent-rule)' : 'var(--rule)'),
            borderRadius: 'var(--r-lg)', padding: '16px 18px',
          }}>
            <div className="eyebrow">{k}</div>
            <div style={{ fontSize: 30, fontWeight: 500, letterSpacing: '-0.03em', marginTop: 6, lineHeight: 1 }}>{n}</div>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 6 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* templates */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 22, marginBottom: 10 }}>
        <span className="eyebrow">Plantillas frecuentes · arranca en 1 clic</span>
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>12 disponibles</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {[
          ['Post-op colecistectomía', '4 fármacos', '15 d'],
          ['Cólico biliar',            '3 fármacos', '7 d'],
          ['Pre-quirúrgico cir. mayor','2 fármacos', '3 d antes'],
          ['Gastritis crónica',        '2 fármacos', '30 d'],
        ].map(([k, sub, dur], i) => (
          <button key={i} style={{
            background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)',
            padding: '14px 16px', textAlign: 'left', fontFamily: 'inherit', cursor: 'pointer',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--paper-3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <DIcon kind="pill" size={14} color="var(--accent-deep)" />
              </span>
              <DIcon kind="plus" size={14} color="var(--ink-3)" />
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 500, marginTop: 10 }}>{k}</div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 4 }}>{sub} · {dur}</div>
          </button>
        ))}
      </div>

      {/* recent */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 22, marginBottom: 10 }}>
        <span className="eyebrow">Recetas recientes</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {[['Todas', true], ['Firmadas', false], ['Vigentes', false], ['Por vencer', false]].map(([k, on]) => (
            <Pill key={k} on={on}>{k}</Pill>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {recetas.map((r, i) => (
          <div key={i} style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', padding: '16px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{r.patient}</div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 3, letterSpacing: '0.04em' }}>{r.folio} · {r.date}</div>
              </div>
              <span style={{
                fontFamily: 'var(--mono)', fontSize: 9.5, padding: '3px 8px', borderRadius: 999,
                background: r.state === 'firmada' ? 'rgba(28,140,90,0.12)' : 'var(--paper-3)',
                color: r.state === 'firmada' ? 'var(--ok)' : 'var(--accent-deep)',
                letterSpacing: '0.08em', textTransform: 'uppercase',
                display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap',
              }}>
                {r.state === 'firmada' && <DIcon kind="check" size={10} color="var(--ok)" />} {r.state}
              </span>
            </div>
            <div style={{ marginTop: 12, borderTop: '1px solid var(--rule-2)', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {r.drugs.map((d, j) => (
                <div key={j} style={{ display: 'grid', gridTemplateColumns: '18px 1.5fr 1fr 1fr', gap: 10, alignItems: 'center' }}>
                  <DIcon kind="pill" size={13} color="var(--ink-3)" />
                  <span style={{ fontSize: 13 }}><strong style={{ fontWeight: 500 }}>{d.name}</strong></span>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--ink-2)' }}>{d.dose} · {d.via}</span>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textAlign: 'right' }}>{d.freq}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 12, alignItems: 'center', borderTop: '1px solid var(--rule-2)', paddingTop: 10 }}>
              <button style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 28, padding: '0 10px', borderRadius: 7, border: '1px solid var(--rule)', background: 'var(--white)', fontFamily: 'inherit', fontSize: 11.5, color: 'var(--ink-2)', cursor: 'pointer' }}>
                <DIcon kind="download" size={12} /> PDF
              </button>
              <button style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 28, padding: '0 10px', borderRadius: 7, border: '1px solid var(--rule)', background: 'var(--white)', fontFamily: 'inherit', fontSize: 11.5, color: 'var(--ink-2)', cursor: 'pointer' }}>
                <DIcon kind="share" size={12} /> Enviar al paciente
              </button>
              <span style={{ flex: 1 }} />
              <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>{r.valid}</span>
            </div>
          </div>
        ))}
      </div>
    </DPage>
  );
}

// ─────────────────────────────────────────────────────────────
// 5 · VALIDACIONES (desktop)
// ─────────────────────────────────────────────────────────────
function DValidaciones() {
  const queue = [
    { patient: 'María F. Arellano', kind: 'USG tiroides',     source: 'Lab Carpermor', date: '12 may', state: 'pending' },
    { patient: 'José L. Padilla',   kind: 'BH + química 24',  source: 'Chopo',         date: '13 may', state: 'pending' },
    { patient: 'Ana S. Cortés',     kind: 'TAC abdominal',    source: 'Médica Sur',    date: '11 may', state: 'flagged' },
    { patient: 'Tomás Beltrán',     kind: 'USG abdominal',    source: 'Lab Olarte',    date: '10 may', state: 'pending' },
  ];
  const recent = [
    { name: 'Carlos Mendoza Vela', type: 'Alta médica',          date: 'hoy 09:30', folio: 'AM-2026-0421' },
    { name: 'Roberto Aguilar',     type: 'Incapacidad 7 días',   date: 'ayer 16:12', folio: 'IN-2026-0419' },
    { name: 'Elena Castaño',       type: 'Constancia médica',    date: '12 may',     folio: 'CN-2026-0418' },
    { name: 'Diego Salinas',       type: 'Alta quirúrgica',      date: '11 may',     folio: 'AM-2026-0416' },
    { name: 'Mariana Ovalle',      type: 'Constancia aptitud',   date: '10 may',     folio: 'CN-2026-0414' },
  ];
  return (
    <DPage active={5} title="Validaciones" sub="Firma electrónica · 3 documentos pendientes"
      height={1140}
      right={<button className="btn sm" style={{ height: 42, borderRadius: 'var(--r-md)' }}><DIcon kind="pen" size={14} color="#fff" /> Emitir certificado</button>}
    >
      {/* hero */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 12 }}>
        <div style={{
          background: 'var(--ink)', color: 'var(--paper)',
          borderRadius: 'var(--r-xl)', padding: '22px 24px',
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 20px 40px -20px rgba(3,4,94,0.45)',
        }}>
          <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: 999, background: 'radial-gradient(circle, rgba(0,180,216,0.32) 0%, transparent 70%)', top: -100, right: -80 }} />
          <div style={{ position: 'relative' }}>
            <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Pendiente de tu firma</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 6 }}>
              <span style={{ fontFamily: 'var(--serif)', fontSize: 64, lineHeight: 1, letterSpacing: '-0.02em' }}>3</span>
              <span className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>el más antiguo · hace 26 min</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button style={{ height: 38, padding: '0 18px', borderRadius: 'var(--r-md)', background: 'var(--accent-bright)', color: 'var(--ink)', border: 0, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                Validar ahora <DIcon kind="arrow" size={13} color="var(--ink)" />
              </button>
              <button className="btn sm dark-ghost" style={{ height: 38 }}>Revisar en cola</button>
            </div>
          </div>
        </div>
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', padding: '16px 18px' }}>
          <div className="eyebrow">Emitidos · este mes</div>
          <div style={{ fontSize: 32, fontWeight: 500, letterSpacing: '-0.03em', marginTop: 6, lineHeight: 1 }}>34</div>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 6 }}>media 1.1 / día hábil</div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--ok)', marginTop: 8, letterSpacing: '0.04em' }}>+22% vs mes anterior</div>
        </div>
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', padding: '16px 18px' }}>
          <div className="eyebrow">Tu firma electrónica</div>
          <div style={{ fontSize: 15, fontWeight: 500, marginTop: 6 }}>Vigente</div>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 4 }}>FIEL · expira 11 m 12 d</div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 10, letterSpacing: '0.04em' }}>cédula 8 421 776 · vinculada al SAT</div>
        </div>
      </div>

      {/* cola + emitir */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 14, marginTop: 18 }}>
        {/* cola validación documentos */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--rule-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 500 }}>Cola de validación · estudios externos</h3>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>3 de tus pacientes envían resultados</div>
            </div>
            <span className="mono" style={{ fontSize: 11, color: 'var(--accent-deep)' }}>Ver todos →</span>
          </div>
          {queue.map((q, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '38px 1.4fr 1fr 1fr auto', gap: 12, alignItems: 'center',
              padding: '14px 20px',
              borderBottom: i < queue.length - 1 ? '1px solid var(--rule-3)' : 0,
            }}>
              <span style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--paper-3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <DIcon kind={q.kind.includes('USG') || q.kind.includes('TAC') ? 'doc' : 'lab'} size={15} color="var(--accent-deep)" />
              </span>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{q.kind}</div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 2 }}>{q.patient}</div>
              </div>
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-2)' }}>{q.source}</span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{q.date}</span>
              {q.state === 'flagged'
                ? <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, padding: '3px 8px', borderRadius: 999, background: 'var(--alert-soft)', color: 'var(--alert)', letterSpacing: '0.08em' }}>REVISAR</span>
                : <button className="btn sm" style={{ height: 28, fontSize: 11.5 }}>Firmar</button>}
            </div>
          ))}
        </div>

        {/* emitir certificado */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--rule-2)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 500 }}>Emitir certificado</h3>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>4 plantillas oficiales · firma al instante</div>
          </div>
          <div style={{ padding: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              ['Incapacidad',      'IMSS / privado',         'doc',   '42'],
              ['Alta médica',      'Post-qx · valoración',   'check', '88'],
              ['Constancia',       'Asistencia · aptitud',   'badge', '17'],
              ['Dictamen',         'Pericial · pre-op',      'pen',   '6'],
            ].map(([k, sub, icon, n], i) => (
              <button key={i} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6,
                padding: '14px 14px', minHeight: 96,
                background: 'var(--paper)', border: '1px solid var(--rule-2)',
                borderRadius: 'var(--r-md)', textAlign: 'left',
                fontFamily: 'inherit', cursor: 'pointer',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--paper-3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DIcon kind={icon} size={14} color="var(--accent-deep)" />
                  </span>
                  <span className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)' }}>{n} emitidos</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, marginTop: 4 }}>{k}</div>
                <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: '0.04em' }}>{sub}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* recientes emitidos */}
      <div style={{ marginTop: 18, background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--rule-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 15, fontWeight: 500 }}>Recientemente emitidos</h3>
          <span className="mono" style={{ fontSize: 11, color: 'var(--accent-deep)' }}>Exportar libro →</span>
        </div>
        {recent.map((r, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '36px 1.4fr 1fr 1fr auto',
            padding: '13px 20px', alignItems: 'center', gap: 12,
            borderBottom: i < recent.length - 1 ? '1px solid var(--rule-3)' : 0,
          }}>
            <span style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--paper-4)', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500 }}>
              {r.name.split(' ').map(s => s[0]).slice(0, 2).join('')}
            </span>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 500 }}>{r.name}</div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>{r.type}</div>
            </div>
            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-2)' }}>{r.folio}</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{r.date}</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--rule)', background: 'var(--white)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <DIcon kind="download" size={12} color="var(--ink-2)" />
              </button>
              <button style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--rule)', background: 'var(--white)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <DIcon kind="share" size={12} color="var(--ink-2)" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </DPage>
  );
}

// ─────────────────────────────────────────────────────────────
// 6 · PERFIL (desktop)
// ─────────────────────────────────────────────────────────────
function DProfile() {
  return (
    <DPage active={6} title="Mi perfil" sub="Cuenta · imedexp" height={1100}
      right={<button className="btn sm ghost" style={{ height: 42, borderRadius: 'var(--r-md)' }}><DIcon kind="edit" size={14} /> Editar</button>}
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
          <span style={{
            width: 96, height: 96, borderRadius: 24,
            background: 'var(--accent-bright)', color: 'var(--ink)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--serif)', fontSize: 48, fontWeight: 400,
          }}>DV</span>
          <div>
            <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Médico · cirujano</span>
            <h2 style={{
              fontFamily: 'var(--serif)', fontSize: 44, lineHeight: 1, fontWeight: 400, letterSpacing: '-0.02em', marginTop: 8,
            }}>Dr. Damián Vega Ríos</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10, color: 'rgba(255,255,255,0.7)', fontSize: 13.5 }}>
              <span>Cirugía general</span>
              <span style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.2)' }} />
              <span>Sub-esp. hepatobiliar</span>
              <span style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.2)' }} />
              <span className="mono">céd. 8 421 776</span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em',
                padding: '3px 9px', borderRadius: 999,
                background: 'rgba(255,255,255,0.14)', color: 'var(--paper)', textTransform: 'uppercase',
              }}>
                <DIcon kind="check" size={10} color="var(--accent-bright)" /> verificado
              </span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, borderLeft: '1px solid rgba(255,255,255,0.12)', paddingLeft: 28 }}>
            {[
              ['Pacientes', '142'],
              ['Consultas', '2 318'],
              ['Antigüedad', '6 a'],
            ].map(([k, v], i) => (
              <div key={k} style={{ paddingLeft: i === 0 ? 0 : 18, paddingRight: 18, borderRight: i < 2 ? '1px solid rgba(255,255,255,0.1)' : 0 }}>
                <div className="mono" style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{k}</div>
                <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 4 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* two-column */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 16 }}>
        {/* left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* contact */}
          <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--rule-2)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 500 }}>Datos de contacto</h3>
            </div>
            {[
              ['mail',  'd.vega@imedexp.mx',   'verificado · principal'],
              ['phone', '+52 55 4124 7782',    'móvil · 2FA activo'],
              ['phone', '+52 55 5202 1107',    'consultorio'],
              ['pin',   'Hospital Ángeles · piso 7 · cons. 712', 'Av. Paseo de la Reforma 222 · CDMX'],
            ].map(([icon, val, sub], i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '34px 1fr auto', gap: 12, alignItems: 'center',
                padding: '12px 18px',
                borderBottom: i < 3 ? '1px solid var(--rule-3)' : 0,
              }}>
                <span style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--paper-3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DIcon kind={icon} size={14} color="var(--accent-deep)" />
                </span>
                <div>
                  <div style={{ fontSize: 13.5 }}>{val}</div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>{sub}</div>
                </div>
                <DIcon kind="edit" size={13} color="var(--ink-3)" />
              </div>
            ))}
          </div>

          {/* schedule + tariff */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', padding: '14px 16px' }}>
              <div className="eyebrow">Horario de atención</div>
              <div style={{ fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>
                <span className="mono">L – V</span> · 09:00 – 14:00<br />
                <span className="mono">S</span> · 09:00 – 13:00<br />
                <span className="mono" style={{ color: 'var(--ink-3)' }}>D · cerrado</span>
              </div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 10 }}>quirófano · martes y viernes</div>
            </div>
            <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', padding: '14px 16px' }}>
              <div className="eyebrow">Tarifas</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span>1ª consulta</span>
                  <span className="mono" style={{ fontWeight: 500 }}>$ 1 200</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span>Seguimiento</span>
                  <span className="mono" style={{ fontWeight: 500 }}>$ 800</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span>Video-consulta</span>
                  <span className="mono" style={{ fontWeight: 500 }}>$ 700</span>
                </div>
              </div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 10 }}>MXN · acepta efectivo, TDC, transferencia</div>
            </div>
          </div>
        </div>

        {/* right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* settings */}
          <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--rule-2)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 500 }}>Configuración profesional</h3>
            </div>
            {[
              ['pen',     'Firma electrónica',   'FIEL vigente · vence 11 m 12 d', 'activa'],
              ['doc',     'Plantillas clínicas', '12 plantillas · 4 favoritas',     ''],
              ['rx',      'Recetario digital',   'membrete + cédula · NOM-024',     'configurado'],
              ['sparkle', 'Notificaciones',      'push · email · resumen semanal',  ''],
              ['shield',  'Privacidad y datos',  'cifrado E2E · paciente al centro','NOM-024'],
            ].map(([icon, k, sub, badge], i) => (
              <div key={k} style={{
                display: 'grid', gridTemplateColumns: '34px 1fr auto auto', gap: 12, alignItems: 'center',
                padding: '13px 18px',
                borderBottom: i < 4 ? '1px solid var(--rule-3)' : 0,
                cursor: 'pointer',
              }}>
                <DIcon kind={icon} size={17} color="var(--ink-2)" />
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 500 }}>{k}</div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>{sub}</div>
                </div>
                {badge && <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, padding: '3px 8px', borderRadius: 999, background: 'rgba(28,140,90,0.12)', color: 'var(--ok)', letterSpacing: '0.08em' }}>{badge}</span>}
                <DIcon kind="chev" size={13} color="var(--ink-3)" />
              </div>
            ))}
          </div>

          {/* logout */}
          <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--alert)' }}>Cerrar sesión</div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>sesión activa hace 12 min · iniciada en MacBook Pro · CDMX</div>
            </div>
            <button style={{
              height: 36, padding: '0 14px', borderRadius: 'var(--r-md)',
              border: '1px solid var(--alert-rule)', background: 'var(--alert-soft)', color: 'var(--alert)',
              fontFamily: 'inherit', fontSize: 12.5, fontWeight: 500, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              <DIcon kind="logout" size={13} color="var(--alert)" /> Salir
            </button>
          </div>

          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', textAlign: 'center', letterSpacing: '0.04em' }}>
            imedexp · v 4.1.7 · build 2026.05.14 · status: operativo
          </div>
        </div>
      </div>
    </DPage>
  );
}

// ─────────────────────────────────────────────────────────────
// Compose — labels para el canvas
// ─────────────────────────────────────────────────────────────
function DskPatientsScreen()    { return <div data-screen-label="Doctor desktop · pacientes"><DPatients /></div>; }
function DskAgendaScreen()      { return <div data-screen-label="Doctor desktop · agenda"><DAgenda /></div>; }
function DskConsultasScreen()   { return <div data-screen-label="Doctor desktop · consultas"><DConsultas /></div>; }
function DskRecetasScreen()     { return <div data-screen-label="Doctor desktop · recetas"><DRecetas /></div>; }
function DskValidacionesScreen(){ return <div data-screen-label="Doctor desktop · validaciones"><DValidaciones /></div>; }
function DskProfileScreen()     { return <div data-screen-label="Doctor desktop · perfil"><DProfile /></div>; }

Object.assign(window, {
  DskPatientsScreen, DskAgendaScreen, DskConsultasScreen,
  DskRecetasScreen, DskValidacionesScreen, DskProfileScreen,
});
