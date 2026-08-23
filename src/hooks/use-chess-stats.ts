import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ChessStats {
  readonly puzzleRushHighScore: number;
  readonly totalWins: number;
  readonly gamesPlayed: number;
}

const STATS_KEY = '@ajedrezpro_chess_stats';
const DEFAULT_STATS: ChessStats = {
  puzzleRushHighScore: 0,
  totalWins: 0,
  gamesPlayed: 0,
};

export const useChessStats = () => {
  const [stats, setStats] = useState<ChessStats>(DEFAULT_STATS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    AsyncStorage.getItem(STATS_KEY)
      .then((jsonValue) => {
        if (!isMounted || jsonValue == null) return;
        const stored = JSON.parse(jsonValue) as Partial<ChessStats>;
        setStats({
          puzzleRushHighScore: Number.isFinite(stored.puzzleRushHighScore) ? Math.max(0, stored.puzzleRushHighScore!) : 0,
          totalWins: Number.isFinite(stored.totalWins) ? Math.max(0, stored.totalWins!) : 0,
          gamesPlayed: Number.isFinite(stored.gamesPlayed) ? Math.max(0, stored.gamesPlayed!) : 0,
        });
      })
      .catch((error: unknown) => {
        console.error('Error loading chess stats', error);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const saveStats = async (newStats: ChessStats) => {
    try {
      const jsonValue = JSON.stringify(newStats);
      await AsyncStorage.setItem(STATS_KEY, jsonValue);
      setStats(newStats);
    } catch (e) {
      console.error("Error saving chess stats", e);
    }
  };

  const updatePuzzleRushScore = useCallback(async (score: number) => {
    if (score > stats.puzzleRushHighScore) {
      const newStats = { ...stats, puzzleRushHighScore: score };
      await saveStats(newStats);
      return true;
    }
    return false;
  }, [stats]);

  const recordGame = useCallback(async (won: boolean) => {
    const newStats = {
      ...stats,
      gamesPlayed: stats.gamesPlayed + 1,
      totalWins: won ? stats.totalWins + 1 : stats.totalWins,
    };
    await saveStats(newStats);
  }, [stats]);

  const resetStats = useCallback(() => {
    setStats(DEFAULT_STATS);
  }, []);

  return {
    stats,
    isLoading,
    updatePuzzleRushScore,
    recordGame,
    resetStats,
  };
};
