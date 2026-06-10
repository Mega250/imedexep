// imedexp · Shell móvil compartido — para todas las pantallas nuevas en versión móvil.
// 390 × 844 dentro de IOSDevice. Sigue el mismo lenguaje bento ocean que las pantallas existentes.
// Exporta: MbIcon, MbFrame, MbTop, MbTabBar, MbFAB, MbStat, MbCard, MbPill, MbSwitch, MbList

function MbIcon({ kind, size = 18, color = 'currentColor' }) {
  const props = { fill: 'none', stroke: color, strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const svg = (c) => <svg width={size} height={size} viewBox="0 0 24 24" {...props}>{c}</svg>;
  switch (kind) {
    case 'home':     return svg(<><path d="M4 11 L12 4 L20 11" /><path d="M6 10 L6 20 L18 20 L18 10" /></>);
    case 'build':    return svg(<><rect x="4" y="4" width="16" height="16" rx="1.5" /><line x1="9" y1="4" x2="9" y2="20" /><line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="14" x2="20" y2="14" /></>);
    case 'shield-2': return svg(<><path d="M12 3 L19 6 V12 C19 16 16 19 12 21 C8 19 5 16 5 12 V6 Z" /><circle cx="12" cy="11" r="2.2" /></>);
    case 'users':    return svg(<><circle cx="9" cy="9" r="3" /><path d="M3 19 C3 16 6 14 9 14 C12 14 15 16 15 19" /><circle cx="16" cy="8" r="2.5" /><path d="M14 14 C18 14 21 16 21 19" /></>);
    case 'user':     return svg(<><circle cx="12" cy="8" r="3.5" /><path d="M4 21 C4 17 8 14 12 14 C16 14 20 17 20 21" /></>);
    case 'stetho':   return svg(<><path d="M6 4 L6 11 A4 4 0 0 0 14 11 L14 4" /><circle cx="17" cy="14" r="2" /><path d="M10 15 L10 17 A4 4 0 0 0 17 16.5" /></>);
    case 'mail':     return svg(<><rect x="3.5" y="5.5" width="17" height="13" rx="1.5" /><path d="M3.5 7 L12 13 L20.5 7" /></>);
    case 'inbox':    return svg(<><path d="M3 13 L8 13 L9.5 16 L14.5 16 L16 13 L21 13" /><path d="M3 13 L6 5 L18 5 L21 13 L21 19 L3 19 Z" /></>);
    case 'link':     return svg(<><path d="M10 14 L14 10" /><path d="M9 7 L12 4 A3 3 0 0 1 17 9 L14 12" /><path d="M15 17 L12 20 A3 3 0 0 1 7 15 L10 12" /></>);
    case 'plus':     return svg(<><path d="M12 5 L12 19" /><path d="M5 12 L19 12" /></>);
    case 'check':    return svg(<path d="M5 12 L10 17 L19 7" />);
    case 'x':        return svg(<><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></>);
    case 'search':   return svg(<><circle cx="11" cy="11" r="6" /><line x1="15.5" y1="15.5" x2="20" y2="20" /></>);
    case 'bell':     return svg(<><path d="M6 17 L18 17 L17 15.5 L17 11 A5 5 0 0 0 7 11 L7 15.5 Z" /><path d="M10 17 A2 2 0 0 0 14 17" /></>);
    case 'arrow':    return svg(<><path d="M5 12 L19 12" /><path d="M14 7 L19 12 L14 17" /></>);
    case 'arrow-l':  return svg(<><path d="M19 12 L5 12" /><path d="M10 7 L5 12 L10 17" /></>);
    case 'chev':     return svg(<path d="M9 6 L15 12 L9 18" />);
    case 'chev-l':   return svg(<path d="M15 6 L9 12 L15 18" />);
    case 'chev-d':   return svg(<path d="M6 9 L12 15 L18 9" />);
    case 'more':     return svg(<><circle cx="6" cy="12" r="1" fill={color} stroke="none" /><circle cx="12" cy="12" r="1" fill={color} stroke="none" /><circle cx="18" cy="12" r="1" fill={color} stroke="none" /></>);
    case 'edit':     return svg(<path d="M4 20 L4 16 L16 4 L20 8 L8 20 Z" />);
    case 'trash':    return svg(<><path d="M5 7 L19 7" /><path d="M9 7 L9 4 L15 4 L15 7" /><path d="M6 7 L7 20 L17 20 L18 7" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></>);
    case 'pin':      return svg(<><path d="M12 3 C8.5 3 6 5.5 6 9 C6 14 12 21 12 21 C12 21 18 14 18 9 C18 5.5 15.5 3 12 3 Z" /><circle cx="12" cy="9" r="2.2" /></>);
    case 'phone':    return svg(<path d="M5 4 L8 4 L10 9 L7.5 11 C8.5 13.5 10.5 15.5 13 16.5 L15 14 L20 16 L20 19 A2 2 0 0 1 18 21 C10.7 21 4 14.3 4 7 A2 2 0 0 1 5 4 Z" />);
    case 'clock':    return svg(<><circle cx="12" cy="12" r="8" /><path d="M12 7 L12 12 L15 14" /></>);
    case 'cal':      return svg(<><rect x="3.5" y="5.5" width="17" height="15" rx="1.5" /><line x1="3.5" y1="10" x2="20.5" y2="10" /><line x1="8" y1="3" x2="8" y2="7" /><line x1="16" y1="3" x2="16" y2="7" /></>);
    case 'qr':       return svg(<><rect x="4" y="4" width="6" height="6" /><rect x="14" y="4" width="6" height="6" /><rect x="4" y="14" width="6" height="6" /><rect x="14" y="14" width="2" height="2" /><rect x="18" y="14" width="2" height="2" /><rect x="14" y="18" width="2" height="2" /><rect x="18" y="18" width="2" height="2" /></>);
    case 'heart':    return svg(<path d="M12 19 L4.5 11.5 A4 4 0 0 1 12 7 A4 4 0 0 1 19.5 11.5 Z" />);
    case 'drop':     return svg(<path d="M12 3 C12 3 5 11 5 15 A7 7 0 0 0 19 15 C19 11 12 3 12 3 Z" />);
    case 'flag':     return svg(<path d="M5 21 L5 4 L15 4 L17 7 L15 11 L5 11" />);
    case 'wave':     return svg(<path d="M3 12 C5 8 7 16 9 12 C11 8 13 16 15 12 C17 8 19 16 21 12" />);
    case 'chart':    return svg(<><line x1="4" y1="20" x2="20" y2="20" /><rect x="6" y="13" width="3" height="7" /><rect x="11" y="9" width="3" height="11" /><rect x="16" y="6" width="3" height="14" /></>);
    case 'globe':    return svg(<><circle cx="12" cy="12" r="8" /><path d="M4 12 L20 12" /><path d="M12 4 C15 7 15 17 12 20 C9 17 9 7 12 4" /></>);
    case 'doc':      return svg(<><path d="M6 3 L14 3 L18 7 L18 21 L6 21 Z" /><path d="M14 3 L14 7 L18 7" /><line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="15.5" x2="15" y2="15.5" /></>);
    case 'scan':     return svg(<><path d="M4 8 L4 4 L8 4" /><path d="M20 8 L20 4 L16 4" /><path d="M4 16 L4 20 L8 20" /><path d="M20 16 L20 20 L16 20" /><line x1="4" y1="12" x2="20" y2="12" /></>);
    case 'send':     return svg(<><path d="M21 4 L11 14" /><path d="M21 4 L15 21 L11 14 L4 10 Z" /></>);
    case 'briefcase':return svg(<><rect x="3" y="7" width="18" height="13" rx="1.5" /><path d="M9 7 L9 5 A1 1 0 0 1 10 4 L14 4 A1 1 0 0 1 15 5 L15 7" /><line x1="3" y1="13" x2="21" y2="13" /></>);
    case 'pill':     return svg(<><rect x="3" y="9" width="18" height="6" rx="3" transform="rotate(-30 12 12)" /><line x1="9.5" y1="7.5" x2="14.5" y2="16.5" /></>);
    case 'copy':     return svg(<><rect x="8" y="8" width="12" height="12" rx="1.5" /><path d="M4 16 L4 4 L16 4" /></>);
    case 'lab':      return svg(<><path d="M9 3 L9 9 L4 19 A2 2 0 0 0 6 21 L18 21 A2 2 0 0 0 20 19 L15 9 L15 3" /><line x1="8" y1="3" x2="16" y2="3" /></>);
    default:         return svg(<circle cx="12" cy="12" r="8" />);
  }
}

// Top bar — soporta back arrow, eyebrow, título (puede ser serif acentuado)
function MbTop({ back, sub, title, accent, right }) {
  return (
    <div style={{
      padding: '6px 20px 14px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
      borderBottom: '1px solid var(--rule-2)', background: 'var(--paper)',
    }}>
      <div style={{ minWidth: 0, flex: 1 }}>
        {back && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 8, color: 'var(--ink-3)' }}>
            <MbIcon kind="chev-l" size={14} />
            <span className="mono" style={{ fontSize: 11, letterSpacing: '0.04em' }}>{back}</span>
          </div>
        )}
        {sub && <span className="eyebrow" style={{ display: 'block' }}>{sub}</span>}
        <h1 style={{
          fontFamily: 'var(--serif)', fontSize: 28, lineHeight: 1.0, fontWeight: 400,
          letterSpacing: '-0.02em', marginTop: 4, color: 'var(--ink)',
        }}>
          {accent
            ? <>{title.split(' ')[0]}<br /><span style={{ color: 'var(--accent-deep)' }}>{title.split(' ').slice(1).join(' ')}</span></>
            : title}
        </h1>
      </div>
      {right}
    </div>
  );
}

