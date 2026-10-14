import { useState } from 'react';
import { CloudOff, Dumbbell, ExternalLink, RefreshCw, Search, ShoppingBag, UtensilsCrossed, Weight } from 'lucide-react';
import { FOOD_BY_ID, FOODS } from '../data/plan';
import { allFoods, defaultQty, entryFromFood, entryMacros, food, foodMacros, macroLine, stepFor, targetsOf, unitLabel } from '../lib/calc';
import { ago, fmt, fmtDate, parseNum, r1, todayKey, uid } from '../lib/format';
import { OWNER, REPO } from '../lib/github';
import { connect, disconnect, getToken, runSync, update, updateDay, useSync } from '../lib/store';
import type { Data, Food, FoodUnit } from '../lib/types';
import { haptic, SheetFrame, toast, type Tab } from '../components/ui';
import type { SheetState } from '../App';

interface P { data: Data; date: string; close: () => void; open: (s: SheetState) => void; goTab: (t: Tab) => void }

/* ---------- quick add (the + button) ---------- */
export function QuickSheet({ close, open, goTab }: P) {
  const go = (t: Tab) => { close(); goTab(t); };
  return (
    <SheetFrame title="Add" right={<button className="link" onClick={close}>Close</button>}>
      <div className="tiles">
        <button className="tile" onClick={() => open({ kind: 'weight' })}><span className="ico teal big"><Weight size={22} /></span><b>Morning weight</b><small>Log today's weigh-in</small></button>
        <button className="tile" onClick={() => open({ kind: 'add' })}><span className="ico orange big"><UtensilsCrossed size={22} /></span><b>Other food</b><small>Anything outside the plan</small></button>
        <button className="tile" onClick={() => go('train')}><span className="ico lime big"><Dumbbell size={22} /></span><b>Gym weights</b><small>Went up? Tap +</small></button>
        <button className="tile" onClick={() => go('prep')}><span className="ico blue big"><ShoppingBag size={22} /></span><b>Shopping list</b><small>Tick things off</small></button>
      </div>
    </SheetFrame>
  );
}

/* ---------- morning weight ---------- */
export function WeightSheet({ data, date, close }: P) {
  const current = data.days[date]?.weight;
  const [val, setVal] = useState(current != null ? String(current) : '');
  const n = parseNum(val);
  const step = (d: number) => { const base = n ?? current ?? data.days[Object.keys(data.days).filter(k => data.days[k].weight != null).sort().pop() || '']?.weight ?? 62; setVal(String(r1(base + d))); };
  const save = () => {
    if (n == null || n < 30 || n > 250) { toast('Type your weight in kg, like 61.7'); return; }
    updateDay(date, d => { d.weight = r1(n); });
    haptic(); toast('Weight saved'); close();
  };
  return (
    <SheetFrame title={date === todayKey() ? 'Morning weight' : fmtDate(date)} left={<button className="link" onClick={close}>Cancel</button>} right={<button className="link strong" onClick={save}>Save</button>}>
      <div className="card weigh">
        <button className="round" aria-label="Minus 0.1 kg" onClick={() => step(-0.1)}>−</button>
        <label><input inputMode="decimal" autoFocus placeholder="61.7" value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') save(); }} aria-label="Weight in kg" /><span>kg</span></label>
        <button className="round" aria-label="Plus 0.1 kg" onClick={() => step(0.1)}>+</button>
      </div>
      <p className="muted center">After the bathroom, before food or drink, no clothes.</p>
      {current != null && <button className="btn ghost danger" onClick={() => { updateDay(date, d => { delete d.weight; }); close(); }}>Remove this weigh-in</button>}
    </SheetFrame>
  );
}

