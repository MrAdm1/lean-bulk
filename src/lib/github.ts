// Reads and writes data.json in a private GitHub repo, so the app syncs and Claude can read it.
import type { Data } from './types';

export const OWNER = 'MrAdm1';
export const REPO = 'lean-bulk-data';
const PATH = 'data.json';
const API = `https://api.github.com/repos/${OWNER}/${REPO}`;

export class SyncError extends Error {
  code: 'auth' | 'conflict' | 'network' | 'other';
  constructor(message: string, code: SyncError['code']) { super(message); this.code = code; }
}

const headers = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
});

function toB64(s: string) {
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}
function fromB64(b: string) {
  const bin = atob(b.replace(/\s/g, ''));
  return new TextDecoder().decode(Uint8Array.from(bin, ch => ch.charCodeAt(0)));
}

async function call(token: string, url: string, init?: RequestInit) {
  let res: Response;
  try { res = await fetch(url, { ...init, cache: 'no-store', headers: { ...headers(token), ...(init?.headers || {}) } }); }
  catch { throw new SyncError('No internet connection', 'network'); }
  if (res.status === 401 || res.status === 403) throw new SyncError('GitHub refused the token. Check that it has Contents: Read and write for lean-bulk-data.', 'auth');
  if (res.status === 409 || res.status === 422) throw new SyncError('Someone else changed the data at the same time', 'conflict');
  return res;
}

export async function checkToken(token: string) {
  const res = await call(token, API);
  if (res.status === 404) throw new SyncError('The token can’t see the lean-bulk-data repo. Give it access to that repo.', 'auth');
  if (!res.ok) throw new SyncError(`GitHub error ${res.status}`, 'other');
}

export async function pull(token: string): Promise<{ data: Data | null; sha: string | null }> {
  const res = await call(token, `${API}/contents/${PATH}?t=${Date.now()}`);
  if (res.status === 404) return { data: null, sha: null };
  if (!res.ok) throw new SyncError(`GitHub error ${res.status}`, 'other');
  const body = await res.json();
  let data: Data | null = null;
  try { data = JSON.parse(fromB64(body.content)); } catch { throw new SyncError('data.json on GitHub isn’t valid JSON', 'other'); }
  if (!data || data.v !== 1 || !data.settings || !data.days) throw new SyncError('data.json on GitHub has an unexpected shape', 'other');
  return { data, sha: body.sha };
}

export async function push(token: string, data: Data, sha: string | null): Promise<string> {
  const res = await call(token, `${API}/contents/${PATH}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Sync from app', content: toB64(JSON.stringify(data, null, 1)), ...(sha ? { sha } : {}) }),
  });
  if (!res.ok) throw new SyncError(`GitHub error ${res.status}`, 'other');
  const body = await res.json();
  return body.content.sha;
}
