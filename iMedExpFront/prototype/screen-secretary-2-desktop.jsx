// imedexp · Secretaria · PC · pantallas extra
// Pacientes (lista completa) · Agenda completa · Perfil

const SEC_NAV_2 = [
  ['home',   'Recepción'],
  ['users',  'Pacientes',     '1 044'],
  ['cal',    'Agenda',        '38'],
  ['link',   'Vincular',      '2'],
  ['phone',  'Contactos'],
  ['user',   'Perfil'],
];
const SEC_WHO_2 = ['M. E. Vargas', 'MV', 'secretaria · roma norte'];

// ─── 1 · Pacientes de la clínica ──────────────────────────────
function SecPatientsScreen() {
  const list = [
    { n: 'María F. Arellano',   age: 34, sex: '♀', phone: '+52 55 4421 9087', dr: 'Dr. Vega',     next: 'hoy 10:30', emerg: true, sel: true },
    { n: 'Carlos Mendoza Vela', age: 58, sex: '♂', phone: '+52 81 3300 1198', dr: 'Dr. Vega',     next: '— ', emerg: true },
    { n: 'Patricia Lozano',     age: 47, sex: '♀', phone: '+52 55 9024 7763', dr: 'Dra. Padilla', next: 'sem. 22',   emerg: true },
    { n: 'José Luis Padilla',   age: 62, sex: '♂', phone: '+52 33 1098 4421', dr: 'Dr. Vega',     next: 'hoy 11:15', emerg: false },
    { n: 'Ana Sofía Cortés',    age: 41, sex: '♀', phone: '+52 55 6788 1290', dr: 'Dr. Vega',     next: 'hoy 12:00', emerg: true },
    { n: 'Luis Ramírez Téllez', age: 29, sex: '♂', phone: '+52 55 1234 5678', dr: 'Dr. Vega',     next: 'hoy 14:00', emerg: false },
    { n: 'Roberto Aguilar',     age: 51, sex: '♂', phone: '+52 55 8421 6655', dr: 'Dr. Vega',     next: '21 may',    emerg: true },
    { n: 'Sofía Hernández',     age: 37, sex: '♀', phone: '+52 55 4099 1182', dr: 'Dra. Padilla', next: '18 may',    emerg: true },
    { n: 'Elena Castaño',       age: 55, sex: '♀', phone: '+52 55 7820 4910', dr: 'Dra. Padilla', next: '4 jun',     emerg: true },
    { n: 'Diego Salinas',       age: 44, sex: '♂', phone: '+52 55 6633 8821', dr: 'Dra. Padilla', next: '—',         emerg: false },
    { n: 'Mariana Ovalle',      age: 33, sex: '♀', phone: '+52 55 2199 4400', dr: 'Dr. Vega',     next: 'oct 26',    emerg: true },
    { n: 'Tomás Beltrán',       age: 67, sex: '♂', phone: '+52 55 8732 1100', dr: 'Dr. Vega',     next: '22 may',    emerg: true },
  ];
  const sel = list[0];
  return (
    <window.AdmPage
      label="AT · Secretaria · Pacientes"
      nav={SEC_NAV_2} active={1} role="Secretaria" who={SEC_WHO_2} accent="accent-bright"
      title="Pacientes de la clínica" sub="1 044 expedientes · 38 nuevos este mes"
      searchHint="Buscar paciente, CURP, teléfono…"
      height={1180}
      right={<button className="btn sm" style={{ height: 42, borderRadius: 'var(--r-md)' }}><window.AdmIcon kind="plus" size={14} color="#fff" /> Vincular nuevo</button>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <window.AdmStat k="Vinculados" n="1 044" sub="+38 este mes" />
        <window.AdmStat k="Con cita esta sem." n="124" sub="38 hoy · 5 por confirmar" />
        <window.AdmStat k="Sin contacto emerg." n="36" sub="recuérdales en recepción" tone="alert" />
        <window.AdmStat k="Sin teléfono" n="4" sub="bloquea recordatorios" />
      </div>

      <div style={{ display: 'flex', gap: 6, marginTop: 18, alignItems: 'center', flexWrap: 'wrap' }}>
        {[['Todos', '1 044', true], ['Con cita hoy', 38], ['Sin emergencia', 36, false, 'alert'], ['Dr. Vega', 318], ['Dra. Padilla', 296], ['Dr. Rendón', 211]].map(([k, n, on, tone]) => (
          <window.AdmPill key={k} on={on} count={n} tone={tone}>{k}</window.AdmPill>
        ))}
        <span style={{ flex: 1 }} />
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>Ordenar: próxima cita ▾</span>
      </div>

      {/* table + side card */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 14, marginTop: 14 }}>
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1.2fr 1fr 40px', padding: '12px 18px', borderBottom: '1px solid var(--rule-2)', fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            <span>Paciente</span><span>Teléfono</span><span>Médico</span><span>Próxima</span><span></span>
          </div>
          {list.map((p, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '2fr 1.2fr 1.2fr 1fr 40px',
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
                  <div style={{ fontSize: 13.5, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {p.n}
                    {!p.emerg && <span style={{ fontFamily: 'var(--mono)', fontSize: 9, padding: '2px 6px', borderRadius: 4, background: 'var(--alert-soft)', color: 'var(--alert)', letterSpacing: '0.06em' }}>SIN EMERG</span>}
                  </div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{p.sex} {p.age}a</div>
                </div>
              </div>
              <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-2)' }}>{p.phone}</span>
              <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-2)' }}>{p.dr}</span>
              <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{p.next}</span>
              <window.AdmIcon kind="more" size={16} color="var(--ink-3)" />
            </div>
          ))}
        </div>

        {/* aside selected */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden', height: 'fit-content' }}>
          <div style={{ padding: '20px 22px', background: 'var(--ink)', color: 'var(--paper)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: 999, background: 'radial-gradient(circle, rgba(0,180,216,0.3) 0%, transparent 70%)', top: -60, right: -50 }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--accent-bright)', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 20 }}>MA</span>
                <div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 22, lineHeight: 1, letterSpacing: '-0.02em' }}>{sel.n}</div>
                  <div className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>{sel.sex} {sel.age}a · {sel.phone}</div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div className="eyebrow" style={{ marginBottom: 4 }}>Citas próximas</div>
            <div style={{ padding: '10px 12px', background: 'var(--paper-3)', border: '1px solid var(--accent-rule)', borderRadius: 'var(--r-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>1ª consulta · Dr. Vega</div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>hoy 10:30 · cons. 712 · en 14 min</div>
                </div>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 9, padding: '3px 8px', borderRadius: 999, background: 'var(--accent-bright)', color: 'var(--ink)', letterSpacing: '0.06em' }}>SIGUE</span>
              </div>
            </div>
            <div style={{ padding: '10px 12px', background: 'var(--paper)', borderRadius: 'var(--r-md)' }}>
              <div style={{ fontSize: 13 }}>Control endocrino</div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>22 may · Dra. Padilla</div>
            </div>

            <div className="eyebrow" style={{ marginTop: 14, marginBottom: 4 }}>Contacto de emergencia</div>
            <div style={{ padding: '10px 12px', background: 'var(--paper)', borderRadius: 'var(--r-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>Eduardo Arellano · padre</div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>+52 55 4421 9087</div>
                </div>
                <button style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--paper-3)', color: 'var(--accent-deep)', border: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <window.AdmIcon kind="phone" size={13} />
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
              <button className="btn sm" style={{ flex: 1, justifyContent: 'center' }}>Agendar</button>
              <button className="btn sm ghost" style={{ flex: 1, justifyContent: 'center' }}>Confirmar cita</button>
            </div>
          </div>
        </div>
      </div>
    </window.AdmPage>
  );
}

