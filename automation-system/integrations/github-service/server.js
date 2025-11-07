require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { Octokit } = require('@octokit/rest');

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());

// GitHub Configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.TARGET_GITHUB_OWNER || process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.TARGET_GITHUB_REPO || 'user-service';

// Initialize Octokit
const octokit = GITHUB_TOKEN ? new Octokit({ auth: GITHUB_TOKEN }) : null;

// Mock PR storage (fallback when no token)
let pullRequests = [];

// Check GitHub configuration
const isGitHubConfigured = () => {
  return !!(GITHUB_TOKEN && GITHUB_OWNER && GITHUB_REPO);
};

/**
 * Create a Pull Request with code fix
 */
app.post('/create-pr', async (req, res) => {
  try {
    const { repository, branch, fix, error } = req.body;
    
    if (!repository || !fix) {
      return res.status(400).json({
        success: false,
        message: 'Repository and fix data required'
      });
    }
    
    // Generate PR details
    const prBranch = `fix/${error.category.toLowerCase()}-${Date.now()}`;
    const baseBranch = branch || 'main';
    
    // Try to create real GitHub PR if configured
    if (isGitHubConfigured()) {
      try {
        const realPR = await createRealGitHubPR({
          owner: GITHUB_OWNER,
          repo: GITHUB_REPO,
          baseBranch,
          headBranch: prBranch,
          title: generatePRTitle(error),
          description: generatePRDescription(error, fix),
          file: fix.file,
          originalCode: fix.originalCode,
          fixedCode: fix.fixedCode,
          error
        });
        
        return res.json({
          success: true,
          mode: 'REAL_GITHUB',
          prNumber: realPR.number,
          prUrl: realPR.html_url,
          diffUrl: `${realPR.html_url}/files`,
          branch: prBranch,
          details: {
            id: realPR.id,
            number: realPR.number,
            repository: `${GITHUB_OWNER}/${GITHUB_REPO}`,
            title: realPR.title,
            state: realPR.state,
            createdAt: realPR.created_at,
            prUrl: realPR.html_url
          }
        });
      } catch (githubError) {
        console.error('GitHub API error, falling back to mock:', githubError.message);
        // Fall through to mock PR creation
      }
    }
    
    // Fallback: Create mock PR
    const prNumber = Math.floor(Math.random() * 900) + 100;
    
    const pr = {
      id: uuidv4(),
      number: prNumber,
      repository: repository || `${GITHUB_OWNER}/${GITHUB_REPO}`,
      baseBranch,
      headBranch: prBranch,
      title: generatePRTitle(error),
      description: generatePRDescription(error, fix),
      files: [
        {
          path: fix.file,
          additions: countLines(fix.fixedCode),
          deletions: countLines(fix.originalCode),
          changes: {
            original: fix.originalCode,
            fixed: fix.fixedCode
          }
        }
      ],
      labels: ['automated-fix', 'bug', error.category.toLowerCase()],
      status: 'open',
      createdAt: new Date().toISOString(),
      createdBy: 'log-maintenance-bot',
      prUrl: `https://github.com/${repository}/pull/${prNumber}`,
      diffUrl: `https://github.com/${repository}/pull/${prNumber}/files`
    };
    
    pullRequests.push(pr);
    
    console.log(`\n✓ Mock PR Created: ${pr.prUrl}`);
    console.log(`  Title: ${pr.title}`);
    console.log(`  Branch: ${pr.headBranch} -> ${pr.baseBranch}`);
    console.log(`  Files changed: ${pr.files.length}\n`);
    
    res.json({
      success: true,
      mode: 'MOCK',
      prNumber: pr.number,
      prUrl: pr.prUrl,
      diffUrl: pr.diffUrl,
      branch: prBranch,
      details: pr
    });
    
  } catch (error) {
    console.error('Error creating PR:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get PR by ID or number
 */
app.get('/pr/:identifier', (req, res) => {
  const { identifier } = req.params;
  
  const pr = pullRequests.find(p => 
    p.id === identifier || p.number === parseInt(identifier)
  );
  
  if (!pr) {
    return res.status(404).json({
      success: false,
      message: 'PR not found'
    });
  }
  
  res.json(pr);
});

/**
 * List all PRs
 */
app.get('/prs', (req, res) => {
  const { repository, status } = req.query;
  
  let filtered = pullRequests;
  
  if (repository) {
    filtered = filtered.filter(pr => pr.repository === repository);
  }
  
  if (status) {
    filtered = filtered.filter(pr => pr.status === status);
  }
  
  res.json({
    count: filtered.length,
    pullRequests: filtered
  });
});

/**
 * Merge a PR (mock)
 */
app.post('/pr/:id/merge', (req, res) => {
  const { id } = req.params;
  
  const pr = pullRequests.find(p => p.id === id);
  
  if (!pr) {
    return res.status(404).json({
      success: false,
      message: 'PR not found'
    });
  }
  
  if (pr.status !== 'open') {
    return res.status(400).json({
      success: false,
      message: 'PR is not open'
    });
  }
  
  pr.status = 'merged';
  pr.mergedAt = new Date().toISOString();
  
  console.log(`✓ PR #${pr.number} merged`);
  
  res.json({
    success: true,
    message: 'PR merged successfully',
    pr
  });
});

/**
 * Close a PR (mock)
 */
app.post('/pr/:id/close', (req, res) => {
  const { id } = req.params;
  
  const pr = pullRequests.find(p => p.id === id);
  
  if (!pr) {
    return res.status(404).json({
      success: false,
      message: 'PR not found'
    });
  }
  
  pr.status = 'closed';
  pr.closedAt = new Date().toISOString();
  
  res.json({
    success: true,
    message: 'PR closed',
    pr
  });
});

/**
 * Health check
 */
app.get('/health', (req, res) => {
  const configured = isGitHubConfigured();
  res.json({
    status: 'ok',
    service: 'github-pr-service',
    mode: configured ? 'REAL_GITHUB' : 'MOCK',
    github: {
      configured,
      owner: configured ? GITHUB_OWNER : null,
      repo: configured ? GITHUB_REPO : null,
      hasToken: !!GITHUB_TOKEN
    },
    prs: {
      total: pullRequests.length,
      open: pullRequests.filter(pr => pr.status === 'open').length,
      merged: pullRequests.filter(pr => pr.status === 'merged').length
    }
  });
});

// Helper functions

/**
 * Create actual GitHub PR using Octokit
 */
async function createRealGitHubPR(options) {
  const { owner, repo, baseBranch, headBranch, title, description, file, originalCode, fixedCode, error } = options;
  
  console.log(`\n🔄 Creating REAL GitHub PR...`);
  console.log(`   Repository: ${owner}/${repo}`);
  console.log(`   Branch: ${headBranch} -> ${baseBranch}`);
  
  try {
    // 1. Get reference to base branch
    const { data: ref } = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${baseBranch}`
    });
    
    const baseSha = ref.object.sha;
    console.log(`   ✓ Got base branch SHA: ${baseSha.substring(0, 7)}`);
    
    // 2. Create new branch
    await octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${headBranch}`,
      sha: baseSha
    });
    console.log(`   ✓ Created branch: ${headBranch}`);
    
    // 3. Get current file (if it exists)
    let currentFileSha;
    try {
      const { data: currentFile } = await octokit.repos.getContent({
        owner,
        repo,
        path: file,
        ref: baseBranch
      });
      currentFileSha = currentFile.sha;
    } catch (e) {
      // File doesn't exist, will create new
      currentFileSha = null;
    }
    
    // 4. Update file with fix
    const content = Buffer.from(fixedCode).toString('base64');
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: file,
      message: `Fix: ${error.type} - ${error.category}`,
      content,
      branch: headBranch,
      sha: currentFileSha
    });
    console.log(`   ✓ Updated file: ${file}`);
    
    // 5. Create Pull Request
    const { data: pr } = await octokit.pulls.create({
      owner,
      repo,
      title,
      body: description,
      head: headBranch,
      base: baseBranch
    });
    console.log(`   ✓ PR Created: ${pr.html_url}`);
    
    // 6. Add labels
    try {
      await octokit.issues.addLabels({
        owner,
        repo,
        issue_number: pr.number,
        labels: ['automated-fix', 'bug']
      });
      console.log(`   ✓ Labels added`);
    } catch (labelError) {
      console.log(`   ⚠ Could not add labels (labels may not exist)`);
    }
    
    console.log(`\n✅ REAL GitHub PR created successfully!\n`);
    return pr;
    
  } catch (error) {
    console.error(`\n❌ GitHub API Error:`, error.message);
    throw error;
  }
}

