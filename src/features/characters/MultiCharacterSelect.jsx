import { useTranslation } from "react-i18next";
import { Character } from "../../genshin/character";
import { enumToIdx } from "../../utils/enum";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import classNames from "classnames";
import { List } from "react-window";
import IconClose from "../../assets/svgs/IconClose";
import CharacterListItem from "./CharacterListItem";

const MultiCharacterSelect = ({
  selectedCharacters,
  setSelectedCharacters,
  availableCharacters = null,
  charactersWithData = null,
}) => {
  const { t, i18n } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    if (!showModal) return undefined;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const focusableSelector =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setShowModal(false);
        setSearchTerm("");
        return;
      }
      if (event.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = Array.from(dialog.querySelectorAll(focusableSelector));
      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!dialog.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    closeButtonRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      previouslyFocused?.focus();
    };
  }, [showModal]);

  const getCharacterIconUrl = (id) => {
    return new URL(
      `../../assets/characters/${Character[id].toLowerCase()}_icon.png`,
      import.meta.url
    ).href;
  };

  const toggleCharacter = (characterId) => {
    if (selectedCharacters.includes(characterId)) {
      setSelectedCharacters(
        selectedCharacters.filter((c) => c !== characterId)
      );
    } else {
      setSelectedCharacters([...selectedCharacters, characterId]);
      setSearchTerm(""); // Clear search when selecting a character
    }
  };

  const isSelected = (characterId) => selectedCharacters.includes(characterId);

  const characterList = useMemo(() => {
    const list = availableCharacters
      ? availableCharacters
      : [...enumToIdx(Character)];

    // Filter by search term
    const filtered = list.filter((charId) => {
      const name = t(Character[charId].toLowerCase(), { ns: "characters" });
      return name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return filtered.sort((a, b) =>
      t(Character[a].toLowerCase(), { ns: "characters" }).localeCompare(
        t(Character[b].toLowerCase(), { ns: "characters" }),
        i18n.language
      )
    );
  }, [availableCharacters, i18n.language, t, searchTerm]);

  const handleOpenModal = () => {
    setShowModal(true);
    setSearchTerm("");
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSearchTerm("");
  };

  return (
    <div className="z-[42] w-full">
      <button
        type="button"
        className="btn btn-primary w-full flex-nowrap justify-start gap-2 overflow-hidden text-ellipsis rounded-full text-left normal-case"
        onClick={handleOpenModal}
        aria-label={`${t("Pick Character")} (${selectedCharacters.length})`}
      >
        {selectedCharacters.length > 0 ? (
          <div className="flex items-center gap-1 overflow-hidden">
            {selectedCharacters.slice(0, 4).map((charId) => (
              <img
                key={charId}
                className="inline-block aspect-square w-8 rounded"
                src={getCharacterIconUrl(charId)}
                alt=""
              />
            ))}
            {selectedCharacters.length > 4 && (
              <span className="text-xs">+{selectedCharacters.length - 4}</span>
            )}
          </div>
        ) : (
          t("Pick Character")
        )}
      </button>

      {/* Backdrop */}
      <div
        id="backdrop"
        className={classNames(
          "fixed left-0 top-0 z-50 h-screen w-full",
          "bg-neutral/50 cursor-pointer",
          { hidden: !showModal }
        )}
        onClick={handleCloseModal}
        aria-hidden="true"
      ></div>

      {/* Modal */}
      <div
        id="modal_container"
        className={classNames(
          "invisible fixed left-0 top-0 z-50 h-screen w-full",
          "flex items-start justify-center",
          { hidden: !showModal }
        )}
      >
        <div
          id="modal_card"
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className="card bg-neutral text-neutral-content visible mt-8 h-auto max-h-[calc(100%_-_4rem)] w-96 overflow-hidden shadow-xl"
        >
          {/* Header */}
          <div className="border-neutral-content/10 flex h-12 w-full shrink-0 items-center gap-2 border-b-2 pl-6 pr-2">
            <div id={titleId} className="text-md">
              {t("Pick Character")} ({selectedCharacters.length})
            </div>
            <div className="grow" />
            <button
              ref={closeButtonRef}
              type="button"
              className="btn btn-circle btn-sm"
              onClick={handleCloseModal}
              aria-label={t("Close")}
            >
              <IconClose />
            </button>
          </div>

          {/* Selected Characters - Sticky */}
          {selectedCharacters.length > 0 && (
            <div className="border-neutral-content/10 bg-neutral sticky top-0 z-10 flex w-full flex-wrap items-center gap-1 border-b p-2">
              {selectedCharacters.map((charId) => (
                <div
                  key={charId}
                  className="tooltip tooltip-bottom"
                  data-tip={t(Character[charId].toLowerCase(), {
                    ns: "characters",
                  })}
                >
                  <div className="relative">
                    <img
                      className="border-neutral-content h-10 w-10 rounded border-2"
                      src={getCharacterIconUrl(charId)}
                      alt={t(Character[charId].toLowerCase(), {
                        ns: "characters",
                      })}
                    />
                    <button
                      className="bg-error text-error-content hover:bg-error/80 absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-xs"
                      onClick={() => toggleCharacter(charId)}
                      aria-label={t("Remove character", {
                        name: t(Character[charId].toLowerCase(), {
                          ns: "characters",
                        }),
                      })}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Body - Character List */}
          <div className="w-full p-2">
            {/* Search box */}
            <div className="mb-2">
              <input
                type="text"
                placeholder={t("Search characters...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input input-sm text-neutral w-full"
              />
            </div>

            {/* Clear all button */}
            {selectedCharacters.length > 0 && (
              <div className="mb-2">
                <button
                  className="btn btn-outline btn-sm text-neutral-content w-full"
                  onClick={() => setSelectedCharacters([])}
                >
                  {t("Clear All")} ({selectedCharacters.length})
                </button>
              </div>
            )}

            {/* Virtual list of characters */}
            <List
              style={{ height: 400, width: "100%" }}
              rowComponent={({
                index,
                style,
                characters,
                isSelectedFn,
                toggleFn,
                hasDataFn,
              }) => {
                const characterId = characters[index];
                return (
                  <div style={{ ...style, paddingBottom: "4px" }}>
                    <CharacterListItem
                      characterId={characterId}
                      isSelected={isSelectedFn(characterId)}
                      hasData={hasDataFn ? hasDataFn(characterId) : false}
                      onToggle={() => toggleFn(characterId)}
                    />
                  </div>
                );
              }}
              rowCount={characterList.length}
              rowHeight={52}
              rowProps={{
                characters: characterList,
                isSelectedFn: isSelected,
                toggleFn: toggleCharacter,
                hasDataFn: charactersWithData
                  ? (id) => charactersWithData.has(id)
                  : null,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiCharacterSelect;
