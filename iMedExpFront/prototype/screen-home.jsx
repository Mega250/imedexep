// imedexp · Home / Landing — v4 (proper marketing landing page)
//
// Structure (matching SaaS landing expectations, but designed with authority):
//   1. Nav
//   2. Hero — split: left content + right floating dashboard preview
//   3. Trust strip — compliance + counters
//   4. Features grid — 6 cards (3×2)
//   5. Cómo funciona — 3 numbered steps with mini-illustrations
//   6. Para Médicos — split with doctor mockup
//   7. Para Pacientes — split with patient mockup (inverse)
//   8. App móvil — split with phone
//   9. CTA — full-bleed deep navy with animated background
//  10. Footer — 4-column dark
//
// Palette: paper dominates. Navy reserved for CTA + footer.

// ─────────────────────────────────────────────────────────────
// Shared bits
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

// Simple geometric icons (rect / line / circle compositions only)
function Icon({ kind, size = 22, color = 'currentColor' }) {
  const stroke = color, w = 1.5;
  const props = { fill: 'none', stroke, strokeWidth: w, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const svg = (children) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...props}>{children}</svg>
  );
  switch (kind) {
    case 'doc':
      return svg(<><rect x="5" y="3" width="14" height="18" rx="1.5" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="13" y2="16" /></>);
    case 'cal':
      return svg(<><rect x="3.5" y="5.5" width="17" height="15" rx="1.5" /><line x1="3.5" y1="10" x2="20.5" y2="10" /><line x1="8" y1="3" x2="8" y2="7" /><line x1="16" y1="3" x2="16" y2="7" /></>);
    case 'shield':
      return svg(<><path d="M12 3 L20 6 L20 12 C20 16.5 16.5 19.5 12 21 C7.5 19.5 4 16.5 4 12 L4 6 Z" /><path d="M9 12 L11 14 L15 10" /></>);
    case 'chart':
      return svg(<><line x1="4" y1="20" x2="20" y2="20" /><rect x="6" y="13" width="2.5" height="7" /><rect x="11" y="9" width="2.5" height="11" /><rect x="16" y="5" width="2.5" height="15" /></>);
    case 'pill':
      return svg(<><rect x="3.5" y="9" width="17" height="6" rx="3" /><line x1="12" y1="9" x2="12" y2="15" /></>);
    case 'monitor':
      return svg(<><rect x="3" y="4" width="18" height="13" rx="1.5" /><line x1="9" y1="20.5" x2="15" y2="20.5" /><line x1="12" y1="17" x2="12" y2="21" /><path d="M7 11 L9 9 L11 12 L13 8 L15 13 L17 11" /></>);
    case 'qr':
      return svg(<><rect x="3.5" y="3.5" width="6" height="6" /><rect x="14.5" y="3.5" width="6" height="6" /><rect x="3.5" y="14.5" width="6" height="6" /><rect x="6" y="6" width="1" height="1" /><rect x="17" y="6" width="1" height="1" /><rect x="6" y="17" width="1" height="1" /><line x1="13" y1="14" x2="13" y2="17" /><line x1="13" y1="20" x2="13" y2="21" /><line x1="16" y1="14" x2="20" y2="14" /><rect x="18" y="17" width="3" height="3" /></>);
    case 'link':
      return svg(<><path d="M10 14 L14 10" /><path d="M8 11 L6 13 A2.8 2.8 0 0 0 10 17 L12 15" /><path d="M16 13 L18 11 A2.8 2.8 0 0 0 14 7 L12 9" /></>);
    case 'bell':
      return svg(<><path d="M6 17 L18 17 L17 15.5 L17 11 A5 5 0 0 0 7 11 L7 15.5 Z" /><path d="M10 17 A2 2 0 0 0 14 17" /></>);
    case 'lock':
      return svg(<><rect x="5.5" y="11" width="13" height="8.5" rx="1" /><path d="M8 11 L8 8 A4 4 0 0 1 16 8 L16 11" /></>);
    case 'arrow':
      return svg(<><path d="M5 12 L19 12" /><path d="M14 7 L19 12 L14 17" /></>);
    case 'play':
      return svg(<polygon points="9,7 17,12 9,17" fill={color} />);
    case 'apple':
      return svg(<><path d="M14 4 C13 5 12 6 12 7" /><path d="M8 9 C6 9 4 11 4 14 C4 17 6 20 8 20 C9.5 20 10 19.5 11.5 19.5 C13 19.5 13.5 20 15 20 C17 20 19 17 19 14 C19 11 17 9 15 9 C13.5 9 13 9.5 11.5 9.5 C10 9.5 9.5 9 8 9 Z" /></>);
    case 'android':
      return svg(<><path d="M5 11 L5 17 L19 17 L19 11" /><path d="M7 11 A5 5 0 0 1 17 11" /><circle cx="9" cy="9" r="0.6" fill={color} /><circle cx="15" cy="9" r="0.6" fill={color} /><line x1="6" y1="7" x2="8" y2="9" /><line x1="18" y1="7" x2="16" y2="9" /></>);
    case 'check':
      return svg(<path d="M5 12 L10 17 L19 7" />);
    default:
      return svg(<circle cx="12" cy="12" r="8" />);
  }
}

// Auto-reveal helper
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
    const safety = setTimeout(() => targets.forEach((t) => t.classList.add('is-visible')), 1400);
    return () => { io.disconnect(); clearTimeout(safety); };
  }, []);
  return ref;
}

function useCountUp(target, { duration = 1200, suffix = '', prefix = '' } = {}) {
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
    const safety = setTimeout(start, 1400);
    return () => { io.disconnect(); clearTimeout(safety); };
  }, [target, duration]);
  return [ref, prefix + val.toLocaleString('en-US') + suffix];
}

