---
title: Cosmic Territory — Vision & Design Pillars
status: DEPRECATED
superseded_by: CT_VISION_AND_PILLARS_V0.9_BOZZA.md
version: 0.1.0
owner: Team Cosmic Territory
last_reviewed: 2026-10-28
implementation_target: Planning only — non implementabile da Claude in questa versione
related_documents:
  - ../../../00_MASTER_INDEX.md
---

# Cosmic Territory — Vision & Design Pillars

> **DEPRECATED.** Questa è la prima bozza (v0.1.0), con il vecchio nome Cosmic Territory. È superata da CT_VISION_AND_PILLARS_V0.9_BOZZA.md. Resta solo come storia.

## 1. Funzione del documento

Questo documento definisce la visione di prodotto e i pilastri di design di **Cosmic Territory**.

Non è una specifica tecnica e non autorizza Claude a implementare funzionalità. Il suo scopo è stabilire una direzione condivisa entro cui verranno successivamente scritti i documenti di game design, lore, UX, architettura e sviluppo.

Claude potrà usare questo documento per:

- comprendere l'intento del progetto;
- verificare la coerenza delle specifiche successive;
- segnalare contraddizioni tra una proposta implementativa e la visione approvata;
- evitare di introdurre soluzioni formalmente corrette ma incoerenti con l'identità del gioco.

Claude non dovrà usare questo documento per:

- inventare regole mancanti;
- scegliere autonomamente il modello economico;
- definire il canone narrativo;
- ampliare lo scope;
- trasformare indicazioni di atmosfera in requisiti tecnici non approvati.

---

## 2. Stato della visione

La presente versione è una **bozza di planning**. Tutte le formulazioni sono soggette a revisione.

Le sezioni contrassegnate con `DA DECIDERE` non devono essere interpretate come requisiti. Le sezioni contrassegnate con `PROPOSTA` indicano una direzione consigliata, ma non ancora approvata.

---

## 3. High concept

> **PROPOSTA**
>
> Cosmic Territory è un gioco strategico di carte e controllo territoriale ambientato in un cosmo oscuro e instabile, dove fazioni incompatibili competono per conquistare, corrompere o trasformare territori cosmici. Ogni partita rappresenta uno scontro per il dominio della realtà, nel quale il potere ottenuto espone progressivamente i contendenti a forze che non possono controllare completamente.

Il gioco deve combinare tre idee centrali:

1. **Costruzione strategica del mazzo** — il giocatore esprime identità e piano di gioco attraverso la composizione del proprio mazzo.
2. **Controllo del territorio** — la partita non si decide soltanto infliggendo danni, ma contendendo luoghi con valore strategico e narrativo.
3. **Potere a rischio crescente** — le azioni più forti devono comportare esposizione, instabilità, corruzione, perdita di controllo o altre conseguenze leggibili.

La componente cosmica e lovecraftiana deve sostenere il design, non essere soltanto una decorazione applicata a un gioco di carte generico.

---

## 4. Promessa al giocatore

Cosmic Territory deve offrire al giocatore la sensazione di:

- comandare una forza con identità riconoscibile;
- contendersi una mappa viva, non una plancia passiva;
- costruire combinazioni potenti senza sentirsi mai completamente al sicuro;
- prendere decisioni difficili tra vantaggio immediato e conseguenze future;
- scoprire gradualmente un universo vasto, ostile e non pienamente comprensibile;
- vincere grazie a pianificazione, adattamento e lettura dello stato di gioco, non soltanto grazie alla rarità delle carte.

L'esperienza desiderata è **strategica, tesa e leggibile**. L'orrore deve emergere dalla pressione delle decisioni, dall'alterazione progressiva del campo e dalle conseguenze dell'uso del potere, non da confusione deliberata dell'interfaccia o regole incomprensibili.

---

## 5. Identità del progetto

### 5.1 Cosa deve essere

Cosmic Territory deve essere:

- un gioco di strategia a carte con forte componente territoriale;
- progettato digital-first;
- caratterizzato da partite in cui il campo evolve visibilmente;
- basato su fazioni realmente asimmetriche;
- capace di integrare lore e meccaniche;
- accessibile nelle azioni di base, ma profondo nelle interazioni;
- strutturato per evolvere attraverso nuovi contenuti senza invalidare continuamente quelli precedenti.

### 5.2 Cosa non deve essere

Cosmic Territory non deve diventare:

