export type Severity = 'ok' | 'warn' | 'error';

export interface LoreEntryCountIssue {
  file: string;
  entryCount: number;
}

export interface TokenEstimateResult {
  file: string;
  charCount: number;
  estimatedTokens: number;
  severity: Severity;
}

export interface HistoryConsolidationIssue {
  dir: string;
  entryCount: number;
}

export interface IndexCompletenessIssue {
  file: string;
  subdir: string;
}

export interface SubdirMissingIndexIssue {
  subdir: string;
}

export interface RootSubdirListingIssue {
  subdir: string;
}

export interface NamingViolation {
  file: string;
  expectedExtension: '.lore.md';
}

export interface ConfigCheckResult {
  exists: boolean;
  hasHardLoad: boolean;
}

export interface LintResults {
  tokenEstimates: TokenEstimateResult[];
  loreEntryCounts: LoreEntryCountIssue[];
  historyConsolidationIssues: HistoryConsolidationIssue[];
  indexCompletenessIssues: IndexCompletenessIssue[];
  subdirMissingIndexIssues: SubdirMissingIndexIssue[];
  rootSubdirListingIssues: RootSubdirListingIssue[];
  namingViolations: NamingViolation[];
  configCheck: ConfigCheckResult;
}

export interface LintReport {
  passed: boolean;
  results: LintResults;
  summary: {
    errors: number;
    warnings: number;
  };
}