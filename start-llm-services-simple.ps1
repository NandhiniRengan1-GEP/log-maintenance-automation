# Simple LLM Services Startup Script

Write-Host "`nStarting LLM Services with CORS..." -ForegroundColor Cyan
Write-Host "====================================`n" -ForegroundColor Cyan

# Stop existing Python processes
Write-Host "[1/3] Stopping existing services..." -ForegroundColor Yellow
Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "      Done`n" -ForegroundColor Green

# Start LLM1
Write-Host "[2/3] Starting LLM1 Diagnostics (port 5001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit -Command cd 'C:\Users\Nandhini.Rengan\log-maintenance-automation\automation-system\llm1-diagnostics'; Write-Host 'LLM1 Diagnostics - Port 5001' -ForegroundColor Green; python app.py"
Start-Sleep -Seconds 2
Write-Host "      Window opened`n" -ForegroundColor Green

# Start LLM2
Write-Host "[3/3] Starting LLM2 Solution (port 5002)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit -Command cd 'C:\Users\Nandhini.Rengan\log-maintenance-automation\automation-system\llm2-solution'; Write-Host 'LLM2 Solution - Port 5002' -ForegroundColor Green; python app.py"
Start-Sleep -Seconds 2
Write-Host "      Window opened`n" -ForegroundColor Green

# Wait for startup
Write-Host "Waiting for services to initialize..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

# Test services
Write-Host "`nTesting connectivity...`n" -ForegroundColor Cyan

Write-Host "LLM1 (5001): " -NoNewline
try {
    $r1 = Invoke-RestMethod http://localhost:5001/health -TimeoutSec 3 -ErrorAction Stop
    Write-Host "ONLINE ✓" -ForegroundColor Green
} catch {
    Write-Host "OFFLINE (may still be starting)" -ForegroundColor Yellow
}

Write-Host "LLM2 (5002): " -NoNewline
try {
    $r2 = Invoke-RestMethod http://localhost:5002/health -TimeoutSec 3 -ErrorAction Stop
    Write-Host "ONLINE ✓" -ForegroundColor Green
} catch {
    Write-Host "OFFLINE (may still be starting)" -ForegroundColor Yellow
}

Write-Host "`n====================================`n" -ForegroundColor Green
Write-Host "Services started with CORS enabled!" -ForegroundColor Green
Write-Host "`nRefresh your browser:" -ForegroundColor Cyan
Write-Host "  http://localhost:4200/index-standalone.html`n" -ForegroundColor White