- una copia di Magic: The Gathering, Hearthstone, Marvel Snap o altri giochi esistenti con un tema differente;
- un gioco nel quale il controllo territoriale è soltanto un contatore secondario;
- un prodotto che usa l'immaginario lovecraftiano come semplice raccolta di nomi famosi;
- un sistema pay-to-win;
- un gioco nel quale l'esito è deciso prevalentemente dalla pesca iniziale o da effetti casuali non controllabili;
- un progetto con decine di modalità prima che il nucleo principale sia validato;
- un compendio enciclopedico del mito di Cthulhu;
- un gioco volutamente oscuro nelle informazioni necessarie a prendere decisioni.

---

## 6. Pilastri di design

### Pilastro 1 — Il territorio è il centro della partita

Il campo di gioco deve rappresentare territori contesi dotati di identità, stato e valore strategico.

Il controllo del territorio deve:

- influenzare le opzioni disponibili;
- creare obiettivi locali e conflitti leggibili;
- cambiare nel corso della partita;
- interagire con carte, fazioni e condizioni di vittoria;
- obbligare il giocatore a distribuire risorse e attenzione.

**Verifica del pilastro:** se una versione del gioco potrebbe funzionare quasi allo stesso modo eliminando i territori, quella versione non è coerente con la visione.

### Pilastro 2 — Il potere ha conseguenze

Le giocate più incisive non devono essere automaticamente la scelta migliore in ogni situazione.

L'accesso al potere può richiedere, secondo le future regole approvate:

- accumulo di corruzione o instabilità;
- sacrificio di risorse, unità, carte o controllo;
- esposizione di informazioni;
- alterazione permanente o temporanea del territorio;
- vantaggi concessi indirettamente all'avversario;
- rischio calcolabile di eventi sfavorevoli.

Le conseguenze devono essere comprensibili prima della scelta. L'incertezza può esistere, ma non deve rendere irrilevante la pianificazione.

**Verifica del pilastro:** una carta molto potente deve generare una decisione, non soltanto un vantaggio automatico.

### Pilastro 3 — Le fazioni cambiano il modo di giocare

Ogni fazione deve avere:

- una motivazione narrativa;
- una relazione specifica con il territorio;
- un rapporto distinto con rischio, potere e corruzione;
- punti di forza e limiti riconoscibili;
- almeno un comportamento strategico che non possa essere replicato integralmente dalle altre fazioni.

L'identità non deve dipendere soltanto da colori, statistiche o parole chiave cosmetiche.

**Verifica del pilastro:** osservando alcune decisioni di gioco, un giocatore esperto dovrebbe poter riconoscere la logica della fazione anche senza vedere il suo nome.

### Pilastro 4 — L'orrore cosmico emerge dai sistemi

La direzione lovecraftiana deve manifestarsi attraverso:

- conoscenza che offre vantaggi ma espone a pericoli;
- realtà e territori che possono essere alterati;
- poteri superiori alle capacità di controllo dei personaggi;
- conseguenze persistenti;
- conflitto tra ambizione razionale e forze incomprensibili;
- scala cosmica percepibile senza perdere la leggibilità del gioco.

Il progetto deve evitare di dipendere esclusivamente da citazioni, nomi celebri o riproduzioni letterali dei racconti.

**Verifica del pilastro:** sostituendo nomi e illustrazioni con elementi fantasy generici, una parte sostanziale dell'identità meccanica dovrebbe andare perduta.

### Pilastro 5 — Profondità attraverso interazioni leggibili

Le regole di base devono essere comprensibili, mentre la profondità deve nascere da:

- posizione e stato dei territori;
- tempismo;
- gestione delle risorse;
- sinergie tra carte;
- previsione del piano avversario;
- compromessi tra obiettivi locali e strategia complessiva.

La complessità non deve derivare da eccezioni arbitrarie o testi inutilmente lunghi.

**Verifica del pilastro:** un giocatore deve poter comprendere perché ha perso e individuare almeno una decisione migliorabile.

### Pilastro 6 — Espandibilità controllata

Il sistema deve consentire nuovi set, fazioni, territori e modalità senza richiedere la riscrittura continua del nucleo.

L'espansione deve rispettare:

- un vocabolario meccanico governato;
- limiti all'accumulo di keyword;
- compatibilità dichiarata tra contenuti;
- versionamento dei dati;
- criteri di bilanciamento documentati;
- separazione tra contenuto canonico, sperimentale e deprecato.

**Verifica del pilastro:** un nuovo set deve ampliare le decisioni senza rendere obsolete per definizione le strategie precedenti.

