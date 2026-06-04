# Configuration
# You can set your Docker Hub username here
$DockerUsername = if ($env:DOCKER_USERNAME) { $env:DOCKER_USERNAME } else { "your-dockerhub-username" }
$ProjectName = "devconnect"
# Get the Git commit SHA (matches github.sha in CI)
$GitSha = git rev-parse --short HEAD 2>$null
if (-not $GitSha) { $GitSha = "no-git-sha" }
$VersionTag = $GitSha

# Ensure Docker is running
try {
    docker info > $null 2>&1
} catch {
    Write-Error "Docker is not running. Please start Docker and try again."
    exit 1
}

# Check if logged in to Docker Hub
Write-Host "Checking Docker Hub login status..." -ForegroundColor Cyan
$loginInfo = docker system info
if ($loginInfo -notmatch "Username") {
    Write-Host "You are not logged in to Docker Hub. Performing 'docker login'..." -ForegroundColor Yellow
    docker login
}

# Confirm Username
if ($DockerUsername -eq "your-dockerhub-username") {
    $DockerUsername = Read-Host "Enter your Docker Hub username"
}

Write-Host "Starting build and push for $ProjectName (Tag: $VersionTag)..." -ForegroundColor Green

function Build-And-Push-Image {
    param (
        [string]$ServiceName,
        [string]$ContextDir
    )
    
    # Naming matches CI: ${{ secrets.DOCKER_USERNAME }}/devconnect-frontend
    $ImageName = "$DockerUsername/$ProjectName-$ServiceName"
    
    Write-Host "`n--- Building $ServiceName ---" -ForegroundColor Cyan
    docker build -t "$ImageName:latest" -t "$ImageName:$VersionTag" $ContextDir
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "$ServiceName built successfully." -ForegroundColor Green
        
        Write-Host "--- Pushing $ServiceName to Docker Hub ---" -ForegroundColor Cyan
        docker push "$ImageName:latest"
        docker push "$ImageName:$VersionTag"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "$ServiceName pushed successfully!" -ForegroundColor Green
        } else {
            Write-Host "Failed to push $ServiceName." -ForegroundColor Red
        }
    } else {
        Write-Host "Failed to build $ServiceName." -ForegroundColor Red
    }
}

# 1. Build and Push Frontend
Build-And-Push-Image -ServiceName "frontend" -ContextDir "./frontend"

# 2. Build and Push Backend
Build-And-Push-Image -ServiceName "backend" -ContextDir "./backend"

Write-Host "`nAll tasks completed." -ForegroundColor Green
Write-Host "Images: "
Write-Host "  - $DockerUsername/${ProjectName}-frontend:latest"
Write-Host "  - $DockerUsername/${ProjectName}-frontend:$Timestamp"
Write-Host "  - $DockerUsername/${ProjectName}-backend:latest"
Write-Host "  - $DockerUsername/${ProjectName}-backend:$Timestamp"
