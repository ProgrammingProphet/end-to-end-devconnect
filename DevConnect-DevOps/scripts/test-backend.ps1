Write-Host "Testing Backend API" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan

# Function to make API calls
function Test-Endpoint {
    param(
        [string]$Name,
        [scriptblock]$Command
    )

    Write-Host "`nTesting: $Name" -ForegroundColor Yellow

    try {
        $response = & $Command

        if ($response -match "error|fail") {
            Write-Host "Failed" -ForegroundColor Red
            Write-Host $response
        }
        else {
            Write-Host "Success" -ForegroundColor Green
            Write-Host $response
        }
    }
    catch {
        Write-Host "Error: $_" -ForegroundColor Red
    }
}

# Wait for backend to be ready
Write-Host "`nWaiting for backend to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Test 1: Health Check
Test-Endpoint "Health Check" { curl http://localhost:5000/health }

# Test 2: Test Endpoint
Test-Endpoint "Test Endpoint" { curl http://localhost:5000/api/test }

# Test 3: Register User
Test-Endpoint "Register User" {
    curl -X POST http://localhost:5000/api/auth/register `
        -H "Content-Type: application/json" `
        -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
}

# Test 4: Login
Test-Endpoint "Login" {
    curl -X POST http://localhost:5000/api/auth/login `
        -H "Content-Type: application/json" `
        -d '{"email":"test@example.com","password":"password123"}'
}

Write-Host "`nTesting complete!" -ForegroundColor Cyan
