// imedexp · Director (institution_admin) · móvil
// 9 pantallas: Dashboard · Médicos · Detalle médico · Secretarias · Invitaciones · Asignaciones · Pacientes · Configuración · Perfil

const DIR_TABS_M = [
  ['home',      'Inicio'],
  ['stetho',    'Médicos'],
  ['users',     'Sec.'],
  ['inbox',     'Invit.'],
  ['briefcase', 'Pacientes'],
  ['user',      'Perfil'],
];
const DIRdev = ({ children }) => <window.IOSDevice width={390} height={844} title="imedexp">{children}</window.IOSDevice>;

// ─── 1 · Dashboard ─────────────────────────────────────────────
function DirDashMobile() {
  return (
    <div data-screen-label="Y₂ · Director · Inicio (móvil)">
      <DIRdev>
        <window.MbFrame tabs={DIR_TABS_M} active={0}
          fab={<window.MbFAB icon="send" label="Invitar médico" />}>
          <window.MbTop sub="Clínica Roma Norte · jue 14 may" title="Tu clínica" />
          {/* hero */}
          <div style={{ padding: '14px 20px 0' }}>
            <div style={{ background: 'var(--ink)', color: 'var(--paper)', borderRadius: 'var(--r-lg)', padding: 18, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', width: 220, height: 220, borderRadius: 999, background: 'radial-gradient(circle, rgba(0,180,216,0.32) 0%, transparent 70%)', top: -80, right: -60 }} />
              <div style={{ position: 'relative' }}>
                <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Sem. 20 · operativo</span>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: 32, lineHeight: 1, letterSpacing: '-0.02em', marginTop: 6 }}>
                  18 médicos<br />612 consultas<br />1 044 pacientes
                </h2>
                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                  <button style={{ flex: 1, height: 36, padding: '0 12px', borderRadius: 9, background: 'var(--accent-bright)', color: 'var(--ink)', border: 0, fontSize: 12, fontWeight: 600 }}>Invitar médico</button>
                  <button style={{ flex: 1, height: 36, padding: '0 12px', borderRadius: 9, background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.25)', fontSize: 12 }}>+ Secretaria</button>
                </div>
              </div>
            </div>
          </div>
          <div style={{ padding: '14px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <window.MbStat k="Médicos activos" n="18" sub="15 verificados · 3 invitados" />
            <window.MbStat k="Consultas / sem" n="142" sub="+12% vs sem. 19" />
            <window.MbStat k="Secretarias" n="4" sub="11 asignaciones" />
            <window.MbStat k="Invitaciones pend." n="3" sub="2 esperan ≥ 48h" tone="alert" />
          </div>

          <window.MbSection title="Actividad reciente" action="Ver →">
            {[
              ['Dra. B. Núñez', 'aceptó invitación', 'hace 14 min', 'ok'],
              ['Sec. M. Estela', 'asignada a Dr. Vega', 'hace 2 h', 'info'],
              ['Dr. S. Mata',   'rechazó invitación', 'ayer',     'alert'],
              ['Dr. D. Vega',   'sumó 6 pacientes',   'ayer',     'info'],
            ].map(([who, act, ago, k], i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '30px 1fr auto', gap: 10, alignItems: 'center', padding: '11px 12px', background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)', marginBottom: 6 }}>
                <span style={{ width: 26, height: 26, borderRadius: 99, background: k === 'ok' ? '#E5F5EE' : k === 'alert' ? 'var(--alert-soft)' : 'var(--paper-3)', color: k === 'ok' ? 'var(--ok)' : k === 'alert' ? 'var(--alert)' : 'var(--accent-deep)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <window.MbIcon kind={k === 'ok' ? 'check' : k === 'alert' ? 'x' : 'link'} size={11} />
                </span>
                <div>
                  <div style={{ fontSize: 12.5 }}><span style={{ fontWeight: 500 }}>{who}</span> <span style={{ color: 'var(--ink-3)' }}>· {act}</span></div>
                  <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)' }}>{ago}</div>
                </div>
              </div>
            ))}
          </window.MbSection>

          <window.MbSection title="Invitaciones pendientes" action="Ir →">
            {[
              ['b.nuñez@gmail.com',      'Ginecología',     'hace 2 d'],
              ['sergio.mata@gmail.com',  'Endocrinología',  'hace 3 d'],
              ['pico.almeida@gmail.com', 'Cardiología',     'hace 5 d'],
            ].map(([m, s, ago], i) => (
              <div key={i} style={{ padding: '11px 12px', background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)', marginBottom: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink)' }}>{m}</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 9, padding: '2px 6px', borderRadius: 999, background: 'var(--alert-soft)', color: 'var(--alert)', letterSpacing: '0.06em' }}>PEND</span>
                </div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 4 }}>{s} · {ago}</div>
              </div>
            ))}
          </window.MbSection>
          <div style={{ height: 20 }} />
        </window.MbFrame>
      </DIRdev>
    </div>
  );
}

