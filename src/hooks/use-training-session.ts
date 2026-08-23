import { useCallback, useRef, useState } from 'react';

import { ChessGame, squareToAlgebraic, type Square } from '@/chess';
import { PUZZLE_LIBRARY } from '@/training/puzzle-library';
import { PuzzleEngine } from '@/training/puzzle-engine';
import { TrainingService } from '@/training/training-service';
import type { PuzzleAttempt, TrainingPuzzle } from '@/training/training-types';

export interface UseTrainingSessionOptions {
  readonly onAttemptSubmitted?: (result: PuzzleAttempt) => void;
}

export interface UseTrainingSessionResult {
  readonly activePuzzle: TrainingPuzzle | null;
  readonly puzzleFeedback: PuzzleAttempt | null;
  readonly puzzles: readonly TrainingPuzzle[];
  readonly startPuzzle: (puzzle: TrainingPuzzle) => ChessGame;
  readonly submitAttempt: (from: Square, to: Square) => { result: PuzzleAttempt; isCorrect: boolean } | null;
  readonly resetTraining: () => void;
  readonly setPuzzleFeedback: (feedback: PuzzleAttempt | null) => void;
}

export function useTrainingSession(options: UseTrainingSessionOptions = {}): UseTrainingSessionResult {
  const { onAttemptSubmitted } = options;
  const [activePuzzle, setActivePuzzle] = useState<TrainingPuzzle | null>(null);
  const [puzzleFeedback, setPuzzleFeedback] = useState<PuzzleAttempt | null>(null);

  const trainingServiceRef = useRef<TrainingService | null>(null);
  const puzzleEngineRef = useRef<PuzzleEngine | null>(null);

  const getTrainingService = useCallback(() => {
    trainingServiceRef.current ??= new TrainingService();
    return trainingServiceRef.current;
  }, []);

  const startPuzzle = useCallback(
    (puzzle: TrainingPuzzle): ChessGame => {
      const service = getTrainingService();
      puzzleEngineRef.current = service.createSession(puzzle);
      setActivePuzzle(puzzle);
      setPuzzleFeedback(null);
      return new ChessGame(puzzle.fen);
    },
    [getTrainingService],
  );

  const submitAttempt = useCallback(
    (from: Square, to: Square): { result: PuzzleAttempt; isCorrect: boolean } | null => {
      if (!activePuzzle || !puzzleEngineRef.current) return null;
      const service = getTrainingService();
      const result = service.submit(puzzleEngineRef.current, activePuzzle, {
        from: squareToAlgebraic(from),
        to: squareToAlgebraic(to),
      });
      setPuzzleFeedback(result);
      onAttemptSubmitted?.(result);
      return { result, isCorrect: result.correct };
    },
    [activePuzzle, getTrainingService, onAttemptSubmitted],
  );

  const resetTraining = useCallback(() => {
    setActivePuzzle(null);
    setPuzzleFeedback(null);
    puzzleEngineRef.current = null;
  }, []);

  return {
    activePuzzle,
    puzzleFeedback,
    puzzles: PUZZLE_LIBRARY,
    startPuzzle,
    submitAttempt,
    resetTraining,
    setPuzzleFeedback,
  };
}
