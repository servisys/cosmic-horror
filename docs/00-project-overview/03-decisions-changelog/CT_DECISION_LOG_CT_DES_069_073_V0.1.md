---
title: Cosmic Horror - Decision Log CT-DES-069...074 (il gioco a 5 territori)
status: DRAFT
version: 0.1.0
owner: Matteo
prepared_by: Cowork
project_prefix: CT_
last_reviewed: 2026-11-01
---

# Cosmic Horror - Decision Log CT-DES-069...074

> Le sei voci hanno `Stato: REGISTRATA`. Nascono da una scelta di Matteo: portare il prototipo da 3 a 5 territori, con Dunwich e R'lyeh in gioco e l'ultima tappa a R'lyeh. Matteo ha risposto in chat a Cowork il 2026-11-01 alle domande sulla vittoria («3 tappe, una a R'lyeh»), su R'lyeh («Ultima tappa lì»), su Dunwich («Pietre ritte») e sull'energia («Almeno 3 su 5»); sulla tabella dei dettagli proposta da Cowork (effetti, riserve, computer) ha detto «ok procediamo con tutto». Dopo il pre-flight plan di Code ha dato il via all'esecuzione, confermando la tabella delle priorità del computer così com'era nel piano (CT-DES-074) e le interpretazioni sui punti dubbi (§13 delle Regole V0.13). Secondo le Regole V0.2 (regola 4) la registrazione è effettiva con il merge di questo documento in `main`. I numeri restano provvisori (CT-DES-030).

## CT-DES-069 - Cinque territori

**Stato:** REGISTRATA

**Decisione:** Nel prototipo il campo ha 5 territori, sempre gli stessi: Innsmouth e la Scogliera del Diavolo (T1), La Biblioteca della Miskatonic (T2), La Landa Maledetta (T3), Dunwich (T4), R'lyeh (T5, il pozzo al centro della plancia).

**Motivazione:** Dunwich e R'lyeh erano già sulla plancia, con la loro scena; metterli in gioco rende il campo più ricco e dà all'ultima tappa un luogo speciale (CT-DES-070).

**Data:** 2026-11-01

**Documento interessato:** Regole base §2, §5, §6, §10, §12; database delle carte; specifica del prototipo (righe sui territori); `game/prototipo/`.

**Alternative considerate:**
- Restare a 3 territori.
- Aggiungere solo uno dei due.

**Conseguenze / documenti influenzati:** Regole base V0.13; file dati carte V0.7 (T4, T5 e le riserve T4r, T5r); specifica del prototipo V0.3; motore e interfaccia a 5 territori.

**Sostituisce:** CT-DES-022 e CT-DES-052.

---

## CT-DES-070 - Vittoria con l'ultima tappa a R'lyeh

**Stato:** REGISTRATA

**Decisione:** Gli obiettivi restano di 3 tappe (Sigilli per i Custodi, riti per i Risvegliati, alle stesse condizioni di CT-DES-055, una per territorio). Le prime due tappe si fanno su due dei quattro territori esterni (Innsmouth, Biblioteca, Landa, Dunwich); la terza, quella che fa vincere, **solo a R'lyeh**. Su R'lyeh non si può fare una tappa prima di averne due. Il segnale scatta con due tappe; il turno di avviso (CT-DES-015) e la regola delle tappe non consolidate (CT-DES-056) restano.

**Motivazione:** Dà alla partita un finale riconoscibile: tutte e due le fazioni sanno dove si deciderà. Matteo: «3 tappe, una a R'lyeh», «Ultima tappa lì».

**Data:** 2026-11-01

**Documento interessato:** Regole base §8 e §10 (obiettivi); `game/prototipo/` (motore, computer, consigli, interfaccia).

**Alternative considerate:**
- Tappe liberamente su qualsiasi territorio, come prima.
- Tappe più numerose (una per territorio).

**Conseguenze / documenti influenzati:** Regole V0.13 (§8, §10, §13 chiarimento 25); motore (`tappaPosabile`); computer e consigli da riscrivere; nuove simulazioni.

**Sostituisce:** modifica CT-DES-055 solo per dove si fanno le tappe (costi e condizioni restano).

