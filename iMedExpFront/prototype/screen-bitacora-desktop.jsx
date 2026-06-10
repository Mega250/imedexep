// imedexp · Bitácora del personal médico · PC
// Vive en el apartado médico, habilitada para estudiantes, docentes, residentes y personal de apoyo.
// Form dinámico por perfil + editor de esquema + lista de entradas + tabla imprimible.

// NAV del médico extendido con "Bitácora"
const BIT_NAV = [
  ['home',   'Inicio'],
  ['users',  'Pacientes', '142'],
  ['cal',    'Agenda',    '5'],
  ['doc',    'Consultas'],
  ['inbox',  'Invitaciones', '2'],
  ['clock',  'Turnos'],
  ['scan',   'Escanear QR'],
  ['edit',   'Bitácora', '23'],
  ['user',   'Perfil'],
];
const BIT_WHO = ['E. Mendoza', 'EM', 'estudiante · 4to sem'];

// Esquemas por perfil — el usuario los puede editar (ver editor abajo)
const SCHEMAS = {
  estudiante: {
    label: 'Estudiante de medicina',
    color: 'accent',
    fields: [
      { k: 'no_control',  l: 'No. de control',     t: 'numero',   req: true,  w: 1 },
      { k: 'nombre',      l: 'Nombre completo',     t: 'texto',    req: true,  w: 2 },
      { k: 'edad',        l: 'Edad',                t: 'numero',   req: false, w: 1 },
      { k: 'spo2',        l: 'SpO₂ (%)',            t: 'numero',   req: true,  w: 1 },
      { k: 'pulso',       l: 'Pulso (lpm)',         t: 'numero',   req: true,  w: 1 },
      { k: 'ta',          l: 'T/A (mmHg)',          t: 'texto',    req: true,  w: 1 },
      { k: 'temp',        l: 'Temperatura (°C)',    t: 'numero',   req: false, w: 1 },
      { k: 'medicamento', l: 'Medicamento administrado', t: 'texto',req: false, w: 2 },
      { k: 'dosis',       l: 'Dosis',               t: 'texto',    req: false, w: 1 },
      { k: 'notas',       l: 'Notas / observaciones', t: 'multilinea', req: false, w: 3 },
    ],
  },
  docente: {
    label: 'Docente / profesor',
    color: 'mid',
    fields: [
      { k: 'no_emp',      l: 'No. de empleado',     t: 'numero',  req: true,  w: 1 },
      { k: 'nombre',      l: 'Nombre del docente',   t: 'texto',   req: true,  w: 2 },
      { k: 'depto',       l: 'Departamento',         t: 'select',  req: true,  w: 1 },
      { k: 'tipo',        l: 'Tipo de atención',     t: 'select',  req: true,  w: 1 },
      { k: 'hallazgos',   l: 'Hallazgos',            t: 'multilinea', req: true, w: 3 },
      { k: 'accion',      l: 'Acción realizada',     t: 'texto',   req: true,  w: 2 },
      { k: 'referido',    l: 'Referido a',           t: 'texto',   req: false, w: 1 },
    ],
  },
  admin: {
    label: 'Personal administrativo',
    color: 'ok',
    fields: [
      { k: 'no_emp',      l: 'No. de empleado',         t: 'numero',  req: true,  w: 1 },
      { k: 'nombre',      l: 'Nombre del personal',     t: 'texto',   req: true,  w: 2 },
      { k: 'area',        l: 'Área administrativa',     t: 'select',  req: true,  w: 1 },
      { k: 'tramite',     l: 'Trámite o actividad',     t: 'texto',   req: true,  w: 2 },
      { k: 'paciente_rel',l: 'Paciente / médico relacionado', t: 'texto', req: false, w: 2 },
      { k: 'folio',       l: 'Folio / documento',       t: 'texto',   req: false, w: 1 },
      { k: 'tiempo',      l: 'Tiempo invertido (min)',  t: 'numero',  req: false, w: 1 },
      { k: 'notas',       l: 'Notas',                   t: 'multilinea', req: false, w: 3 },
    ],
  },
};

