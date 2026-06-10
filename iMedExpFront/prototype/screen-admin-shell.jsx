// imedexp · Shared shell for new role-based PC screens.
// Reuses the visual language of screen-doctor-desktop (sidebar 240 + topbar + bento)
// but lets each role bring its own nav + accent. Exported on window as:
//   window.AdmIcon, window.AdmShell, window.AdmTop, window.AdmPage,
//   window.AdmPill, window.AdmStat, window.AdmCard

// ─────────────────────────────────────────────────────────────
// Icons — superset (kept minimal: geometric only)
// ─────────────────────────────────────────────────────────────
function AdmIcon({ kind, size = 18, color = 'currentColor' }) {
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
    case 'logout':   return svg(<><path d="M10 4 L4 4 L4 20 L10 20" /><path d="M14 8 L18 12 L14 16" /><line x1="9" y1="12" x2="18" y2="12" /></>);
    case 'pin':      return svg(<><path d="M12 3 C8.5 3 6 5.5 6 9 C6 14 12 21 12 21 C12 21 18 14 18 9 C18 5.5 15.5 3 12 3 Z" /><circle cx="12" cy="9" r="2.2" /></>);
    case 'phone':    return svg(<path d="M5 4 L8 4 L10 9 L7.5 11 C8.5 13.5 10.5 15.5 13 16.5 L15 14 L20 16 L20 19 A2 2 0 0 1 18 21 C10.7 21 4 14.3 4 7 A2 2 0 0 1 5 4 Z" />);
    case 'clock':    return svg(<><circle cx="12" cy="12" r="8" /><path d="M12 7 L12 12 L15 14" /></>);
    case 'cal':      return svg(<><rect x="3.5" y="5.5" width="17" height="15" rx="1.5" /><line x1="3.5" y1="10" x2="20.5" y2="10" /><line x1="8" y1="3" x2="8" y2="7" /><line x1="16" y1="3" x2="16" y2="7" /></>);
    case 'qr':       return svg(<><rect x="4" y="4" width="6" height="6" /><rect x="14" y="4" width="6" height="6" /><rect x="4" y="14" width="6" height="6" /><rect x="14" y="14" width="2" height="2" /><rect x="18" y="14" width="2" height="2" /><rect x="14" y="18" width="2" height="2" /><rect x="18" y="18" width="2" height="2" /></>);
    case 'heart':    return svg(<path d="M12 19 L4.5 11.5 A4 4 0 0 1 12 7 A4 4 0 0 1 19.5 11.5 Z" />);
    case 'drop':     return svg(<path d="M12 3 C12 3 5 11 5 15 A7 7 0 0 0 19 15 C19 11 12 3 12 3 Z" />);
    case 'flag':     return svg(<><path d="M5 21 L5 4 L15 4 L17 7 L15 11 L5 11" /></>);
    case 'spark':    return svg(<><path d="M12 4 L13 10 L19 12 L13 14 L12 20 L11 14 L5 12 L11 10 Z" /></>);
    case 'wave':     return svg(<path d="M3 12 C5 8 7 16 9 12 C11 8 13 16 15 12 C17 8 19 16 21 12" />);
    case 'chart':    return svg(<><line x1="4" y1="20" x2="20" y2="20" /><rect x="6" y="13" width="3" height="7" /><rect x="11" y="9" width="3" height="11" /><rect x="16" y="6" width="3" height="14" /></>);
    case 'globe':    return svg(<><circle cx="12" cy="12" r="8" /><path d="M4 12 L20 12" /><path d="M12 4 C15 7 15 17 12 20 C9 17 9 7 12 4" /></>);
    case 'doc':      return svg(<><path d="M6 3 L14 3 L18 7 L18 21 L6 21 Z" /><path d="M14 3 L14 7 L18 7" /><line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="15.5" x2="15" y2="15.5" /></>);
    case 'scan':     return svg(<><path d="M4 8 L4 4 L8 4" /><path d="M20 8 L20 4 L16 4" /><path d="M4 16 L4 20 L8 20" /><path d="M20 16 L20 20 L16 20" /><line x1="4" y1="12" x2="20" y2="12" /></>);
    case 'copy':     return svg(<><rect x="8" y="8" width="12" height="12" rx="1.5" /><path d="M4 16 L4 4 L16 4" /></>);
    case 'cam':      return svg(<><rect x="3" y="7" width="18" height="13" rx="2" /><circle cx="12" cy="13.5" r="3.5" /><path d="M8 7 L9 4 L15 4 L16 7" /></>);
    case 'star':     return svg(<path d="M12 4 L14.5 9.5 L20.5 10.2 L16 14.3 L17.4 20 L12 17 L6.6 20 L8 14.3 L3.5 10.2 L9.5 9.5 Z" />);
    case 'briefcase':return svg(<><rect x="3" y="7" width="18" height="13" rx="1.5" /><path d="M9 7 L9 5 A1 1 0 0 1 10 4 L14 4 A1 1 0 0 1 15 5 L15 7" /><line x1="3" y1="13" x2="21" y2="13" /></>);
    case 'send':     return svg(<><path d="M21 4 L11 14" /><path d="M21 4 L15 21 L11 14 L4 10 Z" /></>);
    default:         return svg(<circle cx="12" cy="12" r="8" />);
  }
}

