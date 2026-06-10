// imedexp · Doctor · móvil · pantallas extra
// Invitaciones de clínicas · Turnos · Escanear QR · Vitales paciente · Expediente completo

// Mobile doctor uses existing TABS from screen-doctor-mobile (Inicio · Pacientes · Agenda · Consultas · Recetas · Validar · Perfil = 7 tabs).
// We add an 8th tab "Más" for invites/shifts/QR. To avoid conflict, we just don't show a tab bar on the new screens — they're drill-ins/menu items.

const DOCdev = ({ children }) => <window.IOSDevice width={390} height={844} title="imedexp">{children}</window.IOSDevice>;

// ─── 1 · Invitaciones de clínicas ─────────────────────────────
function DocInvitesMobile() {
  const queue = [
    {
      inst: 'Clínica Roma Norte',  city: 'CDMX',         plan: 'Pro',
      from: 'Lic. R. Coria · directora',
      role: 'Médico asociado · cirugía general',
      msg: 'Damián, ya hablamos del bloque quirúrgico — te paso la invitación formal.',
      sent: 'hace 2 d', vence: 'en 5 d',
      state: 'pendiente', sel: true,
    },
    {
      inst: 'Centro ABC Sta. Fe',  city: 'CDMX',         plan: 'Enterprise',
      from: 'Dr. R. Vega · director médico',
      role: 'Médico asociado · cirugía hepatobiliar',
      sent: 'hace 4 d', vence: 'en 3 d',
      state: 'pendiente',
    },
  ];
  const sel = queue[0];
  return (
    <div data-screen-label="AF₂ · Doctor · Invitaciones (móvil)">
      <DOCdev>
        <window.MbFrame noTabs>
          <window.MbTop back="Más opciones" sub="2 pendientes · responde antes de que venzan" title="Invitaciones a clínicas" />
          <div style={{ padding: '12px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <window.MbStat k="Pendientes" n="2" sub="Roma N. · ABC" tone="alert" />
            <window.MbStat k="Vencen pronto" n="1" sub="ABC · 3 d" />
          </div>

          {/* detail of selected */}
          <div style={{ padding: '14px 20px 0' }}>
            <div style={{ background: 'var(--white)', border: '2px solid var(--accent)', borderRadius: 'var(--r-lg)', overflow: 'hidden', boxShadow: '0 10px 24px -16px rgba(0,150,199,0.35)' }}>
              <div style={{ background: 'var(--ink)', color: 'var(--paper)', padding: '14px 16px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: 999, background: 'radial-gradient(circle, rgba(0,180,216,0.3) 0%, transparent 70%)', top: -80, right: -50 }} />
                <div style={{ position: 'relative' }}>
                  <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Invitación · {sel.sent}</span>
                  <h3 style={{ fontFamily: 'var(--serif)', fontSize: 22, lineHeight: 1.05, marginTop: 4 }}>{sel.inst}</h3>
                  <div className="mono" style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.6)', marginTop: 6 }}>{sel.city} · plan {sel.plan}</div>
                </div>
              </div>
              <div style={{ padding: 16 }}>
                <span className="eyebrow">Te invita</span>
                <div style={{ marginTop: 6, padding: '10px 12px', background: 'var(--paper)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--paper-3)', color: 'var(--accent-deep)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 12 }}>RC</span>
                  <div style={{ fontSize: 12.5 }}>{sel.from}</div>
                </div>
                <span className="eyebrow" style={{ marginTop: 12, display: 'block' }}>Rol propuesto</span>
                <div style={{ padding: '10px 12px', background: 'var(--paper)', borderRadius: 'var(--r-md)', fontSize: 12.5, marginTop: 6 }}>{sel.role}</div>
                <span className="eyebrow" style={{ marginTop: 12, display: 'block' }}>Mensaje</span>
                <div className="serif" style={{ fontStyle: 'italic', fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.45, padding: '4px 0 4px 12px', borderLeft: '2px solid var(--accent-rule)', marginTop: 6 }}>
                  «{sel.msg}»
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <button className="btn" style={{ flex: 1, justifyContent: 'center', height: 44 }}>
                    <window.MbIcon kind="check" size={13} color="#fff" /> Aceptar
                  </button>
                  <button className="btn ghost" style={{ flex: 1, justifyContent: 'center', height: 44, color: 'var(--alert)', borderColor: 'var(--alert-rule)' }}>
                    <window.MbIcon kind="x" size={13} color="var(--alert)" /> Rechazar
                  </button>
                </div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', textAlign: 'center', marginTop: 8 }}>vence {sel.vence} · PATCH /invitations/{`{id}`}</div>
              </div>
            </div>
          </div>

          <window.MbSection title="Otras invitaciones">
            {queue.slice(1).map((q, i) => (
              <div key={i} style={{ padding: '12px 14px', background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)', marginBottom: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{q.inst}</div>
                    <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 3 }}>{q.city} · plan {q.plan} · {q.sent}</div>
                  </div>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 9, padding: '3px 7px', borderRadius: 999, background: 'var(--alert-soft)', color: 'var(--alert)', letterSpacing: '0.06em' }}>{q.state.toUpperCase()}</span>
                </div>
              </div>
            ))}
          </window.MbSection>
          <div style={{ height: 20 }} />
        </window.MbFrame>
      </DOCdev>
    </div>
  );
}

// ─── 2 · Turnos / horarios ────────────────────────────────────
function DocShiftsMobile() {
  const days = [
    { d: 'Lun', sh: [{ s: 8, e: 13, k: 'Consulta', w: 'Cons. 712' }, { s: 14, e: 16, k: 'Quirófano', w: 'OR 3' }] },
    { d: 'Mar', sh: [{ s: 9, e: 14, k: 'Consulta', w: 'Cons. 712' }] },
    { d: 'Mié', sh: [{ s: 8, e: 13, k: 'Consulta', w: 'Cons. 712' }, { s: 15, e: 18, k: 'Consulta', w: 'Cons. 712' }] },
    { d: 'Jue', sh: [{ s: 8, e: 12, k: 'Quirófano', w: 'OR 2' }, { s: 13, e: 17, k: 'Consulta', w: 'Cons. 712' }] },
    { d: 'Vie', sh: [{ s: 9, e: 14, k: 'Consulta', w: 'Cons. 712' }] },
    { d: 'Sáb', sh: [{ s: 9, e: 12, k: 'Consulta', w: 'Cons. 712' }] },
  ];
  return (
    <div data-screen-label="AG₂ · Doctor · Turnos (móvil)">
      <DOCdev>
        <window.MbFrame noTabs
          fab={<window.MbFAB icon="plus" label="Nuevo turno" />}>
          <window.MbTop back="Más opciones" sub="GET/POST /doctors/{id}/shifts" title="Mis turnos" />
          <div style={{ padding: '12px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <window.MbStat k="Horas / semana" n="38" sub="32 cons · 6 OR" />
            <window.MbStat k="Días activos" n="6" sub="lun a sáb" />
            <window.MbStat k="Consultorios" n="2" sub="712 · OR 2/3" />
            <window.MbStat k="Capacidad / sem" n="≈ 108" sub="20 min / cita" />
          </div>

          <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {days.map((d, i) => (
              <div key={i} style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--rule-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{d.d}</span>
                  <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-2)' }}>{d.sh.reduce((a, s) => a + (s.e - s.s), 0)} h</span>
                </div>
                <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {d.sh.map((s, j) => {
                    const isOR = s.k === 'Quirófano';
                    return (
                      <div key={j} style={{
                        padding: '10px 12px',
                        background: isOR ? 'var(--ink)' : 'var(--paper-3)',
                        color: isOR ? 'var(--paper)' : 'var(--accent-deep)',
                        border: '1px solid ' + (isOR ? 'var(--ink)' : 'var(--accent-rule)'),
                        borderRadius: 8,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      }}>
                        <div>
                          <div style={{ fontSize: 12.5, fontWeight: 500 }}>{s.k}</div>
                          <div className="mono" style={{ fontSize: 10, opacity: 0.75, marginTop: 2 }}>{s.s}:00 — {s.e}:00 · {s.w}</div>
                        </div>
                        <window.MbIcon kind="edit" size={13} color={isOR ? '#fff' : 'var(--accent-deep)'} />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </window.MbFrame>
      </DOCdev>
    </div>
  );
}

// ─── 3 · Escanear QR ──────────────────────────────────────────
function DocQRMobile() {
  const recent = [
    ['María F. Arellano', 'hace 12 min', 'consulta'],
    ['Carlos Mendoza',    'hace 1 h',    'consulta'],
    ['José L. Padilla',   'ayer 16:40',  'urgencias'],
  ];
  return (
    <div data-screen-label="AH₂ · Doctor · Escanear QR (móvil)">
      <DOCdev>
        <window.MbFrame noTabs>
          <window.MbTop back="Más opciones" sub="POST /qr-access/redeem · vigencia 5 min" title="Escanear QR" />

          {/* camera */}
          <div style={{ padding: '14px 20px 0' }}>
            <div style={{
              position: 'relative', width: '100%', aspectRatio: '1 / 1',
              borderRadius: 'var(--r-lg)',
              background: 'repeating-linear-gradient(45deg, #0B1240 0 14px, #0F1A55 14px 28px)',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: 220, height: 220, border: '2px solid var(--accent-bright)', borderRadius: 14,
              }}>
                {[[0,0,'tl'],[0,1,'tr'],[1,0,'bl'],[1,1,'br']].map(([r, c, k]) => (
                  <span key={k} style={{
                    position: 'absolute',
                    [r ? 'bottom' : 'top']: -2, [c ? 'right' : 'left']: -2,
                    width: 30, height: 30,
                    borderTop:    r ? 0 : '3px solid var(--accent-bright)',
                    borderBottom: r ? '3px solid var(--accent-bright)' : 0,
                    borderLeft:   c ? 0 : '3px solid var(--accent-bright)',
                    borderRight:  c ? '3px solid var(--accent-bright)' : 0,
                  }} />
                ))}
                <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 2, background: 'var(--accent-bright)', boxShadow: '0 0 16px var(--accent-bright)' }} />
              </div>
              <div style={{ position: 'absolute', top: 12, left: 12, color: '#fff', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.08em' }}>● cámara · auto</div>
              <div style={{ position: 'absolute', bottom: 12, right: 12, color: '#fff', fontFamily: 'var(--mono)', fontSize: 10 }}>buscando…</div>
            </div>
          </div>

          {/* manual code */}
          <div style={{ padding: '14px 20px 0' }}>
            <span className="eyebrow">O pega el código manualmente</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 5, marginTop: 8 }}>
              {['7', 'F', '4', 'K', '9', '', '', ''].map((c, i) => (
                <div key={i} style={{
                  height: 38, borderRadius: 'var(--r-md)',
                  border: '1.5px solid ' + (c ? 'var(--ink)' : i === 5 ? 'var(--accent)' : 'var(--rule)'),
                  background: 'var(--white)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 500, color: 'var(--ink)',
                }}>{c}</div>
              ))}
            </div>
            <button className="btn block" style={{ marginTop: 14, height: 44, justifyContent: 'center', fontSize: 13, borderRadius: 'var(--r-md)' }}>
              Canjear acceso <window.MbIcon kind="arrow" size={13} color="#fff" />
            </button>
            <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', textAlign: 'center', marginTop: 8 }}>expira a los 5 min de generado</div>
          </div>

          <window.MbSection title="Accesos recientes">
            {recent.map(([n, when, kind], i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '32px 1fr auto', gap: 10, alignItems: 'center', padding: '11px 12px', background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)', marginBottom: 6 }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--paper-3)', color: 'var(--accent-deep)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <window.MbIcon kind="scan" size={12} />
                </span>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 500 }}>{n}</div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{kind}</div>
                </div>
                <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{when}</span>
              </div>
            ))}
          </window.MbSection>
          <div style={{ height: 20 }} />
        </window.MbFrame>
      </DOCdev>
    </div>
  );
}

// ─── 4 · Vitales del paciente ─────────────────────────────────
function DocVitalsMobile() {
  const W = 350, H = 140, P = 22;
  const dates = ['12 feb', '21 mar', '08 abr', '24 abr', '02 may', '09 may', 'hoy'];
  const sys = [128, 132, 130, 126, 124, 122, 119];
  const dia = [82, 88, 84, 82, 80, 78, 76];
  const xs = (i) => P + (i * (W - 2 * P)) / (dates.length - 1);
  const ys = (v, min, max) => P + ((max - v) / (max - min)) * (H - 2 * P);
  return (
    <div data-screen-label="AW₂ · Doctor · Vitales paciente (móvil)">
      <DOCdev>
        <window.MbFrame noTabs
          fab={<window.MbFAB icon="plus" label="Registrar toma" />}>
          <window.MbTop back="Expediente · M. Arellano" sub="POST /vitals/" title="Signos vitales" />

          {/* hero current */}
          <div style={{ padding: '14px 20px 0' }}>
            <div style={{ background: 'var(--ink)', color: 'var(--paper)', borderRadius: 'var(--r-lg)', padding: 16, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', width: 220, height: 220, borderRadius: 999, background: 'radial-gradient(circle, rgba(0,180,216,0.3) 0%, transparent 70%)', top: -80, right: -50 }} />
              <div style={{ position: 'relative' }}>
                <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Última toma · hoy 10:32</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
                  {[['T/A','119/76','mmHg'], ['FC','68','lpm'], ['Temp','36.6','°C'], ['SpO₂','98','%']].map(([k, n, u], i) => (
                    <div key={i}>
                      <div className="eyebrow" style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)' }}>{k}</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 2 }}>
                        <span style={{ fontFamily: 'var(--serif)', fontSize: 24, lineHeight: 1 }}>{n}</span>
                        <span className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>{u}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <window.MbSection title="Tendencia · 7 visitas">
            <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', padding: 14 }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                {[['T/A', true], ['FC'], ['Temp'], ['SpO₂']].map(([k, on]) => (
                  <window.MbPill key={k} on={on}>{k}</window.MbPill>
                ))}
              </div>
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H }}>
                {[80, 100, 120, 140].map((v) => {
                  const y = ys(v, 60, 140);
                  return <line key={v} x1={P} x2={W - P} y1={y} y2={y} stroke="var(--rule-3)" strokeWidth="1" />;
                })}
                <polyline fill="none" stroke="var(--ink)" strokeWidth="2" points={sys.map((v, i) => `${xs(i)},${ys(v, 60, 140)}`).join(' ')} />
                {sys.map((v, i) => <circle key={'s' + i} cx={xs(i)} cy={ys(v, 60, 140)} r="3" fill="var(--ink)" />)}
                <polyline fill="none" stroke="var(--accent)" strokeWidth="2" points={dia.map((v, i) => `${xs(i)},${ys(v, 60, 140)}`).join(' ')} />
                {dia.map((v, i) => <circle key={'d' + i} cx={xs(i)} cy={ys(v, 60, 140)} r="3" fill="var(--accent)" />)}
              </svg>
              <div style={{ display: 'flex', gap: 14, marginTop: 6 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--ink-2)' }}>
                  <span style={{ width: 16, height: 2, background: 'var(--ink)' }} /> Sistólica
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--ink-2)' }}>
                  <span style={{ width: 16, height: 2, background: 'var(--accent)' }} /> Diastólica
                </span>
              </div>
            </div>
          </window.MbSection>

          <window.MbSection title="Histórico">
            {[
              ['hoy 10:32', '119/76', '68', '36.6', '98'],
              ['09 may',    '122/78', '70', '36.7', '98'],
              ['02 may',    '124/80', '72', '36.5', '97'],
              ['24 abr',    '126/82', '74', '36.8', '97'],
              ['08 abr',    '130/84', '75', '36.6', '98'],
            ].map((r, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 1fr 1fr', padding: '10px 12px', background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)', marginBottom: 5, alignItems: 'center' }}>
                <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-2)' }}>{r[0]}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink)', fontWeight: 500 }}>{r[1]}</span>
                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-2)' }}>{r[2]}</span>
                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-2)' }}>{r[3]}</span>
                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-2)' }}>{r[4]}</span>
              </div>
            ))}
          </window.MbSection>
          <div style={{ height: 20 }} />
        </window.MbFrame>
      </DOCdev>
    </div>
  );
}

