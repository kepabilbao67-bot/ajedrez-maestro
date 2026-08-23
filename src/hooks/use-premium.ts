import { useCallback, useState } from 'react';

import {
  canAccessDifficulty as checkDifficulty,
  canRunAnalysis as checkAnalysis,
  canSelectTheme as checkTheme,
  canUseCoachHint as checkCoachHint,
  canUseFeature as checkFeature,
  consumeDailyUsage,
  isPro as checkIsPro,
  normalizeDailyUsage,
} from '@/premium/premium-policy';
import type { DailyUsage, PremiumFeature, PremiumStatus, PremiumTier } from '@/premium/premium-types';
import { DEFAULT_DAILY_USAGE } from '@/premium/premium-types';

export interface UsePremiumResult {
  readonly premiumStatus: PremiumStatus;
  readonly isPro: boolean;
  readonly dailyUsage: DailyUsage;
  readonly canUseFeature: (feature: PremiumFeature) => boolean;
  readonly canAccessDifficulty: (level: number) => boolean;
  readonly canUseCoachHint: () => boolean;
  readonly canRunAnalysis: () => boolean;
  readonly canSelectTheme: (themeId: string) => boolean;
  readonly consumeUsage: (action: 'hint' | 'analysis' | 'exercise') => void;
  readonly setTier: (tier: PremiumTier) => void;
}

export function usePremium(initialStatus?: PremiumStatus): UsePremiumResult {
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatus>(initialStatus ?? { tier: 'free' });
  const [dailyUsage, setDailyUsage] = useState<DailyUsage>(() => {
    const today = new Date().toISOString().split('T')[0];
    return normalizeDailyUsage(DEFAULT_DAILY_USAGE, today);
  });

  const isPro = checkIsPro(premiumStatus);

  const canUseFeature = useCallback(
    (feature: PremiumFeature) => checkFeature(feature, premiumStatus),
    [premiumStatus],
  );

  const canAccessDifficulty = useCallback(
    (level: number) => checkDifficulty(level, premiumStatus),
    [premiumStatus],
  );

  const canUseCoachHint = useCallback(
    () => checkCoachHint(dailyUsage, premiumStatus),
    [dailyUsage, premiumStatus],
  );

  const canRunAnalysis = useCallback(
    () => checkAnalysis(dailyUsage, premiumStatus),
    [dailyUsage, premiumStatus],
  );

  const canSelectTheme = useCallback(
    (themeId: string) => checkTheme(themeId, premiumStatus),
    [premiumStatus],
  );

  const consumeUsage = useCallback((action: 'hint' | 'analysis' | 'exercise') => {
    const today = new Date().toISOString().split('T')[0];
    setDailyUsage((current) => consumeDailyUsage(current, action, today));
  }, []);

  const setTier = useCallback((tier: PremiumTier) => {
    setPremiumStatus({ tier });
  }, []);

  return {
    premiumStatus,
    isPro,
    dailyUsage,
    canUseFeature,
    canAccessDifficulty,
    canUseCoachHint,
    canRunAnalysis,
    canSelectTheme,
    consumeUsage,
    setTier,
  };
}
