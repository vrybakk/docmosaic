#!/bin/bash

# Create public directory if it doesn't exist
mkdir -p public

# Generate icons from SVG
magick public/logo.svg -resize 192x192 public/icon-192.png
magick public/logo.svg -resize 512x512 public/icon-512.png
magick public/logo.svg -resize 180x180 public/apple-touch-icon.png

# Generate Open Graph images from screenshot
magick "public/screenshot-1.png" -resize "1200x630^" -gravity center -extent 1200x630 \
    -fill "#381D2A" -font Montserrat-Bold -pointsize 48 -annotate +0+280 "DocMosaic - Visual PDF Creation Tool" \
    -fill "#381D2A80" -font Montserrat-Regular -pointsize 24 -annotate +0+320 "Create beautiful PDFs by arranging images like a mosaic" \
    "public/og-image.png"

magick "public/screenshot-1.png" -resize "600x600^" -gravity center -extent 600x600 \
    -fill "#381D2A" -font Montserrat-Bold -pointsize 32 -annotate +0+260 "DocMosaic" \
    -fill "#381D2A80" -font Montserrat-Regular -pointsize 16 -annotate +0+290 "Visual PDF Creation Tool" \
    "public/og-image-square.png"

magick "public/screenshot-1.png" -resize "1200x600^" -gravity center -extent 1200x600 \
    -fill "#381D2A" -font Montserrat-Bold -pointsize 48 -annotate +0+260 "DocMosaic" \
    -fill "#381D2A80" -font Montserrat-Regular -pointsize 24 -annotate +0+300 "Visual PDF Creation Tool" \
    "public/twitter-image.png"

# Generate favicon.ico (multiple sizes)
magick public/logo.svg -resize 16x16 favicon-16.png
magick public/logo.svg -resize 32x32 favicon-32.png
magick public/logo.svg -resize 48x48 favicon-48.png
magick favicon-16.png favicon-32.png favicon-48.png public/favicon.ico

# Clean up temporary files
rm favicon-16.png favicon-32.png favicon-48.png

# Generate SVG icon
cp public/logo.svg public/icon.svg

echo "Icons and images generated successfully!" 