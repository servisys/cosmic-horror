#!/bin/bash
# Toglie il job di pubblicazione (launchd). Non cancella niente d'altro, salvo se lo chiedi:
# Uso: ./disinstalla.sh            ferma il job e toglie il file di launchd
#      ./disinstalla.sh --tutto    in piu' cancella la cartella ~/CosmicHorrorPubblica (log, stato, cartella di lavoro)
#      ./disinstalla.sh --token    in piu' toglie il token dal Portachiavi
set -u
BASE="$HOME/CosmicHorrorPubblica"
ETICHETTA="it.cosmichorror.pubblica"
PLIST="$HOME/Library/LaunchAgents/$ETICHETTA.plist"
SERVIZIO="cosmic-horror-swa"

launchctl bootout "gui/$(id -u)" "$PLIST" >/dev/null 2>&1 || launchctl unload "$PLIST" >/dev/null 2>&1 || true
rm -f "$PLIST"
echo "Job fermato e file di launchd tolto."
for a in "$@"; do
  case "$a" in
    --tutto) rm -rf "$BASE"; echo "Cartella $BASE cancellata." ;;
    --token) security delete-generic-password -a "$USER" -s "$SERVIZIO" >/dev/null 2>&1 && echo "Token tolto dal Portachiavi." || echo "Nessun token nel Portachiavi." ;;
  esac
done
