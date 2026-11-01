// Gioco installabile: registra il service worker (gioco offline), avvisa quando c'e' una nuova versione (senza ricaricare a meta' partita)
// e chiede il tutto schermo al primo tocco quando il gioco non e' installato. Niente di tutto questo cambia le regole.

let avviso: HTMLElement | null = null;

function mostraAvviso(reg: ServiceWorkerRegistration, partitaInCorso: () => boolean): void {
  if (avviso) return;
  const el = document.createElement('button');
  el.type = 'button';
  el.id = 'nuova-versione';
  const testo = (): string => 'Nuova versione disponibile - tocca per aggiornare' + (partitaInCorso() ? ' (la partita in corso ricomincia)' : '');
  el.textContent = testo();
  el.addEventListener('click', () => {
    el.disabled = true;
    el.textContent = 'Aggiornamento…';
    reg.waiting?.postMessage('aggiorna');
    // se per qualche motivo non parte, si ricarica comunque dopo un attimo
    setTimeout(() => location.reload(), 4000);
  });
  // il testo segue lo stato della partita (si puo' iniziare una partita dopo che l'avviso e' comparso)
  setInterval(() => { if (!el.disabled) el.textContent = testo(); }, 2000);
  document.body.appendChild(el);
  avviso = el;
}

/** Registra il service worker (solo nella build; con CSP «worker-src 'none'» o senza supporto il gioco parte lo stesso). */
export function registraServiceWorker(partitaInCorso: () => boolean): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  let ricaricato = false;
  try {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (ricaricato || !avviso) return; // la prima installazione prende il controllo senza ricaricare
      ricaricato = true;
      location.reload();
    });
  } catch { /* niente */ }
  const registra = (): void => {
    navigator.serviceWorker.register('./sw.js').then((reg) => {
      const controlla = (): void => { if (reg.waiting && navigator.serviceWorker.controller) mostraAvviso(reg, partitaInCorso); };
      controlla();
      reg.addEventListener('updatefound', () => {
        const nuovo = reg.installing;
        nuovo?.addEventListener('statechange', () => { if (nuovo.state === 'installed') controlla(); });
      });
      // una nuova versione si cerca all'apertura e ogni volta che l'app torna in primo piano
      const cerca = (): void => { reg.update().catch(() => undefined); };
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') cerca(); });
      setInterval(cerca, 30 * 60 * 1000);
    }).catch(() => undefined);
  };
  if (document.readyState === 'complete') registra();
  else window.addEventListener('load', registra);
}

/** Dispositivo senza installazione: al primo tocco si chiede il tutto schermo (dove il browser lo permette). */
export function tuttoSchermoAlPrimoTocco(): void {
  const installata = window.matchMedia('(display-mode: fullscreen)').matches || window.matchMedia('(display-mode: standalone)').matches
    || (navigator as unknown as { standalone?: boolean }).standalone === true;
  // solo sul telefono (puntatore «grosso»): sul computer non serve e darebbe fastidio
  if (installata || !document.documentElement.requestFullscreen || !window.matchMedia('(pointer: coarse)').matches) return;
  const chiedi = (): void => {
    window.removeEventListener('pointerup', chiedi);
    if (document.fullscreenElement) return;
    try {
      void document.documentElement.requestFullscreen({ navigationUI: 'hide' }).catch(() => undefined);
    } catch { /* il browser non lo permette */ }
  };
  window.addEventListener('pointerup', chiedi, { once: true });
}
