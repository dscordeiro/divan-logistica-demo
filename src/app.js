import path from 'node:path';
import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import fstatic from '@fastify/static';
import formbody from '@fastify/formbody';
import rateLimit from '@fastify/rate-limit';
import { config, ROOT } from './config.js';
import publicRoutes from './public-routes.js';
import adminRoutes from './admin-routes.js';

export async function buildApp({ logger = true } = {}) {
  const app = Fastify({
    logger: logger ? { level: 'warn' } : false,
    trustProxy: config.trustProxy,
    bodyLimit: 64 * 1024,
  });

  app.addContentTypeParser('text/plain', { parseAs: 'string', bodyLimit: 8 * 1024 }, (req, body, done) => done(null, body));
  await app.register(cookie);
  await app.register(formbody);
  await app.register(rateLimit, { global: false });

  // Cabeçalhos de segurança
  app.addHook('onSend', async (req, reply, payload) => {
    reply.header('x-content-type-options', 'nosniff');
    reply.header('x-frame-options', 'DENY');
    reply.header('referrer-policy', reply.getHeader('referrer-policy') || 'strict-origin-when-cross-origin');
    reply.header('permissions-policy', 'camera=(), microphone=(), geolocation=()');
    reply.header('content-security-policy',
      "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
    if (config.isProd) reply.header('strict-transport-security', 'max-age=31536000; includeSubDomains');
    return payload;
  });

  await app.register(fstatic, { root: path.join(ROOT, 'public'), prefix: '/static/', maxAge: '7d' });
  await app.register(fstatic, { root: path.join(ROOT, 'admin'), prefix: '/admin/static/', decorateReply: false, maxAge: 0 });
  await app.register(fstatic, { root: path.join(ROOT, 'node_modules', 'chart.js', 'dist'), prefix: '/admin/vendor/', decorateReply: false, allowedPath: (p) => p === '/chart.umd.min.js' });

  await app.register(publicRoutes);
  await app.register(adminRoutes);

  app.setNotFoundHandler((req, reply) => {
    if (req.url.startsWith('/admin/api')) return reply.code(404).send({ error: 'Não encontrado' });
    return reply.redirect('/', 302);
  });
  app.setErrorHandler((err, req, reply) => {
    if (err.statusCode === 429) return reply.code(429).send({ error: 'Muitas tentativas. Aguarde um pouco.' });
    req.log.error(err);
    const code = err.statusCode && err.statusCode < 500 ? err.statusCode : 500;
    return reply.code(code).send({ error: code === 500 ? 'Erro interno' : err.message });
  });
  return app;
}
