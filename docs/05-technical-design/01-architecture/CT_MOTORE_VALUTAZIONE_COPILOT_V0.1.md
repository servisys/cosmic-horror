---
title: Cosmic Horror - Valutazione indipendente del motore di gioco (Copilot)
status: DRAFT
version: 0.1.0
owner: Team Cosmic Horror
prepared_by: Copilot
project_prefix: CT_
related_documents:
  - ../../00-project-overview/03-decisions-changelog/CT_DECISIONI_V0.4_ESITO_TECNICO.md
  - ../../00-project-overview/03-decisions-changelog/CT_DECISION_LOG_VOCI_PROPOSTE_V0.4.md
  - CT_MOTORE_VALUTAZIONE_CLAUDE_V0.1.md
---

# Cosmic Horror - Valutazione indipendente del motore di gioco (Copilot)

> **PROPOSTA TECNICA DI COPILOT, DA CONFERMARE DA MATTEO**
>
> Questo documento è una valutazione tecnica indipendente relativa a CT-DES-014. Non è una decisione, non registra CT-DES-014 e non autorizza implementazione.

## 1. Criteri utilizzati nel Passo 1

La valutazione indipendente è stata formulata usando soltanto questi criteri espressi da Matteo:

- esperienza visiva 2D con elementi 3D significativi;
- progetto semplice e controllabile mentre Claude lavora direttamente sul codice;
- PC e mobile/tablet fin dal primo prototipo;
- interfacce PC e mobile anche molto diverse, con le stesse regole;
- impostazione digital-first;
- forza cosmica automatizzata fin dal primo prototipo;
- prototipo utilizzabile da una persona sola;
- partite normali da 10-15 minuti;
- motore non ancora deciso.

## 2. Valutazione indipendente delle alternative

### 2.1 Godot 4

#### Vantaggi

- È un motore completo e relativamente compatto, adatto a combinare interfaccia 2D, carte, animazioni ed elementi 3D.
- Scene e script possono essere mantenuti in formati testuali, favorevoli a Git, review e modifiche operate da un agente sul repository.
- GDScript è conciso e consente di mantenere relativamente vicini logica, test e prototipo.
- È open source e non richiede di accettare un modello commerciale del motore.
- Il repository era già stato predisposto pensando a Godot, quindi l'organizzazione documentale e di sviluppo non richiederebbe un cambio concettuale.

#### Rischi

- Claude deve saper gestire correttamente scene, risorse, segnali e ciclo di vita del motore, non soltanto scrivere script.
- Per verificare il risultato visivo servono build, cattura schermo o test end-to-end configurati appositamente; il solo codice non garantisce che UI e scene siano corrette.
- PC e mobile richiedono comunque layout adattivi, input differenti e test reali sui dispositivi.
- Se si scegliesse Godot con C#, occorre verificare attentamente la matrice di export desiderata; per il web, la documentazione Godot indica che i progetti Godot 4 in C# non possono attualmente essere esportati sul web.

#### Adattamento a Cosmic Horror

Buono per un prodotto principalmente 2D con elementi 3D, packaging nativo e repository controllabile. È una scelta equilibrata se si vuole un vero motore di gioco fin dal prototipo.

### 2.2 Unity

#### Vantaggi

- È un motore completo per 2D e 3D con un ecosistema ampio.
- C# è un linguaggio diffuso e adatto a separare la logica delle regole dalla presentazione.
- PC e mobile sono target centrali dell'ecosistema.
- Può sostenere una crescita futura verso animazioni, effetti e 3D più ricchi.

#### Rischi

- Il progetto può diventare più articolato del necessario per un card game territoriale.
- Scene, prefab, import settings, file meta e configurazioni aumentano la superficie che Claude deve modificare senza introdurre regressioni.
- Il vantaggio dell'ecosistema ampio conta meno se il prototipo usa pochi asset e funzionalità mirate.
- Licenze, condizioni e costi correnti dovrebbero essere verificati prima di impegnare il progetto.

#### Adattamento a Cosmic Horror

Tecnicamente valido, ma meno semplice e meno controllabile di Godot per il prototipo descritto, salvo disponibilità di competenze o componenti Unity già riutilizzabili.

### 2.3 Unreal Engine

#### Vantaggi

- Capacità molto elevate per 3D, rendering, effetti e pipeline artistiche complesse.
- Adatto se gli elementi 3D diventano il centro dell'esperienza invece di un supporto alla plancia e alle carte.

#### Rischi

- La complessità generale è elevata rispetto a un gioco a carte 2D con componenti 3D.
- Blueprint e asset binari possono ridurre la leggibilità e la modificabilità del progetto da parte di Claude.
- Build, editor, progetto e pipeline sono più pesanti.
- Licenze e soglie economiche correnti richiedono verifica prima della scelta.

