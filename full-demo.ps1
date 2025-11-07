Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "   LOG-BASED CODE MAINTENANCE AUTOMATION - DETAILED DEMO" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Retrieve errors from New Relic
Write-Host "STEP 1: Retrieve Errors from New Relic Mock" -ForegroundColor Yellow
Write-Host "----------------------------------------------" -ForegroundColor Yellow
$errors = Invoke-RestMethod -Uri "http://localhost:3002/api/errors" -Method GET
$errorData = $errors.errors[0]

Write-Host "Transaction ID: $($errorData.transactionId)" -ForegroundColor White
Write-Host "Error Message: $($errorData.error.message)" -ForegroundColor Red
Write-Host "Error Type: $($errorData.error.type)" -ForegroundColor White
Write-Host "Stack Trace: $($errorData.error.stackTrace)" -ForegroundColor Gray
Write-Host "Container: $($errorData.containerName)" -ForegroundColor White
Write-Host "Occurrences: $($errorData.occurrenceCount)" -ForegroundColor White
Write-Host ""

# Step 2: Send to LLM1 for diagnosis
Write-Host "STEP 2: LLM1 Diagnostic Analysis" -ForegroundColor Yellow
Write-Host "----------------------------------------------" -ForegroundColor Yellow
$diagBody = @{
    transactionId = $errorData.transactionId
    timeRange = "24h"
} | ConvertTo-Json

$diagnostic = Invoke-RestMethod -Uri "http://localhost:5001/diagnose" -Method POST -Body $diagBody -ContentType "application/json"

Write-Host "Error Category: $($diagnostic.diagnostic.error.category)" -ForegroundColor Cyan
Write-Host "Severity: $($diagnostic.diagnostic.error.severity)" -ForegroundColor White
Write-Host "Source File: $($diagnostic.diagnostic.source.file)" -ForegroundColor White
Write-Host "Line Number: $($diagnostic.diagnostic.source.line)" -ForegroundColor White
Write-Host "Affected Function: $($diagnostic.diagnostic.source.function)" -ForegroundColor White
Write-Host "Repository: $($diagnostic.diagnostic.repository.repository)" -ForegroundColor White
Write-Host "Branch: $($diagnostic.diagnostic.repository.branch)" -ForegroundColor White
Write-Host ""

# Step 3: Send to LLM2 for solution generation  
Write-Host "STEP 3: LLM2 Solution Generation" -ForegroundColor Yellow
Write-Host "----------------------------------------------" -ForegroundColor Yellow
$solutionBody = @{
    diagnostic = $diagnostic.diagnostic
} | ConvertTo-Json -Depth 10

$solution = Invoke-RestMethod -Uri "http://localhost:5002/generate-solution" -Method POST -Body $solutionBody -ContentType "application/json"

Write-Host "Solution Type: $($solution.solutionType)" -ForegroundColor Cyan
Write-Host "Confidence: $($solution.confidence)" -ForegroundColor White
Write-Host ""
Write-Host "Fix Details:" -ForegroundColor Green
Write-Host "  File: $($solution.fix.file)" -ForegroundColor White
Write-Host "  Explanation: $($solution.fix.explanation)" -ForegroundColor White
Write-Host ""
Write-Host "Original Code:" -ForegroundColor Red
Write-Host $solution.fix.originalCode -ForegroundColor Gray
Write-Host ""
Write-Host "Fixed Code:" -ForegroundColor Green
Write-Host $solution.fix.fixedCode -ForegroundColor White
Write-Host ""

# Step 4: Create GitHub PR
Write-Host "STEP 4: Create GitHub Pull Request" -ForegroundColor Yellow
Write-Host "----------------------------------------------" -ForegroundColor Yellow
$prBody = @{
    repository = $diagnostic.diagnostic.repository.repository
    branch = $diagnostic.diagnostic.repository.branch
    fix = $solution.fix
    error = $diagnostic.diagnostic.error
} | ConvertTo-Json -Depth 10

$pr = Invoke-RestMethod -Uri "http://localhost:3005/create-pr" -Method POST -Body $prBody -ContentType "application/json"

Write-Host "PR Created Successfully!" -ForegroundColor Green
Write-Host "  PR Number: #$($pr.prNumber)" -ForegroundColor White
Write-Host "  PR URL: $($pr.prUrl)" -ForegroundColor Cyan
Write-Host "  Branch: $($pr.branch)" -ForegroundColor White
Write-Host "  Title: $($pr.title)" -ForegroundColor White
Write-Host "  Files Changed: $($pr.filesChanged)" -ForegroundColor White
Write-Host ""

# Summary
Write-Host "================================================================" -ForegroundColor Green
Write-Host "                    WORKFLOW SUMMARY" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "The system successfully completed the following:" -ForegroundColor White
Write-Host ""
Write-Host "  1. Detected Error:" -ForegroundColor Yellow
Write-Host "     - $($errorData.error.message)" -ForegroundColor White
Write-Host "     - Occurred $($errorData.occurrenceCount) times" -ForegroundColor White
Write-Host ""
Write-Host "  2. Analyzed Root Cause:" -ForegroundColor Yellow  
Write-Host "     - Category: $($diagnostic.diagnostic.error.category)" -ForegroundColor White
Write-Host "     - Location: $($diagnostic.diagnostic.source.file):$($diagnostic.diagnostic.source.line)" -ForegroundColor White
Write-Host ""
Write-Host "  3. Generated Fix:" -ForegroundColor Yellow
Write-Host "     - Added null check before property access" -ForegroundColor White
Write-Host "     - Confidence: $($solution.confidence)" -ForegroundColor White
Write-Host ""
Write-Host "  4. Automated PR:" -ForegroundColor Yellow
Write-Host "     - $($pr.prUrl)" -ForegroundColor Cyan
Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""
