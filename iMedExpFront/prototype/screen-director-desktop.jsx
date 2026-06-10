// imedexp · Director (institution_admin) · PC
// Endpoints cubiertos:
//   GET /api/v1/doctors/institution              — médicos de la clínica
//   GET/POST/DELETE /api/v1/secretary/           — secretarias
//   POST /api/v1/secretary/{id}/doctors          — asignar a médico
//   GET  /api/v1/secretary/assignments           — matriz asignaciones
//   POST /api/v1/invitations/                    — invitar médico por correo
// Pantallas: Dashboard, Médicos, Secretarias, Invitaciones, Asignaciones

const DIR_NAV = [
  ['home',      'Inicio'],
  ['stetho',    'Médicos',         '18'],
  ['users',     'Secretarias',     '4'],
  ['inbox',     'Invitaciones',    '3'],
  ['link',      'Asignaciones'],
  ['briefcase', 'Pacientes',       '1 044'],
  ['build',     'Clínica'],
  ['user',      'Perfil'],
];
const DIR_WHO = ['Lic. R. Coria', 'RC', 'director · roma norte'];

// ─── 1 · Dashboard ─────────────────────────────────────────────
function DirDashScreen() {
  const recent = [
    { who: 'Dr. Beatriz Núñez',     act: 'aceptó invitación',     ago: 'hace 14 min', kind: 'ok' },
    { who: 'Sec. María Estela',     act: 'asignada a Dr. Vega',   ago: 'hace 2 h',    kind: 'info' },
    { who: 'Dr. Sergio Mata',       act: 'rechazó invitación',   ago: 'ayer',        kind: 'alert' },
    { who: 'Dr. Damián Vega',       act: 'sumó 6 pacientes',     ago: 'ayer',        kind: 'info' },
    { who: 'Lic. Olivia Quintana',  act: 'sec. nueva creada',     ago: '11 may',     kind: 'ok' },
    { who: 'Dr. Joaquín Rendón',    act: 'cédula validada',       ago: '10 may',     kind: 'ok' },
  ];
  const invites = [
    { mail: 'b.nuñez@gmail.com',     spec: 'Ginecología',   sent: 'hace 2 d', state: 'pendiente' },
    { mail: 'sergio.mata@gmail.com', spec: 'Endocrinología',sent: 'hace 3 d', state: 'pendiente' },
    { mail: 'pico.almeida@gmail.com',spec: 'Cardiología',   sent: 'hace 5 d', state: 'pendiente' },
  ];
  return (
    <window.AdmPage
      label="Y · Director · Inicio"
      nav={DIR_NAV} active={0} role="Director" who={DIR_WHO} accent="accent-bright"
      title="Clínica Roma Norte" sub="Director general · jueves 14 de mayo"
      searchHint="Buscar médico, secretaria…"
      height={1100}
      right={<button className="btn sm" style={{ height: 42, borderRadius: 'var(--r-md)' }}><window.AdmIcon kind="send" size={14} color="#fff" /> Invitar médico</button>}
    >
      {/* hero */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 12 }}>
        <div style={{
          background: 'var(--ink)', color: 'var(--paper)',
          borderRadius: 'var(--r-xl)', padding: '24px 26px',
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 20px 40px -20px rgba(3,4,94,0.45)',
        }}>
          <div style={{ position: 'absolute', width: 360, height: 360, borderRadius: 999, background: 'radial-gradient(circle, rgba(0,180,216,0.32) 0%, transparent 70%)', top: -120, right: -80 }} />
          <div style={{ position: 'relative' }}>
            <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Resumen operativo · semana 20</span>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 44, lineHeight: 1.02, letterSpacing: '-0.02em', marginTop: 8 }}>
              18 médicos<br />612 consultas<br />1 044 pacientes
            </h2>
            <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
              <button style={{ height: 38, padding: '0 18px', borderRadius: 'var(--r-md)', background: 'var(--accent-bright)', color: 'var(--ink)', border: 0, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                Invitar médico <window.AdmIcon kind="arrow" size={13} color="var(--ink)" />
              </button>
              <button className="btn sm dark-ghost" style={{ height: 38 }}>Crear secretaria</button>
            </div>
          </div>
        </div>
        <window.AdmStat k="Médicos activos" n="18" sub="15 verificados · 3 invitados" />
        <window.AdmStat k="Consultas / semana" n="142" sub="+12% vs sem. 19" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 12 }}>
        <window.AdmStat k="Secretarias" n="4" sub="3 con doctores asignados" />
        <window.AdmStat k="Asignaciones" n="11" sub="11 pares sec ↔ doctor" />
        <window.AdmStat k="Invitaciones pend." n="3" sub="2 esperan ≥ 48h" tone="alert" />
        <window.AdmStat k="Pacientes vinculados" n="1 044" sub="+38 este mes" />
      </div>

      {/* 2 col: activity + invites */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 14, marginTop: 18 }}>
        <window.AdmCard title="Actividad reciente" action={<span className="mono" style={{ fontSize: 11, color: 'var(--accent-deep)' }}>Ver todo →</span>}>
          {recent.map((r, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '36px 1fr auto', gap: 12, alignItems: 'center',
              padding: '13px 20px',
              borderBottom: i < recent.length - 1 ? '1px solid var(--rule-3)' : 0,
            }}>
              <span style={{
                width: 30, height: 30, borderRadius: 99,
                background: r.kind === 'ok' ? '#E5F5EE' : r.kind === 'alert' ? 'var(--alert-soft)' : 'var(--paper-3)',
                color:      r.kind === 'ok' ? 'var(--ok)' : r.kind === 'alert' ? 'var(--alert)'  : 'var(--accent-deep)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <window.AdmIcon kind={r.kind === 'ok' ? 'check' : r.kind === 'alert' ? 'x' : 'link'} size={13} />
              </span>
              <div>
                <div style={{ fontSize: 13.5 }}><span style={{ fontWeight: 500 }}>{r.who}</span> <span style={{ color: 'var(--ink-3)' }}>· {r.act}</span></div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 2 }}>{r.ago}</div>
              </div>
              <window.AdmIcon kind="more" size={14} color="var(--ink-3)" />
            </div>
          ))}
        </window.AdmCard>

        <window.AdmCard title="Invitaciones pendientes" action={<span className="mono" style={{ fontSize: 11, color: 'var(--accent-deep)' }}>Ir →</span>}>
          {invites.map((iv, i) => (
            <div key={i} style={{ padding: '13px 20px', borderBottom: i < invites.length - 1 ? '1px solid var(--rule-3)' : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink)' }}>{iv.mail}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, padding: '2px 7px', borderRadius: 999, background: 'var(--alert-soft)', color: 'var(--alert)', letterSpacing: '0.08em' }}>{iv.state.toUpperCase()}</span>
              </div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 4 }}>{iv.spec} · enviada {iv.sent}</div>
            </div>
          ))}
          <div style={{ padding: '12px 20px' }}>
            <button className="btn sm ghost block" style={{ width: '100%', justifyContent: 'center' }}>
              <window.AdmIcon kind="plus" size={13} /> Nueva invitación
            </button>
          </div>
        </window.AdmCard>
      </div>
    </window.AdmPage>
  );
}

