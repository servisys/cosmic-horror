# Cosmic Horror - installa l'esecuzione automatica dei TASK di scambio sul PC Windows.
#
# Cosa fa:
#   1. controlla che git e Claude Code ci siano;
#   2. crea la cartella di lavoro del branch "scambio" (git worktree, separata dal repository di lavoro);
#   3. copia osserva-scambio.ps1 in %USERPROFILE%\CosmicHorrorScambio (cosi' non dipende dal branch aperto nel repository;
#      NON in %LOCALAPPDATA%: l'app Claude per Windows e' un'app a pacchetto e li' i file che crea sono virtuali, invisibili all'Utilita' di pianificazione);
#   4. registra l'attivita' pianificata "CosmicHorror-Scambio": ogni minuto e all'accesso, nascosta, con l'utente corrente.
#
# Uso (da PowerShell, nella cartella strumenti\windows-scambio del repository):
#   powershell -NoProfile -ExecutionPolicy Bypass -File .\installa.ps1
# Si puo' rilanciare: aggiorna lo script copiato e l'attivita'.
# Solo caratteri ASCII in questo file.

param(
  [string]$Repo = (Join-Path $env:USERPROFILE 'cosmic-horror'),
  [string]$Scambio = (Join-Path $env:USERPROFILE 'cosmic-horror-scambio'),
  [string]$Base = (Join-Path $env:USERPROFILE 'CosmicHorrorScambio'),
  [string]$Claude = '',
  [int]$TimeoutMinuti = 90
)

$ErrorActionPreference = 'Stop'
$NomeAttivita = 'CosmicHorror-Scambio'
$Utf8 = New-Object System.Text.UTF8Encoding($false)

function Ferma([string]$m) { Write-Host "ERRORE: $m" -ForegroundColor Red; exit 1 }
function Ok([string]$m) { Write-Host "OK  $m" -ForegroundColor Green }

# --- 1. prerequisiti
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { Ferma 'git non trovato nel PATH.' }
Ok 'git presente'

if (-not $Claude) {
  foreach ($c in @((Join-Path $env:USERPROFILE '.local\bin\claude.exe'), (Join-Path $env:APPDATA 'npm\claude.cmd'))) {
    if (Test-Path $c) { $Claude = $c; break }
  }
  if (-not $Claude) {
    $cmd = Get-Command claude -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($cmd) { $Claude = $cmd.Source }
  }
}
if (-not $Claude -or -not (Test-Path $Claude)) { Ferma 'Claude Code non trovato. Installarlo o passare -Claude con il percorso di claude.exe.' }
Ok "Claude Code: $Claude"

if (-not (Test-Path (Join-Path $Repo '.git'))) { Ferma "Il repository non c'e': $Repo" }
Ok "repository: $Repo"

# --- 2. cartella di lavoro del branch scambio
$ErrorActionPreference = 'Continue'
& git -C $Repo fetch --quiet origin scambio 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) { Ferma "Il branch 'scambio' non esiste su GitHub o la rete non risponde." }
if (Test-Path (Join-Path $Scambio '.git')) {
  Ok "cartella di scambio gia' presente: $Scambio"
} else {
  if (Test-Path $Scambio) { Ferma "La cartella $Scambio esiste ma non e' un worktree git: spostarla o sceglierne un'altra con -Scambio." }
  $out = & git -C $Repo worktree add -B scambio $Scambio origin/scambio 2>&1
  if ($LASTEXITCODE -ne 0) { Ferma "git worktree add non riuscito: $out" }
  & git -C $Scambio branch --quiet --set-upstream-to=origin/scambio scambio 2>&1 | Out-Null
  Ok "cartella di scambio creata: $Scambio"
}
$ErrorActionPreference = 'Stop'

# --- 3. copia dello script
if ($Base.StartsWith($env:LOCALAPPDATA, [StringComparison]::OrdinalIgnoreCase)) {
  Write-Host "ATTENZIONE: $Base sta sotto AppData\Local: se questo script e' lanciato da un'app a pacchetto (per esempio l'app Claude) i file risulteranno invisibili all'Utilita' di pianificazione. Meglio una cartella sotto $env:USERPROFILE." -ForegroundColor Yellow
}
New-Item -ItemType Directory -Force -Path $Base | Out-Null
$Script = Join-Path $Base 'osserva-scambio.ps1'
Copy-Item -Force (Join-Path $PSScriptRoot 'osserva-scambio.ps1') $Script
Ok "script copiato in $Script"

# avvio nascosto: wscript lancia PowerShell senza far comparire la finestra ogni minuto
$Avvio = Join-Path $Base 'avvia-nascosto.vbs'
$riga = 'powershell.exe -NoProfile -ExecutionPolicy Bypass -File ""' + $Script + '"" -Repo ""' + $Repo + '"" -Scambio ""' + $Scambio + '"" -Base ""' + $Base + '"" -Claude ""' + $Claude + '"" -TimeoutMinuti ' + $TimeoutMinuti
$vbs = 'CreateObject("WScript.Shell").Run "' + $riga + '", 0, True'
[IO.File]::WriteAllText($Avvio, $vbs + "`r`n", (New-Object System.Text.ASCIIEncoding))
Ok "avvio nascosto: $Avvio"

# --- 4. attivita' pianificata
$utente = "$env:USERDOMAIN\$env:USERNAME"
$azione = New-ScheduledTaskAction -Execute 'wscript.exe' -Argument ('"' + $Avvio + '"')
$ogniMinuto = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 1)
$accesso = New-ScheduledTaskTrigger -AtLogOn -User $utente
$imp = New-ScheduledTaskSettingsSet -MultipleInstances IgnoreNew -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
  -ExecutionTimeLimit (New-TimeSpan -Minutes ($TimeoutMinuti + 30))
$chi = New-ScheduledTaskPrincipal -UserId $utente -LogonType Interactive -RunLevel Limited

if (Get-ScheduledTask -TaskName $NomeAttivita -ErrorAction SilentlyContinue) {
  Unregister-ScheduledTask -TaskName $NomeAttivita -Confirm:$false
}
Register-ScheduledTask -TaskName $NomeAttivita -Action $azione -Trigger @($ogniMinuto, $accesso) -Settings $imp -Principal $chi `
  -Description 'Cosmic Horror: esegue con Claude Code i TASK.md del branch scambio (strumenti/windows-scambio).' | Out-Null
Ok "attivita' pianificata registrata: $NomeAttivita (ogni minuto e all'accesso)"

Write-Host ''
Write-Host "Fatto. Per vedere a che punto e':"
Write-Host "  powershell -NoProfile -ExecutionPolicy Bypass -File `"$Script`" -Stato"
