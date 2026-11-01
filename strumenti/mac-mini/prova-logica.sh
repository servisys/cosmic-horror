#!/bin/bash
# Prova della logica di controlla-e-pubblica.sh con un repository locale, un clone finto, un elenco di processi finto e una pubblicazione finta
# (nessuna rete, nessun token vero, nessun Folk Lore vero).
# Uso: ./prova-logica.sh      (serve che il repository abbia un commit su main; si puo' lanciare anche su Windows con Git Bash)
set -u
QUI="$(cd "$(dirname "$0")" && pwd)"
S="$QUI/controlla-e-pubblica.sh"
RADICE="$(cd "$QUI/../.." && pwd)"
T=$(mktemp -d "${TMPDIR:-/tmp}/macprova.XXXX")
git clone -q --bare "$RADICE" "$T/remoto.git" 2>/dev/null
git clone -q "$T/remoto.git" "$T/w" && git -C "$T/w" config user.email t@t && git -C "$T/w" config user.name t
# il clone «del Mac»: un clone normale con origin = il repository finto
mkdir -p "$T/progetti"
git clone -q "$T/remoto.git" "$T/progetti/cosmic-horror"
CL="$T/progetti/cosmic-horror"
BASE="$CL/.pubblicazione"
printf '%s\n' "TOKEN-DI-PROVA-123" > "$CL/.swa-token-prova"; chmod 600 "$CL/.swa-token-prova"
permessi() { stat -c %a "$1" 2>/dev/null || stat -f %Lp "$1" 2>/dev/null; }
# dove chmod non vale (per esempio un disco di Windows) il controllo dei permessi si salta e la prova 17 non si fa
PERMESSI_OK=1; [ "$(permessi "$CL/.swa-token-prova")" = 600 ] || { PERMESSI_OK=""; export CT_SALTA_PERMESSI=1; }
: > "$T/ps.txt"
export CT_CLONE="$CL" CT_NPM_CI="echo ci-ok" CT_PS="cat $T/ps.txt"
export LUCCHETTO_FOLK_LORE="$T/mandi/.coda/batteria.lock" CARTELLA_PROGETTI="$T/progetti"
mkdir -p "$T/mandi/.coda"
# la pubblicazione finta stampa anche il token letto dal file (il job deve coprirlo nel log) e conta le chiamate
export CT_PUBBLICA="echo \"token=\$(cat ../../.swa-token-prova)\"; echo \"ambiente=prova\"; echo x >> $T/chiamate"
ok=0; ko=0
verifica() { if [ "$2" = "$3" ]; then ok=$((ok+1)); echo "OK  $1"; else ko=$((ko+1)); echo "KO  $1 (atteso: $3, trovato: $2)"; fi; }
chiamate() { wc -l < "$T/chiamate" 2>/dev/null | tr -d ' ' || echo 0; }
[ -f "$T/chiamate" ] || : > "$T/chiamate"
nuovo_commit() { echo "$1" >> "$T/w/prova.txt"; git -C "$T/w" add -A; git -C "$T/w" commit -q -m "$1"; git -C "$T/w" push -q origin HEAD:main; }
testa_remota() { git -C "$T/remoto.git" rev-parse refs/heads/main; }

