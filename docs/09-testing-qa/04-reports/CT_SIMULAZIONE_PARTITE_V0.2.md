---
title: Cosmic Horror - Simulazione di partite sulle regole base V0.6
status: DRAFT
version: 0.2.0
owner: Matteo
prepared_by: Cowork
last_reviewed: 2026-10-31
---

# Simulazione di partite sulle regole base V0.6

> **ANALISI DI COWORK, NON UNA DECISIONE.** Le regole base V0.6, la lista delle carte e la lista degli eventi sono state tradotte in un piccolo simulatore (`CT_SIMULATORE_COWORK_V0.1.py`, in `scambio/da-cowork/`). Il simulatore ha fatto giocare il computer contro se stesso, Custodi contro Risvegliati, con le priorità di CT-DES-045. Ogni partita usa un seme diverso.
>
> **Limite importante:** il «giocatore» simulato è semplice, molto più di una persona. I numeri servono a trovare **squilibri strutturali** e **regole ambigue**, non a misurare il bilanciamento fine. Vanno confermati con partite vere.

## 1. Risultato sulle regole attuali (2000 partite)

| Misura | Valore |
|---|---|
| Vittorie Risvegliati | **90%** |
| Vittorie Custodi | 9% |
| Nessun vincitore entro 30 giri | 0,3% |
| Durata | mediana 9 giri; 96% entro 12 giri |
| Esposizione a fine partita | Custodi 2,4; Risvegliati 6,9 |
| Trasformazioni per partita | Custodi 0,6; Risvegliati 3,0 |
| Tappe tolte per partita | Custodi 0,5; Risvegliati 0,9 |

**Cosa funziona:** la durata è nella fascia voluta (circa 9 giri, cioè 18 turni). Esposizione e trasformazioni rispecchiano lo stile delle fazioni (CT-DES-041). Il segnale, il turno di avviso e le tappe tolte si attivano davvero.

**Problema strutturale:** l'instabilità sale quasi sempre. Ci pensano gli eventi cosmici, le carte potenti e, dal giro 7, la crescita automatica (media finale 3,7 su 5). Questo **aiuta automaticamente i Risvegliati**, che vogliono instabilità alta (rito a 3 o più), e **blocca i Custodi**, che possono porre Sigilli solo con instabilità 2 o meno. In più, al rito basta una presenza qualsiasi, anche il *Marchio* con forza 0, mentre al Sigillo serve il **controllo** del territorio.

## 2. Correzioni provate

| Variante | Vittorie C / R / nessuno | Durata mediana | Oltre 15 giri |
|---|---|---|---|
| Regole attuali | 9% / 90% / 0% | 9 | 2% |
| Sigillo con instabilità ≤3 | 25% / 75% / 0% | 8 | — |
| Sigillo ≤3 e costo 2 | 37% / 63% / 0% | 8 | — |
| Rito solo con il controllo del territorio + Sigillo ≤3 | 46% / 45% / 10% | 11 | — |
| **Sigillo ≤3, costo 2; rito solo se hai almeno tanta forza quanto l'avversario** | **49% / 46% / 6%** | **10** | **24%** |
| come sopra + 1 energia in più al secondo giocatore nel primo turno | 48% / 46% / 6% | 10 | circa 25% |

**Equilibrio tra fazioni:** si raggiunge con due modifiche:
1. il Sigillo si può porre con **instabilità 3 o meno** (era 2) e costa **2 energia** (era 3);
2. il rito si può completare solo se su quel territorio hai **almeno tanta forza quanto l'avversario** (era: basta una presenza).

**Problemi che restano con le modifiche:**
- **Vantaggio di chi gioca per primo:** vince circa il 64-73% delle volte. La carta in più al secondo giocatore non basta, e nemmeno 1-2 energia in più nel primo turno.
- **Partite lunghe:** circa una su quattro supera i 15 giri, cioè circa 30 turni. Non rispetta i 10-15 minuti di CT-DES-009. La causa è che le due fazioni si tolgono le tappe a vicenda senza chiudere.
- Fissare un limite di 12 giri, con la vittoria a chi ha più tappe, accorcia tutto, ma il 40% delle partite finirebbe «ai punti». Non è una buona soluzione così com'è.

## 3. Regole ambigue trovate scrivendo il simulatore

