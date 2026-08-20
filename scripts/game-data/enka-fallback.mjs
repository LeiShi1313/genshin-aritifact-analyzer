import { artifactSetKey, characterKey, weaponKey } from "./keys.mjs";

const ENKA_FILES = [
  "avatars.json",
  "weapons.json",
  "relics.json",
  "locs.json",
  "curves.json",
];

const localeToEnkaLocale = {
  de: "de",
  en: "en",
  es: "es",
  fr: "fr",
  ja: "ja",
  ko: "ko",
  zh: "zh-cn",
  "zh-Hant": "zh-tw",
};

const elementByEnkaValue = {
  Wind: "Anemo",
  Ice: "Cryo",
  Grass: "Dendro",
  Electric: "Electro",
  Rock: "Geo",
  Water: "Hydro",
  Fire: "Pyro",
};

const characterWeaponTypeByEnkaValue = {
  WEAPON_BOW: "Bow",
  WEAPON_CATALYST: "Catalyst",
  WEAPON_CLAYMORE: "Claymore",
  WEAPON_POLE: "Polearm",
  WEAPON_SWORD_ONE_HAND: "Sword",
};

const weaponTypeByEnkaValue = {
  1: "Sword",
  2: "Claymore",
  3: "Bow",
  4: "Polearm",
  5: "Catalyst",
};

const rarityByEnkaQuality = {
  QUALITY_PURPLE: 4,
  QUALITY_ORANGE: 5,
};

const progressionStatByEnkaProperty = {
  3: "hpPercent",
  6: "attackPercent",
  9: "defensePercent",
  20: "critRate",
  22: "critDamage",
  23: "energyRecharge",
  26: "healingBonus",
  28: "elementalMastery",
  30: "physicalDamageBonus",
  40: "pyroDamageBonus",
  41: "electroDamageBonus",
  42: "hydroDamageBonus",
  43: "dendroDamageBonus",
  44: "anemoDamageBonus",
  45: "geoDamageBonus",
  46: "cryoDamageBonus",
};

const artifactPositionByEnkaEquipType = {
  0: "flower",
  1: "plume",
  2: "sands",
  3: "goblet",
  4: "circlet",
};

const requireObject = (value, label) => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  return value;
};

const requireArray = (value, label) => {
  if (!Array.isArray(value)) throw new Error(`${label} must be an array`);
  return value;
};

const requireString = (value, label) => {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${label} must be a non-empty string`);
  }
  return value;
};

export const requireEnkaRevision = (value) => {
  const revision = requireString(value, "Enka revision");
  if (!/^[0-9a-f]{40}$/i.test(revision)) {
    throw new Error("Enka revision must be a full 40-character Git commit");
  }
  return revision.toLowerCase();
};

const requireFiniteNumber = (value, label) => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number`);
  }
  return value;
};

const requirePhase = (ascension, promotions, label) => {
  if (!Number.isInteger(ascension) || ascension < 0) {
    throw new Error(`${label} ascension must be a non-negative integer`);
  }
  const promotion = promotions[ascension];
  return requireObject(promotion, `${label} promotion ${ascension}`);
};

const curveValue = (curves, curveId, level, label) => {
  if (!Number.isInteger(level) || level < 1) {
    throw new Error(`${label} level must be a positive integer`);
  }
  const curve = curves[String(curveId)];
  if (!Array.isArray(curve)) {
    throw new Error(`${label} is missing curve ${curveId}`);
  }
  return requireFiniteNumber(curve[level - 1], `${label} curve ${curveId}`);
};

const propertyValue = (record, collection, property, label) =>
  requireFiniteNumber(
    requireObject(record[collection], `${label}.${collection}`)[property] ?? 0,
    `${label}.${collection}.${property}`
  );

const specializedProperty = (record, ignored, label) => {
  requireObject(record.BaseProps, `${label}.BaseProps`);
  const promotions = record.PromoteProps;
  const finalPromotion = Array.isArray(promotions)
    ? requireObject(promotions.at(-1), `${label}.PromoteProps final entry`)
    : undefined;
  const candidates = Object.keys(finalPromotion ?? {}).filter(
    (property) => !ignored.has(property)
  );
  if (candidates.length !== 1) {
    throw new Error(
      `${label} must have exactly one specialized property; found ${candidates.join(
        ", "
      )}`
    );
  }
  return candidates[0];
};

