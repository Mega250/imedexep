// imedexp · Auth flows — registro + recuperar contraseña
// Sharing the same split layout as login. Editorial left, form right.
//
// Screens exported to window:
//   RegisterRoleScreen      — escoge tipo de cuenta
//   RegisterPatientScreen   — formulario paciente
//   RegisterDoctorScreen    — formulario médico
//   RecoverPasswordScreen   — recuperar contraseña

// ─────────────────────────────────────────────────────────────
// Shared icons (basic geometric only)
// ─────────────────────────────────────────────────────────────
function AuthIcon({ kind, size = 18, color = 'currentColor' }) {
  const stroke = color, w = 1.6;
  const props = { fill: 'none', stroke, strokeWidth: w, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const svg = (children) => <svg width={size} height={size} viewBox="0 0 24 24" {...props}>{children}</svg>;
  switch (kind) {
    case 'arrow':  return svg(<><path d="M5 12 L19 12" /><path d="M14 7 L19 12 L14 17" /></>);
    case 'arrow-l':return svg(<><path d="M19 12 L5 12" /><path d="M10 7 L5 12 L10 17" /></>);
    case 'check':  return svg(<path d="M5 12 L10 17 L19 7" />);
    case 'mail':   return svg(<><rect x="3.5" y="5.5" width="17" height="13" rx="1.5" /><path d="M4 7 L12 13 L20 7" /></>);
    case 'user':   return svg(<><circle cx="12" cy="9" r="3.5" /><path d="M5 19 C5 15.5 8 13 12 13 C16 13 19 15.5 19 19" /></>);
    case 'lock':   return svg(<><rect x="5.5" y="11" width="13" height="8.5" rx="1" /><path d="M8 11 L8 8 A4 4 0 0 1 16 8 L16 11" /></>);
    case 'doc':    return svg(<><rect x="5" y="3" width="14" height="18" rx="1.5" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="13" y2="16" /></>);
    case 'cal':    return svg(<><rect x="3.5" y="5.5" width="17" height="15" rx="1.5" /><line x1="3.5" y1="10" x2="20.5" y2="10" /><line x1="8" y1="3" x2="8" y2="7" /><line x1="16" y1="3" x2="16" y2="7" /></>);
    case 'stetho':
      return svg(<><path d="M6 4 L6 11 A4 4 0 0 0 14 11 L14 4" /><circle cx="17" cy="14" r="2" /><path d="M10 15 L10 17 A4 4 0 0 0 17 16.5" /></>);
    case 'heart':
      return svg(<path d="M12 19 L4.5 11.5 A4 4 0 0 1 12 7 A4 4 0 0 1 19.5 11.5 Z" />);
    case 'shield':
      return svg(<><path d="M12 3 L20 6 L20 12 C20 16.5 16.5 19.5 12 21 C7.5 19.5 4 16.5 4 12 L4 6 Z" /><path d="M9 12 L11 14 L15 10" /></>);
    case 'send':   return svg(<><path d="M21 4 L11 14" /><path d="M21 4 L15 21 L11 14 L4 10 Z" /></>);
    default: return svg(<circle cx="12" cy="12" r="8" />);
  }
}

// ─────────────────────────────────────────────────────────────
// AuthLayout — shared split. Right side is the content.
// ─────────────────────────────────────────────────────────────
function AuthLayout({ eyebrow, headline, headlineAccent, sub, bullets, testimonial, children, label }) {
  return (
    <div className="imx" style={{
      width: 1440, height: 900,
      display: 'grid', gridTemplateColumns: '1.15fr 1fr',
      background: 'var(--paper)',
    }} data-screen-label={label}>

      {/* LEFT — editorial */}
      <div style={{
        position: 'relative', padding: '40px 56px',
        background: 'var(--paper)', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', width: 480, height: 480, borderRadius: 999,
          background: 'radial-gradient(circle, var(--paper-3) 0%, transparent 70%)',
          top: -80, right: -120, opacity: 0.7, pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', width: 360, height: 360, borderRadius: 999,
          background: 'radial-gradient(circle, var(--accent-rule) 0%, transparent 70%)',
          bottom: -120, left: -80, opacity: 0.5, pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <HomeLogo height={22} />
          <a style={{ fontSize: 13, color: 'var(--ink-2)' }}>← Volver</a>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', maxWidth: 580 }}>
          {eyebrow && (
            <span className="fadeup" style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '6px 12px 6px 8px', borderRadius: 999,
              background: 'var(--white)', border: '1px solid var(--accent-rule)',
              color: 'var(--accent-deep)', fontSize: 12, fontWeight: 500,
              alignSelf: 'flex-start',
            }}>
              <Pulse />
              {eyebrow}
            </span>
          )}

          <h1 className="fadeup" style={{
            animationDelay: '120ms',
            fontFamily: 'var(--sans)', fontWeight: 200, fontSize: 80, lineHeight: 0.96,
            letterSpacing: '-0.04em', marginTop: 28, color: 'var(--ink)',
          }}>
            {headline}<br />
            <span className="serif" style={{ fontWeight: 400, color: 'var(--accent-deep)' }}>{headlineAccent}</span>
          </h1>

          {sub && (
            <p className="fadeup" style={{
              animationDelay: '220ms',
              fontSize: 17, lineHeight: 1.5, color: 'var(--ink-2)', marginTop: 22, maxWidth: 460,
              fontWeight: 300,
            }}>{sub}</p>
          )}

          {bullets && (
            <ul className="fadeup" style={{
              animationDelay: '300ms',
              marginTop: 32, display: 'flex', flexDirection: 'column', gap: 14,
            }}>
              {bullets.map((b, i) => (
                <li key={i} style={{ display: 'grid', gridTemplateColumns: '22px 1fr', gap: 12, alignItems: 'center', fontSize: 14.5, color: 'var(--ink)' }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: 99, background: 'var(--paper-3)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--accent-deep)',
                  }}>
                    <AuthIcon kind="check" size={13} />
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}

          {testimonial && (
            <div className="fadeup" style={{
              animationDelay: '380ms',
              marginTop: 44, padding: '20px 22px',
              background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)',
              maxWidth: 480,
            }}>
              <p style={{
                fontFamily: 'var(--serif)', fontSize: 19, lineHeight: 1.25, color: 'var(--ink)',
                fontStyle: 'italic', fontWeight: 400,
              }}>
                "{testimonial.quote}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
                <span style={{ width: 28, height: 28, borderRadius: 999, background: 'var(--accent)', display: 'inline-block' }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{testimonial.name}</div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>{testimonial.role}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.08em' }}>
            HIPAA · NOM-024-SSA3 · CIFRADO AES-256
          </span>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>v1.0 · 26.05</span>
        </div>
      </div>

      {/* RIGHT — content */}
      <div style={{
        background: 'var(--white)', borderLeft: '1px solid var(--rule)',
        padding: '40px 80px', display: 'flex', flexDirection: 'column',
      }}>
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Shared form bits
// ─────────────────────────────────────────────────────────────
function FormInput({ label, value, onChange, placeholder, type = 'text', icon, hint, focused, setFocused, name, rightSlot }) {
  const isFocused = focused === name;
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 500 }}>{label}</span>
      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{
            position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
            color: isFocused ? 'var(--accent-deep)' : 'var(--ink-3)',
            transition: 'color .2s',
          }}>
            <AuthIcon kind={icon} size={16} />
          </span>
        )}
        <input
          type={type} value={value} onChange={onChange} placeholder={placeholder}
          onFocus={() => setFocused(name)} onBlur={() => setFocused(null)}
          style={{
            width: '100%', height: 52, padding: icon ? '0 16px 0 44px' : '0 16px',
            paddingRight: rightSlot ? 48 : (icon ? 16 : 16),
            border: '1px solid', borderColor: isFocused ? 'var(--ink)' : 'var(--rule)',
            background: 'var(--white)',
            borderRadius: 'var(--r-md)',
            fontFamily: 'var(--sans)', fontSize: 14.5, color: 'var(--ink)',
            transition: 'border-color .2s, box-shadow .2s',
            boxShadow: isFocused ? '0 0 0 4px var(--accent-soft)' : 'none',
            outline: 'none',
          }}
        />
        {rightSlot && (
          <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
            {rightSlot}
          </div>
        )}
      </div>
      {hint && <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{hint}</span>}
    </label>
  );
}

function FormSelect({ label, value, onChange, options, name, focused, setFocused }) {
  const isFocused = focused === name;
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 500 }}>{label}</span>
      <div style={{ position: 'relative' }}>
        <select
          value={value} onChange={onChange}
          onFocus={() => setFocused(name)} onBlur={() => setFocused(null)}
          style={{
            width: '100%', height: 52, padding: '0 40px 0 16px',
            border: '1px solid', borderColor: isFocused ? 'var(--ink)' : 'var(--rule)',
            background: 'var(--white)',
            borderRadius: 'var(--r-md)',
            fontFamily: 'var(--sans)', fontSize: 14.5, color: value ? 'var(--ink)' : 'var(--ink-3)',
            appearance: 'none', WebkitAppearance: 'none',
            outline: 'none',
            transition: 'border-color .2s, box-shadow .2s',
            boxShadow: isFocused ? '0 0 0 4px var(--accent-soft)' : 'none',
            cursor: 'pointer',
          }}
        >
          <option value="">Selecciona…</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <span style={{
          position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--ink-3)', pointerEvents: 'none', fontSize: 12,
        }}>▾</span>
      </div>
    </label>
  );
}

