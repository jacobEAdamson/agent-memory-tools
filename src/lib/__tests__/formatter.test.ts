import { describe, it, expect } from 'vitest';
import { formatReportString, formatJsonReport, PrettyPrint } from '@/lib/formatter.js';
import { lintMemoryDir } from '@/lib/rules.js';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

function tmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'amt-fmt-'));
}

function writeMem(dir: string, name: string, content: string): void {
  const filePath = path.join(dir, name);
  const parentDir = path.dirname(filePath);
  fs.mkdirSync(parentDir, { recursive: true });
  fs.writeFileSync(filePath, content, 'utf-8');
}

function writeHistory(dir: string, count: number): void {
  const hDir = path.join(dir, 'history');
  fs.mkdirSync(hDir);
  for (let i = 0; i < count; i++) {
    fs.writeFileSync(path.join(hDir, `entry-${i}.md`), '', 'utf-8');
  }
}

function makeLines(): { write: (l: string) => void; lines: string[] } {
  const lines: string[] = [];
  return { write: (l: string): void => { lines.push(l); }, lines };
}

function makeNoop(): { write: (l: string) => void } {
  return { write: (_l: string): void => { /* noop */ } };
}

function makeSink(): { write: (l: string) => void; lines: string[] } {
  const lines: string[] = [];
  return { write: (l: string): void => { lines.push(l); }, lines };
}

describe('PrettyPrint', () => {
  it('writes lines to sink with correct indentation', () => {
    const { write, lines } = makeSink();
    const pp = new PrettyPrint({ write });

    pp.add('root');
    pp.group(() => {
      pp.add('child');
      pp.group(() => {
        pp.add('grandchild');
      });
      pp.add('child2');
    });
    pp.add('end');

    expect(lines).toEqual([
      'root',
      '  child',
      '    grandchild',
      '  child2',
      'end',
    ]);
  });

  it('blank adds empty line', () => {
    const { write, lines } = makeLines();
    const pp = new PrettyPrint({ write });
    pp.add('a');
    pp.blank();
    pp.add('b');
    expect(lines).toEqual(['a', '', 'b']);
  });

  it('add returns this for chaining', () => {
    const pp = new PrettyPrint(makeNoop());
    expect(pp.add('x')).toBe(pp);
  });

  it('handles deep nesting', () => {
    const { write, lines } = makeSink();
    const pp = new PrettyPrint({ write });
    pp.group(() => {
      pp.group(() => {
        pp.group(() => {
          pp.add('deep');
        });
      });
    });
    expect(lines).toEqual(['      deep']);
  });
});

describe('formatReportString', () => {
  it('returns PASSED string for passing report', () => {
    const dir = tmpDir();
    writeMem(dir, 'index.md', '| File | |');
    writeMem(dir, 'clean.md', 'small');
    const report = lintMemoryDir(dir);
    const output = formatReportString(report);
    expect(output).toContain('PASSED');
    fs.rmSync(dir, { recursive: true });
  });

  it('includes error and warning counts', () => {
    const dir = tmpDir();
    writeMem(dir, 'index.md', '| File | |');
    writeMem(dir, 'evolution.md', 'bad name');
    const report = lintMemoryDir(dir);
    const output = formatReportString(report);
    expect(output).toContain('Errors:');
    expect(output).toContain('Warnings:');
    fs.rmSync(dir, { recursive: true });
  });

  it('includes all issue sections when issues exist', () => {
    const dir = tmpDir();
    writeMem(dir, 'index.md', '| File | |');
    writeMem(dir, 'large.md', 'x'.repeat(100_000));
    const entries = Array.from({ length: 60 }, (_, i) => `2026-09-12 10:${(30 + i).toString().padStart(2, '0')} entry ${i + 1}`);
    writeMem(dir, 'topic.lore.md', entries.join('\n'));
    writeHistory(dir, 6);
    writeMem(dir, 'unlisted.md', 'content');
    writeMem(dir, 'evolution.md', 'bad name');
    fs.mkdirSync(path.join(dir, 'mud'));
    writeMem(path.join(dir, 'mud'), 'client.md', 'x');

    const report = lintMemoryDir(dir);
    const output = formatReportString(report);
    expect(output).toContain('FAILED');
    expect(output).toContain('Token Estimates');
    expect(output).toContain('Lore Entry Counts');
    expect(output).toContain('History Consolidation');
    expect(output).toContain('Subdirectories Missing index.md');
    expect(output).toContain('Naming Violations');
    fs.rmSync(dir, { recursive: true });
  });
});

describe('formatJsonReport', () => {
  it('returns valid JSON', () => {
    const dir = tmpDir();
    writeMem(dir, 'index.md', '| File | |');
    writeMem(dir, 'f1.md', 'x');
    const report = lintMemoryDir(dir);
    const json = formatJsonReport(report);
    const parsed = JSON.parse(json) as Record<string, unknown>;
    expect(parsed.passed).toBe(true);
    fs.rmSync(dir, { recursive: true });
  });
});