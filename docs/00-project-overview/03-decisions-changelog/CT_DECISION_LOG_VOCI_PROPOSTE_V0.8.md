---
title: Cosmic Horror - Voci tecniche unificate proposte Decision Log
status: DRAFT
version: 0.8.0
prepared_by: Cowork
owner: Team Cosmic Horror
project_prefix: CT_
last_reviewed: 2026-10-31
---

# Cosmic Horror - Voci tecniche unificate proposte Decision Log

> **Tutte le voci di questo documento sono REGISTRATE.** Matteo le ha confermate in chat il 2026-10-31 rispondendo «Tutte c». Secondo le Regole V0.2 (regola 4) la registrazione è effettiva con il merge di questo documento in `main`. `CT-DES-014` non compare perché ha un documento separato, già registrato. Il nome del file resta «VOCI_PROPOSTE» per continuità dei riferimenti.

## CT-DES-011 - Formato del primo prototipo

**Stato:** REGISTRATA

**Decisione:** Il primo prototipo è giocato da una persona contro un avversario controllato dal gioco. La forza cosmica deve essere automatica fin dall'inizio. Il comportamento dell'avversario controllato dal gioco non è definito da questa proposta e resta da decidere.

**Motivazione:** Matteo aveva risposto «B» alla domanda su chi immagina davanti al primissimo prototipo, indicando una persona sola, e «A» alla domanda sull'automazione della forza cosmica, richiedendola fin dall'inizio. Alla domanda sul formato aveva risposto «D», precisando successivamente: «contro il computer». Fonte: `CT_DECISIONI_V0.4_ESITO_TECNICO.md`, sezione 1; `CT_DECISIONI_V0.4_CHIARIMENTO_PROTOTIPO.md`. La risposta testuale «contro il computer» proviene dal chiarimento espresso da Matteo in chat e registrato nel relativo file.

**Data:** 2026-10-29

**Documento interessato:** futuro `CT_PROTOTYPE_SCOPE.md`; `CT_TECH_001_PROVA_MOTORE_V0.2.md`; futuro `CT_TECHNICAL_ARCHITECTURE.md`.

**Alternative considerate:**

- **A - Prototipo cartaceo:** carte e territori fisici; le regole possono essere modificate rapidamente, mentre forza cosmica ed eventuali automazioni devono essere gestite manualmente.
- **B - Hotseat digitale:** due persone giocano sullo stesso PC o tablet alternandosi; consente di testare interfaccia e automazioni, ma rende più complessa la gestione di mani e informazioni personali sullo stesso schermo.
- **C - Digitale contro avversario automatico semplice:** una persona gioca contro un avversario controllato dal gioco; il prototipo è utilizzabile da soli, ma richiede un comportamento automatico dell'avversario.
- **D - Altro:** soluzione diversa o combinazione da specificare. Matteo ha successivamente chiarito questa opzione con la risposta testuale «contro il computer».

**Conseguenze / documenti influenzati:**

- il Prototype Scope deve prevedere un'esperienza utilizzabile da una persona sola;
- la prova tecnica deve includere un avversario controllato dal gioco oppure, prima dell'implementazione, definire quale comportamento minimo sia necessario;
- il comportamento dell'avversario resta una decisione aperta e non può essere inventato durante l'implementazione;
- la forza cosmica deve essere automatizzata fin dall'inizio;
- `CT_TECH_001_PROVA_MOTORE_V0.2.md` mantiene aperto il punto relativo all'avversario automatico finché non viene precisato il comportamento minimo.

**Sostituisce:** Nessuna. Aggiornamento minore della proposta CT-DES-011 esistente; stesso ID mantenuto.

---

## CT-DES-012 - Piattaforme iniziali

**Stato:** REGISTRATA

**Decisione:** Cosmic Horror è destinato a PC e mobile/tablet; le interfacce possono essere anche molto diverse pur mantenendo le stesse regole. Il primo prototipo deve essere provato su entrambe le classi di dispositivo. **[da chat; testo confermato da Matteo in chat il 2026-10-31: «Tutte c»]**

**Motivazione:** Matteo ha risposto «C» alla piattaforma principale, «B» sulla possibilità di interfacce molto diverse e «C» sulla piattaforma del primo prototipo. **[da chat; testo confermato da Matteo in chat il 2026-10-31: «Tutte c»]**

**Data:** 2026-10-29

**Documento interessato:** futuro `CT_PROTOTYPE_SCOPE.md`; `CT_USER_FLOWS.md`; futuro `CT_TECHNICAL_ARCHITECTURE.md`.

