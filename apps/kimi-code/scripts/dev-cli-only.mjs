#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = resolve(SCRIPT_DIR, '..');

const cliArgs = process.argv.slice(2);
if (cliArgs[0] === '--') cliArgs.shift();

const child = spawn(
  process.execPath,
  [
    require.resolve('tsx/cli'),
    '--tsconfig',
    './tsconfig.dev.json',
    '--import',
    '../../build/register-raw-text-loader.mjs',
    './src/main.ts',
    ...cliArgs,
  ],
  {
    cwd: APP_ROOT,
    env: process.env,
    stdio: 'inherit',
  },
);

child.on('error', (error) => {
  console.error(`Failed to start Kimi Code dev CLI: ${error.message}`);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  if (signal !== null) {
    process.exit(1);
  }
  process.exit(code ?? 0);
});
