import { Build } from "../../genshin/build";
import { Character } from "../../genshin/character";

const BuildCard = ({ build }) => {
  return (
    <div className="flex flex-row justify-between w-full items-center space-x-2">
      <input type="checkbox" checked="checked" className="checkbox" />
      <div className="flex h-12 w-full flex-row justify-between bg-base-200 shadow-xl rounded-2xl">
        <figure className="aspect-square h-12 object-contain">
          <img
            className="rounded-tl-2xl"
            src={
              new URL(
                `../../assets/characters/${Character[
                  build.character
                ].toLocaleLowerCase()}_icon.png`,
                import.meta.url
              ).href
            }
            alt={Character[build.character]}
          />
        </figure>
        <h2 className="card-title">{Character[build.character]}</h2>
      </div>
    </div>
  );
};

export default BuildCard;
