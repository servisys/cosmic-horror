---
title: Cosmic Horror - Regole base (Core Rules)
status: DRAFT
version: 0.3.0
owner: Matteo
prepared_by: Cowork
project_prefix: CT_
last_reviewed: 2026-10-31
related_documents:
  - ../../00-project-overview/01-vision-concept/
  - ../../00-project-overview/03-decisions-changelog/
---

# Cosmic Horror - Regole base (Core Rules)

> **BOZZA IN COSTRUZIONE, PREPARATA DA COWORK.** Le scelte marcate «DECISIONE DI MATTEO» sono registrate nel Decision Log. Tutto il resto è **DA DECIDERE** e non autorizza implementazione. I numeri, quando ci sono, sono **provvisori** e vanno tarati nei playtest. Questo documento resta `DRAFT` finché tutte le sezioni non sono decise.

## 0. Riferimenti già decisi

| Tema | Decisione |
|---|---|
| Modalità | 1 contro 1 con forza cosmica (CT-DES-004); nel prototipo una persona contro il computer (CT-DES-011) |
| Mazzo | mazzo quasi completo, più fonti di adattamento, parte importante trasformabile (CT-DES-001) |
| Vittoria | interazione con i territori, obiettivi diversi per fazione, vittoria immediata (CT-DES-002); turno di avviso garantito (CT-DES-015) |
| Rischio | esposizione, costi e instabilità come un unico rischio cosmico (CT-DES-003); niente aiuti artificiali a chi è indietro (CT-DES-006) |
| Informazione | rischio visibile quando sale o sta per succedere qualcosa; pochi eventi senza preavviso (CT-DES-005) |
| Fazioni | molto diverse, turno e mazzo comuni, 2 fazioni da 40 carte nel prototipo (CT-DES-008) |
| Durata | 10-15 minuti; territori più instabili nelle partite lunghe (CT-DES-009) |
| Forza cosmica | autonoma, pressione graduale, colpisce di più chi è più esposto (CT-DES-010) |
| Avversario | regole fisse con priorità per fazione, non bara (CT-DES-016) |
| Tecnica | dati in file di testo (CT-DES-018); mosse registrate e casualità con seme (CT-DES-019) |

## 1. Com'è fatta una partita

1. **Preparazione:** si dispongono i territori, ogni giocatore prende il mazzo della propria fazione, mescola e pesca la mano iniziale.
2. **Giri:** in ogni giro gioca prima un giocatore e poi l'altro.
3. **Forza cosmica:** alla fine di ogni giro, dopo che hanno giocato entrambi, agisce la forza cosmica.
   **DECISIONE DI MATTEO (CT-DES-021, REGISTRATA):** la forza cosmica agisce alla fine di ogni giro.
4. **Fine:** la partita termina quando un giocatore completa il proprio obiettivo, dopo il turno di avviso (§8).

**Numero provvisorio (§5):** si sorteggia chi gioca per primo; il secondo giocatore pesca 1 carta in più nella mano iniziale.

## 2. Il campo

**DECISIONE DI MATTEO (CT-DES-022, REGISTRATA):** nel prototipo il campo ha **3 territori**.

**DECISIONE DI MATTEO (CT-DES-023, REGISTRATA):** controlla un territorio chi vi ha **più forza**, cioè la somma della forza delle proprie carte presenti lì.

**DECISIONE DI MATTEO (CT-DES-024, REGISTRATA):** esistono carte **presenza**, che restano sul territorio finché non vengono eliminate. Le altre carte fanno il loro effetto e vanno negli scarti.

Ogni territorio ha:
- un nome e un effetto proprio;
- un livello di **instabilità** (§6);
- eventuali stati di fazione (CT-DES-002: più stati possono coesistere).

**DA DECIDERE:** gli effetti dei territori; quante presenze possono stare su un territorio; cosa succede in caso di parità di forza; se i territori cambiano da una partita all'altra.

## 3. Il mazzo

**DECISIONE DI MATTEO (CT-DES-025, REGISTRATA):** nel prototipo ogni fazione ha un **mazzo già pronto da 40 carte**. La costruzione del mazzo (CT-DES-001) arriva dopo il prototipo.

**DECISIONE DI MATTEO (CT-DES-026, REGISTRATA):** durante la partita il mazzo cambia in due modi, in piccolo nel prototipo:
- alcune carte si **trasformano** in una versione cosmica quando il rischio del giocatore sale;
- **controllare un territorio** fa guadagnare carte nuove.