export const calculateEnkaCharacterStats = (
  recordInput,
  curvesInput,
  level,
  ascension
) => {
  const record = requireObject(recordInput, "Enka character");
  const curves = requireObject(curvesInput, "Enka curves");
  if (!Array.isArray(record.PromoteProps)) {
    throw new Error("Enka character.PromoteProps must be an array");
  }
  const promotion = requirePhase(
    ascension,
    record.PromoteProps,
    "Enka character"
  );
  const growth = requireObject(
    record.PropGrowCurves,
    "Enka character.PropGrowCurves"
  );
  const calculateBase = (property, name) =>
    propertyValue(record, "BaseProps", property, "Enka character") *
      curveValue(curves, growth[property], level, `Enka character ${name}`) +
    requireFiniteNumber(
      promotion[property] ?? 0,
      `Enka character promotion.${property}`
    );
  const specialized = specializedProperty(
    record,
    new Set(["1", "4", "7"]),
    "Enka character"
  );

  return {
    ascension,
    hp: calculateBase("1", "HP"),
    attack: calculateBase("4", "ATK"),
    defense: calculateBase("7", "DEF"),
    specialized:
      propertyValue(record, "BaseProps", specialized, "Enka character") +
      requireFiniteNumber(
        promotion[specialized] ?? 0,
        `Enka character promotion.${specialized}`
      ),
    specializedProperty: specialized,
  };
};

export const calculateEnkaWeaponStats = (
  recordInput,
  curvesInput,
  level,
  ascension
) => {
  const record = requireObject(recordInput, "Enka weapon");
  const curves = requireObject(curvesInput, "Enka curves");
  const growth = requireObject(
    record.PropGrowCurves,
    "Enka weapon.PropGrowCurves"
  );
  if (!Array.isArray(record.BasePromote)) {
    throw new Error("Enka weapon.BasePromote must be an array");
  }
  if (!Number.isInteger(ascension) || ascension < 0) {
    throw new Error("Enka weapon ascension must be a non-negative integer");
  }
  const promotion = requireFiniteNumber(
    record.BasePromote[ascension],
    `Enka weapon promotion ${ascension}`
  );
  const baseProps = requireObject(record.BaseProps, "Enka weapon.BaseProps");
  const candidates = Object.keys(baseProps).filter(
    (property) => property !== "4" && baseProps[property] !== 0
  );
  if (candidates.length > 1) {
    throw new Error(
      `Enka weapon has multiple specialized properties: ${candidates.join(
        ", "
      )}`
    );
  }
  const specialized = candidates[0];

  return {
    ascension,
    attack:
      propertyValue(record, "BaseProps", "4", "Enka weapon") *
        curveValue(curves, growth["4"], level, "Enka weapon ATK") +
      promotion,
    specialized: specialized
      ? propertyValue(record, "BaseProps", specialized, "Enka weapon") *
        curveValue(
          curves,
          growth[specialized],
          level,
          "Enka weapon specialized stat"
        )
      : 0,
    specializedProperty: specialized ?? null,
  };
};

const requireMapped = (mapping, value, label) => {
  const mapped = mapping[value];
  if (mapped === undefined)
    throw new Error(`${label} has unsupported value ${value}`);
  return mapped;
};

const resourceName = (value, label) => {
  const path = requireString(value, label);
  const filename = path
    .split("/")
    .at(-1)
    ?.replace(/\.png$/i, "");
  return requireString(filename, label);
};

const translationsForHash = (locsInput, hash, label) => {
  const locs = requireObject(locsInput, "Enka locs");
  const textMapHash = String(hash);
  return Object.fromEntries(
    Object.entries(localeToEnkaLocale).map(([locale, enkaLocale]) => {
      const translations = requireObject(
        locs[enkaLocale],
        `Enka locs.${enkaLocale}`
      );
      return [
        locale,
        requireString(translations[textMapHash], `${label} ${locale} name`),
      ];
    })
  );
};

