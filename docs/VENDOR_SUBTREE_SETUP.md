# Vendor Subtree Setup Guide

## Why This Repo? (mario-feature-flags-demo vs -cog)

There are **two** mario feature flag repos on GitHub:

| Repo | Visibility | Created | Use This? |
|------|------------|---------|-----------|
| `mario-feature-flags-demo-cog` | public | Dec 22, 2025 | **YES** |
| `mario-feature-flags-demo` | private | Dec 15, 2025 | No (legacy) |

**Always use `mario-feature-flags-demo-cog`** (this repo) because:
- It's the **newer, public** version
- The `-cog` suffix = **Cognition/Devin API integration**
- Contains the full feature flag management dashboard
- Has React + Tailwind CSS + Framer Motion UI
- Automates code changes through Devin sessions

The older `mario-feature-flags-demo` (without `-cog`) is a legacy private repo.

---

## Repository Structure

### PERSONAL Repository (mario-feature-flags-demo-cog)
- **Default Branch:** `cognition-dashboard-devin-integration` (this is the ONLY branch - there is no `main` or `master`)
- **Origin:** `https://github.com/toby-drinkall/mario-feature-flags-demo-cog.git`
- **Working Directory:** `~/dev/mario-feature-flags-demo-cog`

### EXPERIAN Repository (mittens)
- **Default Branch:** `main`
- **Source:** `https://github.com/ExpediaGroup/mittens.git`
- **Location in PERSONAL:** `vendor/experian/`

---

## What We Set Up (2026-01-28)

### 1. Cloned Both Repositories
```bash
cd ~/dev
git clone https://github.com/toby-drinkall/mario-feature-flags-demo-cog.git
git clone https://github.com/ExpediaGroup/mittens.git
```

### 2. Created Safety Tag
```bash
cd ~/dev/mario-feature-flags-demo-cog
git tag pre-experian-import-20260128
```
This tag marks the state BEFORE the experian import - use it to rollback if needed.

### 3. Added Experian as Remote
```bash
git remote add experian ../mittens
git fetch experian
```

### 4. Added Subtree
```bash
git subtree add --prefix=vendor/experian experian main --squash
```
This imports the entire mittens repo into `vendor/experian/` as a squashed commit.

---

## Day-to-Day Workflow

### Working Directory
Always work from: `~/dev/mario-feature-flags-demo-cog`

### Experian Code Location
All experian/mittens code lives at: `vendor/experian/`

### Branch to Work On
Use: `cognition-dashboard-devin-integration` (this is the default and only branch)

---

## Updating Experian Code (Future)

When you need to pull updates from the mittens repo:

```bash
cd ~/dev/mario-feature-flags-demo-cog
git subtree pull --prefix=vendor/experian experian main --squash
```

This will:
1. Fetch latest changes from mittens/main
2. Squash them into a single commit
3. Merge into your current branch

---

## Avoiding Branch/Merge Issues

### Key Points

1. **No `main` branch exists in PERSONAL** - Don't try to switch to `main`, it doesn't exist. The default branch is `cognition-dashboard-devin-integration`.

2. **Always verify your branch before making changes:**
   ```bash
   git branch -v
   ```

3. **Before subtree operations, ensure clean working tree:**
   ```bash
   git status
   ```

4. **Create safety tags before major operations:**
   ```bash
   git tag backup-$(date +%Y%m%d-%H%M)
   ```

### Rollback Procedure

If something goes wrong with the subtree:
```bash
# Reset to pre-import state
git reset --hard pre-experian-import-20260128

# Or reset to any backup tag
git reset --hard backup-YYYYMMDD-HHMM
```

---

## Remote Configuration

| Remote   | URL                           | Purpose              |
|----------|-------------------------------|----------------------|
| origin   | github.com/toby-drinkall/mario-feature-flags-demo-cog | Main repo (push/pull) |
| experian | ../mittens (local)            | Subtree source       |

To verify:
```bash
git remote -v
```

---

## Quick Reference

| Item | Value |
|------|-------|
| Working Dir | `~/dev/mario-feature-flags-demo-cog` |
| Default Branch | `cognition-dashboard-devin-integration` |
| Experian Code | `vendor/experian/` |
| Safety Tag | `pre-experian-import-20260128` |
| Update Command | `git subtree pull --prefix=vendor/experian experian main --squash` |

---

## What This Repo Does

**mario-feature-flags-demo-cog** is a full-stack feature flag management system for Super Mario Brothers:

### Core Features
- **FullScreenMario Game** - HTML5 remake of classic Super Mario Bros
- **Feature Flag Dashboard** - React-based UI to manage game modes and physics
- **Devin API Integration** - Automates code changes through AI sessions
- **15 Game Modes** - Toggleable features (Bouncy Bounce, Dark Mode, Hard Mode, etc.)
- **4 Physics Constants** - Modifiable parameters (jumpmod, gravity, etc.)

### Dashboard Capabilities
- Remove/restore/replace feature flags via UI
- Automated PR creation and testing
- Real-time progress tracking
- GitHub integration for merge verification
- Automatic backup system before changes

### Key Directories
```
Source/                  # Main source (dashboard, game, settings)
docs/                    # Technical documentation
backups/                 # Feature flag backups
vendor/experian/         # Imported mittens repo (subtree)
```

### Running the Project
```bash
npm install
npm start
# Dashboard: http://localhost:8000/dashboard.html
# Game: http://localhost:8000/index.html
```
