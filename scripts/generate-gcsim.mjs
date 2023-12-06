import fs from 'fs';
import path from 'path';
import { URL } from 'url';

const __dirname = new URL('.', import.meta.url).pathname;

const GCSIM_PATH = path.join(__dirname, '../gcsim');
const iterFind = async (dir, pattern, fn) => {
    const stat = await fs.promises.stat(dir);
    if (stat.isDirectory()) {
        const files = await fs.promises.readdir(dir);
        for (const file of files) {
            await iterFind(path.join(dir, file), pattern, fn);
        }
    } else if (stat.isFile() && path.basename(dir) === pattern) {
        await fn(dir);
    }
}

const generate_gcsim = async () => {
    console.log('Generating gcsim character...');
    const characterKeys = new Set();
    const characterAliases = {};
    await iterFind(path.join(GCSIM_PATH, 'internal', 'characters'), 'config.yml', async (file) => {
        const content = await fs.promises.readFile(file, 'utf-8');
        const match = content.match(/^key:\s*"?(\w+)"?/m);
        characterKeys.add(match ? match[1].toLowerCase() : file.name.split('.')[0]);
    })

    const characterAliasesContent = await fs.promises.readFile(path.join(GCSIM_PATH, 'pkg', 'shortcut', 'characters.go'), 'utf-8');
    const characterAliasesRegex = /"(\w+)":\s*keys\.(\w+),/g;
    let match;
    while ((match = characterAliasesRegex.exec(characterAliasesContent)) !== null) {
        const [alias, key] = match.slice(1);
        if (characterAliases[alias]) {
            console.log(`WARNING: Duplicate alias ${alias} for ${key}`);
        }
        characterAliases[alias] = key.toLowerCase();
    }
    Object.keys(characterKeys).forEach(key => characterAliases[key] = key);
    await fs.promises.writeFile(
        path.join(__dirname, "../src/data/gcsim/characters.json"),
        JSON.stringify([...characterKeys]),
        "utf-8"
    );
    await fs.promises.writeFile(
        path.join(__dirname, "../src/data/gcsim/characters-aliases.json"),
        JSON.stringify(characterAliases),
        "utf-8"
    );

    console.log('Generating gcsim artifact...');
    const artifactKeys = new Set();
    const artifactAliases = {};
    await iterFind(path.join(GCSIM_PATH, 'internal', 'artifacts'), 'config.yml', async (file) => {
        const content = await fs.promises.readFile(file, 'utf-8');
        const match = content.match(/^key:\s*"?(\w+)"?/m);
        artifactKeys.add(match ? match[1].toLowerCase() : file.name.split('.')[0]);
    })

    const artifactAliasesContent = await fs.promises.readFile(path.join(GCSIM_PATH, 'pkg', 'shortcut', 'artifacts.go'), 'utf-8');
    const artifactAliasesRegex = /"(\w+)":\s*keys\.(\w+),/g;
    // let match;
    while ((match = artifactAliasesRegex.exec(artifactAliasesContent)) !== null) {
        const [alias, key] = match.slice(1);
        if (artifactAliases[alias]) {
            console.log(`WARNING: Duplicate alias ${alias} for ${key}`);
        }
        artifactAliases[alias] = key.toLowerCase();
    }
    Object.keys(artifactKeys).forEach(key => artifactAliases[key] = key);
    await fs.promises.writeFile(
        path.join(__dirname, "../src/data/gcsim/artifacts.json"),
        JSON.stringify([...artifactKeys]),
        "utf-8"
    );
    await fs.promises.writeFile(
        path.join(__dirname, "../src/data/gcsim/artifacts-aliases.json"),
        JSON.stringify(artifactAliases),
        "utf-8"
    );

    console.log('Generating gcsim weapon...');
    const weaponKeys = new Set();
    const weaponAliases = {};
    await iterFind(path.join(GCSIM_PATH, 'internal', 'weapons'), 'config.yml', async (file) => {
        const content = await fs.promises.readFile(file, 'utf-8');
        const match = content.match(/^key:\s*"?(\w+)"?/m);
        weaponKeys.add(match ? match[1].toLowerCase() : file.name.split('.')[0]);
    })

    const weaponAliasesContent = await fs.promises.readFile(path.join(GCSIM_PATH, 'pkg', 'shortcut', 'weapons.go'), 'utf-8');
    const weaponAliasesRegex = /"(\w+)":\s*keys\.(\w+),/g;
    // let match;
    while ((match = weaponAliasesRegex.exec(weaponAliasesContent)) !== null) {

        const [alias, key] = match.slice(1);
        if (weaponAliases[alias]) {
            console.log(`WARNING: Duplicate alias ${alias} for ${key}`);
        }
        weaponAliases[alias] = key.toLowerCase();
    }
    Object.keys(weaponKeys).forEach(key => weaponAliases[key] = key);

    await fs.promises.writeFile(
        path.join(__dirname, "../src/data/gcsim/weapons.json"),
        JSON.stringify([...weaponKeys]),
        "utf-8"
    );
    await fs.promises.writeFile(
        path.join(__dirname, "../src/data/gcsim/weapons-aliases.json"),
        JSON.stringify(weaponAliases),
        "utf-8"
    );
    console.log('Generation completed.');
}
export { generate_gcsim };