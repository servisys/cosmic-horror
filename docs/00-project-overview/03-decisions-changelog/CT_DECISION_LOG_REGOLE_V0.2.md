---
title: Cosmic Horror - Regole Decision Log
status: DRAFT
version: 0.2.0
owner: Matteo
project_prefix: CT_
last_reviewed: 2026-10-30
---

# Cosmic Horror - Regole Decision Log

> **PROPOSTA DI COPILOT, DA CONFERMARE DA MATTEO**
>
> Questo documento non registra né approva alcuna decisione.

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

Il merge nel ramo `main` registra **soltanto** le voci che nel documento riportano esplicitamente:

```markdown
**Stato:** REGISTRATA
```

Le voci che riportano:

```markdown
**Stato:** PROPOSTA
```

oppure formule equivalenti come «PROPOSTA, in attesa di registrazione» e «IN ATTESA DI REGISTRAZIONE» restano proposte anche dopo il merge nel ramo `main`.

Il merge, da solo, non modifica lo stato scritto nella voce e non trasforma automaticamente una proposta in decisione registrata.

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

## Changelog

| Versione | Stato | Modifica |
|---|---|---|
| 0.1.0 | DRAFT | Definizione iniziale delle regole del Decision Log. |
| 0.2.0 | DRAFT | Precisata la regola 4: il merge in `main` registra soltanto le voci con `Stato: REGISTRATA`; le voci `PROPOSTA` restano proposte dopo il merge. Nessun'altra regola modificata. |
