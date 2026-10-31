// Memoria del browser (localStorage): solo per comodita' (per esempio non rifare il tutorial). Ogni accesso e' protetto:
// in una finestra privata, con i dati del sito bloccati o in un'anteprima, l'accesso puo' dare errore e il gioco deve funzionare lo stesso.
const CHIAVE_TUTORIAL = 'ct_tutorial_visto';

export function tutorialVisto(): boolean {
  try {
    return window.localStorage.getItem(CHIAVE_TUTORIAL) === '1';
  } catch {
    return false;
  }
}

export function segnaTutorialVisto(): void {
  try {
    window.localStorage.setItem(CHIAVE_TUTORIAL, '1');
  } catch {
    // non si ricorda: il tutorial ricomparira' alla prossima partita
  }
}
