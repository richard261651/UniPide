@echo off
set REPO_URL=https://github.com/richard261651/UniPide.git

echo Iniciando subida a GitHub...
git init
git config user.email "richard261651@users.noreply.github.com"
git config user.name "richard261651"
git add .
git commit -m "feat: Marketplace de Emprendimientos Uninorte completo con Postgres y Vercel"
git branch -M main
git remote remove origin 2>nul
git remote add origin %REPO_URL%
git push -u origin main --force
