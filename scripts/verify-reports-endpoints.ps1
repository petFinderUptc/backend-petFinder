$base = 'http://localhost:3000'
$api = "$base/api/v1"
$ts = Get-Date -Format 'yyyyMMddHHmmss'
$email = "reportes_$ts@test.com"
$username = "rep$ts"
$pass = 'Test12345!'

Write-Host '1) DB health...' -ForegroundColor Cyan
$db = Invoke-RestMethod -Uri "$base/db-health" -Method GET
Write-Host ("   status=" + $db.status + " database=" + $db.database)

Write-Host '2) Register + login...' -ForegroundColor Cyan
$regBody = @{ email=$email; username=$username; password=$pass; firstName='QA'; lastName='Reportes' } | ConvertTo-Json
$null = Invoke-RestMethod -Uri "$api/auth/register" -Method POST -Body $regBody -ContentType 'application/json'
$loginBody = @{ email=$email; password=$pass } | ConvertTo-Json
$login = Invoke-RestMethod -Uri "$api/auth/login" -Method POST -Body $loginBody -ContentType 'application/json'
$token = $login.accessToken
$headers = @{ Authorization = "Bearer $token" }
Write-Host '   token OK'

Write-Host '3) POST /posts/reports...' -ForegroundColor Cyan
$createBody = @{
  species='dog'; status='active'; description='Perro cafe perdido en zona norte con collar rojo';
  color='cafe'; breed='mestizo'; size='medium'; contact='3001234567';
  imageUrl='https://petfinderstorage.blob.core.windows.net/reports/perro1.jpg';
  lat=5.0689; lon=-75.5174; type='lost'
} | ConvertTo-Json
$created = Invoke-RestMethod -Uri "$api/posts/reports" -Method POST -Headers $headers -Body $createBody -ContentType 'application/json'
$reportId = $created.id
Write-Host ("   created id=" + $reportId + " status=" + $created.status)

Write-Host '4) GET /posts/reports?page=1&limit=10 ...' -ForegroundColor Cyan
$list = Invoke-RestMethod -Uri "$api/posts/reports?page=1&limit=10" -Method GET
$inList = ($list.data | Where-Object { $_.id -eq $reportId }).Count -gt 0
Write-Host ("   total=" + $list.pagination.total + " containsCreated=" + $inList)

Write-Host '5) GET /posts/reports/:id ...' -ForegroundColor Cyan
$detail = Invoke-RestMethod -Uri "$api/posts/reports/$reportId" -Method GET
Write-Host ("   detail id=" + $detail.id + " active=" + ($detail.status -eq 'active'))

Write-Host '6) PUT /posts/reports/:id (partial update)...' -ForegroundColor Cyan
$updateBody = @{ color='negro'; description='Actualizado: perro visto cerca del parque principal'; imageUrl='https://petfinderstorage.blob.core.windows.net/reports/perro1_v2.jpg' } | ConvertTo-Json
$updated = Invoke-RestMethod -Uri "$api/posts/reports/$reportId" -Method PUT -Headers $headers -Body $updateBody -ContentType 'application/json'
Write-Host ("   updated color=" + $updated.color)

Write-Host '7) DELETE /posts/reports/:id (logical delete)...' -ForegroundColor Cyan
$delResp = Invoke-WebRequest -Uri "$api/posts/reports/$reportId" -Method DELETE -Headers $headers -UseBasicParsing
Write-Host ("   delete statusCode=" + [int]$delResp.StatusCode)

Write-Host '8) Verify logical delete persistence...' -ForegroundColor Cyan
$myPosts = Invoke-RestMethod -Uri "$api/posts/my-posts" -Method GET -Headers $headers
$deletedPost = $myPosts | Where-Object { $_.id -eq $reportId }
if ($null -ne $deletedPost) { Write-Host ("   my-posts contains report with status=" + $deletedPost.status) }

$detail404 = $false
try { $null = Invoke-RestMethod -Uri "$api/posts/reports/$reportId" -Method GET -ErrorAction Stop } catch { $detail404 = $_.Exception.Response.StatusCode.value__ -eq 404 }
Write-Host ("   detail endpoint returns 404 after delete=" + $detail404)

Write-Host '--- RESULT SUMMARY ---' -ForegroundColor Green
Write-Host ("DB connected: " + ($db.status -eq 'connected'))
Write-Host ("Create OK: " + ([string]::IsNullOrWhiteSpace($reportId) -eq $false))
Write-Host ("List OK: " + $inList)
Write-Host ("Detail OK: " + ($detail.id -eq $reportId))
Write-Host ("Update OK: " + ($updated.color -eq 'negro'))
Write-Host ("Delete 204 OK: " + ([int]$delResp.StatusCode -eq 204))
Write-Host ("Logical delete persisted (status inactive): " + ($deletedPost.status -eq 'inactive'))
Write-Host ("Inactive hidden in detail endpoint: " + $detail404)
