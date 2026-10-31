---
title: Cosmic Horror - CT-TECH-001 Tetto grafico e packaging web
status: DRAFT
version: 0.1.0
owner: Team Cosmic Horror
prepared_by: Copilot
---

# CT-TECH-001 - Tetto grafico e packaging web

> **PROPOSTA DI COPILOT, DA CONFERMARE DA MATTEO**
>
> Questa nota non sceglie il motore, non registra `CT-DES-014` e non modifica i punteggi C1-C5 già proposti.

## 1. Evidenza del concept web disponibile

Matteo ha fornito tre screenshot del concept grafico web. Negli screenshot sono visibili cinque carte affiancate con cornici cromatiche differenziate; una vista dedicata al `Custode dell'Abisso`; testi di carta, indicatori numerici e controlli per rigiocare l'entrata, attivare/disattivare l'effetto lucido e usare il giroscopio.

Matteo riferisce inoltre queste misure e osservazioni:

- PC Windows con NVIDIA RTX 5060: 60 fps costanti a 1280x800 e 956x440;
- costo per frame circa 1-1,5 ms;
- animazione di entrata a cascata, effetto lucido sensibile all'inclinazione e particelle;
- su iPhone reale il giudizio è «molto belle» e le animazioni risultano fluide;
- carta preferita: `Custode dell'Abisso`;
- le scintille inizialmente presenti nel lucido risultavano sgranate sul telefono e sono state eliminate; sono rimasti arcobaleno sull'illustrazione e riflesso mobile;
- nessun confronto equivalente Godot è ancora disponibile per questo concept.

Questi dati sono evidenza del percorso web, non un confronto fra motori.

## 2. Il tetto di qualità visiva va aggiunto a C1-C5?

### Proposta

**Sì, ma come gate separato, non come C6 ponderato dentro il totale C1-C5.**

Motivo: C1-C5 misurano modificabilità, testabilità, verifica visiva, comportamento sulle piattaforme e attrito di build. Nessuno di questi criteri dimostra che il percorso possa raggiungere la direzione artistica richiesta dal prodotto. C3 dimostra che l'output visivo è verificabile automaticamente, non che l'output raggiunga una qualità estetica sufficiente.

Aggiungerei quindi un gate chiamato:

`G1 - Tetto di qualità visiva`

con esito:

- `SUPERATO`;
- `NON SUPERATO`;
- `NON VERIFICATO`.

### Peso

**Nessun peso numerico.**

Il gate deve essere bloccante, non contribuire con una percentuale. Un percorso che ottiene buoni punteggi tecnici ma non riesce a ottenere la qualità visiva minima richiesta non dovrebbe vincere sommando punti altrove. Analogamente, un concept molto bello non dovrebbe compensare testabilità o packaging insufficienti.

Se in futuro Matteo desiderasse un confronto estetico numerico fra due implementazioni equivalenti, quello dovrebbe essere una prova separata e simmetrica, non un voto retroattivo sul concept web già prodotto.

## 3. Evidenze necessarie per dichiarare G1 superato

Per il percorso web, il concept corrente è una buona evidenza preliminare, ma per dichiarare formalmente `G1 SUPERATO` chiederei:

1. **PC reale:** scena con almeno cinque carte simultanee, animazioni ed effetti attivi, mantenendo il target prestazionale dichiarato dalla prova.
2. **Telefono reale:** stessa famiglia visuale funzionante sul dispositivo target, con animazioni fluide e controlli utilizzabili.
3. **Leggibilità:** titolo, tipo, testo essenziale, indicatori e cornice continuano a essere leggibili alle dimensioni operative previste per una partita, non soltanto nella vista ingrandita di una singola carta.
4. **Stabilità:** esecuzione prolungata della scena con entrate/uscite ripetute e attivazione degli effetti, registrando crash, rallentamenti progressivi, artefatti o crescita anomala delle risorse. La durata esatta del test resta da definire nella specifica della prova.
5. **Scalabilità:** prova con un numero di carte contemporanee rappresentativo del campo reale. Il numero resta da definire dopo le Core Rules; cinque carte non dimostrano ancora il carico della partita completa.
6. **Modificabilità:** almeno una seconda variante di carta prodotta usando la stessa pipeline, senza interventi ad hoc sul codice per ogni singola carta.
7. **Asset pipeline:** immagini provenienti da una pipeline ripetibile, con dimensioni/aspect ratio coerenti e senza ritaglio manuale per ogni asset.
8. **Licenza/provenienza:** la pipeline delle immagini impiegata per asset destinati alla produzione deve avere licenza, provenienza e condizioni d'uso documentate.