// ─── 2 · Agenda completa ──────────────────────────────────────
function SecAgendaScreen() {
  const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  const week = [
    { dow: 'lun', d: 11 }, { dow: 'mar', d: 12 }, { dow: 'mié', d: 13 },
    { dow: 'jue', d: 14, today: true }, { dow: 'vie', d: 15 },
    { dow: 'sáb', d: 16 }, { dow: 'dom', d: 17 },
  ];
  const events = [
    { col: 3, top: 1,   h: 0.8, dr: 'Vega',     n: 'C. Mendoza',  state: 'ok' },
    { col: 3, top: 1.8, h: 0.8, dr: 'Padilla',  n: 'P. Lozano',   state: 'ok' },
    { col: 3, top: 2.5, h: 0.9, dr: 'Vega',     n: 'M. Arellano', state: 'next' },
    { col: 3, top: 3.5, h: 0.8, dr: 'Vega',     n: 'J. Padilla',  state: 'ok' },
    { col: 3, top: 4,   h: 1,   dr: 'Vega',     n: 'A. Cortés',   state: 'ok' },
    { col: 3, top: 6,   h: 1,   dr: 'Vega',     n: 'L. Ramírez',  state: 'new' },
    { col: 4, top: 1,   h: 1,   dr: 'Rendón',   n: 'I. Morales',  state: 'ok' },
    { col: 4, top: 3,   h: 2,   dr: 'Vega',     n: 'OR · hernia', state: 'or' },
    { col: 4, top: 6.5, h: 0.8, dr: 'Padilla',  n: 'D. Reyes',    state: 'ok' },
    { col: 5, top: 1,   h: 1,   dr: 'Vega',     n: 'B. Tinoco',   state: 'ok' },
    { col: 5, top: 2.5, h: 1,   dr: 'Vega',     n: 'P. Aguirre',  state: 'unconfirmed' },
    { col: 0, top: 1.5, h: 1,   dr: 'Padilla',  n: 'M. Aragón',   state: 'ok' },
    { col: 1, top: 1,   h: 1,   dr: 'Vega',     n: 'L. Mejía',    state: 'ok' },
    { col: 1, top: 4,   h: 2,   dr: 'Vega',     n: 'OR · vesícula', state: 'or' },
    { col: 2, top: 0.5, h: 0.8, dr: 'Rendón',   n: 'A. Vidal',    state: 'ok' },
    { col: 2, top: 2,   h: 1,   dr: 'Padilla',  n: 'V. Castaño',  state: 'unconfirmed' },
  ];
  const ROW = 56;
  const stateColor = {
    ok: { bg: 'var(--paper-3)', fg: 'var(--accent-deep)', border: 'var(--accent-rule)' },
    next: { bg: 'var(--accent-bright)', fg: 'var(--ink)', border: 'var(--accent)' },
    new: { bg: '#E5F5EE', fg: 'var(--ok)', border: '#BFE3CF' },
    or: { bg: 'var(--ink)', fg: '#fff', border: 'var(--ink)' },
    unconfirmed: { bg: 'var(--alert-soft)', fg: 'var(--alert)', border: 'var(--alert-rule)' },
  };
  return (
    <window.AdmPage
      label="AU · Secretaria · Agenda"
      nav={SEC_NAV_2} active={2} role="Secretaria" who={SEC_WHO_2} accent="accent-bright"
      title="Agenda · 11 — 17 mayo 2026" sub="Sem. 20 · 3 médicos · 38 citas hoy · 8 sin confirmar"
      searchHint="Buscar paciente, médico…"
      height={1200}
      right={<button className="btn sm" style={{ height: 42, borderRadius: 'var(--r-md)' }}><window.AdmIcon kind="plus" size={14} color="#fff" /> Nueva cita</button>}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button style={{ width: 34, height: 34, borderRadius: 9, border: '1px solid var(--rule)', background: 'var(--white)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><window.AdmIcon kind="chev-l" size={13} color="var(--ink-2)" /></button>
          <button style={{ height: 34, padding: '0 14px', borderRadius: 9, border: '1px solid var(--rule)', background: 'var(--white)', fontSize: 12.5, color: 'var(--ink-2)' }}>Hoy</button>
          <button style={{ width: 34, height: 34, borderRadius: 9, border: '1px solid var(--rule)', background: 'var(--white)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><window.AdmIcon kind="chev" size={13} color="var(--ink-2)" /></button>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[['Todos', null, true], ['Dr. Vega', 'var(--accent-deep)'], ['Dra. Padilla', 'var(--mid)'], ['Dr. Rendón', 'var(--ok)']].map(([k, c, on]) => (
            <span key={k} style={{
              padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500,
              background: on ? 'var(--ink)' : 'var(--white)',
              color:      on ? 'var(--paper)' : 'var(--ink-2)',
              border: '1px solid ' + (on ? 'var(--ink)' : 'var(--rule)'),
              display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
            }}>{c && <span style={{ width: 8, height: 8, borderRadius: 99, background: c }} />}{k}</span>
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '64px repeat(7, 1fr)', borderBottom: '1px solid var(--rule-2)' }}>
          <div />
          {week.map((w, i) => (
            <div key={i} style={{ padding: '14px 12px', background: w.today ? 'var(--paper-3)' : 'transparent', borderLeft: i > 0 ? '1px solid var(--rule-2)' : 0 }}>
              <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{w.dow}</div>
              <div style={{ fontSize: 22, fontWeight: 500, marginTop: 4, letterSpacing: '-0.02em', color: w.today ? 'var(--accent-deep)' : 'var(--ink)' }}>{w.d}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '64px repeat(7, 1fr)', position: 'relative' }}>
          <div>
            {hours.map((h, i) => (
              <div key={i} style={{ height: ROW, padding: '6px 12px', borderTop: i > 0 ? '1px solid var(--rule-3)' : 0 }}>
                <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>{h}</span>
              </div>
            ))}
          </div>
          {week.map((w, ci) => (
            <div key={ci} style={{ position: 'relative', background: w.today ? 'var(--paper-3)' : 'transparent', borderLeft: '1px solid var(--rule-2)' }}>
              {hours.map((_, i) => <div key={i} style={{ height: ROW, borderTop: i > 0 ? '1px solid var(--rule-3)' : 0 }} />)}
              {events.filter(e => e.col === ci).map((e, j) => {
                const c = stateColor[e.state] || stateColor.ok;
                return (
                  <div key={j} style={{
                    position: 'absolute', left: 4, right: 4,
                    top: e.top * ROW + 2, height: e.h * ROW - 4,
                    background: c.bg, color: c.fg,
                    border: '1px solid ' + c.border,
                    borderRadius: 8, padding: '6px 8px',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                    overflow: 'hidden',
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 500 }}>{e.n}</div>
                    <div className="mono" style={{ fontSize: 9.5, opacity: 0.75 }}>{e.dr}</div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, padding: '14px 22px', borderTop: '1px solid var(--rule-2)' }}>
          {[
            ['var(--paper-3)',        'var(--accent-rule)', 'Confirmada'],
            ['var(--accent-bright)',  'var(--accent)',      'Próxima'],
            ['#E5F5EE',               '#BFE3CF',            'Nueva (1ª consulta)'],
            ['var(--alert-soft)',     'var(--alert-rule)',  'Sin confirmar'],
            ['var(--ink)',            'var(--ink)',         'Quirófano'],
          ].map(([bg, b, k], i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: 'var(--ink-2)' }}>
              <span style={{ width: 14, height: 14, borderRadius: 4, background: bg, border: '1px solid ' + b }} />
              {k}
            </span>
          ))}
        </div>
      </div>
    </window.AdmPage>
  );
}

// ─── 3 · Perfil de la secretaria ──────────────────────────────
function SecProfileScreen() {
  return (
    <window.AdmPage
      label="AV · Secretaria · Perfil"
      nav={SEC_NAV_2} active={5} role="Secretaria" who={SEC_WHO_2} accent="accent-bright"
      title="Mi cuenta" sub="Secretaria · Clínica Roma Norte"
      height={1080}
      right={<button className="btn sm ghost" style={{ height: 42, borderRadius: 'var(--r-md)' }}><window.AdmIcon kind="edit" size={13} /> Editar</button>}
    >
      <div style={{ background: 'var(--ink)', color: 'var(--paper)', borderRadius: 'var(--r-xl)', padding: '28px 32px', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 40px -20px rgba(3,4,94,0.5)' }}>
        <div style={{ position: 'absolute', width: 360, height: 360, borderRadius: 999, background: 'radial-gradient(circle, rgba(0,180,216,0.28) 0%, transparent 70%)', top: -120, right: -90 }} />
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 24, alignItems: 'center' }}>
          <span style={{ width: 96, height: 96, borderRadius: 24, background: 'var(--accent-bright)', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 48 }}>MV</span>
          <div>
            <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Secretaria · recepción</span>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 44, lineHeight: 1, letterSpacing: '-0.02em', marginTop: 8 }}>María Estela Vargas</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10, color: 'rgba(255,255,255,0.7)', fontSize: 13.5 }}>
              <span>mvargas@clinicaromanorte.mx</span>
              <span style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.2)' }} />
              <span>3 médicos asignados</span>
              <span style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.2)' }} />
              <span className="mono">desde feb 2024</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 18 }}>
        <window.AdmStat k="Pacientes que atiende" n="318" sub="318 con cita esta sem." />
        <window.AdmStat k="Citas gestionadas / sem" n="142" sub="78% sin reagendar" />
        <window.AdmStat k="Vinculaciones · mes" n="14" sub="contactos cargados al 100%" />
        <window.AdmStat k="Tiempo respuesta" n="3.2 min" sub="mediana de check-in" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 18 }}>
        <window.AdmCard title="Datos personales">
          <div style={{ padding: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              ['Nombre',       'María Estela Vargas Téllez'],
              ['Cargo',        'Secretaria de recepción'],
              ['Teléfono',     '+52 55 4422 1109'],
              ['Correo',       'mvargas@clinicaromanorte.mx'],
              ['Turno',        'Matutino · 08–15'],
              ['Idioma',       'Español (MX)'],
            ].map(([k, v], i) => (
              <div key={i} style={{ padding: '10px 12px', background: 'var(--paper)', borderRadius: 'var(--r-md)' }}>
                <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{k}</span>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 12.5, color: 'var(--ink)', marginTop: 4 }}>{v}</div>
              </div>
            ))}
          </div>
        </window.AdmCard>

        <window.AdmCard title="Médicos a los que apoya · 3">
          <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              ['Dr. Damián Vega Ríos',   'Cirugía general',   142],
              ['Dra. Lorena Padilla',    'Medicina interna',  96],
              ['Dr. Joaquín Rendón',     'Cardiología',       80],
            ].map(([n, sp, pa], i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '40px 1fr auto', gap: 12, alignItems: 'center', padding: '12px 14px', background: 'var(--paper)', borderRadius: 'var(--r-md)' }}>
                <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--paper-3)', color: 'var(--accent-deep)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 14 }}>{n.split(' ').slice(1, 3).map(s => s[0]).join('')}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{n}</div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>{sp} · {pa} pacientes</div>
                </div>
                <span className="mono" style={{ fontSize: 10, color: 'var(--accent-deep)' }}>Ver agenda →</span>
              </div>
            ))}
          </div>
        </window.AdmCard>

        <window.AdmCard title="Permisos">
          <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              ['Crear y editar citas', true],
              ['Vincular pacientes a la clínica', true],
              ['Cargar contactos de emergencia', true],
              ['Confirmar y cancelar citas', true],
              ['Acceso al expediente clínico', false, 'sólo el médico'],
              ['Firmar documentos', false, 'requiere ser médico'],
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

        <window.AdmCard title="Notificaciones">
          <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              ['Paciente llega a recepción', true],
              ['Cita sin confirmar a 24 h',  true],
              ['Cambio en la agenda del médico', true],
              ['Paciente nuevo sin contacto de emergencia', true],
              ['Resumen al final del turno', false],
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

Object.assign(window, { SecPatientsScreen, SecAgendaScreen, SecProfileScreen });
