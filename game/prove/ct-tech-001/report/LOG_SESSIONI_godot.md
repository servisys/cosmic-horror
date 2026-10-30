# Log di sessione - percorso Godot 4 / GDScript (CT-TECH-001)

Tempi in UTC, ISO 8601, misurati con l'orologio del sistema (`date -u`). Fixture condivisa (non conta nel timebox): 2026-10-29T22:00:58Z - 22:01:17Z.
Il percorso Godot e' stato eseguito **dopo** il percorso web: ha riusato la fixture e l'esperienza di impostazione della fetta (possibile vantaggio di ordine, da considerare nella revisione).

| Sessione | Inizio | Fine | Durata | Attivita' | Commit |
|---|---|---|---|---|---|
| G1 | 2026-10-29T22:04:20Z | 2026-10-29T22:06:40Z | 2 min 20 s (di cui 5 s di attesa download, in pausa) | Ricerca della fonte di download (GitHub 403, host tuxfamily vuoto, trovato downloads.godotengine.org), download Godot 4.7.2, estrazione, avvio | - |
| G2 | 2026-10-29T22:06:40Z | 2026-10-29T22:08:30Z | 1 min 50 s | Progetto, logica, test headless, UI con elemento 3D, screenshot con schermo virtuale, due correzioni visive | - |
| pausa | 2026-10-29T22:08:30Z | 2026-10-29T22:09:50Z | 1 min 20 s | Attesa download dei template di export (1,28 GB): attesa esterna, **non conta** | - |
| G3 | 2026-10-29T22:09:50Z | 2026-10-29T22:11:41Z | 1 min 51 s | Installazione template web, export web, variante gzip per hosting, verifica in Chromium con clic reali | - |
| G4 | 2026-10-29T22:12:45Z | 2026-10-29T22:13:35Z | 50 s | Modifica comparativa (secondo stato): logica, UI, test; nuovi screenshot, nuovo export | (commit finale del branch) |
| G5 | 2026-10-29T22:14:30Z | 2026-10-29T22:14:42Z | 12 s | Ripetizione della procedura da pulito (import, export, test) | (commit finale del branch) |

**Totale cumulativo registrato: 6 min 58 s** (2:15 + 1:50 + 1:51 + 0:50 + 0:12; esclusa la pausa), limite: 4 ore.

Nota: sono tempi di orologio di un agente software, non ore di lavoro umano. Il percorso Godot ha richiesto piu' passi di preparazione (fonte di download, template), parte dei quali e' attesa esterna.

## Correzione di sola scala (orizzontale su telefono) - richiesta di Matteo dopo la prova sull'iPhone
| Sessione | Durata | Attivita' | File toccati |
|---|---|---|---|
| G4 | 0 min 48 s | Causa: dimensione base verticale 390x844 con scalatura "expand": in orizzontale tutto si riduceva a meta'. Base portata a 400x400 (la scala segue il lato corto); test, 4 formati di screenshot nativi, re-import, export web, variante gzip, ripubblicazione della pagina privata | `godot/project.godot` (due valori; nessuna modifica a logica, fixture, contenuti) |
Tentativi: 1. Errori: 0. Regressioni: 0 (8 asserzioni su 8; PC e verticale verificati con screenshot). Passaggi manuali extra per la pubblicazione: incorporare il nuovo `.pck` nella pagina (lo stesso adattamento dell'host gia' descritto). Il tempo non include la prova sul telefono reale.
