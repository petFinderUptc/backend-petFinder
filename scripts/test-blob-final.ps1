$ErrorActionPreference = "Continue"
$base = "https://petfinder-backend-api-ajhrh9b6dbeueefy.centralus-01.azurewebsites.net"
$api = "$base/api/v1"
$ts = Get-Date -Format 'yyyyMMddHHmmss'
$email = "blobtest_$ts@test.com"
$username = "blob$ts"
$pass = 'Test12345!'

Write-Host "=== 1) Health Check ===" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$base/health" -Method GET
    Write-Host "Health: $($health.status)" -ForegroundColor Green
}
catch {
    Write-Host "Health check failed: $_" -ForegroundColor Red
    exit 1
}

try {
    $dbHealth = Invoke-RestMethod -Uri "$base/db-health" -Method GET
    Write-Host "DB Health: $($dbHealth.status)" -ForegroundColor Green
}
catch {
    Write-Host "DB health check failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host "=== 2) Register/Login ===" -ForegroundColor Yellow
try {
    $regBody = @{email=$email;username=$username;password=$pass;firstName='Blob';lastName='Tester'} | ConvertTo-Json
    Invoke-RestMethod -Uri "$api/auth/register" -Method POST -Body $regBody -ContentType 'application/json' | Out-Null
    Write-Host "User registered: $email" -ForegroundColor Green
}
catch {
    Write-Host "Registration error (might already exist): $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
}

try {
    $loginBody = @{email=$email;password=$pass} | ConvertTo-Json
    $login = Invoke-RestMethod -Uri "$api/auth/login" -Method POST -Body $loginBody -ContentType 'application/json'
    $token = $login.accessToken
    Write-Host "Login successful" -ForegroundColor Green
}
catch {
    Write-Host "Login failed: $_" -ForegroundColor Red
    exit 1
}

$headers = @{ Authorization = "Bearer $token" }

Write-Host "=== 3) Upload Image ===" -ForegroundColor Yellow
try {
    $tempImg = Join-Path $env:TEMP "blob-test-$ts.png"
    $pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7Z5XcAAAAASUVORK5CYII='
    [IO.File]::WriteAllBytes($tempImg, [Convert]::FromBase64String($pngBase64))
    
    Write-Host "Uploading image..." -ForegroundColor Cyan
    $uploadRaw = & curl.exe -sS -X POST "$api/reports/upload-image" -H "Authorization: Bearer $token" -F "image=@$tempImg" 2>&1
    Write-Host "Response: $uploadRaw" -ForegroundColor Gray
    
    $upload = $uploadRaw | ConvertFrom-Json
    $imageId = $upload.imageId
    $imageUrl = $upload.imageUrl
    $signedUrl = $upload.signedUrl
    
    if ($imageUrl) {
        Write-Host "Upload successful!" -ForegroundColor Green
        Write-Host "  imageId: $imageId" -ForegroundColor Cyan
        Write-Host "  imageUrl: $imageUrl" -ForegroundColor Cyan
    }
    else {
        Write-Host "No imageUrl in response" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "Upload failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "=== 4) Create Report ===" -ForegroundColor Yellow
try {
    $createBody = @{
        species='dog'
        type='lost'
        status='active'
        description='E2E Test after push'
        color='cafe'
        breed='mestizo'
        size='medium'
        contact='3001234567'
        imageUrl=$imageUrl
        lat=4.7110
        lon=-74.0721
    } | ConvertTo-Json
    
    $created = Invoke-RestMethod -Uri "$api/reports" -Method POST -Headers $headers -Body $createBody -ContentType 'application/json'
    $reportId = $created.id
    
    Write-Host "Report created! ID: $reportId" -ForegroundColor Green
}
catch {
    Write-Host "Create report failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host "=== 5) Verify Report ===" -ForegroundColor Yellow
try {
    $detail = Invoke-RestMethod -Uri "$api/reports/$reportId" -Method GET
    Write-Host "Report details retrieved" -ForegroundColor Green
    Write-Host "  Color: $($detail.color)" -ForegroundColor Cyan
    Write-Host "  ImageUrl: $($detail.imageUrl)" -ForegroundColor Cyan
}
catch {
    Write-Host "Get report failed: $_" -ForegroundColor Red
}

Write-Host "=== SUCCESS ===" -ForegroundColor Green
Write-Host "Image uploaded with ID: $imageId" -ForegroundColor Yellow
Write-Host "Report created with ID: $reportId" -ForegroundColor Yellow
Write-Host "Check Cosmos DB Data Explorer for images container" -ForegroundColor Cyan
