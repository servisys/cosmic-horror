---
title: CT-TECH-001 - Registro di approvazione e pre-flight plan
status: DRAFT
version: 0.1.0
owner: Team Cosmic Horror
prepared_by: Claude
last_reviewed: 2026-10-29
related_documents:
  - CT_TECH_001_PROVA_MOTORE_V0.2.md
  - CT_MOTORE_VALUTAZIONE_CLAUDE_V0.1.md
  - CT_MOTORE_VALUTAZIONE_COPILOT_V0.1.md
implementation_authorized: false
---

# CT-TECH-001 - Registro di approvazione e pre-flight plan

> **Nessuna implementazione è iniziata.** Questo documento è il pre-flight plan richiesto dalla specifica (Output 1). L'implementazione parte solo dopo il via esplicito di Matteo a questo piano.

## 1. Approvazione registrata

Risposte di Matteo, testuali, del 2026-10-29 alla richiesta di avvio:

| Punto | Risposta di Matteo |
|---|---|
| 1. Approvazione della specifica `CT_TECH_001_PROVA_MOTORE_V0.2.md` | «approvo» |
| 2. Ambiente di esecuzione | «ok per il claud di Claude» |
| 3. Avversario automatico nella prova | «ok» |
| 4. Significato di «D» (formato del prototipo) | «contro il computer» |

Interpretazione di Claude (**da confermare da Matteo**):
- **1.** La specifica è approvata da Matteo; la specifica stessa subordina l'avvio a un'autorizzazione esplicita se `CT-DES-011…013` non sono ancora registrate, e questa risposta è presa come tale.
- **2.** Ambiente: **cloud di Claude**.
- **3.** «ok» è letto come adesione alla proposta fatta: **nessun avversario automatico nella prova**, ma una sequenza deterministica (test harness) che prova carta, territorio ed evento cosmico.
- **4.** «contro il computer» riguarda il prototipo del gioco, non questa prova: una persona contro un avversario controllato dal gioco (opzione C di CT-DES-011). Richiede un aggiornamento del Decision Log, non un cambiamento della prova.

## 2. Ambiente (verificato oggi, solo in lettura, senza installare nulla)

| Elemento | Esito |
|---|---|
| Node.js / npm | v22.22.0 / 10.9.4 |
| Registro npm | raggiungibile |
| Python, Git, Java | presenti (Python 3.13, Git 2.43) |
| Browser per i test (Playwright, Chromium) | presenti |
| Schermo virtuale (Xvfb) | presente |
| Godot | **assente** |
| Android SDK / adb | **assenti** |
| Scheda grafica (GPU) | assente: rendering software |
| Risorse | 4 CPU, 15 GB RAM, circa 30 GB di disco libero |
| Download Godot | `github.com/godotengine/godot/releases` risponde **403**; l'host ufficiale `downloads.tuxfamily.org` risponde 200. Il download vero non è stato provato (la specifica vieta di prepararlo prima dell'approvazione del piano). |

**Conseguenze:**
- **Web:** fattibile nel cloud senza altro.
- **Godot:** fattibile solo se il download dall'host ufficiale funziona e se il rendering in software gira. Se uno dei due non va, lo dichiaro come **blocker** e ti chiedo come procedere (per esempio installazione sul Mac tramite l'amministratore). Non cerco scorciatoie.
- **Android e iOS nativi non sono costruibili nel cloud** (niente Android SDK; iOS richiede il Mac). Per il telefono, in entrambi i percorsi proverei la versione che gira nel **browser** (Godot esportato per il web, TypeScript nativamente web). Il percorso nativo di Godot verrebbe misurato più avanti sul Mac, come passo separato. Il report dovrà dichiarare questa differenza in C4.

## 3. Struttura delle due prove

