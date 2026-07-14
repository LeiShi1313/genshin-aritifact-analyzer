export const ARTIFACT_SCORING_PERSIST_VERSION = 2;

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

export const artifactScoringMigrations = {
  [ARTIFACT_SCORING_PERSIST_VERSION]: migrateArtifactScoringState,
};
