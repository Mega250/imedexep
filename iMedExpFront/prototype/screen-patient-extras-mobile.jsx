// imedexp · Paciente · móvil · pantallas extra
// Emergencia · Ciclo · Mi QR · Signos vitales · Mis clínicas · Avisos

const PAT_TABS_M = [
  ['home',   'Inicio'],
  ['doc',    'Salud'],
  ['cal',    'Citas'],
  ['heart',  'Ciclo'],
  ['qr',     'QR'],
  ['user',   'Perfil'],
];
const PATdev = ({ children }) => <window.IOSDevice width={390} height={844} title="imedexp">{children}</window.IOSDevice>;

// ─── 1 · Contactos de emergencia ──────────────────────────────
function PatEmergencyMobile() {
  const contacts = [
    { n: 'Eduardo Arellano',  r: 'Padre',                p: '+52 55 4421 9087', primary: true, note: 'Avisar primero · sabe del cuadro tiroides' },
    { n: 'Marisol Fernández', r: 'Madre',                p: '+52 55 8214 3306', note: 'Trabajo nocturno · llamar después de 7 am' },
    { n: 'Dr. Sergio Mata',   r: 'Médico de cabecera',   p: '+52 55 1290 7741', note: 'Endocrinólogo · expediente desde 2019' },
  ];
  return (
    <div data-screen-label="AI₂ · Paciente · Emergencia (móvil)">
      <PATdev>
        <window.MbFrame tabs={PAT_TABS_M} active={5}
          fab={<window.MbFAB icon="plus" label="Agregar" />}>
          <window.MbTop sub="3 contactos · 1 principal" title="Emergencia" />
          {/* hero principal */}
          <div style={{ padding: '14px 20px 0' }}>
            <div style={{ background: 'var(--ink)', color: 'var(--paper)', borderRadius: 'var(--r-lg)', padding: 18, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', width: 220, height: 220, borderRadius: 999, background: 'radial-gradient(circle, rgba(0,180,216,0.32) 0%, transparent 70%)', top: -80, right: -50 }} />
              <div style={{ position: 'relative' }}>
                <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>A quién avisamos primero</span>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: 28, lineHeight: 1.05, marginTop: 6 }}>
                  Eduardo Arellano<br /><span style={{ color: 'var(--accent-bright)' }}>· Papá</span>
                </h2>
                <div className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>+52 55 4421 9087</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                  <button style={{ flex: 1, height: 40, padding: '0 12px', borderRadius: 9, background: 'var(--accent-bright)', color: 'var(--ink)', border: 0, fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <window.MbIcon kind="phone" size={13} color="var(--ink)" /> Llamar
                  </button>
                  <button style={{ width: 40, height: 40, borderRadius: 9, background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.25)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <window.MbIcon kind="mail" size={14} color="#fff" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <window.MbSection title="Mis contactos · 3">
            {contacts.map((c, i) => (
              <div key={i} style={{
                background: 'var(--white)',
                border: '1px solid ' + (c.primary ? 'var(--accent)' : 'var(--rule)'),
                borderRadius: 'var(--r-lg)', overflow: 'hidden', marginBottom: 10,
                boxShadow: c.primary ? '0 10px 22px -18px rgba(0,150,199,0.3)' : 'none',
              }}>
                <div style={{ padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 40, height: 40, borderRadius: 11, background: c.primary ? 'var(--accent-bright)' : 'var(--paper-4)', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 16 }}>
                      {c.n.split(' ').slice(0, 2).map(s => s[0]).join('')}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 500 }}>{c.n}</span>
                        {c.primary && <span style={{ fontFamily: 'var(--mono)', fontSize: 8.5, padding: '2px 6px', borderRadius: 999, background: 'var(--accent-bright)', color: 'var(--ink)', letterSpacing: '0.06em' }}>PRINC</span>}
                      </div>
                      <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 2 }}>{c.r}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 10, padding: '8px 10px', background: 'var(--paper)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <window.MbIcon kind="phone" size={12} color="var(--ink-3)" />
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--ink-2)' }}>{c.p}</span>
                  </div>
                  <div style={{ marginTop: 6, fontSize: 11, color: 'var(--ink-2)', lineHeight: 1.5 }}>{c.note}</div>
                </div>
                <div style={{ display: 'flex', borderTop: '1px solid var(--rule-3)' }}>
                  <button style={{ flex: 1, height: 38, fontFamily: 'inherit', fontSize: 11.5, color: 'var(--ink-2)', background: 'transparent', border: 0, borderRight: '1px solid var(--rule-3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                    <window.MbIcon kind="phone" size={11} /> Llamar
                  </button>
                  <button style={{ flex: 1, height: 38, fontFamily: 'inherit', fontSize: 11.5, color: 'var(--ink-2)', background: 'transparent', border: 0, borderRight: '1px solid var(--rule-3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                    <window.MbIcon kind="edit" size={11} /> Editar
                  </button>
                  <button style={{ flex: 1, height: 38, fontFamily: 'inherit', fontSize: 11.5, color: 'var(--alert)', background: 'transparent', border: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                    <window.MbIcon kind="trash" size={11} color="var(--alert)" /> Quitar
                  </button>
                </div>
              </div>
            ))}
          </window.MbSection>

          <div style={{ padding: '4px 20px 20px' }}>
            <div style={{ padding: '12px 14px', background: 'var(--paper-3)', border: '1px solid var(--accent-rule)', borderRadius: 'var(--r-md)', display: 'flex', gap: 10 }}>
              <window.MbIcon kind="shield-2" size={16} color="var(--accent-deep)" />
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--accent-deep)', lineHeight: 1.5 }}>
                Tus contactos sólo aparecen al personal médico durante una emergencia o cuando autorices con tu QR.
              </div>
            </div>
          </div>
        </window.MbFrame>
      </PATdev>
    </div>
  );
}

// ─── 2 · Ciclo menstrual ──────────────────────────────────────
function PatCycleMobile() {
  const today = 14;
  const cells = Array.from({ length: 35 }, (_, i) => {
    if (i >= 0 && i <= 4) return { state: 'flow', heavy: i === 1 || i === 2 };
    if (i === 14) return { state: 'ov' };
    if (i >= 12 && i <= 15) return { state: 'fert' };
    if (i >= 28 && i <= 32) return { state: 'pred' };
    return { state: 'none' };
  });
  return (
    <div data-screen-label="AJ₂ · Paciente · Ciclo (móvil)">
      <PATdev>
        <window.MbFrame tabs={PAT_TABS_M} active={3}
          fab={<window.MbFAB icon="drop" label="Registrar hoy" />}>
          <window.MbTop sub="Modelo personalizado · regular · 88%" title="Ciclo menstrual" />
          {/* hero prediction */}
          <div style={{ padding: '14px 20px 0' }}>
            <div style={{ background: 'var(--ink)', color: 'var(--paper)', borderRadius: 'var(--r-lg)', padding: 18, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', width: 220, height: 220, borderRadius: 999, background: 'radial-gradient(circle, rgba(0,180,216,0.3) 0%, transparent 70%)', top: -80, right: -50 }} />
              <div style={{ position: 'relative' }}>
                <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Próximo periodo</span>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: 36, lineHeight: 1, marginTop: 6 }}>jun 8 — jun 13</h2>
                <div className="mono" style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>ventana ±1 día · confianza 88% · ciclo medio 29.5 d</div>
              </div>
            </div>
          </div>

          <window.MbSection title="Mayo 2026">
            <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', padding: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                  <div key={i} style={{ textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.08em', paddingBottom: 4 }}>{d}</div>
                ))}
                {cells.map((c, i) => {
                  const day = i + 1;
                  const isToday = day === today;
                  return (
                    <div key={i} style={{
                      aspectRatio: 1, borderRadius: 8,
                      background:
                        c.state === 'flow' && c.heavy ? 'var(--alert)' :
                        c.state === 'flow' ? 'var(--alert-soft)' :
                        c.state === 'ov' ? 'var(--accent-bright)' :
                        c.state === 'fert' ? 'var(--paper-3)' :
                        c.state === 'pred' ? 'transparent' :
                        'var(--paper)',
                      border:
                        c.state === 'pred' ? '1.5px dashed var(--alert-rule)' :
                        isToday ? '2px solid var(--ink)' : '1px solid transparent',
                      color:
                        c.state === 'flow' && c.heavy ? '#fff' :
                        c.state === 'flow' ? 'var(--alert)' :
                        c.state === 'ov' ? 'var(--ink)' :
                        'var(--ink-2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontFamily: 'var(--mono)',
                      fontWeight: isToday ? 600 : 400,
                    }}>{day}</div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--rule-3)' }}>
                {[
                  ['var(--alert)',       'Intenso'],
                  ['var(--alert-soft)',  'Medio'],
                  ['var(--accent-bright)','Ovulación'],
                  ['transparent',        'Predicción', true],
                ].map(([bg, label, dash], i) => (
                  <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10.5, color: 'var(--ink-2)' }}>
                    <span style={{ width: 12, height: 12, borderRadius: 3, background: bg, border: dash ? '1.5px dashed var(--alert-rule)' : 'none' }} />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </window.MbSection>

          <window.MbSection title="Hoy · ¿cómo te sientes?">
            <div style={{ padding: 14, background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)' }}>
              <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Flujo</span>
              <div style={{ display: 'flex', gap: 5, marginTop: 6, flexWrap: 'wrap' }}>
                {[['Sin', false], ['Manch.', false], ['Ligero', true], ['Medio', false], ['Intenso', false]].map(([k, on]) => (
                  <span key={k} style={{
                    padding: '5px 9px', borderRadius: 8, fontSize: 10.5,
                    background: on ? 'var(--ink)' : 'var(--white)',
                    color:      on ? 'var(--paper)' : 'var(--ink-2)',
                    border: '1px solid ' + (on ? 'var(--ink)' : 'var(--rule)'),
                  }}>{k}</span>
                ))}
              </div>
              <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginTop: 14 }}>Síntomas</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 6 }}>
                {[['Cólicos', true], ['Cansancio', true], ['Migraña', false], ['Acné', false], ['Hinchazón', false]].map(([k, on]) => (
                  <span key={k} style={{
                    padding: '5px 9px', borderRadius: 8, fontSize: 10.5,
                    background: on ? 'var(--paper-3)' : 'var(--white)',
                    color:      on ? 'var(--accent-deep)' : 'var(--ink-2)',
                    border: '1px solid ' + (on ? 'var(--accent-rule)' : 'var(--rule)'),
                  }}>{k}</span>
                ))}
              </div>
            </div>
          </window.MbSection>

          <window.MbSection title="Últimos 4 ciclos">
            {[
              ['feb 10', 5, 28], ['mar 10', 5, 28], ['abr 09', 6, 30], ['may 09', 5, 30],
            ].map(([d, l, c], i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '10px 12px', background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)', marginBottom: 5, alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 500 }}>{d}</span>
                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-2)' }}>{l} días</span>
                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-2)' }}>ciclo {c} d</span>
              </div>
            ))}
          </window.MbSection>
          <div style={{ height: 20 }} />
        </window.MbFrame>
      </PATdev>
    </div>
  );
}

