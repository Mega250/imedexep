// imedexp · Paciente · Extras PC
// Endpoints cubiertos:
//   GET/POST/PATCH/DELETE /api/v1/emergency-contacts/{...}
//   GET/POST/DELETE /api/v1/menstrual-cycles + /patient/{id}/prediction
//   POST /api/v1/qr-access/generate
// Pantallas:
//   PatEmergencyScreen — contactos de emergencia
//   PatCycleScreen     — ciclo menstrual + predicción
//   PatQRScreen        — mi QR de acceso

const PAT_NAV = [
  ['home',   'Inicio'],
  ['doc',    'Historial clínico', '8'],
  ['cal',    'Mis citas', '3'],
  ['heart',  'Ciclo · salud'],
  ['wave',   'Signos vitales'],
  ['phone',  'Emergencia'],
  ['build',  'Mis clínicas', '3'],
  ['bell',   'Avisos', '2'],
  ['qr',     'Mi QR'],
  ['user',   'Mi perfil'],
];
const PAT_WHO = ['M. F. Arellano', 'MA', 'paciente · O+'];

// ─── 1 · Contactos de emergencia ──────────────────────────────
function PatEmergencyScreen() {
  const contacts = [
    {
      name: 'Eduardo Arellano Lara', rel: 'Padre', primary: true,
      phone: '+52 55 4421 9087', email: 'eduardo.arellano@gmail.com',
      city: 'CDMX · Coyoacán', notes: 'Avisar primero a él · sabe del cuadro tiroides',
    },
    {
      name: 'Marisol Fernández',   rel: 'Madre',
      phone: '+52 55 8214 3306', email: 'marisol.fz@gmail.com',
      city: 'CDMX · Coyoacán', notes: 'Trabaja turno nocturno · llamar después de 7 am',
    },
    {
      name: 'Dr. Sergio Mata',      rel: 'Médico de cabecera',
      phone: '+52 55 1290 7741', email: 'dr.smata@gmail.com',
      city: 'CDMX · Roma Norte', notes: 'Endocrinólogo · expediente desde 2019',
    },
  ];
  return (
    <window.AdmPage
      label="AI · Paciente · Emergencia"
      nav={PAT_NAV} active={5} role="Paciente" who={PAT_WHO} accent="accent-bright"
      title="Contactos de emergencia" sub="3 contactos · 1 principal"
      searchHint="Buscar nombre…"
      height={1080}
      right={<button className="btn sm" style={{ height: 42, borderRadius: 'var(--r-md)' }}><window.AdmIcon kind="plus" size={14} color="#fff" /> Agregar contacto</button>}
    >
      {/* hero */}
      <div style={{ background: 'var(--ink)', color: 'var(--paper)', borderRadius: 'var(--r-xl)', padding: '22px 26px', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 40px -20px rgba(3,4,94,0.45)' }}>
        <div style={{ position: 'absolute', width: 360, height: 360, borderRadius: 999, background: 'radial-gradient(circle, rgba(0,180,216,0.32) 0%, transparent 70%)', top: -120, right: -80 }} />
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'center' }}>
          <div>
            <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>A quién avisamos primero</span>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 38, lineHeight: 1.02, letterSpacing: '-0.02em', marginTop: 8 }}>
              Eduardo Arellano <span style={{ color: 'var(--accent-bright)' }}>· Papá</span>
            </h2>
            <div className="mono" style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 10 }}>
              +52 55 4421 9087 · eduardo.arellano@gmail.com · CDMX
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ height: 42, padding: '0 18px', borderRadius: 'var(--r-md)', background: 'var(--accent-bright)', color: 'var(--ink)', border: 0, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <window.AdmIcon kind="phone" size={14} color="var(--ink)" /> Llamar
            </button>
            <button className="btn sm dark-ghost" style={{ height: 42 }}>
              <window.AdmIcon kind="mail" size={13} color="#fff" /> Correo
            </button>
          </div>
        </div>
      </div>

      {/* contacts list */}
      <div className="eyebrow" style={{ marginTop: 22, marginBottom: 10 }}>Mis contactos · 3</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {contacts.map((c, i) => (
          <div key={i} style={{
            background: 'var(--white)',
            border: '1px solid ' + (c.primary ? 'var(--accent)' : 'var(--rule)'),
            borderRadius: 'var(--r-xl)', overflow: 'hidden',
            boxShadow: c.primary ? '0 14px 30px -20px rgba(0,150,199,0.35)' : 'none',
          }}>
            <div style={{ padding: '18px 20px 16px', borderBottom: '1px solid var(--rule-3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 48, height: 48, borderRadius: 14, background: c.primary ? 'var(--accent-bright)' : 'var(--paper-4)', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 20 }}>
                  {c.name.split(' ').slice(0, 2).map(s => s[0]).join('')}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 500 }}>{c.name}</div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>{c.rel}</div>
                </div>
                {c.primary && <span style={{ fontFamily: 'var(--mono)', fontSize: 9, padding: '3px 7px', borderRadius: 999, background: 'var(--accent-bright)', color: 'var(--ink)', letterSpacing: '0.06em' }}>PRINCIPAL</span>}
              </div>
            </div>
            <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                ['phone', c.phone],
                ['mail',  c.email],
                ['pin',   c.city],
              ].map(([ic, v], j) => (
                <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <window.AdmIcon kind={ic} size={13} color="var(--ink-3)" />
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--ink-2)' }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop: 8, padding: '8px 10px', background: 'var(--paper)', borderRadius: 8, fontSize: 11.5, color: 'var(--ink-2)', lineHeight: 1.45 }}>
                {c.notes}
              </div>
            </div>
            <div style={{ display: 'flex', borderTop: '1px solid var(--rule-3)' }}>
              <button style={{ flex: 1, height: 42, fontFamily: 'inherit', fontSize: 12, color: 'var(--ink-2)', background: 'transparent', border: 0, borderRight: '1px solid var(--rule-3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' }}>
                <window.AdmIcon kind="phone" size={12} /> Llamar
              </button>
              <button style={{ flex: 1, height: 42, fontFamily: 'inherit', fontSize: 12, color: 'var(--ink-2)', background: 'transparent', border: 0, borderRight: '1px solid var(--rule-3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' }}>
                <window.AdmIcon kind="edit" size={12} /> Editar
              </button>
              <button style={{ flex: 1, height: 42, fontFamily: 'inherit', fontSize: 12, color: 'var(--alert)', background: 'transparent', border: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' }}>
                <window.AdmIcon kind="trash" size={12} /> Quitar
              </button>
            </div>
          </div>
        ))}

        {/* add card */}
        <div style={{
          background: 'transparent', border: '1.5px dashed var(--rule)',
          borderRadius: 'var(--r-xl)', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: 30, minHeight: 260,
        }}>
          <span style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--paper-3)', color: 'var(--accent-deep)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <window.AdmIcon kind="plus" size={20} />
          </span>
          <div style={{ fontSize: 14, fontWeight: 500, marginTop: 14 }}>Agregar contacto</div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 6, textAlign: 'center', lineHeight: 1.5, maxWidth: 200 }}>
            Familia, médico de cabecera, alguien que pueda decidir por ti
          </div>
        </div>
      </div>

      {/* note */}
      <div style={{ marginTop: 22, padding: '14px 18px', background: 'var(--paper-3)', border: '1px solid var(--accent-rule)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <window.AdmIcon kind="shield-2" size={18} color="var(--accent-deep)" />
        <div className="mono" style={{ fontSize: 11.5, color: 'var(--accent-deep)', lineHeight: 1.5 }}>
          Tus contactos sólo se muestran a personal médico durante una emergencia activa o cuando autorices con tu QR.
        </div>
      </div>
    </window.AdmPage>
  );
}

