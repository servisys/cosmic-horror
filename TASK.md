---
id: CT-DEV-005
fase: esecuzione
pronto: si
branch: feature/ct-dev-004-pubblicazione-prova-produzione
scritto_da: Cowork (chat Claude del progetto)
data: 2026-11-01
---

# CT-DEV-005 — Rifiniture alla PR #74 prima della fusione: indirizzi veri dei siti e lettura del lucchetto di Folk Lore

## Documenti autorevoli
- `docs/00_MASTER_INDEX.md` (APPROVED), `docs/CT_COWORK_CODE_PROTOCOL_V0.4.md` (APPROVED).
- PR #74 (branch `feature/ct-dev-004-pubblicazione-prova-produzione`, testa 52c504c5a66ef5a503f19a8acc05772c1b704683) e il tuo resoconto CT-DEV-004.

## Contesto
Cowork ha letto il diff della PR #74: va bene. Restano due cose da sistemare **sullo stesso branch** (nuovi commit sulla PR #74, nessuna PR nuova), prima che Matteo la fonda.

## Richiesta
1. **Indirizzi veri dei siti** in `game/prototipo/siti-pubblicazione.json` al posto dei segnaposto (Matteo li ha creati, non sono segreti):
   - prova: `https://red-dune-05eec2f03.3.azurestaticapps.net`
   - produzione: `https://lively-stone-0fd684403.4.azurestaticapps.net`
   Aggiorna la `nota` del file (non parla più di segnaposto) e, se la guida V0.2 dice di sostituirli, aggiornala.
2. **Lucchetto di Folk Lore: il formato è JSON, non un pid nudo.** Cowork ha controllato nel repository di Folk Lore (`test/esegui.js`): il file `.coda/batteria.lock` contiene una riga sola tipo `{"pid":12345,"filtro":"tutto","quando":"2026-11-01T19:40:00.000Z"}`. Oggi `controlla-e-pubblica.sh` fa `head -n 1 | tr -dc '0-9'`, che incolla al pid anche le cifre della data (e del filtro): il numero risultante non è un processo vivo, quindi il job **partirebbe durante la batteria di Folk Lore**. L'errore nasce dal task CT-DEV-004, che diceva «contiene il pid»: non è colpa tua.
   - Estrai il pid dal campo `"pid":<numero>` (con `sed`/`grep -o`, compatibile con la bash 3.2 di macOS); come ripiego, se il file è un numero nudo, usa quello.
   - Se il file esiste ma il pid non si legge, comportati in modo prudente: considera la batteria in corso se il file è più recente di 120 minuti (stessa soglia del blocco proprio), altrimenti ignoralo.
   - Aggiorna `prova-logica.sh` (e il commento in testa allo script e in `pubblica.conf.esempio`) con il formato JSON vero: un caso con pid vivo nel JSON (salta il giro), uno con pid morto (procede), uno illeggibile recente (salta).
3. Verifiche: `npm run tipi`, `npm test`, `npm run build` su Windows; `prova-logica.sh` se la bash c'è.
4. Push sullo stesso branch, nessuna fusione. Nel resoconto: nuova testa della PR #74 (sha completo di 40 caratteri) e `git diff --stat` rispetto a `main`.

## Fuori perimetro
Nessuna altra modifica. Niente fusioni o chiusure.

## Via di Matteo per la fase esecuzione (2026-11-01, in chat a Cowork)
Matteo ha dato il via («procedi») al tuo piano, compresi i due casi di prova in più. Sul dubbio della guida: tieni la voce «Produzione: segnaposto» riformulata come errore possibile se qualcuno rimette dei segnaposto.
