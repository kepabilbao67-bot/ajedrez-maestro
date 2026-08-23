import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { GameAnalysis } from '@/ai/coach/coach-types';
import { ACHIEVEMENTS, type AchievementDefinition } from '@/gamification/achievements';
import { XpService, levelForXp } from '@/gamification/xp-service';
import { DEFAULT_GAMIFICATION_STATE, XP_LEVELS, type GamificationState, type PlayerLevel } from '@/gamification/xp-types';
import { ProfileService } from '@/profile/profile-service';
import { createDefaultProfile, type PlayerProfile, type ProfileGameResult } from '@/profile/profile-types';

export interface UsePlayerProgressResult {
  readonly profile: PlayerProfile;
  readonly gamification: GamificationState;
  readonly playerLevel: PlayerLevel;
  readonly nextLevelXp: number;
  readonly progressToNextLevel: number;
  readonly nextAchievement: AchievementDefinition | undefined;
  readonly recordCompletedGame: (result: ProfileGameResult, checkmate: boolean, coachReport: GameAnalysis | null) => void;
  readonly recordHint: () => void;
  readonly recordAnalysis: (report: GameAnalysis) => void;
  readonly reloadProgress: () => void;
}

export function usePlayerProgress(): UsePlayerProgressResult {
  const [profile, setProfile] = useState<PlayerProfile>(createDefaultProfile);
  const [gamification, setGamification] = useState<GamificationState>(DEFAULT_GAMIFICATION_STATE);

  const profileServiceRef = useRef<ProfileService | null>(null);
  const xpServiceRef = useRef<XpService | null>(null);
  profileServiceRef.current ??= new ProfileService();
  xpServiceRef.current ??= new XpService();

  useEffect(() => {
    const savedProfile = profileServiceRef.current!.load();
    setProfile(savedProfile);
    setGamification(savedProfile.gamification ?? DEFAULT_GAMIFICATION_STATE);
  }, []);

  const reloadProgress = useCallback(() => {
    setProfile(profileServiceRef.current!.load());
    setGamification(xpServiceRef.current!.load());
  }, []);

  const recordCompletedGame = useCallback(
    (result: ProfileGameResult, checkmate: boolean, coachReport: GameAnalysis | null) => {
      const updatedProfile = profileServiceRef.current!.recordCompletedGame(result, coachReport);
      setProfile(updatedProfile);
      let updatedGamification = xpServiceRef.current!.recordGame(result, checkmate);
      if (updatedProfile.progress.improvementScore > profile.progress.improvementScore) {
        updatedGamification = xpServiceRef.current!.recordPersonalImprovement();
      }
      setGamification(updatedGamification);
    },
    [profile.progress.improvementScore],
  );

  const recordHint = useCallback(() => {
    setProfile(profileServiceRef.current!.recordHint());
  }, []);

  const recordAnalysis = useCallback((report: GameAnalysis) => {
    setProfile(profileServiceRef.current!.saveAnalysis(report));
    setGamification(xpServiceRef.current!.recordAnalysis());
  }, []);

  const playerLevel = useMemo(() => levelForXp(gamification.xp), [gamification.xp]);

  const nextLevelXp = useMemo(
    () => XP_LEVELS.find((def) => def.minimumXp > gamification.xp)?.minimumXp ?? gamification.xp,
    [gamification.xp],
  );

  const progressToNextLevel = useMemo(
    () => (nextLevelXp === gamification.xp ? 100 : Math.min(100, Math.round((gamification.xp / nextLevelXp) * 100))),
    [gamification.xp, nextLevelXp],
  );

  const nextAchievement = useMemo(
    () => ACHIEVEMENTS.find((achievement) => !gamification.unlockedAchievements.some((item) => item.id === achievement.id)),
    [gamification.unlockedAchievements],
  );

  return {
    profile,
    gamification,
    playerLevel,
    nextLevelXp,
    progressToNextLevel,
    nextAchievement,
    recordCompletedGame,
    recordHint,
    recordAnalysis,
    reloadProgress,
  };
}
