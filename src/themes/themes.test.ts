import { describe, expect, it } from 'vitest';
import { BOARD_THEMES } from './boards';
import { PIECE_SETS } from './pieces';

describe('commercial theme catalog', () => {
  it('keeps Classic free and premium styles prepared', () => {
    expect(BOARD_THEMES.find((theme) => theme.id === 'classic')?.availability).toBe('free');
    expect(BOARD_THEMES.filter((theme) => theme.availability === 'prepared')).not.toHaveLength(0);
    expect(PIECE_SETS.map((set) => set.name)).toContain('3D');
  });
});
