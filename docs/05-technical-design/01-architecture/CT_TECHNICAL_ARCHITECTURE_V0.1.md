---
title: Cosmic Horror - Architettura tecnica del prototipo (tappe 1 e 2)
status: DRAFT
version: 0.1.0
owner: Matteo
prepared_by: Claude Code
project_prefix: CT_
last_reviewed: 2026-10-31
related_documents:
  - ../../00-project-overview/02-roadmap/CT_PROTOTYPE_SCOPE_V0.2.md
  - ../../01-game-design/01-core-rules/
---

# Architettura tecnica del prototipo (tappe 1 e 2)

> Descrive quello che c'è oggi in `game/prototipo/`: il motore delle regole e il computer, senza grafica. Le scelte non ovvie sono segnate **PROPOSTA** e restano da confermare.

## 1. Struttura delle cartelle

```
game/prototipo/
  package.json, package-lock.json, tsconfig.json, .gitignore   (node_modules e dist non sono nel repository)
  src/
    dati/          lettura dei file dati e controllo
      tipi.ts           forma dei dati (carte, eventi, territori)
      caricamento.ts    legge i YAML da docs/03-cards-content/01-card-database/ (versione più alta)
      controllo.ts      segnala dati mancanti o sbagliati; controlla.ts lo lancia da riga di comando
    motore/        regole di gioco, nessuna grafica
      stato.ts          lo stato della partita (solo dati semplici)
      regole.ts         i numeri provvisori della Core Rules §5
      rng.ts            casualità con seme
      catalogo.ts       id carta -> definizione (normale o cosmica)
      queries.ts        forza, controllo, tappe: funzioni che leggono soltanto
      operazioni.ts     esposizione, instabilità, pesca, trasformazioni, eliminazioni, controllo
      effetti.ts        effetto di ogni carta; mosse e bersagli possibili
      eventi.ts         forza cosmica: i 20 eventi, instabilità crescente, effetti a instabilità 5
      motore.ts         crea la partita, elenca le mosse legali, applica una mossa, flusso di giro
      vista.ts          la vista di un giocatore (solo ciò che può vedere)
      testi-eventi.ts   testi degli effetti degli eventi con cui è scritto il codice (vedi §2)
    computer/
      computer.ts       il computer: priorità di fazione della Core Rules §10
    simulazione/
      partita.ts        una partita computer contro computer
      simula.ts         N partite e statistiche
  test/            test automatici (vitest)
```

## 2. Come si leggono i dati

I file YAML in `docs/03-cards-content/01-card-database/` sono **l'unica fonte** di carte, territori ed eventi (CT-DES-018). Il caricamento sceglie in automatico la versione più alta di `CT_CARTE_PROTOTIPO_V0.x.yaml` e `CT_EVENTI_COSMICI_PROTOTIPO_V0.x.yaml`.

- **Controllo dei dati** (`npm run controllo-dati`, e a ogni simulazione): campi mancanti o di tipo sbagliato, id duplicati, 40 carte per mazzo, 3 territori con una riserva da 3 copie, 20 eventi (6 + 6 + 6 + 2 improvvisi), citazioni complete, versioni cosmiche complete.
- **Gli effetti sono scritti a parole nei file**, quindi il codice ne ha uno per carta (`effetti.ts`, `eventi.ts`). Accanto a ogni effetto il codice tiene il testo con cui è stato scritto (`TESTI_EFFETTO`, `testi-eventi.ts`): se un testo cambia nei file, il controllo dei dati segnala l'errore e dice quale carta rivedere. Una carta nuova nei file senza codice dà errore.
- **PROPOSTA:** se in futuro gli effetti si descrivono in forma strutturata nei file (per esempio come elenco di operazioni), il codice smette di dover essere scritto carta per carta. È una decisione di dati, non di questa tappa.
- Le carte di riserva dei territori hanno il loro `id` nei file (T1r, T2r, T3r, dalla V0.5); il controllo dei dati segnala se manca.
- I file sono YAML 1.2 valido (dalla V0.5, CT-DES-064) e si leggono senza correzioni; un file non valido fa fallire il caricamento.

## 3. Stato, mosse e registro

