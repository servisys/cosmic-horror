---
title: Cosmic Horror - CT-TECH-001 Revisione evidenze
status: DRAFT
version: 0.1.0
owner: Team Cosmic Horror
prepared_by: Copilot
source_report: ../../../game/prove/ct-tech-001/report/REPORT_COMPARATIVO.md
---

# CT-TECH-001 - Revisione evidenze

> **PROPOSTA DI COPILOT, DA CONFERMARE DA MATTEO**
>
> Questa revisione non sceglie il motore, non registra `CT-DES-014` e non approva alcuna decisione tecnica. I punteggi sotto sono proposte basate esclusivamente sulle evidenze riportate nel report comparativo; diventano concordati solo dopo conferma di Matteo.

## 1. Valutazione generale dell'equità del confronto

Le due implementazioni coprono la stessa fetta funzionale e riportano test equivalenti su logica, evento cosmico, separazione logica/UI, layout, modifica comparativa e ripetibilità della build/run. Il report dichiara inoltre esplicitamente che l'esecuzione è avvenuta prima sul percorso web e poi su Godot, senza sorteggio, con possibile vantaggio di ordine per il secondo percorso. La fixture e la struttura della logica erano già state pensate prima dell'implementazione web. Questi fattori non invalidano la prova, ma vanno considerati quando si interpretano soprattutto C1. 

Il report dichiara anche che il tempo registrato è tempo di orologio di un agente software e non è confrontabile con ore umane. Per questo non uso la velocità complessiva di sviluppo come criterio autonomo né la trasformo in un punteggio implicito.

Il test su telefono reale non è stato ancora eseguito: per entrambi i percorsi è indicato «in attesa di Matteo». Di conseguenza C4 rimane non assegnato per entrambi.

---

## 2. C1 - Facilità di modifica per Claude

### Sufficienza e confrontabilità delle prove

**Valutazione: sufficienti per una proposta di punteggio, con una cautela sull'ordine di esecuzione.**

Le evidenze sono quantitative e confrontabili: entrambi hanno richiesto un tentativo per la prima versione funzionante; la modifica comparativa è passata al primo tentativo senza errori o regressioni in entrambi; sono stati toccati tre file per ciascun percorso, oltre alla fixture/copia della fixture; non sono stati necessari passaggi manuali nell'editor e non sono presenti file non revisionabili come testo. Il web ha avuto un intervento correttivo tecnico e un errore di build dovuti ai tipi Node; Godot due correzioni visive, nessun errore di progetto e un passaggio manuale per sincronizzare la fixture. 

**Limite:** Godot è stato implementato dopo il web e quindi può avere beneficiato dell'esperienza maturata sulla stessa fixture. Per contro, le due correzioni Godot riportate sono visive e non derivano necessariamente dalla sola familiarità con la logica. Il report non consente di neutralizzare quantitativamente questo effetto d'ordine.

### Punteggio proposto

- **Web: 4/5 - Buono.** Prima versione e modifica comparativa entrambe al primo tentativo; zero regressioni e zero passaggi manuali. Un errore tecnico di configurazione (`@types/node`) ha richiesto correzione.
- **Godot: 4/5 - Buono.** Prima versione e modifica comparativa al primo tentativo, zero errori/regressioni della modifica e nessun editor manuale. Due correzioni visive e una sincronizzazione manuale della fixture impediscono di considerarlo privo di attrito.

**Da confermare da Matteo:** sì. L'ordine web → Godot resta una cautela interpretativa, non una penalizzazione numerica automatica.

---

## 3. C2 - Test automatico della logica

### Sufficienza e confrontabilità delle prove

**Valutazione: sufficienti, verificabili e comparabili.**

Entrambi eseguono test senza UI, presentano un esito pass/fail leggibile e separano esplicitamente i test dalla grafica. Il report misura anche i tempi dei comandi: web 0,9 s complessivi con 5 test; Godot 0,17-0,27 s con 8 asserzioni. In entrambi i casi il rilancio richiede un comando, ma in Godot è necessaria anche la copia manuale della fixture.