1. **Carte potenti senza territorio** (*Offerta di Sangue*, *Visioni*, *Rito di Contenimento*): §6 dice che le carte potenti alzano l'instabilità «dove sono giocate», ma queste carte non hanno un territorio. Nel simulatore alzano solo l'esposizione.
2. **«Una carta casuale del tuo mazzo si trasforma»:** non è chiaro se «mazzo» indichi solo le carte da pescare oppure anche mano e scarti. Nel simulatore: solo le carte da pescare.
3. **Il Cratere Stellare arriva a 5 molto presto** (spesso al giro 3-4): concorrono *Frammento Stellare*, *Stella Cadente* e il +1 extra delle carte potenti. Il suo effetto a 5 elimina le presenze deboli in continuazione.
4. **Marchio (forza 0) e rito:** con la regola attuale il Marchio da solo basta a completare un rito. È probabilmente troppo forte.
5. **Ombre Lunghe:** «fino alla fine del prossimo giro» va chiarito (giro in corso o successivo).
6. **Biblioteca Sommersa:** l'effetto (riordinare 3 carte) pesa molto poco rispetto agli altri due territori.
7. **Profanazione** funziona su territori con instabilità 3 o più, condizione molto frequente. *Esorcismo* invece richiede il controllo: le due carte non sono simmetriche.

## 4. Cosa propone Cowork

- **Adottare in prova le due modifiche** del §2 (Sigillo ≤3 e costo 2; rito con forza almeno pari). Cambiano il testo di CT-DES-043 e CT-DES-044: servono la conferma di Matteo e una nuova voce nel Decision Log.
- **Rimandare** vantaggio del primo giocatore e durata a un secondo giro di simulazione, provando per esempio: tappe che non si possono togliere nello stesso giro in cui vengono fatte; un «sigillo/rito definitivo» dopo 2 giri; il secondo giocatore che comincia con 1 tappa di vantaggio nascosto. Nessuna di queste è proposta come decisione.
- **Chiarire** i 7 punti del §3 nella prossima versione delle regole base.

## 5. Secondo giro di simulazioni (2000 partite per variante)

Base: le due correzioni del §2 (Sigillo con instabilità ≤3 e costo 2; rito con forza almeno pari), accettate da Matteo il 2026-10-31.

| Variante aggiunta | Vittorie C / R / nessuno | Mediana giri | Oltre 15 giri | Vince chi inizia |
|---|---|---|---|---|
| nessuna | 50% / 44% / 5% | 9 | 23% | 71% |
| tappa consolidata (togliibile solo nel turno successivo dell'avversario) | 54% / 44% / 1% | 8 | 11% | 74% |
| chi inizia ha 1 energia al primo turno (invece di 2) | 48% / 45% / 6% | 10 | 22% | 56% |
| consolidata + primo 1 energia + secondo 3 energia al primo turno | 51% / 46% / 1% | 9 | 13% | 48% |
| **come sopra + rito a 2 energia** | **46% / 51% / 1%** | **8** | **13%** | **50%** |
| come sopra + chiarimenti proposti (§6) | 53% / 45% / 1% | 8 | 13% | 49% |

Altre prove non utili: costo extra per togliere una tappa; sconto sulle tappe dal giro 8.

## 6. Pacchetto proposto da Cowork (da confermare da Matteo)

1. **Tappa consolidata:** una tappa può essere tolta solo fino alla fine del turno successivo dell'avversario. Dopo è definitiva.
2. **Primo turno:** chi gioca per primo ha 1 energia, chi gioca per secondo 3 (più la carta in più già prevista).
3. **Rito a 2 energia**, come il Sigillo.
4. **Chiarimenti:**
   - le carte potenti giocate senza un territorio alzano solo l'esposizione;
   - nella trasformazione, «mazzo» indica le carte ancora da pescare;
   - *Frammento Stellare* non alza più l'instabilità;
   - *Ombre Lunghe* dura fino alla fine del giro successivo;
   - la Biblioteca Sommersa dà anche 1 carta pescata a chi ne prende il controllo;
   - *Profanazione* richiede, come il rito, una presenza e forza almeno pari sul territorio;
   - il *Marchio* è già limitato dalla nuova regola del rito.

Con tutto il pacchetto: fazioni quasi pari, chi inizia vince circa la metà delle volte, partita mediana di 8 giri, circa il 79% entro 12 giri. Resta circa un 13% di partite oltre i 15 giri: il limite massimo si decide nei playtest veri (CT-DES-009).

## Changelog

| Versione | Stato | Modifica |
|---|---|---|
| 0.2.0 | DRAFT | Secondo giro: vantaggio del primo giocatore, durata, chiarimenti; pacchetto proposto. Simulatore `CT_SIMULATORE_COWORK_V0.2.py`. |
| 0.1.0 | DRAFT | Prima simulazione di Cowork (2000 partite per variante, giocatore simulato semplice). |
