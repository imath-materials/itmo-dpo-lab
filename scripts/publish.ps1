# Создание репозитория и публикация на GitHub Pages.
# Запуск: powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\publish.ps1 -RepoName 'itmo-dpo-lab'
[CmdletBinding()]
param([ValidatePattern('^[A-Za-z0-9._-]+$')][string]$RepoName = 'itmo-dpo-lab')
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location $root

function Require-Command([string]$Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Не найден $Name. Установите Git и GitHub CLI (gh), затем откройте PowerShell заново."
  }
}
Require-Command 'git'
Require-Command 'gh'
Write-Host "`nПубликация учебного комплекта ДПО" -ForegroundColor Cyan
Write-Host "Папка: $root"
Write-Host "ВНИМАНИЕ: репозиторий и GitHub Pages будут ПУБЛИЧНЫМИ." -ForegroundColor Yellow
Write-Host "Убедитесь, что здесь нет персональных данных, паролей, закрытых JSON и служебных документов."
$choice = Read-Host 'Для публикации введите YES'
if ($choice -cne 'YES') { Write-Host 'Публикация отменена.'; exit 0 }

& gh auth status
if ($LASTEXITCODE -ne 0) { throw 'Сначала выполните gh auth login и gh auth setup-git.' }
$owner = (& gh api user --jq '.login' | Out-String).Trim()
if ($LASTEXITCODE -ne 0 -or -not $owner) { throw 'Не удалось определить GitHub пользователя.' }

# Минимальная защита от случайной публикации секретов.
$blocked = @(Get-ChildItem -Path $root -File -Recurse -Force | Where-Object {
  $_.FullName -notmatch '[\\/]\.git[\\/]' -and
  ($_.Name -match '(^\.env($|\.)|\.pem$|\.key$|\.p12$|\.pfx$|credentials|token\.json$|secret|ITMO_DPO_FINAL_CONTEXT|AI_Instruments)')
})
if ($blocked.Count -gt 0) {
  $blocked | ForEach-Object { Write-Host "Нельзя публиковать: $($_.FullName)" -ForegroundColor Red }
  throw 'Удалите служебные файлы из папки публикации.'
}

if (-not (Test-Path '.git')) { & git init; if ($LASTEXITCODE -ne 0) { throw 'Не удалось выполнить git init.' } }
& git branch -M main
& git add -A
if ($LASTEXITCODE -ne 0) { throw 'git add завершился с ошибкой.' }
$staged = (& git diff --cached --name-only | Out-String).Trim()
if ($staged) {
  $name = (& git config user.name | Out-String).Trim()
  $email = (& git config user.email | Out-String).Trim()
  if (-not $name -or -not $email) {
    throw 'Укажите имя и email для Git: git config --global user.name "Имя"; git config --global user.email "email@example.com"'
  }
  & git commit -m 'Publish DPO educational portfolio'
  if ($LASTEXITCODE -ne 0) { throw 'Не удалось создать Git-коммит.' }
}

$remotes = @(& git remote)
$hasOrigin = ($remotes -contains 'origin')
if (-not $hasOrigin) {
  Write-Host "Создаём $owner/$RepoName ..." -ForegroundColor Cyan
  & gh repo create "$owner/$RepoName" --public --source . --remote origin --push --description 'Интерактивные учебные материалы двух ДПО ИТМО'
  if ($LASTEXITCODE -ne 0) { throw 'GitHub не создал репозиторий. Проверьте имя, права и наличие репозитория.' }
} else {
  $remote = (& git remote get-url origin | Out-String).Trim()
  if ($remote -notmatch [regex]::Escape("/$RepoName")) {
    throw "Удалённый origin ($remote) не похож на репозиторий $RepoName. Проверьте имя, прежде чем публиковать."
  }
  Write-Host "Используем существующий origin: $remote"
  & git push -u origin main
  if ($LASTEXITCODE -ne 0) { throw 'Не удалось отправить изменения на GitHub.' }
}

Write-Host 'Включаем GitHub Pages (main, /) ...' -ForegroundColor Cyan
$repoPath = "repos/$owner/$RepoName/pages"
$body = '{"source":{"branch":"main","path":"/"}}'
$oldPreference = $ErrorActionPreference
$ErrorActionPreference = 'Continue'
$null = ($body | & gh api -X POST $repoPath --input - 2>&1 | Out-String)
$pagesCode = $LASTEXITCODE
$ErrorActionPreference = $oldPreference
if ($pagesCode -ne 0) {
  Write-Warning 'Pages уже может быть включён или API недоступен. При необходимости: Settings > Pages > Deploy from a branch > main > /(root) > Save.'
}
Write-Host "`nРепозиторий: https://github.com/$owner/$RepoName" -ForegroundColor Green
Write-Host "Сайт: https://$($owner).github.io/$RepoName/" -ForegroundColor Green
Write-Host "Показ руководству: https://$($owner).github.io/$RepoName/present.html" -ForegroundColor Green
Write-Host 'Первое развёртывание может занять некоторое время. Проверяйте ссылку Pages в настройках репозитория.'