- **Stato** (`stato.ts`): un oggetto di dati semplici (numeri, testi, liste), senza funzioni né riferimenti circolari: si salva con `JSON.stringify` e si riprende con `JSON.parse`. Contiene giocatori (mano, mazzo, scarti, esposizione, energia, tappe, segnale), tre territori (instabilità, presenze, controllo, riserva), i mazzetti degli eventi, il seme e lo stato del generatore casuale, la coda dei passi del flusso e il registro delle mosse.
- **Mosse** (`Mossa`): `gioca` (una carta, con territorio e/o presenza bersaglio), `tappa` (Sigillo o rito), `riduci` (esposizione), `riordina` (le prime 3 carte, dopo il controllo della Biblioteca), `fine` (turno). `mosseLegali(g)` le elenca; `applica(g, giocatore, mossa)` le esegue e rifiuta con un errore quelle illegali. Dopo ogni mossa il flusso va avanti da solo (fine turno, eventi, inizio del turno successivo) fino alla prossima scelta di un giocatore.
- **Registro:** ogni mossa applicata va in `stato.registro`. Il generatore casuale (mulberry32) vive nello stato e si usa solo dentro il motore; quindi **seme + registro = la stessa partita** (`riproduci`, CT-DES-019).
- **Vista** (`vista.ts`): per ogni giocatore, solo le informazioni visibili (Core Rules §9): mano propria, numero di carte dell'avversario, campo, indicatori, tappe, scarti, tipo del prossimo evento, mosse legali.

## 4. Dove sta il computer

`src/computer/computer.ts`: una funzione `sceglieMossa(vista)` che riceve **solo la vista** (mai lo stato completo, né il generatore casuale) e restituisce una delle mosse legali. Le priorità sono quelle della Core Rules §10 (CT-DES-045). Non usa numeri casuali: stessa vista, stessa mossa. Un test verifica che cambiando la mano e il mazzo dell'avversario la vista e la mossa non cambino.

## 5. Come si lanciano test e simulazioni

Da `game/prototipo/`, dopo `npm install`:

| Comando | Cosa fa |
|---|---|
| `npm test` | tutti i test automatici |
| `npm run tipi` | controllo dei tipi TypeScript |
| `npm run controllo-dati` | controllo dei file dati |
| `npm run dev` / `npm run build` / `npm run preview` | interfaccia in sviluppo / build statica in `dist/` / prova della build |
| `npm run simula -- 1000 0` | 1000 partite computer contro computer dal seme 0 (aggiungere `--json` per i dati) |

## 6. Librerie e versioni (fisse, solo in `game/prototipo/`)

| Libreria | Versione | Uso |
|---|---|---|
| 0.1.6 | DRAFT | Aggiunto il paragrafo 12 sulla grafica finale (plancia, carte, caratteri); l'elenco delle ambiguità diventa il 13. |
| yaml | 2.8.1 | lettura dei file dati |
| typescript | 5.9.3 | linguaggio |
| vitest | 3.2.4 | test |
| tsx | 4.20.6 | esecuzione degli script |
| @types/node | 22.19.0 | tipi di Node |

Node 24 sul PC di sviluppo. Nessuna libreria di grafica (PixiJS arriva dalla tappa 3).

## 7. Proposte e scelte non ovvie

1. **PROPOSTA:** il motore non usa classi né stato nascosto: tutto passa da un oggetto di dati. Costo: un po' più di codice; vantaggio: salvataggi, registro e rigioco gratuiti, e lo stato si può passare all'interfaccia così com'è.
2. **PROPOSTA:** la vista del giocatore è l'unico canale verso il computer (e, in futuro, verso l'interfaccia). Impedisce per costruzione che il computer usi informazioni nascoste.
3. **PROPOSTA:** il flusso di giro è una coda di passi (`passi`) invece di funzioni annidate; serve perché alcune scelte possono interrompere il flusso a metà (il riordino della Biblioteca può capitare anche durante un evento).
4. **PROPOSTA:** il limite di 30 giri delle simulazioni è solo tecnico, non una regola (CT-DES-009 rimanda la scelta ai playtest).
5. I file dati sono letti a runtime da Node. Per il browser (tappa 3 e seguenti) la lettura va spostata in fase di build (la specifica dice «in fase di build»): il modulo `caricamento.ts` è l'unico da adattare.

## 8. Interfaccia (tappa 3)

