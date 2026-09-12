# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-09-12

### Added

- Initial release: `agent-memory-tools lint` CLI
- 6 lint rules: token estimates, lore entry counts, history consolidation, index completeness, naming violations, config check
- `PrettyPrint` output abstraction with sink-based streaming (lines, stdout, or custom)
- `formatReportString` and `formatJsonReport` output modes
- `bin/lint-memories` shell shim
- CI pipeline: lint + build + test matrix (18/20/22) + Codecov
- 50+ tests at 96.62% coverage