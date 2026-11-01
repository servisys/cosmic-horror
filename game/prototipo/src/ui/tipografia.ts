// Caratteri del gioco: Cinzel (titoli, numeri) e Crimson Text (testi), entrambi con licenza SIL OFL, inclusi come file nel progetto
// (src/assets/font/, con i file di licenza). Si caricano prima del primo disegno, cosi' i testi della scena non cambiano forma dopo.
import cinzel from '../assets/font/Cinzel.woff2?url';
import crimsonRegolare from '../assets/font/CrimsonText-Regular.woff2?url';
import crimsonCorsivo from '../assets/font/CrimsonText-Italic.woff2?url';
import crimsonSemi from '../assets/font/CrimsonText-SemiBold.woff2?url';
import crimsonGrassetto from '../assets/font/CrimsonText-Bold.woff2?url';

export const FONT_TITOLI = "Cinzel, 'Times New Roman', serif";
export const FONT_TESTO = "'Crimson Text', Georgia, 'Times New Roman', serif";

export async function caricaFont(): Promise<void> {
  if (typeof document === 'undefined' || !('fonts' in document)) return;
  const facce = [
    new FontFace('Cinzel', `url(${cinzel})`, { weight: '400 900' }),
    new FontFace('Crimson Text', `url(${crimsonRegolare})`, { weight: '400', style: 'normal' }),
    new FontFace('Crimson Text', `url(${crimsonCorsivo})`, { weight: '400', style: 'italic' }),
    new FontFace('Crimson Text', `url(${crimsonSemi})`, { weight: '600', style: 'normal' }),
    new FontFace('Crimson Text', `url(${crimsonGrassetto})`, { weight: '700', style: 'normal' }),
  ];
  const caricate = Promise.all(
    facce.map(async (f) => {
      try {
        document.fonts.add(await f.load());
      } catch {
        // carattere non arrivato: il browser usa quello di riserva (serif)
      }
    }),
  );
  // se il caricamento si blocca il gioco parte lo stesso con i caratteri di riserva
  await Promise.race([caricate, new Promise<void>((r) => setTimeout(r, 6000))]);
}
