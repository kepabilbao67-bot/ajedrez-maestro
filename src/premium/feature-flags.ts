export type FeatureFlag = 'ads' | 'limited-ai' | 'daily-exercises' | 'classic-theme' | 'all-themes' | 'advanced-coach' | 'unlimited-analysis' | 'full-statistics';

export interface PremiumStatus {
  readonly tier: 'free' | 'pro';
}

export const FREE_FEATURES: readonly FeatureFlag[] = ['ads', 'limited-ai', 'daily-exercises', 'classic-theme'];
export const PREMIUM_FEATURES: readonly FeatureFlag[] = ['all-themes', 'advanced-coach', 'unlimited-analysis', 'full-statistics'];

/** Policy only; no billing SDK, network request, or store access is involved. */
export function featureEnabled(flag: FeatureFlag, status: PremiumStatus): boolean {
  return status.tier === 'pro' ? !['ads', 'limited-ai'].includes(flag) : FREE_FEATURES.includes(flag);
}
