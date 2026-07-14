import fs from "fs";
import path from "path";
import { URL } from "url";
import { GCSim, GCSimScript, GCSimScriptCharacterStat, GCSimScriptCharacterInfo, GCSimScriptOptions, GCSimScriptParam, GCSimScriptSetInfo, GCSimScriptWeaponInfo, GCSimScriptEnergySettings, GCSimScriptEnergySettings_EnergyType, gCSimScriptEnergySettings_EnergyTypeFromJSON, GCSimScriptTarget, GCSimScriptHurtSettings, gCSimScriptHurtSettings_HurtTypeFromJSON } from '../genshin/gcsim.js';
import { elementFromJSON } from "../genshin/element.js";
import { Character, characterFromJSON } from "../genshin/character.js";
import { Weapon, weaponFromJSON } from '../genshin/weapon.js';
import { Set, setFromJSON } from '../genshin/set.js';
import GCSIM_CHARACTER_ALIASES from '../src/data/gcsim/characters-aliases.json' assert { type: "json" };
import GCSIM_WEAPON_ALIASES from '../src/data/gcsim/weapons-aliases.json' assert { type: "json" };
import GCSIM_SET_ALIASES from '../src/data/gcsim/artifacts-aliases.json' assert { type: "json" };
import CHARACTERS from '../src/data/characters.json' assert { type: "json" };
import WEAPONS from '../src/data/weapons.json' assert { type: "json" };
import SETS from '../src/data/sets.json' assert { type: "json" };

