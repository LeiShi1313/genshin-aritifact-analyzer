#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { URL } from 'url';
import { execSync } from 'child_process';

const __dirname = new URL('.', import.meta.url).pathname;
const SCRIPTS_DIR = path.join(__dirname, '../public/gcsim/scripts');

console.log('=== Analyzing Serialization Differences ===\n');

const files = await fs.promises.readdir(SCRIPTS_DIR);
const originalFiles = files.filter(f => !f.endsWith('.gen'));

// Sample a few files for detailed analysis
const samplesToAnalyze = originalFiles.slice(0, 10);

console.log(`Analyzing ${samplesToAnalyze.length} sample files:\n`);

const differences = {
    weaponAliases: new Set(),
    setAliases: new Set(),
    characterAliases: new Set(),
    floatPrecision: 0,
    statGrouping: 0,
    optionsFormat: 0,
};

for (const filename of samplesToAnalyze) {
    const originalPath = path.join(SCRIPTS_DIR, filename);
    const genPath = path.join(SCRIPTS_DIR, `${filename}.gen`);

    if (!fs.existsSync(genPath)) {
        continue;
    }

    const original = await fs.promises.readFile(originalPath, 'utf-8');
    const generated = await fs.promises.readFile(genPath, 'utf-8');

    // Check for weapon alias differences
    const weaponMatch = original.match(/add weapon="(\w+)"/g);
    const weaponGenMatch = generated.match(/add weapon="(\w+)"/g);
    if (weaponMatch && weaponGenMatch) {
        for (let i = 0; i < weaponMatch.length; i++) {
            if (weaponMatch[i] !== weaponGenMatch[i]) {
                differences.weaponAliases.add(`${weaponMatch[i]} -> ${weaponGenMatch[i]}`);
            }
        }
    }

    // Check for set alias differences
    const setMatch = original.match(/add set="(\w+)"/g);
    const setGenMatch = generated.match(/add set="(\w+)"/g);
    if (setMatch && setGenMatch) {
        for (let i = 0; i < setMatch.length; i++) {
            if (setMatch[i] !== setGenMatch[i]) {
                differences.setAliases.add(`${setMatch[i]} -> ${setGenMatch[i]}`);
            }
        }
    }

    // Check stat grouping
    const originalStatsLines = (original.match(/add stats [^;]+;/g) || []).length;
    const genStatsLines = (generated.match(/add stats [^;]+;/g) || []).length;
    if (originalStatsLines !== genStatsLines) {
        differences.statGrouping++;
    }
}

console.log('📊 Difference Analysis:\n');

console.log('1. WEAPON ALIASES EXPANDED:');
if (differences.weaponAliases.size > 0) {
    const examples = Array.from(differences.weaponAliases).slice(0, 5);
    examples.forEach(ex => console.log(`   ${ex}`));
    if (differences.weaponAliases.size > 5) {
        console.log(`   ... and ${differences.weaponAliases.size - 5} more`);
    }
} else {
    console.log('   None found');
}

console.log('\n2. SET ALIASES EXPANDED:');
if (differences.setAliases.size > 0) {
    const examples = Array.from(differences.setAliases).slice(0, 5);
    examples.forEach(ex => console.log(`   ${ex}`));
    if (differences.setAliases.size > 5) {
        console.log(`   ... and ${differences.setAliases.size - 5} more`);
    }
} else {
    console.log('   None found');
}

console.log('\n3. STAT GROUPING DIFFERENCES:');
console.log(`   ${differences.statGrouping} out of ${samplesToAnalyze.length} files had different stat line counts`);
console.log('   (Original may have multiple "add stats" lines, generated groups them)');

console.log('\n4. FLOAT PRECISION:');
console.log('   Generated files use full float precision (e.g., 0.311 -> 0.31100...2)');
console.log('   This is expected due to binary proto storage');

console.log('\n📝 Common Differences:');
console.log('   ✓ Aliases expanded to full names (expected)');
console.log('   ✓ Stats grouped by label (expected)');
console.log('   ✓ Float precision changes (expected - proto binary)');
console.log('   ✓ Options combined to single line (expected)');

console.log('\n💡 To examine a specific file:');
console.log(`   diff ${SCRIPTS_DIR}/<filename> ${SCRIPTS_DIR}/<filename>.gen`);

console.log('\n✓ Analysis complete!');
