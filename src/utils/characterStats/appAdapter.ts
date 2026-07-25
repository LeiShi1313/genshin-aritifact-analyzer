import type { Artifact } from "../../genshin/artifact";
import { AttributePosition, AttributeType } from "../../genshin/attribute";
import { Character } from "../../genshin/character";
import { Set as ArtifactSet } from "../../genshin/set";
import { Weapon } from "../../genshin/weapon";
import { getArtifactMainStatValue } from "../artifactMainStat";
import type {
  ArtifactSlot,
  ArtifactStatInput,
  ArtifactStatKey,
  CharacterSheetLoadout,
  CharacterSheetStats,
  Element,
  EquippedArtifactInput,
} from "./types";

const ARTIFACT_SLOT_BY_POSITION: Partial<
  Record<AttributePosition, ArtifactSlot>
> = {
  [AttributePosition.FLOWER]: "flower",
  [AttributePosition.PLUME]: "plume",
  [AttributePosition.SANDS]: "sands",
  [AttributePosition.GOBLET]: "goblet",
  [AttributePosition.CIRCLET]: "circlet",
};

const ARTIFACT_STAT_BY_ATTRIBUTE: Partial<
  Record<AttributeType, ArtifactStatKey>
> = {
  [AttributeType.HP]: "hpFlat",
  [AttributeType.HP_PERCENT]: "hpPercent",
  [AttributeType.ATK]: "attackFlat",
  [AttributeType.ATK_PERCENT]: "attackPercent",
  [AttributeType.DEF]: "defenseFlat",
  [AttributeType.DEF_PERCENT]: "defensePercent",
  [AttributeType.ELEMENTAL_MASTERY]: "elementalMastery",
  [AttributeType.ENERGY_RECHARGE]: "energyRecharge",
  [AttributeType.CRIT_RATE]: "critRate",
  [AttributeType.CRIT_DAMAGE]: "critDamage",
  [AttributeType.HEALING_BONUS]: "healingBonus",
  [AttributeType.PHYSICAL_DAMAGE_BONUS]: "physicalDamageBonus",
  [AttributeType.ANEMO_DAMAGE_BONUS]: "anemoDamageBonus",
  [AttributeType.CRYO_DAMAGE_BONUS]: "cryoDamageBonus",
  [AttributeType.DENDRO_DAMAGE_BONUS]: "dendroDamageBonus",
  [AttributeType.ELECTRO_DAMAGE_BONUS]: "electroDamageBonus",
  [AttributeType.GEO_DAMAGE_BONUS]: "geoDamageBonus",
  [AttributeType.HYDRO_DAMAGE_BONUS]: "hydroDamageBonus",
  [AttributeType.PYRO_DAMAGE_BONUS]: "pyroDamageBonus",
};

const DAMAGE_ATTRIBUTE_BY_ELEMENT: Readonly<Record<Element, AttributeType>> = {
  anemo: AttributeType.ANEMO_DAMAGE_BONUS,
  cryo: AttributeType.CRYO_DAMAGE_BONUS,
  dendro: AttributeType.DENDRO_DAMAGE_BONUS,
  electro: AttributeType.ELECTRO_DAMAGE_BONUS,
  geo: AttributeType.GEO_DAMAGE_BONUS,
  hydro: AttributeType.HYDRO_DAMAGE_BONUS,
  pyro: AttributeType.PYRO_DAMAGE_BONUS,
};

interface AppCharacterProgressionInput {
  readonly character: Character;
  readonly level: number;
  readonly ascension: number;
}

interface AppWeaponProgressionInput {
  readonly weapon: Weapon;
  readonly level: number;
  readonly ascension: number;
  readonly refinement: number;
}

export interface AppCharacterSheetInput {
  readonly character: AppCharacterProgressionInput;
  readonly weapon?: AppWeaponProgressionInput | null;
  readonly artifacts: readonly (Artifact | undefined)[];
}

export type AppCharacterSheetAdapterIssueCode =
  | "UNSUPPORTED_CHARACTER"
  | "UNSUPPORTED_WEAPON"
  | "UNSUPPORTED_ARTIFACT_POSITION"
  | "MISSING_ARTIFACT_MAIN_STAT"
  | "INVALID_ARTIFACT_RARITY_OR_LEVEL"
  | "UNSUPPORTED_ARTIFACT_SET"
  | "UNSUPPORTED_ARTIFACT_STAT";

export interface AppCharacterSheetAdapterIssue {
  readonly code: AppCharacterSheetAdapterIssueCode;
  readonly artifactIndex?: number;
  readonly sourceValue?: number;
}

export type AppCharacterSheetAdapterResult =
  | {
      readonly status: "ok";
      readonly loadout: CharacterSheetLoadout;
    }
  | {
      readonly status: "invalid";
      readonly issues: readonly AppCharacterSheetAdapterIssue[];
    };

const normalizedEnumKey = (name: string | undefined): string | undefined => {
  if (!name || name === "UNRECOGNIZED" || name.endsWith("_UNSPECIFIED")) {
    return undefined;
  }
  return name.toLowerCase();
};