// ─── 2 · Médicos ───────────────────────────────────────────────
function DirDoctorsScreen() {
  const docs = [
    { name: 'Dr. Damián Vega Ríos',     spec: 'Cirugía general',     pats: 142, ced: '8 421 776', state: 'activo',     since: 'feb 24', tone: 'accent' },
    { name: 'Dra. Lorena Padilla',      spec: 'Medicina interna',    pats: 96,  ced: '7 119 308', state: 'activo',     since: 'feb 24' },
    { name: 'Dr. Joaquín Rendón',       spec: 'Cardiología',         pats: 81,  ced: '6 980 412', state: 'activo',     since: 'mar 24' },
    { name: 'Dra. Mariana Sotelo',      spec: 'Ginecología',         pats: 73,  ced: '9 211 504', state: 'activo',     since: 'mar 24' },
    { name: 'Dr. Tomás Alcalá',         spec: 'Pediatría',           pats: 64,  ced: '7 622 189', state: 'activo',     since: 'abr 24' },
    { name: 'Dra. Inés Fuentes',        spec: 'Dermatología',        pats: 58,  ced: '8 015 770', state: 'activo',     since: 'abr 24' },
    { name: 'Dr. Pablo Salinas',        spec: 'Ortopedia',           pats: 49,  ced: '9 477 632', state: 'activo',     since: 'may 24' },
    { name: 'Dra. Beatriz Núñez',       spec: 'Ginecología',         pats: 0,   ced: 'verif. en curso', state: 'invitado', since: 'hoy' },
    { name: 'Dr. Federico Padilla',     spec: 'Otorrino',            pats: 22,  ced: '7 412 905', state: 'activo',     since: 'jun 24' },
    { name: 'Dra. Sofía Hernández',     spec: 'Endocrinología',      pats: 18,  ced: '8 990 145', state: 'activo',     since: 'jul 24' },
    { name: 'Dr. Andrés Quiroga',       spec: 'Neumología',          pats: 11,  ced: '6 855 731', state: 'pausado',    since: 'jul 24' },
  ];
  return (
    <window.AdmPage
      label="Z · Director · Médicos"
      nav={DIR_NAV} active={1} role="Director" who={DIR_WHO} accent="accent-bright"
      title="Médicos de la clínica" sub="18 médicos · 612 consultas / mes"
      searchHint="Buscar médico, cédula, especialidad…"
      height={1100}
      right={<button className="btn sm" style={{ height: 42, borderRadius: 'var(--r-md)' }}><window.AdmIcon kind="send" size={14} color="#fff" /> Invitar médico</button>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <window.AdmStat k="Activos" n="15" sub="con consultas esta semana" />
        <window.AdmStat k="Invitados" n="3" sub="esperan aceptar" />
        <window.AdmStat k="Pausados" n="1" sub="sin actividad ≥ 14 d" />
        <window.AdmStat k="Cédulas verificadas" n="15 / 18" sub="83% · 3 en validación" />
      </div>

      <div style={{ display: 'flex', gap: 6, marginTop: 18, alignItems: 'center', flexWrap: 'wrap' }}>
        {[['Todos', 18, true], ['Activos', 15], ['Invitados', 3], ['Pausados', 1], ['Ginecología', 2], ['Cirugía', 1]].map(([k, n, on]) => (
          <window.AdmPill key={k} on={on} count={n}>{k}</window.AdmPill>
        ))}
        <span style={{ flex: 1 }} />
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>Ordenar: pacientes ▾</span>
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden', marginTop: 14 }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1.8fr 1.2fr 0.7fr 1fr 0.9fr 40px',
          padding: '12px 18px', borderBottom: '1px solid var(--rule-2)',
          fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          <span>Médico</span><span>Especialidad</span><span>Pacientes</span><span>Cédula</span><span>Estado</span><span></span>
        </div>
        {docs.map((d, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '1.8fr 1.2fr 0.7fr 1fr 0.9fr 40px',
            padding: '12px 18px', alignItems: 'center',
            borderBottom: i < docs.length - 1 ? '1px solid var(--rule-3)' : 0,
            background: d.tone === 'accent' ? 'var(--paper-3)' : 'transparent',
            borderLeft: d.tone === 'accent' ? '3px solid var(--accent)' : '3px solid transparent',
            paddingLeft: d.tone === 'accent' ? 15 : 18,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <span style={{
                width: 34, height: 34, borderRadius: 10,
                background: d.tone === 'accent' ? 'var(--accent-bright)' : 'var(--paper-4)',
                color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--serif)', fontSize: 14,
              }}>{d.name.split(' ').slice(1, 3).map(s => s[0]).join('')}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{d.name}</div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>activo desde {d.since}</div>
              </div>
            </div>
            <span style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>{d.spec}</span>
            <span className="mono" style={{ fontSize: 12, color: 'var(--ink-2)' }}>{d.pats}</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{d.ced}</span>
            <span style={{
              fontFamily: 'var(--mono)', fontSize: 9.5, padding: '3px 8px', borderRadius: 999,
              background: d.state === 'activo' ? '#E5F5EE' : d.state === 'pausado' ? 'var(--alert-soft)' : 'var(--paper-3)',
              color:      d.state === 'activo' ? 'var(--ok)' : d.state === 'pausado' ? 'var(--alert)'  : 'var(--accent-deep)',
              letterSpacing: '0.06em', textTransform: 'uppercase', width: 'fit-content',
            }}>{d.state}</span>
            <window.AdmIcon kind="more" size={16} color="var(--ink-3)" />
          </div>
        ))}
      </div>
    </window.AdmPage>
  );
}

