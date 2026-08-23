import { StyleSheet, Text, View } from 'react-native';

import type { AchievementDefinition } from '@/gamification/achievements';
import type { GamificationState } from '@/gamification/xp-types';
import type { PlayerProfile } from '@/profile/profile-types';

export interface ProfilePanelProps {
  readonly profile: PlayerProfile;
  readonly gamification: GamificationState;
  readonly playerLevel: string;
  readonly progressToNextLevel: number;
  readonly nextAchievement?: AchievementDefinition;
}

export function ProfilePanel({
  profile,
  gamification,
  playerLevel,
  progressToNextLevel,
  nextAchievement,
}: ProfilePanelProps) {
  return (
    <View style={styles.wrapper}>
      <View accessibilityLabel="Mi progreso" style={styles.profilePanel}>
        <Text selectable style={styles.profileTitle}>Mi progreso</Text>
        <View style={styles.profileStats}>
          <View style={styles.profileStat}>
            <Text selectable style={styles.profileValue}>{profile.learning.gamesPlayed}</Text>
            <Text selectable style={styles.profileLabel}>partidas</Text>
          </View>
          <View style={styles.profileStat}>
            <Text selectable style={styles.profileValue}>{profile.learning.estimatedLevel}</Text>
            <Text selectable style={styles.profileLabel}>nivel</Text>
          </View>
          <View style={styles.profileStat}>
            <Text selectable style={styles.profileValue}>+{profile.progress.improvementScore}</Text>
            <Text selectable style={styles.profileLabel}>mejora</Text>
          </View>
        </View>
        <View accessibilityLabel={`Progreso al siguiente nivel: ${progressToNextLevel}%`} style={styles.levelProgressTrack}>
          <View style={[styles.levelProgressFill, { width: `${progressToNextLevel}%` }]} />
        </View>
        <Text selectable style={styles.profileWeaknesses}>
          {profile.learning.weaknesses.length > 0
            ? `Puntos débiles: ${profile.learning.weaknesses.join(' · ')}`
            : 'Puntos débiles: completa una partida analizada para detectarlos.'}
        </Text>
      </View>

      <View accessibilityLabel="Mi nivel" style={styles.levelPanel}>
        <View style={styles.levelHeader}>
          <Text selectable style={styles.profileTitle}>Mi nivel</Text>
          <Text selectable style={styles.levelName}>{playerLevel}</Text>
        </View>
        <View style={styles.profileStats}>
          <View style={styles.profileStat}>
            <Text selectable style={styles.profileValue}>{gamification.xp}</Text>
            <Text selectable style={styles.profileLabel}>XP</Text>
          </View>
          <View style={styles.profileStat}>
            <Text selectable style={styles.profileValue}>{gamification.dailyStreak}</Text>
            <Text selectable style={styles.profileLabel}>racha</Text>
          </View>
          <View style={styles.profileStat}>
            <Text selectable style={styles.profileValue}>{gamification.unlockedAchievements.length}</Text>
            <Text selectable style={styles.profileLabel}>logros</Text>
          </View>
        </View>
        <Text selectable style={styles.profileWeaknesses}>
          {gamification.dailyChallenge
            ? `Reto diario: ${gamification.dailyChallenge.title} · ${gamification.dailyChallenge.completed ? 'completado' : `${gamification.dailyChallenge.progress}/${gamification.dailyChallenge.target}`}`
            : 'Reto diario disponible al completar una actividad.'}
        </Text>
        <Text selectable style={styles.profileWeaknesses}>
          {nextAchievement ? `Próximo logro: ${nextAchievement.title}` : 'Todos los logros actuales desbloqueados.'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%', maxWidth: 440, gap: 12 },
  profilePanel: {
    width: '100%',
    gap: 10,
    padding: 14,
    borderRadius: 16,
    borderCurve: 'continuous',
    backgroundColor: '#14241D',
    borderWidth: 1,
    borderColor: '#294235',
  },
  profileTitle: { color: '#F5C451', fontSize: 13, fontWeight: '900' },
  profileStats: { flexDirection: 'row', gap: 8 },
  profileStat: {
    flex: 1,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderCurve: 'continuous',
    backgroundColor: '#22362C',
  },
  profileValue: { color: '#F8F4EA', fontSize: 18, fontWeight: '900', fontVariant: ['tabular-nums'] },
  profileLabel: { color: '#9EAFA5', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  profileWeaknesses: { color: '#C5D0C9', fontSize: 12, lineHeight: 18 },
  levelPanel: {
    width: '100%',
    gap: 10,
    padding: 14,
    borderRadius: 16,
    borderCurve: 'continuous',
    backgroundColor: '#1B3025',
    borderWidth: 1,
    borderColor: '#3B5A49',
  },
  levelHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  levelName: { color: '#F6E6BD', fontSize: 14, fontWeight: '900' },
  levelProgressTrack: { height: 8, overflow: 'hidden', borderRadius: 999, backgroundColor: '#0C1B13' },
  levelProgressFill: { height: '100%', borderRadius: 999, backgroundColor: '#D6A943' },
});
