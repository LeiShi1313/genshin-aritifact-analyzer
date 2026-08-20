import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

import genshinDb from "genshin-db";

import {
  calculateNormalizedCharacterStats,
  calculateNormalizedWeaponStats,
  requireEnkaRevision,
} from "./enka-fallback.mjs";
import { artifactSetKey, characterKey, weaponKey } from "./keys.mjs";

const FALLBACK_SNAPSHOT_URL = new URL(
  "../../src/data/game-data-fallback.generated.json",
  import.meta.url
);

const require = createRequire(import.meta.url);
const genshinDbPackage = JSON.parse(
  readFileSync(require.resolve("genshin-db/package.json"), "utf8")
);

const genshinDbGameVersion =
  genshinDbPackage.description.match(/Genshin Impact v([\d.]+)/)?.[1] ??
  genshinDbPackage.version;

const databaseLanguageByLocale = {
  de: "German",
  es: "Spanish",
  fr: "French",
  ja: "Japanese",
  ko: "Korean",
  zh: "CHS",
  "zh-Hant": "CHT",
};

const progressionStatByFightProperty = {
  FIGHT_PROP_ATTACK_PERCENT: "attackPercent",
  FIGHT_PROP_CHARGE_EFFICIENCY: "energyRecharge",
  FIGHT_PROP_CRITICAL: "critRate",
  FIGHT_PROP_CRITICAL_HURT: "critDamage",
  FIGHT_PROP_DEFENSE_PERCENT: "defensePercent",
  FIGHT_PROP_ELEC_ADD_HURT: "electroDamageBonus",
  FIGHT_PROP_ELEMENT_MASTERY: "elementalMastery",
  FIGHT_PROP_FIRE_ADD_HURT: "pyroDamageBonus",
  FIGHT_PROP_GRASS_ADD_HURT: "dendroDamageBonus",
  FIGHT_PROP_HEAL_ADD: "healingBonus",
  FIGHT_PROP_HP_PERCENT: "hpPercent",
  FIGHT_PROP_ICE_ADD_HURT: "cryoDamageBonus",
  FIGHT_PROP_PHYSICAL_ADD_HURT: "physicalDamageBonus",
  FIGHT_PROP_ROCK_ADD_HURT: "geoDamageBonus",
  FIGHT_PROP_WATER_ADD_HURT: "hydroDamageBonus",
  FIGHT_PROP_WIND_ADD_HURT: "anemoDamageBonus",
};

const isObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const requireObject = (value, label) => {
  if (!isObject(value)) throw new Error(`${label} must be an object`);
  return value;
};

const requireString = (value, label) => {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${label} must be a non-empty string`);
  }
  return value;
};

const requireArray = (value, label) => {
  if (!Array.isArray(value)) throw new Error(`${label} must be an array`);
  return value;
};

const requireFiniteNumber = (value, label) => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number`);
  }
  return value;
};

const requiredLocales = ["de", "en", "es", "fr", "ja", "ko", "zh", "zh-Hant"];

const validateTranslations = (value, label) => {
  const translations = requireObject(value, label);
  for (const locale of requiredLocales) {
    requireString(translations[locale], `${label}.${locale}`);
  }
};

const validateNumberArray = (value, minimumLength, label) => {
  const values = requireArray(value, label);
  if (values.length < minimumLength) {
    throw new Error(`${label} must contain at least ${minimumLength} values`);
  }
  values.forEach((entry, index) =>
    requireFiniteNumber(entry, `${label}[${index}]`)
  );
};

