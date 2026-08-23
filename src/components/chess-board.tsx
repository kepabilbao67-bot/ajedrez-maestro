import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, interpolate, useAnimatedStyle, useSharedValue, withTiming, ZoomIn } from 'react-native-reanimated';

import type { BoardThemeDefinition } from '@/board-themes/board-themes';
import type { PieceSetDefinition } from '@/board-themes/piece-sets';
import { colorOf, squareToAlgebraic, typeOf, type Move, type Piece, type Position, type Square } from '@/chess';

const PIECE_NAMES = {
  k: 'rey', q: 'dama', r: 'torre', b: 'alfil', n: 'caballo', p: 'peón',
} as const;

interface ChessBoardProps {
  readonly position: Position;
  readonly size: number;
  readonly selected: Square | null;
  readonly legalMoves: readonly Move[];
  readonly flipped: boolean;
  readonly disabled?: boolean;
  readonly lastMove: Move | null;
  readonly inCheck: boolean;
  readonly boardTheme: BoardThemeDefinition;
  readonly pieceSet: PieceSetDefinition;
  readonly onSquarePress: (square: Square) => void;
}

function MovingPiece({ move, piece, size, flipped, pieceSet }: { readonly move: Move; readonly piece: Piece; readonly size: number; readonly flipped: boolean; readonly pieceSet: PieceSetDefinition }) {
  const progress = useSharedValue(0);
  const squareSize = size / 8;
  const displayIndex = (square: Square) => flipped ? 63 - square : square;
  const fromIndex = displayIndex(move.from);
  const toIndex = displayIndex(move.to);
  const fromX = (fromIndex % 8) * squareSize;
  const fromY = Math.floor(fromIndex / 8) * squareSize;
  const deltaX = ((toIndex % 8) * squareSize) - fromX;
  const deltaY = (Math.floor(toIndex / 8) * squareSize) - fromY;

  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, { duration: 210 });
  }, [move, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.88, 1], [1, 1, 0]),
    transform: [
      { translateX: interpolate(progress.value, [0, 1], [0, deltaX]) },
      { translateY: interpolate(progress.value, [0, 1], [0, deltaY]) },
    ],
  }));

  return (
    <Animated.Text
      accessibilityElementsHidden
      pointerEvents="none"
      style={[styles.movingPiece, colorOf(piece) === 'w' ? styles.whitePiece : styles.blackPiece, { color: colorOf(piece) === 'w' ? pieceSet.whiteColor : pieceSet.blackColor, fontFamily: pieceSet.fontFamily, left: fromX, top: fromY, width: squareSize, height: squareSize, fontSize: squareSize * 0.73, lineHeight: squareSize * 0.84 }, animatedStyle]}
    >
      {pieceSet.glyphs[piece]}
    </Animated.Text>
  );
}

