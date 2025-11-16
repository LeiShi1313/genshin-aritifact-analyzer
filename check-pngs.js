#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// PNG signature: 89 50 4E 47 0D 0A 1A 0A
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

function isValidPNG(filePath) {
  try {
    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(8);
    fs.readSync(fd, buffer, 0, 8, 0);
    fs.closeSync(fd);

    return buffer.equals(PNG_SIGNATURE);
  } catch (error) {
    return false;
  }
}

function findAllPNGs(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findAllPNGs(filePath, fileList);
    } else if (file.toLowerCase().endsWith('.png')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

const assetsDir = path.join(__dirname, 'src', 'assets');
console.log(`Checking PNG files in: ${assetsDir}\n`);

const pngFiles = findAllPNGs(assetsDir);
const invalidFiles = [];

pngFiles.forEach(file => {
  if (!isValidPNG(file)) {
    invalidFiles.push(file);
  }
});

console.log(`Total PNG files found: ${pngFiles.length}`);
console.log(`Invalid PNG files: ${invalidFiles.length}\n`);

if (invalidFiles.length > 0) {
  console.log('Invalid PNG files:');
  invalidFiles.forEach(file => {
    const relativePath = path.relative(process.cwd(), file);
    console.log(`  - ${relativePath}`);
  });
} else {
  console.log('All PNG files are valid!');
}

process.exit(invalidFiles.length > 0 ? 1 : 0);