function generatePRTitle(error) {
  const category = error.category.toLowerCase().replace(/_/g, ' ');
  const errorType = error.type || 'Error';
  
  return `Fix: ${errorType} - ${category}`;
}

function generatePRDescription(error, fix) {
  return `## Automated Fix Generated by Log Maintenance System

### Error Details
- **Type**: ${error.type}
- **Category**: ${error.category}
- **Message**: ${error.message}

### Fix Applied
${fix.explanation}

### Changes Made
**File**: \`${fix.file}\`${fix.line ? ` (Line ${fix.line})` : ''}

#### Before:
\`\`\`javascript
${fix.originalCode}
\`\`\`

#### After:
\`\`\`javascript
${fix.fixedCode}
\`\`\`

### Testing
Please review the changes and run the following tests:
- Unit tests for the affected component
- Integration tests if applicable
- Manual verification in staging environment

### Labels
${['automated-fix', 'bug', error.category.toLowerCase()].map(l => `- \`${l}\``).join('\n')}

---
*This PR was automatically generated by the Log Maintenance Automation System*`;
}

function countLines(code) {
  if (!code) return 0;
  return code.split('\n').length;
}

app.listen(PORT, () => {
  console.log(`\n╔════════════════════════════════════════════════╗`);
  console.log(`║  GitHub PR Service Running on port ${PORT}     ║`);
  console.log(`╚════════════════════════════════════════════════╝`);
  console.log(`\nEndpoints:`);
  console.log(`  POST /create-pr       - Create new PR with fix`);
  console.log(`  GET  /pr/:id          - Get PR details`);
  console.log(`  GET  /prs             - List all PRs`);
  console.log(`  POST /pr/:id/merge    - Merge PR`);
  console.log(`  POST /pr/:id/close    - Close PR`);
  console.log(`  GET  /health          - Service health\n`);
});

module.exports = app;
