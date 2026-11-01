# Cosmic Horror - controlla le regole di fusione e chiusura di osserva-scambio.ps1 senza fondere ne' chiudere nulla.
# Per ogni deleghe\task-*.md lancia osserva-scambio.ps1 -ProvaDeleghe con i dati finti deleghe\dati-pr.json e confronta
# l'uscita con deleghe\<nome>.atteso.txt. Dimostra che passano solo le PR elencate con lo sha giusto e che le altre vengono fermate.
# Uso: powershell -NoProfile -ExecutionPolicy Bypass -File .\controlla-deleghe.ps1          (controlla)
#      powershell -NoProfile -ExecutionPolicy Bypass -File .\controlla-deleghe.ps1 -Scrivi  (riscrive i file attesi dopo un cambio voluto)
# Solo caratteri ASCII in questo file.

param([switch]$Scrivi)

$cartella = Join-Path $PSScriptRoot 'deleghe'
$osserva = Join-Path (Split-Path $PSScriptRoot -Parent) 'osserva-scambio.ps1'
$dati = Join-Path $cartella 'dati-pr.json'
$Utf8 = New-Object System.Text.UTF8Encoding($false)
$ko = 0

foreach ($f in (Get-ChildItem $cartella -Filter 'task-*.md' | Sort-Object Name)) {
  $atteso = Join-Path $cartella ($f.BaseName + '.atteso.txt')
  $righe = & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $osserva -ProvaDeleghe $f.FullName -DatiPr $dati 2>&1 | ForEach-Object { "$_" }
  $out = (($righe -join "`n") -replace "`r`n", "`n").TrimEnd()
  if ($Scrivi) { [IO.File]::WriteAllText($atteso, $out + "`n", $Utf8); Write-Host "scritto: $atteso"; continue }
  if (-not (Test-Path $atteso)) { Write-Host "MANCA  $($f.Name): nessun file atteso" -ForegroundColor Red; $ko++; continue }
  $att = (([IO.File]::ReadAllText($atteso, $Utf8)) -replace "`r`n", "`n").TrimEnd()
  if ($out -ceq $att) { Write-Host "OK     $($f.Name)" -ForegroundColor Green }
  else {
    Write-Host "DIVERSO $($f.Name)" -ForegroundColor Red
    Write-Host "--- atteso`n$att`n--- trovato`n$out"
    $ko++
  }
}
if ($Scrivi) { exit 0 }
if ($ko -gt 0) { Write-Host "$ko prove non riuscite" -ForegroundColor Red; exit 1 }
Write-Host 'Tutte le prove riuscite.' -ForegroundColor Green
exit 0
