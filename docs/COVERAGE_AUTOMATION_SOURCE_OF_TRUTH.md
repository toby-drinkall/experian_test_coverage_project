# Coverage Automation Dashboard - Source of Truth

**Created:** 2026-01-28
**Last Updated:** 2026-01-28
**Status:** Active Development

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Repository Architecture](#repository-architecture)
3. [Test Coverage Analysis](#test-coverage-analysis)
4. [Devin Integration](#devin-integration)
5. [Dashboard Configuration](#dashboard-configuration)
6. [Prompt Engineering](#prompt-engineering)
7. [Decision Log](#decision-log)

---

## Project Overview

### Purpose

Transform the Mario feature-flag dashboard into a "Coverage Automation Dashboard" that:
- Displays current test coverage for the mittens (experian) codebase
- Allows triggering Devin sessions to write tests and improve coverage
- Tracks progress over time
- Creates PRs automatically to the correct repository

### Origin

This project started from `mario-feature-flags-demo-cog`, a feature flag management dashboard with Devin API integration. We're repurposing the infrastructure for test coverage automation.

---

## Repository Architecture

### Three-Repo Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                        LOCAL WORKING DIRECTORY                       │
│                   ~/dev/mario-feature-flags-demo-cog                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌─────────────────┐    ┌─────────────────┐    ┌────────────────┐  │
│   │     UPSTREAM    │    │     ORIGIN      │    │    EXPERIAN    │  │
│   │   (read-only)   │    │  (push here)    │    │   (subtree)    │  │
│   └────────┬────────┘    └────────┬────────┘    └───────┬────────┘  │
│            │                      │                      │           │
│            ▼                      ▼                      ▼           │
│   mario-feature-flags    experian_test_coverage    ../mittens       │
│        -demo-cog              _project              (local)         │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Repository Details

| Remote | GitHub URL | Purpose |
|--------|------------|---------|
| `origin` | `https://github.com/toby-drinkall/experian_test_coverage_project` | **Push here** - All new work |
| `upstream` | `https://github.com/toby-drinkall/mario-feature-flags-demo-cog` | Read-only source (original dashboard) |
| `experian` | `../mittens` (local) | Subtree source for vendor/experian |

### Branch Structure

| Repo | Default Branch | Notes |
|------|----------------|-------|
| experian_test_coverage_project | `cognition-dashboard-devin-integration` | All PRs target this branch |
| mario-feature-flags-demo-cog | `cognition-dashboard-devin-integration` | Original - do not modify |
| mittens | `main` | ExpediaGroup's repo |

### Local Directory Structure

```
~/dev/mario-feature-flags-demo-cog/
├── Source/
│   ├── coverage-dashboard.html      # NEW: Coverage automation UI
│   ├── coverage-api-config.js       # NEW: Devin API for coverage
│   ├── dashboard.html               # Original Mario dashboard (unused)
│   ├── devin-api-config.js          # Original API config (unused)
│   └── ...
├── vendor/
│   └── experian/                    # mittens subtree - TARGET FOR COVERAGE
│       ├── cmd/
│       ├── internal/pkg/
│       ├── go.mod
│       └── ...
├── docs/
│   ├── COVERAGE_AUTOMATION_SOURCE_OF_TRUTH.md  # THIS FILE
│   └── VENDOR_SUBTREE_SETUP.md
├── .env                             # Devin API key (gitignored)
└── dev-server.js                    # Express server with API proxy
```

---

## Test Coverage Analysis

### Current State (2026-01-28)

**Total Coverage: 33.4%**

### Coverage by Package

| Package | Coverage | Priority | Difficulty |
|---------|----------|----------|------------|
| `internal/pkg/safe` | 100% | - | Done |
| `internal/pkg/util` | 100% | - | Done |
| `internal/pkg/placeholders` | 92.7% | Low | Easy |
| `internal/pkg/http` | 81.9% | Low | Easy |
| `internal/pkg/probe` | 71.4% | Medium | Easy |
| `internal/pkg/internal` | 62.5% | Medium | Easy |
| `internal/pkg/grpc` | 15.4% | **High** | Medium |
| `cmd/flags` | 13.8% | **High** | Medium |
| `cmd` | 0% | Medium | Hard |
| `internal/pkg/warmup` | 0% | Low | Hard |
| `internal/pkg/response` | N/A | Medium | Easy |
| `main.go` | 0% | Skip | Hard |

### Why Coverage Varies

**100% Coverage Files (Easy to Test):**
- Pure functions with no external dependencies
- Simple input/output patterns
- No side effects (files, network, databases)
- Small and focused

**0% Coverage Files (Hard to Test):**
- Heavy side effects (network calls, file I/O, goroutines)
- Global state usage
- Concurrency (goroutines, channels, WaitGroups)
- Integration code that orchestrates multiple components

### Priority Tiers for Automation

**Tier 1: Best ROI (Start Here)**
- `internal/pkg/http/client.go` - 72-86%, has test patterns
- `internal/pkg/grpc/utils.go` - 91%, almost done
- `internal/pkg/probe/file.go` - 67-80%, mockable
- `internal/pkg/placeholders/utils.go` - 83-100%, pure functions

**Tier 2: Medium Effort**
- `internal/pkg/grpc/client.go` - 0%, similar to http/client.go
- `cmd/flags/*.go` - 0-14%, config parsing

**Tier 3: Skip for Now**
- `cmd/root.go` - Integration code, needs full system
- `internal/pkg/warmup/warmup.go` - Goroutines, channels, timing
- `main.go` - Entry point, not unit-testable

### Coverage Data Structure

```javascript
{
  files: [
    {
      path: "internal/pkg/http/client.go",
      package: "http",
      currentCoverage: 72.0,
      targetCoverage: 90.0,
      functions: [
        { name: "NewClient", coverage: 85.7, lines: 27 },
        { name: "SendRequest", coverage: 72.0, lines: 25 }
      ],
      difficulty: "easy",
      hasExistingTests: true,
      testFile: "internal/pkg/http/client_test.go"
    }
  ],
  summary: {
    totalCoverage: 33.4,
    filesWithTests: 8,
    filesWithoutTests: 5
  }
}
```

---

## Devin Integration

### API Configuration

```javascript
config: {
    apiUrl: 'http://localhost:8000/api/devin',
    apiKey: '[STORED IN .env FILE]',
    timeout: 300000,
    repo: {
        owner: 'toby-drinkall',
        name: 'experian_test_coverage_project',
        branch: 'cognition-dashboard-devin-integration',
        url: 'https://github.com/toby-drinkall/experian_test_coverage_project'
    }
}
```

### Verified Working (2026-01-28)

- **Test Session ID:** `devin-60402e0085a644149c8780448716a1e8`
- **Test Session URL:** https://app.devin.ai/sessions/60402e0085a644149c8780448716a1e8
- **Result:** Successfully cloned repo, accessed vendor/experian, ran tests

### API Methods

| Method | Purpose |
|--------|---------|
| `CoverageAPI.createSession(config)` | Create new Devin session |
| `CoverageAPI.getSessionStatus(sessionId)` | Get session status |
| `CoverageAPI.cancelSession(sessionId)` | Terminate session |
| `CoverageAPI.pollSessionStatus(sessionId, onProgress)` | Poll until complete |
| `CoverageAPI.improveTestCoverage(fileInfo)` | Improve coverage for single file |
| `CoverageAPI.batchImproveCoverage(files)` | Batch improve multiple files |

### Server Configuration

**dev-server.js** provides:
- `/api/devin/*` - Proxy to api.devin.ai (avoids CORS)
- `/api/devin/_status` - Check if API key is configured
- Static file serving from `Source/`
- Cache-busting headers for JS/HTML

---

## Dashboard Configuration

### Files

| File | Purpose | Status |
|------|---------|--------|
| `Source/coverage-dashboard.html` | Main UI | Created (needs UI changes) |
| `Source/coverage-api-config.js` | API client | Created |
| `Source/dashboard.html` | Original Mario UI | Unused |
| `Source/devin-api-config.js` | Original API | Unused |

### URLs

| Dashboard | URL |
|-----------|-----|
| Coverage Dashboard | http://localhost:8000/coverage-dashboard.html |
| Original (unused) | http://localhost:8000/dashboard.html |

### GitHub References

The coverage-dashboard.html has been updated to reference:
- `experian_test_coverage_project` (8 occurrences)
- NOT `mario-feature-flags-demo-cog`

---

## Prompt Engineering

### Single File Coverage Improvement Prompt

```
REPOSITORY CONTEXT:
- GitHub Repo: https://github.com/toby-drinkall/experian_test_coverage_project
- Clone: git clone https://github.com/toby-drinkall/experian_test_coverage_project.git
- Branch: cognition-dashboard-devin-integration

TASK: Improve test coverage for {filePath}

CURRENT COVERAGE:
- File: {filePath}
- Current Coverage: {currentCoverage}%
- Target Coverage: {targetCoverage}%

FUNCTIONS NEEDING TESTS:
{functionList}

Task Steps:
1. Clone Repository - Clone and checkout branch
2. Analyze File - Identify untested functions
3. Write Tests - Create/update test file
4. Run Tests - Verify pass and check coverage
5. Create Branch - coverage-{sanitized-path}
6. Commit Changes
7. Create Pull Request - Base: cognition-dashboard-devin-integration
8. Finalize

STRUCTURED OUTPUT:
{
  "pr_number": [PR number],
  "file_path": "{filePath}",
  "old_coverage": {currentCoverage},
  "new_coverage": [new coverage],
  "tests_added": [count]
}
```

### Batch Coverage Improvement Prompt

```
REPOSITORY CONTEXT:
- GitHub Repo: https://github.com/toby-drinkall/experian_test_coverage_project
- Branch: cognition-dashboard-devin-integration

TASK: Improve test coverage for multiple files

FILES TO IMPROVE:
{fileList with coverage percentages}

PRIORITY: Focus on files with lowest coverage first.

Steps:
1. Clone and Setup
2-N. For each file: Write tests, verify pass
N+1. Create Single PR with all changes

STRUCTURED OUTPUT:
{
  "pr_number": [PR number],
  "files_improved": {count},
  "coverage_before": [total before],
  "coverage_after": [total after]
}
```

### Key Prompt Requirements

1. **Always specify repo URL explicitly** - Devin needs exact repo
2. **Always specify base branch** - `cognition-dashboard-devin-integration`
3. **Use gh CLI for PR creation** - More reliable than git push
4. **Request structured output** - Enables dashboard to parse results
5. **Step-by-step messaging** - Enables progress tracking

---

## Decision Log

### 2026-01-28: Initial Setup

**Decision 1: Create New Repo Instead of Modifying Original**
- **Why:** Keep original `mario-feature-flags-demo-cog` unchanged as reference
- **Result:** Created `experian_test_coverage_project`
- **Remotes:** origin → new repo, upstream → original

**Decision 2: Use Git Subtree for mittens**
- **Why:** Keep mittens code in vendor/experian/ for easy access
- **Command:** `git subtree add --prefix=vendor/experian experian main --squash`
- **Update:** `git subtree pull --prefix=vendor/experian experian main --squash`

**Decision 3: Create Separate API Config for Coverage**
- **Why:** Coverage prompts are fundamentally different from feature flag prompts
- **Result:** `coverage-api-config.js` with explicit repo config

**Decision 4: Target Tier 1 Files First**
- **Why:** Best ROI - existing test patterns, reasonable difficulty
- **Files:** http/client.go, grpc/utils.go, probe/file.go, placeholders/utils.go

**Decision 5: Skip Hard-to-Test Files**
- **Why:** Integration code needs full system, diminishing returns
- **Skip:** cmd/root.go, warmup/warmup.go, main.go

---

## Running the System

### Start Server
```bash
cd ~/dev/mario-feature-flags-demo-cog
npm install  # First time only
npm start
```

### Access Dashboard
```
http://localhost:8000/coverage-dashboard.html
```

### Run Coverage Report
```bash
cd ~/dev/mario-feature-flags-demo-cog/vendor/experian
go test -cover ./...
go test -coverprofile=coverage.out ./...
go tool cover -func=coverage.out
```

### Manual Devin Session Test
```bash
curl -X POST "https://api.devin.ai/v1/sessions" \
  -H "Authorization: Bearer $DEVIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Your prompt here"}'
```

---

## Next Steps

1. [ ] Transform dashboard UI from feature flags to coverage display
2. [ ] Add coverage data visualization (charts, progress bars)
3. [ ] Implement "Improve Coverage" button for each file
4. [ ] Add progress tracking for active Devin sessions
5. [ ] Store coverage history for trend tracking
6. [ ] Add batch operations for multiple files

---

## Recovery Information

### If Starting Fresh

```bash
# Clone repos
cd ~/dev
git clone https://github.com/toby-drinkall/experian_test_coverage_project.git mario-feature-flags-demo-cog
git clone https://github.com/ExpediaGroup/mittens.git

# Setup remotes
cd mario-feature-flags-demo-cog
git remote add upstream https://github.com/toby-drinkall/mario-feature-flags-demo-cog.git
git remote add experian ../mittens

# Create .env
echo "DEVIN_API_KEY=your_key_here" > .env

# Install and run
npm install
npm start
```

### Key Files to Preserve

- `Source/coverage-dashboard.html` - Main UI
- `Source/coverage-api-config.js` - API configuration
- `docs/COVERAGE_AUTOMATION_SOURCE_OF_TRUTH.md` - This file
- `docs/VENDOR_SUBTREE_SETUP.md` - Repo setup guide
- `.env` - API key (gitignored, recreate manually)
