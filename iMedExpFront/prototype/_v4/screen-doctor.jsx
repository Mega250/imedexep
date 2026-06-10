// imedexp · Doctor dashboard (1440 × 980)
// Densidad de expediente. Historial = jerarquía 1.

const Tick = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 12 12"><path d="M2 6.5 L5 9.5 L10 3" stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const Dot = ({ color = 'currentColor', size = 6 }) => (
  <span style={{ width: size, height: size, borderRadius: 99, background: color, display: 'inline-block' }} />
);

// Sidebar — agenda del día
function DoctorSidebar({ activeIdx }) {
  const items = [
    ['09:00', 'Carlos Mendoza Vela', 'control · 6m', 'done'],
    ['09:45', 'Patricia Lozano', 'control · oncol', 'done'],
    ['10:30', 'María F. Arellano', 'primera vez', 'now'],
    ['11:15', 'José Luis Padilla', 'post-op · día 12', 'next'],
    ['12:00', 'Ana Sofía Cortés', 'control · crónico', 'next'],
    ['13:30', '— bloque libre —', null, 'free'],
    ['14:00', 'Luis Ramírez Téllez', 'primera vez', 'next'],
    ['15:00', 'Dolores Bautista', 'control · 3m', 'next'],
    ['16:15', 'Andrés Quintero', 'post-op · día 4', 'next'],
  ];
  return (
    <aside style={{
      width: 320, background: 'var(--paper-2)', borderRight: '1px solid var(--rule)',
      display: 'flex', flexDirection: 'column', height: '100%',
    }}>
      <div style={{ padding: '20px 22px', borderBottom: '1px solid var(--rule)' }}>
        <HomeLogo color="var(--ink)" height={18} />
        <div style={{ marginTop: 18 }}>
          <div className="eyebrow">Dr. en sesión</div>
          <div style={{ fontSize: 14, fontWeight: 500, marginTop: 4 }}>Dr. Ricardo Solís M.</div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>endocrinología · ced. 8842711</div>
        </div>
      </div>

      <div style={{ padding: '16px 22px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div className="eyebrow">Agenda · mié 14 may</div>
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>9/12</span>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', padding: '0 14px' }}>
        {items.map(([t, n, tag, state], i) => {
          const active = i === activeIdx;
          const done = state === 'done';
          const free = state === 'free';
          const now = state === 'now';
          return (
            <div key={i} style={{
              position: 'relative',
              padding: '10px 12px 11px',
              borderRadius: 'var(--r-md)',
              background: active ? 'var(--ink)' : 'transparent',
              color: active ? 'var(--paper)' : 'var(--ink)',
              opacity: done ? 0.55 : free ? 0.5 : 1,
              display: 'grid', gridTemplateColumns: '46px 12px 1fr', gap: 8, alignItems: 'baseline',
              marginTop: 2,
            }}>
              <span className="mono" style={{ fontSize: 12, color: active ? 'rgba(255,255,255,0.7)' : 'var(--ink-3)' }}>{t}</span>
              <span style={{ paddingTop: 5 }}>
                {done && <Tick size={10} color={active ? 'var(--paper)' : 'var(--accent-ink)'} />}
                {now && <Dot color="var(--accent)" />}
                {state === 'next' && <Dot color={active ? 'var(--paper)' : 'var(--rule)'} />}
              </span>
              <div>
                <div style={{ fontSize: 13, lineHeight: 1.25, textDecoration: free ? 'none' : 'none' }}>{n}</div>
                {tag && (
                  <div className="mono" style={{ fontSize: 10.5, letterSpacing: '0.06em', color: active ? 'rgba(255,255,255,0.65)' : 'var(--ink-3)', marginTop: 2 }}>
                    {tag}{now ? ' · ahora' : ''}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ borderTop: '1px solid var(--rule)', padding: '14px 22px', display: 'flex', gap: 8 }}>
        <button className="btn sm ghost" style={{ flex: 1, justifyContent: 'center' }}>Pacientes</button>
        <button className="btn sm ghost" style={{ flex: 1, justifyContent: 'center' }}>Notas</button>
        <button className="btn sm ghost" style={{ flex: 1, justifyContent: 'center' }}>Ajustes</button>
      </div>
    </aside>
  );
}

// Top bar
function DoctorTopbar() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 28px', borderBottom: '1px solid var(--rule)', background: 'var(--paper)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.08em' }}>
          PACIENTES · M.F. ARELLANO
        </span>
        <span style={{ width: 1, height: 14, background: 'var(--rule)' }} />
        <span className="chip accent">primera consulta · 10:30</span>
        <span className="chip">vínculo recibido · hace 4 d</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, height: 36, padding: '0 14px',
          border: '1px solid var(--rule)', background: 'var(--white)', borderRadius: 'var(--r-md)', width: 320,
        }}>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>⌕</span>
          <span className="mono" style={{ fontSize: 12, color: 'var(--ink-3)' }}>buscar paciente, dx, medicamento…</span>
          <span style={{ flex: 1 }} />
          <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', border: '1px solid var(--rule)', padding: '1px 5px', borderRadius: 4 }}>⌘K</span>
        </div>
        <button className="btn sm ghost">+ Nota clínica</button>
        <button className="btn sm">Cerrar consulta →</button>
      </div>
    </div>
  );
}

// Severe alert banner
function AlertBanner() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 18,
      padding: '12px 28px',
      background: 'var(--alert-soft)', borderBottom: '1px solid var(--alert-rule)',
    }}>
      <span style={{
        fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.14em',
        padding: '4px 10px 5px', background: 'var(--alert)', color: 'var(--white)', borderRadius: 999,
        display: 'inline-flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ width: 6, height: 6, background: 'var(--white)', borderRadius: 99 }} />
        ALERGIA SEVERA
      </span>
      <span style={{ fontSize: 14, color: 'var(--ink)' }}>
        <strong>Penicilina</strong> — anafilaxia con edema laríngeo, 2019. <span style={{ color: 'var(--ink-3)' }}>Evitar β-lactámicos. Alternativa: macrólidos / clindamicina.</span>
      </span>
      <span style={{ flex: 1 }} />
      <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>verif por Dra. Galván · 12/oct/2023</span>
      <button className="btn sm ghost" style={{ borderColor: 'var(--alert-rule)' }}>Ver protocolo</button>
    </div>
  );
}

