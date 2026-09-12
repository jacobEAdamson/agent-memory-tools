import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { ConfigCheckResult } from '@/types.js';
import { readFileContent } from '@/lib/files.js';

export function checkConfig(configPath?: string): ConfigCheckResult {
  const resolvedPath = configPath ?? path.join(os.homedir(), '.config', 'opencode', 'AGENTS.md');

  if (!fs.existsSync(resolvedPath)) {
    return { exists: false, hasHardLoad: false };
  }

  const content = readFileContent(resolvedPath);
  const hasHardLoad = content.includes('memories-architecture.md') || content.includes('AGENTS.md');

  return { exists: true, hasHardLoad };
}