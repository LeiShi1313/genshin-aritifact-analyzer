#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { URL } from 'url';

const __dirname = new URL('.', import.meta.url).pathname;
const SCRIPTS_DIR = path.join(__dirname, '../public/gcsim/scripts');

console.log('🧹 Cleaning up .gen files...\n');

try {
    const files = await fs.promises.readdir(SCRIPTS_DIR);
    const genFiles = files.filter(f => f.endsWith('.gen'));

    if (genFiles.length === 0) {
        console.log('No .gen files found.');
        process.exit(0);
    }

    console.log(`Found ${genFiles.length} .gen files to remove\n`);

    let removed = 0;
    for (const file of genFiles) {
        const filePath = path.join(SCRIPTS_DIR, file);
        await fs.promises.unlink(filePath);
        removed++;

        if (removed % 100 === 0) {
            console.log(`Removed ${removed}/${genFiles.length} files...`);
        }
    }

    console.log(`\n✓ Successfully removed ${removed} .gen files`);
} catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
}
