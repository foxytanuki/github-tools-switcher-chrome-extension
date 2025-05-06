#!/usr/bin/env bash
# This script packages the Chrome extension into a distributable ZIP archive.
# Usage: ./pack_extension.sh

set -euo pipefail

# Output directory and filename
OUT_DIR="dist"
ZIP_NAME="github-tools-switcher.zip"

# Files and directories to include in the ZIP
FILES=(
  "manifest.json"
  "content.js"
  "popup.js"
  "popup.html"
  "icons"
)

# Create the output directory if it does not exist
mkdir -p "$OUT_DIR"

# Remove old archive if it exists
rm -f "$OUT_DIR/$ZIP_NAME"

# Build the ZIP archive, excluding macOS metadata files
zip -r "$OUT_DIR/$ZIP_NAME" "${FILES[@]}" -x "*.DS_Store" > /dev/null

echo "✅ Chrome extension packaged successfully: $OUT_DIR/$ZIP_NAME" 
