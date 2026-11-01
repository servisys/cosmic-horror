# Mac mini: pubblicazione del gioco (prova automatica, produzione a mano)

Cartella con gli strumenti per il Mac mini che pubblica il gioco su Azure Static Web Apps (nessuna GitHub Action). Due siti: **prova** (si aggiorna da solo a ogni nuovo commit su `main`) e **produzione** (solo a mano, con lo stesso commit già in prova).

- `controlla-e-pubblica.sh`: il controllo, solo prova (lo lancia launchd ogni 60 secondi; `--stato` mostra a che punto è, `--riprova` ripete l'ultimo commit fallito). Salta il giro se c'è già una build pesante (batteria di test di Folk Lore o altro sotto `progetti/`).
- `installa.sh` / `disinstalla.sh`: installano e tolgono il job (`installa.sh --token [prova|produzione]` scrive il file del token). Lavorano nel clone già presente in `/Users/builder/dev-machine/progetti/cosmic-horror`; log e stato stanno in `.pubblicazione/` dentro il clone.
- `it.cosmichorror.pubblica.plist.modello`: il file di launchd (installa.sh lo compila).
- `percorso-node.sh`: funzioni condivise (PATH di Node, compilazione del plist) usate dal job e da `installa.sh`.
- `pubblica.conf.esempio`: la configurazione (percorso del lucchetto di Folk Lore, cartella dei progetti, `CARTELLA_NODE`).
- **Node sotto launchd**: il job parte con un PATH minimo e non vede Node installato con mise o nvm. `CARTELLA_NODE` in `pubblica.conf` è la cartella con `node`, `npm` e `npx` (esempio mise: `/Users/builder/.local/share/mise/installs/node/22/bin`); `installa.sh` la compila da solo. Se Node viene aggiornato a una cartella diversa: svuota la riga e rilancia `installa.sh`. Se npm non si trova, il job scrive un PROBLEMA nel log e non segna il commit come fallito.
- **Il job si aggiorna da solo**: dopo ogni checkout il job ricopia da `strumenti/mac-mini/` in `.pubblicazione/bin` lo script e `percorso-node.sh` se sono cambiati (vale dal giro dopo). Se cambia il plist scrive un PROBLEMA nel log («rilancia installa.sh»): launchd non lo tocca da solo.
- `prova-logica.sh`: prova la logica del controllo con un repository locale e una pubblicazione finta (nessuna rete, nessun token vero).

La produzione si pubblica con `npm run pubblica -- produzione` in `game/prototipo` (vedi la guida).

La guida passo per passo è in `docs/05-technical-design/04-build-deployment/CT_GUIDA_PUBBLICAZIONE_AZURE_V0.2.md`.
