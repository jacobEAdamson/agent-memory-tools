import { describe, it, expect } from 'vitest';
import { readMemoryFiles, readFileContent, hasNamingViolation, countLoreEntries, listSubdirs, readMemIndex, parseFrontmatter } from '@/lib/files.js';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

function tmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'amt-test-'));
}

describe('files', () => {
  describe('readMemoryFiles', () => {
    it('returns empty array for non-existent dir', () => {
      expect(readMemoryFiles('/nonexistent')).toEqual([]);
    });

    it('returns files with correct metadata from root dir', () => {
      const dir = tmpDir();
      fs.writeFileSync(path.join(dir, 'backend.md'), 'content');
      fs.writeFileSync(path.join(dir, 'backend.lore.md'), 'lore');
      fs.writeFileSync(path.join(dir, 'readme.txt'), 'text');

      const files = readMemoryFiles(dir);
      expect(files).toHaveLength(3);

      const backendMd = files.find((f) => f.name === 'backend.md');
      expect(backendMd?.subdir).toBe('');
      expect(backendMd?.relativePath).toBe('backend.md');

      const backendLore = files.find((f) => f.name === 'backend.lore.md');
      expect(backendLore?.isLore).toBe(true);

      fs.rmSync(dir, { recursive: true });
    });

    it('scans subdirectories recursively', () => {
      const dir = tmpDir();
      const subdir = path.join(dir, 'mud');
      fs.mkdirSync(subdir);
      fs.writeFileSync(path.join(dir, 'index.md'), 'root');
      fs.writeFileSync(path.join(subdir, 'client.md'), 'client');
      fs.writeFileSync(path.join(subdir, 'index.md'), 'sub');

      const files = readMemoryFiles(dir);
      const client = files.find((f) => f.name === 'client.md');
      expect(client?.subdir).toBe('mud');
      expect(client?.relativePath).toBe('mud/client.md');

      fs.rmSync(dir, { recursive: true });
    });

    it('skips node_modules, .git dirs', () => {
      const dir = tmpDir();
      fs.mkdirSync(path.join(dir, 'node_modules'));
      fs.mkdirSync(path.join(dir, '.git'));
      fs.writeFileSync(path.join(dir, 'root.md'), 'x');

      const files = readMemoryFiles(dir);
      expect(files).toHaveLength(1);
      expect(files[0].name).toBe('root.md');

      fs.rmSync(dir, { recursive: true });
    });
  });

  describe('listSubdirs', () => {
    it('returns empty for no subdirs', () => {
      const dir = tmpDir();
      expect(listSubdirs(dir)).toEqual([]);
      fs.rmSync(dir, { recursive: true });
    });

    it('returns subdirectory names', () => {
      const dir = tmpDir();
      fs.mkdirSync(path.join(dir, 'mud'));
      fs.mkdirSync(path.join(dir, 'backend'));
      const subdirs = listSubdirs(dir);
      expect(subdirs).toEqual(expect.arrayContaining(['mud', 'backend']));
      fs.rmSync(dir, { recursive: true });
    });
  });

  describe('readMemIndex', () => {
    it('returns null for dir without index.md', () => {
      const dir = tmpDir();
      expect(readMemIndex(dir)).toBeNull();
      fs.rmSync(dir, { recursive: true });
    });

    it('returns content of index.md', () => {
      const dir = tmpDir();
      fs.writeFileSync(path.join(dir, 'index.md'), '# index');
      expect(readMemIndex(dir)).toBe('# index');
      fs.rmSync(dir, { recursive: true });
    });
  });

  describe('readFileContent', () => {
    it('reads file content', () => {
      const dir = tmpDir();
      const filePath = path.join(dir, 'test.md');
      fs.writeFileSync(filePath, 'hello world');
      expect(readFileContent(filePath)).toBe('hello world');
      fs.rmSync(dir, { recursive: true });
    });
  });

  describe('hasNamingViolation', () => {
    it('returns false for .lore.md files', () => {
      expect(hasNamingViolation('backend.lore.md')).toBe(false);
      expect(hasNamingViolation('evolution.lore.md')).toBe(false);
    });

    it('returns false for clean .md files', () => {
      expect(hasNamingViolation('backend.md')).toBe(false);
      expect(hasNamingViolation('index.md')).toBe(false);
    });

    it('returns true for evolution .md', () => {
      expect(hasNamingViolation('mud-evolution.md')).toBe(true);
    });

    it('returns true for history .md', () => {
      expect(hasNamingViolation('mud-history.md')).toBe(true);
    });

    it('returns true for fix .md', () => {
      expect(hasNamingViolation('room-fix.md')).toBe(true);
    });

    it('is case-insensitive', () => {
      expect(hasNamingViolation('Evolution.md')).toBe(true);
      expect(hasNamingViolation('HISTORY.md')).toBe(true);
    });

    it('returns false for non-.md files', () => {
      expect(hasNamingViolation('evolution.txt')).toBe(false);
      expect(hasNamingViolation('history.yaml')).toBe(false);
    });
  });

  describe('parseFrontmatter', () => {
    it('returns null for content without frontmatter', () => {
      expect(parseFrontmatter('just content')).toBeNull();
      expect(parseFrontmatter('---\nnot closed')).toBeNull();
    });

    it('parses frontmatter fields', () => {
      const content = [
        '---',
        'kind: lean',
        'updated_at: 2026-09-12T00:00:00Z',
        'summary: test file',
        '---',
        '',
        '# Content here',
      ].join('\n');
      const fm = parseFrontmatter(content);
      expect(fm).not.toBeNull();
      expect(fm?.kind).toBe('lean');
      expect(fm?.updated_at).toBe('2026-09-12T00:00:00Z');
      expect(fm?.summary).toBe('test file');
    });

    it('returns empty object for empty frontmatter', () => {
      const content = '---\n---\n\ncontent';
      const fm = parseFrontmatter(content);
      expect(fm).toEqual({});
    });
  });

  describe('countLoreEntries', () => {
    it('returns 0 for empty content', () => {
      expect(countLoreEntries('')).toBe(0);
    });

    it('returns 0 for content without date stamps', () => {
      expect(countLoreEntries('just some text\nno dates here')).toBe(0);
    });

    it('counts lines with YYYY-MM-DD HH:mm pattern', () => {
      const content = [
        '2026-09-10 14:30 added new feature',
        '2026-09-11 09:15 fixed bug',
        '2026-09-12 16:00 refactored',
        'some unrelated line',
      ].join('\n');
      expect(countLoreEntries(content)).toBe(3);
    });

    it('matches full date pattern with seconds', () => {
      const content = '2026-09-12 10:30:00 something happened';
      expect(countLoreEntries(content)).toBe(1);
    });
  });
});