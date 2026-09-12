import fs from 'node:fs';
import path from 'node:path';

const SKIP_DIRS = new Set(['history', 'node_modules', '.git', '.github']);

export interface MemoryFile {
  name: string;
  path: string;
  relativePath: string;
  subdir: string;
  isLore: boolean;
  extension: string;
}

export function readMemoryFiles(memoryPath: string): MemoryFile[] {
  if (!fs.existsSync(memoryPath)) {
    return [];
  }

  const files: MemoryFile[] = [];
  scanDir(memoryPath, memoryPath, files);
  return files;
}

function normalizePath(p: string): string {
  return p.replace(/\\/g, '/');
}

function scanDir(rootPath: string, currentPath: string, files: MemoryFile[]): void {
  const entries = fs.readdirSync(currentPath, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      scanDir(rootPath, path.join(currentPath, entry.name), files);
      continue;
    }

    const fullPath = path.join(currentPath, entry.name);
    const relativePath = normalizePath(path.relative(rootPath, fullPath));
    const dirname = path.dirname(relativePath);
    const subdir = dirname === '.' ? '' : dirname;
    const isLore = entry.name.endsWith('.lore.md');
    const extension = isLore ? '.lore.md' : path.extname(entry.name);

    files.push({
      name: entry.name,
      path: fullPath,
      relativePath,
      subdir,
      isLore,
      extension,
    });
  }
}

export function readFileContent(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8');
}

export function listSubdirs(memoryPath: string): string[] {
  if (!fs.existsSync(memoryPath)) return [];

  return fs.readdirSync(memoryPath, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !SKIP_DIRS.has(e.name))
    .map((e) => e.name);
}

export function readMemIndex(dirPath: string): string | null {
  const indexPath = path.join(dirPath, 'index.md');
  if (!fs.existsSync(indexPath)) return null;
  return readFileContent(indexPath);
}

export function listHistoryDirs(memoryPath: string): string[] {
  const entries = fs.readdirSync(memoryPath, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory() && e.name === 'history')
    .map((e) => path.join(memoryPath, e.name));
}

export function countHistoryEntries(historyDir: string): number {
  if (!fs.existsSync(historyDir)) return 0;
  return fs.readdirSync(historyDir).length;
}

export function hasNamingViolation(fileName: string): boolean {
  if (fileName.endsWith('.lore.md')) return false;
  if (!fileName.endsWith('.md')) return false;

  const loreKeywords = ['evolution', 'history', 'fix'];
  const lower = fileName.toLowerCase();
  return loreKeywords.some((kw) => lower.includes(kw));
}

const LORE_DATE_PATTERN = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/m;

export function countLoreEntries(content: string): number {
  return content.split('\n').filter((line) => LORE_DATE_PATTERN.test(line)).length;
}