// Illustrazioni delle carte: file WebP in src/assets/illustrazioni/, nome = id della carta (le versioni cosmiche hanno id con "c").
import { Assets, Texture } from 'pixi.js';

const urls = import.meta.glob('../assets/illustrazioni/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const perId = new Map<string, string>();
for (const [percorso, url] of Object.entries(urls)) perId.set(percorso.split('/').pop()!.replace('.webp', ''), url);

const texture = new Map<string, Texture>();

/** Id dell'immagine di una carta: la versione cosmica ha la propria (id + "c"). */
export function idImmagine(id: string, trasformata: boolean): string {
  return trasformata ? `${id}c` : id;
}

export function idsImmagini(): string[] {
  return [...perId.keys()].sort();
}

export async function caricaImmagini(): Promise<void> {
  // PixiJS carica le texture con un web worker da un URL blob: una pagina ospite con una Content-Security-Policy che lo vieta
  // (worker-src) lo blocca e le immagini non arrivano mai. Senza worker le immagini si caricano dal thread principale.
  Assets.setPreferences({ preferWorkers: false });
  const tutte = Promise.all(
    [...perId.entries()].map(async ([id, url]) => {
      try {
        texture.set(id, await Assets.load<Texture>(url));
      } catch {
        // immagine mancante: la scena usa il riquadro con il nome
      }
    }),
  );
  // se per qualche motivo il caricamento si blocca, il gioco parte lo stesso (senza le immagini non arrivate)
  await Promise.race([tutte, new Promise<void>((r) => setTimeout(r, 10000))]);
}

export function texturaDi(id: string): Texture | undefined {
  return texture.get(id);
}

/** Quante texture sono state caricate (serve ai test automatici). */
export function numeroTexture(): number {
  return texture.size;
}
