# ========================================
# Complete System Startup Script
# Log-Based Code Maintenance Automation
# ========================================

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                        ║" -ForegroundColor Cyan
Write-Host "║   LOG-BASED CODE MAINTENANCE AUTOMATION SYSTEM        ║" -ForegroundColor Cyan
Write-Host "║                                                        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if services are already running
Write-Host "[Checking existing services...]" -ForegroundColor Yellow
$existingServices = 0

try { Invoke-RestMethod http://localhost:3002/api/errors -TimeoutSec 1 | Out-Null; $existingServices++ } catch {}
try { Invoke-RestMethod http://localhost:5001/health -TimeoutSec 1 | Out-Null; $existingServices++ } catch {}
try { Invoke-RestMethod http://localhost:5002/health -TimeoutSec 1 | Out-Null; $existingServices++ } catch {}
try { Invoke-RestMethod http://localhost:3005/health -TimeoutSec 1 | Out-Null; $existingServices++ } catch {}
try { Invoke-WebRequest http://localhost:4200 -UseBasicParsing -TimeoutSec 1 | Out-Null; $existingServices++ } catch {}

Write-Host "  → $existingServices/5 services already running" -ForegroundColor White
Write-Host ""

# Start missing services
if ($existingServices -lt 5) {
    Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
    Write-Host "║  Starting Services...                                  ║" -ForegroundColor Yellow
    Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Yellow
    Write-Host ""
    
    # Check New Relic Mock
    Write-Host "[1/5] New Relic Mock Service (Port 3002)..." -ForegroundColor Cyan
    try {
        Invoke-RestMethod http://localhost:3002/api/errors -TimeoutSec 1 | Out-Null
        Write-Host "      ✓ Already running" -ForegroundColor Green
    } catch {
        Write-Host "      Starting..." -ForegroundColor Yellow
        Start-Process powershell -ArgumentList "-NoExit -Command cd 'C:\Users\Nandhini.Rengan\log-maintenance-automation\mock-services\newrelic-mock'; Write-Host 'New Relic Mock - Port 3002' -ForegroundColor Green; npm start" -WindowStyle Minimized
        Write-Host "      ✓ Started" -ForegroundColor Green
    }
    
    # Check LLM1
    Write-Host "[2/5] LLM1 Diagnostics Service (Port 5001)..." -ForegroundColor Cyan
    try {
        Invoke-RestMethod http://localhost:5001/health -TimeoutSec 1 | Out-Null
        Write-Host "      ✓ Already running" -ForegroundColor Green
    } catch {
        Write-Host "      Starting..." -ForegroundColor Yellow
        Start-Process powershell -ArgumentList "-NoExit -Command cd 'C:\Users\Nandhini.Rengan\log-maintenance-automation\automation-system\llm1-diagnostics'; Write-Host 'LLM1 Diagnostics - Port 5001 (CORS Enabled)' -ForegroundColor Green; python app.py" -WindowStyle Minimized
        Write-Host "      ✓ Started" -ForegroundColor Green
    }
    
    # Check LLM2
    Write-Host "[3/5] LLM2 Solution Service (Port 5002)..." -ForegroundColor Cyan
    try {
        Invoke-RestMethod http://localhost:5002/health -TimeoutSec 1 | Out-Null
        Write-Host "      ✓ Already running" -ForegroundColor Green
    } catch {
        Write-Host "      Starting..." -ForegroundColor Yellow
        Start-Process powershell -ArgumentList "-NoExit -Command cd 'C:\Users\Nandhini.Rengan\log-maintenance-automation\automation-system\llm2-solution'; Write-Host 'LLM2 Solution - Port 5002 (CORS Enabled)' -ForegroundColor Green; python app.py" -WindowStyle Minimized
        Write-Host "      ✓ Started" -ForegroundColor Green
    }
    
    # Check GitHub Service
    Write-Host "[4/5] GitHub Service (Port 3005)..." -ForegroundColor Cyan
    try {
        Invoke-RestMethod http://localhost:3005/health -TimeoutSec 1 | Out-Null
        Write-Host "      ✓ Already running" -ForegroundColor Green
    } catch {
        Write-Host "      Starting..." -ForegroundColor Yellow
        Start-Process powershell -ArgumentList "-NoExit -Command cd 'C:\Users\Nandhini.Rengan\log-maintenance-automation\automation-system\integrations\github-service'; Write-Host 'GitHub Service - Port 3005' -ForegroundColor Green; npm start" -WindowStyle Minimized
        Write-Host "      ✓ Started" -ForegroundColor Green
    }
    
    # Check UI Server
    Write-Host "[5/5] UI Server (Port 4200)..." -ForegroundColor Cyan
    try {
        Invoke-WebRequest http://localhost:4200 -UseBasicParsing -TimeoutSec 1 | Out-Null
        Write-Host "      ✓ Already running" -ForegroundColor Green
    } catch {
        Write-Host "      Starting..." -ForegroundColor Yellow
        Start-Process powershell -ArgumentList "-NoExit -Command cd 'C:\Users\Nandhini.Rengan\log-maintenance-automation\ui-angular'; Write-Host 'UI Server - Port 4200' -ForegroundColor Green; python -m http.server 4200" -WindowStyle Minimized
        Write-Host "      ✓ Started" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "Waiting for all services to initialize..." -ForegroundColor Yellow
    Start-Sleep -Seconds 8
}

# Verify all services
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Verifying Services...                                 ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$allRunning = $true

Write-Host "  New Relic Mock (3002)    : " -NoNewline
try {
    $nr = Invoke-RestMethod http://localhost:3002/api/errors -TimeoutSec 3
    Write-Host "✓ ONLINE " -ForegroundColor Green -NoNewline
    Write-Host "($($nr.total) errors)" -ForegroundColor White
} catch {
    Write-Host "✗ OFFLINE" -ForegroundColor Red
    $allRunning = $false
}

Write-Host "  LLM1 Diagnostics (5001)  : " -NoNewline
try {
    $llm1 = Invoke-RestMethod http://localhost:5001/health -TimeoutSec 3
    Write-Host "✓ ONLINE " -ForegroundColor Green -NoNewline
    Write-Host "(CORS enabled)" -ForegroundColor White
} catch {
    Write-Host "✗ OFFLINE" -ForegroundColor Red
    $allRunning = $false
}

Write-Host "  LLM2 Solution (5002)     : " -NoNewline
try {
    $llm2 = Invoke-RestMethod http://localhost:5002/health -TimeoutSec 3
    Write-Host "✓ ONLINE " -ForegroundColor Green -NoNewline
    Write-Host "(CORS enabled)" -ForegroundColor White
} catch {
    Write-Host "✗ OFFLINE" -ForegroundColor Red
    $allRunning = $false
}

Write-Host "  GitHub Service (3005)    : " -NoNewline
try {
    $gh = Invoke-RestMethod http://localhost:3005/health -TimeoutSec 3
    Write-Host "✓ ONLINE" -ForegroundColor Green
} catch {
    Write-Host "✗ OFFLINE" -ForegroundColor Red
    $allRunning = $false
}

Write-Host "  UI Server (4200)         : " -NoNewline
try {
    Invoke-WebRequest http://localhost:4200/index-standalone.html -UseBasicParsing -TimeoutSec 3 | Out-Null
    Write-Host "✓ ONLINE" -ForegroundColor Green
} catch {
    Write-Host "✗ OFFLINE" -ForegroundColor Red
    $allRunning = $false
}

Write-Host ""

if ($allRunning) {
    Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║                                                        ║" -ForegroundColor Green
    Write-Host "║           ✓ SYSTEM IS FULLY OPERATIONAL!              ║" -ForegroundColor Green
    Write-Host "║                                                        ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Access the UI:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   http://localhost:4200/index-standalone.html" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 What you can do:" -ForegroundColor Cyan
    Write-Host "   • View dashboard with system status" -ForegroundColor White
    Write-Host "   • Browse 3 active errors from New Relic" -ForegroundColor White
    Write-Host "   • Click 'Test Workflow' to see automation" -ForegroundColor White
    Write-Host "   • Watch complete flow: Error → Analysis → Fix → PR" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Tip: Keep the PowerShell windows open in background" -ForegroundColor Yellow
    Write-Host ""
    
    # Open browser
    Write-Host "Opening browser..." -ForegroundColor Cyan
    Start-Process "http://localhost:4200/index-standalone.html"
    Write-Host "✓ Browser opened!" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "⚠ Some services are offline. Please check the error messages above." -ForegroundColor Yellow
    Write-Host ""
}
