import { describe, it, expect } from 'vitest';
import { lintMemoryDir } from '@/lib/rules.js';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

interface Fixture {
  dir: string;
}

function createFixture(): Fixture {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'amt-rules-'));
  return { dir };
}

function writeMem(dir: string, name: string, content: string): void {
  const filePath = path.join(dir, name);
  const parentDir = path.dirname(filePath);
  fs.mkdirSync(parentDir, { recursive: true });
  fs.writeFileSync(filePath, content, 'utf-8');
}

describe('rules', () => {
  describe('lintMemoryDir', () => {
    it('passes with empty memory dir', () => {
      const { dir } = createFixture();
      const report = lintMemoryDir(dir);
      expect(report.passed).toBe(true);
      expect(report.summary.errors).toBe(0);
      expect(report.summary.warnings).toBe(0);
      fs.rmSync(dir, { recursive: true });
    });

    it('passes with clean well-formed files', () => {
      const { dir } = createFixture();
      writeMem(dir, 'index.md', '| File | |\n|---|---|\n| `backend.md` | |');
      writeMem(dir, 'backend.md', '---\nkind: lean\nupdated_at: 2026-09-12T00:00:00Z\n---\n\nsmall content');
      const report = lintMemoryDir(dir);
      expect(report.passed).toBe(true);
      expect(report.summary.errors).toBe(0);
      fs.rmSync(dir, { recursive: true });
    });

    it('flags subdirectories missing index.md', () => {
      const { dir } = createFixture();
      writeMem(dir, 'index.md', '| File | |');
      fs.mkdirSync(path.join(dir, 'mud'));
      writeMem(path.join(dir, 'mud'), 'client.md', 'content');
      const report = lintMemoryDir(dir);
      expect(report.results.subdirMissingIndexIssues).toHaveLength(1);
      expect(report.results.subdirMissingIndexIssues[0].subdir).toBe('mud');
      expect(report.summary.errors).toBeGreaterThan(0);
      fs.rmSync(dir, { recursive: true });
    });

    it('flags root index.md missing subdirectory references', () => {
      const { dir } = createFixture();
      writeMem(dir, 'index.md', '| File | |\n|---|---|');
      writeMem(path.join(dir, 'mud'), 'index.md', '# MUD\n| File | |');
      const report = lintMemoryDir(dir);
      expect(report.results.rootSubdirListingIssues).toHaveLength(1);
      expect(report.results.rootSubdirListingIssues[0].subdir).toBe('mud');
      fs.rmSync(dir, { recursive: true });
    });

    it('flags files missing from subdir index.md', () => {
      const { dir } = createFixture();
      writeMem(dir, 'index.md', '| File | |\n|---|---|\n| `mud/` | |');
      writeMem(path.join(dir, 'mud'), 'index.md', '| File | |\n|---|---|');
      writeMem(path.join(dir, 'mud'), 'client.md', 'content');
      const report = lintMemoryDir(dir);
      const mudIssues = report.results.indexCompletenessIssues.filter((i) => i.subdir === 'mud');
      expect(mudIssues).toHaveLength(1);
      expect(mudIssues[0].file).toBe('mud/client.md');
      fs.rmSync(dir, { recursive: true });
    });

    it('passes with valid subdirectory structure', () => {
      const { dir } = createFixture();
      writeMem(dir, 'index.md', '| File | |\n|---|---|\n| `mud/` | |');
      writeMem(path.join(dir, 'mud'), 'index.md', '| File | |\n|---|---|\n| `client.md` | |');
      writeMem(path.join(dir, 'mud'), 'client.md', '---\nkind: lean\nupdated_at: 2026-09-12T00:00:00Z\n---\n\ncontent');
      const report = lintMemoryDir(dir);
      expect(report.passed).toBe(true);
      fs.rmSync(dir, { recursive: true });
    });

    it('flags large lean .md files as warning but not .lore.md', () => {
      const { dir } = createFixture();
      const large = 'x'.repeat(41_000);
      writeMem(dir, 'index.md', '| File | |');
      writeMem(dir, 'big.md', large);
      writeMem(dir, 'big.lore.md', large);
      const report = lintMemoryDir(dir);
      expect(report.results.tokenEstimates).toHaveLength(1);
      expect(report.results.tokenEstimates[0].file).toBe('big.md');
      fs.rmSync(dir, { recursive: true });
    });

    it('flags naming violations', () => {
      const { dir } = createFixture();
      writeMem(dir, 'index.md', '| File | |\n|---|---|');
      writeMem(dir, 'my-evolution.md', 'should be lore');
      const report = lintMemoryDir(dir);
      expect(report.results.namingViolations).toHaveLength(1);
      expect(report.results.namingViolations[0].file).toBe('my-evolution.md');
      expect(report.summary.errors).toBeGreaterThan(0);
      fs.rmSync(dir, { recursive: true });
    });

    it('flags missing frontmatter', () => {
      const { dir } = createFixture();
      writeMem(dir, 'index.md', '| File | |\n|---|---|\n| `nofm.md` | |');
      writeMem(dir, 'nofm.md', 'content without frontmatter');
      const report = lintMemoryDir(dir);
      expect(report.results.frontmatterIssues).toHaveLength(1);
      expect(report.results.frontmatterIssues[0].file).toBe('nofm.md');
      expect(report.summary.errors).toBeGreaterThan(0);
      fs.rmSync(dir, { recursive: true });
    });

    it('reports config check result', () => {
      const { dir } = createFixture();
      writeMem(dir, 'index.md', '| File | |\n|---|---|');
      const report = lintMemoryDir(dir);
      expect(report.results.configCheck).toBeDefined();
      expect(typeof report.results.configCheck.exists).toBe('boolean');
      fs.rmSync(dir, { recursive: true });
    });
  });
});