---

## 7. Core loop ad alto livello

> **PROPOSTA — da formalizzare in `CT_CORE_RULES.md`**

Il ciclo principale ipotizzato è:

1. il giocatore valuta territori, risorse, minacce e intenzioni plausibili dell'avversario;
2. sviluppa la propria presenza giocando carte o attivando effetti;
3. contende, conquista, difende o trasforma territori;
4. usa il controllo ottenuto per alimentare nuove possibilità strategiche;
5. decide quanto potere rischiare per cambiare l'equilibrio della partita;
6. gestisce le conseguenze delle proprie scelte;
7. avanza verso una condizione di vittoria definita dalle regole approvate.

### Aspetti non ancora definiti

- struttura esatta del turno;
- numero e disposizione dei territori;
- risorse utilizzate;
- condizioni di vittoria;
- dimensione del mazzo;
- limiti delle copie;
- durata obiettivo delle partite;
- quantità di casualità;
- presenza di unità persistenti;
- ruolo preciso di corruzione, instabilità o sanità;
- eventuali reazioni durante il turno avversario.

Questi elementi devono essere progettati nel documento Core Rules e non dedotti da questa visione.

---

## 8. Direzione narrativa

### 8.1 Principio generale

L'universo deve essere originale e coerente, pur potendo ispirarsi ai temi dell'orrore cosmico e utilizzare esclusivamente elementi per i quali sia stata verificata la possibilità d'uso.

Il materiale letterario presente nella cartella `Materiale Vario` è una fonte di studio. Non è una specifica, non definisce automaticamente il canone del gioco e non autorizza la riproduzione delle traduzioni o dell'apparato editoriale.

### 8.2 Tono

> **PROPOSTA**

Il tono deve essere:

- cosmico;
- inquietante;
- solenne ma non pomposo;
- oscuro senza essere illeggibile;
- tragico, con spazio per ambizione e scoperta;
- privo di ironia invasiva che annulli la tensione.

### 8.3 Uso dell'immaginario lovecraftiano

Il planning dovrà distinguere tre categorie:

1. **Elementi originali di Cosmic Territory** — preferibili per identità e libertà creativa.
2. **Elementi lovecraftiani verificati come utilizzabili** — da registrare con provenienza e regole d'uso.
3. **Elementi esclusi o dubbi** — da non inserire in specifiche destinate a Claude.

Dovranno essere evitati:

- testi copiati dalle traduzioni;
- descrizioni derivate troppo fedelmente da una specifica edizione;
- marchi o rappresentazioni riconducibili a prodotti successivi di terzi;
- uso indiscriminato di nomi senza funzione narrativa o meccanica.

---

## 9. Direzione artistica preliminare

> **PROPOSTA — da sviluppare in Art Direction**

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

L'effetto visivo non deve nascondere informazioni necessarie al gioco competitivo.

---

## 10. Pubblico e posizionamento

### Target primario — DA DECIDERE

Ipotesi da validare:

- giocatori interessati a card game strategici;
- giocatori attratti dal controllo territoriale;
- pubblico sensibile a lore, horror cosmico e costruzione del mondo;
- utenti disponibili ad apprendere un sistema più profondo di un gioco casual, purché ben presentato.

### Posizionamento proposto

Cosmic Territory dovrebbe differenziarsi attraverso la combinazione strutturale tra:

- deckbuilding;
- territorio conteso;
- fazioni asimmetriche;
- potere con conseguenze;
- orrore cosmico espresso dalle meccaniche.

Il posizionamento definitivo richiederà un confronto documentato con i prodotti concorrenti e affini, senza assumere che la sola ambientazione sia sufficiente a differenziare il gioco.

---

## 11. Piattaforme e modello di distribuzione

### Piattaforme — DA DECIDERE

Opzioni da valutare nel planning:

- PC come piattaforma iniziale;
- mobile e tablet;
- pubblicazione multipiattaforma;
- eventuale supporto web.

La scelta deve considerare interfaccia, dimensione delle informazioni, sessione di gioco, costi di sviluppo, backend, pubblicazione e manutenzione.

### Distribuzione e monetizzazione — DA DECIDERE

Alternative da analizzare separatamente:

- premium;
- free-to-play sostenibile;
- acquisto di set o espansioni;
- contenuti cosmetici;
- modello ibrido.

Vincolo preliminare: la spesa non deve tradursi direttamente in superiorità competitiva non recuperabile attraverso il gioco.

---

## 12. Modalità di gioco

