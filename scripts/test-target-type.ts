import fs from "fs";
import path from "path";
import { URL } from "url";
import { GCSim } from '../genshin/gcsim.js';
import { gcsimScriptToScript } from '../src/utils/gcsim';

const __dirname = new URL('.', import.meta.url).pathname;

// Test script with target type
const testScript = `
target lvl=100 type=dummy radius=1 pos=0,1.5 particle_threshold=520000 particle_drop_count=3;
target lvl=100 type=aeonblightdrake[hp_mult=3.00] radius=2 pos=0,3;
target lvl=100 type=hilichurl[hp_mult=2.0,particles=1] radius=2 pos=0,3;
`;

console.log("=== Testing Target Type Parsing ===\n");

// Read the binary to find scripts with target types
const binaryData = await fs.promises.readFile(path.join(__dirname, "../public/gcsim/gcsim.bin"));
const gcsim = GCSim.decode(binaryData);

// Find scripts with target types
const scriptsWithTargetType = gcsim.scripts.filter(s => s.targets.some(t => t.type));

console.log(`Found ${scriptsWithTargetType.length} scripts with target types\n`);

if (scriptsWithTargetType.length > 0) {
    const script = scriptsWithTargetType[0];
    console.log("=== First Script with Target Type ===");

    for (let i = 0; i < script.targets.length; i++) {
        const target = script.targets[i];
        console.log(`\nTarget ${i + 1}:`);
        console.log(`  Level: ${target.level}`);
        console.log(`  Radius: ${target.radius}`);
        console.log(`  Position: [${target.position.join(', ')}]`);

        if (target.type) {
            console.log(`  Type:`);
            console.log(`    Name: ${target.type.typeName}`);
            if (target.type.hpMultiplier) {
                console.log(`    HP Multiplier: ${target.type.hpMultiplier}`);
            }
            if (target.type.particles !== undefined) {
                console.log(`    Particles: ${target.type.particles}`);
            }
        }

        if (target.particleThreshold) {
            console.log(`  Particle Threshold: ${target.particleThreshold}`);
        }
        if (target.particleDropCount) {
            console.log(`  Particle Drop Count: ${target.particleDropCount}`);
        }
    }

    // Test serialization
    console.log("\n=== Serialized Target Lines ===");
    const serialized = gcsimScriptToScript(script);
    const targetLines = serialized.split('\n').filter(line => line.trim().startsWith('target'));
    targetLines.forEach(line => console.log(line));
}

console.log("\n✓ Target type test completed!");
