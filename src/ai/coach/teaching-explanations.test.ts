import { describe, expect, it } from 'vitest';
import { explainOpening, explainThreat } from './teaching-explanations';

describe('teaching explanations', () => {
  it('gives local opening and threat guidance', () => {
    expect(explainOpening(2).message).toContain('desarrolla');
    expect(explainThreat(true).message).toContain('rey');
  });
});