export function ChessBoard({ position, size, selected, legalMoves, flipped, disabled, lastMove, inCheck, boardTheme, pieceSet, onSquarePress }: ChessBoardProps) {
  const squareSize = size / 8;
  const squares = Array.from({ length: 64 }, (_, index) => flipped ? 63 - index : index);
  const legalTargets = new Map(legalMoves.map((move) => [move.to, move]));
  const checkedKing = inCheck ? position.board.findIndex((piece) => piece === (position.turn === 'w' ? 'K' : 'k')) : -1;

  return (
    <View accessibilityLabel={`Tablero de ajedrez tema ${boardTheme.name}`} accessibilityRole="summary" style={[styles.frame, { backgroundColor: boardTheme.frame, width: size + 6, height: size + 6 }]}>
      <View style={[styles.board, { width: size, height: size }]}>
        {squares.map((square, displayIndex) => {
          const piece = position.board[square];
          const move = legalTargets.get(square);
          const algebraic = squareToAlgebraic(square);
          const displayRow = Math.floor(displayIndex / 8);
          const displayColumn = displayIndex % 8;
          const showFile = displayRow === 7;
          const showRank = displayColumn === 0;
          const isLight = (Math.floor(square / 8) + square % 8) % 2 === 0;
          const isLastMove = lastMove?.from === square || lastMove?.to === square;
          const isCaptureDestination = lastMove?.capture === true && lastMove.to === square;
          const pieceLabel = piece ? `${PIECE_NAMES[typeOf(piece)]} ${colorOf(piece) === 'w' ? 'blanco' : 'negro'}` : 'vacía';

          return (
            <Pressable
              key={square}
              accessibilityLabel={`${algebraic}, ${pieceLabel}${move ? ', movimiento legal' : ''}`}
              accessibilityRole="button"
              accessibilityState={{ disabled, selected: selected === square }}
              disabled={disabled}
              onPress={() => onSquarePress(square)}
              style={({ pressed }) => [
                styles.square,
                { width: squareSize, height: squareSize, backgroundColor: isLight ? boardTheme.lightSquare : boardTheme.darkSquare },
                isLastMove && { backgroundColor: boardTheme.lastMove },
                square === checkedKing && styles.checkedKing,
                selected === square && { borderWidth: 4, borderColor: boardTheme.selected },
                pressed && !disabled && styles.pressed,
              ]}
            >
              {isCaptureDestination ? <Animated.View entering={FadeIn.duration(180)} style={styles.captureFlash} /> : null}
              {piece ? (
                <Animated.Text
                  key={`${piece}-${square}`}
                  entering={lastMove?.to === square ? ZoomIn.duration(180) : undefined}
                  accessibilityElementsHidden
                  style={[styles.piece, colorOf(piece) === 'w' ? styles.whitePiece : styles.blackPiece, { color: colorOf(piece) === 'w' ? pieceSet.whiteColor : pieceSet.blackColor, fontFamily: pieceSet.fontFamily, fontSize: squareSize * 0.73, lineHeight: squareSize * 0.84 }]}
                >
                  {pieceSet.glyphs[piece]}
                </Animated.Text>
              ) : null}
              {move ? (move.capture
                ? <Animated.View entering={ZoomIn.duration(140)} accessibilityElementsHidden style={[styles.captureTarget, { width: squareSize - 8, height: squareSize - 8 }]} />
                : <Animated.View entering={ZoomIn.duration(140)} accessibilityElementsHidden style={[styles.moveTarget, { backgroundColor: boardTheme.legalMove, width: Math.max(10, squareSize * 0.25), height: Math.max(10, squareSize * 0.25) }]} />
              ) : null}
              {showRank ? <Text accessibilityElementsHidden style={[styles.coordinate, styles.rank, { color: isLight ? boardTheme.coordinateLight : boardTheme.coordinateDark }]}>{algebraic[1]}</Text> : null}
              {showFile ? <Text accessibilityElementsHidden style={[styles.coordinate, styles.file, { color: isLight ? boardTheme.coordinateLight : boardTheme.coordinateDark }]}>{algebraic[0]}</Text> : null}
            </Pressable>
          );
        })}
        {lastMove && position.board[lastMove.to] ? (
          <MovingPiece key={`${lastMove.from}-${lastMove.to}-${position.fullmoveNumber}-${position.turn}`} move={lastMove} piece={position.board[lastMove.to]!} size={size} flipped={flipped} pieceSet={pieceSet} />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { alignItems: 'center', justifyContent: 'center', borderRadius: 16, borderCurve: 'continuous', overflow: 'hidden', boxShadow: '0 10px 28px rgba(0, 0, 0, 0.35)' },
  board: { flexDirection: 'row', flexWrap: 'wrap', overflow: 'hidden', borderRadius: 13, borderCurve: 'continuous' },
  square: { alignItems: 'center', justifyContent: 'center' },
  checkedKing: { backgroundColor: '#C94D3B', borderWidth: 3, borderColor: '#FFD0C7' },
  pressed: { opacity: 0.78 },
  piece: { zIndex: 2, textAlign: 'center', fontFamily: 'serif' },
  movingPiece: { position: 'absolute', zIndex: 8, textAlign: 'center', fontFamily: 'serif' },
  whitePiece: { color: '#FFF8E8', textShadowColor: '#18231D', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
  blackPiece: { color: '#142019', textShadowColor: 'rgba(255,255,255,0.35)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 1 },
  moveTarget: { position: 'absolute', zIndex: 3, borderRadius: 999, borderWidth: 2, borderColor: 'rgba(23, 35, 30, 0.75)' },
  captureTarget: { position: 'absolute', zIndex: 3, borderRadius: 999, borderWidth: 4, borderColor: '#FFE28A' },
  captureFlash: { position: 'absolute', inset: 0, zIndex: 1, backgroundColor: 'rgba(196, 71, 50, 0.46)' },
  coordinate: { position: 'absolute', zIndex: 4, fontSize: 10, fontWeight: '900' },
  rank: { left: 3, top: 2 },
  file: { right: 3, bottom: 1 },
});
