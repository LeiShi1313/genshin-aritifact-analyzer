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
    if (type.endsWith("DAMAGE_BONUS")) {
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
    script.characterInfos.map(characterInfo => {
        const char = characterToGCSimCharacter(characterInfo.character);
        let charLine = `${char} char `
            + `lvl=${characterInfo.level}/${characterInfo.maxLevel} `
            + `cons=${characterInfo.constellation} `
            + `talent=${characterInfo.talents.join(",")};\n`
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
        const stats: Record<string, number> = {};
        for (let stat of characterInfo.stats) {
            const key = attributeTypeToGCSimStat(stat.type);
            stats[key] = stats[key] ? stats[key] + stat.value : stat.value;
        }
        let statLine = `${char} add stats `
            + Object.entries(stats).map(([key, value]) => `${key}=${value}`).join(" ")
            + ";\n";
        result += charLine + weaponLine + setLines.join("\n") + statLine + "\n";
    })

    if (script.options) {
        result += "options " + Object.entries(script.options).filter(([_, value]) => value || value > 0).map(([key, value]) => `${camelToSnakeCase(key)}=${value}`).join(" ") + ";\n\n";
    }
    if (script.energySettings) {
        result += `energy ${gCSimScriptEnergySettings_EnergyTypeToJSON(script.energySettings.type).toLowerCase()} `
            + `interval=${script.energySettings.intervals.join(",")} `
            + `amount=${script.energySettings.amount};\n\n`;
    }
    for (let target of script.targets) {
        result += `target`
            + (target.position.length ? ` pos=${target.position.join(",")}` : "")
            + (target.radius ? ` radius=${target.radius}` : "")
            + (target.level ? ` lvl=${target.level}` : "")
            + (target.resist ? ` resist=${target.resist}` : "")
            + (target.intervals.length ? ` interval=${target.intervals.join(",")}` : "")
            + (target.hp ? ` hp=${target.hp}` : "")
            + (target.amount ? ` amount=${target.amount}` : "")
            + (target.particleThreshold ? ` particle_threshold=${target.particleThreshold}` : "")
            + (target.particleDropCount ? ` particle_drop_count=${target.particleDropCount}` : "")
            + (target.freezeResist ? ` freeze_resist=${target.freezeResist}` : "")
            + (target.electroResist ? ` electro=${target.electroResist}` : "")
            + (target.hydroResist ? ` hydro=${target.hydroResist}` : "")
            + (target.pyroResist ? ` pyro=${target.pyroResist}` : "")
            + (target.cryoResist ? ` cryo=${target.cryoResist}` : "")
            + (target.dendroResist ? ` dendro=${target.dendroResist}` : "")
            + (target.physicalResist ? ` physical=${target.physicalResist}` : "")
            + (target.anemoResist ? ` anemo=${target.anemoResist}` : "")
            + (target.geoResist ? ` geo=${target.geoResist}` : "")
            + ";\n";
    }
    if (script.targets.length > 0) {
        result += "\n";
    }
    
    if (script.hurtSettings) {
        result += `hurt ${gCSimScriptHurtSettings_HurtTypeToJSON(script.hurtSettings.type).toLowerCase()} `
            + `interval=${script.hurtSettings.intervals.join(",")} `
            + `amount=${script.hurtSettings.amount};\n\n`;
    }
    result += script.scripts.join("\n");
    return result;
}

export { gcsimScriptToScript };