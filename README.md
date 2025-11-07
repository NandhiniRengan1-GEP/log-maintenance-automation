# Log-Based Code Maintenance Automation System

An intelligent system that automatically detects runtime errors from New Relic logs, analyzes the root cause, and generates code fixes with automated PR creation.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          UI Layer                                │
│  Input: transactionId/scopeId, docName, timeRange               │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Backend Orchestrator                           │
│  Routes requests between LLM1 ↔ LLM2                            │
└──────────────────────┬──────────────────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
┌──────────────────┐      ┌──────────────────────┐
│  LLM1 Layer      │      │  LLM2 Layer          │
│  (Diagnostics)   │──────▶  (Solution Gen)      │
│                  │      │                      │
│ - New Relic MCP  │      │ - Error Analysis     │
│ - Azure MCP      │      │ - Code Fix Gen       │
│ - GitHub MCP     │      │ - PR Creation        │
└──────────────────┘      └──────────────────────┘
```

## Project Structure

```
log-maintenance-automation/
├── mock-codebase/              # Sample application with intentional bugs
│   ├── src/
│   │   ├── api/                # API endpoints with issues
│   │   ├── services/           # Business logic services
│   │   └── utils/              # Utility functions
│   ├── tests/                  # Test files with failing cases
│   └── package.json
├── automation-system/          # The automation engine
│   ├── llm1-diagnostics/       # Error retrieval and context gathering
│   ├── llm2-solution/          # Code analysis and fix generation
│   ├── orchestrator/           # Backend API coordinator
│   └── integrations/           # New Relic, GitHub, Azure MCPs
├── mock-services/              # Mocked external services
│   ├── newrelic-mock/          # Mock New Relic logs
│   └── pipeline-mock/          # Mock Azure pipeline data
└── docs/                       # Documentation
```

## Features

1. **Error Detection**: Monitors New Relic for runtime errors
2. **Context Gathering**: Retrieves container, pipeline, and repository info
3. **Intelligent Analysis**: Determines if issue requires code fix or alert
4. **Automated Fixes**: Generates code patches for fixable issues
5. **PR Creation**: Automatically creates pull requests with fixes
6. **Alert Suggestions**: Provides operational recommendations for non-code issues

## Setup Instructions

### Prerequisites
- Node.js 18+
- Python 3.9+
- Git

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   cd mock-codebase && npm install
   cd ../automation-system && npm install
   cd llm1-diagnostics && pip install -r requirements.txt
   cd ../llm2-solution && pip install -r requirements.txt
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configurations
   ```

### Running the System

1. Start the mock codebase (with errors):
   ```bash
   cd mock-codebase
   npm start
   ```

2. Trigger errors to log to New Relic:
   ```bash
   npm run trigger-errors
   ```

3. Start the automation system:
   ```bash
   cd automation-system/orchestrator
   npm start
   ```

4. Access the UI at `http://localhost:3000`

## Usage Example

```javascript
// Request to diagnose and fix
POST /api/diagnose
{
  "transactionId": "txn-12345",
  "docName": "user-service-errors",
  "timeRange": "24h"
}

// Response
{
  "type": "CODE_FIX",
  "error": "TypeError: Cannot read property 'id' of undefined",
  "containerName": "user-service-prod",
  "occurrenceCount": 47,
  "gitRepo": "company/user-service",
  "fix": {
    "file": "src/api/users.js",
    "code": "...",
    "prUrl": "https://github.com/company/user-service/pull/123"
  }
}
```

## Mock Issues Included

1. **Runtime Error**: Null reference exception in user validation
2. **Server Error**: Unhandled promise rejection in payment processing
3. **Access Error**: Permission denied when accessing database
4. **Memory Leak**: Unclosed database connections

## License

MIT
