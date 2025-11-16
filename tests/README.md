# GCSim Parser Tests

This directory contains test files for the gcsim script parser and serializer.

## Round-trip Tests

**test-roundtrip.ts**
- Main round-trip test that processes all 6,430+ scripts
- Reads each original script individually
- Parses into proto format
- Serializes back to text
- Writes to corresponding `.gen` file
- Run with: `npm run test-roundtrip`

**test-single-roundtrip.ts**
- Tests round-trip on random scripts from the binary
- Useful for quick verification with random sampling
- Run with: `npx tsx tests/test-single-roundtrip.ts [count]`
  - Default: Tests 1 random script
  - Example: `npx tsx tests/test-single-roundtrip.ts 5` tests 5 random scripts

## Analysis & Verification

**analyze-diffs.mjs**
- Analyzes differences between original and generated scripts
- Shows common patterns: alias expansion, stat grouping, float precision
- Run with: `npm run analyze-diffs`

## Utilities

**clean-gen.mjs**
- Removes all `.gen` files from `public/gcsim/scripts/`
- Run with: `npm run clean-gen`

## Expected Differences

When comparing original vs generated scripts, these differences are **expected and correct**:

1. **Aliases expanded**: `"widsith"` → `"thewidsith"`, `"totm"` → `"tenacityofthemillelith"`
2. **Stats grouped**: Multiple `add stats` lines combined by label
3. **Stats summed**: Same stat type in same label are added together
4. **Float precision**: `0.311` → `0.31100001931190491` (binary float32 storage)
5. **Options combined**: Multiple `options` lines merged into one
6. **Defaults omitted**: `defhalt=true`, `hitlag=true` not shown (they're defaults)
7. **Parameter order**: Consistent ordering based on proto schema

## Workflow

1. **Make changes** to parser or serializer
2. **Regenerate binary**: `npm run gcsim`
3. **Run round-trip test**: `npm run test-roundtrip`
4. **Verify results**: `npm run analyze-diffs`
5. **Clean up**: `npm run clean-gen`

## File Locations

- Original scripts: `public/gcsim/scripts/*`
- Generated scripts: `public/gcsim/scripts/*.gen`
- Binary storage: `public/gcsim/gcsim.bin`
- Parser: `scripts/gcsim.ts`
- Serializer: `src/utils/gcsim.ts`
- Proto definition: `proto/gcsim.proto`