const copyCurve = (curves, curveId, label) => {
  const values = requireArray(
    curves[String(curveId)],
    `${label} curve ${curveId}`
  );
  if (values.length < 100) {
    throw new Error(
      `${label} curve ${curveId} must cover levels 1 through 100`
    );
  }
  return values.map((value, index) =>
    requireFiniteNumber(value, `${label} curve ${curveId}[${index}]`)
  );
};

const normalizeCharacterProgression = (raw, curves, label) => {
  const initial = calculateEnkaCharacterStats(raw, curves, 1, 0);
  const property = initial.specializedProperty;
  const stat = requireMapped(
    progressionStatByEnkaProperty,
    property,
    `${label} specialized property`
  );
  const baseProps = requireObject(raw.BaseProps, `${label}.BaseProps`);
  const growth = requireObject(raw.PropGrowCurves, `${label}.PropGrowCurves`);
  const promotions = requireArray(raw.PromoteProps, `${label}.PromoteProps`);
  if (promotions.length !== 7) {
    throw new Error(`${label} must have seven ascension promotion phases`);
  }

  return {
    specializedStat: stat,
    base: {
      hp: requireFiniteNumber(baseProps["1"], `${label} base HP`),
      attack: requireFiniteNumber(baseProps["4"], `${label} base ATK`),
      defense: requireFiniteNumber(baseProps["7"], `${label} base DEF`),
      specialized: requireFiniteNumber(
        baseProps[property] ?? 0,
        `${label} base specialized stat`
      ),
    },
    growth: {
      hp: copyCurve(curves, growth["1"], `${label} HP`),
      attack: copyCurve(curves, growth["4"], `${label} ATK`),
      defense: copyCurve(curves, growth["7"], `${label} DEF`),
    },
    promotions: promotions.map((promotionInput, ascension) => {
      const promotion = requireObject(
        promotionInput,
        `${label} promotion ${ascension}`
      );
      return {
        hp: requireFiniteNumber(
          promotion["1"] ?? 0,
          `${label} promotion ${ascension} HP`
        ),
        attack: requireFiniteNumber(
          promotion["4"] ?? 0,
          `${label} promotion ${ascension} ATK`
        ),
        defense: requireFiniteNumber(
          promotion["7"] ?? 0,
          `${label} promotion ${ascension} DEF`
        ),
        specialized: requireFiniteNumber(
          promotion[property] ?? 0,
          `${label} promotion ${ascension} specialized stat`
        ),
      };
    }),
  };
};

const normalizeWeaponProgression = (raw, curves, label) => {
  const initial = calculateEnkaWeaponStats(raw, curves, 1, 0);
  const property = initial.specializedProperty;
  const baseProps = requireObject(raw.BaseProps, `${label}.BaseProps`);
  const growth = requireObject(raw.PropGrowCurves, `${label}.PropGrowCurves`);
  const promotions = requireArray(raw.BasePromote, `${label}.BasePromote`);

  return {
    specializedStat: property
      ? requireMapped(
          progressionStatByEnkaProperty,
          property,
          `${label} specialized property`
        )
      : null,
    base: {
      attack: requireFiniteNumber(baseProps["4"], `${label} base ATK`),
      specialized: property
        ? requireFiniteNumber(
            baseProps[property],
            `${label} base specialized stat`
          )
        : 0,
    },
    growth: {
      attack: copyCurve(curves, growth["4"], `${label} ATK`),
      specialized: property
        ? copyCurve(curves, growth[property], `${label} specialized stat`)
        : null,
    },
    promotions: promotions.map((value, ascension) =>
      requireFiniteNumber(value, `${label} promotion ${ascension}`)
    ),
  };
};

