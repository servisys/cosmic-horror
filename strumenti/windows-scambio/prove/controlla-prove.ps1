# Cosmic Horror - controlla che osserva-scambio.ps1 -Prova dia, per ogni flusso di questa cartella (*.jsonl),
# esattamente il risultato atteso (<nome>.atteso.txt: resoconto, comandi.txt e riga dei comandi bloccati).
#   flusso-esempio.jsonl  flusso scritto a mano
#   flusso-reale.jsonl    flusso vero di claude -p (--output-format stream-json --verbose) con comandi eseguiti e bloccati,
#                         ripulito da percorsi e identificativi del PC
# Uso: powershell -NoProfile -ExecutionPolicy Bypass -File .\controlla-prove.ps1          (controlla)
#      powershell -NoProfile -ExecutionPolicy Bypass -File .\controlla-prove.ps1 -Scrivi  (riscrive i file attesi dopo un cambio voluto)
# Non lancia Code e non crea nulla fuori da questa cartella. Solo caratteri ASCII in questo file.

param([switch]$Scrivi)

$qui = $PSScriptRoot
$osserva = Join-Path (Split-Path $qui -Parent) 'osserva-scambio.ps1'
$Utf8 = New-Object System.Text.UTF8Encoding($false)
$ko = 0

foreach ($f in (Get-ChildItem $qui -Filter '*.jsonl' | Sort-Object Name)) {
  $atteso = Join-Path $qui ($f.BaseName + '.atteso.txt')
  $righe = & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $osserva -Prova $f.FullName 2>&1 | ForEach-Object { "$_" }
  $out = (($righe -join "`n") -replace "`r`n", "`n").TrimEnd()
  if ($Scrivi) {
    [IO.File]::WriteAllText($atteso, $out + "`n", $Utf8)
    Write-Host "scritto: $atteso"
    continue
  }
  if (-not (Test-Path $atteso)) { Write-Host "MANCA  $($f.Name): nessun file atteso ($($f.BaseName).atteso.txt)" -ForegroundColor Red; $ko++; continue }
  $att = (([IO.File]::ReadAllText($atteso, $Utf8)) -replace "`r`n", "`n").TrimEnd()
  if ($out -ceq $att) { Write-Host "OK     $($f.Name)" -ForegroundColor Green }
  else {
    Write-Host "DIVERSO $($f.Name): l'uscita di -Prova non coincide con $($f.BaseName).atteso.txt" -ForegroundColor Red
    $a = $att -split "`n"; $b = $out -split "`n"
    for ($i = 0; $i -lt [Math]::Max($a.Count, $b.Count); $i++) {
      $x = ''; $y = ''
      if ($i -lt $a.Count) { $x = $a[$i] }
      if ($i -lt $b.Count) { $y = $b[$i] }
      if ($x -cne $y) { Write-Host ("  riga {0}: atteso [{1}] trovato [{2}]" -f ($i + 1), $x, $y); break }
    }
    $ko++
  }
}
if ($Scrivi) { exit 0 }
if ($ko -gt 0) { Write-Host "$ko prove non riuscite" -ForegroundColor Red; exit 1 }
Write-Host 'Tutte le prove riuscite.' -ForegroundColor Green
exit 0
