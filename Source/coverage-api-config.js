// Coverage Dashboard API Configuration
// For use with experian_test_coverage_project repo

const CoverageAPI = {
    // Configuration
    config: {
        apiUrl: 'http://localhost:8000/api/devin',
        apiKey: 'apk_user_ZW1haWx8NjkzNGIxYzVjYTkwY2JhNWQ3MWNkZDNlX29yZy02ODI3NzczYmQ3MTk0YzI0YTQyN2NkNGRiM2M4YmY2ZDozOGU3ZDU5NGYzNTI0MmU0OTYzNDNlOGIyNDJkY2QxZg==',
        timeout: 300000,
        repo: {
            owner: 'toby-drinkall',
            name: 'experian_test_coverage_project',
            branch: 'cognition-dashboard-devin-integration',
            url: 'https://github.com/toby-drinkall/experian_test_coverage_project',
            goRoot: 'vendor/experian'  // Go code is in this subdirectory
        }
    },

    // Create a new Devin session
    async createSession(sessionConfig) {
        try {
            const requestBody = {
                prompt: sessionConfig.prompt || sessionConfig.name || 'New session'
            };

            const response = await fetch(`${this.config.apiUrl}/sessions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiKey}`,
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Session creation failed (${response.status}): ${errorText}`);
            }

            const data = await response.json();
            console.log('✓ Devin session created:', data.session_id);
            console.log('   Session URL:', data.url);

            return {
                sessionId: data.session_id,
                url: data.url,
                isNewSession: data.is_new_session
            };
        } catch (error) {
            console.error('✗ Devin session creation failed:', error);
            throw error;
        }
    },

    // Get session status
    async getSessionStatus(sessionId) {
        try {
            const response = await fetch(`${this.config.apiUrl}/sessions/${sessionId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                }
            });

            if (!response.ok) {
                throw new Error(`Status check failed: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('✗ Status check failed:', error);
            throw error;
        }
    },

    // Cancel session
    async cancelSession(sessionId) {
        try {
            console.log(`Terminating Devin session: ${sessionId}`);
            const response = await fetch(`${this.config.apiUrl}/sessions/${sessionId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                }
            });

            if (!response.ok) {
                throw new Error(`Cancel failed: ${response.statusText}`);
            }

            console.log('✓ Devin session terminated');
            return { method: 'terminated', success: true };
        } catch (error) {
            console.error('✗ Failed to terminate session:', error);
            throw error;
        }
    },

    // Poll session status until completion
    async pollSessionStatus(sessionId, onProgress) {
        const pollInterval = 3000;
        const maxPolls = 200;
        let attempts = 0;
        const startTime = Date.now();

        console.log('Starting polling with progress tracking...');

        while (attempts < maxPolls) {
            try {
                const status = await this.getSessionStatus(sessionId);
                const elapsed = Math.floor((Date.now() - startTime) / 1000);

                console.log(`Poll ${attempts + 1} (${elapsed}s):`, status.status_enum || status.status);

                const enhancedStatus = {
                    ...status,
                    elapsed_seconds: elapsed,
                    poll_count: attempts + 1,
                };

                if (onProgress) {
                    onProgress(enhancedStatus);
                }

                if (status.status_enum === 'finished' || status.status_enum === 'completed' || status.status_enum === 'blocked') {
                    console.log(`Session completed after ${elapsed}s!`);
                    return enhancedStatus;
                } else if (status.status_enum === 'cancelled' || status.status_enum === 'stopped' || status.status_enum === 'terminated') {
                    throw new Error('Session cancelled by user');
                } else if (status.status_enum === 'failed' || status.status_enum === 'error') {
                    throw new Error(`Session failed: ${status.status}`);
                }

                await new Promise(resolve => setTimeout(resolve, pollInterval));
                attempts++;
            } catch (error) {
                console.error('Polling error:', error);
                await new Promise(resolve => setTimeout(resolve, pollInterval));
                attempts++;
            }
        }

        throw new Error('Session timeout - exceeded max polling time');
    },

    // ========================================
    // COVERAGE-SPECIFIC METHODS
    // ========================================

    // Improve test coverage for a specific package
    async improveTestCoverage(fileInfo, onProgress) {
        const { repo } = this.config;
        const packagePath = fileInfo.name || fileInfo.path;  // e.g., "internal/pkg/grpc"
        const packageName = fileInfo.package || packagePath.split('/').pop();  // e.g., "grpc"

        console.log(`Starting test coverage improvement for "${packagePath}"`);

        const prompt = `
## TASK: Improve test coverage for Go package "${packagePath}"

## REPOSITORY
- URL: ${repo.url}
- Branch: ${repo.branch}
- Go code location: ${repo.goRoot}/

## CURRENT COVERAGE
- Package: ${packagePath}
- Statement Coverage: ${fileInfo.statements}%
- Function Coverage: ${fileInfo.functions}%
- Target: 80%+

## COMMANDS TO RUN
All Go commands must run from the ${repo.goRoot}/ directory:

\`\`\`bash
git clone ${repo.url}.git
cd experian_test_coverage_project
cd ${repo.goRoot}
go test -cover ./${packagePath}/...
go test -coverprofile=coverage.out ./${packagePath}/...
go tool cover -func=coverage.out
\`\`\`

## STEPS

**Step 1: Clone & Setup**
\`\`\`bash
git clone ${repo.url}.git
cd experian_test_coverage_project
git checkout ${repo.branch}
cd ${repo.goRoot}
\`\`\`
Send: "Step 1 complete: Cloned repo and checked out ${repo.branch}"

**Step 2: Check Current Coverage**
\`\`\`bash
go test -coverprofile=coverage.out ./${packagePath}/...
go tool cover -func=coverage.out
\`\`\`
Update structured output with current coverage.
Send: "Step 2 complete: Current coverage is [X]%"

**Step 3: Identify Untested Code**
Review output from \`go tool cover -func\` to find functions with 0% coverage.
Send: "Step 3 complete: Found [N] functions needing tests"

**Step 4: Write Tests**
- Find existing test file (e.g., \`${packagePath}/*_test.go\`)
- Add new test cases following existing patterns
- Focus on functions with 0% coverage
Send: "Step 4 complete: Wrote tests for [N] functions"

**Step 5: Verify Tests Pass**
\`\`\`bash
go test -coverprofile=coverage.out ./${packagePath}/...
go tool cover -func=coverage.out
\`\`\`
Update structured output with new coverage.
Send: "Step 5 complete: Coverage now [X]%"

**Step 6: Commit Changes**
\`\`\`bash
git checkout -b coverage-${packageName}
git add .
git commit -m "Improve test coverage for ${packagePath}"
\`\`\`
Send: "Step 6 complete: Committed changes"

**Step 7: Create Pull Request**
\`\`\`bash
git push -u origin coverage-${packageName}
gh pr create --title "Improve test coverage for ${packagePath}" --body "Improves test coverage for ${packagePath} package."
\`\`\`
Send: "Step 7 complete: Created PR #[number]"

## STRUCTURED OUTPUT (REQUIRED)
Update after EVERY test run:
{
  "statement_coverage": [current statement %],
  "function_coverage": [current function %],
  "tests_passed": [number],
  "tests_failed": [number],
  "pr_number": [PR number when created]
}
`.trim();

        const session = await this.createSession({ prompt });
        console.log(`✓ Devin session created: ${session.url}`);

        if (onProgress) {
            onProgress({
                session_created: true,
                session_id: session.sessionId,
                url: session.url,
                status_enum: 'initializing',
                messages: []
            });
        }

        const sessionUrl = session.url;
        const onProgressWithUrl = onProgress ? (status) => {
            if (!status.url && sessionUrl) {
                status.url = sessionUrl;
            }
            onProgress(status);
        } : null;

        const finalStatus = await this.pollSessionStatus(session.sessionId, onProgressWithUrl);
        const output = finalStatus.structured_output || {};

        return {
            sessionId: session.sessionId,
            url: session.url,
            prNumber: output.pr_number || 'N/A',
            filePath: packagePath,
            oldStatementCoverage: fileInfo.statements,
            oldFunctionCoverage: fileInfo.functions,
            newStatementCoverage: output.statement_coverage || null,
            newFunctionCoverage: output.function_coverage || null,
            testsPassed: output.tests_passed || 0,
            testsFailed: output.tests_failed || 0,
            status: finalStatus.status_enum,
            messages: finalStatus.messages || []
        };
    },

    // Run coverage scan - reports current coverage without making changes
    async runCoverageScan(onProgress) {
        const { repo } = this.config;
        console.log('Starting Devin session to scan coverage');

        const prompt = `
## TASK: Run coverage scan and report results

## REPOSITORY
- URL: ${repo.url}
- Branch: ${repo.branch}
- Go code location: ${repo.goRoot}/

## COMMANDS
All commands must run from the ${repo.goRoot}/ directory:

\`\`\`bash
git clone ${repo.url}.git
cd experian_test_coverage_project
git checkout ${repo.branch}
cd ${repo.goRoot}
go test -coverprofile=coverage.out ./...
go tool cover -func=coverage.out
\`\`\`

## STEPS

**Step 1: Clone & Setup**
\`\`\`bash
git clone ${repo.url}.git
cd experian_test_coverage_project
git checkout ${repo.branch}
cd ${repo.goRoot}
\`\`\`
Send: "Step 1 complete: Cloned repo"

**Step 2: Run Tests with Coverage**
\`\`\`bash
go test -coverprofile=coverage.out ./...
\`\`\`
Send: "Step 2 complete: Tests finished"

**Step 3: Get Coverage Report**
\`\`\`bash
go tool cover -func=coverage.out
\`\`\`
Parse the output and update structured output.
Send: "Step 3 complete: Total coverage is [X]%"

## STRUCTURED OUTPUT (REQUIRED)
Update after the coverage scan:
{
  "statement_coverage": [total statement coverage %],
  "tests_passed": [number of passing tests],
  "tests_failed": [number of failing tests],
  "packages": [
    {"name": "internal/pkg/safe", "statement_coverage": 100},
    {"name": "internal/pkg/http", "statement_coverage": 81.9}
  ]
}

## NO PR REQUIRED
This is a read-only coverage scan.
`.trim();

        const session = await this.createSession({ prompt });
        console.log(`✓ Devin session created: ${session.url}`);

        if (onProgress) {
            onProgress({
                session_created: true,
                session_id: session.sessionId,
                url: session.url,
                status_enum: 'initializing',
                messages: []
            });
        }

        const finalStatus = await this.pollSessionStatus(session.sessionId, onProgress);
        const output = finalStatus.structured_output || {};

        return {
            sessionId: session.sessionId,
            url: session.url,
            statementCoverage: output.statement_coverage || 0,
            testsPassed: output.tests_passed || 0,
            testsFailed: output.tests_failed || 0,
            packages: output.packages || [],
            status: finalStatus.status_enum
        };
    },

    // Run all tests without coverage (faster)
    async runAllTests(onProgress) {
        const { repo } = this.config;
        console.log('Starting Devin session to run all tests');

        const prompt = `
## TASK: Run all tests and report results

## REPOSITORY
- URL: ${repo.url}
- Branch: ${repo.branch}
- Go code location: ${repo.goRoot}/

## COMMANDS
\`\`\`bash
git clone ${repo.url}.git
cd experian_test_coverage_project
git checkout ${repo.branch}
cd ${repo.goRoot}
go test -v ./...
\`\`\`

## STEPS

**Step 1: Clone & Setup**
Send: "Step 1 complete: Cloned repo"

**Step 2: Run Tests**
\`\`\`bash
cd ${repo.goRoot}
go test -v ./...
\`\`\`
Send: "Step 2 complete: [X] passed, [Y] failed"

## STRUCTURED OUTPUT (REQUIRED)
{
  "tests_passed": [number],
  "tests_failed": [number],
  "failing_tests": ["test name 1", "test name 2"]
}

## NO PR REQUIRED
`.trim();

        const session = await this.createSession({ prompt });
        console.log(`✓ Devin session created: ${session.url}`);

        if (onProgress) {
            onProgress({
                session_created: true,
                session_id: session.sessionId,
                url: session.url,
                status_enum: 'initializing',
                messages: []
            });
        }

        const finalStatus = await this.pollSessionStatus(session.sessionId, onProgress);
        const output = finalStatus.structured_output || {};

        return {
            sessionId: session.sessionId,
            url: session.url,
            testsPassed: output.tests_passed || 0,
            testsFailed: output.tests_failed || 0,
            failingTests: output.failing_tests || [],
            status: finalStatus.status_enum
        };
    }
};

// Export for use in coverage dashboard
window.CoverageAPI = CoverageAPI;

// Also export DevinAPI alias for compatibility
window.DevinAPI = CoverageAPI;
