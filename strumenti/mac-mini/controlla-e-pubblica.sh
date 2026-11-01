#!/bin/bash
# Cosmic Horror - controlla se c'e' una versione nuova di main e, se si', la pubblica SOLO sul sito di PROVA (Azure Static Web Apps).
# La produzione non si pubblica da qui: si fa a mano, con lo stesso commit gia' in prova (npm run pubblica -- produzione, vedi la guida).
# Lo lancia launchd ogni 60 secondi (vedi installa.sh); si puo' lanciare anche a mano.
#
# Si lavora nel clone che c'e' gia' sul Mac (di norma /Users/builder/dev-machine/progetti/cosmic-horror); log, stato e copia dello script
# stanno in <clone>/.pubblicazione (ignorata da git). Ogni esecuzione: git ls-remote -> se l'ultimo commit di main e' diverso dall'ultimo pubblicato,
# controlla che la macchina sia libera (una build pesante alla volta, vedi sotto), poi fetch e checkout di main nel clone, npm ci, «npm run pubblica -- prova»
# (tipi, test, build, deploy in prova), salva l'ultimo pubblicato e scrive il log. Una build fallita non viene ripetuta sullo stesso commit
# (si riprova con un commit nuovo, oppure a mano con --riprova). Il token sta nel file .swa-token-prova del clone (permessi 600): lo legge pubblica.mjs.
#
# UNA BUILD PESANTE ALLA VOLTA (il Mac e' condiviso con Folk Lore): il giro si salta, senza segnare fallimento, se
#  1. il lucchetto della batteria di test di Folk Lore esiste e contiene il pid (campo "pid" della riga JSON) di un processo vivo, oppure se il pid non si legge ma il file e' piu' recente di 120 minuti
#     (percorso in pubblica.conf: LUCCHETTO_FOLK_LORE), oppure
#  2. c'e' un processo node/npm/vite/vitest/tsc/playwright/esbuild con un percorso sotto la cartella dei progetti ma fuori da Cosmic Horror
#     (CARTELLA_PROGETTI in pubblica.conf; e' un controllo «a occhio» sulla riga di comando dei processi), oppure
#  3. c'e' il blocco proprio di Cosmic Horror (due giri insieme).
# Si riprova al giro dopo. Folk Lore non viene toccato.
#
# Uso: controlla-e-pubblica.sh [--stato | --riprova]
# Scritto per la bash 3.2 di macOS (niente funzioni delle bash recenti).

set -u
# sotto launchd alcune variabili possono mancare
USER="${USER:-$(id -un)}"
HOME="${HOME:-$(eval echo ~"$USER")}"
export USER HOME
PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"
export PATH
# funzioni condivise con installa.sh (PATH di Node, plist); sta accanto a questo script
QUI="$(cd "$(dirname "$0")" && pwd)"
if [ ! -f "$QUI/percorso-node.sh" ]; then echo "manca $QUI/percorso-node.sh: rilancia installa.sh" >&2; exit 1; fi
. "$QUI/percorso-node.sh"

CLONE="${CT_CLONE:-$HOME/dev-machine/progetti/cosmic-horror}"
BASE="$CLONE/.pubblicazione"
CONF="${CT_CONF:-$BASE/pubblica.conf}"
STATO="$BASE/stato"
LOGDIR="$BASE/log"
BLOCCO="$STATO/blocco"
LOG="$LOGDIR/pubblica.log"
ULTIMA_BUILD="$LOGDIR/ultima-build.log"
FILE_TOKEN="$CLONE/.swa-token-prova"
CMD_NPM_CI="${CT_NPM_CI:-npm ci}"
CMD_PUBBLICA="${CT_PUBBLICA:-npm run pubblica -- prova}"
CMD_PS="${CT_PS:-ps -axo command=}"
CMD_NPM="${CT_NPM:-npm}" # solo il nome da cercare nel PATH: prova-logica.sh lo cambia per provare il caso «npm assente»
BIN="$BASE/bin"
PLIST="${CT_PLIST:-$HOME/Library/LaunchAgents/it.cosmichorror.pubblica.plist}"
AMBIENTE=prova

mkdir -p "$STATO" "$LOGDIR"

