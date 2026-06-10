// imedexp · Bitácora del personal médico · móvil
// Form dinámico + lista de entradas + acceso a vista imprimible

const BIT_TABS_M = [
  ['home',   'Inicio'],
  ['users',  'Pac.'],
  ['cal',    'Agenda'],
  ['doc',    'Cons.'],
  ['edit',   'Bitácora'],
  ['user',   'Perfil'],
];

function DocBitacoraMobile() {
  const fields = [
    ['No. control',    '20240813', 'numero'],
    ['Nombre',          'Jorge L. Padilla', 'texto'],
    ['Edad',            '52', 'numero'],
    ['SpO₂ (%)',         '95', 'numero'],
    ['Pulso (lpm)',      '96', 'numero'],
    ['T/A (mmHg)',       '146/94', 'texto'],
    ['Temperatura',      '37.1', 'numero'],
    ['Medicamento',      'Losartán', 'texto'],
    ['Dosis',            '50 mg', 'texto'],
    ['Notas',            'HTA · referido a Dra. Padilla', 'multilinea'],
  ];
  const entries = [
    { hora: '09:14', n: 'María L. Cienfuegos',  ta: '118/74', med: '—' },
    { hora: '10:02', n: 'Carlos R. Téllez',      ta: '142/88', med: 'Paracetamol' },
    { hora: '10:48', n: 'Lucía Hernández',       ta: '110/70', med: 'Loratadina' },
    { hora: '11:32', n: 'Pablo Restrepo',        ta: '128/82', med: 'Ibuprofeno' },
    { hora: '12:15', n: 'Sofía Olvera',          ta: '116/72', med: 'Sales VO' },
    { hora: '13:55', n: 'Karla Mendoza',         ta: '120/76', med: 'Hierro VO' },
    { hora: '14:42', n: 'Jorge L. Padilla',      ta: '146/94', med: 'Losartán' },
  ];
  return (
    <div data-screen-label="BB₂ · Médico · Bitácora (móvil)">
      <window.IOSDevice width={390} height={844} title="imedexp">
        <window.MbFrame tabs={BIT_TABS_M} active={4}
          fab={<window.MbFAB icon="check" label="Guardar registro" />}>
          <window.MbTop sub="Erick Mendoza · estudiante · 4to sem" title="Mi bitácora" right={
            <button className="btn sm ghost" style={{ height: 30, fontSize: 11, padding: '0 10px' }}>
              <window.MbIcon kind="doc" size={11} /> Imprimir
            </button>
          } />

          {/* identity card */}
          <div style={{ padding: '14px 20px 0' }}>
            <div style={{ background: 'var(--ink)', color: 'var(--paper)', borderRadius: 'var(--r-lg)', padding: 16, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', width: 220, height: 220, borderRadius: 999, background: 'radial-gradient(circle, rgba(0,180,216,0.32) 0%, transparent 70%)', top: -80, right: -50 }} />
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--accent-bright)', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 18 }}>EM</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 20, lineHeight: 1.05 }}>Erick Mendoza A.</div>
                  <div className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>control 20240821 · 4to sem · UAEMex</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontFamily: 'var(--serif)', fontSize: 26, lineHeight: 1 }}>9</span>
                  <div className="mono" style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)' }}>hoy</div>
                </div>
              </div>
            </div>
          </div>

          {/* profile pills */}
          <div style={{ padding: '12px 20px 0' }}>
            <span className="eyebrow">Registrando como</span>
            <div style={{ display: 'flex', gap: 6, marginTop: 8, overflowX: 'auto' }}>
              {[['Estudiante', true], ['Docente'], ['Admin.']].map(([k, on]) => (
                <window.MbPill key={k} on={on}>{k}</window.MbPill>
              ))}
            </div>
          </div>

          {/* form */}
          <window.MbSection title="Nuevo registro · estudiante" action="Editar esquema →">
            <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', padding: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {fields.map(([k, v, t], i) => (
                  <div key={i} style={{
                    padding: '10px 12px', background: 'var(--paper)', borderRadius: 'var(--r-md)',
                    minHeight: t === 'multilinea' ? 64 : 'auto',
                    display: 'flex', flexDirection: 'column',
                  }}>
                    <span className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{k}</span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 12.5, color: 'var(--ink)', marginTop: 4 }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10, padding: '10px 12px', background: 'var(--paper-3)', border: '1px solid var(--accent-rule)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <window.MbIcon kind="clock" size={12} color="var(--accent-deep)" />
                <span className="mono" style={{ fontSize: 10, color: 'var(--accent-deep)' }}>se guardará jue 14 may · 14:48</span>
              </div>
            </div>
          </window.MbSection>

          {/* recent entries */}
          <window.MbSection title="Registros de hoy · 7" action="Tabla →">
            {entries.map((e, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '52px 1fr 80px', gap: 10, alignItems: 'center', padding: '11px 12px', background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)', marginBottom: 5 }}>
                <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-2)', fontWeight: 500 }}>{e.hora}</span>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 500 }}>{e.n}</div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 2 }}>T/A {e.ta}</div>
                </div>
                <span className="mono" style={{ fontSize: 10, color: 'var(--accent-deep)', textAlign: 'right' }}>{e.med}</span>
              </div>
            ))}
          </window.MbSection>

          {/* visibility note */}
          <div style={{ padding: '4px 20px 20px' }}>
            <div style={{ padding: '11px 12px', background: 'var(--paper-3)', border: '1px solid var(--accent-rule)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <window.MbIcon kind="shield-2" size={14} color="var(--accent-deep)" />
              <div className="mono" style={{ fontSize: 10, color: 'var(--accent-deep)', lineHeight: 1.5 }}>
                Pantalla restringida · visible sólo para estudiantes, docentes y personal administrativo.
              </div>
            </div>
          </div>
        </window.MbFrame>
      </window.IOSDevice>
    </div>
  );
}

window.DocBitacoraMobile = DocBitacoraMobile;
