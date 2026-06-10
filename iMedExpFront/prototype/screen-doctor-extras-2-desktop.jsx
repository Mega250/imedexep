// imedexp · Doctor · PC · pantallas extra
// Signos vitales (registro + historial) · Expediente completo del paciente

const DOC_NAV_2 = [
  ['home',   'Inicio'],
  ['users',  'Pacientes', '142'],
  ['cal',    'Agenda',    '5'],
  ['doc',    'Consultas'],
  ['inbox',  'Invitaciones', '2'],
  ['clock',  'Turnos'],
  ['scan',   'Escanear QR'],
  ['user',   'Perfil'],
];
const DOC_WHO_2 = ['Dr. D. Vega', 'DV', 'cirugía general · céd. 8 421 776'];

// ─── 1 · Signos vitales (registro + historial) ────────────────
function DocVitalsScreen() {
  // chart data — last 8 visits
  const dates = ['12 feb', '04 mar', '21 mar', '08 abr', '24 abr', '02 may', '09 may', 'hoy'];
  const sys = [128, 134, 132, 130, 126, 124, 122, 119];
  const dia = [82, 86, 88, 84, 82, 80, 78, 76];
  const hr = [78, 82, 79, 75, 74, 72, 70, 68];
  const W = 700, H = 200, P = 28;
  const xs = (i) => P + (i * (W - 2 * P)) / (dates.length - 1);
  const ys = (v, min, max) => P + ((max - v) / (max - min)) * (H - 2 * P);
  return (
    <window.AdmPage
      label="AW · Doctor · Signos vitales"
      nav={DOC_NAV_2} active={1} role="Doctor" who={DOC_WHO_2} accent="accent-bright"
      title="Signos vitales · María F. Arellano" sub="← Pacientes · 34 años ♀ · O+ · POST /api/v1/vitals/"
      searchHint="Buscar fecha…"
      height={1180}
      right={<button className="btn sm" style={{ height: 42, borderRadius: 'var(--r-md)' }}><window.AdmIcon kind="plus" size={14} color="#fff" /> Registrar toma</button>}
    >
      {/* breadcrumb + summary band */}
      <div style={{ background: 'var(--ink)', color: 'var(--paper)', borderRadius: 'var(--r-xl)', padding: '22px 26px', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 40px -20px rgba(3,4,94,0.45)' }}>
        <div style={{ position: 'absolute', width: 320, height: 320, borderRadius: 999, background: 'radial-gradient(circle, rgba(0,180,216,0.3) 0%, transparent 70%)', top: -120, right: -80 }} />
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1.4fr repeat(4, 1fr)', gap: 16, alignItems: 'center' }}>
          <div>
            <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Última toma · hoy 10:32</span>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 30, lineHeight: 1.05, letterSpacing: '-0.02em', marginTop: 8 }}>
              María F. Arellano
            </h2>
            <div className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>
              ♀ 34a · O+ · IMC 23.4 · sin alertas
            </div>
          </div>
          {[
            ['T/A',    '119 / 76',  'mmHg', 'normal'],
            ['FC',     '68',         'lpm',  'normal'],
            ['Temp',   '36.6',       '°C',   'normal'],
            ['SpO₂',   '98',         '%',    'normal'],
          ].map(([k, n, u, tag], i) => (
            <div key={i}>
              <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>{k}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
                <span style={{ fontFamily: 'var(--serif)', fontSize: 30, lineHeight: 1, letterSpacing: '-0.02em' }}>{n}</span>
                <span className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{u}</span>
              </div>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, padding: '2px 6px', borderRadius: 999, background: 'rgba(28,140,90,0.25)', color: '#A8E5C7', letterSpacing: '0.08em', display: 'inline-block', marginTop: 6 }}>{tag.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* chart card */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden', marginTop: 18 }}>
        <div style={{ padding: '14px 22px', borderBottom: '1px solid var(--rule-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 15, fontWeight: 500 }}>Tendencia · últimas 8 visitas</h3>
          <div style={{ display: 'flex', gap: 6 }}>
            {[['T/A', true], ['FC'], ['Temp'], ['SpO₂'], ['Glucosa'], ['IMC']].map(([k, on]) => (
              <window.AdmPill key={k} on={on}>{k}</window.AdmPill>
            ))}
          </div>
        </div>
        <div style={{ padding: 24 }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H }}>
            {/* y-gridlines */}
            {[60, 80, 100, 120, 140].map((v, i) => {
              const y = ys(v, 60, 140);
              return <g key={v}>
                <line x1={P} x2={W - P} y1={y} y2={y} stroke="var(--rule-3)" strokeWidth="1" />
                <text x={4} y={y + 4} fontFamily="var(--mono)" fontSize="10" fill="var(--ink-3)">{v}</text>
              </g>;
            })}
            {/* x labels */}
            {dates.map((d, i) => <text key={d} x={xs(i)} y={H - 6} fontFamily="var(--mono)" fontSize="10" fill="var(--ink-3)" textAnchor="middle">{d}</text>)}
            {/* sys polyline */}
            <polyline fill="none" stroke="var(--ink)" strokeWidth="2" points={sys.map((v, i) => `${xs(i)},${ys(v, 60, 140)}`).join(' ')} />
            {sys.map((v, i) => <circle key={'s' + i} cx={xs(i)} cy={ys(v, 60, 140)} r="3.5" fill="var(--ink)" />)}
            {/* dia polyline */}
            <polyline fill="none" stroke="var(--accent)" strokeWidth="2" points={dia.map((v, i) => `${xs(i)},${ys(v, 60, 140)}`).join(' ')} />
            {dia.map((v, i) => <circle key={'d' + i} cx={xs(i)} cy={ys(v, 60, 140)} r="3.5" fill="var(--accent)" />)}
            {/* hr polyline (lighter, secondary) */}
            <polyline fill="none" stroke="var(--mid)" strokeWidth="1.5" strokeDasharray="4 3" points={hr.map((v, i) => `${xs(i)},${ys(v, 60, 140)}`).join(' ')} />
          </svg>
          <div style={{ display: 'flex', gap: 18, marginTop: 16, flexWrap: 'wrap' }}>
            {[
              ['var(--ink)',   'TA sistólica'],
              ['var(--accent)','TA diastólica'],
              ['var(--mid)',   'FC (referencia)'],
            ].map(([c, k], i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--ink-2)' }}>
                <span style={{ width: 22, height: 3, background: c, borderRadius: 99 }} />
                {k}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* table + new entry */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14, marginTop: 18 }}>
        <window.AdmCard title="Histórico de tomas">
          <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 1fr 1fr 1fr 1fr', padding: '12px 18px', borderBottom: '1px solid var(--rule-2)', fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            <span>Fecha</span><span>T/A</span><span>FC</span><span>Temp</span><span>SpO₂</span><span>Notas</span>
          </div>
          {[
            ['hoy 10:32', '119/76', '68', '36.6', '98', 'pre-consulta'],
            ['09 may',    '122/78', '70', '36.7', '98', 'control rutinario'],
            ['02 may',    '124/80', '72', '36.5', '97', 'tras yoga'],
            ['24 abr',    '126/82', '74', '36.8', '97', 'cefalea leve'],
            ['08 abr',    '130/84', '75', '36.6', '98', '—'],
            ['21 mar',    '132/88', '79', '36.9', '98', 'estrés laboral'],
            ['04 mar',    '134/86', '82', '36.7', '97', '—'],
            ['12 feb',    '128/82', '78', '36.5', '98', '1ª toma'],
          ].map((r, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 1fr 1fr 1fr 1fr', padding: '12px 18px', alignItems: 'center', borderBottom: i < 7 ? '1px solid var(--rule-3)' : 0 }}>
              <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-2)' }}>{r[0]}</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 12.5, color: 'var(--ink)', fontWeight: 500 }}>{r[1]}</span>
              <span className="mono" style={{ fontSize: 12, color: 'var(--ink-2)' }}>{r[2]}</span>
              <span className="mono" style={{ fontSize: 12, color: 'var(--ink-2)' }}>{r[3]}</span>
              <span className="mono" style={{ fontSize: 12, color: 'var(--ink-2)' }}>{r[4]}</span>
              <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{r[5]}</span>
            </div>
          ))}
        </window.AdmCard>

        <window.AdmCard title="Nueva toma">
          <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              ['Tensión arterial', '119 / 76', 'mmHg'],
              ['Frecuencia cardiaca', '68', 'lpm'],
              ['Temperatura', '36.6', '°C'],
              ['Saturación O₂', '98', '%'],
              ['Peso', '64.2', 'kg'],
              ['Glucosa capilar (opc.)', '—', 'mg/dL'],
            ].map(([k, v, u], i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 90px', gap: 8, alignItems: 'center', padding: '10px 12px', background: 'var(--paper)', borderRadius: 'var(--r-md)' }}>
                <div>
                  <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{k}</span>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 16, color: 'var(--ink)', marginTop: 4, fontWeight: 500 }}>{v}</div>
                </div>
                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textAlign: 'right' }}>{u}</span>
              </div>
            ))}
            <button className="btn sm block" style={{ marginTop: 8, justifyContent: 'center' }}>
              <window.AdmIcon kind="check" size={13} color="#fff" /> Guardar toma
            </button>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', textAlign: 'center' }}>POST /api/v1/vitals/</div>
          </div>
        </window.AdmCard>
      </div>
    </window.AdmPage>
  );
}

