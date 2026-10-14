export const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DOW_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const pad = (n: number) => String(n).padStart(2, '0');
export const keyOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayKey = () => keyOf(new Date());
export const dayNum = (k: string) => { const [y, m, d] = k.split('-').map(Number); return Math.round(Date.UTC(y, m - 1, d) / 86400000); };
export const keyFromNum = (n: number) => { const d = new Date(n * 86400000); return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`; };
export const addDays = (k: string, n: number) => keyFromNum(dayNum(k) + n);
const utc = (k: string) => new Date(dayNum(k) * 86400000);
export const weekday = (k: string) => utc(k).getUTCDay();
export const fmtDate = (k: string) => { const d = utc(k); return `${DOW[d.getUTCDay()]} ${d.getUTCDate()} ${MON[d.getUTCMonth()]}`; };
export const fmtShort = (k: string) => { const d = utc(k); return `${d.getUTCDate()} ${MON[d.getUTCMonth()]}`; };

export const fmt = (n: number | null | undefined, d = 0) =>
  n == null || !isFinite(n) ? '–' : Number(n).toLocaleString('en-GB', { minimumFractionDigits: d, maximumFractionDigits: d }).replace('-', '−');
export const signed = (n: number | null | undefined, d = 1) => (n == null || !isFinite(n) ? '–' : (n > 0 ? '+' : '') + fmt(n, d));
export const kg = (n: number | null | undefined) => (n == null || !isFinite(n) ? '–' : String(Math.round(n * 100) / 100));

export const parseNum = (v: unknown): number | null => {
  if (v == null) return null;
  const s = String(v).trim().replace(',', '.');
  if (!s) return null;
  const n = Number(s);
  return isFinite(n) ? n : null;
};
export const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
export const avg = (a: number[]) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : null);
export const r1 = (n: number) => Math.round(n * 10) / 10;
export const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
export const ago = (ms: number) => {
  const s = Math.round((Date.now() - ms) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return `${Math.round(s / 86400)} days ago`;
};
