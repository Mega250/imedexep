// imedexp · Home / Landing page
// 1440 × 2400 — editorial, paper + ink, single deep-green accent.

const HomeLogo = ({ color = 'var(--ink)', height = 22 }) => (
  <span
    aria-label="imedexp"
    className="logo-mask"
    style={{
      width: height * (1024 / 1024) * 4.1, // wordmark wider than mark
      height,
      color,
      '--logo-src': "url('assets/logo-wordmark.svg')",
    }}
  />
);

const Pulse = ({ color = 'var(--accent)' }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
    <span style={{
      width: 6, height: 6, borderRadius: 99,
      background: color, boxShadow: `0 0 0 4px ${color === 'var(--accent)' ? 'oklch(0.42 0.08 165 / 0.18)' : 'rgba(255,255,255,0.18)'}`,
    }} />
  </span>
);

// ─────────────────────────────────────────────────────────────
// Nav
// ─────────────────────────────────────────────────────────────
function HomeNav() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '24px 56px', borderBottom: '1px solid var(--rule)',
      background: 'var(--paper)', position: 'sticky', top: 0, zIndex: 5,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
        <HomeLogo height={20} />
        <nav style={{ display: 'flex', gap: 28 }}>
          {['Producto', 'Para médicos', 'Para pacientes', 'Instituciones', 'Precios'].map((x) => (
            <span key={x} style={{ fontSize: 13.5, color: 'var(--ink-2)' }}>{x}</span>
          ))}
        </nav>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.08em' }}>ES · MX</span>
        <span style={{ width: 1, height: 16, background: 'var(--rule)' }} />
        <button className="btn ghost sm">Iniciar sesión</button>
        <button className="btn sm">Comenzar →</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Hero
