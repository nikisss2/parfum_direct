import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(fileURLToPath(import.meta.url));

function run(cmd: string, args: string[]) {
  const child = spawn(cmd, args, {
    cwd: path.join(root, '..'),
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  return child;
}

const api = run('npx', ['tsx', 'watch', 'server/index.ts']);
const web = run('npx', ['vite', '--port=3000', '--host=0.0.0.0']);

function shutdown() {
  api.kill('SIGTERM');
  web.kill('SIGTERM');
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

api.on('exit', code => {
  if (code !== 0 && code !== null) shutdown();
});
web.on('exit', code => {
  if (code !== 0 && code !== null) shutdown();
});
