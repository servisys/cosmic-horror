---
id: CT-FIX-006
fase: esecuzione
pronto: si
branch: fix/ct-fix-006-node-per-il-job-mac
scritto_da: Cowork (chat Claude del progetto)
data: 2026-11-01
---

# CT-FIX-006 — Il job del Mac non trova Node (installato con mise)

## Documenti autorevoli
- `docs/00_MASTER_INDEX.md` (APPROVED), `docs/CT_COWORK_CODE_PROTOCOL_V0.4.md` (APPROVED).
- `strumenti/mac-mini/` e guida `CT_GUIDA_PUBBLICAZIONE_AZURE_V0.2.md` (su `main` dopo la PR #74).

## Cosa è successo (sul Mac vero, 2026-11-01 21:25)
Matteo ha fatto `git pull` e `installa.sh` (andato bene). Al primo giro il job è fallito in un secondo; `fallita-dceca70.log` dice:
```
=== npm ci
bash: npm: command not found
```
Sul Mac Node è installato con **mise**, per l'utente `builder`. Nel terminale di Matteo:
```
command -v node npm
/Users/builder/.local/share/mise/installs/node/22/bin/node
/Users/builder/.local/share/mise/installs/node/22/bin/npm
```
Sotto launchd il PATH dello script (`/opt/homebrew/bin:/usr/local/bin:/usr/bin:...`) non contiene quella cartella. `installa.sh` non se n'è accorto perché controlla `node`/`npm` nel terminale interattivo, non con il PATH del job.

## Richiesta
1. **`controlla-e-pubblica.sh`:** prima di tutto, rendi trovabile Node anche sotto launchd, senza toccare il sistema (niente sudo, niente link in `/usr/local/bin`):
   - nuova chiave `CARTELLA_NODE` in `pubblica.conf` (cartella che contiene `node`, `npm` e `npx`), messa in testa al PATH se valorizzata;
   - se vuota, ripiego automatico: aggiungi al PATH i posti tipici dell'utente — le shim di mise (`$HOME/.local/share/mise/shims`), `$HOME/.local/bin`, e la più recente fra `$HOME/.local/share/mise/installs/node/*/bin` — più nvm/volta se vuoi, ma senza eseguire script di profilo;
   - se dopo questo `npm` non c'è, scrivi un PROBLEMA chiaro (una volta sola, con la funzione `problema`) e **non** segnare il commit come fallito: è un problema di configurazione, non della build.
2. **`installa.sh`:** controlla Node con lo **stesso PATH che userà il job** (ricavalo nello stesso modo, anche come funzione condivisa se comodo) e scrivi in `pubblica.conf` il valore di `CARTELLA_NODE` trovato (`dirname` di `command -v node` del terminale) se la chiave è vuota. Se il job non troverebbe npm, si ferma con un messaggio chiaro.
3. **`pubblica.conf.esempio`, LEGGIMI e guida V0.2:** la chiave `CARTELLA_NODE`, con l'esempio mise `/Users/builder/.local/share/mise/installs/node/22/bin`, e cosa fare se Node viene aggiornato (rilanciare `installa.sh`).
4. **`prova-logica.sh`:** un caso con npm assente dal PATH (PROBLEMA, commit non segnato fallito) e uno con `CARTELLA_NODE` che lo rende trovabile.
5. Verifiche su Windows: `npm run tipi`, `npm test`, `npm run build`, `prova-logica.sh` con Git Bash.
6. PR verso `main`, nessuna fusione. Nel resoconto: sha completo della testa e `git diff --stat`.

## Dopo la fusione (per Matteo, mettilo nel resoconto e nella guida)
`git pull`, `./strumenti/mac-mini/installa.sh`, poi `.pubblicazione/bin/controlla-e-pubblica.sh --riprova` per riprovare il commit dceca70.

## Fuori perimetro
Nessuna altra modifica; niente fusioni o chiusure.

## Via di Matteo per la fase esecuzione (2026-11-01, in chat a Cowork)
Matteo ha dato il via. La guida V0.2 è su `main` (PR #74 fusa, merge commit dceca708fc59c0d3cb6c80346c356943721ecf2b): fai `git pull` prima di partire. Domande 1 e 2: va bene come proponi (override `CT_NPM` o salto del controllo con comandi finti; file condiviso `percorso-node.sh`).

Due aggiunte:
1. **Prova 17 di `prova-logica.sh` sbagliata, emersa sul Mac vero** (su Windows era saltata). Sul Mac `npm test` dentro `npm run pubblica -- prova` è fallito con `KO 17. token con permessi 644 ... (atteso: 9|1, trovato: 9|2)`. Causa: la prova conta le righe con `grep -c 'chmod 600'` nel log, ma la stringa compare anche nel messaggio del caso 16 («manca il token ... (solo il token, chmod 600)»). Conta solo il messaggio dei permessi (es. `ha permessi 644`). Il resto della batteria sul Mac era verde (34 ok).
2. **Il job si aggiorna da solo.** Oggi `installa.sh` copia lo script in `.pubblicazione/bin` e il job usa quella copia, quindi ogni correzione al job richiede di rilanciare `installa.sh` sul Mac. Fai in modo che, dopo il checkout di un commit nuovo (e prima della build), il job ricopi da `strumenti/mac-mini/` nel `bin` lo script e il file condiviso se sono cambiati, così il giro successivo usa la versione nuova (la copia resta, per non cambiare lo script mentre gira). Se cambia il plist, scrivilo nel log come PROBLEMA («rilancia installa.sh») invece di toccare launchd da solo. Aggiungi una prova in `prova-logica.sh`.
Nel resoconto scrivi chiaro cosa deve fare Matteo dopo la fusione: con la copia vecchia ancora installata, serve **un'ultima volta** `git pull` + `./strumenti/mac-mini/installa.sh` (+ `--riprova` se serve); da lì in poi niente.
