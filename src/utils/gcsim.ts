import { GCSimScript, gCSimScriptEnergySettings_EnergyTypeToJSON, gCSimScriptHurtSettings_HurtTypeToJSON } from "../genshin/gcsim";
import { Character, characterToJSON } from "../genshin/character";
import { Weapon, weaponToJSON } from "../genshin/weapon";
import { Set, setToJSON } from "../genshin/set";
import { AttributeType, attributeTypeToJSON } from "../genshin/attribute";
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
            if (label !== "default") {
                statLine += ` +label=${label}`;
            }
            statLine += ";\n";
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
        result += (target.position.length ? ` pos=${target.position.join(",")}` : "")
            + (target.radius ? ` radius=${target.radius}` : "")
            + (target.level ? ` lvl=${target.level}` : "")
            + (target.resist ? ` resist=${target.resist}` : "")
            + (target.hp ? ` hp=${target.hp}` : "")
            + (target.particleThreshold ? ` particle_threshold=${target.particleThreshold}` : "")
            + (target.particleDropCount ? ` particle_drop_count=${target.particleDropCount}` : "")
            + (target.particleElement ? ` particle_element=${target.particleElement.toString().toLowerCase()}` : "")
            + (target.freezeResist ? ` freeze_resist=${target.freezeResist}` : "")
            + (target.electroResist ? ` electro=${target.electroResist}` : "")
            + (target.hydroResist ? ` hydro=${target.hydroResist}` : "")
            + (target.pyroResist ? ` pyro=${target.pyroResist}` : "")
            + (target.cryoResist ? ` cryo=${target.cryoResist}` : "")
            + (target.dendroResist ? ` dendro=${target.dendroResist}` : "")
            + (target.physicalResist ? ` physical=${target.physicalResist}` : "")
            + (target.anemoResist ? ` anemo=${target.anemoResist}` : "")
            + (target.geoResist ? ` geo=${target.geoResist}` : "")
            + (target.hpMult ? ` hp_mult=${target.hpMult}` : "")
            + ";\n";
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
            + (script.hurtSettings.element ? ` element=${script.hurtSettings.element.toString().toLowerCase()}` : "")
            + ";\n\n";
    }
    result += script.scripts.join("\n");
    return result;
}

export { gcsimScriptToScript };