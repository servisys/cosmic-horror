---
id: CT-FIX-006
fase: piano
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