// ─── 2 · Ciclo menstrual ──────────────────────────────────────
function PatCycleScreen() {
  // 35 days in a row; mark periods + ovulation predictions
  const today = 14; // day index for "today"
  const cells = Array.from({ length: 35 }, (_, i) => {
    if (i >= 0 && i <= 4) return { state: 'flow', intensity: i === 1 || i === 2 ? 'heavy' : 'mid' };
    if (i >= 12 && i <= 15) return { state: 'fertile' };
    if (i === 14) return { state: 'ovulation' };
    if (i >= 28 && i <= 32) return { state: 'predict' };
    return { state: 'none' };
  });
  const history = [
    { start: 'feb 10', len: 5, cycle: 28, mood: 'normal' },
    { start: 'mar 10', len: 5, cycle: 28, mood: 'normal' },
    { start: 'abr 09', len: 6, cycle: 30, mood: 'cansancio' },
    { start: 'may 09', len: 5, cycle: 30, mood: 'normal' },
  ];
  return (
    <window.AdmPage
      label="AJ · Paciente · Ciclo menstrual"
      nav={PAT_NAV} active={3} role="Paciente" who={PAT_WHO} accent="accent-bright"
      title="Ciclo menstrual" sub="Modelo personalizado · regular · confianza 88%"
      searchHint="Buscar fecha…"
      height={1200}
      right={<button className="btn sm" style={{ height: 42, borderRadius: 'var(--r-md)' }}><window.AdmIcon kind="drop" size={14} color="#fff" /> Registrar día</button>}
    >
      {/* hero prediction */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 12 }}>
        <div style={{ background: 'var(--ink)', color: 'var(--paper)', borderRadius: 'var(--r-xl)', padding: '22px 26px', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 40px -20px rgba(3,4,94,0.45)' }}>
          <div style={{ position: 'absolute', width: 360, height: 360, borderRadius: 999, background: 'radial-gradient(circle, rgba(0,180,216,0.3) 0%, transparent 70%)', top: -120, right: -80 }} />
          <div style={{ position: 'relative' }}>
            <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Próximo periodo · predicción</span>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 50, lineHeight: 1, letterSpacing: '-0.02em', marginTop: 8 }}>
              jun 8 — jun 13
            </h2>
            <div className="mono" style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 10 }}>
              ventana ±1 día · confianza 88% · ciclo medio 29.5 d
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
              <button style={{ height: 38, padding: '0 16px', borderRadius: 'var(--r-md)', background: 'var(--accent-bright)', color: 'var(--ink)', border: 0, fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                Registrar inicio
              </button>
              <button className="btn sm dark-ghost" style={{ height: 38 }}>Compartir con el médico</button>
            </div>
          </div>
        </div>
        <window.AdmStat k="Regularidad" n="Regular" sub="±2 días en últimos 6 ciclos" />
        <window.AdmStat k="Duración media" n="5.2 d" sub="ciclo 29.5 d · normal" />
      </div>

      {/* calendar + insights */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 14, marginTop: 18 }}>
        {/* calendar */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--rule-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 15, fontWeight: 500 }}>Mayo 2026</h3>
            <div style={{ display: 'flex', gap: 6 }}>
              <button style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--rule)', background: 'var(--white)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <window.AdmIcon kind="chev-l" size={12} color="var(--ink-2)" />
              </button>
              <button style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--rule)', background: 'var(--white)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <window.AdmIcon kind="chev" size={12} color="var(--ink-2)" />
              </button>
            </div>
          </div>
          <div style={{ padding: 22 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                <div key={i} style={{ textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.1em', paddingBottom: 6 }}>{d}</div>
              ))}
              {cells.map((c, i) => {
                const day = i + 1;
                const isToday = day === today;
                return (
                  <div key={i} style={{
                    aspectRatio: 1, borderRadius: 12,
                    background:
                      c.state === 'flow' && c.intensity === 'heavy' ? 'var(--alert)' :
                      c.state === 'flow' ? 'var(--alert-soft)' :
                      c.state === 'ovulation' ? 'var(--accent-bright)' :
                      c.state === 'fertile' ? 'var(--paper-3)' :
                      c.state === 'predict' ? 'transparent' :
                      'var(--paper)',
                    border:
                      c.state === 'predict' ? '1.5px dashed var(--alert-rule)' :
                      isToday ? '2px solid var(--ink)' :
                      '1px solid transparent',
                    color:
                      c.state === 'flow' && c.intensity === 'heavy' ? '#fff' :
                      c.state === 'flow' ? 'var(--alert)' :
                      c.state === 'ovulation' ? 'var(--ink)' :
                      'var(--ink-2)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontFamily: 'var(--mono)', position: 'relative',
                  }}>
                    <span style={{ fontWeight: isToday ? 600 : 400 }}>{day}</span>
                    {c.state === 'ovulation' && <span style={{ position: 'absolute', bottom: 4, fontSize: 8, fontWeight: 600 }}>OV</span>}
                  </div>
                );
              })}
            </div>

            {/* legend */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--rule-3)' }}>
              {[
                ['var(--alert)',       'Flujo intenso'],
                ['var(--alert-soft)',  'Flujo medio'],
                ['var(--paper-3)',     'Ventana fértil'],
                ['var(--accent-bright)','Ovulación'],
                ['transparent',        'Predicción próximo periodo', true],
              ].map(([bg, label, dash], i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: 'var(--ink-2)' }}>
                  <span style={{
                    width: 14, height: 14, borderRadius: 4, background: bg,
                    border: dash ? '1.5px dashed var(--alert-rule)' : (bg === 'var(--paper-3)' ? '1px solid var(--accent-rule)' : 'none'),
                  }} />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* aside */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* log today */}
          <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', padding: 18 }}>
            <span className="eyebrow">Hoy · 14 may</span>
            <h3 style={{ fontSize: 16, fontWeight: 500, marginTop: 6 }}>¿Cómo te sientes?</h3>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 4 }}>POST /api/v1/menstrual-cycles/</div>
            <div style={{ marginTop: 14 }}>
              <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Flujo</span>
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                {[['Sin flujo', false], ['Manchas', false], ['Ligero', true], ['Medio', false], ['Intenso', false]].map(([k, on], i) => (
                  <span key={k} style={{
                    padding: '6px 10px', borderRadius: 8, fontSize: 11,
                    background: on ? 'var(--ink)' : 'var(--white)',
                    color:      on ? 'var(--paper)' : 'var(--ink-2)',
                    border: '1px solid ' + (on ? 'var(--ink)' : 'var(--rule)'),
                    cursor: 'pointer',
                  }}>{k}</span>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Síntomas</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                {[['Cólicos', true], ['Cansancio', true], ['Migraña', false], ['Acné', false], ['Cambio ánimo', false], ['Hinchazón', false]].map(([k, on], i) => (
                  <span key={k} style={{
                    padding: '6px 10px', borderRadius: 8, fontSize: 11,
                    background: on ? 'var(--paper-3)' : 'var(--white)',
                    color:      on ? 'var(--accent-deep)' : 'var(--ink-2)',
                    border: '1px solid ' + (on ? 'var(--accent-rule)' : 'var(--rule)'),
                    cursor: 'pointer',
                  }}>{k}</span>
                ))}
              </div>
            </div>
            <button className="btn sm block" style={{ marginTop: 16, justifyContent: 'center' }}>Guardar registro de hoy</button>
          </div>

          {/* disclaimer */}
          <div style={{ background: 'var(--paper-3)', border: '1px solid var(--accent-rule)', borderRadius: 'var(--r-md)', padding: 14, display: 'flex', gap: 10 }}>
            <window.AdmIcon kind="shield-2" size={18} color="var(--accent-deep)" />
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--accent-deep)' }}>No es diagnóstico</div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 4, lineHeight: 1.5 }}>
                La predicción es una ayuda. Si tu ciclo cambia mucho, comparte el registro con tu médico.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* history */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden', marginTop: 18 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--rule-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 15, fontWeight: 500 }}>Histórico · últimos 4 ciclos</h3>
          <span className="mono" style={{ fontSize: 11, color: 'var(--accent-deep)' }}>Ver completo (24) →</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.8fr 0.8fr 1fr 60px', padding: '12px 20px', borderBottom: '1px solid var(--rule-2)', fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <span>Inicio</span><span>Duración</span><span>Ciclo</span><span>Notas</span><span></span>
        </div>
        {history.map((h, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 0.8fr 0.8fr 1fr 60px', padding: '13px 20px', alignItems: 'center', borderBottom: i < history.length - 1 ? '1px solid var(--rule-3)' : 0 }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{h.start}</span>
            <span className="mono" style={{ fontSize: 12, color: 'var(--ink-2)' }}>{h.len} días</span>
            <span className="mono" style={{ fontSize: 12, color: 'var(--ink-2)' }}>{h.cycle} d</span>
            <span style={{ fontSize: 12, color: 'var(--ink-2)' }}>{h.mood}</span>
            <window.AdmIcon kind="more" size={16} color="var(--ink-3)" />
          </div>
        ))}
      </div>
    </window.AdmPage>
  );
}

