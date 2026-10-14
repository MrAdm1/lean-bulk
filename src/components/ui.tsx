import { createContext, useContext, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Dumbbell, House, Plus, ShoppingBag, ChartColumnBig } from 'lucide-react';

export type Tab = 'today' | 'train' | 'prep' | 'progress';

/* ---------- haptics & toast ---------- */
export const haptic = () => { try { if (navigator.vibrate && (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation?.hasBeenActive) navigator.vibrate(8); } catch { /* unsupported */ } };

let toastMsg: { text: string; id: number } | null = null;
const toastListeners = new Set<() => void>();
export function toast(text: string) {
  toastMsg = { text, id: Date.now() };
  toastListeners.forEach(l => l());
}
export function Toast() {
  const msg = useSyncExternalStore(fn => { toastListeners.add(fn); return () => toastListeners.delete(fn); }, () => toastMsg);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!msg) return;
    setShown(true);
    const t = setTimeout(() => setShown(false), 2200);
    return () => clearTimeout(t);
  }, [msg]);
  return <div className={'toast' + (shown ? ' shown' : '')} role="status">{msg?.text}</div>;
}

/* ---------- pills ---------- */
export function Pills<T extends string>({ value, options, onChange, label }: { value: T; options: [T, string][]; onChange: (v: T) => void; label: string }) {
  return (
    <div className="pills" role="tablist" aria-label={label}>
      {options.map(([v, text]) => (
        <button key={v} role="tab" aria-selected={v === value} className={'pill' + (v === value ? ' on' : '')} onClick={() => { onChange(v); haptic(); }}>{text}</button>
      ))}
    </div>
  );
}

