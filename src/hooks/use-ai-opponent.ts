import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react';
import { Platform } from 'react-native';

import { playAiTurn } from '@/ai/ai-opponent';
import type { AiEngine } from '@/ai/engine-adapter';
import { AiCancelledError } from '@/ai/errors';
import { FallbackAiEngine } from '@/ai/fallback-engine';
import { getOpeningMove } from '@/ai/opening-book';
import { StockfishEngine } from '@/ai/stockfish-engine';
import type { DifficultyLevel, PlayStyle } from '@/ai/types';
import type { ChessGame, MoveInput, MoveRecord, PromotionPiece } from '@/chess';
import { canAccessDifficulty } from '@/premium/premium-policy';
import type { PremiumStatus } from '@/premium/premium-types';

export interface UseAiOpponentOptions {
  readonly initialDifficulty?: DifficultyLevel;
  readonly generationRef: MutableRefObject<number>;
  readonly onMoveApplied: (record: MoveRecord, targetGame: ChessGame) => void;
  readonly premiumStatus?: PremiumStatus;
}

export interface UseAiOpponentResult {
  readonly difficulty: DifficultyLevel;
  readonly playStyle: PlayStyle;
  readonly setDifficulty: (difficulty: DifficultyLevel) => void;
  readonly setPlayStyle: (style: PlayStyle) => void;
  readonly thinking: boolean;
  readonly aiError: string | null;
  readonly clearAiError: () => void;
  readonly cancelAi: () => void;
  readonly requestAiMove: (targetGame: ChessGame) => Promise<void>;
  readonly getEngine: () => AiEngine;
}

function createPlatformEngine(): AiEngine {
  return Platform.OS === 'web' ? new StockfishEngine() : new FallbackAiEngine();
}

export function useAiOpponent(options: UseAiOpponentOptions): UseAiOpponentResult {
  const { initialDifficulty = 3, generationRef, onMoveApplied, premiumStatus } = options;
  const [difficulty, setDifficultyState] = useState<DifficultyLevel>(initialDifficulty);
  const [playStyle, setPlayStyle] = useState<PlayStyle>('Balanced');
  const [thinking, setThinking] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const setDifficulty = useCallback(
    (nextDifficulty: DifficultyLevel) => {
      const currentStatus = premiumStatus ?? { tier: 'free' };
      if (!canAccessDifficulty(nextDifficulty, currentStatus)) {
        setAiError(`La dificultad ${nextDifficulty} (Stockfish Maestro) requiere AjedrezPro Pro.`);
        return;
      }
      setAiError(null);
      setDifficultyState(nextDifficulty);
    },
    [premiumStatus],
  );

  const engineRef = useRef<AiEngine | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const getEngine = useCallback((): AiEngine => {
    engineRef.current ??= createPlatformEngine();
    return engineRef.current;
  }, []);

  const cancelAi = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setThinking(false);
    setAiError(null);
  }, []);

  const clearAiError = useCallback(() => {
    setAiError(null);
  }, []);

  const requestAiMove = useCallback(
    async (targetGame: ChessGame) => {
      const generation = generationRef.current;
      const controller = new AbortController();
      abortRef.current = controller;
      setThinking(true);
      setAiError(null);
      try {
        const fen = targetGame.fen();
        const openingMove = getOpeningMove(fen);
        let record: MoveRecord | null = null;

        if (openingMove) {
          // Add a small artificial delay so it feels natural
          await new Promise(resolve => setTimeout(resolve, 600));
          if (controller.signal.aborted) throw new AiCancelledError();
          const moveInput: MoveInput = {
            from: openingMove.slice(0, 2),
            to: openingMove.slice(2, 4),
            promotion: openingMove.length > 4 ? (openingMove[4] as PromotionPiece) : undefined,
          };
          record = targetGame.move(moveInput);
        } else {
          const engine = getEngine();
          record = await playAiTurn({
            game: targetGame,
            engine,
            difficulty,
            playStyle,
            signal: controller.signal,
          });
        }

        if (record && generation === generationRef.current) {
          onMoveApplied(record, targetGame);
        }
      } catch (error) {
        if (!(error instanceof AiCancelledError) && generation === generationRef.current) {
          setAiError(error instanceof Error ? error.message : 'No se pudo completar la jugada de la IA');
        }
      } finally {
        if (generation === generationRef.current) setThinking(false);
        if (abortRef.current === controller) abortRef.current = null;
      }
    },
    [difficulty, playStyle, generationRef, getEngine, onMoveApplied],
  );

  useEffect(
    () => () => {
      abortRef.current?.abort();
      engineRef.current?.dispose?.();
    },
    [],
  );

  return {
    difficulty,
    playStyle,
    setDifficulty,
    setPlayStyle,
    thinking,
    aiError,
    clearAiError,
    cancelAi,
    requestAiMove,
    getEngine,
  };
}
