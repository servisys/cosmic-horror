---
title: Cosmic Horror - Regole Decision Log
status: DRAFT
version: 0.1.0
owner: Matteo
project_prefix: CT_
---

# Cosmic Horror - Regole Decision Log

**Stato:** PROPOSTA DI MATTEO, DA REGISTRARE

## 1. Marcatore nei documenti

**Risposta di Matteo:** «Scelgo C»

Formato proposto:

```markdown
**Decisione:** CT-DES-###
**Stato:** REGISTRATA

Testo della decisione.
```

ID e stato sono quindi separati dal testo della decisione.

## 2. Campi obbligatori nel Decision Log

**Risposta di Matteo:** «scegli tu»

Scelta proposta da Copilot: modello completo.

Ogni voce contiene:

- ID;
- Titolo;
- Stato;
- Decisione;
- Motivazione;
- Data;
- Documento interessato;
- Alternative considerate;
- Conseguenze/documenti influenzati;
- Eventuale decisione precedente sostituita.

## 3. Supersessione tra decisioni

**Risposta di Matteo:** «C»

- Le correzioni minori mantengono lo stesso ID.
- Se cambia sostanzialmente la decisione, viene creato un nuovo ID.
- La nuova voce indica quale decisione precedente sostituisce.
- La voce precedente resta nel Decision Log come storico.

## 4. Quando una proposta diventa registrata

**Risposta di Matteo:** «A»

La registrazione coincide con il merge su `main`: quando il documento che contiene la decisione viene unito al ramo principale GitHub, la decisione diventa `REGISTRATA`.

Fino al merge rimane una proposta e non deve essere trattata come decisione registrata.

## Modello di voce da compilare

```markdown
## CT-DES-### - Titolo

**Stato:** PROPOSTA | REGISTRATA | SUPERATA
**Decisione:** testo della decisione
**Motivazione:** motivo della scelta
**Data:** YYYY-MM-DD
**Documento interessato:** percorso relativo
**Alternative considerate:**
- alternativa 1
- alternativa 2
**Conseguenze / documenti influenzati:**
- documento o area 1
- documento o area 2
**Sostituisce:** CT-DES-### | Nessuna
```

## Nota di governance

Questo documento formalizza le scelte emerse nell'intervista ma resta esso stesso **PROPOSTA DI MATTEO, DA REGISTRARE** finché non viene sottoposto al processo di registrazione scelto.