bash "$S"; verifica "1. primo giro: pubblica" "$(chiamate)" 1
verifica "   ultimo pubblicato = commit di main" "$(cat "$BASE/stato/ultimo-pubblicato")" "$(testa_remota)"
bash "$S"; verifica "2. giro senza novita': niente" "$(chiamate)" 1
nuovo_commit uno; bash "$S"; verifica "3. commit nuovo: pubblica" "$(chiamate)" 2
verifica "   il clone e' sul commit giusto" "$(git -C "$CL" rev-parse HEAD)" "$(testa_remota)"
verifica "   e sul branch main (git pull funzionera')" "$(git -C "$CL" symbolic-ref --short HEAD)" main
verifica "4. il token non e' nel log" "$(grep -rc 'TOKEN-DI-PROVA-123' "$BASE/log" "$BASE/stato" | grep -v ':0' | wc -l | tr -d ' ')" 0
verifica "   ma la pubblicazione l'ha avuto (era nell'output, coperto)" "$(grep -c 'token=\*\*\*' "$BASE/log/ultima-build.log")" 1
verifica "   il file del token non e' stato toccato dal checkout" "$(cat "$CL/.swa-token-prova")" "TOKEN-DI-PROVA-123"
# solo prova: il comando di pubblicazione di default dice prova
verifica "5. il comando predefinito pubblica solo in prova" "$(grep -c '^CMD_PUBBLICA=.*pubblica -- prova}' "$S")" 1
verifica "   e il comando di pubblicazione non nomina la produzione" "$(grep '^CMD_PUBBLICA=' "$S" | grep -c produzione)" 0
# fallimento
export CT_PUBBLICA="echo rotto; exit 3"
nuovo_commit due; bash "$S"; verifica "6. build fallita: segnata come fallita" "$(cat "$BASE/stato/ultimo-fallito")" "$(testa_remota)"
verifica "   il log dice FALLITO" "$(grep -c 'FALLITO' "$BASE/log/pubblica.log")" 1
bash "$S"; bash "$S"; verifica "7. non riprova lo stesso commit (una sola riga INIZIO per il commit)" "$(grep -c 'INIZIO' "$BASE/log/pubblica.log")" 3
export CT_PUBBLICA="echo x >> $T/chiamate"
bash "$S" --riprova; verifica "8. --riprova: riprova e pubblica" "$(cat "$BASE/stato/ultimo-pubblicato")" "$(testa_remota)"
# blocco proprio
nuovo_commit tre; mkdir -p "$BASE/stato/blocco"; sleep 30 & PIDV=$!; echo $PIDV > "$BASE/stato/blocco/pid"
n=$(chiamate); bash "$S"; verifica "9. blocco proprio con processo vivo: non parte" "$(chiamate)" "$n"
kill $PIDV 2>/dev/null; wait $PIDV 2>/dev/null
bash "$S"; verifica "10. blocco senza processo: lo toglie e pubblica" "$(chiamate)" "$((n+1))"
verifica "    il blocco non resta" "$([ -d "$BASE/stato/blocco" ] && echo resta || echo tolto)" tolto
# una build alla volta: lucchetto di Folk Lore
nuovo_commit quattro; n=$(chiamate)
sleep 30 & PIDF=$!; echo "{\"pid\":$PIDF,\"filtro\":\"tutto\",\"quando\":\"2026-11-01T19:40:00.000Z\"}" > "$T/mandi/.coda/batteria.lock"
bash "$S"; bash "$S"
verifica "11. lucchetto di Folk Lore con pid vivo: salta il giro" "$(chiamate)" "$n"
verifica "    senza segnare fallimento" "$(cat "$BASE/stato/ultimo-fallito" 2>/dev/null | wc -c | tr -d ' ')" 0
verifica "    l'attesa e' scritta una volta sola" "$(grep -c 'IN ATTESA: batteria di test di Folk Lore' "$BASE/log/pubblica.log")" 1
kill $PIDF 2>/dev/null; wait $PIDF 2>/dev/null
bash "$S"; verifica "12. lucchetto con pid morto: pubblica" "$(chiamate)" "$((n+1))"
echo '{"pid":999999,"filtro":"tutto","quando":"2026-11-01T19:40:00.000Z"}' > "$T/mandi/.coda/batteria.lock"
nuovo_commit cinque; n=$(chiamate); bash "$S"; verifica "13. lucchetto JSON di un pid che non esiste piu': pubblica" "$(chiamate)" "$((n+1))"
# le cifre della data non sono il pid: pid morto con data e filtro pieni di cifre non deve bloccare
echo '{"pid":999999,"filtro":"123","quando":"2099-12-31T23:59:59.000Z"}' > "$T/mandi/.coda/batteria.lock"
nuovo_commit cinque-b; n=$(chiamate); bash "$S"; verifica "13b. pid morto, data e filtro con molte cifre: pubblica" "$(chiamate)" "$((n+1))"
# ripiego: numero nudo con processo vivo
sleep 30 & PIDN=$!; echo "$PIDN" > "$T/mandi/.coda/batteria.lock"
nuovo_commit cinque-c; n=$(chiamate); bash "$S"; verifica "13c. lucchetto con numero nudo e processo vivo: salta il giro" "$(chiamate)" "$n"
kill $PIDN 2>/dev/null; wait $PIDN 2>/dev/null
# illeggibile e recente: prudenza, salta il giro
echo 'contenuto-non-leggibile' > "$T/mandi/.coda/batteria.lock"
bash "$S"; verifica "13d. lucchetto illeggibile e recente: salta il giro" "$(chiamate)" "$n"
rm -f "$T/mandi/.coda/batteria.lock"
bash "$S"; verifica "13e. lucchetto tolto: pubblica quello in attesa" "$(chiamate)" "$((n+1))"
# una build alla volta: altri processi pesanti sotto progetti/
nuovo_commit sei; n=$(chiamate)
echo "node $T/progetti/mandi/node_modules/.bin/vitest run" > "$T/ps.txt"
bash "$S"; verifica "14. build di Folk Lore in corso (processo sotto progetti/): salta il giro" "$(chiamate)" "$n"
echo "node $CL/game/prototipo/node_modules/.bin/vite build" > "$T/ps.txt"
bash "$S"; verifica "15. un processo di Cosmic Horror stesso non blocca" "$(chiamate)" "$((n+1))"
: > "$T/ps.txt"
# token mancante / permessi
rm -f "$CL/.swa-token-prova"; nuovo_commit sette; n=$(chiamate); bash "$S"; bash "$S"
verifica "16. senza token: non pubblica e non segna fallito" "$(chiamate)|$(cat "$BASE/stato/ultimo-fallito" 2>/dev/null | wc -c | tr -d ' ')" "$n|0"
verifica "    il problema e' scritto una volta sola" "$(grep -c 'manca il token del sito di prova' "$BASE/log/pubblica.log")" 1
printf '%s\n' "TOKEN-DI-PROVA-123" > "$CL/.swa-token-prova"; chmod 644 "$CL/.swa-token-prova"
if [ -n "$PERMESSI_OK" ]; then
  bash "$S"; verifica "17. token con permessi 644: non pubblica, chiede chmod 600" "$(chiamate)|$(grep -c 'chmod 600' "$BASE/log/pubblica.log")" "$n|1"
else
  echo "--  17. (permessi non verificabili su questo sistema: saltata)"
fi
chmod 600 "$CL/.swa-token-prova"; bash "$S"; verifica "18. token a posto: pubblica quello in attesa" "$(chiamate)" "$((n+1))"
# repository irraggiungibile
git -C "$CL" remote set-url origin "file://$T/non-esiste.git"
nuovo_commit otto; bash "$S"; verifica "19. repository irraggiungibile: nessun danno" "$(grep -c 'non raggiungibile' "$BASE/log/pubblica.log")" 1
git -C "$CL" remote set-url origin "$T/remoto.git"
n=$(chiamate); bash "$S"; verifica "20. torna raggiungibile: pubblica" "$(chiamate)" "$((n+1))"
bash "$S" --stato | head -4
echo "--- log:"; cat "$BASE/log/pubblica.log"
echo "RISULTATO: $ok ok, $ko ko"
rm -rf "$T"
