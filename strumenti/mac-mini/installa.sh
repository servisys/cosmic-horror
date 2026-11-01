#!/bin/bash
# Installa il job che pubblica SOLO in prova ogni volta che c'e' un commit nuovo su main (launchd, controllo ogni 60 secondi).
# Da lanciare sul Mac mini come utente normale (builder), non con sudo. Il clone deve esistere gia' (di norma ~/dev-machine/progetti/cosmic-horror).
# Uso: ./installa.sh                      installa (o aggiorna) il job
#      ./installa.sh --token [ambiente]   scrive il file del token (prova, oppure produzione) chiedendolo senza mostrarlo; mai sulla riga di comando
set -eu
QUI="$(cd "$(dirname "$0")" && pwd)"
CLONE="${CT_CLONE:-$HOME/dev-machine/progetti/cosmic-horror}"
BASE="$CLONE/.pubblicazione"
ETICHETTA="it.cosmichorror.pubblica"
PLIST="$HOME/Library/LaunchAgents/$ETICHETTA.plist"

if [ "$(uname)" != "Darwin" ]; then echo "Questo script e' per macOS (il Mac mini)."; exit 1; fi
if [ "$(id -u)" -eq 0 ]; then echo "Non lanciarlo con sudo: deve girare come il tuo utente."; exit 1; fi
if [ ! -d "$CLONE/.git" ]; then
  echo "Non trovo il clone in $CLONE."
  echo "Il clone di cosmic-horror deve gia' esserci (clonato via HTTPS in dev-machine/progetti). Se sta altrove: CT_CLONE=/percorso ./installa.sh"
  exit 1
fi

metti_token() {
  amb="${1:-prova}"
  case "$amb" in prova|produzione) ;; *) echo "Ambiente sconosciuto «$amb»: usa prova oppure produzione."; exit 1 ;; esac
  [ -t 0 ] || { echo "Serve un terminale per scrivere il token (non si vede mentre lo scrivi)."; exit 1; }
  f="$CLONE/.swa-token-$amb"
  echo "Incolla il token di distribuzione della Static Web App di $amb (non si vede mentre lo scrivi), poi Invio."
  umask 077
  read -r -s t
  [ -n "$t" ] || { echo "Token vuoto: non scrivo niente."; exit 1; }
  printf '%s\n' "$t" > "$f"
  chmod 600 "$f"
  echo "Token scritto in $f (permessi 600)."
}

if [ "${1:-}" = "--token" ]; then metti_token "${2:-prova}"; exit 0; fi

command -v git >/dev/null || { echo "Manca git: installa gli Strumenti da riga di comando di Xcode con «xcode-select --install»."; exit 1; }
command -v node >/dev/null || { echo "Manca Node.js: installalo (vedi la guida in docs/05-technical-design/04-build-deployment/) e rilancia."; exit 1; }
command -v npm >/dev/null || { echo "Manca npm (arriva con Node.js)."; exit 1; }
echo "Node $(node --version), git $(git --version | cut -d' ' -f3)"

# il job fa «git fetch» da solo, senza domande: se qui non funziona, ogni minuto fallirebbe. Meglio fermarsi subito.
echo "Controllo che git riesca a leggere il repository senza chiedere credenziali..."
if ! GIT_TERMINAL_PROMPT=0 git -C "$CLONE" fetch --quiet origin main </dev/null; then
  echo
  echo "ERRORE: «git fetch» nel clone ($CLONE) non funziona senza credenziali."
  echo "Controlla la rete e l'indirizzo: git -C \"$CLONE\" remote -v (deve essere l'indirizzo HTTPS del repository pubblico)."
  echo "Se il repository e' diventato privato, configura le credenziali per questo utente con: gh auth setup-git"
  echo "Il job NON e' stato installato."
  exit 1
fi

mkdir -p "$BASE/bin" "$BASE/log" "$BASE/stato" "$HOME/Library/LaunchAgents"
# il job parte da una copia dello script: cosi' un checkout nel clone non cambia lo script mentre gira (per aggiornarlo: rilancia installa.sh)
cp -f "$QUI/controlla-e-pubblica.sh" "$BASE/bin/controlla-e-pubblica.sh"
chmod 700 "$BASE/bin/controlla-e-pubblica.sh"
if [ ! -f "$BASE/pubblica.conf" ]; then
  cp "$QUI/pubblica.conf.esempio" "$BASE/pubblica.conf"
  echo "Creato $BASE/pubblica.conf (i valori predefiniti di norma vanno bene)."
fi

if [ ! -s "$CLONE/.swa-token-prova" ]; then
  echo "Manca il token del sito di prova ($CLONE/.swa-token-prova)."
  if [ -t 0 ]; then metti_token prova; else echo "Crealo (solo il token, chmod 600) o lancia ./installa.sh --token: finche' manca il job scrive PROBLEMA nel log e non pubblica."; fi
fi

sed -e "s#@SCRIPT@#$BASE/bin/controlla-e-pubblica.sh#g" -e "s#@BASE@#$BASE#g" -e "s#@HOME@#$HOME#g" "$QUI/it.cosmichorror.pubblica.plist.modello" > "$PLIST"
plutil -lint "$PLIST" >/dev/null

UID_N="$(id -u)"
launchctl bootout "gui/$UID_N" "$PLIST" >/dev/null 2>&1 || launchctl bootout "user/$UID_N" "$PLIST" >/dev/null 2>&1 || launchctl unload "$PLIST" >/dev/null 2>&1 || true
# gui/<uid> se l'utente e' collegato al Mac, altrimenti user/<uid> (utente senza sessione grafica, per esempio solo SSH)
if ! launchctl bootstrap "gui/$UID_N" "$PLIST" 2>/dev/null && ! launchctl bootstrap "user/$UID_N" "$PLIST" 2>/dev/null; then launchctl load "$PLIST"; fi

echo
echo "Installato. Pubblica SOLO in prova, a ogni commit nuovo su main: il controllo parte subito e poi ogni 60 secondi."
echo "  Stato:   $BASE/bin/controlla-e-pubblica.sh --stato"
echo "  Log:     $BASE/log/pubblica.log"
echo "  Config:  $BASE/pubblica.conf"
echo "La produzione si pubblica a mano: cd $CLONE/game/prototipo && npm run pubblica -- produzione"
