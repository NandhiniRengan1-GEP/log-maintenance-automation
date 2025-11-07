# Start All Services Script for Log Maintenance Automation
# Run this script from the project root directory

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     Log-Based Code Maintenance Automation System              ║" -ForegroundColor Cyan
Write-Host "║     Starting all services...                                   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$rootDir = Get-Location

# Function to start a service in a new window
function Start-Service {
    param(
        [string]$Name,
        [string]$Path,
        [string]$Command,
        [string]$Color = "Green"
    )
    
    Write-Host "Starting $Name..." -ForegroundColor $Color
    
    $fullPath = Join-Path $rootDir $Path
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$fullPath'; Write-Host '[$Name] Running on $fullPath' -ForegroundColor $Color; $Command"
    
    Start-Sleep -Seconds 2
}

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js $nodeVersion detected" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if Python is installed
try {
    $pythonVersion = python --version
    Write-Host "✓ Python $pythonVersion detected" -ForegroundColor Green
} catch {
    Write-Host "✗ Python not found. Please install Python first." -ForegroundColor Red
    exit 1
}

Write-Host "`nStarting services in order...`n" -ForegroundColor Yellow

# Start services with delays to ensure proper startup order

Start-Service -Name "New Relic Mock" `
              -Path "mock-services\newrelic-mock" `
              -Command "npm start" `
              -Color "Magenta"

Start-Sleep -Seconds 3

Start-Service -Name "LLM1 Diagnostics" `
              -Path "automation-system\llm1-diagnostics" `
              -Command "python app.py" `
              -Color "Blue"

Start-Sleep -Seconds 3

Start-Service -Name "LLM2 Solution Generator" `
              -Path "automation-system\llm2-solution" `
              -Command "python app.py" `
              -Color "Cyan"

Start-Sleep -Seconds 3

Start-Service -Name "GitHub PR Service" `
              -Path "automation-system\integrations\github-service" `
              -Command "npm start" `
              -Color "Green"

Start-Sleep -Seconds 3

Start-Service -Name "Orchestrator Backend" `
              -Path "automation-system\orchestrator" `
              -Command "npm start" `
              -Color "Yellow"

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║     All services started successfully!                         ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "Services running:" -ForegroundColor Cyan
Write-Host "  • New Relic Mock:       http://localhost:3002" -ForegroundColor White
Write-Host "  • LLM1 Diagnostics:     http://localhost:5001" -ForegroundColor White
Write-Host "  • LLM2 Solution:        http://localhost:5002" -ForegroundColor White
Write-Host "  • GitHub PR Service:    http://localhost:3005" -ForegroundColor White
Write-Host "  • Orchestrator:         http://localhost:3000" -ForegroundColor White

Write-Host "`nTest the system:" -ForegroundColor Yellow
Write-Host '  Invoke-RestMethod -Uri "http://localhost:3000/health" -Method GET' -ForegroundColor Gray

Write-Host "`nRun a diagnosis:" -ForegroundColor Yellow
Write-Host '  $body = @{ transactionId = "txn-seed-001"; timeRange = "24h" } | ConvertTo-Json' -ForegroundColor Gray
Write-Host '  Invoke-RestMethod -Uri "http://localhost:3000/api/diagnose" -Method POST -Body $body -ContentType "application/json"' -ForegroundColor Gray

Write-Host "`nPress any key to exit this window (services will continue running)..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
