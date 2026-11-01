---
id: CT-DEL-003
fase: piano
pronto: si
tipo: deleghe
branch: nessuno
scritto_da: Cowork (chat Claude del progetto)
data: 2026-11-01
fusioni: 72@c2e5529755042f83472653eb76f8e06fc1a8a754
file_attesi_72: docs/00_MASTER_INDEX.md, docs/00-project-overview/02-roadmap/, docs/00-project-overview/03-decisions-changelog/, docs/01-game-design/01-core-rules/, docs/03-cards-content/01-card-database/, game/prototipo/
---

# CT-DEL-003 — Fusione della PR 72 (gioco a 5 territori)

## Documenti autorevoli
- `docs/CT_COWORK_CODE_PROTOCOL_V0.4.md` §3 (APPROVED).
- Matteo in chat a Cowork il 2026-11-01: «ok procediamo», in risposta alla proposta di fondere la PR 72 con un task dedicato. Cowork chiederà a Matteo la conferma esplicita «fondi la 72» prima della fase esecuzione. Cowork ha letto l'elenco dei file della PR su GitHub: 51 file, solo nelle cartelle di `file_attesi_72`.

## Obiettivo
Fondere la PR 72 tramite lo script. Task dedicato: nessun lavoro nuovo.

## Scope incluso
1. Fase `piano`: in sola lettura, controlla con `gh pr view 72` che la PR sia aperta, verso `main`, testa uguale allo sha di `fusioni`, fondibile senza conflitti (main è avanzato con PR 71 e 73), e che i file toccati stiano dentro `file_attesi_72`. Riporta l'esito. Non fondere.
2. Fase `esecuzione` (solo dopo il via di Matteo): nessuna modifica; ripeti i controlli in sola lettura e chiudi con esito FATTO. La fusione la esegue lo script.

## Fuori scope
Qualsiasi modifica, commit, branch, push o PR (anche la descrizione della PR).

## Vincoli tecnici
Sola lettura. Repository su `main`, pulito.

## Criteri di accettazione
- Piano: controlli tutti positivi.
- Esecuzione: lo script scrive «FUSA» per la PR 72.

## Test obbligatori
Nessuno oltre ai controlli del punto 1.

## Output richiesto
Resoconto breve con l'esito dei controlli.