// Patient identity strip
function PatientStrip() {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr auto', gap: 28,
      padding: '28px 28px 24px', borderBottom: '1px solid var(--rule)', background: 'var(--paper)',
    }}>
      <div>
        <div className="eyebrow">Paciente</div>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 56, lineHeight: 1, fontWeight: 400, letterSpacing: '-0.025em', marginTop: 6 }}>
          María Fernanda Arellano Beltrán
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginTop: 14 }}>
          <span className="mono" style={{ fontSize: 12, color: 'var(--ink-2)' }}>♀ 34a</span>
          <span style={{ width: 1, height: 12, background: 'var(--rule)' }} />
          <span className="mono" style={{ fontSize: 12, color: 'var(--ink-2)' }}>nac. 18/03/1992</span>
          <span style={{ width: 1, height: 12, background: 'var(--rule)' }} />
          <span className="mono" style={{ fontSize: 12, color: 'var(--ink-2)' }}>O+ · 1.62 m · 58 kg · IMC 22.1</span>
          <span style={{ width: 1, height: 12, background: 'var(--rule)' }} />
          <span className="mono" style={{ fontSize: 12, color: 'var(--ink-2)' }}>CDMX · GAM</span>
          <span style={{ width: 1, height: 12, background: 'var(--rule)' }} />
          <span className="mono" style={{ fontSize: 12, color: 'var(--ink-2)' }}>id · imx_4f82c1</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 0, border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', overflow: 'hidden', alignSelf: 'end', background: 'var(--white)' }}>
        {[
          ['Última consulta', 'hace 4 m'],
          ['Médico anterior', 'Dra. P. Galván'],
          ['Adherencia', '94%'],
          ['Riesgo', 'bajo'],
        ].map(([k, v], i) => (
          <div key={i} className="spec-cell" style={{ borderRight: i < 3 ? '1px solid var(--rule)' : 0 }}>
            <span className="k">{k}</span>
            <span className="v">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Cuatro tarjetas tipo expediente
function ChartCard({ title, count, children, accent, tint }) {
  const tints = {
    cyan: 'var(--paper-3)',
    pale: 'var(--paper-2)',
    white: 'var(--white)',
  };
  const bg = tints[tint] || tints.white;
  return (
    <div style={{ border: '1px solid var(--rule)', background: bg, borderRadius: 'var(--r-xl)', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 1px 0 var(--rule-2)' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 18px', borderBottom: '1px solid var(--rule-2)',
      }}>
        <span className="eyebrow">{title}</span>
        <span className="mono" style={{ fontSize: 11, color: accent ? 'var(--accent-deep)' : 'var(--ink-3)' }}>{count}</span>
      </div>
      <div style={{ padding: '4px 0', flex: 1 }}>{children}</div>
    </div>
  );
}

function ChartRow({ a, b, c, severity }) {
  const sev = severity === 'high' ? 'var(--alert)' : severity === 'mid' ? 'var(--mid)' : 'var(--accent)';
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '4px 1fr 110px', gap: 12,
      padding: '10px 18px', alignItems: 'baseline',
      borderBottom: '1px solid var(--rule-3)',
    }}>
      <span style={{ width: 3, height: 3, borderRadius: 99, background: sev, marginTop: 6 }} />
      <div>
        <div style={{ fontSize: 13.5, color: 'var(--ink)' }}>{a}</div>
        {b && <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{b}</div>}
      </div>
      <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textAlign: 'right' }}>{c}</span>
    </div>
  );
}

