# Architecture Overview

## System Architecture

The Log-Based Code Maintenance Automation system follows a layered architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────────┐
│                          Client/UI Layer                         │
│  (Future: Web Dashboard, CLI, IDE Integration)                  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Orchestrator Backend                          │
│  Port: 3000                                                      │
│  - Request routing and coordination                              │
│  - Workflow management                                           │
│  - Response aggregation                                          │
└──────────────┬────────────────────────┬─────────────────────────┘
               │                        │
               ▼                        ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│   LLM1 Diagnostics       │  │   LLM2 Solution Gen      │
│   Port: 5001             │  │   Port: 5002             │
│                          │  │                          │
│  - Error retrieval       │  │  - Error analysis        │
│  - Context gathering     │  │  - Code fix generation   │
│  - Categorization        │──▶  - Alert suggestions     │
└────────┬─────────────────┘  └───────────┬──────────────┘
         │                                 │
         ▼                                 ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│  External Services/MCPs  │  │  GitHub Integration      │
│                          │  │  Port: 3005              │
│  - New Relic (3002)      │  │                          │
│  - Azure DevOps (3003)   │  │  - PR creation           │
│  - GitHub API (3004)     │  │  - Code commits          │
└──────────────────────────┘  └──────────────────────────┘
```

## Data Flow

### 1. Error Detection & Logging
```
Mock Codebase → Error Occurs → New Relic Mock → Error Storage
```

### 2. Diagnostic Request
```
Client → Orchestrator
         ↓
         Request Parameters:
         - transactionId / scopeId
         - timeRange
         - docName (optional)
```

### 3. Error Retrieval & Context Gathering (LLM1)
```
Orchestrator → LLM1 Diagnostics
               ↓
               New Relic MCP: Fetch error details
               ↓
               Azure MCP: Get pipeline info
               ↓
               GitHub MCP: Identify repository
               ↓
               Extract source location from stack trace
               ↓
               Return diagnostic context
```

### 4. Solution Generation (LLM2)
```
Orchestrator → LLM2 Solution
               ↓
               Analyze error category
               ↓
               Decision: Code Fix or Alert?
               ↓
       ┌───────┴───────┐
       ▼               ▼
   Code Fix      Alert Suggestion
   - Get code    - Generate operational
   - Generate      recommendations
     fix         - Define priorities
   - Create
     diff
```

### 5. PR Creation (if Code Fix)
```
Orchestrator → GitHub Service
               ↓
               Create branch
               ↓
               Generate PR description
               ↓
               Apply code changes
               ↓
               Create Pull Request
               ↓
               Return PR URL
```

### 6. Response to Client
```
Orchestrator → Client
               ↓
               {
                 error: {...},
                 context: {...},
                 fix: {...} OR alert: {...},
                 pr: {...}
               }
