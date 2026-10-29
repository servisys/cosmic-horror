---
title: Cosmic Horror - Nuove voci tecniche proposte Decision Log
status: DRAFT
version: 0.4.0
owner: Team Cosmic Horror
project_prefix: CT_
---

# Cosmic Horror - Nuove voci tecniche proposte Decision Log

> Tutte le voci sono **PROPOSTA, in attesa di registrazione**. Nessuna voce è registrata o approvata.

## CT-DES-011 - Formato del primo prototipo

**Stato:** PROPOSTA

**Decisione:** Il primissimo prototipo deve essere utilizzabile da una persona sola e deve automatizzare la forza cosmica fin dall'inizio. Il formato definitivo del prototipo resta da decidere perché Matteo ha scelto «D» (altro) senza specificarne ancora il significato. **[da chat, da confermare da Matteo]**

**Motivazione:** Matteo ha risposto «B» alla domanda su chi immagini davanti al primissimo prototipo, «A» sull'automazione della forza cosmica e «D» sul formato finale. **[da chat, da confermare da Matteo]**

**Data:** 2026-10-29

**Documento interessato:** futuro `CT_PROTOTYPE_SCOPE.md`; futuro `CT_TECHNICAL_ARCHITECTURE.md`.

**Alternative considerate:**
- **A - Prototipo cartaceo:** carte e territori fisici; facile cambiare regole, ma forza cosmica e automazioni devono essere gestite manualmente. **[da chat, da confermare da Matteo]**
- **B - Hotseat digitale:** due persone sullo stesso dispositivo; consente di testare interfaccia e automazioni, ma complica informazioni personali sullo stesso schermo. **[da chat, da confermare da Matteo]**
- **C - Digitale contro avversario automatico semplice:** provabile da soli, ma richiede un comportamento automatico dell'avversario. **[da chat, da confermare da Matteo]**
- **D - Altro:** soluzione diversa o combinazione da specificare. **[da chat, da confermare da Matteo]**

**Conseguenze / documenti influenzati:** Prototype Scope; automazione della forza cosmica; modalità di test; eventuale necessità di avversario automatico; Technical Architecture.

**Sostituisce:** Nessuna.

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

## CT-DES-014 - Motore di gioco

**Stato:** PROPOSTA

**Decisione:** Il motore di gioco non è ancora scelto. Matteo immagina Cosmic Horror come 2D con elementi 3D significativi e considera molto importante mantenere il progetto relativamente semplice e controllabile con Claude sul codice. Ha delegato la scelta del motore a una valutazione di Copilot e Claude, con attenzione a ciò che Claude sa usare meglio. **[da chat, da confermare da Matteo]**

**Motivazione:** Matteo ha risposto «B» alla direzione visiva, «A» all'importanza della semplicità/controllabilità e «Sinceramente non so, lascio scegliere a te e claude, forse col fatto che dovrò farlo claude lasciamo scegliere a lui cosa sa usare meglio» alla scelta del motore. **[da chat, da confermare da Matteo]**

**Data:** 2026-10-29

**Documento interessato:** futuro `CT_TECHNICAL_ARCHITECTURE.md`; `07-development/`; Build & Deployment.

**Alternative considerate:**
- Direzione visiva: **A** prevalentemente 2D; **B** 2D con elementi 3D significativi; **C** esperienza 3D vera e propria; **D** non ancora deciso. **[da chat, da confermare da Matteo]**
- Complessità operativa con Claude: **A** conta molto; **B** abbastanza, accettando maggiore complessità; **C** non è criterio importante. **[da chat, da confermare da Matteo]**
- Motore: **A** Godot; **B** Unity; **C** Unreal Engine; **D** non scegliere ancora; **E** altro. **[da chat, da confermare da Matteo]**

**Conseguenze / documenti influenzati:** Technical Architecture; struttura del repository; linguaggio e organizzazione del codice; pipeline di build; target PC/mobile; pipeline 2D/3D; workflow operativo di Claude.

**Sostituisce:** Nessuna.

---

## Nota sulle fonti

Le quattro voci CT-DES-011 - CT-DES-014 derivano dalla presente intervista e sono pertanto marcate **[da chat, da confermare da Matteo]** nei campi che ne utilizzano direttamente domande, alternative o risposte. Tutte restano `PROPOSTA`.
