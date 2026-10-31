---
title: Cosmic Horror - Vision & Design Pillars
status: DRAFT
version: 0.11.0
owner: Team Cosmic Horror
prepared_by: Cowork
last_reviewed: 2026-10-31
supersedes: CT_VISION_AND_PILLARS.md (version 0.1.0, «Cosmic Territory»)
implementation_target: Planning only - non implementabile da Claude in questa versione
project_prefix: CT_
related_documents:
  - ../../00_MASTER_INDEX.md
  - ../../CT_COWORK_CODE_PROTOCOL_V0.1.md
  - CT_VISION_AND_PILLARS_REVIEW_V0.1.md
  - CT_VISION_DECISIONI_V0.2_SCHEDE.md
  - ../03-decisions-changelog/CT_DECISIONI_V0.2_ESITO.md
  - ../03-decisions-changelog/CT_DECISIONI_V0.2_ESITO_PARTE2.md
  - CT_VISION_COERENZA_V0.3.md
  - ../03-decisions-changelog/CT_DECISIONI_V0.3_ESITO_CHIARO.md
  - ../03-decisions-changelog/CT_DECISIONI_V0.3_CHIARIMENTO_VITTORIA.md
  - ../03-decisions-changelog/CT_DECISION_LOG_REGOLE_V0.2.md
  - ../03-decisions-changelog/CT_DECISION_LOG_VOCI_COMPLETE_V0.4.md
  - ../03-decisions-changelog/CT_DECISION_LOG_VOCI_PROPOSTE_V0.8.md
  - ../03-decisions-changelog/CT_DECISION_LOG_CT_DES_015_016_V0.1.md
  - ../03-decisions-changelog/CT_DECISION_LOG_CT_DES_014_REGISTRATA_V0.13.md
---

# Cosmic Horror - Vision & Design Pillars

> **Stato delle decisioni (31 ottobre 2026).** Tutte le decisioni `CT-DES-001` - `CT-DES-016` sono **REGISTRATE** nel Decision Log: `CT-DES-014` dal 30 ottobre, le altre su conferma o scelta di Matteo del 31 ottobre. Le parti indicate come **DA DECIDERE** restano aperte e non autorizzano implementazione.

## 1. Funzione del documento

Questo documento definisce la visione di prodotto e i pilastri di design di **Cosmic Horror**, nome attuale del progetto precedentemente denominato Cosmic Territory. Il prefisso documentale `CT_` resta invariato per mantenere continuità e tracciabilità.

Non è una specifica tecnica e non autorizza Claude a implementare funzionalità. Il suo scopo è stabilire una direzione condivisa entro cui verranno successivamente scritti i documenti di game design, lore, UX, architettura e sviluppo.

Claude può usare questo documento per:

- comprendere l'intento del progetto;
- verificare la coerenza delle specifiche successive;
- segnalare contraddizioni tra una proposta implementativa e la visione approvata;
- evitare soluzioni formalmente corrette ma incoerenti con l'identità del gioco.

Claude non deve usare questo documento per:

- inventare regole mancanti;
- scegliere autonomamente il modello economico;
- definire il canone narrativo;
- ampliare lo scope;
- trasformare indicazioni di atmosfera in requisiti tecnici non approvati.

Le regole di governance da leggere insieme alle fonti autorevoli indicate nel task sono definite nel Master Index e nel protocollo di lavoro Cowork e Claude Code (`CT_COWORK_CODE_PROTOCOL_V0.1.md`).

---

## 2. Stato della visione

La presente versione è una **bozza di planning**. Tutte le formulazioni sono soggette a revisione.

- `PROPOSTA` indica una direzione consigliata ma non ancora approvata.
- `DA DECIDERE` indica una scelta riservata al Team Cosmic Horror.
- Le proposte emerse sono visibili direttamente nelle sezioni interessate e associate agli ID `CT-DES-###` usati nel Decision Log.
- Il Decision Log conserva motivazione e storico. Sintassi, campi e processo di registrazione sono definiti in `CT_DECISION_LOG_REGOLE_V0.2.md`: una voce è registrata solo quando ha `Stato: REGISTRATA` e il documento viene fuso in `main`.
- Fino alla registrazione, nessuna proposta deve essere interpretata come decisione approvata o requisito implementabile.

> **DECISIONE DI MATTEO (CT-DES-007, REGISTRATA):** mostrare le decisioni direttamente nei documenti, assegnare ID univoci e mantenere il Decision Log anche quando una decisione cambia.

---

## 3. High concept

