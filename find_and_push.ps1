$repoUrl = "https://github.com/richard261651/marketplace-uninorte.git"

$knownPaths = @(
    "C:\Program Files\Git\cmd\git.exe",
    "C:\Program Files\Git\bin\git.exe",
    "C:\Program Files (x86)\Git\cmd\git.exe",
    "C:\Users\richard\AppData\Local\Programs\Git\cmd\git.exe",
    "C:\Users\richard\AppData\Local\Programs\Git\bin\git.exe",
    "C:\Users\richard\AppData\Local\GitHubDesktop\app-*\resources\app\git\cmd\git.exe"
)

$foundGit = $null

foreach ($p in $knownPaths) {
    $resolved = Resolve-Path $p -ErrorAction SilentlyContinue
    if ($resolved) {
        $foundGit = $resolved[0].Path
        break
    }
}

if (-not $foundGit) {
    Write-Output "Buscando git.exe en carpetas de usuario..."
    $search = Get-ChildItem -Path "C:\Users\richard\AppData" -Filter "git.exe" -Recurse -Depth 4 -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($search) {
        $foundGit = $search.FullName
    }
}

if ($foundGit) {
    Write-Output "Git encontrado en: $foundGit"
    & $foundGit init
    & $foundGit config user.email "richard261651@users.noreply.github.com"
    & $foundGit config user.name "richard261651"
    & $foundGit add .
    & $foundGit commit -m "feat: Marketplace de Emprendimientos Uninorte completo con Postgres y Vercel"
    & $foundGit branch -M main
    & $foundGit remote remove origin
    & $foundGit remote add origin $repoUrl
    & $foundGit push -u origin main
    Write-Output "Subida completada con exito."
} else {
    Write-Output "Git no esta instalado en este sistema. Por favor instala Git desde https://git-scm.com/download/win o sube la carpeta mediante GitHub Desktop / web."
}
