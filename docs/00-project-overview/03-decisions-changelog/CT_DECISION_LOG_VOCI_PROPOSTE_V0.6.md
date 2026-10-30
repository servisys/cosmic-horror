---
title: Cosmic Horror - Voci tecniche unificate proposte Decision Log
status: DRAFT
version: 0.6.0
owner: Team Cosmic Horror
project_prefix: CT_
last_reviewed: 2026-10-30
---

# Cosmic Horror - Voci tecniche unificate proposte Decision Log

> **PROPOSTA DI COPILOT, DA CONFERMARE DA MATTEO**
>
> Tutte le voci contenute in questo documento hanno `Stato: PROPOSTA`. Nessuna voce è registrata o approvata. `CT-DES-014` non compare perché dispone del documento separato predisposto per la registrazione.

## CT-DES-011 - Formato del primo prototipo

**Stato:** PROPOSTA

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

**Stato:** PROPOSTA

**Decisione:** Cosmic Horror è destinato a PC e mobile/tablet; le interfacce possono essere anche molto diverse pur mantenendo le stesse regole. Il primo prototipo deve essere provato su entrambe le classi di dispositivo. **[da chat, da confermare da Matteo]**

**Motivazione:** Matteo ha risposto «C» alla piattaforma principale, «B» sulla possibilità di interfacce molto diverse e «C» sulla piattaforma del primo prototipo. **[da chat, da confermare da Matteo]**

**Data:** 2026-10-29

**Documento interessato:** futuro `CT_PROTOTYPE_SCOPE.md`; `CT_USER_FLOWS.md`; futuro `CT_TECHNICAL_ARCHITECTURE.md`.

**Alternative considerate:**
- Piattaforma principale: **A** PC; **B** smartphone/tablet; **C** entrambi; **D** browser/web. **[da chat, da confermare da Matteo]**
- Coerenza interfaccia: **A** sostanzialmente la stessa; **B** interfacce anche molto diverse; **C** scelta non ancora vincolata. **[da chat, da confermare da Matteo]**
- Primo prototipo: **A** Windows/PC; **B** Android/iOS o tablet; **C** entrambe; **D** browser/web. **[da chat, da confermare da Matteo]**

**Conseguenze / documenti influenzati:** progettazione responsive/adattiva dell'interfaccia; leggibilità del campo su schermi differenti; input; Prototype Scope; UX/UI; Architecture e Build/Deployment.

**Sostituisce:** Nessuna.

---

## CT-DES-013 - Digital-first

**Stato:** PROPOSTA

**Decisione:** Cosmic Horror è digital-first. Una meccanica può essere adottata anche se sarebbe scomoda da gestire fisicamente; gestione automatica della forza cosmica, stati dei territori e trasformazioni del mazzo possono essere parte integrante dell'esperienza. **[da chat, da confermare da Matteo]**

**Motivazione:** Matteo ha risposto «A», «A», «A»: accetta meccaniche comode digitalmente ma scomode fisicamente; considera l'automazione parte integrante dell'esperienza; sceglie digital-first. **[da chat, da confermare da Matteo]**

**Data:** 2026-10-29

**Documento interessato:** `CT_VISION_AND_PILLARS`; futuro `CT_CORE_RULES.md`; futuro `CT_TECHNICAL_ARCHITECTURE.md`.

**Alternative considerate:**
- Meccaniche digitali difficili da riprodurre fisicamente: **A** sì; **B** preferire evitarle; **C** dipende. **[da chat, da confermare da Matteo]**
- Automazione come parte dell'esperienza: **A** sì; **B** tutto gestibile manualmente; **C** solo alcune parti. **[da chat, da confermare da Matteo]**
- Direzione: **A** digital-first; **B** digitale principale ma nucleo manualmente riproducibile; **C** platform-neutral. **[da chat, da confermare da Matteo]**

**Conseguenze / documenti influenzati:** libertà di utilizzare automazione e stati complessi; design della forza cosmica; gestione territoriale e del mazzo; Core Rules; UX/UI; Technical Architecture.

**Sostituisce:** Nessuna.

---

## Nota di unificazione

- `CT-DES-011` compare una sola volta, nella formulazione aggiornata dal chiarimento «contro il computer».
- `CT-DES-012` e `CT-DES-013` restano invariate rispetto a `CT_DECISION_LOG_VOCI_PROPOSTE_V0.4.md`.
- `CT-DES-014` è stata rimossa da questo documento perché dispone del documento separato `CT_DECISION_LOG_CT_DES_014_REGISTRATA_V0.1.md` predisposto per il processo di registrazione.
- Il merge di questo documento non registra `CT-DES-011`, `CT-DES-012` o `CT-DES-013`, perché tutte riportano `Stato: PROPOSTA`.