Il numero di test/assert non va trasformato direttamente in qualità superiore perché non è dimostrato che testino una superficie funzionale maggiore; la fetta dichiarata è equivalente.

### Punteggio proposto

- **Web: 5/5 - Ottimo.** Test headless, pass/fail leggibile, un comando per fixture e rilancio, nessun passaggio aggiuntivo documentato.
- **Godot: 4/5 - Buono.** Test headless e molto rapido, pass/fail leggibile e nessun plugin; il passaggio manuale per copiare la fixture introduce un attrito ripetibile che il web non ha.

---

## 4. C3 - Verifica visiva automatica

### Sufficienza e confrontabilità delle prove

**Valutazione: sufficienti per una proposta di punteggio, ma non perfettamente simmetriche.**

Entrambi producono automaticamente screenshot PC e telefono e dichiarano la cattura ripetibile con un comando. Il web verifica clic reali con lettura dello stato. Godot produce screenshot automatici dall'app nativa Linux tramite schermo virtuale e dall'export web; i clic reali risultano verificati soltanto nell'export web, senza lettura dello stato, mentre l'app nativa usa una modalità `--demo` che chiama i pulsanti. Per Godot sono state inoltre stimate manualmente le coordinate dei clic nell'export web.

Quindi la capacità di **cattura** è dimostrata per entrambi; l'automazione dell'interazione e della verifica dello stato è più completa sul web. Non si applica la regola «C3 non misurabile nell'ambiente scelto», perché in questa prova la cattura automatica Godot è risultata disponibile.

### Punteggio proposto

- **Web: 5/5 - Ottimo.** Screenshot automatici PC/telefono, clic reali, lettura dello stato e ripetibilità in un comando.
- **Godot: 4/5 - Buono.** Screenshot automatici PC/telefono e ripetibilità sono dimostrati; l'interazione nativa è verificata tramite modalità demo anziché clic esterni con lettura dello stato, e nell'export web le coordinate sono state stimate manualmente.

---

## 5. C4 - Comportamento su PC e mobile

### Sufficienza e confrontabilità delle prove

**Valutazione: non ancora sufficienti per assegnare il punteggio previsto dalla specifica.**

Sul formato PC entrambi risultano avviati e leggibili. Sul formato telefono sono state eseguite emulazioni/risoluzioni mobili: web in Chromium mobile emulato; Godot come app nativa a risoluzione telefono e come export web in emulazione. Il report dichiara territorio, carta, stato ed evento leggibili in entrambi e nessun blocker.

Manca però il test su dispositivo reale richiesto dal piano. Il report indica esplicitamente un iPhone 16 Pro Max/iOS 27 «in attesa di Matteo» per entrambi i link. Inoltre l'app mobile nativa non è stata provata: per il web è dichiarata non applicabile alla prova corrente; per Godot non è misurabile nell'ambiente cloud perché manca Android SDK e iOS richiede il Mac.

### Punteggio proposto

- **Web: non assegnato - in attesa della prova sul telefono reale di Matteo.**
- **Godot: non assegnato - in attesa della prova sul telefono reale di Matteo.**

### Evidenza necessaria

Per entrambi i link/prototipi, Matteo deve verificare almeno:

- apertura/esecuzione sul telefono reale concordato;
- leggibilità di territorio, carta, stato territoriale ed evento cosmico;
- possibilità di utilizzare l'interazione minima prevista;
- eventuali problemi evidenti di layout, caricamento o input;
- screenshot/evidenza richiesta dal report.

L'eventuale app nativa iOS/Android resta una misura separata e non va inventata a posteriori come requisito se la prova approvata si limita ai link web su telefono reale.

---

## 6. C5 - Costo/attrito di build e distribuzione

### Sufficienza e confrontabilità delle prove

**Valutazione: sufficienti per una proposta di punteggio, con una riserva sulla pubblicazione Godot sull'host privato.**

