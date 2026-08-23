import { ACADEMY_PUZZLES } from './content/academy-puzzles';

export const PUZZLE_LIBRARY = ACADEMY_PUZZLES;

export function puzzleById(id: string) {
  return PUZZLE_LIBRARY.find((puzzle) => puzzle.id === id) ?? null;
}
