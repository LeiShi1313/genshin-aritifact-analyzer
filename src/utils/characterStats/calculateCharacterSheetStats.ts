import {
  CHARACTER_CONSTANT_RULES,
  WEAPON_CONSTANT_RULES,
} from "./internal/rules/constantRules";
import {
  characterProgression,
  progressionManifest,
  weaponProgression,
} from "./internal/progression";
import type {
  ArtifactSlot,
  ArtifactStatKey,
  CharacterSheetIssue,
  CharacterSheetLoadout,
  CharacterSheetResult,
  ConstantEffectStat,
  Element,
  ProgressionStatKey,
} from "./types";

const ELEMENTS: readonly Element[] = [
  "anemo",
  "cryo",
  "dendro",
  "electro",
  "geo",
  "hydro",
  "pyro",
];

const ARTIFACT_SLOTS: readonly ArtifactSlot[] = [
  "flower",
  "plume",
  "sands",
  "goblet",
  "circlet",
];

const ARTIFACT_STATS = new Set<ArtifactStatKey>([
  "hpFlat",
  "hpPercent",
  "attackFlat",
  "attackPercent",
  "defenseFlat",
  "defensePercent",
  "elementalMastery",
  "energyRecharge",
  "critRate",
  "critDamage",
  "healingBonus",
  "physicalDamageBonus",
  ...ELEMENTS.map((element) => `${element}DamageBonus` as const),
]);

type Accumulator = Record<ArtifactStatKey | "shieldStrength", number>;

const createAccumulator = (): Accumulator => ({
  hpFlat: 0,
  hpPercent: 0,
  attackFlat: 0,
  attackPercent: 0,
  defenseFlat: 0,
  defensePercent: 0,
  elementalMastery: 0,
  energyRecharge: 0,
  critRate: 0,
  critDamage: 0,
  healingBonus: 0,
  shieldStrength: 0,
  physicalDamageBonus: 0,
  anemoDamageBonus: 0,
  cryoDamageBonus: 0,
  dendroDamageBonus: 0,
  electroDamageBonus: 0,
  geoDamageBonus: 0,
  hydroDamageBonus: 0,
  pyroDamageBonus: 0,
});

const addEffect = (
  accumulator: Accumulator,
  stat: ConstantEffectStat | ProgressionStatKey | ArtifactStatKey,
  value: number
) => {
  if (stat === "allElementalDamageBonus") {
    for (const element of ELEMENTS) {
      accumulator[`${element}DamageBonus`] += value;
    }
    return;
  }
  accumulator[stat] += value;
};

const invalid = (issues: readonly CharacterSheetIssue[]): CharacterSheetResult => ({
  status: "invalid",
  issues,
});

