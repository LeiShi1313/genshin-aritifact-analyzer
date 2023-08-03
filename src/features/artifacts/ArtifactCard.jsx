import { useTranslation } from "react-i18next";
import classNames from "classnames";
import { useContext, useMemo } from "react";
import { AttributeType, AttributePosition } from "../../genshin/attribute";
import { Set } from "../../genshin/set";
import { Character } from "../../genshin/character";
import { formatAttributeValue } from "../../utils/attribute";
import CharacterAvatar from "../characters/CharacterAvatar";
import { useNavigate } from "react-router-dom";
import { encodeArtifact } from "../../utils/artifact";
import AttributeIcon from "../../assets/svgs/AttributeIcon";
import { ThemeContext } from "../../contexts/ThemeContext";
import { themes } from "../../utils/theme";
import ArtifactPositionIcon from "../../assets/svgs/ArtifactPositionIcon";
import { starRarityToBgColor } from "../../utils/starRarityToBgColor";

const ArtifactCard = ({ artifact, fitAttributes = [] }) => {
  const { theme, _ } = useContext(ThemeContext);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const artKey = useMemo(
    () =>
      `${Set[artifact.set].toLocaleLowerCase()}_${AttributePosition[
        artifact.position
      ].toLowerCase()}`,
    [artifact]
  );

  return (
    <div
      className={
        "flex h-auto shrink-0 flex-row items-stretch rounded-md bg-base-100 shadow-md"
      }
    >
      {/* Genshin-style Artifact Card */}
      <figure className={"flex flex-col items-center justify-start"}>
        <div
          className={
            "relative flex select-none flex-col items-center rounded-tl-md rounded-br-2xl bg-gradient-to-br from-black/25 px-1 py-1 " +
            starRarityToBgColor(artifact.star)
          }
        >
          <div className="absolute left-2 top-2 h-5 w-5 text-black opacity-25">
            {ArtifactPositionIcon[artifact.position]}
          </div>
          <img
            className="aspect-square w-24 cursor-pointer"
            src={
              new URL(`../../assets/artifacts/${artKey}.png`, import.meta.url)
                .href
            }
            alt={artKey}
            onClick={() =>
              navigate(`/artifact?artifact=${encodeArtifact(artifact)}`)
            }
          />
          {/* Equipped-by avatar at the corner */}
          {artifact.character > 0 ? (
            <div
              className="tooltip absolute -right-1 -top-1 h-8 rounded-full bg-[#424f65] ring-2 ring-base-100 drop-shadow"
              data-tip={
                t(Character[artifact.character].toLowerCase(), {
                  ns: "characters",
                }) +
                " " +
                t("equipped")
              }
            >
              <CharacterAvatar character={artifact.character} width={8} />
            </div>
          ) : (
            ""
          )}
          {/* Stars under the image */}
          <div className="absolute -bottom-1 flex flex-row drop-shadow">
            {Array.from({ length: artifact.star }, (_, i) => (
              <div key={i}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="icon icon-tabler icon-tabler-star-filled aspect-square w-4"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="#ffcc32"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <path
                    d="M8.243 7.34l-6.38 .925l-.113 .023a1 1 0 0 0 -.44 1.684l4.622 4.499l-1.09 6.355l-.013 .11a1 1 0 0 0 1.464 .944l5.706 -3l5.693 3l.1 .046a1 1 0 0 0 1.352 -1.1l-1.091 -6.355l4.624 -4.5l.078 -.085a1 1 0 0 0 -.633 -1.62l-6.38 -.926l-2.852 -5.78a1 1 0 0 0 -1.794 0l-2.853 5.78z"
                    strokeWidth="0"
                    fill="#ffcc32"
                  ></path>
                </svg>
              </div>
            ))}
          </div>
        </div>
        <span className="font-bold text-primary">+{artifact.level}</span>
      </figure>

      {/* Attribute list on the right */}
      <div className="flex w-auto grow flex-col gap-1 py-2 px-2 lg:w-56">
        <div
          className="tooltip flex h-10 items-center justify-between rounded bg-secondary/[.15] px-2 py-1 font-bold text-primary-focus"
          data-tip={t(
            AttributeType[artifact.mainAttribute.type].toLowerCase(),
            {
              ns: "artifacts",
            }
          )}
        >
          <div className="w-5 shrink-0">
            {AttributeIcon(
              artifact.mainAttribute.type,
              true,
              themes[0] != theme
            )}
          </div>
          <h2 className="max-h-7 text-2xl">
            {formatAttributeValue(artifact.mainAttribute)}
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-1">
          {artifact.subAttributes.map((attr, idx) => (
            <div
              className={classNames(
                "tooltip",
                "flex flex-row items-center gap-2",
                "h-8",
                "rounded",
                "px-2 py-1",
                fitAttributes.indexOf(attr.type) === -1
                  ? "text-primary"
                  : "bg-secondary/[.15] font-bold text-primary-focus"
              )}
              key={idx}
              data-tip={t(AttributeType[attr.type].toLowerCase(), {
                ns: "artifacts",
              })}
            >
              <div className="w-5 shrink-0">
                {AttributeIcon(attr.type, true, themes[0] != theme)}
              </div>
              <p className="max-h-5 text-base">+{formatAttributeValue(attr)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArtifactCard;
