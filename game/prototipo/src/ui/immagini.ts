// Illustrazioni delle carte: file WebP in src/assets/illustrazioni/, nome = id della carta (le versioni cosmiche hanno id con "c").
import { Assets, Texture } from 'pixi.js';

const urls = import.meta.glob('../assets/illustrazioni/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const perId = new Map<string, string>();
for (const [percorso, url] of Object.entries(urls)) perId.set(percorso.split('/').pop()!.replace('.webp', ''), url);

const texture = new Map<string, Texture>();

// Sfondo della plancia (due misure: lato lungo 1920 e 1280). Si sceglie in base alla larghezza dello schermo in pixel reali.
const sfondi = import.meta.glob('../assets/plancia/pozzo_*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
let texturaPlancia: Texture | undefined;

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

export async function caricaSfondo(): Promise<void> {
  const pixel = Math.max(window.innerWidth, window.innerHeight) * Math.max(1, window.devicePixelRatio || 1);
  const scelta = pixel > 1500 ? 'pozzo_1920' : 'pozzo_1280';
  const url = Object.entries(sfondi).find(([p]) => p.includes(scelta))?.[1];
  if (!url) return;
  try {
    texturaPlancia = await Promise.race([Assets.load<Texture>(url), new Promise<undefined>((r) => setTimeout(() => r(undefined), 8000))]);
  } catch {
    // senza sfondo la scena usa il colore pieno
  }
}

// Scene 3D dei territori (dentro un territorio): due misure come lo sfondo, caricate in background dopo la partenza
const fileScene = import.meta.glob('../assets/scene/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const texScene = new Map<string, Texture>();
let suScenaCaricata: (() => void) | undefined;

export function alCaricarsiDiUnaScena(cb: () => void): void {
  suScenaCaricata = cb;
}

export async function caricaScene(nomi: string[]): Promise<void> {
  const pixel = Math.max(window.innerWidth, window.innerHeight) * Math.max(1, window.devicePixelRatio || 1);
  const misura = pixel > 1500 ? '1920' : '1280';
  for (const nome of nomi) {
    const url = Object.entries(fileScene).find(([p]) => p.includes(`/${nome}_${misura}.webp`))?.[1];
    if (!url) continue;
    try {
      texScene.set(nome, await Assets.load<Texture>(url));
      suScenaCaricata?.();
    } catch {
      // senza la scena resta lo sfondo scuro
    }
  }
}

export function texturaScena(nome: string): Texture | undefined {
  return texScene.get(nome);
}

export function texturaSfondo(): Texture | undefined {
  return texturaPlancia;
}

export function texturaDi(id: string): Texture | undefined {
  return texture.get(id);
}

/** Quante texture sono state caricate (serve ai test automatici). */
export function numeroTexture(): number {
  return texture.size;
}