// ─────────────────────────────────────────────────────────────
// Generic sidebar — takes nav array + active index
// ─────────────────────────────────────────────────────────────
function AdmSidebar({ nav, active, role, who, accent = 'accent-bright' }) {
  return (
    <aside style={{
      width: 240, height: '100%',
      background: 'var(--white)', borderRight: '1px solid var(--rule)',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ padding: '22px 22px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <window.HomeLogo color="var(--ink)" height={18} />
      </div>
      <div style={{ padding: '0 22px 14px' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontFamily: 'var(--mono)', fontSize: 9.5, padding: '3px 8px', borderRadius: 999,
          background: 'var(--paper-3)', color: 'var(--accent-deep)',
          letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 99, background: `var(--${accent})` }} />
          {role}
        </span>
      </div>

      <nav style={{ flex: 1, padding: '4px 12px' }}>
        {nav.map((item, i) => {
          const [icon, label, count] = item;
          const isActive = i === active;
          return (
            <div key={label} style={{
              display: 'grid', gridTemplateColumns: '22px 1fr auto', alignItems: 'center', gap: 11,
              padding: '11px 12px', borderRadius: 'var(--r-md)',
              background: isActive ? 'var(--ink)' : 'transparent',
              color: isActive ? 'var(--paper)' : 'var(--ink)',
              marginBottom: 2, cursor: 'pointer',
            }}>
              <AdmIcon kind={icon} size={17} color={isActive ? 'var(--paper)' : 'var(--ink-2)'} />
              <span style={{ fontSize: 13.5, fontWeight: isActive ? 500 : 400 }}>{label}</span>
              {count != null && (
                <span style={{
                  fontFamily: 'var(--mono)', fontSize: 10,
                  padding: '2px 7px', borderRadius: 999,
                  background: isActive ? 'rgba(255,255,255,0.14)' : 'var(--paper-3)',
                  color: isActive ? 'var(--paper)' : 'var(--accent-deep)',
                }}>{count}</span>
              )}
            </div>
          );
        })}
      </nav>

      <div style={{ padding: '14px 18px', borderTop: '1px solid var(--rule)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <span style={{
            width: 34, height: 34, borderRadius: 10, background: `var(--${accent})`, color: 'var(--ink)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--serif)', fontSize: 15, fontWeight: 400,
          }}>{who?.[1] || 'A'}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 500 }}>{who?.[0] || 'Cuenta'}</div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{who?.[2] || ''}</div>
          </div>
          <AdmIcon kind="chev" size={13} color="var(--ink-3)" />
        </div>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────
// Topbar
// ─────────────────────────────────────────────────────────────
function AdmTop({ title, sub, right, searchHint = 'Buscar…' }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '24px 40px 16px',
      borderBottom: '1px solid var(--rule-2)',
    }}>
      <div>
        <span className="eyebrow">{sub}</span>
        <h1 style={{
          fontFamily: 'var(--sans)', fontSize: 30, fontWeight: 500, letterSpacing: '-0.025em',
          marginTop: 4, lineHeight: 1.1,
        }}>{title}</h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, width: 320, height: 42, padding: '0 14px',
          border: '1px solid var(--rule)', background: 'var(--white)', borderRadius: 'var(--r-md)',
        }}>
          <AdmIcon kind="search" size={15} color="var(--ink-3)" />
          <span style={{ fontSize: 13, color: 'var(--ink-3)', flex: 1 }}>{searchHint}</span>
          <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', border: '1px solid var(--rule)', padding: '2px 6px', borderRadius: 4 }}>⌘K</span>
        </div>
        <button style={{
          width: 42, height: 42, borderRadius: 'var(--r-md)',
          border: '1px solid var(--rule)', background: 'var(--white)', color: 'var(--ink-2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative',
        }}>
          <AdmIcon kind="bell" size={17} />
          <span style={{ position: 'absolute', top: 8, right: 8, width: 6, height: 6, borderRadius: 99, background: 'var(--alert)' }} />
        </button>
        {right}
      </div>
    </div>
  );
}

