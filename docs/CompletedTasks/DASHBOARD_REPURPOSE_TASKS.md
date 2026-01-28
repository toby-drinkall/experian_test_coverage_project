# Dashboard Repurpose Tasks

**Goal:** Transform Mario feature-flag dashboard into Coverage Automation Dashboard

---

## Step 1 — Create new coverage dashboard page ✅

| Task | Status | Notes |
|------|--------|-------|
| Copy dashboard.html → coverage-dashboard.html | ✅ Done | Earlier in session |
| Change title to "Test Coverage Dashboard" | ✅ Done | Earlier in session |
| Change subtitle to "Automated coverage improvements powered by Devin" | ✅ Done | Slightly different wording |
| Replace "View Repo" button to point to target repo | ✅ Done | Links to experian_test_coverage_project |
| Add "Target Repo" status badge (clickable) | ✅ Done | Purple badge with GitHub icon |
| Verify: no console errors, dark mode looks good | ✅ Done | Server running, badges visible |

**Files Modified:**
- `Source/coverage-dashboard.html`

---

## Step 2 — Data model for coverage ✅

| Task | Status | Notes |
|------|--------|-------|
| Create coverageData array | ✅ Done | 12 items with coverage % |
| Add status field (complete/good/needs-work/none/no-tests) | ✅ Done | |
| Add functions array per package | ✅ Done | Function-level coverage |
| Add getCoverageStats() helper | ✅ Done | Calculates totals |
| Handle N/A case (no test file) | ✅ Done | status: 'no-tests', coverage: null |
| Handle 0% case | ✅ Done | status: 'none' |
| Keep modsData/featureFlagsData as empty for compatibility | ✅ Done | Will remove later |

**Data Structure:**
```javascript
{
  id: 'http',
  name: 'internal/pkg/http',
  package: 'http',
  coverage: 81.9,           // null for N/A
  status: 'good',           // complete|good|needs-work|none|no-tests
  testFile: 'path_test.go', // null if none
  functions: [{ name, coverage }]
}
```

---

## Step 3 — Coverage Trend Chart ✅

| Task | Status | Notes |
|------|--------|-------|
| Create CoverageTrendChart component | ✅ Done | SVG-based, no external libs |
| Full width glass card | ✅ Done | Matches glassmorphism style |
| Title: "Overall Coverage Trend" | ✅ Done | Left aligned |
| Current/Target display | ✅ Done | Right side: 33.4% / 80% |
| 14-day trend line | ✅ Done | Blue line with glow effect |
| Dotted 80% target line | ✅ Done | Green dotted line |
| Y-axis 0-100% ticks | ✅ Done | 0, 25, 50, 75, 100 |
| X-axis date labels | ✅ Done | Every 3rd day shown |
| Gradient fill under line | ✅ Done | Blue gradient fade |
| Dark mode compatible | ✅ Done | Uses currentColor |

**Chart Features:**
- SVG viewBox for responsive scaling
- Glow filter on trend line
- Area gradient fill
- Current value highlight dot
- Placeholder data (Jan 15-28)

---

## Step 4 — Replace tabs with CoverageList ✅

| Task | Status | Notes |
|------|--------|-------|
| Replace old tabs with CoverageList | ✅ Done | Single list with sort dropdown |
| Update stats row | ✅ Done | Shows coverage metrics |
| Remove orphaned tab code | ✅ Done | Cleaned up 400+ lines |

---

## Step 5 — Improve Coverage Modal ✅

| Task | Status | Notes |
|------|--------|-------|
| Add improveCoverageSteps array | ✅ Done | 9 steps for coverage workflow |
| Create improve-coverage pre-start modal | ✅ Done | Target area, coverage slider, scope radio |
| Add structured output display | ✅ Done | Shows tests_passed, tests_failed, coverage |
| Wire up CoverageAPI.improveTestCoverage | ✅ Done | Calls real API |
| Update progress title for coverage | ✅ Done | "Improving coverage for..." |

**Modal Features:**
- Target area (read-only, prefilled)
- Target coverage slider (50-100%, default 80%)
- Scope radio: "Tests only" / "Tests + minimal refactor"
- Live structured output during automation

---

## Step 6 — Coverage Details Modal ✅

| Task | Status | Notes |
|------|--------|-------|
| Create CoverageDetailsModal component | ✅ Done | Glass modal with coverage info |
| Clicking row name opens modal | ✅ Done | Shows name, coverage %, metadata |
| Add notes placeholder | ✅ Done | "No notes yet" |
| Add metadata line | ✅ Done | Functions uncovered, test file, last run |

---

## Verification Checklist

- [x] Server runs without errors
- [x] coverage-dashboard.html loads
- [x] Experian logo displays
- [x] Three status badges visible
- [x] Dark mode works
- [x] Original dashboard.html still works
- [x] Coverage data displays
- [x] Improve Coverage button opens modal
- [x] Details modal opens on row name click
- [ ] Improve Coverage triggers Devin (needs live test)
- [ ] PR created successfully (needs live test)
