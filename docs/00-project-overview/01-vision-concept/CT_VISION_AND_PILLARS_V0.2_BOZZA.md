---
title: Cosmic Horror - Vision & Design Pillars
status: DRAFT
version: 0.2.0
owner: Team Cosmic Horror
last_reviewed: 2026-10-28
implementation_target: Planning only - non implementabile da Claude in questa versione
project_prefix: CT_
related_documents:
  - ../../00_MASTER_INDEX.md
  - ../../CT_COPILOT_CLAUDE_PROTOCOL.md
  - CT_VISION_AND_PILLARS_REVIEW_V0.1.md
  - CT_VISION_DECISIONI_V0.2_SCHEDE.md
---

# Cosmic Horror - Vision & Design Pillars

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

Le regole di governance da leggere insieme alle fonti autorevoli indicate nel task sono definite nel Master Index e nel Protocollo Copilot-Claude.

---

## 2. Stato della visione

La presente versione è una **bozza di planning**. Tutte le formulazioni sono soggette a revisione.

- `PROPOSTA` indica una direzione consigliata ma non ancora approvata.
- `DA DECIDERE` indica una scelta riservata al Team Cosmic Horror.
- Il marcatore e il processo per le decisioni approvate sono **DA DECIDERE**. Fino alla loro definizione, nessuna sezione di questa bozza deve essere interpretata come requisito implementabile.

---

## 3. High concept

> **PROPOSTA**
>
> Cosmic Horror è un gioco strategico di carte e controllo territoriale ambientato in un cosmo oscuro e instabile, dove fazioni incompatibili competono per conquistare, corrompere o trasformare territori cosmici. Ogni partita rappresenta uno scontro per il dominio della realtà, nel quale il potere ottenuto espone progressivamente i contendenti a forze che non possono controllare completamente.

Il gioco è costruito intorno a tre idee centrali, ancora da precisare nelle decisioni di Vision:

1. **Costruzione strategica del mazzo - DA DECIDERE:** pre-partita, durante la partita o ibrida.
2. **Controllo del territorio - DA DECIDERE:** relazione esatta tra territorio e vittoria.
3. **Potere a rischio crescente - DA DECIDERE:** veicolo principale e portata delle conseguenze.

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

**DA DECIDERE:** quali informazioni sono pubbliche, quali possono essere nascoste e quale forma di casualità è ammessa.

Vincolo editoriale già valido: l'incomprensibilità narrativa del cosmo non deve essere confusa con l'opacità delle regole. Gli effetti necessari a compiere una scelta devono essere comunicati in modo coerente con il principio informativo che sarà approvato.

---

## 5. Identità del progetto

### 5.1 Cosa deve essere

> **PROPOSTA**

Cosmic Horror deve essere:

- un gioco di strategia a carte con forte componente territoriale;
- progettato digital-first, scelta ancora da registrare formalmente;
- caratterizzato da partite in cui il campo evolve visibilmente;
- basato su fazioni con identità strategiche riconoscibili;
- capace di integrare lore e meccaniche;
- accessibile nelle azioni di base, ma profondo nelle interazioni;
- progettato in modo da non precludere nuovi contenuti, senza assumere fin d'ora un modello live o a espansioni.

La piattaforma iniziale, la conferma di Godot e l'eventuale prototipo cartaceo o digitale sono **DA DECIDERE** nei documenti competenti.

### 5.2 Cosa non deve essere

Cosmic Horror non deve diventare:

- una copia di giochi esistenti con un tema differente;
- un gioco nel quale il controllo territoriale è soltanto un contatore secondario;
- un prodotto che usa l'immaginario lovecraftiano come semplice raccolta di nomi famosi;
- un sistema pay-to-win;
- un gioco nel quale l'esito è deciso prevalentemente dalla pesca iniziale o da effetti casuali non controllabili;
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

La relazione precisa tra territorio, vittoria ed eventuale danno diretto è **DA DECIDERE**.

**Verifica del pilastro:** se una versione del gioco potrebbe funzionare quasi allo stesso modo eliminando i territori, quella versione non è coerente con la Vision.

### Pilastro 2 - Il potere ha conseguenze

Le giocate più incisive non devono essere automaticamente la scelta migliore in ogni situazione.

Il veicolo principale delle conseguenze, la loro portata individuale, condivisa o territoriale e il loro grado di prevedibilità sono **DA DECIDERE**.

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

Il livello di asimmetria richiesto per il prototipo e per il prodotto è **DA DECIDERE**. L'identità non deve dipendere soltanto da colori, statistiche o parole chiave cosmetiche.

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

L'esistenza di una forza cosmica autonoma sulla mappa è **DA DECIDERE**.

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

**DA DECIDERE:** quale sistema debba impedire che il vantaggio territoriale si auto-alimenti senza esposizione o possibilità di controgioco.

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

### Piattaforme - DA DECIDERE

Opzioni da valutare nel planning:

- PC come piattaforma iniziale;
- mobile e tablet;
- pubblicazione multipiattaforma;
- eventuale supporto web.

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

### Modalità principale e numero di giocatori - DA DECIDERE

Le alternative da valutare includono:

- duello competitivo 1v1;
- 1v1 con sistema cosmico ambientale;
- esperienza PvE;
- campagna narrativa;
- modalità asincrona;
- varianti cooperative;
- multiplayer con più di due giocatori.

Non tutte devono essere incluse nella prima versione. La modalità primaria deve essere scelta prima della formalizzazione delle Core Rules.

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

> **PROPOSTA**

Il primo prototipo deve essere sufficiente a verificare i pilastri, non a simulare il prodotto completo.

Il documento autorevole per quantità, contenuti e criteri del prototipo è **DA DECIDERE** tra `CT_PROTOTYPE_SCOPE.md` e `CT_ROADMAP.md`; non dovranno duplicare le stesse decisioni.

Il prototipo dovrebbe includere:

- una sola modalità di gioco;
- un campo territoriale funzionante;
- almeno due identità strategiche differenti, con livello di asimmetria da decidere;
- un insieme limitato di carte rappresentative;
- una prima forma del sistema potere-conseguenze;
- condizioni di vittoria implementate;
- interfaccia funzionale, non definitiva;
- log degli eventi utile a debugging e playtest;
- modalità di esecuzione **DA DECIDERE** tra cartaceo, hotseat digitale, avversario scriptato o altra opzione.

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
- [ ] piattaforma iniziale e conferma digital-first;
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
| 0.1.0 | DRAFT | Prima bozza della visione, dei pilastri, dei confini progettuali e del rapporto Planning-Claude. |
| 0.2.0 | DRAFT | Rinomina del progetto in Cosmic Horror; correzioni editoriali e di governance; separazione delle decisioni aperte; chiarimento dei confini tra Vision, Core Rules, Prototype Scope e Technical Design. Nessuna decisione di game design approvata. |
