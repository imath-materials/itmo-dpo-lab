[CmdletBinding()]
param([string]$SitePath = (Split-Path $PSScriptRoot -Parent))
Set-Location $SitePath
if (Get-Command py -ErrorAction SilentlyContinue) {
    py -m http.server 8000
} elseif (Get-Command python -ErrorAction SilentlyContinue) {
    python -m http.server 8000
} else {
    Write-Host 'Python is not installed. Open index.html directly from the folder.'
}
