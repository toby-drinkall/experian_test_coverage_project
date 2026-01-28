const express = require('express');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const app = express();
const PORT = 8000;
const DEVIN_API_URL = 'https://api.devin.ai/v1';

// Load environment variables from .env file if it exists
function loadEnvFile() {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match && !process.env[match[1]]) {
                process.env[match[1]] = match[2].trim();
            }
        });
    }
}
loadEnvFile();

// Get the server-side API key from environment
const SERVER_API_KEY = process.env.DEVIN_API_KEY;

// Parse JSON bodies
app.use(express.json());

// Disable caching for JavaScript files to ensure fresh code is always loaded
app.use((req, res, next) => {
    if (req.path.endsWith('.js') || req.path.endsWith('.html')) {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
    }
    next();
});

// Serve static files from Source directory
app.use(express.static(path.join(__dirname, 'Source')));

// Status endpoint - check if API is configured server-side
app.get('/api/devin/_status', (req, res) => {
    const configured = !!SERVER_API_KEY && SERVER_API_KEY.length > 10;
    res.json({ 
        configured,
        mode: configured ? 'api' : 'simulation',
        message: configured ? 'Devin API Ready' : 'Simulation Mode'
    });
});

// Proxy endpoint for Devin API
// Frontend calls /api/devin/* and we forward to https://api.devin.ai/v1/*
app.all('/api/devin/*', async (req, res) => {
    const apiPath = req.params[0]; // Everything after /api/devin/
    const targetUrl = `${DEVIN_API_URL}/${apiPath}`;
    
    // Use server-side API key if available, otherwise fall back to request header
    const apiKey = SERVER_API_KEY || req.headers['x-devin-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
    
    if (!apiKey) {
        return res.status(401).json({ error: 'API key not configured. Create a .env file with DEVIN_API_KEY=your_key' });
    }

    try {
        const fetchOptions = {
            method: req.method,
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
        };

        // Include body for POST/PUT/PATCH requests
        if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
            fetchOptions.body = JSON.stringify(req.body);
        }

        console.log(`[Proxy] ${req.method} ${targetUrl}`);
        
        const response = await fetch(targetUrl, fetchOptions);
        const data = await response.json().catch(() => ({}));
        
        // Forward the status code and response
        res.status(response.status).json(data);
    } catch (error) {
        console.error('[Proxy Error]', error.message);
        res.status(500).json({ error: 'Proxy error', message: error.message });
    }
});

// Git pull endpoint - automatically pulls latest changes after Devin merge
app.post('/git-pull', async (req, res) => {
    console.log('[Git Pull] Starting automatic pull after PR merge...');

    try {
        // Pull from personal remote (where Devin merges PRs)
        const { stdout, stderr } = await execPromise('git pull personal cognition-dashboard-devin-integration --no-rebase');

        console.log('[Git Pull] Success!');
        if (stdout) console.log(stdout);
        if (stderr) console.log(stderr);

        res.json({
            success: true,
            message: 'Git pull successful',
            output: stdout + '\n' + stderr
        });
    } catch (error) {
        console.error('[Git Pull] Error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message,
            output: error.stdout + '\n' + error.stderr
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`\n  Experian Test Coverage Dashboard`);
    console.log(`  =================================`);
    console.log(`  Server running at http://localhost:${PORT}`);
    console.log(`  Dashboard: http://localhost:${PORT}/coverage-dashboard.html`);
    console.log(`\n  Devin API proxy available at /api/devin/*`);
    console.log(`  Press Ctrl+C to stop\n`);
});
