[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)][string]$RepoPath,
    [Parameter(Mandatory=$true)][string]$ReleasePath,
    [string]$CommitMessage = 'Update course materials and practice library'
)
$ErrorActionPreference = 'Stop'
$RepoPath = (Resolve-Path -LiteralPath $RepoPath).Path
$ReleasePath = (Resolve-Path -LiteralPath $ReleasePath).Path
if ($RepoPath -eq $ReleasePath) { throw 'ReleasePath must differ from RepoPath.' }
if (-not (Test-Path -LiteralPath (Join-Path $RepoPath '.git'))) { throw 'RepoPath is not a Git repository.' }
if (-not (Test-Path -LiteralPath (Join-Path $ReleasePath 'index.html'))) { throw 'ReleasePath has no index.html.' }
Push-Location $RepoPath
try {
    $origin = (& git remote get-url origin 2>$null)
    if ($LASTEXITCODE -ne 0 -or $origin -notmatch 'imath-materials/itmo-dpo-lab(\.git)?$') { throw 'Unexpected Git origin. Stop before copying.' }
    $branch = (& git branch --show-current).Trim()
    if ($branch -ne 'main') { throw 'Switch to the main branch before applying the release.' }
    $dirty = (& git status --porcelain)
    if ($dirty) { throw 'Working tree has local changes. Commit or back them up first.' }
    & git fetch origin main
    if ($LASTEXITCODE -ne 0) { throw 'Git fetch failed.' }
    & git pull --ff-only origin main
    if ($LASTEXITCODE -ne 0) { throw 'Git pull --ff-only failed. No files were changed.' }

    # Remove obsolete public demo / presentation / metadata pages only.
    $obsolete = @(
      'leadership', 'lms', 'present.html', 'robots.txt',
      'n8n/lessons.html', 'n8n/simulator.html', 'n8n/workshop.html',
      'assets/app.js', 'assets/style.css',
      'downloads/meeting_notes.txt', 'downloads/n8n_starter_manual.json',
      'downloads/requests_raw.csv', 'downloads/visuals_starter.zip',
      'sources', 'scripts/publish.ps1', 'scripts/update.ps1', 'scripts/preview.ps1'
    )
    foreach ($rel in $obsolete) {
      $target = Join-Path $RepoPath $rel
      if (Test-Path -LiteralPath $target) { Remove-Item -LiteralPath $target -Force -Recurse }
    }
    Get-ChildItem -LiteralPath $ReleasePath -File -Recurse -Force | ForEach-Object {
      $rel = $_.FullName.Substring($ReleasePath.Length).TrimStart('\','/')
      if ($rel -eq '.git') { return }
      $dest = Join-Path $RepoPath $rel
      $parent = Split-Path $dest -Parent
      if (-not (Test-Path -LiteralPath $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
      Copy-Item -LiteralPath $_.FullName -Destination $dest -Force
    }
    & git add -A
    if ($LASTEXITCODE -ne 0) { throw 'Git add failed.' }
    & git diff --cached --quiet
    if ($LASTEXITCODE -eq 0) { Write-Host 'No changes to commit.'; return }
    Write-Host 'Reviewing changed files:'
    & git status --short
    $answer = Read-Host 'Publish this update to the public repository? Type YES'
    if ($answer -cne 'YES') { throw 'Publishing cancelled. Files remain changed locally.' }
    & git commit -m $CommitMessage
    if ($LASTEXITCODE -ne 0) { throw 'Git commit failed.' }
    & git push origin main
    if ($LASTEXITCODE -ne 0) { throw 'Git push failed.' }
    Write-Host 'Published: https://imath-materials.github.io/itmo-dpo-lab/' -ForegroundColor Green
}
finally { Pop-Location }