#### Adattamento a Cosmic Horror

Non lo sceglierei per il primo prototipo con i criteri attuali. Lo rivaluterei soltanto se Cosmic Horror diventasse un'esperienza 3D sostanziale con forte dipendenza da rendering e ambienti in tempo reale.

### 2.4 Stack web TypeScript

Esempio di famiglia tecnica: TypeScript per le regole e l'applicazione; rendering 2D con PixiJS o Phaser; Three.js per elementi 3D mirati; eventuale packaging mobile successivo.

#### Vantaggi

- Codice, dati e configurazioni possono restare prevalentemente testuali e facilmente modificabili da Claude.
- Le regole possono vivere in moduli indipendenti dalla grafica, semplificando test automatici e simulazioni.
- Il prototipo può essere eseguito su PC e dispositivi mobili tramite browser senza richiedere subito un'app installata.
- Debug, test dell'interfaccia e screenshot possono essere automatizzati con strumenti browser.
- È adatto a un'esperienza a schermate, carte, territori ed effetti controllati.

#### Rischi

- Non è un unico motore: richiede scegliere e integrare librerie, rendering, audio, input, packaging e pipeline.
- Il supporto mobile tramite browser non equivale automaticamente a un'app nativa; prestazioni, sospensione, memoria e UX vanno provate su dispositivi reali.
- Elementi 3D significativi possono aumentare rapidamente complessità e carico grafico.
- Il team deve governare più decisioni architetturali rispetto a un motore integrato.

#### Adattamento a Cosmic Horror

Molto buono per validare rapidamente regole, UI adattiva, automazione cosmica e partite su PC/mobile. Meno sicuro come scelta definitiva se il 3D diventa centrale o se si vuole da subito una pipeline nativa integrata.

### 2.5 Altro pertinente: Flutter + Flame

#### Vantaggi

- Forte orientamento multipiattaforma e interfacce adattive.
- Può gestire bene applicazioni con molte schermate, pannelli e componenti UI.

#### Rischi

- Per un gioco con rendering ed elementi 3D significativi aggiunge decisioni e integrazioni meno naturali rispetto a un motore di gioco o a uno stack web dedicato.
- Non vedo, con i criteri disponibili, un vantaggio sufficiente rispetto a Godot o TypeScript web.

#### Adattamento a Cosmic Horror

Alternativa possibile, ma non la includerei nella shortlist finale senza una competenza Flutter già disponibile e una direzione 3D molto limitata.

## 3. Mia scelta indipendente

> **PROPOSTA TECNICA DI COPILOT, DA CONFERMARE DA MATTEO:** scegliere **Godot 4 con GDScript** come motore di riferimento del primo prototipo.

### Perché

1. Rispetta la richiesta di un progetto semplice e controllabile meglio di Unity e Unreal.
2. Combina in un unico ambiente UI 2D, animazioni ed elementi 3D significativi.
3. Produce un prototipo nativo per PC e mobile senza introdurre immediatamente un'architettura composta da più librerie.
4. Scene, risorse e script possono essere mantenuti nel repository e sottoposti a review.
5. Per il prodotto descritto, il vantaggio di un motore integrato pesa più della comodità di test browser offerta dallo stack web.

### Come imposterei il vincolo, senza definire l'architettura

La scelta del motore non dovrebbe impedire di separare la logica delle regole dalla presentazione. La validazione tecnica dovrebbe dimostrare che Claude riesce a:

- modificare scene e script senza danneggiare il progetto;
- eseguire test della logica senza dipendere dalla grafica;
- produrre build verificabili su PC e almeno un target mobile;
- mantenere UI leggibile con layout differenti.

Questi sono criteri di prova, non regole di gioco né architettura approvata.

## 4. Quando cambierei scelta

Cambierei da Godot a **TypeScript web** se una prova comparativa mostrasse che:

- il prototipo è quasi interamente UI 2D e gli elementi 3D sono decorativi;
- la priorità dominante è distribuire test tramite link e automatizzare screenshot/simulazioni nel browser;
- Claude produce e verifica modifiche molto più affidabili nello stack web;
- il packaging nativo può essere rinviato senza compromettere il test PC/mobile.

Cambierei da Godot a **Unity** se:

- emergessero asset, plugin o competenze Unity già disponibili e realmente determinanti;
- il 3D diventasse più importante;
- la pipeline C# e l'ecosistema Unity riducessero concretamente il rischio rispetto a Godot.

Cambierei da Godot a **Unreal Engine** soltanto se:

- il progetto diventasse principalmente 3D in tempo reale;
- resa visiva e ambienti complessi diventassero requisiti centrali del prodotto.

## 5. Cosa non so e va verificato

