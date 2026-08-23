import type { PuzzleMove, TrainingCategory, TrainingPuzzle } from '../training-types';

interface PuzzleSeed {
  readonly category: TrainingCategory;
  readonly title: string;
  readonly fen: string;
  readonly solution: PuzzleMove;
  readonly objective: string;
  readonly explanation: string;
  readonly alternative: string;
}

const MATE_PATTERNS: readonly PuzzleSeed[] = [
  { category: 'mate-in-1', title: 'Red de mate en la esquina', fen: '7k/8/5KQ1/8/8/8/8/8 w - - 0 1', solution: { from: 'g6', to: 'g7' }, objective: 'Cerrar las casillas de escape del rey rival.', explanation: 'La dama llega a g7 protegida por el rey blanco y entrega mate.', alternative: 'Busca una jaula alrededor del rey antes de calcular capturas.' },
  { category: 'mate-in-1', title: 'Dama protegida', fen: '7k/5Q2/5K2/8/8/8/8/8 w - - 0 1', solution: { from: 'f7', to: 'g7' }, objective: 'Cerrar las casillas de escape del rey rival.', explanation: 'La dama llega a g7 protegida por el rey blanco y entrega mate.', alternative: 'Busca una jaula alrededor del rey antes de calcular capturas.' },
  { category: 'mate-in-1', title: 'Ascenso de la dama', fen: '7k/8/5K2/6Q1/8/8/8/8 w - - 0 1', solution: { from: 'g5', to: 'g7' }, objective: 'Cerrar las casillas de escape del rey rival.', explanation: 'La dama entra en la séptima fila con protección del rey.', alternative: 'La casilla de mate debe estar protegida.' },
  { category: 'mate-in-1', title: 'Mate en la esquina inferior', fen: '8/8/8/8/6Q1/5K2/8/7k w - - 0 1', solution: { from: 'g4', to: 'g2' }, objective: 'Cerrar las casillas de escape del rey rival.', explanation: 'La dama en g2 queda protegida y entrega mate.', alternative: 'Reconoce el mismo patrón en sentido inverso.' },
  { category: 'mate-in-1', title: 'Dama lateral inferior', fen: '8/8/8/8/8/5K2/5Q2/7k w - - 0 1', solution: { from: 'f2', to: 'g2' }, objective: 'Cerrar las casillas de escape del rey rival.', explanation: 'La dama se coloca junto al rey rival, defendida por su rey.', alternative: 'La protección de la dama es decisiva.' },
  { category: 'mate-in-1', title: 'Mate simétrico inferior', fen: '8/8/8/8/8/5KQ1/8/7k w - - 0 1', solution: { from: 'g3', to: 'g2' }, objective: 'Cerrar las casillas de escape del rey rival.', explanation: 'La torre imaginaria de la dama corta la última fila.', alternative: 'Cuenta todas las casillas de fuga.' },
  { category: 'mate-in-1', title: 'Mate en la esquina de dama', fen: 'k7/8/1QK5/8/8/8/8/8 w - - 0 1', solution: { from: 'b6', to: 'b7' }, objective: 'Cerrar las casillas de escape del rey rival.', explanation: 'La dama en b7 queda protegida por el rey blanco.', alternative: 'Invierte el patrón de la esquina de rey.' },
  { category: 'mate-in-1', title: 'Dama lateral de dama', fen: 'k7/2Q5/2K5/8/8/8/8/8 w - - 0 1', solution: { from: 'c7', to: 'b7' }, objective: 'Cerrar las casillas de escape del rey rival.', explanation: 'La dama entra protegida en b7 y finaliza la partida.', alternative: 'El rey propio sostiene la casilla de mate.' },
  { category: 'mate-in-1', title: 'Ascenso de dama en a', fen: 'k7/8/2K5/1Q6/8/8/8/8 w - - 0 1', solution: { from: 'b5', to: 'b7' }, objective: 'Cerrar las casillas de escape del rey rival.', explanation: 'La dama ocupa b7, una casilla protegida y decisiva.', alternative: 'Identifica la séptima fila de mate.' },
  { category: 'mate-in-1', title: 'Esquina inferior de dama', fen: '8/8/8/8/1Q6/2K5/8/k7 w - - 0 1', solution: { from: 'b4', to: 'b2' }, objective: 'Cerrar las casillas de escape del rey rival.', explanation: 'La dama se sitúa en b2 con la cobertura del rey blanco.', alternative: 'Traslada el patrón de mate a la esquina opuesta.' },
  { category: 'mate-in-1', title: 'Dama lateral inferior de dama', fen: '8/8/8/8/8/2K5/2Q5/k7 w - - 0 1', solution: { from: 'c2', to: 'b2' }, objective: 'Cerrar las casillas de escape del rey rival.', explanation: 'La dama protegida en b2 completa la red de mate.', alternative: 'Busca casillas protegidas junto al rey.' },
];

