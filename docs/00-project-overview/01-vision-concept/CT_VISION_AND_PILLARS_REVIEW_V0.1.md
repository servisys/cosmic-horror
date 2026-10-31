---
title: Review di CT_VISION_AND_PILLARS.md
status: DRAFT
version: 0.1.0
owner: Team Cosmic Territory
reviewer: Claude (reviewer indipendente, sola analisi)
last_reviewed: 2026-10-28
reviewed_document: CT_VISION_AND_PILLARS.md (v0.1.0, DRAFT)
related_documents:
  - CT_VISION_AND_PILLARS.md
  - ../../00_MASTER_INDEX.md
  - ../../CT_COPILOT_CLAUDE_PROTOCOL.md
  - ../../../README.md
---

# Review di CT_VISION_AND_PILLARS.md

> Questo report è un documento di analisi. Non modifica la Vision, non approva alcuna decisione e non costituisce requisito. Le "possibili alternative" indicate sono opzioni da valutare, non raccomandazioni vincolanti.

## 1. Executive summary

- **Valutazione complessiva:** la Vision v0.1 è una base solida dal punto di vista della governance e dell'intento, ma non ancora dal punto di vista del design: stabilisce bene *come* decidere e *cosa evitare*, molto meno *che gioco è*.
- **Maturità:** bozza avanzata di "framework di visione"; identità di gioco ancora a livello di intenzione.
- **Punti di forza:** netta separazione tra PROPOSTA / DA DECIDERE / implementabile; pilastri con test di verifica espliciti (in particolare P1, P3, P5); elenco "cosa non deve essere" e registro dei rischi molto pertinenti; principio "orrore dalla pressione delle decisioni, non dalla confusione".
- **Problemi principali:** quattro decisioni fondative non prese (tipo di deckbuilding, ruolo del territorio nella vittoria, modello potere-conseguenze, numero di giocatori / PvP-PvE) che il documento stesso rimanda ma da cui dipende qualsiasi Core Rules; nessuna sezione marcata come decisa; nessun confronto con i concorrenti strutturalmente più vicini; protocollo Copilot–Claude vuoto; criteri di riuscita del prototipo assenti.
- **Passaggio DRAFT → REVIEW:** non ancora possibile. Il documento stesso (§17) subordina il passaggio a REVIEW a 14 decisioni ancora aperte.

## 2. Verdetto

**REQUIRES REVISION**

La struttura è corretta e non serve riscriverla: servono decisioni del team, non lavoro editoriale. Non è BLOCKED perché nessun impedimento esterno impedisce di procedere — le decisioni mancanti sono tutte nelle mani del team e il documento le ha già in gran parte identificate. Non è READY FOR REVIEW perché i criteri di uscita definiti dalla Vision stessa (§17) non sono soddisfatti e quattro questioni aperte impediscono di scrivere `CT_CORE_RULES.md` senza che le regole vengano di fatto decise da chi le scrive.

## 3. Punti di forza da preservare

1. Separazione esplicita tra visione, proposta e materiale DA DECIDERE, con limiti d'uso del documento per Claude (§1, §2, §14).
2. Pilastri corredati da un test di verifica: rendono la Vision usabile come strumento di review delle feature future (§6).
3. Elenco "Cosa non deve essere" (§5.2) e registro dei rischi (§16): coprono i failure mode più probabili del concept (territori cosmetici, costo finto del potere, fazioni nominali, Claude come game designer implicito).
4. Principio di leggibilità dell'orrore: l'orrore nasce dalla pressione decisionale e dall'alterazione del campo, non da interfaccia o regole oscure (§4, §9).
5. Scope del prototipo con esclusioni esplicite (§13) e priorità di validazione ordinate (§12).
6. Vincolo anti pay-to-win formulato come principio verificabile (§11).
7. Attenzione alla provenienza del materiale lovecraftiano e alle traduzioni (§8.1, §8.3).

## 4. Osservazioni dettagliate

### [CT-REVIEW-VISION-001] Tipo di deckbuilding non determinato

- Severità: BLOCKER
- Sezione: §3 High concept; §7 Core loop; §10 Posizionamento; §17
- Problema o punto di forza: "Costruzione strategica del mazzo" può indicare due generi diversi: mazzo costruito prima della partita (modello CCG/LCG) oppure mazzo costruito durante la partita (modello deckbuilder alla *Dominion*, *Tyrants of the Underdark*). Il testo propende implicitamente per il primo ("esprime identità... attraverso la composizione", "rarità delle carte", "nuovi set"), ma non lo dichiara.
- Perché conta: le due opzioni producono core loop, economia, struttura del turno, ruolo del territorio, modello di monetizzazione e architettura dati completamente diversi. È la scelta di genere.
- Evidenza nel documento: §3 punto 1; §4 "non soltanto grazie alla rarità delle carte"; §6 P6 "nuovi set"; §7 "dimensione del mazzo", "limiti delle copie"; §17 "ruolo della costruzione del mazzo" ancora aperto.
- Domanda per il team: il mazzo si costruisce prima della partita, durante la partita, o entrambe le cose?
- Possibili alternative: (a) mazzo costruito pre-partita da collezione; (b) mazzo pre-costruito per fazione, nessuna personalizzazione nel prototipo; (c) deckbuilding in partita con mercato condiviso o legato ai territori; (d) ibrido: nucleo di fazione fisso + acquisizioni in partita (ad es. dai territori controllati).
- Impatto sui documenti successivi: Core Rules (turno, risorse, mazzo), Glossary, Prototype Scope (quantità di carte), Technical Architecture (modello dati collezione), Roadmap, economia/monetizzazione.

### [CT-REVIEW-VISION-002] Ruolo del territorio nella vittoria non definito; assunzione implicita di un sistema di danni

- Severità: BLOCKER
- Sezione: §3; §6 Pilastro 1; §7
- Problema o punto di forza: il Pilastro 1 afferma la centralità del territorio, ma il documento non dice se il controllo territoriale *è* la condizione di vittoria, *alimenta* la condizione di vittoria o è uno dei percorsi possibili. La frase "la partita non si decide soltanto infliggendo danni" presuppone che esista un sistema di danni (punti vita, eroe, nexus), assunzione mai dichiarata.
- Perché conta: se la vittoria può arrivare principalmente da danni diretti, il territorio rischia di diventare un contatore secondario — esattamente il failure mode che §5.2 e §16.1 vogliono evitare. Il test del Pilastro 1 non è applicabile finché la relazione territorio-vittoria non è fissata.
- Evidenza nel documento: §3 punto 2; §6 P1 "interagire con... condizioni di vittoria"; §7 punto 7 e "condizioni di vittoria" fra gli aspetti non definiti.
- Domanda per il team: il territorio è l'asse principale della vittoria? Esiste un sistema di danni al giocatore?
- Possibili alternative: (a) vittoria esclusivamente territoriale (punti da controllo, maggioranze); (b) vittoria territoriale primaria + condizioni alternative di fazione; (c) danno diretto come via secondaria vincolata al territorio (es. si attacca solo da territori controllati); (d) vittoria legata allo stato cosmico della mappa (es. trasformazione della realtà).
- Impatto sui documenti successivi: Core Rules (condizioni di vittoria), Prototype Scope, Acceptance Test Plan (verifica Pilastro 1), User Flows (fine partita).

### [CT-REVIEW-VISION-003] Modello potere-conseguenze ancora come elenco di opzioni

