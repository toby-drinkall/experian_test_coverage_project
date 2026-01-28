# Test Coverage Automation Dashboard

A test coverage automation dashboard powered by Devin AI. This dashboard visualizes Jest test coverage and automates test improvements via Devin sessions.

## Overview

This project demonstrates automated test coverage improvement using Devin AI:

- **Coverage Visualization** - View coverage by file (statements, branches, functions, lines)
- **Automated Test Generation** - Trigger Devin AI sessions to write tests
- **GitHub Integration** - Automatic PR creation with test plans
- **Real-time Progress** - Watch Devin's progress step-by-step

## Project Structure

```
experian_test_coverage_project/
├── src/
│   ├── calculator.ts        # Arithmetic functions (partially tested)
│   ├── calculator.test.ts   # Tests for calculator
│   ├── stringUtils.ts       # String utilities (minimal tests)
│   └── stringUtils.test.ts  # Tests for stringUtils
├── Source/
│   ├── coverage-dashboard.html   # Dashboard UI (React + Tailwind)
│   └── coverage-api-config.js    # Devin API integration
├── dev-server.js            # Express server with API proxy
├── jest.config.js           # Jest configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies
```

## Current Coverage

| File | Statements | Functions | Lines |
|------|------------|-----------|-------|
| calculator.ts | 36% | 33% | 36% |
| stringUtils.ts | 42% | 17% | 44% |
| **Total** | **39%** | **25%** | **40%** |

## Quick Start

```bash
# Clone and install
git clone https://github.com/toby-drinkall/experian_test_coverage_project.git
cd experian_test_coverage_project
npm install

# Run tests locally
npm test

# Start dashboard
npm start
# Open http://localhost:8000/coverage-dashboard.html
```

## Running Tests

```bash
# Run with coverage
npm test

# Watch mode
npm run test:watch
```

## Using the Dashboard

### Improve Coverage
1. Select a file (e.g., `calculator.ts`)
2. Click **Improve**
3. Watch Devin:
   - Clone repo and run baseline tests
   - Analyze untested functions
   - Create test plan
   - Write tests
   - Verify all tests pass
   - Create PR with results

### What Devin Does
1. **Setup** - Clones repo, installs dependencies
2. **Baseline** - Runs `npm test -- --coverage`
3. **Analyze** - Identifies untested functions
4. **Plan** - Creates test plan (visible in PR)
5. **Write** - Adds tests following existing patterns
6. **Verify** - Ensures all tests pass
7. **PR** - Creates pull request with coverage report

## Configuration

Create `.env` file:
```
DEVIN_API_KEY=your_api_key_here
```

## Source Files

### calculator.ts
- `add(a, b)` - ✅ Tested
- `subtract(a, b)` - ✅ Tested
- `multiply(a, b)` - ❌ Not tested
- `divide(a, b)` - ❌ Not tested
- `power(base, exp)` - ❌ Not tested
- `factorial(n)` - ❌ Not tested

### stringUtils.ts
- `capitalize(str)` - ✅ Tested
- `reverse(str)` - ❌ Not tested
- `isPalindrome(str)` - ❌ Not tested
- `truncate(str, max)` - ❌ Not tested
- `countWords(str)` - ❌ Not tested
- `slugify(str)` - ❌ Not tested

## License

MIT
