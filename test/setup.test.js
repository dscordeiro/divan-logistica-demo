// Primeiro acesso: sem ADMIN_PASSWORD, o admin cria a própria senha uma única vez
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import fs from 'node:fs';
import path from 'node:path';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'divan-setup-'));
process.env.DATA_DIR = tmp;
process.env.ADMIN_EMAIL = 'dono@teste.com';
delete process.env.ADMIN_PASSWORD;
process.env.REQUIRE_2FA = 'true';

const { initDb, db } = await import('../src/db.js');
const { seed } = await import('../src/seed.js');
const { buildApp } = await import('../src/app.js');
let app;
before(async () => { await initDb({ memory: true }); await seed(); app = await buildApp({ logger: false }); });
after(async () => { await app.close(); await db.close(); fs.rmSync(tmp, { recursive: true, force: true }); });
const H = { 'x-dv': '1', 'content-type': 'application/json' };

test('primeiro acesso cria a senha uma vez, exige 2FA e depois fecha', async () => {
  const me = (await app.inject({ url: '/admin/api/me' })).json();
  assert.equal(me.setup.email, 'dono@teste.com');
  assert.ok(fs.existsSync(path.join(tmp, 'PRIMEIRO-ACESSO.txt')));
  const fraca = await app.inject({ method: 'POST', url: '/admin/api/setup', headers: H, payload: { password: '123' } });
  assert.equal(fraca.statusCode, 400);
  const ok = await app.inject({ method: 'POST', url: '/admin/api/setup', headers: H, payload: { password: 'MinhaSenha2026' } });
  assert.equal(ok.json().stage, 'setup_2fa');
  assert.ok(!fs.existsSync(path.join(tmp, 'PRIMEIRO-ACESSO.txt')), 'arquivo com senha temporária removido');
  const de_novo = await app.inject({ method: 'POST', url: '/admin/api/setup', headers: H, payload: { password: 'OutraSenha2026' } });
  assert.equal(de_novo.statusCode, 403);
  assert.equal((await app.inject({ url: '/admin/api/me' })).json().setup, null);
  const login = await app.inject({ method: 'POST', url: '/admin/api/login', headers: H, payload: { email: 'dono@teste.com', password: 'MinhaSenha2026' } });
  assert.equal(login.json().stage, 'setup_2fa');
});
