# fix-frontend.ps1
Write-Host "Fixing frontend dependencies..." -ForegroundColor Green

# Navigate to frontend
Set-Location -Path "frontend"

# Remove old dependencies
Write-Host "Removing node_modules and package-lock.json..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
}
if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json" -ErrorAction SilentlyContinue
}

# Clear npm cache
Write-Host "Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force

# Create backup of original package.json
if (Test-Path "package.json") {
    Copy-Item "package.json" "package.json.backup"
}

# Update package.json to fix TypeScript version
Write-Host "Updating package.json..." -ForegroundColor Yellow
$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json

# Ensure devDependencies exists
if (-not $packageJson.devDependencies) {
    $packageJson | Add-Member -Name "devDependencies" -Value @{} -MemberType NoteProperty
}

# Set correct TypeScript version
$packageJson.devDependencies.typescript = "4.9.5"

# Save updated package.json
$packageJson | ConvertTo-Json -Depth 10 | Set-Content "package.json"

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Green
npm install

# Verify installation
Write-Host "Verifying installation..." -ForegroundColor Green
npm list --depth=0

Write-Host "Frontend fixed successfully!" -ForegroundColor Green
Set-Location -Path ".."