// Animazioni (150-450 ms) della plancia e delle scene: carta che vola dalla mano al quadro, rimbalzo della selezione, «pop» dei numeri,
// lampo del Sigillo/rito, evento cosmico, scritta del turno, carte del computer dall'alto, pulsare della luce del pozzo e candele che tremolano,
// ingresso e uscita dai territori. La scena si ricostruisce a ogni cambiamento: le animazioni vivono in un livello a parte (fx) e negli oggetti
// che la scena registra qui a ogni disegno; il tempo e' globale, quindi un ridisegno non le interrompe.
// Con «riduci animazioni» attivo nel sistema (prefers-reduced-motion) o con ?animazioni=0 non parte nulla: tutto e' immediato e le luci stanno ferme.
import { Container, Graphics, Rectangle, Sprite, Text, Texture, type Application } from 'pixi.js';
import { FONT_TITOLI } from './tipografia.js';
import { idImmagine, texturaDi } from './immagini.js';
import type { Area } from './disegno.js';

const ora = (): number => performance.now();
const clamp01 = (x: number): number => Math.max(0, Math.min(1, x));
const uscita = (p: number): number => 1 - Math.pow(1 - p, 3);
const entrata = (p: number): number => p * p * p;
const sovra = (p: number): number => {
  const c1 = 1.4;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
};

interface Tween {
  t0: number;
  dur: number;
  passo: (p: number) => void;
  fine?: () => void;
  bloccante: boolean;
}

interface Luce {
  o: Sprite | Graphics | Container;
  tipo: 'pulsa' | 'candela';
  min: number;
  max: number;
  periodo: number;
  fase: number;
  scala: number;
}

export interface FotoStato {
  presenze: Map<number, { terr: number; mio: boolean; id: string; trasformata: boolean }>;
  mano: Map<number, { id: string; x: number; y: number }>;
  tappe: Set<string>;
  tuo: boolean;
  evento: boolean;
}

let texLuce: Texture | undefined;
/** Alone tondo che sfuma verso l'esterno (si tinge e si somma allo sfondo). */
export function texturaLuce(): Texture {
  if (texLuce) return texLuce;
  const cv = document.createElement('canvas');
  cv.width = 128;
  cv.height = 128;
  const ctx = cv.getContext('2d')!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,255,255,0.45)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  texLuce = Texture.from(cv);
  return texLuce;
}

/** Alone (tondo e sfumato) tinto e sommato allo sfondo: candele, bagliori e luce del pozzo. */
export function aloneLuce(d: { s: Container }, cx: number, cy: number, w: number, h: number, colore: number): Sprite {
  const sp = new Sprite(texturaLuce());
  sp.anchor.set(0.5);
  sp.tint = colore;
  sp.blendMode = 'add';
  sp.position.set(cx, cy);
  sp.width = w;
  sp.height = h;
  d.s.addChild(sp);
  return sp;
}

class Animazioni {
  private app?: Application;
  private fx?: Container;
  /** Niente animazioni: sistema con «riduci movimento» o ?animazioni=0. */
  ridotto = false;
  private tweens: Tween[] = [];
  private luci: Luce[] = [];
  private numeri = new Map<string, number | string>();
  private popAttivi = new Map<string, number>();
  private oggetti = new Map<string, Text>();
  private rimbalziAttivi = new Map<string, number>();
  private rimbalziOggetti = new Map<string, { o: Container; y: number }>();
  private selezionata: number | null = null;
  private gruppi = new Map<string, { o: Container; t0: number }>();
  private prima: FotoStato | null = null;
  private bannerPendente: 'tuo' | 'lui' | null = null;
  private radice?: Container;
  /** Chiamata quando finisce una transizione: la scena si ridisegna (le aree dei tocchi tornano quelle giuste). */
  suFine?: () => void;
  conteggi = { voli: 0, pop: 0, lampi: 0, evento: 0, banner: 0, transizioni: 0, rimbalzi: 0, scorrimenti: 0 };

