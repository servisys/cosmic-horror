#!/bin/bash
# Cosmic Horror - controlla se c'e' una versione nuova del gioco e, se si', la pubblica su Azure Static Web Apps.
# Lo lancia launchd ogni 60 secondi (vedi installa.sh); si puo' lanciare anche a mano.
#
# Ogni esecuzione: git ls-remote -> se l'ultimo commit di main (modalita' «main», predefinita) oppure l'ultimo tag v* (modalita' «versioni»)
# e' diverso dall'ultimo pubblicato, fa fetch e checkout in una cartella di lavoro dedicata, npm ci, «npm run pubblica» (test, build, deploy),
# salva l'ultimo pubblicato e scrive il log. Un file di blocco evita due build insieme; una build fallita non viene ripetuta sullo stesso
# commit (si riprova con un commit nuovo, oppure a mano con --riprova). Il token sta nel Portachiavi di macOS e non finisce mai in un file o nel log.
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

BASE="${CT_BASE:-$HOME/CosmicHorrorPubblica}"
CONF="${CT_CONF:-$BASE/pubblica.conf}"
STATO="$BASE/stato"
LOGDIR="$BASE/log"
LAVORO="$BASE/lavoro"
BLOCCO="$STATO/blocco"
LOG="$LOGDIR/pubblica.log"
ULTIMA_BUILD="$LOGDIR/ultima-build.log"
SECURITY="${CT_SECURITY:-security}"
CMD_NPM_CI="${CT_NPM_CI:-npm ci}"
CMD_PUBBLICA="${CT_PUBBLICA:-npm run pubblica}"

mkdir -p "$STATO" "$LOGDIR"

# --- configurazione (file chiave=valore: si leggono solo le chiavi note, non si esegue nulla) ---
leggi_conf() {
  [ -f "$CONF" ] || return 0
  grep -E "^[[:space:]]*$1[[:space:]]*=" "$CONF" | tail -n 1 | sed -E "s/^[^=]*=[[:space:]]*//; s/[[:space:]]+\$//; s/^\"(.*)\"\$/\1/; s/^'(.*)'\$/\1/"
}
REPO_URL="${REPO_URL:-$(leggi_conf REPO_URL)}"
CHIAVE="${CHIAVE:-$(leggi_conf CHIAVE)}"
MODALITA="${MODALITA:-$(leggi_conf MODALITA)}"
SERVIZIO="${SERVIZIO_PORTACHIAVI:-$(leggi_conf SERVIZIO_PORTACHIAVI)}"
case "$CHIAVE" in "~"*) CHIAVE="$HOME${CHIAVE#~}" ;; esac
[ -n "$MODALITA" ] || MODALITA=main
[ -n "$SERVIZIO" ] || SERVIZIO=cosmic-horror-swa

log() { echo "$(date '+%Y-%m-%d %H:%M:%S') | $*" >> "$LOG"; }

# un messaggio di problema si scrive una volta sola finche' non cambia (il job gira ogni minuto: niente righe ripetute)
# (ogni genere di problema - conf, repo, token - ha il suo promemoria: si riscrive solo se il messaggio cambia o dopo che il problema era sparito)
problema() {
  if [ "$(cat "$STATO/problema-$1" 2>/dev/null)" != "$2" ]; then
    log "$MODALITA | PROBLEMA: $2"
    printf '%s' "$2" > "$STATO/problema-$1"
  fi
}
nessun_problema() { rm -f "$STATO/problema-$1"; }

# il log non cresce all'infinito: sopra 2 MB si tiene una copia vecchia
if [ -f "$LOG" ] && [ "$(wc -c < "$LOG")" -gt 2097152 ]; then mv -f "$LOG" "$LOG.1"; fi

if [ "${1:-}" = "--stato" ]; then
  echo "Modalita':          $MODALITA"
  echo "Repository:         ${REPO_URL:-(non configurato)}"
  echo "Ultimo pubblicato:  $(cat "$STATO/ultimo-pubblicato" 2>/dev/null || echo '(niente)')"
  echo "Ultimo fallito:     $(cat "$STATO/ultimo-fallito" 2>/dev/null || echo '(niente)')"
  echo "Problemi aperti:    $(cat "$STATO"/problema-* 2>/dev/null || echo '(nessuno)')"
  echo "Log: $LOG"
  tail -n 10 "$LOG" 2>/dev/null
  exit 0
fi
if [ "${1:-}" = "--riprova" ]; then
  rm -f "$STATO/ultimo-fallito"
  echo "Ok: al prossimo giro si riprova l'ultimo commit fallito."
fi

if [ -z "$REPO_URL" ]; then problema conf "REPO_URL non configurato in $CONF"; exit 0; fi

# --- ssh in sola lettura con la deploy key (se indicata) ---
SSH_CMD="ssh -o BatchMode=yes -o StrictHostKeyChecking=accept-new -o ConnectTimeout=20"
if [ -n "$CHIAVE" ]; then SSH_CMD="$SSH_CMD -i '$CHIAVE' -o IdentitiesOnly=yes"; fi
export GIT_SSH_COMMAND="$SSH_CMD"
export GIT_TERMINAL_PROMPT=0

