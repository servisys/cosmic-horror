---
title: Cosmic Horror - Decision Log CT-DES-055…058 (correzioni dopo la simulazione)
status: DRAFT
version: 0.1.0
owner: Matteo
prepared_by: Cowork
project_prefix: CT_
last_reviewed: 2026-10-31
---

# Cosmic Horror - Decision Log CT-DES-055…058

> Le quattro voci hanno `Stato: REGISTRATA`. Nascono dalla simulazione di Cowork sulle regole base V0.6. Matteo ha accettato le correzioni in chat il 2026-10-31 («ok» alle due correzioni su Sigillo e rito; «ok» al pacchetto completo). Secondo le Regole V0.2 (regola 4) la registrazione è effettiva con il merge di questo documento in `main`. CT-DES-043, 044 e 048 diventano `SUPERATA` (regola 3: restano come storico).

## CT-DES-055 - Condizioni e costi di Sigillo e rito

**Stato:** REGISTRATA

**Decisione:** Custodi, «I tre Sigilli»: su un territorio che controlli e con instabilità 3 o meno puoi porre un Sigillo, al massimo uno per territorio; ogni Sigillo è una tappa; con tre Sigilli vinci. Risvegliati, «Il Rituale»: su un territorio dove hai una presenza, almeno tanta forza quanto l'avversario e instabilità 3 o più puoi completare un rito, al massimo uno per territorio; ogni rito è una tappa; con tre riti su tre territori diversi vinci. Porre un Sigillo o completare un rito costa 2 energia (numero provvisorio).

**Motivazione:** Nella simulazione di Cowork (2000 partite) con le regole precedenti i Risvegliati vincevano il 90% delle volte: l'instabilità sale quasi sempre, e al rito bastava una presenza qualsiasi. Con queste condizioni le fazioni arrivano a circa 46% contro 51%. Matteo ha accettato le due correzioni («ok», 2026-10-31) e poi il pacchetto con il costo del rito a 2 («ok», 2026-10-31).

**Data:** 2026-10-31

**Documento interessato:** regole base in `../../01-game-design/01-core-rules/`; carte ed eventi in `../../03-cards-content/01-card-database/`; simulazione in `../../09-testing-qa/04-reports/` (resoconto della simulazione di Cowork, V0.2).

**Alternative considerate:**
- Condizioni originali (CT-DES-043, CT-DES-044).
- Sigillo con instabilità ≤3 e costo 2; rito con forza almeno pari; rito a 2 energia. **Scelta.**
- Rito solo con il controllo del territorio (più partite senza vincitore).

**Conseguenze / documenti influenzati:** regole base V0.7; carte V0.2; eventi V0.2; priorità del computer (CT-DES-045); playtest veri, dove i numeri vanno ricontrollati.

**Sostituisce:** CT-DES-043 e CT-DES-044 (restano nel Decision Log come `SUPERATA`).

---

## CT-DES-056 - Tappe consolidate

**Stato:** REGISTRATA

**Decisione:** Una tappa già ottenuta può essere tolta dall'avversario con carte apposite, ma solo fino alla fine del turno successivo dell'avversario; dopo è consolidata e definitiva. Se un giocatore era a un passo dalla vittoria e perde una tappa, il segnale si spegne; quando torna a un passo, il segnale riparte e l'avversario ha di nuovo il suo turno di avviso.

**Motivazione:** Nella simulazione le fazioni si toglievano le tappe a vicenda: circa una partita su quattro superava i 15 giri. Con le tappe consolidate le partite oltre i 15 giri scendono a circa il 13%. Proposta di Cowork, accettata da Matteo («ok», 2026-10-31).

**Data:** 2026-10-31

**Documento interessato:** regole base in `../../01-game-design/01-core-rules/`; carte ed eventi in `../../03-cards-content/01-card-database/`; simulazione in `../../09-testing-qa/04-reports/` (resoconto della simulazione di Cowork, V0.2).

**Alternative considerate:**
- Tappe sempre togliibili (CT-DES-048).
- Tappe togliibili solo nel turno successivo dell'avversario. **Scelta.**
- Costo extra per togliere una tappa (nessun effetto in simulazione).

**Conseguenze / documenti influenzati:** regole base V0.7; carte V0.2; eventi V0.2; priorità del computer (CT-DES-045); playtest veri, dove i numeri vanno ricontrollati.

**Sostituisce:** CT-DES-048 (resta nel Decision Log come `SUPERATA`).

---

## CT-DES-057 - Energia del primo turno

**Stato:** REGISTRATA

**Decisione:** Nel primo turno della partita chi gioca per primo ha 1 energia e chi gioca per secondo ne ha 3. Resta la carta in più nella mano iniziale del secondo giocatore. Numeri provvisori.

**Motivazione:** Nella simulazione chi giocava per primo vinceva circa il 71% delle volte; con questa regola circa il 50%. Proposta di Cowork, accettata da Matteo («ok», 2026-10-31).

**Data:** 2026-10-31

**Documento interessato:** regole base in `../../01-game-design/01-core-rules/`; carte ed eventi in `../../03-cards-content/01-card-database/`; simulazione in `../../09-testing-qa/04-reports/` (resoconto della simulazione di Cowork, V0.2).

**Alternative considerate:**
- Nessun compenso oltre la carta in più.
- Primo 1 energia e secondo 3. **Scelta.**
- Solo il primo a 1 energia (circa 56%).

**Conseguenze / documenti influenzati:** regole base V0.7; carte V0.2; eventi V0.2; priorità del computer (CT-DES-045); playtest veri, dove i numeri vanno ricontrollati.

**Sostituisce:** Nessuna.

---

## CT-DES-058 - Chiarimenti alle regole base

**Stato:** REGISTRATA

**Decisione:** Le carte potenti giocate senza un territorio alzano solo l'esposizione. Nella trasformazione, «mazzo» indica le carte ancora da pescare. *Frammento Stellare* non alza l'instabilità. *Ombre Lunghe* dura fino alla fine del giro successivo a quello in cui si risolve. Chi prende il controllo della Biblioteca Sommersa pesca anche 1 carta. *Profanazione* richiede, come il rito, una presenza e forza almeno pari sul territorio; *Esorcismo* richiede il controllo del territorio. Il *Marchio* (forza 0) da solo non basta più per un rito, per effetto di CT-DES-055.

**Motivazione:** Ambiguità emerse scrivendo il simulatore di Cowork. Proposta di Cowork, accettata da Matteo («ok», 2026-10-31).

**Data:** 2026-10-31

**Documento interessato:** regole base in `../../01-game-design/01-core-rules/`; carte ed eventi in `../../03-cards-content/01-card-database/`; simulazione in `../../09-testing-qa/04-reports/` (resoconto della simulazione di Cowork, V0.2).

**Alternative considerate:**
- Lasciare le regole ambigue fino ai playtest.
- Chiarire subito. **Scelta.**

**Conseguenze / documenti influenzati:** regole base V0.7; carte V0.2; eventi V0.2; priorità del computer (CT-DES-045); playtest veri, dove i numeri vanno ricontrollati.

**Sostituisce:** Nessuna. Precisa CT-DES-024, CT-DES-026, CT-DES-046 e CT-DES-054.

---

## Changelog

| Versione | Stato | Modifica |
|---|---|---|
| 0.1.0 | DRAFT | Prima stesura di Cowork con le scelte di Matteo del 2026-10-31. |
