# Project Summary: Log-Based Code Maintenance Automation

## Overview
This project demonstrates an end-to-end automated system for detecting, diagnosing, and fixing code issues based on runtime error logs. It simulates a production-like environment where errors are logged to New Relic, analyzed by AI-powered diagnostic systems, and automatically resolved through code fixes with GitHub PR creation.

## What This Project Contains

### 1. Mock Codebase (`mock-codebase/`)
A fully functional Express.js microservice API with **14 intentional bugs** across different categories:

**Error Types Included:**
- ✗ Null reference errors (accessing undefined properties)
- ✗ Unhandled promise rejections
- ✗ Division by zero errors
- ✗ Access control violations
- ✗ Database connection leaks
- ✗ Memory leaks (unclosed event listeners)
- ✗ Race conditions
- ✗ Type coercion errors
- ✗ SQL injection vulnerabilities
- ✗ Resource exhaustion (no pagination)
- ✗ Inconsistent state (missing transactions)
- ✗ Infinite loop potential

**Components:**
- 4 API routers (users, payments, orders, analytics)
- 4 service classes with business logic
- Test suite with 15+ test cases
- Error trigger script for testing
- New Relic instrumentation

### 2. New Relic Mock Service (`mock-services/newrelic-mock/`)
Simulates New Relic APM error logging and querying:
- Error storage with metadata
- NRQL-like query interface
- Pre-seeded with 3 example errors
- Transaction and scope-based filtering
- Time range queries

### 3. LLM1 Diagnostics Layer (`automation-system/llm1-diagnostics/`)
Python Flask service that retrieves and analyzes errors:

**Capabilities:**
- Fetches errors from New Relic by transaction ID or scope
- Extracts source file and line number from stack traces
- Retrieves pipeline information (Azure DevOps simulation)
- Identifies repository from service metadata
- Categorizes errors into fix types
- Compiles comprehensive diagnostic context

**Error Categories:**
- NULL_REFERENCE
- UNHANDLED_PROMISE
- MATH_ERROR
- ACCESS_CONTROL
- RESOURCE_LEAK
- TIMEOUT
- RUNTIME_ERROR

### 4. LLM2 Solution Generator (`automation-system/llm2-solution/`)
Python Flask service that generates fixes and alerts:

**Capabilities:**
- Analyzes diagnostic data to determine solution approach
- Generates code fixes with before/after comparisons
- Creates operational alert suggestions
- Provides detailed explanations
- Supports multiple fix patterns

**Fix Patterns:**
- Null checks before property access
- Promise chain to async/await conversion
- Division by zero validation
- Resource cleanup implementation

### 5. Orchestrator Backend (`automation-system/orchestrator/`)
Node.js Express service coordinating the entire workflow:

**Responsibilities:**
- Routes requests between UI and LLM services
- Manages the diagnostic workflow
- Aggregates responses
- Handles error scenarios
- Provides health monitoring

**Workflow Steps:**
1. Accept diagnostic request
2. Call LLM1 for error analysis
3. Call LLM2 for solution generation
4. Create GitHub PR if code fix
5. Return comprehensive response

### 6. GitHub PR Service (`automation-system/integrations/github-service/`)
Mock GitHub integration for automated PR creation:

**Features:**
- Creates pull requests with code fixes
- Generates detailed PR descriptions
- Manages PR lifecycle (open, merge, close)
- Tracks all created PRs
- Provides diff URLs

**PR Contents:**
- Error details and context
- Before/after code comparison
- Fix explanation
- Testing recommendations
- Automated labels

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Mock Codebase (Port 3001)                                  │
│  Express.js API with intentional bugs                       │
└────────────────────┬────────────────────────────────────────┘
                     │ Errors occur
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  New Relic Mock (Port 3002)                                 │
│  Error logging and storage                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Diagnostic Request
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Orchestrator (Port 3000)                                   │
│  Workflow coordination                                      │
└──────┬────────────────────────────────┬─────────────────────┘
       │                                │
       ▼                                ▼
┌──────────────────┐            ┌──────────────────────┐
│  LLM1 (5001)     │            │  LLM2 (5002)         │
│  Diagnostics     │────────────▶  Solution Gen        │
└──────────────────┘            └──────┬───────────────┘
                                       │
                                       ▼
                               ┌──────────────────┐
                               │  GitHub (3005)   │
                               │  PR Creation     │
                               └──────────────────┘
```

## File Structure

```
log-maintenance-automation/
├── README.md                          # Main project documentation
├── start-all.ps1                      # PowerShell startup script
├── test-system.ps1                    # PowerShell test script
│
├── docs/
│   ├── QUICKSTART.md                  # Getting started guide
│   ├── ARCHITECTURE.md                # Detailed architecture
│   └── API-EXAMPLES.md                # API usage examples
│
├── mock-codebase/                     # Sample app with bugs
│   ├── package.json
│   ├── newrelic.js                    # New Relic config
│   ├── .env                           # Environment variables
│   ├── src/
│   │   ├── index.js                   # Main server
│   │   ├── api/                       # API routes
│   │   │   ├── users.js               # User endpoints (5 bugs)
│   │   │   ├── payments.js            # Payment endpoints (4 bugs)
│   │   │   ├── orders.js              # Order endpoints (3 bugs)
│   │   │   └── analytics.js           # Analytics endpoints (2 bugs)
│   │   ├── services/                  # Business logic
│   │   │   ├── userService.js
│   │   │   ├── paymentService.js
│   │   │   ├── orderService.js
│   │   │   └── analyticsService.js
│   │   └── utils/
│   │       └── validators.js          # Validation utilities
│   ├── tests/                         # Test suites
│   │   ├── users.test.js
│   │   ├── payments.test.js
│   │   └── orders.test.js
│   └── scripts/
│       └── trigger-errors.js          # Error trigger script
│
├── mock-services/
│   └── newrelic-mock/                 # New Relic simulation
│       ├── package.json
│       └── server.js                  # Mock NR server
│
└── automation-system/
    ├── llm1-diagnostics/              # Error analysis
    │   ├── requirements.txt
    │   ├── .env
    │   └── app.py                     # Diagnostic engine
    │
    ├── llm2-solution/                 # Fix generation
    │   ├── requirements.txt
    │   ├── .env
    │   └── app.py                     # Solution engine
    │
    ├── orchestrator/                  # Backend coordinator
    │   ├── package.json
    │   ├── .env
    │   └── server.js                  # Orchestration logic
    │
    └── integrations/
        └── github-service/            # PR automation
            ├── package.json
            ├── .env
            └── server.js              # GitHub integration
