---
title: Cosmic Horror - Decision Log CT-DES-067 (i Risvegliati contendono dove l'instabilità è almeno 2)
status: DRAFT
version: 0.1.0
owner: Matteo
prepared_by: Cowork
project_prefix: CT_
last_reviewed: 2026-10-31
---

# Cosmic Horror - Decision Log CT-DES-067

> La voce ha `Stato: REGISTRATA`. Nasce dalle prove di Code su 6 modi di giocare del computer dei Risvegliati (1000 partite ciascuno). Cowork ha proposto il compromesso; Matteo ha risposto «ok prosegui» in chat il 2026-10-31. Secondo le Regole V0.2 (regola 4) la registrazione è effettiva con il merge di questo documento in `main`.

## CT-DES-067 - I Risvegliati contendono dove l'instabilità è almeno 2

**Stato:** REGISTRATA

**Decisione:** Nella tabella delle priorità del computer (regole base, §10) la priorità 3 dei Risvegliati diventa: **gioca presenze su un territorio senza rito dove la sua forza è minore o uguale a quella dell'avversario e dove l'instabilità è almeno 2 oppure ha già una presenza; tra più territori sceglie quello con l'instabilità più alta**. Le altre priorità restano uguali.

**Motivazione:** Con CT-DES-066 (contendere ovunque dal primo turno) i Risvegliati del computer vincevano il 29% delle partite contro il 40,6% di prima: spendevano l'energia in presenze lontane dai riti. Tra le varianti provate, questa (V2 nelle prove di Code) tiene l'idea di combattere presto e torna quasi al livello di prima (39,5%). Matteo: «ok prosegui» (2026-10-31).

**Data:** 2026-10-31

**Documento interessato:** regole base, §10 (priorità del computer); `game/prototipo/` (modulo del computer).

**Alternative considerate:**
- CT-DES-066 così com'è (29%).
- Tornare a CT-DES-065 (40,6%), ma il computer non combatte nei primi giri.
- Una presenza per turno, o dare precedenza all'instabilità (27-28%).
- Instabilità almeno 2 oppure presenza già sul territorio (39,5%). **Scelta.**

**Conseguenze / documenti influenzati:** regole base portate alla versione 0.11; computer del prototipo aggiornato. Lo squilibrio che resta (Custodi circa 60%) si valuta dopo le partite di prova di Matteo, probabilmente con i numeri delle carte e non con il computer.

**Sostituisce:** CT-DES-066 (resta nel Decision Log come `SUPERATA`).

---

## Changelog

| Versione | Stato | Modifica |
|---|---|---|
| 0.1.0 | DRAFT | Prima stesura di Cowork con la scelta di Matteo del 2026-10-31. |
