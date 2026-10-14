import { Apple, Beef, Check, ChevronLeft, ChevronRight, Dumbbell, Egg, Flame, Milk, Plus, Sandwich, Settings, Target, UtensilsCrossed, Weight } from 'lucide-react';
import { PROGRAM, SLOTS, type SlotIcon } from '../data/plan';
import { dayTotals, entryFromTemplate, entryMacros, isSlotEntry, nextSession, qtyText, targetsOf, todaysSession, tplById, tplMacros, trendAt, weightSeries } from '../lib/calc';
import { addDays, clamp, DOW, DOW_FULL, dayNum, fmt, fmtDate, signed, todayKey, weekday } from '../lib/format';
import { updateDay } from '../lib/store';
import type { Data } from '../lib/types';
import { haptic, Ring, type Tab } from '../components/ui';
import type { SheetState } from '../App';

const MEAL_ICON: Record<SlotIcon, typeof Egg> = { breakfast: Egg, snack: Apple, lunch: Sandwich, shake: Milk, dinner: UtensilsCrossed };

export function Today({ data, date, setDate, open, goTab }: { data: Data; date: string; setDate: (k: string) => void; open: (s: SheetState) => void; goTab: (t: Tab) => void }) {
  const today = todayKey();
  const diff = dayNum(date) - dayNum(today);
  const hour = new Date().getHours();
  const title = diff === 0 ? (hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening') : diff === -1 ? 'Yesterday' : DOW_FULL[weekday(date)];
  const T = targetsOf(data);
  const day = data.days[date];
  const entries = day?.entries || [];
  const tot = dayTotals(day);
  const left = T.kcal - tot.kcal;
  const series = weightSeries(data);
  const trend = trendAt(series, dayNum(date));
  const prev = trendAt(series, dayNum(date) - 7);
  const extras = entries.filter(e => !isSlotEntry(e));
  const doneCount = SLOTS.filter(s => entries.some(e => e.kind === 'tpl' && e.meal === s.id && s.opts.includes(e.ref || ''))).length;
  const todays = todaysSession();
  const next = nextSession();

  const toggle = (slotId: string, tplId: string) => {
    const slot = SLOTS.find(s => s.id === slotId)!;
    const t = tplById(tplId)!;
    let added = false;
    updateDay(date, d => {
      const already = d.entries.some(e => e.kind === 'tpl' && e.meal === slot.id && e.ref === t.id);
      d.entries = d.entries.filter(e => !(e.kind === 'tpl' && e.meal === slot.id && slot.opts.includes(e.ref || '')));
      if (!already) { d.entries.push(entryFromTemplate(data, t, slot.id)); added = true; }
    });
    if (added) haptic();
  };

  return (
    <>
      <header className="top">
        <div>
          <h1>{title}</h1>
          <div className="datenav">
            <button aria-label="Previous day" onClick={() => setDate(addDays(date, -1))}><ChevronLeft size={18} /></button>
            <span>{diff === 0 ? `Today, ${fmtDate(date)}` : fmtDate(date)}</span>
            <button aria-label="Next day" disabled={diff >= 0} onClick={() => setDate(addDays(date, 1))}><ChevronRight size={18} /></button>
          </div>
        </div>
        <button className="round" aria-label="Settings" onClick={() => open({ kind: 'settings' })}><Settings size={21} /></button>
      </header>

      <section className="card hero">
        <div className="hero-text">
          <h2>Daily fuel</h2>
          <p className="muted">Goal minus food</p>
          <ul className="kv">
            <li><span className="ico orange"><Target size={18} /></span><span><small>Goal</small><b>{fmt(T.kcal)}</b></span></li>
            <li><span className="ico blue"><Flame size={18} /></span><span><small>Eaten</small><b>{fmt(tot.kcal)}</b></span></li>
            <li><span className="ico teal"><Beef size={18} /></span><span><small>Protein</small><b>{fmt(tot.p)}<i> / {T.p} g</i></b></span></li>
          </ul>
        </div>
        <Ring value={tot.kcal / T.kcal} big={fmt(Math.abs(left))} small={left >= 0 ? 'kcal left' : 'kcal over'} />
      </section>

      <div className="duo">
        <button className="card mini" onClick={() => open({ kind: 'weight' })}>
          <h3>Weight</h3>
          <div className="mini-val"><Weight size={20} className="c-teal" />{typeof day?.weight === 'number' ? <b>{fmt(day.weight, 1)}<i> kg</i></b> : <b className="dim">Log it</b>}</div>
          <p className="muted">{trend != null ? `7-day avg ${fmt(trend, 1)}${prev != null ? ` · ${signed(trend - prev, 1)} this week` : ''}` : 'Tap to log, every morning'}</p>
        </button>
        <button className="card mini" onClick={() => goTab('train')}>
          <h3>Workout</h3>
          <div className="mini-val"><Dumbbell size={20} className="c-lime" /><b>{todays ? PROGRAM[todays].name : 'Rest'}</b></div>
          <p className="muted">{todays ? PROGRAM[todays].focus : `Next: ${PROGRAM[next.s].name} ${DOW[weekday(addDays(today, next.inDays))]}`}</p>
        </button>
      </div>

      <section className="card">
        <div className="card-head"><h2>Meals</h2><span className="count">{doneCount} of {SLOTS.length}</span></div>
        <div className="meals">
          {SLOTS.map(s => {
            const logged = entries.filter(e => e.kind === 'tpl' && e.meal === s.id && s.opts.includes(e.ref || ''));
            const kcal = logged.reduce((t, e) => t + entryMacros(e).kcal, 0);
            const Icon = MEAL_ICON[s.id];
            return (
              <div className={'meal' + (logged.length ? ' done' : '')} key={s.id}>
                <div className="meal-top">
                  <span className="meal-ico">{logged.length ? <Check size={18} strokeWidth={3} /> : <Icon size={18} />}</span>
                  <span className="meal-name">{s.name}<small>{s.time}</small></span>
                  <span className="meal-kcal">{logged.length ? `${fmt(kcal)} kcal` : ''}</span>
                </div>
                <div className="chips">
                  {s.opts.map(id => {
                    const t = tplById(id)!;
                    const on = logged.some(e => e.ref === id);
                    return (
                      <button key={id} className={'chip' + (on ? ' on' : '')} aria-pressed={on} onClick={() => toggle(s.id, id)}>
                        {on && <Check size={15} strokeWidth={3} />}{t.name}{!on && <em>{fmt(tplMacros(data, t).kcal)}</em>}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="card">
        <div className="card-head"><h2>Extras</h2><button className="link" onClick={() => open({ kind: 'add' })}><Plus size={16} /> Add food</button></div>
        {extras.length ? (
          <div className="list">
            {extras.map(e => (
              <button className="row" key={e.eid} onClick={() => open({ kind: 'edit', eid: e.eid })}>
                <span className="row-main"><b>{e.name}</b><small>{qtyText(e)}</small></span>
                <span className="row-val">{fmt(entryMacros(e).kcal)}<i> kcal</i></span>
              </button>
            ))}
          </div>
        ) : <p className="muted empty-line">Anything outside your plan: snacks, a takeaway, an extra banana.</p>}
        <p className="tot-line">{fmt(tot.c)} g carbs · {fmt(tot.f)} g fat · {clamp(Math.round(tot.kcal / T.kcal * 100), 0, 999)}% of today</p>
      </section>
    </>
  );
}
