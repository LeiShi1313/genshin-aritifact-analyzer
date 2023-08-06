import { useMemo } from "react";
import { Character } from "../../genshin/character";

const CharacterAvatar = ({ character, withRing = false, width = 12 }) => {
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
    
  return (
    <div className="avatar">
      <div className={`w-${width} rounded-full `+ (withRing ? 'ring ring-primary ring-offset-base-100 ring-offset-[-1px]' : '')}>
        <img src={imgUrl} />
      </div>
    </div>
  );
};

export default CharacterAvatar;
