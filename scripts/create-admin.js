// Cria ou redefine um administrador pela linha de comando (útil se perder o acesso).
// Uso: npm run create-admin -- email@dominio.com "Nome" [senha]
import crypto from 'node:crypto';
import { initDb, db } from '../src/db.js';
import { hashPassword, passwordProblem } from '../src/auth.js';
const [email, name = 'Administrador', given] = process.argv.slice(2);
if (!email) { console.log('Uso: npm run create-admin -- email@dominio.com "Nome" [senha]'); process.exit(1); }
const pass = given || crypto.randomBytes(9).toString('base64url') + '7a';
const prob = passwordProblem(pass); if (prob) { console.log(prob); process.exit(1); }
await initDb();
await db.query(`INSERT INTO users(name,email,password_hash,role) VALUES($1,$2,$3,'admin')
  ON CONFLICT(email) DO UPDATE SET password_hash=EXCLUDED.password_hash, role='admin', status='active', failed_attempts=0, locked_until=NULL, totp_enabled=false, totp_secret_enc=NULL`,
  [name, email.toLowerCase(), await hashPassword(pass)]);
await db.query("INSERT INTO audit_log(user_email,action,entity) VALUES($1,'admin_criado_pelo_terminal','usuario')", [email.toLowerCase()]);
console.log(`Administrador pronto → e-mail: ${email}  senha: ${pass}\n(2FA redefinido; será pedido de novo se REQUIRE_2FA=true)`);
await db.close();
