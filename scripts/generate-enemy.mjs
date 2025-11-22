import fs from 'fs';
import path from 'path';
import { URL } from 'url';

const __dirname = new URL('.', import.meta.url).pathname;

const GCSIM_LOCALIZATION_PATH = path.join(__dirname, '../gcsim/ui/packages/localization/src/locales/names.generated.json');
const PUBLIC_LOCALES_PATH = path.join(__dirname, '../public/locales');

// Map gcsim language names to locale codes
const LANGUAGE_MAP = {
    'English': 'en',
    'Chinese': 'zh',
    'German': 'de',
    'Japanese': 'ja',
    'Korean': 'ko',
    'Spanish': 'es',
    // Russian is not available in public/locales, so we skip it
    // French is not available in gcsim, will use English as fallback
};

const generate_enemy = async () => {
    console.log('Loading gcsim localization data...');

    // Read the gcsim names.generated.json file
    const gcsimData = JSON.parse(
        await fs.promises.readFile(GCSIM_LOCALIZATION_PATH, 'utf-8')
    );

    console.log('Extracting enemy names...');

    // Process each language
    for (const [gcsimLang, localeCode] of Object.entries(LANGUAGE_MAP)) {
        if (!gcsimData[gcsimLang] || !gcsimData[gcsimLang].enemy_names) {
            console.log(`WARNING: No enemy_names found for ${gcsimLang}, skipping...`);
            continue;
        }

        const enemyNames = gcsimData[gcsimLang].enemy_names;
        const localePath = path.join(PUBLIC_LOCALES_PATH, localeCode);
        const enemyPath = path.join(localePath, 'enemy.json');

        // Create enemy translations without the "enemy." prefix
        const enemyTranslations = {};
        for (const [key, value] of Object.entries(enemyNames)) {
            enemyTranslations[key] = value;
        }

        // Write to enemy.json
        await fs.promises.writeFile(
            enemyPath,
            JSON.stringify(enemyTranslations, null, 4) + '\n',
            'utf-8'
        );

        console.log(`✓ Generated ${Object.keys(enemyNames).length} enemy translations for ${localeCode}`);
    }

    // Handle zh-Hant (Traditional Chinese) - copy from zh (Simplified Chinese)
    console.log('Copying enemy names to zh-Hant...');
    const zhEnemyPath = path.join(PUBLIC_LOCALES_PATH, 'zh', 'enemy.json');
    const zhHantEnemyPath = path.join(PUBLIC_LOCALES_PATH, 'zh-Hant', 'enemy.json');

    try {
        const zhData = JSON.parse(await fs.promises.readFile(zhEnemyPath, 'utf-8'));

        await fs.promises.writeFile(
            zhHantEnemyPath,
            JSON.stringify(zhData, null, 4) + '\n',
            'utf-8'
        );

        console.log(`✓ Copied ${Object.keys(zhData).length} enemy translations to zh-Hant`);
    } catch (error) {
        console.log(`ERROR: Failed to copy to zh-Hant: ${error.message}`);
    }

    // Handle French (fr) - use English as fallback
    console.log('Adding English enemy names as fallback for French...');
    const enEnemyPath = path.join(PUBLIC_LOCALES_PATH, 'en', 'enemy.json');
    const frEnemyPath = path.join(PUBLIC_LOCALES_PATH, 'fr', 'enemy.json');

    try {
        const enData = JSON.parse(await fs.promises.readFile(enEnemyPath, 'utf-8'));

        await fs.promises.writeFile(
            frEnemyPath,
            JSON.stringify(enData, null, 4) + '\n',
            'utf-8'
        );

        console.log(`✓ Added ${Object.keys(enData).length} enemy translations (English fallback) to fr`);
    } catch (error) {
        console.log(`ERROR: Failed to add fallback to fr: ${error.message}`);
    }

    // Generate enemy keys list (similar to characters.json, artifacts.json, etc.)
    console.log('Generating enemy keys list...');
    const enemyKeys = Object.keys(gcsimData.English.enemy_names);
    const dataPath = path.join(__dirname, '../src/data/gcsim');

    // Ensure the directory exists
    await fs.promises.mkdir(dataPath, { recursive: true });

    await fs.promises.writeFile(
        path.join(dataPath, 'enemies.json'),
        JSON.stringify(enemyKeys, null, 2) + '\n',
        'utf-8'
    );

    console.log(`✓ Generated enemies.json with ${enemyKeys.length} keys`);

    // Generate proto file
    console.log('Generating enemy.proto file...');
    const protoPath = path.join(__dirname, '../proto/enemy.proto');

    const protoFile = fs.createWriteStream(protoPath, { flags: 'w' });
    protoFile.write('syntax = "proto3";\n\n');
    protoFile.write('package io.leishi.genshin.proto;\n\n');
    protoFile.write('enum Enemy {\n');
    protoFile.write('    ENEMY_UNSPECIFIED = 0;\n');

    // Sort enemy keys alphabetically for consistency
    const sortedEnemyKeys = [...enemyKeys].sort();

    sortedEnemyKeys.forEach((key, index) => {
        const protoKey = key.toUpperCase();
        protoFile.write(`    ${protoKey} = ${index + 1};\n`);
    });

    protoFile.write('}\n');
    protoFile.end();

    console.log(`✓ Generated enemy.proto with ${enemyKeys.length} entries`);
    console.log('Enemy generation completed successfully!');
};

export { generate_enemy };