**Numeri provvisori (§5):** mano iniziale, pesca, trasformazioni e carte guadagnate dai territori.

**DECISIONE DI MATTEO (CT-DES-042, REGISTRATA):** se il mazzo finisce, si rimescolano gli scarti per formare un nuovo mazzo e l'esposizione del giocatore sale di 1.

## 4. Il turno

**DECISIONE DI MATTEO (CT-DES-027, REGISTRATA):** per giocare le carte si spende **energia**: una base che cresce ogni turno, più un piccolo extra dai territori controllati.

**DECISIONE DI MATTEO (CT-DES-028, REGISTRATA):** in un turno si giocano **tutte le carte che l'energia permette**.

**DECISIONE DI MATTEO (CT-DES-029, REGISTRATA):** nel prototipo **non si risponde** durante il turno dell'avversario. L'unica finestra di reazione è il turno di avviso prima della vittoria (CT-DES-015).

Fasi del turno (proposta di struttura, **DA CONFERMARE** con le sezioni successive):
1. **Inizio:** si riceve l'energia e si pesca.
2. **Azioni:** si giocano carte e si attivano effetti finché c'è energia.
3. **Fine:** si controllano gli obiettivi e il segnale di vittoria imminente.

**Numeri provvisori (§5):** valori dell'energia; l'energia non spesa non si conserva.

**DECISIONE DI MATTEO (CT-DES-040, REGISTRATA):** nel prototipo le presenze restano sul territorio dove vengono giocate e non si spostano.

## 5. Numeri di partenza (provvisori)

**DECISIONE DI MATTEO (CT-DES-030, REGISTRATA):** i numeri di partenza li propone Cowork, ragionando su una partita da 10-15 minuti, e si tarano nei playtest. **Nessuno di questi numeri è definitivo.**

| Elemento | Valore provvisorio |
|---|---|
| Primo giocatore | sorteggio; il secondo pesca 1 carta in più |
| Mano iniziale | 5 carte |
| Pesca | 1 carta all'inizio di ogni proprio turno |
| Energia base | 2 al primo turno, +1 ogni turno successivo, fino a un massimo di 8 |
| Extra dai territori | +1 energia se all'inizio del turno controlli almeno 2 territori |
| Energia non spesa | non si conserva |
| Carte guadagnate dai territori | quando prendi il controllo di un territorio che prima non controllavi, aggiungi alla mano 1 carta della sua piccola riserva (3 carte per territorio) |
| Esposizione | da 0 a 10 per giocatore, parte da 0 |
| Carte potenti | oltre all'energia fanno salire l'esposizione di 1 o 2 (indicato sulla carta) |
| Trasformazioni | a esposizione 3, 6 e 9: una carta casuale del tuo mazzo si trasforma nella sua versione cosmica |
| Ridurre l'esposizione | una volta per turno: spendi 2 energia, esposizione -1 |
| Instabilità | da 0 a 5 per territorio, parte da 0 |
| Fasi cosmiche | fase I giri 1-3; fase II giri 4-6; fase III dal giro 7 |
| Instabilità crescente | dal giro 7, alla fine di ogni giro tutti i territori +1 instabilità |
| Eventi senza preavviso | 2 nel mazzo degli eventi |
| Tappe degli obiettivi | 3 tappe; il segnale scatta quando ne manca 1 |

## 6. Rischio cosmico

**DECISIONE DI MATTEO (CT-DES-031, REGISTRATA):** ogni giocatore ha un indicatore di **esposizione** e ogni territorio un indicatore di **instabilità**. I **costi** sono le carte potenti che, oltre all'energia, fanno salire l'esposizione.

**DECISIONE DI MATTEO (CT-DES-032, REGISTRATA):** con l'esposizione alta la forza cosmica colpisce più forte chi è più esposto e le carte del giocatore si trasformano nella loro versione cosmica.

**DECISIONE DI MATTEO (CT-DES-033, REGISTRATA):** l'esposizione si può far scendere, ma costa: si rinuncia a energia o a una giocata.

**DECISIONE DI MATTEO (CT-DES-034, REGISTRATA):** con l'instabilità alta il territorio cambia comportamento, per esempio le presenze perdono forza o si attiva un suo effetto cosmico.

Cosa fa salire l'instabilità di un territorio: gli eventi cosmici, le carte potenti giocate lì e il passare del tempo (§11).

