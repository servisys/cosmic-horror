# CT-TECH-001 - Prova comparativa del motore (fetta verticale)

**FIXTURE TECNICA NON DI DESIGN.** Questa cartella contiene due prototipi equivalenti per confrontare Godot 4/GDScript e TypeScript web. Non e' il gioco, non definisce regole e non sceglie il motore (la scelta e' di Matteo). Specifica: `docs/05-technical-design/01-architecture/CT_TECH_001_PROVA_MOTORE_V0.2.md`.

## Contenuto
- `fixture/fixture.json` - dati di prova condivisi (un territorio, due carte, un evento cosmico, sequenza di prova).
- `web/` - TypeScript + Vite + PixiJS (2D) + three.js (un solo oggetto 3D).
- `godot/` - Godot 4.7.2, GDScript, nessun plugin. `godot/data/fixture.json` e' una **copia** della fixture condivisa (da risincronizzare a mano: `cp fixture/fixture.json godot/data/`).
- `report/` - log di sessione, report comparativo, screenshot.

## Web (Node 22)
```bash
cd web
npm ci
npm test            # test della logica, senza interfaccia
npm run build       # produce dist/
npx vite preview --port 4173 &   # in un altro terminale: npm run screenshots
```

## Godot (binario Godot 4.7.2 stabile, Linux x86_64)
```bash
export GODOT_BIN=/percorso/Godot_v4.7.2-stable_linux.x86_64
cd godot
$GODOT_BIN --headless --path . -s tests/run_tests.gd                 # test della logica, senza interfaccia
$GODOT_BIN --headless --path . --import                              # prima volta
# export web (servono i template di export 4.7.2 installati)
mkdir -p build/web && $GODOT_BIN --headless --path . --export-release "Web" build/web/index.html
./tools/package_web_gz.sh                                            # variante con wasm compresso
# cattura automatica con schermo virtuale e rendering software
xvfb-run -a -s "-screen 0 440x956x24" $GODOT_BIN --audio-driver Dummy --rendering-driver opengl3 --path . --resolution 440x956 -- --demo=/percorso/prefisso
```

## Avvertenze
- Il binario di Godot e i template non sono nel repository.
- Il checksum del binario non e' stato verificato: il file `SHA512-SUMS` ufficiale non era raggiungibile (403).
