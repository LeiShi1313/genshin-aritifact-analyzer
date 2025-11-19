import CharacterCard from "../characters/CharacterCard";

interface CharacterInfoProps {
  characterInfo: {
    character: number;
    constellation: number;
  };
  saturate?: boolean;
}

const CharacterInfo = ({ characterInfo, saturate = false }: CharacterInfoProps) => {
  return (
    <div className="flex flex-col items-center gap-1">
      <CharacterCard
        character={characterInfo.character}
        saturate={saturate}
        constellation={characterInfo.constellation}
        width={16}
      />
    </div>
  );
};

export default CharacterInfo;