function DoctorBody() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14, padding: 28 }}>
      <ChartCard title="Diagnósticos activos" count="4 activos · 1 resuelto" tint="white">
        <ChartRow a="Hipotiroidismo primario" b="CIE-10 E03.9 · desde 2018" c="activo" />
        <ChartRow a="Migraña con aura" b="CIE-10 G43.1 · desde 2021" c="activo" severity="mid" />
        <ChartRow a="Síndrome de ovario poliquístico" b="CIE-10 E28.2 · desde 2016" c="activo" />
        <ChartRow a="Deficiencia de hierro" b="CIE-10 D50.9 · desde 2024" c="activo" />
        <ChartRow a="Asma intermitente" b="CIE-10 J45.0 · 2003–2014" c="resuelto" severity="low" />
      </ChartCard>

      <ChartCard title="Medicación actual" count="3 activos · 1 PRN" tint="cyan">
        <ChartRow a="Levotiroxina 75 µg" b="1 tab · 06:30 · en ayunas" c="diario" />
        <ChartRow a="Sumatriptán 50 mg" b="PRN · máx 2 al día · migraña" c="PRN" severity="mid" />
        <ChartRow a="Sulfato ferroso 525 mg" b="1 tab · con jugo de naranja" c="diario" />
        <ChartRow a="Anticonceptivo oral" b="etinilestradiol + levonorgestrel" c="diario" />
        <ChartRow a="Omeprazol" b="suspendido — sept 2024" c="suspendido" severity="low" />
      </ChartCard>

      <ChartCard title="Cirugías & procedimientos" count="3 procedimientos" tint="white">
        <ChartRow a="Apendicectomía laparoscópica" b="H. Ángeles del Pedregal" c="sep 2017" />
        <ChartRow a="Septoplastia + turbinoplastia" b="H. Médica Sur" c="mar 2014" />
        <ChartRow a="Biopsia tiroidea por aspiración" b="H. Ángeles · resultado benigno" c="ago 2018" />
      </ChartCard>

      <ChartCard title="Estudios recientes" count="últimos 6 meses" tint="pale">
        <ChartRow a="TSH 4.8 mU/L · T4L 0.9 ng/dL" b="lab Olarte · 12/mar/2026" c="ajuste sug." severity="mid" />
        <ChartRow a="Biometría hemática completa" b="Hb 11.4 · VCM 78 — micro" c="08/mar/2026" severity="mid" />
        <ChartRow a="USG tiroides" b="parénquima heterogéneo · nód. 4 mm" c="22/ene/2026" />
        <ChartRow a="Perfil lipídico" b="LDL 98 · HDL 62 · TG 84" c="08/mar/2026" />
      </ChartCard>
    </div>
  );
}

