// imedexp · Patient dashboard — mobile (iOS 14 frame · 390x844)

function QRBlock({ size = 96 }) {
  // synthetic clean grid that reads as a QR without being one
  const cells = [];
  const seed = (x, y) => ((x * 928371 + y * 12345 + (x ^ y) * 7) >>> 0) % 100;
  for (let y = 0; y < 21; y++) {
    for (let x = 0; x < 21; x++) {
      // corner finders
      const finder = (cx, cy) => Math.max(Math.abs(x - cx), Math.abs(y - cy)) <= 3;
      const inFinder = finder(3, 3) || finder(17, 3) || finder(3, 17);
      const isFinderBorder =
        (Math.max(Math.abs(x - 3), Math.abs(y - 3)) === 3) ||
        (Math.max(Math.abs(x - 17), Math.abs(y - 3)) === 3) ||
        (Math.max(Math.abs(x - 3), Math.abs(y - 17)) === 3);
      const isFinderCore =
        Math.max(Math.abs(x - 3), Math.abs(y - 3)) <= 1 ||
        Math.max(Math.abs(x - 17), Math.abs(y - 3)) <= 1 ||
        Math.max(Math.abs(x - 3), Math.abs(y - 17)) <= 1;
      let on = false;
      if (inFinder) on = isFinderBorder || isFinderCore;
      else on = seed(x, y) > 50;
      if (on) cells.push(<rect key={`${x},${y}`} x={x} y={y} width="1" height="1" fill="currentColor" />);
    }
  }
  return (
    <svg viewBox="0 0 21 21" width={size} height={size} style={{ display: 'block' }}>
      {cells}
    </svg>
  );
}