export const calculateNormalizedCharacterStats = (
  progression,
  level,
  ascension
) => {
  const promotion = progression.promotions[ascension];
  if (!promotion || !Number.isInteger(level) || level < 1 || level > 100) {
    throw new Error(
      `Invalid normalized character progression ${level}:${ascension}`
    );
  }
  return {
    hp: progression.base.hp * progression.growth.hp[level - 1] + promotion.hp,
    attack:
      progression.base.attack * progression.growth.attack[level - 1] +
      promotion.attack,
    defense:
      progression.base.defense * progression.growth.defense[level - 1] +
      promotion.defense,
    specialized: progression.base.specialized + promotion.specialized,
  };
};

export const calculateNormalizedWeaponStats = (
  progression,
  level,
  ascension
) => {
  const promotion = progression.promotions[ascension];
  if (
    promotion === undefined ||
    !Number.isInteger(level) ||
    level < 1 ||
    level > 100
  ) {
    throw new Error(
      `Invalid normalized weapon progression ${level}:${ascension}`
    );
  }
  return {
    attack:
      progression.base.attack * progression.growth.attack[level - 1] +
      promotion,
    specialized: progression.growth.specialized
      ? progression.base.specialized * progression.growth.specialized[level - 1]
      : 0,
  };
};

const numericCheckpoint = (value, label) => {
  const parsed = Number.parseFloat(String(value).replace(/%$/, ""));
  if (!Number.isFinite(parsed)) throw new Error(`${label} is not numeric`);
  return parsed;
};

const validateCharacterCheckpoints = (release, progression) => {
  for (const phase of release.ascension) {
    const level = phase.level[0];
    const stats = Object.fromEntries(
      phase.stats.map((stat) => [stat.label, stat.values])
    );
    const phases =
      level === 1
        ? [[0, 1]]
        : stats.Ascend.map((value, index) => [value, index]);
    for (const [ascensionValue, valueIndex] of phases) {
      const ascension = Number(ascensionValue);
      if (!Number.isInteger(ascension) || ascension < 0 || ascension > 6)
        continue;
      const actual = calculateNormalizedCharacterStats(
        progression,
        level,
        ascension
      );
      for (const [label, property] of [
        ["Base HP", "hp"],
        ["Base ATK", "attack"],
        ["Base DEF", "defense"],
      ]) {
        const expected = numericCheckpoint(
          stats[label][valueIndex],
          `${release.id} ${level}:${ascension} ${label}`
        );
        if (Math.round(actual[property]) !== expected) {
          throw new Error(
            `${release.id} ${level}:${ascension} ${label} disagrees with ` +
              `the release catalog (${actual[property]} vs ${expected})`
          );
        }
      }
    }
  }
};

const validateWeaponCheckpoints = (release, progression) => {
  for (const checkpoint of release.stats.levels) {
    const actual = calculateNormalizedWeaponStats(
      progression,
      checkpoint.level,
      checkpoint.ascension
    );
    if (Math.round(actual.attack) !== checkpoint.primary) {
      throw new Error(
        `${release.id} ${checkpoint.level}:${checkpoint.ascension} ATK ` +
          `disagrees with the release catalog`
      );
    }
    if (checkpoint.secondary !== undefined) {
      const displayValue =
        progression.specializedStat === "elementalMastery"
          ? actual.specialized
          : actual.specialized * 100;
      const disagrees =
        progression.specializedStat === "elementalMastery"
          ? Math.round(displayValue) !== checkpoint.secondary
          : Math.abs(displayValue - checkpoint.secondary) > 0.11;
      if (disagrees) {
        throw new Error(
          `${release.id} ${checkpoint.level}:${checkpoint.ascension} secondary ` +
            `stat disagrees with the release catalog`
        );
      }
    }
  }
};

