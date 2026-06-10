// imedexp · Secretaria · móvil
// 5 pantallas: Recepción · Pacientes · Agenda · Vincular · Perfil

const SEC_TABS_M = [
  ['home',   'Recep.'],
  ['users',  'Pac.'],
  ['cal',    'Agenda'],
  ['link',   'Vincular'],
  ['user',   'Perfil'],
];
const SECdev = ({ children }) => <window.IOSDevice width={390} height={844} title="imedexp">{children}</window.IOSDevice>;

// ─── 1 · Recepción ─────────────────────────────────────────────
function SecReceptionMobile() {
  const queue = [
    { t: '09:15', n: 'Roberto Aguilar',    dr: 'Dr. Vega',     state: 'esperando', for: '12 min' },
    { t: '09:30', n: 'Mariana Ovalle',     dr: 'Dr. Vega',     state: 'en consulta' },
    { t: '09:45', n: 'Patricia Lozano',    dr: 'Dra. Padilla', state: 'esperando', for: '4 min' },
    { t: '10:00', n: 'Tomás Beltrán',      dr: 'Dr. Vega',     state: 'confirmada' },
    { t: '10:30', n: 'María F. Arellano',  dr: 'Dr. Vega',     state: 'check-in', tag: 'NUEVA' },
    { t: '11:00', n: 'Diego Salinas',      dr: 'Dra. Padilla', state: 'confirmada' },
    { t: '11:30', n: 'Carmen Esquivel',    dr: 'Dr. Rendón',   state: 'confirmada' },
  ];
  const toneFor = (s) => s === 'esperando' ? 'alert' : s === 'en consulta' ? 'ok' : s === 'check-in' ? 'accent' : 'plain';
  return (
    <div data-screen-label="AD₂ · Secretaria · Recepción (móvil)">
      <SECdev>
        <window.MbFrame tabs={SEC_TABS_M} active={0}
          fab={<window.MbFAB icon="plus" label="Agendar" />}>
          <window.MbTop sub="jue 14 may · 3 médicos · 38 citas hoy" title="Recepción" />
          {/* hero: próximo */}
          <div style={{ padding: '14px 20px 0' }}>
            <div style={{ background: 'var(--ink)', color: 'var(--paper)', borderRadius: 'var(--r-lg)', padding: 18, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', width: 220, height: 220, borderRadius: 999, background: 'radial-gradient(circle, rgba(0,180,216,0.32) 0%, transparent 70%)', top: -80, right: -60 }} />
              <div style={{ position: 'relative' }}>
                <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Próximo en la sala</span>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: 26, lineHeight: 1.05, marginTop: 6 }}>Roberto Aguilar</h2>
                <div className="mono" style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.65)', marginTop: 8 }}>
                  09:15 · Dr. Vega · esperando 12 min
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                  <button style={{ flex: 1, height: 36, padding: '0 12px', borderRadius: 9, background: 'var(--accent-bright)', color: 'var(--ink)', border: 0, fontSize: 12, fontWeight: 600 }}>Pasar al consultorio</button>
                  <button style={{ width: 36, height: 36, borderRadius: 9, background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.25)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <window.MbIcon kind="phone" size={14} color="#fff" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div style={{ padding: '14px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <window.MbStat k="En sala" n="2" sub="prom. 9 min" />
            <window.MbStat k="Sin confirmar" n="5" sub="2 sin tel." tone="alert" />
            <window.MbStat k="Atendidas" n="11" sub="3 en curso" />
          </div>

          <window.MbSection title="Citas del día" action="Ver →">
            {queue.map((q, i) => {
              const tone = toneFor(q.state);
              return (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '52px 1fr auto', gap: 10, alignItems: 'center', padding: '12px 14px', background: tone === 'accent' ? 'var(--paper-3)' : 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)', marginBottom: 6 }}>
                  <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-2)', fontWeight: 500 }}>{q.t}</span>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {q.n}
                      {q.tag && <span style={{ fontFamily: 'var(--mono)', fontSize: 8.5, padding: '2px 5px', borderRadius: 4, background: 'var(--accent-bright)', color: 'var(--ink)', letterSpacing: '0.06em' }}>{q.tag}</span>}
                    </div>
                    <div className="mono" style={{ fontSize: 10, color: q.for ? 'var(--alert)' : 'var(--ink-3)', marginTop: 2 }}>
                      {q.dr}{q.for ? ` · esperando ${q.for}` : ''}
                    </div>
                  </div>
                  <span style={{
                    fontFamily: 'var(--mono)', fontSize: 9, padding: '3px 7px', borderRadius: 999,
                    background: tone === 'alert' ? 'var(--alert-soft)' : tone === 'ok' ? '#E5F5EE' : tone === 'accent' ? 'var(--accent-bright)' : 'var(--paper-3)',
                    color:      tone === 'alert' ? 'var(--alert)' : tone === 'ok' ? 'var(--ok)' : tone === 'accent' ? 'var(--ink)' : 'var(--accent-deep)',
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                  }}>{q.state}</span>
                </div>
              );
            })}
          </window.MbSection>
          <div style={{ height: 20 }} />
        </window.MbFrame>
      </SECdev>
    </div>
  );
}

