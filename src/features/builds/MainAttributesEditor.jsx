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
  subAttributes,
}) => {
  return (
    <div className="flex flex-col items-stretch justify-start gap-2">
      <div className="flex flex-col items-stretch justify-evenly gap-2 text-center md:flex-row">
        <div className="flex w-full flex-col items-center md:w-1/2">
          <MainAttributeEditor
            position={AttributePosition.FLOWER}
            attrs={flower}
            setFunc={null}
            subAttributes={subAttributes}
          />
        </div>
        <div className="flex w-full flex-col items-center md:w-1/2">
          <MainAttributeEditor
            position={AttributePosition.PLUME}
            attrs={plume}
            setFunc={null}
            subAttributes={subAttributes}
          />
        </div>
      </div>

      <div className="flex flex-col items-stretch justify-evenly gap-2 text-center md:flex-row">
        <div className="flex w-full flex-col items-center md:w-1/3">
          <MainAttributeEditor
            position={AttributePosition.SANDS}
            attrs={sands}
            setFunc={setSands}
            subAttributes={subAttributes}
          />
        </div>
        <div className="flex w-full flex-col items-center md:w-1/3">
          <MainAttributeEditor
            position={AttributePosition.GOBLET}
            attrs={goblet}
            setFunc={setGoblet}
            subAttributes={subAttributes}
          />
        </div>
        <div className="flex w-full flex-col items-center md:w-1/3">
          <MainAttributeEditor
            position={AttributePosition.CIRCLET}
            attrs={circlet}
            setFunc={setCirclet}
            subAttributes={subAttributes}
          />
        </div>
      </div>
    </div>
  );
};

export default MainAttributesEditor;
