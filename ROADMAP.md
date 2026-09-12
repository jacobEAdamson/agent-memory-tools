# Agent Memory Tools — Roadmap

## Current Status

**Version:** 0.1.0 (Created September 2026)

- CLI tool for validating memory file architecture
- 6 lint rules enforcing file size, naming, index completeness, lore limits, history caps, and config health
- PrettyPrint output abstraction for sink-agnostic formatting
- 50+ tests at 96.62% coverage

---

## Development Timeline

```
v0.1.0 ──────> v0.2.0 ──────> v0.3.0 ──────> v1.0.0
(Current)      MCP Server    Auto-Fix       Stable
               Integration   & UI           Release
```

---

## v0.1.0 — Initial CLI (Released)

**Released:** September 2026

- Commander-based CLI with `lint` command
- 6 validation rules: token estimates, lore entry counts, history consolidation, index completeness, naming violations, config check
- PrettyPrint class with sink abstraction (lines/stdout/custom)
- JSON output mode for CI
- Full CI pipeline: lint + build + test matrix + Codecov
- 50+ tests, 96.62% statement coverage

---

## v0.2.0 — MCP Server Integration

**Scope:** Expose validation tools as MCP server for IDE/agent use. Depends on `@modelcontextprotocol/sdk` already in dependencies.

### MCP Tools
- `validate_memories` — same logic as `lint` command, returns structured result
- `consolidate_history` — detect and move old history entries to archive
- `memory_stats` — file sizes, token counts, file type breakdown per directory

### CLI Parity
- `agent-memory-tools mcp` — start MCP server (stdio transport)
- `agent-memory-tools mcp --transport http` — HTTP transport option
- Auto-detect: if `@modelcontextprotocol/sdk` present, enable MCP subcommand

---

## v0.3.0 — Auto-Fix & Validation Guard

**Scope:** `lint --fix` automatically corrects common violations; git hook integration prevents bad merges.

### Auto-Fix
- `--fix` flag: rename misnamed files (`.md` ↔ `.lore.md`), add missing index entries, prune history dirs
- `--fix --dry-run` preview changes without applying

### Validation Guard
- `install-hook` command: register `lint-memories` as git pre-commit hook
- `verify` command: light check (index completeness + naming only) for fast CI gate

---

## v1.0.0 — Stable Release

**Scope:** Production-ready with comprehensive docs, schema validation, and multi-project support.

### Production Readiness
- Test coverage >95% across all paths (including error branches)
- Schema validation for `index.md` format (YAML frontmatter vs markdown table)
- `lint --strict` mode: all warnings become errors
- Performance benchmark: lint 1000-file memories dir under 500ms

### Multi-Project Support
- `lint --config` support: custom thresholds per project (token limit, lore entry max, history max)
- `lint --project-root` flag for monorepo scenarios

### Documentation
- CLI man page / `--help` output overhaul
- Example configs for common project types
- Migration guide: converting existing memory dirs to compliant structure

---

## Beyond v1.0.0 — Future Considerations

- GitHub App / PR bot: auto-comment lint results on memory-dir changes
- VS Code extension: in-editor lint annotations
- Memory diff tool: compare two memory dirs for compliance drift
- Language-agnostic schema: YAML config for rules shared across tools (opencode, Claude, Copilot)
- Visualizer: `memory-tools visualize` — D3 tree of memory files with compliance status

---

## Contributing

Open issues or PRs on [GitHub](https://github.com/jacobEAdamson/agent-memory-tools). Feature requests with use cases welcome.

---

*This roadmap is a living document. Last updated: September 2026.*