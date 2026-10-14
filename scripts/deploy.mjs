// Publishes dist/ to the gh-pages branch of this repo's origin (GitHub Pages serves it).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const remote = execSync('git remote get-url origin', { cwd: root }).toString().trim();
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lean-bulk-deploy-'));
fs.cpSync(dist, tmp, { recursive: true });
const run = cmd => execSync(cmd, { cwd: tmp, stdio: 'inherit' });
run('git init -q -b gh-pages');
run('git add -A');
run('git -c user.name="Lean Bulk deploy" -c user.email="deploy@localhost" commit -q -m "Deploy"');
run(`git push -q -f "${remote}" gh-pages`);
fs.rmSync(tmp, { recursive: true, force: true });
console.log('Deployed to gh-pages.');