const validateCharacterProgression = (value, label) => {
  const progression = requireObject(value, label);
  requireString(progression.specializedStat, `${label}.specializedStat`);
  const base = requireObject(progression.base, `${label}.base`);
  for (const stat of ["hp", "attack", "defense", "specialized"]) {
    requireFiniteNumber(base[stat], `${label}.base.${stat}`);
  }
  const growth = requireObject(progression.growth, `${label}.growth`);
  for (const stat of ["hp", "attack", "defense"]) {
    validateNumberArray(growth[stat], 100, `${label}.growth.${stat}`);
  }
  const promotions = requireArray(
    progression.promotions,
    `${label}.promotions`
  );
  if (promotions.length !== 7) {
    throw new Error(`${label}.promotions must contain seven phases`);
  }
  promotions.forEach((promotionInput, ascension) => {
    const promotion = requireObject(
      promotionInput,
      `${label}.promotions[${ascension}]`
    );
    for (const stat of ["hp", "attack", "defense", "specialized"]) {
      requireFiniteNumber(
        promotion[stat],
        `${label}.promotions[${ascension}].${stat}`
      );
    }
  });
};

const validateWeaponProgression = (value, label) => {
  const progression = requireObject(value, label);
  if (progression.specializedStat !== null) {
    requireString(progression.specializedStat, `${label}.specializedStat`);
  }
  const base = requireObject(progression.base, `${label}.base`);
  requireFiniteNumber(base.attack, `${label}.base.attack`);
  requireFiniteNumber(base.specialized, `${label}.base.specialized`);
  const growth = requireObject(progression.growth, `${label}.growth`);
  validateNumberArray(growth.attack, 100, `${label}.growth.attack`);
  if (progression.specializedStat === null) {
    if (growth.specialized !== null) {
      throw new Error(`${label}.growth.specialized must be null`);
    }
  } else {
    validateNumberArray(growth.specialized, 100, `${label}.growth.specialized`);
  }
  validateNumberArray(progression.promotions, 1, `${label}.promotions`);
};

const validateSnapshotRecords = (snapshot) => {
  snapshot.characters.forEach((record, index) => {
    const label = `fallback snapshot.characters[${index}]`;
    validateTranslations(record.translations, `${label}.translations`);
    requireString(record.element, `${label}.element`);
    requireString(record.weaponType, `${label}.weaponType`);
    requireFiniteNumber(record.rarity, `${label}.rarity`);
    const images = requireObject(record.images, `${label}.images`);
    requireString(images.filenameIcon, `${label}.images.filenameIcon`);
    requireString(
      images.filenameGachaSplash,
      `${label}.images.filenameGachaSplash`
    );
    validateCharacterProgression(record.progression, `${label}.progression`);
  });
  snapshot.weapons.forEach((record, index) => {
    const label = `fallback snapshot.weapons[${index}]`;
    validateTranslations(record.translations, `${label}.translations`);
    requireString(record.weaponType, `${label}.weaponType`);
    requireFiniteNumber(record.rarity, `${label}.rarity`);
    const images = requireObject(record.images, `${label}.images`);
    requireString(images.filenameIcon, `${label}.images.filenameIcon`);
    requireString(
      images.filenameAwakenIcon,
      `${label}.images.filenameAwakenIcon`
    );
    validateWeaponProgression(record.progression, `${label}.progression`);
  });
  snapshot.artifactSets.forEach((record, index) => {
    const label = `fallback snapshot.artifactSets[${index}]`;
    validateTranslations(record.translations, `${label}.translations`);
    const effects = requireObject(record.effects, `${label}.effects`);
    if (
      typeof effects.twoPiece !== "string" ||
      typeof effects.fourPiece !== "string"
    ) {
      throw new Error(`${label}.effects must contain string descriptions`);
    }
    const images = requireObject(record.images, `${label}.images`);
    for (const position of ["flower", "plume", "sands", "goblet", "circlet"]) {
      requireString(images[position], `${label}.images.${position}`);
    }
  });
};

const validateSource = (source, label) => {
  requireObject(source, label);
  requireString(source.id, `${label}.id`);
  requireString(source.role, `${label}.role`);
  if (source.version !== undefined) {
    requireString(source.version, `${label}.version`);
  }
  if (source.revision !== undefined) {
    requireString(source.revision, `${label}.revision`);
  }
  return source;
};