// ─── 3 · Secretarias ──────────────────────────────────────────
function DirSecretariesScreen() {
  const secs = [
    { name: 'María Estela Vargas',  email: 'mvargas@romanorte.mx',   doctors: ['Dr. Vega', 'Dra. Padilla', 'Dr. Rendón'],   pats: 318, since: 'feb 24', sel: true },
    { name: 'Olivia Quintana',      email: 'oquintana@romanorte.mx', doctors: ['Dra. Sotelo', 'Dr. Alcalá'],                  pats: 137, since: 'mar 24' },
    { name: 'Berenice Trejo',       email: 'btrejo@romanorte.mx',    doctors: ['Dra. Fuentes', 'Dr. Padilla', 'Dr. Salinas'], pats: 129, since: 'abr 24' },
    { name: 'Itzel Robles',         email: 'irobles@romanorte.mx',   doctors: [],                                              pats: 0,   since: 'ayer' },
  ];
  const sel = secs[0];
  return (
    <window.AdmPage
      label="AA · Director · Secretarias"
      nav={DIR_NAV} active={2} role="Director" who={DIR_WHO} accent="accent-bright"
      title="Secretarias" sub="4 cuentas · 11 asignaciones doctor ↔ secretaria"
      searchHint="Buscar secretaria, médico asignado…"
      height={1080}
      right={<button className="btn sm" style={{ height: 42, borderRadius: 'var(--r-md)' }}><window.AdmIcon kind="plus" size={14} color="#fff" /> Crear secretaria</button>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <window.AdmStat k="Secretarias activas" n="4" sub="3 con doctores asignados" />
        <window.AdmStat k="Asignaciones totales" n="11" sub="prom. 3.7 por secretaria" />
        <window.AdmStat k="Citas gestionadas / sem" n="312" sub="78% sin reagendar" />
        <window.AdmStat k="Sin asignar" n="1" sub="Itzel Robles · nueva" tone="alert" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14, marginTop: 18 }}>
        {/* lista */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1.4fr 1.6fr 0.7fr 0.7fr 40px',
            padding: '12px 18px', borderBottom: '1px solid var(--rule-2)',
            fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            <span>Secretaria</span><span>Médicos asignados</span><span>Pacientes</span><span>Alta</span><span></span>
          </div>
          {secs.map((s, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '1.4fr 1.6fr 0.7fr 0.7fr 40px',
              padding: '14px 18px', alignItems: 'center',
              borderBottom: i < secs.length - 1 ? '1px solid var(--rule-3)' : 0,
              background: s.sel ? 'var(--paper-3)' : 'transparent',
              borderLeft: s.sel ? '3px solid var(--accent)' : '3px solid transparent',
              paddingLeft: s.sel ? 15 : 18,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <span style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--paper-4)', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 14 }}>
                  {s.name.split(' ').slice(0, 2).map(x => x[0]).join('')}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500 }}>{s.name}</div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{s.email}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {s.doctors.length === 0
                  ? <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, padding: '3px 8px', borderRadius: 999, background: 'var(--alert-soft)', color: 'var(--alert)', letterSpacing: '0.08em' }}>SIN ASIGNAR</span>
                  : s.doctors.map((d, j) => (
                    <span key={j} style={{ fontFamily: 'var(--mono)', fontSize: 10, padding: '2px 7px', borderRadius: 999, background: 'var(--paper-3)', color: 'var(--accent-deep)' }}>{d}</span>
                  ))}
              </div>
              <span className="mono" style={{ fontSize: 12, color: 'var(--ink-2)' }}>{s.pats}</span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{s.since}</span>
              <window.AdmIcon kind="more" size={16} color="var(--ink-3)" />
            </div>
          ))}
        </div>

        {/* detail / assign panel */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden', height: 'fit-content' }}>
          <div style={{ padding: '20px 22px 18px', background: 'var(--ink)', color: 'var(--paper)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', width: 180, height: 180, borderRadius: 999, background: 'radial-gradient(circle, rgba(0,180,216,0.3) 0%, transparent 70%)', top: -60, right: -50 }} />
            <div style={{ position: 'relative' }}>
              <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Secretaria · seleccionada</span>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 26, lineHeight: 1, letterSpacing: '-0.02em', marginTop: 6 }}>{sel.name}</div>
              <div className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 6 }}>{sel.email} · 318 pacientes · 3 médicos</div>
            </div>
          </div>
          <div style={{ padding: 16 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Asignar a nuevo médico</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)', background: 'var(--paper)' }}>
              <window.AdmIcon kind="search" size={14} color="var(--ink-3)" />
              <span style={{ fontSize: 13, color: 'var(--ink-3)', flex: 1 }}>Dr. Federico Padilla · otorrino</span>
              <button className="btn sm" style={{ height: 28, fontSize: 11.5, borderRadius: 8 }}>Asignar</button>
            </div>

            <div className="eyebrow" style={{ marginTop: 16, marginBottom: 8 }}>Médicos asignados</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                ['Dr. Damián Vega Ríos',  'Cirugía general',   142],
                ['Dra. Lorena Padilla',  'Medicina interna',  96],
                ['Dr. Joaquín Rendón',   'Cardiología',       81],
              ].map(([n, s, p], i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '32px 1fr auto 22px', gap: 10, alignItems: 'center', padding: '8px 10px', background: 'var(--paper)', borderRadius: 'var(--r-md)' }}>
                  <span style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--paper-3)', color: 'var(--accent-deep)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 12 }}>{n.split(' ').slice(1, 3).map(x => x[0]).join('')}</span>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 500 }}>{n}</div>
                    <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{s} · {p} pac.</div>
                  </div>
                  <window.AdmIcon kind="link" size={14} color="var(--ink-3)" />
                  <window.AdmIcon kind="x" size={14} color="var(--alert)" />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
              <button className="btn sm ghost" style={{ flex: 1, justifyContent: 'center' }}>Editar</button>
              <button className="btn sm ghost" style={{ flex: 1, justifyContent: 'center', color: 'var(--alert)', borderColor: 'var(--alert-rule)' }}>Eliminar</button>
            </div>
          </div>
        </div>
      </div>
    </window.AdmPage>
  );
}

