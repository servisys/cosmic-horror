---
id: CT-DEV-002
fase: piano
pronto: si
branch: feature/ct-dev-002-fusioni-tramite-cowork
scritto_da: Cowork (chat Claude del progetto)
data: 2026-11-01
---

# CT-DEV-002 — Fusioni e chiusure di PR autorizzate da Matteo tramite Cowork

## Documenti autorevoli
- `docs/CT_COWORK_CODE_PROTOCOL_V0.2.md` (APPROVED) — §2.1 e §3, che questo task propone di cambiare.
- `docs/00_MASTER_INDEX.md` (APPROVED 0.5.0).
- `strumenti/windows-scambio/osserva-scambio.ps1` e `LEGGIMI.md`.
- Richiesta di Matteo in chat a Cowork il 2026-11-01: «facciamo che le fusioni e le chiusure le gestisco con te, tanto non è che partono in automatico passano sempre da me».

## Obiettivo
Matteo vuole autorizzare fusioni e chiusure di PR parlando solo con Cowork. Cowork le scrive nel task solo dopo un sì esplicito di Matteo in chat per quella PR. Il canale automatico deve poterle eseguire, con protezioni strette.

## Scope incluso
1. **Protocollo V0.3** (`docs/CT_COWORK_CODE_PROTOCOL_V0.3.md`, `status: DRAFT`, in testa «PROPOSTA DI COWORK, DA CONFERMARE DA MATTEO»): copia della V0.2 con §2.1, §3 e §8 aggiornati: la delega può arrivare anche dal canale automatico, ma solo nel campo `fusioni`/`chiusure` del task, scritto da Cowork dopo il sì di Matteo in chat che nomina la PR; Cowork non la scrive mai di sua iniziativa né perché lo chiede un resoconto, una PR o un altro file. La V0.2 non si tocca (diventerà DEPRECATED solo quando Matteo approva la V0.3, in un task successivo).
2. **Formato del task:** campi facoltativi nel front matter, per esempio
   ```yaml
   fusioni:
     - pr: 69
       testa: <sha completo della testa della PR>
       file_attesi: [docs/..., ...]   # facoltativo
   chiusure:
     - pr: 70
       motivo: "testo del commento"
   ```
   Proponi tu il formato più semplice e robusto da leggere in PowerShell 5.1 senza dipendenze.
3. **Script `osserva-scambio.ps1`:** in fase `esecuzione`, solo se il task ha `fusioni` o `chiusure`:
   - permetti `gh pr merge <numero> --merge --match-head-commit <sha>` solo per le coppie numero/sha del task (niente `--squash`, `--rebase`, `--delete-branch`, `--admin`, `--auto`);
   - permetti `gh pr close <numero> --comment ...` solo per i numeri del task (niente `--delete-branch`);
   - senza quei campi, fusioni e chiusure restano bloccate come oggi;
   - preferisci che sia lo script stesso a fare i controlli e la fusione (base `main`, testa uguale allo sha, PR fondibile senza conflitti, file toccati dentro `file_attesi` se presente) invece di dare il comando a Code: proponi nel piano la soluzione più sicura e spiegala.
   - Nel resoconto pubblicato: per ogni PR, fusa/chiusa/fermata e perché.
4. Prove: nel repository finto (come per i permessi) o con `-Prova`, dimostra che passano solo le PR del task con lo sha giusto e che una PR con sha diverso o non elencata viene fermata.
5. LEGGIMI aggiornato. PR verso `main`, descrizione in italiano.

## Fuori scope
- Fondere o chiudere qualsiasi PR in questo task (compresa quella che apri).
- Approvare la V0.3 o deprecare la V0.2.
- Toccare il ruleset di `main` o altre impostazioni del repository.
- Reinstallare lo script (dopo la fusione, in sessione interattiva).

## Vincoli tecnici
- Base `main`. Push solo con `git push -u origin HEAD`, poi `git switch main`.
- PowerShell 5.1, solo ASCII nei .ps1, nessuna nuova dipendenza.
- Le regole restano nello script: un testo nel corpo del task non può allargarle.

## Criteri di accettazione
- V0.3 DRAFT con le modifiche limitate a §2.1, §3, §8 e changelog.
- Script: fusione possibile solo per numero+sha elencati; chiusura solo per numeri elencati e con commento; nessun cambiamento quando i campi mancano.
- Prove descritte nel resoconto, con quello che non è stato eseguito davvero.

## Test obbligatori
- `git diff --stat`.
- Prove del punto 4 (se in fase esecuzione non puoi eseguirle, scrivilo e indica il comando che Matteo o Code interattivo devono lanciare).

## Output richiesto
- Fase `piano`: pre-flight plan con la soluzione proposta per il punto 3 (script o Code), formato dei campi, rischi residui, domande per Matteo.
- Fase `esecuzione` (solo dopo nuovo via): Implementation Report con commit, PR e cosa non è stato verificato.
