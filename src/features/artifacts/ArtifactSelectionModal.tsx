import { memo, useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import { AttributePosition, AttributeType } from "../../genshin/attribute";
import { Artifact } from "../../genshin/artifact";
import { Set as ArtifactSet } from "../../genshin/set";
import { getArtifactIconUrl, getSetIconUrl } from "../gcsim/utils";
import { mainAttributeOptions, subAttributeOptions } from "../../utils/attribute";
import SelectionModal from "../gcsim/components/SelectionModal";

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

interface ArtifactSelectionModalProps {
  position: AttributePosition;
  currentArtifact?: Artifact;
  availableArtifacts: Artifact[];
  onSelect: (artifact: Artifact | null) => void;
  onClose: () => void;
}

const ArtifactSelectionModal = memo(({
  position,
  currentArtifact,
  availableArtifacts,
  onSelect,
  onClose,
}: ArtifactSelectionModalProps) => {
  const { t, i18n } = useTranslation();
  const [searchText, setSearchText] = useState("");
  const [setFilter, setSetFilter] = useState<number | null>(null);
  const [mainStatFilter, setMainStatFilter] = useState<AttributeType | null>(null);
  const [subStatFilters, setSubStatFilters] = useState<AttributeType[]>([]);
  const [showSetModal, setShowSetModal] = useState(false);

  // Get position-specific main stat options
  const availableMainStats = useMemo(() => {
    return mainAttributeOptions[position] || [];
  }, [position]);

  // Get available sub stat options
  const availableSubStats = useMemo(() => {
    return subAttributeOptions;
  }, []);

  // Get available sets from artifacts
  const availableSets = useMemo(() => {
    const sets = new Set(availableArtifacts.map(a => a.set));
    return Array.from(sets).sort((a, b) => {
      const nameA = t(ArtifactSet[a]?.toLowerCase(), { ns: "sets" });
      const nameB = t(ArtifactSet[b]?.toLowerCase(), { ns: "sets" });
      return nameA.localeCompare(nameB, i18n.language);
    });
  }, [availableArtifacts, t, i18n.language]);

  // Reset filters when position changes or when filters are invalid
  useEffect(() => {
    // Reset main stat filter if it's not available for this position
    if (mainStatFilter !== null && !availableMainStats.includes(mainStatFilter)) {
      setMainStatFilter(null);
    }
    // Note: Sub stat filters are universal, so no need to reset them
  }, [position, mainStatFilter, availableMainStats]);

  // Toggle sub stat filter
  const toggleSubStatFilter = (stat: AttributeType) => {
    setSubStatFilters(prev => {
      if (prev.includes(stat)) {
        return prev.filter(s => s !== stat);
      } else if (prev.length < 4) {
        return [...prev, stat];
      }
      return prev;
    });
  };

  // Filter and sort artifacts
  const filteredAndSortedArtifacts = useMemo(() => {
    let filtered = [...availableArtifacts];

    // Apply search filter
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(artifact => {
        // Search in set name
        const setName = t(ArtifactSet[artifact.set]?.toLowerCase(), { ns: "sets" }).toLowerCase();
        if (setName.includes(searchLower)) return true;

        // Search in main stat
        if (artifact.mainAttribute) {
          const mainType = t(AttributeType[artifact.mainAttribute.type]?.toLowerCase(), { ns: "artifacts" }).toLowerCase();
          const mainValue = formatStatValue(artifact.mainAttribute.type, artifact.mainAttribute.value).toLowerCase();
          if (mainType.includes(searchLower) || mainValue.includes(searchLower)) return true;
        }

        // Search in sub stats
        if (artifact.subAttributes) {
          for (const sub of artifact.subAttributes) {
            const subType = t(AttributeType[sub.type]?.toLowerCase(), { ns: "artifacts" }).toLowerCase();
            const subValue = formatStatValue(sub.type, sub.value).toLowerCase();
            if (subType.includes(searchLower) || subValue.includes(searchLower)) return true;
          }
        }

        return false;
      });
    }

    // Apply set filter
    if (setFilter !== null) {
      filtered = filtered.filter(artifact => artifact.set === setFilter);
    }

    // Apply main stat filter
    if (mainStatFilter !== null) {
      filtered = filtered.filter(artifact =>
        artifact.mainAttribute?.type === mainStatFilter
      );
    }

    // Apply sub stat filters
    if (subStatFilters.length > 0) {
      filtered = filtered.filter(artifact => {
        if (!artifact.subAttributes) return false;
        const subTypes = artifact.subAttributes.map(sub => sub.type);
        return subStatFilters.every(filter => subTypes.includes(filter));
      });
    }

    // Sort: selected first, then by set name
    return filtered.sort((a, b) => {
      const aIsSelected = currentArtifact && a === currentArtifact;
      const bIsSelected = currentArtifact && b === currentArtifact;
      if (aIsSelected && !bIsSelected) return -1;
      if (!aIsSelected && bIsSelected) return 1;
      return 0;
    });
  }, [availableArtifacts, searchText, setFilter, mainStatFilter, subStatFilters, currentArtifact, t]);

  const isArtifactSelected = (artifact: Artifact): boolean => {
    if (!currentArtifact) return false;
    // Compare by reference or by unique properties
    return artifact === currentArtifact ||
      (artifact.set === currentArtifact.set &&
       artifact.position === currentArtifact.position &&
       artifact.mainAttribute?.type === currentArtifact.mainAttribute?.type &&
       artifact.mainAttribute?.value === currentArtifact.mainAttribute?.value);
  };

  const clearFilters = () => {
    setSearchText("");
    setSetFilter(null);
    setMainStatFilter(null);
    setSubStatFilters([]);
  };

  const hasActiveFilters = searchText.trim() !== "" || setFilter !== null || mainStatFilter !== null || subStatFilters.length > 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed left-0 top-0 z-50 h-screen w-full cursor-pointer bg-neutral/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed left-0 top-0 z-50 flex h-screen w-full items-start justify-center">
        <div className="card visible mt-8 h-auto max-h-[calc(100%_-_4rem)] w-[600px] overflow-hidden bg-neutral text-neutral-content shadow-xl">
          {/* Header */}
          <div className="flex h-12 w-full shrink-0 items-center gap-2 border-b-2 border-neutral-content/10 pl-6 pr-2">
            <div className="text-md">
              {t("Select")} {t(AttributePosition[position]?.toLowerCase(), { ns: "artifacts" })} ({filteredAndSortedArtifacts.length})
            </div>
            <div className="grow" />
            <button
              className="btn btn-circle btn-sm"
              onClick={onClose}
            >
              ×
            </button>
          </div>

          {/* Body */}
          <div className="w-full overflow-auto p-2">
            {/* Search Input */}
            <div className="mb-2">
              <input
                type="text"
                placeholder={t("Search artifacts...")}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="input input-sm w-full text-neutral"
              />
            </div>

            {/* Set Filter and Main Stat Filter - Same Row */}
            <div className="mb-2 flex gap-2">
              {/* Set Filter */}
              <div className="flex-1">
                <label className="label py-1">
                  <span className="label-text text-xs">{t("Set")}:</span>
                  {setFilter !== null && (
                    <button
                      className="btn btn-ghost btn-xs"
                      onClick={() => setSetFilter(null)}
                    >
                      {t("Clear")}
                    </button>
                  )}
                </label>
                <button
                  className={classNames(
                    "btn btn-sm w-full justify-start gap-2 text-left normal-case",
                    setFilter !== null ? "btn-ghost" : "btn-outline"
                  )}
                  onClick={() => setShowSetModal(true)}
                >
                  {setFilter !== null ? (
                    <>
                      <img className="h-6 w-6" src={getSetIconUrl(setFilter)} />
                      <span className="truncate text-xs">
                        {t(ArtifactSet[setFilter].toLowerCase(), { ns: "sets" })}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs opacity-70">{t("All Sets")}</span>
                  )}
                </button>
              </div>

              {/* Main Stat Filter */}
              <div className="flex-1">
                <label className="label py-1">
                  <span className="label-text text-xs">{t("Main Stat")}:</span>
                  {mainStatFilter !== null && (
                    <button
                      className="btn btn-ghost btn-xs"
                      onClick={() => setMainStatFilter(null)}
                    >
                      {t("Clear")}
                    </button>
                  )}
                </label>
                <select
                  className="select select-sm w-full text-neutral"
                  value={mainStatFilter ?? ""}
                  onChange={(e) => setMainStatFilter(e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">{t("All")}</option>
                  {availableMainStats.map(statType => (
                    <option key={statType} value={statType}>
                      {t(AttributeType[statType]?.toLowerCase(), { ns: "artifacts" })}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sub Stat Filters */}
            <div className="mb-2">
              <label className="label py-1">
                <span className="label-text text-xs">
                  {t("Sub Stats")} ({subStatFilters.length}/4):
                </span>
                {subStatFilters.length > 0 && (
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={() => setSubStatFilters([])}
                  >
                    {t("Clear")}
                  </button>
                )}
              </label>
              <div className="flex flex-wrap gap-1">
                {availableSubStats.map(statType => {
                  const isSelected = subStatFilters.includes(statType);
                  return (
                    <button
                      key={statType}
                      className={classNames(
                        "btn btn-xs",
                        isSelected ? "btn-secondary" : "btn-outline text-neutral-content",
                        !isSelected && subStatFilters.length >= 4 && "btn-disabled opacity-30"
                      )}
                      onClick={() => toggleSubStatFilter(statType)}
                      disabled={!isSelected && subStatFilters.length >= 4}
                    >
                      {t(AttributeType[statType]?.toLowerCase(), { ns: "artifacts" })}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Clear All Filters */}
            {hasActiveFilters && (
              <div className="mb-2">
                <button
                  className="btn btn-outline btn-sm w-full text-neutral-content"
                  onClick={clearFilters}
                >
                  {t("Clear All Filters")}
                </button>
              </div>
            )}

            {/* Artifact List */}
            <ul className="menu w-full max-h-96 flex-nowrap overflow-auto p-0">
              {/* Clear option */}
              <li>
                <a
                  className="flex items-center gap-2 rounded-lg p-2 text-error"
                  onClick={() => onSelect(null)}
                >
                  <span className="text-sm">{t("Clear")}</span>
                </a>
              </li>

              {/* Results Divider */}
              <li className="menu-title">
                <span>{t("Uploaded Artifacts")}</span>
              </li>

              {/* Artifact Items */}
              {filteredAndSortedArtifacts.length === 0 ? (
                <li className="disabled">
                  <span className="text-xs opacity-50">
                    {hasActiveFilters ? t("No artifacts match the filters") : t("No artifacts available")}
                  </span>
                </li>
              ) : (
                filteredAndSortedArtifacts.map((artifact, idx) => {
                  const isSelected = isArtifactSelected(artifact);
                  const mainType = artifact.mainAttribute
                    ? t(AttributeType[artifact.mainAttribute.type]?.toLowerCase(), { ns: "artifacts" })
                    : "";
                  const mainValue = artifact.mainAttribute
                    ? formatStatValue(artifact.mainAttribute.type, artifact.mainAttribute.value)
                    : "";

                  return (
                    <li key={idx}>
                      <a
                        className={classNames(
                          "flex items-start gap-2 rounded-lg p-2",
                          isSelected && "bg-primary/20 border border-primary"
                        )}
                        onClick={() => onSelect(artifact)}
                      >
                        <img className="h-12 w-12 shrink-0" src={getArtifactIconUrl(artifact)} />
                        <div className="flex flex-1 flex-col gap-0.5">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {t(ArtifactSet[artifact.set]?.toLowerCase(), { ns: "sets" })}
                            </span>
                            {isSelected && (
                              <span className="badge badge-primary badge-xs">Selected</span>
                            )}
                          </div>
                          <span className="text-xs">
                            +{artifact.level} | {mainType}: {mainValue}
                          </span>
                          {artifact.subAttributes && artifact.subAttributes.length > 0 && (
                            <span className="text-[10px] opacity-50">
                              {artifact.subAttributes.map(sub => {
                                const subType = t(AttributeType[sub.type]?.toLowerCase(), { ns: "artifacts" });
                                const subValue = formatStatValue(sub.type, sub.value);
                                return `${subType} +${subValue}`;
                              }).join(" | ")}
                            </span>
                          )}
                        </div>
                      </a>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Set Selection Modal */}
      {showSetModal && (
        <SelectionModal
          title={t("Select Set")}
          onClose={() => setShowSetModal(false)}
        >
          <li>
            <a
              className="flex items-center gap-2 rounded-lg p-1 text-error"
              onClick={() => {
                setSetFilter(null);
                setShowSetModal(false);
              }}
            >
              <span className="text-sm">{t("All Sets")}</span>
            </a>
          </li>
          <li className="menu-title">
            <span>{t("Available Sets")}</span>
          </li>
          {availableSets.map((setId) => (
            <li key={setId}>
              <a
                className={classNames(
                  "flex items-center gap-2 rounded-lg p-1",
                  setFilter === setId && "bg-primary/20 border border-primary"
                )}
                onClick={() => {
                  setSetFilter(setId);
                  setShowSetModal(false);
                }}
              >
                <img className="h-8 w-8" src={getSetIconUrl(setId)} />
                <span className="text-sm">
                  {t(ArtifactSet[setId].toLowerCase(), { ns: "sets" })}
                </span>
              </a>
            </li>
          ))}
        </SelectionModal>
      )}
    </>
  );
});

ArtifactSelectionModal.displayName = 'ArtifactSelectionModal';

export default ArtifactSelectionModal;