```

## Component Responsibilities

### Orchestrator Backend (Node.js/Express)
**Responsibilities:**
- Accept and validate client requests
- Coordinate workflow between LLM1 and LLM2
- Manage error handling and retries
- Aggregate responses
- Maintain request history

**Technology:** Node.js, Express, Axios

### LLM1 Diagnostics Layer (Python/Flask)
**Responsibilities:**
- Retrieve errors from New Relic MCP
- Extract error metadata (message, type, stack trace)
- Parse source file and line number
- Fetch pipeline information from Azure
- Identify repository from GitHub
- Categorize error type
- Compile comprehensive diagnostic context

**Technology:** Python, Flask, Requests

**Key Functions:**
- `fetch_error_from_newrelic()` - Query New Relic
- `fetch_pipeline_info()` - Get Azure pipeline data
- `fetch_repository_info()` - Identify Git repo
- `extract_source_location()` - Parse stack trace
- `categorize_error()` - Classify error type

### LLM2 Solution Generator (Python/Flask)
**Responsibilities:**
- Analyze diagnostic data
- Determine if code fix or alert is appropriate
- Generate code fixes for fixable errors
- Create operational alerts for infrastructure issues
- Provide detailed explanations

**Technology:** Python, Flask

**Key Functions:**
- `analyze_error()` - Determine solution type
- `generate_code_fix()` - Create code patches
- `generate_alert_suggestion()` - Operational recommendations
- `fix_null_reference()` - Specific fix patterns
- `fix_unhandled_promise()` - Promise handling fixes

### GitHub PR Service (Node.js/Express)
**Responsibilities:**
- Create pull requests with code fixes
- Generate PR titles and descriptions
- Format code diffs
- Manage PR lifecycle (merge, close)
- Track PR status

**Technology:** Node.js, Express

### New Relic Mock Service (Node.js/Express)
**Responsibilities:**
- Simulate New Relic error logging
- Store error records with metadata
- Provide query interface (NRQL-like)
- Support filtering by time range, scope, transaction

**Technology:** Node.js, Express

## Error Categories

| Category | Description | Solution Type | Example |
|----------|-------------|---------------|---------|
| NULL_REFERENCE | Accessing properties of undefined/null | Code Fix | `user.id` when user is undefined |
| UNHANDLED_PROMISE | Promise rejections without .catch() | Code Fix | Missing error handling in async code |
| MATH_ERROR | Division by zero, NaN results | Code Fix | Average calculation with empty array |
| ACCESS_CONTROL | Permission/authorization failures | Alert | Accessing data without auth check |
| RESOURCE_LEAK | Unclosed connections, memory leaks | Alert + Code Fix | Database connections not closed |
| TIMEOUT | External service timeouts | Alert | Payment gateway timeout |
| RUNTIME_ERROR | General runtime errors | Manual Review | Complex logic errors |

## Communication Protocols

### Between Orchestrator and LLM Services
**Protocol:** HTTP/REST
**Format:** JSON

**Example Request to LLM1:**
```json
{
  "transactionId": "txn-001",
  "scopeId": "user-service-prod",
  "timeRange": "24h"
}
```

**Example Response from LLM1:**
```json
{
  "success": true,
  "diagnostic": {
    "error": {
      "message": "TypeError: Cannot read property 'id' of undefined",
      "type": "TypeError",
      "category": "NULL_REFERENCE"
    },
    "context": {
      "containerName": "user-service-pod-7f8b9c",
      "occurrenceCount": 47
    },
    "repository": {
      "repository": "company/user-service",
      "branch": "main"
    },
    "source": {
      "file": "src/api/users.js",
      "line": "11"
    }
  }
}
```

## Security Considerations

### Current Implementation (Mock/Demo)
- No authentication required
- Mock data only
- Local development environment

### Production Requirements
1. **Authentication & Authorization**
   - OAuth 2.0 for API access
   - Service-to-service authentication
   - Role-based access control

2. **Secrets Management**
   - Secure storage of API keys
   - GitHub tokens in vault
   - New Relic license keys encrypted

3. **Code Review**
   - All automated PRs require review
   - Automated tests must pass
   - Security scans before merge

4. **Audit Logging**
   - Track all diagnostic requests
   - Log all PR creations
   - Monitor error patterns

## Scalability

### Horizontal Scaling
- Orchestrator: Load balanced instances
- LLM services: Multiple workers
- Database: Distributed error storage

### Performance Optimization
- Cache diagnostic results
- Batch similar errors
- Async processing for PRs
- Rate limiting for external APIs

## Extension Points

1. **Additional MCP Servers**
   - Datadog integration
   - Sentry error tracking
   - AWS CloudWatch logs

2. **Enhanced Code Analysis**
   - Static code analysis integration
   - AI-powered fix suggestions
   - Test generation

3. **Notification System**
   - Slack/Teams notifications
   - Email alerts
   - PagerDuty integration

4. **Web Dashboard**
   - Real-time error monitoring
   - Fix history visualization
   - PR success metrics
