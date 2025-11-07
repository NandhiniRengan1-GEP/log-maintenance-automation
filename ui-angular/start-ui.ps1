# Start Angular UI
Write-Host "Starting Angular UI for Log Maintenance Automation..." -ForegroundColor Cyan
Write-Host ""

# Check if in correct directory
$currentPath = Get-Location
if ($currentPath.Path -notlike "*ui-angular*") {
    Write-Host "Navigating to ui-angular directory..." -ForegroundColor Yellow
    cd ui-angular
}

# Check if node_modules exists
if (-Not (Test-Path "node_modules")) {
    Write-Host "Dependencies not installed. Installing now..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Start the Angular dev server
Write-Host "Starting Angular development server on http://localhost:4200" -ForegroundColor Green
Write-Host "Proxy configured for backend services on ports 3000, 3002, 5001, 5002, 3005" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

npm start
