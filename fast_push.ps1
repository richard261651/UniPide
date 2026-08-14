$minGitDir = "C:\Users\richard\MinGit"
$minGitZip = "C:\Users\richard\MinGit.zip"
$repoUrl = "https://github.com/richard261651/marketplace-uninorte.git"

if (-not (Test-Path "$minGitDir\cmd\git.exe")) {
    Write-Output "Descargando MinGit ultra-rapido con curl..."
    New-Item -ItemType Directory -Force -Path $minGitDir | Out-Null
    curl.exe -L -o $minGitZip "https://github.com/git-for-windows/git/releases/download/v2.44.0.windows.1/MinGit-2.44.0-64-bit.zip"
    
    Write-Output "Extrayendo..."
    tar.exe -xf $minGitZip -C $minGitDir
    Remove-Item $minGitZip -Force -ErrorAction SilentlyContinue
}

$gitExe = "$minGitDir\cmd\git.exe"

if (Test-Path $gitExe) {
    Write-Output "Git preparado en: $gitExe"
    Set-Location "c:\Users\richard\Desktop\Repositorios\tienda"
    
    & $gitExe init
    & $gitExe config user.email "richard261651@users.noreply.github.com"
    & $gitExe config user.name "richard261651"
    & $gitExe add .
    & $gitExe commit -m "feat: Marketplace de Emprendimientos Uninorte completo con Postgres y Vercel"
    & $gitExe branch -M main
    & $gitExe remote remove origin
    & $gitExe remote add origin $repoUrl
    
    Write-Output "Subiendo codigo a GitHub..."
    & $gitExe push -u origin main
    Write-Output "SUBIDA_COMPLETA"
} else {
    Write-Output "ERROR_MINGIT"
}
