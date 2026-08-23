import { describe, expect, it } from 'vitest';

import { isAllowedExternalUrl } from './external-url-policy';

describe('external URL policy', () => {
  it('allows only the approved HTTPS hosts', () => {
    expect(isAllowedExternalUrl('https://github.com/nmrugg/stockfish.js')).toBe(true);
    expect(isAllowedExternalUrl('https://www.gnu.org/licenses/gpl-3.0.html')).toBe(true);
    expect(isAllowedExternalUrl('https://docs.expo.dev')).toBe(true);
  });

  it('rejects untrusted hosts, insecure protocols and deceptive URLs', () => {
    expect(isAllowedExternalUrl('http://github.com/example')).toBe(false);
    expect(isAllowedExternalUrl('https://github.com.evil.example/payload')).toBe(false);
    expect(isAllowedExternalUrl('https://github.com@evil.example/payload')).toBe(false);
    expect(isAllowedExternalUrl('javascript:alert(1)')).toBe(false);
    expect(isAllowedExternalUrl('not-a-url')).toBe(false);
  });
});
