---
title: Cosmic Horror — Master Index
status: APPROVED
version: 0.5.0
owner: Team Cosmic Horror
last_reviewed: 2026-11-01
repository_scope: GitHub
implementation_target: Claude
---

# Cosmic Horror — Master Index

Questo documento è il punto di ingresso della documentazione di **Cosmic Horror**.

> **Nome del progetto:** il gioco si chiama **Cosmic Horror** (in precedenza "Cosmic Territory"). Il prefisso `CT_` dei documenti è una sigla storica, conservata per non rompere i riferimenti incrociati.

> **Principio operativo:** il Team Cosmic Horror definisce e approva visione, requisiti, vincoli e criteri di accettazione. Cowork supporta planning, consolidamento e verifica. Claude Code revisiona e implementa soltanto specifiche approvate.

## 1. Istruzioni iniziali per Claude

Prima di qualsiasi review o implementazione:

1. leggere questo Master Index;
2. leggere `CT_COWORK_CODE_PROTOCOL_V0.2.md`;
3. identificare i documenti autorevoli elencati nel task;
4. verificarne lo stato;
5. ignorare come requisiti i documenti `IDEA`, `DRAFT`, `REVIEW` e il materiale in `reference/`, salvo istruzioni esplicite di sola analisi;
6. segnalare conflitti o informazioni mancanti prima di prendere decisioni autonome;
7. non modificare game design, lore, economia o scope per agevolare l'implementazione.

## 2. Gerarchia delle fonti

In caso di conflitto, prevale questo ordine:

1. decisioni registrate e documenti `APPROVED` più recenti;
2. specifica `APPROVED` citata nel task;
3. architettura e glossari `APPROVED` applicabili;
4. documenti `REVIEW` e `DRAFT`, utilizzabili solo come contesto non vincolante;
5. materiale in `reference/`, utilizzabile esclusivamente come consultazione.

Il repository contiene due verità distinte:

- `docs/`: stato deciso e approvato del progetto;
- `game/`: stato effettivamente implementato.

Una divergenza deve essere risolta esplicitamente, non nascosta adattando uno dei due lati.

## 3. Stati documentali

- `IDEA` — spunto non validato.
- `DRAFT` — contenuto in lavorazione.
- `REVIEW` — pronto per revisione umana.
- `APPROVED` — autorizzato per la preparazione di task implementativi.
- `IMPLEMENTED` — implementato, verificato e accettato.
- `DEPRECATED` — superato e non più autorevole.

## 4. Indice documentale

### Governance

- [`CT_COWORK_CODE_PROTOCOL_V0.2.md`](CT_COWORK_CODE_PROTOCOL_V0.2.md) — protocollo operativo tra Matteo, Cowork e Claude Code.
- [`CT_COPILOT_CLAUDE_PROTOCOL.md`](CT_COPILOT_CLAUDE_PROTOCOL.md) — `DEPRECATED`: vecchio protocollo con Copilot, non più usato.

### 00 — Project Overview

Percorso: [`00-project-overview/`](00-project-overview/)

- `01-vision-concept/` — visione, target, pilastri e confini.
- `02-roadmap/` — milestone, dipendenze e scope delle release.
- `03-decisions-changelog/` — decision log e modifiche approvate.

Documento iniziale:
- [`CT_VISION_AND_PILLARS.md`](00-project-overview/01-vision-concept/CT_VISION_AND_PILLARS.md)

### 01 — Game Design

Percorso: [`01-game-design/`](01-game-design/)

- `01-core-rules/` — loop, turni, condizioni di vittoria e regole fondamentali.
- `02-game-modes/` — modalità e varianti.
- `03-progression-economy/` — progressione, ricompense, raccolta ed economia.
- `04-balance/` — principi, metriche e revisioni di bilanciamento.

### 02 — Universe & Lore

Percorso: [`02-universe-lore/`](02-universe-lore/)

- `01-setting/` — cosmologia, temi e canone.
- `02-factions/` — identità, motivazioni e relazioni.
- `03-characters-creatures/` — personaggi e creature.
- `04-locations-timeline/` — luoghi ed eventi canonici.

### 03 — Cards & Content

Percorso: [`03-cards-content/`](03-cards-content/)

- `01-card-database/` — catalogo autorevole delle carte.
- `02-sets-expansions/` — composizione e scope dei set.
- `03-keywords-mechanics/` — glossario formale.
- `04-localization/` — terminologia e testi localizzati.

### 04 — Art & Assets

Percorso: [`04-art-assets/`](04-art-assets/)

- `01-art-direction/`
- `02-card-art/`
- `03-ui-assets/`
- `04-branding-media/`

### 05 — Technical Design

Percorso: [`05-technical-design/`](05-technical-design/)

- `01-architecture/`
- `02-data-model/`
- `03-networking-backend/`
- `04-build-deployment/`

### 06 — UX & UI

Percorso: [`06-ux-ui/`](06-ux-ui/)

- `01-user-flows/`
- `02-wireframes/`
- `03-screens-components/`
- `04-ux-research/`

### 07 — Development

Percorso: [`07-development/`](07-development/)

- `01-godot-project/`
- `02-features-systems/`
- `03-integrations/`
- `04-releases/`

### 08 — AI & Prompts

Percorso: [`08-ai-prompts/`](08-ai-prompts/)

- `01-llm-prompts/`
- `02-image-generation/`
- `03-workflows-automation/`
- `04-experiments/`

### 09 — Testing & QA

Percorso: [`09-testing-qa/`](09-testing-qa/)

- `01-test-plans/`
- `02-bugs-issues/`
- `03-playtesting/`
- `04-reports/`

