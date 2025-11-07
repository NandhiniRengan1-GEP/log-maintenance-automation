# Quick Start Guide

## Overview

This project demonstrates an automated log-based code maintenance system that:
1. Detects errors from New Relic logs
2. Analyzes errors and gathers context
3. Generates code fixes
4. Creates GitHub pull requests automatically

## System Components

### 1. Mock Codebase (Port 3001)
A sample Express.js service with intentional bugs:
- Null reference errors
- Unhandled promise rejections
- Division by zero errors
- Access control issues
- Resource leaks

### 2. New Relic Mock Service (Port 3002)
Simulates New Relic error logging and retrieval

### 3. LLM1 Diagnostics Layer (Port 5001)
Python Flask service that:
- Retrieves errors from New Relic
- Gathers container, pipeline, and repository context
- Categorizes errors

### 4. LLM2 Solution Generator (Port 5002)
Python Flask service that:
- Analyzes errors
- Generates code fixes
- Provides operational alerts

### 5. Orchestrator Backend (Port 3000)
Node.js Express service that coordinates the workflow

### 6. GitHub PR Service (Port 3005)
Creates and manages pull requests with code fixes

## Installation

### Step 1: Install Node.js Dependencies

```powershell
# Mock Codebase
cd mock-codebase
npm install

# New Relic Mock
cd ..\mock-services\newrelic-mock
npm install

# Orchestrator
cd ..\..\automation-system\orchestrator
npm install

# GitHub Service
cd ..\integrations\github-service
npm install
```

### Step 2: Install Python Dependencies

```powershell
# LLM1 Diagnostics
cd ..\..\automation-system\llm1-diagnostics
pip install -r requirements.txt

# LLM2 Solution
cd ..\llm2-solution
pip install -r requirements.txt
```

## Running the System

### Option 1: Manual Start (Each in separate terminal)

**Terminal 1 - New Relic Mock:**
```powershell
cd mock-services\newrelic-mock
npm start
```

**Terminal 2 - LLM1 Diagnostics:**
```powershell
cd automation-system\llm1-diagnostics
python app.py
```

**Terminal 3 - LLM2 Solution:**
```powershell
cd automation-system\llm2-solution
python app.py
```

**Terminal 4 - GitHub Service:**
```powershell
cd automation-system\integrations\github-service
npm start
```

**Terminal 5 - Orchestrator:**
```powershell
cd automation-system\orchestrator
npm start
```

**Terminal 6 - Mock Codebase (optional - for testing):**
```powershell
cd mock-codebase
npm start
```

### Option 2: Start Script (Coming Soon)
A PowerShell script to start all services will be provided.

## Testing the System

### Test 1: Diagnose Pre-seeded Error

```powershell
# Use PowerShell to test the API
$body = @{
    transactionId = "txn-seed-001"
    timeRange = "24h"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/diagnose" -Method POST -Body $body -ContentType "application/json"
```

Expected output:
- Error details
- Code fix
- PR URL

### Test 2: Diagnose by Scope

```powershell
$body = @{
    scopeId = "payment-service-prod"
    timeRange = "24h"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/diagnose" -Method POST -Body $body -ContentType "application/json"
```

### Test 3: View All Errors in New Relic

```powershell
Invoke-RestMethod -Uri "http://localhost:3002/api/errors" -Method GET
```

### Test 4: View Created PRs

```powershell
Invoke-RestMethod -Uri "http://localhost:3005/prs" -Method GET
```

## Example Workflow

1. **Error occurs** in mock codebase (or use pre-seeded errors)
2. **Error logged** to New Relic Mock
3. **User requests diagnosis** via orchestrator API:
   ```
   POST /api/diagnose
   {
     "transactionId": "txn-seed-001",
     "timeRange": "24h"
   }
   ```
4. **LLM1 retrieves** error from New Relic and gathers context
5. **LLM2 generates** code fix or alert suggestion
6. **GitHub service creates** PR with fix
7. **Response returned** with fix details and PR URL

## API Endpoints

### Orchestrator (http://localhost:3000)
- `POST /api/diagnose` - Start diagnostic workflow
- `GET /api/history` - View diagnostic history
- `GET /health` - Check service health

### New Relic Mock (http://localhost:3002)
- `POST /api/nrql/query` - Query errors
- `GET /api/errors/transaction/:id` - Get error by transaction
- `GET /api/errors/scope/:id` - Get errors by scope
- `GET /api/errors` - List all errors

### LLM1 Diagnostics (http://localhost:5001)
- `POST /diagnose` - Get diagnostic analysis
- `GET /health` - Health check

### LLM2 Solution (http://localhost:5002)
- `POST /generate-solution` - Generate fix or alert
- `GET /health` - Health check

### GitHub Service (http://localhost:3005)
- `POST /create-pr` - Create pull request
- `GET /prs` - List all PRs
- `GET /pr/:id` - Get PR details
- `POST /pr/:id/merge` - Merge PR

## Troubleshooting

### Services won't start
- Check if ports are already in use
- Ensure all dependencies are installed
- Check .env files are present

### Python errors
- Ensure Python 3.9+ is installed
- Activate virtual environment if using one
- Install dependencies: `pip install -r requirements.txt`

### No errors found
- Check New Relic mock is running on port 3002
- Verify pre-seeded errors: `http://localhost:3002/api/errors`
- Use correct transactionId or scopeId

## Sample Errors Included

1. **NULL_REFERENCE** - `txn-seed-001`
   - User service null reference error
   - File: `src/api/users.js`

2. **UNHANDLED_PROMISE** - `txn-seed-002`
   - Payment service promise rejection
   - File: `src/services/paymentService.js`

3. **RESOURCE_LEAK** - `txn-seed-003`
   - Database connection not closed
   - File: `src/services/userService.js`

## Next Steps

1. Integrate with real New Relic API
2. Connect to actual GitHub repositories
3. Add Azure DevOps pipeline integration
4. Implement AI-powered code analysis
5. Add web UI dashboard
6. Implement notification system
