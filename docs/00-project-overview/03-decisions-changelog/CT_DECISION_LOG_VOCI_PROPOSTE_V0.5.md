---
title: Cosmic Horror - Aggiornamento proposto CT-DES-011
status: DRAFT
version: 0.5.0
owner: Team Cosmic Horror
project_prefix: CT_
---

# Cosmic Horror - Aggiornamento proposto CT-DES-011

> La voce seguente è **PROPOSTA, in attesa di registrazione**. Non è approvata né registrata.

## Valutazione della modifica

Il chiarimento «contro il computer» completa il significato dell'opzione «D» già scelta per CT-DES-011. Non cambia l'obiettivo sostanziale già espresso: prototipo utilizzabile da una persona sola e forza cosmica automatica fin dall'inizio. Viene quindi mantenuto lo stesso ID `CT-DES-011` come correzione/precisazione minore.

La versione precedente di CT-DES-011 non viene marcata `SUPERATA`, perché le regole del Decision Log riservano tale stato a una decisione sostanzialmente sostituita da un nuovo ID. La nuova formulazione aggiorna la proposta esistente, che resta non registrata.

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

## Nota di governance

Questa voce rimane `PROPOSTA`. Il chiarimento non autorizza la progettazione autonoma del comportamento dell'avversario e non autorizza implementazione.