# --- configurazione (file chiave=valore: si leggono solo le chiavi note, non si esegue nulla) ---
leggi_conf() {
  [ -f "$CONF" ] || return 0
  grep -E "^[[:space:]]*$1[[:space:]]*=" "$CONF" | tail -n 1 | sed -E "s/^[^=]*=[[:space:]]*//; s/[[:space:]]+\$//; s/^\"(.*)\"\$/\1/; s/^'(.*)'\$/\1/"
}
LUCCHETTO_FOLK_LORE="${LUCCHETTO_FOLK_LORE:-$(leggi_conf LUCCHETTO_FOLK_LORE)}"
CARTELLA_PROGETTI="${CARTELLA_PROGETTI:-$(leggi_conf CARTELLA_PROGETTI)}"
CARTELLA_NODE="${CARTELLA_NODE:-$(leggi_conf CARTELLA_NODE)}"
# Node deve essere trovabile anche sotto launchd (PATH minimo): senza toccare il sistema, solo il PATH di questo script
imposta_path_node "$CARTELLA_NODE"
[ -n "$LUCCHETTO_FOLK_LORE" ] || LUCCHETTO_FOLK_LORE="$HOME/dev-machine/progetti/mandi/.coda/batteria.lock"
[ -n "$CARTELLA_PROGETTI" ] || CARTELLA_PROGETTI="$HOME/dev-machine/progetti"
case "$LUCCHETTO_FOLK_LORE" in "~"*) LUCCHETTO_FOLK_LORE="$HOME${LUCCHETTO_FOLK_LORE#~}" ;; esac
case "$CARTELLA_PROGETTI" in "~"*) CARTELLA_PROGETTI="$HOME${CARTELLA_PROGETTI#~}" ;; esac
CARTELLA_PROGETTI="${CARTELLA_PROGETTI%/}"

log() { echo "$(date '+%Y-%m-%d %H:%M:%S') | $*" >> "$LOG"; }

# un messaggio di problema (o di attesa) si scrive una volta sola finche' non cambia (il job gira ogni minuto: niente righe ripetute)
# (ogni genere - conf, repo, token, attesa - ha il suo promemoria: si riscrive solo se il messaggio cambia o dopo che il problema era sparito)
problema() {
  if [ "$(cat "$STATO/problema-$1" 2>/dev/null)" != "$2" ]; then
    log "$AMBIENTE | PROBLEMA: $2"
    printf '%s' "$2" > "$STATO/problema-$1"
  fi
}
nessun_problema() { rm -f "$STATO/problema-$1"; }
attesa() {
  if [ "$(cat "$STATO/attesa" 2>/dev/null)" != "$1" ]; then
    log "$AMBIENTE | IN ATTESA: $1"
    printf '%s' "$1" > "$STATO/attesa"
  fi
}

# il log non cresce all'infinito: sopra 2 MB si tiene una copia vecchia
if [ -f "$LOG" ] && [ "$(wc -c < "$LOG")" -gt 2097152 ]; then mv -f "$LOG" "$LOG.1"; fi

if [ "${1:-}" = "--stato" ]; then
  echo "Sito:               $AMBIENTE (la produzione si pubblica a mano)"
  echo "Clone:              $CLONE"
  echo "Ultimo pubblicato:  $(cat "$STATO/ultimo-pubblicato" 2>/dev/null || echo '(niente)')"
  echo "Ultimo fallito:     $(cat "$STATO/ultimo-fallito" 2>/dev/null || echo '(niente)')"
  echo "In attesa:          $(cat "$STATO/attesa" 2>/dev/null || echo '(no)')"
  echo "Problemi aperti:    $(cat "$STATO"/problema-* 2>/dev/null || echo '(nessuno)')"
  echo "Log: $LOG"
  tail -n 10 "$LOG" 2>/dev/null
  exit 0
fi
if [ "${1:-}" = "--riprova" ]; then
  rm -f "$STATO/ultimo-fallito"
  echo "Ok: al prossimo giro si riprova l'ultimo commit fallito."
fi

if [ ! -d "$CLONE/.git" ]; then problema conf "il clone $CLONE non esiste (o non e' un repository git)"; exit 0; fi

# --- cosa c'e' di nuovo online? (HTTPS, repository pubblico: niente credenziali; mai domande interattive) ---
export GIT_TERMINAL_PROMPT=0
SHA=$(git -C "$CLONE" ls-remote origin refs/heads/main 2>/dev/null | cut -f1 | head -n 1)
if [ -z "$SHA" ]; then
  problema repo "repository non raggiungibile o branch main non trovato (rete? se il repository e' diventato privato: gh auth setup-git per l'utente del Mac)"
  exit 0
fi
nessun_problema repo
nessun_problema conf
ID="$SHA"

[ "$ID" = "$(cat "$STATO/ultimo-pubblicato" 2>/dev/null)" ] && exit 0
[ "$ID" = "$(cat "$STATO/ultimo-fallito" 2>/dev/null)" ] && exit 0 # gia' fallito: non si riprova all'infinito

