"""Converte le illustrazioni scelte in WebP leggeri per il telefono (lato lungo 800 px).
Uso: python converti-illustrazioni.py <scelte.json> <radice_repo> [segnaposto_per_null.jpg]
Il JSON ha {"scelte": {"<id carta>": "<percorso relativo alla radice>" | null}}; il nome del file prodotto e' l'id della carta.
Dipendenza: pillow."""
import json, os, sys
from PIL import Image

scelte = json.load(open(sys.argv[1], encoding='utf-8'))['scelte']
radice = sys.argv[2]
segnaposto = sys.argv[3] if len(sys.argv) > 3 else None
uscita = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'src', 'assets', 'illustrazioni')
os.makedirs(uscita, exist_ok=True)
tot = 0
for id_, p in sorted(scelte.items()):
    sorgente = os.path.join(radice, p) if p else segnaposto
    if not sorgente:
        raise SystemExit(f'{id_}: nessuna immagine e nessun segnaposto')
    im = Image.open(sorgente).convert('RGB')
    im.thumbnail((800, 800), Image.LANCZOS)
    dest = os.path.join(uscita, id_ + '.webp')
    im.save(dest, 'WEBP', quality=72, method=6)
    tot += os.path.getsize(dest)
    print(id_, im.size, os.path.getsize(dest) // 1024, 'KB', '(segnaposto)' if not p else '')
print('totale', tot // 1024, 'KB', len(scelte), 'file')
