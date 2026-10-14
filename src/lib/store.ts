// App state: one JSON document kept in localStorage and synced to GitHub.
import { useSyncExternalStore } from 'react';
import { DEFAULT_TARGETS, PROGRAM_START } from '../data/plan';
import { checkToken, pull, push, SyncError } from './github';
import type { Data, Day } from './types';

const DATA_KEY = 'lb-data-v1';
const TOKEN_KEY = 'lb-token';

export function emptyData(): Data {
  return {
    v: 1,
    settings: { targets: { ...DEFAULT_TARGETS }, history: [{ date: '2026-10-10', ...DEFAULT_TARGETS, note: 'Starting targets' }], foods: {}, programStart: PROGRAM_START, u: 0 },
    days: {},
    lifts: {},
    grocery: { checked: {}, u: 0 },
  };
}
function load(): Data {
  try {
    const raw = localStorage.getItem(DATA_KEY);
    if (raw) { const d = JSON.parse(raw); if (d && d.v === 1) return { ...emptyData(), ...d }; }
  } catch { /* fall through */ }
  return emptyData();
}

let data: Data = load();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(l => l());
const persist = () => { try { localStorage.setItem(DATA_KEY, JSON.stringify(data)); } catch { /* storage full or blocked */ } };

export function useData(): Data {
  return useSyncExternalStore(fn => { listeners.add(fn); return () => listeners.delete(fn); }, () => data);
}
export const getData = () => data;

/** Apply a change. `mut` edits a copy; call `touch` on every record you change. */
export function update(mut: (d: Data, now: number) => void) {
  const next: Data = structuredClone(data);
  mut(next, Date.now());
  data = next;
  persist();
  emit();
  scheduleSync(1500);
}
export function updateDay(key: string, fn: (day: Day) => void) {
  update((d, now) => {
    const day: Day = d.days[key] ? d.days[key] : { entries: [], u: 0 };
    fn(day);
    day.u = now;
    d.days[key] = day;
  });
}

/* ---------- merge: newest record wins ---------- */
type Stamped = { u: number };
const newer = <T extends Stamped>(a: T | undefined, b: T | undefined): T | undefined => (!a ? b : !b ? a : (b.u || 0) > (a.u || 0) ? b : a);
export function merge(a: Data, b: Data): Data {
  const out: Data = { v: 1, settings: newer(a.settings, b.settings)!, grocery: newer(a.grocery, b.grocery)!, days: {}, lifts: {} };
  for (const k of new Set([...Object.keys(a.days), ...Object.keys(b.days)])) out.days[k] = newer(a.days[k], b.days[k])!;
  for (const k of new Set([...Object.keys(a.lifts), ...Object.keys(b.lifts)])) out.lifts[k] = newer(a.lifts[k], b.lifts[k])!;
  return out;
}
function stable(v: unknown): string {
  if (Array.isArray(v)) return '[' + v.map(stable).join(',') + ']';
  if (v && typeof v === 'object') return '{' + Object.keys(v as object).sort().map(k => JSON.stringify(k) + ':' + stable((v as Record<string, unknown>)[k])).join(',') + '}';
  return JSON.stringify(v);
}

/* ---------- sync ---------- */
export type SyncStatus = { state: 'off' | 'syncing' | 'ok' | 'offline' | 'error'; last: number | null; message: string };
let sync: SyncStatus = { state: getToken() ? 'ok' : 'off', last: Number(localStorage.getItem('lb-last-sync')) || null, message: '' };
const syncListeners = new Set<() => void>();
const setSync = (s: Partial<SyncStatus>) => { sync = { ...sync, ...s }; syncListeners.forEach(l => l()); };
export function useSync(): SyncStatus {
  return useSyncExternalStore(fn => { syncListeners.add(fn); return () => syncListeners.delete(fn); }, () => sync);
}

export function getToken(): string | null { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } }
export async function connect(token: string) {
  await checkToken(token);
  localStorage.setItem(TOKEN_KEY, token);
  setSync({ state: 'syncing', message: '' });
  await runSync();
}
export function disconnect() {
  localStorage.removeItem(TOKEN_KEY);
  setSync({ state: 'off', message: '' });
}

let timer = 0;
let running = false;
let again = false;
export function scheduleSync(ms = 0) {
  if (!getToken()) return;
  clearTimeout(timer);
  timer = window.setTimeout(runSync, ms);
}
export async function runSync(attempt = 0): Promise<void> {
  const token = getToken();
  if (!token) return;
  if (running) { again = true; return; }
  running = true;
  setSync({ state: 'syncing' });
  try {
    const remote = await pull(token);
    const merged = remote.data ? merge(data, remote.data) : data;
    if (stable(merged) !== stable(data)) { data = merged; persist(); emit(); }
    if (!remote.data || stable(merged) !== stable(remote.data)) await push(token, merged, remote.sha);
    const now = Date.now();
    localStorage.setItem('lb-last-sync', String(now));
    setSync({ state: 'ok', last: now, message: '' });
  } catch (e) {
    const err = e instanceof SyncError ? e : new SyncError(String(e), 'other');
    if (err.code === 'conflict' && attempt < 2) { running = false; return runSync(attempt + 1); }
    setSync({ state: err.code === 'network' ? 'offline' : 'error', message: err.message });
  } finally {
    running = false;
    if (again) { again = false; scheduleSync(300); }
  }
}

// Pull fresh data whenever the app comes back to the screen or the connection returns.
if (typeof window !== 'undefined') {
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') scheduleSync(0); });
  window.addEventListener('online', () => scheduleSync(0));
  try { (navigator.storage as StorageManager | undefined)?.persist?.(); } catch { /* not supported */ }
}