const validateIdentity = (record, label) => {
  requireObject(record, label);
  requireString(record.key, `${label}.key`);
  requireString(record.name, `${label}.name`);
  if (!Number.isSafeInteger(record.gameId) || record.gameId <= 0) {
    throw new Error(`${label}.gameId must be a positive safe integer`);
  }
  return record;
};

const validateRecordIdentities = (records, providerId, catalogName) => {
  const keys = new Set();
  const gameIds = new Set();
  records.forEach((record, index) => {
    validateIdentity(record, `${providerId} ${catalogName}[${index}]`);
    if (keys.has(record.key)) {
      throw new Error(
        `${providerId} ${catalogName} has duplicate key ${record.key}`
      );
    }
    if (gameIds.has(record.gameId)) {
      throw new Error(
        `${providerId} ${catalogName} has duplicate game id ${record.gameId}`
      );
    }
    keys.add(record.key);
    gameIds.add(record.gameId);
  });
};

const validateProvider = (provider) => {
  requireObject(provider, "catalog provider");
  const source = validateSource(provider.source, "catalog provider source");
  for (const catalogName of ["characters", "weapons", "artifactSets"]) {
    const records = requireArray(
      provider[catalogName],
      `${source.id} ${catalogName}`
    );
    validateRecordIdentities(records, source.id, catalogName);
  }
  return provider;
};

const mergeRecords = (
  primary,
  fallback,
  primaryId,
  fallbackId,
  catalogName
) => {
  const merged = primary.map((record) => ({
    ...record,
    sourceId: primaryId,
  }));
  const primaryByKey = new Map(primary.map((record) => [record.key, record]));
  const primaryByGameId = new Map(
    primary.map((record) => [record.gameId, record])
  );

  for (const record of fallback) {
    const keyMatch = primaryByKey.get(record.key);
    if (keyMatch) {
      if (keyMatch.gameId !== record.gameId) {
        throw new Error(
          `${catalogName} key ${record.key} maps to both game ids ` +
            `${keyMatch.gameId} and ${record.gameId}`
        );
      }
      continue;
    }

    const idMatch = primaryByGameId.get(record.gameId);
    if (idMatch) {
      throw new Error(
        `${catalogName} game id ${record.gameId} maps to both keys ` +
          `${idMatch.key} and ${record.key}`
      );
    }
    merged.push({ ...record, sourceId: fallbackId });
  }

  return merged;
};

export const mergeCatalogProviders = (primaryInput, fallbackInput) => {
  const primary = validateProvider(primaryInput);
  const fallback = validateProvider(fallbackInput);
  if (primary.source.role !== "primary") {
    throw new Error(`${primary.source.id} must have the primary role`);
  }
  if (fallback.source.role !== "fallback") {
    throw new Error(`${fallback.source.id} must have the fallback role`);
  }

  return {
    sources: [primary.source, fallback.source],
    characters: mergeRecords(
      primary.characters,
      fallback.characters,
      primary.source.id,
      fallback.source.id,
      "characters"
    ),
    weapons: mergeRecords(
      primary.weapons,
      fallback.weapons,
      primary.source.id,
      fallback.source.id,
      "weapons"
    ),
    artifactSets: mergeRecords(
      primary.artifactSets,
      fallback.artifactSets,
      primary.source.id,
      fallback.source.id,
      "artifactSets"
    ),
  };
};

