// Configurazione della plancia: tutte le posizioni, i territori attivi e le scene stanno qui, come dati.
// Passare da 3 a 5 territori in gioco = cambiare `territorioId` (e le scene) in questo file, non il codice della scena.
// Le coordinate sono frazioni dell'immagine di sfondo (1600x736), che si mostra a tutto schermo (cover).

export const IMG_W = 1600;
export const IMG_H = 736;

export interface Rett01 {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface LuceFissa {
  /** Posizione, in frazioni dell'immagine. */
  x: number;
  y: number;
  /** Diametro dell'alone in frazioni della larghezza dell'immagine. */
  d: number;
  tipo: 'candela' | 'viola' | 'verde';
}

export interface Settore {
  id: 'innsmouth' | 'biblioteca' | 'dunwich' | 'landa' | 'rlyeh';
  nome: string;
  /** Id del territorio di gioco (dati carte); null = visibile sulla plancia ma non in gioco. */
  territorioId: string | null;
  /** Zona toccabile (frazioni dell'immagine). Per R'lyeh e' il riquadro che contiene l'ellisse del pozzo. */
  zona: Rett01;
  ellisse?: boolean;
  /** Lato su cui sta la targhetta, nell'angolo alto del suo quadro. */
  lato: 'sx' | 'dx';
  /** Candele, lanterne e bagliori che si animano nella scena 3D (frazioni dell'immagine della scena). */
  luci?: LuceFissa[];
  /** Nome del file della scena 3D (senza estensione) nella cartella delle scene. */
  scena: string;
  /** Colore del bordo della targhetta e del titolo della scena. */
  colore: number;
}

/** Candele e bagliori della plancia (frazioni dell'immagine pozzo_v3). Il pozzo di R'lyeh pulsa a parte (zona del settore). */
export const LUCI_PLANCIA: LuceFissa[] = [
  { x: 0.61, y: 0.136, d: 0.035, tipo: 'candela' },
  { x: 0.678, y: 0.197, d: 0.035, tipo: 'candela' },
  { x: 0.78, y: 0.272, d: 0.035, tipo: 'candela' },
  { x: 0.866, y: 0.387, d: 0.035, tipo: 'candela' },
  { x: 0.866, y: 0.6, d: 0.07, tipo: 'viola' },
];

export const SETTORI: Settore[] = [
  { id: 'innsmouth', nome: 'Innsmouth', territorioId: 'T1', zona: { x: 0.031, y: 0.054, w: 0.439, h: 0.424 }, lato: 'sx', scena: 'innsmouth_v1', luci: [{ x: 0.332, y: 0.619, d: 0.05, tipo: 'candela' }, { x: 0.766, y: 0.3, d: 0.06, tipo: 'candela' }], colore: 0xa8823c },
  { id: 'biblioteca', nome: 'La Biblioteca della Miskatonic', territorioId: 'T2', zona: { x: 0.5, y: 0.04, w: 0.45, h: 0.438 }, lato: 'dx', scena: 'biblioteca_v1', luci: [{ x: 0.28, y: 0.62, d: 0.045, tipo: 'candela' }, { x: 0.353, y: 0.665, d: 0.045, tipo: 'candela' }, { x: 0.43, y: 0.76, d: 0.045, tipo: 'candela' }, { x: 0.55, y: 0.9, d: 0.045, tipo: 'candela' }, { x: 0.69, y: 0.78, d: 0.045, tipo: 'candela' }, { x: 0.753, y: 0.83, d: 0.045, tipo: 'candela' }, { x: 0.287, y: 0.33, d: 0.04, tipo: 'candela' }, { x: 0.473, y: 0.233, d: 0.04, tipo: 'candela' }, { x: 0.678, y: 0.415, d: 0.04, tipo: 'candela' }], colore: 0xa8823c },
  { id: 'dunwich', nome: 'Dunwich', territorioId: null, zona: { x: 0.025, y: 0.489, w: 0.441, h: 0.489 }, lato: 'sx', scena: 'dunwich_v2', luci: [{ x: 0.94, y: 0.222, d: 0.06, tipo: 'candela' }], colore: 0xa8823c },
  { id: 'landa', nome: 'La Landa Maledetta', territorioId: 'T3', zona: { x: 0.503, y: 0.482, w: 0.469, h: 0.496 }, lato: 'dx', scena: 'landa_v1', luci: [{ x: 0.66, y: 0.54, d: 0.12, tipo: 'viola' }], colore: 0xa8823c },
  { id: 'rlyeh', nome: "R'lyeh", territorioId: null, zona: { x: 0.299, y: 0.264, w: 0.364, h: 0.455 }, ellisse: true, lato: 'sx', scena: 'rlyeh_v2', luci: [{ x: 0.93, y: 0.28, d: 0.06, tipo: 'candela' }, { x: 0.45, y: 0.62, d: 0.2, tipo: 'verde' }], colore: 0x6fe0a8 },
];

/** Posizione sullo schermo di un rettangolo dell'immagine, con lo sfondo a tutto schermo (cover). */
export function coverTrasformazione(W: number, H: number): { k: number; ox: number; oy: number } {
  const k = Math.max(W / IMG_W, H / IMG_H);
  return { k, ox: (W - IMG_W * k) / 2, oy: (H - IMG_H * k) / 2 };
}

export function inSchermo(r: Rett01, W: number, H: number): { x: number; y: number; w: number; h: number } {
  const { k, ox, oy } = coverTrasformazione(W, H);
  const x0 = Math.max(0, ox + r.x * IMG_W * k);
  const y0 = Math.max(0, oy + r.y * IMG_H * k);
  const x1 = Math.min(W, ox + (r.x + r.w) * IMG_W * k);
  const y1 = Math.min(H, oy + (r.y + r.h) * IMG_H * k);
  return { x: x0, y: y0, w: Math.max(0, x1 - x0), h: Math.max(0, y1 - y0) };
}

/** Il settore di un territorio di gioco (per id del territorio), se sulla plancia c'e'. */
export function settoreDelTerritorio(territorioId: string): Settore | undefined {
  return SETTORI.find((s) => s.territorioId === territorioId);
}
