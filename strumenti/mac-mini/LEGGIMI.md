# Mac mini: pubblicazione del gioco (prova automatica, produzione a mano)

Cartella con gli strumenti per il Mac mini che pubblica il gioco su Azure Static Web Apps (nessuna GitHub Action). Due siti: **prova** (si aggiorna da solo a ogni nuovo commit su `main`) e **produzione** (solo a mano, con lo stesso commit già in prova).

- `controlla-e-pubblica.sh`: il controllo, solo prova (lo lancia launchd ogni 60 secondi; `--stato` mostra a che punto è, `--riprova` ripete l'ultimo commit fallito). Salta il giro se c'è già una build pesante (batteria di test di Folk Lore o altro sotto `progetti/`).
- `installa.sh` / `disinstalla.sh`: installano e tolgono il job (`installa.sh --token [prova|produzione]` scrive il file del token). Lavorano nel clone già presente in `/Users/builder/dev-machine/progetti/cosmic-horror`; log e stato stanno in `.pubblicazione/` dentro il clone.
- `it.cosmichorror.pubblica.plist.modello`: il file di launchd (installa.sh lo compila).
- `pubblica.conf.esempio`: la configurazione (percorso del lucchetto di Folk Lore, cartella dei progetti).
- `prova-logica.sh`: prova la logica del controllo con un repository locale e una pubblicazione finta (nessuna rete, nessun token vero).

La produzione si pubblica con `npm run pubblica -- produzione` in `game/prototipo` (vedi la guida).

La guida passo per passo è in `docs/05-technical-design/04-build-deployment/CT_GUIDA_PUBBLICAZIONE_AZURE_V0.2.md`.