- **Struttura:** `src/ui/` e `index.html`. `controller.ts` tiene la partita e la selezione del giocatore umano e muove il computer una mossa alla volta; **non contiene regole**: ogni mossa possibile viene da `mosseLegali` e ogni informazione dalla vista. `scena.ts` disegna con PixiJS (riquadri, numeri grandi, carte come riquadri con nome e colore di fazione); `main.ts` avvia tutto (schermata iniziale in HTML, scena in PixiJS, pausa fra le mosse del computer, evento cosmico a schermo). Le illustrazioni arrivano con la tappa 4.
- **Dati in fase di build:** `dati-build.ts` include i YAML di `docs/03-cards-content/01-card-database/` (versione più alta) nella build come testo; `dati/leggi.ts` li interpreta (lo stesso codice di Node). Un test verifica che i dati della build siano identici a quelli letti da disco.
- **Build statica:** `npm run build` produce `dist/` (cartella statica, percorsi relativi) per la pubblicazione della tappa 5. `npm run dev` e `npm run preview` per provarla.
- **Verifica:** `npm run verifica-tappa3` (Playwright 1.64.1) gioca una partita completa per fazione a 956×440 e a 1280×800 cliccando sull'interfaccia, salva gli screenshot e controlla scorrimenti e testi fuori dallo schermo. Serve il browser indicato in `CT_CHROMIUM` (o quello installato da Playwright).
- Il turno del computer dura una mossa ogni 650 ms, con la frase che la spiega in alto; l'evento cosmico si chiude toccando o dopo 4,5 s. Parametri nell'indirizzo per i test: `?fazione=custodi&seme=21&pausa=120&pausaEvento=1200`.
- **PROPOSTA:** la schermata iniziale è in HTML (serve il campo del seme) e il resto in PixiJS.

## 9. Carte complete (tappa 4)

- **Illustrazioni:** 71 file WebP (lato lungo 800 px, circa 2,5 MB in tutto) in `game/prototipo/src/assets/illustrazioni/`, nome = id della carta (le versioni cosmiche hanno id con «c», i territori T1-T3, le riserve T1r-T3r, gli eventi E01-E20). Sono scelte da Matteo; `scripts/converti-illustrazioni.py` le converte dalle scelte (richiede pillow). Un test controlla che ogni carta, versione cosmica, evento e territorio abbia la sua immagine e che il peso resti sotto i limiti.
- **Caricamento:** `src/ui/immagini.ts` include i file nella build e li carica prima del primo disegno; una immagine mancante lascia il riquadro con il nome.
- **Carta ingrandita:** un tocco sulla lente di una carta in mano, su una carta in campo o sul nome di un territorio apre la scheda grande (illustrazione, nome, costo, forza, testo, citazione in italiano con fonte e originale inglese in piccolo); l'evento cosmico usa la stessa scheda. Si chiude toccando. Il passaggio del mouse mostra ancora la scheda piccola.
- E12 (Il Richiamo di Dagon) usa l'immagine scelta da Matteo nel quinto giro (`illustrazioni_v7/E12_v3`). Per cambiare un'immagine basta rifare la conversione con il nuovo percorso nel file delle scelte.

## 10. Correzioni per il telefono

