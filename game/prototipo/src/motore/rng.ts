// Casualita' con seme (CT-DES-019). Algoritmo mulberry32; lo stato e' un numero, salvato dentro lo stato della partita.
export interface ConRng {
  rng: number;
}

/** Numero in [0,1). */
export function casuale(s: ConRng): number {
  s.rng = (s.rng + 0x6d2b79f5) >>> 0;
  let t = s.rng;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** Intero in [0,n). */
export function intero(s: ConRng, n: number): number {
  return Math.floor(casuale(s) * n);
}

export function scegli<T>(s: ConRng, v: readonly T[]): T {
  return v[intero(s, v.length)];
}

/** Fisher-Yates sul posto. */
export function mescola<T>(s: ConRng, v: T[]): T[] {
  for (let i = v.length - 1; i > 0; i--) {
    const j = intero(s, i + 1);
    [v[i], v[j]] = [v[j], v[i]];
  }
  return v;
}
