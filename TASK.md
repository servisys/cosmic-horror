---
id: CT-FIX-007
fase: piano
pronto: si
branch: fix/ct-fix-007-schermo-pieno-e-barra-di-stato
scritto_da: Cowork (chat Claude del progetto)
data: 2026-11-02
---

# CT-FIX-007 — Sul telefono (app installata, tutto schermo): spazio sprecato in basso, riquadro dei punti che copre Dunwich, e schermo zoomato o tagliato dopo il ritorno dal background

## Documenti autorevoli
- `docs/00_MASTER_INDEX.md` (APPROVED), `docs/CT_COWORK_CODE_PROTOCOL_V0.4.md` (APPROVED), `CT_PROTOTYPE_SCOPE_V0.3.md` (APPROVED).
- Codice: `game/prototipo/index.html`, `src/ui/main.ts` (Pixi con `resizeTo: #gioco`, `window.addEventListener('resize', ridisegna)`), `src/ui/pwa.ts` (`tuttoSchermoAlPrimoTocco`), `public/manifest.webmanifest` (`display: fullscreen`, `display_override`), la plancia e i riquadri dei giocatori in `src/ui/`.

## Cosa ha visto Matteo (2026-11-02, 00:34, sito di prova, app installata come PWA a tutto schermo sul telefono, in orizzontale)
1. **Riquadro dei punti sopra Dunwich.** In basso a sinistra c'è il quadrato con i punti/stato di un giocatore e copre la regione di Dunwich.
2. **Spazio sprecato in basso.** A tutto schermo il gioco non usa tutta l'altezza: resta una fascia libera sotto, con molto spazio vuoto.
3. **Ritorno dal background.** Ogni volta che manda l'app in background e la riprende: o non torna a tutto schermo, o la scena resta **zoomata** e non si riesce a uscirne, o è **tagliata a metà**. Dallo screenshot: la plancia è disegnata molto più grande dello schermo — si vedono solo la parte alta di Innsmouth, la Biblioteca e il cerchio di R'lyeh con la targa «ULTIMA TAPPA»; le targhe di Dunwich (in basso a sinistra) e del quinto territorio (in basso a destra) sono tagliate dal bordo inferiore; la barra in alto («I CUSTODI · Esposizione 0/10 · Mano 6 · Mazzo 34 · Sigilli 0/3», «GIRO 1 · FASE 1») è a posto. Quindi il canvas/la scena hanno dimensioni diverse da quelle visibili dopo il ritorno.

## Proposta di Matteo
Togliere il riquadro dei punti in basso a sinistra e mettere **una barra di stato in basso** (sottile, a tutta larghezza, sfruttando la fascia oggi sprecata), con dentro quello che oggi c'è nel riquadro. Così Dunwich resta libero e lo spazio viene usato.

## Richiesta (fase piano: solo pre-flight plan, nessuna modifica)
1. **Diagnosi del ritorno dal background**, leggendo il codice: perché dopo `visibilitychange`/ripresa la scena resta più grande dello schermo o tagliata. Piste da verificare (non assumerle vere): Pixi `resizeTo` che legge dimensioni vecchie, `resize` che arriva prima che il layout sia aggiornato (o non arriva), `window.innerHeight` letto una volta in `immagini.ts`, uscita dal tutto schermo dell'API Fullscreen al passaggio in background (Android) e `tuttoSchermoAlPrimoTocco` che non lo richiede più perché `{ once: true }` o perché `installata` è vero, `100%`/`inset:0` contro altezza reale e safe area (iOS con `black-translucent` e `viewport-fit=cover`), zoom del browser nonostante `user-scalable=no`. Proponi una correzione robusta: ridimensionare e ridisegnare a ogni `visibilitychange` visibile, `pageshow`, `orientationchange`, `fullscreenchange` e `visualViewport.resize`, con un ridisegno ripetuto dopo un attimo (layout assestato); richiedere di nuovo il tutto schermo al primo tocco dopo il ritorno dove serve; azzerare lo zoom se possibile.
2. **Uso di tutta l'altezza:** perché resta la fascia sotto (safe area, altezza del contenitore, proporzioni fisse della plancia?). Proponi come usarla.
3. **Barra di stato in basso** al posto del riquadro in basso a sinistra (e, se c'è, dell'equivalente per l'altro giocatore — proponi tu se unificare o tenere due riquadri): contenuto, altezza, leggibilità sul telefono (testo grande abbastanza), rispetto della safe area in basso, niente sovrapposizione con le regioni. Dimmi cosa cambia nei test (`npm run sovrapposizioni`, `npm run leggibilita`, vista cinque territori).
4. Come verificherai su Windows (dimensioni telefono in orizzontale, simulazione del ritorno dal background con eventi), cosa resta da verificare sul telefono di Matteo.
5. Domande per Matteo, con una proposta per ognuna (per esempio: cosa mettere nella barra, se mostrare entrambi i giocatori).

## Fuori perimetro
Bilanciamento, regole, carte. Nessuna fusione o chiusura.

## Output
Pre-flight plan in italiano semplice, con file toccati, rischi, test e domande.