// ─── 3 · Mi QR de acceso ──────────────────────────────────────
function PatQRScreen() {
  // 21x21 grid of QR-like cells, fake but plausible.
  const N = 21;
  const cells = [];
  let seed = 17;
  for (let i = 0; i < N * N; i++) {
    seed = (seed * 9301 + 49297) % 233280;
    cells.push((seed / 233280) > 0.5);
  }
  // place 3 finder patterns
  const isInRect = (r, c, r0, c0, sz) => r >= r0 && r < r0 + sz && c >= c0 && c < c0 + sz;
  const finder = (r, c) =>
    isInRect(r, c, 0, 0, 7) || isInRect(r, c, 0, N - 7, 7) || isInRect(r, c, N - 7, 0, 7);

  const history = [
    { who: 'Dr. Damián Vega Ríos',  loc: 'Clínica Roma Norte',     kind: 'consulta · cirugía',   when: 'hace 8 días',  scope: 'expediente · 24 h' },
    { who: 'Dra. Lorena Padilla',  loc: 'Hospital ABC Sta. Fe',    kind: 'interconsulta',         when: '3 may',         scope: 'sólo alergias · 1 h' },
    { who: 'Sec. Olivia Quintana', loc: 'Clínica Roma Norte',     kind: 'recepción · vincular',  when: '28 abr',        scope: 'datos básicos · 30 min' },
    { who: 'Dr. Joaquín Rendón',   loc: 'Urgencias · Roma Norte', kind: 'urgencias · ECG',        when: '17 abr',        scope: 'expediente · 4 h' },
  ];

  return (
    <window.AdmPage
      label="AK · Paciente · Mi QR"
      nav={PAT_NAV} active={8} role="Paciente" who={PAT_WHO} accent="accent-bright"
      title="Mi código QR" sub="POST /api/v1/qr-access/generate — vigencia 5 min"
      searchHint="Buscar acceso…"
      height={1100}
      right={<button className="btn sm ghost" style={{ height: 42, borderRadius: 'var(--r-md)' }}>Bitácora de accesos →</button>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* QR display */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--rule-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 500 }}>Código activo</h3>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>Muéstralo al médico o secretaria</div>
            </div>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, padding: '3px 8px', borderRadius: 999, background: '#E5F5EE', color: 'var(--ok)', letterSpacing: '0.08em' }}>VÁLIDO · 04:32</span>
          </div>
          <div style={{ padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: 320, height: 320, padding: 22, background: '#fff', borderRadius: 'var(--r-lg)', border: '1px solid var(--rule)' }}>
              <div style={{ width: '100%', height: '100%', display: 'grid', gridTemplateColumns: `repeat(${N}, 1fr)`, gap: 0 }}>
                {cells.map((on, i) => {
                  const r = Math.floor(i / N), c = i % N;
                  const inFinder = finder(r, c);
                  let filled = on;
                  if (inFinder) {
                    // finder: outer 7x7 black, inner 5x5 white, center 3x3 black
                    let r0 = 0, c0 = 0;
                    if (r >= N - 7) r0 = N - 7;
                    if (c >= N - 7) c0 = N - 7;
                    const lr = r - r0, lc = c - c0;
                    const outer = (lr === 0 || lr === 6 || lc === 0 || lc === 6);
                    const mid   = (lr >= 1 && lr <= 5 && lc >= 1 && lc <= 5 && !(lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4));
                    filled = outer || (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4);
                    if (mid) filled = false;
                  }
                  return <div key={i} style={{ background: filled ? 'var(--ink)' : 'transparent' }} />;
                })}
              </div>
            </div>
            <div style={{ marginTop: 18, fontFamily: 'var(--mono)', fontSize: 28, letterSpacing: '0.18em', color: 'var(--ink)' }}>7F4K · 9A2H</div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 6 }}>código · 8 dígitos · expira en 4 min 32 s</div>

            <div style={{ display: 'flex', gap: 8, marginTop: 22 }}>
              <button className="btn sm"><window.AdmIcon kind="copy" size={13} color="#fff" /> Copiar código</button>
              <button className="btn sm ghost">Generar nuevo</button>
            </div>
          </div>
        </div>

        {/* scope settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--rule-2)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 500 }}>Qué compartes con este código</h3>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>Personaliza por uso · cambia cuando quieras</div>
            </div>
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                ['Datos básicos · CURP · grupo sanguíneo', true,  'siempre incluidos'],
                ['Alergias y reacciones',                  true,  'crítico para urgencias'],
                ['Medicamentos activos',                   true,  'incluye recetas vigentes'],
                ['Cirugías e historial quirúrgico',        true,  '3 cirugías registradas'],
                ['Resultados de laboratorio',              false, '12 estudios en expediente'],
                ['Ciclo menstrual',                        false, 'sólo si la consulta lo requiere'],
                ['Vacunas',                                true,  '12 dosis · esquema completo'],
              ].map(([k, on, sub], i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 44px', gap: 10, alignItems: 'center', padding: '10px 12px', background: 'var(--paper)', borderRadius: 'var(--r-md)' }}>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 500 }}>{k}</div>
                    <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 2 }}>{sub}</div>
                  </div>
                  <span style={{
                    width: 36, height: 22, borderRadius: 99,
                    background: on ? 'var(--accent-bright)' : 'var(--rule)',
                    position: 'relative', cursor: 'pointer', transition: 'background .15s',
                  }}>
                    <span style={{
                      position: 'absolute', top: 2, left: on ? 16 : 2,
                      width: 18, height: 18, borderRadius: 99, background: '#fff',
                      transition: 'left .15s',
                    }} />
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* duration */}
          <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', padding: 18 }}>
            <span className="eyebrow">Duración del acceso</span>
            <h3 style={{ fontSize: 14, fontWeight: 500, marginTop: 4 }}>¿Por cuánto tiempo el médico ve estos datos?</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginTop: 12 }}>
              {[['30 min', false], ['1 h', false], ['4 h', true], ['24 h', false]].map(([k, on]) => (
                <span key={k} style={{
                  padding: '10px 12px', borderRadius: 'var(--r-md)', textAlign: 'center',
                  background: on ? 'var(--ink)' : 'var(--paper)',
                  color:      on ? 'var(--paper)' : 'var(--ink-2)',
                  border: '1px solid ' + (on ? 'var(--ink)' : 'var(--rule)'),
                  fontSize: 12, fontWeight: 500, cursor: 'pointer',
                }}>{k}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* history */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden', marginTop: 18 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--rule-2)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 500 }}>Accesos otorgados</h3>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>Quién leyó qué y por cuánto tiempo</div>
        </div>
        {history.map((h, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '36px 1.6fr 1.2fr 1fr 1fr', gap: 14, padding: '13px 20px', alignItems: 'center', borderBottom: i < history.length - 1 ? '1px solid var(--rule-3)' : 0 }}>
            <span style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--paper-3)', color: 'var(--accent-deep)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <window.AdmIcon kind="scan" size={14} />
            </span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{h.who}</div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>{h.loc}</div>
            </div>
            <span style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>{h.kind}</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{h.when}</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--accent-deep)' }}>{h.scope}</span>
          </div>
        ))}
      </div>
    </window.AdmPage>
  );
}

Object.assign(window, { PatEmergencyScreen, PatCycleScreen, PatQRScreen });
