#!/bin/bash
# Prova della logica di controlla-e-pubblica.sh con un repository locale, un «security» finto e una pubblicazione finta (nessuna rete, nessun token vero).
# Uso: ./prova-logica.sh      (serve che il repository abbia un commit su main; si puo' lanciare anche su Windows con Git Bash)
set -u
QUI="$(cd "$(dirname "$0")" && pwd)"
S="$QUI/controlla-e-pubblica.sh"
RADICE="$(cd "$QUI/../.." && pwd)"
T=$(mktemp -d "${TMPDIR:-/tmp}/macprova.XXXX")
git clone -q --bare "$RADICE" "$T/remoto.git" 2>/dev/null
git clone -q "$T/remoto.git" "$T/w" && git -C "$T/w" config user.email t@t && git -C "$T/w" config user.name t
cat > "$T/sec.sh" <<'EOS'
#!/bin/bash
[ -f "$CT_SENZA_TOKEN" ] && exit 44
echo "TOKEN-DI-PROVA-123"
EOS
chmod +x "$T/sec.sh"
export CT_BASE="$T/base" REPO_URL="file://$T/remoto.git" CT_SECURITY="$T/sec.sh" CT_NPM_CI="echo ci-ok" CT_SENZA_TOKEN="$T/senza-token"
export CT_PUBBLICA="echo \"tokenpresente=\${SWA_CLI_DEPLOYMENT_TOKEN:+si}\"; echo \"[\$SWA_CLI_DEPLOYMENT_TOKEN]\"; echo x >> $T/chiamate"
ok=0; ko=0
verifica() { if [ "$2" = "$3" ]; then ok=$((ok+1)); echo "OK  $1"; else ko=$((ko+1)); echo "KO  $1 (atteso: $3, trovato: $2)"; fi; }
chiamate() { wc -l < "$T/chiamate" 2>/dev/null | tr -d ' ' || echo 0; }
[ -f "$T/chiamate" ] || : > "$T/chiamate"
nuovo_commit() { echo "$1" >> "$T/w/prova.txt"; git -C "$T/w" add -A; git -C "$T/w" commit -q -m "$1"; git -C "$T/w" push -q origin HEAD:main; }

# modalita' main
bash "$S"; verifica "1. primo giro: pubblica" "$(chiamate)" 1
verifica "   ultimo pubblicato = commit di main" "$(cat "$T/base/stato/ultimo-pubblicato")" "$(git -C "$T/remoto.git" rev-parse refs/heads/main)"
bash "$S"; verifica "2. giro senza novita': niente" "$(chiamate)" 1
nuovo_commit uno; bash "$S"; verifica "3. commit nuovo: pubblica" "$(chiamate)" 2
verifica "   la cartella di lavoro e' sul commit giusto" "$(git -C "$T/base/lavoro" rev-parse HEAD)" "$(git -C "$T/remoto.git" rev-parse refs/heads/main)"
verifica "4. il token non e' nel log" "$(grep -rc 'TOKEN-DI-PROVA-123' "$T/base/log" "$T/base/stato" | grep -v ':0' | wc -l | tr -d ' ')" 0
verifica "   ma la build l'ha ricevuto" "$(grep -c 'tokenpresente=si' "$T/base/log/ultima-build.log")" 1
# fallimento
export CT_PUBBLICA="echo rotto; exit 3"
nuovo_commit due; bash "$S"; verifica "5. build fallita: segnata come fallita" "$(cat "$T/base/stato/ultimo-fallito")" "$(git -C "$T/remoto.git" rev-parse refs/heads/main)"
verifica "   il log dice FALLITO" "$(grep -c 'FALLITO' "$T/base/log/pubblica.log")" 1
bash "$S"; bash "$S"; verifica "6. non riprova lo stesso commit (una sola riga INIZIO per il commit)" "$(grep -c 'INIZIO' "$T/base/log/pubblica.log")" 3
export CT_PUBBLICA="echo \"tokenpresente=\${SWA_CLI_DEPLOYMENT_TOKEN:+si}\"; echo x >> $T/chiamate"
bash "$S" --riprova; verifica "7. --riprova: riprova e pubblica" "$(cat "$T/base/stato/ultimo-pubblicato")" "$(git -C "$T/remoto.git" rev-parse refs/heads/main)"
# blocco
nuovo_commit tre; mkdir -p "$T/base/stato/blocco"; sleep 30 & PIDV=$!; echo $PIDV > "$T/base/stato/blocco/pid"
n=$(chiamate); bash "$S"; verifica "8. blocco con processo vivo: non parte" "$(chiamate)" "$n"
kill $PIDV 2>/dev/null; wait $PIDV 2>/dev/null
bash "$S"; verifica "9. blocco senza processo: lo toglie e pubblica" "$(chiamate)" "$((n+1))"
verifica "   il blocco non resta" "$([ -d "$T/base/stato/blocco" ] && echo resta || echo tolto)" tolto
# token mancante
touch "$T/senza-token"; nuovo_commit quattro; n=$(chiamate); bash "$S"; bash "$S"
verifica "10. senza token: non pubblica e non segna fallito" "$(chiamate)|$(cat "$T/base/stato/ultimo-fallito" 2>/dev/null | wc -c | tr -d ' ')" "$n|0"
verifica "    il problema e' scritto una volta sola" "$(grep -c 'token non trovato' "$T/base/log/pubblica.log")" 1
rm -f "$T/senza-token"; bash "$S"; verifica "11. torna il token: pubblica quello in attesa" "$(chiamate)" "$((n+1))"
# repository irraggiungibile
OLD="$REPO_URL"; export REPO_URL="file://$T/non-esiste.git"; bash "$S"; verifica "12. repository irraggiungibile: nessun danno" "$(grep -c 'non raggiungibile' "$T/base/log/pubblica.log")" 1
export REPO_URL="$OLD"
# modalita' versioni
export MODALITA=versioni; n=$(chiamate)
bash "$S"; verifica "13. versioni senza tag: non pubblica" "$(chiamate)" "$n"
git -C "$T/w" tag v0.1.0; git -C "$T/w" push -q origin v0.1.0; bash "$S"; verifica "14. nuovo tag v0.1.0: pubblica" "$(chiamate)" "$((n+1))"
verifica "    cartella di lavoro sul tag" "$(git -C "$T/base/lavoro" describe --tags --exact-match)" v0.1.0
nuovo_commit cinque; bash "$S"; verifica "15. commit su main senza tag: niente" "$(chiamate)" "$((n+1))"
git -C "$T/w" tag v0.10.0; git -C "$T/w" push -q origin v0.10.0; bash "$S"; verifica "16. v0.10.0 vale piu' di v0.1.0 (ordine per versione)" "$(cat "$T/base/stato/ultimo-pubblicato" | cut -d' ' -f1)" v0.10.0
bash "$S" --stato | head -3
echo "--- log:"; cat "$T/base/log/pubblica.log"
echo "RISULTATO: $ok ok, $ko ko"
rm -rf "$T"