// ─── 2 · Médicos ───────────────────────────────────────────────
function DirDoctorsMobile() {
  const docs = [
    ['Dr. D. Vega Ríos',     'Cirugía general',  142, 'activo'],
    ['Dra. L. Padilla',      'Med. interna',     96,  'activo'],
    ['Dr. J. Rendón',        'Cardiología',      81,  'activo'],
    ['Dra. M. Sotelo',       'Ginecología',      73,  'activo'],
    ['Dr. T. Alcalá',        'Pediatría',        64,  'activo'],
    ['Dra. I. Fuentes',      'Dermatología',     58,  'activo'],
    ['Dra. B. Núñez',        'Ginecología',      0,   'invitado'],
    ['Dr. A. Quiroga',       'Neumología',       11,  'pausado'],
  ];
  return (
    <div data-screen-label="Z₂ · Director · Médicos (móvil)">
      <DIRdev>
        <window.MbFrame tabs={DIR_TABS_M} active={1}
          fab={<window.MbFAB icon="send" label="Invitar" />}>
          <window.MbTop sub="18 médicos · 612 consultas/mes" title="Mis médicos" />
          <div style={{ padding: '12px 20px 0', display: 'flex', gap: 6, overflowX: 'auto' }}>
            {[['Todos', 18, true], ['Activos', 15], ['Invitados', 3], ['Pausados', 1]].map(([k, n, on]) => (
              <window.MbPill key={k} on={on} count={n}>{k}</window.MbPill>
            ))}
          </div>
          <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {docs.map(([n, sp, p, st], i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '40px 1fr auto', gap: 10, alignItems: 'center', padding: '12px 14px', background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)' }}>
                <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--paper-4)', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 13 }}>
                  {n.split(' ').slice(1, 3).map(s => s[0]).join('')}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500 }}>{n}</div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{sp} · {p} pac.</div>
                </div>
                <span style={{
                  fontFamily: 'var(--mono)', fontSize: 9, padding: '3px 7px', borderRadius: 999,
                  background: st === 'activo' ? '#E5F5EE' : st === 'pausado' ? 'var(--alert-soft)' : 'var(--paper-3)',
                  color:      st === 'activo' ? 'var(--ok)' : st === 'pausado' ? 'var(--alert)'  : 'var(--accent-deep)',
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>{st}</span>
              </div>
            ))}
          </div>
        </window.MbFrame>
      </DIRdev>
    </div>
  );
}

