# 1. Get current version
$pkg = Get-Content package.json | ConvertFrom-Json
Write-Host "Current version: $($pkg.version)" -ForegroundColor Cyan

# 2. Ask for new version
$version = Read-Host "Enter new version (e.g., 1.0.1)"

if ([string]::IsNullOrWhiteSpace($version)) {
    Write-Error "Version cannot be empty."
    exit
}

# 3. Update package.json (Using regex to preserve formatting)
(Get-Content package.json) -replace """version"": "".*""", """version"": ""$version""" | Set-Content package.json

# 4. Git commands
Write-Host "Committing and Tagging v$version..." -ForegroundColor Green
git add package.json
git commit -m "chore: release v$version"
git tag "v$version"

# 5. Push
Write-Host "Pushing to GitHub..." -ForegroundColor Green
git push origin main
git push origin "v$version"

Write-Host "Done! GitHub Action triggered. check your repo 'Actions' tab." -ForegroundColor Cyan