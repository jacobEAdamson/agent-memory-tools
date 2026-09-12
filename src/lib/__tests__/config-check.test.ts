import { describe, it, expect } from 'vitest';
import { checkConfig } from '@/lib/config-check.js';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

describe('config-check', () => {
  it('returns exists false for non-existent file', () => {
    const result = checkConfig('/nonexistent/AGENTS.md');
    expect(result.exists).toBe(false);
    expect(result.hasHardLoad).toBe(false);
  });

  it('returns exists true with hasHardLoad when AGENTS.md ref present', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'amt-test-'));
    const filePath = path.join(dir, 'AGENTS.md');
    fs.writeFileSync(filePath, 'Hard load ~/.config/opencode/AGENTS.md\n');

    const result = checkConfig(filePath);
    expect(result.exists).toBe(true);
    expect(result.hasHardLoad).toBe(true);

    fs.rmSync(dir, { recursive: true });
  });

  it('returns hasHardLoad false when no memory refs present', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'amt-test-'));
    const filePath = path.join(dir, 'AGENTS.md');
    fs.writeFileSync(filePath, 'Just some random config\n');

    const result = checkConfig(filePath);
    expect(result.exists).toBe(true);
    expect(result.hasHardLoad).toBe(false);

    fs.rmSync(dir, { recursive: true });
  });

  it('detects memory-architecture skill reference', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'amt-test-'));
    const filePath = path.join(dir, 'AGENTS.md');
    fs.writeFileSync(filePath, 'load the memory-architecture skill\n');

    const result = checkConfig(filePath);
    expect(result.exists).toBe(true);
    expect(result.hasHardLoad).toBe(true);

    fs.rmSync(dir, { recursive: true });
  });
});