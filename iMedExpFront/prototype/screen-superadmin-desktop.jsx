// imedexp · Superadmin · PC
// Endpoints cubiertos:
//   GET/POST/PATCH/DELETE /api/v1/institutions/
//   GET/POST/PATCH/DELETE /api/v1/institutions/{id}/admins
// Dos pantallas:
//   SAInstitutionsScreen — listado + detalle institución
//   SAAdminsScreen       — todos los administradores del sistema

const SA_NAV = [
  ['home',      'Inicio'],
  ['build',     'Instituciones', '24'],
  ['shield-2',  'Administradores', '37'],
  ['chart',     'Métricas'],
  ['globe',     'Auditoría'],
  ['user',      'Perfil'],
];
const SA_WHO = ['I. Quezada', 'IQ', 'superadmin · root'];

// ─── 1 · Instituciones ─────────────────────────────────────────
function SAInstitutionsScreen() {
  const list = [
    { name: 'Hospital Ángeles del Pedregal',  city: 'CDMX',         drs: 84, secs: 22, pats: '6 421', state: 'activa',  plan: 'Enterprise', sel: false },
    { name: 'Clínica Roma Norte',             city: 'CDMX',         drs: 18, secs: 4,  pats: '1 044', state: 'activa',  plan: 'Pro',        sel: true  },
    { name: 'Hospital San José',              city: 'Monterrey',    drs: 62, secs: 14, pats: '4 980', state: 'activa',  plan: 'Enterprise' },
    { name: 'Centro Médico ABC Sta. Fe',      city: 'CDMX',         drs: 91, secs: 26, pats: '7 803', state: 'activa',  plan: 'Enterprise' },
    { name: 'Hospital Puerta de Hierro',      city: 'Guadalajara',  drs: 47, secs: 11, pats: '3 412', state: 'activa',  plan: 'Pro' },
    { name: 'Clínica Polanco',                city: 'CDMX',         drs: 9,  secs: 2,  pats: '326',   state: 'onboarding', plan: 'Pro' },
    { name: 'Hospital Christus Muguerza',     city: 'Monterrey',    drs: 55, secs: 13, pats: '4 117', state: 'activa',  plan: 'Enterprise' },
    { name: 'Clínica Mérida',                 city: 'Mérida',       drs: 12, secs: 3,  pats: '722',   state: 'pausada', plan: 'Pro' },
    { name: 'Centro Médico Quirúrgico GDL',   city: 'Guadalajara',  drs: 31, secs: 8,  pats: '2 188', state: 'activa',  plan: 'Pro' },
    { name: 'Hospital Star Médica Querétaro', city: 'Querétaro',    drs: 24, secs: 6,  pats: '1 506', state: 'activa',  plan: 'Pro' },
  ];
  const sel = list[1];
  const admins = [
    { name: 'Lic. Renata Coria',     email: 'rcoria@clinicaromanorte.mx',   role: 'Director general',     since: 'feb 2024' },
    { name: 'Dr. Mauricio Pardo',    email: 'mpardo@clinicaromanorte.mx',   role: 'Director médico',      since: 'mar 2024' },
    { name: 'C.P. Daniela Espino',   email: 'despino@clinicaromanorte.mx',  role: 'Admin. operaciones',   since: 'jun 2024' },
  ];
  return (
    <window.AdmPage
      label="W · Superadmin · Instituciones"
      nav={SA_NAV} active={1} role="Superadmin" who={SA_WHO} accent="accent-bright"
      title="Instituciones" sub="24 clínicas · 412 médicos · 32 144 pacientes"
      searchHint="Buscar institución, ciudad…"
      height={1180}
      right={<button className="btn sm" style={{ height: 42, borderRadius: 'var(--r-md)' }}><window.AdmIcon kind="plus" size={15} color="#fff" /> Nueva institución</button>}
    >
      {/* stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <window.AdmStat k="Instituciones" n="24" sub="+2 este trimestre" />
        <window.AdmStat k="Médicos activos" n="412" sub="89% verificados" />
        <window.AdmStat k="Pacientes" n="32 144" sub="+1 280 este mes" />
        <window.AdmStat k="Onboarding" n="3" sub="2 listas para activar" tone="alert" />
      </div>

      {/* filters */}
      <div style={{ display: 'flex', gap: 6, marginTop: 18, alignItems: 'center' }}>
        {[['Todas', 24, true], ['Activas', 20], ['Onboarding', 2], ['Pausadas', 2], ['Enterprise', 9], ['Pro', 15]].map(([k, n, on]) => (
          <window.AdmPill key={k} on={on} count={n}>{k}</window.AdmPill>
        ))}
        <span style={{ flex: 1 }} />
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>Ordenar: actividad ▾</span>
      </div>

      {/* table + detail */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 14, marginTop: 14 }}>
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '2fr 0.9fr 0.8fr 0.8fr 0.9fr 40px',
            padding: '12px 18px', borderBottom: '1px solid var(--rule-2)',
            fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            <span>Institución</span><span>Ciudad</span><span>Médicos</span><span>Pacientes</span><span>Estado</span><span></span>
          </div>
          {list.map((it, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '2fr 0.9fr 0.8fr 0.8fr 0.9fr 40px',
              padding: '12px 18px', alignItems: 'center',
              borderBottom: i < list.length - 1 ? '1px solid var(--rule-3)' : 0,
              background: it.sel ? 'var(--paper-3)' : 'transparent',
              borderLeft: it.sel ? '3px solid var(--accent)' : '3px solid transparent',
              paddingLeft: it.sel ? 15 : 18,
              cursor: 'pointer',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <span style={{
                  width: 34, height: 34, borderRadius: 9,
                  background: it.plan === 'Enterprise' ? 'var(--ink)' : 'var(--accent-bright)',
                  color: it.plan === 'Enterprise' ? 'var(--paper)' : 'var(--ink)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--serif)', fontSize: 14,
                }}>{it.name.split(' ').filter(s => s[0] >= 'A' && s[0] <= 'Z' || s[0] >= 'a' && s[0] <= 'z').slice(0, 2).map(s => s[0]).join('')}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.name}</div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 1 }}>{it.plan} · id {1000 + i}</div>
                </div>
              </div>
              <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-2)' }}>{it.city}</span>
              <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-2)' }}>{it.drs}</span>
              <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-2)' }}>{it.pats}</span>
              <span style={{
                fontFamily: 'var(--mono)', fontSize: 9.5, padding: '3px 8px', borderRadius: 999,
                background: it.state === 'activa' ? '#E5F5EE' : it.state === 'pausada' ? 'var(--alert-soft)' : 'var(--paper-3)',
                color:      it.state === 'activa' ? 'var(--ok)' : it.state === 'pausada' ? 'var(--alert)'  : 'var(--accent-deep)',
                letterSpacing: '0.06em', textTransform: 'uppercase', width: 'fit-content',
              }}>{it.state}</span>
              <window.AdmIcon kind="more" size={16} color="var(--ink-3)" />
            </div>
          ))}
        </div>

        {/* detail */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden', height: 'fit-content' }}>
          <div style={{ padding: '22px 22px 18px', background: 'var(--ink)', color: 'var(--paper)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: 999, background: 'radial-gradient(circle, rgba(0,180,216,0.3) 0%, transparent 70%)', top: -60, right: -50 }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--accent-bright)', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 22 }}>CR</span>
                <div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 24, lineHeight: 1, letterSpacing: '-0.02em' }}>{sel.name}</div>
                  <div className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>id 1001 · {sel.city} · activa desde feb 2024</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, padding: '3px 8px', borderRadius: 999, background: 'var(--accent-bright)', color: 'var(--ink)', letterSpacing: '0.06em' }}>PLAN PRO</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, padding: '3px 8px', borderRadius: 999, background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', letterSpacing: '0.06em' }}>NOM-024 ✓</span>
              </div>
            </div>
          </div>

          <div style={{ padding: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                ['Médicos', '18', '15 verificados · 3 invitados'],
                ['Secretarias', '4', '4 con asignaciones'],
                ['Pacientes', '1 044', '+38 este mes'],
                ['Consultas / mes', '612', 'tendencia +12%'],
              ].map(([k, n, sub], i) => (
                <div key={i} style={{ padding: '10px 12px', background: 'var(--paper)', borderRadius: 'var(--r-md)' }}>
                  <div className="eyebrow">{k}</div>
                  <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 4 }}>{n}</div>
                  <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', marginTop: 4, lineHeight: 1.4 }}>{sub}</div>
                </div>
              ))}
            </div>

            <div className="eyebrow" style={{ marginTop: 18, marginBottom: 8 }}>Administradores · 3</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {admins.map((a, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '34px 1fr auto', gap: 10, alignItems: 'center', padding: '8px 10px', background: 'var(--paper)', borderRadius: 'var(--r-md)' }}>
                  <span style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--paper-3)', color: 'var(--accent-deep)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600 }}>
                    {a.name.split(' ').slice(-2).map(s => s[0]).join('')}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 500 }}>{a.name}</div>
                    <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{a.role}</div>
                  </div>
                  <window.AdmIcon kind="more" size={14} color="var(--ink-3)" />
                </div>
              ))}
              <button className="btn sm ghost" style={{ height: 32, justifyContent: 'center', marginTop: 4, fontSize: 11.5 }}>
                <window.AdmIcon kind="plus" size={12} /> Asignar nuevo administrador
              </button>
            </div>

            <div style={{ display: 'flex', gap: 6, marginTop: 16 }}>
              <button className="btn sm" style={{ flex: 1, justifyContent: 'center' }}>Editar</button>
              <button className="btn sm ghost" style={{ flex: 1, justifyContent: 'center', color: 'var(--alert)', borderColor: 'var(--alert-rule)' }}>Pausar</button>
            </div>
          </div>
        </div>
      </div>
    </window.AdmPage>
  );
}

