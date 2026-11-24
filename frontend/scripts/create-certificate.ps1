param(
    [Parameter(Mandatory = $true)]
    [string]$LanIp
)
$ErrorActionPreference = 'Stop'
$parsed = [System.Net.IPAddress]::Parse($LanIp)
if ($parsed.AddressFamily -ne [System.Net.Sockets.AddressFamily]::InterNetwork) {
    throw 'Enter the IPv4 address of the laptop Wi-Fi adapter.'
}
if (-not (Get-Command mkcert -ErrorAction SilentlyContinue)) {
    throw 'Install mkcert first (see README_LR7.md).'
}
$certs = Join-Path $PSScriptRoot '..\certs'
New-Item -ItemType Directory -Path $certs -Force | Out-Null
mkcert -install
if ($LASTEXITCODE -ne 0) { throw 'mkcert -install failed.' }
mkcert -key-file (Join-Path $certs 'recovery-key.pem') -cert-file (Join-Path $certs 'recovery-cert.pem') localhost 127.0.0.1 $LanIp
if ($LASTEXITCODE -ne 0) { throw 'Certificate generation failed.' }
$caRoot = (mkcert -CAROOT | Select-Object -Last 1).Trim()
Copy-Item (Join-Path $caRoot 'rootCA.pem') (Join-Path $certs 'rootCA.crt') -Force
Write-Host "HTTPS: https://${LanIp}:5173"
Write-Host 'Transfer only certs/rootCA.crt to your own phone; never share private keys.'