const missingReleaseRecords = (
  releaseRecords,
  primaryRecords,
  idForRelease,
  keyForRelease,
  label
) => {
  const primaryByKey = new Map(
    primaryRecords.map((record) => [record.key, record])
  );
  const primaryById = new Map(
    primaryRecords.map((record) => [record.gameId, record])
  );
  return releaseRecords.filter((record) => {
    const key = keyForRelease(record);
    const gameId = idForRelease(record);
    const keyMatch = primaryByKey.get(key);
    const idMatch = primaryById.get(gameId);
    const hasProviderSpecificGameId =
      label === "character" && key.startsWith("traveler_");
    if (keyMatch && keyMatch.gameId !== gameId && !hasProviderSpecificGameId) {
      throw new Error(
        `release ${label} ${key} maps to game id ${gameId}, but ` +
          `genshin-db maps it to ${keyMatch.gameId}`
      );
    }
    if (keyMatch) return false;
    if (hasProviderSpecificGameId) {
      throw new Error(
        `release character ${key} cannot fall back to Enka because Traveler ` +
          "avatar ids do not identify elemental variants"
      );
    }
    if (idMatch && idMatch.key !== key) {
      throw new Error(
        `release ${label} game id ${gameId} maps to ${key}, but ` +
          `genshin-db maps it to ${idMatch.key}`
      );
    }
    return !idMatch;
  });
};

const validateEnglishIdentity = (release, translations) => {
  if (translations.en !== release.name) {
    throw new Error(
      `${release.id} Enka name ${translations.en} does not match release name ${release.name}`
    );
  }
};

const characterImages = (raw, label) => {
  const sideIcon = resourceName(raw.SideIconName, `${label} side icon`);
  const suffix = sideIcon.replace(/^UI_AvatarIcon_Side_/, "");
  if (suffix === sideIcon)
    throw new Error(`${label} has an unexpected side icon`);
  return {
    filenameIcon: `UI_AvatarIcon_${suffix}`,
    filenameGachaSplash: `UI_Gacha_AvatarImg_${suffix}`,
  };
};

const artifactImages = (itemsInput, setId, label) => {
  const items = requireObject(itemsInput, "Enka relic items");
  const images = {};
  for (const itemInput of Object.values(items)) {
    const item = requireObject(itemInput, "Enka relic item");
    if (item.SetId !== setId || item.Rarity !== 5) continue;
    const position = artifactPositionByEnkaEquipType[item.EquipType];
    if (!position || images[position]) continue;
    images[position] = resourceName(item.Icon, `${label} ${position} icon`);
  }
  for (const position of Object.values(artifactPositionByEnkaEquipType)) {
    requireString(images[position], `${label} ${position} icon`);
  }
  return images;
};