---

## CT-DES-071 - Dunwich, le pietre ritte

**Stato:** REGISTRATA

**Decisione:** Effetto di Dunwich: chi lo controlla, una volta per turno, può spendere 1 energia per alzare o abbassare di 1 l'instabilità di un altro territorio.

**Motivazione:** Dunwich, con i suoi cerchi di pietre, diventa il territorio che «regola» l'instabilità: chi lo tiene ha uno strumento per i riti e per i Sigilli, e quindi un motivo per contenderlo.

**Data:** 2026-11-01

**Documento interessato:** Regole base §10 (territori); `game/prototipo/`.

**Alternative considerate:**
- Pesca o energia extra (già usate dagli altri territori).
- Effetto sulle presenze.

**Conseguenze / documenti influenzati:** nuova mossa nel motore; pulsante nell'interfaccia; il computer deve saperla usare; chiarimenti nelle Regole V0.13 (§13 chiarimento 23).

**Sostituisce:** Nessuna.

---

## CT-DES-072 - Energia extra con 3 territori

**Stato:** REGISTRATA

**Decisione:** L'energia extra dai territori (+1) si ottiene se all'inizio del turno controlli almeno 3 territori (prima 2 su 3). Numero provvisorio (CT-DES-030).

**Motivazione:** Con 5 territori, «almeno 2» sarebbe troppo facile; Matteo: «Almeno 3 su 5».

**Data:** 2026-11-01

**Documento interessato:** Regole base §5 (tabella dei numeri); `game/prototipo/src/motore/regole.ts`.

**Alternative considerate:**
- Restare a 2.
- Soglia a 4.

