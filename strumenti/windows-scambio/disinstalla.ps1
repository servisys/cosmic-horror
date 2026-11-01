# Cosmic Horror - toglie l'esecuzione automatica dei TASK di scambio.
#
# Uso: powershell -NoProfile -ExecutionPolicy Bypass -File .\disinstalla.ps1 [-AncheCartella]
#   senza opzioni: toglie solo l'attivita' pianificata (log e cartella di scambio restano)
#   -AncheCartella: toglie anche la cartella di lavoro del branch scambio (git worktree remove)
# Solo caratteri ASCII in questo file.

param(
  [string]$Repo = (Join-Path $env:USERPROFILE 'cosmic-horror'),
  [string]$Scambio = (Join-Path $env:USERPROFILE 'cosmic-horror-scambio'),
  [string]$Base = (Join-Path $env:USERPROFILE 'CosmicHorrorScambio'),
  [switch]$AncheCartella
)

$NomeAttivita = 'CosmicHorror-Scambio'

if (Get-ScheduledTask -TaskName $NomeAttivita -ErrorAction SilentlyContinue) {
  Unregister-ScheduledTask -TaskName $NomeAttivita -Confirm:$false
  Write-Host "Attivita' pianificata $NomeAttivita tolta."
} else {
  Write-Host "Attivita' pianificata $NomeAttivita non presente."
}

if ($AncheCartella -and (Test-Path (Join-Path $Scambio '.git'))) {
  & git -C $Repo worktree remove $Scambio 2>&1 | Out-Host
  if ($LASTEXITCODE -eq 0) { Write-Host "Cartella di scambio tolta: $Scambio" }
  else { Write-Host "La cartella di scambio non e' stata tolta (ha modifiche?): $Scambio" }
}

Write-Host "Log e storico delle esecuzioni restano in $Base."
