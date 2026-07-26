import MainAttributeEditor from "./MainAttributeEditor";
import { AttributePosition } from "../../genshin/attribute";

const MainAttributesEditor = ({
  flower,
  plume,
  sands,
  setSands,
  goblet,
  setGoblet,
  circlet,
  setCirclet,
}) => {
  return (
    <div className="flex flex-col items-stretch justify-start gap-2">
      <div className="flex flex-col items-stretch justify-evenly gap-2 text-center md:flex-row">
        <div className="flex w-full flex-col items-center md:w-1/2">
          <MainAttributeEditor
            position={AttributePosition.FLOWER}
            attrs={flower}
            setFunc={null}
          />
        </div>
        <div className="flex w-full flex-col items-center md:w-1/2">
          <MainAttributeEditor
            position={AttributePosition.PLUME}
            attrs={plume}
            setFunc={null}
          />
        </div>
      </div>

      <div className="flex flex-col items-stretch justify-evenly gap-2 text-center md:flex-row">
        <div className="flex w-full flex-col items-center md:w-1/3">
          <MainAttributeEditor
            position={AttributePosition.SANDS}
            attrs={sands}
            setFunc={setSands}
          />
        </div>
        <div className="flex w-full flex-col items-center md:w-1/3">
          <MainAttributeEditor
            position={AttributePosition.GOBLET}
            attrs={goblet}
            setFunc={setGoblet}
          />
        </div>
        <div className="flex w-full flex-col items-center md:w-1/3">
          <MainAttributeEditor
            position={AttributePosition.CIRCLET}
            attrs={circlet}
            setFunc={setCirclet}
          />
        </div>
      </div>
    </div>
  );
};

export default MainAttributesEditor;
