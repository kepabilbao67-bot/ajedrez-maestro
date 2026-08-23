import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { boardThemeById, type BoardThemeDefinition } from '@/board-themes/board-themes';
import { pieceSetById, type PieceSetDefinition } from '@/board-themes/piece-sets';
import { canSelectTheme } from '@/premium/premium-policy';
import type { PremiumStatus } from '@/premium/premium-types';
import { DEFAULT_VISUAL_PREFERENCES, VisualPreferencesService, type VisualPreferences } from '@/theme/visual-preferences';

export interface UseVisualPreferencesOptions {
  readonly premiumStatus?: PremiumStatus;
}

export interface UseVisualPreferencesResult {
  readonly visualPreferences: VisualPreferences;
  readonly boardTheme: BoardThemeDefinition;
  readonly pieceSet: PieceSetDefinition;
  readonly updateVisualPreferences: (change: Partial<VisualPreferences>) => void;
}

export function useVisualPreferences(options?: UseVisualPreferencesOptions): UseVisualPreferencesResult {
  const [visualPreferences, setVisualPreferences] = useState<VisualPreferences>(DEFAULT_VISUAL_PREFERENCES);
  const serviceRef = useRef<VisualPreferencesService | null>(null);
  serviceRef.current ??= new VisualPreferencesService();

  useEffect(() => {
    setVisualPreferences(serviceRef.current!.load());
  }, []);

  const updateVisualPreferences = useCallback(
    (change: Partial<VisualPreferences>) => {
      const currentStatus = options?.premiumStatus ?? { tier: 'free' };
      if (change.boardTheme && !canSelectTheme(change.boardTheme, currentStatus)) {
        return;
      }
      setVisualPreferences(serviceRef.current!.update(change));
    },
    [options?.premiumStatus],
  );

  const boardTheme = useMemo(() => boardThemeById(visualPreferences.boardTheme), [visualPreferences.boardTheme]);
  const pieceSet = useMemo(() => pieceSetById(visualPreferences.pieceSet), [visualPreferences.pieceSet]);

  return {
    visualPreferences,
    boardTheme,
    pieceSet,
    updateVisualPreferences,
  };
}
