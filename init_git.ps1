$gitPath = ""
if (Get-Command git -ErrorAction SilentlyContinue) {
    $gitPath = "git"
} elseif (Test-Path "C:\Program Files\Git\cmd\git.exe") {
    $gitPath = "C:\Program Files\Git\cmd\git.exe"
} elseif (Test-Path "C:\Program Files (x86)\Git\cmd\git.exe") {
    $gitPath = "C:\Program Files (x86)\Git\cmd\git.exe"
} elseif (Test-Path "$env:LOCALAPPDATA\Programs\Git\cmd\git.exe") {
    $gitPath = "$env:LOCALAPPDATA\Programs\Git\cmd\git.exe"
}

if ($gitPath) {
    Write-Output "Git encontrado en: $gitPath"
    & $gitPath init
    & $gitPath config user.email "estudiante@uninorte.edu.co"
    & $gitPath config user.name "Uninorte Developer"
    & $gitPath add .
    & $gitPath commit -m "feat: Marketplace de Emprendimientos Uninorte completo"
    & $gitPath status
} else {
    Write-Output "Git no instalado en rutas estandar."
}