// ─── 2 · Expediente clínico completo ──────────────────────────
function DocPatientFullScreen() {
  return (
    <window.AdmPage
      label="AX · Doctor · Expediente completo"
      nav={DOC_NAV_2} active={1} role="Doctor" who={DOC_WHO_2} accent="accent-bright"
      title="Expediente · María F. Arellano" sub="GET /api/v1/patients/{id}/full"
      searchHint="Buscar dentro del expediente…"
      height={1280}
      right={<>
        <button className="btn sm ghost" style={{ height: 42, borderRadius: 'var(--r-md)' }}><window.AdmIcon kind="doc" size={13} /> Exportar PDF</button>
        <button className="btn sm" style={{ height: 42, borderRadius: 'var(--r-md)' }}>Empezar consulta</button>
      </>}
    >
      {/* hero */}
      <div style={{ background: 'var(--ink)', color: 'var(--paper)', borderRadius: 'var(--r-xl)', padding: '24px 28px', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 40px -20px rgba(3,4,94,0.5)' }}>
        <div style={{ position: 'absolute', width: 360, height: 360, borderRadius: 999, background: 'radial-gradient(circle, rgba(0,180,216,0.28) 0%, transparent 70%)', top: -120, right: -90 }} />
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 22, alignItems: 'center' }}>
          <span style={{ width: 84, height: 84, borderRadius: 22, background: 'var(--accent-bright)', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 38 }}>MA</span>
          <div>
            <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Expediente clínico · vinculada hace 4 m</span>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 38, lineHeight: 1, letterSpacing: '-0.02em', marginTop: 6 }}>María Fernanda Arellano Méndez</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10, color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
              <span>♀ 34 años · O+ Rh(+)</span>
              <span style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.2)' }} />
              <span className="mono">CURP AERM910312MDFRNR04</span>
              <span style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.2)' }} />
              <span>Cirugía general · Dr. Vega</span>
            </div>
          </div>
          {/* allergy badge */}
          <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(184,50,50,0.18)', border: '1px solid rgba(184,50,50,0.4)', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 9, padding: '3px 7px', borderRadius: 4, background: 'var(--alert)', color: '#fff', letterSpacing: '0.08em', width: 'fit-content' }}>ALERGIA SEVERA</span>
            <span style={{ fontSize: 12, color: '#FFC9C5' }}>Penicilina · anafilaxia 2019</span>
          </div>
        </div>
      </div>

      {/* tabs */}
      <div style={{ display: 'flex', gap: 6, marginTop: 18, flexWrap: 'wrap' }}>
        {[['Resumen', true], ['Vitales'], ['Diagnósticos'], ['Cirugías'], ['Medicación'], ['Alergias'], ['Vacunas'], ['Ciclo'], ['Estudios'], ['Familia']].map(([k, on]) => (
          <span key={k} style={{ padding: '7px 13px', borderRadius: 999, background: on ? 'var(--ink)' : 'var(--white)', color: on ? 'var(--paper)' : 'var(--ink-2)', border: '1px solid ' + (on ? 'var(--ink)' : 'var(--rule)'), fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>{k}</span>
        ))}
      </div>

      {/* 3-col grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr 1fr', gap: 14, marginTop: 14 }}>
        {/* col 1: diagnósticos + cirugías */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <window.AdmCard title="Diagnósticos activos · 4">
            <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                ['Hipotiroidismo subclínico',  'E03.9', 'desde 2019', 'controlado'],
                ['Migraña con aura',           'G43.1', 'desde 2017', 'episódica'],
                ['Síndrome ovario poliquíst.', 'E28.2', 'desde 2021', 'en seguimiento'],
                ['Anemia ferropénica leve',    'D50.9', 'desde 2024', 'tratamiento activo'],
              ].map(([n, ic, s, st], i) => (
                <div key={i} style={{ padding: '10px 12px', background: 'var(--paper)', borderRadius: 'var(--r-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 12.5, fontWeight: 500 }}>{n}</div>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, padding: '2px 7px', borderRadius: 999, background: 'var(--paper-3)', color: 'var(--accent-deep)', letterSpacing: '0.08em' }}>{ic}</span>
                  </div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 4 }}>{s} · {st}</div>
                </div>
              ))}
            </div>
          </window.AdmCard>

          <window.AdmCard title="Cirugías previas · 3">
            <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                ['Apendicectomía',           '2008', 'H. Ángeles', 'sin complicaciones'],
                ['Septoplastia',             '2014', 'H. ABC',     'recuperación normal'],
                ['Biopsia mamaria benigna',  '2021', 'C. Roma N.', 'BIRADS 2 · alta'],
              ].map(([n, y, h, note], i) => (
                <div key={i} style={{ padding: '10px 12px', background: 'var(--paper)', borderRadius: 'var(--r-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 12.5, fontWeight: 500 }}>{n}</div>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{y}</span>
                  </div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 4 }}>{h} · {note}</div>
                </div>
              ))}
            </div>
          </window.AdmCard>
        </div>

        {/* col 2: medicación + alergias */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <window.AdmCard title="Medicación vigente · 3">
            <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                ['Levotiroxina',  'Eutirox',         '50 mcg · 1/d',  'mañana en ayunas', 'verde'],
                ['Sumatriptán',   'Imigran',         '50 mg · prn',   'crisis migraña',   'amber'],
                ['Sulfato Fe',    'Ferro Sanol',     '100 mg · 1/d',  'cena',             'verde'],
              ].map(([gen, com, dose, when, tone], i) => (
                <div key={i} style={{ padding: '10px 12px', background: 'var(--paper)', borderRadius: 'var(--r-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 12.5, fontWeight: 500 }}>{gen}</div>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, padding: '2px 7px', borderRadius: 999, background: tone === 'verde' ? '#E5F5EE' : '#FCEFD7', color: tone === 'verde' ? 'var(--ok)' : 'var(--mid)', letterSpacing: '0.08em' }}>{tone.toUpperCase()}</span>
                  </div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 4 }}>{com} · {dose}</div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 2 }}>toma: {when}</div>
                </div>
              ))}
            </div>
          </window.AdmCard>

          <window.AdmCard title="Alergias · 2">
            <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                ['Penicilina',  'anafilaxia 2019',  'severa'],
                ['Polen gramíneas', 'rinitis estacional', 'leve'],
              ].map(([n, note, sev], i) => (
                <div key={i} style={{ padding: '10px 12px', background: sev === 'severa' ? 'var(--alert-soft)' : 'var(--paper)', border: sev === 'severa' ? '1px solid var(--alert-rule)' : 0, borderRadius: 'var(--r-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 12.5, fontWeight: 500, color: sev === 'severa' ? 'var(--alert)' : 'var(--ink)' }}>{n}</div>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, padding: '2px 7px', borderRadius: 999, background: sev === 'severa' ? 'var(--alert)' : 'var(--paper-3)', color: sev === 'severa' ? '#fff' : 'var(--accent-deep)', letterSpacing: '0.08em' }}>{sev.toUpperCase()}</span>
                  </div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 4 }}>{note}</div>
                </div>
              ))}
            </div>
          </window.AdmCard>

          <window.AdmCard title="Contacto de emergencia">
            <div style={{ padding: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr auto', gap: 10, alignItems: 'center', padding: '10px 12px', background: 'var(--paper)', borderRadius: 'var(--r-md)' }}>
                <span style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--accent-bright)', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 13 }}>EA</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>Eduardo Arellano · padre</div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>+52 55 4421 9087</div>
                </div>
                <button style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--paper-3)', color: 'var(--accent-deep)', border: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <window.AdmIcon kind="phone" size={13} />
                </button>
              </div>
            </div>
          </window.AdmCard>
        </div>

        {/* col 3: estudios + ciclo + vacunas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <window.AdmCard title="Estudios · últimos 90 días">
            <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                ['TSH · T4 libre',     '02 may', 'Chopo', 'TSH 4.8 ↑'],
                ['Biometría hemática', '02 may', 'Chopo', 'Hb 11.4 ↓'],
                ['USG tiroides',       '12 may', 'Carpermor', 'nód. 8 mm'],
                ['Perfil de lípidos',  '08 abr', 'Chopo', 'normal'],
              ].map(([n, d, lab, r], i) => (
                <div key={i} style={{ padding: '10px 12px', background: 'var(--paper)', borderRadius: 'var(--r-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 12.5, fontWeight: 500 }}>{n}</div>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{d}</span>
                  </div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 4 }}>{lab} · {r}</div>
                </div>
              ))}
            </div>
          </window.AdmCard>

          <window.AdmCard title="Ciclo menstrual">
            <div style={{ padding: 14 }}>
              <div style={{ padding: '12px 14px', background: 'var(--paper-3)', border: '1px solid var(--accent-rule)', borderRadius: 'var(--r-md)' }}>
                <span className="eyebrow">Próximo periodo</span>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 22, marginTop: 4, lineHeight: 1.05 }}>jun 8 — jun 13</div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 6 }}>regular · confianza 88% · ciclo medio 29.5 d</div>
              </div>
            </div>
          </window.AdmCard>

          <window.AdmCard title="Vacunas · esquema 12/12">
            <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                ['SARS-CoV-2 (Pfizer)', '4 dosis · última oct 24'],
                ['Influenza estacional','anual · oct 24'],
                ['Triple viral · SRP',  '2 dosis · niñez'],
                ['Td · refuerzo',        'última 2018'],
              ].map(([n, d], i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '24px 1fr', gap: 10, alignItems: 'center', padding: '8px 10px', background: 'var(--paper)', borderRadius: 'var(--r-md)' }}>
                  <span style={{ width: 20, height: 20, borderRadius: 99, background: '#E5F5EE', color: 'var(--ok)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <window.AdmIcon kind="check" size={12} />
                  </span>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 500 }}>{n}</div>
                    <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{d}</div>
                  </div>
                </div>
              ))}
            </div>
          </window.AdmCard>
        </div>
      </div>

      {/* consults log */}
      <window.AdmCard title="Consultas en esta clínica · 12">
        <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 1.4fr 1fr 90px', padding: '12px 18px', borderBottom: '1px solid var(--rule-2)', fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <span>Fecha</span><span>Médico</span><span>Diagnóstico / motivo</span><span>Receta</span><span></span>
        </div>
        {[
          ['hoy',     'Dr. D. Vega',     '1ª consulta · valoración vesícula', 'pendiente', 'en curso'],
          ['11 abr',  'Dra. L. Padilla', 'Control endocrino · TSH ↑',        'levotiroxina', ''],
          ['28 mar',  'Dr. D. Vega',     'Migraña con aura · profilaxis',     'sumatriptán', ''],
          ['12 mar',  'Dra. L. Padilla', 'Anemia ferropénica',                 'sulfato Fe', ''],
          ['02 mar',  'Dra. M. Sotelo',  'Control ginecológico anual',        'ninguna',    ''],
          ['12 feb',  'Dr. D. Vega',     'Vinculación · 1ª toma',              'ninguna',    ''],
        ].map((r, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 1.4fr 1fr 90px', padding: '12px 18px', alignItems: 'center', borderBottom: i < 5 ? '1px solid var(--rule-3)' : 0, background: i === 0 ? 'var(--paper-3)' : 'transparent' }}>
            <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-2)' }}>{r[0]}</span>
            <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-2)' }}>{r[1]}</span>
            <span style={{ fontSize: 12.5, color: 'var(--ink)' }}>{r[2]}</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--accent-deep)' }}>{r[3]}</span>
            {r[4]
              ? <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, padding: '3px 8px', borderRadius: 999, background: 'var(--accent-bright)', color: 'var(--ink)', letterSpacing: '0.06em', width: 'fit-content' }}>{r[4].toUpperCase()}</span>
              : <window.AdmIcon kind="chev" size={14} color="var(--ink-3)" />}
          </div>
        ))}
      </window.AdmCard>
    </window.AdmPage>
  );
}

Object.assign(window, { DocVitalsScreen, DocPatientFullScreen });
