# Coverage Dashboard - Visual Map

**Purpose:** Test coverage automation dashboard for Experian/mittens codebase
**Tech:** React 18 + Tailwind CSS + Framer Motion (single HTML file)
**Theme:** Glassmorphism with dark/light mode toggle

---

## Current Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│ HEADER                                                                   │
│ ┌─────────────────────────────────┐  ┌────────────────────────────────┐ │
│ │ [Experian Logo]                 │  │ [Sync] [◐] [View Repo]         │ │
│ │ Test Coverage Dashboard         │  │  btn    dark   btn             │ │
│ │ Automated test coverage...      │  │         toggle                 │ │
│ └─────────────────────────────────┘  └────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ STATUS BADGES                                                            │
│ ┌──────────────┐ ┌──────────────┐                                       │
│ │ ● Connected  │ │ ● Devin API  │                                       │
│ └──────────────┘ └──────────────┘                                       │
├─────────────────────────────────────────────────────────────────────────┤
│ STATS ROW (3 cards)                                                      │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                      │
│ │     19       │ │      4       │ │      2       │                      │
│ │ Total        │ │ Currently    │ │ Total        │                      │
│ │ Features     │ │ Enabled      │ │ Removed      │                      │
│ └──────────────┘ └──────────────┘ └──────────────┘                      │
├─────────────────────────────────────────────────────────────────────────┤
│ TAB NAVIGATION                                                           │
│ ┌────────────┐ ┌────────────┐ ┌────────────┐                            │
│ │ Game Modes │ │ Feature    │ │ Removed    │                            │
│ │ (15)       │ │ Flags (4)  │ │ (2)        │                            │
│ └────────────┘ └────────────┘ └────────────┘                            │
├─────────────────────────────────────────────────────────────────────────┤
│ CONTENT AREA (varies by tab)                                             │
│                                                                          │
│ GAME MODES TAB:                                                          │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ Feature Card                                                         │ │
│ │ ┌─────────────────────────────────────────────────────────────────┐ │ │
│ │ │ [Toggle] Feature Name                              [Remove btn] │ │ │
│ │ │          Description text...                                    │ │ │
│ │ │          📄 file.js (lines X-Y)                                 │ │ │
│ │ └─────────────────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│ FEATURE FLAGS TAB:                                                       │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ Physics Constant Card                                                │ │
│ │ ┌─────────────────────────────────────────────────────────────────┐ │ │
│ │ │ Constant Name = value                              [Replace btn]│ │ │
│ │ │ Description...                                                  │ │ │
│ │ │ 📄 Affects N files                                              │ │ │
│ │ └─────────────────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│ REMOVED TAB:                                                             │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ Removed Feature Card                                                 │ │
│ │ ┌─────────────────────────────────────────────────────────────────┐ │ │
│ │ │ Feature Name (removed)                   [Restore] [Check Merge]│ │ │
│ │ │ PR #XX pending...                                               │ │ │
│ │ └─────────────────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Current Buttons & Their Functions

| Button | Location | Current Function | Notes |
|--------|----------|------------------|-------|
| **Sync** | Header | Fetches GitHub PRs, updates dashboard state | Shows spinner while syncing |
| **◐ (Theme)** | Header | Toggles dark/light mode | Sun/moon icon |
| **View Repo** | Header | Opens GitHub repo in new tab | Was "Launch Game" |
| **Toggle** | Feature cards | Enables/disables game mode | On/off switch |
| **Remove** | Feature cards | Opens modal → starts Devin session to remove feature | Triggers automation |
| **Replace** | Physics cards | Opens modal → starts Devin session to replace constant | With new value |
| **Restore** | Removed cards | Opens modal → starts Devin session to restore feature | From backup |
| **Check Merge** | Removed cards | Polls GitHub to verify PR was merged | Updates status |

---

## Current Design Choices

### Color Scheme
- **Dark mode:** Deep navy/purple gradients (#0f0f23 → #1a1a2e → #16213e)
- **Light mode:** Clean whites/grays (#ffffff → #f8f9fa → #f1f3f5)
- **Accent:** Blue-purple gradient for primary buttons
- **Status:** Green (success), Amber (pending), Red (removed), Blue (active)

### Card Style (Glassmorphism)
```css
- Semi-transparent background
- Backdrop blur (20px)
- Subtle border (white 10% opacity)
- Box shadow for depth
- Hover: slight lift + border highlight
```

### Typography
- Font: Inter (system fallback)
- Large numbers: 4xl, semibold, tabular-nums
- Labels: xs, uppercase, tracking-wider
- Body: sm, tertiary color

---

## What Needs to Change for Coverage Dashboard

### Current State (Feature Flags)
- Shows game modes and physics constants
- Actions: Remove, Replace, Restore
- Data: Mario game features

### Target State (Test Coverage)
- Show files/packages with coverage %
- Actions: Improve Coverage, Run Tests
- Data: vendor/experian/* Go files

### Suggested New Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│ HEADER (keep Experian branding)                                          │
├─────────────────────────────────────────────────────────────────────────┤
│ STATS ROW                                                                │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │
│ │    33.4%     │ │      13      │ │      5       │ │      8       │    │
│ │ Total        │ │ Files with   │ │ Files        │ │ Files at     │    │
│ │ Coverage     │ │ Tests        │ │ Needing Work │ │ 100%         │    │
│ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘    │
├─────────────────────────────────────────────────────────────────────────┤
│ TAB NAVIGATION                                                           │
│ ┌────────────┐ ┌────────────┐ ┌────────────┐                            │
│ │ All Files  │ │ Needs Work │ │ In Progress│                            │
│ └────────────┘ └────────────┘ └────────────┘                            │
├─────────────────────────────────────────────────────────────────────────┤
│ FILE CARDS                                                               │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ internal/pkg/http/client.go                                          │ │
│ │ ████████████████░░░░ 72%                        [Improve Coverage]   │ │
│ │ Package: http | 2 functions need tests                               │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ internal/pkg/grpc/client.go                                          │ │
│ │ ███░░░░░░░░░░░░░░░░░ 15%                        [Improve Coverage]   │ │
│ │ Package: grpc | 5 functions need tests                               │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### New Buttons Needed

| Button | Function |
|--------|----------|
| **Improve Coverage** | Start Devin session to write tests for file |
| **Run Coverage** | Re-run `go test -cover` and refresh data |
| **View Tests** | Open test file in GitHub |
| **Batch Improve** | Improve multiple files at once |

---

## Questions for Visual Design Decisions

1. **Progress bars vs percentages?** Show coverage as visual bar or just number?
2. **Grouping:** By package, by coverage level, or flat list?
3. **Priority indicators:** Show difficulty (easy/medium/hard) badges?
4. **History:** Show coverage trend over time?
5. **Active sessions:** How to show Devin is working on a file?
