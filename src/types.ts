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

export interface FrontmatterIssue {
  file: string;
  missingField?: 'kind' | 'updated_at' | 'both';
  error?: string;
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
  frontmatterIssues: FrontmatterIssue[];
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