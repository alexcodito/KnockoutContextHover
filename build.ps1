param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('chrome', 'firefox')]
    [string]$Browser,
    
    [Parameter(Mandatory=$true)]
    [string]$Version,

    [Parameter(Mandatory=$false)]
    [string]$OutputDir = "dist"
)

# Configuration
$manifestPath = "manifest.json"
$sourceDir = "."
$tempDir = Join-Path $OutputDir "temp"
$excludeFiles = @(
    "*.ps1",
    "*.zip",
    "*.git*",
    "$OutputDir"
)

function Update-Manifest {
    param (
        [string]$Browser,
        [string]$ManifestPath,
        [string]$Version
    )

    $manifest = Get-Content $ManifestPath | ConvertFrom-Json

    $manifest.version = $Version

    # Modify background configuration based on browser
    if ($Browser -eq 'chrome') {
        # Chrome uses service_worker
        $manifest.background = @{
            service_worker = "scripts/background.js"
        }
        
        # Chrome does not respect browser-specific settings
        $manifest.PSObject.Properties.Remove('browser_specific_settings')
    } else {
        # Firefox uses scripts
        $manifest.background = @{
            scripts = @("scripts/background.js")
        }
    }

    $manifest | ConvertTo-Json -Depth 10 | Set-Content $ManifestPath
}

function New-ZipPackage {
    param (
        [string]$SourcePath,
        [string]$DestinationPath
    )

    if (Test-Path $DestinationPath) {
        Remove-Item $DestinationPath -Force
    }

    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::CreateFromDirectory($SourcePath, $DestinationPath)
}

try {
    Write-Host "Starting packaging process for $Browser..."

    $null = New-Item -ItemType Directory -Force -Path $OutputDir
    $null = New-Item -ItemType Directory -Force -Path $tempDir

    Get-ChildItem -Path $sourceDir -Exclude $excludeFiles | 
        Copy-Item -Destination $tempDir -Recurse -Force

    $tempManifestPath = Join-Path $tempDir "manifest.json"
    Update-Manifest -Browser $Browser -ManifestPath $tempManifestPath -Version $Version

    $zipName = "ko-context-hover-$Browser-v$Version.zip"
    $zipPath = Join-Path $OutputDir $zipName
    New-ZipPackage -SourcePath $tempDir -DestinationPath $zipPath

    Write-Host "Package created successfully: $zipPath"
}
catch {
    Write-Error "An error occurred during packaging: $_"
    exit 1
}
finally {
    if (Test-Path $tempDir) {
        Remove-Item $tempDir -Recurse -Force
    }
}