import { memo, useState } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import { AttributePosition, AttributeType } from "../../../genshin/attribute";
import { Artifact } from "../../../genshin/artifact";
import { Set } from "../../../genshin/set";
import { ArtifactOverride } from "../types";
import { getArtifactIconUrl } from "../utils";
import ArtifactSelectionModal from "../../artifacts/ArtifactSelectionModal";

// Check if attribute type is a percentage type
const isPercentageStat = (type: AttributeType): boolean => {
  return [
    AttributeType.HP_PERCENT,
    AttributeType.ATK_PERCENT,
    AttributeType.DEF_PERCENT,
    AttributeType.ENERGY_RECHARGE,
    AttributeType.CRIT_RATE,
    AttributeType.CRIT_DAMAGE,
    AttributeType.HEALING_BONUS,
    AttributeType.ANEMO_DAMAGE_BONUS,
    AttributeType.CRYO_DAMAGE_BONUS,
    AttributeType.DENDRO_DAMAGE_BONUS,
    AttributeType.ELECTRO_DAMAGE_BONUS,
    AttributeType.GEO_DAMAGE_BONUS,
    AttributeType.HYDRO_DAMAGE_BONUS,
    AttributeType.PHYSICAL_DAMAGE_BONUS,
    AttributeType.PYRO_DAMAGE_BONUS,
  ].includes(type);
};

// Format stat value based on type
const formatStatValue = (type: AttributeType, value: number): string => {
  if (isPercentageStat(type)) {
    return `${(value*100).toFixed(1)}%`;
  }
  return Math.round(value).toString();
};

// Artifact positions in display order
const ARTIFACT_POSITIONS = [
  AttributePosition.FLOWER,
  AttributePosition.PLUME,
  AttributePosition.SANDS,
  AttributePosition.GOBLET,
  AttributePosition.CIRCLET,
] as const;

interface ArtifactSlotsProps {
  artifacts?: ArtifactOverride[];
  uploadedArtifacts: Artifact[];
  characterId: number;
  enabled: boolean;
  onChange: (artifacts: ArtifactOverride[] | undefined) => void;
}

