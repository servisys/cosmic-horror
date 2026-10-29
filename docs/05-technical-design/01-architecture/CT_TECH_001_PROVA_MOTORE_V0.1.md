---
title: CT-TECH-001 - Prova comparativa motore
status: PROPOSTA
version: 0.1.0
owner: Team Cosmic Horror
approval_required_by: Matteo
implementation_authorized: false
---

# CT-TECH-001 - Prova comparativa motore

> **PROPOSTA, DA APPROVARE DA MATTEO**
>
> Questa specifica non autorizza alcuna implementazione finché Matteo non la approva secondo il processo di governance del progetto.

## Documenti autorevoli

Da usare soltanto nelle rispettive versioni registrate/approvate disponibili nel repository al momento dell'esecuzione:

- `docs/00_MASTER_INDEX.md`
- `docs/CT_COPILOT_CLAUDE_PROTOCOL.md`
- decisioni `CT-DES-011`, `CT-DES-012`, `CT-DES-013` quando registrate
- `CT_DECISIONI_V0.4_ESITO_TECNICO.md` come tracciamento delle proposte espresse da Matteo, non come decisione approvata
- `CT_MOTORE_VALUTAZIONE_CLAUDE_V0.1.md` come valutazione tecnica, non decisione
- `CT_MOTORE_VALUTAZIONE_COPILOT_V0.1.md` come valutazione tecnica, non decisione

Se una fonte necessaria non è ancora registrata o approvata, l'esecuzione va considerata bloccata finché Matteo non autorizza esplicitamente la prova.

## Obiettivo

Confrontare su una fetta verticale equivalente due percorsi tecnici:

1. **Godot 4 + GDScript**
2. **TypeScript web**

La prova deve stabilire quale percorso sia più adatto al primo prototipo di Cosmic Horror rispetto ai criteri definiti in questo task. Non deve trasformarsi nello sviluppo del gioco.

Il risultato della prova è un report comparativo. **La scelta finale del motore resta di Matteo.**

## Scope incluso

Realizzare la stessa fetta minima in entrambi i percorsi, con comportamento funzionale equivalente:

- un territorio visibile;
- una carta giocabile;
- uno stato territoriale visibile;
- un evento cosmico automatico;
- una schermata utilizzabile in formato PC;
- la stessa schermata utilizzabile/adattata in formato telefono;
- almeno un test automatico della logica;
- logica delle regole separata dalla grafica/presentazione;
- istruzioni minime per eseguire ciascun prototipo;
- misurazione dei criteri definiti nella sezione «Criteri di confronto»;
- report finale con evidenze, problemi incontrati e punteggi.

La fetta non deve rappresentare le Core Rules definitive. Dove servono valori o comportamenti di prova, devono essere chiaramente etichettati come **fixture tecnica non di design** e non devono entrare nel Decision Log come regole.

## Fuori scope

Non fanno parte di CT-TECH-001:

- scelta o registrazione definitiva del motore;
- implementazione completa delle Core Rules;
- 40 carte per fazione;
- due fazioni complete;
- sistema completo di territori;
- bilanciamento;
- multiplayer online;
- account, login o backend;
- matchmaking;
- economia o monetizzazione;
- persistenza definitiva;
- artwork definitivo;
- audio definitivo;
- pipeline CI/CD definitiva;
- pubblicazione sugli store;
- architettura definitiva del prodotto;
- refactoring del repository non richiesto dalla prova.

## Punti da decidere prima di partire

L'implementazione non deve iniziare finché Matteo non chiude questi punti:

### 1. Ambiente di esecuzione

Scegliere uno dei seguenti contesti:

- **Ambiente cloud di Claude**, se supporta entrambi i percorsi e consente di raccogliere le evidenze richieste;
- **Mac di build**, tenendo conto che per il percorso Godot occorre prima rendere disponibile Godot tramite l'amministratore;
- eventuale combinazione dei due ambienti, purché il confronto resti equivalente e venga documentata.

La scelta dell'ambiente non deve implicitamente determinare il vincitore.

### 2. Avversario automatico

Decidere se la fetta debba includere:

- nessun avversario automatico, usando una sequenza deterministica/test harness sufficiente a provare carta, territorio ed evento cosmico;
- un avversario automatico minimale, privo di finalità di game design o bilanciamento.

L'eventuale comportamento automatico serve esclusivamente alla prova tecnica e non definisce l'AI di gioco futura.

## Vincoli tecnici

### Vincoli comuni

