export type Color = 'w' | 'b';
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type Piece = PieceType | Uppercase<PieceType>;
export type Square = number;
export type PromotionPiece = 'q' | 'r' | 'b' | 'n';
export type CastleSide = 'K' | 'Q' | 'k' | 'q';

export interface Move {
  readonly from: Square;
  readonly to: Square;
  readonly promotion?: PromotionPiece;
  readonly capture?: boolean;
  readonly enPassant?: boolean;
  readonly castle?: CastleSide;
  readonly doublePawn?: boolean;
}

export interface MoveInput {
  readonly from: Square | string;
  readonly to: Square | string;
  readonly promotion?: PromotionPiece;
}

export interface Position {
  readonly board: readonly (Piece | null)[];
  readonly turn: Color;
  readonly castling: string;
  readonly enPassant: Square | null;
  readonly halfmoveClock: number;
  readonly fullmoveNumber: number;
}

export interface MoveRecord {
  readonly move: Move;
  readonly san: string;
  readonly fenBefore: string;
  readonly fenAfter: string;
}

export type DrawReason =
  | 'stalemate'
  | 'fifty-move'
  | 'threefold-repetition'
  | 'insufficient-material';

export interface GameStatus {
  readonly check: boolean;
  readonly checkmate: boolean;
  readonly stalemate: boolean;
  readonly draw: boolean;
  readonly drawReason: DrawReason | null;
  readonly gameOver: boolean;
  readonly winner: Color | null;
}
