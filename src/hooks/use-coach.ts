import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { analyzeGame } from '@/ai/coach/game-analyzer';
import { generateHint } from '@/ai/coach/hint-generator';
import { createPostGameSummary } from '@/ai/coach/post-game-summary';
import { explainOpening, explainThreat } from '@/ai/coach/teaching-explanations';
import type { CoachHintLevel, EvaluatedPosition, GameAnalysis } from '@/ai/coach/coach-types';
import { difficultyDefinition } from '@/ai/difficulty';
import { AiCancelledError } from '@/ai/errors';
import type { AiEngine } from '@/ai/engine-adapter';
import type { DifficultyLevel } from '@/ai/types';
import type { ChessGame, GameStatus, MoveRecord } from '@/chess';

import { canRunAnalysis, canUseCoachHint } from '@/premium/premium-policy';
import type { DailyUsage, PremiumStatus } from '@/premium/premium-types';
import { DEFAULT_DAILY_USAGE } from '@/premium/premium-types';

export interface UseCoachOptions {
  readonly getEngine: () => AiEngine;
  readonly premiumStatus?: PremiumStatus;
  readonly dailyUsage?: DailyUsage;
  readonly onConsumeUsage?: (action: 'hint' | 'analysis') => void;
  readonly onHintUsed?: () => void;
  readonly onAnalysisCompleted?: (report: GameAnalysis) => void;
}

export interface UseCoachResult {
  readonly coachLoading: boolean;
  readonly coachMessage: string | null;
  readonly coachReport: GameAnalysis | null;
  readonly hintLevel: CoachHintLevel;
  readonly contextualCoachMessage: (status: GameStatus, historyLength: number) => string;
  readonly postGameSummary: ReturnType<typeof createPostGameSummary> | null;
  readonly requestHint: (game: ChessGame, difficulty: DifficultyLevel) => Promise<void>;
  readonly analyzeCurrentGame: (history: readonly MoveRecord[], status: GameStatus) => Promise<void>;
  readonly cancelCoach: () => void;
  readonly resetCoach: () => void;
  readonly setCoachMessage: (message: string | null) => void;
}

export function useCoach(options: UseCoachOptions): UseCoachResult {
  const { getEngine, premiumStatus, dailyUsage, onConsumeUsage, onHintUsed, onAnalysisCompleted } = options;
  const [coachLoading, setCoachLoading] = useState(false);
  const [coachMessage, setCoachMessage] = useState<string | null>(null);
  const [coachReport, setCoachReport] = useState<GameAnalysis | null>(null);
  const [hintLevel, setHintLevel] = useState<CoachHintLevel>(1);

  const coachAbortRef = useRef<AbortController | null>(null);

  const cancelCoach = useCallback(() => {
    coachAbortRef.current?.abort();
    coachAbortRef.current = null;
    setCoachLoading(false);
  }, []);

  const resetCoach = useCallback(() => {
    cancelCoach();
    setCoachMessage(null);
    setCoachReport(null);
    setHintLevel(1);
  }, [cancelCoach]);

  const requestHint = useCallback(
    async (game: ChessGame, difficulty: DifficultyLevel) => {
      const currentStatus = premiumStatus ?? { tier: 'free' };
      const currentUsage = dailyUsage ?? DEFAULT_DAILY_USAGE;

      if (!canUseCoachHint(currentUsage, currentStatus)) {
        setCoachMessage('Has alcanzado el límite diario de 3 pistas gratuitas. Pistas ilimitadas disponibles en Pro.');
        return;
      }

      const requestedLevel = hintLevel;
      setHintLevel((level) => (level === 3 ? 1 : ((level + 1) as CoachHintLevel)));
      const status = game.status();
      if (status.gameOver) {
        setCoachMessage(generateHint(game, requestedLevel, null).message);
        return;
      }
      setCoachLoading(true);
      setCoachMessage(null);
      const controller = new AbortController();
      coachAbortRef.current = controller;
      try {
        const engine = getEngine();
        const analysis = await engine.analyze({
          fen: game.fen(),
          difficulty,
          limits: difficultyDefinition(difficulty).defaultLimits,
          signal: controller.signal,
        });
        const hint = generateHint(game, requestedLevel, analysis.bestMove);
        setCoachMessage(hint.message);
        if (hint.available) {
          onHintUsed?.();
          onConsumeUsage?.('hint');
        }
      } catch (error) {
        if (!(error instanceof AiCancelledError)) {
          setCoachMessage('No se pudo generar una pista en este momento.');
        }
      } finally {
        if (coachAbortRef.current === controller) coachAbortRef.current = null;
        setCoachLoading(false);
      }
    },
    [dailyUsage, getEngine, hintLevel, onConsumeUsage, onHintUsed, premiumStatus],
  );

  const analyzeCurrentGame = useCallback(
    async (history: readonly MoveRecord[], status: GameStatus) => {
      if (history.length === 0) return;

      const currentStatus = premiumStatus ?? { tier: 'free' };
      const currentUsage = dailyUsage ?? DEFAULT_DAILY_USAGE;

      if (!canRunAnalysis(currentUsage, currentStatus)) {
        setCoachMessage('Has alcanzado el límite de 1 análisis diario gratuito. Análisis ilimitado disponible en Pro.');
        return;
      }

      setCoachLoading(true);
      setCoachMessage(null);
      const controller = new AbortController();
      coachAbortRef.current = controller;
      try {
        const engine = getEngine();
        const fens = [...new Set(history.flatMap((record) => [record.fenBefore, record.fenAfter]))];
        const evaluations: EvaluatedPosition[] = [];
        for (const fen of fens) {
          const analysis = await engine.analyze({
            fen,
            difficulty: 2,
            limits: difficultyDefinition(2).defaultLimits,
            signal: controller.signal,
          });
          evaluations.push({
            fen,
            evaluation: analysis.evaluation,
            bestMove: analysis.bestMove,
            candidateMoves: analysis.candidateMoves,
          });
        }
        const result = status.checkmate
          ? status.winner === 'w'
            ? 'white-win'
            : 'black-win'
          : status.draw
            ? 'draw'
            : 'unfinished';
        const report: GameAnalysis = analyzeGame({ moves: history, evaluations, result });
        setCoachReport(report);
        onAnalysisCompleted?.(report);
        onConsumeUsage?.('analysis');
        setCoachMessage(report.criticalMoment ? `${report.summary} ${report.criticalMoment.explanation}` : report.summary);
      } catch (error) {
        if (!(error instanceof AiCancelledError)) {
          setCoachMessage('No se pudo completar el análisis de la partida.');
        }
      } finally {
        if (coachAbortRef.current === controller) coachAbortRef.current = null;
        setCoachLoading(false);
      }
    },
    [dailyUsage, getEngine, onAnalysisCompleted, onConsumeUsage, premiumStatus],
  );

  const contextualCoachMessage = useCallback((status: GameStatus, historyLength: number) => {
    return status.check ? explainThreat(true).message : explainOpening(historyLength).message;
  }, []);

  const postGameSummary = useMemo(() => (coachReport ? createPostGameSummary(coachReport) : null), [coachReport]);

  useEffect(
    () => () => {
      coachAbortRef.current?.abort();
    },
    [],
  );

  return {
    coachLoading,
    coachMessage,
    coachReport,
    hintLevel,
    contextualCoachMessage,
    postGameSummary,
    requestHint,
    analyzeCurrentGame,
    cancelCoach,
    resetCoach,
    setCoachMessage,
  };
}
