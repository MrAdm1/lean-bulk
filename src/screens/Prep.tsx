import { useState } from 'react';
import { Check, ShieldCheck, Timer } from 'lucide-react';
import { GROCERIES, PREP } from '../data/plan';
import { update } from '../lib/store';
import type { Data } from '../lib/types';
import { haptic, Pills } from '../components/ui';

type PrepTab = 'shop' | 'sunday' | 'wednesday' | 'daily';

export function Prep({ data }: { data: Data }) {
  const [tab, setTab] = useState<PrepTab>('shop');
  const checked = data.grocery.checked;
  const total = GROCERIES.reduce((n, g) => n + g.items.length, 0);
  const done = GROCERIES.reduce((n, g) => n + g.items.filter(([id]) => checked[id]).length, 0);
  const toggle = (id: string) => {
    update((d, now) => {
      const c = { ...d.grocery.checked };
      if (c[id]) delete c[id]; else c[id] = true;
      d.grocery = { checked: c, u: now };
    });
    haptic();
  };

  return (
    <>
      <header className="top"><div><h1>Prep</h1><p className="muted">This week's shopping and cooking</p></div></header>
      <Pills label="Prep section" value={tab} onChange={setTab} options={[['shop', 'Shop'], ['sunday', 'Sunday'], ['wednesday', 'Wednesday'], ['daily', 'Daily']]} />

      {tab === 'shop' && (
        <>
          <section className="card">
            <div className="card-head"><h2>Shopping list</h2>{done > 0 && <button className="link" onClick={() => update((d, now) => { d.grocery = { checked: {}, u: now }; })}>Clear</button>}</div>
            <p className="big-num">{done}<i> of {total}</i></p>
            <div className="meter"><i className="orange" style={{ width: `${(done / total) * 100}%` }} /></div>
          </section>
          {GROCERIES.map(g => (
            <section className="card" key={g.group}>
              <h2 className="group-title">{g.group}</h2>
              <div className="list">
                {g.items.map(([id, name, qty]) => (
                  <button className={'row check' + (checked[id] ? ' done' : '')} key={id} onClick={() => toggle(id)} aria-pressed={!!checked[id]}>
                    <span className="tick">{checked[id] && <Check size={15} strokeWidth={3} />}</span>
                    <span className="row-main"><b>{name}</b></span>
                    {qty && <span className="row-qty">{qty}</span>}
                  </button>
                ))}
              </div>
            </section>
          ))}
        </>
      )}

      {(tab === 'sunday' || tab === 'wednesday') && (
        <>
          <section className="card session">
            <span className="ico orange big"><Timer size={22} /></span>
            <div>
              <h2>{tab === 'sunday' ? 'About 75 minutes' : 'About 40 minutes'}</h2>
              <p className="muted">{tab === 'sunday' ? 'Lunches Mon–Wed + chicken for the week' : 'Lunches Thu–Sat'}</p>
            </div>
          </section>
          <section className="card">
            <div className="steps">
              {PREP[tab].map(s => (
                <div className="step" key={s.time + s.title}>
                  <span className="step-time">{s.time}</span>
                  <div><b>{s.title}</b><p>{s.text}</p></div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {tab === 'daily' && (
        <>
          <section className="card">
            <div className="steps plain">
              {PREP.daily.map(([t, s]) => <div className="step" key={t}><div><b>{t}</b><p>{s}</p></div></div>)}
            </div>
          </section>
          <section className="card">
            <div className="card-head"><h2>Food safety</h2><ShieldCheck size={20} className="c-teal" /></div>
            <ul className="bullets">{PREP.safety.map(s => <li key={s}>{s}</li>)}</ul>
          </section>
        </>
      )}
    </>
  );
}