const __dirname = new URL('.', import.meta.url).pathname;
const gcsimCharRegx = /\s*(?<char>\w+)\s+((?<ch>char)|add\s+(?<stats>stats)|add\s+(?<ws>weapon|set)\s*=\s*\"(?<wsname>\w+)\")\s+(?<attrs>.*?)\s*;/gm;
const gcsimEnergyRegx = /\s*energy\s+(?<type>once|every)\s+(?<attrs>.*?)\s*;/gm;
const gcsimTargetRegx =
    /^[ \t]*target(?:[ \t]+(?<attrs>.*?))?[ \t]*;[ \t]*$/gm;
const gcsimHurtRegx = /\s*hurt\s+(?<type>once|every)\s+(?<attrs>.*?)\s*;/gm;
const gcsimOptionsRegx = /\s*options\s+(?<attrs>.*?);/gm;
const gcsimParamsRegx = /\s*\+params\s*=\s*\[(?<params>.*?)\]/gm;
const gcsimKeyValRegx =
    /(?<key>[\w_%]+)\s*=\s*(?<value>true|false|\d+\/\d+|[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?(?:\s*,\s*[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?){0,2}|[\w_]+)\s*/gm;
const gcsimTargetTypeRegx = /type\s*=\s*(?<typename>\w+)(?:\[(?<params>[^\]]+)\])?/;

// Convert snake_case to camelCase
const snakeToCamelCase = (str: string) => str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
const statMap: { [key: string]: string } = {
    hp: "HP",
    atk: "ATK",
    def: "DEF",
    em: "ELEMENTAL_MASTERY",
    er: "ENERGY_RECHARGE",
    "hp%": "HP_PERCENT",
    "atk%": "ATK_PERCENT",
    "def%": "DEF_PERCENT",
    cr: "CRIT_RATE",
    cd: "CRIT_DAMAGE",
    heal: "HEALING_BONUS",
    "anemo%": "ANEMO_DAMAGE_BONUS",
    "cryo%": "CRYO_DAMAGE_BONUS",
    "dendro%": "DENDRO_DAMAGE_BONUS",
    "electro%": "ELECTRO_DAMAGE_BONUS",
    "geo%": "GEO_DAMAGE_BONUS",
    "hydro%": "HYDRO_DAMAGE_BONUS",
    "physical%": "PHYSICAL_DAMAGE_BONUS",
    "phys%": "PHYSICAL_DAMAGE_BONUS",
    "pyro%": "PYRO_DAMAGE_BONUS",
}

const weaponNameOverrides: Record<string, string> = {
    rainbowserpentbow: "rainbow_serpents_rain_bow",
};

const characterNameOverrides: Record<string, string> = {
    yaemiko: "yae_miko",
    raiden: "raiden_shogun",
    hutao: "hu_tao",
    yunjin: "yun_jin",
    kuki: "kuki_shinobu",
};

const resolveAlias = (
    kind: string,
    alias: string | undefined,
    aliases: Record<string, string>,
    sourceId: string,
): string => {
    if (!alias || !(alias in aliases)) {
        throw new Error(`${sourceId}: unknown ${kind} alias "${alias ?? ""}"`);
    }
    return aliases[alias];
};


const gcsimCharacterToCharacter = (char: string, sourceId: string): Character => {
    let appKey = characterNameOverrides[char];
    if (char.includes("lumine")) {
        appKey = char.replace("lumine", "traveler_");
    } else if (char.includes("aether")) {
        appKey = char.replace("aether", "traveler_");
    } else if (!appKey) {
        appKey = Object.keys(CHARACTERS).find(
            key => key.toLowerCase() === char.toLowerCase(),
        ) ?? Object.keys(CHARACTERS).find(
            key => key.toLowerCase().includes(char.toLowerCase()),
        );
    }

    const character = characterFromJSON((appKey ?? char).toUpperCase());
    if (character === Character.UNRECOGNIZED) {
        throw new Error(
            `${sourceId}: GCSIM character "${char}" is not available in app data`,
        );
    }
    return character;
}
const gcsimWeaponToWeapon = (weapon: string, sourceId: string): Weapon => {
    const override = weaponNameOverrides[weapon];
    if (override) {
        return weaponFromJSON(override.toUpperCase());
    }
    for (let key of Object.keys(WEAPONS) as string[]) {
        if (key.replaceAll("_", "") === weapon) {
            return weaponFromJSON(key.toUpperCase());
        }
    }
    throw new Error(`${sourceId}: GCSIM weapon "${weapon}" is not available in app data`);
}
const gcsimSetToSet = (set: string, sourceId: string): Set => {
    for (let key of Object.keys(SETS)) {
        if (key.replaceAll("_", "") === set) {
            return setFromJSON(key.toUpperCase());
        }
    }
    throw new Error(`${sourceId}: GCSIM artifact set "${set}" is not available in app data`);
}

const parseParams = (line: string): GCSimScriptParam[] => {
    const params: GCSimScriptParam[] = [];
    for (let match of line.matchAll(gcsimParamsRegx)) {
        for (let param of match.groups?.params?.matchAll(gcsimKeyValRegx) ?? []) {
            if (param.groups?.key && param.groups.value) {
                params.push(GCSimScriptParam.fromJSON({
                    key: param.groups.key,
                    value: param.groups.value
                }));
            }
        }
    }
    return params;
}

const parseStats = (line: string): GCSimScriptCharacterStat[] => {
    const stats = [];
    let label: string | undefined;

    // Check for +label=xxx
    const labelMatch = line.match(/\+label\s*=\s*(\w+)/);
    if (labelMatch) {
        label = labelMatch[1];
        line = line.replace(/\+label\s*=\s*\w+/, ''); // Remove label from line
    }

    for (let match of line.matchAll(gcsimKeyValRegx)) {
        if (match.groups?.key && statMap.hasOwnProperty(match.groups?.key)) {
            stats.push(GCSimScriptCharacterStat.fromJSON({
                type: statMap[match.groups.key],
                value: parseFloat(match.groups.value),
                label: label
            }));
        } else {
            console.log(`Unknown stat key: ${match.groups?.key}`);
        }
    }
    return stats;
}

const parseRandomSubstats = (line: string) => {
    const randomSubstats: any = {
        rarity: 5 // default to 5
    };

    for (let match of line.matchAll(gcsimKeyValRegx)) {
        if (match.groups?.key === 'rarity') {
            randomSubstats.rarity = parseInt(match.groups.value);
        } else if (match.groups?.key === 'sand') {
            const statKey = match.groups.value;
            if (statMap.hasOwnProperty(statKey)) {
                randomSubstats.sand = statMap[statKey];
            }
        } else if (match.groups?.key === 'goblet') {
            const statKey = match.groups.value;
            if (statMap.hasOwnProperty(statKey)) {
                randomSubstats.goblet = statMap[statKey];
            }
        } else if (match.groups?.key === 'circlet') {
            const statKey = match.groups.value;
            if (statMap.hasOwnProperty(statKey)) {
                randomSubstats.circlet = statMap[statKey];
            }
        }
    }

    return randomSubstats;
}

const parseSetInfo = (wsname: string, line: string, sourceId: string): GCSimScriptSetInfo => {
    const setInfo: GCSimScriptSetInfo = {
        count: 0,
        set: gcsimSetToSet(wsname, sourceId),
        params: parseParams(line),
    }
    line = line.replace(gcsimParamsRegx, "");
    for (let match of line.matchAll(gcsimKeyValRegx)) {
        if (match.groups?.key === "count") {
            setInfo.count = parseInt(match.groups.value);
        } else {
            console.log(`Unknown set info key: ${match.groups?.key}`);
        }
    }
    return setInfo;
}

const parseWeaponInfo = (wsname: string, line: string, sourceId: string) => {
    const weaponInfo: GCSimScriptWeaponInfo = {
        weapon: gcsimWeaponToWeapon(wsname, sourceId),
        level: 0,
        maxLevel: 0,
        refinement: 0,
        params: parseParams(line),
    }
    line = line.replace(gcsimParamsRegx, "");
    for (let match of line.matchAll(gcsimKeyValRegx)) {
        if (match.groups?.key === "lvl") {
            const [level, maxLevel] = match.groups.value.split("/");
            weaponInfo.level = parseInt(level);
            weaponInfo.maxLevel = parseInt(maxLevel);
        } else if (match.groups?.key === "refine") {
            weaponInfo.refinement = parseInt(match.groups.value);
        } else {
            console.log(`Unknown weapon info key: ${match.groups?.key}`);
        }
    }
    return weaponInfo;
}

const parseOptions = (script: string, parsedScript: GCSimScript) => {
    // Set gcsim defaults (matching gcsim/pkg/gcs/parser/parser.go:48-52)
    const allOptions: { [key: string]: any } = {
        defhalt: true,      // default defhalt to true
        hitlag: true,       // default hitlag enabled
        workers: 20,        // default 20 workers
        iteration: 1000,    // default 1000 iterations
        swapDelay: 1,       // default swap timer of 1
    };

    for (let match of script.matchAll(gcsimOptionsRegx)) {
        for (let attr of match.groups?.attrs.matchAll(gcsimKeyValRegx) ?? []) {
            if (attr.groups?.key && attr.groups.value) {
                const snakeKey = attr.groups.key as string;
                const camelKey = snakeToCamelCase(snakeKey);
                let value: any = attr.groups.value;

                // Handle boolean values
                if (value === 'true' || value === 'false') {
                    value = value === 'true';
                }
                // Handle numeric values
                else if (!isNaN(Number(value))) {
                    value = Number(value);
                }
                // Otherwise keep as string (e.g., frame_defaults)

                allOptions[camelKey] = value;
            }
        }
    }

    parsedScript.options = GCSimScriptOptions.fromJSON(allOptions);

    script = script.replace(gcsimOptionsRegx, "");
    return script;
}
const parseCharacters = (script: string, parsedScript: GCSimScript, sourceId: string) => {
    const characters: { [key: string]: GCSimScriptCharacterInfo } = {};
    for (let match of script.matchAll(gcsimCharRegx)) {
        const char = resolveAlias(
            "character",
            match.groups?.char,
            GCSIM_CHARACTER_ALIASES,
            sourceId,
        );
        if (!(char in characters)) {
            characters[char] = {
                character: gcsimCharacterToCharacter(char, sourceId),
                level: 0,
                maxLevel: 0,
                constellation: 0,
                talents: [],
                weaponInfo: undefined,
                setInfos: [],
                stats: [],
                params: [],
                startHp: 0,
                randomSubstats: undefined,
            };
        }
        if (match.groups.ch) {
            let attrs = match.groups.attrs;
            characters[char].params = parseParams(attrs);
            attrs = attrs.replace(gcsimParamsRegx, "");

            let [hasLevel, hasCons, hasTalents] = [false, false, false];
            for (let attr of attrs.matchAll(gcsimKeyValRegx)) {
                if (attr.groups?.key === "lvl") {
                    const [level, maxLevel] = attr.groups.value.split("/");
                    characters[char].level = parseInt(level);
                    characters[char].maxLevel = parseInt(maxLevel);
                    hasLevel = true;
                } else if (attr.groups?.key === "cons") {
                    characters[char].constellation = parseInt(attr.groups.value);
                    hasCons = true;
                } else if (attr.groups?.key === "talent") {
                    const talents = attr.groups.value.split(",");
                    characters[char].talents = talents.map(talent => parseInt(talent));
                    hasTalents = true;
                } else if (attr.groups?.key === "start_hp") {
                    characters[char].startHp = parseInt(attr.groups.value);
                }
            }
            if (!hasLevel || !hasCons || !hasTalents) {
                console.log(`Character ${char} missing level/constellation/talents: ${attrs}`);
            }
        } else if (match.groups.stats) {
            const attrs = match.groups.attrs;
            // Check if it's random substats
            if (attrs.includes('random')) {
                characters[char].randomSubstats = parseRandomSubstats(attrs);
            } else {
                parseStats(attrs).forEach(stat => {
                    characters[char].stats.push(stat);
                })
            }
        } else if (match.groups.ws === "weapon") {
            const weapon = resolveAlias(
                "weapon",
                match.groups.wsname,
                GCSIM_WEAPON_ALIASES,
                sourceId,
            );
            characters[char].weaponInfo = parseWeaponInfo(weapon, match.groups.attrs, sourceId);
        } else if (match.groups.ws === "set") {
            const set = resolveAlias(
                "artifact set",
                match.groups.wsname,
                GCSIM_SET_ALIASES,
                sourceId,
            );
            characters[char].setInfos.push(parseSetInfo(set, match.groups.attrs, sourceId));
        } else {
            console.log(`Unknown character type: ${match.groups.type}`);
        }
    }
    parsedScript.characterInfos = Object.values(characters);
    script = script.replace(gcsimCharRegx, "");
    return script;
}

const parseEnergy = (script: string, parsedScript: GCSimScript) => {
    for (let match of script.matchAll(gcsimEnergyRegx)) {
        const energy: GCSimScriptEnergySettings = { type: 0, start: 0, amount: 0 };
        energy.type = gCSimScriptEnergySettings_EnergyTypeFromJSON(match.groups?.type.toUpperCase());
        for (let attr of match.groups?.attrs.matchAll(gcsimKeyValRegx) ?? []) {
            if (attr.groups?.key === "interval") {
                const intervals = attr.groups.value.split(",").map(interval => parseInt(interval));
                energy.start = intervals[0];
                if (intervals.length > 1) {
                    energy.end = intervals[1];
                }
            } else if (attr.groups?.key === "amount") {
                energy.amount = parseInt(attr.groups.value);
            } else {
                console.log(`Unknown energy key: ${attr.groups?.key}`);
            }
        }
        parsedScript.energySettings = energy;
    }
    script = script.replace(gcsimEnergyRegx, "");
    return script;
}
const parseTarget = (script: string, parsedScript: GCSimScript) => {
    const targets = [];
    for (let match of script.matchAll(gcsimTargetRegx)) {
        const target: GCSimScriptTarget = {
            position: [],
            radius: 0,
            level: 0,
            resist: 0,
            hp: 0,
            particleThreshold: 0,
            particleDropCount: 0,
            freezeResist: 0,
            electroResist: 0,
            hydroResist: 0,
            pyroResist: 0,
            cryoResist: 0,
            dendroResist: 0,
            physicalResist: 0,
            anemoResist: 0,
            geoResist: 0,
        };

        let attrs = match.groups?.attrs ?? "";

        // Parse target type if present (e.g., type=aeonblightdrake[hp_mult=3.00])
        const typeMatch = attrs.match(gcsimTargetTypeRegx);
        if (typeMatch?.groups?.typename) {
            const targetType: any = {
                typeName: typeMatch.groups.typename
            };

            // Parse type parameters if present
            if (typeMatch.groups.params) {
                for (let param of typeMatch.groups.params.matchAll(gcsimKeyValRegx)) {
                    if (param.groups?.key === "hp_mult") {
                        targetType.hpMultiplier = parseFloat(param.groups.value);
                    } else if (param.groups?.key === "particles") {
                        targetType.particles = parseInt(param.groups.value) !== 0;
                    }
                }
            }

            target.type = targetType;
            // Remove type from attrs to avoid parsing it again
            attrs = attrs.replace(gcsimTargetTypeRegx, '');
        }

        for (let attr of attrs.matchAll(gcsimKeyValRegx)) {
            if (attr.groups?.key === "pos") {
                target.position = attr.groups.value.split(",").map(pos => parseFloat(pos));
            } else if (attr.groups?.key === "radius") {
                target.radius = parseFloat(attr.groups.value);
            } else if (attr.groups?.key === "lvl") {
                target.level = parseInt(attr.groups.value);
            } else if (attr.groups?.key === "resist") {
                target.resist = parseFloat(attr.groups.value);
            } else if (attr.groups?.key === "hp") {
                target.hp = parseFloat(attr.groups.value);
            } else if (attr.groups?.key === "particle_threshold") {
                target.particleThreshold = parseInt(attr.groups.value);
            } else if (attr.groups?.key === "particle_drop_count") {
                target.particleDropCount = parseInt(attr.groups.value);
            } else if (attr.groups?.key === "particle_element") {
                target.particleElement = elementFromJSON(attr.groups.value.toUpperCase());
            } else if (attr.groups?.key === "freeze_resist") {
                target.freezeResist = parseFloat(attr.groups.value);
            } else if (attr.groups?.key === "electro") {
                target.electroResist = parseFloat(attr.groups.value);
            } else if (attr.groups?.key === "hydro") {
                target.hydroResist = parseFloat(attr.groups.value);
            } else if (attr.groups?.key === "pyro") {
                target.pyroResist = parseFloat(attr.groups.value);
            } else if (attr.groups?.key === "cryo") {
                target.cryoResist = parseFloat(attr.groups.value);
            } else if (attr.groups?.key === "dendro") {
                target.dendroResist = parseFloat(attr.groups.value);
            } else if (attr.groups?.key === "physical") {
                target.physicalResist = parseFloat(attr.groups.value);
            } else if (attr.groups?.key === "anemo") {
                target.anemoResist = parseFloat(attr.groups.value);
            } else if (attr.groups?.key === "geo") {
                target.geoResist = parseFloat(attr.groups.value);
            } else if (attr.groups?.key === "hp_mult") {
                target.hpMult = parseFloat(attr.groups.value);
            } else {
                console.log(`Unknown target key: ${attr.groups?.key}`);
            }
        }
        targets.push(target);
    }
    parsedScript.targets = targets;
    script = script.replace(gcsimTargetRegx, "");
    return script;
}

const parseHurt = (script: string, parsedScript: GCSimScript) => {
    for (let match of script.matchAll(gcsimHurtRegx)) {
        const hurt: GCSimScriptHurtSettings = { type: 0, start: 0, amount: { min: 0, max: 0 }, element: 0 };
        hurt.type = gCSimScriptHurtSettings_HurtTypeFromJSON(match.groups?.type.toUpperCase());
        for (let attr of match.groups?.attrs.matchAll(gcsimKeyValRegx) ?? []) {
            if (attr.groups?.key === "interval") {
                const intervals = attr.groups.value.split(",").map(interval => parseInt(interval));
                hurt.start = intervals[0];
                if (intervals.length > 1) {
                    hurt.end = intervals[1];
                }
            } else if (attr.groups?.key === "amount") {
                const amounts = attr.groups.value.split(",").map(amount => parseFloat(amount));
                hurt.amount = {
                    min: amounts[0],
                    max: amounts[1],
                }
            } else if (attr.groups?.key === "element") {
                hurt.element = elementFromJSON(attr.groups.value.toUpperCase());
            } else {
                console.log(`Unknown hurt key: ${attr.groups?.key}`);
            }
        }
        parsedScript.hurtSettings = hurt;
    }
    script = script.replace(gcsimHurtRegx, "");
    return script;
}


const parseScript = (script: string, sourceId = "<inline>"): GCSimScript => {
    const parsedScript: GCSimScript = {
        options: undefined,
        characterInfos: [],
        targets: [],
        energySettings: undefined,
        hurtSettings: undefined,
        scripts: [],
    };
    // Remove comments starting with # or //
    script = script.replace(/\s*#.*$/gm, "");
    script = script.replace(/\/\/.*$/gm, "");
    script = parseOptions(script, parsedScript);
    script = parseCharacters(script, parsedScript, sourceId);
    script = parseEnergy(script, parsedScript);
    script = parseTarget(script, parsedScript);
    script = parseHurt(script, parsedScript);

    parsedScript.scripts = script.split("\n").filter(line => line.trim() !== "");
    return parsedScript;
}

const listScriptFiles = async (directory: string): Promise<string[]> => {
    const entries = await fs.promises.readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
        if (!entry.isFile()) {
            throw new Error(`unexpected entry in GCSIM script snapshot: "${entry.name}"`);
        }
        if (entry.name.endsWith(".txt") || entry.name.endsWith(".gen")) {
            throw new Error(`legacy GCSIM script file "${entry.name}"`);
        }
    }
    return entries.map(entry => entry.name).sort();
};

const parseScripts = async (): Promise<GCSim> => {
    const scripts: Array<GCSimScript> = [];
    const directory = path.join(__dirname, "../public/gcsim/scripts");
    const files = await listScriptFiles(directory);
    for (const file of files) {
        const script = await fs.promises.readFile(path.join(directory, file), "utf-8");
        scripts.push(parseScript(script, file));
    }
    return { scripts };
}

// Export parseScript for testing
export { gcsimCharacterToCharacter, listScriptFiles, parseScript };

// Only run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
    parseScripts().then(async gcsim => {
        console.log(`Parsed ${gcsim.scripts.length} scripts`);
        await fs.promises.writeFile(path.join(__dirname, "../public/gcsim/gcsim.bin"), GCSim.encode(gcsim).finish());
    });
}