/* ---------- add other food ---------- */
export function AddSheet({ data, date, close, open }: P) {
  const [mode, setMode] = useState<'search' | 'type'>('search');
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<Food | null>(null);
  const [qty, setQty] = useState('');
  const [form, setForm] = useState({ name: '', kcal: '', p: '', c: '', f: '' });
  const list = allFoods(data).filter(f => !q.trim() || f.name.toLowerCase().includes(q.trim().toLowerCase()));
  const amount = parseNum(qty) ?? 0;

  const add = () => {
    if (mode === 'search') {
      if (!sel || !(amount > 0)) { toast('Pick a food and an amount'); return; }
      updateDay(date, d => { d.entries.push(entryFromFood(sel, amount)); });
      toast(`Added ${sel.name}`);
    } else {
      const p = parseNum(form.p) || 0, c = parseNum(form.c) || 0, f = parseNum(form.f) || 0;
      const kcal = parseNum(form.kcal) ?? p * 4 + c * 4 + f * 9;
      if (!(kcal > 0)) { toast('Enter calories or at least one macro'); return; }
      const name = form.name.trim() || 'Quick entry';
      updateDay(date, d => { d.entries.push({ eid: uid(), kind: 'quick', name, unit: 'pc', per: 1, qty: 1, b: { kcal: Math.round(kcal), p: r1(p), c: r1(c), f: r1(f) }, meal: 'extra' }); });
      toast(`Added ${name}`);
    }
    haptic(); close();
  };

  return (
    <SheetFrame title="Other food" left={<button className="link" onClick={close}>Cancel</button>} right={<button className="link strong" onClick={add} disabled={mode === 'search' && !sel}>Add</button>}>
      <div className="seg2">
        <button className={mode === 'search' ? 'on' : ''} onClick={() => setMode('search')}>Search</button>
        <button className={mode === 'type' ? 'on' : ''} onClick={() => setMode('type')}>Type numbers</button>
      </div>
      {mode === 'search' ? (
        <>
          {sel && (
            <div className="card amount">
              <div className="amount-top"><b>{sel.name}</b><button className="link" onClick={() => setSel(null)}>Change</button></div>
              <div className="amount-row">
                <input inputMode="decimal" value={qty} onChange={e => setQty(e.target.value)} aria-label="Amount" />
                <span className="muted">{unitLabel(sel.unit)}</span>
                <div className="pm">
                  <button onClick={() => setQty(String(Math.max(0, r1(amount - stepFor(sel.unit)))))} aria-label="Less">−</button>
                  <button onClick={() => setQty(String(r1(amount + stepFor(sel.unit))))} aria-label="More">+</button>
                </div>
              </div>
              <p className="muted">{(() => { const m = foodMacros(sel, amount); return `${fmt(m.kcal)} kcal · ${macroLine(m)}`; })()}</p>
            </div>
          )}
          {!sel && (
            <>
              <label className="search"><Search size={18} /><input type="search" placeholder="Search foods" value={q} onChange={e => setQ(e.target.value)} aria-label="Search foods" /></label>
              <div className="card list tight">
                {list.length ? list.map(f => (
                  <button className="row" key={f.id} onClick={() => { setSel(f); setQty(String(defaultQty(f))); }}>
                    <span className="row-main"><b>{f.name}</b><small>{fmt(f.kcal)} kcal per {f.unit === 'pc' ? 'piece' : '100 ' + f.unit} · {macroLine(f)}</small></span>
                  </button>
                )) : <p className="muted empty-line">No matches. Add it from its label below, or type in the numbers.</p>}
              </div>
              <button className="btn ghost" onClick={() => open({ kind: 'food', fid: null, back: { kind: 'add' } })}>New food from a label</button>
            </>
          )}
        </>
      ) : (
        <>
          <div className="card form">
            <Field label="Name" value={form.name} onChange={v => setForm({ ...form, name: v })} placeholder="e.g. Kebab" text />
            <Field label="Calories" unit="kcal" value={form.kcal} onChange={v => setForm({ ...form, kcal: v })} placeholder="auto" />
            <Field label="Protein" unit="g" value={form.p} onChange={v => setForm({ ...form, p: v })} placeholder="0" />
            <Field label="Carbs" unit="g" value={form.c} onChange={v => setForm({ ...form, c: v })} placeholder="0" />
            <Field label="Fat" unit="g" value={form.f} onChange={v => setForm({ ...form, f: v })} placeholder="0" />
          </div>
          <p className="muted center">Leave calories empty and they're worked out from the macros.</p>
        </>
      )}
    </SheetFrame>
  );
}