// ─── 5 · Expediente completo del paciente ─────────────────────
function DocPatientFullMobile() {
  return (
    <div data-screen-label="AX₂ · Doctor · Expediente (móvil)">
      <DOCdev>
        <window.MbFrame noTabs
          fab={<window.MbFAB icon="check" label="Empezar consulta" />}>
          {/* hero */}
          <div style={{ background: 'var(--ink)', color: 'var(--paper)', padding: '14px 20px 22px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', width: 240, height: 240, borderRadius: 999, background: 'radial-gradient(circle, rgba(0,180,216,0.28) 0%, transparent 70%)', top: -90, right: -70 }} />
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <window.MbIcon kind="chev-l" size={16} color="rgba(255,255,255,0.8)" />
              <span className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.04em' }}>Pacientes</span>
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 60, height: 60, borderRadius: 16, background: 'var(--accent-bright)', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 26 }}>MA</span>
              <div style={{ flex: 1 }}>
                <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Expediente · GET /patients/{`{id}`}/full</span>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 22, lineHeight: 1.05, marginTop: 2 }}>María F. Arellano</div>
                <div className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>♀ 34a · O+ Rh(+) · vinculada 4 m</div>
              </div>
            </div>
            <div style={{ marginTop: 14, padding: '8px 12px', borderRadius: 8, background: 'rgba(184,50,50,0.18)', border: '1px solid rgba(184,50,50,0.4)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 9, padding: '3px 7px', borderRadius: 4, background: 'var(--alert)', color: '#fff', letterSpacing: '0.06em' }}>ALERGIA</span>
              <span style={{ fontSize: 11.5, color: '#FFC9C5' }}>Penicilina · anafilaxia 2019</span>
            </div>
          </div>

          {/* tabs scroller */}
          <div style={{ padding: '12px 20px 0', display: 'flex', gap: 6, overflowX: 'auto' }}>
            {[['Resumen', true], ['Vitales'], ['Dx'], ['Cirugías'], ['Meds'], ['Vacunas'], ['Estudios'], ['Ciclo']].map(([k, on]) => (
              <window.MbPill key={k} on={on}>{k}</window.MbPill>
            ))}
          </div>

          <window.MbSection title="Diagnósticos activos · 4">
            {[
              ['Hipotiroidismo subclínico', 'E03.9', 'controlado'],
              ['Migraña con aura',          'G43.1', 'episódica'],
              ['SOP',                       'E28.2', 'seguimiento'],
              ['Anemia ferropénica',        'D50.9', 'tratamiento'],
            ].map(([n, ic, st], i) => (
              <div key={i} style={{ padding: '10px 12px', background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)', marginBottom: 5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500 }}>{n}</div>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 9, padding: '2px 6px', borderRadius: 999, background: 'var(--paper-3)', color: 'var(--accent-deep)', letterSpacing: '0.06em' }}>{ic}</span>
                </div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 4 }}>{st}</div>
              </div>
            ))}
          </window.MbSection>

          <window.MbSection title="Medicación vigente · 3">
            {[
              ['Levotiroxina',  'Eutirox 50 mcg · 1/d',  'verde'],
              ['Sumatriptán',   'Imigran 50 mg · prn',   'amber'],
              ['Sulfato Fe',    'Ferro Sanol 100 · 1/d', 'verde'],
            ].map(([gen, dose, tone], i) => (
              <div key={i} style={{ padding: '10px 12px', background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)', marginBottom: 5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500 }}>{gen}</div>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 9, padding: '2px 6px', borderRadius: 999, background: tone === 'verde' ? '#E5F5EE' : '#FCEFD7', color: tone === 'verde' ? 'var(--ok)' : 'var(--mid)', letterSpacing: '0.06em' }}>{tone.toUpperCase()}</span>
                </div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 4 }}>{dose}</div>
              </div>
            ))}
          </window.MbSection>

          <window.MbSection title="Vitales recientes" action="Ver gráfica →">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6 }}>
              {[['T/A','119/76'], ['FC','68'], ['Temp','36.6'], ['SpO₂','98%']].map(([k, n], i) => (
                <div key={i} style={{ padding: '10px 8px', background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)', textAlign: 'center' }}>
                  <div className="eyebrow" style={{ fontSize: 9 }}>{k}</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 500, marginTop: 4 }}>{n}</div>
                </div>
              ))}
            </div>
          </window.MbSection>

          <window.MbSection title="Contacto de emergencia">
            <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr auto', gap: 10, alignItems: 'center', padding: '11px 12px', background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)' }}>
              <span style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--accent-bright)', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 11 }}>EA</span>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 500 }}>Eduardo Arellano · padre</div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>+52 55 4421 9087</div>
              </div>
              <button style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--paper-3)', color: 'var(--accent-deep)', border: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <window.MbIcon kind="phone" size={12} />
              </button>
            </div>
          </window.MbSection>

          <window.MbSection title="Últimas consultas">
            {[
              ['hoy',    'Dr. Vega',     '1ª consulta · valoración vesícula', 'en curso'],
              ['11 abr', 'Dra. Padilla', 'Control endocrino · TSH ↑',          ''],
              ['28 mar', 'Dr. Vega',     'Migraña con aura',                    ''],
            ].map(([d, dr, dx, tag], i) => (
              <div key={i} style={{ padding: '11px 12px', background: tag ? 'var(--paper-3)' : 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)', marginBottom: 5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500 }}>{dx}</div>
                  {tag && <span style={{ fontFamily: 'var(--mono)', fontSize: 9, padding: '2px 6px', borderRadius: 999, background: 'var(--accent-bright)', color: 'var(--ink)', letterSpacing: '0.06em' }}>EN CURSO</span>}
                </div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 4 }}>{d} · {dr}</div>
              </div>
            ))}
          </window.MbSection>
          <div style={{ height: 20 }} />
        </window.MbFrame>
      </DOCdev>
    </div>
  );
}

Object.assign(window, {
  DocInvitesMobile, DocShiftsMobile, DocQRMobile, DocVitalsMobile, DocPatientFullMobile,
});
