import fs from "fs";
import path from "path";
import { URL } from "url";
import { GCSim } from '../genshin/gcsim.js';
import { gcsimScriptToScript } from '../src/utils/gcsim.js';

const __dirname = new URL('.', import.meta.url).pathname;

// Parse command line args for sample count
const sampleCount = parseInt(process.argv[2] || "1");

console.log("=== Testing Random Script Round-trip ===\n");

// Read the binary file
const binaryData = await fs.promises.readFile(path.join(__dirname, "../public/gcsim/gcsim.bin"));
const gcsim = GCSim.decode(binaryData);

console.log(`Total scripts in binary: ${gcsim.scripts.length}`);
console.log(`Testing ${sampleCount} random sample(s)...\n`);

for (let i = 0; i < sampleCount; i++) {
    // Randomly select a script
    const randomIndex = Math.floor(Math.random() * gcsim.scripts.length);
    const script = gcsim.scripts[randomIndex];
    const serialized = gcsimScriptToScript(script);

    console.log("=".repeat(60));
    console.log(`Sample ${i + 1}/${sampleCount} - Script #${randomIndex}`);
    console.log("=".repeat(60));
    console.log("\nGenerated Script (first 30 lines):\n");
    const lines = serialized.split('\n');
    console.log(lines.slice(0, 30).join('\n'));

    console.log("\n" + "=".repeat(60));
    console.log("✅ Verification:");

    // Check if options is first
    const firstNonEmptyLine = lines.find(line => line.trim().length > 0);
    if (firstNonEmptyLine?.startsWith('options')) {
        console.log("✓ Options appears first");
    } else {
        console.log("✗ Options NOT first (first line: " + firstNonEmptyLine + ")");
    }

    // Check for empty frame_defaults
    if (serialized.includes('frame_defaults=;') || serialized.includes('frame_defaults= ')) {
        console.log("✗ Found invalid 'frame_defaults=' with empty value");
    } else {
        console.log("✓ No invalid 'frame_defaults=' found");
    }

    console.log("");
}

console.log("\n✓ Test complete!");
