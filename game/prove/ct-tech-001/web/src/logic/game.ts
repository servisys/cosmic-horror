// Logica della fetta CT-TECH-001: nessuna dipendenza da grafica o DOM.
// FIXTURE TECNICA NON DI DESIGN: i valori vengono dal file fixture.json.

export interface Carta {
  id: string;
  proprietario: 'persona' | 'avversario';
  effetto: { imposta_stato: string };
}

export interface EventoCosmico {
  id: string;
  al_round: number;
  effetto: { imposta_stato: string };
}

export interface Fixture {
  carte: Carta[];
  territorio: { id: string; stato_iniziale: string };
  evento_cosmico: EventoCosmico;
}

export interface Gioco {
  fixture: Fixture;
  round: number;
  stato: string;
  carteGiocate: string[];
  eventiScattati: string[];
  log: string[];
}

export function creaGioco(fixture: Fixture): Gioco {
  return {
    fixture,
    round: 1,
    stato: fixture.territorio.stato_iniziale,
    carteGiocate: [],
    eventiScattati: [],
    log: ['Inizio partita di prova'],
  };
}

function clona(g: Gioco): Gioco {
  return { ...g, carteGiocate: [...g.carteGiocate], eventiScattati: [...g.eventiScattati], log: [...g.log] };
}

export function carteInMano(g: Gioco): Carta[] {
  return g.fixture.carte.filter((c) => c.proprietario === 'persona' && !g.carteGiocate.includes(c.id));
}

export function giocaCarta(g: Gioco, idCarta: string): Gioco {
  const carta = carteInMano(g).find((c) => c.id === idCarta);
  if (!carta) throw new Error(`Carta non giocabile: ${idCarta}`);
  const n = clona(g);
  n.carteGiocate.push(carta.id);
  n.stato = carta.effetto.imposta_stato;
  n.log.push(`Persona gioca ${carta.id}: stato = ${n.stato}`);
  return n;
}

// Avversario minimo: script tecnico, non IA di gioco.
function turnoAvversario(n: Gioco): void {
  const carta = n.fixture.carte.find((c) => c.proprietario === 'avversario' && !n.carteGiocate.includes(c.id));
  if (!carta) {
    n.log.push('Avversario passa');
    return;
  }
  n.carteGiocate.push(carta.id);
  n.stato = carta.effetto.imposta_stato;
  n.log.push(`Avversario gioca ${carta.id}: stato = ${n.stato}`);
}

export function fineTurno(g: Gioco): Gioco {
  const n = clona(g);
  turnoAvversario(n);
  n.round += 1;
  const ev = n.fixture.evento_cosmico;
  if (n.round === ev.al_round && !n.eventiScattati.includes(ev.id)) {
    n.eventiScattati.push(ev.id);
    n.stato = ev.effetto.imposta_stato;
    n.log.push(`Evento cosmico ${ev.id}: stato = ${n.stato}`);
  }
  return n;
}
