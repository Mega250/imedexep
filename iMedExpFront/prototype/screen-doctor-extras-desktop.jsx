// imedexp · Doctor · Extras PC
// Endpoints cubiertos:
//   PATCH /api/v1/invitations/{id}        — médico acepta/rechaza
//   POST/GET /api/v1/doctors/{id}/shifts  — turnos
//   POST /api/v1/qr-access/redeem         — canjea QR del paciente
// Pantallas:
//   DocInvitesScreen — bandeja de invitaciones de clínicas
//   DocShiftsScreen  — turnos / horarios
//   DocQRScreen      — escanear QR de acceso

const DOC_NAV = [
  ['home',   'Inicio'],
  ['users',  'Pacientes', '142'],
  ['cal',    'Agenda',    '5'],
  ['doc',    'Consultas'],
  ['inbox',  'Invitaciones', '2'],
  ['clock',  'Turnos'],
  ['scan',   'Escanear QR'],
  ['user',   'Perfil'],
];
const DOC_WHO = ['Dr. D. Vega', 'DV', 'cirugía general · céd. 8 421 776'];

// ─── 1 · Invitaciones recibidas ───────────────────────────────
function DocInvitesScreen() {
  const queue = [
    {
      inst: 'Clínica Roma Norte',     city: 'CDMX',          plan: 'Pro',
      from: 'Lic. Renata Coria · directora general',
      role: 'Médico asociado · cirugía general',
      msg: 'Damián, ya hablamos del bloque quirúrgico — te paso la invitación formal. La idea es que arranques en feb con 2 días.',
      sent: 'hace 2 días', expires: 'en 5 d',
      state: 'pendiente', sel: true,
    },
    {
      inst: 'Centro Médico ABC Sta. Fe', city: 'CDMX',         plan: 'Enterprise',
      from: 'Dr. Roberto Vega · director médico',
      role: 'Médico asociado · cirugía hepatobiliar',
      msg: '',
      sent: 'hace 4 días', expires: 'en 3 d',
      state: 'pendiente',
    },
    {
      inst: 'Hospital Puerta de Hierro', city: 'GDL',         plan: 'Pro',
      from: 'Dr. Sergio Cárdenas · director médico',
      role: 'Cirujano externo · consulta privada',
      msg: '',
      sent: '7 may', expires: 'vencida',
      state: 'expirada',
    },
  ];
  const sel = queue[0];
  return (
    <window.AdmPage
      label="AF · Doctor · Invitaciones"
      nav={DOC_NAV} active={4} role="Doctor" who={DOC_WHO} accent="accent-bright"
      title="Invitaciones a clínicas" sub="2 pendientes · responde antes de que venzan"
      searchHint="Buscar clínica…"
      height={1080}
      right={null}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <window.AdmStat k="Pendientes" n="2" sub="Roma Norte · ABC Sta. Fe" tone="alert" />
        <window.AdmStat k="Aceptadas" n="3" sub="clínicas activas hoy" />
        <window.AdmStat k="Rechazadas" n="1" sub="Star Médica · feb 24" />
        <window.AdmStat k="Vencen pronto" n="1" sub="ABC Sta. Fe · 3 días" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 14, marginTop: 18 }}>
        {/* list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {queue.map((q, i) => (
            <div key={i} style={{
              background: 'var(--white)',
              border: '1px solid ' + (q.sel ? 'var(--accent)' : 'var(--rule)'),
              borderRadius: 'var(--r-xl)', overflow: 'hidden',
              boxShadow: q.sel ? '0 14px 30px -20px rgba(0,150,199,0.4)' : 'none',
              cursor: 'pointer',
            }}>
              <div style={{ padding: '16px 18px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: q.plan === 'Enterprise' ? 'var(--ink)' : 'var(--accent-bright)',
                  color: q.plan === 'Enterprise' ? 'var(--paper)' : 'var(--ink)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--serif)', fontSize: 18, flexShrink: 0,
                }}>{q.inst.split(' ').filter(s => s[0] >= 'A' && s[0] <= 'Z').slice(0, 2).map(s => s[0]).join('')}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{q.inst}</div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 4 }}>{q.city} · {q.plan} · {q.sent}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 8, lineHeight: 1.4 }}>{q.role}</div>
                </div>
              </div>
              <div style={{ padding: '10px 18px', borderTop: '1px solid var(--rule-3)', background: 'var(--paper)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontFamily: 'var(--mono)', fontSize: 9.5, padding: '3px 8px', borderRadius: 999,
                  background: q.state === 'pendiente' ? 'var(--alert-soft)' : 'var(--paper-3)',
                  color:      q.state === 'pendiente' ? 'var(--alert)' : 'var(--ink-3)',
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                }}>{q.state}</span>
                <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>vence {q.expires}</span>
              </div>
            </div>
          ))}
        </div>

        {/* detail */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden', height: 'fit-content' }}>
          <div style={{ padding: '24px 26px 20px', background: 'var(--ink)', color: 'var(--paper)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', width: 320, height: 320, borderRadius: 999, background: 'radial-gradient(circle, rgba(0,180,216,0.3) 0%, transparent 70%)', top: -120, right: -80 }} />
            <div style={{ position: 'relative' }}>
              <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Invitación · {sel.sent}</span>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: 36, lineHeight: 1.05, letterSpacing: '-0.02em', marginTop: 8 }}>
                {sel.inst}
              </h2>
              <div className="mono" style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.6)', marginTop: 10 }}>
                {sel.city} · plan {sel.plan} · id 1001
              </div>
            </div>
          </div>

          <div style={{ padding: 22 }}>
            <div className="eyebrow">Te invita</div>
            <div style={{ marginTop: 8, padding: '12px 14px', background: 'var(--paper)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--paper-3)', color: 'var(--accent-deep)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 14 }}>RC</span>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{sel.from.split(' · ')[0]}</div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>{sel.from.split(' · ')[1]}</div>
              </div>
            </div>

            <div className="eyebrow" style={{ marginTop: 16, marginBottom: 6 }}>Rol propuesto</div>
            <div style={{ padding: '12px 14px', background: 'var(--paper)', borderRadius: 'var(--r-md)' }}>
              <div style={{ fontSize: 13.5 }}>{sel.role}</div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 4 }}>permisos: agenda · expediente compartido · firma de recetas</div>
            </div>

            {sel.msg && (
              <>
                <div className="eyebrow" style={{ marginTop: 16, marginBottom: 6 }}>Mensaje</div>
                <div className="serif" style={{ fontStyle: 'italic', fontSize: 16, color: 'var(--ink-2)', lineHeight: 1.45, padding: '4px 0 4px 14px', borderLeft: '2px solid var(--accent-rule)' }}>
                  «{sel.msg}»
                </div>
              </>
            )}

            <div style={{ marginTop: 18, padding: '12px 14px', background: 'var(--paper-3)', border: '1px solid var(--accent-rule)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <window.AdmIcon kind="shield-2" size={16} color="var(--accent-deep)" />
              <div className="mono" style={{ fontSize: 11, color: 'var(--accent-deep)', lineHeight: 1.5 }}>
                Tus pacientes actuales no se comparten. Las consultas que hagas aquí entran al expediente del paciente bajo esta clínica.
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 22 }}>
              <button className="btn" style={{ flex: 1, justifyContent: 'center', height: 48 }}>
                <window.AdmIcon kind="check" size={14} color="#fff" /> Aceptar invitación
              </button>
              <button className="btn ghost" style={{ flex: 1, justifyContent: 'center', height: 48, color: 'var(--alert)', borderColor: 'var(--alert-rule)' }}>
                <window.AdmIcon kind="x" size={14} color="var(--alert)" /> Rechazar
              </button>
            </div>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', textAlign: 'center', marginTop: 10 }}>
              PATCH /api/v1/invitations/{`{id}`} · vence {sel.expires}
            </div>
          </div>
        </div>
      </div>
    </window.AdmPage>
  );
}