- Severità: BLOCKER
- Sezione: §6 Pilastro 2; §7; §17
- Problema o punto di forza: il Pilastro 2 elenca sei forme possibili di costo (corruzione, sacrificio, esposizione informativa, alterazione del territorio, vantaggio all'avversario, rischio di eventi). Non indica quale sia il meccanismo portante né se la conseguenza è individuale, condivisa o territoriale.
- Perché conta: è il sistema che deve rendere Cosmic Territory riconoscibile. Senza un concetto scelto, chi scrive le Core Rules lo sceglierebbe di fatto, violando §1 ("Claude non dovrà... inventare regole mancanti").
- Evidenza nel documento: §6 P2 "secondo le future regole approvate"; §7 "ruolo preciso di corruzione, instabilità o sanità"; §17 "concetto scelto per il sistema potere-conseguenze".
- Domanda per il team: qual è il veicolo principale della conseguenza (un tracciato del giocatore, lo stato dei territori, il mazzo, l'avversario) e quanto è prevedibile?
- Possibili alternative (da confrontare, non da scegliere qui): (a) tracciato individuale di corruzione con soglie note e effetti dichiarati; (b) corruzione territoriale: il potere altera il territorio in cui si usa, cambiandone valore o proprietario; (c) "carte conseguenza" inserite nel mazzo del giocatore (deck pollution) — leggibili e ritardate; (d) instabilità condivisa del tavolo che avvicina un evento cosmico che danneggia tutti, con vantaggi per chi la gestisce meglio; (e) costi pagati all'avversario (risorse o informazioni). Le opzioni (b) e (c) legano il costo a territorio o deckbuilding, riducendo il rischio di "semplice contatore" (vedi 011, 012).
- Impatto sui documenti successivi: Core Rules, Glossary, Lore Bible (cosa "è" la corruzione), Prototype Scope, Acceptance Test Plan (verifica P2).

### [CT-REVIEW-VISION-004] Numero di giocatori e direzione PvP/PvE non decisi; il numero di giocatori manca dall'elenco delle decisioni

- Severità: BLOCKER
- Sezione: §11; §12; §17
- Problema o punto di forza: modalità principale e direzione PvP/PvE sono DA DECIDERE; il numero di giocatori (1v1, 3–4 giocatori, solo) non è mai menzionato, nemmeno in §17.
- Perché conta: nei giochi di controllo territoriale il numero di giocatori cambia radicalmente il design (kingmaking, alleanze implicite, ribaltamenti, durata). Anche il modello potere-conseguenze cambia: un costo "concesso all'avversario" ha senso diverso in 1v1 e in multigiocatore. Il §13 prevede "partite locali o contro un avversario controllato in modo semplice", che presuppone già una risposta.
- Evidenza nel documento: §12 elenco aperto (duello, PvE, campagna, asincrona, cooperativa); §13 ultimo punto dello scope; §17 non include il numero di giocatori.
- Domanda per il team: la modalità principale è un duello 1v1, un multigiocatore, o un'esperienza PvE?
- Possibili alternative: (a) duello 1v1 competitivo; (b) 1v1 con avversario cosmico/ambiente come terza forza; (c) PvE con campagna; (d) multigiocatore 3–4.
- Impatto sui documenti successivi: Core Rules, Prototype Scope, Technical Architecture (networking, AI), User Flows, Roadmap.

### [CT-REVIEW-VISION-005] Protocollo Copilot–Claude vuoto

- Severità: HIGH
- Sezione: governance (`docs/CT_COPILOT_CLAUDE_PROTOCOL.md`); Vision §1 e §14
- Problema o punto di forza: il file `CT_COPILOT_CLAUDE_PROTOCOL.md` esiste ma ha dimensione 0 byte. Il Master Index ne impone la lettura prima di ogni review o implementazione.
- Perché conta: la Vision (§14) e il Master Index delegano a questo protocollo il rapporto operativo tra team, Copilot e Claude. Senza di esso i principi di §14 non hanno un riferimento formale (pre-flight plan, formato report, gestione conflitti). Istruzione contrastante segnalata: lettura obbligatoria di un documento privo di contenuto.
- Evidenza nel documento: Master Index §1 punto 2 e §4 "Governance"; file vuoto nel repository.
- Domanda per il team: il protocollo va redatto prima che la Vision passi a REVIEW, o la Vision può avanzare indipendentemente?
- Possibili alternative: (a) redigere il protocollo prima della v0.2; (b) marcare esplicitamente il file come "IDEA — non ancora redatto" e rimuovere temporaneamente l'obbligo di lettura; (c) incorporare temporaneamente le regole minime nel Master Index.
- Impatto sui documenti successivi: tutti i task per Claude; Definition of Ready; Acceptance Test Plan.

### [CT-REVIEW-VISION-006] Nessuna sezione è marcata come decisa; lo stato dei pilastri è ambiguo

- Severità: HIGH
- Sezione: §2; §5; §6; §14–§16
- Problema o punto di forza: il §2 definisce due marcatori (PROPOSTA, DA DECIDERE), ma non un marcatore per le decisioni prese. Le sezioni senza marcatore (Identità §5, Pilastri §6, §14–§16) restano in uno stato indeterminato: non sono dichiarate proposte, ma neppure decisioni. Il registro decisioni (`03-decisions-changelog/`) è vuoto.
- Perché conta: l'obiettivo 2 della review (distinguere visione, proposta e decisione) non è soddisfatto. In fase di REVIEW e poi di APPROVED, sarà difficile stabilire quali pilastri sono vincolanti e quali ancora negoziabili, generando interpretazioni divergenti.
- Evidenza nel documento: §2 definisce solo PROPOSTA e DA DECIDERE; i pilastri §6 non hanno etichetta; cartella decision log contiene solo `.gitkeep`.
- Domanda per il team: i sei pilastri sono già considerati decisi (in attesa di approvazione formale) o sono anch'essi proposte?
- Possibili alternative: (a) aggiungere un terzo marcatore (es. DECISO con riferimento a un ID nel decision log); (b) etichettare ogni sezione con uno dei tre stati; (c) tracciare ogni decisione esclusivamente nel decision log e citarla per ID nella Vision.
- Impatto sui documenti successivi: tutti; in particolare decision log e Core Rules.

### [CT-REVIEW-VISION-007] Differenziazione rispetto ai concorrenti strutturalmente più vicini non analizzata

- Severità: HIGH
- Sezione: §5.2; §10 Posizionamento
- Problema o punto di forza: il §5.2 cita Magic, Hearthstone e Marvel Snap come esempi generici da non copiare, ma non analizza i prodotti che combinano già gli stessi elementi strutturali. Esempi da verificare nel confronto: *Marvel Snap* (carte + luoghi con effetti propri, vittoria per maggioranza di luoghi), *Smash Up* (carte giocate su "basi" contese con valore), *Tyrants of the Underdark* (deckbuilding + controllo territoriale su mappa), *Cthulhu Wars* (controllo territoriale con fazioni asimmetriche lovecraftiane), *Arkham Horror LCG* (gioco di carte lovecraftiano con sanità/orrore come costo).
- Perché conta: la proposta di posizionamento (§10) si basa sulla "combinazione strutturale" di deckbuilding, territorio, fazioni asimmetriche, potere con conseguenze e orrore cosmico. Ciascuna coppia di questi elementi esiste già sul mercato; senza confronto documentato il rischio "copia con tema diverso" (§5.2, primo punto) non è verificabile. Il §10 stesso riconosce la necessità del confronto ma non lo pianifica.
- Evidenza nel documento: §5.2 primo punto; §10 ultimo paragrafo.
- Domanda per il team: quale elemento, o quale combinazione, il team considera non presente nei concorrenti più vicini?
- Possibili alternative: (a) analisi competitiva documentata prima della v0.2; (b) aggiungere alla Vision una frase "unique selling point" verificabile; (c) aggiungere un test di pilastro: "una feature che replica un concorrente senza modificarlo tramite potere-conseguenze o territorio non è coerente".
- Impatto sui documenti successivi: Core Rules (scelte di struttura), posizionamento/marketing, Roadmap.

### [CT-REVIEW-VISION-008] Snowball territoriale riconosciuto come rischio ma non governato da un principio

- Severità: HIGH
- Sezione: §7 punto 4; §16.2; §6 Pilastro 1
- Problema o punto di forza: il core loop prevede che il controllo ottenuto "alimenti nuove possibilità strategiche" (§7.4). È il meccanismo classico di snowball, che §16.2 elenca come rischio. Nessun pilastro o principio indica come il sistema debba contrastarlo.
- Perché conta: nei giochi di controllo territoriale lo snowball è il failure mode più frequente. Il sistema potere-conseguenze potrebbe essere il contrappeso naturale (più potere → più esposizione), ma la Vision non stabilisce questo legame. Se non è un principio, le Core Rules potrebbero risolverlo con meccaniche esterne (catch-up generico) incoerenti con l'identità.
- Evidenza nel documento: §7.4; §16.2.
- Domanda per il team: il contrappeso allo snowball deve derivare dal sistema potere-conseguenze, dal territorio stesso, o da meccaniche dedicate?
- Possibili alternative: (a) principio "il vantaggio territoriale aumenta l'esposizione" (lega P1 e P2); (b) territori con costo di mantenimento; (c) territori che si corrompono/trasformano col tempo; (d) meccaniche di rimonta esplicite.
- Impatto sui documenti successivi: Core Rules, Balance, Acceptance Test Plan.

### [CT-REVIEW-VISION-009] Il prototipo non ha criteri di riuscita o fallimento

- Severità: HIGH
- Sezione: §13; §15; §17
- Problema o punto di forza: il prototipo dichiara di dover "verificare i pilastri", ma non definisce come si stabilisce che un pilastro è stato validato o falsificato. Le metriche di §15 sono domande senza soglia, metodo o numero di sessioni.
- Perché conta: senza criteri di uscita il prototipo può proseguire indefinitamente o essere giudicato soggettivamente; il §17 lo riconosce ("criteri con cui dichiarare validato il concept") ma non lo risolve.
- Evidenza nel documento: §13 primo paragrafo; §15 "Le metriche quantitative saranno definite dopo..."; §17 ultimo punto.
- Domanda per il team: quale risultato di playtest farebbe abbandonare o modificare profondamente un pilastro?
- Possibili alternative: (a) per ogni pilastro, un criterio di falsificazione qualitativo già nella Vision (es. P1: "se nei playtest i giocatori ignorano un territorio per un'intera partita senza conseguenze, il pilastro non è soddisfatto"); (b) rimandare soglie e metodo a `CT_PROTOTYPE_SCOPE.md` / `CT_ACCEPTANCE_TEST_PLAN.md` ma fissare nella Vision l'obbligo di definirli prima dello sviluppo; (c) definire un numero minimo di sessioni e un questionario standard.
- Impatto sui documenti successivi: Prototype Scope, Acceptance Test Plan, Roadmap.

### [CT-REVIEW-VISION-010] Modello di prodotto "a espansioni" assunto implicitamente prima della decisione economica

- Severità: HIGH
- Sezione: §5.1 ultimo punto; §6 Pilastro 6; §11
- Problema o punto di forza: §5.1 ("evolvere attraverso nuovi contenuti") e il Pilastro 6 (set, versionamento dati, compatibilità, deprecazione) presuppongono un prodotto live a contenuti incrementali, mentre il §11 lascia DA DECIDERE distribuzione e monetizzazione (premium incluso).
- Perché conta: è un'assunzione implicita che anticipa una decisione economica e di prodotto. Elevare l'espandibilità a pilastro può spingere a progettare versionamento, compatibilità e governance di set prima di aver validato il nucleo — rischio §16.8 (scope prematuro).
- Evidenza nel documento: §5.1; §6 P6; §11 "Distribuzione e monetizzazione — DA DECIDERE".
- Domanda per il team: l'espandibilità è un requisito di prodotto deciso o un'opzione da preservare?
- Possibili alternative: (a) mantenere P6 ma limitarlo a "non precludere" (vocabolario governato, dati separati), rimandando versionamento e compatibilità; (b) spostare P6 in un documento di principi tecnici/di produzione (vedi 014); (c) confermarlo come pilastro dopo la decisione economica.
- Impatto sui documenti successivi: Technical Architecture, Roadmap, economia, Prototype Scope.

### [CT-REVIEW-VISION-011] Modello informativo non definito: tensione tra "incomprensibile" e "leggibile"

- Severità: HIGH
- Sezione: §4; §6 Pilastri 2, 4, 5; §5.2
- Problema o punto di forza: la promessa include "un universo... non pienamente comprensibile" e "senza sentirsi mai completamente al sicuro"; contemporaneamente richiede conseguenze "comprensibili prima della scelta" e vieta informazioni oscure. Il documento risolve parzialmente la tensione (§4 ultimo paragrafo), ma non distingue in modo esplicito informazione *diegetica* (il mondo è incomprensibile per i personaggi) da informazione *meccanica* (le regole sono trasparenti per il giocatore), né quanta informazione nascosta e casualità sono ammesse.
- Perché conta: l'orrore cosmico tende a spingere verso informazione nascosta e casualità; la leggibilità competitiva spinge nella direzione opposta. Senza un principio, ogni specifica successiva rinegozierà il compromesso. È il punto in cui atmosfera e comportamento del sistema rischiano di confondersi (obiettivo B della review).
- Evidenza nel documento: §4 punti 3 e 5; §6 P2 "L'incertezza può esistere"; §5.2 "esito deciso... da effetti casuali non controllabili"; §7 "quantità di casualità" non definita.
- Domanda per il team: quali informazioni sono sempre pubbliche, quali possono essere nascoste, e in che forma la casualità è ammessa?
- Possibili alternative: (a) principio "regole trasparenti, mondo opaco": ogni effetto meccanico è conoscibile, l'incomprensibilità è solo narrativa/visiva; (b) casualità ammessa solo con distribuzione nota (es. mazzo eventi visibile nella composizione); (c) informazione nascosta solo come scelta pagata (conoscenza come risorsa, coerente con P4).
- Impatto sui documenti successivi: Core Rules, Art Direction/UI, User Flows, Acceptance Test Plan.

### [CT-REVIEW-VISION-012] Sovrapposizione tra Pilastro 2 e Pilastro 4

- Severità: MEDIUM
- Sezione: §6 Pilastri 2 e 4
- Problema o punto di forza: tre dei sei punti del Pilastro 4 ("conoscenza che offre vantaggi ma espone a pericoli", "poteri superiori alle capacità di controllo", "conseguenze persistenti") ripetono il Pilastro 2 in chiave tematica.
- Perché conta: due pilastri sovrapposti producono valutazioni ridondanti o divergenti di una stessa feature; diventa poco chiaro quale test prevale.
- Evidenza nel documento: §6 P2 elenco costi; §6 P4 punti 1, 3, 4.
- Domanda per il team: P4 deve restare un pilastro autonomo o essere la "lente tematica" che governa P1 e P2?
- Possibili alternative: (a) unire P2 e P4 in un pilastro unico ("il potere cosmico ha un prezzo"); (b) mantenere P4 ma limitarlo a ciò che P2 non copre (alterazione della realtà/territori, scala cosmica); (c) mantenere entrambi dichiarando P2 come meccanica e P4 come criterio di tema.
- Impatto sui documenti successivi: Acceptance Test Plan, Lore Bible, Core Rules.

### [CT-REVIEW-VISION-013] Il test del Pilastro 4 non verifica ciò che dichiara

- Severità: MEDIUM
- Sezione: §6 Pilastro 4, "Verifica del pilastro"
- Problema o punto di forza: il test chiede che, sostituendo nomi e illustrazioni con elementi fantasy, "una parte sostanziale dell'identità meccanica" vada perduta. Sostituire nomi e illustrazioni lascia per definizione invariata la meccanica; ciò che si perde (o no) è la coerenza tra meccanica e tema.
- Perché conta: un test formulato in modo ambiguo produrrà interpretazioni divergenti durante le review delle feature.
- Evidenza nel documento: §6 P4 ultima riga.
- Domanda per il team: il test deve misurare se la meccanica *evoca* l'orrore cosmico anche senza tema, o se il tema *dà senso* alla meccanica?
- Possibili alternative: (a) "Mostrando le sole regole senza nomi né illustrazioni, un giocatore dovrebbe riconoscere un'esperienza di orrore cosmico"; (b) "Una meccanica che funzionerebbe identica con tema fantasy generico va giustificata o rivista".
- Impatto sui documenti successivi: Acceptance Test Plan, Card Database (criteri di review delle carte).

### [CT-REVIEW-VISION-014] Il Pilastro 6 è un principio di produzione, non un pilastro di esperienza

- Severità: MEDIUM
- Sezione: §6 Pilastro 6
- Problema o punto di forza: P1–P5 descrivono l'esperienza del giocatore; P6 descrive vincoli di processo e architettura (vocabolario governato, versionamento dati, compatibilità).
- Perché conta: mescolare livelli rende i pilastri meno utili come filtro di design e porta requisiti tecnici in un documento che dichiara di non esserlo (§1).
- Evidenza nel documento: §6 P6 elenco; §1 "Non è una specifica tecnica".
- Domanda per il team: P6 va mantenuto come pilastro o spostato fra i principi di produzione?
- Possibili alternative: (a) spostare in §14 o in un documento di principi di produzione; (b) riformularlo dal punto di vista del giocatore (es. "le strategie apprese restano valide"); (c) mantenerlo così con nota che è un vincolo di produzione.
- Impatto sui documenti successivi: Technical Architecture, Glossary, Roadmap.

### [CT-REVIEW-VISION-015] Asimmetria delle fazioni senza template minimo e con rischio di bilanciamento sul prototipo

- Severità: MEDIUM
- Sezione: §5.1; §6 Pilastro 3; §13
- Problema o punto di forza: il Pilastro 3 elenca cinque requisiti per fazione (motivazione, relazione col territorio, rapporto col rischio, forze/limiti, comportamento unico) ma non distingue tra asimmetria di regole (fazioni che usano regole diverse) e asimmetria di contenuto (carte diverse sulle stesse regole). "Realmente asimmetriche" suggerisce la prima, che è la più costosa da bilanciare.
- Perché conta: con sole due fazioni nel prototipo, un'asimmetria di regole spinta rende difficile capire se un problema dipende dal core loop o dal bilanciamento della singola fazione.
- Evidenza nel documento: §5.1 "fazioni realmente asimmetriche"; §6 P3; §13 "almeno due identità strategiche realmente differenti".
- Domanda per il team: quale livello di asimmetria è richiesto per il prototipo e quale per il prodotto?
- Possibili alternative: (a) prototipo con asimmetria limitata a una regola di fazione + pool di carte, asimmetria piena dopo validazione del core; (b) asimmetria piena da subito ma con un "fazione di controllo" più vicina alla regola base; (c) template obbligatorio di fazione (i 5 requisiti P3 + win-rate target + complessità stimata) da compilare prima del prototipo.
- Impatto sui documenti successivi: Core Rules, Lore Bible (fazioni), Prototype Scope, Balance.

### [CT-REVIEW-VISION-016] Conflitto di destinazione per lo scope del prototipo

- Severità: MEDIUM
- Sezione: §13; §18; Master Index §6
- Problema o punto di forza: §13 dichiara "numeri e contenuti da approvare nella Roadmap", mentre la sequenza documentale (§18, Master Index §6) prevede un documento dedicato `CT_PROTOTYPE_SCOPE.md` (posizione 4) che precede `CT_ROADMAP.md` (posizione 7). Istruzione contrastante segnalata, non risolta.
- Perché conta: due documenti potenzialmente autorevoli per lo stesso contenuto alimentano il rischio §16.10 (documentazione divergente).
- Evidenza nel documento: §13 intestazione; §18 punti 4 e 7.
- Domanda per il team: lo scope del prototipo si approva in `CT_PROTOTYPE_SCOPE.md` o in `CT_ROADMAP.md`?
- Possibili alternative: (a) `CT_PROTOTYPE_SCOPE.md` autorevole, la Roadmap lo cita; (b) eliminare il documento dedicato e usare la Roadmap.
- Impatto sui documenti successivi: Prototype Scope, Roadmap.

### [CT-REVIEW-VISION-017] Terminologia "sanità" e "corruzione" da verificare

- Severità: MEDIUM
- Sezione: §3 punto 3; §7 "Aspetti non ancora definiti"
- Problema o punto di forza: "sanità" compare come opzione per il sistema di conseguenze. Nel genere è un termine fortemente associato a prodotti esistenti di terze parti (in particolare giochi di ruolo e da tavolo lovecraftiani).
- Perché conta: anche quando un'idea meccanica non è protetta, la scelta terminologica influisce sulla percezione di originalità (§5.2, §16.7) e può richiedere verifica su marchi e associazioni commerciali.
- Evidenza nel documento: §7 "ruolo preciso di corruzione, instabilità o sanità".
- Domanda per il team: il glossario deve preferire termini originali per i concetti chiave del sistema?
- Possibili alternative: (a) terminologia originale di Cosmic Territory per tutti i concetti core; (b) uso di termini di genere previa verifica; (c) decisione rimandata al Glossary con criterio di originalità esplicito.
- Impatto sui documenti successivi: Glossary, Lore Bible, Card Database, Localization.

### [CT-REVIEW-VISION-018] Uso dell'immaginario lovecraftiano: categorie corrette ma criteri di verifica assenti

- Severità: MEDIUM
- Sezione: §8.1; §8.3; §16.7; §17
- Problema o punto di forza: la tripartizione originale / verificato / escluso è valida, ma non indica chi verifica, con quale criterio e dove si registra la provenienza. Punti che, a parere del reviewer, richiedono verifica da parte di persona competente (non si fornisce qui una valutazione legale): (1) lo stato di pubblico dominio delle opere originali varia per opera e per giurisdizione (UE, USA, altri mercati di pubblicazione); (2) molte entità e nomi del "mito" sono stati creati o sviluppati da autori successivi e possono avere uno stato diverso dalle opere di Lovecraft; (3) alcuni nomi e titoli possono essere oggetto di marchi registrati in ambito giochi; (4) le traduzioni e gli apparati editoriali sono opere protette distinte (il documento lo riconosce); (5) rappresentazioni visive iconiche derivano spesso da prodotti successivi.
- Perché conta: il registro dei rischi (§16.7) indica la dipendenza da proprietà di terzi; senza processo di verifica, il rischio non è mitigabile e la decisione §17 "grado di utilizzo degli elementi lovecraftiani nominativi" non ha base.
- Evidenza nel documento: §8.3 categorie 2 e 3; §17 penultimi due punti.
- Domanda per il team: chi è responsabile della verifica e qual è il formato del registro di provenienza?
- Possibili alternative: (a) registro di provenienza (nome, fonte, data di pubblicazione, giurisdizioni, stato, verificato da) nel Lore Bible; (b) politica "solo elementi originali" per il nucleo identitario, riferimenti lovecraftiani solo come ispirazione tematica; (c) consulenza legale prima di qualsiasi uso nominativo.
- Impatto sui documenti successivi: Lore Bible, Card Database, Art Direction, Marketing.

### [CT-REVIEW-VISION-019] Assunzioni implicite su piattaforma e tecnologia

- Severità: MEDIUM
- Sezione: §5.1 "digital-first"; §11; struttura del repository
- Problema o punto di forza: la Vision dichiara "digital-first" in §5.1 come identità, mentre §11 lascia la piattaforma DA DECIDERE. La struttura del repository presuppone già Godot (`docs/07-development/01-godot-project/`, `.gitignore` per Godot 4), scelta non presente in alcun documento di visione o decisione.
- Perché conta: decisioni tecniche registrate solo nella struttura del repository sfuggono alla gerarchia delle fonti del Master Index; "digital-first" esclude implicitamente un prototipo cartaceo.
- Evidenza nel documento: §5.1 secondo punto; §11; cartelle e `.gitignore` del repository.
- Domanda per il team: digital-first e Godot sono decisioni prese? Se sì, vanno registrate.
- Possibili alternative: (a) registrare entrambe nel decision log; (b) marcare "digital-first" come PROPOSTA; (c) rinviare la scelta del motore alla Technical Architecture.
- Impatto sui documenti successivi: Technical Architecture, Prototype Scope, Roadmap.

### [CT-REVIEW-VISION-020] L'avversario controllato nel prototipo è un costo sottostimato

- Severità: MEDIUM
- Sezione: §13 ultimo punto dello scope incluso
- Problema o punto di forza: "avversario controllato in modo semplice" richiede comunque un'AI capace di contendere territori e valutare il potere con conseguenze, cioè proprio i sistemi in validazione. Un'AI debole può falsare i playtest (il giocatore non sente mai la pressione).
- Perché conta: incide su effort del prototipo e sull'affidabilità della validazione dei pilastri.
- Evidenza nel documento: §13 "partite locali o contro un avversario controllato in modo semplice".
- Domanda per il team: la validazione del prototipo richiede un'AI o è sufficiente il gioco umano contro umano?
- Possibili alternative: (a) solo hotseat locale; (b) hotseat + AI scriptata minima per test di regressione; (c) AI vera come obiettivo di milestone successiva.
- Impatto sui documenti successivi: Prototype Scope, Technical Architecture, Roadmap.

### [CT-REVIEW-VISION-021] Metriche qualitative senza metodo di raccolta

- Severità: MEDIUM
- Sezione: §15
- Problema o punto di forza: le otto domande sono pertinenti e ben allineate ai pilastri, ma non indicano chi osserva, con quale strumento (questionario, log eventi, intervista) e su quale campione.
- Perché conta: senza metodo, le risposte saranno aneddotiche e non confrontabili tra iterazioni.
- Evidenza nel documento: §15 elenco; §13 "log degli eventi utile a debugging e playtest".
- Domanda per il team: quali domande si misurano dal log degli eventi e quali con feedback diretto?
- Possibili alternative: (a) mappare ogni domanda a un pilastro e a una fonte dati; (b) rimandare il metodo all'Acceptance Test Plan mantenendo la mappatura nella Vision.
- Impatto sui documenti successivi: Acceptance Test Plan, Prototype Scope, Technical Architecture (log eventi).

### [CT-REVIEW-VISION-022] Durata e ritmo della partita non sono un vincolo di visione

- Severità: MEDIUM
- Sezione: §7 "durata obiettivo delle partite"; §11
- Problema o punto di forza: la durata è relegata alle Core Rules, ma condiziona piattaforma (§11), numero di territori, profondità del sistema di conseguenze e target (§10).
- Perché conta: una fascia di durata indicativa è una scelta di esperienza, non una regola; lasciarla alle Core Rules rischia che sia la complessità delle regole a determinarla.
- Evidenza nel documento: §7 elenco aspetti non definiti; §11 "sessione di gioco" tra i criteri di piattaforma.
- Domanda per il team: qual è la fascia di durata desiderata per una partita?
- Possibili alternative: (a) partite brevi (sessione mobile); (b) partite medie (sessione PC); (c) durata variabile per modalità.
- Impatto sui documenti successivi: Core Rules, Prototype Scope, User Flows, scelta piattaforma.

### [CT-REVIEW-VISION-023] Percorso errato in related_documents

- Severità: LOW
- Sezione: front matter
- Problema o punto di forza: `../../../00_MASTER_INDEX.md` dalla cartella `docs/00-project-overview/01-vision-concept/` punta alla radice del repository, dove il file non esiste. Il percorso corretto sarebbe `../../00_MASTER_INDEX.md`.
- Perché conta: link interrotto; incoerenza con l'obiettivo di link relativi del Master Index v0.2.0.
- Evidenza nel documento: front matter, `related_documents`.
- Domanda per il team: nessuna.
- Possibili alternative: correggere il percorso nella v0.2.
- Impatto sui documenti successivi: nessuno.

### [CT-REVIEW-VISION-024] Riferimento alla cartella "Materiale Vario" non presente

- Severità: LOW
- Sezione: §8.1
- Problema o punto di forza: la Vision cita "la cartella `Materiale Vario`", residuo della struttura SharePoint; il repository usa `reference/` (Master Index §5).
- Perché conta: riferimento non risolvibile; rischio di confusione sulla fonte.
- Evidenza nel documento: §8.1 secondo paragrafo.
- Domanda per il team: nessuna.
- Possibili alternative: sostituire con `reference/` e citare le regole del Master Index §5.
- Impatto sui documenti successivi: Lore Bible.

### [CT-REVIEW-VISION-025] README.md duplica integralmente il Master Index

- Severità: LOW
- Sezione: repository (`README.md`, `docs/00_MASTER_INDEX.md`)
- Problema o punto di forza: i due file sono identici byte per byte; i link relativi del Master Index non sono validi se letti dalla radice (`README.md`).
- Perché conta: è un'istanza immediata del rischio §16.10 (documentazione divergente) e produce link interrotti nella pagina principale del repository.
- Evidenza nel documento: confronto dei due file.
- Domanda per il team: il README deve essere un breve ingresso che rimanda al Master Index?
- Possibili alternative: (a) README sintetico con link al Master Index; (b) mantenere la copia ma con link corretti per la radice.
- Impatto sui documenti successivi: nessuno diretto.

### [CT-REVIEW-VISION-026] §14 e Master Index danno istruzioni di lettura diverse a Claude

- Severità: LOW
- Sezione: §14; Master Index §1
- Problema o punto di forza: §14 indica "leggere soltanto i documenti autorevoli indicati nel task"; il Master Index richiede di leggere sempre anche Master Index e Protocollo. Istruzione contrastante segnalata, non risolta.
- Perché conta: piccola ma reale ambiguità operativa nei futuri task.
- Evidenza nel documento: §14 secondo punto; Master Index §1 punti 1–3.
- Domanda per il team: quali documenti sono sempre obbligatori indipendentemente dal task?
- Possibili alternative: allineare §14 al Master Index ("oltre ai documenti di governance").
- Impatto sui documenti successivi: Protocollo, template di task.

### [CT-REVIEW-VISION-027] Contenuti DRAFT su main in contrasto con la convenzione Git

- Severità: LOW
- Sezione: Master Index §11; stato del repository
- Problema o punto di forza: la convenzione indica che `main` contiene contenuti approvati e che il planning avviene su `planning/<id>-descrizione`; il commit iniziale su `main` contiene invece documenti DRAFT, inclusa questa Vision.
- Perché conta: chi legge `main` presumendo la convenzione potrebbe considerare approvati contenuti che non lo sono.
- Evidenza nel documento: Master Index §11 primo e secondo punto; storia del repository.
- Domanda per il team: il commit iniziale è un'eccezione accettata (bootstrap) o va riallineato?
- Possibili alternative: (a) registrare l'eccezione di bootstrap nel decision log; (b) da ora in poi usare branch `planning/` per tutte le modifiche ai documenti.
- Impatto sui documenti successivi: processo di review di tutti i documenti.

### [CT-REVIEW-VISION-028] Gli aspetti non definiti del core loop non hanno priorità né dipendenze

- Severità: LOW
- Sezione: §7 "Aspetti non ancora definiti"
- Problema o punto di forza: l'elenco di 11 aspetti è corretto ma piatto: non indica quali derivano da decisioni di Vision (es. casualità, unità persistenti) e quali sono pura progettazione di regole (es. limite copie).
- Perché conta: facilita l'errore di decidere aspetti di visione dentro le Core Rules.
- Evidenza nel documento: §7 elenco.
- Domanda per il team: nessuna specifica.
- Possibili alternative: suddividere l'elenco tra "dipende dalla Vision" e "da progettare nelle Core Rules".
- Impatto sui documenti successivi: Core Rules.

### [CT-REVIEW-VISION-029] Prototipo cartaceo prima del prototipo digitale?

- Severità: QUESTION
- Sezione: §13; §5.1 "digital-first"
- Problema o punto di forza: i sistemi da validare (territorio, potere-conseguenze, fazioni) sono di natura regolistica e potrebbero essere testati su carta prima di investire in sviluppo.
- Perché conta: riduce il rischio di implementare in Godot regole che cambieranno; ma "digital-first" potrebbe implicare meccaniche impraticabili su carta (tracciamento automatico, stati complessi).
- Evidenza nel documento: §5.1; §13.
- Domanda per il team: il primo prototipo deve essere digitale?
- Possibili alternative: (a) prototipo cartaceo/print-and-play per il core loop, digitale dopo; (b) solo digitale; (c) prototipo digitale "grezzo" senza UI curata.
- Impatto sui documenti successivi: Prototype Scope, Roadmap, Technical Architecture.

### [CT-REVIEW-VISION-030] I tre verbi del high concept corrispondono a tre archetipi di fazione?

- Severità: QUESTION
- Sezione: §3
- Problema o punto di forza: "conquistare, corrompere o trasformare territori" suggerisce tre relazioni distinte con il territorio, coerenti con il Pilastro 3 ("relazione specifica con il territorio").
- Perché conta: se intenzionale, offre un asse forte per differenziare le fazioni; se casuale, rischia di essere letto come impegno di design.
- Evidenza nel documento: §3 high concept; §6 P3 secondo punto.
- Domanda per il team: i tre verbi sono una scelta di design o una formulazione descrittiva?
- Possibili alternative: (a) adottarli come archetipi di fazione; (b) riformulare il high concept in modo neutro.
- Impatto sui documenti successivi: Lore Bible (fazioni), Core Rules.

### [CT-REVIEW-VISION-031] Esiste una forza cosmica non controllata da alcun giocatore?

- Severità: QUESTION
- Sezione: §3; §4; §6 Pilastro 4
- Problema o punto di forza: il high concept parla di "forze che non possono controllare completamente"; non è chiaro se queste forze sono solo conseguenze delle azioni dei giocatori o un sistema autonomo che agisce sulla mappa (eventi, entità, evoluzione dei territori).
- Perché conta: un sistema ambientale autonomo è un componente di core loop rilevante (tempo, casualità, contrappeso allo snowball), con impatto su complessità e leggibilità.
- Evidenza nel documento: §3; §4 "mappa viva, non una plancia passiva"; §6 P4.
- Domanda per il team: la "mappa viva" evolve solo per azioni dei giocatori o anche autonomamente?
- Possibili alternative: (a) solo azioni dei giocatori; (b) evoluzione autonoma prevedibile (timer, tracciato noto); (c) evoluzione autonoma attivata dalle conseguenze del potere.
- Impatto sui documenti successivi: Core Rules, Lore Bible, Technical Architecture.

### [CT-REVIEW-VISION-032] Confini d'uso del documento per Claude

- Severità: STRENGTH
- Sezione: §1; §2; §14
- Problema o punto di forza: il documento dichiara cosa Claude può e non può farne, e vieta l'implementazione senza specifica APPROVED.
- Perché conta: previene il rischio §16.9 (Claude come game designer implicito).
- Evidenza nel documento: §1 elenchi; §14 ultimo paragrafo.
- Domanda per il team: nessuna.
- Possibili alternative: preservare nella v0.2.
- Impatto sui documenti successivi: tutti i task implementativi.

### [CT-REVIEW-VISION-033] Pilastri dotati di test di verifica

- Severità: STRENGTH
- Sezione: §6
- Problema o punto di forza: i test di P1 (togliere i territori), P3 (riconoscere la fazione senza nome) e P5 (capire perché si è perso) sono concreti e osservabili in playtest.
- Perché conta: rendono la Vision usabile per valutare le future feature e implementazioni (obiettivo 15 della review).
- Evidenza nel documento: §6, righe "Verifica del pilastro".
- Domanda per il team: nessuna.
- Possibili alternative: preservare ed estendere lo stesso formato ai criteri di prototipo (vedi 009).
- Impatto sui documenti successivi: Acceptance Test Plan.

### [CT-REVIEW-VISION-034] Confini negativi e registro dei rischi

- Severità: STRENGTH
- Sezione: §5.2; §16
- Problema o punto di forza: elenco puntuale di ciò che il gioco non deve diventare e dei failure mode di design.
- Perché conta: offre criteri di rifiuto rapidi per proposte future e protegge dallo scope creep.
- Evidenza nel documento: §5.2; §16 punti 1–10.
- Domanda per il team: nessuna.
- Possibili alternative: preservare; collegare ogni rischio al pilastro che lo previene.
- Impatto sui documenti successivi: Roadmap, Acceptance Test Plan.

### [CT-REVIEW-VISION-035] Orrore leggibile

- Severità: STRENGTH
- Sezione: §4 ultimo paragrafo; §9
- Problema o punto di forza: la scelta di far nascere l'orrore dalla pressione decisionale e non dall'opacità dell'interfaccia è una posizione chiara e distintiva.
- Perché conta: risolve in anticipo un conflitto tipico del genere e guida UI e Art Direction.
- Evidenza nel documento: §4; §9 elenco leggibilità.
- Domanda per il team: nessuna.
- Possibili alternative: preservare; formalizzarla come principio informativo (vedi 011).
- Impatto sui documenti successivi: Art Direction, User Flows, Core Rules.

### [CT-REVIEW-VISION-036] Scope del prototipo con esclusioni esplicite

- Severità: STRENGTH
- Sezione: §12 "Principio di scope"; §13
- Problema o punto di forza: priorità di validazione ordinate ed esclusioni chiare (economia, negozio, ranking, backend).
- Perché conta: protegge dallo scope creep (§16.8).
- Evidenza nel documento: §12; §13 secondo elenco.
- Domanda per il team: nessuna.
- Possibili alternative: preservare; aggiungere criteri di uscita (vedi 009).
- Impatto sui documenti successivi: Prototype Scope, Roadmap.

## 5. Decisioni richieste al Team Cosmic Territory

1. **Tipo di deckbuilding** (pre-partita, in partita, ibrido).
   - Motivo: definisce il genere (CT-REVIEW-VISION-001).
   - Documenti influenzati: Core Rules, Glossary, Prototype Scope, Technical Architecture, economia.
   - Prima di CT_CORE_RULES.md: **sì**.
2. **Relazione tra territorio e vittoria**, inclusa l'esistenza di un sistema di danni al giocatore.
   - Motivo: rende verificabile il Pilastro 1 (002).
   - Documenti influenzati: Core Rules, Prototype Scope, Acceptance Test Plan, User Flows.
   - Prima di CT_CORE_RULES.md: **sì**.
3. **Concetto portante del sistema potere-conseguenze** (veicolo, portata individuale/condivisa/territoriale, prevedibilità).
   - Motivo: identità del gioco (003).
   - Documenti influenzati: Core Rules, Glossary, Lore Bible, Acceptance Test Plan.
   - Prima di CT_CORE_RULES.md: **sì**.
4. **Numero di giocatori e direzione PvP/PvE della modalità principale.**
   - Motivo: cambia la struttura del controllo territoriale (004).
   - Documenti influenzati: Core Rules, Prototype Scope, Technical Architecture, User Flows, Roadmap.
   - Prima di CT_CORE_RULES.md: **sì**.
5. **Principio informativo**: informazione pubblica/nascosta e forma ammessa della casualità.
   - Motivo: risolve la tensione orrore/leggibilità (011).
   - Documenti influenzati: Core Rules, Art Direction, User Flows.
   - Prima di CT_CORE_RULES.md: **sì**.
6. **Principio di contrappeso allo snowball.**
   - Motivo: rischio principale dei giochi territoriali (008).
   - Documenti influenzati: Core Rules, Balance.
   - Prima di CT_CORE_RULES.md: **sì** (almeno come principio).
7. **Stato dei pilastri e marcatore di decisione** (DECISO / decision log).
   - Motivo: distinguere proposta e decisione (006).
   - Documenti influenzati: tutti.
   - Prima di CT_CORE_RULES.md: **sì**.
8. **Livello di asimmetria delle fazioni** per prototipo e prodotto; numero di fazioni.
   - Motivo: sostenibilità del bilanciamento (015).
   - Documenti influenzati: Core Rules, Lore Bible, Prototype Scope.
   - Prima di CT_CORE_RULES.md: **sì** per il livello di asimmetria; il numero per il prodotto può attendere.
9. **Fascia di durata della partita.**
   - Motivo: vincola territori, complessità e piattaforma (022).
   - Documenti influenzati: Core Rules, Prototype Scope, piattaforma.
   - Prima di CT_CORE_RULES.md: **sì** (indicativa).
10. **Espandibilità: requisito di prodotto o opzione da preservare**; collocazione del Pilastro 6.
    - Motivo: assunzione implicita sul modello di prodotto (010, 014).
    - Documenti influenzati: Technical Architecture, Roadmap, economia.
    - Prima di CT_CORE_RULES.md: no.
11. **Relazione con i pilastri 2 e 4** (unire, restringere, mantenere) e riformulazione del test di P4.
    - Motivo: evitare valutazioni ridondanti (012, 013).
    - Documenti influenzati: Acceptance Test Plan, Lore Bible.
    - Prima di CT_CORE_RULES.md: preferibile.
12. **Analisi competitiva e unique selling point.**
    - Motivo: verificare la differenziazione (007).
    - Documenti influenzati: Core Rules, posizionamento.
    - Prima di CT_CORE_RULES.md: preferibile, può procedere in parallelo alle decisioni 1–4 ma dovrebbe informarle.
13. **Criteri di riuscita/fallimento del prototipo** e metodo di raccolta delle metriche.
    - Motivo: validazione del concept (009, 021).
    - Documenti influenzati: Prototype Scope, Acceptance Test Plan.
    - Prima di CT_CORE_RULES.md: no; prima di CT_PROTOTYPE_SCOPE.md sì.
14. **Prototipo cartaceo o digitale; necessità di un avversario AI.**
    - Motivo: effort e affidabilità dei test (020, 029).
    - Documenti influenzati: Prototype Scope, Technical Architecture, Roadmap.
    - Prima di CT_CORE_RULES.md: no.
15. **Piattaforma iniziale, conferma di "digital-first" e del motore Godot.**
    - Motivo: assunzioni implicite (019).
    - Documenti influenzati: Technical Architecture, User Flows, Roadmap.
    - Prima di CT_CORE_RULES.md: no.
16. **Politica sugli elementi lovecraftiani**: responsabile della verifica, formato del registro di provenienza, terminologia core originale o di genere.
    - Motivo: rischio di dipendenza da terzi (017, 018).
    - Documenti influenzati: Lore Bible, Glossary, Card Database, Art Direction.
    - Prima di CT_CORE_RULES.md: no, ma prima del Glossary e del Lore Bible sì.
17. **Documento autorevole per lo scope del prototipo** (Prototype Scope o Roadmap).
    - Motivo: conflitto di destinazione (016).
    - Documenti influenzati: Prototype Scope, Roadmap.
    - Prima di CT_CORE_RULES.md: no.
18. **Redazione o sospensione del Protocollo Copilot–Claude.**
    - Motivo: documento obbligatorio vuoto (005).
    - Documenti influenzati: tutti i task.
    - Prima di CT_CORE_RULES.md: no per la scrittura, sì prima di assegnare task di implementazione.
19. **Esistenza di una forza cosmica autonoma sulla mappa** e significato dei tre verbi del high concept.
    - Motivo: componenti potenziali del core loop (030, 031).
    - Documenti influenzati: Core Rules, Lore Bible.
    - Prima di CT_CORE_RULES.md: **sì** per la forza autonoma; i verbi possono essere chiariti in parallelo.
20. **Modello di monetizzazione da approfondire** (già in §17).
    - Motivo: vincolo anti pay-to-win e modello a espansioni.
    - Documenti influenzati: economia, Technical Architecture, Roadmap.
    - Prima di CT_CORE_RULES.md: no, purché la decisione 1 sia presa.

## 6. Mappa delle dipendenze

| Decisione della Vision | CORE_RULES | LORE_BIBLE | MECHANICS_GLOSSARY | PROTOTYPE_SCOPE | TECHNICAL_ARCHITECTURE | USER_FLOWS | ROADMAP | ACCEPTANCE_TEST_PLAN |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| 1. Tipo di deckbuilding | ● | | ● | ● | ● | ● | ● | ○ |
| 2. Territorio e vittoria | ● | ○ | ● | ● | ○ | ● | | ● |
| 3. Potere-conseguenze | ● | ● | ● | ● | ○ | ○ | | ● |
| 4. Giocatori / PvP-PvE | ● | | | ● | ● | ● | ● | ○ |
| 5. Principio informativo | ● | | ○ | | ○ | ● | | ● |
| 6. Contrappeso snowball | ● | | | | | | | ● |
| 7. Stato pilastri / decision log | ● | ● | ● | ● | ● | ● | ● | ● |
| 8. Asimmetria fazioni | ● | ● | ○ | ● | ○ | | ○ | ● |
| 9. Durata partita | ● | | | ● | | ● | | ○ |
| 10. Espandibilità / P6 | | ○ | ● | | ● | | ● | |
| 11. Pilastri 2 e 4 | ○ | ● | | | | | | ● |
| 12. Analisi competitiva | ● | | | ○ | | | ○ | |
| 13. Criteri del prototipo | | | | ● | | | ● | ● |
| 14. Cartaceo/digitale, AI | | | | ● | ● | | ● | ○ |
| 15. Piattaforma, Godot | | | | ○ | ● | ● | ● | |
| 16. Politica lovecraftiana | ○ | ● | ● | | | | | |
| 17. Documento scope prototipo | | | | ● | | | ● | |
| 18. Protocollo Copilot–Claude | | | | | ○ | | ○ | ● |
| 19. Forza cosmica autonoma | ● | ● | ○ | ○ | ○ | | | |
| 20. Monetizzazione | ○ | | | ○ | ● | ○ | ● | |

Legenda: ● dipendenza diretta / bloccante; ○ dipendenza indiretta.

## 7. Raccomandazioni per la versione 0.2

| # | Sezione interessata | Obiettivo | Priorità | Decisione necessaria | Risultato atteso |
|---|---|---|---|---|---|
| 1 | §2 | Introdurre un terzo marcatore per le decisioni prese, collegato al decision log | Alta | Dec. 7 | Ogni sezione ha uno stato esplicito |
| 2 | §3, §5.1 | Dichiarare il tipo di deckbuilding | Alta | Dec. 1 | Genere univoco |
| 3 | §3, §6 P1 | Dichiarare la relazione territorio-vittoria ed eventuale sistema di danni | Alta | Dec. 2 | Test P1 applicabile |
| 4 | §6 P2 | Indicare il concetto portante del sistema di conseguenze (non le regole) | Alta | Dec. 3 | P2 verificabile e non riducibile a contatore |
| 5 | §4, §12, §17 | Aggiungere numero di giocatori e modalità principale | Alta | Dec. 4 | Contesto del core loop fissato |
| 6 | §4 o nuovo principio | Formulare un principio informativo (pubblico/nascosto/casualità) | Alta | Dec. 5 | Compromesso orrore/leggibilità esplicito |
| 7 | §6 o §16 | Collegare il rischio snowball a un principio di contrappeso | Alta | Dec. 6 | Rischio §16.2 mitigato a livello di visione |
| 8 | §5.2, §10 | Aggiungere confronto con i concorrenti più vicini e un USP verificabile | Alta | Dec. 12 | Differenziazione dimostrabile |
| 9 | §6 P2, P4 | Ridurre la sovrapposizione e riformulare il test di P4 | Media | Dec. 11 | Pilastri non ridondanti |
| 10 | §6 P6 | Riposizionare P6 o restringerlo a "non precludere" | Media | Dec. 10 | Pilastri tutti player-facing |
| 11 | §6 P3 | Specificare livello di asimmetria e template minimo di fazione | Media | Dec. 8 | Fazioni progettabili e bilanciabili |
| 12 | §7 | Aggiungere fascia di durata; dividere gli aspetti aperti in "Vision" e "Core Rules" | Media | Dec. 9 | Confine Vision/Core Rules netto |
| 13 | §13, §15 | Aggiungere criteri di falsificazione per pilastro e fonte dati per le metriche | Media | Dec. 13 | Prototipo valutabile |
| 14 | §13 | Chiarire hotseat/AI e cartaceo/digitale | Media | Dec. 14 | Effort prototipo stimabile |
| 15 | §5.1, §11 | Allineare "digital-first" e registrare l'eventuale scelta di Godot | Media | Dec. 15 | Nessuna decisione implicita |
| 16 | §8.3 | Definire responsabile e formato del registro di provenienza | Media | Dec. 16 | Rischio §16.7 governato |
| 17 | §13, §18 | Indicare il documento autorevole per lo scope del prototipo | Bassa | Dec. 17 | Nessuna duplicazione |
| 18 | §14 | Allineare istruzioni di lettura al Master Index | Bassa | Nessuna | Istruzioni coerenti |
| 19 | front matter, §8.1 | Correggere percorso related_documents e riferimento a `reference/` | Bassa | Nessuna | Link validi |
| 20 | §3 | Chiarire se i tre verbi del high concept sono archetipi | Bassa | Dec. 19 | High concept non ambiguo |

## 8. Gate per l'approvazione

### DRAFT → REVIEW

- [ ] Tutte le decisioni con "Prima di CT_CORE_RULES.md: sì" (§5: 1–9, 19) sono prese e registrate nel decision log con ID.
- [ ] Ogni sezione della Vision ha uno stato esplicito (PROPOSTA / DA DECIDERE / DECISO).
- [ ] Nessun BLOCKER di questo report rimane aperto.
- [ ] Ogni HIGH è risolto oppure accettato esplicitamente con motivazione nel decision log.
- [ ] Ogni pilastro ha un test di verifica non ambiguo.
- [ ] Le istruzioni contrastanti segnalate (005, 016, 026) sono risolte.
- [ ] I link e i riferimenti interni sono validi (023, 024).
- [ ] La checklist §17 della Vision è aggiornata e coerente con questo gate.

### REVIEW → APPROVED

- [ ] Review umana del Team Cosmic Territory completata e registrata.
- [ ] Analisi competitiva documentata disponibile e citata nel posizionamento.
- [ ] Nessuna sezione DA DECIDERE che sia prerequisito di `CT_CORE_RULES.md`.
- [ ] Criteri di falsificazione dei pilastri definiti o assegnati esplicitamente a un documento successivo con owner.
- [ ] Politica di uso degli elementi lovecraftiani approvata, con responsabile della verifica.
- [ ] Protocollo Copilot–Claude redatto oppure formalmente sospeso.
- [ ] Nessun MEDIUM aperto senza owner e documento di destinazione.
- [ ] Changelog della Vision aggiornato con versione e stato.

## 9. Conclusione

- **Possiamo iniziare `CT_CORE_RULES.md`?** No, non in forma di specifica. Senza le decisioni 1–4 le regole verrebbero decise da chi scrive il documento, contro §1 della Vision e il Master Index.
- **Decisioni da chiudere prima:** tipo di deckbuilding; relazione territorio-vittoria; concetto del sistema potere-conseguenze; numero di giocatori e modalità principale; principio informativo; principio di contrappeso allo snowball; livello di asimmetria; fascia di durata; presenza di una forza cosmica autonoma; marcatore di decisione e avvio del decision log.
- **Attività parallele senza rischio di rework:**
  - analisi competitiva documentata (informa le decisioni 1–4);
  - redazione del Protocollo Copilot–Claude;
  - creazione del registro di provenienza lovecraftiano e verifica degli elementi candidati;
  - correzioni editoriali LOW (link, riferimenti, README);
  - definizione del template di fazione (solo struttura, non contenuto);
  - esplorazione di tono e direzione artistica non vincolante, purché non fissi nomi, creature o fazioni;
  - impostazione del metodo di playtest (strumenti, questionari) indipendente dalle regole.
