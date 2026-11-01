#!/bin/bash
# Toglie il job di pubblicazione in prova (launchd). Non cancella niente d'altro, salvo se lo chiedi. Il clone non si tocca mai.
# Uso: ./disinstalla.sh            ferma il job e toglie il file di launchd
#      ./disinstalla.sh --tutto    in piu' cancella <clone>/.pubblicazione (log, stato, copia dello script, configurazione)
#      ./disinstalla.sh --token    in piu' cancella il file del token del sito di PROVA (quello della produzione resta dov'e')
set -u
CLONE="${CT_CLONE:-$HOME/dev-machine/progetti/cosmic-horror}"
BASE="$CLONE/.pubblicazione"
ETICHETTA="it.cosmichorror.pubblica"
PLIST="$HOME/Library/LaunchAgents/$ETICHETTA.plist"

UID_N="$(id -u)"
launchctl bootout "gui/$UID_N" "$PLIST" >/dev/null 2>&1 || launchctl bootout "user/$UID_N" "$PLIST" >/dev/null 2>&1 || launchctl unload "$PLIST" >/dev/null 2>&1 || true
rm -f "$PLIST"
echo "Job fermato e file di launchd tolto."
for a in "$@"; do
  case "$a" in
    --tutto) rm -rf "$BASE"; echo "Cartella $BASE cancellata (il clone resta)." ;;
    --token) if [ -f "$CLONE/.swa-token-prova" ]; then rm -f "$CLONE/.swa-token-prova"; echo "Token di prova cancellato ($CLONE/.swa-token-prova)."; else echo "Nessun token di prova da cancellare."; fi ;;
  esac
done
