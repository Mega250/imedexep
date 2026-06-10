// imedexp · Superadmin · móvil
// 6 pantallas (390 × 844): Inicio · Instituciones · Detalle institución · Administradores · Auditoría · Perfil

const SA_TABS_M = [
  ['home',     'Inicio'],
  ['build',    'Inst.'],
  ['shield-2', 'Admins'],
  ['globe',    'Audit'],
  ['user',     'Perfil'],
];
const SA_WHO_M = ['I. Quezada', 'IQ', 'superadmin · root'];

const SAdev = ({ children }) => (
  <window.IOSDevice width={390} height={844} title="imedexp">{children}</window.IOSDevice>
);

// ─── SA · Inicio (móvil) ───────────────────────────────────────
function SADashboardMobile() {
  const spark = [22, 28, 31, 24, 36, 41, 38, 44, 49, 47, 52, 58, 55, 62];
  const max = Math.max(...spark);
  return (
    <div data-screen-label="W₁ · SA · Inicio (móvil)">
      <SAdev>
        <window.MbFrame tabs={SA_TABS_M} active={0}>
          <window.MbTop sub="jueves 14 may · 10:42" title="Tablero global" accent />
          {/* hero ink card */}
          <div style={{ padding: '14px 20px 0' }}>
            <div style={{ background: 'var(--ink)', color: 'var(--paper)', borderRadius: 'var(--r-lg)', padding: 18, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', width: 220, height: 220, borderRadius: 999, background: 'radial-gradient(circle, rgba(0,180,216,0.32) 0%, transparent 70%)', top: -80, right: -60 }} />
              <div style={{ position: 'relative' }}>
                <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Estado de la red</span>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: 30, lineHeight: 1, letterSpacing: '-0.02em', marginTop: 6 }}>
                  24 clínicas<br />412 médicos<br />32 144 pacientes
                </h2>
                <div className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>
                  +1 280 este mes · +12% consultas
                </div>
                <div style={{ marginTop: 14, display: 'flex', alignItems: 'flex-end', gap: 3, height: 42 }}>
                  {spark.map((v, i) => (
                    <div key={i} style={{
                      flex: 1, height: (v / max) * 100 + '%',
                      background: i === spark.length - 1 ? 'var(--accent-bright)' : 'rgba(255,255,255,0.3)',
                      borderRadius: 2,
                    }} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* stats grid */}
          <div style={{ padding: '14px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <window.MbStat k="Uptime · 30 d" n="99.92%" sub="3 incidentes" />
            <window.MbStat k="Consultas hoy" n="1 384" sub="prom. 58 / h" />
            <window.MbStat k="Recetas firmadas" n="612" sub="+8% vs ayer" />
            <window.MbStat k="Alertas abiertas" n="4" sub="1 sistema · 3 clínicas" tone="alert" />
          </div>

          <window.MbSection title="Alertas" action="Ver todas →">
            <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
              {[
                ['Clínica Mérida',         'Sin actividad ≥ 30 d',  'alert'],
                ['ABC Sta. Fe',            'Cuota al 92%',           'mid'],
                ['OCR receta · sistema',   'Throughput -18% 48 h',   'alert'],
              ].map(([t, sub, tone], i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '32px 1fr', gap: 10, alignItems: 'center', padding: '12px 14px', borderBottom: i < 2 ? '1px solid var(--rule-3)' : 0 }}>
                  <span style={{ width: 28, height: 28, borderRadius: 8, background: tone === 'alert' ? 'var(--alert-soft)' : '#FCEFD7', color: tone === 'alert' ? 'var(--alert)' : 'var(--mid)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <window.MbIcon kind="flag" size={12} />
                  </span>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 500 }}>{t}</div>
                    <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </window.MbSection>

          <window.MbSection title="Top instituciones · este mes" action="Ver →">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                ['H. Ángeles Pedregal', 84, '+8%'],
                ['ABC Sta. Fe', 91, '+6%'],
                ['H. San José', 62, '+11%'],
              ].map(([n, drs, g], i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '32px 1fr auto auto', gap: 10, alignItems: 'center', padding: '12px 14px', background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)' }}>
                  <span style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--ink)', color: 'var(--paper)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 12 }}>{i + 1}</span>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{n}</div>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{drs} mds.</span>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--ok)' }}>{g}</span>
                </div>
              ))}
            </div>
          </window.MbSection>

          <div style={{ height: 20 }} />
        </window.MbFrame>
      </SAdev>
    </div>
  );
}