// ─── 2 · Turnos / Shifts ───────────────────────────────────────
function DocShiftsScreen() {
  const dows = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
  // shifts per day: { start, end, kind, where }
  const shifts = [
    [{ s: 8,  e: 13, k: 'Consulta',  w: 'Cons. 712'  }, { s: 14, e: 16, k: 'Quirófano', w: 'OR 3' }],
    [{ s: 9,  e: 14, k: 'Consulta',  w: 'Cons. 712'  }],
    [{ s: 8,  e: 13, k: 'Consulta',  w: 'Cons. 712'  }, { s: 15, e: 18, k: 'Consulta',  w: 'Cons. 712' }],
    [{ s: 8,  e: 12, k: 'Quirófano', w: 'OR 2'       }, { s: 13, e: 17, k: 'Consulta',  w: 'Cons. 712' }],
    [{ s: 9,  e: 14, k: 'Consulta',  w: 'Cons. 712'  }],
    [{ s: 9,  e: 12, k: 'Consulta',  w: 'Cons. 712'  }],
  ];
  const HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
  const ROW = 36;
  return (
    <window.AdmPage
      label="AG · Doctor · Turnos"
      nav={DOC_NAV} active={5} role="Doctor" who={DOC_WHO} accent="accent-bright"
      title="Turnos y horarios" sub="Sem. tipo · GET/POST /doctors/{id}/shifts"
      searchHint="Buscar turno, consultorio…"
      height={1140}
      right={<button className="btn sm" style={{ height: 42, borderRadius: 'var(--r-md)' }}><window.AdmIcon kind="plus" size={14} color="#fff" /> Agregar turno</button>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <window.AdmStat k="Horas / semana" n="38" sub="32 consulta · 6 quirófano" />
        <window.AdmStat k="Días activos" n="6" sub="lun a sáb" />
        <window.AdmStat k="Consultorios" n="2" sub="cons. 712 · OR 2/3" />
        <window.AdmStat k="Capacidad / sem" n="≈ 108" sub="20 min por consulta" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 14, marginTop: 18 }}>
        {/* week shifts grid */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--rule-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 15, fontWeight: 500 }}>Semana tipo</h3>
            <div style={{ display: 'flex', background: 'var(--paper)', border: '1px solid var(--rule)', borderRadius: 9, padding: 2 }}>
              {['Semana tipo', 'Vigente', 'Excepciones'].map((v, i) => (
                <span key={v} style={{
                  padding: '6px 14px', borderRadius: 7,
                  background: i === 0 ? 'var(--ink)' : 'transparent',
                  color: i === 0 ? 'var(--paper)' : 'var(--ink-3)',
                  fontSize: 11.5, fontFamily: 'var(--mono)', letterSpacing: '0.04em', textTransform: 'uppercase',
                }}>{v}</span>
              ))}
            </div>
          </div>
          <div style={{ padding: 20 }}>
            {/* day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: `52px repeat(${dows.length}, 1fr)`, marginBottom: 8 }}>
              <div />
              {dows.map((d, i) => (
                <div key={i} style={{ padding: '4px 8px', textAlign: 'center' }}>
                  <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{d}</span>
                </div>
              ))}
            </div>
            {/* grid */}
            <div style={{ display: 'grid', gridTemplateColumns: `52px repeat(${dows.length}, 1fr)`, position: 'relative' }}>
              {/* hour col */}
              <div>
                {HOURS.map((h, i) => (
                  <div key={i} style={{ height: ROW, paddingTop: 2, borderTop: i > 0 ? '1px solid var(--rule-3)' : 0 }}>
                    <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{h}:00</span>
                  </div>
                ))}
              </div>
              {/* day cols */}
              {shifts.map((daySh, ci) => (
                <div key={ci} style={{ position: 'relative', borderLeft: '1px solid var(--rule-3)' }}>
                  {HOURS.map((_, i) => (
                    <div key={i} style={{ height: ROW, borderTop: i > 0 ? '1px solid var(--rule-3)' : 0 }} />
                  ))}
                  {daySh.map((sh, j) => {
                    const top = (sh.s - HOURS[0]) * ROW;
                    const h = (sh.e - sh.s) * ROW - 4;
                    const isOR = sh.k === 'Quirófano';
                    return (
                      <div key={j} style={{
                        position: 'absolute',
                        left: 4, right: 4, top: top + 2, height: h,
                        background: isOR ? 'var(--ink)' : 'var(--paper-3)',
                        border: '1px solid ' + (isOR ? 'var(--ink)' : 'var(--accent-rule)'),
                        color: isOR ? 'var(--paper)' : 'var(--accent-deep)',
                        borderRadius: 8, padding: '6px 8px',
                        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                        overflow: 'hidden',
                      }}>
                        <div style={{ fontSize: 11, fontWeight: 500 }}>{sh.k}</div>
                        <div className="mono" style={{ fontSize: 9.5, opacity: 0.7 }}>{sh.s}:00–{sh.e}:00 · {sh.w}</div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 14 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--ink-2)' }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--paper-3)', border: '1px solid var(--accent-rule)' }} /> Consulta
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--ink-2)' }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--ink)' }} /> Quirófano
              </span>
            </div>
          </div>
        </div>

        {/* add shift panel */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden', height: 'fit-content' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--rule-2)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 500 }}>Nuevo turno</h3>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>POST /doctors/{`{id}`}/shifts</div>
          </div>
          <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              ['Tipo de turno', 'Consulta', ['Consulta', 'Quirófano', 'Guardia']],
              ['Día de la semana', 'Jueves'],
              ['Inicio', '08:00'],
              ['Fin', '12:00'],
              ['Consultorio / sala', 'Cons. 712'],
              ['Duración de cita', '20 min'],
              ['Vigencia', 'Semanal · indefinida'],
            ].map(([k, v, opts], i) => (
              <div key={i} style={{ padding: '10px 12px', background: 'var(--paper)', borderRadius: 'var(--r-md)' }}>
                <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{k}</span>
                {opts ? (
                  <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                    {opts.map((o) => (
                      <span key={o} style={{
                        padding: '5px 10px', borderRadius: 7,
                        background: o === v ? 'var(--ink)' : 'var(--white)',
                        color: o === v ? 'var(--paper)' : 'var(--ink-2)',
                        border: '1px solid ' + (o === v ? 'var(--ink)' : 'var(--rule)'),
                        fontSize: 11, cursor: 'pointer',
                      }}>{o}</span>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--ink)', marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {v} <window.AdmIcon kind="chev-d" size={12} color="var(--ink-3)" />
                  </div>
                )}
              </div>
            ))}
            <button className="btn block" style={{ marginTop: 8, justifyContent: 'center' }}>
              <window.AdmIcon kind="plus" size={13} color="#fff" /> Crear turno
            </button>
          </div>
        </div>
      </div>
    </window.AdmPage>
  );
}

