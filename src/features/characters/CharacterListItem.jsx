import { useTranslation } from "react-i18next";
import classNames from "classnames";
import { Character } from "../../genshin/character";

const CharacterListItem = ({ characterId, isSelected, hasData = false, onToggle }) => {
  const { t } = useTranslation();

  const getCharacterIconUrl = (id) => {
    return new URL(
      `../../assets/characters/${Character[id].toLowerCase()}_icon.png`,
      import.meta.url
    ).href;
  };

  return (
    <a
      className={classNames(
        "menu-item flex cursor-pointer items-center gap-2 overflow-hidden text-ellipsis !rounded-full p-2 px-2 text-sm",
        isSelected
          ? "bg-neutral-content text-neutral"
          : "hover:bg-neutral-content/10"
      )}
      onClick={onToggle}
    >
      <div className="relative">
        <img
          className="aspect-square w-8 rounded"
          src={getCharacterIconUrl(characterId)}
          alt={t(Character[characterId].toLowerCase(), { ns: "characters" })}
        />
        {hasData && (
          <div className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-success border border-neutral"></div>
        )}
      </div>
      {t(Character[characterId].toLowerCase(), { ns: "characters" })}
      {isSelected && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="ml-auto h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </a>
  );
};

export default CharacterListItem;