// Combined page shell
function AdmPage({ nav, active, role, who, accent, title, sub, right, children, height = 1080, searchHint, label }) {
  return (
    <div className="imx" data-screen-label={label} style={{
      width: 1440, height,
      background: 'var(--paper)',
      display: 'grid', gridTemplateColumns: '240px 1fr',
      overflow: 'hidden',
    }}>
      <AdmSidebar nav={nav} active={active} role={role} who={who} accent={accent} />
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <AdmTop title={title} sub={sub} right={right} searchHint={searchHint} />
        <div style={{ flex: 1, overflow: 'auto', padding: '24px 40px 32px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// Pill
function AdmPill({ on, children, count, tone }) {
  const toneBg = tone === 'alert' ? 'var(--alert-soft)' : tone === 'ok' ? '#E5F5EE' : 'var(--white)';
  const toneFg = tone === 'alert' ? 'var(--alert)' : tone === 'ok' ? 'var(--ok)' : 'var(--ink-2)';
  const toneBorder = tone === 'alert' ? 'var(--alert-rule)' : tone === 'ok' ? '#BFE3CF' : 'var(--rule)';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '7px 13px', borderRadius: 999,
      border: '1px solid ' + (on ? 'var(--ink)' : toneBorder),
      background: on ? 'var(--ink)' : toneBg,
      color: on ? 'var(--paper)' : toneFg,
      fontSize: 12.5, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
    }}>{children}{count != null && <span className="mono" style={{ fontSize: 10, opacity: 0.65 }}>{count}</span>}</span>
  );
}

// Stat cards
function AdmStat({ k, n, sub, tone }) {
  return (
    <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-lg)', padding: '14px 16px' }}>
      <div className="eyebrow">{k}</div>
      <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.03em', marginTop: 6, lineHeight: 1, color: tone === 'alert' ? 'var(--alert)' : 'var(--ink)' }}>{n}</div>
      <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 6 }}>{sub}</div>
    </div>
  );
}

// Surface card
function AdmCard({ title, action, children, padding = '14px 20px', bodyPad = '0' }) {
  return (
    <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
      {(title || action) && (
        <div style={{ padding, borderBottom: '1px solid var(--rule-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 15, fontWeight: 500 }}>{title}</h3>
          {action}
        </div>
      )}
      <div style={{ padding: bodyPad }}>{children}</div>
    </div>
  );
}

Object.assign(window, { AdmIcon, AdmSidebar, AdmTop, AdmPage, AdmPill, AdmStat, AdmCard });
