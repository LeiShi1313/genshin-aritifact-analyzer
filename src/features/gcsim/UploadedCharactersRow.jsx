import CharacterCard from "../characters/CharacterCard";

const UploadedCharactersRow = ({ source, scripts }) => {
  return (
    <div className="mb-4 flex w-full flex-col items-center justify-start space-y-4">
      <div className="flex h-8 w-full items-center justify-between rounded bg-primary/5 px-3 py-1.5 text-xs transition-colors">
        <div className="truncate">{source}</div>
        <div className="">yigasdkjakla</div>
      </div>
      <div className="flex w-full flex-row flex-wrap items-stretch gap-2">
        {Array.from(Array(3).keys()).map((idx) => (
            <div>
          <CharacterCard character={58} />
          </div>

        ))}
      </div>
    </div>
  );
};

export default UploadedCharactersRow;
