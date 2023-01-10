import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  return (
    <div className="flex-col justify-start items-center space-y-2 lex">
    <div className="flex flex-col justify-evenly justify-items-stretch items-center space-x-1 text-center md:flex-row">
      <div className="flex flex-col items-center w-1/2">
        <MainAttributeEditor
          position={AttributePosition.FLOWER}
          attrs={flower}
          setFunc={null}
          subAttributes={subAttributes}
        />
      </div>
      <div className="flex flex-col items-center w-1/2">
        <MainAttributeEditor
          position={AttributePosition.PLUME}
          attrs={plume}
          setFunc={null}
          subAttributes={subAttributes}
        />
      </div>

    </div>

    <div className="flex flex-col justify-evenly justify-items-stretch items-center space-x-1 text-center md:flex-row">
      <div className="flex flex-col items-center w-1/3">
        <MainAttributeEditor
          position={AttributePosition.SANDS}
          attrs={sands}
          setFunc={setSands}
          subAttributes={subAttributes}
        />
      </div>
      <div className="flex flex-col items-center w-1/3">
        <MainAttributeEditor
          position={AttributePosition.GOBLET}
          attrs={goblet}
          setFunc={setGoblet}
          subAttributes={subAttributes}
        />
      </div>
      <div className="flex flex-col items-center w-1/3">
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