# --- Node: se npm non si trova e' un problema di configurazione, non della build: si scrive il problema e non si segna fallito ---
if ! command -v "$CMD_NPM" >/dev/null 2>&1; then
  problema node "non trovo $CMD_NPM col PATH del job ($PATH): scrivi in $CONF la riga CARTELLA_NODE=<cartella che contiene node, npm e npx> (per esempio CARTELLA_NODE=/Users/builder/.local/share/mise/installs/node/22/bin) oppure rilancia installa.sh"
  exit 0
fi
nessun_problema node

# --- il token del sito di prova (file con permessi 600, letto da pubblica.mjs) ---
if [ ! -s "$FILE_TOKEN" ]; then
  problema token "manca il token del sito di prova: crea il file $FILE_TOKEN (solo il token, chmod 600) oppure lancia installa.sh --token"
  exit 0
fi
# prima la forma GNU (-c): sul stat di macOS non esiste e si passa a quella BSD (-f); al contrario su Linux «stat -f» da' altro
PERMESSI=$(stat -c %a "$FILE_TOKEN" 2>/dev/null || stat -f %Lp "$FILE_TOKEN" 2>/dev/null)
# CT_SALTA_PERMESSI serve solo a prova-logica.sh su file system dove chmod non vale (per esempio Windows)
if [ -z "${CT_SALTA_PERMESSI:-}" ] && [ "$PERMESSI" != 600 ] && [ "$PERMESSI" != 400 ]; then
  problema token "il file $FILE_TOKEN ha permessi $PERMESSI: correggi con chmod 600"
  exit 0
fi
nessun_problema token

# --- una build pesante alla volta: se la macchina e' occupata si salta il giro (senza segnare fallimento) ---
pid_vivo() { [ -n "$1" ] && kill -0 "$1" 2>/dev/null; }
# 1. lucchetto della batteria di test di Folk Lore: una riga JSON {"pid":12345,"filtro":"tutto","quando":"..."}
if [ -f "$LUCCHETTO_FOLK_LORE" ]; then
  RIGA_FL=$(head -n 1 "$LUCCHETTO_FOLK_LORE" 2>/dev/null | tr -d '\r')
  # il pid si prende dal campo "pid" (non da tutte le cifre della riga: ci sono anche la data e il filtro); ripiego: file con un numero nudo
  PID_FL=$(echo "$RIGA_FL" | grep -oE '"pid"[[:space:]]*:[[:space:]]*[0-9]+' | head -n 1 | grep -oE '[0-9]+$')
  [ -n "$PID_FL" ] || PID_FL=$(echo "$RIGA_FL" | grep -xE '[[:space:]]*[0-9]+[[:space:]]*' | tr -d '[:space:]')
  if [ -n "$PID_FL" ]; then
    if pid_vivo "$PID_FL"; then attesa "batteria di test di Folk Lore in corso (pid $PID_FL, lucchetto $LUCCHETTO_FOLK_LORE)"; exit 0; fi
  elif [ -n "$(find "$LUCCHETTO_FOLK_LORE" -maxdepth 0 -mmin -120 2>/dev/null)" ]; then
    # pid illeggibile: prudenza, il lucchetto recente (meno di 120 minuti, come il blocco proprio) vale come batteria in corso
    attesa "lucchetto di Folk Lore recente ma con pid illeggibile (lucchetto $LUCCHETTO_FOLK_LORE)"; exit 0
  fi
fi
# 2. altre build sotto la cartella dei progetti, fuori da Cosmic Horror
ALTRE=$($CMD_PS 2>/dev/null | grep -F -- "$CARTELLA_PROGETTI/" | grep -v -F -- "$CLONE" | grep -E 'node|npm|vite|vitest|tsc|playwright|esbuild' | head -n 1)
if [ -n "$ALTRE" ]; then attesa "build di un altro progetto in corso ($(echo "$ALTRE" | cut -c1-120))"; exit 0; fi
# 3. blocco proprio di Cosmic Horror (due giri insieme)
if ! mkdir "$BLOCCO" 2>/dev/null; then
  VECCHIO=$(cat "$BLOCCO/pid" 2>/dev/null || echo "")
  if pid_vivo "$VECCHIO" && [ -z "$(find "$BLOCCO" -maxdepth 0 -mmin +120 2>/dev/null)" ]; then exit 0; fi
  log "$AMBIENTE | blocco vecchio o senza processo: lo tolgo"
  rm -rf "$BLOCCO"
  mkdir "$BLOCCO" 2>/dev/null || exit 0
fi
echo $$ > "$BLOCCO/pid"
trap 'rm -rf "$BLOCCO"' EXIT
rm -f "$STATO/attesa"

