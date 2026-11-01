// Versione del gioco che si vede nel menu (etichetta · commit · data): la scrive la build (vite.config.ts); nei test non c'e'.
declare const __CT_VERSIONE__: string | undefined;

export const VERSIONE: string = typeof __CT_VERSIONE__ === 'string' ? __CT_VERSIONE__ : 'sviluppo';
