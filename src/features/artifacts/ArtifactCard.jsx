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
import Icon_Inventory_Artifacts from "../../assets/pngs/Icon_Inventory_Artifacts.png";

const ArtifactCard = ({ artifact, fitAttributes = [], suitIsFit = false }) => {
  const { theme, _ } = useContext(ThemeContext);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setName = Set[artifact.set];
  const positionName = AttributePosition[artifact.position];
  const mainAttribute = artifact.mainAttribute;
  const mainTypeName = mainAttribute && AttributeType[mainAttribute.type];
  const mainStatLabel =
    typeof mainTypeName === "string"
      ? t(mainTypeName.toLowerCase(), { ns: "artifacts" })
      : t("Unavailable");
  const characterName =
    artifact.character > 0 ? Character[artifact.character] : undefined;
  const starCount =
    Number.isInteger(artifact.star) && artifact.star >= 1 && artifact.star <= 5
      ? artifact.star
      : 0;
  const artKey = useMemo(() => {
    if (
      artifact.set <= 0 ||
      typeof setName !== "string" ||
      typeof positionName !== "string"
    ) {
      return undefined;
    }
    return `${setName.toLocaleLowerCase()}_${positionName.toLowerCase()}`;
  }, [artifact.set, setName, positionName]);

  return (
    <div
      className={
        "bg-base-100 flex h-auto shrink-0 flex-row items-stretch rounded-md shadow-md"
      }
    >
      {/* Genshin-style Artifact Card */}
      <figure className={"flex flex-col items-center justify-start"}>
        <div
          className={classNames(
            "relative flex select-none flex-col items-center rounded-tl-md rounded-br-2xl bg-gradient-to-br from-black/25 px-1 py-1"
          )}
          style={{ backgroundColor: starRarityToBgColor(artifact.star) }}
        >
          <div className="absolute left-2 top-2 h-5 w-5 text-black opacity-25">
            {ArtifactPositionIcon[artifact.position]}
          </div>
          <button
            type="button"
            className="focus-visible:outline-base-100 z-10 rounded focus-visible:outline focus-visible:outline-2"
            aria-label={t("Open artifact details")}
            onClick={() =>
              navigate(`/artifact?artifact=${encodeArtifact(artifact)}`)
            }
          >
            <img
              className={classNames(
                "aspect-square w-20 transition-all sm:w-24",
                {
                  "scale-110 drop-shadow-xl": suitIsFit,
                }
              )}
              src={
                artKey
                  ? new URL(
                      `../../assets/artifacts/${artKey}.png`,
                      import.meta.url
                    ).href
                  : Icon_Inventory_Artifacts
              }
              alt={
                typeof positionName === "string"
                  ? t(positionName.toLowerCase(), { ns: "artifacts" })
                  : t("Artifacts")
              }
            />
          </button>
          {/* Equipped-by avatar at the corner */}
          {typeof characterName === "string" ? (
            <div
              className="tooltip ring-base-100 absolute -right-1 -top-1 h-8 rounded-full bg-[#424f65] ring-2 drop-shadow"
              data-tip={
                t(characterName.toLowerCase(), {
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
            {Array.from({ length: starCount }, (_, i) => (
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
        <span className="text-primary font-bold">
          +{Number.isFinite(artifact.level) ? artifact.level : "?"}
        </span>
      </figure>

      {/* Attribute list on the right */}
      <div className="flex min-w-0 grow flex-col gap-1 px-2 py-2 lg:w-56">
        <div
          className="tooltip bg-secondary/[.15] text-primary-focus flex h-10 items-center justify-between rounded px-2 py-1 font-bold"
          data-tip={mainStatLabel}
        >
          <div className="w-5 shrink-0">
            {mainAttribute && typeof mainTypeName === "string"
              ? AttributeIcon(mainAttribute.type, true, themes[0] != theme)
              : null}
          </div>
          <h2 className="max-h-7 text-2xl">
            <span className="sr-only">{mainStatLabel}: </span>
            {mainAttribute && Number.isFinite(mainAttribute.value)
              ? formatAttributeValue(mainAttribute)
              : t("Unavailable")}
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-1">
          {artifact.subAttributes.map((attr, idx) => {
            const typeName = AttributeType[attr.type];
            const statLabel =
              typeof typeName === "string"
                ? t(typeName.toLowerCase(), { ns: "artifacts" })
                : t("Unavailable");
            return (
              <div
                className={classNames(
                  "tooltip",
                  "flex flex-row items-center gap-2",
                  "h-8",
                  "rounded",
                  "px-2 py-1",
                  fitAttributes.indexOf(attr.type) === -1
                    ? "text-primary"
                    : "bg-secondary/[.15] text-primary-focus font-bold"
                )}
                key={idx}
                data-tip={statLabel}
              >
                <div className="w-5 shrink-0">
                  {typeof typeName === "string"
                    ? AttributeIcon(attr.type, true, themes[0] != theme)
                    : null}
                </div>
                <p className="max-h-5 text-base">
                  <span className="sr-only">{statLabel}: </span>+
                  {Number.isFinite(attr.value)
                    ? formatAttributeValue(attr)
                    : t("Unavailable")}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ArtifactCard;
