---
id: CT-DEL-001
fase: piano
pronto: si
tipo: deleghe
branch: nessuno
scritto_da: Cowork (chat Claude del progetto)
data: 2026-11-01
fusioni: 70@084d1d087bdf6d10c353ae724727346394be3854
file_attesi_70: docs/00_MASTER_INDEX.md, docs/CT_COWORK_CODE_PROTOCOL_V0.2.md, docs/CT_COWORK_CODE_PROTOCOL_V0.3.md, docs/CT_COWORK_CODE_PROTOCOL_V0.4.md, strumenti/windows-scambio/LEGGIMI.md, strumenti/windows-scambio/osserva-scambio.ps1, strumenti/windows-scambio/prove/deleghe/
---

# CT-DEL-001 — Fusione della PR 70 (protocollo V0.4)

## Documenti autorevoli
- `docs/CT_COWORK_CODE_PROTOCOL_V0.4.md` §3 (nella PR 70; in vigore alla sua fusione) e `docs/CT_COWORK_CODE_PROTOCOL_V0.2.md`.
- Autorizzazione di Matteo in chat a Cowork il 2026-11-01: «leggi code se ha fatto bene, poi procediamo con la fusione» (riferito alla PR 70). Cowork ha letto il resoconto di Code (prove 5/5 e 2/2 riuscite, nessuna correzione, testa `084d1d0…`) e il diff della PR su GitHub (12 file, solo quelli elencati in `file_attesi_70`).

## Obiettivo
Prima fusione eseguita dal canale automatico: la PR 70. Task dedicato: nessun lavoro nuovo.

## Scope incluso
1. Fase `piano`: in sola lettura, controlla con `gh pr view 70` che la PR sia aperta, verso `main`, testa uguale allo sha del campo `fusioni`, fondibile, e che i file toccati stiano dentro `file_attesi_70`. Riporta l'esito. Non fondere (in fase piano lo script ignora le deleghe).
2. Fase `esecuzione` (solo dopo il via di Matteo): non fare nessuna modifica al repository; ripeti i controlli in sola lettura e chiudi con esito FATTO. La fusione la esegue lo script dopo di te.

## Fuori scope
Qualsiasi modifica, commit, branch, push o PR. Reinstallare lo script.

## Vincoli tecnici
Sola lettura in entrambe le fasi. Repository di lavoro su `main`, pulito.

## Criteri di accettazione
- Piano: i controlli tornano tutti.
- Esecuzione: la riga dello script nel resoconto dice «FUSA» per la PR 70.

## Test obbligatori
Nessuno oltre ai controlli del punto 1.

## Output richiesto
Resoconto breve con l'esito dei controlli.
