# agent-memory-tools

Validate memory files against a strict architecture — lean vs lore, indexing, naming, lifecycle rules. Two companion [Agent Skills](https://skills.sh) teach agents to write and enforce the format.

## Install Skills

```bash
# Install both skills to OpenCode (or any agent)
npx skills add jacobEAdamson/agent-memory-tools --all

# Install only one
npx skills add jacobEAdamson/agent-memory-tools --skill memory-architecture
npx skills add jacobEAdamson/agent-memory-tools --skill memory-linter
```

Skills auto-discovered from `skills/` directory. Install to `claude-code`, `cursor`, `codex`, or any of the [75+ supported agents](https://www.npmjs.com/package/skills).

| Skill | What it teaches |
|---|---|
| `memory-architecture` | Lean vs lore, file lifecycle, index format, agent load chain, forbidden built-in memories |
| `memory-linter` | How to run `lint-memories`, interpret results, fix common violations |

## Run Linter

```bash
# From project root
bin/lint-memories

# Or via npx
npx agent-memory-tools lint

# Specify memory directory
bin/lint-memories --path .agents/memories

# CI-friendly JSON
bin/lint-memories --json
```

Exit code 0 (passed) or 1 (failed).

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

## Development

```bash
npm run build        # Vite SSR → dist/index.cjs
npm test             # Vitest — 50+ tests, 96%+ coverage
npm run lint         # ESLint + typescript-eslint (strict)
```

CI: lint + build + test matrix (Node 18/20/22) + Codecov.

## MCP Server (Future)

Package includes `@modelcontextprotocol/sdk`. Planned MCP tools:

- `validate_memories` — run all checks
- `consolidate_history` — archive old history entries
- `memory_stats` — file sizes, counts, tokens

## Project Structure

```
skills/
  memory-architecture/SKILL.md        # Architecture rules as an agent skill
  memory-linter/SKILL.md              # Lint usage as an agent skill
src/
  index.ts                             # Commander CLI entry
  commands/lint.ts                     # lint command
  lib/
    files.ts                           # File system helpers
    token-estimate.ts                  # char/4 estimator
    rules.ts                           # Validation rules
    config-check.ts                    # AGENTS.md inspection
    formatter.ts                       # PrettyPrint + output
    __tests__/                         # 50+ Vitest tests
bin/lint-memories                      # Shell shim
.github/workflows/ci.yml              # CI pipeline
```

MIT