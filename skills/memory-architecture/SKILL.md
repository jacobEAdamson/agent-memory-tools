---
name: memory-architecture
description: Memory file structure rules — lean vs lore, indexing, naming, lifecycle, agent load chain
metadata:
  internal: true
---

# Memory Architecture

This file defines the strict rules for how memories are structured across all projects. All files under `.agents/memories/` must comply.

## Hard Rules

### No built-in memory tools
Built-in memory features of any agent are FORBIDDEN:
- GitHub Copilot memory (VS Code `/composer` memory, learned patterns)
- Claude Code project knowledge / memory injection
- OpenCode built-in memory/context persistence
- Any agent-native "remember this" or "knowledge" feature

All memory must live in explicit files under `<project>/.agents/memories/`. The AI manages these files directly. This ensures portability, transparency, and cross-agent sharing.

### All memories are files. Period.
No vector stores, no embeddings, no tool-managed context. `.md` and `.lore.md` files only. Every agent reads them at task start from the hard load chain.

---

## Directory Layout

```
<project-root>/.agents/memories/
    index.md                             # Map of all memory files for this project
    <topic>.md                           # Lean memory — standalone, complete, short
    <topic>.lore.md                      # Lore memory — timestamped evolution particles
    history/                             # Session-level chronological entries
      YYYY-MM-DD-HHmm-short-desc.md     # One per explore or medium+ change
```

---

## Lean Memories (`<topic>.md`)

**Purpose:** Current factual state of a topic. Self-contained snapshot — no dependencies, no cross-references to lore.

**Strict rules:**

1. **Standalone.** A lean file must be fully understandable without reading any other file. Include domain context in 1-2 sentences at the top.
2. **Complete.** Capture everything currently known about the topic. Missing info is as harmful as wrong info.
3. **Short.** If estimated token count exceeds ~10k tokens, split into subtopics (e.g., `backend-stack.md`, `backend-services.md`, `backend-testing.md`). Estimate: ~4 chars per token for technical content.
4. **No history.** Only now. No "previously we had X" — that's lore's job.
5. **Atomic updates.** When something changes, the old fact is replaced, not appended. Lean files are never append-only.
6. **Structured.** Bullets, tables, key-value pairs. No prose paragraphs. No filler lines.

**Template:**
```
# <Topic>

## Summary
1-2 sentences of domain context so this file is standalone.

## Key Facts
- Fact 1 with critical detail
- Fact 2 with critical detail
- ...

## Architecture / Structure (if applicable)
- Component: detail
- File: purpose
- Pattern: description

## Conventions (if applicable)
- Convention A: detail
- Convention B: detail
```

---

## Lore Memories (`<topic>.lore.md`)

**Purpose:** Reverse-chronological timeline of how a topic evolved. Every entry is a timestamped "particle" — a discrete event, decision, or discovery.

**Strict rules:**

1. **Every particle has a full timestamp:** `YYYY-MM-DD HH:mm` — not just a date. Time precision needed for ordering when multiple changes happen in one day.
2. **Particles are discrete.** One decision or change per particle. Don't batch unrelated events.
3. **Reverse-chronological.** Newest particle at the top.
4. **Preserve dead ends.** Document approaches tried and abandoned so the AI doesn't re-explore them.
5. **Links to history entries.** Reference the exact history file that records the session where the change happened.

**Particle template:**
```
YYYY-MM-DD HH:mm
  Event: <what happened — one discrete change>
  Context: <why this happened — what problem or requirement triggered it>
  Decision: <what was chosen and rationale>
  Alternatives considered: <what was rejected and why>
  Links: history/YYYY-MM-DD-HHmm-*.md
```

**When to create lore:**
- First lore particle: when a topic has its first non-trivial change (not initial creation)
- Additional particles: every subsequent change, decision, or dead end
- Even small changes: a one-line config tweak with a non-obvious reason deserves a particle

---

## History Entries (`history/<date>-<desc>.md`)

**Purpose:** Per-session record. The raw material that gets consolidated into lean + lore.

**Template:**
```
Date: YYYY-MM-DD HH:mm
Session type: explore | fix | feature | refactor | research
Trigger: <what prompted this session>
Actions: <what was done — brief list>
Outcome: <what changed or was discovered>
Rationale: <why this path was chosen>
```

**Lifecycle:**
1. Written after every explore or medium+ change
2. When >5 history entries accumulate for a topic, consolidate oldest into lean + lore updates
3. Delete consolidated history entries
4. If consolidation produces a "dream" sequence: poetic, narrative, no technical detail — one thread weaving all items into cohesive whole

---

## Memory Maintenance Rules

### Daily maintenance
- On every task start: read `index.md`, scan relevant lean files, scan lore files for recent particles
- On every task end: check if anything learned should update a lean file or add a lore particle

### After compress
After any context compression action (DCP auto-compress, manual compress tool, or any pruning of conversation history):
- IMMEDIATELY reload the project memory index (`.agents/memories/index.md`)
- Re-read any memory files that were relevant before the compress
- This ensures memory context is preserved when conversation history is collapsed — memory files survive compression, conversation does not

### Splitting
- When a lean file is estimated at >10k tokens: split into subtopics
- Create new `.md` files for each subtopic, update `index.md`, point old file to new ones

### Merging
- When multiple lean files overlap: merge into one, deduplicate, keep latest facts only
- Update `index.md` to remove merged entries

### Lore pruning
- When a lore file exceeds ~50 particles: review oldest half
- Delete particles for trivial/obvious decisions. Keep:
  - Architectural pivots
  - Non-obvious design decisions with rationale
  - Dead ends and why they were abandoned
  - Configuration changes with nuanced reasoning

### Subdirectories
- Related topics go in subdirectories with their own `index.md` (e.g., `backend/`, `mud/`)
- Root `index.md` must list all root files + all subdirectory names (as `` `subdir/` ``)
- Each subdirectory `index.md` must list all files within that subdirectory
- `history/` directory is the only exception — no `index.md` required
- Subdirectories are scanned recursively by the lint tool — root `index.md` is the entry point

### Consolidation
- When >5 history entries exist for a topic: consolidate oldest into lean + lore
- Lean gets the resulting current-state facts
- Lore gets the resulting evolution timeline

---

## Index File (`index.md`)

Every project has a root `index.md` that maps all memory files. Subdirectories have their own `index.md`:

### Root index.md format
```
## Root

| File | Contents |
|---|---|
| `index.md` | This file |
| `project-overview.md` | Overview |
| `history/` | Session entries |

## Subdirectories

| Directory | Topics |
|---|---|
| `backend/` | Python/FastAPI, DI, services |
| `mud/` | MUD relay, dashboard, fixes |
```

### Subdirectory index.md format
```
| File | Contents |
|---|---|
| `backend.md` | Python/FastAPI stack |
| `backend.lore.md` | Backend evolution |
```

The index must be updated whenever files are added, split, merged, or removed.

---

## Agent Load Chain

```
1. ~/.config/opencode/AGENTS.md              # User-space hub — hard load first
2.   -> memory-architecture skill           # THIS SKILL — memory format rules
3.   -> other active skills                 # (caveman, etc.)
4.   -> <project>/AGENTS.md                 # Project-specific instructions
5.   -> <project>/.agents/memories/index.md # Project memory index
6.     -> <project>/.agents/memories/<topic>.md     # Relevant lean memories
7.     -> <project>/.agents/memories/<topic>.lore.md# Relevant lore memories
```

**Important:** Load order 6 and 7 are selective — read only files relevant to the task, not everything.

---

## Enforcement

Run `bin/lint-memories` to validate compliance. See memory-linter skill.