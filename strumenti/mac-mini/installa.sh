#!/bin/bash
# Installa il job che pubblica il gioco su Azure ogni 60 secondi (launchd). Da lanciare sul Mac mini, come utente normale (non con sudo).
# Uso: ./installa.sh            installa (o aggiorna) il job
#      ./installa.sh --token    cambia il token nel Portachiavi
set -eu
QUI="$(cd "$(dirname "$0")" && pwd)"
BASE="$HOME/CosmicHorrorPubblica"
ETICHETTA="it.cosmichorror.pubblica"
PLIST="$HOME/Library/LaunchAgents/$ETICHETTA.plist"
SERVIZIO="cosmic-horror-swa"

if [ "$(uname)" != "Darwin" ]; then echo "Questo script e' per macOS (il Mac mini)."; exit 1; fi
if [ "$(id -u)" -eq 0 ]; then echo "Non lanciarlo con sudo: deve girare come il tuo utente."; exit 1; fi

metti_token() {
  echo "Incolla il token di distribuzione della Static Web App quando il Mac lo chiede (non si vede mentre lo scrivi)."
  # senza valore dopo -w, security lo chiede lui: il token non passa dalla riga di comando
  security add-generic-password -a "$USER" -s "$SERVIZIO" -U -w
  echo "Token salvato nel Portachiavi (servizio «$SERVIZIO»)."
}

if [ "${1:-}" = "--token" ]; then metti_token; exit 0; fi

command -v git >/dev/null || { echo "Manca git: installa gli Strumenti da riga di comando di Xcode con «xcode-select --install»."; exit 1; }
command -v node >/dev/null || { echo "Manca Node.js: installalo (vedi la guida in docs/05-technical-design/04-build-deployment/) e rilancia."; exit 1; }
command -v npm >/dev/null || { echo "Manca npm (arriva con Node.js)."; exit 1; }
echo "Node $(node --version), git $(git --version | cut -d' ' -f3)"

mkdir -p "$BASE/bin" "$BASE/log" "$BASE/stato" "$HOME/Library/LaunchAgents"
cp -f "$QUI/controlla-e-pubblica.sh" "$BASE/bin/controlla-e-pubblica.sh"
chmod 700 "$BASE/bin/controlla-e-pubblica.sh"
if [ ! -f "$BASE/pubblica.conf" ]; then
  cp "$QUI/pubblica.conf.esempio" "$BASE/pubblica.conf"
  echo "Creato $BASE/pubblica.conf: controlla REPO_URL, CHIAVE e MODALITA."
fi

if ! security find-generic-password -a "$USER" -s "$SERVIZIO" >/dev/null 2>&1; then metti_token; fi

sed -e "s#@SCRIPT@#$BASE/bin/controlla-e-pubblica.sh#g" -e "s#@BASE@#$BASE#g" -e "s#@HOME@#$HOME#g" "$QUI/it.cosmichorror.pubblica.plist.modello" > "$PLIST"
plutil -lint "$PLIST" >/dev/null

UID_N="$(id -u)"
launchctl bootout "gui/$UID_N" "$PLIST" >/dev/null 2>&1 || launchctl unload "$PLIST" >/dev/null 2>&1 || true
if ! launchctl bootstrap "gui/$UID_N" "$PLIST" 2>/dev/null; then launchctl load "$PLIST"; fi

echo
echo "Installato. Il controllo parte subito e poi ogni 60 secondi."
echo "  Stato:   $BASE/bin/controlla-e-pubblica.sh --stato"
echo "  Log:     $BASE/log/pubblica.log"
echo "  Config:  $BASE/pubblica.conf"
