---
id: CT-DEL-006
fase: piano
pronto: si
tipo: deleghe
branch: nessuno
scritto_da: Cowork (chat Claude del progetto)
data: 2026-11-02
fusioni: 76@51133b47b4fd643b5306b70ffa30e4b478ca51c7
file_attesi_76: game/prototipo/index.html, game/prototipo/package.json, game/prototipo/scripts/, game/prototipo/src/ui/
---

# CT-DEL-006 — Fusione della PR 76 (schermo iPhone, barra di stato, ritorno dal background)

## Documenti autorevoli
- `docs/CT_COWORK_CODE_PROTOCOL_V0.4.md` §3 (APPROVED).
- Cowork ha letto il diff della PR 76 (8 file, tutti in `game/prototipo/`); GitHub la dà fondibile (clean).

## Via di Matteo
Matteo in chat a Cowork il 2026-11-02 alle 05:48: «fondi 76». Come da protocollo il task parte in fase piano; Cowork lo passa a esecuzione se i controlli sono positivi.

## Scope incluso
Nessuna modifica. In sola lettura controlla con `gh pr view 76` che la PR sia aperta, verso `main`, testa uguale allo sha di `fusioni`, fondibile, file dentro `file_attesi_76`. Riporta l'esito. La fusione la esegue lo script in fase esecuzione.

## Fuori scope
Qualsiasi modifica, commit, branch, push o PR.

## Criteri di accettazione
Piano: controlli positivi. Esecuzione: lo script scrive «FUSA» per la PR 76.
