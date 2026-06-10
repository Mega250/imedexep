// imedexp · Superadmin · Control de pantallas por rol · PC + móvil
// Matriz rol × pantalla. Activa o desactiva qué módulos ve cada rol desde la BD.

const SA_NAV_3 = [
  ['home',      'Inicio'],
  ['build',     'Instituciones', '24'],
  ['shield-2',  'Administradores', '37'],
  ['edit',      'Pantallas',      '46'],
  ['globe',     'Auditoría'],
  ['user',      'Perfil'],
];
const SA_WHO_3 = ['I. Quezada', 'IQ', 'superadmin · root'];

// Roles que mostramos como columnas
const ROLES = [
  { k: 'sa',  l: 'Super',     full: 'superadmin',         color: 'var(--ink)' },
  { k: 'dir', l: 'Director',  full: 'institution_admin',  color: 'var(--accent-deep)' },
  { k: 'sec', l: 'Secret.',   full: 'secretary',          color: 'var(--mid)' },
  { k: 'doc', l: 'Médico',    full: 'doctor',             color: 'var(--accent)' },
  { k: 'est', l: 'Estud.',    full: 'estudiante',         color: 'var(--ok)' },
  { k: 'doce',l: 'Docente',   full: 'docente',            color: 'var(--accent-bright)' },
  { k: 'pat', l: 'Paciente',  full: 'patient',            color: 'var(--ink-3)' },
  { k: 'adm', l: 'Admin.',    full: 'personal_admin',     color: '#7A4FB0' },
];

// Pantallas agrupadas por módulo. Cada celda: roles habilitados.
const MODULES = [
  {
    title: 'Auth · acceso',
    rows: [
      ['/login',                    [1,1,1,1,1,1,1]],
      ['/auth/register',            [0,0,0,0,0,0,1]],
      ['/auth/register-doctor',     [0,0,0,0,0,0,0]],
      ['/auth/verify-email',        [0,0,0,0,0,0,1]],
      ['/auth/recover',             [1,1,1,1,1,1,1]],
    ],
  },
  {
    title: 'Superadmin · plataforma',
    rows: [
      ['Tablero global',            [1,0,0,0,0,0,0]],
      ['Instituciones (CRUD)',      [1,0,0,0,0,0,0]],
      ['Detalle de institución',    [1,0,0,0,0,0,0]],
      ['Administradores · todos',   [1,0,0,0,0,0,0]],
      ['Auditoría · bitácora',      [1,0,0,0,0,0,0]],
      ['Pantallas y permisos',      [1,0,0,0,0,0,0]],
    ],
  },
  {
    title: 'Director · clínica',
    rows: [
      ['Inicio · operativo',        [0,1,0,0,0,0,0]],
      ['Médicos de la clínica',     [0,1,1,0,0,0,0]],
      ['Detalle de médico',         [0,1,0,0,0,0,0]],
      ['Secretarias (CRUD)',        [0,1,0,0,0,0,0]],
      ['Invitaciones a médicos',    [0,1,0,0,0,0,0]],
      ['Asignaciones doctor↔sec',   [0,1,0,0,0,0,0]],
      ['Pacientes de la clínica',   [0,1,1,1,0,0,0]],
      ['Configuración clínica',     [0,1,0,0,0,0,0]],
    ],
  },
  {
    title: 'Secretaria · recepción',
    rows: [
      ['Recepción del día',         [0,1,1,0,0,0,0]],
      ['Pacientes',                 [0,1,1,1,0,0,0]],
      ['Agenda completa',           [0,1,1,1,0,0,0]],
      ['Vincular paciente',         [0,1,1,0,0,0,0]],
      ['Contactos de emergencia',   [0,1,1,1,0,0,1]],
    ],
  },
  {
    title: 'Médico · consola',
    rows: [
      ['Dashboard del médico',      [0,1,0,1,1,1,0]],
      ['Mis pacientes',             [0,1,1,1,0,0,0]],
      ['Agenda semanal',            [0,1,1,1,0,0,0]],
      ['Consultas',                 [0,1,0,1,0,1,0]],
      ['Recetas',                   [0,1,0,1,0,0,0]],
      ['Validaciones · firma',      [0,1,0,1,0,0,0]],
      ['Invitaciones recibidas',    [0,0,0,1,0,0,0]],
      ['Turnos / shifts',           [0,1,0,1,0,0,0]],
      ['Escanear QR de paciente',   [0,0,1,1,0,0,0]],
      ['Signos vitales · pac.',     [0,0,1,1,1,0,0]],
      ['Expediente completo',       [0,1,0,1,0,1,0]],
      ['Bitácora del personal',     [0,0,0,0,1,1,0,1], 'highlight'],
    ],
  },
  {
    title: 'Paciente · expediente',
    rows: [
      ['Inicio del paciente',       [0,0,0,0,0,0,1]],
      ['Historial · resumen',       [0,0,0,1,0,0,1]],
      ['Alergias · cirugías · …',   [0,0,0,1,0,0,1]],
      ['Mis citas',                 [0,1,1,1,0,0,1]],
      ['Agendar cita',              [0,0,1,0,0,0,1]],
      ['Medicamentos',              [0,0,0,1,0,0,1]],
      ['Ciclo menstrual',           [0,0,0,1,0,0,1]],
      ['Signos vitales · míos',     [0,0,0,1,0,0,1]],
      ['Emergencia · contactos',    [0,0,1,1,0,0,1]],
      ['Mis clínicas vinculadas',   [0,0,0,0,0,0,1]],
      ['Mi QR de acceso',           [0,0,0,0,0,0,1]],
      ['Avisos / notificaciones',   [0,0,0,0,0,0,1]],
      ['Mi perfil',                 [0,0,0,0,0,0,1]],
    ],
  },
];

