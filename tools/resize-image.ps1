<#
.SYNOPSIS
  Downscale a PNG/JPEG so it fits inside MaxWidth x MaxHeight, preserving aspect ratio and alpha.
  Never upscales. Overwrites the file in place.
.EXAMPLE
  .\tools\resize-image.ps1 -Path assets\client-afterlands.png -MaxWidth 540 -MaxHeight 144
#>
param(
  [Parameter(Mandatory)][string]$Path,
  [Parameter(Mandatory)][int]$MaxWidth,
  [int]$MaxHeight = 0
)
Add-Type -AssemblyName System.Drawing
$full = (Resolve-Path $Path).Path
$src = [System.Drawing.Image]::FromFile($full)
try {
  if ($MaxHeight -le 0) { $MaxHeight = [int][Math]::Ceiling($src.Height * $MaxWidth / $src.Width) }
  $scale = [Math]::Min($MaxWidth / $src.Width, $MaxHeight / $src.Height)
  if ($scale -ge 1) { Write-Host "skip (already small enough): $Path"; return }
  $w = [int][Math]::Round($src.Width * $scale)
  $h = [int][Math]::Round($src.Height * $scale)
  $bmp = New-Object System.Drawing.Bitmap $w, $h, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $g.Clear([System.Drawing.Color]::Transparent)
  $attr = New-Object System.Drawing.Imaging.ImageAttributes
  $attr.SetWrapMode([System.Drawing.Drawing2D.WrapMode]::TileFlipXY)   # avoids edge bleed
  $g.DrawImage($src, (New-Object System.Drawing.Rectangle 0, 0, $w, $h), 0, 0, $src.Width, $src.Height, [System.Drawing.GraphicsUnit]::Pixel, $attr)
  $g.Dispose()
  $isJpeg = $full -match '\.jpe?g$'
  $tmp = "$full.tmp"
  if ($isJpeg) { $bmp.Save($tmp, [System.Drawing.Imaging.ImageFormat]::Jpeg) }
  else { $bmp.Save($tmp, [System.Drawing.Imaging.ImageFormat]::Png) }
  $bmp.Dispose()
} finally { $src.Dispose() }
Move-Item -Force $tmp $full
$after = Get-Item $full
Write-Host ("{0}: {1}x{2}, {3:N0} KB" -f $Path, $w, $h, ($after.Length/1KB))
