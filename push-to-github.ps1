# Run this AFTER you create an empty GitHub repository (see README).
# Default: https://github.com/sl5843/agentic-media-analyzer
# Change $remoteUrl if you used a different name or org.

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$remoteUrl = "https://github.com/sl5843/agentic-media-analyzer.git"

$existing = git remote get-url origin 2>$null
if ($LASTEXITCODE -eq 0) {
  if ($existing -ne $remoteUrl) {
    Write-Host "Removing existing remote: origin -> $existing"
    git remote remove origin
  }
}

if (-not (git remote get-url origin 2>$null)) {
  git remote add origin $remoteUrl
}

Write-Host "Pushing to origin (main)..."
git push -u origin main
Write-Host "Done. Repo: $($remoteUrl -replace '\.git$','')"