Per confrontare Web e Godot sul tetto grafico, servirebbe inoltre un concept Godot equivalente: stessi asset, stessa composizione, stessi effetti richiesti e stesso dispositivo di prova. Fino ad allora `G1` può essere valutato per il web, ma non utilizzato come vantaggio comparativo contro Godot.

## 4. Prestazioni del concept corrente

I dati riportati da Matteo, 60 fps costanti e circa 1-1,5 ms per frame sulla RTX 5060 nelle due risoluzioni indicate, sono positivi per il PC di prova ma **non dimostrano** prestazioni su GPU più deboli né stabilità nel tempo.

Prima di usare le prestazioni come evidenza di prodotto chiederei almeno:

- GPU integrata o hardware PC sensibilmente inferiore alla RTX 5060;
- iPhone reale già usato come target mobile;
- numero di carte più vicino alla scena di partita prevista;
- sessione prolungata con effetti ripetuti;
- frame time, memoria e cali di frame registrati con una metodologia ripetibile.

Non definisco qui soglie per hardware minimo: è una decisione di prodotto ancora aperta.

## 5. Licenza del modello di generazione immagini

Il modello ufficiale `Tongyi-MAI/Z-Image-Turbo` riporta licenza **Apache-2.0** sulla model card Hugging Face. Anche la variante `InsecureErasure/Z-Image-Turbo-NVFP4` trovata pubblicamente riporta `Apache-2.0`. La variante specifica usata nella pipeline deve però essere identificata con repository, file/hash e relativa licenza prima di usare gli asset in produzione. citeturn97search248turn97search249

### Come la tratterei

Non basta annotare «Z-Image Turbo». Per ogni pipeline di produzione registrerei:

- nome esatto del modello/checkpoint;
- URL/repository di origine;
- hash o versione del file;
- licenza dichiarata alla data di acquisizione;
- VAE, text encoder, LoRA, ControlNet o altri componenti usati;
- relativo stato di licenza per ciascun componente;
- prompt e workflow ComfyUI versionato;
- data di generazione dell'asset;
- eventuali asset sorgente forniti al modello;
- interventi manuali successivi.

Questo è un registro di provenienza tecnica, non un parere legale. Prima della pubblicazione commerciale andranno riesaminate le condizioni effettive dell'intera pipeline e non soltanto del checkpoint principale.

## 6. Problema dei bordi nelle immagini generate

Il ritaglio manuale di tutte le 12 immagini è accettabile come difetto del concept, ma **non è una pipeline scalabile per centinaia di carte**.

### Come lo tratterei

Prima della produzione massiva richiederei un test di pipeline su un batch più ampio e un criterio automatico di conformità dell'immagine:

- aspect ratio target fisso;
- safe area definita per il soggetto;
- assenza di cornici/bordi generati entro una soglia verificabile;
- risoluzione minima coerente;
- output già pronto per il crop della carta, senza ritaglio creativo manuale per ogni immagine.

Possibili strategie da provare, senza sceglierne ora una:

1. correggere prompt/workflow affinché il modello produca composizioni senza bordo;
2. generare con area di sicurezza più ampia e crop automatico deterministico;
3. usare segmentazione/edge detection per rilevare automaticamente il margine e scartare o correggere l'immagine;
4. rigenerare automaticamente gli output che non superano il controllo.

### Gate proposto per la pipeline immagini

Su un batch rappresentativo, la maggior parte degli asset deve poter essere processata automaticamente; gli interventi manuali devono essere eccezioni registrate. La percentuale esatta di successo va definita in una futura specifica Art/Asset Pipeline e non viene inventata qui.

## 7. Prova di pacchettizzazione del percorso web

L'obiettivo dichiarato è distribuire applicazioni Windows, macOS, Android e iOS. Per il percorso web proporrei quindi un task tecnico separato, successivo a CT-TECH-001, che mantenga invariato il gioco web e confronti soltanto i wrapper necessari.

### Mobile