// ─────────────────────────────────────────────────────────────
// 1 · NAV — sticky, light, refined
// ─────────────────────────────────────────────────────────────
function HomeNav() {
  return (
    <header style={{
      display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center',
      padding: '20px 56px', position: 'sticky', top: 0, zIndex: 20,
      background: 'rgba(241,250,254,0.85)', backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--rule-2)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <HomeLogo height={20} />
        <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', padding: '3px 7px', border: '1px solid var(--rule)', borderRadius: 4, letterSpacing: '0.06em' }}>BETA</span>
      </div>
      <nav style={{ display: 'flex', gap: 32, alignItems: 'center', justifySelf: 'center' }}>
        {['Producto', 'Características', 'Cómo funciona', 'Para Médicos', 'Para Pacientes', 'Precios'].map((x) => (
          <a key={x} style={{ fontSize: 13.5, color: 'var(--ink-2)', cursor: 'pointer' }}>{x}</a>
        ))}
      </nav>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, justifySelf: 'end' }}>
        <span style={{ fontSize: 13, color: 'var(--ink-2)', cursor: 'pointer' }}>Iniciar sesión</span>
        <button className="btn sm" style={{ background: 'var(--accent)', borderColor: 'var(--accent)', color: '#fff' }}>
          Comenzar gratis →
        </button>
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────
// 2 · HERO — split: content left + dashboard preview right
// ─────────────────────────────────────────────────────────────
function HeroDashboardPreview() {
  return (
    <div style={{ position: 'relative', perspective: 1200 }}>
      {/* floating decoration circles */}
      <div style={{
        position: 'absolute', width: 320, height: 320, borderRadius: 999,
        background: 'radial-gradient(circle, var(--paper-3) 0%, transparent 70%)',
        top: -60, right: -80, opacity: 0.6, pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: 220, height: 220, borderRadius: 999,
        background: 'radial-gradient(circle, var(--accent-rule) 0%, transparent 70%)',
        bottom: -40, left: -40, opacity: 0.4, pointerEvents: 'none',
      }} />

      {/* Main floating card */}
      <div style={{
        position: 'relative', background: 'var(--white)',
        borderRadius: 'var(--r-xl)', border: '1px solid var(--rule)',
        boxShadow: '0 30px 80px -20px rgba(3,4,94,0.18), 0 4px 12px rgba(3,4,94,0.06)',
        overflow: 'hidden',
      }}>
        {/* window chrome */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', borderBottom: '1px solid var(--rule-2)', background: 'var(--paper)',
        }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 99, background: '#FF6058' }} />
            <span style={{ width: 10, height: 10, borderRadius: 99, background: '#FFBD2D' }} />
            <span style={{ width: 10, height: 10, borderRadius: 99, background: '#27CA40' }} />
          </div>
          <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>consola.imedexp.mx</span>
          <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>Dr. Solís</span>
        </div>

        {/* content */}
        <div style={{ padding: '20px 22px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <span className="eyebrow" style={{ fontSize: 10 }}>Próxima cita · en 12 min</span>
              <h4 style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 400, lineHeight: 1.02, letterSpacing: '-0.02em', marginTop: 4 }}>
                María Fernanda Arellano
              </h4>
              <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 4 }}>
                ♀ 34a · O+ · primera consulta · CDMX
              </div>
            </div>
            <span className="chip accent">vínculo · 4d</span>
          </div>

          {/* alergia banner */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--alert-soft)', border: '1px solid var(--alert-rule)',
            borderRadius: 'var(--r-md)', padding: '10px 12px', marginTop: 14,
          }}>
            <span style={{
              fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em',
              padding: '3px 8px', borderRadius: 999, background: 'var(--alert)', color: '#fff',
            }}>ALERGIA SEVERA</span>
            <span style={{ fontSize: 12.5, color: 'var(--ink)' }}>
              <strong>Penicilina</strong> · anafilaxia 2019
            </span>
          </div>

          {/* 2×2 expediente */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, marginTop: 14, background: 'var(--rule)', borderRadius: 'var(--r-md)', overflow: 'hidden', border: '1px solid var(--rule)' }}>
            {[
              ['Dx activos', 'Hipotiroidismo · migraña · SOP', '4'],
              ['Medicación', 'Levotiroxina 75µg · 06:30', '3'],
              ['Cirugías', 'Apendicectomía · 2017', '3'],
              ['Estudios', 'TSH 4.8 mU/L · BH micro', '4'],
            ].map(([k, body, n], i) => (
              <div key={i} style={{ background: 'var(--white)', padding: '11px 13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span className="eyebrow" style={{ fontSize: 10 }}>{k}</span>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--accent-deep)' }}>{n}</span>
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-2)', marginTop: 4, lineHeight: 1.4 }}>{body}</div>
              </div>
            ))}
          </div>

          {/* mini quick-actions */}
          <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
            <button className="btn sm" style={{ flex: 1, justifyContent: 'center', background: 'var(--accent)', borderColor: 'var(--accent)' }}>+ Nota</button>
            <button className="btn sm ghost" style={{ flex: 1, justifyContent: 'center' }}>+ Receta</button>
            <button className="btn sm ghost" style={{ flex: 1, justifyContent: 'center' }}>+ Estudio</button>
          </div>
        </div>
      </div>

      {/* floating mini card — notification */}
      <div style={{
        position: 'absolute', right: -28, top: 60, width: 260,
        background: 'var(--ink)', color: 'var(--paper)', borderRadius: 'var(--r-lg)',
        padding: '12px 14px', boxShadow: '0 20px 40px -10px rgba(3,4,94,0.3)',
        animation: 'imxFadeUp .8s .9s both cubic-bezier(.2,.7,.2,1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Pulse color="var(--accent-bright)" dark />
          <span className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.12em' }}>NUEVO VÍNCULO</span>
        </div>
        <div style={{ fontSize: 13, marginTop: 6, fontWeight: 500 }}>Carlos Mendoza Vela</div>
        <div className="mono" style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>
          imx.mx/c·m4z-8tk
        </div>
      </div>

      {/* floating mini card — patient mobile preview */}
      <div style={{
        position: 'absolute', left: -32, bottom: -40, width: 220,
        background: 'var(--white)', color: 'var(--ink)', borderRadius: 'var(--r-lg)',
        padding: '14px 16px', border: '1px solid var(--rule)',
        boxShadow: '0 20px 40px -10px rgba(3,4,94,0.18)',
        animation: 'imxFadeUp .8s 1.1s both cubic-bezier(.2,.7,.2,1)',
      }}>
        <span className="eyebrow" style={{ fontSize: 10 }}>Adherencia · 30 días</span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 8 }}>
          <span style={{ fontSize: 32, fontWeight: 500, letterSpacing: '-0.03em' }}>94</span>
          <span className="mono" style={{ fontSize: 13, color: 'var(--ink-3)' }}>%</span>
          <span style={{ flex: 1 }} />
          <span className="mono" style={{ fontSize: 11, color: 'var(--ok)' }}>↑ 6 pts</span>
        </div>
        {/* mini bar chart */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, marginTop: 10, height: 28 }}>
          {[40, 60, 55, 70, 75, 65, 80, 90, 75, 88, 92, 94].map((h, i) => (
            <div key={i} style={{
              flex: 1, height: `${h}%`,
              background: i === 11 ? 'var(--accent)' : 'var(--paper-3)',
              borderRadius: 2,
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function HomeHero() {
  return (
    <section style={{
      position: 'relative', padding: '80px 56px 100px', overflow: 'hidden',
      background: 'linear-gradient(180deg, var(--paper) 0%, var(--paper) 50%, var(--white) 100%)',
    }}>
      {/* faint grid pattern */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.4, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle, var(--rule) 1px, transparent 1px)',
        backgroundSize: '30px 30px',
        maskImage: 'radial-gradient(ellipse at top right, black 0%, transparent 60%)',
        WebkitMaskImage: 'radial-gradient(ellipse at top right, black 0%, transparent 60%)',
      }} />

      <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 80, alignItems: 'center', position: 'relative' }}>
        {/* LEFT */}
        <div>
          <span className="fadeup" style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '6px 12px 6px 8px', borderRadius: 999,
            background: 'var(--paper-3)', border: '1px solid var(--accent-rule)',
            color: 'var(--accent-deep)', fontSize: 12, fontWeight: 500,
          }}>
            <Pulse />
            Plataforma médica · MX · NOM-024-SSA3
          </span>

          <h1 className="fadeup" style={{
            animationDelay: '120ms',
            fontFamily: 'var(--sans)', fontWeight: 300, fontSize: 92, lineHeight: 0.96,
            letterSpacing: '-0.045em', marginTop: 24, color: 'var(--ink)',
          }}>
            Tu expediente médico,<br />
            <span style={{ fontWeight: 700, color: 'var(--accent-deep)' }}>listo</span>{' '}
            <span className="serif" style={{ fontWeight: 400 }}>en cualquier</span><br />
            consulta.
          </h1>

          <p className="fadeup" style={{
            animationDelay: '240ms',
            fontSize: 18, lineHeight: 1.5, color: 'var(--ink-2)', marginTop: 28, maxWidth: 560,
            fontWeight: 300,
          }}>
            La plataforma que conecta pacientes y médicos. Captura tu historial una vez —
            alergias, diagnósticos, medicación, cirugías — y compártelo en segundos con
            cualquier doctor nuevo. Sin formularios. Sin papeleo. Sin información perdida.
          </p>

          <div className="fadeup" style={{ animationDelay: '320ms', display: 'flex', gap: 12, marginTop: 36, flexWrap: 'wrap' }}>
            <button className="btn lg" style={{ background: 'var(--accent)', borderColor: 'var(--accent)' }}>
              Soy Paciente → empezar gratis
            </button>
            <button className="btn lg ghost">Soy Médico → acceder</button>
          </div>

          {/* 3 stat row */}
          <div className="fadeup" style={{ animationDelay: '420ms', display: 'flex', gap: 40, marginTop: 48 }}>
            {[
              ['12,480', 'Expedientes activos'],
              ['1,720+', 'Médicos en consola'],
              ['98%', 'Adherencia médica'],
            ].map(([n, l], i) => (
              <div key={i}>
                <div style={{ fontSize: 32, fontWeight: 500, letterSpacing: '-0.03em', color: 'var(--ink)' }}>{n}</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.06em', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — dashboard preview */}
        <div className="fadeup" style={{ animationDelay: '480ms' }}>
          <HeroDashboardPreview />
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// 3 · TRUST STRIP — compliance + animated counters
// ─────────────────────────────────────────────────────────────
function HomeTrust() {
  const ref = useReveal();
  return (
    <section ref={ref} style={{
      padding: '32px 56px',
      background: 'var(--ink)', color: 'var(--paper)',
      borderTop: '1px solid var(--ink)', borderBottom: '1px solid var(--ink)',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 56, alignItems: 'center' }}>
        <div>
          <span className="mono" style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.16em' }}>
            CUMPLIMIENTO Y SEGURIDAD
          </span>
          <div className="mono" style={{ fontSize: 14, marginTop: 6, color: 'var(--paper)', letterSpacing: '-0.005em' }}>
            HIPAA · NOM-024-SSA3 · ISO 27001
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}>
          {[
            ['Cifrado', 'AES-256 E2E'],
            ['Datos en MX', '100% soberanía'],
            ['Auditoría', 'Cada acceso'],
            ['Revocable', 'En 1 toque'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Icon kind="check" size={18} color="var(--accent-bright)" />
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{k}</div>
                <div className="mono" style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{v}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// 4 · FEATURES GRID — 6 cards (3×2)
// ─────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, body, tag, accent }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      className="before-view"
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background: 'var(--white)', border: '1px solid var(--rule)',
        borderRadius: 'var(--r-xl)', padding: '28px 30px 26px',
        position: 'relative', overflow: 'hidden', cursor: 'pointer',
        transition: 'transform .3s cubic-bezier(.2,.7,.2,1), box-shadow .3s, border-color .3s',
        transform: hover ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hover ? '0 24px 50px -20px rgba(3,4,94,0.18)' : '0 1px 0 var(--rule-2)',
        borderColor: hover ? 'var(--accent-rule)' : 'var(--rule)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{
          width: 48, height: 48, borderRadius: 'var(--r-md)',
          background: accent ? 'var(--accent)' : 'var(--paper-3)',
          color: accent ? '#fff' : 'var(--accent-deep)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform .3s',
          transform: hover ? 'scale(1.08) rotate(-3deg)' : 'none',
        }}>
          <Icon kind={icon} size={22} />
        </div>
        {tag && <span className="chip accent" style={{ fontSize: 10 }}>{tag}</span>}
      </div>
      <h3 style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 22, lineHeight: 1.15 }}>
        {title}
      </h3>
      <p style={{ fontSize: 13.5, color: 'var(--ink-2)', marginTop: 8, lineHeight: 1.55 }}>{body}</p>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, marginTop: 22,
        fontSize: 12.5, fontWeight: 500, color: 'var(--accent-deep)',
      }}>
        Conoce más
        <span style={{ transition: 'transform .3s', transform: hover ? 'translateX(4px)' : 'none' }}>→</span>
      </div>
    </div>
  );
}

