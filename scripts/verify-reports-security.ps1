$base='http://localhost:3000'
$api="$base/api/v1"
$ts=Get-Date -Format 'yyyyMMddHHmmss'
$pass='Test12345!'

# user A
$aEmail="a_$ts@test.com"
$aUser="a$ts"
Invoke-RestMethod -Uri "$api/auth/register" -Method POST -Body (@{email=$aEmail;username=$aUser;password=$pass;firstName='Ana';lastName='User'}|ConvertTo-Json) -ContentType 'application/json' | Out-Null
$aLogin=Invoke-RestMethod -Uri "$api/auth/login" -Method POST -Body (@{email=$aEmail;password=$pass}|ConvertTo-Json) -ContentType 'application/json'
$aHeaders=@{Authorization="Bearer $($aLogin.accessToken)"}

# create report by A
$payload=@{species='dog';status='active';description='Reporte para validar permisos en edicion y borrado';color='blanco';breed='mestizo';size='small';contact='3000000000';imageUrl='https://petfinderstorage.blob.core.windows.net/reports/permisos.jpg';lat=4.6;lon=-74.1;type='lost'}|ConvertTo-Json
$r=Invoke-RestMethod -Uri "$api/posts/reports" -Method POST -Headers $aHeaders -Body $payload -ContentType 'application/json'
$id=$r.id

# 401 no token
$unauthCode = 0
try {
  Invoke-WebRequest -Uri "$api/posts/reports/$id" -Method PUT -Body (@{color='gris'}|ConvertTo-Json) -ContentType 'application/json' -UseBasicParsing -ErrorAction Stop | Out-Null
} catch { $unauthCode = $_.Exception.Response.StatusCode.value__ }

# user B
$bEmail="b_$ts@test.com"
$bUser="b$ts"
Invoke-RestMethod -Uri "$api/auth/register" -Method POST -Body (@{email=$bEmail;username=$bUser;password=$pass;firstName='Beto';lastName='User'}|ConvertTo-Json) -ContentType 'application/json' | Out-Null
$bLogin=Invoke-RestMethod -Uri "$api/auth/login" -Method POST -Body (@{email=$bEmail;password=$pass}|ConvertTo-Json) -ContentType 'application/json'
$bHeaders=@{Authorization="Bearer $($bLogin.accessToken)"}

# 403 wrong author update
$forbiddenUpdate = 0
try {
  Invoke-WebRequest -Uri "$api/posts/reports/$id" -Method PUT -Headers $bHeaders -Body (@{color='gris'}|ConvertTo-Json) -ContentType 'application/json' -UseBasicParsing -ErrorAction Stop | Out-Null
} catch { $forbiddenUpdate = $_.Exception.Response.StatusCode.value__ }

# 403 wrong author delete
$forbiddenDelete = 0
try {
  Invoke-WebRequest -Uri "$api/posts/reports/$id" -Method DELETE -Headers $bHeaders -UseBasicParsing -ErrorAction Stop | Out-Null
} catch { $forbiddenDelete = $_.Exception.Response.StatusCode.value__ }

Write-Host "401 without token (update): $unauthCode"
Write-Host "403 non-author (update): $forbiddenUpdate"
Write-Host "403 non-author (delete): $forbiddenDelete"
