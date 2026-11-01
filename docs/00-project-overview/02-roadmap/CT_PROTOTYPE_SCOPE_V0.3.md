---
title: Cosmic Horror - Specifica del primo prototipo giocabile
status: APPROVED
version: 0.3.0
owner: Matteo
prepared_by: Cowork
project_prefix: CT_
last_reviewed: 2026-11-01
supersedes: CT_PROTOTYPE_SCOPE_V0.2.md
related_documents:
  - ../../01-game-design/01-core-rules/
  - ../03-decisions-changelog/
  - ../../03-cards-content/01-card-database/
  - ../../02-universe-lore/
---

# Cosmic Horror - Specifica del primo prototipo giocabile

> **APPROVATA DA MATTEO il 2026-10-31 (CT-DES-063).** Preparata da Cowork. Claude Code può implementare il prototipo seguendo questa specifica (Master Index, §1). Ogni modifica passa da una nuova versione.
>
> **V0.3 (2026-11-01):** modificate solo le due righe sui territori, conseguenza della decisione registrata CT-DES-069 (il campo passa da 3 a 5 territori). Il resto è identico alla V0.2.

## 1. Obiettivo

Una **partita completa** di Cosmic Horror giocabile da una persona contro il computer, **nel browser del PC e del telefono**, per mettere alla prova le regole base con partite vere (playtest). Non è il gioco finale: serve a capire se le regole funzionano, se la durata è giusta e se le fazioni sono equilibrate.

## 2. Cosa contiene

| Elemento | Riferimento |
|---|---|
| Regole base complete, versione approvata | Core Rules V0.8 (CT-DES-021…058) |
| Due fazioni da 40 carte, 5 territori con riserve, 20 eventi cosmici | file dati V0.7 (CT-DES-047, 054, 060, 062, 069, 073) |
| Una persona contro il computer; il giocatore sceglie la fazione | CT-DES-011 |
| Computer con le priorità fisse di fazione; non vede le carte nascoste | CT-DES-016, 045 |
| Forza cosmica automatica, tipo del prossimo evento visibile | CT-DES-010, 035 |
| Segnale di vittoria e turno di avviso; tappe consolidate | CT-DES-015, 056 |
| Partita ripetibile: seme della casualità e registro di tutte le mosse | CT-DES-019 |
| Carte, fazioni, territori ed eventi letti dai file dati, non scritti nel codice | CT-DES-018 |
| Illustrazioni scelte da Matteo e citazioni in fondo alle carte | CT-DES-061, 062 |
| Interfaccia in italiano | — |

## 3. Cosa NON contiene (per ora)

- costruzione del mazzo, collezione, negozio, economia;
- partite tra due persone, gioco online, classifiche;
- app installabili (Windows, macOS, Android, iOS): rimandate (decisione del 31 ottobre);
- tutorial completo: basta una schermata di regole in breve;
- musica ed effetti sonori;
- animazioni elaborate: solo quelle che aiutano a capire cosa succede (carta giocata, evento cosmico, segnale di vittoria).

## 4. Come si gioca sullo schermo (flusso)

