// imedexp · Doctor home dashboard (between consultations)
// 1440 × 900 — what the doctor sees on login / between patients
//
// Principle: una pregunta principal — "¿quién sigue?" El resto es contexto liviano.

const DashIcon = ({ kind, size = 18, color = 'currentColor' }) => {
  const stroke = color, w = 1.6;
  const props = { fill: 'none', stroke, strokeWidth: w, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const svg = (children) => <svg width={size} height={size} viewBox="0 0 24 24" {...props}>{children}</svg>;
  switch (kind) {
    case 'home':     return svg(<><path d="M4 11 L12 4 L20 11" /><path d="M6 10 L6 20 L18 20 L18 10" /></>);
    case 'cal':      return svg(<><rect x="3.5" y="5.5" width="17" height="15" rx="1.5" /><line x1="3.5" y1="10" x2="20.5" y2="10" /><line x1="8" y1="3" x2="8" y2="7" /><line x1="16" y1="3" x2="16" y2="7" /></>);
    case 'users':    return svg(<><circle cx="9" cy="9" r="3" /><path d="M3 19 C3 16 6 14 9 14 C12 14 15 16 15 19" /><circle cx="16" cy="8" r="2.5" /><path d="M14 14 C18 14 21 16 21 19" /></>);
    case 'rx':       return svg(<><path d="M7 4 L7 14" /><path d="M7 4 L12 4 A3 3 0 0 1 12 10 L7 10" /><path d="M10 10 L17 17" /><path d="M14 14 L18 18" /></>);
    case 'settings': return svg(<><circle cx="12" cy="12" r="3" /><path d="M12 3 L12 6 M12 18 L12 21 M3 12 L6 12 M18 12 L21 12 M5.6 5.6 L7.7 7.7 M16.3 16.3 L18.4 18.4 M5.6 18.4 L7.7 16.3 M16.3 7.7 L18.4 5.6" /></>);
    case 'search':   return svg(<><circle cx="11" cy="11" r="6" /><line x1="15.5" y1="15.5" x2="20" y2="20" /></>);
    case 'arrow':    return svg(<><path d="M5 12 L19 12" /><path d="M14 7 L19 12 L14 17" /></>);
    case 'plus':     return svg(<><path d="M12 5 L12 19" /><path d="M5 12 L19 12" /></>);
    case 'check':    return svg(<path d="M5 12 L10 17 L19 7" />);
    case 'clock':    return svg(<><circle cx="12" cy="12" r="8" /><path d="M12 7 L12 12 L15 14" /></>);
    case 'bell':     return svg(<><path d="M6 17 L18 17 L17 15.5 L17 11 A5 5 0 0 0 7 11 L7 15.5 Z" /><path d="M10 17 A2 2 0 0 0 14 17" /></>);
    case 'sparkle':  return svg(<><path d="M12 4 L13 10 L19 12 L13 14 L12 20 L11 14 L5 12 L11 10 Z" /></>);
    default:         return svg(<circle cx="12" cy="12" r="8" />);
  }
};

// ─────────────────────────────────────────────────────────────
// SIDEBAR — nav (different from the "consulta activa" sidebar)
// ─────────────────────────────────────────────────────────────
function DashSidebar() {
  const nav = [
    ['home',     'Inicio',     true],
    ['cal',      'Agenda',     false],
    ['users',    'Pacientes',  false, '142'],
    ['rx',       'Recetas',    false],
    ['settings', 'Ajustes',    false],
  ];
  return (
    <aside style={{
      width: 260, height: '100%',
      background: 'var(--white)', borderRight: '1px solid var(--rule)',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ padding: '24px 22px 24px' }}>
        <HomeLogo color="var(--ink)" height={18} />
      </div>

      <nav style={{ flex: 1, padding: '8px 14px' }}>
        {nav.map(([icon, label, active, count]) => (
          <div key={label} style={{
            display: 'grid', gridTemplateColumns: '24px 1fr auto', alignItems: 'center', gap: 12,
            padding: '12px 12px', borderRadius: 'var(--r-md)',
            background: active ? 'var(--ink)' : 'transparent',
            color: active ? 'var(--paper)' : 'var(--ink)',
            marginBottom: 2, cursor: 'pointer',
            transition: 'background .15s',
          }}>
            <DashIcon kind={icon} size={18} color={active ? 'var(--paper)' : 'var(--ink-2)'} />
            <span style={{ fontSize: 14, fontWeight: active ? 500 : 400 }}>{label}</span>
            {count && (
              <span style={{
                fontFamily: 'var(--mono)', fontSize: 10.5,
                padding: '2px 7px', borderRadius: 999,
                background: active ? 'rgba(255,255,255,0.12)' : 'var(--paper-3)',
                color: active ? 'var(--paper)' : 'var(--accent-deep)',
              }}>{count}</span>
            )}
          </div>
        ))}
      </nav>

      {/* doctor card */}
      <div style={{ padding: '16px 22px', borderTop: '1px solid var(--rule)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            width: 36, height: 36, borderRadius: 999, background: 'var(--accent)', color: '#fff',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 600,
          }}>RS</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Dr. R. Solís</div>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>endocrinología</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────
// TOP — greeting + search
// ─────────────────────────────────────────────────────────────
function DashTop() {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '28px 48px 8px',
    }}>
      <div>
        <span className="eyebrow">Miércoles · 14 mayo · 09:42</span>
        <h1 style={{
          fontFamily: 'var(--sans)', fontSize: 36, fontWeight: 500, letterSpacing: '-0.025em',
          marginTop: 4, lineHeight: 1.1,
        }}>
          Buenos días,{' '}
          <span className="serif" style={{ fontWeight: 400, color: 'var(--accent-deep)' }}>Dr. Solís</span>.
        </h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, width: 320,
          height: 44, padding: '0 16px',
          border: '1px solid var(--rule)', background: 'var(--white)', borderRadius: 'var(--r-md)',
        }}>
          <DashIcon kind="search" size={16} color="var(--ink-3)" />
          <span style={{ fontSize: 13.5, color: 'var(--ink-3)' }}>Buscar paciente, diagnóstico…</span>
          <span style={{ flex: 1 }} />
          <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', border: '1px solid var(--rule)', padding: '2px 6px', borderRadius: 4 }}>⌘K</span>
        </div>
        <button style={{
          width: 44, height: 44, borderRadius: 'var(--r-md)',
          border: '1px solid var(--rule)', background: 'var(--white)', color: 'var(--ink-2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          position: 'relative',
        }}>
          <DashIcon kind="bell" size={18} />
          <span style={{ position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: 99, background: 'var(--alert)' }} />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// NEXT PATIENT HERO — el foco de toda la pantalla
