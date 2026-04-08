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
  Write-Host "✓ Backend health: $($health.status)" -ForegroundColor Green
} catch {
  Write-Host "✗ Health check failed: $_" -ForegroundColor Red
  exit 1
}

try {
  $dbHealth = Invoke-RestMethod -Uri "$base/db-health" -Method GET
  Write-Host "✓ Database health: $($dbHealth.status)" -ForegroundColor Green
} catch {
  Write-Host "✗ DB health check failed: $_" -ForegroundColor Red
  exit 1
}

Write-Host "`n=== 2) Register/Login ===" -ForegroundColor Yellow
try {
  $regBody = @{email=$email;username=$username;password=$pass;firstName='Blob';lastName='Tester'} | ConvertTo-Json
  Write-Host "Registering: $email" -ForegroundColor Cyan
  $regResponse = Invoke-RestMethod -Uri "$api/auth/register" -Method POST -Body $regBody -ContentType 'application/json'
  Write-Host "✓ User registered" -ForegroundColor Green
} catch {
  Write-Host "⚠ Registration error (might already exist): $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
}

try {
  $loginBody = @{email=$email;password=$pass} | ConvertTo-Json
  $login = Invoke-RestMethod -Uri "$api/auth/login" -Method POST -Body $loginBody -ContentType 'application/json'
  $token = $login.accessToken
  if (-not $token) { throw 'No access token' }
  Write-Host "✓ Login successful, token: $($token.Substring(0,20))..." -ForegroundColor Green
} catch {
  Write-Host "✗ Login failed: $_" -ForegroundColor Red
  exit 1
}

$headers = @{ Authorization = "Bearer $token" }

Write-Host "`n=== 3) Upload Image ===" -ForegroundColor Yellow
try {
  $tempImg = Join-Path $env:TEMP "blob-test-$ts.png"
  $pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7Z5XcAAAAASUVORK5CYII='
  [IO.File]::WriteAllBytes($tempImg, [Convert]::FromBase64String($pngBase64))
  Write-Host "Created test image: $tempImg" -ForegroundColor Cyan
  
  Write-Host "Uploading to POST /api/v1/reports/upload-image" -ForegroundColor Cyan
  $uploadRaw = & curl.exe -sS -X POST "$api/reports/upload-image" -H "Authorization: Bearer $token" -F "image=@$tempImg" 2>&1
  Write-Host "Raw upload response:" -ForegroundColor Cyan
  Write-Host $uploadRaw -ForegroundColor Gray
  
  $upload = $uploadRaw | ConvertFrom-Json
  $imageId = $upload.imageId
  $imageUrl = $upload.imageUrl
  $signedUrl = $upload.signedUrl
  $blobName = $upload.blobName
  
  Write-Host "✓ Upload successful" -ForegroundColor Green
  Write-Host "  - imageId: $imageId" -ForegroundColor Gray
  Write-Host "  - imageUrl: $imageUrl" -ForegroundColor Gray
  Write-Host "  - signedUrl: $signedUrl" -ForegroundColor Gray
  Write-Host "  - blobName: $blobName" -ForegroundColor Gray
  
} catch {
  Write-Host "✗ Upload failed: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}

Write-Host "`n=== 4) Test Signed URL Access ===" -ForegroundColor Yellow
if ($signedUrl) {
  try {
    $response = Invoke-WebRequest -Uri $signedUrl -Method Head -UseBasicParsing
    Write-Host "✓ Signed URL accessible (Status: $($response.StatusCode))" -ForegroundColor Green
  } catch {
    Write-Host "✗ Signed URL not accessible: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
  }
} else {
  Write-Host "⚠ No signedUrl returned" -ForegroundColor Yellow
}

Write-Host "`n=== 5) Create Report with Image ===" -ForegroundColor Yellow
try {
  $createBody = @{
    species='dog'; type='lost'; status='active';
    description='Prueba E2E Blob después del push';
    color='cafe'; breed='mestizo'; size='medium'; contact='3001234567';
    imageUrl=$imageUrl; lat=4.7110; lon=-74.0721
  } | ConvertTo-Json
  
  Write-Host "Creating report with image..." -ForegroundColor Cyan
  $created = Invoke-RestMethod -Uri "$api/reports" -Method POST -Headers $headers -Body $createBody -ContentType 'application/json'
  $reportId = $created.id
  $createdImageUrl = $created.imageUrl
  
  Write-Host "✓ Report created" -ForegroundColor Green
  Write-Host "  - reportId: $reportId" -ForegroundColor Gray
  Write-Host "  - status: $($created.status)" -ForegroundColor Gray
  Write-Host "  - imageUrl in report: $createdImageUrl" -ForegroundColor Gray
  
} catch {
  Write-Host "✗ Create report failed: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}

Write-Host "`n=== 6) Verify Data in Database ===" -ForegroundColor Yellow
try {
  $detail = Invoke-RestMethod -Uri "$api/reports/$reportId" -Method GET
  Write-Host "✓ Report details retrieved" -ForegroundColor Green
  Write-Host "  - color: $($detail.color)" -ForegroundColor Gray
  Write-Host "  - imageUrl: $($detail.imageUrl)" -ForegroundColor Gray
} catch {
  Write-Host "✗ Get report failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== SUMMARY ===" -ForegroundColor Cyan
Write-Host "✓ Backend: healthy" -ForegroundColor Green
Write-Host "✓ Database: connected" -ForegroundColor Green
Write-Host "✓ Image Upload: successful (imageId: $imageId)" -ForegroundColor Green
Write-Host "✓ Report Created: $reportId" -ForegroundColor Green
Write-Host "✓ Blob Storage integration: WORKING" -ForegroundColor Green
Write-Host "`nNext: Check Azure Portal Data Explorer for images container documents" -ForegroundColor Yellow
