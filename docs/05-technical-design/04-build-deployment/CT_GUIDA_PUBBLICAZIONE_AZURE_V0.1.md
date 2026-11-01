---
title: Cosmic Horror - Guida: pubblicare il gioco su Azure dal Mac mini e installarlo sul telefono
status: DEPRECATED
superseded_by: CT_GUIDA_PUBBLICAZIONE_AZURE_V0.2.md
version: 0.1.0
owner: Matteo
prepared_by: Claude Code
project_prefix: CT_
last_reviewed: 2026-11-01
related_documents:
  - ../01-architecture/CT_TECHNICAL_ARCHITECTURE_V0.1.md
---

# Guida: pubblicare il gioco su Azure dal Mac mini e installarlo sul telefono

## Come funziona (in breve)
- Il gioco (cartella `game/prototipo`) si pubblica su **Azure Static Web Apps, piano Free**, con accesso **solo su invito** (fino a 25 persone, login Microsoft o GitHub).
- **Non usiamo GitHub Actions.** Un piccolo job sul **Mac mini** controlla GitHub ogni minuto: se c'è una versione nuova, la scarica, fa i test, costruisce il gioco e lo pubblica con la CLI ufficiale di Azure.
- Se i test o la build falliscono **non pubblica niente**, scrive il motivo nel log e non riprova lo stesso commit all'infinito.
- Il **token** di Azure sta solo nel **Portachiavi** del Mac mini: mai in un file, mai nel log.
- Nel gioco, in **schermata iniziale** (e nella finestra delle **Regole**), c'è la riga **«Versione: main · 4a09a45 · 2026-11-01»**: così vedi cosa è online.
- Sul telefono il gioco si **installa come un'app**, parte a tutto schermo in orizzontale e funziona anche senza rete.

I nomi dei menu di Azure, GitHub e macOS possono cambiare un poco col tempo: se un nome non c'è uguale, cerca il più simile.

