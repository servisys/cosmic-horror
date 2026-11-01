// Misure dell'interfaccia che non dipendono da PixiJS (si provano con i test).

/** Misura minima di un testo sullo schermo (px): 12 a 956x440 e oltre, 11 a 740x340, in proporzione fra le due. */
export function sogliaTesto(u: number): number {
  return u >= 1 ? 12 : Math.max(11, 11 + (u - 0.773) / (1 - 0.773));
}

/** Fattore di scala dell'interfaccia (1 a 956x440). */
export function scalaUi(W: number, H: number): number {
  return Math.max(0.7, Math.min(W / 956, H / 440));
}