// ─────────────────────────────────────────────────────────────
function HomeHero() {
  return (
    <section style={{ padding: '88px 56px 64px', position: 'relative' }}>
      {/* meta strip */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 56 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Pulse />
          <span className="eyebrow">Historial clínico portátil · v1.0</span>
        </div>
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.08em' }}>
          MX · 2026 — Para pacientes, médicos e instituciones
        </span>
      </div>

      {/* headline */}
      <h1 style={{
        fontFamily: 'var(--sans)', fontWeight: 500, fontSize: 104, lineHeight: 0.94,
        letterSpacing: '-0.045em', maxWidth: 1180, color: 'var(--ink)',
      }}>
        El historial que el médico<br />
        <span className="serif" style={{ fontWeight: 400 }}>ya leyó</span> antes de decir<br />
        “buenos días.”
      </h1>

      {/* subhead row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 80, marginTop: 56, alignItems: 'end' }}>
        <p style={{ fontSize: 19, lineHeight: 1.45, color: 'var(--ink-2)', maxWidth: 640 }}>
          imedexp es el expediente clínico que viaja con el paciente. Alergias, cirugías,
          diagnósticos activos y medicación — visibles para cualquier médico nuevo en segundos,
          con un vínculo. Sin formularios, sin interrogatorios repetidos, sin información perdida
          entre cambios de doctor.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <button className="btn lg block">Crear mi historial — gratis para pacientes →</button>
          <button className="btn ghost lg block">Soy médico · acceder a la consola</button>
          <div style={{ display: 'flex', gap: 18, marginTop: 4 }}>
            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>HIPAA · NOM-024-SSA3-2010</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>· Cifrado E2E</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// Product preview — a stylized mock-of-mock of the doctor view
// ─────────────────────────────────────────────────────────────
function HomePreview() {
  return (
    <section style={{ padding: '32px 56px 96px' }}>
      <div style={{
        background: 'var(--white)', border: '1px solid var(--rule)',
        borderRadius: 6, overflow: 'hidden', position: 'relative',
      }}>
        {/* window chrome */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', borderBottom: '1px solid var(--rule)', background: 'var(--paper-2)',
        }}>
          <div style={{ display: 'flex', gap: 7 }}>
            <span style={{ width: 11, height: 11, borderRadius: 99, background: 'var(--rule)' }} />
            <span style={{ width: 11, height: 11, borderRadius: 99, background: 'var(--rule)' }} />
            <span style={{ width: 11, height: 11, borderRadius: 99, background: 'var(--rule)' }} />
          </div>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.06em' }}>
            consola.imedexp.mx / pacientes / maría-fernanda-arellano
          </span>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>Dr. Solís · 14:22</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', minHeight: 520 }}>
          {/* sidebar */}
          <div style={{ borderRight: '1px solid var(--rule)', padding: '20px 18px' }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Agenda · Mié 14 may</div>
            {[
              ['09:00', 'Carlos Mendoza Vela', 'control · 6m'],
              ['10:30', 'María F. Arellano', 'primera vez', true],
              ['11:15', 'José Luis Padilla', 'control · post-op'],
              ['12:00', 'Ana Sofía Cortés', 'control · crónico'],
              ['13:30', '— libre —', null],
              ['14:00', 'Luis Ramírez', 'primera vez'],
            ].map(([t, n, tag, active], i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '44px 1fr', alignItems: 'baseline',
                gap: 12, padding: '10px 8px', borderRadius: 4,
                background: active ? 'var(--ink)' : 'transparent',
                color: active ? 'var(--paper)' : 'var(--ink)',
                marginLeft: -8, marginRight: -8,
              }}>
                <span className="mono" style={{ fontSize: 12, opacity: active ? 0.7 : 0.55 }}>{t}</span>
                <div>
                  <div style={{ fontSize: 13.5, lineHeight: 1.3 }}>{n}</div>
                  {tag && <div className="mono" style={{ fontSize: 10.5, letterSpacing: '0.06em', opacity: active ? 0.7 : 0.55, marginTop: 2 }}>{tag}</div>}
                </div>
              </div>
            ))}
          </div>

          {/* patient pane */}
          <div style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <div className="eyebrow" style={{ marginBottom: 6 }}>Primera consulta · 10:30</div>
                <h3 style={{ fontFamily: 'var(--serif)', fontSize: 40, lineHeight: 1, fontWeight: 400, letterSpacing: '-0.02em' }}>
                  María Fernanda Arellano
                </h3>
                <div className="mono" style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 8, letterSpacing: '0.04em' }}>
                  ♀ 34 a · O+ · 1.62 m · 58 kg · CDMX
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span className="chip">vínculo · 4d</span>
                <span className="chip accent">historial completo</span>
              </div>
            </div>

            {/* ALERTA ALERGIA */}
            <div style={{
              marginTop: 22, padding: '14px 16px',
              border: '1px solid var(--alert-rule)', background: 'var(--alert-soft)',
              borderRadius: 4, display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <span style={{
                fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.12em',
                padding: '4px 8px', background: 'var(--alert)', color: 'var(--white)', borderRadius: 2,
              }}>ALERGIA SEVERA</span>
              <span style={{ fontSize: 14, color: 'var(--ink)' }}>
                <strong>Penicilina</strong> — anafilaxia, 2019. Evitar β-lactámicos.
              </span>
              <span style={{ flex: 1 }} />
              <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>verif · 12/oct/2023</span>
            </div>

            {/* 2x2 expediente */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, marginTop: 22, border: '1px solid var(--rule)' }}>
              {[
                {
                  k: 'Diagnósticos activos', items: [
                    ['Hipotiroidismo', 'CIE-10 E03.9 · desde 2018'],
                    ['Migraña con aura', 'CIE-10 G43.1 · desde 2021'],
                  ],
                },
                {
                  k: 'Medicación', items: [
                    ['Levotiroxina 75µg', '1 tab · 06:30 · ayunas'],
                    ['Rizatriptán 10mg', 'PRN · máx 2/día'],
                  ],
                },
                {
                  k: 'Cirugías', items: [
                    ['Apendicectomía laparoscópica', 'H. Ángeles · sep 2017'],
                    ['Septoplastia', 'H. Médica Sur · mar 2014'],
                  ],
                },
                {
                  k: 'Antecedentes', items: [
                    ['Madre: hipotiroidismo', 'Padre: HTA + DM2'],
                    ['No tabaco · alcohol social', ''],
                  ],
                },
              ].map((col, i) => (
                <div key={i} style={{
                  padding: '14px 16px',
                  borderRight: i % 2 === 0 ? '1px solid var(--rule)' : 0,
                  borderBottom: i < 2 ? '1px solid var(--rule)' : 0,
                }}>
                  <div className="eyebrow" style={{ marginBottom: 8 }}>{col.k}</div>
                  {col.items.map(([a, b], j) => (
                    <div key={j} style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 13.5 }}>{a}</div>
                      {b && <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 1 }}>{b}</div>}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* caption row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14 }}>
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>
          fig. 01 · consola del médico — vista de primera consulta
        </span>
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>
          tiempo a comprender al paciente: <span style={{ color: 'var(--accent-ink)' }}>≈ 14 s</span>
        </span>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// Manifesto strip
// ─────────────────────────────────────────────────────────────
function HomeManifesto() {
  return (
    <section style={{
      background: 'var(--ink)', color: 'var(--paper)', padding: '88px 56px 96px',
      borderTop: '1px solid var(--ink)', borderBottom: '1px solid var(--ink)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
        <Pulse color="var(--paper)" />
        <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.55)' }}>Manifiesto</span>
      </div>

      <h2 style={{
        fontFamily: 'var(--sans)', fontSize: 64, lineHeight: 1.0, fontWeight: 400,
        letterSpacing: '-0.035em', maxWidth: 1100,
      }}>
        Un buen médico no es cálido ni frío.<br />
        Es <span className="serif">preciso</span>. La interfaz<br />
        debe serlo también.
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 36, marginTop: 64 }}>
        {[
          ['01', 'Pocos clics, todo visible.', 'Ver historial, ver próxima cita, agregar un dato — dos toques máximo.'],
          ['02', 'El historial manda.', 'Alergias, diagnósticos, medicación y cirugías son la jerarquía visual número uno. Todo lo demás, secundario.'],
          ['03', 'Velocidad de lectura.', 'El perfil clínico se entiende en 30 segundos. Tipografía fuerte, agrupación clara, sin pared de texto.'],
          ['04', 'Capturar = anotar.', 'Registrar un diagnóstico debe sentirse como un bloc de notas. Sin formularios de cinco pasos.'],
        ].map(([n, t, d]) => (
          <div key={n}>
            <span className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.12em' }}>{n}</span>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.18)', margin: '10px 0 14px' }} />
            <div style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.2, marginBottom: 10 }}>{t}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.68)', lineHeight: 1.45 }}>{d}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// Roles