> **PROPOSTA**
>
> Cosmic Horror è un gioco strategico di carte e controllo territoriale ambientato in un cosmo oscuro e instabile, dove fazioni incompatibili competono per conquistare, corrompere o trasformare territori cosmici. Ogni partita rappresenta uno scontro per il dominio della realtà, nel quale il potere ottenuto espone progressivamente i contendenti a forze che non possono controllare completamente.

Il gioco è costruito intorno a tre idee centrali, ancora da precisare nelle decisioni di Vision:

1. **Costruzione strategica del mazzo.**
   - **DECISIONE DI MATTEO (CT-DES-001, REGISTRATA):** il giocatore prepara un mazzo quasi completo; durante la partita possono coesistere più fonti di adattamento; una parte importante del mazzo può trasformarsi. Fonti concrete, quantità, limiti e tempi delle modifiche restano **DA DECIDERE**.
2. **Controllo del territorio.**
   - **DECISIONE DI MATTEO (CT-DES-002, REGISTRATA):** ogni vittoria richiede interazione significativa con i territori; gli obiettivi possono dipendere dalla fazione senza un modello comune; prima del completamento deve esserci un segnale riconoscibile che consenta all’avversario di intervenire; se l’obiettivo viene comunque completato, la vittoria è immediata senza ulteriori risposte. La definizione di interazione significativa e le condizioni concrete restano **DA DECIDERE**.
3. **Potere a rischio crescente.**
   - **DECISIONE DI MATTEO (CT-DES-003, REGISTRATA):** le conseguenze si manifestano soprattutto sul territorio; esposizione, costi e instabilità sono componenti di un unico rischio cosmico; sia le azioni dei giocatori sia la forza cosmica contribuiscono al rischio; il primo prototipo deve mostrare tutte e tre le componenti. Veicoli, misure, persistenza e reversibilità restano **DA DECIDERE**.

La componente cosmic horror deve sostenere il design, non essere soltanto una decorazione applicata a un gioco di carte generico.

I verbi "conquistare, corrompere o trasformare" sono attualmente descrittivi. Il loro eventuale uso come archetipi di fazione è **DA DECIDERE**.

---

## 4. Promessa al giocatore

Cosmic Horror mira a offrire al giocatore la sensazione di:

- comandare una forza con identità riconoscibile;
- contendersi una mappa viva, non una plancia passiva;
- costruire combinazioni potenti senza sentirsi completamente al sicuro;
- prendere decisioni difficili tra vantaggio immediato e conseguenze future;
- scoprire gradualmente un universo vasto, ostile e non pienamente comprensibile;
- vincere grazie a pianificazione, adattamento e lettura dello stato di gioco, non soltanto grazie alla disponibilità di contenuti più rari.

L'esperienza desiderata è **strategica, tesa e leggibile**. L'orrore deve emergere dalla pressione delle decisioni, dall'alterazione progressiva del campo e dalle conseguenze dell'uso del potere, non da confusione deliberata dell'interfaccia o da regole incomprensibili.

### Principio informativo

> **DECISIONE DI MATTEO (CT-DES-005, REGISTRATA):** il rischio cosmico è visibile solo quando aumenta o sta per succedere qualcosa; il giocatore conosce il tipo generale di problema che potrebbe arrivare; normalmente può prepararsi, ma alcuni eventi possono arrivare senza preavviso. Il giocatore conosce le regole ma deve dedurre cosa prepara l’avversario e, dopo un esito sfavorevole, deve poter pensare che avrebbe potuto prepararsi meglio.

Categorie di rischio, segnali, informazioni pubbliche o nascoste e casi ammessi senza preavviso restano **DA DECIDERE**.

Vincolo editoriale già valido: l'incomprensibilità narrativa del cosmo non deve essere confusa con l'opacità delle regole. Gli effetti necessari a compiere una scelta devono essere comunicati in modo coerente con il principio informativo che sarà approvato.

> **DECISIONE DI MATTEO (CT-DES-005, REGISTRATA):** obiettivo e avanzamento verso la vittoria sono sempre visibili; l’avversario vede chiaramente che il giocatore è vicino alla vittoria e può intervenire prima; se l’obiettivo viene comunque completato, la vittoria è immediata e non esiste un’ulteriore possibilità di risposta. Forma e soglia del segnale precedente al completamento restano **DA DECIDERE**.

---

## 5. Identità del progetto

### 5.1 Cosa deve essere

> **PROPOSTA**

Cosmic Horror deve essere:

- un gioco di strategia a carte con forte componente territoriale;
- progettato digital-first (`CT-DES-013`, REGISTRATA);
- caratterizzato da partite in cui il campo evolve visibilmente;
- basato su fazioni con identità strategiche riconoscibili;
- capace di integrare lore e meccaniche;
- accessibile nelle azioni di base, ma profondo nelle interazioni;
- progettato in modo da non precludere nuovi contenuti, senza assumere fin d'ora un modello live o a espansioni.