// ─── 3 · Detalle de médico ────────────────────────────────────
function DirDoctorDetailMobile() {
  return (
    <div data-screen-label="AQ₂ · Director · Detalle médico (móvil)">
      <DIRdev>
        <window.MbFrame noTabs>
          <div style={{ background: 'var(--ink)', color: 'var(--paper)', padding: '14px 20px 22px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', width: 240, height: 240, borderRadius: 999, background: 'radial-gradient(circle, rgba(0,180,216,0.3) 0%, transparent 70%)', top: -90, right: -70 }} />
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <window.MbIcon kind="chev-l" size={16} color="rgba(255,255,255,0.8)" />
              <span className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.04em' }}>Médicos</span>
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 60, height: 60, borderRadius: 16, background: 'var(--accent-bright)', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 26 }}>DV</span>
              <div style={{ flex: 1 }}>
                <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Cirujano · cédula 8 421 776</span>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 22, lineHeight: 1.05, marginTop: 2 }}>Dr. Damián Vega Ríos</div>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, padding: '3px 8px', borderRadius: 999, background: 'var(--accent-bright)', color: 'var(--ink)', letterSpacing: '0.06em', display: 'inline-block', marginTop: 6 }}>ACTIVO</span>
              </div>
            </div>
          </div>

          <div style={{ padding: '14px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <window.MbStat k="Pacientes" n="142" sub="88 activos" />
            <window.MbStat k="Consultas / sem" n="38" sub="+12%" />
            <window.MbStat k="Recetas / sem" n="28" sub="92% OCR" />
            <window.MbStat k="Quirófano / sem" n="6 h" sub="3 días" />
          </div>

          <window.MbSection title="Horario semana tipo">
            {[
              ['Lun', '08–13 · OR 14–16'], ['Mar', '09–14'], ['Mié', '08–13 · 15–18'],
              ['Jue', 'OR 08–12 · 13–17'], ['Vie', '09–14'], ['Sáb', '09–12'],
            ].map(([d, t], i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '50px 1fr', alignItems: 'center', padding: '10px 12px', background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)', marginBottom: 4 }}>
                <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{d}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink)' }}>{t}</span>
              </div>
            ))}
          </window.MbSection>

          <window.MbSection title="Secretarias asignadas">
            <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr auto', gap: 10, alignItems: 'center', padding: '11px 12px', background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)' }}>
              <span style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--accent-bright)', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 12 }}>MV</span>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 500 }}>M. Estela Vargas</div>
                <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)' }}>318 pacientes · 3 doctores</div>
              </div>
              <window.MbIcon kind="x" size={14} color="var(--alert)" />
            </div>
          </window.MbSection>

          <div style={{ padding: '16px 20px 30px', display: 'flex', gap: 8 }}>
            <button className="btn sm ghost" style={{ flex: 1, justifyContent: 'center' }}><window.MbIcon kind="edit" size={12} /> Editar</button>
            <button className="btn sm ghost" style={{ flex: 1, justifyContent: 'center', color: 'var(--alert)', borderColor: 'var(--alert-rule)' }}>Suspender</button>
          </div>
        </window.MbFrame>
      </DIRdev>
    </div>
  );
}

