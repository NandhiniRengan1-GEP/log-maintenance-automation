# Complete System Startup Script
# Starts all backend services + Angular UI

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   LOG MAINTENANCE AUTOMATION - COMPLETE SYSTEM STARTUP         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$rootPath = $PSScriptRoot

# Function to start a service in a new terminal
function Start-ServiceInTerminal {
    param(
        [string]$Name,
        [string]$Path,
        [string]$Command
    )
    
    Write-Host "Starting $Name..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Path'; Write-Host '$Name' -ForegroundColor Green; $Command"
    Start-Sleep -Seconds 2
}

# Start Backend Services
Write-Host "[1/6] Starting New Relic Mock Service (Port 3002)..." -ForegroundColor Cyan
Start-ServiceInTerminal -Name "New Relic Mock" -Path "$rootPath\mock-services\newrelic-mock" -Command "npm start"

Write-Host "[2/6] Starting LLM1 Diagnostics Service (Port 5001)..." -ForegroundColor Cyan
Start-ServiceInTerminal -Name "LLM1 Diagnostics" -Path "$rootPath\automation-system\llm1-diagnostics" -Command "python app.py"

Write-Host "[3/6] Starting LLM2 Solution Service (Port 5002)..." -ForegroundColor Cyan
Start-ServiceInTerminal -Name "LLM2 Solution" -Path "$rootPath\automation-system\llm2-solution" -Command "python app.py"

Write-Host "[4/6] Starting GitHub PR Service (Port 3005)..." -ForegroundColor Cyan
Start-ServiceInTerminal -Name "GitHub Service" -Path "$rootPath\automation-system\integrations\github-service" -Command "npm start"

# Wait for services to initialize
Write-Host ""
Write-Host "Waiting for backend services to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start Angular UI
Write-Host "[5/6] Starting Angular UI (Port 4200)..." -ForegroundColor Cyan
Start-ServiceInTerminal -Name "Angular UI" -Path "$rootPath\ui-angular" -Command "npm start"

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                  ALL SERVICES STARTED                          ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Services Running:" -ForegroundColor White
Write-Host "  • New Relic Mock:     http://localhost:3002" -ForegroundColor Gray
Write-Host "  • LLM1 Diagnostics:   http://localhost:5001" -ForegroundColor Gray
Write-Host "  • LLM2 Solution:      http://localhost:5002" -ForegroundColor Gray
Write-Host "  • GitHub Service:     http://localhost:3005" -ForegroundColor Gray
Write-Host "  • Angular UI:         http://localhost:4200" -ForegroundColor Cyan
Write-Host ""
Write-Host "Open your browser and navigate to:" -ForegroundColor Yellow
Write-Host "  http://localhost:4200" -ForegroundColor Green
Write-Host ""
Write-Host "Note: It may take 30-60 seconds for Angular to compile." -ForegroundColor Yellow
Write-Host "Press any key to exit this window (services will continue running)..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
