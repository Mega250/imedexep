// imedexp · Director · PC · pantallas extra
// Pacientes de la clínica · Detalle médico · Configuración · Perfil

const DIR_NAV_2 = [
  ['home',      'Inicio'],
  ['stetho',    'Médicos',         '18'],
  ['users',     'Secretarias',     '4'],
  ['inbox',     'Invitaciones',    '3'],
  ['link',      'Asignaciones'],
  ['briefcase', 'Pacientes',       '1 044'],
  ['build',     'Clínica'],
  ['user',      'Perfil'],
];
const DIR_WHO_2 = ['Lic. R. Coria', 'RC', 'director · roma norte'];

// ─── 1 · Pacientes de la clínica ──────────────────────────────
function DirPatientsScreen() {
  const list = [
    { n: 'María F. Arellano',   age: 34, sex: '♀', tags: ['tiroides','migraña'],   dr: 'Dr. Vega',     last: 'hoy 10:30', sel: true },
    { n: 'Carlos Mendoza Vela', age: 58, sex: '♂', tags: ['post-op'],               dr: 'Dr. Vega',     last: 'hoy 09:00' },
    { n: 'Patricia Lozano',     age: 47, sex: '♀', tags: ['oncología'],             dr: 'Dra. Padilla', last: 'hoy 09:45' },
    { n: 'José Luis Padilla',   age: 62, sex: '♂', tags: ['hernia'],                dr: 'Dr. Vega',     last: 'hoy 11:15' },
    { n: 'Ana Sofía Cortés',    age: 41, sex: '♀', tags: ['cólico biliar'],          dr: 'Dr. Vega',     last: 'hoy 12:00' },
    { n: 'Luis Ramírez Téllez', age: 29, sex: '♂', tags: ['1ª consulta'],            dr: 'Dr. Vega',     last: 'hoy 14:00' },
    { n: 'Roberto Aguilar',     age: 51, sex: '♂', tags: ['pre-qx'],                 dr: 'Dr. Vega',     last: 'ayer' },
    { n: 'Sofía Hernández',     age: 37, sex: '♀', tags: ['cólico biliar'],          dr: 'Dra. Padilla', last: 'ayer' },
    { n: 'Elena Castaño',       age: 55, sex: '♀', tags: ['gastritis'],              dr: 'Dra. Padilla', last: '11 may' },
    { n: 'Diego Salinas',       age: 44, sex: '♂', tags: ['sutura · alta'],          dr: 'Dra. Padilla', last: '11 may' },
    { n: 'Mariana Ovalle',      age: 33, sex: '♀', tags: ['reflujo'],                dr: 'Dr. Vega',     last: '08 may' },
    { n: 'Tomás Beltrán',       age: 67, sex: '♂', tags: ['colelitiasis'],           dr: 'Dr. Vega',     last: '06 may' },
    { n: 'Inés Morales',        age: 39, sex: '♀', tags: ['cardio · control'],       dr: 'Dr. Rendón',   last: '04 may' },
    { n: 'Bruno Tinoco',        age: 28, sex: '♂', tags: ['1ª consulta'],            dr: 'Dr. Alcalá',   last: '03 may' },
  ];
  return (
    <window.AdmPage
      label="AP · Director · Pacientes de la clínica"
      nav={DIR_NAV_2} active={5} role="Director" who={DIR_WHO_2} accent="accent-bright"
      title="Pacientes vinculados" sub="1 044 expedientes · 38 nuevos este mes"
      searchHint="Buscar paciente, CURP, médico tratante…"
      height={1180}
      right={<button className="btn sm ghost" style={{ height: 42, borderRadius: 'var(--r-md)' }}>Exportar listado</button>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <window.AdmStat k="Pacientes vinculados" n="1 044" sub="+38 este mes" />
        <window.AdmStat k="Activos 30 d" n="612" sub="59% de cartera" />
        <window.AdmStat k="Pacientes nuevos" n="38" sub="6 sin médico tratante" />
        <window.AdmStat k="Multi-clínica" n="184" sub="comparten expediente con otra IPS" />
      </div>

      <div style={{ display: 'flex', gap: 6, marginTop: 18, alignItems: 'center', flexWrap: 'wrap' }}>
        {[['Todos', '1 044', true], ['Activos 30 d', 612], ['Nuevos', 38], ['Sin médico', 6, false, 'alert'], ['Crónicos', 184], ['Pediátricos', 96]].map(([k, n, on, tone]) => (
          <window.AdmPill key={k} on={on} count={n} tone={tone}>{k}</window.AdmPill>
        ))}
        <span style={{ flex: 1 }} />
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>Filtrar médico ▾</span>
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>Ordenar: última consulta ▾</span>
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden', marginTop: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1.4fr 1fr 40px', padding: '12px 18px', borderBottom: '1px solid var(--rule-2)', fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <span>Paciente</span><span>Médico tratante</span><span>Diagnóstico(s)</span><span>Última</span><span></span>
        </div>
        {list.map((p, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '2fr 1.2fr 1.4fr 1fr 40px',
            padding: '13px 18px', alignItems: 'center',
            borderBottom: i < list.length - 1 ? '1px solid var(--rule-3)' : 0,
            background: p.sel ? 'var(--paper-3)' : 'transparent',
            borderLeft: p.sel ? '3px solid var(--accent)' : '3px solid transparent',
            paddingLeft: p.sel ? 15 : 18,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <span style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--paper-4)', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500 }}>
                {p.n.split(' ').slice(0, 2).map(s => s[0]).join('')}
              </span>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{p.n}</div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{p.sex} {p.age}a</div>
              </div>
            </div>
            <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-2)' }}>{p.dr}</span>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {p.tags.map((t, j) => (
                <span key={j} style={{ fontFamily: 'var(--mono)', fontSize: 10, padding: '2px 7px', borderRadius: 999, background: 'var(--paper-3)', color: 'var(--accent-deep)' }}>{t}</span>
              ))}
            </div>
            <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{p.last}</span>
            <window.AdmIcon kind="more" size={16} color="var(--ink-3)" />
          </div>
        ))}
      </div>
    </window.AdmPage>
  );
}