// ─────────────────────────────────────────────────────────────
function RoleCard({ tag, title, who, body, ctas }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '28px 28px 24px', border: '1px solid var(--rule)', background: 'var(--white)', borderRadius: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="chip accent">{tag}</span>
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{who}</span>
      </div>
      <h3 style={{ fontFamily: 'var(--serif)', fontSize: 34, lineHeight: 1, fontWeight: 400, letterSpacing: '-0.02em' }}>{title}</h3>
      <p style={{ fontSize: 14.5, lineHeight: 1.5, color: 'var(--ink-2)' }}>{body}</p>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
        {ctas.map((c, i) => (
          <button key={i} className={`btn sm ${i === 0 ? '' : 'ghost'}`}>{c}</button>
        ))}
      </div>
    </div>
  );
}

function HomeRoles() {
  return (
    <section style={{ padding: '96px 56px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48 }}>
        <div>
          <span className="eyebrow">Tres roles, un mismo expediente</span>
          <h2 style={{ fontSize: 56, lineHeight: 1, fontWeight: 500, letterSpacing: '-0.035em', marginTop: 14, maxWidth: 760 }}>
            Cada quien ve lo que necesita.<br />
            <span className="serif" style={{ fontWeight: 400 }}>Nada más.</span>
          </h2>
        </div>
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.06em' }}>
          02 · roles & vistas
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        <RoleCard
          tag="paciente"
          who="25–60 a · sala de espera"
          title="Tu historial cabe en un vínculo."
          body="Abres la app, generas un código, lo compartes con tu nuevo doctor. Él ve lo que tomaría 20 minutos de interrogatorio. Tú no recuerdas dosis ni fechas; no tienes que."
          ctas={["Crear mi historial", "Ver demo"]}
        />
        <RoleCard
          tag="médico"
          who="consultorio · 10–15 min"
          title="Lee, no preguntes."
          body="El expediente del paciente entra a tu consola al recibir el vínculo. Alergias, cirugías, crónicos y medicación activa, jerarquizados. Cinco clics menos por cita."
          ctas={["Acceder a la consola", "Plan independiente"]}
        />
        <RoleCard
          tag="institución"
          who="clínica · administración"
          title="Una agenda. Todos los doctores."
          body="Asigna pacientes, gestiona la agenda de tus médicos adscritos, audita los expedientes que pasan por la clínica. Visualidad clara sobre estética densa."
          ctas={["Hablar con ventas", "Cotizar"]}
        />
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// Comparison strip — anti-references rephrased
// ─────────────────────────────────────────────────────────────
function HomeAnti() {
  return (
    <section style={{ padding: '32px 56px 96px' }}>
      <div style={{ border: '1px solid var(--rule)', background: 'var(--paper-2)', borderRadius: 4 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '1px solid var(--rule)' }}>
          {['Lo que no somos', 'Lo que tampoco somos', 'Lo que sí somos'].map((t, i) => (
            <div key={t} style={{ padding: '16px 22px', borderRight: i < 2 ? '1px solid var(--rule)' : 0 }}>
              <span className="eyebrow">{`0${i + 1}`}</span>
              <div style={{ fontSize: 15, marginTop: 6 }}>{t}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
          {[
            ['Un buscador de doctores', 'No conectamos pacientes nuevos con médicos nuevos por precio o calificaciones. Gestionamos las relaciones que ya existen — y el expediente que las conecta.'],
            ['Un portal institucional', 'No diseñamos para formularios burocráticos. Diseñamos para el flujo de trabajo real de una consulta — visualmente claro, jerárquicamente fuerte.'],
            ['Un expediente que viaja contigo', 'El paciente trae su historial completo en el celular. Cualquier médico nuevo lo entiende en segundos. La primera consulta se siente como la quinta.'],
          ].map(([h, b], i) => (
            <div key={i} style={{
              padding: '22px', borderRight: i < 2 ? '1px solid var(--rule)' : 0,
              background: i === 2 ? 'var(--ink)' : 'transparent',
              color: i === 2 ? 'var(--paper)' : 'var(--ink)',
            }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 26, lineHeight: 1.05, fontWeight: 400, marginBottom: 10 }}>{h}</div>
              <div style={{ fontSize: 13, lineHeight: 1.5, color: i === 2 ? 'rgba(255,255,255,0.7)' : 'var(--ink-2)' }}>{b}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// CTA / footer
// ─────────────────────────────────────────────────────────────
function HomeCTA() {
  return (
    <section style={{ padding: '96px 56px 56px', borderTop: '1px solid var(--rule)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 80, alignItems: 'end' }}>
        <h2 style={{ fontSize: 84, lineHeight: 0.96, fontWeight: 500, letterSpacing: '-0.045em' }}>
          Empieza tu expediente.<br />
          <span className="serif" style={{ fontWeight: 400 }}>El próximo médico</span><br />
          ya lo necesita.
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button className="btn lg block">Crear mi historial — paciente</button>
          <button className="btn ghost lg block">Acceso para médicos</button>
          <button className="btn ghost lg block">Hablar con un humano — instituciones</button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 96, paddingTop: 22, borderTop: '1px solid var(--rule)' }}>
        <HomeLogo height={18} />
        <div style={{ display: 'flex', gap: 22 }}>
          {['Privacidad', 'Términos', 'Seguridad', 'Cumplimiento', 'Soporte', 'Cambios'].map((x) => (
            <span key={x} className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.06em' }}>{x}</span>
          ))}
        </div>
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>© 2026 imedexp · CDMX</span>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// Compose
// ─────────────────────────────────────────────────────────────
function HomeScreen() {
  return (
    <div className="imx" style={{ width: 1440, background: 'var(--paper)' }} data-screen-label="Home / Landing">
      <HomeNav />
      <HomeHero />
      <HomePreview />
      <HomeManifesto />
      <HomeRoles />
      <HomeAnti />
      <HomeCTA />
    </div>
  );
}

window.HomeScreen = HomeScreen;
window.HomeLogo = HomeLogo;
window.Pulse = Pulse;