// ─── 4 · Secretarias ──────────────────────────────────────────
function DirSecretariesMobile() {
  const secs = [
    { n: 'María Estela Vargas',  email: 'mvargas@romanorte.mx',   docs: 3, pats: 318, sel: true },
    { n: 'Olivia Quintana',      email: 'oquintana@romanorte.mx', docs: 2, pats: 137 },
    { n: 'Berenice Trejo',       email: 'btrejo@romanorte.mx',    docs: 3, pats: 129 },
    { n: 'Itzel Robles',         email: 'irobles@romanorte.mx',   docs: 0, pats: 0, none: true },
  ];
  return (
    <div data-screen-label="AA₂ · Director · Secretarias (móvil)">
      <DIRdev>
        <window.MbFrame tabs={DIR_TABS_M} active={2}
          fab={<window.MbFAB icon="plus" label="Crear" />}>
          <window.MbTop sub="4 cuentas · 11 asignaciones" title="Secretarias" />
          <div style={{ padding: '12px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <window.MbStat k="Activas" n="4" sub="3 con doctores" />
            <window.MbStat k="Sin asignar" n="1" sub="Itzel Robles" tone="alert" />
          </div>
          <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {secs.map((s, i) => (
              <div key={i} style={{
                background: 'var(--white)',
                border: '1px solid ' + (s.sel ? 'var(--accent)' : 'var(--rule)'),
                borderRadius: 'var(--r-lg)', padding: '14px 16px',
                boxShadow: s.sel ? '0 10px 22px -18px rgba(0,150,199,0.3)' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--paper-4)', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 15 }}>
                    {s.n.split(' ').slice(0, 2).map(x => x[0]).join('')}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{s.n}</div>
                    <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.email}</div>
                  </div>
                </div>
                <div style={{ marginTop: 10, display: 'flex', gap: 6, alignItems: 'center' }}>
                  {s.none
                    ? <span style={{ fontFamily: 'var(--mono)', fontSize: 9, padding: '3px 7px', borderRadius: 999, background: 'var(--alert-soft)', color: 'var(--alert)', letterSpacing: '0.06em' }}>SIN ASIGNAR</span>
                    : <>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, padding: '2px 7px', borderRadius: 999, background: 'var(--paper-3)', color: 'var(--accent-deep)' }}>{s.docs} médicos</span>
                        <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>· {s.pats} pacientes</span>
                      </>}
                  <span style={{ flex: 1 }} />
                  <button className="btn sm ghost" style={{ height: 26, fontSize: 10.5, padding: '0 10px' }}>Asignar</button>
                </div>
              </div>
            ))}
          </div>
        </window.MbFrame>
      </DIRdev>
    </div>
  );
}

// ─── 5 · Invitaciones ─────────────────────────────────────────
function DirInvitesMobile() {
  const queue = [
    { mail: 'b.nuñez@gmail.com',  sp: 'Ginecología',   sent: 'hace 2 d', state: 'pendiente' },
    { mail: 'sergio.mata@gmail',  sp: 'Endocrinología',sent: 'hace 3 d', state: 'pendiente' },
    { mail: 'pico.almeida@gmail', sp: 'Cardiología',   sent: 'hace 5 d', state: 'pendiente' },
    { mail: 'mp.rojas@gmail.com', sp: 'Neurología',    sent: '12 may',   state: 'aceptada' },
    { mail: 'd.alarcon@gmail',    sp: 'Reumatología',  sent: '10 may',   state: 'rechazada' },
    { mail: 'g.serrano@gmail',    sp: 'Dermatología',  sent: '05 may',   state: 'expirada' },
  ];
  return (
    <div data-screen-label="AB₂ · Director · Invitaciones (móvil)">
      <DIRdev>
        <window.MbFrame tabs={DIR_TABS_M} active={3}
          fab={<window.MbFAB icon="send" label="Nueva" />}>
          <window.MbTop sub="3 pendientes · 14 aceptadas" title="Invitaciones" />
          {/* compose card */}
          <div style={{ padding: '14px 20px 0' }}>
            <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', padding: 16 }}>
              <span className="eyebrow">Invitar médico</span>
              <h3 style={{ fontSize: 14, fontWeight: 500, marginTop: 4 }}>Enviar nueva invitación</h3>
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[['mail', 'beatriz.nunez@gmail.com'], ['stetho', 'Ginecología'], ['doc', '9 211 504 · cédula']].map(([ic, v], i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--paper)', borderRadius: 8 }}>
                    <window.MbIcon kind={ic} size={13} color="var(--ink-3)" />
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink)' }}>{v}</span>
                  </div>
                ))}
              </div>
              <button className="btn sm block" style={{ marginTop: 12, justifyContent: 'center' }}>
                <window.MbIcon kind="send" size={12} color="#fff" /> Enviar invitación
              </button>
            </div>
          </div>

          <window.MbSection title="Historial">
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 10 }}>
              {[['Todas', 17, true], ['Pendientes', 3, false, 'alert'], ['Aceptadas', 14]].map(([k, n, on, tone]) => (
                <window.MbPill key={k} on={on} count={n} tone={tone}>{k}</window.MbPill>
              ))}
            </div>
            {queue.map((q, i) => (
              <div key={i} style={{ padding: '11px 12px', background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)', marginBottom: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink)' }}>{q.mail}</span>
                  <span style={{
                    fontFamily: 'var(--mono)', fontSize: 9, padding: '2px 7px', borderRadius: 999,
                    background: q.state === 'pendiente' ? 'var(--alert-soft)' : q.state === 'aceptada' ? '#E5F5EE' : 'var(--paper-3)',
                    color:      q.state === 'pendiente' ? 'var(--alert)' : q.state === 'aceptada' ? 'var(--ok)' : 'var(--ink-3)',
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                  }}>{q.state}</span>
                </div>
                <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', marginTop: 4 }}>{q.sp} · {q.sent}</div>
              </div>
            ))}
          </window.MbSection>
          <div style={{ height: 20 }} />
        </window.MbFrame>
      </DIRdev>
    </div>
  );
}

