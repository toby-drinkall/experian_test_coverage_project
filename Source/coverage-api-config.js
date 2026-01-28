// Coverage Dashboard API Configuration
// TypeScript/Jest project with automated test coverage improvement

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
            url: 'https://github.com/toby-drinkall/experian_test_coverage_project'
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
    // COVERAGE-SPECIFIC METHODS (Jest/TypeScript)
    // ========================================

    // Improve test coverage for a specific file
    async improveTestCoverage(fileInfo, onProgress) {
        const { repo } = this.config;
        console.log(`Starting test coverage improvement for "${fileInfo.name}"`);

        const prompt = `
## WHAT
Improve test coverage for the file "${fileInfo.name}" in a TypeScript/Jest project.

## CONTEXT
- Repository: ${repo.url}
- Branch: ${repo.branch}
- File to improve: src/${fileInfo.name}
- Test file: src/${fileInfo.name.replace('.ts', '.test.ts')}
- Current coverage: ${fileInfo.statements}% statements, ${fileInfo.functions}% functions

## HOW
Follow these steps exactly:

**Step 1: Setup**
- Clone ${repo.url}
- Checkout branch: ${repo.branch}
- Run: npm install
- Send message: "Step 1 complete: Repository cloned and dependencies installed"

**Step 2: Baseline Coverage**
- Run: npm test -- --coverage
- Record the current coverage for ${fileInfo.name}
- Send message: "Step 2 complete: Baseline coverage - Statements: X%, Branches: X%, Functions: X%, Lines: X%"
- UPDATE STRUCTURED OUTPUT with baseline numbers

**Step 3: Analyze & Plan**
- Read src/${fileInfo.name} to understand all functions
- Read src/${fileInfo.name.replace('.ts', '.test.ts')} to see existing tests
- Identify which functions need more tests
- Create a test plan listing each function and what tests to add
- Send message: "Step 3 complete: Test plan created - [N] functions need tests: [list function names]"

**Step 4: Write Tests**
- Add tests to src/${fileInfo.name.replace('.ts', '.test.ts')}
- Follow the existing test patterns (describe/it blocks)
- Test normal cases, edge cases, and error cases
- Send message: "Step 4 complete: Added [N] new test cases"

**Step 5: Verify**
- Run: npm test -- --coverage
- Verify all tests pass
- Check coverage improved
- If tests fail, fix them before proceeding
- Send message: "Step 5 complete: All tests pass. New coverage - Statements: X%, Functions: X%"
- UPDATE STRUCTURED OUTPUT with new coverage

**Step 6: Create PR**
- Create branch: coverage-${fileInfo.name.replace('.ts', '')}
- Commit with message: "Improve test coverage for ${fileInfo.name}"
- Push and create PR to ${repo.branch}
- In PR description, include:
  - Test plan from Step 3
  - Coverage before and after
  - List of new test cases added
- Send message: "Step 6 complete: Created PR #[number]"

**Step 7: Final Report**
- Send final summary with all coverage metrics
- UPDATE STRUCTURED OUTPUT with final values including pr_number

## RESULT
Success criteria:
- All tests pass (npm test exits with code 0)
- Coverage for ${fileInfo.name} increases
- PR is created with clear description of changes

## STRUCTURED OUTPUT (update after each test run)
{
  "statements": 0,
  "branches": 0,
  "functions": 0,
  "lines": 0,
  "tests_passed": 0,
  "tests_failed": 0,
  "pr_number": null,
  "test_plan": ""
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
        const structuredOutput = finalStatus.structured_output || {};

        // Try to extract PR number from messages if not in structured output
        let prNumber = structuredOutput.pr_number || null;
        if (!prNumber && finalStatus.messages) {
            const allMessages = finalStatus.messages.map(m => m.message || '').join(' ');
            const prMatch = allMessages.match(/PR\s*#?(\d+)|pull\/(\d+)|Created PR #(\d+)/i);
            if (prMatch) {
                prNumber = prMatch[1] || prMatch[2] || prMatch[3];
            }
        }

        return {
            sessionId: session.sessionId,
            url: session.url,
            prNumber: prNumber || 'N/A',
            fileName: fileInfo.name,
            oldCoverage: {
                statements: fileInfo.statements,
                branches: fileInfo.branches,
                functions: fileInfo.functions,
                lines: fileInfo.lines
            },
            newCoverage: {
                statements: structuredOutput.statements || fileInfo.statements,
                branches: structuredOutput.branches || fileInfo.branches,
                functions: structuredOutput.functions || fileInfo.functions,
                lines: structuredOutput.lines || fileInfo.lines
            },
            testPlan: structuredOutput.test_plan || '',
            testsPassed: structuredOutput.tests_passed || 0,
            testsFailed: structuredOutput.tests_failed || 0,
            status: finalStatus.status_enum,
            messages: finalStatus.messages || []
        };
    },

    // Run all tests via Devin session
    async runAllTests(onProgress) {
        const { repo } = this.config;
        console.log('Starting Devin session to run all tests');

        const prompt = `
## WHAT
Run the test suite for a TypeScript/Jest project and report results.

## CONTEXT
- Repository: ${repo.url}
- Branch: ${repo.branch}

## HOW
1. Clone ${repo.url} and checkout ${repo.branch}
2. Run: npm install
3. Run: npm test -- --coverage
4. Report test results and coverage

## RESULT
Report:
- Number of test suites
- Number of tests passed/failed
- Coverage summary (statements, branches, functions, lines)

## STRUCTURED OUTPUT
{
  "statements": 0,
  "branches": 0,
  "functions": 0,
  "lines": 0,
  "tests_passed": 0,
  "tests_failed": 0,
  "test_suites": 0
}

NO PR REQUIRED - just run tests and report.
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
        const so = finalStatus.structured_output || {};

        return {
            sessionId: session.sessionId,
            url: session.url,
            coverage: {
                statements: so.statements || 0,
                branches: so.branches || 0,
                functions: so.functions || 0,
                lines: so.lines || 0
            },
            testsPassed: so.tests_passed || 0,
            testsFailed: so.tests_failed || 0,
            testSuites: so.test_suites || 0,
            status: finalStatus.status_enum
        };
    },

    // Run coverage scan via Devin session
    async runCoverageScan(onProgress) {
        const { repo } = this.config;
        console.log('Starting Devin session to scan coverage');

        const prompt = `
## WHAT
Run coverage scan for a TypeScript/Jest project and report detailed results.

## CONTEXT
- Repository: ${repo.url}
- Branch: ${repo.branch}

## HOW
1. Clone ${repo.url} and checkout ${repo.branch}
2. Run: npm install
3. Run: npm test -- --coverage
4. Parse the coverage output for each file
5. Report coverage by file

## RESULT
Report for each source file:
- File name
- Statements %
- Branches %
- Functions %
- Lines %
- Uncovered line numbers

## STRUCTURED OUTPUT
{
  "statements": 0,
  "branches": 0,
  "functions": 0,
  "lines": 0,
  "files": [
    {"name": "calculator.ts", "statements": 0, "branches": 0, "functions": 0, "lines": 0}
  ]
}

NO PR REQUIRED - just scan and report.
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
        const so = finalStatus.structured_output || {};

        return {
            sessionId: session.sessionId,
            url: session.url,
            coverage: {
                statements: so.statements || 0,
                branches: so.branches || 0,
                functions: so.functions || 0,
                lines: so.lines || 0
            },
            files: so.files || [],
            status: finalStatus.status_enum
        };
    }
};

// Export for use in coverage dashboard
window.CoverageAPI = CoverageAPI;
