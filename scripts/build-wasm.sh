#!/bin/bash
set -e

# Build optimized WASM for gcsim
# This script builds a smaller WASM by stripping debug symbols
# and pre-compressing with gzip to fit Cloudflare Pages 25MB limit

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
GCSIM_DIR="$PROJECT_DIR/gcsim"
OUTPUT_DIR="$PROJECT_DIR/public/gcsim"
OUTPUT_FILE="$OUTPUT_DIR/main.wasm"
TEMP_FILE="$OUTPUT_DIR/main.wasm.tmp"

mkdir -p "$OUTPUT_DIR"

cd "$GCSIM_DIR/cmd/wasm"

echo "Building optimized WASM..."

# Build with stripped symbols (-w removes DWARF, -s removes symbol table)
LDFLAGS="-w -s"
if [ -n "$GCSIM_SHARE_KEY" ]; then
  LDFLAGS="$LDFLAGS -X 'main.shareKey=${GCSIM_SHARE_KEY}'"
fi

GOOS=js GOARCH=wasm go build -o "$TEMP_FILE" -ldflags="$LDFLAGS"

RAW_SIZE=$(ls -lh "$TEMP_FILE" | awk '{print $5}')
echo "Raw WASM built: $RAW_SIZE"

# Optional: Further optimize with wasm-opt if available
if command -v wasm-opt &> /dev/null; then
  echo "Running wasm-opt for additional optimization..."
  wasm-opt -Oz "$TEMP_FILE" -o "$TEMP_FILE.opt"
  mv "$TEMP_FILE.opt" "$TEMP_FILE"
  RAW_SIZE=$(ls -lh "$TEMP_FILE" | awk '{print $5}')
  echo "After wasm-opt: $RAW_SIZE"
else
  echo "Note: Install binaryen (wasm-opt) for additional ~10% size reduction"
fi

# Pre-compress with gzip (required for Cloudflare Pages 25MB limit)
# The _headers file tells Cloudflare to serve with Content-Encoding: gzip
echo "Compressing with gzip..."
gzip -9 -f "$TEMP_FILE"
mv "$TEMP_FILE.gz" "$OUTPUT_FILE"

FINAL_SIZE=$(ls -lh "$OUTPUT_FILE" | awk '{print $5}')
echo "Final compressed WASM: $OUTPUT_FILE ($FINAL_SIZE)"
echo ""
echo "Note: The _headers file configures Cloudflare to serve this with"
echo "      Content-Type: application/wasm and Content-Encoding: gzip"
echo "Done!"
