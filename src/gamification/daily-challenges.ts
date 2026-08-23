import type { DailyChallenge, DailyChallengeKind } from './xp-types';

interface ChallengeTemplate {
  readonly kind: DailyChallengeKind;
  readonly title: string;
  readonly rewardXp: number;
  readonly target: number;
}

const DAILY_TEMPLATES: readonly ChallengeTemplate[] = [
  { kind: 'game-completed', title: 'Juega 2 partidas', rewardXp: 50, target: 2 },
  { kind: 'analysis-completed', title: 'Analiza 2 partidas', rewardXp: 40, target: 2 },
  { kind: 'exercise-completed', title: 'Resuelve 3 ejercicios', rewardXp: 90, target: 3 },
];

export function calendarDate(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function createDailyChallenge(date = calendarDate()): DailyChallenge {
  const dayIndex = Number(date.replaceAll('-', '')) % DAILY_TEMPLATES.length;
  const template = DAILY_TEMPLATES[dayIndex];
  return {
    id: `${date}-${template.kind}`,
    date,
    title: template.title,
    rewardXp: template.rewardXp,
    kind: template.kind,
    target: template.target,
    progress: 0,
    completed: false,
  };
}

export function progressDailyChallenge(challenge: DailyChallenge, event: DailyChallengeKind): DailyChallenge {
  if (challenge.completed || challenge.kind !== event) return challenge;
  const progress = Math.min(challenge.target, challenge.progress + 1);
  return { ...challenge, progress, completed: progress >= challenge.target };
}