// ─── 2 · Pacientes ────────────────────────────────────────────
function SecPatientsMobile() {
  const list = [
    ['María F. Arellano', 'Dr. Vega',     'hoy 10:30', true],
    ['Carlos Mendoza',    'Dr. Vega',     '—',         true],
    ['Patricia Lozano',   'Dra. Padilla', 'sem. 22',   true],
    ['José L. Padilla',   'Dr. Vega',     'hoy 11:15', false],
    ['Ana S. Cortés',     'Dr. Vega',     'hoy 12:00', true],
    ['Luis Ramírez',      'Dr. Vega',     'hoy 14:00', false],
    ['Roberto Aguilar',   'Dr. Vega',     '21 may',    true],
    ['Sofía Hernández',   'Dra. Padilla', '18 may',    true],
  ];
  return (
    <div data-screen-label="AT₂ · Secretaria · Pacientes (móvil)">
      <SECdev>
        <window.MbFrame tabs={SEC_TABS_M} active={1}
          fab={<window.MbFAB icon="plus" label="Vincular" />}>
          <window.MbTop sub="1 044 expedientes · 38 nuevos" title="Pacientes" />
          <div style={{ padding: '12px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <window.MbStat k="Con cita esta sem" n="124" sub="38 hoy" />
            <window.MbStat k="Sin emergencia" n="36" sub="recuérdales" tone="alert" />
          </div>
          <div style={{ padding: '12px 20px 0', display: 'flex', gap: 6, overflowX: 'auto' }}>
            {[['Todos', '1 044', true], ['Hoy', 38], ['Sin emerg.', 36, false, 'alert'], ['Dr. Vega', 318]].map(([k, n, on, tone]) => (
              <window.MbPill key={k} on={on} count={n} tone={tone}>{k}</window.MbPill>
            ))}
          </div>
          <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {list.map(([n, dr, next, emerg], i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '34px 1fr auto', gap: 10, alignItems: 'center', padding: '12px 14px', background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)' }}>
                <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--paper-4)', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500 }}>
                  {n.split(' ').map(s => s[0]).slice(0, 2).join('')}
                </span>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {n}
                    {!emerg && <span style={{ fontFamily: 'var(--mono)', fontSize: 8.5, padding: '2px 5px', borderRadius: 4, background: 'var(--alert-soft)', color: 'var(--alert)', letterSpacing: '0.06em' }}>SIN EMERG</span>}
                  </div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{dr}</div>
                </div>
                <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>{next}</span>
              </div>
            ))}
          </div>
        </window.MbFrame>
      </SECdev>
    </div>
  );
}

