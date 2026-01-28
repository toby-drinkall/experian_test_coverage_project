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

        const prompt = `
You are improving test coverage for a Go project.

REPOSITORY: ${repo.url}
BRANCH: ${repo.branch}

TASK: Increase test coverage for the "${fileInfo.package}" package from ${fileInfo.currentCoverage}% toward 80%.

STEPS:
1. Clone the repo and checkout branch "${repo.branch}"
2. Navigate to vendor/experian/ (this is where the Go code lives)
3. Run "go test -cover ./..." to establish baseline coverage
4. Analyze the ${fileInfo.package} package to find untested functions
5. Write new tests following the existing test patterns in the codebase
6. Run tests again to verify they pass and coverage improved
7. Create a new branch "coverage-${fileInfo.package}"
8. Commit your changes with message "Improve test coverage for ${fileInfo.package}"
9. Push and create a PR to "${repo.branch}"

IMPORTANT:
- All Go code is in vendor/experian/ directory
- Follow existing test patterns in the codebase
- Make sure all tests pass before creating PR
- Only add tests - do not modify source code

When done, report:
- PR number created
- Old coverage percentage
- New coverage percentage
- Number of tests added
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
        let prNumber = structuredOutput.pr_number || finalStatus.pull_request || null;
        if (!prNumber && finalStatus.messages) {
            const allMessages = finalStatus.messages.map(m => m.message || '').join(' ');
            const prMatch = allMessages.match(/PR\s*#?(\d+)|pull\/(\d+)|created.*#(\d+)/i);
            if (prMatch) {
                prNumber = prMatch[1] || prMatch[2] || prMatch[3];
            }
        }

        return {
            sessionId: session.sessionId,
            url: session.url,
            prNumber: prNumber || 'N/A',
            filePath: fileInfo.path,
            oldCoverage: fileInfo.currentCoverage,
            newCoverage: structuredOutput.new_coverage || structuredOutput.coverage || 'pending',
            testsAdded: structuredOutput.tests_added || 0,
            branch: `coverage-${fileInfo.package}`,
            status: finalStatus.status_enum,
            messages: finalStatus.messages || []
        };
    },

    // Batch improve coverage for multiple files
    async batchImproveCoverage(files, onProgress) {
        const { repo } = this.config;
        const fileList = files.map(f => `- ${f.package}: ${f.currentCoverage}%`).join('\n');

        console.log(`Starting batch coverage improvement for ${files.length} files`);

        const prompt = `
You are improving test coverage for a Go project.

REPOSITORY: ${repo.url}
BRANCH: ${repo.branch}

TASK: Increase test coverage for multiple packages. Focus on lowest coverage first.

PACKAGES TO IMPROVE:
${fileList}

STEPS:
1. Clone the repo and checkout "${repo.branch}"
2. Navigate to vendor/experian/ (Go code location)
3. Run "go test -cover ./..." to get baseline
4. For each package, write tests following existing patterns
5. Verify all tests pass
6. Create branch "batch-coverage-improvement"
7. Commit and create single PR to "${repo.branch}"

IMPORTANT:
- All Go code is in vendor/experian/
- Follow existing test patterns
- All tests must pass before PR

When done, report PR number and coverage improvement.
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
You are running tests for a Go project.

REPOSITORY: ${repo.url}
BRANCH: ${repo.branch}

TASK: Run all tests and report results.

STEPS:
1. Clone the repo and checkout "${repo.branch}"
2. Navigate to vendor/experian/
3. Run "go test -v ./..."
4. Report: number of tests passed, failed, and overall coverage

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
You are scanning test coverage for a Go project.

REPOSITORY: ${repo.url}
BRANCH: ${repo.branch}

TASK: Run coverage scan and report detailed results by package.

STEPS:
1. Clone the repo and checkout "${repo.branch}"
2. Navigate to vendor/experian/
3. Run "go test -cover ./..."
4. Run "go test -coverprofile=coverage.out ./..."
5. Run "go tool cover -func=coverage.out"
6. Report coverage percentage for each package

NO PR REQUIRED - just scan and report coverage results.
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
