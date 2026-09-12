import type { LintReport } from '@/types.js';

export const LORE_ENTRY_WARN = 50;

export interface OutputSink { write: (text: string) => void; }

export class PrettyPrint {
  private indent = 0;
  constructor(private sink: OutputSink) {}

  add(text: string): this {
    this.sink.write('  '.repeat(this.indent) + text);
    return this;
  }

  group(fn: () => void): this {
    this.indent++;
    fn();
    this.indent--;
    return this;
  }

  blank(): this {
    this.sink.write('');
    return this;
  }
}

export function formatReport(report: LintReport, out: PrettyPrint): void {
  const status = report.passed ? 'PASSED' : 'FAILED';
  out.add(`Memory Lint: ${status}`);
  out.group(() => {
    out.add(`Errors: ${report.summary.errors}`);
    out.add(`Warnings: ${report.summary.warnings}`);
  });
  out.blank();

  const r = report.results;

  if (r.tokenEstimates.length > 0) {
    out.add('Token Estimates:');
    out.group(() => {
      for (const t of r.tokenEstimates) {
        const sym = t.severity === 'error' ? '✖' : '⚠';
        out.add(`${sym} ${t.file}: ${t.estimatedTokens.toLocaleString()} tokens (${t.charCount.toLocaleString()} chars)`);
      }
    });
    out.blank();
  }

  if (r.loreEntryCounts.length > 0) {
    out.add('Lore Entry Counts:');
    out.group(() => {
      for (const l of r.loreEntryCounts) {
        out.add(`⚠ ${l.file}: ${l.entryCount} entries (max ${LORE_ENTRY_WARN})`);
      }
    });
    out.blank();
  }

  if (r.historyConsolidationIssues.length > 0) {
    out.add('History Consolidation Needed:');
    out.group(() => {
      for (const h of r.historyConsolidationIssues) {
        out.add(`⚠ ${h.dir}: ${h.entryCount} entries (max 5)`);
      }
    });
    out.blank();
  }

  if (r.subdirMissingIndexIssues.length > 0) {
    out.add('Subdirectories Missing index.md:');
    out.group(() => {
      for (const s of r.subdirMissingIndexIssues) {
        out.add(`✖ ${s.subdir}/ — no index.md`);
      }
    });
    out.blank();
  }

  if (r.rootSubdirListingIssues.length > 0) {
    out.add('Root index.md Missing Subdirectory References:');
    out.group(() => {
      for (const s of r.rootSubdirListingIssues) {
        out.add(`⚠ root index.md missing \`${s.subdir}/\``);
      }
    });
    out.blank();
  }

  if (r.indexCompletenessIssues.length > 0) {
    out.add('Index Completeness Issues:');
    out.group(() => {
      for (const i of r.indexCompletenessIssues) {
        const location = i.subdir ? `${i.subdir}/index.md` : 'root index.md';
        out.add(`⚠ ${i.file} not listed in ${location}`);
      }
    });
    out.blank();
  }

  if (r.namingViolations.length > 0) {
    out.add('Naming Violations:');
    out.group(() => {
      for (const n of r.namingViolations) {
        out.add(`✖ ${n.file} should be ${n.expectedExtension}`);
      }
    });
    out.blank();
  }

  const cfg = r.configCheck;
  if (!cfg.exists) {
    out.add('✖ ~/.config/opencode/AGENTS.md not found');
  } else if (!cfg.hasHardLoad) {
    out.add('⚠ ~/.config/opencode/AGENTS.md missing hard-load directives');
  }
  out.blank();
}

export function formatReportLines(report: LintReport): string[] {
  const lines: string[] = [];
  const out = new PrettyPrint({ write: (l: string): void => { lines.push(l); } });
  formatReport(report, out);
  return lines;
}

export function formatReportString(report: LintReport): string {
  return formatReportLines(report).join('\n');
}

export function formatJsonReport(report: LintReport): string {
  return JSON.stringify(report, null, 2);
}