// ─── SA · Instituciones (móvil) ────────────────────────────────
function SAInstitutionsMobile() {
  const list = [
    { n: 'Clínica Roma Norte', city: 'CDMX', drs: 18, plan: 'P', sel: true },
    { n: 'H. Ángeles del Pedregal', city: 'CDMX', drs: 84, plan: 'E' },
    { n: 'ABC Sta. Fe', city: 'CDMX', drs: 91, plan: 'E' },
    { n: 'H. San José', city: 'MTY', drs: 62, plan: 'E' },
    { n: 'H. Puerta de Hierro', city: 'GDL', drs: 47, plan: 'P' },
    { n: 'Clínica Polanco', city: 'CDMX', drs: 9, plan: 'P', state: 'onboarding' },
    { n: 'Christus Muguerza', city: 'MTY', drs: 55, plan: 'E' },
    { n: 'Clínica Mérida', city: 'MID', drs: 12, plan: 'P', state: 'pausada' },
  ];
  return (
    <div data-screen-label="W₂ · SA · Instituciones (móvil)">
      <SAdev>
        <window.MbFrame tabs={SA_TABS_M} active={1}
          fab={<window.MbFAB icon="plus" label="Nueva" />}>
          <window.MbTop sub="24 clínicas · 412 médicos" title="Instituciones" />
          <div style={{ padding: '12px 20px 0', display: 'flex', gap: 6, overflowX: 'auto' }}>
            {[['Todas', 24, true], ['Activas', 20], ['Onboarding', 2], ['Pausadas', 2]].map(([k, n, on]) => (
              <window.MbPill key={k} on={on} count={n}>{k}</window.MbPill>
            ))}
          </div>
          <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {list.map((it, i) => (
              <div key={i} style={{
                background: 'var(--white)',
                border: '1px solid ' + (it.sel ? 'var(--accent)' : 'var(--rule)'),
                borderRadius: 'var(--r-lg)', padding: '12px 14px',
                display: 'grid', gridTemplateColumns: '40px 1fr auto', gap: 10, alignItems: 'center',
                boxShadow: it.sel ? '0 10px 22px -18px rgba(0,150,199,0.3)' : 'none',
              }}>
                <span style={{ width: 38, height: 38, borderRadius: 10, background: it.plan === 'E' ? 'var(--ink)' : 'var(--accent-bright)', color: it.plan === 'E' ? 'var(--paper)' : 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 14 }}>
                  {it.n.split(' ').filter(s => s[0] >= 'A' && s[0] <= 'Z').slice(0, 2).map(s => s[0]).join('')}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.n}</div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{it.city} · plan {it.plan === 'E' ? 'Enterprise' : 'Pro'} · {it.drs} mds.</div>
                </div>
                {it.state
                  ? <span style={{
                      fontFamily: 'var(--mono)', fontSize: 9, padding: '3px 7px', borderRadius: 999,
                      background: it.state === 'pausada' ? 'var(--alert-soft)' : 'var(--paper-3)',
                      color: it.state === 'pausada' ? 'var(--alert)' : 'var(--accent-deep)',
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                    }}>{it.state}</span>
                  : <window.MbIcon kind="chev" size={14} color="var(--ink-3)" />}
              </div>
            ))}
          </div>
        </window.MbFrame>
      </SAdev>
    </div>
  );
}

