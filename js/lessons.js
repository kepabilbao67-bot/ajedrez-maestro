/*
 * lessons.js — Contenido educativo: principios, tácticas, estrategia posicional
 * y dinámica al estilo de los campeones del mundo (Karpov y Kasparov),
 * explicado con palabras sencillas. Pensado para uso escolar.
 *
 * Cada lección: { id, icon, title{es,en}, level, content[] }
 * content puede tener bloques: {h} encabezado, {p} párrafo, {tip} consejo,
 * {fen} posición ilustrativa para mostrar en el tablero.
 */

export const LESSONS = [
  {
    id: 'pieces', icon: '♟️', level: 'basico',
    title: { es: 'Cómo se mueven las piezas', en: 'How the pieces move' },
    content: [
      { es: { p: 'El ajedrez se juega en un tablero de 64 casillas. Cada jugador tiene 16 piezas. Gana quien da jaque mate al rey contrario.' },
        en: { p: 'Chess is played on a 64-square board. Each player has 16 pieces. You win by checkmating the opponent\'s king.' } },
      { es: { h: 'El peón' }, en: { h: 'The pawn' } },
      { es: { p: 'Avanza una casilla (o dos en su primer movimiento) y captura en diagonal. Si llega al final del tablero, ¡se convierte en otra pieza (normalmente la dama)!' },
        en: { p: 'Moves one square forward (or two on its first move) and captures diagonally. If it reaches the far end, it promotes to another piece (usually a queen)!' } },
      { es: { h: 'Torre, alfil y dama' }, en: { h: 'Rook, bishop and queen' } },
      { es: { p: 'La torre se mueve en línea recta. El alfil en diagonal. La dama combina ambos: es la pieza más fuerte.' },
        en: { p: 'The rook moves in straight lines. The bishop moves diagonally. The queen combines both: it is the strongest piece.' } },
      { es: { h: 'Caballo y rey' }, en: { h: 'Knight and king' } },
      { es: { p: 'El caballo salta en forma de "L" y puede pasar por encima de otras piezas. El rey se mueve una casilla en cualquier dirección: ¡protégelo siempre!' },
        en: { p: 'The knight jumps in an "L" shape and can leap over pieces. The king moves one square in any direction: always keep it safe!' } },
      { es: { tip: 'Valor aproximado: peón 1, caballo y alfil 3, torre 5, dama 9. El rey no tiene precio: si lo pierdes, pierdes la partida.' },
        en: { tip: 'Approx. value: pawn 1, knight and bishop 3, rook 5, queen 9. The king is priceless: lose it and you lose the game.' } },
    ],
  },
  {
    id: 'opening', icon: '🚀', level: 'basico',
    title: { es: 'Los 3 principios de la apertura', en: 'The 3 opening principles' },
    content: [
      { es: { h: '1) Controla el centro' }, en: { h: '1) Control the center' } },
      { es: { p: 'Las casillas centrales (e4, d4, e5, d5) son como la cima de una montaña: desde ahí tus piezas dominan todo el tablero. Empieza moviendo un peón central.' },
        en: { p: 'The central squares (e4, d4, e5, d5) are like a mountain top: from there your pieces dominate the board. Start by moving a central pawn.' },
        fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2' },
      { es: { h: '2) Desarrolla tus piezas' }, en: { h: '2) Develop your pieces' } },
      { es: { p: 'Saca caballos y alfiles pronto, hacia casillas activas. Una pieza en su casilla inicial no ayuda. Regla práctica: caballos antes que alfiles.' },
        en: { p: 'Bring out knights and bishops early to active squares. A piece on its home square does nothing. Rule of thumb: knights before bishops.' } },
      { es: { h: '3) Pon a salvo al rey (enroca)' }, en: { h: '3) Get your king safe (castle)' } },
      { es: { p: 'El enroque mete al rey en una esquina segura y activa la torre. Intenta enrocar en las primeras 10 jugadas.' },
        en: { p: 'Castling tucks the king into a safe corner and activates the rook. Try to castle within the first 10 moves.' } },
      { es: { tip: 'No saques la dama demasiado pronto: el rival la perseguirá y ganará tiempo desarrollándose.' },
        en: { tip: "Don't bring the queen out too early: the opponent will chase it and gain time developing." } },
    ],
  },
  {
    id: 'tactics', icon: '⚔️', level: 'intermedio',
    title: { es: 'Tácticas: el horquilla, la clavada y el pincho', en: 'Tactics: fork, pin and skewer' },
    content: [
      { es: { h: 'La horquilla (tenedor)' }, en: { h: 'The fork' } },
      { es: { p: 'Una pieza ataca dos cosas a la vez. El caballo es el rey de las horquillas: puede atacar al rey y a la dama al mismo tiempo.' },
        en: { p: 'One piece attacks two targets at once. The knight is the king of forks: it can hit the king and the queen at the same time.' } },
      { es: { h: 'La clavada' }, en: { h: 'The pin' } },
      { es: { p: 'Una pieza no se puede mover porque dejaría expuesta a otra más valiosa (o al rey) detrás de ella. ¡Aprovecha para atacar la pieza clavada!' },
        en: { p: "A piece can't move because it would expose a more valuable piece (or the king) behind it. Pile up on the pinned piece!" } },
      { es: { h: 'El pincho (rayos X)' }, en: { h: 'The skewer' } },
      { es: { p: 'Como la clavada pero al revés: la pieza valiosa está delante; cuando se aparta, capturas la de detrás.' },
        en: { p: 'Like a pin but reversed: the valuable piece is in front; when it moves away, you grab the one behind.' } },
      { es: { tip: 'Antes de cada jugada pregúntate: "¿Hay alguna pieza sin defender? ¿Puedo atacar dos cosas a la vez?"' },
        en: { tip: 'Before each move ask: "Is any piece undefended? Can I attack two things at once?"' } },
    ],
  },
  {
    id: 'karpov', icon: '🛡️', level: 'avanzado',
    title: { es: 'Estilo Karpov: el arte de la posición', en: 'Karpov style: positional mastery' },
    content: [
      { es: { p: 'Anatoli Karpov, campeón del mundo, era famoso por ganar "sin que se notara": mejoraba sus piezas poco a poco hasta que el rival no podía moverse. Su secreto es la estrategia posicional.' },
        en: { p: 'Anatoly Karpov, world champion, was famous for winning "quietly": improving his pieces little by little until the opponent could barely move. His secret is positional strategy.' } },
      { es: { h: 'Profilaxis: impide los planes del rival' }, en: { h: 'Prophylaxis: stop the opponent\'s plans' } },
      { es: { p: 'Antes de hacer tu jugada, piensa: "¿Qué quiere hacer mi rival?" y quítaselo. Karpov apagaba las ideas del contrario antes de que nacieran.' },
        en: { p: 'Before moving, think: "What does my opponent want?" and take it away. Karpov shut down the other side\'s ideas before they were born.' } },
      { es: { h: 'Piezas en buenas casillas' }, en: { h: 'Pieces on good squares' } },
      { es: { p: 'Un caballo en una casilla central donde ningún peón lo puede echar (un "puesto avanzado") vale oro. Coloca tus piezas donde sean fuertes y estables.' },
        en: { p: 'A knight on a central square where no pawn can kick it (an "outpost") is golden. Place your pieces where they are strong and stable.' } },
      { es: { tip: 'No tengas prisa. Mejora la peor de tus piezas y acumula pequeñas ventajas: muchas ventajas pequeñas ganan la partida.' },
        en: { tip: "Don't rush. Improve your worst-placed piece and stack small advantages: many small edges win the game." } },
    ],
  },
  {
    id: 'kasparov', icon: '🔥', level: 'avanzado',
    title: { es: 'Estilo Kasparov: iniciativa y ataque', en: 'Kasparov style: initiative and attack' },
    content: [
      { es: { p: 'Garri Kasparov, considerado uno de los mejores de la historia, jugaba con energía: buscaba la iniciativa, abría líneas y lanzaba ataques al rey. Su lema: ¡presiona sin descanso!' },
        en: { p: 'Garry Kasparov, considered one of the greatest ever, played with energy: he seized the initiative, opened lines and launched attacks on the king. His motto: keep up the pressure!' } },
      { es: { h: 'La iniciativa' }, en: { h: 'The initiative' } },
      { es: { p: 'Tener la iniciativa es obligar al rival a defenderse jugada tras jugada. Mientras él apaga fuegos, tú decides el rumbo de la partida.' },
        en: { p: 'Having the initiative means forcing your opponent to defend move after move. While they put out fires, you steer the game.' } },
      { es: { h: 'Sacrificios para atacar' }, en: { h: 'Sacrifices to attack' } },
      { es: { p: 'A veces Kasparov entregaba un peón o una pieza para abrir el camino hacia el rey rival. Un sacrificio es bueno si tu ataque vale más que el material entregado.' },
        en: { p: 'Sometimes Kasparov gave up a pawn or a piece to open the path to the enemy king. A sacrifice is good when your attack is worth more than the material given.' } },
      { es: { h: 'El centro dinámico' }, en: { h: 'The dynamic center' } },
      { es: { p: 'Prefería peones centrales móviles que avanzan y aplastan al rival, en lugar de posiciones quietas. La actividad de las piezas era su prioridad.' },
        en: { p: 'He preferred mobile central pawns that advance and crush the opponent rather than quiet positions. Piece activity was his priority.' } },
      { es: { tip: 'Atacar al rey funciona mejor si tienes más piezas cerca de él que tu rival defendiendo. ¡Cuenta atacantes y defensores!' },
        en: { tip: 'Attacking the king works best when you have more pieces near it than the defender. Count attackers vs defenders!' } },
    ],
  },
  {
    id: 'endgame', icon: '👑', level: 'intermedio',
    title: { es: 'Finales: cómo dar mate con dama', en: 'Endgames: checkmate with the queen' },
    content: [
      { es: { p: 'Cuando quedan pocas piezas llega el "final". Saber dar mate con rey y dama contra rey solitario es imprescindible.' },
        en: { p: 'When few pieces remain we reach the "endgame". Knowing how to mate with king and queen vs a lone king is essential.' } },
      { es: { h: 'La técnica de la caja' }, en: { h: 'The box technique' } },
      { es: { p: 'Usa la dama para ir encerrando al rey rival en una caja cada vez más pequeña, empujándolo hacia el borde. ¡Cuidado con el ahogado: deja siempre una casilla libre hasta dar el mate!' },
        en: { p: 'Use the queen to box the enemy king into a smaller and smaller area, pushing it to the edge. Beware stalemate: always leave a free square until you deliver mate!' } },
      { es: { h: 'El rey ayuda' }, en: { h: 'The king helps' } },
      { es: { p: 'En los finales el rey es una pieza fuerte: acércalo para apoyar a la dama y dar el jaque mate en el borde del tablero.' },
        en: { p: 'In the endgame the king is a strong piece: bring it up to support the queen and deliver mate on the edge.' },
        fen: '8/8/8/4k3/8/4K3/8/4Q3 w - - 0 1' },
      { es: { tip: 'Regla del peón: en finales, un peón que corona vale tanto como una dama. ¡Protege tus peones pasados!' },
        en: { tip: 'Pawn rule: in endgames, a pawn that promotes is worth a queen. Protect your passed pawns!' } },
    ],
  },
  {
    id: 'safety', icon: '🧭', level: 'basico',
    title: { es: 'Antes de mover: la regla de oro', en: 'Before you move: the golden rule' },
    content: [
      { es: { p: 'El error más común de los principiantes es mover demasiado rápido y regalar piezas. Esta lección te da una rutina sencilla para evitarlo.' },
        en: { p: 'The most common beginner mistake is moving too fast and giving away pieces. This lesson gives you a simple routine to avoid it.' } },
      { es: { h: 'Los 3 chequeos' }, en: { h: 'The 3 checks' } },
      { es: { p: '1) ¿Mi rival amenaza algo? 2) ¿Mi jugada deja alguna pieza sin protección? 3) ¿Tengo una jugada mejor (jaque, captura o amenaza)?' },
        en: { p: '1) Is my opponent threatening something? 2) Does my move leave any piece undefended? 3) Do I have a better move (check, capture or threat)?' } },
      { es: { tip: 'Usa el botón "Pista" en una partida para ver qué haría el profesor en tu lugar y por qué.' },
        en: { tip: 'Use the "Hint" button during a game to see what the coach would play and why.' } },
    ],
  },
];

// Devuelve un mensaje de profesor sencillo a partir de la jugada sugerida y la evaluación.
export function coachAdvice(san, score, lang, captured) {
  const big = Math.abs(score);
  const ES = {
    capture: `Captura con ${san}: ganas material, ¡aprovéchalo!`,
    winning: `Juega ${san}. Tienes ventaja: cambia piezas y acércate a la victoria.`,
    equal: `Te recomiendo ${san}. La posición está igualada: mejora tus piezas y mantén al rey seguro.`,
    losing: `Resiste con ${san}. Vas peor: busca defender y crear complicaciones.`,
    mate: `¡Juega ${san}! Hay un mate o una gran jugada a la vista.`,
  };
  const EN = {
    capture: `Capture with ${san}: you win material, take it!`,
    winning: `Play ${san}. You're better: trade pieces and head for the win.`,
    equal: `I recommend ${san}. The position is balanced: improve your pieces and keep the king safe.`,
    losing: `Hold on with ${san}. You're worse: defend and create complications.`,
    mate: `Play ${san}! There's a mate or a great move in sight.`,
  };
  const M = lang === 'en' ? EN : ES;
  if (big > 5000) return M.mate;
  if (captured) return M.capture;
  if (score > 150) return M.winning;
  if (score < -150) return M.losing;
  return M.equal;
}