/* ---------- ring ---------- */
export function Ring({ value, big, small }: { value: number; big: string; small: string }) {
  const R = 64, C = 2 * Math.PI * R;
  const [shown, setShown] = useState(0);
  useEffect(() => { const id = requestAnimationFrame(() => setShown(Math.max(0, Math.min(1, value)))); return () => cancelAnimationFrame(id); }, [value]);
  return (
    <div className="ring">
      <svg viewBox="0 0 160 160" aria-hidden="true">
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFC27A" />
            <stop offset="1" stopColor="#FF7A00" />
          </linearGradient>
        </defs>
        <circle cx="80" cy="80" r={R} fill="none" stroke="#262626" strokeWidth="10" />
        <circle cx="80" cy="80" r={R} fill="none" stroke="url(#ringGrad)" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${C} ${C}`} strokeDashoffset={C * (1 - shown)} transform="rotate(-90 80 80)" className="ring-arc" />
      </svg>
      <div className="ring-core">
        <b>{big}</b>
        <span>{small}</span>
      </div>
    </div>
  );
}

/* ---------- bar chart ---------- */
export interface Bar { label: string; value: number | null; hi?: boolean; title?: string }
export function Bars({ bars, color = 'orange' }: { bars: Bar[]; color?: 'orange' | 'teal' }) {
  const vals = bars.map(b => b.value).filter((v): v is number => v != null);
  const min = vals.length ? Math.min(...vals) : 0, max = vals.length ? Math.max(...vals) : 1;
  const lo = min - Math.max(0.4, (max - min) * 0.6), hi = max + 0.1;
  return (
    <div className="bars">
      {bars.map((b, i) => (
        <div className={'bar-col' + (b.hi ? ' hi' : '')} key={i} title={b.title}>
          <div className="bar-track">
            {b.value != null && <div className={'bar-fill ' + color} style={{ height: `${Math.max(8, ((b.value - lo) / (hi - lo)) * 100)}%` }} />}
          </div>
          <span>{b.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------- bottom nav ---------- */
export function Nav({ tab, setTab, onPlus }: { tab: Tab; setTab: (t: Tab) => void; onPlus: () => void }) {
  const item = (t: Tab, label: string, Icon: typeof House) => (
    <button className={'nav-btn' + (tab === t ? ' on' : '')} aria-label={label} aria-current={tab === t ? 'page' : undefined} onClick={() => setTab(t)}>
      <Icon size={23} strokeWidth={tab === t ? 2.4 : 1.9} />
    </button>
  );
  return (
    <nav className="nav" aria-label="Sections">
      {item('today', 'Today', House)}
      {item('train', 'Train', Dumbbell)}
      <button className="nav-plus" aria-label="Add" onClick={() => { onPlus(); haptic(); }}><Plus size={26} strokeWidth={2.6} /></button>
      {item('prep', 'Prep', ShoppingBag)}
      {item('progress', 'Progress', ChartColumnBig)}
    </nav>
  );
}

/* ---------- bottom sheet ---------- */
// SheetHost is the one panel that slides up; SheetFrame is the header + body each sheet renders inside it,
// so switching from one sheet to another swaps the content without the panel dropping and re-opening.
type DragHandlers = { onPointerDown: (e: React.PointerEvent) => void; onPointerMove: (e: React.PointerEvent) => void; onPointerUp: (e: React.PointerEvent) => void; onPointerCancel: (e: React.PointerEvent) => void };
const SheetCtx = createContext<DragHandlers | null>(null);

export function SheetFrame({ title, left, right, children }: { title: string; left?: ReactNode; right?: ReactNode; children: ReactNode }) {
  const drag = useContext(SheetCtx);
  return (
    <>
      <div className="sheet-head" {...(drag || {})}>
        <div className="grab" />
        <div className="sheet-nav">
          <div className="sheet-side">{left}</div>
          <h3>{title}</h3>
          <div className="sheet-side right">{right}</div>
        </div>
      </div>
      <div className="sheet-body">{children}</div>
    </>
  );
}

export function SheetHost({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  const [drag, setDrag] = useState<number | null>(null);
  const start = useRef<{ y: number; t: number } | null>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
      document.documentElement.classList.add('locked');
      return () => cancelAnimationFrame(id);
    }
    setShown(false);
    document.documentElement.classList.remove('locked');
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!mounted) return null;
  const onDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    start.current = { y: e.clientY, t: performance.now() };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!start.current) return;
    const dy = e.clientY - start.current.y;
    setDrag(dy < 0 ? dy / 4 : dy);
  };
  const onUp = (e: React.PointerEvent) => {
    if (!start.current) return;
    const dy = e.clientY - start.current.y;
    const v = dy / Math.max(1, performance.now() - start.current.t);
    start.current = null;
    setDrag(null);
    if (dy > 120 || (dy > 30 && v > 0.6)) onClose();
  };
  return createPortal(
    <div className={'sheet-root' + (shown ? ' shown' : '')}>
      <div className="sheet-scrim" onClick={onClose} />
      <div ref={panel} className="sheet" role="dialog" aria-modal="true"
        style={drag != null ? { transform: `translateY(${drag}px)`, transition: 'none' } : undefined}
        onTransitionEnd={e => { if (e.target === panel.current && !open) setMounted(false); }}>
        <SheetCtx.Provider value={{ onPointerDown: onDown, onPointerMove: onMove, onPointerUp: onUp, onPointerCancel: onUp }}>
          {children}
        </SheetCtx.Provider>
      </div>
    </div>,
    document.body,
  );
}

/* ---------- number stepper ---------- */
export function Stepper({ value, unit, onStep, onType, id, label }: { value: string; unit: string; onStep: (d: number) => void; onType: (v: string) => void; id: string; label: string }) {
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <div className="stepper">
      <button aria-label={`Less ${label}`} onClick={() => { setDraft(null); onStep(-1); }}>−</button>
      <label htmlFor={id}>
        <input id={id} inputMode="decimal" autoComplete="off" aria-label={label} value={draft ?? value} placeholder="–"
          onChange={e => setDraft(e.target.value)}
          onBlur={() => { if (draft != null) { onType(draft); setDraft(null); } }}
          onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }} />
        <span>{unit}</span>
      </label>
      <button aria-label={`More ${label}`} onClick={() => { setDraft(null); onStep(1); haptic(); }}>+</button>
    </div>
  );
}
