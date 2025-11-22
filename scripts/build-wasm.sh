#!/bin/bash
set -e

# Build optimized WASM for gcsim
# This script builds a smaller WASM by stripping debug symbols

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
GCSIM_DIR="$PROJECT_DIR/gcsim"
OUTPUT_DIR="$PROJECT_DIR/public/gcsim"
OUTPUT_FILE="$OUTPUT_DIR/main.wasm"

mkdir -p "$OUTPUT_DIR"

cd "$GCSIM_DIR/cmd/wasm"

echo "Building optimized WASM..."

# Build with stripped symbols (-w removes DWARF, -s removes symbol table)
LDFLAGS="-w -s"
if [ -n "$GCSIM_SHARE_KEY" ]; then
  LDFLAGS="$LDFLAGS -X 'main.shareKey=${GCSIM_SHARE_KEY}'"
fi

GOOS=js GOARCH=wasm go build -o "$OUTPUT_FILE" -ldflags="$LDFLAGS"

WASM_SIZE=$(ls -lh "$OUTPUT_FILE" | awk '{print $5}')
echo "WASM built: $OUTPUT_FILE ($WASM_SIZE)"

# Optional: Further optimize with wasm-opt if available
if command -v wasm-opt &> /dev/null; then
  echo "Running wasm-opt for additional optimization..."
  TEMP_FILE="$OUTPUT_FILE.tmp"
  wasm-opt -Oz "$OUTPUT_FILE" -o "$TEMP_FILE"
  mv "$TEMP_FILE" "$OUTPUT_FILE"
  WASM_SIZE=$(ls -lh "$OUTPUT_FILE" | awk '{print $5}')
  echo "After wasm-opt: $OUTPUT_FILE ($WASM_SIZE)"
else
  echo "Note: Install binaryen (wasm-opt) for additional ~10% size reduction"
  echo "  Ubuntu/Debian: sudo apt install binaryen"
  echo "  macOS: brew install binaryen"
  echo "  Arch: sudo pacman -S binaryen"
fi

# Optional: Create gzipped version for manual serving
if command -v gzip &> /dev/null; then
  gzip -9 -k -f "$OUTPUT_FILE"
  GZ_SIZE=$(ls -lh "$OUTPUT_FILE.gz" | awk '{print $5}')
  echo "Gzipped version: $OUTPUT_FILE.gz ($GZ_SIZE)"
fi

echo "Done!"
