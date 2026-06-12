// Local-only contact API for `ng serve` (the Vercel function in /api/contact.ts
// runs in production). Reads RESEND_API_KEY from .env.local and serves
// POST /api/contact on http://localhost:3001 — the Angular dev proxy forwards
// /api there. Run via `npm run dev` (concurrently with ng serve).
import http from 'node:http';
import fs from 'node:fs';
import { Resend } from 'resend';

// Load .env.local without extra deps.
try {
  const txt = fs.readFileSync(new URL('./.env.local', import.meta.url), 'utf8');
  for (const line of txt.split('\n')) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch {
  /* no .env.local — handled below */
}

const PORT = 3001;
const TO = 'heinthiri2000@gmail.com';

const escapeHtml = (s = '') =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );

const send = (res, code, obj) => {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj));
};

const server = http.createServer((req, res) => {
  if (req.method !== 'POST' || req.url !== '/api/contact') {
    res.writeHead(404);
    res.end();
    return;
  }

  let body = '';
  req.on('data', (c) => (body += c));
  req.on('end', async () => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return send(res, 500, { error: 'Set RESEND_API_KEY in .env.local' });

    let data = {};
    try {
      data = JSON.parse(body || '{}');
    } catch {
      return send(res, 400, { error: 'Bad JSON' });
    }
    const name = String(data.name ?? '').trim();
    const email = String(data.email ?? '').trim();
    const message = String(data.message ?? '').trim();
    if (!name || !email || !message) return send(res, 400, { error: 'Please fill in all fields.' });

    try {
      const resend = new Resend(apiKey);
      const { error } = await resend.emails.send({
        from: 'Portfolio Contact <onboarding@resend.dev>',
        to: TO,
        replyTo: email,
        subject: `Portfolio enquiry from ${name}`,
        html: `<h2>New portfolio message</h2><p><strong>Name:</strong> ${escapeHtml(
          name,
        )}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p>${escapeHtml(message).replace(
          /\n/g,
          '<br>',
        )}</p>`,
      });
      if (error) return send(res, 502, { error: error.message });
      console.log(`✓ Sent contact message from ${name} <${email}>`);
      return send(res, 200, { ok: true });
    } catch (e) {
      console.error(e);
      return send(res, 500, { error: 'Failed to send.' });
    }
  });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`[contact-api] Port ${PORT} already in use — the API is already running; reusing it.`);
    process.exit(0);
  }
  throw err;
});

server.listen(PORT, () => console.log(`Local contact API → http://localhost:${PORT}/api/contact`));
