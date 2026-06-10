// imedexp · Paciente · PC · pantallas extra
// Mis signos vitales · Mis clínicas vinculadas · Avisos / notificaciones

const PAT_NAV_2 = [
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
const PAT_WHO_2 = ['M. F. Arellano', 'MA', 'paciente · O+'];

// ─── 1 · Mis signos vitales ────────────────────────────────────
function PatVitalsScreen() {
  const W = 740, H = 200, P = 28;
  const dates = ['12 feb', '04 mar', '21 mar', '08 abr', '24 abr', '02 may', '09 may', 'hoy'];
  const sys = [128, 134, 132, 130, 126, 124, 122, 119];
  const dia = [82, 86, 88, 84, 82, 80, 78, 76];
  const xs = (i) => P + (i * (W - 2 * P)) / (dates.length - 1);
  const ys = (v, min, max) => P + ((max - v) / (max - min)) * (H - 2 * P);
  return (
    <window.AdmPage
      label="AY · Paciente · Mis signos vitales"
      nav={PAT_NAV_2} active={4} role="Paciente" who={PAT_WHO_2} accent="accent-bright"
      title="Mis signos vitales" sub="Lo que el médico midió en consulta · GET /vitals/patient/{id}"
      searchHint=""
      height={1180}
      right={<button className="btn sm ghost" style={{ height: 42, borderRadius: 'var(--r-md)' }}><window.AdmIcon kind="plus" size={13} /> Anotar toma en casa</button>}
    >
      {/* hero last reading */}
      <div style={{ background: 'var(--ink)', color: 'var(--paper)', borderRadius: 'var(--r-xl)', padding: '24px 28px', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 40px -20px rgba(3,4,94,0.5)' }}>
        <div style={{ position: 'absolute', width: 360, height: 360, borderRadius: 999, background: 'radial-gradient(circle, rgba(0,180,216,0.32) 0%, transparent 70%)', top: -120, right: -90 }} />
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1.2fr repeat(4, 1fr)', gap: 16, alignItems: 'center' }}>
          <div>
            <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Última toma · hoy 10:32</span>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 30, lineHeight: 1.05, letterSpacing: '-0.02em', marginTop: 8 }}>
              Tu día va bien.
            </h2>
            <div className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>
              Dr. Vega · Clínica Roma Norte · hoy a las 10:32
            </div>
          </div>
          {[
            ['T/A',  '119 / 76', 'mmHg', '↓ 9 vs feb'],
            ['FC',   '68',        'lpm',  '↓ 10 vs feb'],
            ['Temp', '36.6',      '°C',   'normal'],
            ['SpO₂', '98',        '%',    'normal'],
          ].map(([k, n, u, tr], i) => (
            <div key={i}>
              <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>{k}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
                <span style={{ fontFamily: 'var(--serif)', fontSize: 30, lineHeight: 1, letterSpacing: '-0.02em' }}>{n}</span>
                <span className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{u}</span>
              </div>
              <div className="mono" style={{ fontSize: 10.5, color: '#A8E5C7', marginTop: 6, letterSpacing: '0.04em' }}>{tr}</div>
            </div>
          ))}
        </div>
      </div>

      {/* chart */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden', marginTop: 18 }}>
        <div style={{ padding: '14px 22px', borderBottom: '1px solid var(--rule-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 500 }}>Tu presión arterial está bajando · 8 tomas</h3>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>Desde feb 2026 · cambios pequeños y consistentes</div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[['T/A', true], ['FC'], ['Temp'], ['SpO₂'], ['Peso']].map(([k, on]) => (
              <window.AdmPill key={k} on={on}>{k}</window.AdmPill>
            ))}
          </div>
        </div>
        <div style={{ padding: 24 }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H }}>
            {/* healthy range band */}
            <rect x={P} y={ys(130, 60, 140)} width={W - 2 * P} height={ys(80, 60, 140) - ys(130, 60, 140)} fill="rgba(28,140,90,0.08)" />
            {[60, 80, 100, 120, 140].map((v, i) => {
              const y = ys(v, 60, 140);
              return <g key={v}>
                <line x1={P} x2={W - P} y1={y} y2={y} stroke="var(--rule-3)" strokeWidth="1" />
                <text x={4} y={y + 4} fontFamily="var(--mono)" fontSize="10" fill="var(--ink-3)">{v}</text>
              </g>;
            })}
            {dates.map((d, i) => <text key={d} x={xs(i)} y={H - 6} fontFamily="var(--mono)" fontSize="10" fill="var(--ink-3)" textAnchor="middle">{d}</text>)}
            <polyline fill="none" stroke="var(--ink)" strokeWidth="2.5" points={sys.map((v, i) => `${xs(i)},${ys(v, 60, 140)}`).join(' ')} />
            {sys.map((v, i) => <circle key={'s' + i} cx={xs(i)} cy={ys(v, 60, 140)} r="4" fill="var(--ink)" />)}
            <polyline fill="none" stroke="var(--accent)" strokeWidth="2.5" points={dia.map((v, i) => `${xs(i)},${ys(v, 60, 140)}`).join(' ')} />
            {dia.map((v, i) => <circle key={'d' + i} cx={xs(i)} cy={ys(v, 60, 140)} r="4" fill="var(--accent)" />)}
            {/* annotation */}
            <text x={xs(7)} y={ys(119, 60, 140) - 12} fontFamily="var(--serif)" fontStyle="italic" fontSize="13" fill="var(--ok)" textAnchor="middle">hoy ✓ rango normal</text>
          </svg>
          <div style={{ marginTop: 16, display: 'flex', gap: 18, flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--ink-2)' }}>
              <span style={{ width: 22, height: 3, background: 'var(--ink)', borderRadius: 99 }} /> Sistólica
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--ink-2)' }}>
              <span style={{ width: 22, height: 3, background: 'var(--accent)', borderRadius: 99 }} /> Diastólica
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--ink-2)' }}>
              <span style={{ width: 14, height: 14, borderRadius: 4, background: 'rgba(28,140,90,0.15)', border: '1px solid #BFE3CF' }} /> Rango saludable
            </span>
          </div>
        </div>
      </div>

      {/* insights + records */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 14, marginTop: 18 }}>
        <window.AdmCard title="Lo que esto significa">
          <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              ['Tensión arterial', 'En rango normal. Ha bajado ~9 puntos en 3 meses — buena señal.', 'ok'],
              ['Frecuencia cardiaca', 'Tu pulso en reposo bajó a 68. Esto es típico cuando duermes y caminas más.', 'ok'],
              ['Temperatura',         'Sin fiebre. Tu cuerpo está estable.', 'ok'],
              ['SpO₂',                'Saturación 98% — perfectamente normal a nivel del mar.', 'ok'],
            ].map(([k, t, tone], i) => (
              <div key={i} style={{ padding: '12px 14px', background: 'var(--paper)', borderRadius: 'var(--r-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 22, height: 22, borderRadius: 99, background: '#E5F5EE', color: 'var(--ok)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <window.AdmIcon kind="check" size={12} />
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{k}</span>
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 6, lineHeight: 1.5 }}>{t}</div>
              </div>
            ))}
          </div>
        </window.AdmCard>

        <window.AdmCard title="Histórico" action={<span className="mono" style={{ fontSize: 11, color: 'var(--accent-deep)' }}>Exportar →</span>}>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr 1fr 1fr', padding: '12px 18px', borderBottom: '1px solid var(--rule-2)', fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            <span>Fecha</span><span>T/A</span><span>FC</span><span>Temp</span><span>SpO₂</span>
          </div>
          {[
            ['hoy 10:32',  '119/76', '68', '36.6', '98'],
            ['09 may',     '122/78', '70', '36.7', '98'],
            ['02 may',     '124/80', '72', '36.5', '97'],
            ['24 abr',     '126/82', '74', '36.8', '97'],
            ['08 abr',     '130/84', '75', '36.6', '98'],
            ['21 mar',     '132/88', '79', '36.9', '98'],
            ['04 mar',     '134/86', '82', '36.7', '97'],
            ['12 feb',     '128/82', '78', '36.5', '98'],
          ].map((r, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr 1fr 1fr', padding: '12px 18px', alignItems: 'center', borderBottom: i < 7 ? '1px solid var(--rule-3)' : 0 }}>
              <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-2)' }}>{r[0]}</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 12.5, color: 'var(--ink)', fontWeight: 500 }}>{r[1]}</span>
              <span className="mono" style={{ fontSize: 12, color: 'var(--ink-2)' }}>{r[2]}</span>
              <span className="mono" style={{ fontSize: 12, color: 'var(--ink-2)' }}>{r[3]}</span>
              <span className="mono" style={{ fontSize: 12, color: 'var(--ink-2)' }}>{r[4]}</span>
            </div>
          ))}
        </window.AdmCard>
      </div>
    </window.AdmPage>
  );
}

