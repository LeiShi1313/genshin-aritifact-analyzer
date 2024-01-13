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
const gcsimTargetRegx = /\s*target\s+(?<attrs>.*?)\s*;/gm;
const gcsimHurtRegx = /\s*hurt\s+(?<type>once|every)\s+(?<attrs>.*?)\s*;/gm;
const gcsimOptionsRegx = /\s*options\s+(?<attrs>.*?);/gm;
const gcsimParamsRegx = /\s*\+params\s*=\s*\[(?<params>.*?)\]/gm;
const gcsimKeyValRegx = /(?<key>[\w_%]+)\s*=\s*(?<value>\d+\s*,\s*\d+\s*,\s*\d+|[\d*\.*\d+]+\s*,\s*[\d*\.*\d+]+|\d+\/\d+|\d*\.*\d+|\d+)\s*/gm;
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


const gcsimCharacterToCharacter = (char: string): Character => {
    if (char === "yaemiko") {
        return characterFromJSON("YAE_MIKO")
    } else if (char === "raiden") {
        return characterFromJSON("RAIDEN_SHOGUN")
    } else if (char === "hutao") {
        return characterFromJSON("HU_TAO")
    } else if (char === "yunjin") {
        return characterFromJSON("YUN_JIN")
    } else if (char === "kuki") {
        return characterFromJSON("KUKI_SHINOBU")
    } else if (char.includes("lumine")) {
        char = char.replace("lumine", "traveler_");
        return characterFromJSON(char.toUpperCase());
    } else if (char.includes("aether")) {
        char = char.replace("aether", "traveler_");
        return characterFromJSON(char.toUpperCase());
    }
    for (let key of Object.keys(CHARACTERS)) {
        if (key.toLowerCase() === char.toLowerCase()) {
            return characterFromJSON(key.toUpperCase());
        } else if (key.toLowerCase().includes(char.toLowerCase())) {
            return characterFromJSON(key.toUpperCase());
        }

    }
    console.log(`Unknown character ${char}`);
    return characterFromJSON(char.toUpperCase());
}
const gcsimWeaponToWeapon = (weapon: string): Weapon => {
    for (let key of Object.keys(WEAPONS) as string[]) {
        if (key.replaceAll("_", "") === weapon) {
            return weaponFromJSON(key.toUpperCase());
        }
    }
    console.log(`Unknown weapon ${weapon}`);
    return weaponFromJSON(weapon.toUpperCase());
}
const gcsimSetToSet = (set: string): Set => {
    for (let key of Object.keys(SETS)) {
        if (key.replaceAll("_", "") === set) {
            return setFromJSON(key.toUpperCase());
        }
    }
    console.log(`Unknown set ${set}`);
    return setFromJSON(set.toUpperCase());
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
    for (let match of line.matchAll(gcsimKeyValRegx)) {
        if (match.groups?.key && statMap.hasOwnProperty(match.groups?.key)) {
            stats.push(GCSimScriptCharacterStat.fromJSON({
                type: statMap[match.groups.key],
                value: parseFloat(match.groups.value)
            }));
        } else {
            console.log(`Unknown stat key: ${match.groups?.key}`);
        }
    }
    return stats;
}
const parseSetInfo = (wsname: string, line: string): GCSimScriptSetInfo => {
    const setInfo: GCSimScriptSetInfo = {
        count: 0,
        set: gcsimSetToSet(wsname),
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

const parseWeaponInfo = (wsname: string, line: string) => {
    const weaponInfo: GCSimScriptWeaponInfo = {
        weapon: gcsimWeaponToWeapon(wsname),
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
    for (let match of script.matchAll(gcsimOptionsRegx)) {
        const options: { [key: string]: any } = {};
        for (let attr of match.groups?.attrs.matchAll(gcsimKeyValRegx) ?? []) {
            if (attr.groups?.key && attr.groups.value) {
                options[attr.groups.key as string] = attr.groups?.value;
            }
        }
        parsedScript.options = GCSimScriptOptions.fromJSON(options);
    }
    script = script.replace(gcsimOptionsRegx, "");
    return script;
}
const parseCharacters = (script: string, parsedScript: GCSimScript) => {
    const characters: { [key: string]: GCSimScriptCharacterInfo } = {};
    for (let match of script.matchAll(gcsimCharRegx)) {
        if (!match.groups?.char || !(match.groups?.char in GCSIM_CHARACTER_ALIASES)) {
            console.log(`Unknown character: ${match.groups?.char}`);
            continue;
        }
        const char: string = (GCSIM_CHARACTER_ALIASES as any)[match.groups.char];
        if (!(char in characters)) {
            characters[char] = {
                character: gcsimCharacterToCharacter(char),
                level: 0,
                maxLevel: 0,
                constellation: 0,
                talents: [],
                weaponInfo: undefined,
                setInfos: [],
                stats: [],
                params: [],
                startHp: 0,
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
                }
            }
            if (!hasLevel || !hasCons || !hasTalents) {
                console.log(`Character ${char} missing level/constellation/talents: ${attrs}`);
            }
        } else if (match.groups.stats) {
            parseStats(match.groups.attrs).forEach(stat => {
                characters[char].stats.push(stat);
            })
        } else if (match.groups.ws === "weapon") {
            characters[char].weaponInfo = parseWeaponInfo((GCSIM_WEAPON_ALIASES as any)[match.groups.wsname], match.groups.attrs);
        } else if (match.groups.ws === "set") {
            characters[char].setInfos.push(parseSetInfo((GCSIM_SET_ALIASES as any)[match.groups.wsname], match.groups.attrs));
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
        const energy: GCSimScriptEnergySettings = { type: 0, intervals: [], amount: 0 };
        energy.type = gCSimScriptEnergySettings_EnergyTypeFromJSON(match.groups?.type.toUpperCase());
        for (let attr of match.groups?.attrs.matchAll(gcsimKeyValRegx) ?? []) {
            if (attr.groups?.key === "interval") {
                energy.intervals = attr.groups.value.split(",").map(interval => parseInt(interval));
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
        if (!match.groups?.attrs) {
            continue;
        }
        const target: GCSimScriptTarget = {
            position: [],
            radius: 0,
            level: 0,
            resist: 0,
            intervals: [],
            hp: 0,
            amount: 0,
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
        for (let attr of match.groups?.attrs.matchAll(gcsimKeyValRegx)) {
            if (attr.groups?.key === "pos") {
                target.position = attr.groups.value.split(",").map(pos => parseFloat(pos));
            } else if (attr.groups?.key === "radius") {
                target.radius = parseFloat(attr.groups.value);
            } else if (attr.groups?.key === "lvl") {
                target.level = parseInt(attr.groups.value);
            } else if (attr.groups?.key === "resist") {
                target.resist = parseFloat(attr.groups.value);
            } else if (attr.groups?.key === "intervals") {
                target.intervals = attr.groups.value.split(",").map(interval => parseInt(interval));
            } else if (attr.groups?.key === "hp") {
                target.hp = parseFloat(attr.groups.value);
            } else if (attr.groups?.key === "amount") {
                target.amount = parseInt(attr.groups.value);
            } else if (attr.groups?.key === "particle_threshold") {
                target.particleThreshold = parseInt(attr.groups.value);
            } else if (attr.groups?.key === "particle_drop_count") {
                target.particleDropCount = parseInt(attr.groups.value);
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
        const hurt: GCSimScriptHurtSettings = { type: 0, intervals: [], amount: { min: 0, max: 0 }, element: 0 };
        hurt.type = gCSimScriptHurtSettings_HurtTypeFromJSON(match.groups?.type.toUpperCase());
        for (let attr of match.groups?.attrs.matchAll(gcsimKeyValRegx) ?? []) {
            if (attr.groups?.key === "interval") {
                hurt.intervals = attr.groups.value.split(",").map(interval => parseInt(interval));
            } else if (attr.groups?.key === "amount") {
                const amounts = attr.groups.value.split(",").map(amount => parseInt(amount));
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


const parseScript = (script: string): GCSimScript => {
    const parsedScript: GCSimScript = {
        options: undefined,
        characterInfos: [],
        targets: [],
        energySettings: undefined,
        hurtSettings: undefined,
        scripts: [],
    };
    script = script.replace(/\s*#.*$/gm, "");
    script = parseOptions(script, parsedScript);
    script = parseCharacters(script, parsedScript);
    script = parseEnergy(script, parsedScript);
    script = parseTarget(script, parsedScript);
    script = parseHurt(script, parsedScript);

    parsedScript.scripts = script.split("\n").filter(line => line.trim() !== "");
    return parsedScript;
}

const parseScripts = async (): Promise<GCSim> => {
    const scripts: Array<GCSimScript> = [];
    const files = await fs.promises.readdir(path.join(__dirname, "../public/gcsim/scripts"))
    for (const file of files) {
        const script = await fs.promises.readFile(path.join(__dirname, "../public/gcsim/scripts", file), "utf-8");
        scripts.push(parseScript(script));
    }
    return { scripts };
}
parseScripts().then(async gcsim => {
    console.log(`Parsed ${gcsim.scripts.length} scripts`);
    await fs.promises.writeFile(path.join(__dirname, "../public/gcsim/gcsim.bin"), GCSim.encode(gcsim).finish());
})