export const ARTIFACT_SCORING_QUERY_DEFAULTS = {
  match: 0.55,
  prospectEnabled: false,
  prospect: 0.9,
  sort: "expectedFinalMatch-desc",
  set: 0,
  position: 0,
  minLevel: 0,
  maxLevel: 20,
  showSelected: true,
} as const;

export const ARTIFACT_SCORE_SORTS = [
  "expectedFinalMatch-desc",
  "expectedFinalMatch-asc",
  "currentMatch-desc",
  "currentMatch-asc",
  "prospect-desc",
  "prospect-asc",
] as const;

export type ArtifactScoreSort = (typeof ARTIFACT_SCORE_SORTS)[number];

export interface ArtifactScoringQuery {
  match: number;
  prospectEnabled: boolean;
  prospect: number;
  sort: ArtifactScoreSort;
  set: number;
  position: number;
  minLevel: number;
  maxLevel: number;
  showSelected: boolean;
}

const finiteUnitInterval = (value: string | null, fallback: number): number => {
  if (value === null || value.trim() === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1
    ? parsed
    : fallback;
};

const explicitBoolean = (value: string | null, fallback: boolean): boolean => {
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
};

const boundedInteger = (
  value: string | null,
  fallback: number,
  min: number,
  max: number
): number => {
  if (value === null || value.trim() === "") return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= min && parsed <= max
    ? parsed
    : fallback;
};

const scoreSort = (value: string | null): ArtifactScoreSort =>
  ARTIFACT_SCORE_SORTS.includes(value as ArtifactScoreSort)
    ? (value as ArtifactScoreSort)
    : ARTIFACT_SCORING_QUERY_DEFAULTS.sort;

const artifactSet = (value: string | null): number => {
  const parsed = boundedInteger(value, 0, 0, Number.MAX_SAFE_INTEGER);
  return typeof Set[parsed] === "string" && parsed !== Set.UNRECOGNIZED
    ? parsed
    : 0;
};

export const parseArtifactScoringQuery = (
  input: URLSearchParams | string
): ArtifactScoringQuery => {
  const params =
    typeof input === "string"
      ? new URLSearchParams(input.startsWith("?") ? input.slice(1) : input)
      : input;

  const minLevel = boundedInteger(
    params.get("minLevel"),
    ARTIFACT_SCORING_QUERY_DEFAULTS.minLevel,
    0,
    20
  );
  const maxLevel = boundedInteger(
    params.get("maxLevel"),
    ARTIFACT_SCORING_QUERY_DEFAULTS.maxLevel,
    0,
    20
  );

  return {
    match: finiteUnitInterval(
      params.get("match"),
      ARTIFACT_SCORING_QUERY_DEFAULTS.match
    ),
    prospectEnabled: explicitBoolean(
      params.get("prospectEnabled"),
      ARTIFACT_SCORING_QUERY_DEFAULTS.prospectEnabled
    ),
    prospect: finiteUnitInterval(
      params.get("prospect"),
      ARTIFACT_SCORING_QUERY_DEFAULTS.prospect
    ),
    sort: scoreSort(params.get("sort")),
    set: artifactSet(params.get("set")),
    position: boundedInteger(params.get("position"), 0, 0, 5),
    minLevel: Math.min(minLevel, maxLevel),
    maxLevel: Math.max(minLevel, maxLevel),
    showSelected: explicitBoolean(
      params.get("showSelected"),
      ARTIFACT_SCORING_QUERY_DEFAULTS.showSelected
    ),
  };
};

const setIfNonDefault = (
  params: URLSearchParams,
  key: keyof ArtifactScoringQuery,
  value: ArtifactScoringQuery[keyof ArtifactScoringQuery]
) => {
  if (value !== ARTIFACT_SCORING_QUERY_DEFAULTS[key]) {
    params.set(key, String(value));
  }
};

export const serializeArtifactScoringQuery = (
  query: ArtifactScoringQuery
): URLSearchParams => {
  const params = new URLSearchParams();
  (
    Object.keys(ARTIFACT_SCORING_QUERY_DEFAULTS) as Array<
      keyof ArtifactScoringQuery
    >
  ).forEach((key) => setIfNonDefault(params, key, query[key]));
  return params;
};
import { Set } from "../../genshin/set";
