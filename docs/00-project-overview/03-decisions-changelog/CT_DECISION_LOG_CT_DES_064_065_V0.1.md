---
title: Cosmic Horror - Decision Log CT-DES-064…065 (chiarimenti dal motore e priorità del computer)
status: DRAFT
version: 0.1.0
owner: Matteo
prepared_by: Cowork
project_prefix: CT_
last_reviewed: 2026-10-31
---

# Cosmic Horror - Decision Log CT-DES-064…065

> Le due voci hanno `Stato: REGISTRATA`. Nascono dal resoconto di Claude Code sul motore del prototipo (27 punti poco chiari e differenza di equilibrio tra fazioni). Cowork ha proposto la correzione; Matteo ha risposto «ok» in chat il 2026-10-31. Secondo le Regole V0.2 (regola 4) la registrazione è effettiva con il merge di questo documento in `main`.

## CT-DES-064 - Chiarimenti alle regole emersi dal motore

**Stato:** REGISTRATA

**Decisione:** Le interpretazioni elencate nel §13 delle regole base V0.9 valgono come regole. Comprendono: forza minima 0; nuova carta di riserva quando si riprende il controllo; trasformazioni a ogni salita oltre 3, 6 e 9; ordine della fine del giro; rimescolamento degli eventi; nessun limite di giri; turno di avviso anche per il Sigillo gratis; Cerchio dei Vigilanti; sconti cumulabili con costo minimo 0; carte giocabili senza bersagli; parità risolte con il seme; «forza 1 o meno» come forza effettiva. Corregge inoltre due carte: la **Fattoria Barricata** è protetta da azioni che costano **4 o meno** (prima 2 o meno, valore che non la proteggeva mai) e il malus del **Tenebroso** dura fino a fine partita. Il formato dei file dati diventa YAML 1.2 valido, con le stringhe su una sola riga, e le carte di riserva ricevono un `id`.

**Motivazione:** Claude Code, scrivendo il motore (PR #50), ha trovato 27 punti in cui il testo non bastava e li ha risolti nel modo più letterale. Cowork ne conferma l'interpretazione e corregge la Fattoria Barricata, che con i dati attuali non aveva effetto. Matteo: «ok» (2026-10-31).

**Data:** 2026-10-31

**Documento interessato:** regole base in `../../01-game-design/01-core-rules/` (V0.9, §13); carte ed eventi in `../../03-cards-content/01-card-database/` (V0.5).

**Alternative considerate:**
- Lasciare le interpretazioni solo nel codice.
- Scriverle nelle regole e correggere le carte che non funzionano. **Scelta.**

**Conseguenze / documenti influenzati:** il motore va allineato sulla Fattoria Barricata, sul Tenebroso e sul lettore dei file (non servono più le righe di continuazione); i test vanno aggiornati.

**Sostituisce:** Nessuna. Precisa CT-DES-021…058.

---

## CT-DES-065 - Priorità del computer, seconda versione

**Stato:** REGISTRATA

**Decisione:** Il computer segue le priorità della tabella del §10 delle regole base V0.9. Rispetto a CT-DES-045 cambiano tre cose: le priorità 1 sono precisate (dove agire quando l'avversario è a un passo dalla vittoria); i Risvegliati hanno una nuova priorità 3, cioè giocare presenze dove l'instabilità è almeno 3 e la loro forza non supera quella dell'avversario, per poter completare un rito; le altre priorità dei Risvegliati scendono di un posto.

**Motivazione:** Dopo CT-DES-055 il rito richiede almeno tanta forza quanto l'avversario, ma la tabella di CT-DES-045, scritta prima, non dava al computer dei Risvegliati un modo di contendere i territori. Nelle 1000 partite del motore i Risvegliati vincevano il 39% contro il 47% del simulatore. Matteo: «ok» (2026-10-31).

**Data:** 2026-10-31

**Documento interessato:** regole base V0.9, §10; `game/prototipo/` (modulo del computer).

**Alternative considerate:**
- Lasciare la tabella di CT-DES-045.
- Aggiungere la priorità per contendere i territori. **Scelta.**

**Conseguenze / documenti influenzati:** il computer del prototipo va aggiornato; nuove 1000 partite per verificare l'equilibrio.

**Sostituisce:** CT-DES-045 (resta nel Decision Log come `SUPERATA`).

---

## Changelog

| Versione | Stato | Modifica |
|---|---|---|
| 0.1.0 | DRAFT | Prima stesura di Cowork con la scelta di Matteo del 2026-10-31. |