const adaptArtifactStat = (
  type: AttributeType,
  value: number
): ArtifactStatInput | undefined => {
  const stat = ARTIFACT_STAT_BY_ATTRIBUTE[type];
  return stat ? { stat, value } : undefined;
};

/**
 * Converts this app's generated protobuf records into the calculator's
 * platform-neutral loadout contract. It never guesses unsupported enum values.
 */
export const adaptAppCharacterSheetLoadout = (
  input: AppCharacterSheetInput
): AppCharacterSheetAdapterResult => {
  const issues: AppCharacterSheetAdapterIssue[] = [];
  const characterKey = normalizedEnumKey(Character[input.character.character]);
  if (!characterKey) {
    issues.push({
      code: "UNSUPPORTED_CHARACTER",
      sourceValue: input.character.character,
    });
  }

  const weaponKey = input.weapon
    ? normalizedEnumKey(Weapon[input.weapon.weapon])
    : undefined;
  if (input.weapon && !weaponKey) {
    issues.push({
      code: "UNSUPPORTED_WEAPON",
      sourceValue: input.weapon.weapon,
    });
  }

  const artifacts: EquippedArtifactInput[] = [];
  input.artifacts.forEach((artifact, artifactIndex) => {
    if (!artifact) return;

    const slot = ARTIFACT_SLOT_BY_POSITION[artifact.position];
    if (!slot) {
      issues.push({
        code: "UNSUPPORTED_ARTIFACT_POSITION",
        artifactIndex,
        sourceValue: artifact.position,
      });
    }

    const mainStatKey = artifact.mainAttribute
      ? ARTIFACT_STAT_BY_ATTRIBUTE[artifact.mainAttribute.type]
      : undefined;
    const resolvedMainValue = artifact.mainAttribute
      ? getArtifactMainStatValue(
          artifact.mainAttribute.type,
          artifact.star,
          artifact.level
        )
      : undefined;
    const mainStat =
      mainStatKey && resolvedMainValue !== undefined
        ? { stat: mainStatKey, value: resolvedMainValue }
        : undefined;
    if (!artifact.mainAttribute) {
      issues.push({ code: "MISSING_ARTIFACT_MAIN_STAT", artifactIndex });
    } else if (!mainStatKey) {
      issues.push({
        code: "UNSUPPORTED_ARTIFACT_STAT",
        artifactIndex,
        sourceValue: artifact.mainAttribute.type,
      });
    } else if (resolvedMainValue === undefined) {
      issues.push({
        code: "INVALID_ARTIFACT_RARITY_OR_LEVEL",
        artifactIndex,
      });
    }

    const substats: ArtifactStatInput[] = [];
    for (const substat of artifact.subAttributes) {
      const adapted = adaptArtifactStat(substat.type, substat.value);
      if (!adapted) {
        issues.push({
          code: "UNSUPPORTED_ARTIFACT_STAT",
          artifactIndex,
          sourceValue: substat.type,
        });
        continue;
      }
      substats.push(adapted);
    }

    const setKey = normalizedEnumKey(ArtifactSet[artifact.set]);
    if (!setKey) {
      issues.push({
        code: "UNSUPPORTED_ARTIFACT_SET",
        artifactIndex,
        sourceValue: artifact.set,
      });
    }
    if (!slot || !mainStat || !setKey) return;
    artifacts.push({
      slot,
      setKey,
      mainStat,
      substats,
    });
  });

  if (issues.length > 0 || !characterKey || (input.weapon && !weaponKey)) {
    return { status: "invalid", issues };
  }

  return {
    status: "ok",
    loadout: {
      character: {
        key: characterKey,
        level: input.character.level,
        ascension: input.character.ascension,
      },
      weapon:
        input.weapon && weaponKey
          ? {
              key: weaponKey,
              level: input.weapon.level,
              ascension: input.weapon.ascension,
              refinement: input.weapon.refinement,
            }
          : null,
      artifacts,
    },
  };
};

export interface AppCharacterStatAttribute {
  readonly type: AttributeType;
  readonly value: number;
}

/** Fixed card order: core totals first, then advanced combat stats. */
export const toAppCharacterStatAttributes = (
  stats: CharacterSheetStats,
  element?: Element
): readonly AppCharacterStatAttribute[] => {
  const damageType = element
    ? DAMAGE_ATTRIBUTE_BY_ELEMENT[element]
    : AttributeType.PHYSICAL_DAMAGE_BONUS;
  const damageValue = element
    ? stats.damageBonus[element]
    : stats.damageBonus.physical;

  return Object.freeze([
    { type: AttributeType.HP, value: stats.maxHp },
    { type: AttributeType.ATK, value: stats.attack },
    { type: AttributeType.DEF, value: stats.defense },
    { type: AttributeType.ELEMENTAL_MASTERY, value: stats.elementalMastery },
    { type: AttributeType.CRIT_RATE, value: stats.critRate },
    { type: AttributeType.CRIT_DAMAGE, value: stats.critDamage },
    { type: AttributeType.ENERGY_RECHARGE, value: stats.energyRecharge },
    { type: damageType, value: damageValue },
  ]);
};
