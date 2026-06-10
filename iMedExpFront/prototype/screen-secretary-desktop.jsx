// imedexp · Secretaria · PC
// Endpoints cubiertos:
//   POST /api/v1/patient-institution/        — vincular paciente a clínica
//   GET  /api/v1/patient-institution/{patient_id}
//   POST /api/v1/emergency-contacts/{patient_id}
//   POST /api/v1/appointments/  (creación por staff)
// Pantallas:
//   SecReceptionScreen — recepción del día (mostrador)
//   SecLinkScreen      — vincular paciente a institución

const SEC_NAV = [
  ['home',   'Recepción'],
  ['users',  'Pacientes',     '1 044'],
  ['cal',    'Agenda',        '38'],
  ['link',   'Vincular',      '2'],
  ['phone',  'Contactos'],
  ['user',   'Perfil'],
];
const SEC_WHO = ['M. E. Vargas', 'MV', 'secretaria · roma norte'];

// ─── 1 · Recepción ─────────────────────────────────────────────
function SecReceptionScreen() {
  const queue = [
    { time: '09:15', name: 'Roberto Aguilar',     dr: 'Dr. Vega',     reason: 'Pre-qx hernia', state: 'esperando', for: '12 min' },
    { time: '09:30', name: 'Mariana Ovalle',      dr: 'Dr. Vega',     reason: 'Control reflujo', state: 'en consulta' },
    { time: '09:45', name: 'Patricia Lozano',     dr: 'Dra. Padilla', reason: 'Oncología',     state: 'esperando',  for: '4 min' },
    { time: '10:00', name: 'Tomás Beltrán',       dr: 'Dr. Vega',     reason: 'Colelitiasis',  state: 'confirmada' },
    { time: '10:30', name: 'María F. Arellano',   dr: 'Dr. Vega',     reason: '1ª consulta',   state: 'check-in', tag: 'nueva' },
    { time: '11:00', name: 'Diego Salinas',       dr: 'Dra. Padilla', reason: 'Sutura · alta', state: 'confirmada' },
    { time: '11:30', name: 'Carmen Esquivel',     dr: 'Dr. Rendón',   reason: 'Cardio · ECG',  state: 'confirmada' },
    { time: '12:00', name: 'Ana Sofía Cortés',    dr: 'Dr. Vega',     reason: 'Cólico biliar', state: 'confirmada' },
  ];
  const todo = [
    ['Vincular paciente', 'Luis Ramírez Téllez · 1ª consulta hoy', 'link', 'urgente'],
    ['Confirmar cita',    'Patricia Lozano · sem. 22',             'phone', 'medio'],
    ['Cargar contacto',   'Carmen Esquivel · sin emergencia',      'phone', 'medio'],
    ['Reagendar',         'Tomás Beltrán · pidió cambio 16h',       'cal',  'medio'],
  ];
  return (
    <window.AdmPage
      label="AD · Secretaria · Recepción"
      nav={SEC_NAV} active={0} role="Secretaria" who={SEC_WHO} accent="accent-bright"
      title="Recepción · jueves 14 may" sub="3 médicos · 38 citas hoy · 5 sin confirmar"
      searchHint="Buscar paciente, CURP, cita…"
      height={1140}
      right={<button className="btn sm" style={{ height: 42, borderRadius: 'var(--r-md)' }}><window.AdmIcon kind="plus" size={14} color="#fff" /> Agendar cita</button>}
    >
      {/* hero stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 12 }}>
        <div style={{ background: 'var(--ink)', color: 'var(--paper)', borderRadius: 'var(--r-xl)', padding: '22px 24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', width: 280, height: 280, borderRadius: 999, background: 'radial-gradient(circle, rgba(0,180,216,0.32) 0%, transparent 70%)', top: -100, right: -80 }} />
          <div style={{ position: 'relative' }}>
            <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Próximo en la sala</span>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 36, lineHeight: 1.05, letterSpacing: '-0.02em', marginTop: 8 }}>
              Roberto Aguilar
            </h2>
            <div className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>
              09:15 · Dr. Vega · pre-qx hernia · esperando 12 min
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
              <button style={{ height: 38, padding: '0 18px', borderRadius: 'var(--r-md)', background: 'var(--accent-bright)', color: 'var(--ink)', border: 0, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                Pasar al consultorio <window.AdmIcon kind="arrow" size={13} color="var(--ink)" />
              </button>
              <button className="btn sm dark-ghost" style={{ height: 38 }}>Aviso al médico</button>
            </div>
          </div>
        </div>
        <window.AdmStat k="En sala" n="2" sub="prom. espera 9 min" />
        <window.AdmStat k="Por confirmar" n="5" sub="2 sin teléfono" tone="alert" />
        <window.AdmStat k="Atendidas hoy" n="11" sub="3 en consulta" />
      </div>

      {/* 2col: queue + todo */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14, marginTop: 18 }}>
        {/* queue */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--rule-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 15, fontWeight: 500 }}>Citas del día</h3>
            <div style={{ display: 'flex', gap: 6 }}>
              {[['Todas', 38, true], ['Dr. Vega', 14], ['Dra. Padilla', 13], ['Dr. Rendón', 11]].map(([k, n, on]) => (
                <window.AdmPill key={k} on={on} count={n}>{k}</window.AdmPill>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '52px 1.6fr 1fr 1fr 100px', padding: '12px 20px', borderBottom: '1px solid var(--rule-2)', fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            <span>Hora</span><span>Paciente</span><span>Médico</span><span>Motivo</span><span>Estado</span>
          </div>
          {queue.map((q, i) => {
            const tone = q.state === 'esperando' ? 'alert' : q.state === 'en consulta' ? 'ok' : q.state === 'check-in' ? 'accent' : 'plain';
            return (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '52px 1.6fr 1fr 1fr 100px',
                padding: '13px 20px', alignItems: 'center',
                borderBottom: i < queue.length - 1 ? '1px solid var(--rule-3)' : 0,
                background: tone === 'accent' ? 'var(--paper-3)' : 'transparent',
              }}>
                <span className="mono" style={{ fontSize: 12, color: 'var(--ink-2)', fontWeight: 500 }}>{q.time}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--paper-4)', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500 }}>
                    {q.name.split(' ').map(s => s[0]).slice(0, 2).join('')}
                  </span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {q.name}
                      {q.tag && <span style={{ fontFamily: 'var(--mono)', fontSize: 9, padding: '2px 6px', borderRadius: 4, background: 'var(--accent-bright)', color: 'var(--ink)', letterSpacing: '0.06em' }}>{q.tag.toUpperCase()}</span>}
                    </div>
                    {q.for && <div className="mono" style={{ fontSize: 10, color: 'var(--alert)', marginTop: 2 }}>esperando {q.for}</div>}
                  </div>
                </div>
                <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-2)' }}>{q.dr}</span>
                <span style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>{q.reason}</span>
                <span style={{
                  fontFamily: 'var(--mono)', fontSize: 9.5, padding: '3px 8px', borderRadius: 999,
                  background: tone === 'alert' ? 'var(--alert-soft)' : tone === 'ok' ? '#E5F5EE' : tone === 'accent' ? 'var(--accent-bright)' : 'var(--paper-3)',
                  color:      tone === 'alert' ? 'var(--alert)' : tone === 'ok' ? 'var(--ok)' : tone === 'accent' ? 'var(--ink)' : 'var(--accent-deep)',
                  letterSpacing: '0.08em', textTransform: 'uppercase', width: 'fit-content',
                }}>{q.state}</span>
              </div>
            );
          })}
        </div>

        {/* todo + quick actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--rule-2)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 500 }}>Pendientes</h3>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>4 tareas · 1 urgente</div>
            </div>
            {todo.map(([t, sub, icon, prio], i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '36px 1fr auto', gap: 12, alignItems: 'center', padding: '13px 20px', borderBottom: i < todo.length - 1 ? '1px solid var(--rule-3)' : 0 }}>
                <span style={{
                  width: 32, height: 32, borderRadius: 9,
                  background: prio === 'urgente' ? 'var(--alert-soft)' : 'var(--paper-3)',
                  color:      prio === 'urgente' ? 'var(--alert)' : 'var(--accent-deep)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <window.AdmIcon kind={icon} size={14} />
                </span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{t}</div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>{sub}</div>
                </div>
                <window.AdmIcon kind="chev" size={14} color="var(--ink-3)" />
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--paper-3)', border: '1px solid var(--accent-rule)', borderRadius: 'var(--r-xl)', padding: 18 }}>
            <span className="eyebrow">Acción rápida</span>
            <h3 style={{ fontSize: 16, fontWeight: 500, marginTop: 6 }}>Vincular paciente nuevo</h3>
            <p className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 6, lineHeight: 1.5 }}>
              Busca por CURP o crea expediente local en la clínica.
            </p>
            <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
              <button className="btn sm" style={{ flex: 1, justifyContent: 'center' }}>
                <window.AdmIcon kind="link" size={13} color="#fff" /> Vincular
              </button>
              <button className="btn sm ghost" style={{ flex: 1, justifyContent: 'center' }}>
                <window.AdmIcon kind="scan" size={13} /> Escanear QR
              </button>
            </div>
          </div>
        </div>
      </div>
    </window.AdmPage>
  );
}

// ─── 2 · Vincular paciente ─────────────────────────────────────
function SecLinkScreen() {
  const found = {
    name: 'Luis Ramírez Téllez', age: 29, sex: 'M',
    curp: 'RATL97052010H', email: 'l.ramirez.tellez@gmail.com',
    phone: '+52 55 1234 5678',
    inst: ['Clínica Polanco', 'Hospital ABC'],
  };
  return (
    <window.AdmPage
      label="AE · Secretaria · Vincular paciente"
      nav={SEC_NAV} active={3} role="Secretaria" who={SEC_WHO} accent="accent-bright"
      title="Vincular paciente a la clínica" sub="POST /api/v1/patient-institution/"
      searchHint="Buscar por CURP o correo…"
      height={1100}
      right={<button className="btn sm ghost" style={{ height: 42, borderRadius: 'var(--r-md)' }}><window.AdmIcon kind="scan" size={14} /> Escanear QR</button>}
    >
      {/* steps */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 18 }}>
        {[
          ['1', 'Identifica al paciente', true],
          ['2', 'Verifica datos', true],
          ['3', 'Vincula a la clínica', false],
          ['4', 'Contacto de emergencia', false],
        ].map(([n, t, on], i) => (
          <React.Fragment key={n}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                width: 28, height: 28, borderRadius: 99,
                background: on ? 'var(--ink)' : 'var(--white)',
                color: on ? 'var(--paper)' : 'var(--ink-3)',
                border: '1px solid ' + (on ? 'var(--ink)' : 'var(--rule)'),
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 500,
              }}>{n}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: on ? 'var(--ink)' : 'var(--ink-3)' }}>{t}</span>
            </div>
            {i < 3 && <span style={{ flex: 1, height: 1, background: 'var(--rule)' }} />}
          </React.Fragment>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 14 }}>
        {/* main form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* search */}
          <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', padding: '20px 24px' }}>
            <span className="eyebrow">Paso 1 · identifica</span>
            <h3 style={{ fontSize: 16, fontWeight: 500, marginTop: 6 }}>Busca por CURP o correo</h3>
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, height: 48, padding: '0 14px', border: '1.5px solid var(--accent)', background: 'var(--white)', borderRadius: 'var(--r-md)' }}>
                <window.AdmIcon kind="search" size={15} color="var(--accent-deep)" />
                <span style={{ fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--ink)', flex: 1 }}>RATL97052010H</span>
                <span className="mono" style={{ fontSize: 10, color: 'var(--ok)' }}>● 1 resultado</span>
              </div>
              <button className="btn" style={{ height: 48, borderRadius: 'var(--r-md)' }}>Buscar</button>
            </div>
            <div style={{ marginTop: 12, fontSize: 11.5, color: 'var(--ink-3)' }}>
              ¿No lo encuentras? <span style={{ color: 'var(--accent-deep)' }}>Crear expediente nuevo</span> (sólo locales a Clínica Roma Norte)
            </div>
          </div>

          {/* found patient */}
          <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--rule-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="eyebrow">Paso 2 · verifica</span>
                <h3 style={{ fontSize: 16, fontWeight: 500, marginTop: 4 }}>Paciente encontrado</h3>
              </div>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, padding: '3px 8px', borderRadius: 999, background: '#E5F5EE', color: 'var(--ok)', letterSpacing: '0.08em' }}>VERIFICADO</span>
            </div>
            <div style={{ padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ width: 64, height: 64, borderRadius: 18, background: 'var(--accent-bright)', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 28 }}>LR</span>
                <div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 28, lineHeight: 1, letterSpacing: '-0.02em' }}>{found.name}</div>
                  <div className="mono" style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 6 }}>
                    {found.sex} · {found.age} años · CURP {found.curp}
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 18 }}>
                {[
                  ['Correo', found.email, 'mail'],
                  ['Teléfono', found.phone, 'phone'],
                  ['Ya vinculado a', found.inst.join(' · '), 'build'],
                  ['Vacunas registradas', '12 · esquema completo', 'shield-2'],
                ].map(([k, v, ic], i) => (
                  <div key={i} style={{ padding: '12px 14px', background: 'var(--paper)', borderRadius: 'var(--r-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <window.AdmIcon kind={ic} size={12} color="var(--ink-3)" />
                      <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{k}</span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--ink), marginTop: 6' }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* link config */}
          <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', padding: '20px 24px' }}>
            <span className="eyebrow">Paso 3 · vincular</span>
            <h3 style={{ fontSize: 16, fontWeight: 500, marginTop: 4 }}>Configura la vinculación</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
              {[
                ['Médico tratante asignado', 'Dr. Damián Vega Ríos · cirugía general'],
                ['Motivo de vinculación', '1ª consulta · valoración hernia'],
                ['Programa / convenio', 'Particular · sin convenio activo'],
                ['Permisos del expediente', 'Lectura completa · escritura por Dr. Vega'],
              ].map(([k, v], i) => (
                <div key={i} style={{ padding: '12px 14px', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)', background: 'var(--paper)' }}>
                  <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{k}</span>
                  <div style={{ fontSize: 13, color: 'var(--ink)', marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{v}</span>
                    <window.AdmIcon kind="chev-d" size={12} color="var(--ink-3)" />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 }}>
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>El paciente recibirá una notificación de vinculación</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn sm ghost">Cancelar</button>
                <button className="btn sm"><window.AdmIcon kind="link" size={13} color="#fff" /> Vincular paciente</button>
              </div>
            </div>
          </div>
        </div>

        {/* aside */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* emergency contact */}
          <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--rule-2)' }}>
              <span className="eyebrow">Paso 4 · opcional</span>
              <h3 style={{ fontSize: 15, fontWeight: 500, marginTop: 4 }}>Contacto de emergencia</h3>
            </div>
            <div style={{ padding: 18 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  ['Nombre', 'Carla Téllez Aguilar'],
                  ['Parentesco', 'Madre'],
                  ['Teléfono', '+52 55 9876 5432'],
                  ['Correo (opcional)', '—'],
                ].map(([k, v], i) => (
                  <div key={i} style={{ padding: '10px 12px', background: 'var(--paper)', borderRadius: 'var(--r-md)' }}>
                    <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{k}</span>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 12.5, color: 'var(--ink)', marginTop: 4 }}>{v}</div>
                  </div>
                ))}
              </div>
              <button className="btn sm ghost block" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>
                <window.AdmIcon kind="plus" size={13} /> Agregar otro contacto
              </button>
            </div>
          </div>

          {/* warning */}
          <div style={{ background: 'var(--ink)', color: 'var(--paper)', borderRadius: 'var(--r-xl)', padding: 20, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: 999, background: 'radial-gradient(circle, rgba(0,180,216,0.28) 0%, transparent 70%)', top: -80, right: -60 }} />
            <div style={{ position: 'relative' }}>
              <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Recuerda</span>
              <h4 style={{ fontFamily: 'var(--serif)', fontSize: 20, marginTop: 6, lineHeight: 1.15 }}>El paciente sigue siendo dueño<br />de su expediente</h4>
              <p className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 10, lineHeight: 1.55 }}>
                Vincular sólo da acceso a esta clínica. El paciente puede revocarlo en su app cuando quiera.
              </p>
            </div>
          </div>
        </div>
      </div>
    </window.AdmPage>
  );
}

Object.assign(window, { SecReceptionScreen, SecLinkScreen });