// ─── 4 · Invitaciones ────────────────────────────────────────
function DirInvitesScreen() {
  const queue = [
    { mail: 'b.nuñez@gmail.com',      name: 'Dra. Beatriz Núñez',     spec: 'Ginecología',     sent: 'hace 2 d', state: 'pendiente' },
    { mail: 'sergio.mata@gmail.com',  name: 'Dr. Sergio Mata',        spec: 'Endocrinología',  sent: 'hace 3 d', state: 'pendiente' },
    { mail: 'pico.almeida@gmail.com', name: 'Dr. Federico Almeida',   spec: 'Cardiología',     sent: 'hace 5 d', state: 'pendiente' },
    { mail: 'mp.rojas@gmail.com',     name: 'Dr. Martín P. Rojas',    spec: 'Neurología',      sent: '12 may',   state: 'aceptada' },
    { mail: 'd.alarcon@gmail.com',    name: 'Dra. Daniela Alarcón',   spec: 'Reumatología',    sent: '10 may',   state: 'rechazada' },
    { mail: 'jl.ovalle@gmail.com',    name: 'Dr. J. Luis Ovalle',     spec: 'Gastroenterología',sent:'08 may',   state: 'aceptada' },
    { mail: 'g.serrano@gmail.com',    name: 'Dra. Gloria Serrano',    spec: 'Dermatología',    sent: '05 may',   state: 'expirada' },
  ];
  return (
    <window.AdmPage
      label="AB · Director · Invitaciones"
      nav={DIR_NAV} active={3} role="Director" who={DIR_WHO} accent="accent-bright"
      title="Invitaciones a médicos" sub="3 pendientes · 14 aceptadas · 2 rechazadas"
      searchHint="Buscar correo, especialidad…"
      height={1100}
      right={<button className="btn sm" style={{ height: 42, borderRadius: 'var(--r-md)' }}><window.AdmIcon kind="send" size={14} color="#fff" /> Nueva invitación</button>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14 }}>
        {/* compose */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--rule-2)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 500 }}>Invitar médico</h3>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>Enviaremos un correo con el enlace de aceptación</div>
          </div>
          <div style={{ padding: '20px 22px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                ['Correo del médico', 'beatriz.nunez@gmail.com', 'mail'],
                ['Especialidad esperada', 'Ginecología', 'stetho'],
                ['Cédula (opcional)', '9 211 504', 'doc'],
                ['Mensaje (opcional)', 'Bea, ya te tengo el alta — entras en feb', 'send'],
              ].map(([k, v, ic], i) => (
                <div key={i} style={{
                  padding: '12px 14px',
                  border: '1px solid var(--rule)', borderRadius: 'var(--r-md)',
                  background: 'var(--paper)',
                  gridColumn: i === 3 ? '1 / -1' : 'auto',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <window.AdmIcon kind={ic} size={13} color="var(--ink-3)" />
                    <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{k}</span>
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 13.5, color: 'var(--ink)', marginTop: 6 }}>{v}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 }}>
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>La invitación caduca a los 7 días</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn sm ghost">Cancelar</button>
                <button className="btn sm"><window.AdmIcon kind="send" size={13} color="#fff" /> Enviar invitación</button>
              </div>
            </div>
          </div>
        </div>

        {/* tips */}
        <div style={{ background: 'var(--ink)', color: 'var(--paper)', borderRadius: 'var(--r-xl)', padding: '22px 24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', width: 280, height: 280, borderRadius: 999, background: 'radial-gradient(circle, rgba(0,180,216,0.28) 0%, transparent 70%)', top: -100, right: -80 }} />
          <div style={{ position: 'relative' }}>
            <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Cómo funciona</span>
            <h3 style={{ fontFamily: 'var(--serif)', fontSize: 28, marginTop: 8, lineHeight: 1.05, letterSpacing: '-0.02em' }}>Tres pasos<br />y entra al equipo.</h3>
            <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                ['1', 'Mandas la invitación', 'el médico recibe un correo con tu nombre y el de la clínica'],
                ['2', 'Acepta desde su consola', 'PATCH /invitations/{id} — si ya tiene cuenta, queda dentro'],
                ['3', 'Se vincula automáticamente', 'aparece en tu lista de médicos y puede agendar consultas'],
              ].map(([n, t, d], i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '36px 1fr', gap: 12 }}>
                  <span style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--accent-bright)', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 16 }}>{n}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{t}</div>
                    <div className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>{d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* queue table */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden', marginTop: 18 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--rule-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 15, fontWeight: 500 }}>Historial de invitaciones</h3>
          <div style={{ display: 'flex', gap: 6 }}>
            {[['Todas', 17, true], ['Pendientes', 3, false, 'alert'], ['Aceptadas', 14], ['Rechazadas', 2]].map(([k, n, on, tone]) => (
              <window.AdmPill key={k} on={on} count={n} tone={tone}>{k}</window.AdmPill>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.4fr 1fr 0.8fr 0.8fr 90px', padding: '12px 20px', borderBottom: '1px solid var(--rule-2)', fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <span>Médico</span><span>Correo</span><span>Especialidad</span><span>Enviada</span><span>Estado</span><span></span>
        </div>
        {queue.map((q, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '1.6fr 1.4fr 1fr 0.8fr 0.8fr 90px',
            padding: '12px 20px', alignItems: 'center',
            borderBottom: i < queue.length - 1 ? '1px solid var(--rule-3)' : 0,
          }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{q.name}</span>
            <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-2)' }}>{q.mail}</span>
            <span style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>{q.spec}</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{q.sent}</span>
            <span style={{
              fontFamily: 'var(--mono)', fontSize: 9.5, padding: '3px 8px', borderRadius: 999,
              background: q.state === 'pendiente' ? 'var(--alert-soft)' : q.state === 'aceptada' ? '#E5F5EE' : q.state === 'expirada' ? 'var(--paper-3)' : 'var(--alert-soft)',
              color:      q.state === 'pendiente' ? 'var(--alert)' : q.state === 'aceptada' ? 'var(--ok)' : q.state === 'expirada' ? 'var(--ink-3)' : 'var(--alert)',
              letterSpacing: '0.08em', textTransform: 'uppercase', width: 'fit-content',
            }}>{q.state}</span>
            {q.state === 'pendiente'
              ? <button className="btn sm ghost" style={{ height: 28, fontSize: 11 }}>Reenviar</button>
              : <window.AdmIcon kind="more" size={16} color="var(--ink-3)" />}
          </div>
        ))}
      </div>
    </window.AdmPage>
  );
}

