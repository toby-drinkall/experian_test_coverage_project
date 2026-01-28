# Go Test Coverage Dashboard

A web-based dashboard for visualizing and improving Go test coverage, with automated test generation powered by Devin AI.

## What This System Does

1. **Visualizes Coverage** - Displays statement and function coverage for each Go package
2. **Tracks Progress** - Shows coverage trends over time with an interactive chart
3. **Automates Improvements** - Triggers Devin AI sessions to write tests for low-coverage packages
4. **Detects Merges** - Syncs with GitHub to detect when coverage PRs are merged and updates metrics

## Project Structure

```
experian_test_coverage_project/
├── Source/
│   ├── coverage-dashboard.html   # Main dashboard (React + Tailwind)
│   ├── coverage-api-config.js    # Devin API client and prompts
│   └── index.html                # Redirect to dashboard
├── vendor/experian/              # Go codebase (the code being tested)
│   ├── cmd/                      # CLI commands and flags
│   ├── internal/pkg/             # Internal packages (http, grpc, etc.)
│   └── ...
├── scripts/
│   ├── coverage.sh               # Shell script to run Go coverage locally
│   └── func-coverage.awk         # AWK script to calculate function coverage
├── docs/
│   └── DEVIN_API_SETUP.md        # Troubleshooting guide for API issues
├── dev-server.js                 # Express server with API proxy
├── package.json                  # Node.js dependencies
├── .env.example                  # Environment template
└── .env                          # Your API key (not committed)
```

## How Files Interact

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Browser                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │           coverage-dashboard.html                            │    │
│  │  - React components for UI                                   │    │
│  │  - Coverage data and chart                                   │    │
│  │  - Run history management                                    │    │
│  │  - GitHub sync logic                                         │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              │                                       │
│                              │ loads                                 │
│                              ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │           coverage-api-config.js                             │    │
│  │  - CoverageAPI object                                        │    │
│  │  - Session management (create, poll, cancel)                 │    │
│  │  - Coverage scan prompts                                     │    │
│  │  - Improve coverage prompts                                  │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               │ HTTP requests to /api/devin/*
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       dev-server.js                                  │
│  - Serves static files from Source/                                  │
│  - Proxies /api/devin/* requests to Devin API                       │
│  - Injects API key from .env (secure, not exposed to browser)       │
│  - Provides /git-pull endpoint for auto-sync                        │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               │ HTTPS (with API key)
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Devin API                                      │
│  - Creates AI sessions                                               │
│  - Runs Go tests in isolated environment                            │
│  - Writes new tests                                                  │
│  - Creates GitHub PRs                                                │
└─────────────────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/toby-drinkall/experian_test_coverage_project.git
cd experian_test_coverage_project
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure API Key

```bash
cp .env.example .env
# Edit .env and add your Devin API key
```

### 4. Start the Dashboard

```bash
npm start
# Opens at http://localhost:8000/coverage-dashboard.html
```

## Using the Dashboard

### View Coverage

The dashboard displays all Go packages with their coverage metrics:
- **Statements** - Percentage of code statements executed by tests
- **Functions** - Percentage of functions with at least one test

Packages are color-coded by status:
- Green (100%) - Complete coverage
- Blue (80%+) - Good coverage
- Yellow (<80%) - Needs work
- Gray - No tests

### Improve Coverage

1. Click on a package card to select it
2. Click **Improve** to start a Devin session
3. Watch progress as Devin:
   - Analyzes existing tests
   - Identifies untested functions
   - Writes new tests following existing patterns
   - Runs tests to verify they pass
   - Creates a PR with the improvements

### Merge and Sync

1. When Devin creates a PR, it appears in **Run History** with status "Pending Merge"
2. Click **Open PR** to review in GitHub
3. Merge the PR in GitHub
4. Click **Check Merged** (or wait for auto-sync)
5. Coverage metrics update automatically

## Running Go Tests Locally

To run coverage locally on the Go codebase:

```bash
cd vendor/experian
go test -cover ./...
```

For detailed function coverage:

```bash
cd vendor/experian
go test -coverprofile=coverage.out ./...
go tool cover -func=coverage.out
```

Or use the provided script:

```bash
./scripts/coverage.sh
```

## Configuration

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DEVIN_API_KEY` | Your Devin API key (required for AI features) |

### API Configuration

The API client in `coverage-api-config.js` contains:
- `apiUrl` - The Devin API endpoint (proxied through dev-server)
- `repo` - Repository details (owner, name, branch, path)
- `timeout` - Session timeout in milliseconds

## Workflow: Coverage Improvement

```
1. Dashboard shows package with low coverage (e.g., 13.8%)
                    │
                    ▼
2. User clicks "Improve Coverage"
                    │
                    ▼
3. Dashboard creates Devin session with prompt:
   - Current coverage metrics
   - Instructions to analyze existing tests
   - Commands to run coverage
   - Requirements for new tests
                    │
                    ▼
4. Devin AI:
   - Clones repo and checks out branch
   - Runs baseline coverage
   - Identifies untested functions
   - Writes tests matching existing style
   - Verifies all tests pass
   - Creates PR with improvements
                    │
                    ▼
5. PR appears in Run History (status: "Pending Merge")
                    │
                    ▼
6. User reviews and merges PR in GitHub
                    │
                    ▼
7. Dashboard detects merge via GitHub API
                    │
                    ▼
8. Coverage metrics update, chart reflects new values
```

## Troubleshooting

### CORS Errors

The dev-server proxies API requests to avoid CORS issues. If you see CORS errors:
1. Make sure you're accessing the dashboard through `http://localhost:8000`
2. Check that dev-server.js is running

### API Authentication Errors

1. Verify your API key is correctly set in `.env`
2. Check the server console for proxy errors
3. See `docs/DEVIN_API_SETUP.md` for detailed troubleshooting

### Coverage Not Updating

1. Click the **Sync** button to manually refresh from GitHub
2. Check that the PR was actually merged (not just closed)
3. Verify the run has `final_statements` and `final_functions` values

## License

MIT
