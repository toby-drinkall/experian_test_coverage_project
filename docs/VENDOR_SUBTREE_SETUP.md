# Project Repository Setup Guide

## Overview: Three-Repo Architecture

This project uses code from two source repositories, combined into a new project repo:

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

---

## The Three Repositories

### 1. ORIGIN: `experian_test_coverage_project` (YOUR NEW PROJECT)
- **GitHub:** https://github.com/toby-drinkall/experian_test_coverage_project
- **Purpose:** This is YOUR project - all commits go here
- **Remote name:** `origin`
- **Push/pull:** YES

### 2. UPSTREAM: `mario-feature-flags-demo-cog` (SOURCE - DO NOT MODIFY)
- **GitHub:** https://github.com/toby-drinkall/mario-feature-flags-demo-cog
- **Purpose:** Original source code - kept as read-only reference
- **Remote name:** `upstream`
- **Push/pull:** NO (read-only)

### 3. EXPERIAN: `mittens` (SUBTREE SOURCE)
- **GitHub:** https://github.com/ExpediaGroup/mittens
- **Purpose:** Imported as subtree into `vendor/experian/`
- **Remote name:** `experian`
- **Location:** `~/dev/mittens` (local clone) and `vendor/experian/` (subtree)

---

## Why This Setup?

We wanted to:
1. Start with the `mario-feature-flags-demo-cog` codebase
2. Add the `mittens` repo as a subtree
3. **Keep the original repos unchanged**
4. Push all new work to a fresh repo (`experian_test_coverage_project`)

This way:
- Original `mario-feature-flags-demo-cog` on GitHub stays untouched
- You can still pull updates from upstream if needed
- All your new work goes to `experian_test_coverage_project`

---

## Local Directory Structure

**Working directory:** `~/dev/mario-feature-flags-demo-cog`

(Note: The local folder is still named after the original repo, but it now points to the new project)

```
~/dev/
├── mario-feature-flags-demo-cog/   # YOUR WORKING DIRECTORY
│   ├── Source/                      # Main source code
│   ├── docs/                        # Documentation (you are here)
│   ├── vendor/
│   │   └── experian/                # mittens subtree lives here
│   └── ...
│
└── mittens/                         # Local clone (subtree source)
```

---

## Remote Configuration

| Remote     | GitHub Repo                          | Purpose                    |
|------------|--------------------------------------|----------------------------|
| `origin`   | `experian_test_coverage_project`     | **Push here** (your work)  |
| `upstream` | `mario-feature-flags-demo-cog`       | Read-only source reference |
| `experian` | `../mittens` (local)                 | Subtree source             |

Verify with:
```bash
git remote -v
```

Expected output:
```
experian   ../mittens (fetch)
experian   ../mittens (push)
origin     https://github.com/toby-drinkall/experian_test_coverage_project.git (fetch)
origin     https://github.com/toby-drinkall/experian_test_coverage_project.git (push)
upstream   https://github.com/toby-drinkall/mario-feature-flags-demo-cog.git (fetch)
upstream   https://github.com/toby-drinkall/mario-feature-flags-demo-cog.git (push)
```

---

## Setup History (2026-01-28)

### Step 1: Cloned source repositories
```bash
cd ~/dev
git clone https://github.com/toby-drinkall/mario-feature-flags-demo-cog.git
git clone https://github.com/ExpediaGroup/mittens.git
```

### Step 2: Created safety tag
```bash
cd ~/dev/mario-feature-flags-demo-cog
git tag pre-experian-import-20260128
```

### Step 3: Added mittens as subtree
```bash
git remote add experian ../mittens
git fetch experian
git subtree add --prefix=vendor/experian experian main --squash
```

### Step 4: Created new project repo and reconfigured remotes
```bash
# Created new repo on GitHub
gh repo create toby-drinkall/experian_test_coverage_project --public

# Renamed original origin to upstream (preserves reference)
git remote rename origin upstream

# Added new repo as origin (this is where we push)
git remote add origin https://github.com/toby-drinkall/experian_test_coverage_project.git

# Pushed everything to new repo
git push -u origin cognition-dashboard-devin-integration
```

---

## Day-to-Day Workflow

### Working Directory
Always work from: `~/dev/mario-feature-flags-demo-cog`

### Branch
Use: `cognition-dashboard-devin-integration` (the only branch)

### Committing & Pushing
```bash
git add <files>
git commit -m "Your message"
git push                          # Pushes to experian_test_coverage_project
```

### Accessing Experian/Mittens Code
All mittens code is at: `vendor/experian/`

---

## Updating from Source Repos (Future)

### Pull updates from mittens (subtree)
```bash
git subtree pull --prefix=vendor/experian experian main --squash
```

### Pull updates from original mario repo (if needed)
```bash
git fetch upstream
git merge upstream/cognition-dashboard-devin-integration
```

---

## Safety & Rollback

### Safety Tags
- `pre-experian-import-20260128` - State before mittens import

### Create new safety tag before risky operations
```bash
git tag backup-$(date +%Y%m%d-%H%M)
```

### Rollback if needed
```bash
git reset --hard pre-experian-import-20260128
```

---

## Quick Reference

| Item | Value |
|------|-------|
| Working Dir | `~/dev/mario-feature-flags-demo-cog` |
| Push To | `origin` → `experian_test_coverage_project` |
| Branch | `cognition-dashboard-devin-integration` |
| Experian Code | `vendor/experian/` |
| Original Source | `upstream` → `mario-feature-flags-demo-cog` (read-only) |

---

## Project Background

This project combines:

### From mario-feature-flags-demo-cog (upstream):
- FullScreenMario HTML5 game
- Feature flag management dashboard (React + Tailwind + Framer Motion)
- Devin API integration for automated code changes
- 15 game modes + 4 physics constants

### From mittens (vendor/experian):
- ExpediaGroup's mittens project
- Imported as git subtree

### Running the Project
```bash
npm install
npm start
# Dashboard: http://localhost:8000/dashboard.html
# Game: http://localhost:8000/index.html
```