Il percorso tecnologico è **web**: `CT-DES-014` è registrata e abbandona Godot. Non sono approvate librerie, wrapper di packaging o architettura definitiva. Le piattaforme iniziali (`CT-DES-012`) e il formato del primo prototipo (`CT-DES-011`) sono registrati nel Decision Log; il comportamento dell'avversario controllato dal gioco è **DA DECIDERE**.

### 5.2 Cosa non deve essere

Cosmic Horror non deve diventare:

- una copia di giochi esistenti con un tema differente;
- un gioco nel quale il controllo territoriale è soltanto un contatore secondario;
- un prodotto che usa l'immaginario lovecraftiano come semplice raccolta di nomi famosi;
- un sistema pay-to-win;
- un gioco nel quale l'esito è deciso prevalentemente dalla pesca iniziale o da casualità che sostituisce il peso delle decisioni; la forza cosmica può agire in modo autonomo e imprevedibile, ma i suoi eventi devono produrre soprattutto pressione e cambiamenti graduali, con rischio visibile nei termini di CT-DES-005, impatto legato all’esposizione e possibilità di preparazione normalmente disponibile nei termini di CT-DES-010;
- un progetto con molte modalità prima che il nucleo principale sia validato;
- un compendio enciclopedico del mito di Cthulhu;
- un gioco volutamente oscuro nelle informazioni necessarie a prendere decisioni.

L'analisi competitiva e la formulazione di una unique selling proposition verificabile devono essere prodotte in un documento separato. Non sono sostituite da questo elenco.

---

## 6. Pilastri di design

Lo stato formale dei pilastri e il marcatore per le decisioni approvate sono **DA DECIDERE**. In questa bozza i pilastri sono criteri di planning, non requisiti implementabili.

### Pilastro 1 - Il territorio è il centro della partita

Il campo di gioco deve rappresentare territori contesi dotati di identità, stato e valore strategico.

Il controllo del territorio deve:

- influenzare le opzioni disponibili;
- creare obiettivi locali e conflitti leggibili;
- cambiare nel corso della partita;
- interagire con carte, fazioni e condizioni di vittoria;
- obbligare il giocatore a distribuire risorse e attenzione.

> **DECISIONE DI MATTEO (CT-DES-002, REGISTRATA):** le fazioni possono avere obiettivi territoriali differenti e vincere senza controllare più territorio.

Il legame territoriale minimo comune, l’eventuale condizione universale e le formule di vittoria restano **DA DECIDERE**.

**Verifica del pilastro:** se una versione del gioco potrebbe funzionare quasi allo stesso modo eliminando i territori, quella versione non è coerente con la Vision.

> **DECISIONE DI MATTEO (CT-DES-002, REGISTRATA):** non è richiesto uno stato base comune comprensibile allo stesso modo da tutte le fazioni; ogni fazione può interpretare e modificare il territorio secondo stati propri; più stati possono coesistere sullo stesso territorio. Gli stati indispensabili restano **DA DECIDERE**.

### Pilastro 2 - Il potere ha conseguenze

Le giocate più incisive non devono essere automaticamente la scelta migliore in ogni situazione.

> **DECISIONE DI MATTEO (CT-DES-003, REGISTRATA):** le conseguenze del potere si manifestano soprattutto sul territorio; il giocatore conosce il rischio e le possibili conseguenze ma non necessariamente l’esito preciso; mantenere il dominio rende progressivamente più vulnerabili.

Alterazioni concrete, possibili esiti, persistenza, reversibilità e relazione tra dominio e vulnerabilità restano **DA DECIDERE**.

Qualunque soluzione futura deve rispettare questi vincoli:

- la conseguenza deve essere collegabile alla scelta che l'ha provocata;
- il giocatore deve poter valutare il rischio secondo il principio informativo approvato;
- il costo non deve ridursi a un contatore privo di relazione con territorio, mazzo o stato della partita;
- l'uso ripetuto del potere deve modificare le decisioni successive.

**Verifica del pilastro:** una carta o azione molto potente deve generare una decisione reale, non soltanto un vantaggio automatico.

### Pilastro 3 - Le fazioni cambiano il modo di giocare

Ogni fazione deve avere:

- una motivazione narrativa;
- una relazione specifica con il territorio;
- un rapporto distinto con rischio, potere e conseguenze;
- punti di forza e limiti riconoscibili;
- almeno un comportamento strategico non integralmente replicabile dalle altre fazioni.

