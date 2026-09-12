import path from 'node:path';
import type { LintResults, LintReport } from '@/types.js';
import { estimateTokens, severityFromTokenCount } from '@/lib/token-estimate.js';
import { readMemoryFiles, readFileContent, listSubdirs, readMemIndex, listHistoryDirs, countHistoryEntries, countLoreEntries, hasNamingViolation } from '@/lib/files.js';
import { checkConfig } from '@/lib/config-check.js';
import { LORE_ENTRY_WARN } from '@/lib/formatter.js';

export function lintMemoryDir(memoryPath: string): LintReport {
  const results: LintResults = {
    tokenEstimates: [],
    loreEntryCounts: [],
    historyConsolidationIssues: [],
    indexCompletenessIssues: [],
    subdirMissingIndexIssues: [],
    rootSubdirListingIssues: [],
    namingViolations: [],
    configCheck: { exists: false, hasHardLoad: false },
  };

  let errors = 0;
  let warnings = 0;

  const files = readMemoryFiles(memoryPath);

  // Only .md and .lore.md files
  const mdFiles = files.filter((f) => f.extension === '.md' || f.extension === '.lore.md');
  const subdirs = listSubdirs(memoryPath);

  // Rule 1: Token estimates (lean .md only)
  for (const file of mdFiles) {
    if (file.isLore) continue;
    const content = readFileContent(file.path);
    const tokens = estimateTokens(content);
    const severity = severityFromTokenCount(tokens);

    if (severity !== 'ok') {
      results.tokenEstimates.push({
        file: file.relativePath,
        charCount: content.length,
        estimatedTokens: tokens,
        severity,
      });

      if (severity === 'error') errors++;
      if (severity === 'warn') warnings++;
    }
  }

  // Rule 2: Lore entry count
  for (const file of mdFiles) {
    if (!file.isLore) continue;
    const content = readFileContent(file.path);
    const count = countLoreEntries(content);
    if (count > LORE_ENTRY_WARN) {
      results.loreEntryCounts.push({ file: file.relativePath, entryCount: count });
      warnings++;
    }
  }

  // Rule 3: History consolidation
  const historyDirs = listHistoryDirs(memoryPath);
  for (const dir of historyDirs) {
    const count = countHistoryEntries(dir);
    if (count > 5) {
      results.historyConsolidationIssues.push({
        dir: path.relative(memoryPath, dir),
        entryCount: count,
      });
      warnings++;
    }
  }

  // Rule 4: Subdir index existence
  for (const subdir of subdirs) {
    const subdirPath = path.join(memoryPath, subdir);
    const index = readMemIndex(subdirPath);
    if (index === null) {
      results.subdirMissingIndexIssues.push({ subdir });
      errors++;
    }
  }

  // Rule 5: Root index lists subdirs
  const rootIndex = readMemIndex(memoryPath);
  if (rootIndex !== null && subdirs.length > 0) {
    for (const subdir of subdirs) {
      const backtickName = `\`${subdir}/\``;
      if (!rootIndex.includes(backtickName)) {
        results.rootSubdirListingIssues.push({ subdir });
        warnings++;
      }
    }
  }

  // Rule 6: Index completeness (per-directory)
  for (const file of mdFiles) {
    if (file.name === 'index.md') continue;

    const fileDir = file.subdir === '' ? memoryPath : path.join(memoryPath, file.subdir);
    const dirIndex = readMemIndex(fileDir);

    if (dirIndex === null) continue;

    const backtickName = `\`${file.name}\``;
    if (!dirIndex.includes(backtickName)) {
      results.indexCompletenessIssues.push({ file: file.relativePath, subdir: file.subdir });
      warnings++;
    }
  }

  // Rule 7: Naming violations
  for (const file of mdFiles) {
    if (file.isLore) continue;
    if (hasNamingViolation(file.name)) {
      results.namingViolations.push({
        file: file.relativePath,
        expectedExtension: '.lore.md',
      });
      errors++;
    }
  }

  // Rule 8: Config check
  results.configCheck = checkConfig();
  if (!results.configCheck.exists) errors++;
  if (!results.configCheck.hasHardLoad) warnings++;

  const passed = errors === 0;

  return {
    passed,
    results,
    summary: { errors, warnings },
  };
}