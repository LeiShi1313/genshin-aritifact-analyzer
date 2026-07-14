import type { AttributePosition, AttributeType } from "../../genshin/attribute";

export type UnitInterval = number;
export type Milestone = 0 | 4 | 8 | 12 | 16 | 20;

export type EvaluationIssueSeverity = "warning" | "error";

export type EvaluationIssueCode =
  | "UNSUPPORTED_ARTIFACT_STAR_RARITY"
  | "MISSING_MAIN_STAT"
  | "DUPLICATE_SUBSTAT"
  | "SUBSTAT_EQUALS_MAIN_STAT"
  | "INVALID_ARTIFACT_LEVEL"
  | "INVALID_VISIBLE_LINE_COUNT"
  | "IMPOSSIBLE_SUBSTAT_VALUE"
  | "IMPOSSIBLE_TOTAL_ROLL_COUNT"
  | "INVALID_BUILD_MAIN_STAT"
  | "INVALID_BUILD_SUBSTAT"
  | "DUPLICATE_BUILD_SUBSTAT"
  | "INVALID_BUILD_IMPORTANCE"
  | "NO_LEGAL_DESIRED_SUBSTAT"
  | "INVALID_WORKER_REQUEST"
  | "STALE_SCORING_SNAPSHOT";

export interface EvaluationIssue {
  readonly code: EvaluationIssueCode;
  readonly severity: EvaluationIssueSeverity;
  readonly artifactIndex?: number;
  readonly buildId?: string;
  readonly details?: Readonly<Record<string, string | number>>;
}

export interface CanonicalSubstat {
  readonly type: AttributeType;
  readonly displayValueKey: number;
  /** Sum of nominal tier points. Each roll contributes exactly 7, 8, 9, or 10. */
  readonly rollValuePoints: number;
  readonly possibleRollCounts: readonly number[];
}

declare const canonicalArtifactBrand: unique symbol;

export type CanonicalArtifactState = Readonly<{
  position: AttributePosition;
  level: number;
  milestone: Milestone;
  mainStat: AttributeType;
  substats: readonly CanonicalSubstat[];
  [canonicalArtifactBrand]: true;
}>;

declare const validatedBuildProfileBrand: unique symbol;

export type BuildScoringProfile = Readonly<{
  id: string;
  preferredMainStats: Readonly<
    Partial<Record<AttributePosition, readonly AttributeType[]>>
  >;
  /** Positive, GCD-normalized integer importance. Missing means unselected. */
  importanceBySubstat: Readonly<Partial<Record<AttributeType, number>>>;
  [validatedBuildProfileBrand]: true;
}>;

export interface NormalSourceFiveStarProfile {
  readonly kind: "normal-five-star";
  readonly fourLineStartProbability: UnitInterval;
}

export type CanonicalizeArtifactResult =
  | {
      readonly status: "ok";
      readonly artifact: CanonicalArtifactState;
      readonly issues: readonly EvaluationIssue[];
    }
  | {
      readonly status: "unsupported" | "invalid";
      readonly issues: readonly EvaluationIssue[];
    };

export type ValidateBuildResult =
  | {
      readonly status: "ok";
      readonly profile: BuildScoringProfile;
      readonly issues: readonly EvaluationIssue[];
    }
  | {
      readonly status: "invalid";
      readonly issues: readonly EvaluationIssue[];
    };

export interface BuildMatchResult {
  readonly value: UnitInterval;
  readonly isPreferredMain: boolean;
  readonly mainContribution: UnitInterval;
  readonly substatContribution: UnitInterval;
  readonly issues: readonly EvaluationIssue[];
}

export interface CanonicalRollLookupEntry {
  readonly displayValueKey: number;
  readonly rollValuePoints: number;
  readonly possibleRollCounts: readonly number[];
}

export type CanonicalRollResult =
  | ({ readonly status: "ok" } & CanonicalRollLookupEntry)
  | { readonly status: "invalid-display-value" }
  | {
      readonly status: "impossible-roll-value";
      readonly displayValueKey: number;
    }
  | { readonly status: "unsupported-substat" };
