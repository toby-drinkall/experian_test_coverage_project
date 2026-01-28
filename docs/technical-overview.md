# Technical Overview

## Devin Session Setup

**API Endpoint**: `https://api.devin.ai/v1/sessions`

**Authentication**: Bearer token via `DEVIN_API_KEY` environment variable

**Flow**:
1. Frontend calls `/api/devin/sessions` (local proxy)
2. `dev-server.js` injects API key from `.env`
3. Proxies request to Devin API
4. Returns session ID and URL

**Code**: `Source/coverage-api-config.js` → `CoverageAPI.createSession()`

```javascript
POST /api/devin/sessions
Body: { "prompt": "..." }
Response: { "session_id": "...", "url": "..." }
```

---

## Test Coverage Expansion

**Target**: Go codebase in `vendor/experian/`

**Before PR** (what Devin runs):
```bash
cd vendor/experian
go test -coverprofile=coverage.out ./cmd/flags/...
go tool cover -func=coverage.out
```

**What Devin does**:
1. Clones repo, checks out branch
2. Runs baseline coverage
3. Reads existing `*_test.go` files to understand patterns
4. Identifies functions with 0% coverage
5. Writes new tests matching existing style (table-driven if used)
6. Runs `go test` to verify all pass
7. Commits and creates PR

**Test style**: Table-driven tests, reuses existing helpers/mocks

---

## Automation Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER: Clicks "Improve Coverage" on package              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. DASHBOARD: Creates Devin session with prompt             │
│    - Package path, current coverage %                        │
│    - Instructions to analyze tests, write new ones          │
│    - Commands to run coverage                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. DEVIN: Executes in isolated environment                  │
│    - Clones repo                                             │
│    - Runs go test -cover (baseline)                          │
│    - Analyzes existing test patterns                         │
│    - Writes new tests                                        │
│    - Runs go test (verify pass)                              │
│    - Creates PR on GitHub                                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. DASHBOARD: Polls session status                          │
│    - Shows progress steps                                    │
│    - Receives structured output (PR number, final %)        │
│    - Adds run to history with "Pending Merge" status        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. USER: Merges PR in GitHub                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. DASHBOARD: Detects merge via GitHub API                  │
│    - Updates run status to "Merged"                          │
│    - Updates package coverage in UI                          │
│    - Graph reflects new totals                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Files

| File | Purpose |
|------|---------|
| `Source/coverage-dashboard.html` | React UI, run history, GitHub sync |
| `Source/coverage-api-config.js` | Devin API client, prompts |
| `dev-server.js` | Express server, API proxy |
| `.env` | `DEVIN_API_KEY` |

---

## Prompt Structure

Sent to Devin for coverage improvement:

```
TASK: Improve test coverage for "cmd/flags"
REPO: https://github.com/.../experian_test_coverage_project
BRANCH: cognition-dashboard-devin-integration
PATH: vendor/experian/

CURRENT: 13.8% statements, 5.1% functions | TARGET: 80%+

COMMANDS:
  go test -coverprofile=coverage.out ./cmd/flags/...
  go tool cover -func=coverage.out

REQUIREMENTS:
  - Match existing test style
  - Use table-driven tests if present
  - All tests must pass
  - Create PR with results

STRUCTURED OUTPUT:
  { baseline_statements, final_statements, pr_number, ... }
```

---

## GitHub Sync

**Trigger**: Manual "Sync" button or "Check Merged" on a run

**API Call**:
```
GET https://api.github.com/repos/{owner}/{repo}/pulls/{pr_number}
```

**Logic**:
- If `merged_at` is not null → PR is merged
- Update run status to "Merged"
- Update package coverage with `final_statements` / `final_functions`
