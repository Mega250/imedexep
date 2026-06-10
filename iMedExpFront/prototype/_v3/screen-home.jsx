// imedexp · Home / Landing — v3 (product entry, not editorial)
// 1440 wide, ~2900 tall depending on content.
//
// Principles:
//   1. La pregunta "¿soy paciente o médico?" se responde en pantalla 1.
//   2. Cada acción crítica está a un clic desde el hero.
//   3. Tipografía con contraste fuerte: 300 / 500 / 700.
//   4. Movimiento funcional: stagger entry, headline rotation, scroll-in, count-up.

// ─────────────────────────────────────────────────────────────
// Reusable bits
// ─────────────────────────────────────────────────────────────

const HomeLogo = ({ color = 'var(--ink)', height = 22 }) => (
  <span
    aria-label="imedexp"
    className="logo-mask"
    style={{
      width: height * 4.1, height, color,
      '--logo-src': "url('assets/logo-wordmark.svg')",
    }}
  />
);

const Pulse = ({ color = 'var(--accent-bright)', dark = false }) => (
  <span className="pulse" style={{
    display: 'inline-block', width: 8, height: 8, borderRadius: 99,
    background: color, boxShadow: dark ? '0 0 0 0 rgba(255,255,255,0.4)' : '0 0 0 0 rgba(0,180,216,0.5)',
  }} />
);

// Hook: count up a number when in view
function useCountUp(target, { duration = 1200, suffix = '' } = {}) {
  const ref = React.useRef(null);
  const [val, setVal] = React.useState(0);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let started = false;
    const start = () => {
      if (started) return; started = true;
      const t0 = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        setVal(Math.round(target * eased));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { start(); io.unobserve(el); } });
    }, { threshold: 0.05 });
    io.observe(el);
    // Safety fallback for transformed parents (design canvas)
    const safety = setTimeout(start, 1400);
    return () => { io.disconnect(); clearTimeout(safety); };
  }, [target, duration]);
  return [ref, val + suffix];
}

// Hook: add .is-visible to elements when they cross into view
function useReveal() {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targets = el.querySelectorAll('.before-view');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.05 });
    targets.forEach((t) => io.observe(t));
    // Safety: in the design-canvas (transformed parents) IO may not fire reliably;
    // reveal everything after 1.4s no matter what so sections never stay hidden.
    const safety = setTimeout(() => {
      targets.forEach((t) => t.classList.add('is-visible'));
    }, 1400);
    return () => { io.disconnect(); clearTimeout(safety); };
  }, []);
  return ref;
}

// ─────────────────────────────────────────────────────────────
// NAV — dark, sticky, slim
// ─────────────────────────────────────────────────────────────
function HomeNav() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '20px 40px', position: 'sticky', top: 0, zIndex: 10,
      background: 'rgba(3,4,94,0.92)', backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)', color: 'var(--paper)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
        <HomeLogo color="var(--paper)" height={18} />
        <span style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.16)' }} />
        <nav style={{ display: 'flex', gap: 22, alignItems: 'center' }}>
          {['Producto', 'Para médicos', 'Para pacientes', 'Instituciones', 'Seguridad'].map((x) => (
            <span key={x} style={{ fontSize: 13, color: 'rgba(255,255,255,0.78)', cursor: 'pointer' }}>{x}</span>
          ))}
        </nav>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.08em' }}>ES · MX</span>
        <button className="btn sm dark-ghost">Iniciar sesión</button>
        <button className="btn sm" style={{ background: 'var(--accent-bright)', borderColor: 'var(--accent-bright)', color: 'var(--ink)' }}>
          Pegar vínculo →
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HERO — deep navy, role chooser, headline rotation, live preview
// ─────────────────────────────────────────────────────────────
const ROTATING_WORDS = [
  ['ya leyó',     'antes de decir “buenos días.”'],
  ['ya entiende', 'antes del primer apretón de manos.'],
  ['ya conoce',   'antes de que tomes asiento.'],
];

