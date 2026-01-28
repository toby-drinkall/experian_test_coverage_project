// Coverage Dashboard API Configuration
// For use with experian_test_coverage_project repo

const CoverageAPI = {
    // Configuration
    config: {
        apiUrl: 'http://localhost:8000/api/devin',
        apiKey: 'apk_user_ZW1haWx8NjkzNGIxYzVjYTkwY2JhNWQ3MWNkZDNlX29yZy02ODI3NzczYmQ3MTk0YzI0YTQyN2NkNGRiM2M4YmY2ZDozOGU3ZDU5NGYzNTI0MmU0OTYzNDNlOGIyNDJkY2QxZg==',
        timeout: 300000,
        // NEW: Explicit repo configuration
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
    // COVERAGE-SPECIFIC METHODS
    // ========================================

    // Improve test coverage for a specific file
    async improveTestCoverage(fileInfo, onProgress) {
        const { repo } = this.config;
        console.log(`Starting test coverage improvement for "${fileInfo.path}"`);

        const scopeNote = fileInfo.scope === 'tests-refactor'
            ? 'You may refactor code minimally for testability if needed.'
            : 'Write tests only - do not modify source code.';

        const prompt = `
REPOSITORY CONTEXT:
- GitHub Repo: ${repo.url}
- Clone: git clone ${repo.url}.git
- Branch: ${repo.branch}
- Target Repo: Experian/mittens (via subtree in vendor/experian/)
- Area/Package: ${fileInfo.package || fileInfo.path}

TASK: Improve test coverage for ${fileInfo.path}

SCOPE: ${scopeNote}

CURRENT STATE:
- File: ${fileInfo.path}
- Current Coverage: ${fileInfo.currentCoverage}%
- Target Coverage: ${fileInfo.targetCoverage || 80}%
- Package: ${fileInfo.package || 'unknown'}

FUNCTIONS NEEDING TESTS:
${fileInfo.functions ? fileInfo.functions.map(f => `- ${f.name}: ${f.coverage}% coverage`).join('\n') : 'See file for functions'}

CRITICAL INSTRUCTIONS:
1. Run \`make test\` or \`go test -cover ./...\` to compute current coverage
2. Add tests to improve coverage toward ${fileInfo.targetCoverage || 80}%
3. Re-run tests until coverage >= ${fileInfo.targetCoverage || 80}% (or best effort if N/A)
4. Open a PR with the test improvements

STRUCTURED OUTPUT SCHEMA (REQUIRED):
You MUST update this structured output immediately after EACH test run and whenever coverage changes:
{
  "tests_passed": 0,
  "tests_failed": 0,
  "failing_tests": [],
  "coverage": 0
}

Please update the structured output immediately after each test run and whenever coverage changes.

PROGRESS TRACKING:
Send a message after completing each step:

1. Clone Repository
   - Clone ${repo.url}
   - Checkout branch: ${repo.branch}
   Send: "Step 1 complete: Cloned repo"

2. Analyze & Run Initial Tests
   - Run: make test or go test -cover ./...
   - Record initial coverage
   - UPDATE STRUCTURED OUTPUT with test results
   Send: "Step 2 complete: Initial coverage [X]%"

3. Identify Untested Functions
   - Analyze ${fileInfo.path}
   - List functions needing tests
   Send: "Step 3 complete: Found [N] functions needing tests"

4. Write Tests
   - Create/update test file
   - Follow existing patterns
   Send: "Step 4 complete: Wrote tests for [N] functions"

5. Run Tests & Verify
   - Run: make test or go test -cover ./...
   - UPDATE STRUCTURED OUTPUT with new results
   - Iterate if coverage < ${fileInfo.targetCoverage || 80}%
   Send: "Step 5 complete: Coverage now [X]%"

6. Create Branch & Commit
   - Branch: coverage-${fileInfo.package || 'improvement'}
   - Commit with coverage improvement message
   Send: "Step 6 complete: Committed changes"

7. Create Pull Request
   - Base: ${repo.branch}
   - Title: "Improve test coverage for ${fileInfo.path}"
   Send: "Step 7 complete: Created PR #[number]"

8. Finalize
   - UPDATE STRUCTURED OUTPUT with final values
   Send: "Step 8 complete: Coverage improved from ${fileInfo.currentCoverage}% to [X]%"

FINAL STRUCTURED OUTPUT (include in last message):
{
  "pr_number": [PR number],
  "tests_passed": [total passing],
  "tests_failed": [total failing],
  "failing_tests": [list of failing test names if any],
  "coverage": [final coverage percentage],
  "old_coverage": ${fileInfo.currentCoverage},
  "new_coverage": [final coverage]
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

        return {
            sessionId: session.sessionId,
            url: session.url,
            prNumber: structuredOutput.pr_number || finalStatus.pull_request || 'N/A',
            filePath: fileInfo.path,
            oldCoverage: fileInfo.currentCoverage,
            newCoverage: structuredOutput.new_coverage || 'pending',
            testsAdded: structuredOutput.tests_added || 0,
            branch: structuredOutput.branch_name || `coverage-${fileInfo.path.replace(/\//g, '-').replace('.go', '')}`,
            status: finalStatus.status_enum,
            messages: finalStatus.messages || []
        };
    },

    // Batch improve coverage for multiple files
    async batchImproveCoverage(files, onProgress) {
        const { repo } = this.config;
        const fileList = files.map(f => `- ${f.path}: ${f.currentCoverage}%`).join('\n');

        console.log(`Starting batch coverage improvement for ${files.length} files`);

        const prompt = `
REPOSITORY CONTEXT:
- GitHub Repo: ${repo.url}
- Clone: git clone ${repo.url}.git
- Branch: ${repo.branch}

TASK: Improve test coverage for multiple files in vendor/experian/

FILES TO IMPROVE:
${fileList}

PRIORITY: Focus on files with lowest coverage first.

CRITICAL PROGRESS TRACKING:
Send a message after completing tests for EACH file.

Task Steps:

1. Clone and Setup
   - Clone ${repo.url}
   - Checkout ${repo.branch}
   - Run initial coverage: go test -cover ./...
   Send: "Step 1 complete: Setup done, initial coverage: [X]%"

2-${files.length + 1}. For each file:
   - Write tests
   - Verify they pass
   Send: "File [N] complete: ${'{filename}'} now at [X]% coverage"

${files.length + 2}. Create Single PR
   - Branch: batch-coverage-improvement
   - Commit all test files
   - PR to ${repo.branch}
   Send: "PR created: #[number] - Coverage improved across ${files.length} files"

STRUCTURED OUTPUT:
{
  "pr_number": [PR number],
  "files_improved": ${files.length},
  "coverage_before": [total before],
  "coverage_after": [total after]
}
        `.trim();

        const session = await this.createSession({ prompt });

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
        return {
            sessionId: session.sessionId,
            url: session.url,
            prNumber: finalStatus.structured_output?.pr_number || 'N/A',
            filesImproved: files.length,
            status: finalStatus.status_enum
        };
    },

    // Run all tests via Devin session
    async runAllTests(onProgress) {
        const { repo } = this.config;
        console.log('Starting Devin session to run all tests');

        const prompt = `
REPOSITORY CONTEXT:
- GitHub Repo: ${repo.url}
- Clone: git clone ${repo.url}.git
- Branch: ${repo.branch}
- Target: vendor/experian/ (Experian/mittens subtree)

TASK: Run all tests and report results

INSTRUCTIONS:
1. Clone the repository
2. Navigate to vendor/experian/
3. Run: make test OR go test -v ./...
4. Report all test results

STRUCTURED OUTPUT SCHEMA (REQUIRED):
Update this structured output immediately after each test run:
{
  "tests_passed": 0,
  "tests_failed": 0,
  "failing_tests": [],
  "coverage": 0
}

Please update the structured output immediately after each test run and whenever coverage changes.

PROGRESS:
1. Clone Repository → Send: "Step 1 complete: Cloned repo"
2. Run Tests → Send: "Step 2 complete: Running tests..."
3. Report Results → Send: "Step 3 complete: [X] passed, [Y] failed"
4. Finalize → Send: "Step 4 complete: Test run finished"

NO PR REQUIRED - just run tests and report results.
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
        return {
            sessionId: session.sessionId,
            url: session.url,
            testsPassed: finalStatus.structured_output?.tests_passed || 0,
            testsFailed: finalStatus.structured_output?.tests_failed || 0,
            failingTests: finalStatus.structured_output?.failing_tests || [],
            coverage: finalStatus.structured_output?.coverage || 0,
            status: finalStatus.status_enum
        };
    },

    // Run coverage scan via Devin session
    async runCoverageScan(onProgress) {
        const { repo } = this.config;
        console.log('Starting Devin session to scan coverage');

        const prompt = `
REPOSITORY CONTEXT:
- GitHub Repo: ${repo.url}
- Clone: git clone ${repo.url}.git
- Branch: ${repo.branch}
- Target: vendor/experian/ (Experian/mittens subtree)

TASK: Run coverage scan and report detailed results

INSTRUCTIONS:
1. Clone the repository
2. Navigate to vendor/experian/
3. Run: go test -cover ./...
4. Run: go test -coverprofile=coverage.out ./...
5. Run: go tool cover -func=coverage.out
6. Parse and report coverage by package

STRUCTURED OUTPUT SCHEMA (REQUIRED):
Update this structured output with coverage data:
{
  "tests_passed": 0,
  "tests_failed": 0,
  "failing_tests": [],
  "coverage": 0,
  "packages": [
    {"name": "package_name", "coverage": 0}
  ]
}

Please update the structured output immediately after the coverage scan completes.

PROGRESS:
1. Clone Repository → Send: "Step 1 complete: Cloned repo"
2. Run Coverage → Send: "Step 2 complete: Running coverage scan..."
3. Parse Results → Send: "Step 3 complete: Coverage is [X]%"
4. Finalize → Send: "Step 4 complete: Coverage scan finished"

NO PR REQUIRED - just scan coverage and report results.
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
        return {
            sessionId: session.sessionId,
            url: session.url,
            coverage: finalStatus.structured_output?.coverage || 0,
            packages: finalStatus.structured_output?.packages || [],
            status: finalStatus.status_enum
        };
    }
};

// Export for use in coverage dashboard
window.CoverageAPI = CoverageAPI;

// Also export DevinAPI alias for compatibility
window.DevinAPI = CoverageAPI;
