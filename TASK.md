---
id: CT-DEV-004
fase: piano
pronto: si
branch: feature/ct-dev-004-pubblicazione-prova-produzione
scritto_da: Cowork (chat Claude del progetto)
data: 2026-11-01
---

# CT-DEV-004 — Pubblicazione dal Mac mini allineata a Folk Lore: sito di prova automatico, produzione a mano

## Documenti autorevoli
- `docs/00_MASTER_INDEX.md` (APPROVED), `docs/CT_COWORK_CODE_PROTOCOL_V0.4.md` (APPROVED).
- `docs/05-technical-design/04-build-deployment/CT_GUIDA_PUBBLICAZIONE_AZURE_V0.1.md` (DRAFT, contesto), `game/prototipo/scripts/pubblica.mjs`, `strumenti/mac-mini/`, `game/prototipo/public/staticwebapp.config.json`.
- Decisione di Matteo in chat a Cowork il 2026-11-01 («sì sì perfetto») sulla proposta riassunta qui sotto.

## Contesto: come pubblica oggi l'altro progetto di Matteo (Folk Lore)
Cowork l'ha letto nel suo repository; qui il riassunto, perché tu non hai accesso a quel repository:
- Mac mini di build `macmini-di-matteo`, raggiunto via Tailscale + SSH come utente `builder` (una chiave per computer, mai password); i progetti stanno in `/Users/builder/dev-machine/progetti/<nome>`.
- Due Static Web App: **prova** e **produzione**. Comando `npm run pubblica -- prova` / `npm run pubblica -- produzione`; l'ambiente va detto sempre, nessun valore predefinito. In produzione va **lo stesso commit già pubblicato in prova, senza ricostruirlo** (copia salvata della build di prova per commit, più controllo che il sito di prova risponda con quel commit).
- Token: uno per sito, dalla variabile `SWA_DEPLOYMENT_TOKEN_PROVA` / `SWA_DEPLOYMENT_TOKEN_PRODUZIONE` oppure dai file `.swa-token-prova` / `.swa-token-produzione` nella cartella del progetto, permessi 600, in `.gitignore`; passato al processo figlio nell'ambiente, mai sulla riga di comando.
- Regole della macchina (guida dell'ambiente di build di Matteo, fuori dai repository): nessun segreto in file di progetto o chat, **una build pesante alla volta**, nessuna modifica all'infrastruttura.

## Obiettivo
Adattare la pubblicazione di Cosmic Horror a queste convenzioni, con una differenza voluta: **il sito di prova si aggiorna da solo** a ogni nuovo commit su `main` (job launchd già esistente); **la produzione solo a mano**, con lo stesso commit già in prova.

## Scope incluso
1. `pubblica.mjs`: argomento obbligatorio `prova` | `produzione`; token per ambiente come sopra (variabile o file `.swa-token-<ambiente>` nella radice del clone, aggiunto a `.gitignore`); il vecchio `SWA_CLI_DEPLOYMENT_TOKEN` non si legge più; `produzione` pubblica la copia della build di prova di quel commit senza ricostruire e si ferma con un messaggio chiaro se quel commit non è stato pubblicato in prova (o se il sito di prova risponde con un altro commit).
2. `strumenti/mac-mini/`: utente `builder`, clone in `/Users/builder/dev-machine/progetti/cosmic-horror`, cartella di lavoro e log coerenti; il job launchd pubblica **solo in prova**; token letto dal file `.swa-token-prova` (niente Portachiavi); **una build pesante alla volta**: proponi nel piano come evitare di partire mentre gira una build di Folk Lore (per esempio un file di blocco comune in `/Users/builder/dev-machine/`, o aspettare se c'è un `npm`/`node` pesante in corso) e indica cosa va chiesto a Matteo sulla sua guida; installa/disinstalla aggiornati; `prova-logica.sh` aggiornato.
3. Versione nel gioco: mostra anche l'ambiente (prova / produzione).
4. Guida: nuova versione `CT_GUIDA_PUBBLICAZIONE_AZURE_V0.2.md` (V0.1 DEPRECATED): due Static Web App Free (prova e produzione), dove mettere i due token (file con permessi 600, mai in chat), Tailscale/SSH come `builder`, deploy key in sola lettura per il clone, installazione del job (solo prova), come pubblicare in produzione, inviti dei giocatori (sul sito di produzione; sul sito di prova solo Matteo), installazione sul telefono.
5. PR verso `main`, descrizione in italiano.

## Fuori scope
- Fusioni o chiusure di PR; creare risorse Azure; toccare il Mac (lo configura Matteo seguendo la guida).
- Cambiare il gioco o le regole.

## Vincoli tecnici
- Base `main`. Push solo con `git push -u origin HEAD`, poi `git switch main`. Niente `cd` prima dei comandi, niente pipe, un comando git alla volta.
- Nessun segreto nei file. Script bash compatibili con macOS (zsh/bash di sistema).

## Criteri di accettazione
- `npm run pubblica` senza ambiente si ferma subito con un messaggio; `produzione` rifiuta un commit non pubblicato in prova.
- Job del Mac: solo prova, blocco «una build alla volta», nessun Portachiavi.
- `prova-logica.sh` e i test verdi (quelli eseguibili sul PC Windows); guida V0.2 coerente.

## Test obbligatori
- `npm test`, `npm run tipi`, `npm run build`; `npm run pubblica -- prova --prova` (solo controlli e build, se esiste l'opzione) e le prove della logica di produzione con un token finto.
- `git diff --stat` nel resoconto.

## Output richiesto
- Fase `piano`: pre-flight plan con la soluzione per «una build alla volta», file toccati, rischi, domande per Matteo.
- Fase `esecuzione` (solo dopo nuovo via): Implementation Report con commit, PR e cosa non è stato verificato (il Mac vero non è raggiungibile da te).
