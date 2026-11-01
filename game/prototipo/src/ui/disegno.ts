// Attrezzi di disegno con PixiJS usati dalla scena e dalle carte (nessuna regola qui).
import { Container, Graphics, Sprite, Text, Texture } from 'pixi.js';
import { texturaDi } from './immagini.js';
import { FONT_TESTO, FONT_TITOLI } from './tipografia.js';

export interface Area {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const COL = {
  sfondo: 0x0d1015, pannello: 0x171c26, bordo: 0x2c3444, testo: 0xe8e6e0, tenue: 0x9aa3b2, oro: 0xe0b44c, rosso: 0xd9534f,
  custodi: 0x3f78b5, custodiScuro: 0x172c45, risvegliati: 0x5a9a65, risvegliatiScuro: 0x25361f, riserva: 0xb89a4a, riservaScuro: 0x3a3320,
  selezione: 0xffe27a, valido: 0x6ee7a1, pericolo: 0xff6b5a,
  // plancia
  inciso: 0xf3e3b6, oroChiaro: 0xe6c46a, oroScuro: 0xa8823c, lui: 0x8fdca4, tu: 0x9cc4f5, carta: 0xf2ead6, pillola: 0x1a140c,
};

export function colori(id: string): { chiaro: number; scuro: number } {
  if (id.startsWith('CU')) return { chiaro: COL.custodi, scuro: COL.custodiScuro };
  if (id.startsWith('RI')) return { chiaro: COL.risvegliati, scuro: COL.risvegliatiScuro };
  return { chiaro: COL.riserva, scuro: COL.riservaScuro };
}

/** Dispositivo con il solo tocco (niente passaggio del mouse) o evento di tocco. */
export function soloTocco(tipoPuntatore: string): boolean {
  return tipoPuntatore === 'touch' || tipoPuntatore === 'pen' || (typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches);
}

const gradienti = new Map<string, Texture>();
/** Texture con sfumatura lineare diagonale (dall'alto a sinistra al basso a destra) o verticale: serve a riempire cornici e barre. */
export function texturaGradiente(stops: Array<[number, string]>, verticale = false): Texture {
  const chiave = (verticale ? 'v' : 'd') + stops.map((s) => s.join('@')).join('|');
  let t = gradienti.get(chiave);
  if (t) return t;
  const cv = document.createElement('canvas');
  cv.width = 64;
  cv.height = 64;
  const ctx = cv.getContext('2d')!;
  const g = verticale ? ctx.createLinearGradient(0, 0, 0, 64) : ctx.createLinearGradient(0, 0, 64, 64);
  for (const [o, c] of stops) g.addColorStop(o, c);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  t = Texture.from(cv);
  gradienti.set(chiave, t);
  return t;
}

export interface OpzTesto {
  bold?: boolean;
  w?: number;
  align?: 'left' | 'center' | 'right';
  anchorX?: number;
  anchorY?: number;
  lh?: number;
  /** Cinzel (titoli e numeri) invece di Crimson Text. */
  titoli?: boolean;
  corsivo?: boolean;
  peso?: string;
  ls?: number;
  alpha?: number;
}

export interface OpzRett {
  stroke?: number;
  sw?: number;
  r?: number;
  alpha?: number;
  id?: string;
  tap?: () => void;
  over?: () => void;
  out?: () => void;
  tex?: Texture;
  strokeAlpha?: number;
}

export class Disegno {
  aree: Record<string, Area> = {};
  constructor(readonly s: Container, readonly u: number) {}

  /** Un altro disegno che scrive dentro un contenitore (coordinate locali) ma condivide scala e registro delle aree. */
  dentro(contenitore: Container): Disegno {
    const n = new Disegno(contenitore, this.u);
    n.aree = this.aree;
    return n;
  }

  /** Un disegno che taglia tutto cio' che esce dal rettangolo (coordinate assolute, come il disegno principale). */
  clip(x: number, y: number, w: number, h: number): Disegno {
    const c = new Container();
    const m = new Graphics();
    m.rect(x, y, w, h).fill(0xffffff);
    this.s.addChild(m);
    c.mask = m;
    this.s.addChild(c);
    return this.dentro(c);
  }

  /** Immagine di una carta dentro il riquadro (x,y,w,h); se manca, non disegna nulla e ritorna false. */
  immagine(idImg: string, x: number, y: number, w: number, h: number, alpha = 1, raggio = 4): boolean {
    const t = texturaDi(idImg);
    if (!t) return false;
    return this.texturaIn(t, x, y, w, h, alpha, raggio);
  }

