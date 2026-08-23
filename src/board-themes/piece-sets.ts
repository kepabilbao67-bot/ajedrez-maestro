import type { Piece } from '../chess';

export type PieceSetId = 'classic' | 'modern' | '3d' | 'fantasy' | 'minimalist';

export interface PieceSetDefinition {
  readonly id: PieceSetId;
  readonly name: string;
  readonly availability: 'free' | 'prepared';
  readonly glyphs: Readonly<Record<Piece, string>>;
  readonly whiteColor: string;
  readonly blackColor: string;
  readonly fontFamily: 'serif' | 'sans-serif';
}

const CLASSIC_GLYPHS: Readonly<Record<Piece, string>> = {
  K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙',
  k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟',
};

export const PIECE_SETS: readonly PieceSetDefinition[] = [
  { id: 'classic', name: 'Classic', availability: 'free', glyphs: CLASSIC_GLYPHS, whiteColor: '#FFF8E8', blackColor: '#142019', fontFamily: 'serif' },
  { id: 'modern', name: 'Modern', availability: 'prepared', glyphs: CLASSIC_GLYPHS, whiteColor: '#FFFFFF', blackColor: '#111827', fontFamily: 'sans-serif' },
  { id: '3d', name: '3D', availability: 'prepared', glyphs: CLASSIC_GLYPHS, whiteColor: '#FFF4D7', blackColor: '#241B12', fontFamily: 'serif' },
  { id: 'fantasy', name: 'Fantasy', availability: 'prepared', glyphs: CLASSIC_GLYPHS, whiteColor: '#F5E6FF', blackColor: '#2B1538', fontFamily: 'serif' },
  { id: 'minimalist', name: 'Minimalist', availability: 'prepared', glyphs: CLASSIC_GLYPHS, whiteColor: '#F8F9FA', blackColor: '#343A40', fontFamily: 'sans-serif' },
];

export function pieceSetById(id: PieceSetId): PieceSetDefinition {
  return PIECE_SETS.find((set) => set.id === id) ?? PIECE_SETS[0];
}