const ArtifactSlots = memo(({
  artifacts,
  uploadedArtifacts,
  characterId,
  enabled,
  onChange,
}: ArtifactSlotsProps) => {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState<AttributePosition | null>(null);

  // Get artifacts equipped by this character
  const getEquippedArtifacts = (): ArtifactOverride[] => {
    return ARTIFACT_POSITIONS.map(position => {
      const equippedArtifact = uploadedArtifacts.find(
        a => a.character === characterId && a.position === position
      );
      return {
        position,
        artifact: equippedArtifact || undefined,
      };
    });
  };

  // Reset to equipped artifacts
  const handleReset = () => {
    onChange(getEquippedArtifacts());
  };

  // Check if current artifacts differ from equipped
  const hasChanges = (): boolean => {
    if (!artifacts) return false;
    const equipped = getEquippedArtifacts();
    return artifacts.some((ao, idx) => {
      const eq = equipped.find(e => e.position === ao.position);
      if (!eq) return true;
      if (ao.artifact === eq.artifact) return false;
      if (!ao.artifact && !eq.artifact) return false;
      if (!ao.artifact || !eq.artifact) return true;
      // Compare by properties
      return ao.artifact.set !== eq.artifact.set ||
        ao.artifact.mainAttribute?.type !== eq.artifact.mainAttribute?.type ||
        ao.artifact.mainAttribute?.value !== eq.artifact.mainAttribute?.value;
    });
  };

  // Format artifact stats for tooltip
  const getArtifactTooltip = (artifact: Artifact): string => {
    const lines: string[] = [];

    // Set name
    lines.push(`${t(Set[artifact.set]?.toLowerCase(), { ns: "sets" })} +${artifact.level}`);
    lines.push("─────────");

    // Main stat
    if (artifact.mainAttribute) {
      const mainType = t(AttributeType[artifact.mainAttribute.type]?.toLowerCase(), { ns: "artifacts" });
      const mainValue = formatStatValue(artifact.mainAttribute.type, artifact.mainAttribute.value);
      lines.push(`${mainType}: ${mainValue}`);
    }

    lines.push("─────────");

    // Sub stats
    if (artifact.subAttributes && artifact.subAttributes.length > 0) {
      artifact.subAttributes.forEach(sub => {
        const subType = t(AttributeType[sub.type]?.toLowerCase(), { ns: "artifacts" });
        const subValue = formatStatValue(sub.type, sub.value);
        lines.push(`${subType}: +${subValue}`);
      });
    }

    return lines.join("\n");
  };

  // Get artifacts available for a specific position (only level 20)
  const getArtifactsForPosition = (position: AttributePosition) => {
    return uploadedArtifacts.filter(a => a.position === position && a.level === 20);
  };

  // Get current artifact override for a position
  const getArtifactOverride = (position: AttributePosition): ArtifactOverride | undefined => {
    return artifacts?.find(a => a.position === position);
  };

  // Handle artifact selection for a position
  // When clearing, we keep the position in the array but set artifact to undefined
  // This ensures that empty positions are intentionally empty (not using equipped artifact)
  const handleArtifactChange = (position: AttributePosition, artifact: Artifact | null) => {
    const currentArtifacts = artifacts || [];
    let newArtifacts: ArtifactOverride[];

    const existingIdx = currentArtifacts.findIndex(a => a.position === position);

    if (existingIdx >= 0) {
      // Update existing position (set artifact or clear it)
      newArtifacts = [...currentArtifacts];
      newArtifacts[existingIdx] = { position, artifact: artifact || undefined };
    } else {
      // Add new position entry
      newArtifacts = [...currentArtifacts, { position, artifact: artifact || undefined }];
    }

    onChange(newArtifacts);
    setShowModal(null);
  };

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 justify-between">
        <span className="text-xs opacity-70">{t("Artifacts")}:</span>
        {hasChanges() && (
          <button
            className="btn btn-ghost btn-xs"
            onClick={handleReset}
            disabled={!enabled}
            title={t("Reset to equipped artifacts")}
          >
            {t("Reset")}
          </button>
        )}
      </div>
      <div className="mt-1 flex flex-wrap gap-1">
        {ARTIFACT_POSITIONS.map((position) => {
          const artifactOverride = getArtifactOverride(position);
          const positionKey = AttributePosition[position]?.toLowerCase();
          const hasArtifact = artifactOverride?.artifact;
          // Position is intentionally cleared if it exists in overrides but has no artifact
          const isCleared = artifactOverride && !artifactOverride.artifact;

          const buttonElement = (
            <button
              className={classNames(
                "relative h-10 w-10 rounded border-2 transition-all",
                hasArtifact
                  ? "border-primary bg-base-300"
                  : isCleared
                    ? "border-error/50 bg-base-100 opacity-70"
                    : "border-base-300 bg-base-100 opacity-50 hover:opacity-100",
                !enabled && "cursor-not-allowed opacity-30"
              )}
              onClick={() => enabled && setShowModal(position)}
              disabled={!enabled}
            >
              {hasArtifact ? (
                <>
                  <img
                    className="h-full w-full object-contain"
                    src={getArtifactIconUrl(artifactOverride.artifact!)}
                  />
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-base-100 text-[10px] font-bold">
                    +{artifactOverride.artifact!.level}
                  </span>
                </>
              ) : isCleared ? (
                <span className="flex h-full w-full items-center justify-center text-lg text-error/50">
                  ✕
                </span>
              ) : (
                <span className="flex h-full w-full items-center justify-center text-lg opacity-30">
                  {positionKey?.[0]?.toUpperCase()}
                </span>
              )}
            </button>
          );

          return hasArtifact ? (
            <div
              key={position}
              className="tooltip tooltip-top whitespace-pre-line text-left"
              data-tip={getArtifactTooltip(artifactOverride.artifact!)}
            >
              {buttonElement}
            </div>
          ) : (
            <div
              key={position}
              className="tooltip tooltip-top"
              data-tip={t(positionKey, { ns: "artifacts" })}
            >
              {buttonElement}
            </div>
          );
        })}
      </div>

      {/* Artifact Selection Modal */}
      {showModal !== null && (
        <ArtifactSelectionModal
          position={showModal}
          currentArtifact={getArtifactOverride(showModal)?.artifact}
          availableArtifacts={getArtifactsForPosition(showModal)}
          onSelect={(artifact) => handleArtifactChange(showModal, artifact)}
          onClose={() => setShowModal(null)}
        />
      )}
    </div>
  );
});

ArtifactSlots.displayName = 'ArtifactSlots';

export default ArtifactSlots;