- **Un solo branch** `feature/CT-TECH-001-prova-motore`, con due cartelle separate: `game/prove/ct-tech-001/godot/` e `game/prove/ct-tech-001/web/`, più la cartella `report/` con i log e il report. La logica di ciascuna prova sta in un modulo separato dalla grafica.
- **Fixture condivisa (non conta nel timebox):** prima dei due percorsi scrivo un file di dati di prova neutro (`fixture.json`: un territorio, una carta, uno stato, un evento cosmico, sequenza deterministica con valori finti etichettati «fixture tecnica non di design»). Entrambi i test la leggono. Serve a evitare che il primo percorso «inventi» la logica e il secondo la copi.
- **Web:** TypeScript, Vite per la build, Vitest per i test, **PixiJS** come unico renderer 2D. three.js solo se decidi di includere l'elemento 3D (punto 6).
- **Godot:** Godot 4.x stabile, GDScript, **nessun plugin**: i test della logica sono script lanciati da riga di comando senza interfaccia grafica.
- **Modifica comparativa (definita ora, per non scegliere dopo quella più comoda):** «aggiungere un secondo stato al territorio e mostrarlo a schermo e nel test». Non è una regola di gioco ma una modifica di fixture.
- **Ordine:** fixture → web → Godot (o il contrario, sorteggiato e dichiarato nel log); le attese di rete o di amministrazione sono tempi di pausa, non lavoro.

## 4. Misurazione

- **Log di sessione** per ogni percorso (`report/LOG_SESSIONI_web.md`, `report/LOG_SESSIONI_godot.md`): inizio e fine in ISO 8601, durata, attività, commit iniziale e finale, totale cumulativo. Il tempo di attesa di Matteo e quello di attese esterne è registrato come pausa e non conta.
- **Limite:** 4 ore registrate per percorso. Se non basta, si documenta cosa manca.
- **C1:** conteggi di tentativi, interventi correttivi, file toccati, errori di build/test/runtime, regressioni, passaggi manuali nell'editor, file non revisionabili come testo.
- **C2:** tempo dell'intera suite, esito pass/fail, passi per modificare la fixture e rilanciare.
- **C3:** web, screenshot automatici con Playwright in due formati (PC 1280×800, telefono 390×844). Godot: cattura con Xvfb e rendering software; se non funziona, scrivo «C3 non misurabile nell'ambiente scelto» e allego l'eventuale evidenza manuale.
- **C4:** avvio PC (browser), formato telefono emulato dichiarato come tale, e prova sul telefono reale con il tuo aiuto (sezione 5).
- **C5:** numero di comandi, tempo di build, dimensione dell'artefatto, dipendenze, passaggi manuali o privilegi amministrativi.
- **Punteggi:** raccolgo le evidenze; il punteggio lo assegnate **tu e Copilot** dopo la revisione (come da specifica); io non assegno voti.

## 5. Test sul telefono reale (serve la tua collaborazione)

1. Mi dici **modello e sistema operativo** del telefono.
2. Io pubblico le due versioni provabili nel browser come **pagine private** (Artifact di Claude) e ti do i link. *Passo con effetto verso l'esterno: lo faccio solo con il tuo via libera esplicito.*
3. Tu apri ciascun link sul telefono, giochi la sequenza di prova (una carta, poi attendi l'evento), fai uno screenshot della schermata e mi scrivi se i quattro elementi (territorio, carta, stato, evento) sono leggibili e se qualcosa non risponde.
4. Dichiaro nel report che per Godot è la versione web, non l'app nativa.

## 6. Cose da decidere o confermare prima di partire

1. **Conferma delle interpretazioni** dei punti 3 e 4 della sezione 1.
2. **Elemento 3D:** la specifica non richiede un elemento 3D, ma l'incognita decisiva della scelta è proprio quanto conta il 3D. Aggiungo alla fetta un **unico elemento 3D minimo** (per esempio un oggetto che ruota nella scheda del territorio) in entrambi i percorsi? Raccomando di sì: senza, la prova non misura la domanda più importante. Se sì, per il web serve three.js.
3. **Telefono:** per Godot accetti di provare la versione web (e il nativo più avanti sul Mac)?
4. **Download di Godot** dall'host ufficiale nel cloud, e **pubblicazione dei link privati** per il telefono: via libera.
5. **Registro delle decisioni:** il punto 4 della sezione 1 richiede un aggiornamento di CT-DES-011 (prototipo contro un avversario automatico). Lo prepara Copilot; non lo faccio io.

## 7. Cosa non farò

Non scelgo il motore; non registro CT-DES-014; non tocco documenti di design; non installo nulla sul Mac; non uso il Mac; non pubblico nulla senza il tuo via libera; non assegno punteggi.

## 8. Via libera richiesto

> Matteo: confermi questo piano? (con le risposte ai punti 1-5 della sezione 6)