function PrimaryButton({ children, onClick }) {
  return (
    <button onClick={onClick} style={{
      height: 56, borderRadius: 'var(--r-md)',
      background: 'var(--ink)', color: 'var(--paper)',
      fontFamily: 'var(--sans)', fontSize: 15, fontWeight: 500, letterSpacing: '-0.005em',
      border: 0, cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      transition: 'transform .12s',
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// 1. REGISTER ROLE — pick paciente or médico
// ─────────────────────────────────────────────────────────────
function RegisterRoleScreen() {
  const [hover, setHover] = React.useState(null);

  const card = (kind, title, body, time, icon) => {
    const isHover = hover === kind;
    return (
      <div
        onMouseEnter={() => setHover(kind)}
        onMouseLeave={() => setHover(null)}
        style={{
          padding: '28px 28px',
          border: '1px solid', borderColor: isHover ? 'var(--ink)' : 'var(--rule)',
          borderRadius: 'var(--r-xl)',
          background: 'var(--white)',
          cursor: 'pointer',
          transition: 'transform .18s, border-color .18s, box-shadow .18s',
          transform: isHover ? 'translateY(-3px)' : 'none',
          boxShadow: isHover ? '0 24px 50px -20px rgba(3,4,94,0.2)' : '0 1px 0 var(--rule-2)',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 'var(--r-md)',
            background: isHover ? 'var(--ink)' : 'var(--paper-3)',
            color: isHover ? 'var(--paper)' : 'var(--accent-deep)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background .2s, color .2s',
          }}>
            <AuthIcon kind={icon} size={26} />
          </div>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: 11, padding: '4px 9px',
            background: 'var(--paper-2)', color: 'var(--ink-3)', borderRadius: 999, letterSpacing: '0.06em',
          }}>~ {time}</span>
        </div>

        <h3 style={{
          fontFamily: 'var(--serif)', fontSize: 36, fontWeight: 400, letterSpacing: '-0.025em',
          marginTop: 22, lineHeight: 1, color: 'var(--ink)',
        }}>{title}</h3>

        <p style={{ fontSize: 13.5, color: 'var(--ink-2)', marginTop: 12, lineHeight: 1.55 }}>{body}</p>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginTop: 22,
          fontSize: 13.5, fontWeight: 500, color: 'var(--ink)',
          borderTop: '1px solid var(--rule-2)', paddingTop: 16,
        }}>
          Continuar
          <span style={{ transition: 'transform .2s', transform: isHover ? 'translateX(4px)' : 'none' }}>→</span>
        </div>
      </div>
    );
  };

  return (
    <AuthLayout
      label="Registro / tipo de cuenta"
      eyebrow="Crear cuenta · paso 1 de 2"
      headline="Empieza tu"
      headlineAccent="expediente."
      sub="Dos caminos. Una sola plataforma. Tu información clínica viaja contigo desde el primer día — sin formularios duplicados, sin información perdida."
      bullets={[
        'Cifrado AES-256 extremo a extremo',
        'Cumple NOM-024-SSA3 y HIPAA',
        'Cuenta gratuita para pacientes',
        'Cancela cuando quieras',
      ]}
    >
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>
          ¿Ya tienes cuenta?{' '}
          <a style={{ color: 'var(--ink)', borderBottom: '1px solid var(--ink)', paddingBottom: 1, fontWeight: 500 }}>Iniciar sesión</a>
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 460, width: '100%', alignSelf: 'center' }}>
        <span className="eyebrow">Crear cuenta</span>
        <h2 style={{ fontFamily: 'var(--sans)', fontSize: 40, fontWeight: 500, letterSpacing: '-0.03em', marginTop: 10, lineHeight: 1.05 }}>
          ¿Cómo vas a usar imedexp?
        </h2>
        <p style={{ fontSize: 14.5, color: 'var(--ink-3)', marginTop: 10, lineHeight: 1.5 }}>
          Elige tu rol para personalizar tu experiencia. Podrás cambiar
          algunos datos después.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 32 }}>
          {card(
            'paciente', 'Soy paciente',
            'Lleva tu historial clínico contigo. Comparte un vínculo con cualquier médico nuevo en segundos.',
            '2 min', 'heart',
          )}
          {card(
            'medico', 'Soy médico',
            'Recibe a tus pacientes con su expediente ya leído. Verificamos tu cédula profesional.',
            '4 min', 'stetho',
          )}
        </div>
      </div>

      <div style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--ink-3)', lineHeight: 1.6 }}>
        Al crear cuenta aceptas los <a style={{ color: 'var(--ink)', borderBottom: '1px solid var(--rule)' }}>términos</a>{' '}
        y la <a style={{ color: 'var(--ink)', borderBottom: '1px solid var(--rule)' }}>política de privacidad</a>.
      </div>
    </AuthLayout>
  );
}

