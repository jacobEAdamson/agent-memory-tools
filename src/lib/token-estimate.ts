import type { Severity } from '@/types.js';

const WARN_THRESHOLD = 10_000;
const ERROR_THRESHOLD = 15_000;

export function estimateTokens(text: string): number {
  return Math.round(text.length / 4);
}

export function severityFromTokenCount(count: number): Severity {
  if (count >= ERROR_THRESHOLD) return 'error';
  if (count >= WARN_THRESHOLD) return 'warn';
  return 'ok';
}