// ─── 6 · Asignaciones doctor↔sec ──────────────────────────────
function DirAssignsMobile() {
  const pairs = [
    { sec: 'M. E. Vargas', docs: ['Dr. Vega', 'Dra. Padilla', 'Dr. Rendón'] },
    { sec: 'O. Quintana',  docs: ['Dra. Sotelo', 'Dr. Alcalá'] },
    { sec: 'B. Trejo',     docs: ['Dra. Fuentes', 'Dr. F. Padilla', 'Dr. Salinas'] },
    { sec: 'I. Robles',    docs: [] },
  ];
  return (
    <div data-screen-label="AC₂ · Director · Asignaciones (móvil)">
      <DIRdev>
        <window.MbFrame noTabs>
          <window.MbTop back="Inicio" sub="11 pares · 1 sin secretaria" title="Asignaciones" />
          <div style={{ padding: '12px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <window.MbStat k="Médicos cubiertos" n="9 / 18" sub="meta 80%" tone="alert" />
            <window.MbStat k="Cambios · mes" n="6" sub="4 alta · 2 baja" />
          </div>

          <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pairs.map((p, i) => (
              <div key={i} style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--paper-3)', color: 'var(--accent-deep)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 14 }}>
                    {p.sec.split(' ').map(x => x[0]).join('')}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{p.sec}</div>
                    <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{p.docs.length} médicos asignados</div>
                  </div>
                  <button className="btn sm ghost" style={{ height: 26, fontSize: 10.5, padding: '0 10px' }}>+ médico</button>
                </div>
                {p.docs.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 10 }}>
                    {p.docs.map((d, j) => (
                      <span key={j} style={{ fontFamily: 'var(--mono)', fontSize: 10, padding: '4px 9px', borderRadius: 999, background: 'var(--paper-3)', color: 'var(--accent-deep)' }}>{d}</span>
                    ))}
                  </div>
                ) : (
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, padding: '4px 9px', borderRadius: 999, background: 'var(--alert-soft)', color: 'var(--alert)', display: 'inline-block', marginTop: 10, letterSpacing: '0.06em' }}>SIN ASIGNAR</span>
                )}
              </div>
            ))}
          </div>
        </window.MbFrame>
      </DIRdev>
    </div>
  );
}

