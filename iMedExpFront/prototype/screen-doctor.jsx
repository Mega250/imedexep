// imedexp · Doctor dashboard — v2 (radical simplification)
// 1440 × 900 · focal patient view, sidebar agenda, nothing else
//
// What changed vs v1:
//   - Removed: 4-quadrant chart deck, full timeline, 6-cell vital signs grid,
//     expanded clinical note, search bar in topbar.
//   - Hero patient is the centerpiece. Big name. Big numbers. Visible alergias.
//   - Three focused sections beneath: Dx · Medication · Studies (3 items each max).
//   - One action bar at the bottom.
//   - Sidebar is now slim. Agenda only.
//   - Less mono, more serif. Numbers oversized.

const DocIcon = ({ kind, size = 18, color = 'currentColor' }) => {
  const stroke = color, w = 1.6;
  const props = { fill: 'none', stroke, strokeWidth: w, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const svg = (children) => <svg width={size} height={size} viewBox="0 0 24 24" {...props}>{children}</svg>;
  switch (kind) {
    case 'pill':    return svg(<><rect x="3.5" y="9" width="17" height="6" rx="3" /><line x1="12" y1="9" x2="12" y2="15" /></>);
    case 'dx':      return svg(<><path d="M12 4 L12 20" /><path d="M4 12 L20 12" /></>);
    case 'study':   return svg(<><line x1="4" y1="20" x2="20" y2="20" /><rect x="6" y="13" width="2.5" height="7" /><rect x="11" y="9" width="2.5" height="11" /><rect x="16" y="5" width="2.5" height="15" /></>);
    case 'plus':    return svg(<><path d="M12 5 L12 19" /><path d="M5 12 L19 12" /></>);
    case 'arrow':   return svg(<><path d="M5 12 L19 12" /><path d="M14 7 L19 12 L14 17" /></>);
    case 'check':   return svg(<path d="M5 12 L10 17 L19 7" />);
    case 'clock':   return svg(<><circle cx="12" cy="12" r="8" /><path d="M12 7 L12 12 L15 14" /></>);
    case 'search':  return svg(<><circle cx="11" cy="11" r="6" /><line x1="15.5" y1="15.5" x2="20" y2="20" /></>);
    case 'menu':    return svg(<><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></>);
    default:        return svg(<circle cx="12" cy="12" r="8" />);
  }
};

// ─────────────────────────────────────────────────────────────
// SIDEBAR — slim agenda
// ─────────────────────────────────────────────────────────────
function DoctorSidebar() {
  const items = [
    ['09:00', 'Carlos Mendoza',     'control',     'done'],
    ['09:45', 'Patricia Lozano',    'oncol',       'done'],
    ['10:30', 'María F. Arellano',  '1ª vez',      'now'],
    ['11:15', 'José L. Padilla',    'post-op',     'next'],
    ['12:00', 'Ana Sofía Cortés',   'crónico',     'next'],
    ['13:30', '— libre —',          null,          'free'],
    ['14:00', 'Luis Ramírez',       '1ª vez',      'next'],
    ['15:00', 'Dolores Bautista',   'control',     'next'],
  ];
  return (
    <aside style={{
      width: 280, height: '100%',
      background: 'var(--white)', borderRight: '1px solid var(--rule)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* logo */}
      <div style={{ padding: '24px 24px 18px' }}>
        <HomeLogo color="var(--ink)" height={18} />
      </div>

      {/* agenda header */}
      <div style={{ padding: '6px 24px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span className="eyebrow">Hoy</span>
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>mié 14 may · 9/12</span>
      </div>

      {/* agenda list */}
      <div style={{ flex: 1, overflow: 'hidden', padding: '0 16px' }}>
        {items.map(([t, n, tag, state], i) => {
          const now = state === 'now';
          const done = state === 'done';
          const free = state === 'free';
          return (
            <div key={i} style={{
              position: 'relative', padding: '12px 12px 13px',
              borderRadius: 'var(--r-md)',
              background: now ? 'var(--ink)' : 'transparent',
              color: now ? 'var(--paper)' : 'var(--ink)',
              opacity: done ? 0.4 : free ? 0.45 : 1,
              cursor: 'pointer',
              marginBottom: 2,
              transition: 'background .15s',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span className="mono" style={{ fontSize: 12, color: now ? 'rgba(255,255,255,0.7)' : 'var(--ink-3)' }}>{t}</span>
                {now && <Pulse color="var(--accent-bright)" dark />}
                {done && <DocIcon kind="check" size={12} color="var(--ok)" />}
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.3, marginTop: 2, fontWeight: now ? 500 : 400 }}>{n}</div>
              {tag && <div className="mono" style={{ fontSize: 10.5, color: now ? 'rgba(255,255,255,0.6)' : 'var(--ink-3)', marginTop: 2, letterSpacing: '0.06em' }}>{tag}{now ? ' · ahora' : ''}</div>}
            </div>
          );
        })}
      </div>

      {/* doctor card at bottom */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid var(--rule)' }}>
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
          <button style={{ width: 28, height: 28, borderRadius: 6, color: 'var(--ink-3)' }}>
            <DocIcon kind="menu" size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────
// TOP — greeting + 3 micro-stats
// ─────────────────────────────────────────────────────────────
function DoctorTop() {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '28px 48px 20px',
    }}>
      <div>
        <span className="eyebrow">Miércoles · 14 mayo</span>
        <h1 style={{
          fontFamily: 'var(--sans)', fontSize: 32, fontWeight: 500, letterSpacing: '-0.025em',
          marginTop: 4,
        }}>
          Buenos días, <span className="serif" style={{ fontWeight: 400, color: 'var(--accent-deep)' }}>Dr. Solís</span>.
        </h1>
      </div>
      <div style={{ display: 'flex', gap: 32 }}>
        {[
          ['12', 'Citas hoy'],
          ['2', 'Atendidas'],
          ['1', 'En consulta'],
        ].map(([n, l]) => (
          <div key={l} style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 32, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1, color: 'var(--ink)' }}>{n}</div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 4, letterSpacing: '0.06em' }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HERO PATIENT CARD — the focal element
// ─────────────────────────────────────────────────────────────
function PatientHero() {
  return (
    <div style={{
      margin: '0 48px',
      background: 'var(--white)', border: '1px solid var(--rule)',
      borderRadius: 'var(--r-xl)', overflow: 'hidden',
      boxShadow: '0 1px 0 var(--rule-2)',
    }}>
      {/* eyebrow */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 32px', borderBottom: '1px solid var(--rule-2)',
        background: 'var(--paper)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Pulse color="var(--accent)" />
          <span className="eyebrow">Paciente en consulta · ahora</span>
        </div>
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>vínculo · hace 4d</span>
      </div>

      {/* body */}
      <div style={{ padding: '28px 32px 26px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 24, alignItems: 'center' }}>
          {/* avatar */}
          <div style={{
            width: 96, height: 96, borderRadius: 999,
            background: 'var(--paper-3)', color: 'var(--accent-deep)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--serif)', fontSize: 38, fontWeight: 400,
          }}>
            MF
          </div>

          {/* identity */}
          <div>
            <span className="eyebrow">Primera consulta · 10:30</span>
            <h2 style={{
              fontFamily: 'var(--serif)', fontSize: 56, fontWeight: 400,
              letterSpacing: '-0.025em', lineHeight: 1, marginTop: 4,
            }}>
              María Fernanda Arellano
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 12 }}>
              <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>♀ <strong style={{ fontWeight: 500 }}>34 años</strong></span>
              <span style={{ width: 1, height: 11, background: 'var(--rule)' }} />
              <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>O+ · 1.62 m · 58 kg</span>
              <span style={{ width: 1, height: 11, background: 'var(--rule)' }} />
              <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>CDMX</span>
              <span style={{ width: 1, height: 11, background: 'var(--rule)' }} />
              <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>imx_4f82c1</span>
            </div>
          </div>

          {/* actions */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn ghost">Ver expediente</button>
            <button className="btn" style={{ background: 'var(--accent)', borderColor: 'var(--accent)' }}>
              <DocIcon kind="plus" size={16} color="#fff" /> Nota
            </button>
          </div>
        </div>

        {/* ALERGIA — prominent banner */}
        <div style={{
          marginTop: 26, padding: '16px 22px',
          background: 'var(--alert-soft)', border: '1px solid var(--alert-rule)',
          borderRadius: 'var(--r-lg)',
          display: 'flex', alignItems: 'center', gap: 18,
        }}>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.14em',
            padding: '6px 12px', borderRadius: 999, background: 'var(--alert)', color: '#fff',
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 99, background: '#fff' }} />
            ALERGIA SEVERA
          </span>
          <span style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 400, color: 'var(--ink)' }}>
            Penicilina — anafilaxia, 2019.
          </span>
          <span style={{ fontSize: 13.5, color: 'var(--ink-3)' }}>Evitar β-lactámicos. Alternativa: macrólidos.</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 3 FOCUSED COLUMNS — Dx | Medication | Studies
// ─────────────────────────────────────────────────────────────
function FocusColumn({ icon, title, count, items, accent }) {
  return (
    <div style={{
      background: 'var(--white)', border: '1px solid var(--rule)',
      borderRadius: 'var(--r-xl)', overflow: 'hidden', display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 22px', borderBottom: '1px solid var(--rule-2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            width: 30, height: 30, borderRadius: 8,
            background: accent ? 'var(--accent)' : 'var(--paper-3)',
            color: accent ? '#fff' : 'var(--accent-deep)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <DocIcon kind={icon} size={16} />
          </span>
          <h3 style={{ fontSize: 16, fontWeight: 500, letterSpacing: '-0.01em' }}>{title}</h3>
        </div>
        <span style={{
          fontFamily: 'var(--mono)', fontSize: 11,
          padding: '3px 9px', borderRadius: 999,
          background: 'var(--paper-2)', color: 'var(--ink-2)',
        }}>{count}</span>
      </div>
      <ul style={{ padding: '10px 0', flex: 1 }}>
        {items.map((it, i) => (
          <li key={i} style={{
            padding: '14px 22px',
            borderBottom: i < items.length - 1 ? '1px solid var(--rule-3)' : 0,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>{it[0]}</span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{it[2]}</span>
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 4, lineHeight: 1.4 }}>{it[1]}</div>
          </li>
        ))}
      </ul>
      <div style={{ padding: '14px 22px', borderTop: '1px solid var(--rule-2)', background: 'var(--paper)' }}>
        <span style={{ fontSize: 12.5, color: 'var(--accent-deep)', fontWeight: 500, cursor: 'pointer' }}>
          Ver todo →
        </span>
      </div>
    </div>
  );
}

function DoctorFocus() {
  return (
    <div style={{ padding: '24px 48px 0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
      <FocusColumn
        icon="dx"
        title="Diagnósticos activos"
        count="4"
        accent
        items={[
          ['Hipotiroidismo primario', 'CIE-10 E03.9', 'desde 2018'],
          ['Migraña con aura', 'CIE-10 G43.1', 'desde 2021'],
          ['Síndrome de ovario poliquístico', 'CIE-10 E28.2', 'desde 2016'],
        ]}
      />
      <FocusColumn
        icon="pill"
        title="Medicación actual"
        count="3 activos"
        items={[
          ['Levotiroxina', '75 µg · 06:30 · ayunas', 'diario'],
          ['Sumatriptán', '50 mg · PRN migraña', 'PRN'],
          ['Sulfato ferroso', '525 mg · con jugo', 'diario'],
        ]}
      />
      <FocusColumn
        icon="study"
        title="Estudios recientes"
        count="3 este mes"
        items={[
          ['TSH elevada', '4.8 mU/L — sugerir ajuste', '12 mar'],
          ['Biometría hemática', 'Hb 11.4 · ferropenia leve', '08 mar'],
          ['USG tiroides', 'Nódulo 4 mm benigno', '22 ene'],
        ]}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// QUICK-ACTION BAR — bottom
// ─────────────────────────────────────────────────────────────
function QuickBar() {
  return (
    <div style={{
      margin: '24px 48px 32px', padding: '14px 18px',
      background: 'var(--ink)', color: 'var(--paper)',
      borderRadius: 'var(--r-xl)',
      display: 'flex', alignItems: 'center', gap: 16,
      boxShadow: '0 24px 60px -20px rgba(3,4,94,0.35)',
    }}>
      <span className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.12em' }}>
        ACCIONES DE CONSULTA
      </span>
      <span style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.16)' }} />
      <div style={{ display: 'flex', gap: 8, flex: 1 }}>
        {[
          ['Nota clínica', 'plus'],
          ['Receta digital', 'plus'],
          ['Solicitar estudio', 'plus'],
          ['Programar seguimiento', 'plus'],
        ].map(([label, icon]) => (
          <button key={label} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 14px', borderRadius: 999,
            background: 'rgba(255,255,255,0.06)', color: 'var(--paper)',
            border: '1px solid rgba(255,255,255,0.14)',
            fontSize: 13, fontWeight: 500, fontFamily: 'inherit',
            transition: 'background .15s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
          >
            <DocIcon kind={icon} size={13} color="var(--accent-bright)" />
            {label}
          </button>
        ))}
      </div>
      <button style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '10px 18px', borderRadius: 'var(--r-md)',
        background: 'var(--accent-bright)', color: 'var(--ink)',
        border: 0, fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
        cursor: 'pointer',
      }}>
        Cerrar consulta
        <DocIcon kind="arrow" size={14} />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Compose
// ─────────────────────────────────────────────────────────────
function DoctorScreen() {
  return (
    <div className="imx" style={{
      width: 1440, height: 900,
      background: 'var(--paper)',
      display: 'grid', gridTemplateColumns: '280px 1fr',
      overflow: 'hidden',
    }} data-screen-label="Doctor · consola">
      <DoctorSidebar />
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <DoctorTop />
        <PatientHero />
        <DoctorFocus />
        <div style={{ flex: 1 }} />
        <QuickBar />
      </div>
    </div>
  );
}

window.DoctorScreen = DoctorScreen;
