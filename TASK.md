---
id: CT-DEL-005
fase: piano
pronto: si
tipo: deleghe
branch: nessuno
scritto_da: Cowork (chat Claude del progetto)
data: 2026-11-01
fusioni: 75@fb4d5f57dea0c36ac498e8981879ab3ecf01ab4d
file_attesi_75: docs/05-technical-design/04-build-deployment/, strumenti/mac-mini/
---

# CT-DEL-005 — Fusione della PR 75 (Node per il job del Mac, aggiornamento automatico)

## Documenti autorevoli
- `docs/CT_COWORK_CODE_PROTOCOL_V0.4.md` §3 (APPROVED).
- Cowork ha letto il diff della PR 75 (7 file, tutti in `docs/05-technical-design/04-build-deployment/` e `strumenti/mac-mini/`); GitHub la dà fondibile (clean).

## Via di Matteo
Matteo ha confermato in chat a Cowork il 2026-11-01 alle 23:10: «sì vai», in risposta a «Mi serve il tuo sì per fondere: scrivimi "fondi 75"». Come da protocollo il task parte in fase piano; Cowork lo passa a esecuzione se i controlli sono positivi.

## Scope incluso
Nessuna modifica. In sola lettura controlla con `gh pr view 75` che la PR sia aperta, verso `main`, testa uguale allo sha di `fusioni`, fondibile, file dentro `file_attesi_75`; chiudi con FATTO. La fusione la esegue lo script. Se un controllo non torna, chiudi con esito negativo e non fondere.

## Fuori scope
Qualsiasi modifica, commit, branch, push o PR.

## Criteri di accettazione
Lo script scrive «FUSA» per la PR 75.
