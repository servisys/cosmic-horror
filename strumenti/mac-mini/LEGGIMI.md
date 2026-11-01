# Mac mini: pubblicazione automatica del gioco

Cartella con gli strumenti per il Mac mini che pubblica il gioco su Azure Static Web Apps (nessuna GitHub Action).

- `controlla-e-pubblica.sh`: il controllo (lo lancia launchd ogni 60 secondi; `--stato` mostra a che punto e', `--riprova` ripete l'ultimo commit fallito).
- `installa.sh` / `disinstalla.sh`: installano e tolgono il job (`installa.sh --token` cambia il token nel Portachiavi).
- `it.cosmichorror.pubblica.plist.modello`: il file di launchd (installa.sh lo compila).
- `pubblica.conf.esempio`: la configurazione (indirizzo del repository, deploy key, modalita' `main` o `versioni`).

La guida passo per passo e' in `docs/05-technical-design/04-build-deployment/CT_GUIDA_PUBBLICAZIONE_AZURE_V0.1.md`.