export const validateFallbackSnapshot = (input) => {
  const snapshot = requireObject(input, "fallback snapshot");
  if (snapshot.schemaVersion !== 1) {
    throw new Error("fallback snapshot schemaVersion must be 1");
  }
  requireString(snapshot.gameVersion, "fallback snapshot.gameVersion");
  const sources = requireArray(snapshot.sources, "fallback snapshot.sources");
  sources.forEach((source, index) =>
    validateSource(source, `fallback snapshot.sources[${index}]`)
  );
  const enkaSources = sources.filter(
    (source) => source.id === "enka-network" && source.role === "fallback"
  );
  if (enkaSources.length !== 1) {
    throw new Error(
      "fallback snapshot must declare exactly one Enka fallback source"
    );
  }
  try {
    requireEnkaRevision(enkaSources[0].revision);
  } catch {
    throw new Error("fallback snapshot Enka source must pin a full revision");
  }
  const releaseSources = sources.filter(
    (source) =>
      source.id === "genshin-data" && source.role === "release-catalog"
  );
  if (releaseSources.length !== 1 || !releaseSources[0].version) {
    throw new Error(
      "fallback snapshot must declare exactly one versioned release-catalog source"
    );
  }

  const fallbackProvider = {
    source: enkaSources[0],
    characters: requireArray(
      snapshot.characters,
      "fallback snapshot.characters"
    ),
    weapons: requireArray(snapshot.weapons, "fallback snapshot.weapons"),
    artifactSets: requireArray(
      snapshot.artifactSets,
      "fallback snapshot.artifactSets"
    ),
  };
  validateProvider(fallbackProvider);
  validateSnapshotRecords(snapshot);
  return snapshot;
};

export const loadFallbackSnapshot = () =>
  validateFallbackSnapshot(
    JSON.parse(readFileSync(FALLBACK_SNAPSHOT_URL, "utf8"))
  );

const requireGenshinDbEntity = (query, label) => {
  if (!query || Array.isArray(query)) {
    throw new Error(`${label} is missing from genshin-db`);
  }
  return query;
};

const localizedNames = (query, englishName, includeTranslations) => {
  if (!includeTranslations) return { en: englishName };
  return Object.fromEntries([
    ["en", englishName],
    ...Object.entries(databaseLanguageByLocale).map(([locale, language]) => {
      const localized = requireGenshinDbEntity(
        query(englishName, { resultLanguage: language }),
        `${englishName} ${locale} translation`
      );
      return [locale, localized.name];
    }),
  ]);
};

const requireProgressionStat = (fightProperty, label) => {
  const stat = progressionStatByFightProperty[fightProperty];
  if (!stat) throw new Error(`${label} has unsupported stat ${fightProperty}`);
  return stat;
};

const createPrimaryCharacters = (includeTranslations) => {
  const characterNames = genshinDb.characters("names", {
    matchCategories: true,
  });
  const travelerNames = genshinDb
    .talents("names", { matchCategories: true })
    .filter((name) => /^Traveler \(.+\)$/.test(name));
  return [...characterNames, ...travelerNames].map((name) => {
    const traveler = name.startsWith("Traveler ");
    const entity = requireGenshinDbEntity(
      traveler ? genshinDb.talents(name) : genshinDb.characters(name),
      `Character ${name}`
    );
    const progressionEntity = traveler
      ? requireGenshinDbEntity(genshinDb.characters("Aether"), "Aether")
      : entity;
    const element = traveler
      ? entity.name.match(/^Traveler \((.+)\)$/)?.[1]
      : entity.elementText === "None"
      ? ""
      : entity.elementText;
    const images = entity.images ?? {};
    return {
      key: characterKey(entity.name),
      gameId: Number(entity.id),
      name: entity.name,
      translations: localizedNames(
        traveler ? genshinDb.talents : genshinDb.characters,
        entity.name,
        includeTranslations
      ),
      element: element ?? "",
      weaponType: traveler ? "Sword" : entity.weaponText,
      rarity: traveler ? 5 : entity.rarity,
      images: {
        filenameIcon:
          images.filename_icon ??
          (traveler ? "UI_AvatarIcon_PlayerBoy" : undefined),
        filenameGachaSplash: images.filename_gachaSplash,
        iconUrls: [images.mihoyo_icon, images.icon, images.image].filter(
          Boolean
        ),
        gachaUrls: [images.gacha, images.card].filter(Boolean),
      },
      progression: {
        specializedStat: requireProgressionStat(
          progressionEntity.substatType,
          `Character ${entity.name}`
        ),
        stats: progressionEntity.stats,
      },
    };
  });
};

