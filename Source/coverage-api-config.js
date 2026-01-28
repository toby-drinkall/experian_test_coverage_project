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
REPOSITORY CONTEXT:
- GitHub Repo: ${repo.url}
- Clone: git clone ${repo.url}.git
- Branch: ${repo.branch}
- Owner: ${repo.owner}
- Repo Name: ${repo.name}

TASK: Improve test coverage for ${fileInfo.path}

CURRENT COVERAGE:
- File: ${fileInfo.path}
- Current Coverage: ${fileInfo.currentCoverage}%
- Target Coverage: ${fileInfo.targetCoverage || 80}%
- Package: ${fileInfo.package || 'unknown'}

FUNCTIONS NEEDING TESTS:
${fileInfo.functions ? fileInfo.functions.map(f => `- ${f.name}: ${f.coverage}% coverage`).join('\n') : 'See file for functions'}

CRITICAL PROGRESS TRACKING REQUIREMENT:
You MUST use your "send message to user" action after COMPLETING each step below.

Task Steps (send a message after EACH):

1. Clone Repository
   - Clone ${repo.url}
   - Checkout branch: ${repo.branch}
   Send: "Step 1 complete: Cloned repo and checked out ${repo.branch}"

2. Analyze File
   - Read ${fileInfo.path}
   - Identify untested functions
   - Run: go test -cover ./... to see current coverage
   Send: "Step 2 complete: Analyzed file, found [N] untested functions"

3. Write Tests
   - Create or update test file: ${fileInfo.path.replace('.go', '_test.go')}
   - Write tests for untested functions
   - Follow existing test patterns in the codebase
   Send: "Step 3 complete: Wrote tests for [N] functions"

4. Run Tests
   - Run: go test -cover ./...
   - Verify all tests pass
   - Check new coverage percentage
   Send: "Step 4 complete: Tests pass, coverage now [X]%"

5. Create Branch
   - Branch name: coverage-${fileInfo.path.replace(/\//g, '-').replace('.go', '')}
   Send: "Step 5 complete: Created branch"

6. Commit Changes
   - Commit message: "Add tests for ${fileInfo.path} - improve coverage to [X]%"
   Send: "Step 6 complete: Committed changes"

7. Create Pull Request
   - CRITICAL: Base branch MUST be "${repo.branch}"
   - Use: gh pr create --base ${repo.branch} --title "Improve test coverage for ${fileInfo.path}"
   - PR should show before/after coverage
   Send: "Step 7 complete: Created PR #[number]"

8. Finalize
   Send: "Step 8 complete: Coverage improved from ${fileInfo.currentCoverage}% to [X]%"

STRUCTURED OUTPUT:
{
  "pr_number": [PR number],
  "file_path": "${fileInfo.path}",
  "old_coverage": ${fileInfo.currentCoverage},
  "new_coverage": [new coverage percentage],
  "tests_added": [number of test functions added],
  "branch_name": "coverage-${fileInfo.path.replace(/\//g, '-').replace('.go', '')}"
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
    }
};

// Export for use in coverage dashboard
window.CoverageAPI = CoverageAPI;

// Also export DevinAPI alias for compatibility
window.DevinAPI = CoverageAPI;
