export type TrainingCategory = 'mate-in-1' | 'mate-in-2' | 'basic-tactics' | 'win-material' | 'best-move' | 'defend-position';
export type TrainingDifficulty = 1 | 2 | 3 | 4 | 5;

export interface PuzzleMove {
  readonly from: string;
  readonly to: string;
  readonly promotion?: 'q' | 'r' | 'b' | 'n';
}

export interface TrainingPuzzle {
  readonly id: string;
  readonly title: string;
  readonly fen: string;
  readonly solution: readonly PuzzleMove[];
  readonly difficulty: TrainingDifficulty;
  readonly category: TrainingCategory;
  readonly rewardXp: number;
  readonly explanation: string;
  readonly objective: string;
  readonly alternative: string;
}

export interface PuzzleAttempt {
  readonly correct: boolean;
  readonly legal: boolean;
  readonly completed: boolean;
  readonly nextStep: number;
  readonly message: string;
  readonly explanation: string;
  readonly alternative: string;
  readonly learning: string;
}
