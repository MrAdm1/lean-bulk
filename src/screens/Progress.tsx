import { useState } from 'react';
import { ChevronRight, Gauge, Scale, TrendingUp } from 'lucide-react';
import { PACE } from '../data/plan';
import { changeNote, checkin, liftNow, liftStart, targetsOf, trendAt, uniqueExercises, weightSeries } from '../lib/calc';
import { addDays, avg, dayNum, DOW, fmt, fmtShort, keyFromNum, signed, todayKey, weekday } from '../lib/format';
import { update } from '../lib/store';
import type { Data } from '../lib/types';
import { Bars, haptic, Pills, toast, type Bar } from '../components/ui';
import type { SheetState } from '../App';

export function Progress({ data, open }: { data: Data; open: (s: SheetState) => void }) {
  const [range, setRange] = useState<'week' | 'months'>('week');
  const series = weightSeries(data);
  const today = todayKey(), tn = dayNum(today);
  const T = targetsOf(data);
  const ck = checkin(data);
  const trendNow = trendAt(series, tn);
  const startW = series.length ? series[0].w : null;
  let weighs = 0;
  for (let i = 0; i < 7; i++) if (typeof data.days[addDays(today, -i)]?.weight === 'number') weighs++;

  let bars: Bar[];
  if (range === 'week') {
    bars = Array.from({ length: 7 }, (_, i) => {
      const k = addDays(today, i - 6);
      const w = data.days[k]?.weight;
      return { label: DOW[weekday(k)], value: typeof w === 'number' ? w : null, hi: i === 6, title: typeof w === 'number' ? `${fmt(w, 1)} kg` : 'no weigh-in' };
    });
  } else {
    const thisMon = tn - ((weekday(today) + 6) % 7);
    bars = Array.from({ length: 10 }, (_, i) => {
      const mon = thisMon - (9 - i) * 7;
      const ws = series.filter(p => p.n >= mon && p.n < mon + 7).map(p => p.w);
      const a = avg(ws);
      const k = keyFromNum(mon);
      return { label: `${Number(k.slice(8))}.${Number(k.slice(5, 7))}`, value: a, hi: i === 9, title: a != null ? `${fmt(a, 1)} kg avg` : 'no data' };
    });
  }

  const lifts = uniqueExercises().map(ex => {
    const now = liftNow(data, ex), start = liftStart(data, ex);
    return { ex, now, gain: now != null && start != null ? Math.round((now - start) * 100) / 100 : 0 };
  });
  const up = lifts.filter(l => l.gain > 0).sort((a, b) => b.gain - a.gain);
  const tone = ck.rate == null ? 'muted' : ck.rate < 0 ? 'bad' : ck.rate < PACE.low ? 'warn' : ck.rate <= PACE.high ? 'good' : 'warn';

  const apply = () => {
    if (!ck.delta) return;
    update((d, now) => {
      const t = { ...d.settings.targets, c: d.settings.targets.c + ck.delta };
      d.settings = { ...d.settings, targets: t, history: [...d.settings.history, { date: today, ...t, note: changeNote(ck.delta, ck.rate) }], u: now };
    });
    haptic();
    toast(`New target: ${fmt(T.kcal + ck.delta * 4)} kcal`);
  };

  return (
    <>
      <header className="top"><div><h1>Progress</h1><p className="muted">Goal: +{PACE.aim} kg a week</p></div></header>

      <section className="card">
        <div className="card-head">
          <h2>Weight journey</h2>
          <Pills label="Chart range" value={range} onChange={setRange} options={[['week', '7 days'], ['months', '10 weeks']]} />
        </div>
        <p className="big-num">{trendNow != null ? fmt(trendNow, 1) : '–'}<i> kg</i></p>
        <p className="muted">{series.length ? `${signed(trendNow != null && startW != null ? trendNow - startW : null, 1)} kg since ${fmtShort(series[0].k)} · 7-day average` : 'Weigh in every morning to fill this in'}</p>
        <Bars bars={bars} color={range === 'week' ? 'orange' : 'teal'} />
      </section>

      <div className="duo">
        <div className="card mini">
          <h3>Pace</h3>
          <div className="mini-val"><Gauge size={20} className={'c-' + tone} /><b>{ck.rate != null ? signed(ck.rate, 2) : '–'}<i> kg/wk</i></b></div>
          <p className="muted">Target {PACE.low}–{PACE.high}</p>
        </div>
        <div className="card mini">
          <h3>Weigh-ins</h3>
          <div className="mini-val"><Scale size={20} className="c-teal" /><b>{weighs}<i> / 7</i></b></div>
          <p className="muted">Last 7 days</p>
        </div>
      </div>

      <section className="card">
        <div className="card-head"><h2>Check-in</h2><span className={'status ' + ck.tone}>{ck.pill}</span></div>
        <h3 className="ck-title">{ck.title}</h3>
        <p className="muted ck-body">{ck.body}</p>
        {ck.delta !== 0 && (
          <>
            <div className="change">
              <div><small>Carbs</small><b>{T.c} → {T.c + ck.delta} g</b></div>
              <div><small>Calories</small><b>{fmt(T.kcal)} → {fmt(T.kcal + ck.delta * 4)}</b></div>
            </div>
            <button className="btn" onClick={apply}>Apply new targets</button>
          </>
        )}
      </section>

      <section className="card">
        <div className="card-head"><h2>Strength</h2><TrendingUp size={20} className="c-lime" /></div>
        <p className="big-num">{up.length}<i> of {lifts.length} lifts up</i></p>
        {up.length ? (
          <div className="list">
            {up.slice(0, 5).map(l => (
              <div className="row" key={l.ex.id}><span className="row-main"><b>{l.ex.name}</b><small>now {l.now} kg</small></span><span className="row-val up">+{l.gain} kg</span></div>
            ))}
          </div>
        ) : <p className="muted">Tap + next to an exercise on the Train tab when you go up in weight.</p>}
      </section>

      <button className="card row-card" onClick={() => open({ kind: 'settings' })}>
        <span className="row-main"><b>Daily targets</b><small>{fmt(T.kcal)} kcal · P {T.p} · C {T.c} · F {T.f}</small></span>
        <ChevronRight size={20} className="dim" />
      </button>
    </>
  );
}