// ─── 2 · Detalle de un médico ─────────────────────────────────
function DirDoctorDetailScreen() {
  const sched = [
    ['Lun', '08–13 · OR 14–16'], ['Mar', '09–14'], ['Mié', '08–13 · 15–18'],
    ['Jue', 'OR 08–12 · 13–17'], ['Vie', '09–14'], ['Sáb', '09–12'],
  ];
  const upcoming = [
    ['10:30', 'María F. Arellano', '1ª consulta', 'en 14 min'],
    ['11:00', 'Diego Salinas',     'Sutura · alta', '46 min'],
    ['11:30', 'Carmen Esquivel',   'Pre-qx',        '1 h 16'],
    ['12:00', 'Ana Sofía Cortés',  'Cólico biliar', '1 h 46'],
  ];
  return (
    <window.AdmPage
      label="AQ · Director · Detalle de médico"
      nav={DIR_NAV_2} active={1} role="Director" who={DIR_WHO_2} accent="accent-bright"
      title="Dr. Damián Vega Ríos" sub="← Médicos · cirugía general · activo desde feb 2024"
      searchHint=""
      height={1200}
      right={<>
        <button className="btn sm ghost" style={{ height: 42, borderRadius: 'var(--r-md)' }}><window.AdmIcon kind="edit" size={13} /> Editar</button>
        <button className="btn sm ghost" style={{ height: 42, borderRadius: 'var(--r-md)', color: 'var(--alert)', borderColor: 'var(--alert-rule)' }}>Suspender</button>
      </>}
    >
      {/* hero */}
      <div style={{ background: 'var(--ink)', color: 'var(--paper)', borderRadius: 'var(--r-xl)', padding: '28px 32px', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 40px -20px rgba(3,4,94,0.5)' }}>
        <div style={{ position: 'absolute', width: 360, height: 360, borderRadius: 999, background: 'radial-gradient(circle, rgba(0,180,216,0.28) 0%, transparent 70%)', top: -120, right: -90 }} />
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 24, alignItems: 'center' }}>
          <span style={{ width: 96, height: 96, borderRadius: 24, background: 'var(--accent-bright)', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 44 }}>DV</span>
          <div>
            <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Médico · cirujano</span>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 44, lineHeight: 1, letterSpacing: '-0.02em', marginTop: 8 }}>Dr. Damián Vega Ríos</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10, color: 'rgba(255,255,255,0.7)', fontSize: 13.5 }}>
              <span>Cirugía general</span>
              <span style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.2)' }} />
              <span>Sub-esp. hepatobiliar</span>
              <span style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.2)' }} />
              <span className="mono">céd. 8 421 776</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, padding: '4px 10px', borderRadius: 999, background: 'var(--accent-bright)', color: 'var(--ink)', letterSpacing: '0.08em' }}>ACTIVO</span>
            <span className="mono" style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.6)' }}>último ingreso · hoy 08:14</span>
          </div>
        </div>
      </div>

      {/* stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginTop: 18 }}>
        {[
          ['Pacientes', '142', '88 activos'],
          ['Consultas / sem', '38', '+12% vs sem. 19'],
          ['Recetas / sem', '28', '92% con OCR'],
          ['Quirófano / sem', '6 h', '3 días bloqueados'],
          ['Validaciones / sem', '12', 'firma electrónica al día'],
        ].map(([k, n, sub], i) => <window.AdmStat key={i} k={k} n={n} sub={sub} />)}
      </div>

      {/* 2 col: schedule + upcoming */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 18 }}>
        <window.AdmCard title="Horario semana tipo" action={<span className="mono" style={{ fontSize: 11, color: 'var(--accent-deep)' }}>Editar →</span>}>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {sched.map(([d, t], i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '60px 1fr', alignItems: 'center', padding: '10px 14px', background: 'var(--paper)', borderRadius: 'var(--r-md)' }}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{d}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 12.5, color: 'var(--ink)' }}>{t}</span>
              </div>
            ))}
          </div>
        </window.AdmCard>

        <window.AdmCard title="Próximas citas · hoy" action={<span className="mono" style={{ fontSize: 11, color: 'var(--accent-deep)' }}>Ver agenda →</span>}>
          {upcoming.map(([t, n, r, sub], i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '60px 1fr auto', gap: 12, alignItems: 'center', padding: '13px 20px', borderBottom: i < upcoming.length - 1 ? '1px solid var(--rule-3)' : 0 }}>
              <span className="mono" style={{ fontSize: 12, color: 'var(--ink-2)', fontWeight: 500 }}>{t}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{n}</div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>{r}</div>
              </div>
              <span className="mono" style={{ fontSize: 10.5, color: 'var(--accent-deep)' }}>{sub}</span>
            </div>
          ))}
        </window.AdmCard>
      </div>

      {/* secretarias + permissions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 18 }}>
        <window.AdmCard title="Secretarias asignadas · 1">
          <div style={{ padding: 18 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr auto', gap: 12, alignItems: 'center', padding: '12px 14px', background: 'var(--paper)', borderRadius: 'var(--r-md)' }}>
              <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-bright)', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 14 }}>MV</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>María Estela Vargas</div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>318 pacientes · 3 doctores</div>
              </div>
              <button className="btn sm ghost" style={{ height: 28, fontSize: 11 }}><window.AdmIcon kind="x" size={12} color="var(--alert)" /> Quitar</button>
            </div>
            <button className="btn sm ghost block" style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}>
              <window.AdmIcon kind="plus" size={13} /> Asignar otra secretaria
            </button>
          </div>
        </window.AdmCard>

        <window.AdmCard title="Permisos en la clínica">
          <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              ['Crear y modificar expedientes', true],
              ['Firmar recetas electrónicas',   true],
              ['Emitir validaciones (alta · incapacidad)', true],
              ['Acceso a expedientes de otros médicos', false],
              ['Editar agenda de otros médicos', false],
              ['Ver métricas de toda la clínica', true],
            ].map(([k, on], i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 44px', alignItems: 'center', padding: '10px 14px', background: 'var(--paper)', borderRadius: 'var(--r-md)' }}>
                <span style={{ fontSize: 12.5 }}>{k}</span>
                <span style={{ width: 36, height: 22, borderRadius: 99, background: on ? 'var(--accent-bright)' : 'var(--rule)', position: 'relative' }}>
                  <span style={{ position: 'absolute', top: 2, left: on ? 16 : 2, width: 18, height: 18, borderRadius: 99, background: '#fff' }} />
                </span>
              </div>
            ))}
          </div>
        </window.AdmCard>
      </div>
    </window.AdmPage>
  );
}

// ─── 3 · Configuración de la clínica ───────────────────────────
function DirSettingsScreen() {
  return (
    <window.AdmPage
      label="AR · Director · Configuración de la clínica"
      nav={DIR_NAV_2} active={6} role="Director" who={DIR_WHO_2} accent="accent-bright"
      title="Clínica Roma Norte · configuración" sub="Datos generales · marca · políticas · plan"
      searchHint=""
      height={1200}
      right={<button className="btn sm" style={{ height: 42, borderRadius: 'var(--r-md)' }}>Guardar cambios</button>}
    >
      {/* tabs visual */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
        {[['General', true], ['Marca'], ['Sucursales'], ['Políticas'], ['Integraciones'], ['Plan y facturación']].map(([k, on]) => (
          <span key={k} style={{
            padding: '8px 14px', borderRadius: 9,
            background: on ? 'var(--ink)' : 'var(--white)',
            color:      on ? 'var(--paper)' : 'var(--ink-2)',
            border: '1px solid ' + (on ? 'var(--ink)' : 'var(--rule)'),
            fontSize: 12.5, fontWeight: 500, cursor: 'pointer',
          }}>{k}</span>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 14 }}>
        {/* left: forms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <window.AdmCard title="Datos generales">
            <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                ['Razón social',          'Clínica Roma Norte S.C.'],
                ['RFC',                   'CRN240214MX3'],
                ['Dirección',             'Av. Álvaro Obregón 234, Roma Nte., 06700 CDMX'],
                ['Teléfono principal',    '+52 55 5208 9100'],
                ['Correo de contacto',    'info@clinicaromanorte.mx'],
                ['Sitio web',             'clinicaromanorte.mx'],
              ].map(([k, v], i) => (
                <div key={i} style={{ padding: '12px 14px', background: 'var(--paper)', borderRadius: 'var(--r-md)', gridColumn: i === 2 ? '1 / -1' : 'auto' }}>
                  <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{k}</span>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 12.5, color: 'var(--ink)', marginTop: 4 }}>{v}</div>
                </div>
              ))}
            </div>
          </window.AdmCard>

          <window.AdmCard title="Políticas de la clínica">
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                ['Confirmar citas automáticamente 24 h antes', true,  'whatsapp + correo'],
                ['Permitir reagendar en línea',                true,  'hasta 4 h antes'],
                ['Receta electrónica obligatoria',             true,  'NOM-024 conformidad'],
                ['Solicitar contacto de emergencia al vincular', true,  'paciente puede omitir'],
                ['Compartir expediente con otras clínicas',    false, 'sólo si el paciente lo autoriza'],
                ['Encuesta de satisfacción tras consulta',     true,  'CSAT corto · 1 pregunta'],
              ].map(([k, on, sub], i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 44px', alignItems: 'center', padding: '12px 14px', background: 'var(--paper)', borderRadius: 'var(--r-md)' }}>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 500 }}>{k}</div>
                    <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 2 }}>{sub}</div>
                  </div>
                  <span style={{ width: 36, height: 22, borderRadius: 99, background: on ? 'var(--accent-bright)' : 'var(--rule)', position: 'relative' }}>
                    <span style={{ position: 'absolute', top: 2, left: on ? 16 : 2, width: 18, height: 18, borderRadius: 99, background: '#fff' }} />
                  </span>
                </div>
              ))}
            </div>
          </window.AdmCard>

          <window.AdmCard title="Sucursales · 1">
            <div style={{ padding: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr auto', gap: 12, alignItems: 'center', padding: '14px 16px', background: 'var(--paper)', borderRadius: 'var(--r-md)' }}>
                <span style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--paper-3)', color: 'var(--accent-deep)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <window.AdmIcon kind="pin" size={16} />
                </span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>Sucursal principal · Roma Nte.</div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>Av. Álvaro Obregón 234 · CDMX · 6 consultorios</div>
                </div>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, padding: '3px 8px', borderRadius: 999, background: 'var(--paper-3)', color: 'var(--accent-deep)', letterSpacing: '0.08em' }}>PRINCIPAL</span>
              </div>
              <button className="btn sm ghost block" style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}>
                <window.AdmIcon kind="plus" size={13} /> Agregar sucursal
              </button>
            </div>
          </window.AdmCard>
        </div>

        {/* right: branding + plan */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <window.AdmCard title="Marca · logotipo y color">
            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{ width: 96, height: 96, borderRadius: 'var(--r-lg)', background: 'var(--paper-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 36, color: 'var(--accent-deep)' }}>CR</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>Logotipo de la clínica</div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 4, lineHeight: 1.4 }}>Aparece en recetas, validaciones e invitaciones.</div>
                  <button className="btn sm ghost" style={{ marginTop: 10 }}>Subir nuevo logo</button>
                </div>
              </div>
              <div style={{ marginTop: 18 }}>
                <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Color principal</span>
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  {['#0096C7', '#03045E', '#1C8C5A', '#B83232', '#C97A12'].map((c, i) => (
                    <span key={c} style={{
                      width: 32, height: 32, borderRadius: 9, background: c,
                      border: i === 0 ? '3px solid var(--ink)' : '2px solid var(--rule)',
                      cursor: 'pointer',
                    }} />
                  ))}
                </div>
              </div>
            </div>
          </window.AdmCard>

          <window.AdmCard title="Plan y cuota">
            <div style={{ padding: 20 }}>
              <div style={{ background: 'var(--ink)', color: 'var(--paper)', padding: '18px 20px', borderRadius: 'var(--r-md)' }}>
                <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Plan actual</span>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 32, marginTop: 4 }}>Pro</div>
                <div className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 6 }}>
                  hasta 30 médicos · 5 000 pacientes · OCR ilimitado
                </div>
                <button className="btn sm" style={{ marginTop: 14, background: 'var(--accent-bright)', borderColor: 'var(--accent-bright)', color: 'var(--ink)' }}>
                  Subir a Enterprise →
                </button>
              </div>
              <div style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12.5 }}>Almacenamiento</span>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>142 GB / 1 TB · 14%</span>
                </div>
                <div style={{ width: '100%', height: 8, background: 'var(--paper)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: '14%', height: '100%', background: 'var(--accent-bright)', borderRadius: 4 }} />
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12.5 }}>Médicos</span>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>18 / 30</span>
                </div>
                <div style={{ width: '100%', height: 8, background: 'var(--paper)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: '60%', height: '100%', background: 'var(--accent-bright)', borderRadius: 4 }} />
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12.5 }}>Pacientes</span>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>1 044 / 5 000</span>
                </div>
                <div style={{ width: '100%', height: 8, background: 'var(--paper)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: '21%', height: '100%', background: 'var(--accent-bright)', borderRadius: 4 }} />
                </div>
              </div>
            </div>
          </window.AdmCard>

          <div style={{ padding: '14px 18px', background: 'var(--alert-soft)', border: '1px solid var(--alert-rule)', borderRadius: 'var(--r-md)' }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--alert)' }}>Zona peligrosa</div>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 4 }}>Pausar clínica · transferir titularidad · cerrar institución</div>
            <button className="btn sm ghost" style={{ marginTop: 10, color: 'var(--alert)', borderColor: 'var(--alert-rule)' }}>Abrir panel →</button>
          </div>
        </div>
      </div>
    </window.AdmPage>
  );
}

