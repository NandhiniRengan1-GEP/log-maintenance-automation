# Start LLM Services Script

Write-Host "`nStarting LLM Services..." -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

# Start LLM1 Diagnostics
Write-Host "`n[1/2] Starting LLM1 Diagnostics (port 5001)..." -ForegroundColor Yellow
$llm1Path = "C:\Users\Nandhini.Rengan\log-maintenance-automation\automation-system\llm1-diagnostics"
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$llm1Path'; Write-Host 'LLM1 Diagnostics Service' -ForegroundColor Green; python app.py"
) -WindowStyle Normal

Start-Sleep -Seconds 2

# Start LLM2 Solution
Write-Host "[2/2] Starting LLM2 Solution (port 5002)..." -ForegroundColor Yellow
$llm2Path = "C:\Users\Nandhini.Rengan\log-maintenance-automation\automation-system\llm2-solution"
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$llm2Path'; Write-Host 'LLM2 Solution Service' -ForegroundColor Green; python app.py"
) -WindowStyle Normal

Write-Host "`nWaiting for services to start..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

# Test services
Write-Host "`nTesting Services:" -ForegroundColor Cyan
Write-Host "=================" -ForegroundColor Cyan

Write-Host "`nLLM1 Diagnostics (5001): " -NoNewline
try {
    $llm1 = Invoke-RestMethod http://localhost:5001/health -TimeoutSec 3
    Write-Host "✓ ONLINE" -ForegroundColor Green
    Write-Host "  Service: $($llm1.service)" -ForegroundColor White
} catch {
    Write-Host "✗ OFFLINE" -ForegroundColor Red
}

Write-Host "`nLLM2 Solution (5002): " -NoNewline
try {
    $llm2 = Invoke-RestMethod http://localhost:5002/health -TimeoutSec 3
    Write-Host "✓ ONLINE" -ForegroundColor Green
    Write-Host "  Service: $($llm2.service)" -ForegroundColor White
} catch {
    Write-Host "✗ OFFLINE" -ForegroundColor Red
}

Write-Host "`n`nServices are ready!" -ForegroundColor Green
Write-Host "Two PowerShell windows should be open running the services." -ForegroundColor Yellow
Write-Host "Keep them running in the background.`n" -ForegroundColor Yellow