**Capacitor** è una candidata naturale perché il progetto ufficiale lo definisce runtime nativo cross-platform per applicazioni web e supporta iOS e Android, oltre al web/PWA. citeturn97search247

### Desktop

Per Windows e macOS le due alternative da provare sono:

- **Tauri 2**, che supporta frontend web e dichiara build multipiattaforma per Windows, macOS, Linux, Android e iOS; citeturn97search246
- **Electron**, se servisse un runtime Chromium/Node e un ecosistema plugin più ampio. Nel confronto pubblicato da Capawesome, Electron ha installer indicativamente più grandi (~80-150 MB), mentre la variante Tauri per Capacitor usa system webview con binari indicativamente nell'ordine di ~3-10 MB; questi numeri sono riferimenti del progetto e non misure di Cosmic Horror. citeturn97search245turn97search243

Non sceglierei Tauri o Electron senza la prova, perché il gioco usa effetti grafici e input mobile e interessa più la compatibilità reale di Cosmic Horror che la dimensione teorica del wrapper.

## 8. Misure richieste per la prova di packaging

Per ogni target: Windows, macOS, Android, iOS.

### Build

Registrare:

- build riuscita/fallita;
- ambiente usato;
- comandi/passaggi necessari;
- durata registrata della build;
- dimensione dell'artefatto installabile;
- dipendenze, SDK e privilegi amministrativi necessari;
- errori/workaround.

### Installazione e avvio

Verificare su dispositivo reale dove disponibile:

- installazione;
- primo avvio;
- riavvio dell'app;
- landscape;
- caricamento delle carte;
- animazioni;
- lucido/inclinazione se applicabile;
- input touch/mouse;
- evento cosmico e logica minima;
- assenza di dipendenza dal server di sviluppo.

### Prestazioni

Registrare almeno:

- frame rate e frame time nella scena del concept;
- memoria utilizzata quando misurabile in modo ripetibile;
- comportamento dopo esecuzione prolungata;
- differenze rispetto alla versione browser sullo stesso hardware.

### Integrità funzionale

Lo stesso test deterministico deve produrre:

- stessi stati;
- stesso log;
- stessi dati di carta/territorio;
- nessuna differenza nelle Core Rules dovuta al wrapper.

### Aspetti di piattaforma

Documentare:

- firma richiesta;
- provisioning/certificati richiesti;
- limitazioni del webview;
- API/device feature mancanti;
- eventuale necessità di plugin nativi;
- procedura di aggiornamento prevista, senza implementarla finché non è scelta.

## 9. Quando considero superata la prova di packaging

Per considerare il percorso web **tecnicamente confezionabile** per l'obiettivo multipiattaforma, richiederei:

1. un artefatto installabile e avviabile su **Windows** reale;
2. un artefatto installabile e avviabile su **macOS** reale;
3. un artefatto installabile e avviabile su **Android** reale;
4. un artefatto installabile e avviabile su **iOS** reale;
5. stessa fetta funzionale e stesso stato/log su tutti e quattro;
6. layout utilizzabile in landscape sui target mobili;
7. concept grafico eseguito senza blocker grafici o di input;
8. nessun server di sviluppo necessario in esecuzione;
9. procedura di build documentata e ripetibile;
10. eventuali plugin/workaround elencati chiaramente;
11. nessuna modifica di game design necessaria per far funzionare una piattaforma;
12. prestazioni misurate e considerate sufficienti da Matteo sui dispositivi reali scelti per il test.

Il superamento dimostrerebbe la **fattibilità tecnica del packaging**, non l'idoneità agli store. Pubblicazione App Store/Google Play, notarizzazione, signing definitivo, policy e processo di release richiedono una verifica separata.

## 10. Come influenza CT-DES-014

Questa prova può produrre nuove evidenze per CT-DES-014, ma non decide automaticamente il motore.

In particolare separerei tre domande:

1. il percorso raggiunge il tetto grafico desiderato?
2. il percorso mantiene prestazioni e stabilità sui dispositivi target?
3. il percorso può essere confezionato come vera app sulle quattro piattaforme richieste con attrito accettabile?

Solo dopo queste verifiche Matteo può usare l'evidenza insieme a C1-C5 per decidere.

---

**PROPOSTA DI COPILOT, DA CONFERMARE DA MATTEO. Nessun motore scelto. `CT-DES-014` resta non registrato.**
