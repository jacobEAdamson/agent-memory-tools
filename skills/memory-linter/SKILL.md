---
name: memory-linter
description: How to run the lint-memories CLI to validate memory files against architecture rules
metadata:
  internal: true
---

# Memory Linter

Validates `./agents/memories/` against the memory architecture rules.

## CLI

```bash
# Run from project root
bin/lint-memories

# Specify memory directory
bin/lint-memories --path .agents/memories

# CI-friendly JSON output
bin/lint-memories --json
```

Exit code: 0 (passed) or 1 (failed).

## Rules Checked

| Rule | What it checks | Severity |
|---|---|---|
| Token Estimates | `.md` files with >10k tokens (~40k chars) | warn |
| Token Errors | `.md` files with >15k tokens | error |
| Lore Entry Count | `.lore.md` files with >50 particles | warn |
| History Consolidation | `history/` dirs with >5 entries | warn |
| Index Completeness | Every file listed in nearest `index.md` | warn |
| Subdir Index Existence | Every subdirectory has `index.md` | error |
| Root Subdir Listing | Root `index.md` references all subdirs | warn |
| Naming Violations | Files with `*evolution*`, `*history*`, `*fix*` names use `.md` instead of `.lore.md` | error |
| Config Check | `~/.config/opencode/AGENTS.md` exists with hard-load directives | error |

## Interpreting Output

```
Memory Lint: FAILED
  Errors: 2
  Warnings: 1

Naming Violations:
  ✖ evolution.md should be .lore.md

Token Estimates:
  ✖ big-file.md: 15,000 tokens (60,000 chars)

History Consolidation Needed:
  ⚠ history: 6 entries (max 5)
```

## Fixing Issues

For naming violations: rename the file to use `.lore.md` extension.

For token overages: split the topic into subtopics (see memory-architecture skill).

For history: consolidate entries >5 into a single archive entry.

For index gaps: add missing file references to `index.md`.

## When to Run

- After creating/modifying any memory file
- After splitting or merging topics
- Before committing memory changes
- At session start if memory structure seems stale