// ─── 4 · Perfil del director ─────────────────────────────────
function DirProfileScreen() {
  return (
    <window.AdmPage
      label="AS · Director · Perfil"
      nav={DIR_NAV_2} active={7} role="Director" who={DIR_WHO_2} accent="accent-bright"
      title="Mi cuenta" sub="Director general · Clínica Roma Norte"
      searchHint=""
      height={1080}
      right={<button className="btn sm ghost" style={{ height: 42, borderRadius: 'var(--r-md)' }}><window.AdmIcon kind="edit" size={13} /> Editar</button>}
    >
      <div style={{ background: 'var(--ink)', color: 'var(--paper)', borderRadius: 'var(--r-xl)', padding: '28px 32px', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 40px -20px rgba(3,4,94,0.5)' }}>
        <div style={{ position: 'absolute', width: 360, height: 360, borderRadius: 999, background: 'radial-gradient(circle, rgba(0,180,216,0.28) 0%, transparent 70%)', top: -120, right: -90 }} />
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 24, alignItems: 'center' }}>
          <span style={{ width: 96, height: 96, borderRadius: 24, background: 'var(--accent-bright)', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 48 }}>RC</span>
          <div>
            <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Director general · institution_admin</span>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 44, lineHeight: 1, letterSpacing: '-0.02em', marginTop: 8 }}>Lic. Renata Coria</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10, color: 'rgba(255,255,255,0.7)', fontSize: 13.5 }}>
              <span>rcoria@clinicaromanorte.mx</span>
              <span style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.2)' }} />
              <span>Clínica Roma Norte</span>
              <span style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.2)' }} />
              <span className="mono">desde feb 2024</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 18 }}>
        <window.AdmCard title="Datos personales">
          <div style={{ padding: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              ['Nombre legal', 'Renata Coria Bermúdez'],
              ['Cargo', 'Director general'],
              ['Teléfono', '+52 55 7711 4422'],
              ['Correo', 'rcoria@clinicaromanorte.mx'],
              ['Idioma', 'Español (MX)'],
              ['Zona horaria', 'America/Mexico_City'],
            ].map(([k, v], i) => (
              <div key={i} style={{ padding: '10px 12px', background: 'var(--paper)', borderRadius: 'var(--r-md)' }}>
                <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{k}</span>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 12.5, color: 'var(--ink)', marginTop: 4 }}>{v}</div>
              </div>
            ))}
          </div>
        </window.AdmCard>

        <window.AdmCard title="Permisos en la institución">
          <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              ['Invitar y dar de baja médicos', true],
              ['Crear y administrar secretarias', true],
              ['Asignar pacientes a la clínica',  true],
              ['Editar políticas y plan',         true],
              ['Acceso al panel de auditoría',    true],
              ['Eliminar la institución',         false, 'sólo superadmin'],
            ].map(([k, on, sub], i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 44px', alignItems: 'center', padding: '10px 14px', background: 'var(--paper)', borderRadius: 'var(--r-md)' }}>
                <div>
                  <div style={{ fontSize: 12.5 }}>{k}</div>
                  {sub && <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 2 }}>{sub}</div>}
                </div>
                <span style={{ width: 36, height: 22, borderRadius: 99, background: on ? 'var(--accent-bright)' : 'var(--rule)', position: 'relative', opacity: sub ? 0.4 : 1 }}>
                  <span style={{ position: 'absolute', top: 2, left: on ? 16 : 2, width: 18, height: 18, borderRadius: 99, background: '#fff' }} />
                </span>
              </div>
            ))}
          </div>
        </window.AdmCard>

        <window.AdmCard title="Seguridad">
          <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              ['Contraseña', 'cambiada hace 12 d', 'editar'],
              ['Autenticación 2FA', 'activa · SMS', 'cambiar a TOTP'],
              ['Sesiones activas', '1 · MacBook · oficina', 'cerrar otras'],
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

        <window.AdmCard title="Notificaciones">
          <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              ['Médico aceptó / rechazó invitación', true],
              ['Cédula vencida o por vencer',        true],
              ['Alertas de cuota mensual',           true],
              ['Reportes semanales por correo',      false],
              ['Avisos del producto imedexp',        true],
            ].map(([k, on], i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 44px', alignItems: 'center', padding: '10px 14px', background: 'var(--paper)', borderRadius: 'var(--r-md)' }}>
                <span style={{ fontSize: 12.5 }}>{k}</span>
                <span style={{ width: 36, height: 22, borderRadius: 99, background: on ? 'var(--accent-bright)' : 'var(--rule)', position: 'relative' }}>
                  <span style={{ position: 'absolute', top: 2, left: on ? 16 : 2, width: 18, height: 18, borderRadius: 99, background: '#fff' }} />
                </span>
              </div>
            ))}
          </div>
        </window.AdmCard>
      </div>
    </window.AdmPage>
  );
}

Object.assign(window, { DirPatientsScreen, DirDoctorDetailScreen, DirSettingsScreen, DirProfileScreen });
