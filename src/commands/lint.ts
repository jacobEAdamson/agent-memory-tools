import { Command } from 'commander';
import { lintMemoryDir } from '@/lib/rules.js';
import { formatReportString, formatJsonReport } from '@/lib/formatter.js';
import fs from 'node:fs';
import path from 'node:path';

export function lintCommand(): Command {
  const cmd = new Command('lint')
    .description('Validate memory files against architecture rules')
    .option('-p, --path <dir>', 'Path to .agents/memories/ directory')
    .option('--json', 'Output JSON instead of human-readable report')
    .action((opts: { path?: string; json?: boolean }) => {
      const memoryPath = opts.path ?? findDefaultMemoryPath();
      const report = lintMemoryDir(memoryPath);

      if (opts.json) {
        process.stdout.write(formatJsonReport(report));
      } else {
        process.stdout.write(formatReportString(report));
      }

      process.exit(report.passed ? 0 : 1);
    });

  return cmd;
}

function findDefaultMemoryPath(): string {
  const startDir = process.cwd();
  let dir = startDir;

  for (let i = 0; i < 5; i++) {
    const candidate = path.join(dir, '.agents', 'memories');
    if (fs.existsSync(candidate)) return candidate;

    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  return path.join(startDir, '.agents', 'memories');
}