/* ---------- edit an extra ---------- */
export function EditSheet({ data, date, close, eid }: P & { eid: string }) {
  const e = data.days[date]?.entries.find(x => x.eid === eid);
  const [qty, setQty] = useState(e ? String(e.qty) : '1');
  if (!e) return <SheetFrame title="Not found" right={<button className="link" onClick={close}>Close</button>}><p className="muted">This item was removed.</p></SheetFrame>;
  const amount = parseNum(qty) ?? 0;
  const m = entryMacros({ ...e, qty: amount });
  const save = () => {
    if (!(amount > 0)) { toast('Amount must be more than 0'); return; }
    updateDay(date, d => { const x = d.entries.find(y => y.eid === eid); if (x) x.qty = amount; });
    close();
  };
  return (
    <SheetFrame title={e.name} left={<button className="link" onClick={close}>Cancel</button>} right={<button className="link strong" onClick={save}>Save</button>}>
      <div className="card amount">
        <div className="amount-row">
          <input inputMode="decimal" value={qty} onChange={ev => setQty(ev.target.value)} aria-label="Amount" />
          <span className="muted">{unitLabel(e.unit)}</span>
          <div className="pm">
            <button onClick={() => setQty(String(Math.max(0, r1(amount - stepFor(e.unit)))))} aria-label="Less">−</button>
            <button onClick={() => setQty(String(r1(amount + stepFor(e.unit))))} aria-label="More">+</button>
          </div>
        </div>
        <p className="muted">{fmt(m.kcal)} kcal · {macroLine(m)}</p>
      </div>
      <button className="btn ghost danger" onClick={() => { updateDay(date, d => { d.entries = d.entries.filter(y => y.eid !== eid); }); toast('Removed'); close(); }}>Remove</button>
    </SheetFrame>
  );
}

/* ---------- settings ---------- */
export function SettingsSheet({ data, close, open }: P) {
  const sync = useSync();
  const T = targetsOf(data);
  const [t, setT] = useState({ p: String(T.p), c: String(T.c), f: String(T.f) });
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const connected = !!getToken();
  const labels = FOODS.filter(f => f.label).map(f => food(data, f.id)!);
  const custom = Object.keys(data.settings.foods).filter(id => !FOOD_BY_ID[id]).map(id => food(data, id)!);

  const saveTargets = () => {
    const p = parseNum(t.p), c = parseNum(t.c), f = parseNum(t.f);
    if ([p, c, f].some(x => x == null || x < 20 || x > 900)) { toast('Enter grams for protein, carbs and fat'); return; }
    update((d, now) => {
      const nt = { p: Math.round(p!), c: Math.round(c!), f: Math.round(f!) };
      d.settings = { ...d.settings, targets: nt, history: [...d.settings.history, { date: todayKey(), ...nt, note: 'Changed by hand' }], u: now };
    });
    toast('Targets saved');
  };
  const doConnect = async () => {
    if (!token.trim()) return;
    setBusy(true);
    try { await connect(token.trim()); setToken(''); toast('Connected to GitHub'); }
    catch (e) { toast(e instanceof Error ? e.message : 'Couldn’t connect'); }
    finally { setBusy(false); }
  };

  return (
    <SheetFrame title="Settings" right={<button className="link strong" onClick={close}>Done</button>}>
      <h4 className="label">Sync with Claude</h4>
      <div className="card">
        {connected ? (
          <>
            <div className="sync-line">
              <span className={'dot ' + sync.state} />
              <span>{sync.state === 'syncing' ? 'Syncing…' : sync.state === 'offline' ? 'Offline. Syncs when you’re back online.' : sync.state === 'error' ? sync.message : `Synced ${sync.last ? ago(sync.last) : ''}`}</span>
            </div>
            <p className="muted small">Your data is saved in the private repo {OWNER}/{REPO}, so Claude can read it in your chat.</p>
            <div className="btn-row">
              <button className="btn ghost" onClick={() => runSync()}><RefreshCw size={16} /> Sync now</button>
              <button className="btn ghost danger" onClick={() => { disconnect(); toast('Disconnected. Data stays on this phone.'); }}><CloudOff size={16} /> Disconnect</button>
            </div>
          </>
        ) : (
          <>
            <p className="small">Connect once so Claude can read your data. Takes 2 minutes:</p>
            <ol className="steps-ol small">
              <li>Open <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noreferrer">GitHub token settings <ExternalLink size={12} /></a> and sign in.</li>
              <li>Name it <b>Lean Bulk</b>, expiry 1 year.</li>
              <li>Repository access: <b>Only select repositories</b> → <b>{REPO}</b>.</li>
              <li>Permissions → Repository → <b>Contents: Read and write</b>.</li>
              <li>Generate, copy, and paste it here.</li>
            </ol>
            <input className="text-in" type="password" autoComplete="off" placeholder="Paste token" value={token} onChange={e => setToken(e.target.value)} aria-label="GitHub token" />
            <button className="btn" disabled={busy || !token.trim()} onClick={doConnect}>{busy ? 'Connecting…' : 'Connect'}</button>
          </>
        )}
      </div>

      <h4 className="label">Daily targets</h4>
      <div className="card form">
        <Field label="Protein" unit="g" value={t.p} onChange={v => setT({ ...t, p: v })} />
        <Field label="Carbs" unit="g" value={t.c} onChange={v => setT({ ...t, c: v })} />
        <Field label="Fat" unit="g" value={t.f} onChange={v => setT({ ...t, f: v })} />
      </div>
      <button className="btn ghost" onClick={saveTargets}>Save targets</button>
      <p className="muted small center">The check-in adjusts carbs for you. Only change these by hand if you know why.</p>

      <h4 className="label">Your labels</h4>
      <div className="card list tight">
        {[...labels, ...custom].map(f => (
          <button className="row" key={f.id} onClick={() => open({ kind: 'food', fid: f.id, back: { kind: 'settings' } })}>
            <span className="row-main"><b>{f.name}</b><small>{fmt(f.kcal)} kcal · {macroLine(f)}</small></span>
          </button>
        ))}
      </div>
      <button className="btn ghost" onClick={() => open({ kind: 'food', fid: null, back: { kind: 'settings' } })}>New food from a label</button>
    </SheetFrame>
  );
}