// ─── 7 · Pacientes de la clínica ──────────────────────────────
function DirPatientsMobile() {
  const list = [
    ['María F. Arellano', 'Dr. Vega',     'tiroides', 'hoy'],
    ['Carlos Mendoza',    'Dr. Vega',     'post-op',  'hoy'],
    ['Patricia Lozano',   'Dra. Padilla', 'oncología','hoy'],
    ['José L. Padilla',   'Dr. Vega',     'hernia',   'hoy'],
    ['Ana S. Cortés',     'Dr. Vega',     'biliar',   'hoy'],
    ['Roberto Aguilar',   'Dr. Vega',     'pre-qx',   'ayer'],
    ['Sofía Hernández',   'Dra. Padilla', 'biliar',   'ayer'],
    ['Elena Castaño',     'Dra. Padilla', 'gastritis','11 may'],
    ['Diego Salinas',     'Dra. Padilla', 'sutura',   '11 may'],
  ];
  return (
    <div data-screen-label="AP₂ · Director · Pacientes (móvil)">
      <DIRdev>
        <window.MbFrame tabs={DIR_TABS_M} active={4}>
          <window.MbTop sub="1 044 expedientes · 38 nuevos" title="Pacientes" />
          <div style={{ padding: '12px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <window.MbStat k="Activos 30 d" n="612" sub="59% cartera" />
            <window.MbStat k="Sin médico" n="6" sub="esta semana" tone="alert" />
          </div>
          <div style={{ padding: '12px 20px 0', display: 'flex', gap: 6, overflowX: 'auto' }}>
            {[['Todos', '1 044', true], ['Hoy', 38], ['Nuevos', 38], ['Sin médico', 6, false, 'alert']].map(([k, n, on, tone]) => (
              <window.MbPill key={k} on={on} count={n} tone={tone}>{k}</window.MbPill>
            ))}
          </div>
          <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {list.map(([n, dr, tag, last], i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '34px 1fr auto', gap: 10, alignItems: 'center', padding: '12px 14px', background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)' }}>
                <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--paper-4)', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500 }}>
                  {n.split(' ').map(s => s[0]).slice(0, 2).join('')}
                </span>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 500 }}>{n}</div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{dr} · {tag}</div>
                </div>
                <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>{last}</span>
              </div>
            ))}
          </div>
        </window.MbFrame>
      </DIRdev>
    </div>
  );
}

