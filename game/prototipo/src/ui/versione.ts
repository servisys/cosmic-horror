// Versione del gioco che si vede nel menu (etichetta · commit · data): la scrive la build (vite.config.ts); nei test non c'e'.
declare const __CT_VERSIONE__: string | undefined;

export const VERSIONE: string = typeof __CT_VERSIONE__ === 'string' ? __CT_VERSIONE__ : 'sviluppo';

// Ambiente (prova / produzione): non e' nella build, perche' la produzione pubblica la stessa build della prova senza ricostruirla.
// Lo scrive lo script «pubblica» in versione.json accanto al gioco; in sviluppo il file non c'e' e l'ambiente non si mostra.
let ambiente: string | null = null;

export async function caricaAmbiente(): Promise<void> {
  try {
    const r = await fetch('./versione.json', { cache: 'no-store' });
    if (!r.ok) return;
    const j = (await r.json()) as { ambiente?: unknown };
    if (j.ambiente === 'prova' || j.ambiente === 'produzione') ambiente = j.ambiente;
  } catch { /* senza rete o senza il file: si mostra solo la versione */ }
}

export function etichettaVersione(): string {
  return ambiente ? `${VERSIONE} · ${ambiente}` : VERSIONE;
}