- Quanto siano realmente «significativi» gli elementi 3D: decorazioni, plancia 3D, creature animate o ambienti in tempo reale portano a scelte diverse.
- Se Claude, nel vostro ambiente operativo, lavori con maggiore affidabilità su Godot/GDScript o sullo stack TypeScript proposto da Claude.
- Quali dispositivi mobili minimi debbano essere supportati.
- Se il primo prototipo debba essere installabile oppure possa essere eseguito dal browser.
- Quale sia il significato pratico di «D» nel formato del prototipo.
- Se serva già un avversario automatico semplice oppure soltanto un simulatore/test harness per una persona sola.
- Pipeline, costi e condizioni di licenza correnti di Unity e Unreal, da verificare sui siti ufficiali prima di qualsiasi impegno.
- Prestazioni reali di Godot e dello stack web sui dispositivi target, da misurare con una fetta verticale equivalente.

## 6. Prova minima prima della conferma di Matteo

La decisione finale potrebbe essere supportata da due micro-prototipi equivalenti, uno in Godot 4/GDScript e uno nello stack TypeScript web, contenenti soltanto:

- un territorio;
- una carta giocabile;
- un indicatore/stato territoriale;
- un evento cosmico automatico;
- una schermata adattata a PC e telefono;
- un test automatico della logica.

Il confronto dovrebbe verificare:

- facilità con cui Claude modifica il progetto;
- leggibilità e stabilità del repository;
- capacità di testare la logica;
- verifica visiva automatizzabile;
- comportamento su PC e mobile;
- costo operativo della build.

Non è una richiesta di implementazione: è il criterio che userei prima di registrare CT-DES-014.

## 7. Confronto con la valutazione di Claude

Dopo aver formulato la scelta indipendente, ho letto `CT_MOTORE_VALUTAZIONE_CLAUDE_V0.1.md`.

### Dove concordo

- Concordo nell'escludere Unreal per il primo prototipo: la sua potenza non compensa la complessità nel caso attuale.
- Concordo che Unity sia tecnicamente valido ma più pesante del necessario, salvo vantaggi concreti già disponibili.
- Concordo che il cuore del gioco debba essere separabile dalla grafica e testabile automaticamente.
- Concordo che TypeScript web sia particolarmente favorevole a test, simulazioni, screenshot e distribuzione tramite browser.
- Concordo che Godot sia la seconda opzione forte e che diventi più interessante quando il 3D o la pipeline nativa acquistano peso.
- Concordo sul fatto che il significato di «elementi 3D significativi» sia una delle incognite decisive.

### Dove non concordo

Non concordo con Claude nel rendere **TypeScript + PixiJS/Phaser + Three.js** la scelta immediata del motore di riferimento.

La mia ragione è che quella proposta ottimizza soprattutto il lavoro dell'agente e la facilità di test nel browser, ma introduce una composizione tecnologica da governare: framework/rendering 2D, eventuale 3D, packaging mobile e discipline proprie di un'app web. Per un progetto che dichiara fin dall'inizio PC e mobile e richiede elementi 3D significativi, preferisco iniziare da un motore integrato e verificare se il suo costo operativo è davvero problematico.

Non considero inoltre dimostrato, senza una prova sul repository, che Claude lavori meglio in TypeScript abbastanza da compensare il vantaggio di un motore integrato. La valutazione di Claude lo afferma come criterio centrale, ma il suo stesso documento dichiara di non aver ancora provato i due percorsi sul progetto.

### Sintesi del confronto

- **Claude:** prima scelta stack web TypeScript; Godot alternativa.
- **Copilot:** prima scelta Godot 4/GDScript; stack web TypeScript alternativa.
- **Punto comune:** Unity e Unreal non sono le scelte preferite; la logica deve essere separabile e testabile; occorre una prova verticale.
- **Vero punto decisionale:** motore integrato e pipeline nativa contro codice web più facile da automatizzare e distribuire.

## 8. Proposta a Matteo

> **PROPOSTA TECNICA DI COPILOT, DA CONFERMARE DA MATTEO:** non registrare ancora CT-DES-014. Mettere in shortlist **Godot 4/GDScript** e **TypeScript web**, quindi scegliere dopo una prova equivalente e verificabile.

Se Matteo richiede comunque una scelta senza prova, la mia scelta resta **Godot 4/GDScript**.

---

## Fonti consultate

- `CT_DECISIONI_V0.4_ESITO_TECNICO.md`, copia SharePoint, per i criteri espressi da Matteo.
- `CT_MOTORE_VALUTAZIONE_CLAUDE_V0.1.md`, letta soltanto dopo aver formulato la valutazione indipendente.
- Documentazione Godot sull'export web: Godot 4 esporta sul web tramite WebAssembly/WebGL 2.0; i progetti Godot 4 in C# non possono attualmente essere esportati sul web.
