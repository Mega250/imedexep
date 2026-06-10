// imedexp · Superadmin · PC · pantallas extra
// Dashboard global · Detalle institución · Auditoría · Perfil

const SA_NAV_2 = [
  ['home',      'Inicio'],
  ['build',     'Instituciones', '24'],
  ['shield-2',  'Administradores', '37'],
  ['chart',     'Métricas'],
  ['globe',     'Auditoría'],
  ['user',      'Perfil'],
];
const SA_WHO_2 = ['I. Quezada', 'IQ', 'superadmin · root'];

// ─── 1 · Dashboard global ──────────────────────────────────────
function SADashboardScreen() {
  const alerts = [
    { t: 'Clínica Mérida',         k: 'Sin actividad ≥ 30 d',           tone: 'alert',  ago: 'hace 3 d' },
    { t: 'Hospital ABC Sta. Fe',   k: 'Cuota mensual al 92%',           tone: 'mid',    ago: 'hoy 04:12' },
    { t: 'Centro Médico Quirúrg.', k: '3 cédulas en validación >7 días', tone: 'mid',   ago: '11 may' },
    { t: 'Sistema · OCR receta',   k: 'Throughput -18% últimas 48 h',    tone: 'alert', ago: 'hace 4 h' },
  ];
  const insts = [
    { n: 'H. Ángeles Pedregal', drs: 84, pats: '6 421', growth: '+8%', plan: 'E' },
    { n: 'C. Médico ABC Sta. Fe', drs: 91, pats: '7 803', growth: '+6%', plan: 'E' },
    { n: 'H. San José', drs: 62, pats: '4 980', growth: '+11%', plan: 'E' },
    { n: 'H. Christus Muguerza', drs: 55, pats: '4 117', growth: '+4%', plan: 'E' },
    { n: 'H. Puerta de Hierro', drs: 47, pats: '3 412', growth: '+9%', plan: 'P' },
  ];
  // sparkline points (consultations / day, last 14 d)
  const spark = [22, 28, 31, 24, 36, 41, 38, 44, 49, 47, 52, 58, 55, 62];
  const max = Math.max(...spark);
  return (
    <window.AdmPage
      label="AL · Superadmin · Inicio"
      nav={SA_NAV_2} active={0} role="Superadmin" who={SA_WHO_2} accent="accent-bright"
      title="Tablero global" sub="24 instituciones · jueves 14 may · 10:42"
      searchHint="Buscar institución, evento, usuario…"
      height={1180}
      right={<button className="btn sm" style={{ height: 42, borderRadius: 'var(--r-md)' }}><window.AdmIcon kind="plus" size={14} color="#fff" /> Nueva institución</button>}
    >
      {/* hero band */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 12 }}>
        <div style={{ background: 'var(--ink)', color: 'var(--paper)', borderRadius: 'var(--r-xl)', padding: '24px 26px', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 40px -20px rgba(3,4,94,0.45)' }}>
          <div style={{ position: 'absolute', width: 360, height: 360, borderRadius: 999, background: 'radial-gradient(circle, rgba(0,180,216,0.32) 0%, transparent 70%)', top: -120, right: -80 }} />
          <div style={{ position: 'relative' }}>
            <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Estado de la red · hoy</span>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 56, lineHeight: 0.95, letterSpacing: '-0.02em', marginTop: 10 }}>
              24 clínicas<br />412 médicos<br />32 144 pacientes
            </h2>
            <div className="mono" style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.6)', marginTop: 14 }}>
              +1 280 pacientes este mes · +12% consultas vs sem. 19
            </div>
            {/* sparkline */}
            <div style={{ marginTop: 20, display: 'flex', alignItems: 'flex-end', gap: 4, height: 60 }}>
              {spark.map((v, i) => (
                <div key={i} style={{
                  flex: 1, height: (v / max) * 100 + '%',
                  background: i === spark.length - 1 ? 'var(--accent-bright)' : 'rgba(255,255,255,0.35)',
                  borderRadius: 3,
                }} />
              ))}
            </div>
            <div className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', marginTop: 8, letterSpacing: '0.08em' }}>
              CONSULTAS / DÍA · ÚLTIMAS 2 SEM.
            </div>
          </div>
        </div>
        <window.AdmStat k="Uptime · 30 d" n="99.92%" sub="3 incidentes · 1 sev-1 resuelto" />
        <window.AdmStat k="Consultas hoy" n="1 384" sub="prom. 58 / h · pico 11 a 13" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 12 }}>
        <window.AdmStat k="Recetas firmadas hoy" n="612" sub="+8% vs ayer" />
        <window.AdmStat k="Sesiones activas" n="287" sub="142 médicos · 38 secretarias · 107 pacientes" />
        <window.AdmStat k="Alertas abiertas" n="4" sub="1 sistema · 3 clínicas" tone="alert" />
        <window.AdmStat k="Cuota almacenamiento" n="42% · 2.1 TB" sub="proyección plena en 9 meses" />
      </div>

      {/* 2 col: alerts + top instituciones */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 14, marginTop: 18 }}>
        <window.AdmCard title="Alertas y avisos" action={<span className="mono" style={{ fontSize: 11, color: 'var(--accent-deep)' }}>Ver todos →</span>}>
          {alerts.map((a, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '36px 1fr auto', gap: 12, alignItems: 'center', padding: '13px 20px', borderBottom: i < alerts.length - 1 ? '1px solid var(--rule-3)' : 0 }}>
              <span style={{
                width: 32, height: 32, borderRadius: 9,
                background: a.tone === 'alert' ? 'var(--alert-soft)' : '#FCEFD7',
                color:      a.tone === 'alert' ? 'var(--alert)'      : 'var(--mid)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <window.AdmIcon kind="flag" size={14} />
              </span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{a.t}</div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>{a.k}</div>
              </div>
              <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>{a.ago}</span>
            </div>
          ))}
        </window.AdmCard>

        <window.AdmCard title="Top instituciones · este mes" action={<span className="mono" style={{ fontSize: 11, color: 'var(--accent-deep)' }}>Ver tabla completa →</span>}>
          <div style={{ display: 'grid', gridTemplateColumns: '34px 1.4fr 0.7fr 0.7fr 0.7fr 50px', padding: '12px 20px', borderBottom: '1px solid var(--rule-2)', fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            <span>#</span><span>Institución</span><span>Médicos</span><span>Pacientes</span><span>Crec.</span><span></span>
          </div>
          {insts.map((it, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '34px 1.4fr 0.7fr 0.7fr 0.7fr 50px', padding: '12px 20px', alignItems: 'center', borderBottom: i < insts.length - 1 ? '1px solid var(--rule-3)' : 0 }}>
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{i + 1}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, background: it.plan === 'E' ? 'var(--ink)' : 'var(--accent-bright)', color: it.plan === 'E' ? 'var(--paper)' : 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 12 }}>{it.plan}</span>
                <span style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap' }}>{it.n}</span>
              </div>
              <span className="mono" style={{ fontSize: 12, color: 'var(--ink-2)' }}>{it.drs}</span>
              <span className="mono" style={{ fontSize: 12, color: 'var(--ink-2)' }}>{it.pats}</span>
              <span className="mono" style={{ fontSize: 12, color: 'var(--ok)' }}>{it.growth}</span>
              <window.AdmIcon kind="chev" size={14} color="var(--ink-3)" />
            </div>
          ))}
        </window.AdmCard>
      </div>

      {/* roles distribution + uptime */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14, marginTop: 18 }}>
        <window.AdmCard title="Distribución de usuarios · 32 581 cuentas">
          <div style={{ padding: 20 }}>
            {[
              ['Pacientes', 32144, 'var(--ink)'],
              ['Médicos', 412, 'var(--accent)'],
              ['Secretarias', 38, 'var(--accent-bright)'],
              ['Directores', 24, 'var(--ink-3)'],
              ['Superadmins', 4, 'var(--mid)'],
            ].map(([k, n, c], i) => {
              const total = 32622;
              const pct = (n / total) * 100;
              return (
                <div key={i} style={{ marginBottom: i < 4 ? 14 : 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13 }}>{k}</span>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{n.toLocaleString('es-MX')} · {pct.toFixed(1)}%</span>
                  </div>
                  <div style={{ width: '100%', height: 8, background: 'var(--paper)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: Math.max(pct, 0.5) + '%', height: '100%', background: c, borderRadius: 4 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </window.AdmCard>

        <window.AdmCard title="Endpoints más usados · últimas 24 h">
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              ['POST /auth/login',           '8 412', 99.4],
              ['GET  /appointments/',        '6 988', 99.8],
              ['GET  /patients/{id}/full',   '4 217', 99.6],
              ['POST /consultations/',       '1 884', 99.9],
              ['POST /prescriptions/.../sign','612',   99.7],
              ['POST /qr-access/redeem',     '184',    100.0],
            ].map(([ep, n, ok], i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.8fr 0.6fr 70px', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--paper)', borderRadius: 'var(--r-md)' }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--ink-2)' }}>{ep}</span>
                <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink)' }}>{n}</span>
                <span className="mono" style={{ fontSize: 11, color: ok < 99.5 ? 'var(--mid)' : 'var(--ok)' }}>{ok}% OK</span>
              </div>
            ))}
          </div>
        </window.AdmCard>
      </div>
    </window.AdmPage>
  );
}

