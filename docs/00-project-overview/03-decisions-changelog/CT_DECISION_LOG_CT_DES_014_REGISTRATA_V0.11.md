---
title: Cosmic Horror - Registrazione CT-DES-014
status: DRAFT
version: 0.1.0
owner: Matteo
project_prefix: CT_
---

# Cosmic Horror - Registrazione CT-DES-014

> Documento preparato per il processo di registrazione. In base alle regole del Decision Log, la voce diventa registrata soltanto quando questo documento, contenente esplicitamente `Stato: REGISTRATA`, viene unito nel ramo `main`.

## CT-DES-014 - Motore e stack tecnologico

**Decisione:** CT-DES-014

**Stato:** REGISTRATA

**Decisione:** Cosmic Horror utilizza il percorso web come stack tecnologico del prototipo e del successivo sviluppo. Il percorso Godot viene abbandonato. Lo stack web specifico, il framework/rendering, il packaging per Windows, macOS, Android e iOS e la relativa architettura restano da definire in specifiche tecniche dedicate.

**Motivazione:** Matteo ha deciso: «basta usiamo il web abbandoniamo Godot». La decisione segue la prova comparativa CT-TECH-001, la revisione delle evidenze C1-C5, le prove su iPhone reale e il concept grafico esplorativo del percorso web. La scelta riguarda il percorso tecnologico; non approva automaticamente una specifica libreria, un wrapper desktop/mobile o un'architettura definitiva.

**Data:** 2026-10-30

**Documento interessato:**

- futuro `CT_TECHNICAL_ARCHITECTURE.md`;
- `07-development/`;
- documentazione Build & Deployment;
- future specifiche per packaging Windows, macOS, Android e iOS;
- future specifiche per pipeline grafica e asset.

**Alternative considerate:**

- **Godot 4 + GDScript:** motore integrato per 2D/3D, build native e progetto relativamente compatto.
- **Stack web TypeScript:** applicazione web con logica separata dalla grafica, rendering 2D/3D e packaging multipiattaforma da definire.
- **Unity:** motore 2D/3D con ecosistema ampio, non selezionato.
- **Unreal Engine:** motore orientato a produzioni 3D complesse, non selezionato.

**Conseguenze / documenti influenzati:**

- Godot non è più un percorso attivo per il prototipo o per lo sviluppo successivo;
- il repository e le future specifiche tecniche devono assumere uno stack web;
- la tecnologia web concreta resta da scegliere e documentare;
- il packaging per Windows, macOS, Android e iOS deve essere validato separatamente;
- le prove Godot già prodotte restano materiale storico della valutazione e non vanno trattate come implementazione attiva;
- i risultati CT-TECH-001 rimangono evidenze, ma non autorizzano automaticamente ulteriori implementazioni.

**Sostituisce:** aggiorna sostanzialmente la precedente proposta `CT-DES-014`, che dichiarava il motore non ancora scelto. Poiché quella voce era `PROPOSTA` e non `REGISTRATA`, non viene creata una nuova decisione sostitutiva: l'ID `CT-DES-014` viene mantenuto e portato a registrazione con il contenuto definitivo sopra riportato.

## Gate di registrazione

- Prima del merge: il presente file è `DRAFT`; `CT-DES-014` è preparata con `Stato: REGISTRATA` ma non è ancora registrata nel repository autorevole.
- Dopo il merge in `main`: `CT-DES-014` risulta registrata secondo `CT_DECISION_LOG_REGOLE_V0.2.md`.

## Azioni non autorizzate da questa decisione

Questa decisione non autorizza da sola:

- la scelta automatica fra PixiJS, Phaser, Three.js o altre librerie;
- la scelta automatica fra Tauri, Electron, Capacitor o altri wrapper;
- la modifica delle Core Rules;
- l'implementazione di feature non coperte da specifiche approvate;
- la cancellazione delle evidenze storiche Godot.
