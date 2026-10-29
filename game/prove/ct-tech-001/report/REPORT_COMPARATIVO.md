# CT-TECH-001 - Report comparativo e Implementation Report

Stato: **DRAFT, evidenze raccolte. I punteggi 1-5 NON sono assegnati**: secondo la specifica (v0.2) li concordano Copilot e Matteo dopo aver rivisto le evidenze. **La scelta del motore resta di Matteo. CT-DES-014 non e' registrato da questo report.**

Fixture tecnica non di design. Ambiente: cloud di Claude (Linux, 4 CPU, 15 GB RAM, nessuna GPU). Godot 4.7.2 stabile; Node 22.22; PixiJS 8.22; three 0.170; Vite 6.4; Vitest 2.1; TypeScript 5.9.
Ordine di esecuzione: fixture condivisa, poi web, poi Godot (non sorteggiato: possibile vantaggio di ordine per il secondo percorso).

## 1. Fetta realizzata (identica nei due percorsi)
Un territorio con due stati (il secondo aggiunto dalla modifica comparativa), una carta della persona, un avversario minimo a script (non e' IA di gioco), un evento cosmico automatico al round 3, un elemento 3D minimo che ruota nella scheda del territorio, schermata PC e telefono, test della logica separata dalla grafica. Dati: `fixture/fixture.json`.

## 2. Test obbligatori
| # | Test | Web | Godot |
|---|---|---|---|
| 1 | Carta-territorio, senza UI | passa (Vitest, 5 test) | passa (8 asserzioni, headless) |
| 2 | Evento cosmico controllato | passa | passa |
| 3 | Separazione logica/UI | i test importano solo `src/logic/game.ts` | i test caricano solo `logic/game_logic.gd` |
| 4 | Layout PC (1280x800) | verificato con screenshot automatico e clic reali | verificato con screenshot automatico (app nativa Linux su schermo virtuale) e nell'export web |
| 5 | Layout telefono (390x844 e 440x956) | emulazione Chromium mobile, DPR 3 | app nativa a quelle risoluzioni e export web in emulazione |
| 6 | Modifica per Claude (secondo stato) | applicata al primo tentativo | applicata al primo tentativo |
| 7 | Build/run ripetibile | rifatta da pulito, esito uguale | rifatta da pulito, esito uguale |

## 3. Evidenze per criterio (valori misurati, senza punteggio)
### C1 - Facilita' di modifica per Claude
| Misura | Web | Godot |
|---|---|---|
| Tentativi per la prima versione funzionante | 1 | 1 |
| Interventi correttivi dopo la prima implementazione | 1 (mancava `@types/node`, errore `tsc` TS2307 in 2 messaggi) | 2 (dimensione dell'oggetto 3D troppo piccola; contrasto dei pulsanti insufficiente: entrambi visivi) |
| Errori di build, test o runtime del progetto | 1 causa (la stessa di sopra) | 0; 1 avviso dell'ambiente (ALSA, nessuna scheda audio) risolto con `--audio-driver Dummy` |
| File toccati dalla modifica comparativa | 3 (+ la fixture condivisa) | 3 (+ la copia della fixture in `godot/data`) |
| Tentativi / errori / regressioni della modifica comparativa | 1 / 0 / 0 | 1 / 0 / 0 |
| Passaggi manuali nell'editor | 0 (nessun editor) | 0 (editor mai usato; interfaccia costruita da codice) |
| File non leggibili/revisionabili come testo nel repository | 0 | 0 (presenti i file `.uid` generati da Godot, testuali) |
| Passaggi manuali non legati all'editor | 0 | 1 (sincronizzare a mano la copia di `fixture.json`) |
Errori operativi dell'agente fuori dal progetto: 2 (comando `pkill -f` che ha chiuso la shell; uso di `/usr/bin/time` inesistente). Nessun effetto sul codice.
Riferimenti: commit `6c836ef` (prima versione web), commit finale del branch.

### C2 - Test automatico della logica
| Misura | Web | Godot |
|---|---|---|
| Esecuzione senza UI | si | si |
| Esito pass/fail leggibile | si (5 passati) | si (8 OK, riga riassuntiva, codice di uscita 0/1) |
| Tempo suite (comando completo) | 0,9 s (test 6 ms) | 0,17-0,27 s |
| Per cambiare la fixture e rilanciare | 1 comando | 1 comando, piu' la copia manuale della fixture |
| Strumenti | Vitest | script GDScript lanciato da riga di comando, nessun plugin |

### C3 - Verifica visiva automatica
| Misura | Web | Godot |
|---|---|---|
| Cattura automatica PC | si | si, con schermo virtuale e rendering software (nessuna GPU) |
| Cattura automatica telefono | si (390x844, 440x956) | si (stesse risoluzioni) |
| Passi manuali | 0 | 0 per la cattura; le coordinate dei clic nell'export web sono state stimate a mano da uno screenshot |
| Clic reali verificati | si, con lettura dello stato | solo nell'export web (verifica visiva, nessuna lettura dello stato); nell'app nativa la modalita' demo chiama i pulsanti |
| Ripetibilita' | si, 1 comando (~30 s) | si, 1 comando per risoluzione (~7 s) |
| Nota | - | la modalita' `--demo` e' codice di verifica dentro l'app |
Screenshot: `report/screenshots/`.

### C4 - Comportamento su PC e mobile
| Misura | Web | Godot |
|---|---|---|
| Avvio PC | si (Chromium) | si (nativo Linux su schermo virtuale; export web in Chromium) |
| Telefono emulato | si (dichiarato: emulazione, non dispositivo) | si (nativo a risoluzione telefono; export web in emulazione) |
| Telefono reale (iPhone 16 Pro Max, iOS 27) | **in attesa di Matteo** (link privato) | **in attesa di Matteo** (link privato alla versione web) |
| App nativa Android/iOS | non applicabile (e' una pagina web; incapsulamento con Capacitor non provato) | **non misurabile nell'ambiente scelto** (niente Android SDK, iOS richiede il Mac) |
| Leggibilita' di territorio, carta, stato, evento in entrambi i formati | si | si |
| Problemi bloccanti | nessuno | nessuno |

### C5 - Costo/attrito di build e distribuzione
| Misura | Web | Godot |
|---|---|---|
| Comandi per partire da zero a un artefatto provabile | 3 (`npm ci`, `npm run build`, `npm test`) | circa 7 (scarica binario, scarica template, installa template web, import, export, test, variante gzip) |
| Tempo di build registrato | 3,4 s + 5,5 s + 0,9 s | 4,1 s (import) + 4,2 s (export) + 0,2 s (test); download 5 s + 80 s |
| Dimensione dell'artefatto | 1,03 MB (10 file) | 39,9 MB (wasm 39,5 MB); 10,4 MB con wasm compresso (gzip) |
| Dipendenze/installazioni | Node 22; pacchetti npm (205 MB di node_modules) | binario 146 MB; template 1,28 GB (si usano 10 MB); nessun plugin |
| Passaggi manuali o privilegi amministrativi | nessuno | nessuno privilegio; **checksum non verificabile** (SHA512-SUMS 403); GitHub releases 403; indice tuxfamily vuoto; funziona solo `downloads.godotengine.org` |
| Limite di hosting incontrato | nessuno | il wasm (39,5 MB) supera il limite per file degli Artifact (15 MB): serve la variante gzip con un piccolo shim in `index.html` (passaggio in piu') |

## 4. Problemi, dipendenze e lavoro manuale
- Godot: fonte di download non ovvia (3 tentativi), template da 1,28 GB, copia manuale della fixture, shim per hosting, nessuna GPU (rendering software).
- Web: nessun problema rilevante oltre ai tipi Node; la dimensione del bundle principale (~757 kB) e' da ottimizzare in un prodotto vero (non rilevante per la prova).
- Nessun blocker.
- Il tempo registrato e' di orologio di un agente software e non e' confrontabile con ore umane.

## 5. File creati
Vedi `README.md`: `fixture/`, `web/` (config, `src/logic`, `src/ui`, `tests`, `scripts`), `godot/` (progetto, `logic`, `ui`, `scenes`, `tests`, `tools`, `data`, export preset), `report/`.

## 6. Rischi per l'equita' del confronto (per la revisione)
1. Ordine: web prima, Godot dopo.
2. Fixture e struttura della logica pensate prima del web.
3. Il C4 su dispositivo reale dipende dai link privati e dal tuo telefono.
4. Nessuna misura di prestazioni su telefoni deboli.

## 7. Decisione richiesta a Matteo
1. Fornire il test su telefono reale per i due link e riportare le evidenze (screenshot e se i quattro elementi sono leggibili e si usano).
2. Insieme a Copilot, rivedere le evidenze di C1-C5 e assegnare i punteggi (o lasciarli non assegnati).
3. Scegliere il motore di riferimento per il prototipo (oppure chiedere un'altra prova). La scelta non e' fatta da questo report e non registra CT-DES-014.
