# Simple Test Script for Log Maintenance Automation

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     LOG MAINTENANCE AUTOMATION SYSTEM - DEMO                   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Test 1: Check New Relic Mock
Write-Host "[Test 1] Checking New Relic Mock Service..." -ForegroundColor Yellow
try {
    $errors = Invoke-RestMethod -Uri "http://localhost:3002/api/errors" -Method GET
    Write-Host "✓ New Relic Mock: RUNNING" -ForegroundColor Green
    Write-Host "  Total errors in database: $($errors.total)`n" -ForegroundColor White
} catch {
    Write-Host "✗ New Relic Mock: NOT RUNNING" -ForegroundColor Red
    exit 1
}

# Test 2: Check LLM1 Diagnostics
Write-Host "[Test 2] Checking LLM1 Diagnostics Service..." -ForegroundColor Yellow
try {
    $health1 = Invoke-RestMethod -Uri "http://localhost:5001/health" -Method GET
    Write-Host "✓ LLM1 Diagnostics: RUNNING" -ForegroundColor Green
    Write-Host "  Status: $($health1.status)`n" -ForegroundColor White
} catch {
    Write-Host "✗ LLM1 Diagnostics: NOT RUNNING" -ForegroundColor Red
    exit 1
}

# Test 3: Check LLM2 Solution
Write-Host "[Test 3] Checking LLM2 Solution Generator..." -ForegroundColor Yellow
try {
    $health2 = Invoke-RestMethod -Uri "http://localhost:5002/health" -Method GET
    Write-Host "✓ LLM2 Solution Generator: RUNNING" -ForegroundColor Green
    Write-Host "  Status: $($health2.status)`n" -ForegroundColor White
} catch {
    Write-Host "✗ LLM2 Solution Generator: NOT RUNNING" -ForegroundColor Red
    exit 1
}

# Test 4: Check GitHub Service
Write-Host "[Test 4] Checking GitHub PR Service..." -ForegroundColor Yellow
try {
    $healthGH = Invoke-RestMethod -Uri "http://localhost:3005/health" -Method GET
    Write-Host "✓ GitHub PR Service: RUNNING" -ForegroundColor Green
    Write-Host "  Status: $($healthGH.status)`n" -ForegroundColor White
} catch {
    Write-Host "✗ GitHub PR Service: NOT RUNNING" -ForegroundColor Red
    exit 1
}

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "All core services are RUNNING! ✓" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Green

# Demo Workflow
Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║            RUNNING DIAGNOSTIC WORKFLOW DEMO                    ║" -ForegroundColor Magenta
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Magenta

Write-Host "[Step 1] Fetching error from New Relic..." -ForegroundColor Yellow
$errorData = $errors.errors[0]
Write-Host "  Transaction ID: $($errorData.transactionId)" -ForegroundColor White
Write-Host "  Error: $($errorData.error.message)" -ForegroundColor White
Write-Host "  Occurrences: $($errorData.occurrenceCount)`n" -ForegroundColor White

Write-Host "[Step 2] Calling LLM1 for diagnostics..." -ForegroundColor Yellow
$diagBody = @{
    transactionId = $errorData.transactionId
    timeRange = "24h"
} | ConvertTo-Json

try {
    $diagnostic = Invoke-RestMethod -Uri "http://localhost:5001/diagnose" `
                                     -Method POST `
                                     -Body $diagBody `
                                     -ContentType "application/json"
    
    Write-Host "✓ Diagnostic Analysis Complete!" -ForegroundColor Green
    Write-Host "  Error Category: $($diagnostic.diagnostic.error.category)" -ForegroundColor White
    Write-Host "  Source File: $($diagnostic.diagnostic.source.file)" -ForegroundColor White
    Write-Host "  Line Number: $($diagnostic.diagnostic.source.line)" -ForegroundColor White
    Write-Host "  Repository: $($diagnostic.diagnostic.repository.repository)`n" -ForegroundColor White
} catch {
    Write-Host "✗ Error calling LLM1: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "[Step 3] Calling LLM2 for solution generation..." -ForegroundColor Yellow
$solutionBody = @{
    diagnostic = $diagnostic.diagnostic
} | ConvertTo-Json -Depth 10

try {
    $solution = Invoke-RestMethod -Uri "http://localhost:5002/generate-solution" `
                                   -Method POST `
                                   -Body $solutionBody `
                                   -ContentType "application/json"
    
    Write-Host "✓ Solution Generated!" -ForegroundColor Green
    Write-Host "  Solution Type: $($solution.solutionType)" -ForegroundColor White
    
    if ($solution.solutionType -eq "CODE_FIX") {
        Write-Host "  Fix Explanation: $($solution.fix.explanation)" -ForegroundColor White
        Write-Host "  Target File: $($solution.fix.file)`n" -ForegroundColor White
    } else {
        Write-Host "  Alert Type: $($solution.alert.category)`n" -ForegroundColor White
    }
} catch {
    Write-Host "✗ Error calling LLM2: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

if ($solution.solutionType -eq "CODE_FIX") {
    Write-Host "[Step 4] Creating GitHub Pull Request..." -ForegroundColor Yellow
    $prBody = @{
        repository = $diagnostic.diagnostic.repository.repository
        branch = $diagnostic.diagnostic.repository.branch
        fix = $solution.fix
        error = $diagnostic.diagnostic.error
    } | ConvertTo-Json -Depth 10
    
    try {
        $pr = Invoke-RestMethod -Uri "http://localhost:3005/create-pr" `
                                 -Method POST `
                                 -Body $prBody `
                                 -ContentType "application/json"
        
        Write-Host "✓ Pull Request Created!" -ForegroundColor Green
        Write-Host "  PR Number: #$($pr.prNumber)" -ForegroundColor White
        Write-Host "  PR URL: $($pr.prUrl)" -ForegroundColor White
        Write-Host "  Branch: $($pr.branch)`n" -ForegroundColor White
    } catch {
        Write-Host "✗ Error creating PR: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                  DEMO COMPLETED SUCCESSFULLY!                  ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  • Error detected: $($errorData.error.type)" -ForegroundColor White
Write-Host "  • Category: $($diagnostic.diagnostic.error.category)" -ForegroundColor White
Write-Host "  • Solution: $($solution.solutionType)" -ForegroundColor White
if ($pr) {
    Write-Host "  • PR Created: $($pr.prUrl)" -ForegroundColor White
}

Write-Host "`nThe system successfully:" -ForegroundColor Yellow
Write-Host "  1. Retrieved error from New Relic Mock" -ForegroundColor White
Write-Host "  2. Analyzed error and gathered context (LLM1)" -ForegroundColor White
Write-Host "  3. Generated code fix (LLM2)" -ForegroundColor White
Write-Host "  4. Created automated PR (GitHub Service)" -ForegroundColor White
Write-Host ""
