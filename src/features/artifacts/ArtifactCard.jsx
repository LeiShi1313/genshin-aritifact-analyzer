import { useTranslation } from "react-i18next";
import classNames from "classnames";
import { useEffect, useMemo, useState } from "react";
import { AttributeType, AttributePosition } from "../../genshin/attribute";
import { Set } from "../../genshin/set";
import { Character } from "../../genshin/character";
import { formatAttributeValue } from "../../utils/attribute";
import CharacterAvatar from "../characters/CharacterAvatar";

const ArtifactCard = ({ artifact }) => {
  const { t } = useTranslation();
  const artKey = useMemo(
    () =>
      `${Set[artifact.set].toLocaleLowerCase()}_${AttributePosition[
        artifact.position
      ].toLowerCase()}`,
    [artifact]
  );

  return (
    <div className="relative">
      <div
        className={
          `flex flex-row items-center rounded-xl bg-base-200 shadow-xl ` +
          classNames(
            artifact.star === 5
              ? "bg-[#D39F51]"
              : artifact.star === 4
              ? "bg-[#B187C3]"
              : "bg-base-200"
          )
        }
      >
        <figure className="flex flex-col items-center justify-center">
          <img
            className="aspect-square w-16"
            src={
              new URL(`../../assets/artifacts/${artKey}.png`, import.meta.url)
                .href
            }
            alt={artKey}
          />
          <span className="font-bold text-primary">+{artifact.level}</span>
        </figure>
        <div className="flex w-48 flex-col space-y-2 py-2 px-2">
          <h2 className="text-md font-bold text-primary">
            {t(AttributeType[artifact.mainAttribute.type].toLowerCase(), {
              ns: "artifacts",
            })}
            : {formatAttributeValue(artifact.mainAttribute)}
          </h2>
          <div className="flex flex-col space-y-1">
            {artifact.subAttributes.map((attr, idx) => (
              <p className="text-xs text-secondary" key={idx}>
                {t(AttributeType[attr.type].toLowerCase(), {
                  ns: "artifacts",
                })}
                : {formatAttributeValue(attr)}
              </p>
            ))}
          </div>
          {artifact.character > 0 ? (
            <div
              className="tooltip absolute right-0 bottom-0"
              data-tip={
                t(Character[artifact.character].toLowerCase(), {
                  ns: "characters",
                }) +
                " " +
                t("equipped")
              }
            >
              <CharacterAvatar character={artifact.character} />
            </div>
          ): ''}
        </div>
      </div>
    </div>
  );
};

export default ArtifactCard;
