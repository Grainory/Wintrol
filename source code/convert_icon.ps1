
Add-Type -AssemblyName System.Drawing

$source = "D:\Wintrol\development\wintrol letest.png"
$destPng = "D:\Wintrol\development\src\assets\icon.png"

# Load Original
$img = [System.Drawing.Image]::FromFile($source)

# Create 256x256 Bitmap
$resized = New-Object System.Drawing.Bitmap 256, 256
$g = [System.Drawing.Graphics]::FromImage($resized)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($img, 0, 0, 256, 256)
$g.Dispose()

# Save Resized PNG
$resized.Save($destPng, [System.Drawing.Imaging.ImageFormat]::Png)

$img.Dispose()
$resized.Dispose()

Write-Host "Created Resized icon.png (256x256)"
