export const ARTIFACT_SCORING_PERSIST_VERSION = 3;

const DEFAULT_FOUR_LINE_START_PROBABILITY = 0.2;

const validProbability = (value) =>
  typeof value === "number" &&
  Number.isFinite(value) &&
  value >= 0 &&
  value <= 1;

/**
 * Removes obsolete derived scoring state while preserving user-owned imports,
 * builds, enablement, and protobuf-encoded manual substat importance values.
 */
export const migrateArtifactScoringState = (state) => {
  if (!state || typeof state !== "object") return state;

  const fourLineStartProbability = validProbability(
    state.configs?.fourLineStartProbability
  )
    ? state.configs.fourLineStartProbability
    : DEFAULT_FOUR_LINE_START_PROBABILITY;

  const { weights: _obsoleteWeights, ...build } = state.build ?? {};

  return {
    ...state,
    artifacts: {},
    build: state.build ? build : state.build,
    configs: { fourLineStartProbability },
  };
};

const validAscension = (value) =>
  Number.isInteger(value) && value >= 0 && value <= 6;

const ascensionFromMaxLevel = (maxLevel) => {
  if (maxLevel <= 20) return 0;
  if (maxLevel <= 40) return 1;
  if (maxLevel <= 50) return 2;
  if (maxLevel <= 60) return 3;
  if (maxLevel <= 70) return 4;
  if (maxLevel <= 80) return 5;
  return 6;
};

const withExplicitAscension = (entry) => {
  if (!entry || typeof entry !== "object" || validAscension(entry.ascension)) {
    return entry;
  }

  const progressionCap = Number.isFinite(entry.maxLevel)
    ? entry.maxLevel
    : Number.isFinite(entry.level)
      ? entry.level
      : 1;

  return {
    ...entry,
    ascension: ascensionFromMaxLevel(progressionCap),
  };
};

const migrateUploadProgression = (upload) => {
  if (!upload || typeof upload !== "object") return upload;

  const characters = Array.isArray(upload.characters)
    ? upload.characters.map(withExplicitAscension)
    : upload.characters;
  const weapons = Array.isArray(upload.weapons)
    ? upload.weapons.map(withExplicitAscension)
    : upload.weapons;

  const charactersChanged =
    Array.isArray(upload.characters) &&
    characters.some((entry, index) => entry !== upload.characters[index]);
  const weaponsChanged =
    Array.isArray(upload.weapons) &&
    weapons.some((entry, index) => entry !== upload.weapons[index]);

  return charactersChanged || weaponsChanged
    ? { ...upload, characters, weapons }
    : upload;
};

/**
 * Adds the explicit ascension field required by stat progression lookups while
 * retaining maxLevel for the existing GCSim export flow.
 */
export const migrateImportedProgressionState = (state) => {
  const uploads = state?.uploads;
  const artifactUploads = uploads?.artifacts;
  if (!artifactUploads || typeof artifactUploads !== "object") return state;

  let changed = false;
  const migratedArtifactUploads = Object.fromEntries(
    Object.entries(artifactUploads).map(([key, upload]) => {
      const migrated = migrateUploadProgression(upload);
      changed ||= migrated !== upload;
      return [key, migrated];
    })
  );

  if (!changed) return state;

  return {
    ...state,
    uploads: {
      ...uploads,
      artifacts: migratedArtifactUploads,
    },
  };
};

export const artifactScoringMigrations = {
  [2]: migrateArtifactScoringState,
  [3]: migrateImportedProgressionState,
};
