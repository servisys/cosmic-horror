---
title: Cosmic Horror - CT-TECH-001 Nota C4 telefono reale
status: DRAFT
version: 0.1.0
owner: Team Cosmic Horror
prepared_by: Copilot
---

# CT-TECH-001 - Nota C4 telefono reale

> **PROPOSTA DI COPILOT, DA CONFERMARE DA MATTEO**
>
> Questa nota non assegna C4, non sceglie il motore e non registra `CT-DES-014`.

## Evidenza disponibile

Matteo ha effettuato una prova dei due prototipi su **iPhone 16 Pro Max reale in orientamento orizzontale** e ha riportato:

- **Web:** leggibile, ma molto grande.
- **Godot:** funzionante sull'host privato, ma con testi e solido 3D molto piccoli.
- **Interazione:** i clic sui bottoni non sono ancora stati provati.

Gli screenshot e la nota sono indicati come presenti nella PR #22, cartella `report/screenshots/telefono-reale/`. In questa sessione non è stato possibile recuperare il contenuto della PR privata tramite accesso web, quindi questa revisione usa come evidenza disponibile il risultato del test riportato da Matteo e non pretende di aver verificato direttamente i pixel degli screenshot.

## Evidenze ancora necessarie prima di proporre C4

### 1. Interazione reale sui due prototipi

Serve provare i pulsanti sullo stesso iPhone reale per entrambi i percorsi e registrare almeno:

- se il tap viene riconosciuto;
- se il bersaglio del pulsante è raggiungibile senza zoom o gesti anomali;
- se dopo il tap il cambiamento previsto è visibile;
- eventuali tap mancati, doppi o difficili da eseguire.

Finché questo test manca, non è verificato il requisito minimo di interazione su mobile reale.

### 2. Evidenza comparabile della leggibilità

Per evitare una valutazione puramente soggettiva servono, per entrambi:

- screenshot alla stessa orientazione e sullo stesso dispositivo;
- pagina mostrata alla scala prevista dal prototipo, senza zoom manuale differente;
- conferma di quali elementi devono essere letti: carta, stato territoriale, indicatore/evento cosmico e controlli;
- nota di Matteo su quali testi o elementi risultano troppo grandi/piccoli e se ciò impedisce oppure no l'uso.

### 3. Verifica dopo una correzione di solo layout

Poiché i due problemi riportati sono opposti, Web troppo grande e Godot troppo piccolo, serve distinguere l'idoneità della tecnologia dalla qualità della configurazione responsiva usata nella fetta tecnica.

Prima di attribuire C4 è utile verificare se ciascun prototipo può essere portato a una scala comparabile con una modifica esclusivamente di layout/presentazione, senza cambiare logica o contenuti. Questa prova non deve diventare ottimizzazione del prodotto: serve soltanto a capire se il limite osservato è strutturale oppure una taratura della demo.

## La differenza di scala è un difetto del motore?

**Con le evidenze attuali: no, non è dimostrato.**

Il fatto osservato è che **questa implementazione Web appare molto grande** e **questa implementazione Godot appare molto piccola** sullo stesso telefono. Da questo solo dato non possiamo attribuire causalmente la differenza al motore.

Per trattarla come difetto del motore servirebbe dimostrare almeno che, mantenendo requisiti equivalenti:

1. il layout è stato configurato correttamente nel rispettivo stack;
2. la scala non può essere corretta senza workaround o costi tecnici rilevanti;
3. il problema si ripresenta dopo una correzione equivalente della presentazione.

Fino a quella verifica, classifico la differenza come **problema di layout/configurazione della prova**, non come difetto di Godot o del percorso Web.

Questa classificazione è provvisoria: se una modifica equivalente mostrasse che uno dei due stack richiede interventi sproporzionati o non riesce a ottenere una scala utilizzabile, quell'evidenza diventerebbe pertinente a C4 e, se comporta attrito operativo, anche a C1/C5.

## Stato C4

- **Web:** **non assegnato - in attesa del test di interazione sul telefono reale e della verifica di scala/layout.**
- **Godot:** **non assegnato - in attesa del test di interazione sul telefono reale e della verifica di scala/layout.**

Non viene calcolato alcun totale aggiornato.

## Passo minimo per chiudere l'evidenza C4

Matteo deve provare sullo stesso iPhone, in orizzontale, i pulsanti di entrambi i prototipi e riportare l'esito. Dopo una eventuale correzione puramente di layout, servono due screenshot comparabili e una nuova nota sulla leggibilità.

---

**Nessuna scelta del motore è contenuta in questa nota. `CT-DES-014` resta non registrato.**
