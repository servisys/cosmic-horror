---
title: Cosmic Horror - Decision Log CT-DES-066 (i Risvegliati contendono i territori dal primo turno)
status: DRAFT
version: 0.1.1
owner: Matteo
prepared_by: Cowork
project_prefix: CT_
last_reviewed: 2026-10-31
---

# Cosmic Horror - Decision Log CT-DES-066

> La voce ha `Stato: REGISTRATA`. Nasce dalle 1000 partite del motore dopo CT-DES-065 (Custodi 58,5%, Risvegliati 40,6%). Matteo ha deciso in chat il 2026-10-31: «il pc deve iniziare a combattere dal primo turno». Secondo le Regole V0.2 (regola 4) la registrazione è effettiva con il merge di questo documento in `main`.

## CT-DES-066 - I Risvegliati contendono i territori dal primo turno

**Stato:** SUPERATA (da CT-DES-067, 2026-10-31)

**Decisione:** Nella tabella delle priorità del computer (regole base, §10) la priorità 3 dei Risvegliati non richiede più instabilità 3 o più. Diventa: **gioca presenze su un territorio senza rito dove la sua forza è minore o uguale a quella dell'avversario; tra più territori sceglie quello con l'instabilità più alta**. Le altre priorità restano uguali.

**Motivazione:** Con la condizione «instabilità 3 o più» il computer dei Risvegliati lasciava il campo ai Custodi nei primi giri, quando l'instabilità è ancora bassa, e arrivava al rito senza la forza necessaria. Nelle 1000 partite del motore i Custodi vincevano il 58,5%. Matteo: «il pc deve iniziare a combattere dal primo turno» (2026-10-31).

**Data:** 2026-10-31

**Documento interessato:** regole base, §10 (priorità del computer); `game/prototipo/` (modulo del computer).

**Alternative considerate:**
- Lasciare la priorità 3 com'è (CT-DES-065).
- Abbassare la soglia a 2.
- Togliere la soglia e scegliere il territorio con l'instabilità più alta. **Scelta.**

**Conseguenze / documenti influenzati:** regole base portate alla versione 0.10 (§10 e changelog); computer del prototipo aggiornato; nuove 1000 partite per verificare l'equilibrio.

**Sostituisce:** nulla. Modifica solo la priorità 3 dei Risvegliati di CT-DES-065, che resta REGISTRATA per tutto il resto.

---

## Changelog

| Versione | Stato | Modifica |
|---|---|---|
| 0.1.0 | DRAFT | Prima stesura di Cowork con la scelta di Matteo del 2026-10-31. |
| 0.1.1 | DRAFT | CT-DES-066 segnata `SUPERATA` da CT-DES-067. Testo invariato. |