function PermCell({ on, highlight }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 0, borderLeft: '1px solid var(--rule-3)',
      background: on ? (highlight ? '#E5F5EE' : 'var(--white)') : 'var(--paper)',
    }}>
      {on ? (
        <span style={{
          width: 28, height: 28, borderRadius: 8,
          background: highlight ? 'var(--ok)' : 'var(--ink)',
          color: '#fff',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <window.AdmIcon kind="check" size={14} />
        </span>
      ) : (
        <span style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'var(--white)', border: '1px dashed var(--rule)',
        }} />
      )}
    </div>
  );
}

// ─── Permisos (PC) ────────────────────────────────────────────
function SAPermissionsScreen() {
  const totalRows = MODULES.reduce((a, m) => a + m.rows.length, 0);
  // per-role counts (how many screens each role can see)
  const counts = ROLES.map((_, i) =>
    MODULES.reduce((a, m) => a + m.rows.reduce((b, r) => b + (r[1][i] || 0), 0), 0)
  );

  return (
    <window.AdmPage
      label="BD · Superadmin · Pantallas y permisos"
      nav={SA_NAV_3} active={3} role="Superadmin" who={SA_WHO_3} accent="accent-bright"
      title="Pantallas y permisos · matriz" sub={`${totalRows} pantallas registradas · ${ROLES.length} roles`}
      searchHint="Buscar pantalla por nombre o módulo…"
      height={1320}
      right={<>
        <button className="btn sm ghost" style={{ height: 42, borderRadius: 'var(--r-md)' }}>Restaurar default</button>
        <button className="btn sm" style={{ height: 42, borderRadius: 'var(--r-md)' }}><window.AdmIcon kind="check" size={13} color="#fff" /> Guardar cambios</button>
      </>}
    >
      {/* role stats */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${ROLES.length}, 1fr)`, gap: 8 }}>
        {ROLES.map((r, i) => (
          <div key={r.k} style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)', padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 99, background: r.color }} />
              <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{r.l}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 500, marginTop: 4, lineHeight: 1, letterSpacing: '-0.025em' }}>{counts[i]} <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>/ {totalRows}</span></div>
            <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', marginTop: 4 }}>{r.full}</div>
          </div>
        ))}
      </div>

      {/* filter bar */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 18, flexWrap: 'wrap' }}>
        {[['Todos los módulos', totalRows, true], ['Auth', 5], ['Superadmin', 6], ['Director', 8], ['Médico', 12], ['Paciente', 13]].map(([k, n, on]) => (
          <window.AdmPill key={k} on={on} count={n}>{k}</window.AdmPill>
        ))}
        <span style={{ flex: 1 }} />
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>Ordenar: por módulo ▾</span>
      </div>

      {/* matrix */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden', marginTop: 14 }}>
        {/* sticky-style header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `320px repeat(${ROLES.length}, 1fr)`,
          background: 'var(--ink)', color: 'var(--paper)',
        }}>
          <div style={{ padding: '14px 18px' }}>
            <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Pantalla / endpoint</span>
          </div>
          {ROLES.map((r) => (
            <div key={r.k} style={{ padding: '14px 8px', textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 22, height: 22, borderRadius: 7, background: r.color, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 600 }}>{r.l[0]}</span>
                <span style={{ fontSize: 11, fontWeight: 500 }}>{r.l}</span>
              </span>
            </div>
          ))}
        </div>

        {MODULES.map((mod, mi) => (
          <React.Fragment key={mi}>
            {/* module heading row */}
            <div style={{
              display: 'grid', gridTemplateColumns: `320px repeat(${ROLES.length}, 1fr)`,
              background: 'var(--paper-3)', borderTop: '1px solid var(--rule-2)',
            }}>
              <div style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--accent-deep)' }} />
                <span className="mono" style={{ fontSize: 10.5, color: 'var(--accent-deep)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>{mod.title}</span>
              </div>
              {ROLES.map((_, i) => (
                <div key={i} style={{ padding: '10px 8px', textAlign: 'center', borderLeft: '1px solid var(--rule-2)', fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--accent-deep)' }}>
                  {mod.rows.filter(r => r[1][i]).length}
                </div>
              ))}
            </div>
            {/* rows */}
            {mod.rows.map(([name, cells, hl], ri) => (
              <div key={ri} style={{
                display: 'grid', gridTemplateColumns: `320px repeat(${ROLES.length}, 1fr)`,
                borderTop: '1px solid var(--rule-3)',
                background: hl === 'highlight' ? 'rgba(28,140,90,0.05)' : 'var(--white)',
              }}>
                <div style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {hl === 'highlight' && <span style={{ fontFamily: 'var(--mono)', fontSize: 8, padding: '2px 5px', borderRadius: 4, background: 'var(--ok)', color: '#fff', letterSpacing: '0.06em' }}>NUEVO</span>}
                  <span style={{ fontSize: 12.5, color: 'var(--ink)' }}>{name}</span>
                </div>
                {ROLES.map((_, i) => <PermCell key={i} on={cells[i] || 0} highlight={hl === 'highlight'} />)}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>

      {/* note */}
      <div style={{ marginTop: 18, padding: '14px 18px', background: 'var(--paper-3)', border: '1px solid var(--accent-rule)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <window.AdmIcon kind="shield-2" size={18} color="var(--accent-deep)" />
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--accent-deep)' }}>Los cambios se guardan en la tabla <span className="mono">role_screen_access</span></div>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 4, lineHeight: 1.5 }}>
            El menú lateral se renderiza desde la BD al iniciar sesión. Roles personalizados se manejan vía <span style={{ color: 'var(--ink)' }}>POST /admin/roles</span> y heredan de un rol base.
          </div>
        </div>
        <span style={{ flex: 1 }} />
        <button className="btn sm ghost">Crear rol personalizado</button>
      </div>
    </window.AdmPage>
  );
}

// ─── Permisos (móvil) ─────────────────────────────────────────
const SA_TABS_M_3 = [
  ['home',     'Inicio'],
  ['build',    'Inst.'],
  ['shield-2', 'Admins'],
  ['edit',     'Pant.'],
  ['user',     'Perfil'],
];

function SAPermissionsMobile() {
  // En móvil mostramos vista "por rol": elige un rol, ve qué pantallas tiene
  // 'Médico' como rol seleccionado por defecto
  const activeRoleIdx = 3; // doctor
  const visibleMods = MODULES.map(m => ({
    ...m,
    rows: m.rows.filter(r => r[1][activeRoleIdx] === 1),
  })).filter(m => m.rows.length > 0);
  return (
    <div data-screen-label="BD₂ · SA · Pantallas y permisos (móvil)">
      <window.IOSDevice width={390} height={844} title="imedexp">
        <window.MbFrame tabs={SA_TABS_M_3} active={3}
          fab={<window.MbFAB icon="check" label="Guardar" />}>
          <window.MbTop sub="46 pantallas · 7 roles · BD: role_screen_access" title="Pantallas y permisos" />

          {/* role selector horizontal scroll */}
          <div style={{ padding: '12px 20px 0' }}>
            <span className="eyebrow">Ver permisos del rol</span>
            <div style={{ display: 'flex', gap: 6, marginTop: 8, overflowX: 'auto' }}>
              {ROLES.map((r, i) => {
                const on = i === activeRoleIdx;
                const count = MODULES.reduce((a, m) => a + m.rows.reduce((b, row) => b + (row[1][i] || 0), 0), 0);
                return (
                  <span key={r.k} style={{
                    padding: '8px 12px', borderRadius: 'var(--r-md)', flexShrink: 0,
                    background: on ? 'var(--ink)' : 'var(--white)',
                    color:      on ? 'var(--paper)' : 'var(--ink-2)',
                    border: '1px solid ' + (on ? 'var(--ink)' : 'var(--rule)'),
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                  }}>
                    <span style={{ width: 7, height: 7, borderRadius: 99, background: r.color }} />
                    <span style={{ fontSize: 12, fontWeight: 500 }}>{r.l}</span>
                    <span className="mono" style={{ fontSize: 9.5, opacity: 0.65 }}>{count}</span>
                  </span>
                );
              })}
            </div>
          </div>

          {/* hero count */}
          <div style={{ padding: '14px 20px 0' }}>
            <div style={{ background: 'var(--ink)', color: 'var(--paper)', borderRadius: 'var(--r-lg)', padding: 16, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: 999, background: 'radial-gradient(circle, rgba(0,180,216,0.32) 0%, transparent 70%)', top: -80, right: -50 }} />
              <div style={{ position: 'relative' }}>
                <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Rol · {ROLES[activeRoleIdx].full}</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
                  <span style={{ fontFamily: 'var(--serif)', fontSize: 38, lineHeight: 1 }}>
                    {MODULES.reduce((a, m) => a + m.rows.reduce((b, r) => b + (r[1][activeRoleIdx] || 0), 0), 0)}
                  </span>
                  <span className="mono" style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.6)' }}>pantallas habilitadas de {MODULES.reduce((a, m) => a + m.rows.length, 0)}</span>
                </div>
                <div className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 6 }}>BD: role_screen_access where role = 'doctor'</div>
              </div>
            </div>
          </div>

          {/* per-module list */}
          {visibleMods.map((mod, mi) => (
            <window.MbSection key={mi} title={mod.title.toUpperCase()}>
              {mod.rows.map((row, ri) => {
                const [name, cells, hl] = row;
                return (
                  <div key={ri} style={{
                    display: 'grid', gridTemplateColumns: '1fr 44px',
                    padding: '11px 12px',
                    background: hl === 'highlight' ? 'rgba(28,140,90,0.05)' : 'var(--white)',
                    border: '1px solid ' + (hl === 'highlight' ? '#BFE3CF' : 'var(--rule)'),
                    borderRadius: 'var(--r-md)', alignItems: 'center', marginBottom: 5,
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {hl === 'highlight' && <span style={{ fontFamily: 'var(--mono)', fontSize: 8, padding: '2px 5px', borderRadius: 4, background: 'var(--ok)', color: '#fff', letterSpacing: '0.06em' }}>NUEVO</span>}
                        <span style={{ fontSize: 12.5, fontWeight: 500 }}>{name}</span>
                      </div>
                    </div>
                    <window.MbSwitch on={true} />
                  </div>
                );
              })}
            </window.MbSection>
          ))}

          {/* hidden modules — show as collapsed */}
          <window.MbSection title="Otros módulos · ocultos para médico">
            {MODULES
              .filter(m => m.rows.every(r => r[1][activeRoleIdx] === 0))
              .map((m, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', padding: '11px 12px', background: 'var(--paper)', border: '1px dashed var(--rule)', borderRadius: 'var(--r-md)', marginBottom: 5 }}>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--ink-3)' }}>{m.title}</div>
                    <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{m.rows.length} pantallas · todas ocultas</div>
                  </div>
                  <window.MbIcon kind="chev" size={14} color="var(--ink-3)" />
                </div>
              ))}
          </window.MbSection>

          <div style={{ padding: '4px 20px 20px' }}>
            <div style={{ padding: '12px 14px', background: 'var(--paper-3)', border: '1px solid var(--accent-rule)', borderRadius: 'var(--r-md)' }}>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--accent-deep)', lineHeight: 1.5 }}>
                Cambios se guardan en BD · el sidebar se reconstruye al siguiente login. Roles personalizados desde el panel completo.
              </div>
            </div>
          </div>
        </window.MbFrame>
      </window.IOSDevice>
    </div>
  );
}

Object.assign(window, { SAPermissionsScreen, SAPermissionsMobile });
