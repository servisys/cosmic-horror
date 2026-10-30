# Resoconto - concept grafico con GPU reale (sessione locale)

**Esplorativo, non una decisione.** Non sceglie il motore, non registra CT-DES-014, nessun lavoro su Godot.

## Ambiente
Windows 11, NVIDIA GeForce RTX 5060 (8 GB, driver 595.71), Node v24.18.0, npm 11.16.0, Chromium 1234 via playwright-core 1.64.1, rendering ANGLE/D3D11 (verificato: il renderer WebGL riporta "ANGLE (NVIDIA ... RTX 5060 ... Direct3D11)"). Il PC era in uso normale (Teams, Edge, ecc. aperti).

## Build
`npm install` 2,6 s (23 pacchetti; npm segnala 1 vulnerabilita' "high" nelle dipendenze di sviluppo, non analizzata). `npm run build` 1,4 s, bundle 476 kB (122 kB compresso). La pagina gira senza errori in console.

## Frame al secondo (misurati, 3 prove da 10 s per formato)
| Formato | A) con vsync normale | B) GPU forzata a completare ogni frame, senza limite |
|---|---|---|
| 1280x800 | 60 fps costanti (p95 17 ms, max 18 ms) | circa 620-1230 fps (0,8-1,5 ms/frame) |
| 956x440  | 60 fps costanti (p95 17 ms, max 27 ms) | circa 660-1360 fps (0,7-1,4 ms/frame) |

Lettura: la carta regge 60 fps pieni con ampio margine; il costo per frame e' ~1-1,5 ms. Il modo B e' un test di margine, non un fps "reale" di gioco: varia molto tra prove (PC condiviso con altre app, frequenze GPU) quindi va letto come ordine di grandezza (centinaia di fps), non come cifra precisa.
Prima misura scartata: un primo tentativo dava 6000-11000 fps perche' contava solo i cicli JavaScript, non il lavoro GPU; un secondo dava 8 fps perche' lasciavo aperte le pagine delle prove precedenti. Entrambi errori del mio script, corretti.

## Illustrazione (ComfyUI su 10.100.0.30:8188, server condiviso)
Modello scelto da Matteo: `z_image_turbo_nvfp4` (+ encoder `qwen_3_4b_fp8_mixed`, VAE `ae`), 9 passi, cfg 1, 1200x896. Workflow minimo costruito da me solo con nodi gia' presenti; uscita con PreviewImage (nulla scritto nelle cartelle di output del server). Coda controllata vuota prima di ogni invio; 2 generazioni, una alla volta, 18 s e 12 s; nulla lasciato in coda; nessuna configurazione, modello o nodo toccato.
- 1a prova scartata: il modello aveva disegnato una cornice dorata con bordo nero (si sarebbe vista doppia nella carta).
- 2a prova (prompt "a tutto campo, senza cornice", seed 777): usata. `art.jpg` 1200x896, 180 KB.
Nota: 1200x896 e' 4:3 quasi esatto (multipli di 16 richiesti dal modello), non 1200x900.

## File toccati (tutti in game/prove/concept-grafico-web/)
- nuovo `art.jpg`
- nuovi `report/RESOCONTO_GPU.md`, `report/screenshots-gpu/pc-1280x800-art-vera.png`, `report/screenshots-gpu/telefono-956x440-art-vera.png`
- nessun file di codice modificato. `node_modules/` e `dist/` non tracciati. Gli script di misura sono rimasti fuori dal repository (cartella temporanea).
Per la build `art.jpg` va copiato in `dist/` (l'ho fatto a mano per il test): se si vuole che finisca nel build in automatico, basta metterlo in `public/` (modifica non fatta).

## Tempi di orologio
Dall'inizio (14:35) a fine misure, generazione e screenshot: circa 25 minuti, di cui circa 5 min di tempo macchina (install+build 4 s, misure FPS ~6 min complessivi con le prove scartate, generazioni 30 s) e il resto di messa a punto/attesa della risposta di Matteo.

## Non verificato
- Prestazioni su telefono reale, su GPU integrate/deboli, o con Chrome non headless (finestra reale, compositing del desktop).
- fps con vsync a 120/144 Hz; il test A e' limitato a 60 Hz.
- Stabilita' nel tempo (prove da 10 s, non da minuti); consumo energetico e temperatura.
- Qualita' dell'illustrazione come scelta artistica (e' un test tecnico, un solo seed buono su 2); diritti/licenza del modello z_image_turbo non controllati.
- Vulnerabilita' segnalata da npm audit non analizzata.
- Nessun confronto con Godot; nessuna pacchettizzazione.