// Datos de muestra para la tabla
const SAMPLE_ENTRIES = [
  { hora: '09:14', no_control: '20240314', nombre: 'María L. Cienfuegos',  edad: 24, spo2: 98, pulso: 76, ta: '118/74', temp: 36.5, medicamento: '—',                dosis: '—',     notas: 'Examen físico de rutina' },
  { hora: '10:02', no_control: '20240417', nombre: 'Carlos R. Téllez',      edad: 38, spo2: 96, pulso: 92, ta: '142/88', temp: 37.4, medicamento: 'Paracetamol',     dosis: '500 mg',notas: 'Cefalea + febrícula · supervisión Dr. Vega' },
  { hora: '10:48', no_control: '20240221', nombre: 'Lucía Hernández',       edad: 19, spo2: 99, pulso: 68, ta: '110/70', temp: 36.4, medicamento: 'Loratadina',       dosis: '10 mg', notas: 'Reacción alérgica leve' },
  { hora: '11:32', no_control: '20240509', nombre: 'Pablo Restrepo',        edad: 41, spo2: 97, pulso: 88, ta: '128/82', temp: 36.7, medicamento: 'Ibuprofeno',       dosis: '400 mg',notas: 'Dolor lumbar postcaída' },
  { hora: '12:15', no_control: '20240602', nombre: 'Sofía Olvera',          edad: 27, spo2: 98, pulso: 70, ta: '116/72', temp: 36.6, medicamento: 'Sales orales',      dosis: '1 sobre',notas: 'Deshidratación leve' },
  { hora: '13:04', no_control: '20240117', nombre: 'Diego Arteaga',         edad: 33, spo2: 97, pulso: 80, ta: '124/78', temp: 36.8, medicamento: '—',                 dosis: '—',     notas: 'Toma de signos vitales · alta' },
  { hora: '13:55', no_control: '20240728', nombre: 'Karla Mendoza Acosta',  edad: 29, spo2: 98, pulso: 74, ta: '120/76', temp: 36.6, medicamento: 'Hierro VO',         dosis: '100 mg',notas: 'Anemia leve · seguimiento' },
  { hora: '14:42', no_control: '20240813', nombre: 'Jorge L. Padilla',      edad: 52, spo2: 95, pulso: 96, ta: '146/94', temp: 37.1, medicamento: 'Losartán',          dosis: '50 mg', notas: 'HTA · referido a Dra. Padilla' },
  { hora: '15:20', no_control: '20240909', nombre: 'Renata Fernández',      edad: 22, spo2: 99, pulso: 72, ta: '112/70', temp: 36.5, medicamento: '—',                 dosis: '—',     notas: 'Educación en autocuidado' },
];

