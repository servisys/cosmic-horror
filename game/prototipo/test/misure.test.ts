// Leggibilita' sul telefono: la soglia minima dei testi cresce con lo schermo (12 px a 956x440, 11 a 740x340).
import { describe, expect, it } from 'vitest';
import { scalaUi, sogliaTesto } from '../src/ui/misure.js';

describe('misure dell\'interfaccia', () => {
  it('nessun testo sotto 12 px a 956x440 e oltre', () => {
    expect(sogliaTesto(scalaUi(956, 440))).toBe(12);
    expect(sogliaTesto(scalaUi(1280, 800))).toBe(12);
    expect(sogliaTesto(scalaUi(1920, 1080))).toBe(12);
  });
  it('11 px a 740x340', () => {
    expect(sogliaTesto(scalaUi(740, 340))).toBeCloseTo(11, 1);
  });
  it('844x390 sta fra le due e la soglia non cala mai sotto 11', () => {
    const s = sogliaTesto(scalaUi(844, 390));
    expect(s).toBeGreaterThan(11);
    expect(s).toBeLessThan(12);
    expect(sogliaTesto(0.7)).toBe(11);
  });
});
