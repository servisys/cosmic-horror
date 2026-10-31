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
  - ../../01-game-design/01-core-rules/CT_CORE_RULES_V0.8.md
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
- Le riserve dei territori nei file non hanno `id`: il codice usa `<id territorio>r` (T1r, T2r, T3r).
- I file attuali contengono righe di continuazione che PyYAML accetta e un lettore YAML 1.2 rigoroso rifiuta. Il caricamento le riunisce (`normalizzaAcapo`) senza toccare i file; il controllo lo segnala come avviso.

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
| `npm run simula -- 1000 0` | 1000 partite computer contro computer dal seme 0 (aggiungere `--json` per i dati) |

## 6. Librerie e versioni (fisse, solo in `game/prototipo/`)

| Libreria | Versione | Uso |
|---|---|---|
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

## 8. Elenco delle ambiguità

L'elenco delle ambiguità trovate nelle regole, nelle carte e negli eventi è nel resoconto di Code (`scambio/da-code.md`) e nella descrizione della PR; ogni punto è stato risolto nel modo più letterale possibile, senza modificare regole, carte o eventi.

## Changelog

| Versione | Stato | Modifica |
|---|---|---|
| 0.1.0 | DRAFT | Prima stesura di Claude Code con le tappe 1 e 2 del prototipo. |