// ─── 3 · Mi QR de acceso ──────────────────────────────────────
function PatQRMobile() {
  const N = 17;
  let seed = 11;
  const cells = [];
  for (let i = 0; i < N * N; i++) {
    seed = (seed * 9301 + 49297) % 233280;
    cells.push((seed / 233280) > 0.5);
  }
  const isInRect = (r, c, r0, c0, sz) => r >= r0 && r < r0 + sz && c >= c0 && c < c0 + sz;
  const finder = (r, c) =>
    isInRect(r, c, 0, 0, 7) || isInRect(r, c, 0, N - 7, 7) || isInRect(r, c, N - 7, 0, 7);

  return (
    <div data-screen-label="AK₂ · Paciente · Mi QR (móvil)">
      <PATdev>
        <window.MbFrame tabs={PAT_TABS_M} active={4}>
          <window.MbTop sub="POST /qr-access/generate · 5 min" title="Mi código QR" />

          <div style={{ padding: '14px 20px 0' }}>
            <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', padding: 18, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 12 }}>
                <span className="eyebrow">Código activo</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 9, padding: '3px 7px', borderRadius: 999, background: '#E5F5EE', color: 'var(--ok)', letterSpacing: '0.06em' }}>VÁLIDO · 04:32</span>
              </div>
              <div style={{ width: 220, height: 220, padding: 16, background: '#fff', borderRadius: 'var(--r-md)', border: '1px solid var(--rule)' }}>
                <div style={{ width: '100%', height: '100%', display: 'grid', gridTemplateColumns: `repeat(${N}, 1fr)` }}>
                  {cells.map((on, i) => {
                    const r = Math.floor(i / N), c = i % N;
                    let filled = on;
                    if (finder(r, c)) {
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
              <div style={{ marginTop: 14, fontFamily: 'var(--mono)', fontSize: 22, letterSpacing: '0.18em', color: 'var(--ink)' }}>7F4K · 9A2H</div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 4 }}>código · 8 dígitos · 4 min 32 s</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 14, width: '100%' }}>
                <button className="btn sm" style={{ flex: 1, justifyContent: 'center' }}>
                  <window.MbIcon kind="copy" size={12} color="#fff" /> Copiar
                </button>
                <button className="btn sm ghost" style={{ flex: 1, justifyContent: 'center' }}>Nuevo</button>
              </div>
            </div>
          </div>

          <window.MbSection title="Qué compartes">
            {[
              ['Datos básicos · grupo sanguíneo', true],
              ['Alergias y reacciones',           true],
              ['Medicamentos activos',            true],
              ['Cirugías',                        true],
              ['Resultados de laboratorio',       false],
              ['Ciclo menstrual',                 false],
            ].map(([k, on], i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', padding: '12px 14px', background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)', marginBottom: 5 }}>
                <span style={{ fontSize: 12.5 }}>{k}</span>
                <window.MbSwitch on={on} />
              </div>
            ))}
          </window.MbSection>

          <window.MbSection title="Duración del acceso">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {[['30 m', false], ['1 h', false], ['4 h', true], ['24 h', false]].map(([k, on]) => (
                <span key={k} style={{
                  padding: '10px 0', textAlign: 'center', borderRadius: 'var(--r-md)',
                  background: on ? 'var(--ink)' : 'var(--white)',
                  color:      on ? 'var(--paper)' : 'var(--ink-2)',
                  border: '1px solid ' + (on ? 'var(--ink)' : 'var(--rule)'),
                  fontSize: 12, fontWeight: 500,
                }}>{k}</span>
              ))}
            </div>
          </window.MbSection>

          <window.MbSection title="Accesos otorgados">
            {[
              ['Dr. D. Vega',     'Roma Norte · consulta',     'hace 8 d'],
              ['Dra. L. Padilla', 'ABC · interconsulta',       '3 may'],
              ['Sec. O. Quintana','Roma Norte · recepción',    '28 abr'],
            ].map(([n, k, when], i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '30px 1fr auto', gap: 10, alignItems: 'center', padding: '10px 12px', background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)', marginBottom: 5 }}>
                <span style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--paper-3)', color: 'var(--accent-deep)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <window.MbIcon kind="scan" size={11} />
                </span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{n}</div>
                  <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)' }}>{k}</div>
                </div>
                <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{when}</span>
              </div>
            ))}
          </window.MbSection>
          <div style={{ height: 20 }} />
        </window.MbFrame>
      </PATdev>
    </div>
  );
}

