// Dati per il browser: i file YAML di docs/03-cards-content/01-card-database/ entrano nella build come testo (unica fonte, CT-DES-018).
import { datiDaTesti, versionePiuAlta } from '../dati/leggi.js';

const carte = import.meta.glob('../../../../docs/03-cards-content/01-card-database/CT_CARTE_PROTOTIPO_V*.yaml', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const eventi = import.meta.glob('../../../../docs/03-cards-content/01-card-database/CT_EVENTI_COSMICI_PROTOTIPO_V*.yaml', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

export function datiDelBuild() {
  const fc = versionePiuAlta(Object.keys(carte), 'CT_CARTE_PROTOTIPO');
  const fe = versionePiuAlta(Object.keys(eventi), 'CT_EVENTI_COSMICI_PROTOTIPO');
  return datiDaTesti(fc.split('/').pop()!, carte[fc], fe.split('/').pop()!, eventi[fe]);
}