1. **Schermata iniziale:** scegli la fazione (Custodi o Risvegliati); facoltativo: seme della partita.
2. **Campo:** i 5 territori al centro; per ognuno forza delle due parti, instabilità, tappe, effetto del territorio.
3. **In basso:** la tua mano, l'energia, l'esposizione. **In alto:** l'avversario (carte in mano coperte, energia, esposizione, tappe) e il tipo del prossimo evento cosmico.
4. **Giocare una carta:** tocchi la carta, poi il territorio (se serve). Le azioni base (Sigillo o rito, ridurre l'esposizione) sono pulsanti.
5. **Fine turno:** pulsante. Il computer gioca il suo turno mostrando una mossa alla volta, con un breve testo («Il Profondo di Innsmouth entra a Innsmouth»).
6. **Fine giro:** si mostra l'evento cosmico con l'illustrazione e la citazione.
7. **Segnale di vittoria:** ben visibile, con la scritta del turno di avviso.
8. **Fine partita:** chi ha vinto, in quanti giri, e il pulsante **«Copia il registro della partita»** per mandarlo a Cowork e Code.
9. **Carta ingrandita:** tenendo premuto (telefono) o passando sopra (PC) si legge la carta intera con citazione.

## 5. Leggibilità sul telefono

- Deve funzionare con il telefono **in orizzontale** (956×440, misura già usata nelle prove) e su PC (1280×800). Il verticale non è richiesto (§9).
- Testi minimi leggibili senza ingrandire; numeri importanti (forza, energia, instabilità, esposizione) grandi.
- Ogni informazione importante visibile senza scorrere.

## 6. Tecnica

- Percorso web registrato (CT-DES-014), TypeScript, Vite; PixiJS per campo e interfaccia, three.js solo per effetti delle carte se servono (CT-DES-017).
- **Nuova cartella** `game/prototipo/` (CT-DES-020); le prove in `game/prove/` restano storia.
- **Logica di gioco separata dall'interfaccia:** un «motore delle regole» senza grafica, che riceve mosse e restituisce lo stato. L'avversario è un modulo a parte che sceglie mosse usando solo le informazioni visibili.
- **Determinismo:** stesso seme e stesse mosse producono la stessa partita.
- Test automatici sul motore (regole una per una) e partite simulate computer contro computer.
- I file dati sono quelli in `docs/03-cards-content/01-card-database/`, unica fonte: il prototipo li legge in fase di build. Il modo preciso lo descrive la nota di architettura che Code prepara con la tappa 1.

## 7. Tappe di lavoro e come si verificano

| Tappa | Cosa fa Code | Come si verifica |
|---|---|---|
| **1. Motore delle regole** | logica completa senza grafica, lettura dei file dati, registro, seme | test su ogni regola; 1000 partite computer contro computer con risultati simili al simulatore di Cowork (equilibrio, durata) |
| **2. Avversario e forza cosmica** | priorità di fazione, eventi, segnale e avviso | test e partite simulate; nessuna mossa illegale |
| **3. Interfaccia giocabile** | campo, mano, mosse, turno del computer, fine partita | partita completa giocata da Code con Playwright su PC e telefono orizzontale; screenshot |
| **4. Carte complete** | illustrazioni scelte, citazioni, carta ingrandita | screenshot; controllo leggibilità a 956×440 |
| **5. Pubblicazione per il playtest** | una versione che Matteo apre dal telefono | Matteo gioca almeno 3 partite e manda i registri |

Ogni tappa passa da una PR fusa da Matteo (o su sua delega). Dopo la tappa 5, Cowork analizza i registri e propone correzioni con nuove decisioni.

## 8. Criteri di accettazione del prototipo

- una partita dall'inizio alla fine senza errori, con entrambe le fazioni;
- tutte le regole della Core Rules V0.8 rispettate (test automatici);
- durata media, con il computer contro il computer, entro la fascia del simulatore (circa 8-10 giri);
- giocabile su telefono in orizzontale senza ingrandire;
- registro della partita copiabile e ripetibile con lo stesso seme.

## 9. Scelte di Matteo (CT-DES-063)

1. **Dove si gioca:** su un link privato di Claude (una pagina pubblicata, apribile dal telefono senza installare nulla).
2. **Telefono:** solo in orizzontale.
3. **Grafica della prima versione:** essenziale: riquadri puliti, numeri grandi, illustrazioni. La grafica curata viene dopo il playtest.
4. **Turno del computer:** una mossa alla volta, con una breve pausa e una frase che spiega cosa fa.

## Changelog

| Versione | Stato | Modifica |
|---|---|---|
| 0.1.0 | DRAFT | Prima stesura di Cowork. |
| 0.2.0 | APPROVED | Approvata da Matteo con le quattro scelte del §9 (CT-DES-063). |
| 0.3.0 | APPROVED | Conseguenza della decisione registrata CT-DES-069 (cinque territori): modificate solo la riga dei territori nella tabella del §2 (5 territori, file dati V0.7, CT-DES-069 e 073) e la riga del campo nel §4 (5 territori). Il resto è invariato; la V0.2 diventa DEPRECATED. |