function RoleLane({ tag, title, body, cta, accent, delay = 0, onPick }) {
  return (
    <div
      onClick={onPick}
      className="fadeup"
      style={{
        animationDelay: `${delay}ms`,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.14)',
        borderRadius: 'var(--r-xl)', padding: '22px 24px 20px',
        cursor: 'pointer', position: 'relative', overflow: 'hidden',
        transition: 'transform .25s cubic-bezier(.2,.7,.2,1), background .25s, border-color .25s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
        e.currentTarget.style.borderColor = accent;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span className="mono" style={{
          fontSize: 11, padding: '4px 10px', borderRadius: 999,
          background: accent, color: 'var(--ink)', letterSpacing: '0.08em',
        }}>{tag}</span>
        <span style={{ fontSize: 22, opacity: 0.65 }}>→</span>
      </div>
      <h3 style={{
        fontFamily: 'var(--sans)', fontSize: 26, fontWeight: 500, lineHeight: 1.05,
        letterSpacing: '-0.02em', color: 'var(--paper)',
      }}>{title}</h3>
      <p style={{ fontSize: 13.5, lineHeight: 1.5, color: 'rgba(255,255,255,0.7)', marginTop: 10 }}>
        {body}
      </p>
      <div style={{
        marginTop: 18, display: 'inline-flex', alignItems: 'center', gap: 8,
        fontSize: 13, fontWeight: 500, color: accent, borderBottom: `1px solid ${accent}`, paddingBottom: 2,
      }}>{cta}</div>
    </div>
  );
}

function HeroPreview() {
  return (
    <div className="fadeup" style={{ animationDelay: '480ms', marginTop: 64, position: 'relative' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr 1fr', gap: 24, alignItems: 'stretch' }}>
        {/* Phone — paciente */}
        <div style={{
          background: 'var(--paper)', color: 'var(--ink)', borderRadius: 32, padding: 14,
          border: '6px solid rgba(255,255,255,0.1)', minHeight: 360, position: 'relative',
          boxShadow: '0 30px 80px -20px rgba(0,0,0,0.6)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px 10px' }}>
            <span className="mono" style={{ fontSize: 10 }}>10:24</span>
            <span className="mono" style={{ fontSize: 10 }}>●●●  ⌃</span>
          </div>
          <div style={{ padding: '4px 6px' }}>
            <span className="eyebrow">Mi expediente</span>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 26, lineHeight: 1, marginTop: 6 }}>
              Hola, María.
            </div>
          </div>
          <div style={{
            margin: '14px 0 12px', padding: '12px 14px',
            background: 'var(--ink)', color: 'var(--paper)', borderRadius: 14,
          }}>
            <div className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em' }}>VÍNCULO ACTIVO</div>
            <div className="mono" style={{ fontSize: 16, marginTop: 6 }}>imx.mx/<strong>m·ar7r-92x</strong></div>
            <div className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', marginTop: 6 }}>expira en 22 min</div>
          </div>
          <div style={{
            background: 'var(--alert-soft)', border: '1px solid var(--alert-rule)',
            borderRadius: 12, padding: '10px 12px', marginBottom: 8,
          }}>
            <span className="mono" style={{ fontSize: 9, padding: '2px 6px', background: 'var(--alert)', color: '#fff', borderRadius: 999 }}>ALERGIA SEVERA</span>
            <div style={{ fontSize: 12, marginTop: 6 }}><strong>Penicilina</strong> · anafilaxia 2019</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {['Diagnósticos · 4', 'Medicación · 3', 'Cirugías · 3'].map((s) => (
              <div key={s} style={{
                padding: '8px 12px', border: '1px solid var(--rule)',
                background: 'var(--white)', borderRadius: 8, fontSize: 12,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>{s}<span style={{ opacity: 0.4 }}>›</span></div>
            ))}
          </div>
        </div>

        {/* Connection — animated arrow */}
        <div style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          alignItems: 'center', gap: 12, color: 'var(--accent-bright)',
          position: 'relative', minHeight: 360,
        }}>
          <div className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.16em' }}>VÍNCULO E2E</div>
          <div style={{
            width: '100%', height: 1, background: 'rgba(255,255,255,0.12)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: -1, left: 0, height: 3, width: '30%',
              background: 'linear-gradient(90deg, transparent, var(--accent-bright), transparent)',
              animation: 'imxArrow 2.6s cubic-bezier(.4,.0,.6,1) infinite',
            }} />
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <Pulse color="var(--accent-bright)" />
            <span className="mono" style={{ fontSize: 11, color: 'var(--paper)' }}>cifrado AES-256</span>
          </div>
          <div className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.12em', textAlign: 'center', maxWidth: 180, lineHeight: 1.5 }}>
            EL HISTORIAL VIAJA<br />SIN PASAR POR HOSPITAL
          </div>
        </div>

        {/* Desktop — médico console */}
        <div style={{
          background: 'var(--white)', color: 'var(--ink)', borderRadius: 'var(--r-xl)',
          minHeight: 360, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.18)',
          boxShadow: '0 30px 80px -20px rgba(0,0,0,0.6)',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--rule)', background: 'var(--paper-2)' }}>
            <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>● ● ● consola.imedexp.mx</span>
            <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>Dr. Solís · 10:30</span>
          </div>
          <div style={{ padding: '14px 18px' }}>
            <span className="eyebrow">Vínculo recibido · acaba de llegar</span>
            <h4 style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 400, lineHeight: 1.02, letterSpacing: '-0.02em', marginTop: 6 }}>
              María Fernanda Arellano
            </h4>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 4 }}>♀ 34a · O+ · CDMX</div>
          </div>
          <div style={{
            margin: '0 18px', padding: '10px 12px',
            background: 'var(--alert-soft)', border: '1px solid var(--alert-rule)', borderRadius: 12,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span className="mono" style={{ fontSize: 9, padding: '2px 6px', background: 'var(--alert)', color: '#fff', borderRadius: 999, letterSpacing: '0.1em' }}>ALERGIA</span>
            <span style={{ fontSize: 12 }}><strong>Penicilina</strong> — anafilaxia</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--rule)', margin: '14px 18px 18px', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--rule)' }}>
            {[
              ['Dx activos', 'Hipotiroidismo · migraña · SOP · ferropenia'],
              ['Medicación', 'Levotiroxina 75µg · sumatriptán PRN · Fe'],
              ['Cirugías', 'Apendicectomía · septoplastia · biopsia'],
              ['Estudios', 'TSH 4.8 · BH micro · USG tiroides'],
            ].map(([k, v]) => (
              <div key={k} style={{ padding: '10px 12px', background: 'var(--white)' }}>
                <div className="eyebrow" style={{ fontSize: 9.5 }}>{k}</div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-2)', marginTop: 4, lineHeight: 1.4 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* annotation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, color: 'rgba(255,255,255,0.5)' }}>
        <span className="mono" style={{ fontSize: 10.5, letterSpacing: '0.08em' }}>← el paciente comparte</span>
        <span className="mono" style={{ fontSize: 10.5, letterSpacing: '0.08em' }}>el médico ya lo leyó →</span>
      </div>
    </div>
  );
}

