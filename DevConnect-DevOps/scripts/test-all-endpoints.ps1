Write-Host "Testing All Backend Endpoints" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:5000"
$token = ""

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        $Body = $null,
        [int]$ExpectedStatus = 200,
        $Headers = @{}
    )

    Write-Host "`nTesting: $Name" -ForegroundColor Yellow
    Write-Host "URL: $Url" -ForegroundColor Gray

    try {
        $params = @{
            Uri     = $Url
            Method  = $Method
            Headers = $Headers
        }

        if ($Body) {
            $params.Body = $Body
            $params.Headers["Content-Type"] = "application/json"
        }

        $response = Invoke-RestMethod @params -ErrorAction Stop

        Write-Host "Success (Status: $ExpectedStatus)" -ForegroundColor Green
        $response | ConvertTo-Json -Depth 5

        return $response

    }
    catch {
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode.value__

            if ($statusCode -eq $ExpectedStatus) {
                Write-Host "Success (Expected Status: $statusCode)" -ForegroundColor Green
            }
            else {
                Write-Host "Failed (Status: $statusCode)" -ForegroundColor Red
            }
        }
        else {
            Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# Test 1: Root endpoint (404 expected)
Test-Endpoint "Root Endpoint (Expected 404)" "$baseUrl/" "GET" $null 404

# Test 2: Health Check
Test-Endpoint "Health Check" "$baseUrl/health"

# Test 3: Test API
Test-Endpoint "Test API" "$baseUrl/api/test"

# Test 4: Register User
$registerBody = @{
    name     = "Test User"
    email    = "test@example.com"
    password = "password123"
} | ConvertTo-Json

Test-Endpoint "Register User" "$baseUrl/api/auth/register" "POST" $registerBody 201

# Test 5: Login (capture token)
$loginBody = @{
    email    = "test@example.com"
    password = "password123"
} | ConvertTo-Json

$loginResponse = Test-Endpoint "Login" "$baseUrl/api/auth/login" "POST" $loginBody

if ($loginResponse -and $loginResponse.token) {
    $token = $loginResponse.token
    Write-Host "`nToken captured successfully!" -ForegroundColor Green
}
else {
    Write-Host "`nFailed to get token. Stopping tests." -ForegroundColor Red
    exit
}

# Test 6: Get Projects (Unauthorized)
Test-Endpoint "Get Projects (Unauthorized)" "$baseUrl/api/projects" "GET" $null 401

# Test 7: Get Projects (Authorized)
$authHeaders = @{
    Authorization = "Bearer $token"
}

Test-Endpoint "Get Projects (Authorized)" "$baseUrl/api/projects" "GET" $null 200 $authHeaders

Write-Host "`nTesting Complete!" -ForegroundColor Cyan