// ─── 3 · Agenda (vista día en móvil) ───────────────────────────
function SecAgendaMobile() {
  const day = [
    { t: '08:30', n: 'A. Vidal',     dr: 'Rendón',   state: 'ok' },
    { t: '09:00', n: 'I. Morales',   dr: 'Rendón',   state: 'ok' },
    { t: '09:00', n: 'C. Mendoza',   dr: 'Vega',     state: 'ok' },
    { t: '09:45', n: 'P. Lozano',    dr: 'Padilla',  state: 'ok' },
    { t: '10:30', n: 'M. Arellano',  dr: 'Vega',     state: 'next', tag: 'NUEVA' },
    { t: '11:00', n: 'OR · hernia',  dr: 'Vega',     state: 'or' },
    { t: '11:15', n: 'J. Padilla',   dr: 'Vega',     state: 'ok' },
    { t: '12:00', n: 'A. Cortés',    dr: 'Vega',     state: 'ok' },
    { t: '14:00', n: 'L. Ramírez',   dr: 'Vega',     state: 'new' },
    { t: '14:30', n: 'D. Reyes',     dr: 'Padilla',  state: 'unconf' },
    { t: '15:30', n: 'E. Castaño',   dr: 'Padilla',  state: 'unconf' },
  ];
  const stateColor = {
    ok:        { bg: 'var(--paper-3)',      fg: 'var(--accent-deep)', br: 'var(--accent-rule)' },
    next:      { bg: 'var(--accent-bright)',fg: 'var(--ink)',          br: 'var(--accent)' },
    new:       { bg: '#E5F5EE',              fg: 'var(--ok)',           br: '#BFE3CF' },
    or:        { bg: 'var(--ink)',           fg: '#fff',                br: 'var(--ink)' },
    unconf:    { bg: 'var(--alert-soft)',    fg: 'var(--alert)',        br: 'var(--alert-rule)' },
  };
  return (
    <div data-screen-label="AU₂ · Secretaria · Agenda (móvil)">
      <SECdev>
        <window.MbFrame tabs={SEC_TABS_M} active={2}
          fab={<window.MbFAB icon="plus" label="Nueva cita" />}>
          <window.MbTop sub="jueves 14 may · sem. 20" title="Agenda" />
          {/* week scrubber */}
          <div style={{ padding: '12px 20px 0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
              {[
                ['lun', 11], ['mar', 12], ['mié', 13], ['jue', 14, true], ['vie', 15], ['sáb', 16], ['dom', 17],
              ].map(([d, n, today], i) => (
                <div key={i} style={{
                  padding: '8px 0', borderRadius: 9,
                  background: today ? 'var(--ink)' : 'var(--white)',
                  color: today ? 'var(--paper)' : 'var(--ink-2)',
                  border: '1px solid ' + (today ? 'var(--ink)' : 'var(--rule)'),
                  textAlign: 'center',
                }}>
                  <div className="mono" style={{ fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.7 }}>{d}</div>
                  <div style={{ fontSize: 16, fontWeight: 500, marginTop: 2 }}>{n}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, display: 'flex', gap: 6, overflowX: 'auto' }}>
              {[['Todos', null, true], ['Vega', 'var(--accent-deep)'], ['Padilla', 'var(--mid)'], ['Rendón', 'var(--ok)']].map(([k, c, on]) => (
                <span key={k} style={{
                  padding: '5px 10px', borderRadius: 999, fontSize: 11, fontWeight: 500,
                  background: on ? 'var(--ink)' : 'var(--white)',
                  color:      on ? 'var(--paper)' : 'var(--ink-2)',
                  border: '1px solid ' + (on ? 'var(--ink)' : 'var(--rule)'),
                  display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap',
                }}>{c && <span style={{ width: 7, height: 7, borderRadius: 99, background: c }} />}Dr. {k}</span>
              ))}
            </div>
          </div>

          <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {day.map((e, i) => {
              const c = stateColor[e.state];
              return (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '60px 1fr',
                  background: c.bg, color: c.fg,
                  border: '1px solid ' + c.br,
                  borderRadius: 'var(--r-md)', overflow: 'hidden',
                }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 12, padding: '12px 0', textAlign: 'center', fontWeight: 500, borderRight: '1px solid rgba(0,0,0,0.05)' }}>{e.t}</span>
                  <div style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{e.n}</span>
                      {e.tag && <span style={{ fontFamily: 'var(--mono)', fontSize: 8.5, padding: '2px 5px', borderRadius: 4, background: 'rgba(0,0,0,0.12)', letterSpacing: '0.06em' }}>{e.tag}</span>}
                    </div>
                    <div className="mono" style={{ fontSize: 10, opacity: 0.75, marginTop: 2 }}>Dr. {e.dr}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </window.MbFrame>
      </SECdev>
    </div>
  );
}

// ─── 4 · Vincular paciente ─────────────────────────────────────
function SecLinkMobile() {
  return (
    <div data-screen-label="AE₂ · Secretaria · Vincular (móvil)">
      <SECdev>
        <window.MbFrame tabs={SEC_TABS_M} active={3}>
          <window.MbTop sub="POST /patient-institution/" title="Vincular paciente" />
          {/* steps */}
          <div style={{ padding: '12px 20px 0', display: 'flex', gap: 6 }}>
            {[1, 2, 3, 4].map((n) => (
              <span key={n} style={{
                flex: 1, height: 6, borderRadius: 99,
                background: n <= 2 ? 'var(--ink)' : 'var(--rule)',
              }} />
            ))}
          </div>
          <div style={{ padding: '6px 20px 0' }}>
            <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Paso 2 de 4 · verificar</span>
          </div>

          {/* search */}
          <div style={{ padding: '14px 20px 0' }}>
            <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', padding: 14 }}>
              <h3 style={{ fontSize: 14, fontWeight: 500 }}>Identifica por CURP</h3>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, height: 42, padding: '0 12px', border: '1.5px solid var(--accent)', borderRadius: 'var(--r-md)' }}>
                  <window.MbIcon kind="search" size={14} color="var(--accent-deep)" />
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink)' }}>RATL97052010H</span>
                </div>
                <button className="btn sm" style={{ height: 42, borderRadius: 'var(--r-md)' }}>Buscar</button>
              </div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--ok)', marginTop: 8 }}>● 1 resultado encontrado</div>
            </div>
          </div>

          {/* found patient */}
          <div style={{ padding: '14px 20px 0' }}>
            <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--rule-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="eyebrow">Encontrado</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 9, padding: '3px 7px', borderRadius: 999, background: '#E5F5EE', color: 'var(--ok)', letterSpacing: '0.06em' }}>VERIFICADO</span>
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--accent-bright)', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 22 }}>LR</span>
                  <div>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: 22, lineHeight: 1.05 }}>Luis Ramírez Téllez</div>
                    <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 4 }}>M · 29 a · RATL97052010H</div>
                  </div>
                </div>
                <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[['mail', 'l.ramirez.tellez@gmail.com'], ['phone', '+52 55 1234 5678'], ['build', 'C. Polanco · H. ABC']].map(([ic, v], i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'var(--paper)', borderRadius: 8 }}>
                      <window.MbIcon kind={ic} size={12} color="var(--ink-3)" />
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--ink-2)' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* link config */}
          <window.MbSection title="Paso 3 · configurar vinculación">
            {[
              ['Médico tratante', 'Dr. Damián Vega · cirugía'],
              ['Motivo',          '1ª consulta · hernia'],
              ['Permisos',        'Lectura completa · escritura Dr. Vega'],
            ].map(([k, v], i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 14px', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)', marginBottom: 6 }}>
                <div>
                  <span className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{k}</span>
                  <div style={{ fontSize: 12, color: 'var(--ink)', marginTop: 3 }}>{v}</div>
                </div>
                <window.MbIcon kind="chev-d" size={12} color="var(--ink-3)" />
              </div>
            ))}
          </window.MbSection>

          <div style={{ padding: '16px 20px 30px' }}>
            <button className="btn block" style={{ height: 48, justifyContent: 'center', fontSize: 14, borderRadius: 'var(--r-md)' }}>
              <window.MbIcon kind="link" size={14} color="#fff" /> Vincular paciente
            </button>
          </div>
        </window.MbFrame>
      </SECdev>
    </div>
  );
}