// ─── 4 · Mis signos vitales ───────────────────────────────────
function PatVitalsMobile() {
  const W = 340, H = 130, P = 20;
  const dates = ['feb', 'mar', 'mar', 'abr', 'abr', 'may', 'may', 'hoy'];
  const sys = [128, 134, 132, 130, 126, 124, 122, 119];
  const dia = [82, 86, 88, 84, 82, 80, 78, 76];
  const xs = (i) => P + (i * (W - 2 * P)) / (dates.length - 1);
  const ys = (v, min, max) => P + ((max - v) / (max - min)) * (H - 2 * P);
  return (
    <div data-screen-label="AY₂ · Paciente · Signos vitales (móvil)">
      <PATdev>
        <window.MbFrame tabs={PAT_TABS_M} active={1}>
          <window.MbTop sub="hoy 10:32 · Dr. Vega · Roma Norte" title="Tus signos vitales" />
          {/* hero */}
          <div style={{ padding: '14px 20px 0' }}>
            <div style={{ background: 'var(--ink)', color: 'var(--paper)', borderRadius: 'var(--r-lg)', padding: 18, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', width: 220, height: 220, borderRadius: 999, background: 'radial-gradient(circle, rgba(0,180,216,0.32) 0%, transparent 70%)', top: -80, right: -50 }} />
              <div style={{ position: 'relative' }}>
                <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Lectura más reciente</span>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: 26, lineHeight: 1.05, marginTop: 6 }}>Tu día va bien.</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
                  {[['T/A', '119/76', 'mmHg', '↓ 9'], ['FC', '68', 'lpm', '↓ 10'], ['Temp', '36.6', '°C', 'normal'], ['SpO₂', '98', '%', 'normal']].map(([k, n, u, tr], i) => (
                    <div key={i}>
                      <div className="eyebrow" style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)' }}>{k}</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 2 }}>
                        <span style={{ fontFamily: 'var(--serif)', fontSize: 22, lineHeight: 1 }}>{n}</span>
                        <span className="mono" style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.6)' }}>{u}</span>
                      </div>
                      <div className="mono" style={{ fontSize: 9, color: '#A8E5C7', marginTop: 4 }}>{tr}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <window.MbSection title="Tu T/A está bajando ✓">
            <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', padding: 14 }}>
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H }}>
                <rect x={P} y={ys(130, 60, 140)} width={W - 2 * P} height={ys(80, 60, 140) - ys(130, 60, 140)} fill="rgba(28,140,90,0.08)" />
                {[80, 100, 120, 140].map((v) => {
                  const y = ys(v, 60, 140);
                  return <line key={v} x1={P} x2={W - P} y1={y} y2={y} stroke="var(--rule-3)" strokeWidth="1" />;
                })}
                <polyline fill="none" stroke="var(--ink)" strokeWidth="2.5" points={sys.map((v, i) => `${xs(i)},${ys(v, 60, 140)}`).join(' ')} />
                {sys.map((v, i) => <circle key={'s' + i} cx={xs(i)} cy={ys(v, 60, 140)} r="3" fill="var(--ink)" />)}
                <polyline fill="none" stroke="var(--accent)" strokeWidth="2.5" points={dia.map((v, i) => `${xs(i)},${ys(v, 60, 140)}`).join(' ')} />
                {dia.map((v, i) => <circle key={'d' + i} cx={xs(i)} cy={ys(v, 60, 140)} r="3" fill="var(--accent)" />)}
              </svg>
              <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10.5, color: 'var(--ink-2)' }}>
                  <span style={{ width: 14, height: 2, background: 'var(--ink)' }} /> Sistólica
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10.5, color: 'var(--ink-2)' }}>
                  <span style={{ width: 14, height: 2, background: 'var(--accent)' }} /> Diastólica
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10.5, color: 'var(--ink-2)' }}>
                  <span style={{ width: 12, height: 12, background: 'rgba(28,140,90,0.15)', border: '1px solid #BFE3CF', borderRadius: 3 }} /> Sano
                </span>
              </div>
            </div>
          </window.MbSection>

          <window.MbSection title="¿Qué significa?">
            {[
              ['Tensión normal', 'Bajó ~9 puntos en 3 meses. Buena señal.'],
              ['Pulso bajó',     'A 68. Caminas y duermes mejor.'],
              ['Temp y SpO₂',    'Sin fiebre · saturación perfecta.'],
            ].map(([k, t], i) => (
              <div key={i} style={{ padding: '11px 12px', background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)', marginBottom: 5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 20, height: 20, borderRadius: 99, background: '#E5F5EE', color: 'var(--ok)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <window.MbIcon kind="check" size={11} />
                  </span>
                  <span style={{ fontSize: 12.5, fontWeight: 500 }}>{k}</span>
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-2)', marginTop: 6, lineHeight: 1.5 }}>{t}</div>
              </div>
            ))}
          </window.MbSection>
          <div style={{ height: 20 }} />
        </window.MbFrame>
      </PATdev>
    </div>
  );
}

