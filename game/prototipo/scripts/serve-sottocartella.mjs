// Server di prova: serve una cartella statica sotto /x/y/ (come una pagina ospite) e, se CSP=1, con worker-src 'none'.
// Uso: node scripts/serve-sottocartella.mjs <cartella> [porta]   (CSP=1 per l'intestazione Content-Security-Policy)
import http from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const RADICE = process.argv[2];
const PORTA = Number(process.argv[3] ?? 5190);
const PREFISSO = '/x/y/';
const TIPI = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.webp': 'image/webp', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2' };
http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  if (!u.startsWith(PREFISSO)) { res.writeHead(404); return res.end('fuori dalla sottocartella: ' + u); }
  let f = join(RADICE, u.slice(PREFISSO.length));
  if (u.endsWith('/')) f = join(f, 'index.html');
  if (!existsSync(f) || statSync(f).isDirectory()) { res.writeHead(404); return res.end('manca ' + u); }
  const intestazioni = { 'content-type': TIPI[extname(f)] ?? 'application/octet-stream' };
  if (process.env.CSP === '1') intestazioni['content-security-policy'] = "worker-src 'none'";
  res.writeHead(200, intestazioni);
  res.end(readFileSync(f));
}).listen(PORTA, '127.0.0.1');