function PatientHome() {
  return (
    <div style={{
      width: 390, height: 844,
      background: 'var(--paper)', color: 'var(--ink)',
      fontFamily: 'var(--sans)', overflow: 'hidden', position: 'relative',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 22px 4px' }}>
        <HomeLogo color="var(--ink)" height={16} />
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <span style={{
            width: 32, height: 32, borderRadius: 99, background: 'var(--paper-3)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--mono)', fontSize: 12,
          }}>MF</span>
        </div>
      </div>

      <div style={{ padding: '14px 22px 0' }}>
        <div className="eyebrow">Mi expediente</div>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 38, lineHeight: 1.0, fontWeight: 400, marginTop: 6, letterSpacing: '-0.02em' }}>
          Hola,<br />María Fernanda.
        </h1>
      </div>

      {/* SCROLLY CONTENT */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 22px 16px' }}>
        {/* Próxima cita — dark hero card */}
        <div style={{
          background: 'var(--ink)', color: 'var(--paper)', borderRadius: 6,
          padding: '16px 18px 18px', marginTop: 16,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Próxima cita · en 2 h 14 min</span>
            <Pulse color="var(--paper)" />
          </div>
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span className="mono" style={{ fontSize: 32, letterSpacing: '-0.02em' }}>10:30</span>
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>mié 14 may</span>
          </div>
          <div style={{ marginTop: 6 }}>
            <div style={{ fontSize: 16, fontWeight: 500 }}>Dr. Ricardo Solís M.</div>
            <div className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>endocrinología · primera consulta</div>
            <div className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>av. paseo de la reforma 222 · piso 14</div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button className="btn sm invert" style={{ flex: 1, justifyContent: 'center' }}>Compartir mi historial</button>
            <button className="btn sm ghost" style={{ flex: 0, color: 'var(--paper)', borderColor: 'rgba(255,255,255,0.25)' }}>Cómo llegar</button>
          </div>
        </div>

        {/* QR / vínculo */}
        <div style={{
          marginTop: 14, background: 'var(--white)',
          border: '1px solid var(--rule)', borderRadius: 6, padding: 16,
          display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 16, alignItems: 'center',
        }}>
          <div style={{ width: 96, height: 96, background: 'var(--white)', color: 'var(--ink)', padding: 4, border: '1px solid var(--rule)', borderRadius: 4 }}>
            <QRBlock size={86} />
          </div>
          <div>
            <div className="eyebrow">Vínculo activo</div>
            <div className="mono" style={{ fontSize: 14, marginTop: 6 }}>imx.mx/<strong>m·ar7r-92x</strong></div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 4 }}>
              expira en 22 min · uso único
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
              <button className="btn sm" style={{ height: 28, fontSize: 11 }}>Mostrar al doctor</button>
              <button className="btn sm ghost" style={{ height: 28, fontSize: 11 }}>Renovar</button>
            </div>
          </div>
        </div>

        {/* Mi historial header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 26, marginBottom: 10 }}>
          <h2 style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em' }}>Mi historial</h2>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>actualizado hace 4 d</span>
        </div>

        {/* Alerta alergia — visible, alto contraste */}
        <div style={{
          background: 'var(--alert-soft)', border: '1px solid var(--alert-rule)',
          borderRadius: 6, padding: '12px 14px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em',
              padding: '3px 7px', background: 'var(--alert)', color: 'var(--white)', borderRadius: 2,
            }}>ALERGIA SEVERA</span>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--alert)', letterSpacing: '0.06em' }}>· avisa a cualquier médico</span>
          </div>
          <div style={{ marginTop: 8, fontSize: 14 }}>
            <strong>Penicilina</strong> — anafilaxia, 2019
          </div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 4 }}>
            Evitar β-lactámicos. Alternativa: macrólidos.
          </div>
        </div>

        {/* Resumen 4 bloques */}
        <div style={{
          marginTop: 12, border: '1px solid var(--rule)', background: 'var(--white)',
          borderRadius: 6, overflow: 'hidden',
        }}>
          {[
            ['Diagnósticos activos', '4', 'Hipotiroidismo · migraña · SOP · ferropenia'],
            ['Medicación', '3 + 1 PRN', 'Levotiroxina · sumatriptán · sulfato ferroso'],
            ['Cirugías', '3', 'Apendicectomía · septoplastia · biopsia'],
            ['Estudios recientes', '4', 'TSH · BH · USG tiroides · lípidos'],
          ].map(([k, n, body], i) => (
            <div key={i} style={{
              padding: '14px 16px',
              borderBottom: i < 3 ? '1px solid var(--rule)' : 0,
              display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center',
            }}>
              <div>
                <div className="eyebrow">{k}</div>
                <div style={{ fontSize: 14, marginTop: 4, color: 'var(--ink)' }}>{body}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span className="mono" style={{ fontSize: 14, color: 'var(--ink)' }}>{n}</span>
                <span style={{ fontSize: 18, color: 'var(--ink-3)', marginTop: -2 }}>›</span>
              </div>
            </div>
          ))}
        </div>

        {/* Hoy en mi cuerpo · pequeño "diario" */}
        <h2 style={{ fontSize: 18, fontWeight: 500, marginTop: 26, marginBottom: 10 }}>Hoy</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 6, padding: '12px 14px' }}>
            <div className="eyebrow">Tomar a las 06:30</div>
            <div style={{ fontSize: 14, marginTop: 6 }}>Levotiroxina <span className="mono" style={{ color: 'var(--ink-3)' }}>75µg</span></div>
            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
              <span className="chip accent" style={{ padding: '2px 6px' }}>✓ tomado</span>
            </div>
          </div>
          <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 6, padding: '12px 14px' }}>
            <div className="eyebrow">Pendiente — anota</div>
            <div style={{ fontSize: 14, marginTop: 6 }}>Cefalea matutina · 3er día</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
              <span className="chip" style={{ padding: '2px 6px' }}>+ síntoma</span>
            </div>
          </div>
        </div>

        {/* footer space */}
        <div style={{ height: 96 }} />
      </div>

      {/* tab bar */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '10px 16px 30px', background: 'var(--paper)',
        borderTop: '1px solid var(--rule)',
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
      }}>
        {[
          ['Hoy', true],
          ['Historial', false],
          ['Citas', false],
          ['Compartir', false],
        ].map(([label, active], i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span style={{
              width: 22, height: 22, borderRadius: 4,
              background: active ? 'var(--ink)' : 'transparent',
              border: active ? 'none' : '1px solid var(--rule)',
            }} />
            <span className="mono" style={{ fontSize: 10.5, color: active ? 'var(--ink)' : 'var(--ink-3)', letterSpacing: '0.06em' }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PatientScreen() {
  return (
    <div data-screen-label="Patient · móvil">
      <IOSDevice width={390} height={844} title="imedexp">
        <PatientHome />
      </IOSDevice>
    </div>
  );
}

window.PatientScreen = PatientScreen;