// ─── SA · Detalle de institución (móvil) ───────────────────────
function SAInstitutionDetailMobile() {
  return (
    <div data-screen-label="W₃ · SA · Detalle inst. (móvil)">
      <SAdev>
        <window.MbFrame noTabs>
          {/* dark hero */}
          <div style={{ background: 'var(--ink)', color: 'var(--paper)', padding: '14px 20px 22px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', width: 240, height: 240, borderRadius: 999, background: 'radial-gradient(circle, rgba(0,180,216,0.3) 0%, transparent 70%)', top: -90, right: -70 }} />
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <window.MbIcon kind="chev-l" size={16} color="rgba(255,255,255,0.8)" />
              <span className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.04em' }}>Instituciones</span>
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--accent-bright)', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 22 }}>CR</span>
              <div>
                <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Verificada · NOM-024</span>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 24, lineHeight: 1.05, marginTop: 4 }}>Clínica Roma Norte</div>
              </div>
            </div>
            <div className="mono" style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.65)', marginTop: 12 }}>id 1001 · CDMX · plan Pro · desde feb 24</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button style={{ flex: 1, height: 36, padding: '0 12px', borderRadius: 9, background: 'var(--accent-bright)', color: 'var(--ink)', border: 0, fontSize: 12, fontWeight: 600 }}>Editar</button>
              <button style={{ flex: 1, height: 36, padding: '0 12px', borderRadius: 9, background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.25)', fontSize: 12 }}>Pausar</button>
            </div>
          </div>

          <div style={{ padding: '14px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <window.MbStat k="Médicos" n="18" sub="15 verificados" />
            <window.MbStat k="Secretarias" n="4" sub="11 asignaciones" />
            <window.MbStat k="Pacientes" n="1 044" sub="+38 este mes" />
            <window.MbStat k="Almacén" n="142 GB" sub="14% de 1 TB" />
          </div>

          <window.MbSection title="Administradores · 3">
            {[
              ['Lic. R. Coria',    'Director general',  true],
              ['Dr. M. Pardo',     'Director médico'],
              ['C.P. D. Espino',   'Operaciones'],
            ].map(([n, r, p], i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '34px 1fr auto', gap: 10, alignItems: 'center', padding: '10px 12px', background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)', marginBottom: 6 }}>
                <span style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--paper-3)', color: 'var(--accent-deep)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 12 }}>{n.split(' ').slice(-2).map(s => s[0]).join('')}</span>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {n}
                    {p && <span style={{ fontFamily: 'var(--mono)', fontSize: 8.5, padding: '2px 6px', borderRadius: 999, background: 'var(--accent-bright)', color: 'var(--ink)', letterSpacing: '0.06em' }}>PRINC</span>}
                  </div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{r}</div>
                </div>
                <window.MbIcon kind="more" size={14} color="var(--ink-3)" />
              </div>
            ))}
          </window.MbSection>

          <window.MbSection title="Médicos · 6 con más carga" action="Ver 18 →">
            {[
              ['Dr. D. Vega',  'Cirugía',     142],
              ['Dra. L. Padilla', 'Med. int.', 96],
              ['Dr. J. Rendón', 'Cardiología', 81],
            ].map(([n, sp, p], i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, alignItems: 'center', padding: '10px 12px', background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)', marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 500 }}>{n}</div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{sp} · {p} pac.</div>
                </div>
                <window.MbIcon kind="chev" size={14} color="var(--ink-3)" />
              </div>
            ))}
          </window.MbSection>

          <div style={{ height: 20 }} />
        </window.MbFrame>
      </SAdev>
    </div>
  );
}

// ─── SA · Administradores (móvil) ──────────────────────────────
function SAAdminsMobile() {
  const admins = [
    ['Lic. R. Coria',     'Roma Norte', 'Director general'],
    ['Dr. M. Pardo',      'Roma Norte', 'Director médico'],
    ['Mtra. P. Vázquez',  'Á. Pedregal', 'Director general'],
    ['Dr. R. Vega',       'ABC Sta. Fe', 'Director médico'],
    ['Dr. E. Loyola',     'San José',    'Director médico'],
    ['Lic. A. Murguía',   'Polanco',     'Director · pendiente'],
    ['Dr. I. Cervantes',  'Mérida',      'Director · pausado'],
  ];
  return (
    <div data-screen-label="X₂ · SA · Administradores (móvil)">
      <SAdev>
        <window.MbFrame tabs={SA_TABS_M} active={2}
          fab={<window.MbFAB icon="plus" label="Crear" />}>
          <window.MbTop sub="37 cuentas · 24 instituciones" title="Administradores" />
          <div style={{ padding: '12px 20px 0', display: 'flex', gap: 6, overflowX: 'auto' }}>
            {[['Todos', 37, true], ['Director gral', 18], ['Médico', 13], ['Pendientes', 2, false, 'alert']].map(([k, n, on, tone]) => (
              <window.MbPill key={k} on={on} count={n} tone={tone}>{k}</window.MbPill>
            ))}
          </div>
          <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {admins.map(([n, inst, r], i) => {
              const tone = r.includes('pendiente') ? 'alert' : r.includes('pausado') ? 'mid' : 'ok';
              return (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '38px 1fr auto', gap: 10, alignItems: 'center', padding: '12px 14px', background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)' }}>
                  <span style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--paper-4)', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500 }}>
                    {n.split(' ').slice(-2).map(s => s[0]).join('')}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 500 }}>{n}</div>
                    <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{inst} · {r.replace(' · pendiente', '').replace(' · pausado', '')}</div>
                  </div>
                  <span style={{
                    width: 8, height: 8, borderRadius: 99,
                    background: tone === 'alert' ? 'var(--alert)' : tone === 'mid' ? 'var(--mid)' : 'var(--ok)',
                  }} />
                </div>
              );
            })}
          </div>
        </window.MbFrame>
      </SAdev>
    </div>
  );
}