// ─── 5 · Asignaciones doctor ↔ secretaria ────────────────────
function DirAssignsScreen() {
  const docs = ['Dr. Vega', 'Dra. Padilla', 'Dr. Rendón', 'Dra. Sotelo', 'Dr. Alcalá', 'Dra. Fuentes', 'Dr. Salinas', 'Dr. F. Padilla', 'Dra. Hernández'];
  const secs = ['M. Vargas', 'O. Quintana', 'B. Trejo', 'I. Robles'];
  // matrix[doctorIdx][secIdx] = true if assigned
  const matrix = [
    [true,  false, false, false],
    [true,  false, false, false],
    [true,  false, false, false],
    [false, true,  false, false],
    [false, true,  false, false],
    [false, false, true,  false],
    [false, false, true,  false],
    [false, false, true,  false],
    [false, true,  false, false],
  ];
  return (
    <window.AdmPage
      label="AC · Director · Asignaciones"
      nav={DIR_NAV} active={4} role="Director" who={DIR_WHO} accent="accent-bright"
      title="Asignaciones doctor ↔ secretaria" sub="11 pares activos · 1 médico sin secretaria"
      searchHint="Buscar médico o secretaria…"
      height={1040}
      right={<button className="btn sm" style={{ height: 42, borderRadius: 'var(--r-md)' }}><window.AdmIcon kind="link" size={14} color="#fff" /> Nueva asignación</button>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <window.AdmStat k="Pares activos" n="11" sub="prom. 3.7 doctores / sec" />
        <window.AdmStat k="Médicos cubiertos" n="9 / 18" sub="50% — meta 80%" tone="alert" />
        <window.AdmStat k="Secretarias en uso" n="3 / 4" sub="Itzel Robles sin asignar" />
        <window.AdmStat k="Cambios este mes" n="6" sub="4 alta · 2 baja" />
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden', marginTop: 18 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--rule-2)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 500 }}>Matriz de asignación</h3>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>Toca cualquier celda para vincular o desvincular</div>
        </div>
        <div style={{ overflow: 'auto', padding: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: `220px repeat(${secs.length}, 1fr)`, gap: 0, minWidth: 700 }}>
            {/* header row */}
            <div></div>
            {secs.map((s, i) => (
              <div key={i} style={{ padding: '12px 14px', textAlign: 'center', borderBottom: '1px solid var(--rule-2)' }}>
                <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--paper-3)', color: 'var(--accent-deep)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 14 }}>
                    {s.split(' ').map(x => x[0]).join('')}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 500 }}>{s}</span>
                </div>
              </div>
            ))}
            {docs.map((d, i) => (
              <React.Fragment key={d}>
                <div style={{ padding: '14px 14px', borderTop: '1px solid var(--rule-3)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--paper-4)', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 12 }}>{d.split(' ').slice(-1)[0][0]}</span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{d}</span>
                </div>
                {matrix[i].map((on, j) => (
                  <div key={j} style={{
                    padding: 8, borderTop: '1px solid var(--rule-3)', borderLeft: '1px solid var(--rule-3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: on ? 'var(--accent-bright)' : 'var(--paper)',
                      border: on ? '1px solid var(--accent)' : '1px dashed var(--rule)',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    }}>
                      {on
                        ? <window.AdmIcon kind="check" size={16} color="var(--ink)" />
                        : <window.AdmIcon kind="plus" size={14} color="var(--ink-3)" />}
                    </span>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </window.AdmPage>
  );
}

Object.assign(window, { DirDashScreen, DirDoctorsScreen, DirSecretariesScreen, DirInvitesScreen, DirAssignsScreen });
