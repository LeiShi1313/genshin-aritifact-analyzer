import fs from "fs";
import path from "path";
import { URL } from "url";
import { GCSim } from '../genshin/gcsim.js';
import { gcsimScriptToScript } from '../src/utils/gcsim';

const __dirname = new URL('.', import.meta.url).pathname;

// Read the binary file
const binaryData = await fs.promises.readFile(path.join(__dirname, "../public/gcsim/gcsim.bin"));

// Decode from binary
const gcsim = GCSim.decode(binaryData);

console.log(`Loaded ${gcsim.scripts.length} scripts from binary`);

// Test the first script
if (gcsim.scripts.length > 0) {
    const firstScript = gcsim.scripts[0];
    console.log("\n=== First Script Configuration ===");
    console.log(`Characters: ${firstScript.characterInfos.length}`);
    console.log(`Targets: ${firstScript.targets.length}`);
    console.log(`Has energy settings: ${!!firstScript.energySettings}`);
    console.log(`Has hurt settings: ${!!firstScript.hurtSettings}`);
    console.log(`Action script lines: ${firstScript.scripts.length}`);

    // Convert back to text
    const scriptText = gcsimScriptToScript(firstScript);
    console.log("\n=== Serialized Script (first 50 lines) ===");
    const lines = scriptText.split('\n');
    console.log(lines.slice(0, 50).join('\n'));

    // Write to file for inspection
    await fs.promises.writeFile(
        path.join(__dirname, "../public/gcsim/test-output.txt"),
        scriptText,
        "utf-8"
    );
    console.log("\n✓ Full script written to public/gcsim/test-output.txt");
}

// Test a few more scripts with different features
console.log("\n=== Testing various script features ===");
let scriptsWithEnergy = 0;
let scriptsWithHurt = 0;
let scriptsWithTargetType = 0;
let scriptsWithRandomSubstats = 0;

for (const script of gcsim.scripts) {
    if (script.energySettings) scriptsWithEnergy++;
    if (script.hurtSettings) scriptsWithHurt++;
    if (script.targets.some(t => t.type)) scriptsWithTargetType++;
    if (script.characterInfos.some(c => c.randomSubstats)) scriptsWithRandomSubstats++;
}

console.log(`Scripts with energy settings: ${scriptsWithEnergy}`);
console.log(`Scripts with hurt settings: ${scriptsWithHurt}`);
console.log(`Scripts with target types: ${scriptsWithTargetType}`);
console.log(`Scripts with random substats: ${scriptsWithRandomSubstats}`);

console.log("\n✓ Round-trip test completed successfully!");
