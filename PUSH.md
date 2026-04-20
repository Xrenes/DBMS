# How to push this project to GitHub

Option A — You have a remote URL (simplest):

```powershell
cd C:\Users\HomePC\Documents\DBMS-main
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
```

Option B — Use the helper script to create a repo via GitHub API (requires a PAT):

```powershell
# set token in environment for the session
$env:GITHUB_TOKEN = "ghp_..."
# create repo named DBMS-main (private) and push
.
\tools\push-to-github.ps1 -RepoName "DBMS-main" -Visibility private -Branch main
```

Notes:
- The token requires `repo` scope for private repos.
- If you prefer SSH remotes, create the repo on GitHub and use Option A with SSH URL.
