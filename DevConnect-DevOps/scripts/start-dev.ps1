# start-dev.ps1
Write-Host "Starting DevConnect Development Environment" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# Function to check if a command exists
function Test-CommandExists {
    param($Command)
    $oldPreference = $ErrorActionPreference
    $ErrorActionPreference = 'Stop'
    try {
        if (Get-Command $Command) { return $true }
    } catch {
        return $false
    } finally {
        $ErrorActionPreference = $oldPreference
    }
}

# Check if Docker is installed
if (-not (Test-CommandExists docker)) {
    Write-Host "ERROR: Docker is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Check if Docker is running
try {
    $dockerInfo = docker info 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Docker daemon is not running"
    }
} catch {
    Write-Host "ERROR: Docker is not running" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again" -ForegroundColor Yellow
    exit 1
}

Write-Host "Docker is running" -ForegroundColor Green

# Check if port 5000 is already in use
$portCheck = netstat -an | Select-String ":5000" | Select-String "LISTENING"
if ($portCheck) {
    Write-Host "WARNING: Port 5000 is already in use" -ForegroundColor Yellow
    Write-Host "This might conflict with the backend server" -ForegroundColor Yellow
}

# Function to check if container is running
function Test-ContainerRunning {
    param($ContainerName)
    $container = docker ps --filter "name=$ContainerName" --format "{{.Names}}" 2>$null
    return [bool]$container
}

# Stop any existing containers with the same names
$containers = @("devconnect-backend", "devconnect-mongodb")
foreach ($container in $containers) {
    if (Test-ContainerRunning $container) {
        Write-Host "Stopping existing container: $container" -ForegroundColor Yellow
        docker stop $container 2>$null
        docker rm $container 2>$null
    }
}

# Start backend services using docker-compose
Write-Host "Starting backend services..." -ForegroundColor Yellow

# Check if docker-compose file exists
if (-not (Test-Path "docker-compose.backend.yml")) {
    Write-Host "ERROR: docker-compose.backend.yml not found" -ForegroundColor Red
    exit 1
}

# Start docker-compose in a new window
$dockerComposeCmd = "docker-compose -f docker-compose.backend.yml up --build"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $dockerComposeCmd

Write-Host "Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Test backend health endpoint
$maxRetries = 10
$retryCount = 0
$backendReady = $false

while ($retryCount -lt $maxRetries -and -not $backendReady) {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method GET -TimeoutSec 2
        if ($response.status -eq "OK") {
            $backendReady = $true
            Write-Host "Backend is ready!" -ForegroundColor Green
        }
    } catch {
        $retryCount++
        if ($retryCount -eq $maxRetries) {
            Write-Host "WARNING: Backend health check timed out" -ForegroundColor Yellow
        } else {
            Write-Host "Waiting for backend... ($retryCount/$maxRetries)" -ForegroundColor Gray
            Start-Sleep -Seconds 2
        }
    }
}

# Check if frontend directory exists
if (-not (Test-Path "frontend")) {
    Write-Host "ERROR: frontend directory not found" -ForegroundColor Red
    exit 1
}

# Navigate to frontend directory
Set-Location frontend

# Check if package.json exists
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: package.json not found in frontend directory" -ForegroundColor Red
    Set-Location ..
    exit 1
}

# Install frontend dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to install frontend dependencies" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
    Write-Host "Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "Frontend dependencies already installed" -ForegroundColor Green
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file for frontend..." -ForegroundColor Yellow
    @"
VITE_API_URL=http://localhost:5000/api
VITE_ENVIRONMENT=development
"@ | Out-File -FilePath ".env" -Encoding ASCII
    Write-Host ".env file created" -ForegroundColor Green
}

# Display service information
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Services are ready!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Backend API:    http://localhost:5000" -ForegroundColor White
Write-Host "Backend Health: http://localhost:5000/health" -ForegroundColor White
Write-Host "Frontend:       http://localhost:3000" -ForegroundColor White
Write-Host "MongoDB:        mongodb://localhost:27017" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Credentials:" -ForegroundColor Yellow
Write-Host "  Email:    test@example.com" -ForegroundColor White
Write-Host "  Password: password123" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan

# Start frontend
Write-Host "Starting frontend development server..." -ForegroundColor Yellow
try {
    npm run dev
} catch {
    Write-Host "ERROR: Failed to start frontend" -ForegroundColor Red
    Set-Location ..
    exit 1
}