```

## Key Features

### ✅ End-to-End Automation
Complete workflow from error detection to PR creation without manual intervention.

### ✅ Multiple Error Categories
Handles various error types with appropriate solutions (code fixes or alerts).

### ✅ Intelligent Analysis
Categorizes errors and determines the best remediation approach.

### ✅ Code Fix Generation
Automatically generates working code fixes with explanations.

### ✅ GitHub Integration
Creates properly formatted pull requests with detailed descriptions.

### ✅ Context Gathering
Retrieves container, pipeline, and repository information automatically.

### ✅ Mock External Services
Simulates New Relic, Azure DevOps, and GitHub for demonstration.

### ✅ Comprehensive Testing
Includes test suite and automated testing scripts.

## Technology Stack

### Backend Services
- **Node.js** (Express.js) - Orchestrator, GitHub service, New Relic mock, Mock codebase
- **Python** (Flask) - LLM1 and LLM2 services

### Libraries & Tools
- **axios** - HTTP client for service communication
- **requests** - Python HTTP library
- **dotenv** - Environment configuration
- **cors** - Cross-origin resource sharing
- **uuid** - Unique identifier generation

### Testing
- **Jest** - JavaScript testing framework
- **Supertest** - HTTP assertion library
- **PowerShell** - Automated testing scripts

## Usage Scenarios

### Scenario 1: Diagnose Null Reference Error
```
Input: transactionId = "txn-seed-001"
Process: 
  1. Retrieve error from New Relic
  2. Identify source file: src/api/users.js
  3. Generate null check fix
  4. Create PR with fix
Output: PR URL with code fix
```

### Scenario 2: Handle Infrastructure Issue
```
Input: scopeId = "payment-service-prod"
Process:
  1. Retrieve timeout errors
  2. Analyze occurrence pattern
  3. Determine infrastructure issue
  4. Generate alert suggestion
Output: Operational recommendations
```

### Scenario 3: Batch Error Analysis
```
Input: timeRange = "24h", scopeId = "user-service-prod"
Process:
  1. Find most recent error
  2. Full diagnostic analysis
  3. Generate appropriate solution
Output: Fix or alert based on error type
```

## Ports Used

- **3000** - Orchestrator Backend
- **3001** - Mock Codebase API
- **3002** - New Relic Mock Service
- **3005** - GitHub PR Service
- **5001** - LLM1 Diagnostics
- **5002** - LLM2 Solution Generator

## Quick Start

### Install Dependencies
```powershell
# Node.js services
cd mock-codebase; npm install
cd ..\mock-services\newrelic-mock; npm install
cd ..\..\automation-system\orchestrator; npm install
cd ..\integrations\github-service; npm install

# Python services
cd ..\llm1-diagnostics; pip install -r requirements.txt
cd ..\llm2-solution; pip install -r requirements.txt
```

### Start All Services
```powershell
.\start-all.ps1
```

### Run Tests
```powershell
.\test-system.ps1
```

## Sample Output

When you diagnose an error, you get:

```json
{
  "success": true,
  "solutionType": "CODE_FIX",
  "error": {
    "message": "TypeError: Cannot read property 'id' of undefined",
    "type": "TypeError",
    "category": "NULL_REFERENCE"
  },
  "context": {
    "containerName": "user-service-pod-7f8b9c",
    "occurrenceCount": 47,
    "repository": "company/user-service",
    "sourceFile": "src/api/users.js",
    "sourceLine": "11"
  },
  "fix": {
    "file": "src/api/users.js",
    "explanation": "Added null/undefined check before accessing properties",
    "originalCode": "...",
    "fixedCode": "...",
    "pr": {
      "prNumber": 123,
      "prUrl": "https://github.com/company/user-service/pull/123"
    }
  }
}
```

## Extensibility

This system can be extended with:
- Real New Relic API integration
- Actual GitHub repository access
- Azure DevOps pipeline integration
- AI-powered code analysis (OpenAI, etc.)
- Web dashboard UI
- Slack/Teams notifications
- Additional error categories
- Multi-language support

## Educational Value

This project demonstrates:
1. Microservices architecture
2. Service orchestration patterns
3. Error handling strategies
4. Automated code analysis
5. CI/CD integration concepts
6. API design and integration
7. Mock service development
8. Test-driven development

## Next Steps

To make this production-ready:
1. Replace mock services with real integrations
2. Add authentication and authorization
3. Implement proper error handling and retries
4. Add monitoring and alerting
5. Create web UI dashboard
6. Implement rate limiting
7. Add database persistence
8. Deploy to cloud infrastructure
9. Add comprehensive logging
10. Implement CI/CD pipeline

## License
MIT

## Author
Created as a demonstration of automated log-based code maintenance systems.
