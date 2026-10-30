---
title: Cosmic Horror - Aggiornamento CT-DES-014
status: DRAFT
version: 0.13.0
owner: Matteo
prepared_by: Cowork
supersedes: CT_DECISION_LOG_CT_DES_014_REGISTRATA_V0.12.md
project_prefix: CT_
last_reviewed: 2026-10-31
---

# Cosmic Horror - Aggiornamento CT-DES-014

> **CORREZIONE DI COWORK, DA CONFERMARE DA MATTEO.** Questa versione corregge solo lo stato del documento (banner, sezione di registrazione, versione). **Il testo della decisione è identico a quello della V0.12.**

## CT-DES-014 - Motore e percorso tecnologico

**Decisione:** CT-DES-014  
**Stato:** REGISTRATA

**Decisione:** Cosmic Horror utilizza il percorso web come base tecnologica del prototipo e dello sviluppo successivo. Il percorso Godot viene abbandonato. Lo stack applicativo di riferimento è web/TypeScript; librerie, framework di rendering e soluzioni di pacchettizzazione restano da definire nei documenti tecnici dedicati.

**Motivazione:** Matteo ha espresso la decisione testuale: «basta usiamo il web abbandoniamo Godot». La scelta segue la prova comparativa CT-TECH-001, le verifiche su PC e iPhone reale e l'esplorazione grafica effettuata sul percorso web. La formulazione non registra automaticamente una specifica libreria, un wrapper desktop/mobile o un'architettura definitiva.

**Data:** 2026-10-30

**Documento interessato:**

- futuro `docs/05-technical-design/01-architecture/CT_TECHNICAL_ARCHITECTURE.md`;
- futuro `docs/00-project-overview/02-roadmap/CT_PROTOTYPE_SCOPE.md` oppure altro percorso definitivo da stabilire nel Master Index;
- cartella esistente `docs/07-development/`;
- futuri documenti in `docs/05-technical-design/04-build-deployment/`;
- future specifiche di packaging Windows, macOS, Android e iOS.

**Alternative considerate:**

- **Godot 4/GDScript:** motore integrato per 2D/3D e build native; valutato nella prova CT-TECH-001 e successivamente escluso da Matteo.
- **Stack web TypeScript:** percorso scelto; renderer 2D/3D, framework applicativo e packaging restano da formalizzare.
- **Unity:** valutato come motore completo con ecosistema ampio, ma non scelto.
- **Unreal Engine:** valutato come motore potente per produzioni 3D complesse, ma non scelto.

**Conseguenze / documenti influenzati:**

- le nuove implementazioni del prototipo devono proseguire sul percorso web;
- non devono essere aperte nuove attività Godot, salvo eventuali esigenze archivistiche o di conservazione delle evidenze della prova;
- il repository deve mantenere le evidenze Godot di CT-TECH-001 come materiale storico, senza trattarle come percorso attivo;
- devono essere definite separatamente le scelte relative a framework/rendering web, architettura, test, packaging e distribuzione;
- il packaging per Windows, macOS, Android e iOS richiede una specifica e una prova dedicate;
- la scelta non approva automaticamente Capacitor, Tauri, Electron o altre tecnologie accessorie;
- la scelta non modifica le Core Rules né introduce regole di gioco.

**Sostituisce:** la precedente formulazione di `CT-DES-014`, che dichiarava il motore non ancora scelto. L'ID viene mantenuto perché il presente documento aggiorna direttamente la decisione tecnica già identificata come `CT-DES-014`.

## Stato di registrazione

Secondo `CT_DECISION_LOG_REGOLE_V0.2.md` (regola 4), il merge in `main` registra soltanto le voci che nel documento hanno `Stato: REGISTRATA`.

La V0.12 di questo documento è stata fusa in `main` con la PR #28 (commit di merge `129cfdb`): **CT-DES-014 è registrata.** Conferma di Matteo in chat il 2026-10-30: «ok approvato usiamo il web».

La registrazione riguarda il percorso web. Non approva librerie, wrapper di packaging o architettura definitiva (vedi sopra).

## Changelog

| Versione | Stato | Modifica |
|---|---|---|
| 0.1.0 (file V0.11) | DRAFT | Prima predisposizione della registrazione di CT-DES-014 (Copilot). Sostituita dalla V0.12. |
| 0.1.0 (file V0.12) | DRAFT | Aggiornamento del testo (Copilot). Il numero di versione nel front matter non coincideva con il nome del file. |
| 0.13.0 | DRAFT | Solo stato del documento: tolto il banner «proposta di Copilot, da confermare» e la sezione «Condizione di efficacia» (superata dal merge), aggiunta la sezione «Stato di registrazione», allineati nome file e versione. Testo della decisione invariato. |
