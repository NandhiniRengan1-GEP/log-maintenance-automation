# Test Script for Log Maintenance Automation System

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     Testing Log Maintenance Automation System                 ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:3000"

# Function to make API call and display results
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Body = $null
    )
    
    Write-Host "`n─────────────────────────────────────────────────" -ForegroundColor Gray
    Write-Host "Test: $Name" -ForegroundColor Yellow
    Write-Host "Endpoint: $Method $Url" -ForegroundColor Gray
    
    try {
        if ($Body) {
            $jsonBody = $Body | ConvertTo-Json -Depth 10
            Write-Host "Request Body:" -ForegroundColor Cyan
            Write-Host $jsonBody -ForegroundColor White
            
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Body $jsonBody -ContentType "application/json"
        } else {
            $response = Invoke-RestMethod -Uri $Url -Method $Method
        }
        
        Write-Host "`n✓ Success!" -ForegroundColor Green
        Write-Host "Response:" -ForegroundColor Cyan
        $response | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor White
        
        return $response
    } catch {
        Write-Host "`n✗ Failed!" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails) {
            Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
        }
        return $null
    }
}

# Wait for user to confirm services are running
Write-Host "Make sure all services are running before proceeding." -ForegroundColor Yellow
Write-Host "Press any key to start tests..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Test 1: Health Check
Test-Endpoint -Name "Health Check" `
              -Url "$baseUrl/health" `
              -Method GET

Start-Sleep -Seconds 2

# Test 2: Check New Relic Mock
Test-Endpoint -Name "New Relic - List All Errors" `
              -Url "http://localhost:3002/api/errors" `
              -Method GET

Start-Sleep -Seconds 2

# Test 3: Diagnose NULL_REFERENCE Error
$result1 = Test-Endpoint -Name "Diagnose NULL_REFERENCE Error (txn-seed-001)" `
                         -Url "$baseUrl/api/diagnose" `
                         -Method POST `
                         -Body @{
                             transactionId = "txn-seed-001"
                             timeRange = "24h"
                         }

Start-Sleep -Seconds 3

# Test 4: Diagnose UNHANDLED_PROMISE Error
$result2 = Test-Endpoint -Name "Diagnose UNHANDLED_PROMISE Error (txn-seed-002)" `
                         -Url "$baseUrl/api/diagnose" `
                         -Method POST `
                         -Body @{
                             transactionId = "txn-seed-002"
                             timeRange = "24h"
                         }

Start-Sleep -Seconds 3

# Test 5: Diagnose by Scope
$result3 = Test-Endpoint -Name "Diagnose by Scope (analytics-service-prod)" `
                         -Url "$baseUrl/api/diagnose" `
                         -Method POST `
                         -Body @{
                             scopeId = "analytics-service-prod"
                             timeRange = "24h"
                         }

Start-Sleep -Seconds 2

# Test 6: List Created PRs
Test-Endpoint -Name "List All Created PRs" `
              -Url "http://localhost:3005/prs" `
              -Method GET

# Summary
Write-Host "`n`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                    Test Summary                                ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green

$testResults = @()
if ($result1) { $testResults += "✓ NULL_REFERENCE error diagnosed and fixed" }
if ($result2) { $testResults += "✓ UNHANDLED_PROMISE error diagnosed" }
if ($result3) { $testResults += "✓ Scope-based diagnosis completed" }

$testResults | ForEach-Object { Write-Host $_ -ForegroundColor Green }

Write-Host "`nKey Observations:" -ForegroundColor Yellow
if ($result1.fix) {
    Write-Host "  • Code fix generated for NULL_REFERENCE" -ForegroundColor White
    if ($result1.fix.pr) {
        Write-Host "  • PR created: $($result1.fix.pr.prUrl)" -ForegroundColor White
    }
}

if ($result2.solutionType -eq "ALERT_SUGGESTION") {
    Write-Host "  • Alert suggestion provided for UNHANDLED_PROMISE" -ForegroundColor White
} elseif ($result2.fix) {
    Write-Host "  • Code fix generated for UNHANDLED_PROMISE" -ForegroundColor White
}

Write-Host "`n`nPress any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
