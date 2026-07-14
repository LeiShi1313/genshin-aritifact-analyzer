import { memo, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { NumberFour, NumberTwo } from "phosphor-react";
import { Set } from "../../genshin/set";
import { SetOverride } from "../gcsim/types";
import { getSetIconUrl } from "../gcsim/utils";
import { enumToIdx } from "../../utils/enum";
import SelectionModal from "../gcsim/components/SelectionModal";
import { isGCSimSetSupported } from "../../utils/gcsimCapabilities";

interface SetSectionProps {
  sets?: SetOverride[];
  enabled: boolean;
  onChange: (sets: SetOverride[] | undefined) => void;
}

const SetSection = memo(({ sets, enabled, onChange }: SetSectionProps) => {
  const { t, i18n } = useTranslation();
  const [showModal, setShowModal] = useState<number | null>(null);

  // Get all available sets
  const availableSets = useMemo(() => {
    return [...enumToIdx(Set)]
      .filter(isGCSimSetSupported)
      .sort((a, b) =>
        t(Set[a].toLowerCase(), { ns: "sets" }).localeCompare(
          t(Set[b].toLowerCase(), { ns: "sets" }),
          i18n.language
        )
      );
  }, [t, i18n.language]);

  const handleSetChange = (setIndex: number, setId: number | null) => {
    const currentSets = sets || [];
    const newSets: SetOverride[] = [...currentSets];

    if (setId === null) {
      // Remove this set
      newSets.splice(setIndex, 1);
    } else if (setIndex < newSets.length) {
      // Update existing set
      newSets[setIndex] = { ...newSets[setIndex], set: setId };
    } else {
      // Add new set - determine count based on existing sets
      const otherSetCount = newSets.reduce((sum, s) => sum + s.count, 0);
      const newCount = otherSetCount === 0 ? 4 : 2;
      newSets.push({ set: setId, count: newCount as 2 | 4 });
    }

    onChange(newSets.length > 0 ? newSets : undefined);
    setShowModal(null);
  };

  const handleSetCountToggle = (setIndex: number) => {
    const currentSets = sets || [];
    if (setIndex >= currentSets.length) return;

    const newSets = [...currentSets];
    const currentCount = newSets[setIndex].count;
    const newCount = currentCount === 2 ? 4 : 2;
    newSets[setIndex] = { ...newSets[setIndex], count: newCount as 2 | 4 };

    // If we have 2 sets, ensure total is valid (each should be 2)
    if (newSets.length === 2) {
      newSets[0] = { ...newSets[0], count: 2 };
      newSets[1] = { ...newSets[1], count: 2 };
    }

    onChange(newSets);
  };

  return (
    <div className="mt-2 grid grid-cols-[auto_1fr] items-start gap-2">
      <span className="mt-2 text-xs opacity-70">{t("Sets")}:</span>
      <div className="flex flex-col gap-1">
        {/* Render existing sets */}
        {sets?.map((setOverride, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <button
              className="btn btn-ghost btn-sm flex-1 justify-start gap-0 p-[0.25rem] text-left normal-case"
              onClick={() => setShowModal(idx)}
              disabled={!enabled}
            >
              <img className="h-6 w-6" src={getSetIconUrl(setOverride.set)} />
              <span className="truncate text-xs">
                {t(Set[setOverride.set].toLowerCase(), { ns: "sets" })}
              </span>
            </button>
            <label
              className="toggle text-base-content cursor-pointer"
              title={t(setOverride.count === 4 ? "4-piece set" : "2-piece set")}
            >
              <input
                type="checkbox"
                checked={setOverride.count === 4}
                onChange={() => handleSetCountToggle(idx)}
                disabled={!enabled || (sets?.length || 0) > 1}
              />
              <NumberTwo aria-label={t("2-piece set")} weight="bold" />
              <NumberFour aria-label={t("4-piece set")} weight="bold" />
            </label>
            <button
              className="btn btn-ghost btn-xs"
              onClick={() => handleSetChange(idx, null)}
              disabled={!enabled}
              aria-label={t("Clear Set")}
            >
              x
            </button>
          </div>
        ))}

        {/* Add set button - show when: no sets, or 1 set with 2pc */}
        {(!sets ||
          sets.length === 0 ||
          (sets.length === 1 && sets[0].count === 2)) && (
          <button
            className="btn btn-outline btn-sm justify-start gap-2 text-left normal-case"
            onClick={() => setShowModal(sets?.length || 0)}
            disabled={!enabled}
          >
            <span className="text-lg">+</span>
            <span className="text-xs opacity-70">{t("Add Set")}</span>
          </button>
        )}
      </div>

      {/* Set Selection Modal */}
      {showModal !== null && (
        <SelectionModal
          title={t("Select Set")}
          description={t(
            "Only items supported by this GCSim version are shown"
          )}
          onClose={() => setShowModal(null)}
        >
          {availableSets.length === 0 && (
            <li className="p-3 text-center text-sm opacity-70">
              {t("No supported items available")}
            </li>
          )}
          {availableSets.map((id) => (
            <li key={id}>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-lg p-1 text-left"
                onClick={() => handleSetChange(showModal, id)}
              >
                <img className="h-8 w-8" src={getSetIconUrl(id)} alt="" />
                <span className="text-sm">
                  {t(Set[id].toLowerCase(), { ns: "sets" })}
                </span>
              </button>
            </li>
          ))}
        </SelectionModal>
      )}
    </div>
  );
});

SetSection.displayName = "SetSection";

export default SetSection;
