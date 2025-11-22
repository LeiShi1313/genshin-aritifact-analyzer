import { GCSimScript, gCSimScriptEnergySettings_EnergyTypeToJSON, gCSimScriptHurtSettings_HurtTypeToJSON } from "../genshin/gcsim";
import { Character, characterToJSON } from "../genshin/character";
import { Weapon, weaponToJSON } from "../genshin/weapon";
import { Set, setToJSON } from "../genshin/set";
import { AttributeType, attributeTypeToJSON } from "../genshin/attribute";
import { elementToJSON } from "../genshin/element";
const camelToSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

const characterToGCSimCharacter = (character: Character) => {
    return characterToJSON(character).replace(/_/g, "").toLowerCase();
}
const weaponToGCSimWeapon = (weapon: Weapon) => {
    return weaponToJSON(weapon).replace(/_/g, "").toLowerCase();
}

const setToGCSimSet = (set: Set) => {
    return setToJSON(set).replace(/_/g, "").toLowerCase();
}

const attributeTypeToGCSimStat = (at: AttributeType) => {
    const type = attributeTypeToJSON(at);
    if (type === "PHYSICAL_DAMAGE_BONUS") {
        return "phys%";
    } else if (type.endsWith("DAMAGE_BONUS")) {
        return type.replace("_DAMAGE_BONUS", "%").toLowerCase();
    } else if (type.endsWith("PERCENT")) {
        return type.replace("_PERCENT", "%").toLowerCase();
    } else if (type === "CRIT_RATE") {
        return "cr";
    } else if (type === "CRIT_DAMAGE") {
        return "cd";
    } else if (type === "HEALING_BONUS") {
        return "heal";
    } else if (type === "ELEMENTAL_MASTERY") {
        return "em";
    } else if (type === "ENERGY_RECHARGE") {
        return "er";
    } else {
        return type.toLowerCase();
    }
}
const gcsimScriptToScript = (script: GCSimScript): string => {
    let result = "";

    // Options first
    if (script.options) {
        const optionEntries = Object.entries(script.options)
            .filter(([key, value]) => {
                // Skip undefined/null values
                if (value === undefined || value === null) return false;

                // Skip empty strings
                if (typeof value === 'string' && value.length === 0) return false;

                // Skip default values (matching gcsim defaults)
                if (key === 'defhalt' && value === true) return false;
                if (key === 'hitlag' && value === true) return false;
                if (key === 'workers' && value === 20) return false;
                if (key === 'iteration' && value === 1000) return false;
                if (key === 'swapDelay' && value === 1) return false;
                if (key === 'ignoreBurstEnergy' && value === false) return false;

                // Include booleans that are not defaults
                if (typeof value === 'boolean') return true;

                // Include non-zero numbers
                if (typeof value === 'number' && value > 0) return true;

                // Include non-empty strings
                if (typeof value === 'string') return true;

                return false;
            })
            .map(([key, value]) => `${camelToSnakeCase(key)}=${value}`);

        if (optionEntries.length > 0) {
            result += "options " + optionEntries.join(" ") + ";\n\n";
        }
    }

    // Then characters
    script.characterInfos.map(characterInfo => {
        const char = characterToGCSimCharacter(characterInfo.character);
        let charLine = `${char} char `
            + `lvl=${characterInfo.level}/${characterInfo.maxLevel} `
            + `cons=${characterInfo.constellation} `
            + `talent=${characterInfo.talents.join(",")}`;
        // Add character params if any
        if (characterInfo.params && characterInfo.params.length > 0) {
            charLine += " +params=[" + characterInfo.params.map(param => `${param.key}=${param.value}`).join(",") + "]";
        }
        charLine += ";\n";

        let weaponLine = "";
        if (characterInfo.weaponInfo) {
            weaponLine = `${char} add `
                + `weapon="${weaponToGCSimWeapon(characterInfo.weaponInfo.weapon)}" `
                + `lvl=${characterInfo.weaponInfo.level}/${characterInfo.weaponInfo.maxLevel} `
                + `refine=${characterInfo.weaponInfo.refinement}`;
            if (characterInfo.weaponInfo.params.length > 0) {
                weaponLine += " +params=[" + characterInfo.weaponInfo.params.map(param => `${param.key}=${param.value}`).join(",") + "]";
            }
            weaponLine += ";\n";
        }
        let setLines = [];
        for (let setInfo of characterInfo.setInfos) {
            let setLine = `${char} add set="${setToGCSimSet(setInfo.set)}" count=${setInfo.count}`;
            if (setInfo.params.length > 0) {
                setLine += " +params=[" + setInfo.params.map(param => `${param.key}=${param.value}`).join(",") + "]";
            }
            setLine += ";\n";
            setLines.push(setLine);
        }

        // Group stats by label
        const statsByLabel: Record<string, Record<string, number>> = {};
        for (let stat of characterInfo.stats) {
            const label = stat.label || "default";
            if (!statsByLabel[label]) {
                statsByLabel[label] = {};
            }
            const key = attributeTypeToGCSimStat(stat.type);
            statsByLabel[label][key] = (statsByLabel[label][key] || 0) + stat.value;
        }

        // Generate stat lines
        let statLines = [];
        for (let [label, stats] of Object.entries(statsByLabel)) {
            let statLine = `${char} add stats `
                + Object.entries(stats).map(([key, value]) => `${key}=${value}`).join(" ");
            statLine += ";";
            if (label !== "default") {
                statLine += ` //${label}`;
            }
            statLine += "\n";
            statLines.push(statLine);
        }

        // Add random substats if present
        if (characterInfo.randomSubstats) {
            const rs = characterInfo.randomSubstats;
            let randomLine = `${char} add stats random rarity=${rs.rarity}`;
            if (rs.sand) randomLine += ` sand=${attributeTypeToGCSimStat(rs.sand)}`;
            if (rs.goblet) randomLine += ` goblet=${attributeTypeToGCSimStat(rs.goblet)}`;
            if (rs.circlet) randomLine += ` circlet=${attributeTypeToGCSimStat(rs.circlet)}`;
            randomLine += ";\n";
            statLines.push(randomLine);
        }

        result += charLine + weaponLine + setLines.join("") + statLines.join("") + "\n";
    })
    if (script.energySettings) {
        const intervals = script.energySettings.end
            ? `${script.energySettings.start},${script.energySettings.end}`
            : `${script.energySettings.start}`;
        result += `energy ${gCSimScriptEnergySettings_EnergyTypeToJSON(script.energySettings.type).toLowerCase()} `
            + `interval=${intervals} `
            + `amount=${script.energySettings.amount};\n\n`;
    }
    for (let target of script.targets) {
        result += `target`;
        result += (target.position.length ? ` pos=${target.position.join(",")}` : "")
            + (target.radius ? ` radius=${target.radius}` : "")
            + (target.level ? ` lvl=${target.level}` : "")
            + (target.resist ? ` resist=${target.resist}` : "")
            + (target.hp ? ` hp=${target.hp}` : "")
            + (target.particleThreshold ? ` particle_threshold=${target.particleThreshold}` : "")
            + (target.particleDropCount ? ` particle_drop_count=${target.particleDropCount}` : "")
            + (target.particleElement ? ` particle_element=${target.particleElement.toString().toLowerCase()}` : "")
            + (target.freezeResist ? ` freeze_resist=${target.freezeResist}` : "")
            + (target.electroResist ? ` electro=${target.electroResist}` : "") // Deprecated
            + (target.hydroResist ? ` hydro=${target.hydroResist}` : "") // Deprecated
            + (target.pyroResist ? ` pyro=${target.pyroResist}` : "") // Deprecated
            + (target.cryoResist ? ` cryo=${target.cryoResist}` : "") // Deprecated
            + (target.dendroResist ? ` dendro=${target.dendroResist}` : "") // Deprecated
            + (target.physicalResist ? ` physical=${target.physicalResist}` : "") // Deprecated
            + (target.anemoResist ? ` anemo=${target.anemoResist}` : "") // Deprecated
            + (target.geoResist ? ` geo=${target.geoResist}` : ""); // Deprecated
        if (target.type) {
            result += ` type=${target.type.typeName}`;
            if (target.type.hpMultiplier || target.type.particles !== undefined) {
                result += `[`;
                const params = [];
                if (target.type.hpMultiplier) params.push(`hp_mult=${target.type.hpMultiplier}`);
                if (target.type.particles !== undefined) params.push(`particles=${target.type.particles ? 1 : 0}`);
                result += params.join(",") + `]`;
            }
        }
        result += ";\n";
    }
    if (script.targets.length > 0) {
        result += "\n";
    }

    if (script.hurtSettings) {
        const intervals = script.hurtSettings.end
            ? `${script.hurtSettings.start},${script.hurtSettings.end}`
            : `${script.hurtSettings.start}`;
        result += `hurt ${gCSimScriptHurtSettings_HurtTypeToJSON(script.hurtSettings.type).toLowerCase()} `
            + `interval=${intervals} `
            + `amount=${script.hurtSettings.amount.min},${script.hurtSettings.amount.max}`
            + (script.hurtSettings.element ? ` element=${elementToJSON(script.hurtSettings.element).toString().toLowerCase()}` : "")
            + ";\n\n";
    }
    result += script.scripts.join("\n");
    return result;
}