// ─── 2 · Administradores ─────────────────────────────────────
function SAAdminsScreen() {
  const admins = [
    { name: 'Lic. Renata Coria',         email: 'rcoria@clinicaromanorte.mx',     inst: 'Clínica Roma Norte',           role: 'Director general',  last: 'hace 4 m',  state: 'activo' },
    { name: 'Dr. Mauricio Pardo',        email: 'mpardo@clinicaromanorte.mx',     inst: 'Clínica Roma Norte',           role: 'Director médico',   last: 'hace 2 h',  state: 'activo' },
    { name: 'C.P. Daniela Espino',       email: 'despino@clinicaromanorte.mx',    inst: 'Clínica Roma Norte',           role: 'Admin. operaciones',last: 'ayer',      state: 'activo' },
    { name: 'Mtra. Patricia Vázquez',    email: 'pvazquez@hangelespedregal.mx',   inst: 'Hospital Ángeles del Pedregal',role: 'Director general',  last: 'hace 12 m', state: 'activo' },
    { name: 'Lic. Octavio Reyes',        email: 'oreyes@hangelespedregal.mx',     inst: 'Hospital Ángeles del Pedregal',role: 'Admin. operaciones',last: 'hace 1 d',  state: 'activo' },
    { name: 'Dr. Esteban Loyola',        email: 'eloyola@hospitalsanjose.mx',     inst: 'Hospital San José',            role: 'Director médico',   last: 'hace 30 m', state: 'activo' },
    { name: 'Ing. Marcela Tinoco',       email: 'mtinoco@hospitalsanjose.mx',     inst: 'Hospital San José',            role: 'Director general',  last: 'hace 5 h',  state: 'activo' },
    { name: 'Dr. Roberto Vega',          email: 'rvega@centromedicoabc.mx',       inst: 'Centro Médico ABC Sta. Fe',    role: 'Director médico',   last: 'hace 3 m',  state: 'activo' },
    { name: 'Mtra. Liliana Aguilar',     email: 'laguilar@centromedicoabc.mx',    inst: 'Centro Médico ABC Sta. Fe',    role: 'Director general',  last: 'hace 6 h',  state: 'activo' },
    { name: 'Dr. Sergio Cárdenas',       email: 'scardenas@phierro.mx',           inst: 'Hospital Puerta de Hierro',    role: 'Director médico',   last: '2 d',       state: 'activo' },
    { name: 'Lic. Andrea Murguía',       email: 'amurguia@clinicapolanco.mx',     inst: 'Clínica Polanco',              role: 'Director general',  last: '12 d',      state: 'pendiente' },
    { name: 'Dr. Iván Cervantes',        email: 'icervantes@clinicamerida.mx',    inst: 'Clínica Mérida',               role: 'Director general',  last: '34 d',      state: 'pausado' },
  ];
  return (
    <window.AdmPage
      label="X · Superadmin · Administradores"
      nav={SA_NAV} active={2} role="Superadmin" who={SA_WHO} accent="accent-bright"
      title="Administradores de institución" sub="37 cuentas · 24 instituciones"
      searchHint="Buscar nombre, correo, clínica…"
      height={1100}
      right={<button className="btn sm" style={{ height: 42, borderRadius: 'var(--r-md)' }}><window.AdmIcon kind="plus" size={15} color="#fff" /> Crear administrador</button>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <window.AdmStat k="Total administradores" n="37" sub="24 directores · 13 médicos" />
        <window.AdmStat k="Activos 30 d" n="33" sub="89% acceso semanal" />
        <window.AdmStat k="Pendientes verificación" n="2" sub="esperan aceptar invitación" />
        <window.AdmStat k="Pausados" n="2" sub="sin actividad ≥ 30 d" />
      </div>

      {/* filters */}
      <div style={{ display: 'flex', gap: 6, marginTop: 18, alignItems: 'center', flexWrap: 'wrap' }}>
        {[['Todos', 37, true], ['Director general', 18], ['Director médico', 13], ['Operaciones', 6], ['Pendientes', 2, false, 'alert']].map(([k, n, on, tone]) => (
          <window.AdmPill key={k} on={on} count={n} tone={tone}>{k}</window.AdmPill>
        ))}
        <span style={{ flex: 1 }} />
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>Filtrar institución ▾</span>
      </div>

      {/* table */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden', marginTop: 14 }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1.8fr 1.6fr 1.4fr 0.8fr 0.8fr 40px',
          padding: '12px 18px', borderBottom: '1px solid var(--rule-2)',
          fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          <span>Administrador</span><span>Institución</span><span>Rol</span><span>Último</span><span>Estado</span><span></span>
        </div>
        {admins.map((a, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '1.8fr 1.6fr 1.4fr 0.8fr 0.8fr 40px',
            padding: '12px 18px', alignItems: 'center',
            borderBottom: i < admins.length - 1 ? '1px solid var(--rule-3)' : 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <span style={{
                width: 34, height: 34, borderRadius: 9,
                background: 'var(--paper-4)', color: 'var(--ink)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 500,
              }}>{a.name.split(' ').slice(-2).map(s => s[0]).join('')}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{a.name}</div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{a.email}</div>
              </div>
            </div>
            <span style={{ fontSize: 12.5, color: 'var(--ink-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.inst}</span>
            <span style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>{a.role}</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{a.last}</span>
            <span style={{
              fontFamily: 'var(--mono)', fontSize: 9.5, padding: '3px 8px', borderRadius: 999,
              background: a.state === 'activo' ? '#E5F5EE' : a.state === 'pausado' ? 'var(--alert-soft)' : 'var(--paper-3)',
              color:      a.state === 'activo' ? 'var(--ok)' : a.state === 'pausado' ? 'var(--alert)'  : 'var(--accent-deep)',
              letterSpacing: '0.06em', textTransform: 'uppercase', width: 'fit-content',
            }}>{a.state}</span>
            <window.AdmIcon kind="more" size={16} color="var(--ink-3)" />
          </div>
        ))}
      </div>
    </window.AdmPage>
  );
}

window.SAInstitutionsScreen = SAInstitutionsScreen;
window.SAAdminsScreen = SAAdminsScreen;
