$nodeDir = "C:\Users\richard\NodeJS"
$nodeZip = "C:\Users\richard\NodeJS.zip"

if (-not (Test-Path "$nodeDir\node.exe")) {
    Write-Output "Descargando Node.js portable..."
    New-Item -ItemType Directory -Force -Path $nodeDir | Out-Null
    curl.exe -L -o $nodeZip "https://nodejs.org/dist/v20.18.0/node-v20.18.0-win-x64.zip"
    
    Write-Output "Extrayendo Node.js..."
    tar.exe -xf $nodeZip -C $nodeDir --strip-components 1
    Remove-Item $nodeZip -Force -ErrorAction SilentlyContinue
}

$nodeExe = "$nodeDir\node.exe"
$npmCmd = "$nodeDir\npm.cmd"
$npxCmd = "$nodeDir\npx.cmd"

if (Test-Path $nodeExe) {
    Write-Output "Node.js listo en: $nodeExe"
    & $nodeExe -v
    
    Set-Location "c:\Users\richard\Desktop\Repositorios\tienda"
    
    Write-Output "1. Instalando dependencias..."
    & $npmCmd install --prefer-offline --no-audit
    
    Write-Output "2. Generando cliente Prisma y aplicando esquema a Neon PostgreSQL..."
    & $npxCmd prisma db push --accept-data-loss
    
    Write-Output "3. Poblando datos iniciales (Zonas Uninorte, Negocios y Productos)..."
    & $nodeExe --loader ts-node/esm prisma/seed.ts
    
    Write-Output "¡LISTO! Base de datos de Neon 100% migrada y poblada con datos."
} else {
    Write-Output "Error preparando Node.js"
}
