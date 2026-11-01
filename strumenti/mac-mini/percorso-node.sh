# Funzioni condivise da controlla-e-pubblica.sh (il job) e installa.sh. Si caricano con «.» (source): non si lancia da solo.
# Il job ne tiene una copia in <clone>/.pubblicazione/bin e la aggiorna da solo dopo ogni checkout (vedi controlla-e-pubblica.sh).
# Bash 3.2 di macOS: niente funzioni delle bash recenti. Non si esegue nessuno script di profilo (mise, nvm, volta): si guardano solo le cartelle.

# imposta_path_node [cartella_node]
# Mette in PATH il necessario perche' il job trovi node, npm e npx anche sotto launchd (che parte con un PATH minimo).
# - cartella_node valorizzata (chiave CARTELLA_NODE di pubblica.conf): va in testa al PATH, e basta.
# - vuota: ripiego automatico sui posti tipici dell'utente (la versione piu' recente di Node di mise, le shim di mise, ~/.local/bin, nvm, volta).
imposta_path_node() {
  _cartella="${1:-}"
  case "$_cartella" in "~"*) _cartella="$HOME${_cartella#~}" ;; esac
  _cartella="${_cartella%/}"
  _extra=""
  if [ -n "$_cartella" ]; then
    _extra="$_cartella"
  else
    _mise=$(ls -td "$HOME"/.local/share/mise/installs/node/*/bin 2>/dev/null | head -n 1)
    _nvm=$(ls -td "$HOME"/.nvm/versions/node/*/bin 2>/dev/null | head -n 1)
    for _d in "$_mise" "$HOME/.local/share/mise/shims" "$HOME/.local/bin" "$_nvm" "$HOME/.volta/bin"; do
      [ -n "$_d" ] && _extra="$_extra:$_d"
    done
    _extra="${_extra#:}"
  fi
  PATH="${_extra:+$_extra:}/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"
  export PATH
}

# genera_plist modello script base home
# Stampa il plist di launchd ricavato dal modello (lo usa installa.sh per scriverlo, il job per accorgersi che e' cambiato).
genera_plist() {
  sed -e "s#@SCRIPT@#$2#g" -e "s#@BASE@#$3#g" -e "s#@HOME@#$4#g" "$1"
}