// ─── 8 · Configuración clínica ────────────────────────────────
function DirSettingsMobile() {
  return (
    <div data-screen-label="AR₂ · Director · Config clínica (móvil)">
      <DIRdev>
        <window.MbFrame noTabs>
          <window.MbTop back="Inicio" sub="Datos · marca · plan" title="Mi clínica" />
          <div style={{ padding: '12px 20px 0', display: 'flex', gap: 6, overflowX: 'auto' }}>
            {[['General', true], ['Marca'], ['Sucursales'], ['Políticas'], ['Plan']].map(([k, on]) => (
              <window.MbPill key={k} on={on}>{k}</window.MbPill>
            ))}
          </div>

          <window.MbSection title="Datos generales" action="Guardar →">
            {[
              ['Razón social', 'Clínica Roma Norte S.C.'],
              ['RFC', 'CRN240214MX3'],
              ['Dirección', 'Av. Álvaro Obregón 234, Roma Nte., CDMX'],
              ['Teléfono', '+52 55 5208 9100'],
              ['Correo', 'info@clinicaromanorte.mx'],
            ].map(([k, v], i) => (
              <div key={i} style={{ padding: '10px 12px', background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)', marginBottom: 6 }}>
                <span className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{k}</span>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink)', marginTop: 3 }}>{v}</div>
              </div>
            ))}
          </window.MbSection>

          <window.MbSection title="Políticas">
            {[
              ['Confirmar citas 24 h antes', true],
              ['Reagendar en línea', true],
              ['Receta electrónica obligatoria', true],
              ['Compartir con otras clínicas', false],
              ['Encuesta tras consulta', true],
            ].map(([k, on], i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', padding: '12px 14px', background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)', marginBottom: 6 }}>
                <span style={{ fontSize: 12.5 }}>{k}</span>
                <window.MbSwitch on={on} />
              </div>
            ))}
          </window.MbSection>

          <window.MbSection title="Plan · Pro">
            <div style={{ background: 'var(--ink)', color: 'var(--paper)', borderRadius: 'var(--r-lg)', padding: 16 }}>
              <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Plan actual</span>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 28, marginTop: 4 }}>Pro</div>
              <div className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 6 }}>30 médicos · 5 000 pacientes · OCR ilimitado</div>
              <button style={{ marginTop: 12, height: 36, padding: '0 16px', borderRadius: 9, background: 'var(--accent-bright)', color: 'var(--ink)', border: 0, fontSize: 12, fontWeight: 600 }}>Subir a Enterprise</button>
            </div>
            <div style={{ marginTop: 10 }}>
              {[['Almacén', 14, '142 GB / 1 TB'], ['Médicos', 60, '18 / 30'], ['Pacientes', 21, '1 044 / 5 000']].map(([k, pct, l], i) => (
                <div key={i} style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12 }}>{k}</span>
                    <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{l}</span>
                  </div>
                  <div style={{ width: '100%', height: 6, background: 'var(--paper)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: pct + '%', height: '100%', background: 'var(--accent-bright)', borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          </window.MbSection>
          <div style={{ height: 20 }} />
        </window.MbFrame>
      </DIRdev>
    </div>
  );
}

// ─── 9 · Perfil del director ──────────────────────────────────
function DirProfileMobile() {
  return (
    <div data-screen-label="AS₂ · Director · Perfil (móvil)">
      <DIRdev>
        <window.MbFrame tabs={DIR_TABS_M} active={5}>
          <div style={{ background: 'var(--ink)', color: 'var(--paper)', padding: '16px 22px 22px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', width: 260, height: 260, borderRadius: 999, background: 'radial-gradient(circle, rgba(0,180,216,0.3) 0%, transparent 70%)', top: -90, right: -70 }} />
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 64, height: 64, borderRadius: 18, background: 'var(--accent-bright)', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 28 }}>RC</span>
              <div>
                <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Director general</span>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 24, lineHeight: 1.05, marginTop: 4 }}>Lic. Renata Coria</div>
                <div className="mono" style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>Clínica Roma Norte · desde feb 24</div>
              </div>
            </div>
          </div>

          <window.MbSection title="Datos personales" action="Editar →">
            {[['Teléfono', '+52 55 7711 4422'], ['Correo', 'rcoria@clinicaromanorte.mx'], ['Idioma', 'Español (MX)']].map(([k, v], i) => (
              <div key={i} style={{ padding: '10px 12px', background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)', marginBottom: 6 }}>
                <span className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{k}</span>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink)', marginTop: 3 }}>{v}</div>
              </div>
            ))}
          </window.MbSection>

          <window.MbSection title="Permisos">
            {[
              ['Invitar / dar de baja médicos', true],
              ['Crear secretarias', true],
              ['Editar políticas y plan', true],
              ['Acceso a auditoría', true],
              ['Eliminar la institución', false],
            ].map(([k, on], i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', padding: '12px 14px', background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)', marginBottom: 6 }}>
                <span style={{ fontSize: 12.5 }}>{k}</span>
                <window.MbSwitch on={on} />
              </div>
            ))}
          </window.MbSection>

          <window.MbSection title="Notificaciones">
            {[
              ['Médico aceptó / rechazó',  true],
              ['Cédula por vencer',         true],
              ['Cuota mensual',             true],
              ['Reportes semanales',        false],
            ].map(([k, on], i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', padding: '12px 14px', background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)', marginBottom: 6 }}>
                <span style={{ fontSize: 12.5 }}>{k}</span>
                <window.MbSwitch on={on} />
              </div>
            ))}
          </window.MbSection>
          <div style={{ height: 20 }} />
        </window.MbFrame>
      </DIRdev>
    </div>
  );
}

Object.assign(window, {
  DirDashMobile, DirDoctorsMobile, DirDoctorDetailMobile, DirSecretariesMobile,
  DirInvitesMobile, DirAssignsMobile, DirPatientsMobile, DirSettingsMobile, DirProfileMobile,
});
