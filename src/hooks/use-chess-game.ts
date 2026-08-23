import { useCallback, useRef, useState, type MutableRefObject } from 'react';

import {
  ChessGame,
  colorOf,
  type GameStatus,
  type Move,
  type MoveRecord,
  type Position,
  type PromotionPiece,
  type Square,
} from '@/chess';

export interface PendingPromotion {
  readonly from: Square;
  readonly to: Square;
}

export interface UseChessGameOptions {
  readonly onMoveApplied?: (record: MoveRecord) => void;
}

export interface UseChessGameResult {
  readonly game: ChessGame;
  readonly position: Position;
  readonly selected: Square | null;
  readonly setSelected: (square: Square | null) => void;
  readonly pendingPromotion: PendingPromotion | null;
  readonly setPendingPromotion: (pending: PendingPromotion | null) => void;
  readonly lastMove: MoveRecord | null;
  readonly legalMoves: readonly Move[];
  readonly status: GameStatus;
  readonly history: readonly MoveRecord[];
  readonly turnLabel: string;
  readonly turnMessage: string;
  readonly gameGeneration: number;
  readonly generationRef: MutableRefObject<number>;
  readonly refresh: (record: MoveRecord, customGame?: ChessGame) => void;
  readonly executeMove: (from: Square, to: Square, promotion?: PromotionPiece) => MoveRecord | null;
  readonly handlePromotion: (promotion: PromotionPiece) => MoveRecord | null;
  readonly resetGame: (customGame?: ChessGame) => ChessGame;
  readonly selectPieceSquare: (square: Square, canSelect: boolean) => void;
}

export function useChessGame(options: UseChessGameOptions = {}): UseChessGameResult {
  const { onMoveApplied } = options;
  const [game, setGame] = useState(() => ChessGame.initial());
  const [position, setPosition] = useState(() => game.getPosition());
  const [selected, setSelected] = useState<Square | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<PendingPromotion | null>(null);
  const [lastMove, setLastMove] = useState<MoveRecord | null>(null);
  const [gameGeneration, setGameGeneration] = useState(0);
  const generationRef = useRef(0);

  const refresh = useCallback((record: MoveRecord, customGame?: ChessGame) => {
    const target = customGame ?? game;
    setPosition(target.getPosition());
    setLastMove(record);
    setSelected(null);
  }, [game]);

  const executeMove = useCallback(
    (from: Square, to: Square, promotion?: PromotionPiece): MoveRecord | null => {
      const record = game.move({ from, to, promotion });
      if (!record) return null;
      setPosition(game.getPosition());
      setLastMove(record);
      setSelected(null);
      onMoveApplied?.(record);
      return record;
    },
    [game, onMoveApplied],
  );

  const handlePromotion = useCallback(
    (promotion: PromotionPiece): MoveRecord | null => {
      if (!pendingPromotion) return null;
      const record = executeMove(pendingPromotion.from, pendingPromotion.to, promotion);
      setPendingPromotion(null);
      return record;
    },
    [executeMove, pendingPromotion],
  );

  const resetGame = useCallback((customGame?: ChessGame): ChessGame => {
    generationRef.current += 1;
    setGameGeneration(generationRef.current);
    const nextGame = customGame ?? ChessGame.initial();
    setGame(nextGame);
    setPosition(nextGame.getPosition());
    setSelected(null);
    setPendingPromotion(null);
    setLastMove(null);
    return nextGame;
  }, []);

  const selectPieceSquare = useCallback(
    (square: Square, canSelect: boolean) => {
      const piece = position.board[square];
      const valid = canSelect && piece !== null && colorOf(piece) === position.turn;
      setSelected(valid ? square : null);
    },
    [position.board, position.turn],
  );

  const legalMoves = selected === null ? [] : game.legalMoves(selected);
  const status = game.status();
  const history = game.history();

  const turnLabel = position.turn === 'w' ? 'Blancas' : 'Negras';
  const turnMessage = status.checkmate
    ? `Jaque mate · ganan ${status.winner === 'w' ? 'blancas' : 'negras'}`
    : status.draw
      ? 'Partida terminada en tablas'
      : status.check
        ? `Jaque · juegan ${turnLabel.toLowerCase()}`
        : `Juegan ${turnLabel.toLowerCase()}`;

  return {
    game,
    position,
    selected,
    setSelected,
    pendingPromotion,
    setPendingPromotion,
    lastMove,
    legalMoves,
    status,
    history,
    turnLabel,
    turnMessage,
    gameGeneration,
    generationRef,
    refresh,
    executeMove,
    handlePromotion,
    resetGame,
    selectPieceSquare,
  };
}