// ─── 3 · Escanear QR ──────────────────────────────────────────
function DocQRScreen() {
  const recent = [
    { name: 'María F. Arellano',  curp: 'AERM91…', when: 'hace 12 min', loc: 'Clínica Roma Norte', kind: 'consulta' },
    { name: 'Carlos Mendoza Vela', curp: 'MEVC68…', when: 'hace 1 h',    loc: 'Clínica Roma Norte', kind: 'consulta' },
    { name: 'José Luis Padilla',  curp: 'PALJ64…', when: 'ayer 16:40',  loc: 'Hospital ABC',       kind: 'urgencias' },
    { name: 'Ana Sofía Cortés',   curp: 'COCA85…', when: '12 may',      loc: 'Clínica Roma Norte', kind: 'consulta' },
  ];
  return (
    <window.AdmPage
      label="AH · Doctor · Escanear QR"
      nav={DOC_NAV} active={6} role="Doctor" who={DOC_WHO} accent="accent-bright"
      title="Acceso por QR del paciente" sub="POST /api/v1/qr-access/redeem — vigencia 5 min"
      searchHint="Pega código de 8 dígitos…"
      height={1080}
      right={<button className="btn sm ghost" style={{ height: 42, borderRadius: 'var(--r-md)' }}>Historial completo →</button>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14 }}>
        {/* camera + code */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--rule-2)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 500 }}>Escanea el código del paciente</h3>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>Pídele que abra su app · "Mi QR" · le toma 3 s</div>
          </div>

          {/* camera placeholder */}
          <div style={{ padding: 24 }}>
            <div style={{
              position: 'relative', width: '100%', aspectRatio: '4 / 3',
              borderRadius: 'var(--r-lg)',
              background: 'repeating-linear-gradient(45deg, #0B1240 0 16px, #0F1A55 16px 32px)',
              overflow: 'hidden',
            }}>
              {/* viewfinder */}
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 260, height: 260,
                border: '2px solid var(--accent-bright)',
                borderRadius: 18,
              }}>
                {/* corners */}
                {[[0,0,'tl'],[0,1,'tr'],[1,0,'bl'],[1,1,'br']].map(([r, c, k]) => (
                  <span key={k} style={{
                    position: 'absolute',
                    [r ? 'bottom' : 'top']: -2, [c ? 'right' : 'left']: -2,
                    width: 36, height: 36,
                    borderTop:    r ? 0 : '4px solid var(--accent-bright)',
                    borderBottom: r ? '4px solid var(--accent-bright)' : 0,
                    borderLeft:   c ? 0 : '4px solid var(--accent-bright)',
                    borderRight:  c ? '4px solid var(--accent-bright)' : 0,
                  }} />
                ))}
                {/* scan line */}
                <div style={{
                  position: 'absolute', left: 0, right: 0, top: '50%',
                  height: 2, background: 'var(--accent-bright)',
                  boxShadow: '0 0 18px var(--accent-bright)',
                }} />
              </div>
              <div style={{ position: 'absolute', top: 14, left: 14, color: '#fff', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.08em' }}>
                ● cámara · 30 fps · auto
              </div>
              <div style={{ position: 'absolute', bottom: 14, right: 14, color: '#fff', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.08em' }}>
                buscando código…
              </div>
            </div>

            {/* manual entry */}
            <div className="eyebrow" style={{ marginTop: 18 }}>O pega el código manualmente</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 8, marginTop: 10 }}>
              {['7', 'F', '4', 'K', '9', '', '', ''].map((c, i) => (
                <div key={i} style={{
                  height: 56, borderRadius: 'var(--r-md)',
                  border: '1.5px solid ' + (c ? 'var(--ink)' : i === 5 ? 'var(--accent)' : 'var(--rule)'),
                  background: 'var(--white)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--mono)', fontSize: 22, fontWeight: 500, color: 'var(--ink)',
                  position: 'relative',
                }}>{c}
                  {i === 5 && <span style={{ position: 'absolute', width: 2, height: 22, background: 'var(--ink)', animation: 'imxBlink 1s steps(1,end) infinite' }} />}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>El código expira a los 5 min de generado</span>
              <button className="btn sm">Canjear acceso <window.AdmIcon kind="arrow" size={13} color="#fff" /></button>
            </div>
          </div>
        </div>

        {/* aside: recent + how-to */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: 'var(--paper-3)', border: '1px solid var(--accent-rule)', borderRadius: 'var(--r-xl)', padding: 20 }}>
            <span className="eyebrow">Cómo funciona</span>
            <h3 style={{ fontSize: 17, fontWeight: 500, marginTop: 6, lineHeight: 1.3 }}>
              Acceso temporal al expediente del paciente
            </h3>
            <p className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 8, lineHeight: 1.55 }}>
              Útil cuando atiendes a un paciente que no es tuyo (urgencias, interconsulta). El paciente decide qué compartir. El acceso dura la consulta y queda en su bitácora.
            </p>
          </div>

          <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--rule-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 15, fontWeight: 500 }}>Accesos recientes</h3>
              <span className="mono" style={{ fontSize: 11, color: 'var(--accent-deep)' }}>Ver todo →</span>
            </div>
            {recent.map((r, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '36px 1fr auto', gap: 12, alignItems: 'center', padding: '13px 20px', borderBottom: i < recent.length - 1 ? '1px solid var(--rule-3)' : 0 }}>
                <span style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--paper-4)', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500 }}>
                  {r.name.split(' ').map(s => s[0]).slice(0, 2).join('')}
                </span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{r.name}</div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 2 }}>{r.curp} · {r.loc} · {r.kind}</div>
                </div>
                <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>{r.when}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </window.AdmPage>
  );
}

Object.assign(window, { DocInvitesScreen, DocShiftsScreen, DocQRScreen });
