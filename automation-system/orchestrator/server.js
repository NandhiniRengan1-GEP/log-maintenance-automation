require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Service endpoints
const LLM1_URL = process.env.LLM1_URL || 'http://localhost:5001';
const LLM2_URL = process.env.LLM2_URL || 'http://localhost:5002';
const GITHUB_SERVICE_URL = process.env.GITHUB_SERVICE_URL || 'http://localhost:3005';

/**
 * Main orchestration endpoint
 * Coordinates the entire flow: UI -> LLM1 -> LLM2 -> GitHub PR
 */
app.post('/api/diagnose', async (req, res) => {
  try {
    const { transactionId, scopeId, docName, timeRange } = req.body;
    
    console.log('\n========================================');
    console.log('Starting diagnostic workflow...');
    console.log(`Transaction ID: ${transactionId || 'N/A'}`);
    console.log(`Scope ID: ${scopeId || 'N/A'}`);
    console.log(`Time Range: ${timeRange || '24h'}`);
    console.log('========================================\n');
    
    // Step 1: Call LLM1 for diagnostics
    console.log('[Step 1] Calling LLM1 Diagnostics Layer...');
    const diagnosticResponse = await axios.post(`${LLM1_URL}/diagnose`, {
      transactionId,
      scopeId,
      docName,
      timeRange: timeRange || '24h'
    });
    
    if (!diagnosticResponse.data.success) {
      return res.status(404).json({
        success: false,
        message: 'No error found for the given criteria',
        step: 'diagnostics'
      });
    }
    
    const diagnostic = diagnosticResponse.data.diagnostic;
    console.log('[Step 1] ✓ Diagnostic completed');
    console.log(`   Error: ${diagnostic.error.message}`);
    console.log(`   Category: ${diagnostic.error.category}`);
    console.log(`   Source: ${diagnostic.source.file}:${diagnostic.source.line}`);
    
    // Step 2: Call LLM2 for solution generation
    console.log('\n[Step 2] Calling LLM2 Solution Generator...');
    const solutionResponse = await axios.post(`${LLM2_URL}/generate-solution`, {
      diagnostic
    });
    
    const solution = solutionResponse.data;
    console.log(`[Step 2] ✓ Solution generated`);
    console.log(`   Solution Type: ${solution.solutionType}`);
    
    // Step 3: If code fix, create PR
    let prInfo = null;
    if (solution.solutionType === 'CODE_FIX') {
      console.log('\n[Step 3] Creating GitHub PR...');
      
      try {
        const prResponse = await axios.post(`${GITHUB_SERVICE_URL}/create-pr`, {
          repository: diagnostic.repository.repository,
          branch: diagnostic.repository.branch,
          fix: solution.fix,
          error: diagnostic.error
        });
        
        prInfo = prResponse.data;
        console.log('[Step 3] ✓ PR created successfully');
        console.log(`   PR URL: ${prInfo.prUrl}`);
      } catch (prError) {
        console.error('[Step 3] ⚠ PR creation failed:', prError.message);
        // Continue anyway, return fix without PR
      }
    } else {
      console.log('\n[Step 3] Skipping PR creation (Alert Suggestion)');
    }
    
    // Prepare final response
    const response = {
      success: true,
      transactionId,
      scopeId,
      solutionType: solution.solutionType,
      error: {
        message: diagnostic.error.message,
        type: diagnostic.error.type,
        category: diagnostic.error.category
      },
      context: {
        containerName: diagnostic.context.containerName,
        occurrenceCount: diagnostic.context.occurrenceCount,
        repository: diagnostic.repository.repository,
        sourceFile: diagnostic.source.file,
        sourceLine: diagnostic.source.line
      }
    };
    
    if (solution.solutionType === 'CODE_FIX') {
      response.fix = {
        file: solution.fix.file,
        explanation: solution.fix.explanation,
        originalCode: solution.fix.originalCode,
        fixedCode: solution.fix.fixedCode,
        pr: prInfo
      };
    } else {
      response.alert = solution.alert;
    }
    
    console.log('\n========================================');
    console.log('Workflow completed successfully!');
    console.log('========================================\n');
    
    res.json(response);
    
  } catch (error) {
    console.error('\n⚠ Error in orchestration:', error.message);
    
    res.status(500).json({
      success: false,
      error: error.message,
      details: (error.response && error.response.data) || null
    });
  }
});

/**
 * Get diagnostic history (mock)
 */
app.get('/api/history', (req, res) => {
  res.json({
    history: [
      {
        id: 1,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        transactionId: 'txn-seed-001',
        errorType: 'TypeError',
        solutionType: 'CODE_FIX',
        status: 'PR_CREATED'
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        transactionId: 'txn-seed-002',
        errorType: 'UnhandledPromiseRejection',
        solutionType: 'ALERT_SUGGESTION',
        status: 'ALERT_SENT'
      }
    ]
  });
});

/**
 * Health check
 */
app.get('/health', async (req, res) => {
  const services = {};
  
  try {
    await axios.get(`${LLM1_URL}/health`);
    services.llm1 = 'ok';
  } catch {
    services.llm1 = 'down';
  }
  
  try {
    await axios.get(`${LLM2_URL}/health`);
    services.llm2 = 'ok';
  } catch {
    services.llm2 = 'down';
  }
  
  const allHealthy = Object.values(services).every(status => status === 'ok');
  
  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'ok' : 'degraded',
    services
  });
});

app.listen(PORT, () => {
  console.log(`\n╔════════════════════════════════════════════════╗`);
  console.log(`║  Orchestrator Backend Running on port ${PORT}   ║`);
  console.log(`╚════════════════════════════════════════════════╝`);
  console.log(`\nEndpoints:`);
  console.log(`  POST /api/diagnose  - Main diagnostic workflow`);
  console.log(`  GET  /api/history   - Diagnostic history`);
  console.log(`  GET  /health        - Service health check\n`);
  console.log(`Connected Services:`);
  console.log(`  LLM1 (Diagnostics): ${LLM1_URL}`);
  console.log(`  LLM2 (Solution):    ${LLM2_URL}`);
  console.log(`  GitHub Service:     ${GITHUB_SERVICE_URL}\n`);
});

module.exports = app;