export const buildEnkaFallbackSnapshot = ({
  enkaData,
  releaseCatalog,
  primaryProvider,
  genshinDataVersion,
  enkaRevision,
}) => {
  const pinnedEnkaRevision = requireEnkaRevision(enkaRevision);
  const avatars = requireObject(enkaData.avatars, "Enka avatars");
  const weapons = requireObject(enkaData.weapons, "Enka weapons");
  const relics = requireObject(enkaData.relics, "Enka relics");
  const locs = requireObject(enkaData.locs, "Enka locs");
  const curves = requireObject(enkaData.curves, "Enka curves");
  const releasedCharacters = requireArray(
    releaseCatalog.characters,
    "release characters"
  );
  const releasedWeapons = requireArray(
    releaseCatalog.weapons,
    "release weapons"
  );
  const releasedArtifacts = requireArray(
    releaseCatalog.artifactSets,
    "release artifact sets"
  );

  const missingCharacters = missingReleaseRecords(
    releasedCharacters,
    primaryProvider.characters,
    (record) => record._id,
    (record) =>
      record.id.startsWith("traveler_") ? record.id : characterKey(record.name),
    "character"
  );
  const missingWeapons = missingReleaseRecords(
    releasedWeapons,
    primaryProvider.weapons,
    (record) => record._id,
    (record) => weaponKey(record.name),
    "weapon"
  );
  const missingArtifactSets = missingReleaseRecords(
    releasedArtifacts,
    primaryProvider.artifactSets,
    (record) => record._id - 200000,
    (record) => artifactSetKey(record.name),
    "artifact set"
  );

  const normalizedCharacters = missingCharacters.map((release) => {
    const raw = requireObject(
      avatars[String(release._id)],
      `Enka ${release.id}`
    );
    const translations = translationsForHash(
      locs,
      raw.NameTextMapHash,
      release.id
    );
    validateEnglishIdentity(release, translations);
    const progression = normalizeCharacterProgression(raw, curves, release.id);
    validateCharacterCheckpoints(release, progression);
    return {
      key: characterKey(release.name),
      gameId: release._id,
      name: release.name,
      translations,
      element: requireMapped(
        elementByEnkaValue,
        raw.Element,
        `${release.id} element`
      ),
      weaponType: requireMapped(
        characterWeaponTypeByEnkaValue,
        raw.WeaponType,
        `${release.id} weapon type`
      ),
      rarity: requireMapped(
        rarityByEnkaQuality,
        raw.QualityType,
        `${release.id} rarity`
      ),
      images: characterImages(raw, release.id),
      progression,
    };
  });

  const normalizedWeapons = missingWeapons.map((release) => {
    const raw = requireObject(
      weapons[String(release._id)],
      `Enka ${release.id}`
    );
    const translations = translationsForHash(
      locs,
      raw.NameTextMapHash,
      release.id
    );
    validateEnglishIdentity(release, translations);
    const progression = normalizeWeaponProgression(raw, curves, release.id);
    validateWeaponCheckpoints(release, progression);
    return {
      key: weaponKey(release.name),
      gameId: release._id,
      name: release.name,
      translations,
      weaponType: requireMapped(
        weaponTypeByEnkaValue,
        raw.WeaponType,
        `${release.id} weapon type`
      ),
      rarity: requireFiniteNumber(raw.Rarity, `${release.id} rarity`),
      images: {
        filenameIcon: resourceName(raw.Icon, `${release.id} icon`),
        filenameAwakenIcon: resourceName(
          raw.AwakenIcon,
          `${release.id} awakened icon`
        ),
      },
      progression,
    };
  });

  const sets = requireObject(relics.Sets, "Enka relic sets");
  const normalizedArtifactSets = missingArtifactSets.map((release) => {
    const gameId = release._id - 200000;
    const raw = requireObject(sets[String(gameId)], `Enka ${release.id}`);
    const translations = translationsForHash(locs, raw.Name, release.id);
    validateEnglishIdentity(release, translations);
    return {
      key: artifactSetKey(release.name),
      gameId,
      name: release.name,
      translations,
      effects: {
        twoPiece: release.two_pc ?? "",
        fourPiece: release.four_pc ?? "",
      },
      images: artifactImages(relics.Items, gameId, release.id),
    };
  });

  return {
    schemaVersion: 1,
    gameVersion: releaseCatalog.gameVersion,
    sources: [
      {
        id: "enka-network",
        role: "fallback",
        revision: pinnedEnkaRevision,
      },
      {
        id: "genshin-data",
        role: "release-catalog",
        version: genshinDataVersion,
      },
    ],
    characters: normalizedCharacters,
    weapons: normalizedWeapons,
    artifactSets: normalizedArtifactSets,
  };
};

const defaultFetchJson = async (url) => {
  const response = await fetch(url, {
    headers: { "user-agent": "genshin-artifact-builds-data-generator" },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`);
  }
  return response.json();
};

export const resolveLatestEnkaRevision = async (
  fetchJson = defaultFetchJson
) => {
  const commits = requireArray(
    await fetchJson(
      "https://api.github.com/repos/EnkaNetwork/API-docs/commits?path=store%2Fgi&per_page=1"
    ),
    "Enka commit response"
  );
  const latest = requireObject(commits[0], "latest Enka commit");
  return requireEnkaRevision(latest.sha);
};

export const fetchPinnedEnkaData = async (
  revisionInput,
  fetchJson = defaultFetchJson
) => {
  const revision = requireEnkaRevision(revisionInput);
  const entries = await Promise.all(
    ENKA_FILES.map(async (filename) => {
      const url =
        `https://raw.githubusercontent.com/EnkaNetwork/API-docs/` +
        `${revision}/store/gi/${filename}`;
      return [filename.replace(/\.json$/, ""), await fetchJson(url)];
    })
  );
  return Object.fromEntries(entries);
};
