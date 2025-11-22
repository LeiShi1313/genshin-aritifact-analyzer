import { memo } from "react";
import CharacterCard from "../characters/CharacterCard";
import { CharacterOverride } from "./types";

interface CharacterInfoProps {
  characterInfo: {
    character: number;
    level: number;
    maxLevel: number;
    constellation: number;
  };
  saturate?: boolean;
  override?: CharacterOverride;
}

const CharacterInfo = memo(({ characterInfo, saturate = false, override }: CharacterInfoProps) => {
  // Use override values if enabled and set, otherwise use script values
  const displayLevel = override?.enabled && override.level !== undefined
    ? override.level
    : characterInfo.level;
  const displayConstellation = override?.enabled && override.constellation !== undefined
    ? override.constellation
    : characterInfo.constellation;

  // Format level text
  const levelText = `Lv.${displayLevel}`;

  return (
    <div className="flex flex-col items-center gap-1">
      <CharacterCard
        character={characterInfo.character}
        saturate={saturate}
        constellation={displayConstellation}
        width={16}
        text={levelText}
      />
    </div>
  );
});

CharacterInfo.displayName = 'CharacterInfo';

export default CharacterInfo;
