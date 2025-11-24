import { useTranslation } from "react-i18next";
import { Character } from "../../genshin/character";
import { enumToIdx } from "../../utils/enum";
import { useState, useMemo } from "react";
import classNames from "classnames";
import { List } from "react-window";
import IconClose from "../../assets/svgs/IconClose";
import CharacterListItem from "./CharacterListItem";

const MultiCharacterSelect = ({ selectedCharacters, setSelectedCharacters, availableCharacters = null, charactersWithData = null }) => {
  const { t, i18n } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const getCharacterIconUrl = (id) => {
    return new URL(
      `../../assets/characters/${Character[id].toLowerCase()}_icon.png`,
      import.meta.url
    ).href;
  };

  const toggleCharacter = (characterId) => {
    if (selectedCharacters.includes(characterId)) {
      setSelectedCharacters(selectedCharacters.filter((c) => c !== characterId));
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
        className="btn btn-primary w-full flex-nowrap justify-start gap-2 overflow-hidden text-ellipsis rounded-full text-left normal-case"
        onClick={handleOpenModal}
      >
        {selectedCharacters.length > 0 ? (
          <div className="flex items-center gap-1 overflow-hidden">
            {selectedCharacters.slice(0, 4).map((charId) => (
              <img
                key={charId}
                className="inline-block aspect-square w-8 rounded"
                src={getCharacterIconUrl(charId)}
              />
            ))}
            {selectedCharacters.length > 4 && (
              <span className="text-xs">+{selectedCharacters.length - 4}</span>
            )}
          </div>
        ) : (
          <>
            {t("Pick")} {t("Character")}
          </>
        )}
      </button>

      {/* Backdrop */}
      <div
        id="backdrop"
        className={classNames(
          "fixed left-0 top-0 h-screen w-full z-50",
          "cursor-pointer bg-neutral/50",
          { hidden: !showModal }
        )}
        onClick={handleCloseModal}
      ></div>

      {/* Modal */}
      <div
        id="modal_container"
        className={classNames(
          "invisible fixed left-0 top-0 h-screen w-full z-50",
          "flex items-start justify-center",
          { hidden: !showModal }
        )}
      >
        <div
          id="modal_card"
          className="card visible mt-8 h-auto max-h-[calc(100%_-_4rem)] w-96 overflow-hidden bg-neutral text-neutral-content shadow-xl"
        >
          {/* Header */}
          <div className="flex h-12 w-full shrink-0 items-center gap-2 border-b-2 border-neutral-content/10 pl-6 pr-2">
            <div className="text-md">
              {t("Pick")} {t("Character")} ({selectedCharacters.length})
            </div>
            <div className="grow" />
            <button
              className="btn btn-circle btn-sm"
              onClick={handleCloseModal}
            >
              <IconClose />
            </button>
          </div>

          {/* Selected Characters - Sticky */}
          {selectedCharacters.length > 0 && (
            <div className="sticky top-0 z-10 flex w-full flex-wrap items-center gap-1 border-b border-neutral-content/10 bg-neutral p-2">
              {selectedCharacters.map((charId) => (
                <div
                  key={charId}
                  className="tooltip tooltip-bottom"
                  data-tip={t(Character[charId].toLowerCase(), { ns: "characters" })}
                >
                  <div className="relative">
                    <img
                      className="h-10 w-10 rounded border-2 border-neutral-content"
                      src={getCharacterIconUrl(charId)}
                      alt={t(Character[charId].toLowerCase(), { ns: "characters" })}
                    />
                    <button
                      className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-error text-xs text-error-content hover:bg-error/80"
                      onClick={() => toggleCharacter(charId)}
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
                className="input input-bordered input-sm w-full"
              />
            </div>

            {/* Clear all button */}
            {selectedCharacters.length > 0 && (
              <div className="mb-2">
                <button
                  className="btn btn-outline btn-sm w-full"
                  onClick={() => setSelectedCharacters([])}
                >
                  {t("Clear All")} ({selectedCharacters.length})
                </button>
              </div>
            )}

            {/* Virtual list of characters */}
            <List
              style={{ height: 400, width: "100%" }}
              rowComponent={({ index, style, characters, isSelectedFn, toggleFn, hasDataFn }) => {
                const characterId = characters[index];
                return (
                  <div style={{ ...style, paddingBottom: '4px' }}>
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
                hasDataFn: charactersWithData ? (id) => charactersWithData.has(id) : null,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiCharacterSelect;
