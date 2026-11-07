# Публикация изменений после первоначального создания репозитория.
[CmdletBinding()]
param([string]$Message = 'Update DPO materials')
$ErrorActionPreference = 'Stop'
Set-Location (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
if (-not (Test-Path '.git')) { throw 'Репозиторий ещё не создан. Сначала запустите scripts/publish.ps1.' }
& git add -A
if ($LASTEXITCODE -ne 0) { throw 'Ошибка git add.' }
$staged = (& git diff --cached --name-only | Out-String).Trim()
if (-not $staged) { Write-Host 'Нет новых изменений.'; exit 0 }
& git commit -m $Message
if ($LASTEXITCODE -ne 0) { throw 'Ошибка git commit.' }
& git push
if ($LASTEXITCODE -ne 0) { throw 'Ошибка git push.' }
Write-Host 'Изменения отправлены. GitHub Pages обновит опубликованные страницы.' -ForegroundColor Green
