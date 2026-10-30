# Resoconto - 4 illustrazioni per il confronto (sessione locale)

**Esplorativo, non una decisione.** Nessuna scelta di motore, nessun CT-DES-014, codice non toccato.

## Cosa e' stato fatto
`git pull` (commit 2185d75 ok). Per le 4 carte senza immagine ho usato il campo `prompt` del manifest con ComfyUI (10.100.0.30:8188, condiviso): `z_image_turbo_nvfp4`, 9 passi, cfg 1, 1200x896, PreviewImage (nulla scritto nelle cartelle del server). Prima di ogni invio coda controllata vuota; una generazione alla volta; nessuna coda altrui toccata; nulla lasciato in coda. 12 generazioni totali, 12 s ciascuna (circa 2,5 min di macchina).

## Tentativi (max 3 per carta)
| Carta | Tentativo 1 (prompt originale) | Tentativo 2 (prefisso anti-bordo) | Tentativo 3 (prefisso diverso, "painting"->"scene") | Scelto |
|---|---|---|---|---|
| 01 Archivista | bordo bianco, angoli arrotondati | tela su fondo bianco con ombra | rettangolo arrotondato su bianco | t.1 (seed 1001), ritagliato |
| 02 Faro | doppio bordo nero+bianco | tela con ombra | rettangolo arrotondato su bianco | t.2 (seed 2002), ritagliato |
| 03 Stelle | bordo nero arrotondato | tela con ombra | rettangolo arrotondato su bianco | t.2 (seed 3002), ritagliato |
| 04 Cultista | bordo nero arrotondato | tela con ombra | rettangolo arrotondato su bianco | t.2 (seed 4002), ritagliato |

Seed = 1000 x numero carta + tentativo.

## Problema principale
Su tutti i 12 tentativi il modello ha disegnato un bordo, un margine o un'ombra attorno al quadro, nonostante "no frame, no border" nel prompt (il tentativo 3 ha usato un prefisso diverso che lo chiedeva in modo piu' esplicito; non ha funzionato). Regola data: scartare quelli con bordi. Nessun tentativo era pulito, quindi **ripiego da te da approvare**: ho ritagliato il bordo (e ombra/angoli) dal tentativo migliore di ciascuna carta con un taglio rettangolare interno. Risultato controllato a vista: niente piu' margini. Costo: le immagini finali sono circa 1000x700 (rapporto ~1,43, non 4:3 esatto, nessuna riscalatura) invece di 1200x896. Il tentativo 3 non e' stato usato; i tentativi scartati sono solo nella cartella temporanea.
Nota: il prefisso del tentativo 2 e' stato aggiunto davanti al prompt; il campo `prompt` del manifest non e' stato modificato (la modifica e' descritta nel campo `nota`).

## File toccati (game/prove/concept-grafico-web/)
- nuovi `public/arte/01-archivista.jpg` (149 KB), `02-faro.jpg` (173 KB), `03-stelle.jpg` (206 KB), `04-cultista.jpg` (172 KB)
- `public/arte/manifest.json`: aggiunto solo il campo `nota` (seed, tentativo, ritaglio) alle 4 carte
- nuovi `report/RESOCONTO_ILLUSTRAZIONI.md`, `report/screenshots-gpu/pc-1280x800-confronto-5-carte.png`
- codice non toccato.

## Verifica
`npm run build` ok (0,6 s). Con la build in anteprima (Chromium, GPU NVIDIA via ANGLE/D3D11): manifest e 4 JPEG rispondono 200, nessun errore di pagina, vista Confronto mostra 5 carte con illustrazione. Le immagini finali sono state guardate (foglio unico).

## Da sapere
- Prima carta: nel manifest e' `"file": "../art.jpg"`, ma `art.jpg` sta nella radice del progetto, non in `public/`: una build pulita non lo copia, e la carta mostrerebbe il segnaposto. Nel mio test funzionava solo per la copia a mano in `dist/` della volta scorsa. Soluzione semplice (non fatta, non richiesta): spostarlo in `public/`.
- Qualita' artistica non giudicata: scelta del migliore fatta su aderenza al prompt e assenza di bordi. Il faro ha un teschio nel cielo e figure nel mare (coerenti col tema, ma da valutare); il cultista ha il volto del tutto in ombra (come da prompt).
- Non verificato: telefono reale, altri browser, finestre diverse da 1280x800; "testo disegnato" nelle immagini controllato a occhio (nessuna scritta leggibile; i glifi del cultista sono simboli inventati).
- Licenza del modello non controllata.

## Tempi di orologio
Dalle 15:41 alle 15:46 circa: 5 minuti totali. Generazioni 2,5 min di macchina; il resto e' lettura delle immagini, ritaglio, build e verifica.