  texturaIn(t: Texture, x: number, y: number, w: number, h: number, alpha = 1, raggio = 4): boolean {
    const sp = new Sprite(t);
    // riempie il riquadro mantenendo le proporzioni (taglia l'eccesso)
    const k = Math.max(w / t.width, h / t.height);
    sp.scale.set(k);
    sp.alpha = alpha;
    const mask = new Graphics();
    mask.roundRect(x, y, w, h, raggio * this.u).fill(0xffffff);
    sp.x = x + (w - t.width * k) / 2;
    sp.y = y + (h - t.height * k) / 2;
    sp.mask = mask;
    this.s.addChild(mask);
    this.s.addChild(sp);
    return true;
  }

  rett(x: number, y: number, w: number, h: number, fill: number, opz: OpzRett = {}): Graphics {
    const g = new Graphics();
    const r = opz.r ?? 6 * this.u;
    g.roundRect(x, y, w, h, r);
    if (opz.tex) {
      // sfumatura: sprite stirato sul riquadro e tagliato con gli angoli arrotondati (il riempimento con texture si ripeterebbe a mattonelle)
      const sp = new Sprite(opz.tex);
      sp.x = x;
      sp.y = y;
      sp.width = w;
      sp.height = h;
      sp.alpha = opz.alpha ?? 1;
      const mk = new Graphics();
      mk.roundRect(x, y, w, h, r).fill(0xffffff);
      sp.mask = mk;
      this.s.addChild(mk, sp);
      g.fill({ color: 0xffffff, alpha: 0.001 });
    } else g.fill({ color: fill, alpha: opz.alpha ?? 1 });
    if (opz.stroke !== undefined) g.stroke({ width: (opz.sw ?? 1.5) * Math.max(1, this.u * 0.8), color: opz.stroke, alpha: opz.strokeAlpha ?? 1 });
    if (opz.tap || opz.over) {
      if (opz.over) g.label = 'zoomable';
      g.eventMode = 'static';
      g.cursor = 'pointer';
      if (opz.tap) g.on('pointertap', opz.tap);
      // L'anteprima al passaggio e' solo per il mouse: sul telefono il tocco farebbe aprire l'anteprima (che resterebbe sopra il campo
      // e intercetterebbe i tocchi) e il ridisegno farebbe perdere il tocco stesso. La scheda si apre solo con la lente o toccando.
      if (opz.over) g.on('pointerover', (e) => { if (!soloTocco(e.pointerType)) opz.over!(); });
      if (opz.out) g.on('pointerout', (e) => { if (!soloTocco(e.pointerType)) opz.out!(); });
    }
    if (opz.id) this.aree[opz.id] = { x, y, w, h };
    this.s.addChild(g);
    return g;
  }

  cerchio(cx: number, cy: number, r: number, fill: number, opz: { stroke?: number; sw?: number; alpha?: number } = {}): Graphics {
    const g = new Graphics();
    g.circle(cx, cy, r).fill({ color: fill, alpha: opz.alpha ?? 1 });
    if (opz.stroke !== undefined) g.stroke({ width: (opz.sw ?? 1.5) * Math.max(1, this.u * 0.8), color: opz.stroke });
    this.s.addChild(g);
    return g;
  }

  /** Alone sfumato attorno a un rettangolo (bordi morbidi: tanti contorni sempre piu' trasparenti). */
  alone(x: number, y: number, w: number, h: number, colore: number, intensita = 0.5, spessore = 16, r = 8): Graphics {
    const g = new Graphics();
    const passi = 8;
    for (let i = 0; i < passi; i++) {
      const k = i / (passi - 1);
      const sp = spessore * this.u * (1 - k) + 1;
      g.roundRect(x - sp / 2 + 0, y - sp / 2, w + sp, h + sp, r * this.u + sp / 2).stroke({ width: Math.max(1.5, spessore * this.u / passi * 1.6), color: colore, alpha: intensita * (0.12 + 0.88 * k) / passi * 2.4 });
    }
    this.s.addChild(g);
    return g;
  }

  testo(t: string, x: number, y: number, size: number, fill = COL.testo, opz: OpzTesto = {}): Text {
    const tx = new Text({
      text: t,
      style: {
        fontFamily: opz.titoli ? FONT_TITOLI : FONT_TESTO, fontSize: Math.round(size * this.u), fill,
        fontWeight: (opz.peso ?? (opz.bold ? '700' : '400')) as '400', fontStyle: opz.corsivo ? 'italic' : 'normal',
        wordWrap: opz.w !== undefined, wordWrapWidth: opz.w !== undefined ? opz.w : 0, align: opz.align ?? 'left',
        lineHeight: opz.lh ? Math.round(opz.lh * this.u) : undefined, letterSpacing: opz.ls ? opz.ls * this.u : 0,
      },
      resolution: Math.max(2, window.devicePixelRatio || 1),
    });
    tx.x = x;
    tx.y = y;
    if (opz.alpha !== undefined) tx.alpha = opz.alpha;
    if (opz.anchorX !== undefined || opz.anchorY !== undefined) tx.anchor.set(opz.anchorX ?? 0, opz.anchorY ?? 0);
    this.s.addChild(tx);
    return tx;
  }

