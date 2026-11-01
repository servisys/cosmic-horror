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
  /** Nome del file della scena 3D (senza estensione) nella cartella delle scene. */
  scena: string;
  /** Colore del bordo della targhetta e del titolo della scena. */
  colore: number;
}

export const SETTORI: Settore[] = [
  { id: 'innsmouth', nome: 'Innsmouth', territorioId: 'T1', zona: { x: 0.031, y: 0.054, w: 0.439, h: 0.424 }, lato: 'sx', scena: 'innsmouth_v1', colore: 0xa8823c },
  { id: 'biblioteca', nome: 'La Biblioteca della Miskatonic', territorioId: 'T2', zona: { x: 0.5, y: 0.04, w: 0.45, h: 0.438 }, lato: 'dx', scena: 'biblioteca_v1', colore: 0xa8823c },
  { id: 'dunwich', nome: 'Dunwich', territorioId: null, zona: { x: 0.025, y: 0.489, w: 0.441, h: 0.489 }, lato: 'sx', scena: 'dunwich_v2', colore: 0xa8823c },
  { id: 'landa', nome: 'La Landa Maledetta', territorioId: 'T3', zona: { x: 0.503, y: 0.482, w: 0.469, h: 0.496 }, lato: 'dx', scena: 'landa_v1', colore: 0xa8823c },
  { id: 'rlyeh', nome: "R'lyeh", territorioId: null, zona: { x: 0.299, y: 0.264, w: 0.364, h: 0.455 }, ellisse: true, lato: 'sx', scena: 'rlyeh_v2', colore: 0x6fe0a8 },
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
