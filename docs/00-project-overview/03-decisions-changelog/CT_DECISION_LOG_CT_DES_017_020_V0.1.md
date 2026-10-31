---
title: Cosmic Horror - Decision Log CT-DES-017…020 (indirizzi tecnici del prototipo web)
status: DRAFT
version: 0.1.0
owner: Matteo
prepared_by: Cowork
project_prefix: CT_
last_reviewed: 2026-10-31
---

# Cosmic Horror - Decision Log CT-DES-017…020

> Le quattro voci hanno `Stato: REGISTRATA`. Nascono dalle domande dell'analisi tecnica di Claude Code (`CT_TECH_ANALISI_STACK_WEB_V0.1.md`, in `scambio/da-claude/`) e dai consigli di Cowork. Matteo li ha accettati in chat il 2026-10-31: «ok facciamo come dici». Secondo le Regole V0.2 (regola 4) la registrazione è effettiva con il merge di questo documento in `main`.
>
> Restano fuori da queste voci, perché già decise o da decidere altrove: telefono e PC fin da subito (già in CT-DES-012); quanto è casuale la forza cosmica (Core Rules); priorità dell'avversario per fazione (Core Rules, proposte da Cowork e scelte da Matteo, CT-DES-016).

## CT-DES-017 - Strumenti grafici del prototipo

**Stato:** REGISTRATA

**Decisione:** L'aspetto «da gioco» dell'interfaccia (menu, pannelli, animazioni) conta molto. Il prototipo web usa quindi uno strumento di disegno 2D (PixiJS) per campo e interfaccia, insieme a three.js per gli elementi 3D e gli effetti delle carte, come nelle due prove già fatte. Versioni, organizzazione del codice e ogni altra libreria restano da definire nell'architettura tecnica.

**Motivazione:** Domanda 1 dell'analisi tecnica di Claude Code. Consiglio di Cowork: tenere anche lo strumento 2D, perché l'interfaccia conta molto. Matteo: «ok facciamo come dici» (2026-10-31).

**Data:** 2026-10-31

**Documento interessato:** futuro `CT_TECHNICAL_ARCHITECTURE.md`; Vision (§5.1, §9).

**Alternative considerate:**
- Solo three.js per tutto.
- Solo PixiJS, con effetti 3D limitati.
- PixiJS più three.js. **Scelta.**
- Altri motori web (per esempio Phaser, Babylon.js): non provati nel repository.

**Conseguenze / documenti influenzati:** architettura tecnica; dimensione dei pacchetti da tenere sotto controllo (le prove hanno blocchi da 0,5-0,8 MB); test visivi; la scelta non approva wrapper di packaging (CT-DES-014).

**Sostituisce:** Nessuna. Precisa la parte «librerie» lasciata aperta da CT-DES-014.

---

## CT-DES-018 - Dati di gioco in file di testo

**Stato:** REGISTRATA

**Decisione:** Carte, fazioni, territori ed eventi cosmici sono descritti in file di dati di testo semplici, separati dal codice, così da poter essere letti e modificati anche da Matteo e da Cowork, non solo da Claude Code. Formato preciso e controlli di validità restano da definire nell'architettura tecnica.

**Motivazione:** Domanda 2 dell'analisi tecnica. Consiglio di Cowork: «anche tu e io: dati in file di testo semplici, non nel codice». Matteo: «ok facciamo come dici» (2026-10-31).

**Data:** 2026-10-31

**Documento interessato:** futuro `CT_TECHNICAL_ARCHITECTURE.md`; futuro `CT_CORE_RULES.md`; Vision §14 (dati separati dalla logica).

**Alternative considerate:**
- Dati scritti dentro il codice, modificabili solo da Claude Code.
- Dati in file di testo semplici, separati dal codice. **Scelta.**
- Editor dedicato: rimandato.

**Conseguenze / documenti influenzati:** serve un formato documentato e un controllo automatico che segnali dati sbagliati; le carte diventano modificabili senza toccare la logica; più facile il bilanciamento dopo i playtest.

**Sostituisce:** Nessuna.

---

## CT-DES-019 - Mosse registrate e partite ripetibili

**Stato:** REGISTRATA

**Decisione:** Fin dal prototipo ogni mossa della partita viene registrata, e la casualità (per esempio della forza cosmica) usa un generatore con «seme», così che una partita possa essere rivista e ripetuta identica nei test. Questo prepara un eventuale gioco online o la revisione delle partite in futuro, senza deciderli ora.

**Motivazione:** Domande 3 e 4 dell'analisi tecnica. Consiglio di Cowork: registrare ogni mossa fin da subito, perché costa poco, e avere partite ripetibili per i test, mentre quanto sia casuale la forza cosmica si decide nelle Core Rules. Matteo: «ok facciamo come dici» (2026-10-31).

**Data:** 2026-10-31

**Documento interessato:** futuro `CT_TECHNICAL_ARCHITECTURE.md`; futuro `CT_ACCEPTANCE_TEST_PLAN.md`; Vision §13 (log degli eventi utile a debugging e playtest).

**Alternative considerate:**
- Nessuna registrazione: più semplice, ma partite non ripetibili.
- Registrazione delle mosse e casualità con seme. **Scelta.**
- Architettura completa per il gioco online subito: rimandata, non necessaria al prototipo.

**Conseguenze / documenti influenzati:** la logica di gioco deve essere separata dall'interfaccia e produrre lo stesso risultato a parità di mosse e seme; test con scenari ripetibili; l'avversario (CT-DES-016) deve usare lo stesso generatore con seme.

**Sostituisce:** Nessuna.

---

## CT-DES-020 - Codice del prototipo: si riparte da zero

**Stato:** REGISTRATA

**Decisione:** Il codice del prototipo viene scritto da zero in una nuova cartella, prendendo spunto dalla prova CT-TECH-001 e dal concept grafico. Le prove restano in `game/prove/` come storia e non vengono trasformate nel prototipo.

**Motivazione:** Domanda 6 dell'analisi tecnica. Consiglio di Cowork: ripartire da zero prendendo spunto dalla prova, che resta come storia. Matteo: «ok facciamo come dici» (2026-10-31).

**Data:** 2026-10-31

**Documento interessato:** futuro `CT_TECHNICAL_ARCHITECTURE.md`; futuro `CT_PROTOTYPE_SCOPE.md`; `game/prove/`.

**Alternative considerate:**
- Far crescere il codice della prova fino al prototipo.
- Ripartire da zero prendendo spunto dalle prove. **Scelta.**

**Conseguenze / documenti influenzati:** nuova cartella del prototipo da definire nell'architettura; le prove restano congelate come evidenza; nessuna implementazione parte prima di una specifica `APPROVED` (Master Index).

**Sostituisce:** Nessuna.

---

## Changelog

| Versione | Stato | Modifica |
|---|---|---|
| 0.1.0 | DRAFT | Prima stesura da parte di Cowork, con le scelte di Matteo del 2026-10-31. |