  /** Larghezza di un testo (senza disegnarlo). */
  larghezza(t: string, size: number, opz: OpzTesto = {}): number {
    const tx = this.testo(t, 0, 0, size, 0xffffff, opz);
    const w = tx.width;
    this.s.removeChild(tx);
    tx.destroy();
    return w;
  }

  altezza(t: string, size: number, w: number, opz: OpzTesto = {}): number {
    const tx = this.testo(t, 0, 0, size, 0xffffff, { ...opz, w });
    const h = tx.height;
    this.s.removeChild(tx);
    tx.destroy();
    return h;
  }

  /** Testo che si rimpicciolisce (fino a min) finche' sta nel riquadro; oltre il minimo viene tagliato con «…» (una riga) o clippato. */
  adatta(t: string, x: number, y: number, w: number, h: number, max: number, min: number, fill = COL.testo, bold = false, align: 'left' | 'center' = 'center', opz: OpzTesto = {}): Text {
    let size = max;
    let tx = this.testo(t, x, y, size, fill, { ...opz, w, bold, align });
    while ((tx.height > h * 1.0 || tx.width > w + 1) && size > min) {
      size -= 0.5;
      this.s.removeChild(tx);
      tx.destroy();
      tx = this.testo(t, x, y, size, fill, { ...opz, w, bold, align });
    }
    if (tx.height > h * 1.0 + 1) {
      // oltre il minimo: taglia le parole in eccesso
      let parole = t.split(' ');
      while (parole.length > 1 && tx.height > h * 1.0 + 1) {
        parole = parole.slice(0, -1);
        this.s.removeChild(tx);
        tx.destroy();
        tx = this.testo(parole.join(' ') + '…', x, y, size, fill, { ...opz, w, bold, align });
      }
    }
    if (align === 'center') tx.x = x + (w - tx.width) / 2;
    return tx;
  }

  /** Testo su una riga che si accorcia con «…» finche' sta nella larghezza. */
  riga(t: string, x: number, y: number, w: number, size: number, fill = COL.testo, opz: OpzTesto = {}): Text {
    let s = t;
    let tx = this.testo(s, x, y, size, fill, opz);
    while (tx.width > w && s.length > 1) {
      s = s.slice(0, -1);
      this.s.removeChild(tx);
      tx.destroy();
      tx = this.testo(s.trimEnd() + '…', x, y, size, fill, opz);
    }
    return tx;
  }

  /** Bottone semplice (riquadro con etichetta). */
  bottone(id: string, etichetta: string, x: number, y: number, w: number, h: number, abilitato: boolean, tap: () => void, colore = 0x2d3b55, size = 13): void {
    this.rett(x, y, w, h, abilitato ? colore : 0x1a1e27, {
      stroke: abilitato ? 0x8aa0c8 : 0x2c3444, id, tap: abilitato ? tap : undefined,
    });
    this.adatta(etichetta, x + 3 * this.u, y + 2 * this.u, w - 6 * this.u, h - 4 * this.u, size, 10, abilitato ? 0xffffff : 0x667085, true, 'center', { titoli: true });
    // centro verticale
    const last = this.s.children[this.s.children.length - 1] as Text;
    last.y = y + (h - last.height) / 2;
  }

  /** Pillola dorata (azioni possibili sulla plancia). Ritorna la larghezza. */
  pillolaOro(id: string, etichetta: string, x: number, y: number, h: number, tap: () => void, size = 10.5, abilitata = true): number {
    const w = this.larghezza(etichetta, size, { titoli: true, bold: true, ls: 0.5 }) + 26 * this.u;
    if (abilitata) this.alone(x, y, w, h, COL.oroChiaro, 0.6, 12, h / (2 * this.u));
    this.rett(x, y, w, h, 0, {
      r: h / 2, tex: abilitata ? texturaGradiente([[0, '#e6c46a'], [1, '#a47c26']], true) : texturaGradiente([[0, '#3a3428'], [1, '#221e16']], true),
      stroke: abilitata ? 0xffe29a : 0x4a4332, sw: 1, id, tap: abilitata ? tap : undefined,
    });
    const t = this.testo(etichetta, x + w / 2, y + h / 2, size, abilitata ? COL.pillola : 0x7a7260, { titoli: true, bold: true, ls: 0.5, anchorX: 0.5, anchorY: 0.5 });
    t.y = y + h / 2;
    return w;
  }
}