**DA DECIDERE:** cosa succede esattamente alle soglie di instabilità di ciascun territorio; come sono fatte le versioni cosmiche delle carte (più forti, con un effetto collaterale?).

## 7. Forza cosmica

**DECISIONE DI MATTEO (CT-DES-035, REGISTRATA):** si vede sempre il **tipo** del prossimo evento (per esempio «colpirà un territorio»), non i dettagli. Pochi eventi rari arrivano senza preavviso.

**DECISIONE DI MATTEO (CT-DES-036, REGISTRATA):** gli eventi sono divisi in **fasi** e diventano più forti man mano che la partita va avanti.

Come funziona (struttura proposta): un mazzo di eventi diviso in tre fasi; alla fine di ogni giro si risolve l'evento in cima e si scopre il tipo del successivo. Quando un evento colpisce «un giocatore», colpisce il più esposto; in caso di parità, entrambi.

**DA DECIDERE:** l'elenco dei tipi di evento e degli eventi del prototipo.

## 8. Vittoria, segnale e turno di avviso

**DECISIONE DI MATTEO (CT-DES-037, REGISTRATA):** nel prototipo ogni fazione ha **un obiettivo fisso**.

**DECISIONE DI MATTEO (CT-DES-038, REGISTRATA):** ogni obiettivo è fatto di **tappe visibili**. Quando manca solo l'ultima tappa scatta il segnale e l'avversario ha il suo turno di avviso (CT-DES-015). Se dopo quel turno l'ultima tappa viene completata, la vittoria è immediata.

**DA DECIDERE:** l'obiettivo e le tappe di ciascuna fazione (§10); se il segnale può «spegnersi» quando l'avversario fa perdere una tappa.

## 9. Informazione visibile e nascosta

**DECISIONE DI MATTEO (CT-DES-039, REGISTRATA):** all'avversario sono nascosti solo **la mano** e **l'ordine del mazzo**. Sono visibili a tutti: le carte in campo, gli indicatori di esposizione e instabilità, gli obiettivi e le loro tappe, il tipo del prossimo evento cosmico, il numero di carte in mano e nel mazzo, gli scarti.

Il computer (CT-DES-016) vede esattamente le stesse informazioni del giocatore umano.

## 10. Le due fazioni del prototipo e le priorità dell'avversario

**DECISIONE DI MATTEO (CT-DES-041, REGISTRATA):** le due fazioni del prototipo hanno stili opposti. I nomi sono **provvisori**.

| | **I Custodi** | **I Risvegliati** |
|---|---|---|
| Idea | difendono e stabilizzano i territori | corrompono i territori e cercano il potere cosmico |
| Rapporto con il rischio | si espongono poco; possono ridurre l'instabilità | si espongono molto; puntano sulle trasformazioni |
| Punto di forza | presenze solide, difesa, controllo duraturo | colpi forti, carte cosmiche, crescita rapida |
| Punto debole | più lenti a chiudere la partita | più colpiti dalla forza cosmica |

**DA DECIDERE:** l'obiettivo fisso e le tappe di ciascuna fazione (CT-DES-037, CT-DES-038); le priorità del computer per ciascuna fazione (CT-DES-016); le 40 carte di ciascun mazzo; gli effetti dei 3 territori e le loro riserve di carte.

## 11. Durata e instabilità crescente

Già deciso, nessuna scelta nuova:
- durata normale 10-15 minuti (CT-DES-009);
- la pressione verso la fine viene soprattutto dagli obiettivi territoriali (CT-DES-009);
- la forza cosmica cresce per fasi (CT-DES-036);
- dal giro 7 tutti i territori guadagnano instabilità alla fine di ogni giro (numero provvisorio, §5);
- un eventuale limite massimo di giri si decide dopo i playtest (CT-DES-009).
## 12. Glossario - DA DECIDERE

## Changelog

| Versione | Stato | Modifica |
|---|---|---|
| 0.1.0 | DRAFT | Prima bozza di Cowork: sezioni 1-4 con le scelte di Matteo del 2026-10-31 (CT-DES-021…029); sezioni 5-12 da fare. |
| 0.3.0 | DRAFT | Sezioni 9, 10 (stile delle fazioni) e 11; mazzo esaurito e presenze immobili. Scelte di Matteo del 2026-10-31 (CT-DES-039…042). |
| 0.2.0 | DRAFT | Sezioni 5-8 con le scelte di Matteo del 2026-10-31 (CT-DES-030…038) e la tabella dei numeri provvisori proposti da Cowork. |
