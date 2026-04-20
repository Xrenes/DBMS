<#
Push helper for the DBMS project.
Usage:
  - Provide an explicit remote URL:
    .\push-to-github.ps1 -RemoteUrl "https://github.com/username/repo.git" -Branch main

  - Or provide a GitHub Personal Access Token and desired repo name:
    $env:GITHUB_TOKEN = "ghp_..."
    .\push-to-github.ps1 -RepoName "DBMS-main" -Visibility public -Branch main

Notes:
  - If creating a repo via token, the script uses the authenticated user's account.
  - Token requires `repo` scope for private repos or `public_repo` for public repos.
#>
param(
    [string]$RemoteUrl,
    [string]$RepoName,
    [ValidateSet("public","private")][string]$Visibility = "private",
    [string]$Branch = "main"
)

Set-StrictMode -Version Latest

function Run-Git([string]$args){
    Write-Host "> git $args"
    & git $args
    if($LASTEXITCODE -ne 0){ throw "Git command failed: git $args" }
}

Push-WithRemoteUrl {
    if(-not $RemoteUrl){ throw "RemoteUrl not provided." }
    Run-Git "remote add origin $RemoteUrl" -ErrorAction SilentlyContinue
    Run-Git "push -u origin $Branch"
}

if($RemoteUrl){
    Push-WithRemoteUrl
    exit 0
}

$token = $env:GITHUB_TOKEN
if(-not $token -and $RepoName){
    Write-Host "No GITHUB_TOKEN found in environment. Please paste a token (it will not be stored):"
    $token = Read-Host -AsSecureString | ConvertFrom-SecureString -AsPlainText
}

if(-not $token){
    Write-Host "No remote URL or token provided. Exiting." -ForegroundColor Yellow
    exit 1
}

if(-not $RepoName){
    Write-Host "Repository name not provided. Use -RepoName to set a name." -ForegroundColor Red
    exit 1
}

# Create repo via GitHub API
$body = @{ name = $RepoName; @{'private'=$true} } | ConvertTo-Json
if($Visibility -eq 'public'){ $body = @{ name = $RepoName; @{'private'=$false} } | ConvertTo-Json }

$headers = @{ Authorization = "token $token"; "User-Agent" = "dbms-uploader-script" }
try{
    $resp = Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Method Post -Headers $headers -Body $body -ContentType "application/json"
}catch{
    Write-Host "Failed to create repository via GitHub API: $_" -ForegroundColor Red
    exit 2
}

$cloneUrl = $resp.clone_url
Write-Host "Created repo: $($resp.full_name)"
Write-Host "Setting remote to $cloneUrl and pushing branch $Branch"

Run-Git "remote add origin $cloneUrl" -ErrorAction SilentlyContinue
Run-Git "push -u origin $Branch"

Write-Host "Push complete. Repo URL: $($resp.html_url)" -ForegroundColor Green
