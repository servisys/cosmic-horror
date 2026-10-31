---
title: Cosmic Horror - Decision Log CT-DES-015 e CT-DES-016
status: DRAFT
version: 0.1.0
owner: Matteo
prepared_by: Cowork
project_prefix: CT_
last_reviewed: 2026-10-31
---

# Cosmic Horror - Decision Log CT-DES-015 e CT-DES-016

> Le due voci hanno `Stato: REGISTRATA`. Matteo le ha scelte in chat il 2026-10-31 («Facciamo come suggerisci», riferito alle opzioni **A** per la finestra di intervento e **C** per il comportamento dell'avversario, proposte da Cowork). Secondo le Regole V0.2 (regola 4) la registrazione è effettiva con il merge di questo documento in `main`.

## CT-DES-015 - Finestra di intervento prima della vittoria

**Stato:** REGISTRATA

**Decisione:** Quando un giocatore è a un passo dal completare un obiettivo di vittoria, il gioco mostra un segnale chiaro e l'avversario ha sempre almeno un proprio turno completo per reagire prima che l'obiettivo possa essere completato. Se dopo quel turno l'obiettivo viene comunque completato, la vittoria è immediata, senza ulteriori risposte (CT-DES-002). Cosa significa concretamente «a un passo», la forma del segnale e le azioni utili per reagire restano da definire nelle Core Rules.

**Motivazione:** CT-DES-002 e CT-DES-005 richiedono che l'avversario veda chiaramente il pericolo e possa intervenire prima del completamento, lasciando aperta la forma della finestra. Matteo ha scelto l'opzione **A** («Un turno di avviso garantito»), consigliata da Cowork perché è la più fedele a quel principio e la più semplice da spiegare. Risposta in chat: «Facciamo come suggerisci» (2026-10-31).

**Data:** 2026-10-31

**Documento interessato:** `../01-vision-concept/CT_VISION_AND_PILLARS_V0.11_BOZZA.md` (nota sulla vittoria, §17); futuro `CT_CORE_RULES.md`.

**Alternative considerate:**
- **A - Un turno di avviso garantito:** segnale quando si è a un passo dalla vittoria; l'avversario ha sempre almeno un turno per reagire. **Scelta.**
- **B - Avanzamento sempre visibile, senza turno garantito:** si vede quanto manca, ma sta all'avversario accorgersene in tempo.
- **C - Dichiarazione obbligatoria:** per vincere bisogna annunciarlo un turno prima.
- **D - Decisione rimandata ai playtest.**

**Conseguenze / documenti influenzati:**
- le Core Rules devono definire la soglia «a un passo», il segnale e cosa può fare l'avversario nel turno di reazione;
- l'interfaccia deve rendere il segnale evidente su PC e telefono (CT-DES-012);
- l'avversario controllato dal gioco deve riconoscere il segnale e reagire (CT-DES-016);
- il bilanciamento deve evitare che il turno garantito renda impossibile vincere.

**Sostituisce:** Nessuna. Precisa la parte lasciata aperta da CT-DES-002 e CT-DES-005.

---

## CT-DES-016 - Comportamento dell'avversario nel primo prototipo

**Stato:** REGISTRATA

**Decisione:** Nel primo prototipo l'avversario controllato dal gioco segue regole fisse e semplici, con priorità diverse per ogni fazione, così che lo stile di ciascuna fazione sia riconoscibile. Si parte da regole minime e si arricchiscono solo dopo i primi playtest. L'avversario rispetta le stesse regole d'informazione del giocatore umano: non vede la mano né informazioni nascoste e non bara. Le priorità concrete di ogni fazione restano da definire insieme alle fazioni nelle Core Rules.

**Motivazione:** CT-DES-011 prevede che il primo prototipo sia giocato da una persona contro il computer e lascia aperto il comportamento dell'avversario. CT-DES-008 chiede fazioni molto diverse già nel prototipo: un avversario che giochi tutte le fazioni allo stesso modo non lo mostrerebbe. Matteo ha scelto l'opzione **C** («Regole fisse diverse per ogni fazione»), consigliata da Cowork partendo semplice come l'opzione A. Risposta in chat: «Facciamo come suggerisci» (2026-10-31).

**Data:** 2026-10-31

**Documento interessato:** `../01-vision-concept/CT_VISION_AND_PILLARS_V0.11_BOZZA.md` (§13, §17); futuro `CT_CORE_RULES.md`; futuro `CT_PROTOTYPE_SCOPE.md`; futuro `CT_TECHNICAL_ARCHITECTURE.md`.

**Alternative considerate:**
- **A - Regole fisse e semplici, uguali per tutte le fazioni:** prevedibile, sufficiente per provare le regole.
- **B - Regole fisse con un po' di casualità:** sceglie tra mosse buone, meno ripetitivo.
- **C - Regole fisse diverse per ogni fazione:** mostra lo stile di ciascuna fazione. **Scelta**, partendo dalla semplicità di A.

**Conseguenze / documenti influenzati:**
- per ogni fazione del prototipo va scritta una breve lista di priorità dell'avversario;
- l'avversario deve reagire al segnale di vittoria imminente (CT-DES-015);
- non serve un'intelligenza artificiale avanzata prima che il core loop sia validato (Vision, §13);
- l'architettura deve tenere la logica dell'avversario separata dalle regole del gioco, così da poterla migliorare senza toccare le regole.

**Sostituisce:** Nessuna. Precisa la parte lasciata aperta da CT-DES-011.

---

## Changelog

| Versione | Stato | Modifica |
|---|---|---|
| 0.1.0 | DRAFT | Prima stesura da parte di Cowork, con le due scelte di Matteo del 2026-10-31. |