// ─── 2 · Detalle institución ──────────────────────────────────
function SAInstitutionDetailScreen() {
  const inst = {
    name: 'Clínica Roma Norte',
    id: 1001, city: 'CDMX · col. Roma Nte.', plan: 'Pro',
    created: '14 feb 2024', cuota: '142 GB de 1 TB',
  };
  const docs = [
    ['Dr. Damián Vega',     'Cirugía general',      142, 'activo'],
    ['Dra. Lorena Padilla', 'Medicina interna',     96,  'activo'],
    ['Dr. Joaquín Rendón',  'Cardiología',          81,  'activo'],
    ['Dra. Mariana Sotelo', 'Ginecología',          73,  'activo'],
    ['Dr. Tomás Alcalá',    'Pediatría',            64,  'activo'],
    ['Dra. Beatriz Núñez',  'Ginecología',          0,   'invitada'],
  ];
  const admins = [
    ['Lic. Renata Coria',   'rcoria@romanorte.mx',  'Director general', 'principal'],
    ['Dr. Mauricio Pardo',  'mpardo@romanorte.mx',  'Director médico', ''],
    ['C.P. Daniela Espino', 'despino@romanorte.mx', 'Admin. operaciones', ''],
  ];
  return (
    <window.AdmPage
      label="AM · Superadmin · Detalle institución"
      nav={SA_NAV_2} active={1} role="Superadmin" who={SA_WHO_2} accent="accent-bright"
      title={inst.name} sub={`id ${inst.id} · ${inst.city} · plan ${inst.plan}`}
      searchHint="Buscar dentro de la institución…"
      height={1200}
      right={<>
        <button className="btn sm ghost" style={{ height: 42, borderRadius: 'var(--r-md)' }}><window.AdmIcon kind="edit" size={13} /> Editar</button>
        <button className="btn sm ghost" style={{ height: 42, borderRadius: 'var(--r-md)', color: 'var(--alert)', borderColor: 'var(--alert-rule)' }}><window.AdmIcon kind="x" size={13} color="var(--alert)" /> Pausar</button>
      </>}
    >
      {/* hero */}
      <div style={{ background: 'var(--ink)', color: 'var(--paper)', borderRadius: 'var(--r-xl)', padding: '26px 30px', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 40px -20px rgba(3,4,94,0.5)' }}>
        <div style={{ position: 'absolute', width: 360, height: 360, borderRadius: 999, background: 'radial-gradient(circle, rgba(0,180,216,0.28) 0%, transparent 70%)', top: -120, right: -80 }} />
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 24, alignItems: 'center' }}>
          <span style={{ width: 96, height: 96, borderRadius: 24, background: 'var(--accent-bright)', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 44 }}>CR</span>
          <div>
            <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Institución verificada · NOM-024</span>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 44, lineHeight: 1, letterSpacing: '-0.02em', marginTop: 8 }}>{inst.name}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 12, color: 'rgba(255,255,255,0.75)', fontSize: 13.5 }}>
              <span>{inst.city}</span>
              <span style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.2)' }} />
              <span className="mono">id {inst.id}</span>
              <span style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.2)' }} />
              <span>desde {inst.created}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, padding: '4px 10px', borderRadius: 999, background: 'var(--accent-bright)', color: 'var(--ink)', letterSpacing: '0.08em' }}>PLAN PRO</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, padding: '4px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', letterSpacing: '0.08em' }}>NOM-024 ✓</span>
          </div>
        </div>
      </div>

      {/* stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginTop: 18 }}>
        {[
          ['Médicos', '18', '15 verificados'],
          ['Secretarias', '4', '11 asignaciones'],
          ['Pacientes', '1 044', '+38 este mes'],
          ['Consultas / mes', '612', 'meta 700'],
          ['Recetas firmadas', '518', '92% con OCR'],
          ['Almacenamiento', inst.cuota.split(' ')[0], 'de ' + inst.cuota.split(' ').slice(2).join(' ')],
        ].map(([k, n, sub], i) => (
          <window.AdmStat key={i} k={k} n={n} sub={sub} />
        ))}
      </div>

      {/* tabs visual */}
      <div style={{ display: 'flex', gap: 6, marginTop: 18 }}>
        {[['Resumen', true], ['Médicos', false], ['Pacientes'], ['Secretarias'], ['Cuota y plan'], ['Auditoría']].map(([k, on]) => (
          <span key={k} style={{
            padding: '8px 14px', borderRadius: 9,
            background: on ? 'var(--ink)' : 'var(--white)',
            color:      on ? 'var(--paper)' : 'var(--ink-2)',
            border: '1px solid ' + (on ? 'var(--ink)' : 'var(--rule)'),
            fontSize: 12.5, fontWeight: 500, cursor: 'pointer',
          }}>{k}</span>
        ))}
      </div>

      {/* admins + doctors split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 14, marginTop: 14 }}>
        <window.AdmCard title="Administradores · 3" action={<button className="btn sm" style={{ height: 30, fontSize: 11 }}><window.AdmIcon kind="plus" size={12} color="#fff" /> Nuevo</button>}>
          {admins.map(([n, e, r, tag], i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '36px 1fr auto', gap: 12, alignItems: 'center', padding: '14px 20px', borderBottom: i < admins.length - 1 ? '1px solid var(--rule-3)' : 0 }}>
              <span style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--paper-4)', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500 }}>
                {n.split(' ').slice(-2).map(s => s[0]).join('')}
              </span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {n}
                  {tag && <span style={{ fontFamily: 'var(--mono)', fontSize: 9, padding: '2px 6px', borderRadius: 999, background: 'var(--accent-bright)', color: 'var(--ink)', letterSpacing: '0.06em' }}>{tag.toUpperCase()}</span>}
                </div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 2 }}>{e} · {r}</div>
              </div>
              <window.AdmIcon kind="more" size={14} color="var(--ink-3)" />
            </div>
          ))}
        </window.AdmCard>

        <window.AdmCard title="Médicos · 18 · 6 con mayor carga" action={<span className="mono" style={{ fontSize: 11, color: 'var(--accent-deep)' }}>Ver todos →</span>}>
          {docs.map(([n, sp, pa, st], i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '36px 1.4fr 1fr 0.5fr 0.7fr', gap: 12, alignItems: 'center', padding: '12px 20px', borderBottom: i < docs.length - 1 ? '1px solid var(--rule-3)' : 0 }}>
              <span style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--paper-3)', color: 'var(--accent-deep)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 13 }}>
                {n.split(' ').slice(1, 3).map(s => s[0]).join('')}
              </span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{n}</span>
              <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-2)' }}>{sp}</span>
              <span className="mono" style={{ fontSize: 12, color: 'var(--ink-2)' }}>{pa}</span>
              <span style={{
                fontFamily: 'var(--mono)', fontSize: 9.5, padding: '3px 8px', borderRadius: 999,
                background: st === 'activo' ? '#E5F5EE' : 'var(--paper-3)',
                color:      st === 'activo' ? 'var(--ok)' : 'var(--accent-deep)',
                letterSpacing: '0.06em', textTransform: 'uppercase', width: 'fit-content',
              }}>{st}</span>
            </div>
          ))}
        </window.AdmCard>
      </div>
    </window.AdmPage>
  );
}

// ─── 3 · Auditoría ────────────────────────────────────────────
function SAAuditScreen() {
  const events = [
    { who: 'Lic. Renata Coria',  role: 'director · Roma Norte', act: 'INVITATION CREATED', ep: 'POST /invitations/',      at: '10:42:18', ip: '189.203.10.42',  ok: true },
    { who: 'Dr. Damián Vega',    role: 'doctor · Roma Norte',  act: 'PRESCRIPTION SIGNED',ep: 'PATCH /prescriptions/491/sign', at: '10:38:09', ip: '187.155.99.18', ok: true },
    { who: 'system',             role: 'rate-limiter',          act: 'AUTH RATE LIMIT',    ep: 'POST /auth/login',         at: '10:34:55', ip: '45.10.220.4',    ok: false, tone: 'alert' },
    { who: 'Sec. M. E. Vargas',  role: 'secretaria · Roma N.',  act: 'PATIENT LINKED',     ep: 'POST /patient-institution/',at: '10:31:02', ip: '189.203.10.43',  ok: true },
    { who: 'Dr. Mauricio Pardo', role: 'director · Roma Norte', act: 'ADMIN PROMOTED',     ep: 'PATCH /institutions/1001/admins/3', at: '10:18:44', ip: '189.203.10.42', ok: true, tone: 'mid' },
    { who: 'María F. Arellano',  role: 'paciente',              act: 'QR GENERATED',       ep: 'POST /qr-access/generate', at: '10:14:21', ip: '189.146.55.12',  ok: true },
    { who: 'Dr. Joaquín Rendón', role: 'doctor · Roma Norte',   act: 'QR REDEEMED',        ep: 'POST /qr-access/redeem',   at: '10:14:48', ip: '187.155.99.21',  ok: true },
    { who: 'system',             role: 'background',            act: 'EMAIL DELIVERY FAIL',ep: 'mailer · invitation 412', at: '09:58:31',  ip: '—',              ok: false, tone: 'alert' },
    { who: 'I. Quezada',         role: 'superadmin',            act: 'INSTITUTION DELETED',ep: 'DELETE /institutions/1018',at: '09:51:07', ip: '201.158.4.91',   ok: true, tone: 'mid' },
    { who: 'Dra. Mariana Sotelo',role: 'doctor · Roma Norte',   act: 'CONSULTATION CREATED', ep: 'POST /consultations/',  at: '09:48:12', ip: '187.155.99.32',  ok: true },
    { who: 'Sec. Olivia Quintana', role: 'secretaria · R. N.', act: 'APPOINTMENT EDIT',   ep: 'PATCH /appointments/8821', at: '09:42:08', ip: '189.203.10.44',  ok: true },
    { who: 'unknown',            role: '—',                     act: 'TOKEN INVALID',      ep: 'GET  /auth/me',            at: '09:36:55', ip: '178.62.4.220',   ok: false, tone: 'alert' },
  ];
  return (
    <window.AdmPage
      label="AN · Superadmin · Auditoría"
      nav={SA_NAV_2} active={4} role="Superadmin" who={SA_WHO_2} accent="accent-bright"
      title="Auditoría · bitácora del sistema" sub="Últimas 24 h · 14 217 eventos · 8 alertas"
      searchHint="Buscar usuario, endpoint, IP…"
      height={1200}
      right={<button className="btn sm ghost" style={{ height: 42, borderRadius: 'var(--r-md)' }}>Exportar CSV</button>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <window.AdmStat k="Eventos · 24 h" n="14 217" sub="prom. 593 / h" />
        <window.AdmStat k="Errores · 24 h" n="42" sub="0.29% del total" />
        <window.AdmStat k="429 rate-limit" n="14" sub="3 IPs frecuentes" tone="alert" />
        <window.AdmStat k="Logins fallidos" n="58" sub="6 cuentas bloqueadas auto" />
      </div>

      {/* filters */}
      <div style={{ display: 'flex', gap: 6, marginTop: 18, alignItems: 'center', flexWrap: 'wrap' }}>
        {[['Todos', '14 217', true], ['Auth', 412], ['Clínicos', '8 044'], ['Admin', 318], ['Sistema', 92], ['Errores', 42, false, 'alert']].map(([k, n, on, tone]) => (
          <window.AdmPill key={k} on={on} count={n} tone={tone}>{k}</window.AdmPill>
        ))}
        <span style={{ flex: 1 }} />
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>Rango: últimas 24 h ▾</span>
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>Institución: todas ▾</span>
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden', marginTop: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '90px 1.5fr 1.4fr 2fr 0.9fr 70px', padding: '12px 20px', borderBottom: '1px solid var(--rule-2)', fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <span>Hora</span><span>Usuario</span><span>Acción</span><span>Endpoint</span><span>IP</span><span>OK</span>
        </div>
        {events.map((e, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '90px 1.5fr 1.4fr 2fr 0.9fr 70px', padding: '12px 20px', alignItems: 'center', borderBottom: i < events.length - 1 ? '1px solid var(--rule-3)' : 0, background: e.tone === 'alert' ? 'rgba(184,50,50,0.04)' : 'transparent' }}>
            <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-2)' }}>{e.at}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{e.who}</div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{e.role}</div>
            </div>
            <span style={{
              fontFamily: 'var(--mono)', fontSize: 10.5, padding: '3px 8px', borderRadius: 6,
              background: e.tone === 'alert' ? 'var(--alert-soft)' : e.tone === 'mid' ? '#FCEFD7' : 'var(--paper-3)',
              color:      e.tone === 'alert' ? 'var(--alert)'      : e.tone === 'mid' ? 'var(--mid)' : 'var(--accent-deep)',
              letterSpacing: '0.04em', width: 'fit-content',
            }}>{e.act}</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-2)' }}>{e.ep}</span>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>{e.ip}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 22, borderRadius: 6, background: e.ok ? '#E5F5EE' : 'var(--alert-soft)', color: e.ok ? 'var(--ok)' : 'var(--alert)' }}>
              <window.AdmIcon kind={e.ok ? 'check' : 'x'} size={12} />
            </span>
          </div>
        ))}
      </div>
    </window.AdmPage>
  );
}

