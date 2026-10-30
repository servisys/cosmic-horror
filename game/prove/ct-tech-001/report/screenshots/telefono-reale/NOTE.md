# Test su telefono reale (iPhone 16 Pro Max, iOS 27) - evidenza di Matteo

Due screenshot inviati da Matteo, schermo orizzontale, stato iniziale (Round 1). I clic sui pulsanti non sono ancora documentati.

| File | Percorso | Osservazione di Matteo | Osservazione di Claude |
|---|---|---|---|
| web-iphone16promax-orizzontale-iniziale.png | TypeScript web | "troppo grande" (parere su uno dei due, vedi sotto) | Si apre e gira; territorio, stato, secondo stato, round, bottoni e solido 3D leggibili. Elementi molto grandi rispetto allo schermo. |
| godot-iphone16promax-orizzontale-iniziale.png | Godot (versione browser) | "troppo piccolo" (parere su uno dei due, vedi sopra) | Si apre e gira sull'host privato (lo shim funziona). Testi e solido 3D molto piccoli, grandi aree vuote, bande nere ai lati. |

Nota: la prova automatica copriva PC e telefono in verticale (390x844, 440x956), non il telefono in orizzontale. Nessuno dei due layout e' stato adattato a questa orientazione.

## Seconda serie: dopo la sequenza (carta C1, fine turno, fine turno)

Screenshot finali di Matteo, stesso iPhone, orizzontale. Nota: in questa serie il primo screenshot inviato e' Godot e il secondo web (ordine invertito rispetto alla prima serie; riconosciuti dall'aspetto).

| File | Percorso | Esito |
|---|---|---|
| web-iphone16promax-orizzontale-finale.png | TypeScript web | Sequenza completata: Round 3, stato "stato-evento", secondo stato "stato2-evento", evento cosmico E1 visibile, log completo, "Nessuna carta in mano". Tutti gli elementi leggibili. |
| godot-iphone16promax-orizzontale-finale.png | Godot (versione browser) | Stessa sequenza e stessi valori e stesso log. Elementi leggibili ma piccoli; solido 3D minuscolo. |

Interazione: i tap sui bottoni funzionano in entrambi (stato e log identici ai valori attesi della fixture). Non e' stato riferito alcun tap mancato; non e' una misura sistematica.
Scala: invariata rispetto alla prima serie (web molto grande, Godot piccolo): nessuno dei due layout e' stato adattato all'orientamento orizzontale.

## Terza serie: dopo la correzione di sola scala (da provare sul telefono)
Correzione richiesta da Matteo e suggerita dalla revisione di Copilot (PR #24/#25). Verifica automatica in orizzontale a 956x440 (le misure CSS di un iPhone 16 Pro Max in orizzontale), come emulazione, **non** sul dispositivo reale: aspettiamo gli screenshot di Matteo.
- Web: 0 min 31 s, file toccati 2 (UI e script di cattura), 1 tentativo.
- Godot: 0 min 48 s, file toccato 1 (`project.godot`), 1 tentativo; causa = base verticale con scalatura "expand".
- Screenshot: `report/screenshots/web-telefono-orizzontale-956x440-*.png`, `godot-telefono-orizzontale-956x440-*.png`.

## Quarta serie: telefono reale dopo la correzione di scala
Screenshot finali di Matteo (stesso iPhone, orizzontale, dopo la sequenza carta, fine turno, fine turno). Giudizio di Matteo: "meglio". Il primo screenshot inviato e' Godot, il secondo web (riconosciuti dall'aspetto).

| File | Percorso | Esito |
|---|---|---|
| web-iphone16promax-orizzontale-corretto-finale.png | TypeScript web | Round 3, stato "stato-evento", secondo stato, evento E1, log completo. Testi e solido 3D in proporzione allo schermo; la scheda e i bottoni sono comodi. Il titolo "Territorio T1" e' ora piccolo rispetto allo stato. |
| godot-iphone16promax-orizzontale-corretto-finale.png | Godot (versione browser) | Stessi valori e stesso log. Testi leggibili e di taglia simile al web. Il solido 3D e' ancora una sfera piccola e pixelata (non e' un problema di scala). La pagina mostra bande nere sopra e ai lati. |

Interazione: i tap funzionano in entrambi; stato e log coincidono con i valori attesi.
Scala: ora comparabile tra i due percorsi (testi di taglia simile, tutti gli elementi leggibili). Correzione: 1 tentativo, 0 errori, per entrambi (vedi i log di sessione).
