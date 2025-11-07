# API Examples and Request Collection

This file contains example API requests for testing the Log Maintenance Automation System.

## Prerequisites
All services must be running on their default ports.

---

## 1. Health Checks

### Orchestrator Health Check
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/health" -Method GET
```

### New Relic Mock Health
```powershell
Invoke-RestMethod -Uri "http://localhost:3002/api/errors" -Method GET
```

### LLM1 Diagnostics Health
```powershell
Invoke-RestMethod -Uri "http://localhost:5001/health" -Method GET
```

### LLM2 Solution Health
```powershell
Invoke-RestMethod -Uri "http://localhost:5002/health" -Method GET
```

### GitHub Service Health
```powershell
Invoke-RestMethod -Uri "http://localhost:3005/health" -Method GET
```

---

## 2. Diagnostic Requests

### Example 1: Diagnose NULL_REFERENCE Error
```powershell
$body = @{
    transactionId = "txn-seed-001"
    timeRange = "24h"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/diagnose" `
                               -Method POST `
                               -Body $body `
                               -ContentType "application/json"

$response | ConvertTo-Json -Depth 10
```

**Expected Result:**
- Error type: TypeError
- Category: NULL_REFERENCE
- Solution: Code Fix
- PR Created: Yes

### Example 2: Diagnose UNHANDLED_PROMISE Error
```powershell
$body = @{
    transactionId = "txn-seed-002"
    timeRange = "24h"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/diagnose" `
                               -Method POST `
                               -Body $body `
                               -ContentType "application/json"

$response | ConvertTo-Json -Depth 10
```

**Expected Result:**
- Error type: UnhandledPromiseRejection
- Category: UNHANDLED_PROMISE or TIMEOUT
- Solution: Code Fix or Alert Suggestion

### Example 3: Diagnose by Scope/Service
```powershell
$body = @{
    scopeId = "user-service-prod"
    timeRange = "24h"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/diagnose" `
                               -Method POST `
                               -Body $body `
                               -ContentType "application/json"

$response | ConvertTo-Json -Depth 10
```

### Example 4: Diagnose Recent Errors (Last 1 hour)
```powershell
$body = @{
    scopeId = "payment-service-prod"
    timeRange = "1h"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/diagnose" `
                               -Method POST `
                               -Body $body `
                               -ContentType "application/json"

$response | ConvertTo-Json -Depth 10
```

---

## 3. New Relic Mock Queries

### Get All Errors
```powershell
Invoke-RestMethod -Uri "http://localhost:3002/api/errors" -Method GET
```

### Get Error by Transaction ID
```powershell
Invoke-RestMethod -Uri "http://localhost:3002/api/errors/transaction/txn-seed-001" -Method GET
```

### Get Errors by Scope
```powershell
Invoke-RestMethod -Uri "http://localhost:3002/api/errors/scope/user-service-prod?timeRange=24h" -Method GET
```

### Query with NRQL-like Syntax
```powershell
$body = @{
    query = "SELECT * FROM errors WHERE service = 'user-service'"
    timeRange = "24h"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3002/api/nrql/query" `
                  -Method POST `
                  -Body $body `
                  -ContentType "application/json"
```

---

## 4. Direct LLM Service Calls

### Call LLM1 Diagnostics Directly
```powershell
$body = @{
    transactionId = "txn-seed-001"
    timeRange = "24h"
} | ConvertTo-Json

$diagnostic = Invoke-RestMethod -Uri "http://localhost:5001/diagnose" `
                                 -Method POST `
                                 -Body $body `
                                 -ContentType "application/json"

$diagnostic | ConvertTo-Json -Depth 10
```

### Call LLM2 Solution Generator Directly
```powershell
# First get diagnostic from LLM1
$body1 = @{
    transactionId = "txn-seed-001"
    timeRange = "24h"
} | ConvertTo-Json

$diagnosticResponse = Invoke-RestMethod -Uri "http://localhost:5001/diagnose" `
                                        -Method POST `
                                        -Body $body1 `
                                        -ContentType "application/json"

# Then pass to LLM2
$body2 = @{
    diagnostic = $diagnosticResponse.diagnostic
} | ConvertTo-Json -Depth 10

$solution = Invoke-RestMethod -Uri "http://localhost:5002/generate-solution" `
                              -Method POST `
                              -Body $body2 `
                              -ContentType "application/json"

$solution | ConvertTo-Json -Depth 10
```

---

## 5. GitHub PR Operations

### List All PRs
```powershell
Invoke-RestMethod -Uri "http://localhost:3005/prs" -Method GET
```

### List PRs by Repository
```powershell
Invoke-RestMethod -Uri "http://localhost:3005/prs?repository=company/user-service" -Method GET
```

### List Open PRs
```powershell
Invoke-RestMethod -Uri "http://localhost:3005/prs?status=open" -Method GET
```

### Get Specific PR
```powershell
# Replace {prId} with actual PR ID from previous response
Invoke-RestMethod -Uri "http://localhost:3005/pr/{prId}" -Method GET
```

### Merge a PR
```powershell
# Replace {prId} with actual PR ID
$null = Invoke-RestMethod -Uri "http://localhost:3005/pr/{prId}/merge" `
                          -Method POST `
                          -ContentType "application/json"
```

### Create PR Manually
```powershell
$body = @{
    repository = "company/test-service"
    branch = "main"
    fix = @{
        file = "src/test.js"
        line = "42"
        originalCode = "const result = items / count;"
        fixedCode = "const result = count > 0 ? items / count : 0;"
        explanation = "Added check to prevent division by zero"
        category = "MATH_ERROR"
    }
    error = @{
        message = "Division by zero"
        type = "MathError"
        category = "MATH_ERROR"
    }
} | ConvertTo-Json -Depth 10

$pr = Invoke-RestMethod -Uri "http://localhost:3005/create-pr" `
                        -Method POST `
                        -Body $body `
                        -ContentType "application/json"

$pr | ConvertTo-Json -Depth 10
```

---

## 6. Diagnostic History

### Get Request History
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/history" -Method GET
```

---

## 7. Complete Workflow Example

```powershell
Write-Host "Starting complete workflow test..." -ForegroundColor Cyan

# Step 1: Check services are healthy
Write-Host "`n1. Checking service health..." -ForegroundColor Yellow
$health = Invoke-RestMethod -Uri "http://localhost:3000/health" -Method GET
Write-Host "Services status: $($health.status)" -ForegroundColor Green

# Step 2: View available errors in New Relic
Write-Host "`n2. Checking available errors..." -ForegroundColor Yellow
$errors = Invoke-RestMethod -Uri "http://localhost:3002/api/errors" -Method GET
Write-Host "Total errors available: $($errors.total)" -ForegroundColor Green

# Step 3: Select an error and diagnose
Write-Host "`n3. Diagnosing error txn-seed-001..." -ForegroundColor Yellow
$body = @{
    transactionId = "txn-seed-001"
    timeRange = "24h"
} | ConvertTo-Json

$result = Invoke-RestMethod -Uri "http://localhost:3000/api/diagnose" `
                            -Method POST `
                            -Body $body `
                            -ContentType "application/json"

# Step 4: Display results
Write-Host "`n4. Diagnostic Results:" -ForegroundColor Yellow
Write-Host "  Error: $($result.error.message)" -ForegroundColor White
Write-Host "  Category: $($result.error.category)" -ForegroundColor White
Write-Host "  Solution Type: $($result.solutionType)" -ForegroundColor White

if ($result.fix) {
    Write-Host "  Fix File: $($result.fix.file)" -ForegroundColor White
    Write-Host "  Explanation: $($result.fix.explanation)" -ForegroundColor White
    
    if ($result.fix.pr) {
        Write-Host "  PR Created: $($result.fix.pr.prUrl)" -ForegroundColor Green
    }
}

# Step 5: View created PR
if ($result.fix.pr.prNumber) {
    Write-Host "`n5. Fetching PR details..." -ForegroundColor Yellow
    $prs = Invoke-RestMethod -Uri "http://localhost:3005/prs" -Method GET
    Write-Host "Total PRs created: $($prs.count)" -ForegroundColor Green
}

Write-Host "`nWorkflow completed successfully!" -ForegroundColor Green
```

---

## Notes

- All timestamps are in ISO 8601 format
- Transaction IDs must exist in New Relic mock database
- Default time range is 24h if not specified
- PR URLs are mock URLs for demonstration
- Services must be running on default ports
