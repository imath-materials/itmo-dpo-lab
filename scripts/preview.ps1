# Запускает локальный сервер. Закрыть Ctrl+C.
Set-Location (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
if (Get-Command py -ErrorAction SilentlyContinue) {
  Start-Process 'http://localhost:8000'
  & py -3 -m http.server 8000
} elseif (Get-Command python -ErrorAction SilentlyContinue) {
  Start-Process 'http://localhost:8000'
  & python -m http.server 8000
} else {
  Write-Host 'Python не найден. Открываю index.html в браузере.' -ForegroundColor Yellow
  Start-Process (Join-Path (Get-Location).Path 'index.html')
}