/* ---------- new / edit food ---------- */
export function FoodSheet({ data, close, open, fid, back }: P & { fid: string | null; back: SheetState }) {
  const f = fid ? food(data, fid) : null;
  const builtin = !!(fid && FOOD_BY_ID[fid]);
  const [v, setV] = useState({ name: f?.name || '', unit: (f?.unit || 'g') as FoodUnit, kcal: f ? String(f.kcal) : '', p: f ? String(f.p) : '', c: f ? String(f.c) : '', fat: f ? String(f.f) : '' });
  const leave = () => (back ? open(back) : close());
  const save = () => {
    const vals = [v.kcal, v.p, v.c, v.fat].map(parseNum);
    if (!v.name.trim()) { toast('Give the food a name'); return; }
    if (vals.some(x => x == null || x < 0)) { toast('Fill in calories, protein, carbs and fat'); return; }
    const id = fid || 'c_' + uid();
    const unit = builtin ? FOOD_BY_ID[fid!].unit : v.unit;
    update((d, now) => {
      d.settings = { ...d.settings, foods: { ...d.settings.foods, [id]: { name: v.name.trim(), unit, per: unit === 'pc' ? 1 : 100, kcal: vals[0]!, p: vals[1]!, c: vals[2]!, f: vals[3]!, ...(builtin && FOOD_BY_ID[fid!].short ? { short: FOOD_BY_ID[fid!].short } : {}) } }, u: now };
    });
    toast(`Saved ${v.name.trim()}`);
    leave();
  };
  const del = () => {
    if (!fid || builtin) return;
    update((d, now) => { const foods = { ...d.settings.foods }; delete foods[fid]; d.settings = { ...d.settings, foods, u: now }; });
    toast('Food deleted'); leave();
  };
  return (
    <SheetFrame title={f ? 'Edit food' : 'New food'} left={<button className="link" onClick={leave}>{back ? 'Back' : 'Cancel'}</button>} right={<button className="link strong" onClick={save}>Save</button>}>
      <div className="card form">
        <Field label="Name" text value={v.name} onChange={x => setV({ ...v, name: x })} placeholder="e.g. Rema rice pouch" />
        <label className="field"><span>Values per</span>
          <select value={v.unit} disabled={builtin} onChange={e => setV({ ...v, unit: e.target.value as FoodUnit })}>
            <option value="g">100 g</option><option value="ml">100 ml</option><option value="pc">1 piece or pack</option>
          </select>
        </label>
      </div>
      <div className="card form">
        <Field label="Calories" unit="kcal" value={v.kcal} onChange={x => setV({ ...v, kcal: x })} />
        <Field label="Protein" unit="g" value={v.p} onChange={x => setV({ ...v, p: x })} />
        <Field label="Carbs" unit="g" value={v.c} onChange={x => setV({ ...v, c: x })} />
        <Field label="Fat" unit="g" value={v.fat} onChange={x => setV({ ...v, fat: x })} />
      </div>
      <p className="muted small center">Copy the numbers from the label (næringsinnhold).{builtin && v.unit === 'pc' ? ' This one is per piece: per-100 g value × piece weight ÷ 100.' : ''}</p>
      {fid && !builtin && <button className="btn ghost danger" onClick={del}>Delete food</button>}
    </SheetFrame>
  );
}

function Field({ label, value, onChange, unit, placeholder, text }: { label: string; value: string; onChange: (v: string) => void; unit?: string; placeholder?: string; text?: boolean }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type={text ? 'text' : undefined} inputMode={text ? undefined : 'decimal'} autoComplete="off" value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} />
      {unit && <em>{unit}</em>}
    </label>
  );
}