> **DECISIONE DI MATTEO (CT-DES-008, REGISTRATA):** forte asimmetria già nella prima versione giocabile; cambiare fazione può avvicinarsi a imparare un gioco diverso dentro lo stesso gioco; le fazioni possono rapportarsi al territorio in modi sostanzialmente differenti. La struttura del turno e la gestione di carte/mazzo restano comuni; una fazione può avere meccaniche che le altre non hanno; imparare progressivamente come funzionano le altre fazioni può essere parte della difficoltà. Il primo prototipo prevede almeno due fazioni volutamente molto diverse; l’eventuale terza fazione si decide dopo i primi playtest.

Dettagli delle meccaniche esclusive e limiti di complessità restano **DA DECIDERE**. L'identità non deve dipendere soltanto da colori, statistiche o parole chiave cosmetiche.

**Verifica del pilastro:** osservando una sequenza significativa di decisioni, un giocatore esperto dovrebbe poter riconoscere la logica della fazione anche senza vederne il nome.

### Pilastro 4 - L'orrore cosmico emerge dai sistemi

Questo pilastro descrive la lente tematica, distinta dal principio decisionale del Pilastro 2.

La direzione cosmic horror deve manifestarsi attraverso una combinazione coerente di:

- conoscenza che può offrire vantaggi ed esposizione;
- realtà e territori alterabili;
- poteri superiori alle capacità di controllo dei contendenti;
- conseguenze persistenti o difficili da annullare;
- conflitto tra ambizione razionale e forze incomprensibili;
- scala cosmica percepibile senza perdere la leggibilità del gioco.

> **DECISIONE DI MATTEO (CT-DES-010, REGISTRATA):** la forza cosmica agisce da sola in modo imprevedibile. Un singolo evento cosmico produce soprattutto pressione e cambiamenti graduali; l’impatto può dipendere dall’esposizione dei giocatori; nel prototipo gli eventi possono influenzare sia i territori sia i giocatori/mazzi. La sua imprevedibilità non deve sostituire il peso delle decisioni: il rischio è comunicabile secondo CT-DES-005 e normalmente consente preparazione, pur ammettendo alcuni eventi senza preavviso.

Numero di categorie, intensità, bersagli, frequenza e limiti di impatto restano **DA DECIDERE**.

**Verifica del pilastro:** una meccanica centrale che funzionerebbe in modo identico e con lo stesso significato in un'ambientazione generica deve essere giustificata o rivista. Le sole sostituzioni di nomi e illustrazioni non devono bastare a conservare l'intera identità del sistema.

### Pilastro 5 - Profondità attraverso interazioni leggibili

Le regole di base devono essere comprensibili, mentre la profondità deve nascere da:

- posizione e stato dei territori;
- tempismo;
- gestione delle risorse;
- sinergie tra carte;
- previsione del piano avversario;
- compromessi tra obiettivi locali e strategia complessiva.

La complessità non deve derivare da eccezioni arbitrarie o testi inutilmente lunghi.

**Verifica del pilastro:** un giocatore deve poter comprendere perché ha perso, individuare almeno una decisione migliorabile e stimare durante la partita quali fattori stanno generando il vantaggio.

### Pilastro 6 - Evoluzione controllata del prodotto

**DA DECIDERE:** se questo principio debba restare un pilastro della Vision o diventare un principio di produzione.

Nel frattempo vale soltanto il seguente vincolo non tecnico: l'architettura del design non deve precludere nuovi contenuti né rendere automaticamente obsolete le strategie apprese. Versionamento dei dati, compatibilità, deprecazione e pipeline appartengono al Technical Design e non sono definiti qui.

**Verifica provvisoria:** un nuovo contenuto non dovrebbe invalidare per definizione le strategie precedenti.

---

## 7. Core loop ad alto livello

> **PROPOSTA - da formalizzare in `CT_CORE_RULES.md` soltanto dopo le decisioni bloccanti.**

Il ciclo principale ipotizzato è:

1. il giocatore valuta territori, risorse, minacce e intenzioni plausibili dell'avversario;
2. sviluppa la propria presenza attraverso le azioni consentite dal sistema;
3. contende, conquista, corrompe o trasforma territori secondo regole ancora da definire;
4. usa il controllo ottenuto per aprire nuove possibilità strategiche;
5. decide quanto potere rischiare per modificare l'equilibrio della partita;
6. gestisce le conseguenze delle proprie scelte;
7. avanza verso una condizione di vittoria coerente con la centralità del territorio.

### Decisioni di Vision necessarie prima delle Core Rules

