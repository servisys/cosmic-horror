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
  await Promise.all(
    [...perId.entries()].map(async ([id, url]) => {
      try {
        texture.set(id, await Assets.load<Texture>(url));
      } catch {
        // immagine mancante: la scena usa il riquadro con il nome
      }
    }),
  );
}

export function texturaDi(id: string): Texture | undefined {
  return texture.get(id);
}