// ─── 2 · Mis clínicas vinculadas ──────────────────────────────
function PatClinicsScreen() {
  const clinics = [
    {
      name: 'Clínica Roma Norte', city: 'CDMX · Av. Álvaro Obregón',
      since: 'feb 2024', principal: true,
      doctors: ['Dr. Damián Vega · cirugía', 'Dra. Lorena Padilla · medicina interna'],
      lastVisit: 'hoy 10:32', perms: 'expediente completo',
    },
    {
      name: 'Hospital ABC Sta. Fe', city: 'CDMX · Carlos Graef Fdez. 154',
      since: 'mar 2023',
      doctors: ['Dra. Mariana Sotelo · ginecología'],
      lastVisit: '02 may', perms: 'sólo ginecología',
    },
    {
      name: 'Centro Médico Polanco', city: 'CDMX · Horacio 1844',
      since: 'jul 2022',
      doctors: ['Dr. Sergio Mata · endocrinología (egresado)'],
      lastVisit: 'feb 2024', perms: 'archivado · sólo lectura',
      paused: true,
    },
  ];
  return (
    <window.AdmPage
      label="AZ · Paciente · Mis clínicas"
      nav={PAT_NAV_2} active={6} role="Paciente" who={PAT_WHO_2} accent="accent-bright"
      title="Mis clínicas vinculadas" sub="3 instituciones · tú decides quién ve qué"
      searchHint="Buscar clínica…"
      height={1180}
      right={<button className="btn sm ghost" style={{ height: 42, borderRadius: 'var(--r-md)' }}><window.AdmIcon kind="qr" size={13} /> Vincular con QR</button>}
    >
      {/* hero */}
      <div style={{ background: 'var(--paper-3)', border: '1px solid var(--accent-rule)', borderRadius: 'var(--r-xl)', padding: '22px 26px', display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 22 }}>
        <div>
          <span className="eyebrow">Tu expediente es tuyo</span>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 28, lineHeight: 1.1, letterSpacing: '-0.02em', marginTop: 6 }}>
            Aquí se ve cada clínica que tiene acceso<br />a tu información. Puedes revocar cuando quieras.
          </h2>
        </div>
        <button className="btn sm" style={{ height: 44, padding: '0 18px' }}>
          <window.AdmIcon kind="plus" size={14} color="#fff" /> Vincularme a una nueva clínica
        </button>
      </div>

      {/* list of clinics */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 18 }}>
        {clinics.map((c, i) => (
          <div key={i} style={{
            background: 'var(--white)',
            border: '1px solid ' + (c.principal ? 'var(--accent)' : 'var(--rule)'),
            borderRadius: 'var(--r-xl)', overflow: 'hidden',
            boxShadow: c.principal ? '0 14px 30px -20px rgba(0,150,199,0.35)' : 'none',
            opacity: c.paused ? 0.7 : 1,
          }}>
            <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: 'auto 1.4fr 1fr 1fr auto', gap: 22, alignItems: 'center' }}>
              <span style={{ width: 64, height: 64, borderRadius: 18, background: c.principal ? 'var(--accent-bright)' : 'var(--paper-4)', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 24 }}>
                {c.name.split(' ').filter(s => s[0] >= 'A' && s[0] <= 'Z').slice(0, 2).map(s => s[0]).join('')}
              </span>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 500 }}>{c.name}</h3>
                  {c.principal && <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, padding: '3px 8px', borderRadius: 999, background: 'var(--accent-bright)', color: 'var(--ink)', letterSpacing: '0.08em' }}>PRINCIPAL</span>}
                  {c.paused && <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, padding: '3px 8px', borderRadius: 999, background: 'var(--paper)', color: 'var(--ink-3)', letterSpacing: '0.08em' }}>ARCHIVADA</span>}
                </div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 4 }}>{c.city}</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>vinculada desde {c.since}</div>
              </div>
              <div>
                <div className="eyebrow">Médicos que te atienden</div>
                <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {c.doctors.map((d, j) => <span key={j} style={{ fontSize: 12, color: 'var(--ink-2)' }}>{d}</span>)}
                </div>
              </div>
              <div>
                <div className="eyebrow">Permisos otorgados</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink), marginTop: 6' }}>{c.perms}</div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 6 }}>última visita: {c.lastVisit}</div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexDirection: 'column' }}>
                <button className="btn sm ghost" style={{ height: 32, fontSize: 11 }}>
                  <window.AdmIcon kind="edit" size={12} /> Cambiar permisos
                </button>
                {c.paused
                  ? <button className="btn sm ghost" style={{ height: 32, fontSize: 11 }}>Reactivar</button>
                  : <button className="btn sm ghost" style={{ height: 32, fontSize: 11, color: 'var(--alert)', borderColor: 'var(--alert-rule)' }}>
                      <window.AdmIcon kind="x" size={12} color="var(--alert)" /> Desvincular
                    </button>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* note */}
      <div style={{ marginTop: 22, padding: '14px 18px', background: 'var(--ink)', color: 'var(--paper)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', gap: 14 }}>
        <window.AdmIcon kind="shield-2" size={20} color="var(--accent-bright)" />
        <div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Tu QR es la única manera de que nuevos médicos te lean</div>
          <div className="mono" style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>Si te atiende un médico distinto al de tus clínicas, te pedirá un QR temporal — tú decides qué compartir y por cuánto tiempo.</div>
        </div>
        <span style={{ flex: 1 }} />
        <button className="btn sm invert"><window.AdmIcon kind="qr" size={13} /> Generar QR</button>
      </div>
    </window.AdmPage>
  );
}

