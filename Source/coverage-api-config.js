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
        const packagePath = fileInfo.name || fileInfo.path;
        const packageName = fileInfo.package || packagePath.split('/').pop();

        console.log(`Starting test coverage improvement for "${packagePath}"`);

        const prompt = `
## TASK: Improve test coverage for "${packagePath}"

REPO: ${repo.url} | BRANCH: ${repo.branch} | PATH: ${repo.goRoot}/

CURRENT: ${fileInfo.statements}% statements, ${fileInfo.functions}% functions | TARGET: 80%+

## APPROACH
1. **Analyze existing tests** in ${packagePath}/*_test.go - understand patterns, helpers, mocks used
2. **Check git history** for this package - look at past test PRs to see what approaches worked
3. **Run coverage** to identify untested functions: \`go test -coverprofile=coverage.out ./${packagePath}/... && go tool cover -func=coverage.out\`
4. **Write tests** following existing patterns - use same test helpers, table-driven tests if present
5. **Verify all tests pass** before committing

## COMMANDS (run from ${repo.goRoot}/)
\`\`\`bash
go test -coverprofile=coverage.out ./${packagePath}/...
go tool cover -func=coverage.out
\`\`\`

## REQUIREMENTS
- Study existing *_test.go files first - match their style exactly
- Use table-driven tests if the package uses them
- Reuse existing test helpers and mocks
- Each new test must pass independently
- Commit message: "test(${packageName}): improve coverage to X%"

## CREATE PR
Branch: coverage-${packageName}
Title: "test(${packageName}): improve coverage from ${fileInfo.statements}% to X%"

## STRUCTURED OUTPUT (update after each test run)
{
  "baseline_statements": ${fileInfo.statements},
  "baseline_functions": ${fileInfo.functions},
  "final_statements": [new statement %],
  "final_functions": [new function %],
  "tests_added": [number of new tests],
  "tests_passed": [total passing],
  "tests_failed": [total failing],
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
            prNumber: output.pr_number || null,
            packagePath: packagePath,
            baselineStatements: output.baseline_statements || fileInfo.statements,
            baselineFunctions: output.baseline_functions || fileInfo.functions,
            finalStatements: output.final_statements || null,
            finalFunctions: output.final_functions || null,
            testsAdded: output.tests_added || 0,
            testsPassed: output.tests_passed || 0,
            testsFailed: output.tests_failed || 0,
            status: finalStatus.status_enum
        };
    },

    // Run coverage scan - reports current coverage without making changes
    async runCoverageScan(onProgress) {
        const { repo } = this.config;
        console.log('Starting Devin session to scan coverage');

        const prompt = `
## TASK: Run coverage scan and report BOTH statement and function coverage

REPO: ${repo.url} | BRANCH: ${repo.branch} | PATH: ${repo.goRoot}/

## STEP 1: Run tests with coverage
\`\`\`bash
cd ${repo.goRoot}
go test -coverprofile=coverage.out ./...
\`\`\`
From output, count: packages with "ok" = tests passed, "FAIL" = tests failed
Extract statement coverage % for each package from "coverage: X.X% of statements"

## STEP 2: Get function-level coverage
\`\`\`bash
go tool cover -func=coverage.out
\`\`\`

## STEP 3: Calculate function coverage per package
For each package, count:
- Total functions (each line in go tool cover output is one function)
- Covered functions (functions with coverage > 0%)
- Function coverage % = (covered / total) × 100

## STEP 4: Calculate totals
- total_statements = simple average of all package statement %
- total_functions = simple average of all package function %

## STRUCTURED OUTPUT (fill in actual values from your scan)
{
  "total_statements": <average statement % across packages>,
  "total_functions": <average function % across packages>,
  "tests_passed": <count of packages with "ok">,
  "tests_failed": <count of packages with "FAIL">,
  "packages": [
    {"name": "<package-path>", "statements": <stmt%>, "functions": <func%>},
    ...for each package with tests...
  ]
}

## NO CHANGES - read-only scan only
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
            totalStatements: output.total_statements || 0,
            totalFunctions: output.total_functions || 0,
            testsPassed: output.tests_passed || 0,
            testsFailed: output.tests_failed || 0,
            packages: output.packages || [],
            status: finalStatus.status_enum
        };
    },

    // Run all tests (simple test run without coverage improvement)
    async runAllTests(onProgress) {
        const { repo } = this.config;
        console.log('Starting Devin session to run all tests');

        const prompt = `
## TASK: Run all tests and report results

REPO: ${repo.url} | BRANCH: ${repo.branch} | PATH: ${repo.goRoot}/

## COMMANDS (run from ${repo.goRoot}/)
\`\`\`bash
go test -v ./...
\`\`\`

## STRUCTURED OUTPUT (required)
{
  "tests_passed": [number of passing tests],
  "tests_failed": [number of failing tests],
  "failing_tests": ["TestName1", "TestName2"]
}

## NO CHANGES - just run tests and report
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
