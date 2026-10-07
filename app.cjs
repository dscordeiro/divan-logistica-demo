// Ponto de entrada para hospedagens cPanel (Phusion Passenger), que exigem CommonJS.
import('./server.js').catch((e) => { console.error(e); process.exit(1); });