- tipo di deckbuilding;
- relazione territorio-vittoria;
- modello portante potere-conseguenze;
- numero di giocatori e modalità primaria;
- principio informativo;
- principio di contrappeso allo snowball;
- livello iniziale di asimmetria;
- fascia qualitativa di durata;
- presenza o assenza di una forza cosmica autonoma.

### Aspetti da progettare nelle Core Rules dopo tali decisioni

- struttura esatta del turno;
- numero e disposizione dei territori;
- risorse utilizzate;
- formula delle condizioni di vittoria;
- dimensione del mazzo e limiti delle copie;
- quantità operative di casualità entro il principio approvato;
- eventuali unità persistenti;
- eventuali reazioni durante il turno avversario;
- formule e soglie del sistema potere-conseguenze.

### Principio anti-snowball

> **DECISIONE DI MATTEO (CT-DES-006, REGISTRATA):** combinazione di esposizione, costi e instabilità, senza bonus artificiali per chi è indietro; il vantaggio deve restare consolidabile gestendo il rischio.

Gerarchia fra le tre leve, misurazione e limiti restano **DA DECIDERE**.

---

## 8. Direzione narrativa

### 8.1 Principio generale

L'universo deve essere originale e coerente, pur potendo ispirarsi ai temi dell'orrore cosmico e utilizzare esclusivamente elementi per i quali sia stata verificata la possibilità d'uso.

Il materiale presente in `reference/` è una fonte di studio. Non è una specifica, non definisce automaticamente il canone del gioco e non autorizza la riproduzione di traduzioni, apparati editoriali o rappresentazioni sviluppate da terzi.

### 8.2 Tono

> **PROPOSTA**

Il tono deve essere:

- cosmico;
- inquietante;
- solenne senza diventare pomposo;
- oscuro senza essere illeggibile;
- tragico, con spazio per ambizione e scoperta;
- privo di ironia invasiva che annulli la tensione.

### 8.3 Uso dell'immaginario lovecraftiano

Il planning distingue tre categorie:

1. **Elementi originali di Cosmic Horror** - preferibili per identità e libertà creativa.
2. **Elementi lovecraftiani verificati come utilizzabili** - da registrare con provenienza e regole d'uso.
3. **Elementi esclusi o dubbi** - da non inserire in specifiche destinate all'implementazione.

Responsabile, criteri e formato del registro di provenienza sono **DA DECIDERE**. Non si presume alcuna conclusione legale dal materiale di consultazione.

Devono essere evitati:

- testi copiati da traduzioni o edizioni;
- descrizioni derivate troppo fedelmente da una specifica edizione;
- marchi o rappresentazioni riconducibili a prodotti successivi di terzi;
- uso indiscriminato di nomi senza funzione narrativa o meccanica.

La terminologia dei sistemi centrali deve essere originale o verificata nel Glossary; termini provvisori non costituiscono nomenclatura approvata.

---

## 9. Direzione artistica preliminare

> **PROPOSTA - da sviluppare in Art Direction**

La componente visiva dovrebbe combinare:

- immensità cosmica;
- geometrie impossibili o instabili;
- territori chiaramente distinguibili;
- architetture e fenomeni più antichi delle fazioni;
- forte contrasto tra leggibilità funzionale e inquietudine atmosferica;
- identità cromatiche riconoscibili, senza ridurre le fazioni a un solo colore.

La grafica delle carte e dell'interfaccia deve mantenere prioritaria la leggibilità di:

- costo;
- tipo;
- appartenenza;
- stato;
- bersagli validi;
- conseguenze prevedibili;
- interazioni con il territorio.

L'effetto visivo non deve nascondere informazioni necessarie alle decisioni. Il carico informativo massimo del campo sarà definito in UX/UI e verificato nei playtest.

---

## 10. Pubblico e posizionamento

### Target primario - DA DECIDERE

Ipotesi da validare:

- giocatori interessati a card game strategici;
- giocatori attratti dal controllo territoriale;
- pubblico sensibile a lore, cosmic horror e costruzione del mondo;
- utenti disponibili ad apprendere un sistema profondo, purché presentato con chiarezza.

### Posizionamento proposto

Cosmic Horror intende differenziarsi attraverso la combinazione strutturale tra:

- deckbuilding;
- territorio conteso;
- fazioni asimmetriche;
- potere con conseguenze;
- cosmic horror espresso dalle meccaniche.

Questa combinazione è un'ipotesi di posizionamento, non una unique selling proposition ancora verificata. Il posizionamento definitivo richiede un'analisi competitiva separata e documentata.

---

## 11. Piattaforme e modello di distribuzione

### Piattaforme