function HomeFeatures() {
  const ref = useReveal();
  const items = [
    ['doc',     'Historia Clínica Digital',     'Expedientes completos con alergias, diagnósticos, cirugías, medicación y signos vitales. Siempre actualizados, siempre disponibles.', 'CORE', true],
    ['cal',     'Citas Inteligentes',           'Agenda y gestiona consultas desde cualquier dispositivo. Recordatorios automáticos por SMS y email para pacientes.', null, false],
    ['shield',  'Seguridad Médica',             'Cifrado AES-256 extremo a extremo, auditoría de cada acceso, vínculos con vencimiento. NOM-024-SSA3 y HIPAA.', null, false],
    ['chart',   'Análisis de Salud',            'Visualiza tendencias de signos vitales, adherencia a tratamientos y resultados de laboratorio con gráficas claras.', null, false],
    ['pill',    'Recetas Digitales',            'Genera recetas electrónicas con firma del médico, las envía al paciente al instante y al expediente automáticamente.', null, false],
    ['monitor', 'Multi-plataforma',             'iOS · Android · Web. El expediente del paciente accesible desde cualquier dispositivo. Sincronización en tiempo real.', null, false],
  ];
  return (
    <section ref={ref} style={{ padding: '120px 56px 80px', background: 'var(--white)' }}>
      <div className="before-view" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 56 }}>
        <div>
          <span className="eyebrow">02 · características</span>
          <h2 style={{ fontSize: 64, lineHeight: 0.98, fontWeight: 300, letterSpacing: '-0.04em', marginTop: 12, maxWidth: 900 }}>
            Todo lo que necesitas para<br />
            <span className="serif" style={{ fontWeight: 400, color: 'var(--accent-deep)' }}>una práctica moderna.</span>
          </h2>
        </div>
        <p style={{ fontSize: 14, color: 'var(--ink-3)', maxWidth: 320, lineHeight: 1.5 }}>
          Herramientas diseñadas específicamente para el flujo de trabajo clínico real — no
          formularios genéricos adaptados.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {items.map(([icon, title, body, tag, accent]) => (
          <FeatureCard key={title} icon={icon} title={title} body={body} tag={tag} accent={accent} />
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// 5 · CÓMO FUNCIONA — 3 numbered steps
// ─────────────────────────────────────────────────────────────
function StepCard({ n, icon, title, body, illustration }) {
  return (
    <div className="before-view" style={{
      background: 'var(--white)', border: '1px solid var(--rule)',
      borderRadius: 'var(--r-xl)', padding: '28px 28px 26px',
      position: 'relative', display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      {/* number badge */}
      <div style={{
        position: 'absolute', top: -16, left: 24,
        width: 44, height: 44, borderRadius: 999,
        background: 'var(--ink)', color: 'var(--paper)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 500, letterSpacing: '0.06em',
        boxShadow: '0 8px 20px -6px rgba(3,4,94,0.35)',
      }}>
        {n}
      </div>
      <div style={{ height: 30 }} />
      {illustration}
      <div>
        <h3 style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.15 }}>{title}</h3>
        <p style={{ fontSize: 13.5, color: 'var(--ink-2)', marginTop: 8, lineHeight: 1.55 }}>{body}</p>
      </div>
    </div>
  );
}

function StepIllustration({ kind }) {
  if (kind === 'register') {
    return (
      <div style={{ background: 'var(--paper-3)', borderRadius: 'var(--r-lg)', padding: '16px 18px', height: 160 }}>
        <span className="eyebrow" style={{ fontSize: 10 }}>Crear cuenta · 2 min</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
          {[
            ['Nombre completo', 'María Fernanda A.'],
            ['Correo', 'maria@correo.mx'],
            ['Rol', 'Paciente'],
          ].map(([k, v], i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '8px 10px', background: 'var(--white)', borderRadius: 6,
              fontSize: 11, animation: `imxFadeUp .5s ${i * 150}ms both cubic-bezier(.2,.7,.2,1)`,
            }}>
              <span className="mono" style={{ color: 'var(--ink-3)' }}>{k}</span>
              <span style={{ fontWeight: 500 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (kind === 'connect') {
    return (
      <div style={{ background: 'var(--ink)', color: 'var(--paper)', borderRadius: 'var(--r-lg)', padding: '16px 18px', height: 160, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <span className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.12em' }}>VÍNCULO ACTIVO</span>
          <div className="mono" style={{ fontSize: 18, marginTop: 8, letterSpacing: '-0.01em' }}>
            imx.mx/<span style={{ color: 'var(--accent-bright)' }}>m·ar7r-92x</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
            <Pulse color="var(--accent-bright)" dark />
            <span className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>22 min</span>
          </div>
        </div>
        <div style={{
          width: 80, height: 80, background: 'var(--white)', borderRadius: 'var(--r-md)',
          padding: 6, color: 'var(--ink)',
        }}>
          {/* mini QR */}
          <svg viewBox="0 0 10 10" width="100%" height="100%">
            {[[0,0],[1,0],[2,0],[3,0],[4,0],[6,0],[7,0],[9,0],
              [0,1],[2,1],[4,1],[7,1],[8,1],[9,1],
              [0,2],[2,2],[4,2],[6,2],[9,2],
              [0,3],[1,3],[4,3],[6,3],[7,3],[8,3],
              [2,4],[3,4],[6,4],[8,4],[9,4],
              [0,5],[1,5],[5,5],[6,5],[7,5],
              [3,6],[4,6],[6,6],[8,6],
              [0,7],[2,7],[4,7],[7,7],[9,7],
              [1,8],[3,8],[5,8],[6,8],[8,8],
              [0,9],[2,9],[3,9],[5,9],[7,9],[9,9]].map(([x,y],i) => (
                <rect key={i} x={x} y={y} width="1" height="1" fill="currentColor" />
              ))}
          </svg>
        </div>
      </div>
    );
  }
  // 'manage'
  return (
    <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', padding: '14px 16px', height: 160, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 32, height: 32, borderRadius: 99, background: 'var(--paper-3)', display: 'inline-block' }} />
        <div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 16, lineHeight: 1 }}>María F. Arellano</div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 2 }}>♀ 34a · primera consulta</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4, marginTop: 10, padding: '6px 8px', background: 'var(--alert-soft)', border: '1px solid var(--alert-rule)', borderRadius: 6, fontSize: 10.5 }}>
        <span style={{ color: 'var(--alert)', fontWeight: 600 }}>ALERGIA</span>
        <span style={{ color: 'var(--ink-2)' }}>· Penicilina · anafilaxia</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginTop: 8 }}>
        {[
          ['Dx', 'Hipotiroidismo'],
          ['Med', 'Levotiroxina 75µg'],
          ['Cx', 'Apendicectomía'],
          ['Lab', 'TSH 4.8'],
        ].map(([k, v]) => (
          <div key={k} style={{ padding: '4px 6px', background: 'var(--paper-2)', borderRadius: 4, fontSize: 10 }}>
            <span className="mono" style={{ color: 'var(--accent-deep)' }}>{k}</span>
            <span style={{ color: 'var(--ink-2)', marginLeft: 4 }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HomeHow() {
  const ref = useReveal();
  return (
    <section ref={ref} style={{
      padding: '120px 56px 100px',
      background: 'linear-gradient(180deg, var(--paper) 0%, var(--paper-2) 100%)',
    }}>
      <div className="before-view" style={{ textAlign: 'center', marginBottom: 64 }}>
        <span className="eyebrow">03 · cómo funciona</span>
        <h2 style={{ fontSize: 64, lineHeight: 0.98, fontWeight: 300, letterSpacing: '-0.04em', marginTop: 12, maxWidth: 1100, marginInline: 'auto' }}>
          Empieza en <span style={{ fontWeight: 700, color: 'var(--accent-deep)' }}>3 pasos</span>{' '}
          <span className="serif" style={{ fontWeight: 400 }}>simples.</span>
        </h2>
        <p style={{ fontSize: 16, color: 'var(--ink-3)', marginTop: 16, maxWidth: 600, marginInline: 'auto', lineHeight: 1.5 }}>
          Sin configuración compleja. Sin curvas de aprendizaje. Sin contratos.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, position: 'relative', maxWidth: 1280, marginInline: 'auto' }}>
        <StepCard
          n="01" icon="check"
          title="Regístrate en 2 minutos"
          body="Crea tu cuenta como médico o paciente. Verificación de correo instantánea y captura conversacional de tu información clínica básica."
          illustration={<StepIllustration kind="register" />}
        />
        <StepCard
          n="02" icon="link"
          title="Comparte un vínculo seguro"
          body="Genera un código único, con vencimiento (22 min) y uso único. Lo pegas en la consulta o lo muestras en pantalla. Nadie más puede acceder."
          illustration={<StepIllustration kind="connect" />}
        />
        <StepCard
          n="03" icon="doc"
          title="El médico ya lo leyó"
          body="En la consola del médico aparece el expediente jerarquizado: alergias arriba, crónicos en medio, último estudio destacado. Sin clics intermedios."
          illustration={<StepIllustration kind="manage" />}
        />
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// 6 · PARA MÉDICOS — split (mockup left, content right)
// ─────────────────────────────────────────────────────────────
function MedicoMockup() {
  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        background: 'var(--white)', border: '1px solid var(--rule)',
        borderRadius: 'var(--r-xl)', overflow: 'hidden',
        boxShadow: '0 30px 80px -20px rgba(3,4,94,0.18)',
      }}>
        {/* mini doctor console */}
        <div style={{ background: 'var(--ink)', color: 'var(--paper)', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Dr. Ricardo Solís M.</div>
            <div className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>endocrinología · 8/12 citas hoy</div>
          </div>
          <span className="chip dark">mié 14 may</span>
        </div>

        {/* agenda list */}
        <div style={{ padding: '14px 18px 18px' }}>
          <span className="eyebrow">Agenda · próximas</span>
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              ['10:30', 'María F. Arellano', 'primera vez', true],
              ['11:15', 'José L. Padilla', 'post-op día 12', false],
              ['12:00', 'Ana Sofía Cortés', 'control crónico', false],
            ].map(([t, n, tag, active], i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '46px 1fr auto', gap: 10, alignItems: 'baseline',
                padding: '10px 12px', borderRadius: 'var(--r-md)',
                background: active ? 'var(--paper-3)' : 'var(--paper)',
                border: '1px solid', borderColor: active ? 'var(--accent-rule)' : 'var(--rule-2)',
              }}>
                <span className="mono" style={{ fontSize: 12, color: 'var(--ink-2)' }}>{t}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{n}</div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 2, letterSpacing: '0.04em' }}>{tag}</div>
                </div>
                {active && <Pulse color="var(--accent)" />}
              </div>
            ))}
          </div>

          {/* alert banner mini */}
          <div style={{
            marginTop: 12, padding: '8px 12px',
            background: 'var(--alert-soft)', border: '1px solid var(--alert-rule)', borderRadius: 'var(--r-md)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 9, padding: '3px 7px', background: 'var(--alert)', color: '#fff', borderRadius: 999, letterSpacing: '0.12em' }}>ALERGIA</span>
            <span style={{ fontSize: 12 }}><strong>Penicilina</strong> · paciente próximo: M.F. Arellano</span>
          </div>
        </div>
      </div>

      {/* floating bottom — stats */}
      <div style={{
        position: 'absolute', bottom: -32, right: -24,
        background: 'var(--accent)', color: '#fff', borderRadius: 'var(--r-lg)',
        padding: '16px 20px', boxShadow: '0 20px 40px -10px rgba(0,150,199,0.4)',
        display: 'flex', alignItems: 'baseline', gap: 14,
      }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1 }}>−14 s</div>
          <div className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>menos por consulta</div>
        </div>
      </div>
    </div>
  );
}

function HomeMedico() {
  const ref = useReveal();
  return (
    <section ref={ref} style={{ padding: '120px 56px 100px', background: 'var(--white)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
        <div className="before-view"><MedicoMockup /></div>
        <div className="before-view">
          <span className="chip accent" style={{ display: 'inline-flex' }}>
            <Icon kind="monitor" size={14} /> Para Médicos
          </span>
          <h2 style={{ fontSize: 56, lineHeight: 1.0, fontWeight: 300, letterSpacing: '-0.04em', marginTop: 18 }}>
            Tu consultorio,<br />
            <span className="serif" style={{ fontWeight: 400, color: 'var(--accent-deep)' }}>en tu bolsillo.</span>
          </h2>
          <p style={{ fontSize: 16, color: 'var(--ink-2)', marginTop: 18, lineHeight: 1.55, maxWidth: 520 }}>
            Gestiona expedientes, agenda citas y vincula pacientes desde un solo lugar.
            imedexp elimina el papeleo para que te enfoques en lo que importa: tus pacientes.
          </p>

          <ul style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 28 }}>
            {[
              ['Expediente clínico completo por paciente, jerarquizado'],
              ['QR único para vincular pacientes al instante'],
              ['Calendario con vista día / semana / mes'],
              ['Registro de medicación, alergias y antecedentes'],
              ['Notas clínicas con autosave y recetas digitales'],
              ['Seguimiento de signos vitales en el tiempo'],
            ].map((b, i) => (
              <li key={i} style={{ display: 'grid', gridTemplateColumns: '22px 1fr', gap: 12, alignItems: 'center', fontSize: 14, color: 'var(--ink)' }}>
                <span style={{
                  width: 22, height: 22, borderRadius: 99, background: 'var(--paper-3)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--accent-deep)',
                }}>
                  <Icon kind="check" size={13} />
                </span>
                <span>{b}</span>
              </li>
            ))}
          </ul>

          <div style={{ display: 'flex', gap: 32, marginTop: 36, paddingTop: 28, borderTop: '1px solid var(--rule)' }}>
            {[
              ['< 30s', 'vincular un paciente'],
              ['100%', 'expedientes digitales'],
              ['0', 'papel necesario'],
            ].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--accent-deep)' }}>{n}</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>

          <button className="btn lg" style={{ background: 'var(--accent)', borderColor: 'var(--accent)', marginTop: 32 }}>
            Registrarme como Médico →
          </button>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// 7 · PARA PACIENTES — inverse split
// ─────────────────────────────────────────────────────────────
function PacienteMockup() {
  return (
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
      {/* phone frame */}
      <div style={{
        width: 280, background: 'var(--ink)', borderRadius: 36, padding: 8,
        boxShadow: '0 40px 80px -20px rgba(3,4,94,0.3)',
      }}>
        <div style={{
          background: 'var(--paper)', borderRadius: 28, overflow: 'hidden',
          minHeight: 540, padding: '24px 18px 18px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <HomeLogo height={14} />
            <span style={{ width: 28, height: 28, borderRadius: 99, background: 'var(--ink)', color: 'var(--paper)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontFamily: 'var(--mono)' }}>MF</span>
          </div>

          <span className="eyebrow" style={{ fontSize: 10 }}>Mi expediente</span>
          <h4 style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 400, lineHeight: 1, marginTop: 4 }}>
            Hola, María.
          </h4>

          {/* próxima cita */}
          <div style={{
            background: 'var(--ink)', color: 'var(--paper)', borderRadius: 'var(--r-lg)',
            padding: '14px 16px', marginTop: 16,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em' }}>PRÓXIMA CITA</span>
              <Pulse color="var(--accent-bright)" dark />
            </div>
            <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 6 }}>10:30 · mié</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Dr. Ricardo Solís M.</div>
            <div className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>endocrinología</div>
          </div>

          {/* alergia mini */}
          <div style={{
            marginTop: 12, padding: '10px 12px',
            background: 'var(--alert-soft)', border: '1px solid var(--alert-rule)', borderRadius: 'var(--r-md)',
          }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 9, padding: '2px 6px', background: 'var(--alert)', color: '#fff', borderRadius: 999, letterSpacing: '0.1em' }}>ALERGIA</span>
            <div style={{ fontSize: 12, marginTop: 6 }}><strong>Penicilina</strong> · anafilaxia 2019</div>
          </div>

          {/* historial mini */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 14 }}>
            {[
              ['Diagnósticos', '4'],
              ['Medicación', '3'],
              ['Cirugías', '3'],
            ].map(([k, n]) => (
              <div key={k} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 12px', background: 'var(--white)', borderRadius: 'var(--r-md)',
                fontSize: 12, border: '1px solid var(--rule-2)',
              }}>
                <span>{k}</span>
                <span className="mono" style={{ color: 'var(--ink-3)' }}>{n} ›</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* floating accent — adherence */}
      <div style={{
        position: 'absolute', top: 60, left: -32,
        background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)',
        padding: '12px 14px', boxShadow: '0 20px 40px -10px rgba(3,4,94,0.18)',
      }}>
        <span className="eyebrow" style={{ fontSize: 10 }}>Adherencia</span>
        <div style={{ fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 4, color: 'var(--accent-deep)' }}>98%</div>
      </div>
    </div>
  );
}

function HomePaciente() {
  const ref = useReveal();
  return (
    <section ref={ref} style={{
      padding: '120px 56px 100px',
      background: 'linear-gradient(180deg, var(--paper-2) 0%, var(--paper) 100%)',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
        <div className="before-view">
          <span className="chip accent" style={{ display: 'inline-flex' }}>
            <Icon kind="bell" size={14} /> Para Pacientes
          </span>
          <h2 style={{ fontSize: 56, lineHeight: 1.0, fontWeight: 300, letterSpacing: '-0.04em', marginTop: 18 }}>
            Tu salud,<br />
            <span className="serif" style={{ fontWeight: 400, color: 'var(--accent-deep)' }}>siempre contigo.</span>
          </h2>
          <p style={{ fontSize: 16, color: 'var(--ink-2)', marginTop: 18, lineHeight: 1.55, maxWidth: 520 }}>
            Lleva tu historial clínico contigo. Cita con cualquier médico nuevo y compártelo
            con un código. Sin recordar fechas, dosis ni nombres de medicamentos.
          </p>

          <ul style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 28 }}>
            {[
              ['Acceso a tu historial médico completo'],
              ['Agenda citas con tu médico en segundos'],
              ['Control de medicamentos y recordatorios'],
              ['Seguimiento de IMC, signos vitales y adherencia'],
              ['Vinculación segura con cualquier médico'],
              ['Modo sin conexión disponible'],
            ].map((b, i) => (
              <li key={i} style={{ display: 'grid', gridTemplateColumns: '22px 1fr', gap: 12, alignItems: 'center', fontSize: 14, color: 'var(--ink)' }}>
                <span style={{
                  width: 22, height: 22, borderRadius: 99, background: 'var(--paper-3)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--accent-deep)',
                }}>
                  <Icon kind="check" size={13} />
                </span>
                <span>{b}</span>
              </li>
            ))}
          </ul>

          <div style={{ display: 'flex', gap: 32, marginTop: 36, paddingTop: 28, borderTop: '1px solid var(--rule)' }}>
            {[
              ['1 lugar', 'todo tu historial'],
              ['24/7', 'acceso a tu salud'],
              ['100%', 'privado y seguro'],
            ].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--accent-deep)' }}>{n}</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>

          <button className="btn lg" style={{ background: 'var(--accent)', borderColor: 'var(--accent)', marginTop: 32 }}>
            Registrarme como Paciente →
          </button>
        </div>
        <div className="before-view"><PacienteMockup /></div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// 8 · APP MÓVIL
// ─────────────────────────────────────────────────────────────
function HomeMobile() {
  const ref = useReveal();
  return (
    <section ref={ref} style={{ padding: '120px 56px 100px', background: 'var(--white)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
        <div className="before-view">
          <span className="chip accent" style={{ display: 'inline-flex' }}>
            <Icon kind="apple" size={14} /> Disponible en iOS y Android
          </span>
          <h2 style={{ fontSize: 56, lineHeight: 1.0, fontWeight: 300, letterSpacing: '-0.04em', marginTop: 18 }}>
            Lleva imedexp<br />
            <span className="serif" style={{ fontWeight: 400, color: 'var(--accent-deep)' }}>en tu bolsillo.</span>
          </h2>
          <p style={{ fontSize: 16, color: 'var(--ink-2)', marginTop: 18, lineHeight: 1.55, maxWidth: 520 }}>
            Accede a tu historial clínico, citas y medicamentos desde tu móvil, en cualquier
            momento y lugar.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 28 }}>
            {[
              ['bell', 'Recordatorios de medicamentos y citas'],
              ['arrow', 'Sincronización en tiempo real'],
              ['lock', 'Acceso seguro con biometría'],
              ['monitor', 'Modo sin conexión disponible'],
            ].map(([icon, text]) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{
                  width: 36, height: 36, borderRadius: 99,
                  background: 'var(--paper-3)', color: 'var(--accent-deep)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon kind={icon} size={18} />
                </span>
                <span style={{ fontSize: 14 }}>{text}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
            <button style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: 'var(--ink)', color: 'var(--paper)',
              borderRadius: 'var(--r-md)', padding: '12px 20px', border: 0, cursor: 'pointer',
              fontFamily: 'inherit',
            }}>
              <Icon kind="apple" size={22} />
              <div style={{ textAlign: 'left' }}>
                <div className="mono" style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.06em' }}>Próximamente en</div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>App Store</div>
              </div>
            </button>
            <button style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: 'var(--ink)', color: 'var(--paper)',
              borderRadius: 'var(--r-md)', padding: '12px 20px', border: 0, cursor: 'pointer',
              fontFamily: 'inherit',
            }}>
              <Icon kind="android" size={22} />
              <div style={{ textAlign: 'left' }}>
                <div className="mono" style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.06em' }}>Disponible en</div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>Google Play</div>
              </div>
            </button>
          </div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 12 }}>
            * Próximamente en App Store y Google Play
          </div>
        </div>

        {/* Phone mockup */}
        <div className="before-view" style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
          <div style={{
            position: 'absolute', width: 360, height: 360, borderRadius: 999,
            background: 'radial-gradient(circle, var(--paper-3) 0%, transparent 70%)',
            top: 40, left: 40, opacity: 0.7,
          }} />
          <PacienteMockup />
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// 9 · CTA — deep navy with animated bg
// ─────────────────────────────────────────────────────────────
function HomeCTA() {
  return (
    <section style={{
      padding: '100px 56px', position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(135deg, #03045E 0%, #023E8A 50%, #0077B6 100%)',
      color: 'var(--paper)',
    }}>
      {/* animated circles */}
      <div style={{
        position: 'absolute', width: 600, height: 600, borderRadius: 999,
        background: 'radial-gradient(circle, rgba(0,180,216,0.25) 0%, transparent 60%)',
        top: -200, left: -100, animation: 'imxFadeIn 2s both',
      }} />
      <div style={{
        position: 'absolute', width: 500, height: 500, borderRadius: 999,
        background: 'radial-gradient(circle, rgba(202,240,248,0.15) 0%, transparent 60%)',
        bottom: -180, right: -100,
      }} />
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.08,
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <div style={{ position: 'relative', textAlign: 'center', maxWidth: 1000, marginInline: 'auto' }}>
        <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.65)' }}>04 · únete a imedexp</span>
        <h2 style={{ fontSize: 88, lineHeight: 0.98, fontWeight: 300, letterSpacing: '-0.045em', marginTop: 18 }}>
          ¿Listo para modernizar<br />
          <span className="serif" style={{ fontWeight: 400, color: 'var(--accent-bright)' }}>tu práctica médica?</span>
        </h2>
        <p style={{ fontSize: 17, lineHeight: 1.55, color: 'rgba(255,255,255,0.85)', marginTop: 24, maxWidth: 620, marginInline: 'auto' }}>
          Más de 1,720 médicos ya gestionan sus pacientes con imedexp.
          Regístrate hoy y empieza gratis. Sin tarjeta de crédito, sin contratos.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 40, flexWrap: 'wrap' }}>
          <button className="btn lg invert">Soy Médico — Comenzar gratis →</button>
          <button className="btn lg dark-ghost">Soy Paciente — Registrarme →</button>
        </div>
        <div className="mono" style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 24, letterSpacing: '0.06em' }}>
          Sin tarjeta de crédito · Sin contratos · Cancela cuando quieras
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// 10 · FOOTER
// ─────────────────────────────────────────────────────────────
function HomeFooter() {
  const cols = [
    ['Producto', ['Características', 'Cómo funciona', 'Para Médicos', 'Para Pacientes', 'Descarga la App']],
    ['Cuenta', ['Iniciar sesión', 'Registrarse', 'Médico', 'Paciente', 'Institución']],
    ['Legal', ['Privacidad', 'Términos de uso', 'Cookies', 'NOM-024-SSA3', 'Contacto']],
  ];
  return (
    <footer style={{ background: '#0A0A2C', color: 'var(--paper)', padding: '64px 56px 32px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 60, paddingBottom: 48, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div>
          <HomeLogo color="var(--paper)" height={20} />
          <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.65)', marginTop: 18, lineHeight: 1.55, maxWidth: 320 }}>
            La plataforma médica que conecta doctores y pacientes. Tu historial clínico,
            siempre contigo, siempre seguro.
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
            <span className="chip dark" style={{ fontSize: 10 }}>HIPAA</span>
            <span className="chip dark" style={{ fontSize: 10 }}>NOM-024-SSA3</span>
            <span className="chip dark" style={{ fontSize: 10 }}>ISO 27001</span>
          </div>
        </div>
        {cols.map(([heading, items]) => (
          <div key={heading}>
            <div className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 18 }}>
              {heading}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {items.map((it) => (
                <span key={it} style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}>{it}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 24, gap: 16 }}>
        <span className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>
          © 2026 imedexp. Todos los derechos reservados.
        </span>
        <span className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>
          CDMX, México · cifrado AES-256
        </span>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
          Hecho con <span style={{ color: 'var(--alert)' }}>♥</span> para la salud digital
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
      <HomeTrust />
      <HomeFeatures />
      <HomeHow />
      <HomeMedico />
      <HomePaciente />
      <HomeMobile />
      <HomeCTA />
      <HomeFooter />
    </div>
  );
}

window.HomeScreen = HomeScreen;
window.HomeLogo = HomeLogo;
window.Pulse = Pulse;
window.HomeIcon = Icon;