- I due prototipi devono implementare la stessa fetta funzionale.
- La logica di gioco della fetta deve essere separata dalla presentazione grafica.
- I dati usati dalla prova devono essere minimi e chiaramente identificabili come dati di test.
- I test automatici della logica non devono richiedere l'interfaccia grafica per essere eseguiti.
- Gli elementi visuali devono essere funzionali alla verifica, non alla qualità artistica.
- La prova deve essere riproducibile partendo dal repository e dalle istruzioni incluse.
- Non introdurre servizi cloud, database o dipendenze esterne non necessarie alla fetta.
- Non modificare documenti di game design per adattarli alla tecnologia.

### Percorso Godot

- Godot 4.
- GDScript per la prova.
- Evitare plugin non indispensabili.
- Separare la logica testabile dalle scene e dalla presentazione.

### Percorso TypeScript web

- TypeScript.
- Scegliere un solo renderer/framework 2D principale tra le alternative pertinenti alla prova.
- Aggiungere una libreria 3D soltanto se necessaria a dimostrare l'elemento 3D della fetta.
- Evitare framework o servizi non necessari.
- La logica testabile deve restare indipendente dal renderer.

## Limite di tempo

Per rendere il confronto significativo, entrambi i percorsi hanno lo stesso timebox:

- **massimo 4 ore di lavoro effettivo per Godot 4/GDScript**;
- **massimo 4 ore di lavoro effettivo per TypeScript web**.

Il conteggio parte quando iniziano modifiche specifiche del prototipo e termina al raggiungimento del timebox o al completamento dei criteri di accettazione.

Non rientrano nel confronto i tempi amministrativi esterni non controllabili, ad esempio l'attesa necessaria per rendere disponibile Godot sul Mac di build. Tali dipendenze devono comunque essere riportate nel report come attrito operativo.

Se un percorso non completa la fetta entro il timebox, non deve ricevere tempo aggiuntivo per pareggiare artificialmente il risultato. Si documenta ciò che è stato completato e ciò che manca.

## Criteri di confronto misurabili

Ogni criterio riceve un punteggio **da 1 a 5**:

- **1 - Molto scarso:** ostacolo serio alla prosecuzione.
- **2 - Scarso:** diversi problemi o lavoro manuale rilevante.
- **3 - Adeguato:** funziona, con compromessi gestibili.
- **4 - Buono:** pochi problemi e flusso semplice.
- **5 - Ottimo:** risultato lineare, ripetibile e con attrito minimo.

Il report deve fornire per ogni voto almeno un'evidenza verificabile. Il punteggio senza evidenza non è valido.

### C1 - Facilità di modifica per Claude

Misurare:

- numero di interventi correttivi necessari dopo la prima implementazione della fetta;
- presenza di file o asset difficili da modificare/revisionare come testo;
- capacità di apportare una piccola modifica richiesta senza rompere il prototipo;
- eventuali passaggi manuali nell'editor necessari dopo una modifica al codice.

### C2 - Test automatico della logica

Misurare:

- esecuzione del test senza UI;
- esito pass/fail leggibile;
- tempo necessario per eseguire la suite minima;
- semplicità nel modificare una fixture e rilanciare il test.

### C3 - Verifica visiva automatica

Misurare:

- possibilità di produrre automaticamente almeno una cattura verificabile della schermata PC;
- possibilità di produrre almeno una cattura o evidenza equivalente del layout telefono;
- numero di passaggi manuali necessari;
- ripetibilità della verifica dopo una modifica.

### C4 - Comportamento su PC e mobile

Verificare almeno:

- avvio della fetta sul target PC scelto;
- esecuzione su almeno un dispositivo mobile reale oppure, se l'ambiente approvato non lo consente, su un target mobile/emulato esplicitamente dichiarato;
- leggibilità di territorio, carta, stato territoriale ed evento cosmico in entrambi i formati;
- assenza di problemi bloccanti nell'interazione minima prevista.

Il report deve distinguere chiaramente test su dispositivo reale da emulazione/simulazione.

### C5 - Costo di build e distribuzione della prova

Misurare:

- numero di comandi/passaggi necessari per ottenere un artefatto eseguibile o una versione provabile;
- tempo effettivo di build registrato nella prova;
- dimensione dell'artefatto, quando applicabile;
- dipendenze/installazioni richieste;
- passaggi manuali o privilegi amministrativi necessari.

Per questa prova «costo» significa soprattutto **attrito operativo misurato**, non un costo economico inventato. Eventuali costi monetari reali devono essere riportati soltanto se effettivamente sostenuti o documentati.

## Matrice finale

Il report deve presentare:

```text
Criterio                              Godot   TypeScript web
C1 Facilità modifica Claude            1-5        1-5
C2 Test automatici logica               1-5        1-5
C3 Verifica visiva automatica           1-5        1-5
C4 Comportamento PC/mobile              1-5        1-5
C5 Costo/attrito build                  1-5        1-5
```

Non attribuire pesi diversi ai criteri durante la prova. Oltre al totale, il report deve mostrare i cinque punteggi separatamente, perché due soluzioni con lo stesso totale possono avere profili molto diversi.

## Criteri di accettazione

La prova CT-TECH-001 è considerata completata quando:

1. esistono i due prototipi equivalenti o è documentato che uno dei due non è stato completato entro il timebox;
2. entrambi hanno ricevuto lo stesso massimo di 4 ore di lavoro effettivo;
3. la fetta include territorio, carta, stato territoriale, evento cosmico automatico e layout PC/telefono;
4. la logica è separata dalla grafica in entrambi i percorsi;
5. esiste almeno un test automatico della logica per ciascun percorso completato;
6. sono raccolte evidenze per C1-C5;
7. ogni punteggio 1-5 è motivato da evidenza;
8. sono documentati problemi, dipendenze e lavoro manuale;
9. non sono state introdotte decisioni di game design come risultato della scelta tecnologica;
10. è prodotto il report comparativo finale;
11. il report non registra automaticamente CT-DES-014 e indica esplicitamente che la decisione finale spetta a Matteo.

## Test obbligatori

Per entrambi i percorsi:

1. **Test logica carta-territorio:** la fixture tecnica deve dimostrare che una carta può produrre il cambiamento di stato previsto dal test e che l'esito è verificabile senza UI.
2. **Test evento cosmico:** l'evento automatico della fixture deve poter essere attivato/riprodotto in modo controllato dal test e produrre un risultato verificabile.
3. **Test separazione logica/UI:** almeno il test principale deve eseguire senza avviare la presentazione grafica completa.
4. **Test layout PC:** la schermata minima deve essere verificata nel formato PC scelto.
5. **Test layout telefono:** la stessa informazione funzionale deve essere verificata nel formato telefono scelto.
6. **Test di modifica per Claude:** dopo la prima versione funzionante, applicare la stessa piccola modifica non di game design ai due prototipi e documentare numero di tentativi, file toccati e problemi.
7. **Build/run ripetibile:** ripetere una seconda volta la procedura documentata di build/esecuzione per verificare che non dipenda da passaggi non registrati.

## Come si decide alla fine

1. Claude produce il report comparativo con evidenze e punteggi C1-C5.
2. Il report evidenzia anche eventuali criteri non misurabili e ne spiega il motivo.
3. Il totale dei punteggi è un supporto alla decisione, **non determina automaticamente il vincitore**.
4. Eventuali blocker devono essere evidenziati separatamente dal punteggio.
5. Godot e TypeScript possono essere dichiarati entrambi tecnicamente idonei, uno solo idoneo oppure entrambi insufficienti.
6. **La scelta finale del motore resta esclusivamente di Matteo.**
7. Solo dopo la scelta di Matteo potrà essere preparato l'aggiornamento di `CT-DES-014` per il normale processo di registrazione.

## Output richiesto

Claude deve produrre:

1. un **pre-flight plan** prima di qualunque implementazione, che confermi ambiente scelto, presenza/assenza dell'avversario automatico, struttura delle due prove e metodo di misurazione;
2. le due implementazioni della fetta verticale in percorsi chiaramente separati;
3. istruzioni minime di esecuzione e test per ciascun percorso;
4. log dei tempi di lavoro effettivi per ciascun percorso;
5. risultati dei test obbligatori;
6. evidenze per C1-C5;
7. matrice comparativa con punteggi 1-5;
8. elenco dei file creati/modificati;
9. problemi, dipendenze, passaggi manuali e blocker;
10. un **Implementation Report** finale;
11. una sezione finale denominata `Decisione richiesta a Matteo`, senza scegliere o registrare il motore al posto suo.

## Gate di approvazione

**Stato attuale: PROPOSTA, DA APPROVARE DA MATTEO.**

Prima dell'approvazione non è autorizzato:

- creare i due prototipi;
- installare Godot sul Mac di build;
- aggiungere dipendenze TypeScript;
- modificare il codice del gioco;
- modificare CT-DES-014;
- utilizzare questa specifica come autorizzazione implicita all'implementazione.

Dopo l'approvazione restano comunque da chiudere i due punti «Ambiente di esecuzione» e «Avversario automatico» prima del pre-flight operativo.
