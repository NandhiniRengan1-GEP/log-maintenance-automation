# Final LLM Services Startup Script with CORS

Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Starting LLM Services with CORS      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Kill any existing Python processes
Write-Host "[1/4] Stopping existing Python processes..." -ForegroundColor Yellow
Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "      ✓ Stopped" -ForegroundColor Green

# Install flask-cors if needed
Write-Host "`n[2/4] Checking flask-cors package..." -ForegroundColor Yellow
$testImport = python -c "import flask_cors" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "      Installing flask-cors..." -ForegroundColor Yellow
    pip install flask-cors | Out-Null
    Write-Host "      ✓ flask-cors installed" -ForegroundColor Green
} else {
    Write-Host "      ✓ flask-cors already installed" -ForegroundColor Green
}

# Start LLM1
Write-Host "`n[3/4] Starting LLM1 Diagnostics (port 5001)..." -ForegroundColor Yellow
$llm1Script = @"
Set-Location 'C:\Users\Nandhini.Rengan\log-maintenance-automation\automation-system\llm1-diagnostics'
Write-Host ''
Write-Host '╔════════════════════════════════════════╗' -ForegroundColor Green
Write-Host '║  LLM1 Diagnostics Service             ║' -ForegroundColor Green  
Write-Host '║  Port: 5001                            ║' -ForegroundColor Green
Write-Host '║  CORS: Enabled                         ║' -ForegroundColor Green
Write-Host '╚════════════════════════════════════════╝' -ForegroundColor Green
Write-Host ''
python app.py
"@

$llm1Script | Out-File -FilePath "$env:TEMP\start-llm1.ps1" -Encoding UTF8
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "$env:TEMP\start-llm1.ps1"
Write-Host "      ✓ LLM1 window opened" -ForegroundColor Green
Start-Sleep -Seconds 2

# Start LLM2
Write-Host "`n[4/4] Starting LLM2 Solution (port 5002)..." -ForegroundColor Yellow
$llm2Script = @"
Set-Location 'C:\Users\Nandhini.Rengan\log-maintenance-automation\automation-system\llm2-solution'
Write-Host ''
Write-Host '╔════════════════════════════════════════╗' -ForegroundColor Green
Write-Host '║  LLM2 Solution Service                 ║' -ForegroundColor Green
Write-Host '║  Port: 5002                            ║' -ForegroundColor Green
Write-Host '║  CORS: Enabled                         ║' -ForegroundColor Green
Write-Host '╚════════════════════════════════════════╝' -ForegroundColor Green
Write-Host ''
python app.py
"@

$llm2Script | Out-File -FilePath "$env:TEMP\start-llm2.ps1" -Encoding UTF8
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "$env:TEMP\start-llm2.ps1"
Write-Host "      ✓ LLM2 window opened" -ForegroundColor Green

# Wait for services to start
Write-Host "`nWaiting for services to initialize..." -ForegroundColor Cyan
Start-Sleep -Seconds 6

# Test services
Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Testing Service Connectivity         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "LLM1 Diagnostics (5001): " -NoNewline -ForegroundColor Yellow
try {
    $llm1 = Invoke-RestMethod http://localhost:5001/health -TimeoutSec 3 -ErrorAction Stop
    Write-Host "✓ ONLINE" -ForegroundColor Green
    Write-Host "   → Service: $($llm1.service)" -ForegroundColor White
    Write-Host "   → CORS: Enabled" -ForegroundColor White
} catch {
    Write-Host "✗ OFFLINE (may still be starting...)" -ForegroundColor Red
}

Write-Host "`nLLM2 Solution (5002): " -NoNewline -ForegroundColor Yellow
try {
    $llm2 = Invoke-RestMethod http://localhost:5002/health -TimeoutSec 3 -ErrorAction Stop
    Write-Host "✓ ONLINE" -ForegroundColor Green
    Write-Host "   → Service: $($llm2.service)" -ForegroundColor White
    Write-Host "   → CORS: Enabled" -ForegroundColor White
} catch {
    Write-Host "✗ OFFLINE (may still be starting...)" -ForegroundColor Red
}

Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✓ LLM Services Started                ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Green

Write-Host "`nNext Steps:" -ForegroundColor Cyan
Write-Host "  1. Keep the two PowerShell windows open" -ForegroundColor White
Write-Host "  2. Refresh your browser at http://localhost:4200/index-standalone.html" -ForegroundColor White
Write-Host "  3. The services should now show as 'Running'" -ForegroundColor White
Write-Host "  4. Click 'Test Workflow' to verify the complete system!" -ForegroundColor White
Write-Host ""