- **Registrato (`CT-DES-014`):** base tecnologica web/TypeScript; Godot abbandonato.
- **Registrato (`CT-DES-012`):** destinazione PC e mobile/tablet, con interfacce anche molto diverse a parità di regole; primo prototipo da provare su entrambe le classi di dispositivo.
- **DA DECIDERE:** packaging per Windows, macOS, Android e iOS, che richiede specifica e prova dedicate; nessun wrapper è approvato.

La scelta deve considerare interfaccia, densità delle informazioni, durata della sessione, costi di sviluppo, backend, pubblicazione e manutenzione.

### Distribuzione e monetizzazione - DA DECIDERE

Alternative da analizzare separatamente:

- premium;
- free-to-play sostenibile;
- acquisto di set o espansioni;
- contenuti cosmetici;
- modello ibrido.

Vincolo preliminare: la spesa non deve tradursi direttamente in superiorità competitiva non recuperabile attraverso il gioco. La progressione persistente non deve essere confusa con un vantaggio competitivo acquistabile.

---

## 12. Modalità di gioco

### Modalità principale e numero di giocatori

Le alternative da valutare includono:

- duello competitivo 1v1;
- 1v1 con sistema cosmico ambientale;
- esperienza PvE;
- campagna narrativa;
- modalità asincrona;
- varianti cooperative;
- multiplayer con più di due giocatori.

> **DECISIONE DI MATTEO (CT-DES-004, REGISTRATA):** il progetto può includere nel tempo tutte le esperienze considerate, ma la prima modalità da costruire bene è 1vs1 con elemento cosmico.

Ordine e scope delle modalità successive, interazione con PvE, cooperativo e multiplayer restano **DA DECIDERE**.

### Principio di scope

La priorità è validare:

1. il conflitto territoriale;
2. la qualità delle decisioni;
3. l'identità delle fazioni;
4. il ciclo potere-conseguenze;
5. la leggibilità della partita.

Una modalità aggiuntiva non deve essere pianificata se non contribuisce a validare il nucleo o se frammenta prematuramente sviluppo e testing.

---

## 13. Scope proposto per il primo prototipo

> **DECISIONE DI MATTEO (CT-DES-009, REGISTRATA):** durata normale 10-15 minuti; alcune partite possono terminare prima e quelle combattute durare di più; gli obiettivi territoriali sono la principale pressione verso la conclusione; nelle partite prolungate i territori diventano progressivamente più instabili; un eventuale limite massimo sarà deciso dopo i playtest.

> **PROPOSTA**

Il primo prototipo deve essere sufficiente a verificare i pilastri, non a simulare il prodotto completo.

Il documento autorevole per quantità, contenuti e criteri del prototipo è **DA DECIDERE** tra `CT_PROTOTYPE_SCOPE.md` e `CT_ROADMAP.md`; non dovranno duplicare le stesse decisioni.

Il prototipo dovrebbe includere:

- una sola modalità di gioco;
- un campo territoriale funzionante;
- almeno due fazioni volutamente molto diverse, con forte identità già nel prototipo;
- 40 carte per ogni fazione;
- esposizione, costi e instabilità come tre componenti presenti del sistema potere-conseguenze;
- almeno 2 territori e condizioni di vittoria territoriali implementate;
- interfaccia funzionale, non definitiva;
- log degli eventi utile a debugging e playtest;
- formato di esecuzione secondo `CT-DES-011` (REGISTRATA): una persona contro un avversario controllato dal gioco, con forza cosmica automatica fin dall'inizio; il comportamento dell'avversario segue `CT-DES-016` (REGISTRATA): regole fisse e semplici con priorità diverse per ogni fazione, stesse regole d'informazione del giocatore, nessun barare; le priorità concrete sono **DA DEFINIRE** nelle Core Rules.

Non dovrebbe includere, salvo decisione esplicita:

- economia completa;
- negozio;
- grandi quantità di contenuti;
- produzione artistica definitiva;
- più modalità;
- sistemi social estesi;
- ranking competitivo definitivo;
- backend sovradimensionato rispetto al test richiesto;
- AI completa prima che il core loop sia validato.

---

## 14. Principi di implementazione futura

Quando la Vision sarà approvata e tradotta in specifiche, Claude dovrà:

- leggere i documenti di governance obbligatori e le fonti autorevoli indicate nel task;
- ricevere task circoscritti;
- proporre un piano prima delle modifiche;
- non risolvere ambiguità di design scrivendo codice arbitrario;
- mantenere dati e contenuti separati dalla logica quando previsto dall'architettura;
- limitare le modifiche ai file e sistemi necessari;
- aggiornare documentazione tecnica e test pertinenti;
- produrre un report finale verificabile.