// ─── SA · Auditoría (móvil) ────────────────────────────────────
function SAAuditMobile() {
  const events = [
    { at: '10:42', who: 'Lic. R. Coria',  act: 'INVITATION', ep: 'POST /invitations/',    ok: true,  tone: null },
    { at: '10:38', who: 'Dr. D. Vega',    act: 'RX SIGNED',   ep: 'PATCH /prescriptions/491/sign', ok: true, tone: null },
    { at: '10:34', who: 'system',         act: 'RATE LIMIT',   ep: 'POST /auth/login',   ok: false, tone: 'alert' },
    { at: '10:31', who: 'Sec. M. Vargas', act: 'PT LINKED',    ep: 'POST /patient-institution/', ok: true, tone: null },
    { at: '10:18', who: 'Dr. M. Pardo',   act: 'ADMIN UPD',    ep: 'PATCH /institutions/1001/admins/3', ok: true, tone: 'mid' },
    { at: '10:14', who: 'M. Arellano',    act: 'QR GEN',       ep: 'POST /qr-access/generate', ok: true, tone: null },
    { at: '09:58', who: 'system',         act: 'MAIL FAIL',    ep: 'mailer · inv 412',   ok: false, tone: 'alert' },
    { at: '09:51', who: 'I. Quezada',     act: 'INST DEL',     ep: 'DELETE /institutions/1018', ok: true, tone: 'mid' },
  ];
  return (
    <div data-screen-label="AN₂ · SA · Auditoría (móvil)">
      <SAdev>
        <window.MbFrame tabs={SA_TABS_M} active={3}
          fab={<window.MbFAB icon="copy" label="CSV" bottom={110} />}>
          <window.MbTop sub="14 217 eventos · 24 h" title="Auditoría" />
          <div style={{ padding: '12px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <window.MbStat k="Errores · 24 h" n="42" sub="0.29% del total" />
            <window.MbStat k="429 rate-limit" n="14" sub="3 IPs frecuentes" tone="alert" />
          </div>
          <div style={{ padding: '14px 20px 0', display: 'flex', gap: 6, overflowX: 'auto' }}>
            {[['Todos', '14 217', true], ['Auth'], ['Clínicos'], ['Sistema'], ['Errores', 42, false, 'alert']].map(([k, n, on, tone]) => (
              <window.MbPill key={k} on={on} count={n} tone={tone}>{k}</window.MbPill>
            ))}
          </div>
          <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {events.map((e, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '52px 1fr 22px', gap: 8,
                padding: '11px 12px',
                background: e.tone === 'alert' ? 'rgba(184,50,50,0.04)' : 'var(--white)',
                border: '1px solid var(--rule)', borderRadius: 'var(--r-md)',
              }}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-2)', fontWeight: 500 }}>{e.at}</span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 500 }}>{e.who}</span>
                    <span style={{
                      fontFamily: 'var(--mono)', fontSize: 8.5, padding: '2px 5px', borderRadius: 4,
                      background: e.tone === 'alert' ? 'var(--alert-soft)' : e.tone === 'mid' ? '#FCEFD7' : 'var(--paper-3)',
                      color: e.tone === 'alert' ? 'var(--alert)' : e.tone === 'mid' ? 'var(--mid)' : 'var(--accent-deep)',
                      letterSpacing: '0.04em',
                    }}>{e.act}</span>
                  </div>
                  <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', marginTop: 2 }}>{e.ep}</div>
                </div>
                <span style={{ width: 22, height: 22, borderRadius: 6, background: e.ok ? '#E5F5EE' : 'var(--alert-soft)', color: e.ok ? 'var(--ok)' : 'var(--alert)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <window.MbIcon kind={e.ok ? 'check' : 'x'} size={12} />
                </span>
              </div>
            ))}
          </div>
        </window.MbFrame>
      </SAdev>
    </div>
  );
}

// ─── SA · Perfil (móvil) ───────────────────────────────────────
function SAProfileMobile() {
  return (
    <div data-screen-label="AO₂ · SA · Perfil (móvil)">
      <SAdev>
        <window.MbFrame tabs={SA_TABS_M} active={4}>
          <div style={{ background: 'var(--ink)', color: 'var(--paper)', padding: '16px 22px 22px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', width: 260, height: 260, borderRadius: 999, background: 'radial-gradient(circle, rgba(0,180,216,0.3) 0%, transparent 70%)', top: -90, right: -70 }} />
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 64, height: 64, borderRadius: 18, background: 'var(--accent-bright)', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 28 }}>IQ</span>
              <div>
                <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Superadmin · root</span>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 26, lineHeight: 1.05, marginTop: 4 }}>Ing. Iván Quezada</div>
                <div className="mono" style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>i.quezada@imedexp.mx</div>
              </div>
            </div>
            <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, padding: '4px 10px', borderRadius: 999, background: 'var(--accent-bright)', color: 'var(--ink)', letterSpacing: '0.06em' }}>ACCESO TOTAL</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, padding: '4px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}>2FA · TOTP</span>
            </div>
          </div>

          <window.MbSection title="Datos personales" action="Editar →">
            {[
              ['Teléfono', '+52 55 9876 1234'],
              ['Equipo', 'Plataforma · operaciones'],
              ['Zona horaria', 'America/Mexico_City'],
            ].map(([k, v], i) => (
              <div key={i} style={{ padding: '10px 12px', background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)', marginBottom: 6 }}>
                <span className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{k}</span>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink)', marginTop: 3 }}>{v}</div>
              </div>
            ))}
          </window.MbSection>

          <window.MbSection title="Seguridad">
            {[
              ['Contraseña', 'cambiada hace 21 d'],
              ['2FA · TOTP', 'activa · respaldo en sobre'],
              ['Llaves de hardware', '1 YubiKey vinculada'],
              ['Sesiones activas', '2 dispositivos'],
            ].map(([k, v], i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', padding: '12px 14px', background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)', marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 500 }}>{k}</div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{v}</div>
                </div>
                <window.MbIcon kind="chev" size={14} color="var(--ink-3)" />
              </div>
            ))}
          </window.MbSection>

          <window.MbSection title="Notificaciones">
            {[
              ['Alertas sev-1 al móvil', true],
              ['Resumen diario por correo', true],
              ['Avisos de cuotas', true],
              ['Boletines del producto', false],
            ].map(([k, on], i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', padding: '12px 14px', background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)', marginBottom: 6 }}>
                <span style={{ fontSize: 12.5 }}>{k}</span>
                <window.MbSwitch on={on} />
              </div>
            ))}
          </window.MbSection>

          <div style={{ padding: '16px 20px 32px' }}>
            <div style={{ padding: '12px 14px', background: 'var(--alert-soft)', border: '1px solid var(--alert-rule)', borderRadius: 'var(--r-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <window.MbIcon kind="flag" size={14} color="var(--alert)" />
                <span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--alert)' }}>Zona peligrosa</span>
              </div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 4, lineHeight: 1.4 }}>Cerrar sesión global · revocar 2FA · borrar cuenta</div>
            </div>
          </div>
        </window.MbFrame>
      </SAdev>
    </div>
  );
}

Object.assign(window, {
  SADashboardMobile, SAInstitutionsMobile, SAInstitutionDetailMobile,
  SAAdminsMobile, SAAuditMobile, SAProfileMobile,
});