- **Partenza senza parametri:** il ridisegno non parte finche' non c'e' una partita (`Controller.attiva`); prima dava un errore all'avvio della schermata iniziale.
- **Solo il tocco sul telefono:** l'anteprima «al passaggio del mouse» e' ignorata per i tocchi (`pointerType` touch o `(hover: none)`); la scheda grande si apre con la lente o toccando e si chiude toccando. Il ridisegno causato dall'anteprima faceva anche perdere il tocco.
- **Immagini senza web worker:** `Assets.setPreferences({ preferWorkers: false })` prima dei caricamenti (PixiJS usa altrimenti un worker da URL blob, vietato da una `Content-Security-Policy` con `worker-src`); se il caricamento si blocca il gioco parte dopo 10 s senza le immagini mancanti.
- **Verifica:** `npm run prova-telefono -- <url>` (bottoni iniziali senza parametri, immagini con CSP `worker-src 'none'`, tocco con `hasTouch` e `isMobile`); `scripts/serve-sottocartella.mjs` serve una build sotto `/x/y/` (con `CSP=1` imposta l'intestazione).

## 11. Aiuti di gioco

- **Riga di suggerimento** (`src/ui/suggerimento.ts`): una frase sulla prossima cosa utile, calcolata dalla sola vista del giocatore (nessuna regola nuova, nessuna mossa automatica). Ordine: hai finito l'energia, l'avversario e' a una tappa dalla vittoria, puoi porre un Sigillo / completare un rito, la tua tappa non e' ancora al sicuro, l'instabilita' non e' dalla parte giusta, serve piu' forza per controllare un territorio, altrimenti «tocca una carta». Un tocco sulla riga la nasconde o la mostra.
- **Segnali:** il bottone Sigillo/rito e' pieno e illuminato quando si puo' usare, spento con il motivo in piccolo quando no (`motivoTappa`); la tappa sul territorio e' un cerchio vuoto se si puo' ancora togliere (con «al sicuro dopo il turno di…») e pieno se e' al sicuro (`VistaTerritorio.mioTappaTogliibile`); toccando una carta non giocabile compare il motivo (costo, bersagli).
- **Tutorial:** 6 passi (`passiTutorial`) con riquadro evidenziato e «Avanti»/«Salta»; parte al primo turno della prima partita, ricordato in `localStorage` (`src/ui/memoria.ts`, con try/catch), e si rivede con «Come si gioca» nella schermata iniziale. `?tutorial=0` lo disattiva (usato dalle verifiche), `?tutorial=1` lo forza.
- **Verifica:** `npm run verifica-aiuti -- <url>` (Playwright, 956x440, `hasTouch` + `isMobile`).

## 12. Grafica finale (plancia, carte, caratteri)

- **Plancia:** lo sfondo `src/assets/plancia/pozzo_*.webp` (pozzo_v3, lato lungo 1920 e 1280, scelto in base ai pixel reali dello schermo) si mostra a tutto schermo (`cover`). Tutto cio' che e' posizionato sullo sfondo sta in **un file di configurazione**, `src/ui/config-plancia.ts`: i cinque settori (Innsmouth, Biblioteca, Dunwich, Landa, R'lyeh) con la zona toccabile in frazioni dell'immagine, il lato della targhetta e la scena. `territorioId` dice quale territorio dei dati sta in quel quadro; `null` = visibile ma non in gioco (Dunwich e R'lyeh: scuriti, nessuna targhetta, al tocco «Non ancora in gioco»). Passare a 5 territori in gioco = scrivere gli id in questo file. Il test `config-plancia.test.ts` controlla la corrispondenza con i dati.
- **Interfaccia sulla plancia** (`src/ui/scena.ts`): barra dell'avversario in alto; per ogni territorio in gioco una targhetta (nome, forza di Lui verde e tua blu, pallini dell'instabilita', dischi delle tappe: pieno = al sicuro, contorno = ancora togliibile, con la riga «al sicuro dopo…»), le miniature delle carte giocate con la forza e, solo quando si puo', il bottone dorato Sigillo/rito. I quadri toccabili per la carta selezionata hanno un alone dorato. Mano in basso, a ventaglio, con le carte che sbucano dal bordo: un tocco sulla zona la alza; con una carta selezionata e' sempre alzata; le carte non giocabili sono sbiadite. Energia in basso a sinistra (con esposizione, mazzo e «Riduci»), Fine turno in basso a destra, icone Regole, Registro e Annulla.
- **Carte** (`src/ui/carte.ts`): cornice con bordo sfumato nel colore della fazione (Custodi argento-blu, Risvegliati verde abisso, Eventi viola, riserva e territori ottone), barra del nome con gemma del costo, illustrazione, barra del tipo, riquadro chiaro con effetto, citazione e fonte (e l'originale inglese, piu' piccolo), riquadro della forza. Tre misure: scheda grande (sostituisce la precedente), media e ridotta (mano).
- **Caratteri:** Cinzel (titoli e numeri) e Crimson Text (testi), licenza SIL OFL, come file WOFF2 in `src/assets/font/` con i file di licenza; si caricano con `FontFace` prima del primo disegno (`src/ui/tipografia.ts`, con tempo massimo).
- **Anteprima al mouse:** sta in un livello a parte sopra la scena (`disegnaAnteprima`): mostrarla non ricostruisce la scena, quindi non fa perdere un clic.
- **Verifica:** `npm run grafica-finale -- <url>` (screenshot a 956x440 con tocco e a 1280x800) in aggiunta alle verifiche precedenti. Le verifiche aspettano che la scena sia ferma (`window.__ct.stabile()`) prima di toccare: la scena si ricostruisce dopo ogni cambiamento di stato e un tocco nei pochi millisecondi prima del ridisegno colpirebbe la scena vecchia.

## 13. Elenco delle ambiguità

L'elenco delle ambiguità trovate nelle regole, nelle carte e negli eventi è nel resoconto di Code (`scambio/da-code.md`) e nella descrizione della PR; ogni punto è stato risolto nel modo più letterale possibile, senza modificare regole, carte o eventi.

## Changelog

| Versione | Stato | Modifica |
|---|---|---|
| 0.1.0 | DRAFT | Prima stesura di Claude Code con le tappe 1 e 2 del prototipo. |
| 0.1.5 | DRAFT | Aggiunto il paragrafo 11 sugli aiuti di gioco. |
| 0.1.4 | DRAFT | Aggiunto il paragrafo 10 sulle correzioni per il telefono. |
| 0.1.3 | DRAFT | Aggiunto il paragrafo 9 sulle carte complete (tappa 4). |
| 0.1.2 | DRAFT | Aggiunto il paragrafo 8 sull'interfaccia (tappa 3). |
| 0.1.1 | DRAFT | Allineata a Core Rules V0.9 e ai dati V0.5: tolta la riunione delle righe di continuazione, `id` delle riserve dai dati. |