function HomeHero() {
  const [wordIdx, setWordIdx] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setWordIdx((i) => (i + 1) % ROTATING_WORDS.length), 4000);
    return () => clearInterval(t);
  }, []);
  const [word, tail] = ROTATING_WORDS[wordIdx];

  return (
    <section style={{
      background: 'linear-gradient(180deg, #03045E 0%, #03045E 60%, #023E8A 100%)',
      color: 'var(--paper)', padding: '72px 56px 96px', position: 'relative', overflow: 'hidden',
    }}>
      {/* faint grid lines */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.08, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
      }} />

      {/* eyebrow */}
      <div className="fadeup" style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
        <Pulse color="var(--accent-bright)" dark />
        <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.65)' }}>
          imedexp · historial clínico portátil · MX
        </span>
        <span style={{ flex: 1 }} />
        <span className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.06em' }}>
          v1.0 · 26.05 — disponible
        </span>
      </div>

      {/* headline */}
      <h1 className="fadeup" style={{
        animationDelay: '120ms',
        fontFamily: 'var(--sans)', fontWeight: 300, fontSize: 116, lineHeight: 0.94,
        letterSpacing: '-0.045em', marginTop: 28, maxWidth: 1280, position: 'relative',
      }}>
        El historial que el médico<br />
        <span style={{ position: 'relative', display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom' }}>
          <span key={wordIdx} className="serif" style={{
            display: 'inline-block', color: 'var(--accent-bright)', fontWeight: 400,
            animation: 'imxFadeUp .6s cubic-bezier(.2,.7,.2,1)',
          }}>{word}</span>
        </span>{' '}
        <span key={`tail-${wordIdx}`} style={{ animation: 'imxFadeIn .6s ease', fontWeight: 300 }}>{tail}</span>
      </h1>

      <div className="fadeup" style={{ animationDelay: '240ms', marginTop: 32, maxWidth: 760 }}>
        <p style={{ fontSize: 20, lineHeight: 1.45, color: 'rgba(255,255,255,0.75)', fontWeight: 300 }}>
          Tu expediente médico, en un vínculo. Cualquier doctor nuevo lo entiende
          en segundos — sin formularios, sin interrogatorios repetidos, sin información perdida.
        </p>
      </div>

      {/* ROLE CHOOSER — primary entry */}
      <div className="fadeup" style={{ animationDelay: '320ms', marginTop: 40 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.55)' }}>
            01 · empieza por decirnos quién eres
          </span>
          <span className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
            ⌘ + ↵ para usar vínculo
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <RoleLane
            tag="paciente"
            accent="#90E0EF"
            delay={400}
            title="Quiero llevar mi historial conmigo."
            body="Captura alergias, diagnósticos, medicación y cirugías. Compártelo con cualquier médico nuevo con un vínculo que expira."
            cta="Crear mi expediente — gratis"
          />
          <RoleLane
            tag="médico"
            accent="#00B4D8"
            delay={480}
            title="Recibí un vínculo. Quiero leer."
            body="Pega el vínculo y entra a la consola. Sin entrenamiento, sin clínica que te dé acceso. Una primera consulta clara en 30 segundos."
            cta="Acceder a la consola"
          />
          <RoleLane
            tag="institución"
            accent="#0096C7"
            delay={560}
            title="Agendo y administro médicos."
            body="Una agenda compartida, asignación de pacientes, auditoría de expedientes. Para clínicas con 3–80 doctores."
            cta="Hablar con ventas"
          />
        </div>
      </div>

      {/* live preview */}
      <HeroPreview />
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// TICKER strip — count-up stats
// ─────────────────────────────────────────────────────────────
function TickerStat({ value, suffix, label }) {
  const [ref, txt] = useCountUp(value, { suffix });
  return (
    <div className="before-view" ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '22px 24px' }}>
      <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontFamily: 'var(--sans)', fontSize: 44, fontWeight: 500, letterSpacing: '-0.03em', color: 'var(--ink)', lineHeight: 1 }}>
        {txt}
      </span>
    </div>
  );
}

