$minGitDir = "C:\Users\richard\MinGit"
$minGitZip = "C:\Users\richard\MinGit.zip"
$repoUrl = "https://github.com/richard261651/marketplace-uninorte.git"

if (-not (Test-Path "$minGitDir\cmd\git.exe")) {
    Write-Output "Descargando MinGit portable (sin necesidad de permisos de administrador)..."
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    $url = "https://github.com/git-for-windows/git/releases/download/v2.44.0.windows.1/MinGit-2.44.0-64-bit.zip"
    Invoke-WebRequest -Uri $url -OutFile $minGitZip -UseBasicParsing
    
    Write-Output "Extrayendo MinGit..."
    New-Item -ItemType Directory -Force -Path $minGitDir | Out-Null
    Expand-Archive -Path $minGitZip -DestinationPath $minGitDir -Force
    Remove-Item $minGitZip -Force -ErrorAction SilentlyContinue
}

$gitExe = "$minGitDir\cmd\git.exe"

if (Test-Path $gitExe) {
    Write-Output "MinGit listo en: $gitExe"
    Set-Location "c:\Users\richard\Desktop\Repositorios\tienda"
    
    & $gitExe init
    & $gitExe config user.email "richard261651@users.noreply.github.com"
    & $gitExe config user.name "richard261651"
    & $gitExe add .
    & $gitExe commit -m "feat: Marketplace de Emprendimientos Uninorte completo con Postgres y Vercel"
    & $gitExe branch -M main
    & $gitExe remote remove origin
    & $gitExe remote add origin $repoUrl
    
    Write-Output "Subiendo a GitHub ($repoUrl)..."
    & $gitExe push -u origin main
    Write-Output "¡LISTO! Repositorio subido exitosamente a GitHub."
} else {
    Write-Output "No se pudo preparar MinGit."
}
