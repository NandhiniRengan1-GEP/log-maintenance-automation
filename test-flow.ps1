Write-Host "=== LOG MAINTENANCE AUTOMATION DEMO ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Get error from New Relic
Write-Host "[1] Fetching error from New Relic..." -ForegroundColor Yellow
$errors = Invoke-RestMethod -Uri "http://localhost:3002/api/errors" -Method GET
$errorData = $errors.errors[0]
Write-Host "  Error: $($errorData.error.message)" -ForegroundColor White
Write-Host "  Transaction: $($errorData.transactionId)" -ForegroundColor White
Write-Host ""

# Step 2: Get diagnostics from LLM1
Write-Host "[2] Getting diagnostics from LLM1..." -ForegroundColor Yellow
$diagBody = @{
    transactionId = $errorData.transactionId
    timeRange = "24h"
} | ConvertTo-Json

$diagnostic = Invoke-RestMethod -Uri "http://localhost:5001/diagnose" -Method POST -Body $diagBody -ContentType "application/json"
Write-Host "  Category: $($diagnostic.diagnostic.error.category)" -ForegroundColor White
Write-Host "  Source: $($diagnostic.diagnostic.source.file):$($diagnostic.diagnostic.source.line)" -ForegroundColor White
Write-Host ""

# Step 3: Generate solution with LLM2
Write-Host "[3] Generating solution with LLM2..." -ForegroundColor Yellow
$solutionBody = @{
    diagnostic = $diagnostic.diagnostic
} | ConvertTo-Json -Depth 10

$solution = Invoke-RestMethod -Uri "http://localhost:5002/generate-solution" -Method POST -Body $solutionBody -ContentType "application/json"
Write-Host "  Solution Type: $($solution.solutionType)" -ForegroundColor White
Write-Host "  File: $($solution.fix.file)" -ForegroundColor White
Write-Host ""

# Step 4: Create PR
Write-Host "[4] Creating GitHub PR..." -ForegroundColor Yellow
$prBody = @{
    repository = $diagnostic.diagnostic.repository.repository
    branch = $diagnostic.diagnostic.repository.branch
    fix = $solution.fix
    error = $diagnostic.diagnostic.error
} | ConvertTo-Json -Depth 10

$pr = Invoke-RestMethod -Uri "http://localhost:3005/create-pr" -Method POST -Body $prBody -ContentType "application/json"
Write-Host "  PR Number: #$($pr.prNumber)" -ForegroundColor Green
Write-Host "  PR URL: $($pr.prUrl)" -ForegroundColor Green
Write-Host ""

Write-Host "=== WORKFLOW COMPLETE ===" -ForegroundColor Green
Write-Host "Error detected, diagnosed, fixed, and PR created!" -ForegroundColor White