export const calculateCharacterSheetStats = (
  loadout: CharacterSheetLoadout
): CharacterSheetResult => {
  const character = characterProgression[loadout.character.key];
  if (!character) {
    return invalid([
      { code: "CHARACTER_NOT_FOUND", sourceKey: loadout.character.key },
    ]);
  }
  const characterStats =
    character.stats[
      `${loadout.character.level}:${loadout.character.ascension}`
    ];
  if (!characterStats) {
    return invalid([
      {
        code: "CHARACTER_PROGRESSION_NOT_FOUND",
        sourceKey: loadout.character.key,
      },
    ]);
  }

  let weaponStats: readonly [number, number] | undefined;
  let equippedWeapon = undefined as
    | (typeof weaponProgression)[string]
    | undefined;
  if (loadout.weapon) {
    if (!Number.isInteger(loadout.weapon.refinement) || loadout.weapon.refinement < 1 || loadout.weapon.refinement > 5) {
      return invalid([
        { code: "INVALID_REFINEMENT", sourceKey: loadout.weapon.key },
      ]);
    }
    equippedWeapon = weaponProgression[loadout.weapon.key];
    if (!equippedWeapon) {
      return invalid([
        { code: "WEAPON_NOT_FOUND", sourceKey: loadout.weapon.key },
      ]);
    }
    if (equippedWeapon.weaponType !== character.weaponType) {
      return invalid([
        { code: "WEAPON_TYPE_MISMATCH", sourceKey: loadout.weapon.key },
      ]);
    }
    weaponStats =
      equippedWeapon.stats[
        `${loadout.weapon.level}:${loadout.weapon.ascension}`
      ];
    if (!weaponStats) {
      return invalid([
        {
          code: "WEAPON_PROGRESSION_NOT_FOUND",
          sourceKey: loadout.weapon.key,
        },
      ]);
    }
  }

  const seenSlots = new Set<ArtifactSlot>();
  for (const artifact of loadout.artifacts) {
    if (!ARTIFACT_SLOTS.includes(artifact.slot) || seenSlots.has(artifact.slot)) {
      return invalid([
        { code: "DUPLICATE_ARTIFACT_SLOT", sourceKey: artifact.slot },
      ]);
    }
    seenSlots.add(artifact.slot);
    for (const stat of [artifact.mainStat, ...artifact.substats]) {
      if (!ARTIFACT_STATS.has(stat.stat) || !Number.isFinite(stat.value)) {
        return invalid([
          { code: "INVALID_ARTIFACT_STAT", sourceKey: stat.stat },
        ]);
      }
    }
  }

  const accumulator = createAccumulator();
  addEffect(accumulator, character.specializedStat, characterStats[3]);
  if (equippedWeapon?.specializedStat && weaponStats) {
    addEffect(accumulator, equippedWeapon.specializedStat, weaponStats[1]);
  }

  const slotOrder = new Map(
    ARTIFACT_SLOTS.map((slot, index) => [slot, index] as const)
  );
  const artifacts = [...loadout.artifacts].sort(
    (left, right) =>
      (slotOrder.get(left.slot) ?? 0) - (slotOrder.get(right.slot) ?? 0)
  );
  for (const artifact of artifacts) {
    addEffect(accumulator, artifact.mainStat.stat, artifact.mainStat.value);
    for (const substat of artifact.substats) {
      addEffect(accumulator, substat.stat, substat.value);
    }
  }

  const appliedRuleIds: string[] = [];
  for (const rule of CHARACTER_CONSTANT_RULES) {
    if (
      rule.characterKey !== loadout.character.key ||
      loadout.character.ascension < rule.minimumAscension
    ) {
      continue;
    }
    for (const effect of rule.effects) {
      addEffect(accumulator, effect.stat, effect.value);
    }
    appliedRuleIds.push(rule.id);
  }
  if (loadout.weapon) {
    for (const rule of WEAPON_CONSTANT_RULES) {
      if (rule.weaponKey !== loadout.weapon.key) continue;
      for (const effect of rule.effects) {
        addEffect(
          accumulator,
          effect.stat,
          effect.valuesByRefinement[loadout.weapon.refinement - 1]
        );
      }
      appliedRuleIds.push(rule.id);
    }
  }

  const issues: CharacterSheetIssue[] = [];
  if (!loadout.weapon) issues.push({ code: "MISSING_WEAPON" });
  const setCounts = new Map<string, number>();
  for (const artifact of artifacts) {
    if (!artifact.setKey) continue;
    setCounts.set(artifact.setKey, (setCounts.get(artifact.setKey) ?? 0) + 1);
  }
  for (const [setKey, count] of [...setCounts].sort(([left], [right]) =>
    left.localeCompare(right)
  )) {
    if (count >= 2) {
      issues.push({
        code: "ARTIFACT_SET_CONSTANTS_UNSUPPORTED",
        sourceKey: setKey,
      });
    }
  }

  const base = {
    hp: characterStats[0],
    attack: characterStats[1] + (weaponStats?.[0] ?? 0),
    defense: characterStats[2],
  };
  const damageBonus = Object.fromEntries([
    ...ELEMENTS.map(
      (element) => [element, accumulator[`${element}DamageBonus`]] as const
    ),
    ["physical", accumulator.physicalDamageBonus] as const,
  ]) as Record<Element | "physical", number>;
  const value = {
    stats: {
      maxHp: base.hp * (1 + accumulator.hpPercent) + accumulator.hpFlat,
      attack:
        base.attack * (1 + accumulator.attackPercent) + accumulator.attackFlat,
      defense:
        base.defense * (1 + accumulator.defensePercent) +
        accumulator.defenseFlat,
      elementalMastery: accumulator.elementalMastery,
      energyRecharge: 1 + accumulator.energyRecharge,
      critRate: 0.05 + accumulator.critRate,
      critDamage: 0.5 + accumulator.critDamage,
      healingBonus: accumulator.healingBonus,
      shieldStrength: accumulator.shieldStrength,
      damageBonus,
    },
    base,
    appliedRuleIds,
    coverage: {
      progression: "complete" as const,
      characterConstants: "reviewed" as const,
      weaponConstants: loadout.weapon
        ? ("reviewed" as const)
        : ("not-equipped" as const),
      artifactSetConstants: issues.some(
        (issue) => issue.code === "ARTIFACT_SET_CONSTANTS_UNSUPPORTED"
      )
        ? ("unsupported" as const)
        : ("not-applicable" as const),
      gameVersion: progressionManifest.gameVersion,
      genshinDbVersion: progressionManifest.genshinDbVersion,
      constantRuleset:
        "miao@03298720363416755a754324ab14cb08037ca345",
    },
    issues,
  };

  return issues.length > 0
    ? { status: "partial", ...value }
    : { status: "complete", ...value };
};