// ─────────────────────────────────────────────────────────────
// Shared stepper
// ─────────────────────────────────────────────────────────────
function Stepper({ steps, current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 24, height: 24, borderRadius: 999,
                background: done ? 'var(--accent)' : active ? 'var(--ink)' : 'var(--paper-3)',
                color: done || active ? '#fff' : 'var(--ink-3)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 500,
              }}>
                {done ? <AuthIcon kind="check" size={12} color="#fff" /> : i + 1}
              </span>
              <span style={{
                fontSize: 12.5, fontWeight: 500,
                color: active ? 'var(--ink)' : done ? 'var(--ink-2)' : 'var(--ink-3)',
              }}>{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 1, background: done ? 'var(--accent)' : 'var(--rule)', maxWidth: 32 }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. REGISTER PATIENT
// ─────────────────────────────────────────────────────────────
function RegisterPatientScreen() {
  const [focused, setFocused] = React.useState(null);
  const [form, setForm] = React.useState({
    nombre: '', apellidos: '', fecha: '', curp: '',
    email: '', pwd: '',
  });
  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <AuthLayout
      label="Registro / paciente"
      eyebrow="Crear cuenta · paciente"
      headline="Tu salud,"
      headlineAccent="siempre contigo."
      sub="Captura tu historial una vez. Compártelo con cualquier médico con un vínculo seguro. Sin recordar fechas ni dosis."
      bullets={[
        'Historial clínico siempre disponible',
        'Vínculos seguros con vencimiento',
        'Recordatorios de medicación y citas',
        'Modo sin conexión disponible',
      ]}
      testimonial={{
        quote: 'Llegué a mi cita y no tuve que llenar nada. El doctor ya sabía mi historia.',
        name: 'María Fernanda Arellano',
        role: 'paciente · CDMX',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a style={{ fontSize: 13, color: 'var(--ink-2)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <AuthIcon kind="arrow-l" size={14} /> Cambiar tipo de cuenta
        </a>
        <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>
          ¿Ya tienes cuenta?{' '}
          <a style={{ color: 'var(--ink)', borderBottom: '1px solid var(--ink)', paddingBottom: 1, fontWeight: 500 }}>Iniciar sesión</a>
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 460, width: '100%', alignSelf: 'center' }}>
        <Stepper steps={['Cuenta', 'Verificar correo']} current={0} />

        <h2 style={{ fontFamily: 'var(--sans)', fontSize: 36, fontWeight: 500, letterSpacing: '-0.03em', marginTop: 22, lineHeight: 1.05 }}>
          Datos personales.
        </h2>
        <p style={{ fontSize: 13.5, color: 'var(--ink-3)', marginTop: 8, lineHeight: 1.5 }}>
          Estos datos son los que aparecerán en tu expediente. Los médicos podrán verlos cuando compartas tu vínculo.
        </p>

        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormInput name="nombre" label="Nombre(s)" value={form.nombre} onChange={update('nombre')}
              placeholder="Como aparece en tu INE" focused={focused} setFocused={setFocused} />
            <FormInput name="apellidos" label="Apellidos" value={form.apellidos} onChange={update('apellidos')}
              placeholder="Paterno y materno" focused={focused} setFocused={setFocused} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormInput name="fecha" label="Fecha de nacimiento" value={form.fecha} onChange={update('fecha')}
              placeholder="dd / mm / aaaa" icon="cal" focused={focused} setFocused={setFocused} />
            <FormInput name="curp" label="CURP" value={form.curp} onChange={update('curp')}
              placeholder="ARRM920318MDFLLR06" focused={focused} setFocused={setFocused} hint="18 caracteres · opcional" />
          </div>
          <FormInput name="email" label="Correo electrónico" type="email" value={form.email} onChange={update('email')}
            placeholder="tu@correo.com" icon="mail" focused={focused} setFocused={setFocused} />
          <FormInput name="pwd" label="Contraseña" type="password" value={form.pwd} onChange={update('pwd')}
            placeholder="Mínimo 10 caracteres" icon="lock" focused={focused} setFocused={setFocused}
            hint="Usa al menos una mayúscula, un número y un símbolo." />
        </div>

        <PrimaryButton>
          Crear cuenta
          <AuthIcon kind="arrow" size={14} color="var(--paper)" />
        </PrimaryButton>
      </div>

      <div style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--ink-3)', lineHeight: 1.6 }}>
        Al crear cuenta aceptas los <a style={{ color: 'var(--ink)', borderBottom: '1px solid var(--rule)' }}>términos</a>{' '}
        y la <a style={{ color: 'var(--ink)', borderBottom: '1px solid var(--rule)' }}>política de privacidad</a>.
      </div>
    </AuthLayout>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. REGISTER DOCTOR
// ─────────────────────────────────────────────────────────────
function RegisterDoctorScreen() {
  const [focused, setFocused] = React.useState(null);
  const [form, setForm] = React.useState({
    nombre: '', apellidos: '', cedula: '', especialidad: '',
    email: '', pwd: '',
  });
  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <AuthLayout
      label="Registro / médico"
      eyebrow="Crear cuenta · médico"
      headline="Tu consultorio,"
      headlineAccent="en tu bolsillo."
      sub="Recibe a tus pacientes con su expediente ya leído. Verificamos tu cédula con la SEP antes de activar tu cuenta."
      bullets={[
        'Consola con agenda + expediente lado a lado',
        'Alergias y diagnósticos siempre en jerarquía 1',
        'Notas, recetas y estudios con autosave',
        'Verificación de cédula automática',
      ]}
      testimonial={{
        quote: 'La paciente entró y yo ya sabía lo que tenía que ajustarle. 14 segundos.',
        name: 'Dra. Patricia Galván',
        role: 'endocrinología · CDMX',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a style={{ fontSize: 13, color: 'var(--ink-2)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <AuthIcon kind="arrow-l" size={14} /> Cambiar tipo de cuenta
        </a>
        <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>
          ¿Ya tienes cuenta?{' '}
          <a style={{ color: 'var(--ink)', borderBottom: '1px solid var(--ink)', paddingBottom: 1, fontWeight: 500 }}>Iniciar sesión</a>
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 460, width: '100%', alignSelf: 'center' }}>
        <Stepper steps={['Datos', 'Verificar cédula', 'Activación']} current={0} />

        <h2 style={{ fontFamily: 'var(--sans)', fontSize: 36, fontWeight: 500, letterSpacing: '-0.03em', marginTop: 22, lineHeight: 1.05 }}>
          Datos profesionales.
        </h2>
        <p style={{ fontSize: 13.5, color: 'var(--ink-3)', marginTop: 8, lineHeight: 1.5 }}>
          Validamos tu cédula contra el Registro de la SEP. Tu cuenta se activa en menos de 24 horas.
        </p>

        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormInput name="nombre" label="Nombre(s)" value={form.nombre} onChange={update('nombre')}
              placeholder="Como aparece en tu cédula" focused={focused} setFocused={setFocused} />
            <FormInput name="apellidos" label="Apellidos" value={form.apellidos} onChange={update('apellidos')}
              placeholder="Paterno y materno" focused={focused} setFocused={setFocused} />
          </div>

          <FormInput name="cedula" label="Cédula profesional" value={form.cedula} onChange={update('cedula')}
            placeholder="Ej. 8842711" icon="doc" focused={focused} setFocused={setFocused}
            hint="Validamos contra el Registro Profesional · SEP" />

          <FormSelect name="esp" label="Especialidad" value={form.especialidad}
            onChange={update('especialidad')} focused={focused} setFocused={setFocused}
            options={['Medicina general', 'Cardiología', 'Endocrinología', 'Ginecología', 'Pediatría', 'Psiquiatría', 'Otra']} />

          <FormInput name="email" label="Correo electrónico" type="email" value={form.email} onChange={update('email')}
            placeholder="tu@correo.com · institucional" icon="mail" focused={focused} setFocused={setFocused} />

          <FormInput name="pwd" label="Contraseña" type="password" value={form.pwd} onChange={update('pwd')}
            placeholder="Mínimo 10 caracteres" icon="lock" focused={focused} setFocused={setFocused}
            hint="Usa al menos una mayúscula, un número y un símbolo." />
        </div>

        <PrimaryButton>
          Continuar con verificación
          <AuthIcon kind="arrow" size={14} color="var(--paper)" />
        </PrimaryButton>
      </div>

      <div style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--ink-3)', lineHeight: 1.6 }}>
        Al crear cuenta aceptas los <a style={{ color: 'var(--ink)', borderBottom: '1px solid var(--rule)' }}>términos</a>,{' '}
        <a style={{ color: 'var(--ink)', borderBottom: '1px solid var(--rule)' }}>privacidad</a>{' '}
        y la <a style={{ color: 'var(--ink)', borderBottom: '1px solid var(--rule)' }}>política de uso clínico</a>.
      </div>
    </AuthLayout>
  );
}

// ─────────────────────────────────────────────────────────────
// 4. RECOVER PASSWORD
// ─────────────────────────────────────────────────────────────
function RecoverPasswordScreen() {
  const [focused, setFocused] = React.useState(null);
  const [email, setEmail] = React.useState('');
  const [sent, setSent] = React.useState(false);

  return (
    <AuthLayout
      label="Recuperar contraseña"
      eyebrow="Recuperar acceso"
      headline="Olvidaste tu"
      headlineAccent="contraseña."
      sub="Pasa. Te mandamos un enlace seguro a tu correo para recuperar el acceso. El enlace expira en 30 minutos."
      bullets={[
        'Tu expediente nunca queda bloqueado',
        'El enlace solo funciona una vez',
        'Cifrado AES-256 extremo a extremo',
      ]}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a style={{ fontSize: 13, color: 'var(--ink-2)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <AuthIcon kind="arrow-l" size={14} /> Volver a iniciar sesión
        </a>
        <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>
          ¿No tienes cuenta?{' '}
          <a style={{ color: 'var(--ink)', borderBottom: '1px solid var(--ink)', paddingBottom: 1, fontWeight: 500 }}>Crear cuenta</a>
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 440, width: '100%', alignSelf: 'center' }}>
        <span className="eyebrow">Recuperar contraseña</span>
        <h2 style={{ fontFamily: 'var(--sans)', fontSize: 40, fontWeight: 500, letterSpacing: '-0.03em', marginTop: 10, lineHeight: 1.05 }}>
          {sent ? 'Revisa tu correo.' : 'Te mandamos un enlace.'}
        </h2>
        <p style={{ fontSize: 14.5, color: 'var(--ink-3)', marginTop: 10, lineHeight: 1.5 }}>
          {sent
            ? `Si la cuenta existe, te llegará un mensaje a ${email || 'tu correo'} con un enlace para crear una nueva contraseña.`
            : 'Escribe el correo asociado a tu cuenta. Si existe, te llega un mensaje en menos de 30 segundos.'}
        </p>

        {!sent ? (
          <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <FormInput name="email" label="Correo electrónico" type="email"
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com" icon="mail"
              focused={focused} setFocused={setFocused} />
            <PrimaryButton onClick={() => setSent(true)}>
              <AuthIcon kind="send" size={14} color="var(--paper)" />
              Enviar enlace de recuperación
            </PrimaryButton>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '6px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--rule)' }} />
              <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', letterSpacing: '0.16em' }}>O</span>
              <div style={{ flex: 1, height: 1, background: 'var(--rule)' }} />
            </div>

            <button style={{
              height: 52, borderRadius: 'var(--r-md)',
              background: 'var(--white)', color: 'var(--ink)',
              border: '1px solid var(--rule)', cursor: 'pointer',
              fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 500,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}>
              <AuthIcon kind="shield" size={16} color="var(--accent-deep)" />
              Recuperar con un código de respaldo
            </button>
          </div>
        ) : (
          <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              padding: '20px 22px',
              background: 'var(--paper-3)', border: '1px solid var(--accent-rule)',
              borderRadius: 'var(--r-lg)',
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <span style={{
                width: 40, height: 40, borderRadius: 999,
                background: 'var(--accent)', color: '#fff',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <AuthIcon kind="mail" size={18} color="#fff" />
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>Enlace enviado</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 3 }}>
                  expira en 30 min · uso único
                </div>
              </div>
            </div>
            <PrimaryButton>
              Abrir mi correo
              <AuthIcon kind="arrow" size={14} color="var(--paper)" />
            </PrimaryButton>
            <button onClick={() => setSent(false)} style={{
              fontSize: 13, color: 'var(--ink-3)', fontFamily: 'inherit',
              padding: '8px 0', cursor: 'pointer',
            }}>
              ¿No te llegó? Reenviar enlace en 30 s
            </button>
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--ink-3)', lineHeight: 1.6 }}>
        ¿Necesitas ayuda? <a style={{ color: 'var(--ink)', borderBottom: '1px solid var(--rule)' }}>soporte@imedexp.mx</a>
      </div>
    </AuthLayout>
  );
}

window.RegisterRoleScreen = RegisterRoleScreen;
window.RegisterPatientScreen = RegisterPatientScreen;
window.RegisterDoctorScreen = RegisterDoctorScreen;
window.RecoverPasswordScreen = RecoverPasswordScreen;