Il report fornisce numeri concreti: web richiede 3 comandi, artefatto da 1,03 MB, nessun privilegio/passaggio manuale per la build; Godot circa 7 passaggi, template da 1,28 GB, artefatto web da 39,9 MB (10,4 MB con wasm compresso) e una procedura aggiuntiva per adattarsi al limite di 15 MB per file degli Artifact. Per la pubblicazione telefono, il web richiede un passaggio manuale; Godot tre passaggi manuali e uno shim. Il funzionamento Godot sull'host resta da confermare sul telefono.

I tempi di build sono registrati, ma non uso da soli i pochi secondi di differenza per determinare il voto: l'attrito maggiore documentato riguarda numero di passaggi, dimensioni, download/template e adattamento all'hosting.

### Punteggio proposto

- **Web: 5/5 - Ottimo.** Procedura corta, artefatto piccolo, nessun limite di hosting riportato e un solo adattamento manuale per la pagina privata.
- **Godot: 2/5 - Scarso per questa specifica prova/distribuzione.** La build funziona, ma richiede più passaggi, download/template molto più grandi, artefatto web sensibilmente maggiore e adattamenti specifici all'host privato; il funzionamento finale sull'host deve ancora essere confermato sul telefono.

**Nota:** questo voto misura l'attrito osservato in CT-TECH-001 e nell'ambiente/hosting scelti. Non dimostra che Godot abbia in generale un costo di distribuzione 2/5 in altri ambienti.

---

## 7. Matrice proposta

| Criterio | Web | Godot | Stato review |
|---|---:|---:|---|
| C1 - Facilità modifica Claude | 4/5 | 4/5 | Proposto, con cautela sull'ordine |
| C2 - Test logica | 5/5 | 4/5 | Proposto |
| C3 - Verifica visiva automatica | 5/5 | 4/5 | Proposto |
| C4 - PC/mobile | non assegnato | non assegnato | **In attesa della prova sul telefono reale di Matteo** |
| C5 - Costo/attrito build | 5/5 | 2/5 | Proposto, specifico all'ambiente della prova |

Non calcolo un totale finché C4 non è stato revisionato. Anche dopo C4, il totale resta uno strumento di supporto e non costituisce scelta automatica del motore.

## 8. Evidenze mancanti o confronti sbilanciati

1. **Ordine non randomizzato:** web prima, Godot dopo; possibile vantaggio di esperienza per Godot.
2. **Fixture/logica definite prima del web:** il primo percorso ha sostenuto il costo iniziale della concretizzazione della fixture; il report segnala esplicitamente questo rischio di equità.
3. **Telefono reale mancante:** C4 non può essere completato finché Matteo non prova entrambi sul dispositivo reale.
4. **Mobile nativo non confrontato:** il web non è stato incapsulato come app; Godot non è stato esportato come app mobile nell'ambiente scelto. Non uso questo elemento per assegnare C4 prima della prova prevista.
5. **Tempi di orologio dell'agente:** il report afferma che non sono confrontabili con ore umane; non vengono usati come proxy di produttività.
6. **Interazione C3 non perfettamente simmetrica:** web verifica clic e stato; Godot nativo usa `--demo`, mentre i clic sono verificati sull'export web senza lettura dello stato.
7. **Pubblicazione privata Godot non ancora confermata sul telefono:** incide sulla certezza del dato di distribuzione, pur essendo documentato l'attrito tecnico incontrato.
8. **Nessuna misura su telefoni deboli:** il report lo dichiara; quindi questa revisione non deduce prestazioni mobile generali.

## 9. Cosa deve confermare Matteo

- Confermare o modificare i punteggi proposti C1, C2, C3 e C5.
- Eseguire la prova reale C4 sui due percorsi e riportare le evidenze.
- Solo dopo, concordare o lasciare non assegnati i due punteggi C4.

**Nessuna scelta del motore è contenuta in questo documento. `CT-DES-014` resta non registrato.**
