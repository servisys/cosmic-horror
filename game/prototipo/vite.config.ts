import { execSync } from 'node:child_process';
import { defineConfig } from 'vite';
import { serviceWorkerPlugin } from './vite-plugin-sw';

/**
 * Versione che si mostra nel menu del gioco, cosi' si vede cosa e' online: l'etichetta (tag v* se il commit ne ha uno, altrimenti «main»),
 * il commit e la data. Arriva dalla variabile CT_VERSIONE (la imposta lo script «pubblica») o, in sviluppo, da git.
 */
function versione(): string {
  if (process.env.CT_VERSIONE) return process.env.CT_VERSIONE;
  const git = (a: string): string => execSync(`git ${a}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  try {
    const commit = git('rev-parse --short=7 HEAD');
    const data = git('log -1 --format=%cs');
    let tag = '';
    try { tag = git('describe --tags --exact-match --match "v*"'); } catch { /* il commit non ha un tag v* */ }
    const modificato = git('status --porcelain --untracked-files=no') ? '+modifiche' : '';
    return `${tag || 'main'} · ${commit}${modificato} · ${data}`;
  } catch {
    return 'versione sconosciuta';
  }
}

// Build statica (cartella dist) per la pubblicazione della tappa 5. I dati arrivano da docs/03-cards-content/ in fase di build.
// Il gioco e' installabile (manifest e service worker in public/ e vite-plugin-sw.ts) e funziona anche senza rete.
export default defineConfig({
  base: './',
  plugins: [serviceWorkerPlugin()],
  define: { __CT_VERSIONE__: JSON.stringify(versione()) },
  server: { fs: { allow: ['../..'] }, port: 5183, strictPort: true },
  preview: { port: 5184, strictPort: true },
  build: { outDir: 'dist', emptyOutDir: true, target: 'es2022', chunkSizeWarningLimit: 1500 },
});