// ─── 4 · Perfil superadmin ────────────────────────────────────
function SAProfileScreen() {
  return (
    <window.AdmPage
      label="AO · Superadmin · Perfil"
      nav={SA_NAV_2} active={5} role="Superadmin" who={SA_WHO_2} accent="accent-bright"
      title="Mi cuenta" sub="root · operaciones de plataforma"
      searchHint=""
      height={1100}
      right={<button className="btn sm ghost" style={{ height: 42, borderRadius: 'var(--r-md)' }}><window.AdmIcon kind="edit" size={13} /> Editar</button>}
    >
      {/* hero */}
      <div style={{ background: 'var(--ink)', color: 'var(--paper)', borderRadius: 'var(--r-xl)', padding: '28px 32px', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 40px -20px rgba(3,4,94,0.5)' }}>
        <div style={{ position: 'absolute', width: 360, height: 360, borderRadius: 999, background: 'radial-gradient(circle, rgba(0,180,216,0.28) 0%, transparent 70%)', top: -120, right: -90 }} />
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 24, alignItems: 'center' }}>
          <span style={{ width: 96, height: 96, borderRadius: 24, background: 'var(--accent-bright)', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 48 }}>IQ</span>
          <div>
            <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Superadmin · root</span>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 44, lineHeight: 1, letterSpacing: '-0.02em', marginTop: 8 }}>Ing. Iván Quezada</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10, color: 'rgba(255,255,255,0.7)', fontSize: 13.5 }}>
              <span>i.quezada@imedexp.mx</span>
              <span style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.2)' }} />
              <span className="mono">2FA activo · TOTP</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, padding: '4px 10px', borderRadius: 999, background: 'var(--accent-bright)', color: 'var(--ink)', letterSpacing: '0.08em' }}>ACCESO TOTAL</span>
            <span className="mono" style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.6)' }}>último ingreso · hoy 08:14</span>
          </div>
        </div>
      </div>

      {/* sections */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 18 }}>
        <window.AdmCard title="Datos personales">
          <div style={{ padding: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              ['Nombre legal', 'Iván Quezada Olmedo'],
              ['Correo', 'i.quezada@imedexp.mx'],
              ['Teléfono', '+52 55 9876 1234'],
              ['Equipo', 'Plataforma · operaciones'],
              ['Zona horaria', 'America/Mexico_City'],
              ['Idioma', 'Español (MX)'],
            ].map(([k, v], i) => (
              <div key={i} style={{ padding: '10px 12px', background: 'var(--paper)', borderRadius: 'var(--r-md)' }}>
                <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{k}</span>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 12.5, color: 'var(--ink)', marginTop: 4 }}>{v}</div>
              </div>
            ))}
          </div>
        </window.AdmCard>

        <window.AdmCard title="Seguridad">
          <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              ['Contraseña', 'cambiada hace 21 d', 'editar'],
              ['Autenticación 2FA · TOTP', 'activa · respaldo en sobre', 'gestionar'],
              ['Llaves de hardware', '1 YubiKey vinculada', 'gestionar'],
              ['Sesiones activas', '2 · MacBook · iPhone', 'cerrar todas'],
              ['IP permitidas', 'oficina CDMX · oficina MTY', 'editar'],
            ].map(([k, v, act], i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, alignItems: 'center', padding: '12px 14px', background: 'var(--paper)', borderRadius: 'var(--r-md)' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{k}</div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>{v}</div>
                </div>
                <span style={{ fontSize: 12, color: 'var(--accent-deep)' }}>{act} →</span>
              </div>
            ))}
          </div>
        </window.AdmCard>

        <window.AdmCard title="Actividad reciente · 30 d">
          <div style={{ padding: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              ['Logins', '34', 'todos desde IPs permitidas'],
              ['Acciones admin', '128', 'crear · pausar · auditar'],
              ['Cuentas creadas', '3', 'instituciones nuevas'],
              ['Eliminaciones', '1', 'Clínica Mérida · 11 may'],
            ].map(([k, n, sub], i) => (
              <div key={i} style={{ padding: '12px 14px', background: 'var(--paper)', borderRadius: 'var(--r-md)' }}>
                <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{k}</span>
                <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 4 }}>{n}</div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 4 }}>{sub}</div>
              </div>
            ))}
          </div>
        </window.AdmCard>

        <window.AdmCard title="Preferencias y notificaciones">
          <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              ['Alertas sev-1 al móvil',       true],
              ['Resumen diario por correo',     true],
              ['Avisos de cuotas y planes',     true],
              ['Eventos de seguridad anómalos', true],
              ['Boletines del producto',        false],
            ].map(([k, on], i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 44px', alignItems: 'center', padding: '12px 14px', background: 'var(--paper)', borderRadius: 'var(--r-md)' }}>
                <span style={{ fontSize: 13 }}>{k}</span>
                <span style={{ width: 36, height: 22, borderRadius: 99, background: on ? 'var(--accent-bright)' : 'var(--rule)', position: 'relative', cursor: 'pointer' }}>
                  <span style={{ position: 'absolute', top: 2, left: on ? 16 : 2, width: 18, height: 18, borderRadius: 99, background: '#fff' }} />
                </span>
              </div>
            ))}
          </div>
        </window.AdmCard>
      </div>

      <div style={{ marginTop: 18, padding: '14px 18px', background: 'var(--alert-soft)', border: '1px solid var(--alert-rule)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <window.AdmIcon kind="flag" size={18} color="var(--alert)" />
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--alert)' }}>Zona peligrosa · acciones irreversibles</div>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>Cerrar sesión global · regenerar tokens · revocar 2FA · borrar cuenta</div>
        </div>
        <span style={{ flex: 1 }} />
        <button className="btn sm ghost" style={{ color: 'var(--alert)', borderColor: 'var(--alert-rule)' }}>Abrir panel →</button>
      </div>
    </window.AdmPage>
  );
}

Object.assign(window, { SADashboardScreen, SAInstitutionDetailScreen, SAAuditScreen, SAProfileScreen });