# --- cosa c'e' di nuovo online? ---
TAG=""
case "$MODALITA" in
  main)
    SHA=$(git ls-remote "$REPO_URL" refs/heads/main 2>/dev/null | cut -f1 | head -n 1)
    ID="$SHA"
    ;;
  versioni)
    RIGA=$(git ls-remote --tags --refs --sort=-v:refname "$REPO_URL" 'v*' 2>/dev/null | head -n 1)
    SHA=$(echo "$RIGA" | cut -f1)
    TAG=$(echo "$RIGA" | cut -f2 | sed 's#^refs/tags/##')
    ID="$TAG $SHA"
    ;;
  *)
    problema conf "modalita' sconosciuta «$MODALITA» (usa main oppure versioni)"; exit 0 ;;
esac
if [ -z "$SHA" ]; then
  if [ "$MODALITA" = versioni ]; then problema repo "nessun tag v* trovato (o repository non raggiungibile)"; else problema repo "repository non raggiungibile o branch main non trovato (rete? deploy key?)"; fi
  exit 0
fi
nessun_problema repo
nessun_problema conf

[ "$ID" = "$(cat "$STATO/ultimo-pubblicato" 2>/dev/null)" ] && exit 0
[ "$ID" = "$(cat "$STATO/ultimo-fallito" 2>/dev/null)" ] && exit 0 # gia' fallito: non si riprova all'infinito

# --- un solo giro alla volta ---
if ! mkdir "$BLOCCO" 2>/dev/null; then
  VECCHIO=$(cat "$BLOCCO/pid" 2>/dev/null || echo "")
  if [ -n "$VECCHIO" ] && kill -0 "$VECCHIO" 2>/dev/null && [ -z "$(find "$BLOCCO" -maxdepth 0 -mmin +120 2>/dev/null)" ]; then exit 0; fi
  log "$MODALITA | blocco vecchio o senza processo: lo tolgo"
  rm -rf "$BLOCCO"
  mkdir "$BLOCCO" 2>/dev/null || exit 0
fi
echo $$ > "$BLOCCO/pid"
trap 'rm -rf "$BLOCCO"' EXIT

# --- il token sta nel Portachiavi ---
TOKEN=$("$SECURITY" find-generic-password -s "$SERVIZIO" -a "$USER" -w 2>/dev/null)
if [ -z "$TOKEN" ]; then
  problema token "token non trovato nel Portachiavi (servizio «$SERVIZIO»): lancia installa.sh --token"
  exit 0
fi
nessun_problema token

# --- codice: fetch e checkout in una cartella di lavoro dedicata ---
log "$MODALITA | ${TAG:+$TAG }$(echo "$SHA" | cut -c1-7) | INIZIO"
preparazione() {
  if [ ! -d "$LAVORO/.git" ]; then
    rm -rf "$LAVORO"
    git clone --quiet --no-checkout "$REPO_URL" "$LAVORO" || return 1
  fi
  cd "$LAVORO" || return 1
  git fetch --quiet --tags --force origin '+refs/heads/main:refs/remotes/origin/main' || return 1
  if [ "$MODALITA" = versioni ]; then RIF="refs/tags/$TAG"; else RIF="refs/remotes/origin/main"; fi
  git checkout --quiet --force --detach "$RIF" || return 1
  git clean -fdq
}
costruisci() {
  cd "$LAVORO/game/prototipo" || return 1
  echo "=== npm ci"
  bash -c "$CMD_NPM_CI" || return 1
  echo "=== pubblica (test, build, deploy)"
  # il token passa solo come variabile d'ambiente di questo comando
  SWA_CLI_DEPLOYMENT_TOKEN="$TOKEN" bash -c "$CMD_PUBBLICA"
}

COMMIT7=$(echo "$SHA" | cut -c1-7)
{ preparazione && costruisci; } > "$ULTIMA_BUILD" 2>&1
ESITO=$?
# per sicurezza il token non resta nemmeno per sbaglio nel log della build
if [ -n "$TOKEN" ] && grep -qF -- "$TOKEN" "$ULTIMA_BUILD" 2>/dev/null; then
  echo "(il token e' stato coperto)" >> "$ULTIMA_BUILD"
  TMP="$ULTIMA_BUILD.tmp"
  awk -v t="$TOKEN" '{ while ((i = index($0, t)) > 0) $0 = substr($0, 1, i - 1) "***" substr($0, i + length(t)); print }' "$ULTIMA_BUILD" > "$TMP" && mv -f "$TMP" "$ULTIMA_BUILD"
fi
TOKEN=""

if [ "$ESITO" -eq 0 ]; then
  printf '%s' "$ID" > "$STATO/ultimo-pubblicato"
  rm -f "$STATO/ultimo-fallito"
  log "$MODALITA | ${TAG:+$TAG }$COMMIT7 | PUBBLICATO"
  exit 0
fi
printf '%s' "$ID" > "$STATO/ultimo-fallito"
cp -f "$ULTIMA_BUILD" "$LOGDIR/fallita-$COMMIT7.log" 2>/dev/null
log "$MODALITA | ${TAG:+$TAG }$COMMIT7 | FALLITO (dettagli in log/fallita-$COMMIT7.log; non riprovo questo commit finche' non ne arriva uno nuovo)"
exit 1