// ─── 3 · Avisos / notificaciones ──────────────────────────────
function PatNotifsScreen() {
  const items = [
    { kind: 'cita',  state: 'unread', icon: 'cal',    title: 'Tu consulta con Dr. Vega es hoy',     body: '10:30 · Clínica Roma Norte · cons. 712 · en 14 min',           ago: 'hace 12 min', actions: ['Confirmar asistencia', 'Reagendar'] },
    { kind: 'med',   state: 'unread', icon: 'pill',   title: 'Toma de levotiroxina',                 body: 'Eutirox 50 mcg · 1 tab en ayunas · marca como tomada',         ago: 'hace 1 h',    actions: ['Ya la tomé', 'Aplazar 30 min'] },
    { kind: 'lab',   state: 'read',   icon: 'doc',    title: 'Tus resultados de USG tiroides están listos', body: 'Lab Carpermor · validado por Dr. Vega · nód. 8 mm benigno',  ago: 'ayer 16:14', actions: ['Ver resultados'] },
    { kind: 'cycle', state: 'read',   icon: 'heart',  title: 'Predicción de tu próximo periodo',    body: 'jun 8 — jun 13 · confianza 88% · marcado en tu calendario',     ago: '12 may',      actions: ['Ver ciclo'] },
    { kind: 'qr',    state: 'read',   icon: 'qr',     title: 'Dra. Mariana Sotelo escaneó tu QR',  body: 'Acceso de 1 h · sólo ginecología · Hospital ABC',              ago: '10 may',      actions: ['Ver bitácora'] },
    { kind: 'inst',  state: 'read',   icon: 'build',  title: 'Clínica Roma Norte actualizó políticas', body: 'Encuesta de satisfacción tras consulta — puedes desactivarla', ago: '08 may',      actions: ['Revisar'] },
    { kind: 'cita',  state: 'read',   icon: 'cal',    title: 'Cita agendada · control endocrino',   body: '22 may 11:00 · Dra. Padilla',                                  ago: '07 may',      actions: ['Ver detalle'] },
    { kind: 'rx',    state: 'read',   icon: 'doc',    title: 'Receta firmada por Dr. Vega',          body: 'Sumatriptán 50 mg · uso prn migraña',                          ago: '04 may',      actions: ['Descargar PDF'] },
  ];
  const iconBg = { cita: 'var(--paper-3)', med: '#FCEFD7', lab: 'var(--paper-3)', cycle: '#FBE9E8', qr: 'var(--paper-3)', inst: 'var(--paper-3)', rx: 'var(--paper-3)' };
  const iconFg = { cita: 'var(--accent-deep)', med: 'var(--mid)', lab: 'var(--accent-deep)', cycle: 'var(--alert)', qr: 'var(--accent-deep)', inst: 'var(--accent-deep)', rx: 'var(--accent-deep)' };
  return (
    <window.AdmPage
      label="BA · Paciente · Avisos"
      nav={PAT_NAV_2} active={7} role="Paciente" who={PAT_WHO_2} accent="accent-bright"
      title="Avisos · tu bandeja" sub="2 sin leer · 12 esta semana"
      searchHint="Buscar aviso…"
      height={1160}
      right={<>
        <button className="btn sm ghost" style={{ height: 42, borderRadius: 'var(--r-md)' }}><window.AdmIcon kind="check" size={13} /> Marcar todo leído</button>
        <button className="btn sm ghost" style={{ height: 42, borderRadius: 'var(--r-md)' }}>Preferencias</button>
      </>}
    >
      {/* filters */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        {[['Todos', 12, true], ['Sin leer', 2, false, 'alert'], ['Citas', 4], ['Medicamentos', 3], ['Estudios', 2], ['Ciclo', 1], ['Clínicas', 2]].map(([k, n, on, tone]) => (
          <window.AdmPill key={k} on={on} count={n} tone={tone}>{k}</window.AdmPill>
        ))}
        <span style={{ flex: 1 }} />
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>Rango: 30 d ▾</span>
      </div>

      {/* feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 18 }}>
        {items.map((it, i) => (
          <div key={i} style={{
            background: it.state === 'unread' ? 'var(--white)' : 'var(--white)',
            border: '1px solid ' + (it.state === 'unread' ? 'var(--accent)' : 'var(--rule)'),
            borderRadius: 'var(--r-xl)', overflow: 'hidden',
            boxShadow: it.state === 'unread' ? '0 10px 26px -22px rgba(0,150,199,0.35)' : 'none',
          }}>
            <div style={{ padding: '16px 22px', display: 'grid', gridTemplateColumns: '44px 1fr auto auto', gap: 14, alignItems: 'center' }}>
              <span style={{ width: 40, height: 40, borderRadius: 11, background: iconBg[it.kind], color: iconFg[it.kind], display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <window.AdmIcon kind={it.icon} size={18} />
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: it.state === 'unread' ? 600 : 500 }}>{it.title}</span>
                  {it.state === 'unread' && <span style={{ width: 8, height: 8, borderRadius: 99, background: 'var(--accent-bright)' }} />}
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 4, lineHeight: 1.4 }}>{it.body}</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {it.actions.map((a, j) => (
                  <button key={j} className={'btn sm ' + (j === 0 && it.state === 'unread' ? '' : 'ghost')} style={{ height: 30, fontSize: 11 }}>{a}</button>
                ))}
              </div>
              <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>{it.ago}</span>
            </div>
          </div>
        ))}
      </div>
    </window.AdmPage>
  );
}

Object.assign(window, { PatVitalsScreen, PatClinicsScreen, PatNotifsScreen });