**Alternative considerate:**
- Piattaforma principale: **A** PC; **B** smartphone/tablet; **C** entrambi; **D** browser/web. **[da chat; testo confermato da Matteo in chat il 2026-10-31: «Tutte c»]**
- Coerenza interfaccia: **A** sostanzialmente la stessa; **B** interfacce anche molto diverse; **C** scelta non ancora vincolata. **[da chat; testo confermato da Matteo in chat il 2026-10-31: «Tutte c»]**
- Primo prototipo: **A** Windows/PC; **B** Android/iOS o tablet; **C** entrambe; **D** browser/web. **[da chat; testo confermato da Matteo in chat il 2026-10-31: «Tutte c»]**

**Conseguenze / documenti influenzati:** progettazione responsive/adattiva dell'interfaccia; leggibilità del campo su schermi differenti; input; Prototype Scope; UX/UI; Architecture e Build/Deployment.

**Sostituisce:** Nessuna.

---

## CT-DES-013 - Digital-first

**Stato:** REGISTRATA

**Decisione:** Cosmic Horror è digital-first. Una meccanica può essere adottata anche se sarebbe scomoda da gestire fisicamente; gestione automatica della forza cosmica, stati dei territori e trasformazioni del mazzo possono essere parte integrante dell'esperienza. **[da chat; testo confermato da Matteo in chat il 2026-10-31: «Tutte c»]**

**Motivazione:** Matteo ha risposto «A», «A», «A»: accetta meccaniche comode digitalmente ma scomode fisicamente; considera l'automazione parte integrante dell'esperienza; sceglie digital-first. **[da chat; testo confermato da Matteo in chat il 2026-10-31: «Tutte c»]**

**Data:** 2026-10-29

**Documento interessato:** `CT_VISION_AND_PILLARS`; futuro `CT_CORE_RULES.md`; futuro `CT_TECHNICAL_ARCHITECTURE.md`.

**Alternative considerate:**
- Meccaniche digitali difficili da riprodurre fisicamente: **A** sì; **B** preferire evitarle; **C** dipende. **[da chat; testo confermato da Matteo in chat il 2026-10-31: «Tutte c»]**
- Automazione come parte dell'esperienza: **A** sì; **B** tutto gestibile manualmente; **C** solo alcune parti. **[da chat; testo confermato da Matteo in chat il 2026-10-31: «Tutte c»]**
- Direzione: **A** digital-first; **B** digitale principale ma nucleo manualmente riproducibile; **C** platform-neutral. **[da chat; testo confermato da Matteo in chat il 2026-10-31: «Tutte c»]**

**Conseguenze / documenti influenzati:** libertà di utilizzare automazione e stati complessi; design della forza cosmica; gestione territoriale e del mazzo; Core Rules; UX/UI; Technical Architecture.

**Sostituisce:** Nessuna.

---

## Nota di unificazione

- `CT-DES-011` compare una sola volta, nella formulazione aggiornata dal chiarimento «contro il computer».
- `CT-DES-012` e `CT-DES-013` restano invariate rispetto alla precedente V0.4 (non più presente come file: il testo valido è quello di questo documento).
- `CT-DES-014` è stata rimossa da questo documento perché dispone del documento separato `CT_DECISION_LOG_CT_DES_014_REGISTRATA_V0.13.md`, già registrato.
- Il merge della V0.8 registra `CT-DES-011`, `CT-DES-012` e `CT-DES-013`, perché tutte riportano `Stato: REGISTRATA`.

## Changelog

| Versione | Stato | Modifica |
|---|---|---|
| 0.6.0 | DRAFT | Unificazione delle voci tecniche CT-DES-011, 012 e 013 (preparata da Copilot). |
| 0.7.0 | DRAFT | Solo correzione di due riferimenti nella nota di unificazione: la V0.4 non è più citata come file, e il documento di CT-DES-014 è indicato col nome esistente `..._V0.12.md` (prima `..._V0.1.md`, inesistente). Intestazione e `prepared_by` aggiornati a Cowork. Nessuna voce modificata, nessuna decisione registrata o approvata. |
| 0.8.0 | DRAFT | Preparata da Cowork. CT-DES-011, 012 e 013 passano a `Stato: REGISTRATA` su conferma di Matteo in chat il 2026-10-31 («Tutte c»); marcatori «da confermare» sostituiti con la conferma; riferimento a CT-DES-014 aggiornato alla V0.13. Testi delle decisioni invariati. |
