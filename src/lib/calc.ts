import { FOOD_BY_ID, FOODS, PACE, PLAN_DAY, PROGRAM, ORDER, SLOTS, TEMPLATES, EASE_DAYS, type Exercise, type SessionId, type Template } from '../data/plan';
import { addDays, avg, dayNum, fmt, fmtDate, keyFromNum, r1, signed, todayKey, uid, weekday } from './format';
import type { Data, Day, Entry, Food, Macros } from './types';

export const targetsOf = (d: Data) => { const t = d.settings.targets; return { ...t, kcal: t.p * 4 + t.c * 4 + t.f * 9 }; };

export function food(d: Data, id: string): Food | null {
  const o = d.settings.foods[id];
  const base = FOOD_BY_ID[id];
  if (o) return { ...(base || {}), ...o, id } as Food;
  return base || null;
}
export function allFoods(d: Data): Food[] {
  const ids = new Set([...FOODS.map(f => f.id), ...Object.keys(d.settings.foods)]);
  return [...ids].map(id => food(d, id)).filter((f): f is Food => !!f);
}
export const tplById = (id: string) => TEMPLATES.find(t => t.id === id) || null;
export function foodMacros(f: Macros & { per: number }, qty: number): Macros {
  const k = qty / f.per;
  return { kcal: f.kcal * k, p: f.p * k, c: f.c * k, f: f.f * k };
}
export const sumMacros = (list: Macros[]): Macros => list.reduce((t, m) => ({ kcal: t.kcal + m.kcal, p: t.p + m.p, c: t.c + m.c, f: t.f + m.f }), { kcal: 0, p: 0, c: 0, f: 0 });
export function tplMacros(d: Data, t: Template): Macros {
  return sumMacros(t.items.map(([fid, q]) => { const f = food(d, fid); return f ? foodMacros(f, q) : { kcal: 0, p: 0, c: 0, f: 0 }; }));
}
export function itemText(d: Data, fid: string, q: number) {
  const f = food(d, fid); if (!f) return '';
  const s = f.short || f.name;
  return f.unit === 'g' ? `${q} g ${s}` : f.unit === 'ml' ? `${q} ml ${s}` : `${q} ${s}`;
}
export const tplNote = (d: Data, t: Template) => t.items.map(([fid, q]) => itemText(d, fid, q)).join(', ');
export const entryMacros = (e: Entry): Macros => foodMacros({ ...e.b, per: e.per || 1 }, e.qty);
export const dayTotals = (day?: Day) => sumMacros((day?.entries || []).map(entryMacros));
export const macroLine = (m: Macros) => `P ${fmt(m.p)} · C ${fmt(m.c)} · F ${fmt(m.f)}`;
const roundM = (m: Macros): Macros => ({ kcal: Math.round(m.kcal), p: r1(m.p), c: r1(m.c), f: r1(m.f) });
export function entryFromTemplate(d: Data, t: Template, meal: string): Entry {
  return { eid: uid(), kind: 'tpl', ref: t.id, name: t.name, note: tplNote(d, t), unit: 'serving', per: 1, qty: 1, b: roundM(tplMacros(d, t)), meal };
}
export function entryFromFood(f: Food, qty: number): Entry {
  return { eid: uid(), kind: 'food', ref: f.id, name: f.name, unit: f.unit, per: f.per, qty, b: { kcal: f.kcal, p: f.p, c: f.c, f: f.f }, meal: 'extra' };
}
export const isSlotEntry = (e: Entry) => e.kind === 'tpl' && SLOTS.some(s => s.id === e.meal && s.opts.includes(e.ref || ''));
export function qtyText(e: Entry) {
  if (e.unit === 'g') return `${fmt(e.qty)} g`;
  if (e.unit === 'ml') return `${fmt(e.qty)} ml`;
  if (e.unit === 'serving') return e.qty === 1 ? '1 serving' : `${fmt(e.qty, e.qty % 1 ? 1 : 0)} servings`;
  return `× ${fmt(e.qty, e.qty % 1 ? 1 : 0)}`;
}
export const unitLabel = (u: string) => (u === 'g' ? 'g' : u === 'ml' ? 'ml' : u === 'serving' ? 'serving' : 'pcs');
export const stepFor = (u: string) => (u === 'g' ? 25 : u === 'ml' ? 50 : u === 'serving' ? 0.5 : 1);
export const defaultQty = (f: Food) => (f.unit === 'g' ? 100 : f.unit === 'ml' ? 250 : 1);

/* ---------- weight ---------- */
export interface Point { k: string; n: number; w: number }
export const weightSeries = (d: Data): Point[] =>
  Object.keys(d.days).filter(k => typeof d.days[k].weight === 'number').sort().map(k => ({ k, n: dayNum(k), w: d.days[k].weight as number }));
export function trendAt(series: Point[], n: number) {
  const pts = series.filter(p => p.n <= n && p.n > n - 7);
  return pts.length ? avg(pts.map(p => p.w)) : null;
}
export function slopePerWeek(points: Point[]) {
  if (points.length < 2) return null;
  const mx = avg(points.map(p => p.n)) as number, my = avg(points.map(p => p.w)) as number;
  let num = 0, den = 0;
  points.forEach(p => { num += (p.n - mx) * (p.w - my); den += (p.n - mx) ** 2; });
  return den ? (num / den) * 7 : null;
}