// Campo del form (sólo lectura visual; placeholder values)
function FieldInput({ field, value }) {
  const placeholder = value ?? (field.t === 'numero' ? '—' : field.t === 'select' ? 'Seleccionar…' : 'Escribe aquí…');
  const isLong = field.t === 'multilinea';
  return (
    <div style={{
      padding: '12px 14px',
      background: 'var(--paper)', border: '1px solid var(--rule)',
      borderRadius: 'var(--r-md)',
      gridColumn: `span ${field.w}`,
      minHeight: isLong ? 90 : 'auto',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{field.l}</span>
        {field.req && <span style={{ fontSize: 9, color: 'var(--alert)' }}>●</span>}
      </div>
      <div style={{
        fontFamily: 'var(--mono)', fontSize: 13.5, color: value ? 'var(--ink)' : 'var(--ink-3)',
        marginTop: 6, flex: 1,
        display: 'flex', alignItems: isLong ? 'flex-start' : 'center',
      }}>
        {placeholder}
        {field.t === 'select' && !value && <window.AdmIcon kind="chev-d" size={12} color="var(--ink-3)" />}
      </div>
    </div>
  );
}

// ─── Bitácora (PC) ────────────────────────────────────────────
function DocBitacoraScreen() {
  const profile = SCHEMAS.estudiante;
  // pre-fill the form with the FIRST sample entry to show what filled looks like
  const filled = SAMPLE_ENTRIES[7];

  return (
    <window.AdmPage
      label="BB · Médico · Bitácora del personal"
      nav={BIT_NAV} active={7} role="Médico · estudiante" who={BIT_WHO} accent="accent-bright"
      title="Mi bitácora" sub="Erick Mendoza · estudiante de medicina · 4to sem · UAEMex"
      searchHint="Buscar en mis registros…"
      height={1280}
      right={<>
        <button className="btn sm ghost" style={{ height: 42, borderRadius: 'var(--r-md)' }}><window.AdmIcon kind="copy" size={13} /> Editar esquema</button>
        <button className="btn sm" style={{ height: 42, borderRadius: 'var(--r-md)' }}><window.AdmIcon kind="doc" size={13} color="#fff" /> Imprimir tabla</button>
      </>}
    >
      {/* hero card with profile + access notice */}
      <div style={{ background: 'var(--ink)', color: 'var(--paper)', borderRadius: 'var(--r-xl)', padding: '20px 26px', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 40px -20px rgba(3,4,94,0.45)' }}>
        <div style={{ position: 'absolute', width: 340, height: 340, borderRadius: 999, background: 'radial-gradient(circle, rgba(0,180,216,0.3) 0%, transparent 70%)', top: -120, right: -80 }} />
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 22, alignItems: 'center' }}>
          <span style={{ width: 78, height: 78, borderRadius: 20, background: 'var(--accent-bright)', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 34 }}>EM</span>
          <div>
            <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Bitácora habilitada · pantalla restringida</span>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 36, lineHeight: 1, letterSpacing: '-0.02em', marginTop: 8 }}>Erick Mendoza Acosta</h2>
            <div style={{ display: 'flex', gap: 14, marginTop: 10, color: 'rgba(255,255,255,0.7)', fontSize: 12.5 }}>
              <span>Estudiante · medicina general</span>
              <span style={{ width: 1, height: 11, background: 'rgba(255,255,255,0.2)' }} />
              <span className="mono">control 20240821</span>
              <span style={{ width: 1, height: 11, background: 'rgba(255,255,255,0.2)' }} />
              <span>desde feb 2025</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontFamily: 'var(--serif)', fontSize: 44, lineHeight: 1 }}>9</span>
              <span className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>registros hoy</span>
            </div>
            <span className="mono" style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.55)' }}>247 este mes · 1 482 total</span>
          </div>
        </div>
      </div>

      {/* profile selector */}
      <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span className="eyebrow">Estoy registrando como</span>
        <div style={{ display: 'flex', gap: 6, flex: 1 }}>
          {[
            ['estudiante', 'Estudiante',              true],
            ['docente',    'Docente',                 false],
            ['admin',      'Personal administrativo', false],
          ].map(([k, lbl, on]) => (
            <span key={k} style={{
              padding: '8px 14px', borderRadius: 'var(--r-md)',
              background: on ? 'var(--ink)' : 'var(--white)',
              color:      on ? 'var(--paper)' : 'var(--ink-2)',
              border: '1px solid ' + (on ? 'var(--ink)' : 'var(--rule)'),
              fontSize: 12.5, fontWeight: 500, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>{lbl}{on && <span className="mono" style={{ fontSize: 10, opacity: 0.65 }}>activo</span>}</span>
          ))}
        </div>
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>cada perfil tiene su propio esquema</span>
      </div>

      {/* form + schema editor */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: 14, marginTop: 14 }}>
        {/* form */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 22px', borderBottom: '1px solid var(--rule-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 500 }}>Nuevo registro · {profile.label}</h3>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>Fecha y hora se asignan automáticamente al guardar</div>
            </div>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, padding: '3px 8px', borderRadius: 999, background: 'var(--paper-3)', color: 'var(--accent-deep)', letterSpacing: '0.08em' }}>{profile.fields.length} CAMPOS · 5 OBLIG.</span>
          </div>
          <div style={{ padding: 18 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {profile.fields.map((f) => <FieldInput key={f.k} field={f} value={filled[f.k]} />)}
            </div>
            <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--paper-3)', border: '1px solid var(--accent-rule)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <window.AdmIcon kind="clock" size={14} color="var(--accent-deep)" />
              <span className="mono" style={{ fontSize: 11.5, color: 'var(--accent-deep)' }}>Se guardará con fecha jueves 14 may 2026 · 14:48</span>
              <span style={{ flex: 1 }} />
              <button className="btn sm ghost" style={{ height: 32 }}>Limpiar</button>
              <button className="btn sm" style={{ height: 32 }}><window.AdmIcon kind="check" size={12} color="#fff" /> Guardar registro</button>
            </div>
          </div>
        </div>

        {/* schema editor */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--rule-2)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 500 }}>Mi esquema · estudiante</h3>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>Agrega, ordena o quita columnas. Cambia sólo para este perfil.</div>
          </div>
          <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 5 }}>
            {profile.fields.map((f, i) => (
              <div key={f.k} style={{ display: 'grid', gridTemplateColumns: '14px 1fr 80px 16px 14px', gap: 8, alignItems: 'center', padding: '8px 10px', background: 'var(--paper)', borderRadius: 'var(--r-md)' }}>
                <span style={{ display: 'flex', flexDirection: 'column', gap: 1, color: 'var(--ink-3)' }}>
                  <span style={{ width: 8, height: 1.5, background: 'currentColor' }} />
                  <span style={{ width: 8, height: 1.5, background: 'currentColor' }} />
                  <span style={{ width: 8, height: 1.5, background: 'currentColor' }} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.l}</div>
                  <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)' }}>{f.k}</div>
                </div>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, padding: '2px 7px', borderRadius: 999, background: 'var(--white)', border: '1px solid var(--rule)', color: 'var(--ink-2)', letterSpacing: '0.06em', textTransform: 'uppercase', textAlign: 'center' }}>{f.t}</span>
                {f.req
                  ? <span style={{ width: 10, height: 10, borderRadius: 99, background: 'var(--alert)' }} title="obligatorio" />
                  : <span style={{ width: 10, height: 10, borderRadius: 99, background: 'var(--rule)' }} />}
                <window.AdmIcon kind="x" size={12} color="var(--ink-3)" />
              </div>
            ))}
            {/* add new */}
            <div style={{ marginTop: 8, padding: '10px 12px', border: '1.5px dashed var(--rule)', borderRadius: 'var(--r-md)' }}>
              <span className="eyebrow">Agregar campo</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 6, marginTop: 8 }}>
                <div style={{ padding: '8px 10px', background: 'var(--paper)', borderRadius: 8, fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--ink-3)' }}>Etiqueta del campo…</div>
                <div style={{ padding: '8px 10px', background: 'var(--paper)', borderRadius: 8, fontSize: 11, color: 'var(--ink-3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  texto <window.AdmIcon kind="chev-d" size={11} />
                </div>
              </div>
              <div style={{ marginTop: 8, display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>Obligatorio</span>
                <span style={{ width: 32, height: 18, borderRadius: 99, background: 'var(--rule)', position: 'relative' }}>
                  <span style={{ position: 'absolute', top: 2, left: 2, width: 14, height: 14, borderRadius: 99, background: '#fff' }} />
                </span>
                <span style={{ flex: 1 }} />
                <button className="btn sm" style={{ height: 28, fontSize: 11 }}><window.AdmIcon kind="plus" size={11} color="#fff" /> Agregar</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* entries table */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden', marginTop: 18 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--rule-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 500 }}>Mis registros · hoy 14 may</h3>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>9 entradas · 5 con medicamento administrado</div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[['Hoy', 9, true], ['Esta semana', 38], ['Este mes', 247], ['Todo', 1482]].map(([k, n, on]) => (
              <window.AdmPill key={k} on={on} count={n}>{k}</window.AdmPill>
            ))}
            <button className="btn sm ghost" style={{ height: 28, fontSize: 11 }}><window.AdmIcon kind="doc" size={11} /> Imprimir</button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          {/* header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '70px 90px 1.4fr 50px 60px 60px 80px 70px 1fr 80px 1.4fr 40px',
            padding: '12px 18px', borderBottom: '1px solid var(--rule-2)',
            fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase',
            minWidth: 1100,
          }}>
            <span>Hora</span><span>No. ctrl</span><span>Nombre</span><span>Edad</span><span>SpO₂</span><span>Pulso</span><span>T/A</span><span>Temp</span><span>Medicamento</span><span>Dosis</span><span>Notas</span><span></span>
          </div>
          {SAMPLE_ENTRIES.map((e, i) => (
            <div key={i} style={{
              display: 'grid',
              gridTemplateColumns: '70px 90px 1.4fr 50px 60px 60px 80px 70px 1fr 80px 1.4fr 40px',
              padding: '12px 18px', alignItems: 'center',
              borderBottom: i < SAMPLE_ENTRIES.length - 1 ? '1px solid var(--rule-3)' : 0,
              minWidth: 1100,
            }}>
              <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-2)', fontWeight: 500 }}>{e.hora}</span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-2)' }}>{e.no_control}</span>
              <span style={{ fontSize: 12.5, fontWeight: 500 }}>{e.nombre}</span>
              <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-2)' }}>{e.edad}</span>
              <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-2)' }}>{e.spo2}%</span>
              <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-2)' }}>{e.pulso}</span>
              <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-2)' }}>{e.ta}</span>
              <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-2)' }}>{e.temp}°</span>
              <span style={{ fontSize: 12, color: 'var(--ink-2)' }}>{e.medicamento}</span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-2)' }}>{e.dosis}</span>
              <span style={{ fontSize: 11.5, color: 'var(--ink-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.notas}</span>
              <window.AdmIcon kind="more" size={14} color="var(--ink-3)" />
            </div>
          ))}
        </div>
      </div>

      {/* visibility note */}
      <div style={{ marginTop: 18, padding: '14px 18px', background: 'var(--paper-3)', border: '1px solid var(--accent-rule)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <window.AdmIcon kind="shield-2" size={18} color="var(--accent-deep)" />
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--accent-deep)' }}>Pantalla restringida por rol</div>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 4, lineHeight: 1.5 }}>
            Bitácora visible para: estudiante · docente · personal administrativo. El director controla qué roles ven cada menú desde Superadmin → Pantallas y permisos.
          </div>
        </div>
      </div>
    </window.AdmPage>
  );
}

// ─── Vista imprimible ─────────────────────────────────────────
function DocBitacoraPrintScreen() {
  return (
    <div data-screen-label="BC · Bitácora · vista imprimible" className="imx" style={{
      width: 1440, minHeight: 1900, padding: '60px 80px 80px',
      background: '#fff', fontFamily: 'var(--sans)', color: '#0a0a0a',
    }}>
      {/* paper header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: 20, borderBottom: '2px solid #000' }}>
        <div>
          <window.HomeLogo color="#000" height={20} />
          <div style={{ fontSize: 11, color: '#444', marginTop: 6, fontFamily: 'var(--mono)' }}>imedexp · bitácora del personal</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 34, lineHeight: 1, letterSpacing: '-0.02em' }}>Bitácora diaria</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#555', marginTop: 6 }}>14 de mayo de 2026 · jueves · 14:48</div>
        </div>
      </div>

      {/* identification block */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 0, marginTop: 20, border: '1px solid #000' }}>
        {[
          ['Nombre completo', 'Erick Mendoza Acosta'],
          ['No. de control',  '20240821'],
          ['Rol',             'Estudiante · medicina general · 4to sem'],
          ['Institución',     'Clínica Roma Norte · UAEMex'],
          ['Periodo',         '14 mayo 2026 · 07:00 — 15:00'],
          ['Supervisor',      'Dr. Damián Vega Ríos · céd. 8 421 776'],
          ['Total registros', '9 atenciones · 5 con medicamento'],
          ['Folio',           'BIT-2026-0514-EMA'],
        ].map(([k, v], i) => (
          <div key={i} style={{
            padding: '10px 14px',
            borderBottom: i < 4 ? '1px solid #000' : 0,
            borderRight: i % 4 !== 3 ? '1px solid #000' : 0,
          }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{k}</div>
            <div style={{ fontSize: 13, color: '#0a0a0a', marginTop: 4, fontWeight: 500 }}>{v}</div>
          </div>
        ))}
      </div>

      {/* main table */}
      <div style={{ marginTop: 24, border: '1px solid #000' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '50px 80px 90px 1.4fr 40px 50px 50px 70px 50px 1fr 70px 1.5fr',
          background: '#0a0a0a', color: '#fff',
          padding: '10px 12px',
          fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          <span>#</span><span>Hora</span><span>No. ctrl</span><span>Nombre completo</span><span>Edad</span><span>SpO₂</span><span>FC</span><span>T/A</span><span>T°</span><span>Medicamento</span><span>Dosis</span><span>Observaciones</span>
        </div>
        {SAMPLE_ENTRIES.map((e, i) => (
          <div key={i} style={{
            display: 'grid',
            gridTemplateColumns: '50px 80px 90px 1.4fr 40px 50px 50px 70px 50px 1fr 70px 1.5fr',
            padding: '10px 12px', alignItems: 'center',
            borderTop: i > 0 ? '1px solid #000' : 0,
            background: i % 2 === 0 ? '#fff' : '#f6f6f6',
            fontSize: 11.5, color: '#0a0a0a',
          }}>
            <span style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>{i + 1}</span>
            <span style={{ fontFamily: 'var(--mono)' }}>{e.hora}</span>
            <span style={{ fontFamily: 'var(--mono)' }}>{e.no_control}</span>
            <span style={{ fontWeight: 500 }}>{e.nombre}</span>
            <span style={{ fontFamily: 'var(--mono)' }}>{e.edad}</span>
            <span style={{ fontFamily: 'var(--mono)' }}>{e.spo2}%</span>
            <span style={{ fontFamily: 'var(--mono)' }}>{e.pulso}</span>
            <span style={{ fontFamily: 'var(--mono)' }}>{e.ta}</span>
            <span style={{ fontFamily: 'var(--mono)' }}>{e.temp}°</span>
            <span>{e.medicamento}</span>
            <span style={{ fontFamily: 'var(--mono)' }}>{e.dosis}</span>
            <span>{e.notas}</span>
          </div>
        ))}
      </div>

      {/* summary footer */}
      <div style={{ marginTop: 20, padding: '14px 18px', background: '#f0f0f0', border: '1px solid #000', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
        {[
          ['Atenciones',      '9'],
          ['Con medicamento', '5'],
          ['Hombres',         '4'],
          ['Mujeres',         '5'],
          ['Edad promedio',   '32.8 años'],
        ].map(([k, v], i) => (
          <div key={i}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{k}</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 24, lineHeight: 1, marginTop: 4 }}>{v}</div>
          </div>
        ))}
      </div>

      {/* signatures */}
      <div style={{ marginTop: 60, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80 }}>
        {[
          ['Erick Mendoza Acosta',    'Estudiante · control 20240821'],
          ['Dr. Damián Vega Ríos',   'Médico supervisor · céd. 8 421 776'],
        ].map(([n, r], i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ borderTop: '1px solid #000', paddingTop: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{n}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#555', marginTop: 4, letterSpacing: '0.04em' }}>{r}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 28, paddingTop: 16, borderTop: '1px dashed #999', fontFamily: 'var(--mono)', fontSize: 9.5, color: '#777', display: 'flex', justifyContent: 'space-between' }}>
        <span>Folio BIT-2026-0514-EMA · 1 / 1 página</span>
        <span>Impreso desde imedexp · 14 may 2026 14:48</span>
        <span>Conformidad NOM-024 · hoja de trabajo</span>
      </div>
    </div>
  );
}

Object.assign(window, { DocBitacoraScreen, DocBitacoraPrintScreen });
