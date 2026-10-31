---
title: Cosmic Horror - Decision Log CT-DES-063 (specifica del prototipo)
status: DRAFT
version: 0.1.0
owner: Matteo
prepared_by: Cowork
project_prefix: CT_
last_reviewed: 2026-10-31
---

# Cosmic Horror - Decision Log CT-DES-063

> La voce ha `Stato: REGISTRATA`. Matteo ha risposto «ok» in chat il 2026-10-31 alla specifica del prototipo e alle quattro scelte consigliate da Cowork. Secondo le Regole V0.2 (regola 4) la registrazione è effettiva con il merge di questo documento in `main`.

## CT-DES-063 - Specifica del primo prototipo giocabile

**Stato:** REGISTRATA

**Decisione:** La specifica del primo prototipo (`CT_PROTOTYPE_SCOPE_V0.2.md`) è approvata. Il prototipo si gioca da un link privato di Claude, sul telefono solo in orizzontale e sul PC; la prima versione ha una grafica essenziale; il computer gioca una mossa alla volta con una breve pausa e una frase di spiegazione. Il lavoro procede in cinque tappe, ciascuna con la sua verifica.

**Motivazione:** Le regole base sono approvate (CT-DES-059). Il Master Index chiede una specifica `APPROVED` prima dell'implementazione. Le quattro scelte privilegiano una prova veloce sul telefono, senza installazioni. Matteo: «ok» (2026-10-31).

**Data:** 2026-10-31

**Documento interessato:** `../02-roadmap/CT_PROTOTYPE_SCOPE_V0.2.md`; `game/prototipo/` (nuova); futura nota di architettura in `../../05-technical-design/01-architecture/`.

**Alternative considerate:**
- Dove si gioca: link privato di Claude (**scelto**); GitHub Pages; solo PC.
- Telefono: solo orizzontale (**scelto**); anche verticale.
- Grafica: essenziale (**scelta**); già curata.
- Turno del computer: una mossa alla volta (**scelto**); tutte insieme.

**Conseguenze / documenti influenzati:** Claude Code inizia l'implementazione dalla tappa 1; la pubblicazione per il playtest usa la pagina privata di Claude; le app installabili restano rimandate.

**Sostituisce:** Nessuna.

---

## Changelog

| Versione | Stato | Modifica |
|---|---|---|
| 0.1.0 | DRAFT | Prima stesura di Cowork con la scelta di Matteo del 2026-10-31. |
