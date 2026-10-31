---
title: Cosmic Horror - Valutazione del motore di gioco (Claude)
status: DRAFT
version: 0.1.0
owner: Team Cosmic Horror
prepared_by: Claude
project_prefix: CT_
related_documents:
  - ../../00-project-overview/03-decisions-changelog/CT_DECISIONI_V0.4_ESITO_TECNICO.md
  - ../../00-project-overview/03-decisions-changelog/CT_DECISION_LOG_VOCI_PROPOSTE_V0.4.md # storico: non in main, presente nella storia del branch della PR #15
---

# Cosmic Horror - Valutazione del motore di gioco (Claude)

> **PROPOSTA TECNICA DI CLAUDE, DA CONFERMARE DA MATTEO.** Matteo ha delegato la scelta a Copilot e Claude (CT-DES-014). Questo documento è l'input di Claude: non è una decisione e non autorizza implementazione. Va confrontato con la valutazione indipendente di Copilot.

## 1. Criteri (dalle risposte di Matteo)

1. Visivamente **2D con elementi 3D significativi**.
2. Progetto **semplice e controllabile con Claude che lavora sul codice** (conta «molto»).
3. **PC e mobile/tablet** fin dal primo prototipo, con interfacce anche molto diverse.
4. **Digital-first**: forza cosmica, stati dei territori e trasformazioni del mazzo automatici.
5. Prototipo usabile da **una persona sola**, partite di **10-15 minuti**.

## 2. Confronto sintetico

| | Godot 4 | Unity | Unreal | Web: TypeScript + PixiJS/Phaser (+ three.js) + Capacitor |
|---|---|---|---|---|
| Adatto a un gioco di carte 2D | molto | molto | poco (eccessivo) | molto |
| Elementi 3D | buono | molto buono | eccellente | accettabile se limitati |
| File leggibili e modificabili da Claude | buono: scene `.tscn` e script `.gd` testuali | medio: scene testuali ma pesanti, molti file `.meta` | scarso: asset binari (Blueprint) | **ottimo**: solo codice e JSON |
| Controllo visivo del risultato da parte di Claude | difficile senza configurare cattura schermo | difficile | molto difficile | **facile**: test e screenshot automatici in browser |
| Test automatici delle regole | possibili (strumenti meno diffusi) | possibili | difficili | **molto facili**, regole in codice puro senza grafica |
| Mobile (Android/iOS) | buono; iOS richiede Xcode | molto buono | pesante | buono via Capacitor |
| Prova da parte di tester non tecnici | serve installare l'app | serve installare l'app | serve installare l'app | **basta un link** nel browser |
| Licenza e costi | libera, senza royalty | condizioni cambiate in passato: da verificare | royalty oltre soglia: da verificare | librerie libere |
| Rapporto con la struttura attuale dello studio | richiede installazioni nuove sul Mac | idem, più pesanti | idem | **riusa** Node, Playwright, Capacitor e le procedure di pubblicazione già usate per HRC e mandi |

## 3. Raccomandazione

**Primo prototipo: TypeScript + PixiJS (o Phaser) per il 2D, three.js solo per gli elementi 3D, con le regole del gioco in un modulo separato senza grafica.** Si prova nel browser su PC e su telefono; il confezionamento per Android e iOS con Capacitor viene dopo, quando il gioco ha dimostrato di funzionare.

Perché:
1. **Il vincolo che pesa di più è «Claude sul codice»:** il codice TypeScript è ciò che Claude scrive e verifica con più affidabilità, e il risultato si può controllare in modo automatico (test delle regole, simulazioni di partite complete, screenshot).
2. **Il cuore del gioco sono le regole**, non la grafica: forza cosmica, stati dei territori e vittorie vanno simulati migliaia di volte per misurare le partite da 10-15 minuti. Con le regole separate dalla grafica questo è semplice.
3. **Prova su PC e telefono dal primo giorno,** senza installazioni, e condivisione con i tester tramite un link.
4. **Nessuna infrastruttura nuova** sul Mac di build: gli strumenti ci sono già.

## 4. Quando cambierei idea (Godot come alternativa)

- se gli elementi 3D diventano centrali (scene 3D in tempo reale, non decorazioni);
- se i test su telefoni di fascia bassa mostrano prestazioni insufficienti con il browser;
- se si preferisce un lavoro guidato da editor visuale con più artisti.

In quel caso **Godot 4** è la seconda scelta: struttura testuale, licenza libera, il repository è già impostato per Godot. **Unity e Unreal le sconsiglio** per questo progetto: più pesanti, con meno controllo da parte di Claude.

## 5. Cosa non so

- Non ho provato ancora nessuno dei due percorsi su questo progetto: la raccomandazione si basa su conoscenza generale e sulla descrizione degli strumenti dello studio (Mac di build, progetti HRC e mandi).
- Cosa significhi «elementi 3D significativi»: quanto sono centrali cambia la scelta.
- Il significato di «D» sul formato del prototipo (CT-DES-011): se serve un avversario automatico cambia il carico di lavoro, non il motore.

## 6. Prova economica prima di impegnarsi

Una **fetta verticale** di uno o due giorni: un territorio, una carta, un evento cosmico automatico e la condizione di vittoria, con le regole in modulo separato, provata su PC e su un telefono. Si valutano velocità, resa su mobile e semplicità di lavoro. Se la prova convince, si procede; se no, si ripete la stessa fetta in Godot.

## 7. Decisione richiesta

Matteo conferma, dopo aver letto anche la valutazione indipendente di Copilot: motore di riferimento per il prototipo (raccomandato: stack web TypeScript) oppure Godot. La conferma va registrata come aggiornamento di CT-DES-014.
