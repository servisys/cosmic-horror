---
title: Cosmic Horror - Guida: pubblicare il gioco su Azure dal Mac mini (prova automatica, produzione a mano) e installarlo sul telefono
status: DRAFT
version: 0.2.0
owner: Matteo
prepared_by: Claude Code
project_prefix: CT_
last_reviewed: 2026-11-01
supersedes: CT_GUIDA_PUBBLICAZIONE_AZURE_V0.1.md
related_documents:
  - ../01-architecture/CT_TECHNICAL_ARCHITECTURE_V0.1.md
---

# Guida: pubblicare il gioco su Azure dal Mac mini e installarlo sul telefono

## Come funziona (in breve)
- Il gioco (cartella `game/prototipo`) si pubblica su **due Azure Static Web Apps, piano Free**: **prova** e **produzione**. L'accesso è **solo su invito** (fino a 25 persone per sito, login Microsoft o GitHub).
- **Non usiamo GitHub Actions.** Sul **Mac mini** (`macmini-di-matteo`, utente `builder`) un piccolo job controlla GitHub ogni minuto: a ogni **nuovo commit su `main`** scarica il codice, fa i test, costruisce il gioco e lo pubblica **solo nel sito di prova**.
- La **produzione** si pubblica **solo a mano**, con `npm run pubblica -- produzione`: va **lo stesso commit già pubblicato in prova, senza ricostruirlo**. Lo script si ferma se quel commit non è in prova o se il sito di prova risponde con un altro commit.
- Se i test o la build falliscono **non pubblica niente**, scrive il motivo nel log e non riprova lo stesso commit all'infinito.
- Ci sono **due token**, uno per sito. Stanno in **file con permessi 600** (o in variabili d'ambiente): mai in chat, mai nei file del progetto, mai nel log.
- **Una build pesante alla volta**: se sul Mac gira la batteria di test di Folk Lore (o un'altra build sotto `progetti/`), il job di Cosmic Horror salta il giro e riprova dopo, senza segnare fallimento.
- Nel gioco, in **schermata iniziale** (e nella finestra delle **Regole**), c'è la riga **«Versione: main · 4a09a45 · 2026-11-01 · prova»**: dopo la data c'è l'ambiente (**prova** o **produzione**), letto da un piccolo file `versione.json` che la pubblicazione scrive accanto al gioco.
- Sul telefono il gioco si **installa come un'app**, parte a tutto schermo in orizzontale e funziona anche senza rete.

I nomi dei menu di Azure, GitHub e macOS possono cambiare un poco col tempo: se un nome non c'è uguale, cerca il più simile.

## Parte 1 - Azure (una volta sola, due volte)
Si ripete due volte: una per il sito di **prova**, una per la **produzione**.
1. Entra nel [portale Azure](https://portal.azure.com) → **Crea una risorsa** → **Static Web App** → **Crea**.
2. Scegli l'abbonamento e un gruppo di risorse (per esempio `cosmic-horror`, lo stesso per i due siti).
3. **Nome**: `cosmic-horror-prova` e `cosmic-horror-produzione`. **Piano**: **Free**. **Area**: la più vicina (per esempio West Europe).
4. In **Dettagli della distribuzione** scegli **Altro** (Other): **non collegare GitHub**.
5. **Rivedi e crea** → **Crea**. L'indirizzo del sito (`https://….azurestaticapps.net`) è in **Panoramica**.
6. Sempre in **Panoramica**, premi **Gestisci il token di distribuzione** e **copia** il token. È come una password: non incollarlo in chat, nei file del progetto o nelle PR. Ti serve tra poco (Parte 2), una volta per sito.
7. **Gli indirizzi dei due siti** (non sono segreti) stanno nel file `game/prototipo/siti-pubblicazione.json` del repository (già con gli indirizzi veri; se si ricreano i siti vanno aggiornati). Il sito di prova serve anche allo script di produzione, per controllare quale commit c'è online. Si cambia con una normale PR.

Il file `versione.json` (solo ambiente, commit e data) è pubblico apposta: serve per quel controllo senza fare il login. Tutto il resto del gioco richiede il ruolo `giocatore`.

## Parte 2 - Il Mac mini
### Cosa serve
- Il Mac mini sempre acceso e **senza stop automatico**: Impostazioni di Sistema → Schermo/Energia → «Evita lo stop automatico quando lo schermo è spento».
- Si entra con **Tailscale + SSH come utente `builder`** (una chiave per ogni computer che si collega, mai password). Tutto il resto si fa in quella sessione.
- **Git** (`xcode-select --install`, se non c'è già) e **Node.js 22 (LTS)** (`node --version` deve dire v22 o più).
- **Nessun clone da fare**: il repository c'è già in `/Users/builder/dev-machine/progetti/cosmic-horror` (clonato via HTTPS, il repository è pubblico). Non serve nessuna deploy key. Se un giorno il repository diventa privato: `gh auth setup-git` per `builder`.
- Nel clone **non si lavora a mano**: il job lo porta su `main` a ogni giro (modifiche non salvate andrebbero perse). I file ignorati da git (token, log, copie delle build) non si toccano mai.

### Aggiornare il clone
Dopo la fusione di una PR che cambia questi strumenti: in `/Users/builder/dev-machine/progetti/cosmic-horror` basta `git pull`. Il job si aggiorna da solo: dopo ogni checkout di un commit nuovo ricopia in `.pubblicazione/bin` lo script e `percorso-node.sh` se sono cambiati (vale dal giro dopo; la copia resta, così lo script non cambia mentre gira). Rilanciare `./installa.sh` serve solo se cambia il plist di launchd (il job lo scrive nel log come PROBLEMA «rilancia installa.sh», senza toccare launchd) o se vuoi rifare la configurazione.

**Node sotto launchd.** Il job parte con un PATH minimo e non vede Node installato con mise (o nvm, volta). In `pubblica.conf` la chiave `CARTELLA_NODE` è la cartella che contiene `node`, `npm` e `npx`, messa in testa al PATH del job; per esempio con mise: `CARTELLA_NODE=/Users/builder/.local/share/mise/installs/node/22/bin`. `installa.sh` la compila da solo con la cartella del `node` del terminale e controlla che con il PATH del job `node` e `npm` si trovino (altrimenti si ferma). Se la chiave è vuota il job prova da solo i posti tipici dell'utente (mise, `~/.local/bin`, nvm, volta). Se npm non si trova il job scrive un PROBLEMA nel log (una volta sola) e non segna il commit come fallito. Se Node viene aggiornato e la cartella cambia: svuota la riga `CARTELLA_NODE=` in `pubblica.conf` e rilancia `./installa.sh`.

**Dopo la fusione della correzione CT-FIX-006** (la copia vecchia del job non conosce ancora l'aggiornamento automatico): **un'ultima volta** `git pull`, `./strumenti/mac-mini/installa.sh`, poi, per riprovare il commit già fallito (dceca70), `.pubblicazione/bin/controlla-e-pubblica.sh --riprova`. Da lì in poi niente.

### I due file dei token
Nella radice del clone, uno per sito, con **solo il token** dentro e permessi 600. Il modo più comodo, senza mostrare il token e senza lasciarlo nella cronologia del terminale:
```
cd /Users/builder/dev-machine/progetti/cosmic-horror/strumenti/mac-mini
./installa.sh --token prova        # incolla il token del sito di prova quando lo chiede
./installa.sh --token produzione   # incolla il token del sito di produzione
```
(oppure crea a mano `.swa-token-prova` e `.swa-token-produzione` e poi `chmod 600 .swa-token-prova .swa-token-produzione`). I file sono già nel `.gitignore`. In alternativa si possono usare le variabili d'ambiente `SWA_DEPLOYMENT_TOKEN_PROVA` e `SWA_DEPLOYMENT_TOKEN_PRODUZIONE`. Il vecchio `SWA_CLI_DEPLOYMENT_TOKEN` non si legge più. Se un file ha permessi troppo larghi lo script si ferma e dice di fare `chmod 600`.

### Installare il job (solo prova)
```
cd /Users/builder/dev-machine/progetti/cosmic-horror/strumenti/mac-mini
./installa.sh
```
`installa.sh` controlla git e Node, **prova `git fetch` senza credenziali** (se fallisce o chiede una password si ferma e dice cosa sistemare, senza installare un job che fallirebbe ogni minuto), crea la cartella `.pubblicazione/` nel clone (log, stato, copia dello script, configurazione) e installa il job launchd. Alla prima esecuzione pubblica in prova la versione attuale di `main`.

Il file `.pubblicazione/pubblica.conf` di norma è già giusto: contiene il percorso del lucchetto di Folk Lore e la cartella dei progetti (vedi sotto). Si rilegge a ogni giro, non serve riavviare nulla.

### Una build pesante alla volta
Folk Lore non si modifica. Oggi ha solo il lucchetto della sua batteria di test, `/Users/builder/dev-machine/progetti/mandi/.coda/batteria.lock`, che contiene una riga JSON del tipo `{"pid":12345,"filtro":"tutto","quando":"…"}` (il job legge il campo `pid`). Il job di Cosmic Horror **salta il giro** (nel log una riga «IN ATTESA», senza FALLITO) se:
1. quel file esiste e il `pid` dentro è vivo (se il pid non si legge, il file conta come batteria in corso solo se è più recente di 120 minuti);
2. oppure c'è un processo `node`/`npm`/`vite`/`vitest`/`tsc`/`playwright`/`esbuild` con un percorso sotto `/Users/builder/dev-machine/progetti/` ma fuori da Cosmic Horror (controllo «a occhio» sulla riga di comando dei processi: un `npm run build` di Folk Lore senza il percorso nella riga può sfuggire);
3. oppure c'è già un giro di Cosmic Horror in corso (blocco proprio, `.pubblicazione/stato/blocco`).

Al giro dopo riprova da solo. Le due chiavi `LUCCHETTO_FOLK_LORE` e `CARTELLA_PROGETTI` di `pubblica.conf` seguono il percorso della guida dell'ambiente di build. Il controllo non è a prova di corsa: se Folk Lore parte mentre Cosmic Horror sta già costruendo, le due build girano insieme una volta (succede solo se partono a pochi secondi di distanza).

### Dove leggere cosa succede
Tutto dentro il clone, nella cartella `.pubblicazione/`:
- `log/pubblica.log`: una riga per ogni passo, con **data, sito, commit ed esito** (INIZIO, PUBBLICATO, FALLITO, IN ATTESA o un PROBLEMA).
- `log/ultima-build.log`: tutto l'output dell'ultima build (test, build, pubblicazione).
- `log/fallita-<commit>.log`: l'output di una build fallita.
- `log/launchd.log`: errori del job stesso (di solito vuoto).
- Un colpo d'occhio: `.pubblicazione/bin/controlla-e-pubblica.sh --stato`.

### Se una build fallisce
Non si riprova lo stesso commit: il log dice FALLITO. Quando arriva un commit nuovo riprova da solo. Per riprovare subito lo stesso: `.pubblicazione/bin/controlla-e-pubblica.sh --riprova`.

### Pubblicare in produzione (a mano)
1. Controlla il gioco nel **sito di prova** (la riga «Versione» nel menu dice il commit e «prova»).
2. Sul Mac, nel clone, assicurati di essere sul commit che hai provato (di norma è già `main` aggiornato dal job; `git log -1` per vederlo):
   ```
   cd /Users/builder/dev-machine/progetti/cosmic-horror/game/prototipo
   npm run pubblica -- produzione
   ```
3. Lo script controlla che quel commit abbia la copia della build di prova (`.pubblicati/<commit>/`, le ultime 10) e che il **sito di prova risponda proprio con quel commit**; poi pubblica la copia **senza ricostruire**, cambiando solo l'ambiente in `versione.json`. Se non torna qualcosa si ferma con un messaggio chiaro e non pubblica niente.
4. Per provare solo i controlli, senza pubblicare: `npm run pubblica -- produzione --prova`.

`npm run pubblica` senza dire l'ambiente si ferma subito: non c'è un valore predefinito.

### Togliere il job
`./disinstalla.sh` ferma il job (il clone non si tocca). Con `--tutto` cancella anche `.pubblicazione/`, con `--token` cancella il file del token di prova.

## Parte 3 - Invitare i giocatori
Nessuno può entrare senza invito: tutte le pagine (tranne `versione.json` e la pagina «accesso negato») richiedono il ruolo `giocatore`.
- **Sito di produzione:** qui si invitano i giocatori. Nella risorsa Azure apri **Gestione dei ruoli** → **Invita**; **Provider**: Microsoft (Azure AD) oppure GitHub; **Nome utente** o email del giocatore (per GitHub: il nome utente); **Dominio**: quello del sito; **Ruolo**: `giocatore`; **Validità**: `168` ore (7 giorni, il massimo); **Genera**. Copia il **link di invito** e mandalo alla persona.
- **Sito di prova:** solo Matteo (invita solo il tuo account). Serve a controllare ogni commit prima della produzione, non ai giocatori.
- Per togliere qualcuno: **Gestione dei ruoli** → seleziona la persona → **Elimina**. Con il piano Free al massimo 25 persone per sito.

Chi arriva senza ruolo vede una pagina «accesso su invito» con i pulsanti per entrare con un altro account.

## Parte 4 - Installare il gioco sul telefono
Per i giocatori vale l'indirizzo del sito di **produzione**.

**Android (Chrome):** apri l'indirizzo, accedi, menu **⋮** → **Installa app** (o **Aggiungi a schermata Home**). Apri **Cosmic Horror** dall'icona: tutto schermo, in orizzontale. In verticale compare «Ruota il telefono».

**iPhone (Safari):** apri l'indirizzo con Safari, accedi, **Condividi** → **Aggiungi alla schermata Home**. Dall'icona il gioco va a tutto schermo.

Dopo il primo caricamento il gioco **funziona anche senza rete**. Quando esce una versione nuova, aprendo il gioco compare in alto **«Nuova versione disponibile - tocca per aggiornare»**: tocca quando vuoi (con una partita in corso l'avviso dice che ricomincia). Se hai installato anche il sito di prova, sono due app diverse: guarda la riga «Versione» per sapere quale stai usando.

## Se qualcosa non va
- **Il log dice «manca il token del sito di prova»** o **«permessi …»**: crea il file `.swa-token-prova` (`./installa.sh --token prova`) o correggi con `chmod 600`. Appena a posto, il job pubblica da solo la versione in attesa.
- **Il log dice «non trovo npm col PATH del job»**: scrivi in `.pubblicazione/pubblica.conf` la riga `CARTELLA_NODE=` con la cartella che contiene `node`, `npm` e `npx` (`dirname "$(command -v node)"` nel terminale) oppure rilancia `./installa.sh`. Non è un errore della build: il commit non è segnato come fallito e il job riprova da solo.
- **Il log dice «il plist di launchd è cambiato»**: rilancia `./installa.sh`.
- **«repository non raggiungibile»**: controlla la rete del Mac mini e `git -C /Users/builder/dev-machine/progetti/cosmic-horror remote -v` (HTTPS, repository pubblico).
- **«IN ATTESA»** nel log: c'è un'altra build in corso (Folk Lore o altro): il job riprova da solo al giro dopo. Se resta in attesa per ore, controlla che `batteria.lock` non sia rimasto con un pid vecchio (se il processo non esiste più il job lo ignora; se il file è illeggibile lo ignora dopo 120 minuti).
- **Il job non gira**: `launchctl list | grep cosmichorror` deve mostrare `it.cosmichorror.pubblica`; se manca, rilancia `./installa.sh`.
- **Produzione: «non risulta pubblicato in prova»**: aspetta che il job pubblichi quel commit in prova (o `npm run pubblica -- prova` a mano), poi rilancia. **«Il sito di prova risponde con il commit …»**: la prova non è ancora aggiornata a quel commit, o il clone è su un commit diverso da quello in prova.
- **Produzione: «segnaposto»** (può comparire solo se qualcuno rimette dei segnaposto nel file): rimetti gli indirizzi veri in `game/prototipo/siti-pubblicazione.json` (Parte 1, punto 7).
- **Il gioco online non cambia**: guarda la riga «Versione» e confrontala con l'ultimo PUBBLICATO nel log; il telefono mostra la versione nuova dopo aver toccato l'avviso di aggiornamento.
- **Token da rinnovare** (per esempio se è finito dove non doveva): su Azure, **Gestisci il token di distribuzione** → **Reimposta**, poi `./installa.sh --token prova` (o `produzione`).

## Per chi sviluppa
- `game/prototipo/scripts/pubblica.mjs` (`npm run pubblica -- prova|produzione`): in prova tipi, test, build, `versione.json`, poi `npx @azure/static-web-apps-cli@2.1.0 deploy` con il token di quel sito (solo nell'ambiente del processo di deploy, mai sulla riga di comando; coperto se compare nell'output) e la copia della build in `.pubblicati/<commit>`; in produzione i controlli e la pubblicazione della copia, senza ricostruire. `--prova` (opzione) = solo controlli e build, senza pubblicare. La logica sta in `scripts/pubblica-logica.mjs`. La prima volta la CLI scarica un suo programma di distribuzione in `~/.swa`.
- `game/prototipo/siti-pubblicazione.json`: gli indirizzi dei due siti.
- `strumenti/mac-mini/`: `controlla-e-pubblica.sh` (solo prova), `percorso-node.sh` (funzioni condivise), `installa.sh`, `disinstalla.sh`, il file launchd (`it.cosmichorror.pubblica.plist.modello`), `pubblica.conf.esempio` e `prova-logica.sh`.
- Prove senza rete: `scripts/prova-pubblica.mjs` (ambiente, token per sito, produzione solo per un commit in prova, potatura delle copie) e `strumenti/mac-mini/prova-logica.sh` (job, blocchi, attesa di Folk Lore); girano dentro `npm test` (`test/pubblica.test.ts`).
- `game/prototipo/public/staticwebapp.config.json`: ruolo `giocatore` su tutte le rotte (tranne `versione.json`), login Microsoft (e GitHub), altri provider disattivati, cache lunga per i file con impronta e nessuna cache per `index.html`, `sw.js` e il manifest.
- `game/prototipo/vite-plugin-sw.ts` genera `sw.js` (tutta la build in cache); `src/ui/pwa.ts` registra il service worker e mostra l'avviso; `src/ui/versione.ts` legge `versione.json` per mostrare l'ambiente.

## Changelog

| Versione | Stato | Modifica |
|---|---|---|
| 0.2.0 | DRAFT | (CT-FIX-006) `CARTELLA_NODE` e ripiego sui posti tipici (mise, nvm, volta) perché il job trovi Node sotto launchd; il job si aggiorna da solo dopo il checkout (plist cambiato: PROBLEMA nel log). Due siti (prova automatica, produzione a mano con lo stesso commit), un token per sito in file 600, utente `builder` e clone esistente (niente deploy key, niente Portachiavi, niente modalità «versioni»), una build alla volta con Folk Lore, ambiente nella versione del gioco. Sostituisce la V0.1 (DEPRECATED). |
| 0.1.0 | DEPRECATED | Prima stesura di Claude Code (pubblicazione dal Mac mini, senza GitHub Actions). |
