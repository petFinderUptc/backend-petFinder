$ErrorActionPreference = "Stop"
$base = "https://petfinder-backend-api-ajhrh9b6dbeueefy.centralus-01.azurewebsites.net"
$api = "$base/api/v1"
$ts = Get-Date -Format 'yyyyMMddHHmmss'
$email = "blobtest_$ts@test.com"
$username = "blob$ts"
$pass = 'Test12345!'

Write-Host "== 1) Health check ==" -ForegroundColor Cyan
$health = Invoke-RestMethod -Uri "$base/health" -Method GET
$dbHealth = Invoke-RestMethod -Uri "$base/db-health" -Method GET

Write-Host "== 2) Register/Login ==" -ForegroundColor Cyan
$regBody = @{email=$email;username=$username;password=$pass;firstName='Blob';lastName='Tester'} | ConvertTo-Json
$null = Invoke-RestMethod -Uri "$api/auth/register" -Method POST -Body $regBody -ContentType 'application/json'
$loginBody = @{email=$email;password=$pass} | ConvertTo-Json
$login = Invoke-RestMethod -Uri "$api/auth/login" -Method POST -Body $loginBody -ContentType 'application/json'
$token = $login.accessToken
if (-not $token) { throw 'No access token' }
$headers = @{ Authorization = "Bearer $token" }

Write-Host "== 3) Upload image ==" -ForegroundColor Cyan
$tempImg = Join-Path $env:TEMP "blob-test-$ts.png"
$pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7Z5XcAAAAASUVORK5CYII='
[IO.File]::WriteAllBytes($tempImg, [Convert]::FromBase64String($pngBase64))
$uploadRaw = & curl.exe -sS -X POST "$api/reports/upload-image" -H "Authorization: Bearer $token" -F "image=@$tempImg"
$upload = $uploadRaw | ConvertFrom-Json
$imageUrl = $upload.imageUrl
$signedUrl = $upload.signedUrl
if (-not $imageUrl) { throw 'No imageUrl returned' }

Write-Host "== 4) Create report ==" -ForegroundColor Cyan
$createBody = @{
  species='dog'; type='lost'; status='active';
  description='Prueba E2E Blob + Cosmos desde backend desplegado';
  color='cafe'; breed='mestizo'; size='medium'; contact='3001234567';
  imageUrl=$imageUrl; lat=4.7110; lon=-74.0721
} | ConvertTo-Json
$created = Invoke-RestMethod -Uri "$api/reports" -Method POST -Headers $headers -Body $createBody -ContentType 'application/json'
$reportId = $created.id
if (-not $reportId) { throw 'No report id returned' }

Write-Host "== 5) List/Detail/Update/Delete ==" -ForegroundColor Cyan
$list = Invoke-RestMethod -Uri "$api/reports?page=1&limit=20" -Method GET
$inList = ($list.data | Where-Object { $_.id -eq $reportId }).Count -gt 0
$detail = Invoke-RestMethod -Uri "$api/reports/$reportId" -Method GET
$updateBody = @{ color='negro' } | ConvertTo-Json
$updated = Invoke-RestMethod -Uri "$api/reports/$reportId" -Method PUT -Headers $headers -Body $updateBody -ContentType 'application/json'
$deleteCode = (Invoke-WebRequest -Uri "$api/reports/$reportId" -Method DELETE -Headers $headers -UseBasicParsing).StatusCode
$detail404 = $false
try {
  $null = Invoke-RestMethod -Uri "$api/reports/$reportId" -Method GET -ErrorAction Stop
} catch {
  if ($_.Exception.Response.StatusCode.value__ -eq 404) { $detail404 = $true }
}

$imgProbe = 'not-tested'
if ($signedUrl) {
  try { $null = Invoke-WebRequest -Uri $signedUrl -Method Head -UseBasicParsing; $imgProbe = 'signed-url-ok' }
  catch { $imgProbe = 'signed-url-failed' }
} else {
  try { $null = Invoke-WebRequest -Uri $imageUrl -Method Head -UseBasicParsing; $imgProbe = 'public-image-ok' }
  catch { $imgProbe = 'public-image-failed-or-private' }
}

Remove-Item $tempImg -Force -ErrorAction SilentlyContinue

$result = [ordered]@{
  baseUrl = $base
  apiPrefix = 'api/v1'
  healthStatus = $health.status
  dbHealthStatus = $dbHealth.status
  uploadHasImageUrl = [bool]$imageUrl
  uploadHasSignedUrl = [bool]$signedUrl
  imageAccessProbe = $imgProbe
  createdReportId = $reportId
  createdStatus = $created.status
  listContainsCreated = $inList
  detailMatches = ($detail.id -eq $reportId)
  updateApplied = ($updated.color -eq 'negro')
  deleteStatusCode = $deleteCode
  detailReturns404AfterDelete = $detail404
}
$result | ConvertTo-Json -Depth 5