// Timeline + signos vitales + nota
function DoctorRightStrip() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14, padding: '0 28px 28px' }}>
      {/* Timeline */}
      <div style={{ border: '1px solid var(--rule)', background: 'var(--white)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--rule-2)' }}>
          <span className="eyebrow">Línea de tiempo clínica</span>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>desde 2014 · 12 eventos</span>
        </div>
        <div style={{ padding: '18px 16px 22px', position: 'relative' }}>
          {/* axis */}
          <div style={{ height: 1, background: 'var(--rule)', margin: '12px 0 22px' }} />
          {/* events */}
          <div style={{ position: 'absolute', left: 16, right: 16, top: 32, height: 1, background: 'var(--rule)' }} />
          <div style={{ position: 'relative', height: 90, marginTop: -38 }}>
            {[
              { x: 4, y: 'top', label: 'septoplastia', date: "'14" },
              { x: 12, y: 'top', label: 'asma resuelto', date: "'14" },
              { x: 18, y: 'bot', label: 'dx SOP', date: "'16" },
              { x: 28, y: 'top', label: 'apendicectomía', date: "'17", sev: 'mid' },
              { x: 36, y: 'bot', label: 'dx hipotiroidismo', date: "'18", sev: 'mid' },
              { x: 44, y: 'top', label: 'biopsia tiroides', date: "'18" },
              { x: 56, y: 'bot', label: 'anafilaxia penicilina', date: "'19", sev: 'high' },
              { x: 64, y: 'top', label: 'dx migraña', date: "'21" },
              { x: 78, y: 'top', label: 'USG tiroides', date: "ene '26" },
              { x: 86, y: 'bot', label: 'BH · anemia', date: "mar '26" },
              { x: 92, y: 'top', label: 'TSH elevada', date: "mar '26", sev: 'mid' },
              { x: 98, y: 'bot', label: 'consulta · hoy', date: 'hoy', active: true },
            ].map((e, i) => {
              const top = e.y === 'top';
              return (
                <div key={i} style={{ position: 'absolute', left: `${e.x}%`, top: top ? 0 : 50, transform: 'translateX(-50%)' }}>
                  <div style={{
                    width: 1, height: 38,
                    background: e.active ? 'var(--accent)' : 'var(--rule)',
                    margin: '0 auto',
                  }} />
                  <div style={{
                    width: 7, height: 7, borderRadius: 99,
                    background: e.sev === 'high' ? 'var(--alert)' : e.sev === 'mid' ? 'var(--mid)' : e.active ? 'var(--accent)' : 'var(--ink)',
                    margin: '0 auto',
                  }} />
                  <div style={{
                    position: 'absolute', left: '50%', transform: 'translateX(-50%)',
                    top: top ? -28 : 46,
                    textAlign: 'center', whiteSpace: 'nowrap',
                  }}>
                    <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', letterSpacing: '0.06em' }}>{e.date}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink)', marginTop: 1 }}>{e.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>2014</span>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>2017</span>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>2020</span>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>2023</span>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--accent-ink)' }}>2026</span>
          </div>
        </div>
      </div>

      {/* Vitales + nota */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ border: '1px solid var(--rule)', background: 'var(--white)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--rule-2)' }}>
            <span className="eyebrow">Signos vitales · hoy</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>10:34 · enfermería</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', }}>
            {[
              ['PA', '118 / 76', 'mmHg', 'ok'],
              ['FC', '72', 'lpm', 'ok'],
              ['SpO₂', '98', '%', 'ok'],
              ['Temp', '36.7', '°C', 'ok'],
              ['Peso', '58.2', 'kg', '−0.4'],
              ['Glucosa cap.', '88', 'mg/dL', 'ok'],
            ].map(([k, v, u, n], i) => (
              <div key={i} style={{
                padding: '10px 14px', borderRight: i % 2 === 0 ? '1px solid var(--rule)' : 0,
                borderBottom: i < 4 ? '1px solid var(--rule)' : 0,
              }}>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{k}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
                  <span className="mono" style={{ fontSize: 18, letterSpacing: '-0.02em' }}>{v}</span>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{u}</span>
                  <span style={{ flex: 1 }} />
                  <span className="mono" style={{ fontSize: 10.5, color: n === 'ok' ? 'var(--ok)' : 'var(--ink-3)' }}>{n}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ border: '1px solid var(--rule)', background: 'var(--paper-3)', borderRadius: 'var(--r-xl)', padding: '16px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span className="eyebrow">Nota rápida · esta consulta</span>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>autosave · 10:36</span>
          </div>
          <div style={{ fontSize: 13.5, color: 'var(--ink)', lineHeight: 1.5, fontFamily: 'var(--mono)', whiteSpace: 'pre-line' }}>
            {`Acude por cefalea pulsátil hemicraneal de 3 días, asociada a fonofobia.
Sin déficit neurológico. TSH elevada — sugerir ajuste de levotiroxina a 88 µg.
Re-evaluar BH en 6 sem. Indicar dieta rica en hierro.`}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn sm">Guardar en expediente</button>
            <button className="btn sm ghost">+ Receta</button>
            <button className="btn sm ghost">+ Estudio</button>
            <button className="btn sm ghost">+ Seguimiento</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Compose
function DoctorScreen() {
  return (
    <div className="imx" style={{ width: 1440, height: 980, background: 'var(--paper)', display: 'grid', gridTemplateColumns: '320px 1fr' }} data-screen-label="Doctor · consola">
      <DoctorSidebar activeIdx={2} />
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <DoctorTopbar />
        <AlertBanner />
        <PatientStrip />
        <DoctorBody />
        <DoctorRightStrip />
      </div>
    </div>
  );
}

window.DoctorScreen = DoctorScreen;