// Tab bar — recibe array de [icon, label] y active index
function MbTabBar({ tabs, active }) {
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      padding: '8px 4px 28px',
      background: 'rgba(241,250,254,0.92)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--rule-2)',
      display: 'grid', gridTemplateColumns: `repeat(${tabs.length}, 1fr)`,
    }}>
      {tabs.map(([icon, label], i) => {
        const isActive = i === active;
        return (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '4px 0' }}>
            <span style={{
              width: 32, height: 32, borderRadius: 9,
              background: isActive ? 'var(--ink)' : 'transparent',
              color: isActive ? 'var(--paper)' : 'var(--ink-3)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <MbIcon kind={icon} size={16} />
            </span>
            <span style={{
              fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.04em',
              color: isActive ? 'var(--ink)' : 'var(--ink-3)',
              fontWeight: isActive ? 500 : 400, whiteSpace: 'nowrap',
            }}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

// Frame — wraps children + tab bar / FAB; takes scroll-safe bottom padding
function MbFrame({ tabs, active, fab, children, noTabs }) {
  return (
    <div className="imx" style={{
      width: 390, height: 844, background: 'var(--paper)',
      fontFamily: 'var(--sans)', color: 'var(--ink)',
      position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: noTabs ? 28 : 100 }}>
        {children}
      </div>
      {fab}
      {!noTabs && tabs && <MbTabBar tabs={tabs} active={active} />}
    </div>
  );
}

// Floating action button
function MbFAB({ icon = 'plus', label, bottom = 110, onClick }) {
  return (
    <button onClick={onClick} style={{
      position: 'absolute', right: 18, bottom,
      display: 'inline-flex', alignItems: 'center', gap: 8,
      height: 48, padding: label ? '0 18px 0 14px' : '0 14px',
      background: 'var(--ink)', color: 'var(--paper)',
      borderRadius: 999, border: 0, cursor: 'pointer',
      fontFamily: 'inherit', fontSize: 13.5, fontWeight: 500,
      boxShadow: '0 10px 26px -10px rgba(3,4,94,0.45)',
    }}>
      <MbIcon kind={icon} size={16} color="var(--paper)" />
      {label}
    </button>
  );
}

// Stat — compact
function MbStat({ k, n, sub, tone }) {
  return (
    <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-md)', padding: '12px 14px' }}>
      <div className="eyebrow" style={{ fontSize: 9.5 }}>{k}</div>
      <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.025em', marginTop: 4, lineHeight: 1, color: tone === 'alert' ? 'var(--alert)' : 'var(--ink)' }}>{n}</div>
      <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 4 }}>{sub}</div>
    </div>
  );
}

// Card wrapper
function MbCard({ title, action, children, padding = '12px 16px' }) {
  return (
    <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
      {(title || action) && (
        <div style={{ padding, borderBottom: '1px solid var(--rule-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 13.5, fontWeight: 500 }}>{title}</h3>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

// Filter pill / chip
function MbPill({ on, children, count, tone }) {
  const toneBg = tone === 'alert' ? 'var(--alert-soft)' : tone === 'ok' ? '#E5F5EE' : 'var(--white)';
  const toneFg = tone === 'alert' ? 'var(--alert)' : tone === 'ok' ? 'var(--ok)' : 'var(--ink-2)';
  const toneBorder = tone === 'alert' ? 'var(--alert-rule)' : tone === 'ok' ? '#BFE3CF' : 'var(--rule)';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '6px 11px', borderRadius: 999,
      border: '1px solid ' + (on ? 'var(--ink)' : toneBorder),
      background: on ? 'var(--ink)' : toneBg,
      color: on ? 'var(--paper)' : toneFg,
      fontSize: 11.5, fontWeight: 500, whiteSpace: 'nowrap',
    }}>{children}{count != null && <span className="mono" style={{ fontSize: 9.5, opacity: 0.65 }}>{count}</span>}</span>
  );
}

// Toggle switch
function MbSwitch({ on }) {
  return (
    <span style={{ width: 36, height: 22, borderRadius: 99, background: on ? 'var(--accent-bright)' : 'var(--rule)', position: 'relative', flexShrink: 0 }}>
      <span style={{ position: 'absolute', top: 2, left: on ? 16 : 2, width: 18, height: 18, borderRadius: 99, background: '#fff' }} />
    </span>
  );
}

// Section header (h2 style for in-body sections)
function MbSection({ title, action, children }) {
  return (
    <div style={{ padding: '16px 20px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <span className="eyebrow">{title}</span>
        {action && <span className="mono" style={{ fontSize: 10.5, color: 'var(--accent-deep)' }}>{action}</span>}
      </div>
      {children}
    </div>
  );
}

Object.assign(window, { MbIcon, MbTop, MbTabBar, MbFrame, MbFAB, MbStat, MbCard, MbPill, MbSwitch, MbSection });
