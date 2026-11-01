---
id: CT-DOC-001
fase: piano
pronto: si
branch: planning/ct-doc-001-approvazioni
scritto_da: Cowork (chat Claude del progetto)
data: 2026-11-01
---

# CT-DOC-001 — Approvazione del Master Index e del protocollo Cowork-Code

## Documenti autorevoli
- Approvazione di Matteo, data in chat a Cowork il 2026-11-01: «ok approvo Master Index e protocollo».
- `docs/00_MASTER_INDEX.md` (oggi `status: DRAFT`, v0.4.0) — §3 Stati documentali, §5 Regole sui file del protocollo.
- `docs/CT_COWORK_CODE_PROTOCOL_V0.2.md` (oggi `status: DRAFT`, solo sul branch `feature/ct-scambio-automatico`, PR aperta non fusa).
- `docs/CT_COWORK_CODE_PROTOCOL_V0.1.md` (su `main`, `status: DRAFT`).

## Obiettivo
Portare il Master Index e il protocollo Cowork-Code V0.2 allo stato `APPROVED`, così i task del canale automatico hanno documenti di governance approvati. Primo task reale del canale: serve anche a provare dal vivo la fase `esecuzione`.

## Scope incluso
1. Master Index: `status: APPROVED`, versione aumentata secondo le regole del progetto (il file non ha la versione nel nome: proponi tu come gestirlo, senza rinominarlo se non è necessario), `last_reviewed: 2026-11-01`, riga nel changelog «approvato da Matteo il 2026-11-01». Nessun'altra modifica al testo.
2. Protocollo: la V0.2 diventa `APPROVED` (tolta la riga «PROPOSTA ... DA CONFERMARE DA MATTEO» in testa, riga nel changelog); la V0.1 diventa `DEPRECATED` senza altre modifiche al testo. Il Master Index, se cita il protocollo, deve puntare alla V0.2.
3. Problema da risolvere nel piano: la V0.2 esiste solo sul branch `feature/ct-scambio-automatico`, la cui PR non è fusa. Proponi la strada più pulita (per esempio: branch `planning/ct-doc-001-approvazioni` creato da `feature/ct-scambio-automatico`, così la PR di questo task si appoggia a quella; oppure solo il Master Index ora e il protocollo dopo la fusione) e spiega pro e contro in parole semplici.
4. Una PR verso `main` (o verso il branch indicato nel piano) con descrizione in italiano.

## Fuori scope
- Fusioni, chiusure di PR, cancellazione di branch: le decide Matteo direttamente.
- Qualsiasi altro documento, codice del gioco, regole, carte.
- Cambiare lo stato di altri documenti DRAFT.

## Vincoli tecnici
- Lavora solo sul branch `planning/ct-doc-001-approvazioni`; nessun push su `main`.
- Regole sui file del protocollo: niente sovrascritture di contenuto storico, nome del file e `version` coerenti, niente segreti.
- Lascia il repository di lavoro pulito e torna su `main` alla fine.

## Criteri di accettazione
- Master Index e protocollo V0.2 con `status: APPROVED`, protocollo V0.1 con `status: DEPRECATED`.
- Diff limitato al front matter, alla riga in testa della V0.2 e alle righe di changelog (più l'eventuale riferimento alla V0.2 nel Master Index).
- PR aperta, non fusa.

## Test obbligatori
- `git diff --stat` e diff completo nel resoconto.
- Controllo che nessun file fuori da `docs/` sia cambiato.

## Output richiesto
- Fase `piano`: pre-flight plan con la scelta del punto 3, file toccati, rischi, domande per Matteo.
- Fase `esecuzione` (solo dopo nuovo via): Implementation Report con commit, PR, cosa non è stato verificato.