**Conseguenze / documenti influenzati:** Regole V0.13; motore; simulazioni (l'energia extra pesa meno).

**Sostituisce:** nessuna decisione (cambia un numero provvisorio di CT-DES-030).

---

## CT-DES-073 - R'lyeh e Dunwich: effetti, effetti cosmici e riserve

**Stato:** REGISTRATA (valori provvisori)

**Decisione:**
- R'lyeh, *La città dormiente*: ogni carta potente giocata qui fa salire l'esposizione di chi la gioca di 1 in più.
- R'lyeh a instabilità 5, *Cthulhu si agita*: alla fine del giro, +1 esposizione a entrambi i giocatori.
- Dunwich a instabilità 5, *L'Orrore di Dunwich*: alla fine del giro viene eliminata la presenza con forza più alta su Dunwich (a parità, tutte quelle con quella forza).
- Riserva di Dunwich (3 copie): *Pietra Incisa*, azione, costo 1, potente 0: «Instabilità di un territorio +1 o −1, a tua scelta.»
- Riserva di R'lyeh (3 copie): *Idolo di Cthulhu*, azione, costo 2, potente 1: «Una tua presenza a R'lyeh ha +2 forza fino a fine partita.»

Citazioni (CT-DES-061, tradotte da Cowork dai testi in `reference/literature/gutenberg/`; l'originale inglese è stato verificato sul testo):
- Dunwich (T4): «Gli estranei visitano Dunwich il meno possibile.» — *The Dunwich Horror* — "Outsiders visit Dunwich as seldom as possible"
- R'lyeh (T5): «La città-cadavere di R'lyeh, l'incubo costruito in eoni incommensurabili prima della storia.» — *The Call of Cthulhu* — "the nightmare corpse-city of R'lyeh, that was built in measureless eons behind history"
- Pietra Incisa (T4r): «Gli strani cerchi di alte colonne di pietra che coronano quasi tutte le colline.» — *The Dunwich Horror* — "the queer circles of tall stone pillars with which most of them are crowned"
- Idolo di Cthulhu (T5r): «L'idolo scolpito era il grande Cthulhu.» — *The Call of Cthulhu* — "The carven idol was great Cthulhu"

**Motivazione:** Ogni nuovo territorio ha un effetto, un effetto cosmico e una piccola riserva, come i primi tre. R'lyeh è il luogo più pericoloso del campo (esposizione), Dunwich il più «sorvegliato» dalle pietre.

**Data:** 2026-11-01

**Documento interessato:** Regole base §6 (effetti cosmici), §10 (territori); database delle carte V0.7 (T4, T5, T4r, T5r).

**Alternative considerate:** Matteo ha approvato la proposta di Cowork senza varianti («ok procediamo con tutto»).

**Conseguenze / documenti influenzati:** file dati V0.7; Regole V0.13; motore; illustrazioni delle due carte nuove e dei due territori (da fare con ComfyUI: nel frattempo un segnaposto).

**Sostituisce:** Nessuna (completa CT-DES-046 e CT-DES-051 con i due nuovi territori).

---

## CT-DES-074 - Priorità del computer a 5 territori

**Stato:** REGISTRATA

**Decisione:** Con 5 territori il computer segue queste priorità, in ordine. Sostituiscono CT-DES-065 e CT-DES-067 per il prototipo a 5 territori. «Esterni» sono i 4 territori diversi da R'lyeh. Matteo ha confermato la tabella così com'era nel pre-flight plan di Code (2026-11-01). Si provano nelle prime partite.

| | Custodi | Risvegliati |
|---|---|---|
| 1 | Se i Risvegliati hanno 2 tappe, difende R'lyeh: abbassa l'instabilità sotto 3 (carte, Pietra Incisa −1, Pietre ritte −1) o gioca lì presenze per superarne la forza. Può anche togliere un rito non consolidato. | Se i Custodi hanno 2 tappe, alza l'instabilità di R'lyeh sopra 3 (carte, Pietra Incisa +1, Pietre ritte +1), toglie un Sigillo non consolidato o gioca presenze a R'lyeh per togliergliene il controllo. |
| 2 | Se può, pone un Sigillo: con meno di 2 tappe su un esterno, con 2 tappe a R'lyeh. | Se può, completa un rito, con le stesse due regole. |
| 3 | Con meno di 2 tappe rinforza l'esterno più conteso. Con 1 tappa comincia anche a mettere presenze a R'lyeh. Con 2 tappe prepara R'lyeh con presenze fino a controllarlo. | Con meno di 2 tappe segue CT-DES-067 sugli esterni. Con 1 o più tappe contende anche R'lyeh (forza minore o uguale, instabilità almeno 2 o presenza già lì). Con 2 tappe mette presenze a R'lyeh. |
| 4 | Se l'esposizione è 5 o più, la abbassa. | Gioca le carte potenti quando ha l'energia. |
| 5 | Pietre ritte (se controlla Dunwich): tiene R'lyeh a 3 o meno prima dell'ultima tappa e l'instabilità bassa dove ha un Sigillo da porre. | Pietre ritte (se controlla Dunwich): tiene R'lyeh a 3 o più, altrimenti alza l'instabilità dove ha presenze. |
| Fuori tabella | Idolo di Cthulhu solo se ha una presenza a R'lyeh e controllo contestato. | Idolo di Cthulhu come per i Custodi. |

**Motivazione:** Le priorità di CT-DES-065 e CT-DES-067 non conoscono R'lyeh né Dunwich; con la terza tappa solo a R'lyeh il computer deve prepararla e difenderla.

**Data:** 2026-11-01

**Documento interessato:** Regole base §10 (priorità del computer); `game/prototipo/src/computer/computer.ts` (implementazione nel task CT-FEAT-002).

**Alternative considerate:** altre tabelle non sono state proposte; la tabella è quella del pre-flight plan di Code, confermata da Matteo.

**Conseguenze / documenti influenzati:** Regole V0.13 §10; computer, consigli e simulazioni (CT-FEAT-002). Finché il computer non è aggiornato, le simulazioni mostrano solo come il computer attuale gioca il campo a 5 territori.

**Sostituisce:** CT-DES-065 e CT-DES-067, per il prototipo a 5 territori.

---

## Changelog

| Versione | Stato | Modifica |
|---|---|---|
| 0.1.0 | DRAFT | Prima stesura (CT-FEAT-001): CT-DES-069…073 dal testo di Matteo, CT-DES-074 dalla tabella confermata nel pre-flight plan. |
