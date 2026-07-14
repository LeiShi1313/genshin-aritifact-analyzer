import { Artifact } from "../../genshin/artifact";
import { AttributePosition } from "../../genshin/attribute";
import { Set } from "../../genshin/set";
import { isGCSimSetSupported } from "../../utils/gcsimCapabilities";
import { ArtifactOverride, CharacterOverride, SetOverride } from "./types";

export interface InferredGCSimSets {
  sets?: SetOverride[];
  unsupportedSets?: Set[];
}

const ARTIFACT_POSITIONS = [
  AttributePosition.FLOWER,
  AttributePosition.PLUME,
  AttributePosition.SANDS,
  AttributePosition.GOBLET,
  AttributePosition.CIRCLET,
] as const;

export const initializeArtifactOverrides = (
  equippedArtifacts: Artifact[],
  includeEmptyLoadout: boolean
): ArtifactOverride[] | undefined => {
  if (!includeEmptyLoadout && equippedArtifacts.length === 0) {
    return undefined;
  }

  return ARTIFACT_POSITIONS.map((position) => ({
    position,
    artifact: equippedArtifacts.find(
      (artifact) => artifact.position === position
    ),
  }));
};

export const inferGCSimSets = (artifacts: Artifact[]): InferredGCSimSets => {
  const counts = new Map<Set, number>();

  for (const artifact of artifacts) {
    if (artifact.set !== undefined && artifact.set !== Set.UNRECOGNIZED) {
      counts.set(artifact.set, (counts.get(artifact.set) ?? 0) + 1);
    }
  }

  const inferred = [...counts.entries()]
    .filter(([, count]) => count >= 2)
    .map(
      ([set, count]): SetOverride => ({
        set,
        count: count >= 4 ? 4 : 2,
      })
    );
  const sets = inferred.filter(({ set }) => isGCSimSetSupported(set));
  const unsupportedSets = inferred
    .filter(({ set }) => !isGCSimSetSupported(set))
    .map(({ set }) => set);

  return {
    sets: sets.length > 0 ? sets : undefined,
    unsupportedSets: unsupportedSets.length > 0 ? unsupportedSets : undefined,
  };
};

export const synchronizeInferredArtifactSets = (
  override: CharacterOverride,
  artifacts: ArtifactOverride[] | undefined
): CharacterOverride => {
  if (override.setsAreInferred === false) {
    return { ...override, artifacts };
  }

  const inferred = inferGCSimSets(
    (artifacts ?? []).flatMap(({ artifact }) => (artifact ? [artifact] : []))
  );
  const unsupportedEquipment = {
    ...override.unsupportedEquipment,
    sets: inferred.unsupportedSets,
  };

  return {
    ...override,
    artifacts,
    sets: inferred.sets,
    setsAreInferred: true,
    unsupportedEquipment:
      unsupportedEquipment.weapon || unsupportedEquipment.sets?.length
        ? unsupportedEquipment
        : undefined,
  };
};
