import type { BoardThemeId } from '../board-themes/board-themes';
import type { PieceSetId } from '../board-themes/piece-sets';
import { DEFAULT_SOUND_PREFERENCES } from './sound-preferences';

export interface VisualPreferences {
  readonly boardTheme: BoardThemeId;
  readonly pieceSet: PieceSetId;
  readonly soundsEnabled: boolean;
}

export interface PreferenceStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const VISUAL_PREFERENCES_KEY = 'ajedrezpro.visual-preferences.v1';
export const DEFAULT_VISUAL_PREFERENCES: VisualPreferences = {
  boardTheme: 'classic',
  pieceSet: 'classic',
  soundsEnabled: DEFAULT_SOUND_PREFERENCES.enabled,
};

const isBoardTheme = (value: unknown): value is BoardThemeId =>
  value === 'classic' || value === 'neon-cyber' || value === 'glass' || value === 'medieval' || value === 'royal-gold' || value === 'futuristic';
const isPieceSet = (value: unknown): value is PieceSetId => value === 'classic' || value === 'modern' || value === '3d' || value === 'fantasy';

export function isVisualPreferences(value: unknown): value is VisualPreferences {
  if (!value || typeof value !== 'object') return false;
  const preferences = value as Partial<VisualPreferences>;
  return isBoardTheme(preferences.boardTheme) && isPieceSet(preferences.pieceSet) && typeof preferences.soundsEnabled === 'boolean';
}

function defaultStorage(): PreferenceStorage | null {
  return globalThis.localStorage ?? null;
}

export class VisualPreferencesService {
  constructor(private readonly storage?: PreferenceStorage, private readonly key = VISUAL_PREFERENCES_KEY) {}

  load(): VisualPreferences {
    const raw = (this.storage ?? defaultStorage())?.getItem(this.key);
    if (!raw) return { ...DEFAULT_VISUAL_PREFERENCES };
    try {
      const parsed: unknown = JSON.parse(raw);
      if (isVisualPreferences(parsed)) return parsed;
    } catch {
      // Corrupt values are removed below and replaced by the free defaults.
    }
    (this.storage ?? defaultStorage())?.removeItem(this.key);
    return { ...DEFAULT_VISUAL_PREFERENCES };
  }

  update(change: Partial<VisualPreferences>): VisualPreferences {
    const next = { ...this.load(), ...change };
    (this.storage ?? defaultStorage())?.setItem(this.key, JSON.stringify(next));
    return next;
  }
}