// ─────────────────────────────────────────────────────────────
function NextPatientHero() {
  return (
    <div style={{
      margin: '20px 48px 0',
      background: 'var(--ink)', color: 'var(--paper)',
      borderRadius: 'var(--r-xl)', overflow: 'hidden',
      position: 'relative',
      boxShadow: '0 30px 60px -20px rgba(3,4,94,0.35)',
    }}>
      {/* decorative glow */}
      <div style={{
        position: 'absolute', width: 360, height: 360, borderRadius: 999,
        background: 'radial-gradient(circle, rgba(0,180,216,0.25) 0%, transparent 70%)',
        top: -120, right: -80, pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.06, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.7) 1px, transparent 1px)',
        backgroundSize: '30px 30px',
      }} />

      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', padding: '32px 40px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Pulse color="var(--accent-bright)" dark />
            <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Tu próximo paciente · en 14 min
            </span>
          </div>

          <h2 style={{
            fontFamily: 'var(--serif)', fontSize: 64, fontWeight: 400,
            letterSpacing: '-0.025em', lineHeight: 1, marginTop: 16, color: 'var(--paper)',
          }}>
            María Fernanda Arellano
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 14, color: 'rgba(255,255,255,0.75)' }}>
            <span style={{ fontSize: 14 }}>♀ 34 años</span>
            <span style={{ width: 1, height: 11, background: 'rgba(255,255,255,0.2)' }} />
            <span style={{ fontSize: 14 }}>Primera consulta</span>
            <span style={{ width: 1, height: 11, background: 'rgba(255,255,255,0.2)' }} />
            <span style={{ fontSize: 14 }}>10:30 — consultorio 3</span>
            <span style={{ width: 1, height: 11, background: 'rgba(255,255,255,0.2)' }} />
            <span className="chip" style={{
              background: 'rgba(184,50,50,0.18)', borderColor: 'rgba(184,50,50,0.4)', color: '#FFAFA9',
              fontSize: 11,
            }}>1 alergia severa</span>
          </div>

          {/* mini preview de su expediente */}
          <div style={{ display: 'flex', gap: 32, marginTop: 28 }}>
            {[
              ['Dx activos', '4'],
              ['Medicación', '3'],
              ['Estudios recientes', '3'],
              ['Última consulta', 'hace 4 m'],
            ].map(([k, v]) => (
              <div key={k}>
                <div className="mono" style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{k}</div>
                <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 4 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '16px 28px', borderRadius: 'var(--r-md)',
            background: 'var(--accent-bright)', color: 'var(--ink)',
            border: 0, fontSize: 16, fontWeight: 600, fontFamily: 'inherit',
            cursor: 'pointer', transition: 'transform .12s',
            boxShadow: '0 14px 30px -10px rgba(0,180,216,0.5)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
          >
            Empezar consulta
            <DashIcon kind="arrow" size={16} color="var(--ink)" />
          </button>
          <button className="btn sm dark-ghost" style={{ marginRight: 0 }}>
            Ver expediente
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// AGENDA del día — lista limpia
// ─────────────────────────────────────────────────────────────
function AgendaToday() {
  const items = [
    ['09:00', 'Carlos Mendoza Vela',   'Control · 6 meses',    'done'],
    ['09:45', 'Patricia Lozano',       'Control · oncología',  'done'],
    ['10:30', 'María F. Arellano',     'Primera consulta',     'next'],
    ['11:15', 'José L. Padilla',       'Post-op · día 12',     'queued'],
    ['12:00', 'Ana Sofía Cortés',      'Control · crónico',    'queued'],
    ['13:30', '— bloque libre —',      'almuerzo',             'free'],
    ['14:00', 'Luis Ramírez Téllez',   'Primera consulta',     'queued'],
  ];
  return (
    <div style={{
      background: 'var(--white)', border: '1px solid var(--rule)',
      borderRadius: 'var(--r-xl)', overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '18px 22px', borderBottom: '1px solid var(--rule-2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h3 style={{ fontSize: 17, fontWeight: 500, letterSpacing: '-0.01em' }}>Agenda de hoy</h3>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: 11,
            padding: '3px 9px', borderRadius: 999,
            background: 'var(--paper-3)', color: 'var(--accent-deep)',
          }}>2 / 12</span>
        </div>
        <a style={{ fontSize: 12.5, color: 'var(--accent-deep)', fontWeight: 500, cursor: 'pointer' }}>
          Ver mes →
        </a>
      </div>

      <div style={{ padding: '4px 0' }}>
        {items.map(([t, name, tag, state], i) => {
          const done = state === 'done';
          const next = state === 'next';
          const free = state === 'free';
          return (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '64px 8px 1fr auto', gap: 14, alignItems: 'center',
              padding: '14px 22px',
              borderBottom: i < items.length - 1 ? '1px solid var(--rule-3)' : 0,
              opacity: done ? 0.45 : free ? 0.5 : 1,
              background: next ? 'var(--paper-3)' : 'transparent',
            }}>
              <span className="mono" style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 500 }}>{t}</span>
              <span style={{
                width: 6, height: 6, borderRadius: 99,
                background: next ? 'var(--accent)' : done ? 'var(--ok)' : free ? 'var(--ink-4)' : 'var(--ink-3)',
              }} />
              <div>
                <div style={{ fontSize: 14.5, fontWeight: next ? 500 : 400, color: 'var(--ink)' }}>{name}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{tag}</div>
              </div>
              {next && (
                <span style={{
                  fontFamily: 'var(--mono)', fontSize: 11, padding: '3px 9px',
                  background: 'var(--accent)', color: '#fff', borderRadius: 999, letterSpacing: '0.08em',
                }}>SIGUE</span>
              )}
              {done && <DashIcon kind="check" size={14} color="var(--ok)" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SIDE — pendientes + actividad reciente
// ─────────────────────────────────────────────────────────────
function PendientesCard() {
  return (
    <div style={{
      background: 'var(--white)', border: '1px solid var(--rule)',
      borderRadius: 'var(--r-xl)', overflow: 'hidden',
    }}>
      <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--rule-2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <DashIcon kind="sparkle" size={18} color="var(--accent-deep)" />
          <h3 style={{ fontSize: 17, fontWeight: 500, letterSpacing: '-0.01em' }}>Por hacer</h3>
        </div>
      </div>
      <div>
        {[
          ['Receta pendiente — Patricia Lozano', 'Tras consulta de oncología', 'alta'],
          ['Resultado de lab — A. Cortés', 'BH llegó hace 2h', 'alta'],
          ['Seguimiento — J. Padilla', 'Cita post-op completa, falta nota', 'media'],
          ['Revisar 6 expedientes nuevos', 'Vinculados esta semana', 'baja'],
        ].map(([title, sub, pri], i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '3px 1fr auto', gap: 14, alignItems: 'center',
            padding: '14px 22px',
            borderBottom: i < 3 ? '1px solid var(--rule-3)' : 0,
          }}>
            <span style={{
              width: 3, height: 28, borderRadius: 99,
              background: pri === 'alta' ? 'var(--alert)' : pri === 'media' ? 'var(--mid)' : 'var(--ink-4)',
            }} />
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 500 }}>{title}</div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2 }}>{sub}</div>
            </div>
            <span style={{ fontSize: 16, color: 'var(--ink-3)' }}>›</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// BOTTOM stats strip
// ─────────────────────────────────────────────────────────────
function WeekStats() {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14,
      margin: '20px 48px 0',
    }}>
      {[
        ['Esta semana', '42', 'consultas', '+12% vs anterior'],
        ['Mes', '178', 'pacientes únicos', '+8 nuevos'],
        ['Adherencia media', '94%', 'tus crónicos', '↑ 6 pts en 30 d'],
        ['Tiempo medio', '12 min', 'por consulta', '−2 min vs sin imedexp'],
      ].map(([eyebrow, n, sub, trend], i) => (
        <div key={i} style={{
          background: 'var(--white)', border: '1px solid var(--rule)',
          borderRadius: 'var(--r-xl)', padding: '18px 20px',
        }}>
          <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {eyebrow}
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
            <span style={{ fontSize: 32, fontWeight: 500, letterSpacing: '-0.03em', color: 'var(--ink)', lineHeight: 1 }}>{n}</span>
            <span style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>{sub}</span>
          </div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--ok)', marginTop: 8, letterSpacing: '0.04em' }}>
            {trend}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Compose
// ─────────────────────────────────────────────────────────────
function DoctorDashboardScreen() {
  return (
    <div className="imx" style={{
      width: 1440, height: 900,
      background: 'var(--paper)',
      display: 'grid', gridTemplateColumns: '260px 1fr',
      overflow: 'hidden',
    }} data-screen-label="Doctor · dashboard">
      <DashSidebar />
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <DashTop />
        <NextPatientHero />
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14, padding: '20px 48px 0' }}>
          <AgendaToday />
          <PendientesCard />
        </div>
        <WeekStats />
      </div>
    </div>
  );
}

window.DoctorDashboardScreen = DoctorDashboardScreen;
