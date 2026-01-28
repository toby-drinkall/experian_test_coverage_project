# Experian Test Coverage Dashboard

A test coverage automation dashboard for the Mittens service warmup tool, powered by Devin AI. This dashboard visualizes Go test coverage and automates the creation of test improvements via Devin sessions.

## Overview

This project provides a visual dashboard for monitoring and improving test coverage in the Mittens codebase (a Go-based service warmup tool). Key capabilities:

- **Coverage Visualization** - View coverage by package with weighted statement averages
- **Automated Test Generation** - Trigger Devin AI sessions to write tests for specific packages
- **GitHub Integration** - Automatic PR creation and merge status tracking
- **Coverage Trend Tracking** - Historical view of coverage improvements over time

## Project Structure

```
experian-test-coverage/
├── Source/
│   ├── coverage-dashboard.html   # Main dashboard UI (React + Tailwind)
│   ├── coverage-api-config.js    # Devin API integration
│   └── index.html                # Redirect to dashboard
├── vendor/
│   └── experian/                 # Mittens codebase (Go)
│       ├── cmd/                  # CLI commands
│       ├── pkg/                  # Core packages
│       │   ├── grpc/             # gRPC client/server
│       │   ├── http/             # HTTP client/server
│       │   └── warmup/           # Warmup orchestration
│       └── internal/pkg/         # Internal packages
├── docs/                         # Documentation
├── dev-server.js                 # Express server with API proxy
├── package.json                  # Node.js dependencies
└── .env                          # API key (not committed)
```

## Mittens Packages

The dashboard tracks coverage for these packages:

| Package | Description |
|---------|-------------|
| **grpc** | gRPC client implementation for warmup requests with TLS support |
| **http** | HTTP client for warmup requests with connection pooling |
| **warmup** | Orchestrates concurrent warmup by spawning workers |
| **safe** | Thread-safe atomic operations for concurrent access |
| **flags** | CLI flag parsing for command-line configuration |
| **failuraccu** | Tracks warmup failures with threshold detection |
| **probes** | Health check probes for readiness/liveness |
| **grpcsrv** | gRPC server for testing warmup requests |
| **httpsrv** | HTTP server for testing warmup requests |

## Installation

### Prerequisites
- Node.js v14+
- npm
- Devin API key (for automated test generation)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/toby-drinkall/experian_test_coverage_project.git
cd experian_test_coverage_project
```

2. Install dependencies:
```bash
npm install
```

3. Configure Devin API:
```bash
cp .env.example .env
# Edit .env and add your DEVIN_API_KEY
```

4. Start the server:
```bash
npm start
```

5. Open the dashboard:
```
http://localhost:8000/coverage-dashboard.html
```

## Usage

### Viewing Coverage

The dashboard displays:
- **Total Coverage** - Weighted average across all packages (by statement count)
- **Needs Improvement** - Packages below 80% coverage (shown in red)
- **Over 80%** - Packages meeting the 80% threshold (shown in green)

### Improving Coverage

1. Find a package needing improvement
2. Click the **Improve** button
3. Select scope:
   - **Tests only** - Write tests without modifying source code
   - **Tests + Refactor** - May make minimal code changes for testability
4. Click **Start Automation**
5. Monitor Devin's progress in the modal
6. Review and merge the created PR on GitHub

### GitHub Sync

Click the **GitHub Sync** badge to verify coverage data matches the repository state.

### Run Coverage Check

Click **Run Coverage Check** to trigger a full coverage scan via Devin.

## API Integration

The dev server proxies requests to the Devin API:

- `POST /api/devin/sessions` - Create new Devin session
- `GET /api/devin/sessions/:id` - Get session status
- `DELETE /api/devin/sessions/:id` - Cancel session
- `GET /api/devin/_status` - Check API configuration

## Run History

Completed Devin sessions appear in the **Runs** tab with:
- Package name and run type (Improve/Scan)
- Coverage delta (before/after)
- Test results (passed/failed)
- PR link and merge status

Note: Runs are only added when a Devin session completes successfully with a valid PR.

## Technical Details

### Dashboard Architecture
- **React 18** - Component-based UI
- **Tailwind CSS** - Utility-first styling with glassmorphism design
- **Chart.js patterns** - SVG-based trend visualization
- **Babel Standalone** - Client-side JSX compilation

### Coverage Calculation
Coverage is calculated as a weighted average based on statement count:
```
total_coverage = sum(package_coverage * statement_count) / sum(statement_count)
```

This gives larger packages more weight in the overall percentage.

## Environment Variables

```
DEVIN_API_KEY=your_devin_api_key_here
```

Without an API key, the dashboard displays coverage data but automation features are disabled.

## License

MIT - See LICENSE file for details

## Credits

- **Mittens** - Originally by [Experian](https://github.com/ExpediaGroup/mittens)
- **Dashboard** - Built for automated test coverage improvement with Devin AI
