import { useMemo, memo } from "react";
import { useTranslation } from "react-i18next";
import { Character } from "../../genshin/character";
import { characterMetadata } from "../../utils/character";
import { starRarityToBgColor } from "../../utils/starRarityToBgColor";
import classNames from "classnames";

const CharacterCard = memo(({ character, text = undefined, width = 24, textColor, saturate = false, constellation = undefined }) => {
  const { t, i18n } = useTranslation();
  const imgUrl = useMemo(
    () =>
      new URL(
        `../../assets/characters/${Character[
          character
        ].toLocaleLowerCase()}_icon.png`,
        import.meta.url
      ).href,
    [character]
  );

  const charStar = Number(characterMetadata[Character[character]].rarity);

  // Display character name if text is undefined
  const displayText = useMemo(() => {
    if (text === undefined) {
      return t(Character[character].toLowerCase(), { ns: "characters" });
    }
    return text;
  }, [text, character, t]);

  // Format constellation text based on language
  const constellationText = useMemo(() => {
    if (constellation === undefined || constellation === null) return null;
    return t('constellation', { count: constellation });
  }, [constellation, t]);

  return (
    <figure
      className={
        classNames("flex flex-col items-center justify-start overflow-hidden rounded bg-base-100 shadow-md", { "saturate-[0.4]": saturate })
      }
    >
      <div
        className="relative flex select-none flex-col items-center overflow-hidden rounded-br-2xl bg-gradient-to-br from-black/25"
        style={{ backgroundColor: starRarityToBgColor(charStar) }}
      >
        <img src={imgUrl} style={{ width: width / 4 + "rem" }} />

        {/* Constellation badge */}
        {constellationText && (
          <div className="absolute right-0 top-0 rounded-bl-lg bg-blue-600/70 px-1.5 py-0.5 text-xs font-bold text-white">
            {constellationText}
          </div>
        )}
      </div>
      <figcaption
        className="text-xs font-bold text-primary sm:text-sm"
        style={{ color: textColor }}
      >
        {displayText}
      </figcaption>
    </figure>
  );
});

CharacterCard.displayName = 'CharacterCard';

export default CharacterCard;