  avvia(app: Application, fx: Container, radice: Container): void {
    this.app = app;
    this.fx = fx;
    this.radice = radice;
    const q = new URLSearchParams(location.search).get('animazioni');
    this.ridotto = q === '0' || (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    app.ticker.add(() => this.frame());
  }

  /** Nuova partita: si dimentica cio' che si ricordava della precedente. */
  azzera(): void {
    this.numeri.clear();
    this.popAttivi.clear();
    this.prima = null;
    this.selezionata = null;
    this.bannerPendente = null;
  }

  /** Transizioni in corso che bloccano i tocchi (i test aspettano che finiscano). */
  attive(): number {
    return this.tweens.filter((t) => t.bloccante).length;
  }

  // ---------------- disegno: oggetti da animare registrati dalla scena ----------------
  iniziaDisegno(): void {
    this.luci = [];
    this.oggetti.clear();
    this.rimbalziOggetti.clear();
    this.gruppi.clear();
  }

  /** Luce che pulsa piano (pozzo) o trema (candele): alone aggiunto allo sfondo. */
  luce(o: Sprite | Graphics | Container, tipo: Luce['tipo'], opz: { min?: number; max?: number; periodo?: number; fase?: number } = {}): void {
    const l: Luce = { o, tipo, min: opz.min ?? 0.2, max: opz.max ?? 0.5, periodo: opz.periodo ?? (tipo === 'pulsa' ? 3200 : 900), fase: opz.fase ?? Math.random() * 6.28, scala: o.scale.x };
    this.luci.push(l);
    this.applicaLuce(l, ora());
  }

  private applicaLuce(l: Luce, t: number): void {
    let k: number;
    if (this.ridotto) k = 0.5;
    else if (l.tipo === 'pulsa') k = (Math.sin((2 * Math.PI * t) / l.periodo + l.fase) + 1) / 2;
    else k = clamp01(0.5 + 0.28 * Math.sin(t / (l.periodo * 0.17) + l.fase) + 0.22 * Math.sin(t / (l.periodo * 0.071) + l.fase * 2.3) + 0.12 * Math.sin(t / (l.periodo * 0.31)));
    l.o.alpha = l.min + (l.max - l.min) * k;
    if (l.tipo === 'candela') l.o.scale.set(l.scala * (0.93 + 0.14 * k));
  }

  /** Un numero della scena: se cambia rispetto al disegno precedente fa un «pop». */
  numero(chiave: string, valore: number | string, t: Text): void {
    const prima = this.numeri.get(chiave);
    this.numeri.set(chiave, valore);
    if (prima !== undefined && prima !== valore && !this.ridotto) {
      this.popAttivi.set(chiave, ora());
      this.conteggi.pop++;
    }
    this.oggetti.set(chiave, t);
    const t0 = this.popAttivi.get(chiave);
    if (t0 !== undefined) this.applicaPop(chiave, t, ora() - t0);
  }

  private applicaPop(chiave: string, t: Text, trascorso: number): void {
    const p = trascorso / 320;
    if (p >= 1) {
      this.popAttivi.delete(chiave);
      t.scale.set(1);
      return;
    }
    t.scale.set(1 + 0.55 * Math.sin(Math.PI * p) * (1 - p * 0.3));
  }

  /** Carta selezionata: piccolo rimbalzo la prima volta che appare selezionata. */
  rimbalzo(uid: number | null, cont?: Container): void {
    if (uid === null || cont === undefined) {
      if (uid === null) this.selezionata = null;
      return;
    }
    const chiave = `sel:${uid}`;
    if (this.selezionata !== uid && !this.ridotto) {
      this.rimbalziAttivi.set(chiave, ora());
      this.conteggi.rimbalzi++;
    }
    this.selezionata = uid;
    this.rimbalziOggetti.set(chiave, { o: cont, y: cont.y });
    const t0 = this.rimbalziAttivi.get(chiave);
    if (t0 !== undefined) this.applicaRimbalzo(chiave, ora() - t0);
  }

  private applicaRimbalzo(chiave: string, trascorso: number): void {
    const r = this.rimbalziOggetti.get(chiave);
    const p = trascorso / 260;
    if (!r) return;
    if (p >= 1) {
      this.rimbalziAttivi.delete(chiave);
      r.o.y = r.y;
      return;
    }
    r.o.y = r.y - 16 * Math.sin(Math.PI * p) * (1 - p);
  }

  /** Un gruppo di oggetti (per esempio la scheda dell'evento) che compare ingrandendosi; il centro e' (cx, cy). */
  gruppo(chiave: string, o: Container, cx: number, cy: number): void {
    o.pivot.set(cx, cy);
    o.position.set(cx, cy);
    const nuovo = !this.gruppi.has(chiave) && !this.gruppiVisti.has(chiave);
    this.gruppiVisti.add(chiave);
    if (nuovo && !this.ridotto) this.gruppiT0.set(chiave, ora());
    this.gruppi.set(chiave, { o, t0: this.gruppiT0.get(chiave) ?? 0 });
    const t0 = this.gruppiT0.get(chiave);
    if (t0 !== undefined) this.applicaGruppo(chiave, ora() - t0);
  }
  private gruppiVisti = new Set<string>();
  private gruppiT0 = new Map<string, number>();
  /** Il gruppo non e' piu' sulla scena (per esempio l'evento si e' chiuso). */
  gruppoChiuso(chiave: string): void {
    this.gruppiVisti.delete(chiave);
    this.gruppiT0.delete(chiave);
  }

  private applicaGruppo(chiave: string, trascorso: number): void {
    const g = this.gruppi.get(chiave);
    if (!g) return;
    const p = clamp01(trascorso / 320);
    const k = sovra(p);
    g.o.scale.set(0.72 + 0.28 * k);
    g.o.alpha = clamp01(p * 2.2);
    if (p >= 1) this.gruppiT0.delete(chiave);
  }

  // ---------------- effetti passeggeri (livello fx) ----------------
  private tween(dur: number, passo: (p: number) => void, fine?: () => void, bloccante = false): void {
    if (this.ridotto) {
      passo(1);
      fine?.();
      return;
    }
    this.tweens.push({ t0: ora(), dur, passo, fine, bloccante });
  }

  /** La carta giocata vola dalla mano (o dall'alto, per il computer) alla miniatura sul quadro. */
  volo(da: { x: number; y: number }, a: Area, idCarta: string, trasformata: boolean, mio: boolean): void {
    if (this.ridotto || !this.fx) return;
    const tex = texturaDi(idImmagine(idCarta, trasformata));
    if (!tex) return;
    this.conteggi.voli++;
    const w0 = Math.max(54, a.w * 2.6);
    const h0 = w0 * 0.78;
    const w1 = a.w;
    const h1 = a.h;
    const cont = new Container();
    const sp = new Sprite(tex);
    const maschera = new Graphics();
    const cornice = new Graphics();
    cont.addChild(sp, maschera, cornice);
    sp.mask = maschera;
    this.fx.addChild(cont);
    const cx1 = a.x + a.w / 2;
    const cy1 = a.y + a.h / 2;
    const bordo = mio ? 0x6aa8f0 : 0x5fb878;
    this.tween(mio ? 380 : 440, (p) => {
      const e = uscita(p);
      const w = w0 + (w1 - w0) * e;
      const h = h0 + (h1 - h0) * e;
      const x = da.x + (cx1 - da.x) * e;
      const y = da.y + (cy1 - da.y) * e - 36 * Math.sin(Math.PI * e);
      const s = Math.max(w / tex.width, h / tex.height);
      sp.scale.set(s);
      sp.position.set(x - (tex.width * s) / 2, y - (tex.height * s) / 2);
      maschera.clear();
      maschera.roundRect(x - w / 2, y - h / 2, w, h, 4).fill(0xffffff);
      cornice.clear();
      cornice.roundRect(x - w / 2, y - h / 2, w, h, 4).stroke({ width: 2, color: bordo });
      cont.alpha = p > 0.85 ? (1 - p) / 0.15 : 1;
    }, () => cont.destroy({ children: true }));
  }

  /** Il Sigillo o il rito si imprime con un lampo. */
  lampo(x: number, y: number, rosso: boolean): void {
    if (this.ridotto || !this.fx) return;
    this.conteggi.lampi++;
    const colore = rosso ? 0xff7a62 : 0x9ff0b8;
    const luce = new Sprite(texturaLuce());
    luce.anchor.set(0.5);
    luce.tint = colore;
    luce.blendMode = 'add';
    luce.position.set(x, y);
    const anello = new Graphics();
    anello.position.set(x, y);
    this.fx.addChild(luce, anello);
    this.tween(450, (p) => {
      const e = uscita(p);
      luce.scale.set(0.4 + 2.6 * e);
      luce.alpha = (1 - p) * 0.95;
      anello.clear();
      anello.circle(0, 0, 8 + 46 * e).stroke({ width: 3 * (1 - p) + 0.5, color: 0xfff2d0, alpha: 1 - p });
    }, () => { luce.destroy(); anello.destroy(); });
  }

  /** «Il tuo turno» / «Turno di Lui» al centro dello schermo. */
  private mostraBanner(chi: 'tuo' | 'lui', W: number, H: number, u: number): void {
    if (this.ridotto || !this.fx) return;
    this.conteggi.banner++;
    const testo = chi === 'tuo' ? 'IL TUO TURNO' : 'TURNO DI LUI';
    const t = new Text({
      text: testo,
      style: { fontFamily: FONT_TITOLI, fontSize: Math.round(34 * u), fontWeight: '900', fill: chi === 'tuo' ? 0xf3e3b6 : 0xc9d4e6, letterSpacing: 5 * u, dropShadow: { color: 0x000000, alpha: 0.9, blur: 8, distance: 2 } },
      resolution: Math.max(2, window.devicePixelRatio || 1),
    });
    t.anchor.set(0.5);
    t.position.set(W / 2, H * 0.42);
    this.fx.addChild(t);
    const durata = 1150;
    this.tween(durata, (p) => {
      const ms = p * durata;
      t.alpha = ms < 200 ? ms / 200 : ms > durata - 350 ? (durata - ms) / 350 : 1;
      t.scale.set(0.9 + 0.1 * uscita(clamp01(ms / 300)));
    }, () => t.destroy());
  }

  /** La scheda di un gruppo registrato (per esempio l'evento) sparisce ingrandendosi poco: va chiamata prima che la scena la ricostruisca. */
  dissolviGruppo(chiave: string, W: number, H: number): void {
    const g = this.gruppi.get(chiave);
    if (g && !g.o.destroyed) this.dissolvi(g.o, W, H);
  }

  private dissolvi(o: Container, W: number, H: number): void {
    if (this.ridotto || !this.fx || !this.app) return;
    let tex: Texture;
    try {
      tex = this.app.renderer.generateTexture({ target: o, frame: new Rectangle(0, 0, W, H), resolution: 1 });
    } catch {
      return;
    }
    const sp = new Sprite(tex);
    sp.pivot.set(W / 2, H / 2);
    sp.position.set(W / 2, H / 2);
    this.fx.addChild(sp);
    this.tween(260, (p) => {
      sp.alpha = 1 - p;
      sp.scale.set(1 + 0.08 * p);
    }, () => { sp.destroy(); tex.destroy(true); });
  }

  /** Foto della scena di adesso (per le transizioni). */
  private foto(W: number, H: number): Texture | null {
    if (!this.app) return null;
    try {
      return this.app.renderer.generateTexture({ target: this.app.stage, frame: new Rectangle(0, 0, W, H), resolution: 1 });
    } catch {
      return null;
    }
  }

  private bloccaTocchi(W: number, H: number): Graphics {
    const b = new Graphics();
    b.rect(0, 0, W, H).fill({ color: 0xffffff, alpha: 0.001 });
    b.eventMode = 'static';
    this.fx!.addChild(b);
    return b;
  }

  /** Entrare in un territorio: la plancia si avvicina al quadro (200 ms) e sfuma nella scena 3D (300 ms). Va chiamata PRIMA di cambiare la scena. */
  entra(cx: number, cy: number, W: number, H: number): void {
    if (this.ridotto || !this.fx) return;
    const tex = this.foto(W, H);
    if (!tex) return;
    this.conteggi.transizioni++;
    const sp = new Sprite(tex);
    sp.pivot.set(cx, cy);
    sp.position.set(cx, cy);
    const blocco = this.bloccaTocchi(W, H);
    this.fx.addChild(sp);
    this.fx.setChildIndex(blocco, this.fx.children.length - 1);
    const dur = 500;
    this.tween(dur, (p) => {
      const ms = p * dur;
      if (ms < 200) {
        sp.scale.set(1 + 1.3 * entrata(ms / 200));
        sp.alpha = 1;
      } else {
        const q = (ms - 200) / 300;
        sp.scale.set(2.3 + 0.5 * uscita(q));
        sp.alpha = 1 - uscita(q);
      }
    }, () => { sp.destroy(); blocco.destroy(); tex.destroy(true); this.suFine?.(); }, true);
  }

  /** Uscire da un territorio: la scena sfuma (300 ms) e la plancia si allontana dal quadro (200 ms). Va chiamata PRIMA di cambiare la scena. */
  esce(cx: number, cy: number, W: number, H: number): void {
    if (this.ridotto || !this.fx || !this.radice) return;
    const tex = this.foto(W, H);
    if (!tex) return;
    this.conteggi.transizioni++;
    const sp = new Sprite(tex);
    sp.pivot.set(W / 2, H / 2);
    sp.position.set(W / 2, H / 2);
    const blocco = this.bloccaTocchi(W, H);
    this.fx.addChild(sp);
    this.fx.setChildIndex(blocco, this.fx.children.length - 1);
    const r = this.radice;
    r.pivot.set(cx, cy);
    r.position.set(cx, cy);
    const dur = 500;
    this.tween(dur, (p) => {
      const ms = p * dur;
      if (ms < 300) {
        const q = ms / 300;
        sp.alpha = 1 - uscita(q);
        sp.scale.set(1 + 0.12 * uscita(q));
        r.scale.set(2.3);
      } else {
        sp.alpha = 0;
        const q = (ms - 300) / 200;
        r.scale.set(2.3 - 1.3 * uscita(q));
      }
    }, () => { sp.destroy(); blocco.destroy(); tex.destroy(true); r.scale.set(1); r.pivot.set(0, 0); r.position.set(0, 0); this.suFine?.(); }, true);
  }

  /** Passare al luogo vicino: la scena vecchia scivola via e sfuma (250 ms). Va chiamata PRIMA di cambiare la scena. */
  scorre(dir: -1 | 1, W: number, H: number): void {
    if (this.ridotto || !this.fx) return;
    const tex = this.foto(W, H);
    if (!tex) return;
    this.conteggi.scorrimenti++;
    const sp = new Sprite(tex);
    const blocco = this.bloccaTocchi(W, H);
    this.fx.addChild(sp);
    this.fx.setChildIndex(blocco, this.fx.children.length - 1);
    this.tween(250, (p) => {
      sp.x = -dir * W * 0.22 * uscita(p);
      sp.alpha = 1 - uscita(p);
    }, () => { sp.destroy(); blocco.destroy(); tex.destroy(true); }, true);
  }

  // ---------------- confronto fra un disegno e il precedente ----------------
  /** Dopo ogni disegno: cerca cio' che e' cambiato (carte giocate, tappe, turno) e fa partire le animazioni. */
  dopoDisegno(ora1: FotoStato, aree: Record<string, Area>, punti: Record<string, { x: number; y: number }>, W: number, H: number, u: number, evento: boolean, finita: boolean, fazioneMia: string, fazioneAvv: string): void {
    const prima = this.prima;
    this.prima = ora1;
    if (!prima) return;
    // carte giocate
    for (const [uid, p] of ora1.presenze) {
      if (prima.presenze.has(uid)) continue;
      const area = aree[`pres:${uid}`];
      if (!area) continue;
      let da: { x: number; y: number };
      if (p.mio) {
        const sparita = [...prima.mano.entries()].find(([k, c]) => c.id === p.id && !ora1.mano.has(k));
        da = sparita ? { x: sparita[1].x, y: sparita[1].y } : { x: W / 2, y: H };
      } else da = { x: W / 2, y: -40 * u };
      this.volo(da, area, p.id, p.trasformata, p.mio);
    }
    // Sigillo / rito
    for (const k of ora1.tappe) {
      if (prima.tappe.has(k)) continue;
      const [i, chi] = k.split(':');
      const pt = punti[`disco:${i}:${chi}`];
      if (pt) this.lampo(pt.x, pt.y, (chi === 'mio' ? fazioneMia : fazioneAvv) === 'custodi');
    }
    // turno
    if (prima.tuo !== ora1.tuo && !finita) this.bannerPendente = ora1.tuo ? 'tuo' : 'lui';
    if (ora1.evento && !prima.evento) this.conteggi.evento++;
    if (this.bannerPendente && !evento && !finita) {
      this.mostraBanner(this.bannerPendente, W, H, u);
      this.bannerPendente = null;
    }
  }

  /** Posizioni delle carte in mano (per far partire il volo dal punto giusto). */
  // ---------------- ogni fotogramma ----------------
  private frame(): void {
    const t = ora();
    if (this.tweens.length) {
      const vivi: Tween[] = [];
      for (const tw of this.tweens) {
        const p = clamp01((t - tw.t0) / tw.dur);
        tw.passo(p);
        if (p >= 1) tw.fine?.();
        else vivi.push(tw);
      }
      this.tweens = vivi;
    }
    for (const l of this.luci) if (!l.o.destroyed) this.applicaLuce(l, t);
    for (const [k, t0] of this.popAttivi) {
      const o = this.oggetti.get(k);
      if (o && !o.destroyed) this.applicaPop(k, o, t - t0);
      else if (t - t0 > 400) this.popAttivi.delete(k);
    }
    for (const [k, t0] of this.rimbalziAttivi) {
      this.applicaRimbalzo(k, t - t0);
    }
    for (const [k, g] of this.gruppi) {
      const t0 = this.gruppiT0.get(k);
      if (t0 !== undefined && !g.o.destroyed) this.applicaGruppo(k, t - t0);
    }
  }
}

export const anim = new Animazioni();
