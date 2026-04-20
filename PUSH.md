# Pushing updates to GitHub

## Repository
- **GitHub Repo:** https://github.com/Xrenes/DBMS
- **Live Site (GitHub Pages):** https://xrenes.github.io/DBMS/
- **Branch:** `master`

## Push updates

```powershell
cd C:\Users\ifti2\Documents\DBMS-main
git add -A
git commit -m "Your commit message"
git push origin master
```

## First-time setup (already done)
```powershell
# Remote is already configured:
git remote -v
# origin  https://github.com/Xrenes/DBMS.git (fetch)
# origin  https://github.com/Xrenes/DBMS.git (push)
```

## GitHub Pages
- Pages is enabled and served from the `master` branch root.
- All HTML pages are live at: `https://xrenes.github.io/DBMS/<page>.html`
- Changes pushed to `master` go live within ~2 minutes.