### Modalità principale — DA DECIDERE

La prima release deve avere una modalità centrale chiaramente identificata. Le alternative da valutare includono:

- duello competitivo;
- esperienza PvE;
- campagna narrativa;
- modalità asincrona;
- varianti cooperative.

Non tutte devono essere incluse nella prima versione.

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

> **PROPOSTA — numeri e contenuti da approvare nella Roadmap**

Il primo prototipo deve essere sufficiente a verificare i pilastri, non a simulare il prodotto completo.

Dovrebbe includere:

- una sola modalità di gioco;
- un campo territoriale funzionante;
- almeno due identità strategiche realmente differenti;
- un insieme limitato di carte rappresentative;
- una prima forma del sistema potere-conseguenze;
- condizioni di vittoria implementate;
- interfaccia funzionale, non definitiva;
- log degli eventi utile a debugging e playtest;
- partite locali o contro un avversario controllato in modo semplice, salvo decisione diversa sull'architettura iniziale.

Non dovrebbe includere, salvo decisione esplicita:

- economia completa;
- negozio;
- grandi quantità di contenuti;
- produzione artistica definitiva;
- più modalità;
- sistemi social estesi;
- ranking competitivo definitivo;
- backend sovradimensionato rispetto al test richiesto.

---

## 14. Principi di implementazione futura

Quando la visione sarà approvata e tradotta in specifiche, Claude dovrà:

- ricevere task circoscritti;
- leggere soltanto i documenti autorevoli indicati nel task;
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
- il tema cosmico è percepibile anche senza leggere lunghi testi narrativi?
- il numero di eccezioni resta controllabile?
- la partita produce momenti di tensione senza dipendere dal caos?

Le metriche quantitative saranno definite dopo la formalizzazione delle Core Rules e del piano di playtest.

---

## 16. Rischi di design da monitorare

1. **Territori cosmetici** — la mappa esiste ma non modifica realmente le decisioni.
2. **Snowball incontrollabile** — il primo vantaggio territoriale alimenta automaticamente tutto il resto.
3. **Costo finto del potere** — la conseguenza è troppo debole o facilmente aggirabile.
4. **Fazioni nominali** — differenze ridotte a statistiche o palette.
5. **Eccesso di testo** — lore e regole competono con la leggibilità.
6. **Casualità punitiva** — gli effetti cosmici annullano decisioni corrette senza possibilità di gestione.
7. **Dipendenza da proprietà di terzi** — identità costruita su elementi non originali o non verificati.
8. **Scope prematuro** — sviluppo di economia, modalità e servizi prima della validazione del nucleo.
9. **Claude come game designer implicito** — ambiguità trasferite all'implementazione anziché risolte nel planning.
10. **Documentazione divergente** — più file descrivono diversamente la stessa regola.

---

## 17. Decisioni richieste per la versione 0.2

Prima di portare il documento in `REVIEW`, il team deve decidere:

- [ ] genere e descrizione sintetica definitiva;
- [ ] target principale;
- [ ] piattaforma iniziale;
- [ ] modalità principale;
- [ ] natura esatta del controllo territoriale;
- [ ] concetto scelto per il sistema potere-conseguenze;
- [ ] numero indicativo di fazioni del prodotto e del prototipo;
- [ ] ruolo della costruzione del mazzo;
- [ ] direzione multiplayer, PvE o ibrida;
- [ ] modello economico da approfondire;
- [ ] grado di utilizzo degli elementi lovecraftiani nominativi;
- [ ] confine tra canone originale e riferimenti letterari;
- [ ] scope minimo del prototipo;
- [ ] criteri con cui dichiarare validato il concept.

---

## 18. Documenti successivi

Dopo l'approvazione della visione, produrre nell'ordine:

1. `CT_CORE_RULES.md`
2. `CT_LORE_BIBLE.md`
3. `CT_MECHANICS_GLOSSARY.md`
4. `CT_PROTOTYPE_SCOPE.md`
5. `CT_TECHNICAL_ARCHITECTURE.md`
6. `CT_USER_FLOWS.md`
7. `CT_ROADMAP.md`
8. `CT_ACCEPTANCE_TEST_PLAN.md`

La sequenza potrà essere modificata soltanto registrando la decisione nel changelog di progetto.

---

## 19. Changelog

| Versione | Stato | Modifica |
|---|---|---|
| 0.1.0 | DRAFT | Prima bozza della visione, dei pilastri, dei confini progettuali e del rapporto Planning → Claude. |