# --- codice: fetch e checkout di main nel clone ---
log "$AMBIENTE | $(echo "$SHA" | cut -c1-7) | INIZIO"
# il job si aggiorna da solo: dopo il checkout, se lo script o il file condiviso del clone sono cambiati, si ricopiano in bin
# (copia nuova + mv: lo script che gira tiene il suo vecchio file, il giro dopo parte da quello nuovo). Il plist non si tocca: si segnala soltanto.
aggiorna_job() {
  _src="$CLONE/strumenti/mac-mini"
  [ -d "$_src" ] || return 0
  mkdir -p "$BIN"
  for _f in controlla-e-pubblica.sh percorso-node.sh; do
    [ -f "$_src/$_f" ] || continue
    if ! cmp -s "$_src/$_f" "$BIN/$_f"; then
      if cp -f "$_src/$_f" "$BIN/$_f.nuovo" && chmod 700 "$BIN/$_f.nuovo" && mv -f "$BIN/$_f.nuovo" "$BIN/$_f"; then
        log "$AMBIENTE | job aggiornato: $_f (vale dal giro dopo)"
      else
        rm -f "$BIN/$_f.nuovo"
        problema aggiorna "non riesco ad aggiornare $BIN/$_f dalla copia nel clone: rilancia installa.sh"
      fi
    fi
  done
  if [ -f "$PLIST" ] && [ -f "$_src/it.cosmichorror.pubblica.plist.modello" ]; then
    _atteso=$(genera_plist "$_src/it.cosmichorror.pubblica.plist.modello" "$BIN/controlla-e-pubblica.sh" "$BASE" "$HOME")
    if [ "$_atteso" != "$(cat "$PLIST")" ]; then
      problema plist "il plist di launchd e' cambiato nel repository (o non corrisponde a quello installato): rilancia installa.sh"
    else
      nessun_problema plist
    fi
  fi
}
preparazione() {
  cd "$CLONE" || return 1
  git fetch --quiet origin '+refs/heads/main:refs/remotes/origin/main' || return 1
  # il branch main locale segue origin/main (cosi' «git pull» nel clone funziona); i file ignorati (token, copie, log) non si toccano
  git checkout --quiet --force -B main refs/remotes/origin/main || return 1
  # -e: token, copie e log non si perdono nemmeno se un .gitignore di un commit vecchio non li elenca
  git clean -fdq -e '.pubblicazione/' -e '.pubblicati/' -e '.swa-token-*'
  ID=$(git rev-parse HEAD)
  SHA="$ID"
  aggiorna_job
}
costruisci() {
  cd "$CLONE/game/prototipo" || return 1
  echo "=== npm ci"
  bash -c "$CMD_NPM_CI" || return 1
  echo "=== pubblica in prova (tipi, test, build, deploy)"
  bash -c "$CMD_PUBBLICA"
}

# preparazione gira nella shell corrente (aggiorna ID e SHA), poi la build; l'output va tutto nel log dell'ultima build
{ preparazione && costruisci; } > "$ULTIMA_BUILD" 2>&1
ESITO=$?
COMMIT7=$(echo "$SHA" | cut -c1-7)
# per sicurezza il token non resta nemmeno per sbaglio nel log della build
TOKEN=$(head -n 1 "$FILE_TOKEN" 2>/dev/null | tr -d '\r\n')
if [ -n "$TOKEN" ] && grep -qF -- "$TOKEN" "$ULTIMA_BUILD" 2>/dev/null; then
  echo "(il token e' stato coperto)" >> "$ULTIMA_BUILD"
  TMP="$ULTIMA_BUILD.tmp"
  awk -v t="$TOKEN" '{ while ((i = index($0, t)) > 0) $0 = substr($0, 1, i - 1) "***" substr($0, i + length(t)); print }' "$ULTIMA_BUILD" > "$TMP" && mv -f "$TMP" "$ULTIMA_BUILD"
fi
TOKEN=""

if [ "$ESITO" -eq 0 ]; then
  printf '%s' "$ID" > "$STATO/ultimo-pubblicato"
  rm -f "$STATO/ultimo-fallito"
  log "$AMBIENTE | $COMMIT7 | PUBBLICATO"
  exit 0
fi
printf '%s' "$ID" > "$STATO/ultimo-fallito"
cp -f "$ULTIMA_BUILD" "$LOGDIR/fallita-$COMMIT7.log" 2>/dev/null
log "$AMBIENTE | $COMMIT7 | FALLITO (dettagli in .pubblicazione/log/fallita-$COMMIT7.log; non riprovo questo commit finche' non ne arriva uno nuovo)"
exit 1
