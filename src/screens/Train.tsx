import { useState } from 'react';
import { ChevronDown, Clock, Dumbbell, Info } from 'lucide-react';
import { HOWTO, ORDER, PROGRAM, type Exercise, type SessionId } from '../data/plan';
import { easing, liftNow, liftStart, nextSession, todaysSession } from '../lib/calc';
import { addDays, DOW, fmtDate, kg, parseNum, signed, todayKey, weekday } from '../lib/format';
import { update } from '../lib/store';
import type { Data } from '../lib/types';
import { Pills, Stepper, toast } from '../components/ui';

function setLift(ex: Exercise, value: number) {
  update((d, now) => {
    const t = todayKey();
    const h = (d.lifts[ex.id]?.h || []).slice();
    const cur = h.length ? h[h.length - 1].kg : ex.start ?? null;
    if (cur === value) return;
    if (h.length && h[h.length - 1].d === t) h[h.length - 1] = { d: t, kg: value }; else h.push({ d: t, kg: value });
    d.lifts[ex.id] = { h, u: now };
  });
}

export function Train({ data }: { data: Data }) {
  const todays = todaysSession();
  const next = nextSession();
  const [sess, setSess] = useState<SessionId>(todays || next.s);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [how, setHow] = useState(false);
  const P = PROGRAM[sess];
  const ease = easing(data);
  const sub = todays ? `Today: ${PROGRAM[todays].name}` : `Rest day · next ${PROGRAM[next.s].name} ${DOW[weekday(addDays(todayKey(), next.inDays))]}`;

  return (
    <>
      <header className="top"><div><h1>Train</h1><p className="muted">{sub}</p></div></header>
      <Pills label="Session" value={sess} onChange={setSess} options={ORDER.map(s => [s, PROGRAM[s].name])} />

      <section className="card session">
        <span className="ico lime big"><Dumbbell size={22} /></span>
        <div>
          <h2>{P.focus}</h2>
          <p className="muted"><Clock size={14} /> about {P.mins} min · {P.ex.length} exercises</p>
        </div>
      </section>
      {ease.on && (
        <div className="note lime"><b>Weeks 1–2:</b> 2 sets of everything, stop 2–3 reps before failure. Full sets from {fmtDate(ease.end)}.</div>
      )}

      <div className="exlist">
        {P.ex.map((ex, i) => {
          const now = liftNow(data, ex), start = liftStart(data, ex);
          const gain = now != null && start != null ? Math.round((now - start) * 100) / 100 : 0;
          const sets = ease.on ? Math.min(2, ex.sets) : ex.sets;
          const step = ex.step || 2.5;
          return (
            <article className="card ex" key={ex.id}>
              <button className="ex-top" onClick={() => setOpen(o => ({ ...o, [ex.id]: !o[ex.id] }))} aria-expanded={!!open[ex.id]}>
                <span className="ex-n">{i + 1}</span>
                <span className="ex-name">{ex.name}</span>
                {ex.isNew && <span className="tag teal">New</span>}
                {ex.ss && <span className="tag">{ex.ss}</span>}
                <Info size={16} className="dim" />
              </button>
              <div className="ex-bottom">
                <div className="ex-meta">
                  <b>{sets} × {ex.reps}</b>
                  <span>rest {ex.rest}</span>
                  {gain !== 0 && <span className={gain > 0 ? 'up' : 'dim'}>{signed(gain, gain % 1 ? 1 : 0)} kg</span>}
                </div>
                <Stepper id={'w-' + ex.id + '-' + sess} label={`${ex.name} weight`} unit="kg" value={kg(now)}
                  onStep={d => setLift(ex, Math.max(0, Math.round(((now ?? 0) + d * step) * 100) / 100))}
                  onType={v => { const n = parseNum(v); if (n == null) return; if (n < 0 || n > 500) { toast('That weight looks off'); return; } setLift(ex, Math.round(n * 100) / 100); }} />
              </div>
              {open[ex.id] && <p className="cue">{ex.cue}</p>}
            </article>
          );
        })}
      </div>

      <section className="card how">
        <button className="how-head" onClick={() => setHow(h => !h)} aria-expanded={how}>
          <h2>How to train</h2><ChevronDown size={20} style={{ transform: how ? 'rotate(180deg)' : undefined }} />
        </button>
        {how && <ul>{HOWTO.map(([t, s]) => <li key={t}><b>{t}</b><span>{s}</span></li>)}</ul>}
      </section>
      <p className="foot">Superset letters: alternate the two exercises with the same letter.</p>
    </>
  );
}
