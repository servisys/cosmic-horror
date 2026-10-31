// Numeri provvisori della Core Rules V0.8 §5 (CT-DES-030). Tutti modificabili dopo i playtest.
export const REGOLE = {
  manoIniziale: 5, // il secondo giocatore ne pesca 1 in piu'
  energiaPrimoTurno: 2,
  energiaMax: 8,
  energiaPrimoTurnoPartita: [1, 3] as const, // [chi gioca per primo, chi gioca per secondo] (CT-DES-057)
  extraTerritori: { minimo: 2, energia: 1 },
  esposizioneMax: 10,
  sogliaTrasformazione: [3, 6, 9] as readonly number[],
  costoRiduzione: 2,
  instMax: 5,
  maxPresenzeSuTerritorio: 4, // CT-DES-050
  giroInstabilitaCrescente: 7,
  sogliaForzaMeno1: 4, // CT-DES-051
  sogliaEffettoCosmico: 5,
  sogliaSigillo: 3, // inst massima per porre un Sigillo / minima per un rito
  costoTappa: 2, // CT-DES-055
  tappeVittoria: 3,
  giriFase: { I: 3, II: 6 }, // fase I giri 1-3, II 4-6, III dal 7
  maxGiriPredefinito: 30, // NON e' una regola: limite tecnico per le simulazioni (CT-DES-009 lascia la scelta ai playtest)
};

export function faseDelGiro(giro: number): 'fase_I' | 'fase_II' | 'fase_III' {
  return giro <= REGOLE.giriFase.I ? 'fase_I' : giro <= REGOLE.giriFase.II ? 'fase_II' : 'fase_III';
}
