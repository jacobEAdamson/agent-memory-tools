import { describe, it, expect } from 'vitest';
import { estimateTokens, severityFromTokenCount } from '@/lib/token-estimate.js';

describe('token-estimate', () => {
  describe('estimateTokens', () => {
    it('returns ~chars/4 for empty string', () => {
      expect(estimateTokens('')).toBe(0);
    });

    it('returns ~chars/4 for short text', () => {
      expect(estimateTokens('hello world')).toBe(3);
    });

    it('returns ~chars/4 for longer text', () => {
      const text = 'a'.repeat(100);
      expect(estimateTokens(text)).toBe(25);
    });
  });

  describe('severityFromTokenCount', () => {
    it('returns ok for small counts', () => {
      expect(severityFromTokenCount(100)).toBe('ok');
      expect(severityFromTokenCount(9999)).toBe('ok');
    });

    it('returns warn at 10k', () => {
      expect(severityFromTokenCount(10_000)).toBe('warn');
      expect(severityFromTokenCount(14_999)).toBe('warn');
    });

    it('returns error at 15k', () => {
      expect(severityFromTokenCount(15_000)).toBe('error');
      expect(severityFromTokenCount(100_000)).toBe('error');
    });
  });
});