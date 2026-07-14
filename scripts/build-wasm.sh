#!/bin/bash
set -euo pipefail

# Build optimized WASM for gcsim
# This script builds a smaller WASM by stripping debug symbols
# and pre-compressing with gzip to fit Cloudflare Pages 25MB limit

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
GCSIM_DIR="$PROJECT_DIR/gcsim"
OUTPUT_DIR="$PROJECT_DIR/public/gcsim"
OUTPUT_FILE="$OUTPUT_DIR/main.wasm"
TEMP_FILE="$OUTPUT_DIR/main.wasm.tmp"
WASM_EXEC_FILE="$OUTPUT_DIR/wasm_exec.js"

mkdir -p "$OUTPUT_DIR"
trap 'rm -f "$TEMP_FILE" "$TEMP_FILE.gz"' EXIT

GO_VERSION="$(awk '$1 == "go" { print $2; exit }' "$GCSIM_DIR/go.mod")"
if [ -z "$GO_VERSION" ]; then
  echo "Could not determine the pinned Go version from $GCSIM_DIR/go.mod" >&2
  exit 1
fi
export GOTOOLCHAIN="go$GO_VERSION"
echo "Using pinned Go toolchain $GOTOOLCHAIN"

GOROOT_DIR="$(go env GOROOT)"
if [ -f "$GOROOT_DIR/lib/wasm/wasm_exec.js" ]; then
  WASM_EXEC_SOURCE="$GOROOT_DIR/lib/wasm/wasm_exec.js"
elif [ -f "$GOROOT_DIR/misc/wasm/wasm_exec.js" ]; then
  WASM_EXEC_SOURCE="$GOROOT_DIR/misc/wasm/wasm_exec.js"
else
  echo "Could not find wasm_exec.js in Go installation at $GOROOT_DIR" >&2
  exit 1
fi

cp "$WASM_EXEC_SOURCE" "$WASM_EXEC_FILE"
echo "Updated wasm_exec.js from $WASM_EXEC_SOURCE"

cd "$GCSIM_DIR/cmd/wasm"

echo "Building optimized WASM..."

# Strip symbols and the build id so identical source produces identical bytes.
LDFLAGS="-w -s -buildid="
if [ -n "${GCSIM_SHARE_KEY:-}" ]; then
  LDFLAGS="$LDFLAGS -X 'main.shareKey=${GCSIM_SHARE_KEY}'"
fi

GOOS=js GOARCH=wasm go build \
  -trimpath \
  -buildvcs=false \
  -o "$TEMP_FILE" \
  -ldflags="$LDFLAGS"

RAW_SIZE=$(ls -lh "$TEMP_FILE" | awk '{print $5}')
echo "Raw WASM built: $RAW_SIZE"

# Pre-compress with gzip (required for Cloudflare Pages 25MB limit)
# The _headers file tells Cloudflare to serve with Content-Encoding: gzip
echo "Compressing with gzip..."
gzip -n -9 -f "$TEMP_FILE"
mv "$TEMP_FILE.gz" "$OUTPUT_FILE"

FINAL_SIZE=$(ls -lh "$OUTPUT_FILE" | awk '{print $5}')
echo "Final compressed WASM: $OUTPUT_FILE ($FINAL_SIZE)"
echo ""
echo "Note: The _headers file configures Cloudflare to serve this with"
echo "      Content-Type: application/wasm and Content-Encoding: gzip"
echo "Done!"