// Ascension boundaries where maxLevel can be ambiguous
export const ASCENSION_BOUNDARIES = [20, 40, 50, 60, 70, 80, 90, 95] as const;

export interface LevelInfo {
  maxLevel: number;
  isAmbiguous: boolean;
  options: number[];
}

/**
 * Infer maxLevel from level
 * Returns { maxLevel, isAmbiguous, options }
 * - maxLevel: the inferred maxLevel (or lower bound if ambiguous)
 * - isAmbiguous: true if level is at ascension boundary
 * - options: array of possible maxLevel values if ambiguous
 */
export const inferMaxLevel = (level: number): LevelInfo => {
  if (level >= 96) return { maxLevel: 100, isAmbiguous: false, options: [] };
  if (level === 95) return { maxLevel: 95, isAmbiguous: true, options: [95, 100] };
  if (level >= 91) return { maxLevel: 95, isAmbiguous: false, options: [] };
  if (level === 90) return { maxLevel: 90, isAmbiguous: true, options: [90, 95] };
  if (level >= 81) return { maxLevel: 90, isAmbiguous: false, options: [] };
  if (level === 80) return { maxLevel: 80, isAmbiguous: true, options: [80, 90] };
  if (level >= 71) return { maxLevel: 80, isAmbiguous: false, options: [] };
  if (level === 70) return { maxLevel: 70, isAmbiguous: true, options: [70, 80] };
  if (level >= 61) return { maxLevel: 70, isAmbiguous: false, options: [] };
  if (level === 60) return { maxLevel: 60, isAmbiguous: true, options: [60, 70] };
  if (level >= 51) return { maxLevel: 60, isAmbiguous: false, options: [] };
  if (level === 50) return { maxLevel: 50, isAmbiguous: true, options: [50, 60] };
  if (level >= 41) return { maxLevel: 50, isAmbiguous: false, options: [] };
  if (level === 40) return { maxLevel: 40, isAmbiguous: true, options: [40, 60] };
  if (level >= 21) return { maxLevel: 40, isAmbiguous: false, options: [] };
  if (level === 20) return { maxLevel: 20, isAmbiguous: true, options: [20, 40] };
  return { maxLevel: 20, isAmbiguous: false, options: [] };
};

export { gcsimScriptToScript };