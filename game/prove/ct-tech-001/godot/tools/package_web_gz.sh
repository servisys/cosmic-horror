#!/usr/bin/env bash
# Prepara una variante di build/web con il wasm compresso (gzip), per hosting con limite di dimensione per file.
# Il browser decomprime con DecompressionStream; serve solo un piccolo shim in index.html.
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf build/web-gz && cp -r build/web build/web-gz
gzip -9 -f build/web-gz/index.wasm
python3 - <<'PY'
p = "build/web-gz/index.html"
s = open(p, encoding="utf-8").read()
shim = """<script>
(function () {
  const originale = window.fetch.bind(window);
  window.fetch = async function (input, init) {
    const url = typeof input === 'string' ? input : input.url;
    if (url.endsWith('index.wasm')) {
      const r = await originale(url + '.gz', init);
      const flusso = r.body.pipeThrough(new DecompressionStream('gzip'));
      return new Response(flusso, { status: 200, headers: { 'Content-Type': 'application/wasm' } });
    }
    return originale(input, init);
  };
})();
</script>
"""
marker = '<script src="index.js"></script>'
assert marker in s, "marker non trovato in index.html"
open(p, "w", encoding="utf-8").write(s.replace(marker, shim + marker, 1))
PY
ls -la build/web-gz