const TACTICAL_SEEDS: readonly PuzzleSeed[] = [
  { category: 'basic-tactics', title: 'Caballo centralizado', fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 1 2', solution: { from: 'f3', to: 'e5' }, objective: 'Detectar una captura central con ganancia de peón.', explanation: 'El caballo captura el peón central y mejora su actividad.', alternative: 'Comprueba siempre piezas enemigas sin defender.' },
  { category: 'win-material', title: 'Recupera el peón central', fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 1 2', solution: { from: 'f3', to: 'e5' }, objective: 'Ganar material cuando una pieza rival queda expuesta.', explanation: 'La captura en e5 gana material de forma inmediata.', alternative: 'Ataca primero objetivos centrales vulnerables.' },
  { category: 'defend-position', title: 'Refuerza el centro', fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2', solution: { from: 'g1', to: 'f3' }, objective: 'Desarrollar una pieza que defiende el centro.', explanation: 'El caballo protege e5 y prepara el enroque.', alternative: 'En defensa, mejora una pieza mientras cubres una debilidad.' },
  { category: 'best-move', title: 'Respuesta central', fen: 'rnbqkbnr/pppppppp/8/8/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 1', solution: { from: 'e7', to: 'e5' }, objective: 'Contestar el centro con desarrollo y espacio.', explanation: 'e5 disputa el centro y abre líneas para las piezas negras.', alternative: 'Una buena jugada de apertura suele desarrollar y luchar por el centro.' },
];

const PINS_AND_FORKS: readonly PuzzleSeed[] = [
  { category: 'basic-tactics', title: 'Ataque Doble de Dama', fen: '4k3/8/8/3r4/8/8/8/4Q1K1 w - - 0 1', solution: { from: 'e1', to: 'e4' }, objective: 'Atacar dos piezas al mismo tiempo.', explanation: 'La dama da jaque al rey y ataca la torre simultáneamente.', alternative: 'Busca siempre alineaciones vulnerables.' },
  { category: 'win-material', title: 'Clavada de Alfil', fen: '6k1/5r2/8/8/8/8/B7/6K1 w - - 0 1', solution: { from: 'a2', to: 'c4' }, objective: 'Inmovilizar una pieza enemiga de valor.', explanation: 'El alfil clava la torre al rey; la torre no puede moverse.', alternative: 'Aprovecha las diagonales abiertas hacia el rey.' },
  { category: 'basic-tactics', title: 'Horquilla de Peón', fen: '4k3/8/8/8/3n1n2/4P3/8/4K3 w - - 0 1', solution: { from: 'e3', to: 'e4' }, objective: 'Atacar dos piezas menores con un peón.', explanation: 'El peón avanza amenazando a ambos caballos a la vez.', alternative: 'Los peones son excelentes para atrapar piezas enemigas.' },
  { category: 'win-material', title: 'Ataque Doble de Torre', fen: '4k3/8/8/2n1b3/8/8/3R4/4K3 w - - 0 1', solution: { from: 'd2', to: 'd5' }, objective: 'Crear una doble amenaza ortogonal.', explanation: 'La torre se sitúa atacando tanto al alfil como al caballo.', alternative: 'Centra tus torres para maximizar sus objetivos.' },
  { category: 'basic-tactics', title: 'Clavada Frontal de Torre', fen: '4k3/4q3/8/8/8/8/R7/4K3 w - - 0 1', solution: { from: 'a2', to: 'e2' }, objective: 'Atrapar a la dama contra el rey.', explanation: 'La torre se alinea con el rey y la dama, inmovilizándola de forma fatal.', alternative: 'Busca las columnas donde se encuentra el rey rival.' },
];

function series(seed: PuzzleSeed, count: number, prefix: string): TrainingPuzzle[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `${prefix}-${String(index + 1).padStart(2, '0')}`,
    title: `${seed.title} · estudio ${index + 1}`,
    category: seed.category,
    fen: seed.fen,
    solution: [seed.solution],
    difficulty: (Math.min(5, 1 + Math.floor(index / 2)) as TrainingPuzzle['difficulty']),
    rewardXp: 15 + Math.min(20, index * 2),
    objective: seed.objective,
    explanation: seed.explanation,
    alternative: seed.alternative,
  }));
}

export const ACADEMY_PUZZLES: readonly TrainingPuzzle[] = [
  ...Array.from({ length: 10 }, (_, index) => series(MATE_PATTERNS[index % MATE_PATTERNS.length], 1, `mate-1-${index + 1}`)[0]),
  ...series(TACTICAL_SEEDS[0], 10, 'tactica'),
  ...series(TACTICAL_SEEDS[1], 10, 'material'),
  ...series(TACTICAL_SEEDS[2], 10, 'defensa'),
  ...series(TACTICAL_SEEDS[3], 10, 'mejor-jugada'),
  ...PINS_AND_FORKS.map((seed, index) => series(seed, 1, `tactics-adv-${index + 1}`)[0]),
];
