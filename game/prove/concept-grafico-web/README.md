# Concept grafico - carta (percorso web)

> **Stato al 31 ottobre 2026.** Concept esplorativo, conservato come storia del percorso web (CT-DES-014, registrata). Non è una decisione di design. Rispetto al testo sotto: scintille e giroscopio sono stati tolti. Le illustrazioni in `public/` sono di prova, generate con il modello z_image_turbo: la licenza del modello va confermata sulla pagina ufficiale prima di qualsiasi uso nel gioco.

**CONCEPT ESPLORATIVO, NON DI DESIGN E NON UNA DECISIONE.** Non sceglie il motore e non registra CT-DES-014. Nome della carta, testi e valori sono segnaposto. Nasce dalla richiesta di Matteo di misurare il *tetto grafico* del percorso web (TypeScript, Vite, three.js); l'identificativo formale della prova va assegnato da Matteo e Copilot.

## Cosa mostra
Una carta resa con cornice metallica, finestra illustrazione, barra del nome, riga del tipo, riquadro del testo su pergamena, piastra forza/resistenza e gemma; effetto lucido (arcobaleno e scintille) che reagisce all'inclinazione, riflesso mobile, animazione di entrata, particelle, nebbia di fondo e ombra. Trascinando si inclina la carta; sul telefono c'e' anche il giroscopio (dopo il permesso del sistema).

## Illustrazione vera (ComfyUI)
L'illustrazione e' un segnaposto disegnato dal codice. Per usarne una vera: salva l'immagine come `art.jpg` accanto alla pagina (formato consigliato 4:3, circa 1200x900, JPEG sotto 1 MB), oppure apri la pagina con `?art=indirizzo-dell-immagine`. La pagina la ritaglia nella finestra della carta.

## Comandi
```
npm install
npm run build
npx vite preview --port 4174     # in un altro terminale: node scripts/screenshots.mjs
```
Screenshot automatici (3 formati, 3 momenti) in `report/screenshots/`.

## Limiti dichiarati
- Verifica automatica con rendering software (nessuna GPU); l'aspetto sul telefono reale dipende dalla prova di Matteo.
- L'illustrazione segnaposto non rappresenta il tetto reale: quello dipende dalle immagini di ComfyUI.
- Non e' stato fatto nessun confronto con Godot su questo concept (Matteo ha scelto di provare prima il web).
- Pacchettizzazione in app Windows/Mac/Android/iOS non provata.
- Tempo di realizzazione (orologio dell'agente, dalla prima riga alla pagina pubblicata): circa 4 min.
