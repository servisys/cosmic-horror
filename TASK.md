---
id: CT-DOC-003
fase: piano
pronto: si
branch: planning/ct-doc-003-riferimenti-protocollo
scritto_da: Cowork (chat Claude del progetto)
data: 2026-11-01
---

# CT-DOC-003 — Riferimenti al protocollo vecchio in README e Vision

## Documenti autorevoli
- `docs/00_MASTER_INDEX.md` (APPROVED 0.6.0) e `docs/CT_COWORK_CODE_PROTOCOL_V0.4.md` (APPROVED), §5 Regole sui file.
- Richiesta di Matteo in chat a Cowork il 2026-11-01 («3», cioè il task per README e Vision).

## Obiettivo
Far puntare al protocollo in vigore (V0.4) i documenti che citano ancora la V0.1, senza cambiare nient'altro.

## Scope incluso
1. `README.md` riga 10: link al protocollo da `CT_COWORK_CODE_PROTOCOL_V0.1.md` a `CT_COWORK_CODE_PROTOCOL_V0.4.md`.
2. `docs/00-project-overview/01-vision-concept/CT_VISION_AND_PILLARS_V0.11_BOZZA.md` (DRAFT): riferimenti alla V0.1 in `related_documents` e nel testo (riga 53 circa). Il file è versionato: secondo le regole sui file proponi tu se serve una nuova versione (per esempio V0.12, con la V0.11 DEPRECATED) o se un aggiornamento di soli riferimenti nello stesso file è accettabile; spiega pro e contro in parole semplici.
3. Cerca in tutto il repository (esclusi `scambio/`, `reference/` e i documenti DEPRECATED o storici) altri riferimenti a `CT_COWORK_CODE_PROTOCOL_V0.1`, `_V0.2` o `_V0.3` che dovrebbero puntare alla V0.4 ed elencali nel piano.
4. PR verso `main`, descrizione in italiano.

## Fuori scope
- Documenti DEPRECATED o storici (per esempio `CT_COPILOT_CLAUDE_PROTOCOL.md`, i protocolli V0.1–V0.3, i changelog, i decision log già registrati): le parti superate si segnalano, non si correggono.
- Qualsiasi altra modifica al testo, al gioco o allo script.
- Fusioni o chiusure di PR.

## Vincoli tecnici
- Base `main`. Push solo con `git push -u origin HEAD`, poi `git switch main`.

## Criteri di accettazione
- README e Vision (o la sua nuova versione) puntano alla V0.4.
- Diff limitato ai riferimenti (più eventuale front matter e changelog se nasce una nuova versione).

## Test obbligatori
- `git diff --stat` e diff completo nel resoconto.
- Ricerca finale: nessun riferimento alla V0.1–V0.3 rimasto fuori dai documenti storici/DEPRECATED, salvo quelli segnalati.

## Output richiesto
- Fase `piano`: pre-flight plan con la scelta del punto 2, l'elenco del punto 3, file toccati, domande per Matteo.
- Fase `esecuzione` (solo dopo nuovo via): Implementation Report con commit e PR.