// ─── 5 · Mis clínicas vinculadas ──────────────────────────────
function PatClinicsMobile() {
  const clinics = [
    {
      n: 'Clínica Roma Norte', city: 'CDMX · Roma Nte.',
      since: 'feb 2024', principal: true,
      doctors: ['Dr. Vega · cirugía', 'Dra. Padilla · med. int.'],
      perms: 'expediente completo',
    },
    {
      n: 'Hospital ABC Sta. Fe', city: 'CDMX · Sta. Fe',
      since: 'mar 2023',
      doctors: ['Dra. Sotelo · ginecología'],
      perms: 'sólo ginecología',
    },
    {
      n: 'C. Médico Polanco', city: 'CDMX · Polanco',
      since: 'jul 2022', paused: true,
      doctors: ['Dr. Mata · endocrinología (egr.)'],
      perms: 'archivada · sólo lectura',
    },
  ];
  return (
    <div data-screen-label="AZ₂ · Paciente · Mis clínicas (móvil)">
      <PATdev>
        <window.MbFrame tabs={PAT_TABS_M} active={5}
          fab={<window.MbFAB icon="qr" label="Vincular con QR" />}>
          <window.MbTop sub="3 instituciones · tú decides qué" title="Mis clínicas" />

          {/* hero info */}
          <div style={{ padding: '14px 20px 0' }}>
            <div style={{ background: 'var(--paper-3)', border: '1px solid var(--accent-rule)', borderRadius: 'var(--r-lg)', padding: 16 }}>
              <span className="eyebrow">Tu expediente es tuyo</span>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: 22, lineHeight: 1.1, marginTop: 4 }}>
                Cada clínica que tiene acceso, está aquí.
              </h2>
              <p className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 8, lineHeight: 1.5 }}>
                Puedes revocar permisos cuando quieras.
              </p>
            </div>
          </div>

          <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {clinics.map((c, i) => (
              <div key={i} style={{
                background: 'var(--white)',
                border: '1px solid ' + (c.principal ? 'var(--accent)' : 'var(--rule)'),
                borderRadius: 'var(--r-lg)', overflow: 'hidden',
                opacity: c.paused ? 0.7 : 1,
                boxShadow: c.principal ? '0 10px 22px -18px rgba(0,150,199,0.3)' : 'none',
              }}>
                <div style={{ padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ width: 50, height: 50, borderRadius: 14, background: c.principal ? 'var(--accent-bright)' : 'var(--paper-4)', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 20 }}>
                      {c.n.split(' ').filter(s => s[0] >= 'A' && s[0] <= 'Z').slice(0, 2).map(s => s[0]).join('')}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 14, fontWeight: 500 }}>{c.n}</span>
                        {c.principal && <span style={{ fontFamily: 'var(--mono)', fontSize: 8.5, padding: '2px 6px', borderRadius: 999, background: 'var(--accent-bright)', color: 'var(--ink)', letterSpacing: '0.06em' }}>PRINC</span>}
                        {c.paused && <span style={{ fontFamily: 'var(--mono)', fontSize: 8.5, padding: '2px 6px', borderRadius: 999, background: 'var(--paper)', color: 'var(--ink-3)', letterSpacing: '0.06em' }}>ARCH</span>}
                      </div>
                      <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 4 }}>{c.city} · desde {c.since}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <span className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Te atiende</span>
                    <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {c.doctors.map((d, j) => <span key={j} style={{ fontSize: 11.5, color: 'var(--ink-2)' }}>{d}</span>)}
                    </div>
                  </div>
                  <div style={{ marginTop: 10, padding: '8px 10px', background: 'var(--paper)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <window.MbIcon kind="shield-2" size={12} color="var(--accent-deep)" />
                    <span style={{ fontSize: 11.5, color: 'var(--ink-2)' }}>{c.perms}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', borderTop: '1px solid var(--rule-3)' }}>
                  <button style={{ flex: 1, height: 38, fontFamily: 'inherit', fontSize: 11.5, color: 'var(--ink-2)', background: 'transparent', border: 0, borderRight: '1px solid var(--rule-3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                    <window.MbIcon kind="edit" size={11} /> Permisos
                  </button>
                  {c.paused
                    ? <button style={{ flex: 1, height: 38, fontFamily: 'inherit', fontSize: 11.5, color: 'var(--ink-2)', background: 'transparent', border: 0 }}>Reactivar</button>
                    : <button style={{ flex: 1, height: 38, fontFamily: 'inherit', fontSize: 11.5, color: 'var(--alert)', background: 'transparent', border: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                        <window.MbIcon kind="x" size={11} color="var(--alert)" /> Desvincular
                      </button>}
                </div>
              </div>
            ))}
          </div>
        </window.MbFrame>
      </PATdev>
    </div>
  );
}

// ─── 6 · Avisos / notificaciones ──────────────────────────────
function PatNotifsMobile() {
  const items = [
    { kind: 'cita',  read: false, icon: 'cal',   t: 'Tu consulta con Dr. Vega es hoy',     body: '10:30 · cons. 712 · en 14 min',    ago: '12 min', a: 'Confirmar' },
    { kind: 'med',   read: false, icon: 'pill',  t: 'Toma de levotiroxina',                 body: 'Eutirox 50 mcg · ayunas',          ago: '1 h',    a: 'Ya la tomé' },
    { kind: 'lab',   read: true,  icon: 'doc',   t: 'Resultados USG tiroides listos',     body: 'Validado por Dr. Vega · nód. benigno', ago: 'ayer', a: 'Ver' },
    { kind: 'cycle', read: true,  icon: 'heart', t: 'Predicción próximo periodo',          body: 'jun 8 — jun 13 · 88%',              ago: '12 may', a: 'Ver' },
    { kind: 'qr',    read: true,  icon: 'qr',    t: 'Dra. Sotelo escaneó tu QR',          body: 'Acceso 1 h · sólo ginecología',     ago: '10 may', a: 'Bitácora' },
    { kind: 'rx',    read: true,  icon: 'doc',   t: 'Receta firmada por Dr. Vega',         body: 'Sumatriptán 50 mg · prn',           ago: '04 may', a: 'Descargar' },
  ];
  const iconBg = { cita: 'var(--paper-3)', med: '#FCEFD7', lab: 'var(--paper-3)', cycle: '#FBE9E8', qr: 'var(--paper-3)', rx: 'var(--paper-3)' };
  const iconFg = { cita: 'var(--accent-deep)', med: 'var(--mid)', lab: 'var(--accent-deep)', cycle: 'var(--alert)', qr: 'var(--accent-deep)', rx: 'var(--accent-deep)' };
  return (
    <div data-screen-label="BA₂ · Paciente · Avisos (móvil)">
      <PATdev>
        <window.MbFrame tabs={PAT_TABS_M} active={0}>
          <window.MbTop sub="2 sin leer · 12 esta semana" title="Avisos"
            right={<button className="btn sm ghost" style={{ height: 30, fontSize: 11, padding: '0 10px' }}>Todo leído</button>} />
          <div style={{ padding: '12px 20px 0', display: 'flex', gap: 6, overflowX: 'auto' }}>
            {[['Todos', 12, true], ['Sin leer', 2, false, 'alert'], ['Citas', 4], ['Meds', 3], ['Estudios', 2]].map(([k, n, on, tone]) => (
              <window.MbPill key={k} on={on} count={n} tone={tone}>{k}</window.MbPill>
            ))}
          </div>

          <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.map((it, i) => (
              <div key={i} style={{
                background: 'var(--white)',
                border: '1px solid ' + (!it.read ? 'var(--accent)' : 'var(--rule)'),
                borderRadius: 'var(--r-lg)', padding: 14,
                boxShadow: !it.read ? '0 8px 18px -16px rgba(0,150,199,0.3)' : 'none',
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr auto', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ width: 32, height: 32, borderRadius: 9, background: iconBg[it.kind], color: iconFg[it.kind], display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <window.MbIcon kind={it.icon} size={14} />
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 12.5, fontWeight: !it.read ? 600 : 500 }}>{it.t}</span>
                      {!it.read && <span style={{ width: 7, height: 7, borderRadius: 99, background: 'var(--accent-bright)' }} />}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--ink-2)', marginTop: 4, lineHeight: 1.4 }}>{it.body}</div>
                  </div>
                  <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{it.ago}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                  <button className={'btn sm ' + (!it.read ? '' : 'ghost')} style={{ height: 28, fontSize: 11, padding: '0 12px' }}>{it.a}</button>
                </div>
              </div>
            ))}
          </div>
        </window.MbFrame>
      </PATdev>
    </div>
  );
}

Object.assign(window, {
  PatEmergencyMobile, PatCycleMobile, PatQRMobile, PatVitalsMobile, PatClinicsMobile, PatNotifsMobile,
});