## Parte 1 - Azure (una volta sola)
1. Entra nel [portale Azure](https://portal.azure.com) → **Crea una risorsa** → **Static Web App** → **Crea**.
2. Scegli l'abbonamento e un gruppo di risorse (per esempio `cosmic-horror`).
3. **Nome**: per esempio `cosmic-horror`. **Piano**: **Free**. **Area**: la più vicina (per esempio West Europe).
4. In **Dettagli della distribuzione** scegli **Altro** (Other): **non collegare GitHub**.
5. **Rivedi e crea** → **Crea**. L'indirizzo del sito (`https://….azurestaticapps.net`) è in **Panoramica**.
6. Sempre in **Panoramica**, premi **Gestisci il token di distribuzione** e **copia** il token. È come una password: non incollarlo in chat, nei file del progetto o nelle PR. Ti servirà tra poco, una volta sola.

## Parte 2 - Il Mac mini
### Cosa serve
- Il Mac mini sempre acceso, con **il tuo utente collegato** (accesso automatico) e **senza stop automatico**: Impostazioni di Sistema → Schermo/Energia → «Evita lo stop automatico quando lo schermo è spento». (Il Portachiavi si apre solo con l'utente collegato.)
- **Git**: da Terminale `xcode-select --install` (se non c'è già).
- **Node.js 22 (LTS)**: scarica l'installer da [nodejs.org](https://nodejs.org) e installalo (oppure `brew install node@22` se usi Homebrew). Controlla: `node --version` deve dire v22 o più.

### La deploy key di GitHub (sola lettura)
Serve al Mac mini per leggere il repository, senza poterlo modificare.
1. Da Terminale sul Mac mini:
   ```
   ssh-keygen -t ed25519 -f ~/.ssh/cosmic_horror_deploy -N "" -C "mac-mini-pubblicazione"
   cat ~/.ssh/cosmic_horror_deploy.pub
   ```
2. Copia la riga che stampa (inizia con `ssh-ed25519`).
3. Su GitHub: repository `servisys/cosmic-horror` → **Settings** → **Deploy keys** → **Add deploy key**. Titolo: `mac-mini-pubblicazione`. Incolla la chiave. **Lascia vuota la casella «Allow write access»** (sola lettura). **Add key**.
4. Prova: `ssh -i ~/.ssh/cosmic_horror_deploy -o IdentitiesOnly=yes -T git@github.com` → deve rispondere «Hi servisys/cosmic-horror! You've successfully authenticated…».

### Installare il job
1. Scarica gli strumenti (una volta):
   ```
   GIT_SSH_COMMAND="ssh -i ~/.ssh/cosmic_horror_deploy -o IdentitiesOnly=yes" git clone git@github.com:servisys/cosmic-horror.git ~/cosmic-horror
   cd ~/cosmic-horror/strumenti/mac-mini
   ./installa.sh
   ```
2. `installa.sh` controlla Node e git, crea la cartella `~/CosmicHorrorPubblica`, e **ti chiede il token**: incolla quello copiato da Azure (non si vede mentre lo scrivi). Va nel Portachiavi (servizio `cosmic-horror-swa`). Se macOS chiede se «security» può usare l'elemento, scegli **Consenti sempre**.
3. Crea il file di configurazione `~/CosmicHorrorPubblica/pubblica.conf`. Di norma è già giusto (`REPO_URL`, `CHIAVE`, `MODALITA=main`): controllalo e basta. Il file si rilegge a ogni giro, non serve riavviare nulla.
4. Fatto: il job parte subito e poi **ogni 60 secondi**. Alla prima esecuzione pubblica la versione attuale di `main`.

Per cambiare il token (per esempio se lo hai rigenerato): `./installa.sh --token`.

### Dove leggere cosa succede
- `~/CosmicHorrorPubblica/log/pubblica.log`: una riga per ogni passo, con **data, modalità, commit ed esito** (INIZIO, PUBBLICATO, FALLITO, o un PROBLEMA).
- `~/CosmicHorrorPubblica/log/ultima-build.log`: tutto l'output dell'ultima build (test, build, pubblicazione).
- `~/CosmicHorrorPubblica/log/fallita-<commit>.log`: l'output di una build fallita.
- `~/CosmicHorrorPubblica/log/launchd.log`: errori del job stesso (di solito vuoto).
- Un colpo d'occhio: `~/CosmicHorrorPubblica/bin/controlla-e-pubblica.sh --stato`.

### Se una build fallisce
Non si riprova lo stesso commit: il log dice FALLITO. Quando arriva un commit nuovo (o un nuovo tag) riprova da solo. Per riprovare subito lo stesso: `~/CosmicHorrorPubblica/bin/controlla-e-pubblica.sh --riprova`.

### Passare alla modalità «versioni»
Di norma ogni nuovo commit su `main` viene pubblicato (**modalità `main`**). Se vuoi pubblicare **solo quando decidi tu**, passa alla **modalità `versioni`**: si pubblica solo quando c'è un **nuovo tag che inizia con `v`** (per esempio `v0.2.0`; vale il tag con la versione più alta).
1. Apri `~/CosmicHorrorPubblica/pubblica.conf` e cambia `MODALITA=main` in `MODALITA=versioni`.
2. Per pubblicare una versione, crea il tag sul commit giusto e mandalo su GitHub (da un computer con accesso in scrittura): `git tag v0.2.0` e `git push origin v0.2.0`.
3. Nel gioco la riga della versione mostrerà il nome del tag (per esempio «v0.2.0 · 4a09a45 · 2026-11-01»).
4. Per tornare indietro: `MODALITA=main`. Cambiando modalità, al giro successivo ripubblica una volta la versione corrispondente.

### Togliere il job
`./disinstalla.sh` ferma il job. Con `--tutto` cancella anche `~/CosmicHorrorPubblica`, con `--token` toglie il token dal Portachiavi.

## Parte 3 - Invitare i giocatori
Nessuno può entrare senza invito: tutte le pagine richiedono il ruolo `giocatore`.
1. Nella risorsa Azure apri **Gestione dei ruoli** → **Invita**.
2. **Provider**: Microsoft (Azure AD) oppure GitHub, a seconda di come entrerà la persona. **Nome utente** o email del giocatore (per GitHub: il nome utente GitHub).
3. **Dominio**: quello del sito. **Ruolo**: `giocatore`. **Validità**: `168` ore (7 giorni, il massimo). **Genera**.
4. Copia il **link di invito** e mandalo alla persona: lo apre, accede con l'account scelto e conferma.
5. Per togliere qualcuno: **Gestione dei ruoli** → seleziona la persona → **Elimina**. Con il piano Free al massimo 25 giocatori.

Chi arriva senza ruolo vede una pagina «accesso su invito» con i pulsanti per entrare con un altro account.

## Parte 4 - Installare il gioco sul telefono
**Android (Chrome):** apri l'indirizzo, accedi, menu **⋮** → **Installa app** (o **Aggiungi a schermata Home**). Apri **Cosmic Horror** dall'icona: tutto schermo, in orizzontale. In verticale compare «Ruota il telefono».

**iPhone (Safari):** apri l'indirizzo con Safari, accedi, **Condividi** → **Aggiungi alla schermata Home**. Dall'icona il gioco va a tutto schermo.

Dopo il primo caricamento il gioco **funziona anche senza rete**. Quando esce una versione nuova, aprendo il gioco compare in alto **«Nuova versione disponibile - tocca per aggiornare»**: tocca quando vuoi (con una partita in corso l'avviso dice che ricomincia).

## Se qualcosa non va
- **Il log dice «token non trovato nel Portachiavi»**: lancia `./installa.sh --token`. Appena c'è, il job pubblica da solo la versione in attesa.
- **«repository non raggiungibile»**: controlla la rete del Mac mini e la deploy key (prova il comando `ssh -T` della Parte 2).
- **Il job non gira**: `launchctl list | grep cosmichorror` deve mostrare `it.cosmichorror.pubblica`; se manca, rilancia `./installa.sh`. L'utente deve essere collegato.
- **Il gioco online non cambia**: guarda la riga «Versione» nel menu del gioco e confrontala con l'ultimo PUBBLICATO nel log; il telefono mostra la versione nuova dopo aver toccato l'avviso di aggiornamento.
- **Token da rinnovare** (per esempio se è finito dove non doveva): su Azure, **Gestisci il token di distribuzione** → **Reimposta**, poi `./installa.sh --token`.
- **Aggiornare gli strumenti del Mac mini** (dopo una modifica a questa cartella): `cd ~/cosmic-horror && git pull` (con la stessa `GIT_SSH_COMMAND` di sopra) e rilancia `./installa.sh`.

## Per chi sviluppa
- `game/prototipo/scripts/pubblica.mjs` (`npm run pubblica`): tipi, test, build, poi `npx @azure/static-web-apps-cli@2.1.0 deploy ./dist --env production`. Il token si legge solo dalla variabile `SWA_CLI_DEPLOYMENT_TOKEN`; se manca si ferma con un messaggio. `npm run pubblica -- --prova` fa solo controlli e build. La prima volta la CLI scarica un suo programma di distribuzione in `~/.swa`.
- `strumenti/mac-mini/`: `controlla-e-pubblica.sh`, `installa.sh`, `disinstalla.sh`, il file launchd (`it.cosmichorror.pubblica.plist.modello`), `pubblica.conf.esempio` e `prova-logica.sh` (prova la logica con un repository locale e un token finto: nessuna rete).
- `game/prototipo/public/staticwebapp.config.json`: ruolo `giocatore` su tutte le rotte, login Microsoft (e GitHub), altri provider disattivati, cache lunga per i file con impronta e nessuna cache per `index.html`, `sw.js` e il manifest.
- `game/prototipo/vite-plugin-sw.ts` genera `sw.js` (tutta la build in cache); `src/ui/pwa.ts` registra il service worker e mostra l'avviso.

## Changelog

| Versione | Stato | Modifica |
|---|---|---|
| 0.1.0 | DRAFT | Prima stesura di Claude Code (pubblicazione dal Mac mini, senza GitHub Actions). |
