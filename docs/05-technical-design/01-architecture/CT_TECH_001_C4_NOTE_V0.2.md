---
title: Cosmic Horror - CT-TECH-001 Nota C4 telefono reale
status: DRAFT
version: 0.2.0
owner: Team Cosmic Horror
prepared_by: Copilot
---

# CT-TECH-001 - Nota C4 telefono reale

> **PROPOSTA DI COPILOT, DA CONFERMARE DA MATTEO**
>
> Questa nota non assegna C4, non sceglie il motore e non registra `CT-DES-014`.

## Evidenze ora disponibili

Matteo ha provato entrambi i prototipi su un **iPhone 16 Pro Max reale, in orientamento orizzontale** e ha fornito due screenshot finali.

Matteo riferisce inoltre che:

- i tap sui bottoni funzionano in entrambi i prototipi;
- i tap portano allo stesso stato atteso;
- i tap producono lo stesso log atteso;
- il prototipo web è leggibile ma appare molto grande;
- il prototipo Godot gira sull'host privato ma presenta testi e solido 3D molto piccoli.

Negli screenshot allegati sono visibili, in entrambi i casi, il territorio `T1`, lo stato `stato-evento`, `Secondo stato: stato2-evento`, `Evento cosmico: E1`, `Round 3`, il comando `Fine turno` e il pannello di log. La differenza di scala tra le due presentazioni è evidente: una composizione usa elementi e testo sensibilmente più grandi, mentre l'altra concentra maggiormente le informazioni e usa testo più piccolo.

La PR privata #22 e `NOTE.md` non sono stati recuperabili direttamente via accesso web in questa sessione. Questa nota utilizza quindi gli screenshot allegati e le evidenze testuali fornite direttamente da Matteo. Non affermo di aver verificato direttamente il contenuto aggiornato di `NOTE.md`.

## L'interazione è ora sufficientemente documentata?

**Sì, per il requisito minimo di interazione mobile previsto da C4.**

La prova reale ora copre il punto che mancava nella v0.1: Matteo conferma che, sullo stesso telefono reale, i bottoni dei due prototipi sono utilizzabili e conducono allo stesso stato e allo stesso log attesi.

Per questo motivo non considero più il test dei tap un blocker per la valutazione di C4.

Resta però separata la questione della **qualità/leggibilità del layout mobile**, perché i due prototipi raggiungono lo stesso comportamento funzionale con scale visive molto differenti.

## Serve ancora correggere il layout prima di proporre C4?

**A mio giudizio sì, se vogliamo che C4 confronti la capacità dei due percorsi di offrire una UI mobile utilizzabile e non semplicemente la capacità di eseguire la fetta tecnica su telefono.**

La prova attuale dimostra già:

- esecuzione su telefono reale per entrambi;
- comportamento minimo della UI per entrambi;
- tap funzionanti per entrambi;
- stesso stato/log risultante;
- presenza e leggibilità generale delle informazioni richieste.

Non dimostra ancora in modo equo quanto sia facile ottenere una **scala mobile appropriata**, perché i due layout sono evidentemente tarati in modo diverso.

Assegnare ora un punteggio C4 rischierebbe quindi di misurare in parte la qualità della taratura iniziale della demo invece della capacità tecnica dei due percorsi.

### Evidenza minima che chiederei ancora

Per ciascun percorso:

1. una sola correzione esclusivamente di layout/scala, senza cambiare logica, fixture o contenuti;
2. stessa destinazione: iPhone 16 Pro Max reale in orizzontale;
3. nuovo screenshot allo stato equivalente;
4. conferma di Matteo che i bottoni continuano a funzionare;
5. registrazione dei file modificati e degli eventuali problemi incontrati per ottenere la scala corretta.

Dopo questa prova avremmo evidenza sufficiente per distinguere:

- problema iniziale di layout facilmente correggibile;
- attrito significativo dello stack nel produrre il layout mobile richiesto;
- eventuale limite effettivo della tecnologia o dell'approccio usato.

## La differenza di scala è un difetto del motore o del layout della prova?

**Con le evidenze attuali la tratto come difetto/configurazione del layout della prova, non come difetto dimostrato del motore.**

Gli screenshot dimostrano che i due prototipi usano scale molto differenti. Non dimostrano che Godot obblighi a usare testo/3D piccoli né che lo stack web obblighi a usare elementi molto grandi.

Per attribuire il problema alla tecnologia servirebbe osservare che, dopo una modifica equivalente finalizzata a ottenere la stessa leggibilità:

- uno dei percorsi non riesce a raggiungere il risultato; oppure
- richiede workaround o interventi sproporzionati; oppure
- introduce problemi di input, layout o rendering che l'altro non presenta.

Se la correzione è semplice in entrambi, la differenza osservata appartiene alla demo iniziale e non dovrebbe penalizzare C4. Se invece l'attrito è molto diverso, quell'evidenza diventa pertinente a C4 e può essere utile anche nella revisione di C1/C5.

## Stato C4

- **Web:** `non assegnato` - interazione reale ora verificata da Matteo; resta da confrontare il layout dopo una correzione di sola scala/presentazione.
- **Godot:** `non assegnato` - interazione reale ora verificata da Matteo; resta da confrontare il layout dopo una correzione di sola scala/presentazione.

## Evidenze che non riesco ancora a vedere direttamente

- il contenuto aggiornato di `report/screenshots/telefono-reale/NOTE.md` nella PR privata #22;
- la cronologia/commit della correzione o dei test mobile presenti nella PR privata;
- eventuali dettagli in `NOTE.md` ulteriori rispetto a quelli riportati da Matteo nel messaggio corrente.

Queste evidenze non impediscono di considerare completato il test minimo dei tap, perché Matteo ne ha fornito direttamente l'esito. Diventerebbero invece utili per audit e tracciabilità della prova.

---

**PROPOSTA DI COPILOT, DA CONFERMARE DA MATTEO. Nessuna scelta del motore è contenuta in questa nota. `CT-DES-014` resta non registrato.**
