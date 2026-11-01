---
id: CT-TEST-001
fase: piano
pronto: si
branch: nessuno
scritto_da: chat Claude del progetto
data: 2026-11-01
---

# CT-TEST-001 — Prova del canale automatico

## Documenti autorevoli
- `docs/00_MASTER_INDEX.md`
- `docs/CT_COWORK_CODE_PROTOCOL_V0.1.md`

## Obiettivo
Verificare che l'esecuzione automatica funzioni, senza toccare nulla.

## Scope incluso
1. Riporta il branch attuale del repository e l'ultimo commit di `main` (SHA breve e data).
2. Riporta se `strumenti/windows-scambio/` esiste sul branch attuale.
3. Conta le PR aperte con `gh pr list`, se `gh` risponde; altrimenti scrivi che non è disponibile.
4. Prova a leggere un file qualsiasi e a fare `git status`, e conferma che non hai potuto modificare nulla.

## Fuori scope
Qualsiasi modifica, commit, push o PR.

## Criteri di accettazione
- Il resoconto arriva in `REPORT.md` sul branch `scambio`.
- Nessuna modifica nel repository.

## Output richiesto
Resoconto breve in italiano con i punti 1–4.