const createPrimaryWeapons = (includeTranslations) =>
  [...new Set(genshinDb.weapons("names", { matchCategories: true }))].map(
    (name) => {
      const entity = requireGenshinDbEntity(
        genshinDb.weapons(name),
        `Weapon ${name}`
      );
      const images = entity.images ?? {};
      return {
        key: weaponKey(entity.name),
        gameId: Number(entity.id),
        name: entity.name,
        translations: localizedNames(
          genshinDb.weapons,
          entity.name,
          includeTranslations
        ),
        weaponType: entity.weaponText,
        rarity: entity.rarity,
        images: {
          filenameIcon: images.filename_icon,
          filenameAwakenIcon: images.filename_awakenIcon,
          iconUrls: [images.mihoyo_icon].filter(Boolean),
          awakenUrls: [images.mihoyo_awakenIcon].filter(Boolean),
        },
        progression: {
          specializedStat: entity.mainStatType
            ? requireProgressionStat(
                entity.mainStatType,
                `Weapon ${entity.name}`
              )
            : null,
          stats: entity.stats,
        },
      };
    }
  );

const artifactPositions = ["flower", "plume", "sands", "goblet", "circlet"];

const createPrimaryArtifactSets = (includeTranslations) =>
  [...new Set(genshinDb.artifacts("names", { matchCategories: true }))].map(
    (name) => {
      const entity = requireGenshinDbEntity(
        genshinDb.artifacts(name),
        `Artifact set ${name}`
      );
      const images = entity.images ?? {};
      return {
        key: artifactSetKey(entity.name),
        gameId: Number(entity.id),
        name: entity.name,
        translations: localizedNames(
          genshinDb.artifacts,
          entity.name,
          includeTranslations
        ),
        effects: {
          twoPiece: entity.effect2Pc ?? "",
          fourPiece: entity.effect4Pc ?? "",
        },
        images: Object.fromEntries(
          artifactPositions.flatMap((position) => {
            const filename = images[`filename_${position}`];
            return filename ? [[position, filename]] : [];
          })
        ),
        imageUrls: Object.fromEntries(
          artifactPositions.flatMap((position) => {
            const url = images[`mihoyo_${position}`];
            return url ? [[position, [url]]] : [];
          })
        ),
      };
    }
  );

export const createGenshinDbProvider = ({
  includeTranslations = true,
} = {}) => ({
  source: {
    id: "genshin-db",
    role: "primary",
    version: genshinDbPackage.version,
    gameVersion: genshinDbGameVersion,
  },
  characters: createPrimaryCharacters(includeTranslations),
  weapons: createPrimaryWeapons(includeTranslations),
  artifactSets: createPrimaryArtifactSets(includeTranslations),
});

const createSnapshotProvider = (snapshot) => ({
  source: snapshot.sources.find(({ id }) => id === "enka-network"),
  characters: snapshot.characters.map((record) => ({
    ...record,
    progression: {
      specializedStat: record.progression.specializedStat,
      stats: (level, ascension) => ({
        ascension,
        ...calculateNormalizedCharacterStats(
          record.progression,
          level,
          ascension
        ),
      }),
    },
  })),
  weapons: snapshot.weapons.map((record) => ({
    ...record,
    progression: {
      specializedStat: record.progression.specializedStat,
      stats: (level, ascension) => ({
        ascension,
        ...calculateNormalizedWeaponStats(record.progression, level, ascension),
      }),
    },
  })),
  artifactSets: snapshot.artifactSets,
});

export const createGameDataCatalog = ({
  fallbackSnapshot = loadFallbackSnapshot(),
  includeTranslations = true,
} = {}) => {
  const snapshot = validateFallbackSnapshot(fallbackSnapshot);
  const primary = createGenshinDbProvider({ includeTranslations });
  const merged = mergeCatalogProviders(
    primary,
    createSnapshotProvider(snapshot)
  );
  return {
    manifest: {
      schemaVersion: 1,
      gameVersion: snapshot.gameVersion,
      sources: [primary.source, ...snapshot.sources],
    },
    characters: merged.characters,
    weapons: merged.weapons,
    artifactSets: merged.artifactSets,
  };
};