### 10 — Marketing & Publishing

Percorso: [`10-marketing-publishing/`](10-marketing-publishing/)

- `01-brand-positioning/`
- `02-social-content/`
- `03-store-publishing/`
- `04-press-community/`

### 99 — Archive

Percorso: [`99-archive/`](99-archive/)

Contiene materiale storico o superato. Claude non deve usarlo come specifica corrente.

## 5. Materiale di riferimento

Il materiale non operativo si trova in [`../reference/`](../reference/).

Regole:

- non costituisce automaticamente canone o requisito;
- non deve essere copiato o riprodotto senza verifica dei diritti;
- eventuali conclusioni utili al progetto devono essere trasformate in decisioni originali e documentate in `docs/`;
- i file pesanti possono richiedere Git LFS.

## 6. Documenti prioritari

| Ordine | Documento | Stato atteso |
|---:|---|---|
| 1 | `CT_VISION_AND_PILLARS_V0.x_BOZZA.md` (in `00-project-overview/01-vision-concept/`; la versione più alta è quella valida) | `APPROVED` |
| 2 | `CT_CORE_RULES_V0.x.md` (in `01-game-design/01-core-rules/`; la versione più alta è quella valida) | `APPROVED` |
| 3 | `CT_LORE_BIBLE.md` | `APPROVED` |
| 4 | `CT_MECHANICS_GLOSSARY.md` | `APPROVED` |
| 5 | `CT_PROTOTYPE_SCOPE.md` | `APPROVED` |
| 6 | `CT_TECHNICAL_ARCHITECTURE.md` | `APPROVED` |
| 7 | `CT_USER_FLOWS.md` | `APPROVED` |
| 8 | `CT_ROADMAP.md` | `APPROVED` |
| 9 | `CT_ACCEPTANCE_TEST_PLAN.md` | `APPROVED` |

L'ordine indica la dipendenza logica iniziale, non autorizza automaticamente la produzione o implementazione dei documenti successivi.

## 7. Modello minimo di specifica

```markdown
---
title: Titolo
status: DRAFT
version: 0.1.0
owner: Team Cosmic Horror
last_reviewed: YYYY-MM-DD
related_documents: []
---

# Obiettivo
# Contesto
# Scope incluso
# Fuori scope
# Requisiti funzionali
# Requisiti non funzionali
# Vincoli
# Dipendenze
# Criteri di accettazione
# Test richiesti
# Questioni aperte
```

Una specifica può passare ad `APPROVED` soltanto quando non contiene decisioni bloccanti irrisolte.

## 8. Modello minimo di task per Claude

```markdown
# CT-FEAT-XXX — Titolo

## Documenti autorevoli
## Obiettivo
## Scope incluso
## Fuori scope
## Vincoli tecnici
## Criteri di accettazione
## Test obbligatori
## Output richiesto
```

Claude deve produrre prima un pre-flight plan e, al termine, un Implementation Report.

## 9. Definition of Ready

- [ ] ID assegnato.
- [ ] Documenti autorevoli `APPROVED`.
- [ ] Scope e fuori scope espliciti.
- [ ] Dipendenze disponibili.
- [ ] Criteri di accettazione verificabili.
- [ ] Test minimi definiti.
- [ ] Nessuna decisione bloccante aperta.

## 10. Definition of Done

- [ ] Codice o contenuto completato.
- [ ] Test obbligatori superati.
- [ ] Implementation Report presente.
- [ ] Nessuna deviazione non autorizzata.
- [ ] Acceptance criteria verificati.
- [ ] Review umana completata.
- [ ] Documentazione aggiornata.

## 11. Convenzioni Git

- `main` contiene contenuti approvati e implementazioni accettate.
- Il planning avviene su `planning/<id>-descrizione`.
- Le funzionalità avvengono su `feature/<id>-descrizione`.
- Le correzioni avvengono su `fix/<id>-descrizione`.
- Ogni Pull Request cita ID, documenti autorevoli, test e deviazioni.
- Claude non esegue merge autonomi salvo autorizzazione esplicita del team.

## 12. Questioni iniziali aperte

- genere e core loop definitivo;
- piattaforma iniziale;
- modalità principale;
- sistema territorio;
- sistema potere-conseguenze;
- fazioni del prototipo;
- ruolo del deckbuilding;
- direzione multiplayer/PvE;
- modello economico;
- rapporto tra canone originale e riferimenti lovecraftiani;
- scope minimo del prototipo;
- criteri di validazione del concept.

## 13. Changelog

| Versione | Stato | Modifica |
|---|---|---|
| 0.1.0 | DRAFT | Prima struttura per SharePoint. |
| 0.2.0 | DRAFT | Adattamento a repository GitHub unico con link relativi e separazione `docs/`, `reference/`, `game/`, `tools/`, `tests/`. |
| 0.2.1 | DRAFT | Progetto rinominato in Cosmic Horror; il prefisso `CT_` dei documenti resta invariato. |
| 0.3.0 | DRAFT | Preparata da Cowork. Copilot sostituito da Cowork nel principio operativo; protocollo di riferimento ora `CT_COWORK_CODE_PROTOCOL_V0.1.md`; vecchio protocollo Copilot-Claude segnato `DEPRECATED`. Nessun'altra modifica. |
| 0.4.0 | DRAFT | Preparata da Cowork. §6: Vision e Core Rules indicate con il nome reale dei file versionati e la loro cartella. Nessun'altra modifica. |
| 0.5.0 | APPROVED | Approvato da Matteo il 2026-11-01. Riferimenti al protocollo aggiornati a `CT_COWORK_CODE_PROTOCOL_V0.2.md`. Nessun'altra modifica. |
