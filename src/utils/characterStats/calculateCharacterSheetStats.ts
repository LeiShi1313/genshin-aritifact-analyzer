import {
  CHARACTER_CONSTANT_RULES,
  WEAPON_CONSTANT_RULES,
} from "./internal/rules/constantRules";
import {
  hasReviewedCharacterConstants,
  hasReviewedWeaponConstants,
} from "./internal/rules/constantRuleCoverage";
import type {
  ArtifactSlot,
  ArtifactStatKey,
  CharacterSheetIssue,
  CharacterSheetLoadout,
  CharacterSheetProgressionData,
  CharacterSheetResult,
  ConstantEffectStat,
  Element,
  ProgressionStatKey,
  WeaponProgression,
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

const MAIN_STATS_BY_SLOT: Readonly<Record<ArtifactSlot, ReadonlySet<ArtifactStatKey>>> = {
  flower: new Set(["hpFlat"]),
  plume: new Set(["attackFlat"]),
  sands: new Set([
    "hpPercent",
    "attackPercent",
    "defensePercent",
    "elementalMastery",
    "energyRecharge",
  ]),
  goblet: new Set([
    "hpPercent",
    "attackPercent",
    "defensePercent",
    "elementalMastery",
    "physicalDamageBonus",
    ...ELEMENTS.map((element) => `${element}DamageBonus` as const),
  ]),
  circlet: new Set([
    "hpPercent",
    "attackPercent",
    "defensePercent",
    "elementalMastery",
    "critRate",
    "critDamage",
    "healingBonus",
  ]),
};

const SUBSTAT_STATS = new Set<ArtifactStatKey>([
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

const invalid = (
  issues: readonly CharacterSheetIssue[]
): CharacterSheetResult => ({
  status: "invalid",
  issues,
});

const ownEntry = <Entry>(
  entries: Readonly<Record<string, Entry>>,
  key: string
): Entry | undefined =>
  Object.prototype.hasOwnProperty.call(entries, key) ? entries[key] : undefined;

const hasArtifactSetIdentity = (setKey: unknown): setKey is string =>
  typeof setKey === "string" && setKey.trim().length > 0;

export const calculateCharacterSheetStatsFromProgression = (
  loadout: CharacterSheetLoadout,
  progression: CharacterSheetProgressionData
): CharacterSheetResult => {
  const character = ownEntry(progression.characters, loadout.character.key);
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
  let equippedWeapon: WeaponProgression | undefined;
  if (loadout.weapon) {
    if (
      !Number.isInteger(loadout.weapon.refinement) ||
      loadout.weapon.refinement < 1 ||
      loadout.weapon.refinement > 5
    ) {
      return invalid([
        { code: "INVALID_REFINEMENT", sourceKey: loadout.weapon.key },
      ]);
    }
    equippedWeapon = ownEntry(progression.weapons, loadout.weapon.key);
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
  let hasUnknownSetIdentity = false;
  for (const [artifactIndex, artifact] of loadout.artifacts.entries()) {
    const artifactPath = `artifacts[${artifactIndex}]`;
    if (!ARTIFACT_SLOTS.includes(artifact.slot)) {
      return invalid([
        { code: "INVALID_ARTIFACT_SLOT", sourceKey: artifact.slot },
      ]);
    }
    if (seenSlots.has(artifact.slot)) {
      return invalid([
        { code: "DUPLICATE_ARTIFACT_SLOT", sourceKey: artifact.slot },
      ]);
    }
    seenSlots.add(artifact.slot);
    if (!hasArtifactSetIdentity(artifact.setKey)) {
      hasUnknownSetIdentity = true;
    }
    if (
      !ARTIFACT_STATS.has(artifact.mainStat.stat) ||
      !Number.isFinite(artifact.mainStat.value) ||
      artifact.mainStat.value < 0
    ) {
      return invalid([
        {
          code: "INVALID_ARTIFACT_STAT",
          sourceKey: `${artifactPath}.mainStat.${artifact.mainStat.stat}`,
        },
      ]);
    }
    if (!MAIN_STATS_BY_SLOT[artifact.slot].has(artifact.mainStat.stat)) {
      return invalid([
        {
          code: "INVALID_ARTIFACT_MAIN_STAT_FOR_SLOT",
          sourceKey: `${artifactPath}.${artifact.slot}.${artifact.mainStat.stat}`,
        },
      ]);
    }
    if (artifact.substats.length > 4) {
      return invalid([
        { code: "TOO_MANY_ARTIFACT_SUBSTATS", sourceKey: artifactPath },
      ]);
    }
    const seenSubstats = new Set<ArtifactStatKey>();
    for (const [substatIndex, substat] of artifact.substats.entries()) {
      const substatPath = `${artifactPath}.substats[${substatIndex}].${substat.stat}`;
      if (
        !ARTIFACT_STATS.has(substat.stat) ||
        !Number.isFinite(substat.value) ||
        substat.value < 0
      ) {
        return invalid([
          { code: "INVALID_ARTIFACT_STAT", sourceKey: substatPath },
        ]);
      }
      if (!SUBSTAT_STATS.has(substat.stat)) {
        return invalid([
          { code: "INVALID_ARTIFACT_SUBSTAT", sourceKey: substatPath },
        ]);
      }
      if (substat.stat === artifact.mainStat.stat) {
        return invalid([
          { code: "ARTIFACT_SUBSTAT_MATCHES_MAIN", sourceKey: substatPath },
        ]);
      }
      if (seenSubstats.has(substat.stat)) {
        return invalid([
          { code: "DUPLICATE_ARTIFACT_SUBSTAT", sourceKey: substatPath },
        ]);
      }
      seenSubstats.add(substat.stat);
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

  const characterConstantsReviewed = hasReviewedCharacterConstants(
    loadout.character.key
  );
  const weaponConstantsReviewed = loadout.weapon
    ? hasReviewedWeaponConstants(loadout.weapon.key)
    : undefined;
  const issues: CharacterSheetIssue[] = [];
  if (!characterConstantsReviewed) {
    issues.push({
      code: "CHARACTER_CONSTANTS_UNREVIEWED",
      sourceKey: loadout.character.key,
    });
  }
  if (loadout.weapon && !weaponConstantsReviewed) {
    issues.push({
      code: "WEAPON_CONSTANTS_UNREVIEWED",
      sourceKey: loadout.weapon.key,
    });
  }
  if (!loadout.weapon) issues.push({ code: "MISSING_WEAPON" });
  if (hasUnknownSetIdentity) {
    issues.push({ code: "ARTIFACT_SET_IDENTITY_MISSING" });
  }
  const setCounts = new Map<string, number>();
  for (const artifact of artifacts) {
    if (!hasArtifactSetIdentity(artifact.setKey)) continue;
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
      characterConstants: characterConstantsReviewed
        ? ("reviewed" as const)
        : ("unreviewed" as const),
      weaponConstants: loadout.weapon
        ? weaponConstantsReviewed
          ? ("reviewed" as const)
          : ("unreviewed" as const)
        : ("not-equipped" as const),
      artifactSetConstants: hasUnknownSetIdentity
        ? ("unknown" as const)
        : issues.some(
            (issue) => issue.code === "ARTIFACT_SET_CONSTANTS_UNSUPPORTED"
          )
          ? ("unsupported" as const)
          : ("not-applicable" as const),
      gameVersion: progression.manifest.gameVersion,
      genshinDbVersion: progression.manifest.genshinDbVersion,
      constantRuleset: "genshin-artifact-builds/constant-stats@1",
      constantRuleSource:
        "miao-plugin@03298720363416755a754324ab14cb08037ca345",
    },
    issues,
  };

  const calculatedNumbers: ReadonlyArray<readonly [string, number]> = [
    ["base.hp", value.base.hp],
    ["base.attack", value.base.attack],
    ["base.defense", value.base.defense],
    ["stats.maxHp", value.stats.maxHp],
    ["stats.attack", value.stats.attack],
    ["stats.defense", value.stats.defense],
    ["stats.elementalMastery", value.stats.elementalMastery],
    ["stats.energyRecharge", value.stats.energyRecharge],
    ["stats.critRate", value.stats.critRate],
    ["stats.critDamage", value.stats.critDamage],
    ["stats.healingBonus", value.stats.healingBonus],
    ["stats.shieldStrength", value.stats.shieldStrength],
    ...Object.entries(value.stats.damageBonus).map(
      ([key, amount]) => [`stats.damageBonus.${key}`, amount] as const
    ),
  ];
  const nonFiniteOutput = calculatedNumbers.find(
    ([, amount]) => !Number.isFinite(amount)
  );
  if (nonFiniteOutput) {
    return invalid([
      {
        code: "CALCULATION_OVERFLOW",
        sourceKey: nonFiniteOutput[0],
      },
    ]);
  }

  return issues.length > 0
    ? { status: "partial", ...value }
    : { status: "complete", ...value };
};
