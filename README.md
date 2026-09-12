# agent-memory-tools

Validate memory files against the [memory architecture](https://github.com/jacobEAdamson/agent-memory-tools). Enforces rules for file size, naming conventions, index completeness, lore entry limits, history consolidation, and more.

## CLI

```bash
npx agent-memory-tools lint
npx agent-memory-tools lint --path .agents/memories
npx agent-memory-tools lint --json   # CI-friendly JSON output
```

## Rules

| Rule | What it checks | Severity |
|---|---|---|
| Token Estimates | `.md` files >10k tokens (warn), >15k tokens (error) | error/warn |
| Lore Entry Counts | `.lore.md` files with >50 particles | warn |
| History Consolidation | `history/` dirs with >5 entries | warn |
| Index Completeness | Every file listed in parent `index.md` | warn |
| Subdir Index Existence | Every subdirectory has `index.md` | error |
| Root Subdir Listing | Root `index.md` references all subdirs | warn |
| Naming Violations | Files with `*evolution*`/`*history*`/`*fix*` names use `.lore.md` | error |
| Config Check | `~/.config/opencode/AGENTS.md` exists with hard-load directives | error/warn |

## Quality

- **Build:** Vite SSR → single CJS bundle (`dist/index.cjs`)
- **Test:** Vitest — 50+ tests, 96%+ coverage
- **Lint:** ESLint + typescript-eslint (strict type-checked)
- **CI:** lint + build + test matrix (18/20/22) + Codecov

## Development

```bash
npm run build
npm test
npm run lint
```

## MCP Server (Future)

The package includes `@modelcontextprotocol/sdk` and can be extended with MCP tools:

- `validate_memories` — run all checks
- `consolidate_history` — archive old history entries
- `memory_stats` — file sizes, counts, tokens

## Project Structure

```
src/
  index.ts                  # Commander CLI entry
  commands/lint.ts          # lint command
  lib/
    files.ts                # File system helpers
    token-estimate.ts       # char/4 token estimator
    rules.ts                # Validation rules
    config-check.ts         # AGENTS.md inspection
    formatter.ts            # PrettyPrint + output formatting
    __tests__/              # Vitest tests
bin/lint-memories           # Shell shim
.github/workflows/ci.yml    # CI pipeline
```

MIT License