// ─── 5 · Perfil de secretaria ─────────────────────────────────
function SecProfileMobile() {
  return (
    <div data-screen-label="AV₂ · Secretaria · Perfil (móvil)">
      <SECdev>
        <window.MbFrame tabs={SEC_TABS_M} active={4}>
          <div style={{ background: 'var(--ink)', color: 'var(--paper)', padding: '16px 22px 22px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', width: 260, height: 260, borderRadius: 999, background: 'radial-gradient(circle, rgba(0,180,216,0.3) 0%, transparent 70%)', top: -90, right: -70 }} />
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 64, height: 64, borderRadius: 18, background: 'var(--accent-bright)', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 28 }}>MV</span>
              <div>
                <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Secretaria · Roma Norte</span>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 24, lineHeight: 1.05, marginTop: 4 }}>M. Estela Vargas</div>
                <div className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>mvargas@romanorte.mx · turno 08–15</div>
              </div>
            </div>
          </div>

          <div style={{ padding: '14px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <window.MbStat k="Pacientes" n="318" sub="3 médicos" />
            <window.MbStat k="Citas / sem" n="142" sub="78% sin reagendar" />
            <window.MbStat k="Vinculaciones · mes" n="14" sub="contactos al 100%" />
            <window.MbStat k="Tiempo check-in" n="3.2 min" sub="mediana" />
          </div>

          <window.MbSection title="Médicos asignados · 3">
            {[
              ['Dr. D. Vega Ríos',  'Cirugía general',  142],
              ['Dra. L. Padilla',   'Med. interna',      96],
              ['Dr. J. Rendón',     'Cardiología',       80],
            ].map(([n, sp, p], i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '36px 1fr auto', gap: 10, alignItems: 'center', padding: '11px 12px', background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)', marginBottom: 6 }}>
                <span style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--paper-3)', color: 'var(--accent-deep)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 13 }}>
                  {n.split(' ').slice(1, 3).map(s => s[0]).join('')}
                </span>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 500 }}>{n}</div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{sp} · {p} pac.</div>
                </div>
                <window.MbIcon kind="chev" size={14} color="var(--ink-3)" />
              </div>
            ))}
          </window.MbSection>

          <window.MbSection title="Permisos">
            {[
              ['Crear y editar citas', true],
              ['Vincular pacientes', true],
              ['Cargar contactos emerg.', true],
              ['Acceso a expediente', false],
              ['Firmar documentos', false],
            ].map(([k, on], i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', padding: '12px 14px', background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)', marginBottom: 6 }}>
                <span style={{ fontSize: 12.5 }}>{k}</span>
                <window.MbSwitch on={on} />
              </div>
            ))}
          </window.MbSection>
          <div style={{ height: 20 }} />
        </window.MbFrame>
      </SECdev>
    </div>
  );
}

Object.assign(window, {
  SecReceptionMobile, SecPatientsMobile, SecAgendaMobile, SecLinkMobile, SecProfileMobile,
});
