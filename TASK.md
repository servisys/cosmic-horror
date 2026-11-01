---
id: CT-DEL-002
fase: piano
pronto: si
tipo: deleghe
branch: nessuno
scritto_da: Cowork (chat Claude del progetto)
data: 2026-11-01
fusioni: 71@1a80198516d4b501e9b006c96f232acd2bf7a2b8
file_attesi_71: README.md, docs/00-project-overview/01-vision-concept/CT_VISION_AND_PILLARS_V0.11_BOZZA.md
---

# CT-DEL-002 — Fusione della PR 71 (README e Vision puntano al protocollo V0.4)

## Documenti autorevoli
- `docs/CT_COWORK_CODE_PROTOCOL_V0.4.md` §3 (APPROVED).
- Autorizzazione di Matteo in chat a Cowork il 2026-11-01: «fondi 71». Cowork ha letto il diff della PR su GitHub: 2 file, solo i riferimenti al protocollo e una riga di changelog nella Vision.

## Obiettivo
Fondere la PR 71 tramite lo script. Task dedicato: nessun lavoro nuovo.

## Scope incluso
1. Fase `piano`: in sola lettura, controlla con `gh pr view 71` che la PR sia aperta, verso `main`, testa uguale allo sha del campo `fusioni`, fondibile, e che i file toccati siano solo quelli di `file_attesi_71`. Riporta l'esito. Non fondere.
2. Fase `esecuzione` (solo dopo il via di Matteo): nessuna modifica al repository; ripeti i controlli in sola lettura e chiudi con esito FATTO. La fusione la esegue lo script.

## Fuori scope
Qualsiasi modifica, commit, branch, push o PR.

## Vincoli tecnici
Sola lettura. Repository su `main`, pulito.

## Criteri di accettazione
- Piano: controlli tutti positivi.
- Esecuzione: lo script scrive «FUSA» per la PR 71.

## Test obbligatori
Nessuno oltre ai controlli del punto 1.

## Output richiesto
Resoconto breve con l'esito dei controlli.