Una funzionalità non deve essere implementata sulla base di questo documento soltanto. Deve esistere una specifica `APPROVED` con criteri di accettazione.

---

## 15. Metriche qualitative iniziali

Durante prototipazione e playtesting dovremo verificare almeno:

- il territorio genera decisioni significative a ogni ciclo di gioco?
- esistono più linee strategiche plausibili?
- le conseguenze del potere sono leggibili prima della scelta?
- le fazioni richiedono modi diversi di pianificare?
- il giocatore comprende le cause principali della vittoria o della sconfitta?
- il giocatore riesce a stimare chi è in vantaggio e quali fattori lo determinano?
- il tema cosmico è percepibile anche senza lunghi testi narrativi?
- il numero di eccezioni resta controllabile?
- la partita produce tensione senza dipendere dal caos?

Soglie, campione, strumenti di raccolta e criteri di riuscita o fallimento sono demandati al Prototype Scope e all'Acceptance Test Plan, con responsabilità e fonti dati esplicite prima dell'avvio del prototipo.

---

## 16. Rischi di design da monitorare

1. **Territori cosmetici** - la mappa esiste ma non modifica realmente le decisioni.
2. **Snowball incontrollabile** - il primo vantaggio territoriale alimenta automaticamente tutto il resto.
3. **Costo finto del potere** - la conseguenza è troppo debole, separata dai sistemi centrali o facilmente aggirabile.
4. **Fazioni nominali** - differenze ridotte a statistiche o palette.
5. **Eccesso di testo e carico informativo** - lore, stati e regole competono con la leggibilità.
6. **Casualità punitiva** - gli effetti cosmici annullano decisioni corrette senza possibilità di gestione.
7. **Dipendenza da proprietà di terzi** - identità costruita su elementi non originali o non verificati.
8. **Scope prematuro** - sviluppo di economia, modalità e servizi prima della validazione del nucleo.
9. **Claude come game designer implicito** - ambiguità trasferite all'implementazione anziché risolte nel planning.
10. **Documentazione divergente** - più file descrivono diversamente la stessa regola.
11. **Catena causale illeggibile** - il giocatore non riesce a collegare conseguenze e cambiamenti alla scelta che li ha prodotti.
12. **Conseguenze irreversibili senza agency** - una penalità precoce rende la partita non recuperabile senza offrire decisioni significative.
13. **Vantaggio opaco** - lo stato della partita non permette di capire chi è avanti e perché.

---

## 17. Decisioni richieste per la versione successiva

Prima di portare il documento in `REVIEW`, il Team Cosmic Horror deve decidere o assegnare formalmente:

- [ ] tipo di deckbuilding;
- [ ] relazione tra territorio e vittoria;
- [ ] concetto portante del sistema potere-conseguenze;
- [ ] numero di giocatori e modalità principale;
- [ ] principio informativo e forma ammessa della casualità;
- [ ] principio di contrappeso allo snowball;
- [ ] livello di asimmetria del prototipo;
- [ ] fascia qualitativa di durata;
- [ ] presenza o assenza di una forza cosmica autonoma;
- [ ] marcatore di decisione e utilizzo del decision log;
- [x] percorso tecnologico: web, Godot abbandonato (`CT-DES-014`, REGISTRATA);
- [x] piattaforme iniziali (`CT-DES-012`) e digital-first (`CT-DES-013`), REGISTRATE;
- [x] formato del primo prototipo (`CT-DES-011`, REGISTRATA);
- [x] comportamento dell'avversario controllato dal gioco (`CT-DES-016`, REGISTRATA);
- [x] finestra di intervento prima del completamento dell'obiettivo di vittoria (`CT-DES-015`, REGISTRATA);
- [ ] modello economico da approfondire;
- [ ] grado di utilizzo degli elementi lovecraftiani nominativi;
- [ ] confine tra canone originale e riferimenti letterari;
- [ ] documento autorevole e scope minimo del prototipo;
- [ ] criteri con cui dichiarare validato o falsificato il concept.

---

## 18. Documenti successivi

Dopo l'approvazione delle decisioni necessarie, produrre nell'ordine logico:

1. `CT_CORE_RULES.md`
2. `CT_LORE_BIBLE.md`
3. `CT_MECHANICS_GLOSSARY.md`
4. `CT_PROTOTYPE_SCOPE.md`
5. `CT_TECHNICAL_ARCHITECTURE.md`
6. `CT_USER_FLOWS.md`
7. `CT_ROADMAP.md`
8. `CT_ACCEPTANCE_TEST_PLAN.md`

