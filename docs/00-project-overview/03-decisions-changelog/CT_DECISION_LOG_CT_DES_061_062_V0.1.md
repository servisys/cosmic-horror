---
title: Cosmic Horror - Decision Log CT-DES-061…062 (stile delle illustrazioni e citazioni)
status: DRAFT
version: 0.1.0
owner: Matteo
prepared_by: Cowork
project_prefix: CT_
last_reviewed: 2026-10-31
---

# Cosmic Horror - Decision Log CT-DES-061…062

> Le due voci hanno `Stato: REGISTRATA`. Matteo ha scelto gli stili votando due prove di illustrazioni in una pagina dedicata (31 ottobre 2026) e ha approvato con «ok» lo schema proposto da Cowork. Ha chiesto le citazioni («sarebbe molto bello, anche se ci fossero delle citazioni dei libri in fondo alle carte») e approvato il pacchetto con «ok». Secondo le Regole V0.2 (regola 4) la registrazione è effettiva con il merge di questo documento in `main`.

## CT-DES-061 - Stile delle illustrazioni

**Stato:** REGISTRATA

**Decisione:** Le illustrazioni seguono tre stili, uno per categoria di carta:
- carte delle fazioni: pittura realistica «alla Magic», con luce drammatica e la tavolozza della fazione;
- eventi cosmici (Grandi Antichi): pulp anni '30;
- territori e carte di riserva: acquerello e inchiostro.

In ogni illustrazione c'è un solo soggetto in primo piano, riconoscibile anche piccolo sul telefono. Se la carta è un oggetto, l'immagine mostra l'oggetto. L'inquadratura dipende dal tipo: ritratto per le persone, creatura che riempie la scena, natura morta per gli oggetti, campo lungo per i luoghi. Creature e Grandi Antichi seguono le descrizioni dei racconti di Lovecraft, raccolte nella Guida del mondo.

**Motivazione:** Matteo ha notato che le prime illustrazioni si somigliavano troppo (gruppi di uomini, paesaggi simili) e che sul telefono le immagini saranno piccole. Nella prima prova (6 stili) ha scelto olio, pulp e acquerello a seconda della carta. Nella seconda ha scelto lo stile unico per 4 carte delle fazioni, il pulp per Cthulhu e l'acquerello per la Landa e il Diario.

**Data:** 2026-10-31

**Documento interessato:** `../../02-universe-lore/` (Guida del mondo); prompt delle illustrazioni; futura Art Direction.

**Alternative considerate:**
- Un solo stile per tutto.
- Tre stili per tipo di soggetto (persone, mostri, oggetti e luoghi).
- Tre stili per categoria di carta. **Scelta.**

**Conseguenze / documenti influenzati:** tutte le illustrazioni del prototipo vanno rigenerate con i nuovi prompt; Guida del mondo come riferimento; i prompt citano le descrizioni originali.

**Sostituisce:** Nessuna.

---

## CT-DES-062 - Citazioni dai racconti di Lovecraft

**Stato:** REGISTRATA

**Decisione:** In fondo a ogni carta e a ogni evento c'è una breve frase tratta dai racconti di Lovecraft presenti in `reference/literature/gutenberg/`. La frase è **tradotta da Cowork** dall'originale inglese e porta il titolo del racconto. Non si usano traduzioni italiane pubblicate né racconti scritti con coautori. Il file dati conserva l'originale inglese per la verifica. L'evento E16 diventa «L'Orrore di Dunwich» (prima «La Capra Nera dai Mille Cuccioli»), perché nei racconti disponibili quella creatura non ha né descrizione né frasi da citare. L'effetto dell'evento non cambia.

**Motivazione:** Richiesta di Matteo. Gli scritti di Lovecraft sono di pubblico dominio (CT-DES-060); le traduzioni italiane pubblicate invece hanno diritti propri. Non è un parere legale.

**Data:** 2026-10-31

**Documento interessato:** carte ed eventi in `../../03-cards-content/01-card-database/` (V0.4); Guida del mondo.

**Alternative considerate:**
- Nessun testo citato (regola originale di CT-DES-060).
- Citazioni brevi tradotte da Cowork, con la fonte. **Scelta.**

**Conseguenze / documenti influenzati:** campo `citazione` nei dati delle carte; impaginazione della carta (spazio per la frase); la regola di CT-DES-060 «niente testi copiati dai racconti» vale ora con l'eccezione delle citazioni brevi, tradotte e con la fonte.

**Sostituisce:** Nessuna. Modifica la sola regola sui testi di CT-DES-060.

---

## Changelog

| Versione | Stato | Modifica |
|---|---|---|
| 0.1.0 | DRAFT | Prima stesura di Cowork con le scelte di Matteo del 2026-10-31. |
