import { useMemo } from "react";
import { Character } from "../../genshin/character";
import { characterMetadata } from "../../utils/character";
import { starRarityToBgColor } from "../../utils/starRarityToBgColor";

const CharacterCard = ({ character, text = "name", width = 24, textColor }) => {
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

  return (
    <figure
      className={
        "flex flex-col items-center justify-start overflow-hidden rounded bg-base-100 shadow-md"
      }
    >
      <div
        className="relative flex select-none flex-col items-center overflow-hidden rounded-br-2xl bg-gradient-to-br from-black/25"
        style={{ backgroundColor: starRarityToBgColor(charStar) }}
      >
        <img src={imgUrl} style={{ width: width / 4 + "rem" }} />
      </div>
      <figcaption
        className="font-bold text-primary"
        style={{ color: textColor }}
      >
        {text}
      </figcaption>
    </figure>
  );
};

export default CharacterCard;