function HomeTicker() {
  const ref = useReveal();
  return (
    <section ref={ref} style={{ padding: '56px 56px', background: 'var(--paper)', borderTop: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)' }}>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderRadius: 'var(--r-xl)',
        background: 'var(--white)', border: '1px solid var(--rule)', overflow: 'hidden',
      }}>
        <div style={{ borderRight: '1px solid var(--rule)' }}>
          <TickerStat value={14} suffix=" s" label="Tiempo a comprender al paciente" />
        </div>
        <div style={{ borderRight: '1px solid var(--rule)' }}>
          <TickerStat value={12480} label="Expedientes activos" />
        </div>
        <div style={{ borderRight: '1px solid var(--rule)' }}>
          <TickerStat value={1720} label="Médicos en consola" />
        </div>
        <div>
          <TickerStat value={0} label="Formularios duplicados" />
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// CÓMO FUNCIONA · 3 pasos visuales
// ─────────────────────────────────────────────────────────────
function StepIllustration({ kind }) {
  // simple geometric illustrations using only divs / svg shapes
  if (kind === 'capture') {
    return (
      <div style={{ height: 140, background: 'var(--paper-3)', borderRadius: 'var(--r-lg)', padding: 14, position: 'relative', overflow: 'hidden' }}>
        {['Penicilina · anafilaxia', 'Hipotiroidismo · 2018', 'Apendicectomía · 2017'].map((t, i) => (
          <div key={i} style={{
            background: 'var(--white)', borderRadius: 8, padding: '6px 10px', fontSize: 11,
            marginBottom: 6, border: '1px solid var(--rule)',
            animation: `imxFadeUp .6s ${i * 200}ms cubic-bezier(.2,.7,.2,1) both`,
          }}>
            <span style={{ color: 'var(--ink)', fontFamily: 'var(--mono)', letterSpacing: '-0.01em' }}>{t}</span>
            <span style={{ display: 'inline-block', width: 6, height: 12, background: 'var(--accent)', marginLeft: 4, verticalAlign: 'middle', animation: 'imxBlink 1s steps(2) infinite' }} />
          </div>
        ))}
      </div>
    );
  }
  if (kind === 'share') {
    return (
      <div style={{ height: 140, background: 'var(--ink)', color: 'var(--paper)', borderRadius: 'var(--r-lg)', padding: 14, position: 'relative', overflow: 'hidden' }}>
        <div className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.12em' }}>VÍNCULO · USO ÚNICO</div>
        <div className="mono" style={{ fontSize: 22, marginTop: 6, letterSpacing: '-0.02em' }}>
          imx.mx/<span style={{ color: 'var(--accent-bright)' }}>m·ar7r-92x</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14 }}>
          <span className="pulse" style={{ width: 8, height: 8, borderRadius: 99, background: 'var(--accent-bright)' }} />
          <span className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>expira en 22 min</span>
          <span style={{ flex: 1 }} />
          <span style={{
            fontSize: 11, padding: '4px 10px', borderRadius: 999,
            background: 'var(--accent-bright)', color: 'var(--ink)', fontWeight: 500,
          }}>Compartir</span>
        </div>
        <div style={{ position: 'absolute', right: -10, bottom: -10, fontSize: 120, opacity: 0.06, fontWeight: 700 }}>⌖</div>
      </div>
    );
  }
  // 'read'
  return (
    <div style={{ height: 140, background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', padding: 12, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 28, height: 28, borderRadius: 99, background: 'var(--paper-3)', display: 'inline-block' }} />
        <div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 15, lineHeight: 1, color: 'var(--ink)' }}>María F. Arellano</div>
          <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)' }}>♀ 34a · primera consulta</div>
        </div>
      </div>
      <div style={{ margin: '8px 0', padding: '4px 8px', background: 'var(--alert-soft)', border: '1px solid var(--alert-rule)', borderRadius: 6, fontSize: 10 }}>
        <span style={{ color: 'var(--alert)', fontWeight: 600 }}>ALERGIA</span> · Penicilina · anafilaxia
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
        {['Hipotiroidismo', 'Migraña aura', 'Levotiroxina 75µg', 'Sumatriptán PRN'].map((t, i) => (
          <div key={i} style={{ fontSize: 10, color: 'var(--ink-2)', padding: '3px 6px', background: 'var(--paper-2)', borderRadius: 4 }}>
            <span style={{ width: 3, height: 3, background: 'var(--accent)', display: 'inline-block', borderRadius: 99, marginRight: 5, verticalAlign: 'middle' }} />
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}

function HomeHow() {
  const ref = useReveal();
  const steps = [
    ['01', 'capture', 'El paciente captura su historial.', 'Cinco campos esenciales: alergias, diagnósticos, medicación, cirugías, estudios recientes. Sin formularios — anotaciones tipo bloc de notas.'],
    ['02', 'share',   'Comparte un vínculo con vencimiento.', 'Un código de 9 caracteres, uso único, 22 minutos. Lo pega en la consulta o lo muestra en pantalla. No expone otros datos.'],
    ['03', 'read',    'El médico ya lo leyó al saludarte.', 'En la consola aparece el expediente jerarquizado: alergias arriba, crónicos en medio, último estudio destacado. Sin clics intermedios.'],
  ];

  return (
    <section ref={ref} style={{ padding: '120px 56px 96px', background: 'var(--paper)' }}>
      <div className="before-view" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 56 }}>
        <div>
          <span className="eyebrow">02 · cómo funciona</span>
          <h2 style={{ fontSize: 80, lineHeight: 0.96, fontWeight: 300, letterSpacing: '-0.04em', marginTop: 16, maxWidth: 900 }}>
            Tres pasos.<br />
            <span className="serif" style={{ fontWeight: 400, color: 'var(--accent-deep)' }}>Cero burocracia.</span>
          </h2>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.08em' }}>tiempo total · primera vez</div>
          <div style={{ fontSize: 36, fontWeight: 500, letterSpacing: '-0.03em', marginTop: 6 }}>≈ 4 min</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
        {steps.map(([n, k, title, body], i) => (
          <div key={n} className="before-view" style={{
            transitionDelay: `${i * 120}ms`,
            background: 'var(--white)', border: '1px solid var(--rule)',
            borderRadius: 'var(--r-xl)', padding: '24px 26px 26px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
              <span className="mono" style={{ fontSize: 14, color: 'var(--ink-3)', letterSpacing: '0.06em' }}>{n}</span>
              <span style={{ fontSize: 22, color: 'var(--ink-4)' }}>{i === 2 ? '✓' : '↓'}</span>
            </div>
            <StepIllustration kind={k} />
            <h3 style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 18, lineHeight: 1.1 }}>{title}</h3>
            <p style={{ fontSize: 13.5, lineHeight: 1.55, color: 'var(--ink-2)', marginTop: 8 }}>{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// QUOTE · testimonio
// ─────────────────────────────────────────────────────────────
function HomeQuote() {
  const ref = useReveal();
  return (
    <section ref={ref} style={{ padding: '40px 56px 56px', background: 'var(--paper)' }}>
      <div className="before-view" style={{
        background: 'var(--ink)', color: 'var(--paper)', borderRadius: 'var(--r-2xl)',
        padding: '64px 72px', position: 'relative', overflow: 'hidden',
      }}>
        <span style={{
          position: 'absolute', top: 24, right: 32, fontFamily: 'var(--serif)',
          fontSize: 160, lineHeight: 1, color: 'var(--accent-bright)', opacity: 0.4,
        }}>”</span>
        <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.55)' }}>03 · testimonio</span>
        <p className="serif" style={{
          fontFamily: 'var(--serif)', fontSize: 56, lineHeight: 1.05, fontWeight: 400,
          letterSpacing: '-0.02em', marginTop: 22, maxWidth: 1100, fontStyle: 'normal',
        }}>
          La paciente entró al consultorio y yo ya sabía lo que tenía que ajustarle. No fue
          magia — fue que el expediente <span style={{ color: 'var(--accent-bright)', fontStyle: 'italic' }}>estaba completo</span>,
          jerarquizado, y tomó 14 segundos leerlo.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 36 }}>
          <span style={{ width: 36, height: 36, borderRadius: 99, background: 'var(--accent-bright)' }} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 500 }}>Dra. Patricia Galván</div>
            <div className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>
              endocrinología · CDMX · usuaria desde 2025
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// PARA CADA ROL — bento de features
// ─────────────────────────────────────────────────────────────
function RoleBento({ tint = 'light', tag, title, bullets, cta }) {
  const tints = {
    light: { bg: 'var(--white)', fg: 'var(--ink)', dim: 'var(--ink-2)', rule: 'var(--rule)', chip: 'chip accent' },
    cyan:  { bg: 'var(--paper-3)', fg: 'var(--ink)', dim: 'var(--ink-2)', rule: 'var(--accent-rule)', chip: 'chip' },
    dark:  { bg: 'var(--ink)', fg: 'var(--paper)', dim: 'rgba(255,255,255,0.72)', rule: 'rgba(255,255,255,0.15)', chip: 'chip dark' },
  }[tint];
  return (
    <div className="before-view" style={{
      background: tints.bg, color: tints.fg, borderRadius: 'var(--r-xl)',
      border: `1px solid ${tints.rule}`, padding: '28px 30px',
      display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      <span className={tints.chip} style={{ alignSelf: 'flex-start' }}>{tag}</span>
      <h3 style={{ fontSize: 30, fontWeight: 500, lineHeight: 1.05, letterSpacing: '-0.025em' }}>{title}</h3>
      <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {bullets.map((b, i) => (
          <li key={i} style={{ display: 'grid', gridTemplateColumns: '20px 1fr', gap: 10, alignItems: 'baseline', fontSize: 14, color: tints.dim, lineHeight: 1.45 }}>
            <span style={{ color: 'var(--accent-bright)', fontWeight: 600 }}>→</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <div style={{ flex: 1 }} />
      <button className={`btn ${tint === 'dark' ? 'invert' : ''}`} style={{ alignSelf: 'flex-start' }}>{cta} →</button>
    </div>
  );
}

function HomeRoles() {
  const ref = useReveal();
  return (
    <section ref={ref} style={{ padding: '96px 56px', background: 'var(--paper)' }}>
      <div className="before-view" style={{ marginBottom: 36 }}>
        <span className="eyebrow">04 · qué obtienes</span>
        <h2 style={{ fontSize: 64, lineHeight: 0.98, fontWeight: 300, letterSpacing: '-0.04em', marginTop: 14 }}>
          Una vista por rol.<br />
          <span className="serif" style={{ fontWeight: 400, color: 'var(--accent-deep)' }}>Nada más.</span>
        </h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr 1fr', gap: 16 }}>
        <RoleBento
          tint="dark"
          tag="médico"
          title="Lee al paciente, no al interrogatorio."
          bullets={[
            'Consola con agenda del día y expediente del paciente lado a lado',
            'Alergias y diagnósticos críticos siempre en jerarquía 1',
            'Nota clínica autosave + receta + estudio sin salir de la pantalla',
            'Acceso por vínculo, sin que la clínica te dé credenciales',
          ]}
          cta="Acceder a la consola"
        />
        <RoleBento
          tint="cyan"
          tag="paciente"
          title="Tu historial cabe en un vínculo."
          bullets={[
            'Captura conversacional — no formularios',
            'Vínculos con vencimiento, uso único, revocables',
            'Recordatorios de medicación y citas',
            'Importa estudios de laboratorio por PDF',
          ]}
          cta="Crear mi expediente"
        />
        <RoleBento
          tint="light"
          tag="institución"
          title="Una agenda para 3 o 80 médicos."
          bullets={[
            'Asignación de pacientes y agenda compartida',
            'Auditoría de expedientes que pasan por la clínica',
            'Cobranza unificada · facturación CFDI',
            'SSO + roles administrativos granulares',
          ]}
          cta="Hablar con ventas"
        />
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// CTA FINAL
// ─────────────────────────────────────────────────────────────
function HomeCTA() {
  return (
    <section style={{ padding: '40px 56px 56px', background: 'var(--paper)' }}>
      <div style={{
        background: 'linear-gradient(135deg, #03045E 0%, #023E8A 60%, #0077B6 100%)',
        color: 'var(--paper)', borderRadius: 'var(--r-2xl)', padding: '80px 72px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.1,
          backgroundImage: 'radial-gradient(circle at 20% 20%, var(--accent-bright) 0%, transparent 40%), radial-gradient(circle at 80% 80%, var(--accent-bright) 0%, transparent 40%)',
        }} />
        <div style={{ position: 'relative' }}>
          <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.65)' }}>05 · empieza</span>
          <h2 style={{ fontSize: 88, lineHeight: 0.96, fontWeight: 300, letterSpacing: '-0.045em', marginTop: 18, maxWidth: 1100 }}>
            Tu próximo médico<br />
            ya lo necesita.<br />
            <span className="serif" style={{ fontWeight: 400, color: 'var(--accent-bright)' }}>Empieza hoy.</span>
          </h2>
          <div style={{ display: 'flex', gap: 12, marginTop: 40, flexWrap: 'wrap' }}>
            <button className="btn lg invert">Crear mi expediente — paciente</button>
            <button className="btn lg dark-ghost">Soy médico · acceder con vínculo</button>
            <button className="btn lg dark-ghost">Soy institución · hablar con ventas</button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────────────────────
function HomeFooter() {
  return (
    <footer style={{ padding: '36px 56px 36px', background: 'var(--paper)', borderTop: '1px solid var(--rule)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 24 }}>
        <HomeLogo height={18} />
        <div style={{ display: 'flex', gap: 22 }}>
          {['Privacidad', 'Términos', 'Seguridad', 'NOM-024', 'Soporte', 'Cambios'].map((x) => (
            <span key={x} className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.06em' }}>{x}</span>
          ))}
        </div>
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textAlign: 'right' }}>
          © 2026 imedexp · CDMX · cifrado AES-256 · HIPAA · NOM-024-SSA3-2010
        </span>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────
// Compose
// ─────────────────────────────────────────────────────────────
function HomeScreen() {
  return (
    <div className="imx" style={{ width: 1440, background: 'var(--paper)', overflow: 'hidden' }} data-screen-label="Home / Landing">
      <HomeNav />
      <HomeHero />
      <HomeTicker />
      <HomeHow />
      <HomeQuote />
      <HomeRoles />
      <HomeCTA />
      <HomeFooter />
    </div>
  );
}

window.HomeScreen = HomeScreen;
window.HomeLogo = HomeLogo;
window.Pulse = Pulse;
