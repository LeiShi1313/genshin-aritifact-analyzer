import fs from "fs";
import path from "path";
import { URL } from "url";
import { parseScript } from '../scripts/gcsim';
import { gcsimScriptToScript } from '../src/utils/gcsim';

const __dirname = new URL('.', import.meta.url).pathname;
const SCRIPTS_DIR = path.join(__dirname, "../public/gcsim/scripts");

console.log("=== Round-trip Serialization Test ===\n");

// Get all original script files (excluding .gen files)
const scriptFiles = await fs.promises.readdir(SCRIPTS_DIR);
const originalScripts = scriptFiles.filter(f => !f.endsWith('.gen'));

console.log(`Found ${originalScripts.length} original script files\n`);

// Process each script individually
let successCount = 0;
let errorCount = 0;
const errors: Array<{ file: string, error: string }> = [];

for (const filename of originalScripts) {
    try {
        // Read original script
        const originalPath = path.join(SCRIPTS_DIR, filename);
        const originalText = await fs.promises.readFile(originalPath, "utf-8");

        // Parse into proto
        const parsedScript = parseScript(originalText);

        // Serialize back to text
        const serialized = gcsimScriptToScript(parsedScript);

        // Write to .gen file
        const genFilePath = path.join(SCRIPTS_DIR, `${filename}.gen`);
        await fs.promises.writeFile(genFilePath, serialized, "utf-8");

        successCount++;

        if (successCount % 100 === 0) {
            console.log(`Processed ${successCount}/${originalScripts.length} scripts...`);
        }
    } catch (error) {
        console.error(`Error processing ${filename}:`, error instanceof Error ? error.message : error);
        errors.push({
            file: filename,
            error: error instanceof Error ? error.message : String(error)
        });
        errorCount++;
    }
}

console.log("\n" + "=".repeat(60));
console.log("✓ Round-trip test completed!");
console.log(`  Success: ${successCount}`);
console.log(`  Errors: ${errorCount}`);

if (errors.length > 0) {
    console.log("\n❌ Errors encountered:");
    errors.slice(0, 10).forEach(({ file, error }) => {
        console.log(`  ${file}: ${error}`);
    });
    if (errors.length > 10) {
        console.log(`  ... and ${errors.length - 10} more errors`);
    }
}

console.log(`\n📁 Generated files: public/gcsim/scripts/*.gen`);
console.log("\nTo compare original vs generated:");
console.log("  diff public/gcsim/scripts/<filename> public/gcsim/scripts/<filename>.gen");
console.log("\nTo clean up .gen files:");
console.log("  npm run clean-gen");