L'ordine può essere modificato soltanto registrando la decisione nel changelog di progetto. `CT_PROTOTYPE_SCOPE.md`, se confermato come documento autorevole, definisce lo scope; `CT_ROADMAP.md` ne pianifica la realizzazione senza duplicarlo.

---

## 19. Changelog

| Versione | Stato | Modifica |
|---|---|---|
| 0.1.0 | DRAFT | Prima bozza della visione e dei pilastri. |
| 0.2.0 | DRAFT | Rinomina del progetto in Cosmic Horror e correzioni editoriali e di governance della Vision. |
| 0.3.0 | DRAFT | Inserimento delle proposte di Matteo con ID provvisori `CT-DES-001` - `CT-DES-010` e integrazione del chiarimento sulla forza cosmica. |
| 0.4.0 | DRAFT | Integrazione delle proposte emerse nell’intervista per le Core Rules, inclusi prototipo, fazioni, rischio cosmico e pressione di chiusura. |
| 0.5.0 | DRAFT | Rigenerazione dalla v0.3 usando l’esito chiaro; correzione dei percorsi degli esiti, del residuo sull’asimmetria al §13 e del §5.2 sulla casualità cosmica. |
| 0.6.0 | DRAFT | Risolta la contraddizione sostanziale sulla vittoria tramite il chiarimento di Matteo; integrate nelle sezioni interessate le proposte mancanti su comunicazione del rischio, impatto degli eventi cosmici, nucleo comune delle fazioni e decisione della terza fazione dopo i playtest. Nessuna proposta registrata o approvata. |
| 0.7.0 | DRAFT | Integrate nel testo la comunicazione del rischio in CT-DES-005; la pressione graduale, l’impatto basato sull’esposizione e i bersagli del prototipo in CT-DES-010; il nucleo comune, le meccaniche esclusive, l’apprendimento progressivo e la decisione dell’eventuale terza fazione dopo i primi playtest in CT-DES-008. Allineato il §5.2 ai contenuti effettivi di CT-DES-005 e CT-DES-010. Aggiunta la nota aperta sulla finestra di intervento prima del completamento. Nessuna proposta registrata o approvata. |
| 0.8.0 | DRAFT | Preparata da Cowork a partire dalla V0.7. Allineata allo stato di `main`: `CT-DES-014` registrata (web, Godot abbandonato); `CT-DES-011`, `012`, `013` citate come proposte; riferimento alle Regole del Decision Log V0.2. Aggiornati §2, §5.1, §11, §13, §17 e il riquadro iniziale. Il resto del testo è invariato. Nessuna proposta registrata o approvata oltre a `CT-DES-014`. |
| 0.9.0 | DRAFT | Preparata da Cowork. Solo due frasi: `CT-DES-001` - `CT-DES-010` non sono più chiamati «ID provvisori», perché sono nel Decision Log con `Stato: PROPOSTA` (riquadro iniziale e §2). Aggiunto `supersedes` verso la Vision v0.1 «Cosmic Territory», da marcare `DEPRECATED`. Nessun testo di decisione cambiato. |
| 0.10.0 | DRAFT | Preparata da Cowork. Le decisioni CT-DES-001…013 sono registrate (conferma di Matteo del 2026-10-31): i riquadri «PROPOSTA DI MATTEO, IN ATTESA DI REGISTRAZIONE» diventano «DECISIONE DI MATTEO, REGISTRATA»; aggiornati riquadro iniziale, §5.1, §11, §13 e §17; riferimenti al nuovo protocollo Cowork e Code e alle Voci V0.4 e V0.8. Testi delle decisioni invariati; le parti DA DECIDERE restano aperte. |
| 0.11.0 | DRAFT | Preparata da Cowork. Integrate le nuove decisioni registrate `CT-DES-015` (turno di avviso garantito prima della vittoria) e `CT-DES-016` (avversario del prototipo con regole fisse per fazione, senza barare): riquadro iniziale, §13, §17, nota sulla vittoria, front matter. |

---

## Nota aperta sulla vittoria

Il chiarimento sulla vittoria introduce una **finestra di intervento prima del completamento** dell’obiettivo. **DECISIONE DI MATTEO (CT-DES-015, REGISTRATA):** quando un giocatore è a un passo dall'obiettivo, il gioco mostra un segnale chiaro e l'avversario ha sempre almeno un proprio turno completo per reagire. Dopo il completamento dell’obiettivo la vittoria è immediata, senza ulteriori risposte. La soglia «a un passo», la forma del segnale e le azioni di reazione restano **DA DEFINIRE** nelle Core Rules.