export type Tone = 'good' | 'warn' | 'bad' | 'muted';
export interface Checkin { tone: Tone; pill: string; title: string; body: string; delta: number; rate: number | null }
export function checkin(d: Data): Checkin {
  const series = weightSeries(d);
  const today = todayKey(), tn = dayNum(today);
  const T = targetsOf(d);
  const hist = d.settings.history || [];
  if (!series.length) return { tone: 'muted', pill: 'No weigh-ins yet', title: 'Weigh in tomorrow morning', body: 'Log your weight every morning. After two weeks this tells you whether to eat more, less or the same.', delta: 0, rate: null };
  const first = series[0].n;
  const win = series.filter(p => p.n > tn - 14 && p.n <= tn);
  const rate = win.length >= 5 ? slopePerWeek(win) : null;
  const kcals: number[] = [];
  for (let i = 0; i < 14; i++) { const day = d.days[addDays(today, -i)]; if (day && day.entries.length) kcals.push(dayTotals(day).kcal); }
  const avgK = avg(kcals);
  const last = hist.length ? hist[hist.length - 1] : null;
  const changed = last && hist.length > 1 ? dayNum(last.date) : null;
  const ready = Math.max(first, changed ?? first) + 14;
  const base = { rate, delta: 0 };
  if (tn - first < 14) return { ...base, tone: 'muted', pill: `Day ${tn - first + 1} of 14`, title: 'Hold. Don’t change anything yet.', body: `The first two weeks add 0.5–1.5 kg of water and glycogen, so the scale can’t show your real pace yet. First check-in: ${fmtDate(keyFromNum(first + 14))}.` };
  if (win.length < 8) return { ...base, tone: 'warn', pill: 'Need more weigh-ins', title: `${win.length} weigh-ins in 14 days`, body: 'Weigh in every morning this week, then check again.' };
  if (tn < ready) return { ...base, tone: 'muted', pill: 'Hold', title: `Hold until ${fmtDate(keyFromNum(ready))}`, body: 'Give each change 2 weeks before judging it.' };
  if (kcals.length < 10) return { ...base, tone: 'warn', pill: 'Log more food', title: `Food logged on ${kcals.length} of 14 days`, body: 'Tick off your meals on at least 10 of 14 days, then check again.' };
  if ((avgK as number) < T.kcal - 150) return { ...base, tone: 'warn', pill: 'Under target', title: `You averaged ${fmt(avgK)} kcal`, body: `That’s ${fmt(T.kcal - (avgK as number))} under target. Eat the target first. Hard to finish? Whole milk in the shake and 1 tbsp honey.` };
  const r = rate as number;
  if (r < 0) return { ...base, delta: 50, tone: 'bad', pill: 'Losing weight', title: `Losing ${fmt(-r, 2)} kg a week`, body: 'Add 50 g carbs a day (about 200 kcal): an extra banana plus 40 g oats in the shake.' };
  if (r < PACE.low) return { ...base, delta: 25, tone: 'warn', pill: 'Too slow', title: `Gaining ${fmt(r, 2)} kg a week`, body: 'Add 25 g carbs a day (about 100 kcal). One extra banana covers it.' };
  if (r <= PACE.high) return { ...base, tone: 'good', pill: 'On pace', title: `Gaining ${fmt(r, 2)} kg a week`, body: 'Right on target. Change nothing.' };
  if (r <= 0.5) return { ...base, delta: -25, tone: 'warn', pill: 'Too fast', title: `Gaining ${fmt(r, 2)} kg a week`, body: 'Too much of that is fat. Remove 25 g carbs a day (about 100 kcal).' };
  return { ...base, delta: -50, tone: 'bad', pill: 'Much too fast', title: `Gaining ${fmt(r, 2)} kg a week`, body: 'Remove 50 g carbs a day (about 200 kcal).' };
}
export const changeNote = (delta: number, rate: number | null) => `${delta > 0 ? '+' : ''}${delta} g carbs. Pace was ${signed(rate, 2)} kg/week.`;

/* ---------- training ---------- */
export const liftHist = (d: Data, id: string) => d.lifts[id]?.h || [];
export function liftNow(d: Data, ex: Exercise): number | null { const h = liftHist(d, ex.id); return h.length ? h[h.length - 1].kg : ex.start ?? null; }
export function liftStart(d: Data, ex: Exercise): number | null { const h = liftHist(d, ex.id); return ex.start ?? (h.length ? h[0].kg : null); }
export function findEx(id: string): Exercise | null {
  for (const s of ORDER) { const e = PROGRAM[s].ex.find(x => x.id === id); if (e) return e; }
  return null;
}
export function uniqueExercises(): Exercise[] {
  const seen = new Set<string>(); const out: Exercise[] = [];
  for (const s of ORDER) for (const e of PROGRAM[s].ex) if (!seen.has(e.id)) { seen.add(e.id); out.push(e); }
  return out;
}
export const todaysSession = (): SessionId | null => PLAN_DAY[weekday(todayKey())] || null;
export function nextSession(): { s: SessionId; inDays: number } {
  for (let i = 0; i < 8; i++) { const s = PLAN_DAY[weekday(addDays(todayKey(), i))]; if (s) return { s, inDays: i }; }
  return { s: 'UA', inDays: 0 };
}
export function easing(d: Data) {
  const end = addDays(d.settings.programStart, EASE_DAYS);
  return { on: dayNum(todayKey()) < dayNum(end), end };
}
