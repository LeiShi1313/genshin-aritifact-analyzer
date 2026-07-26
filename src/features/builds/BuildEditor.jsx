import { useEffect, useMemo, useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { ThemeContext } from "../../contexts/ThemeContext";
import { hashBuild } from "../../utils/hash";
import { Build } from "../../genshin/build";
import { Character } from "../../genshin/character";
import { Weapon } from "../../genshin/weapon";
import { AttributeType } from "../../genshin/attribute";
import { encodeBuild } from "../../utils/build";
import NameEditor from "./NameEditor";
import SuitsEditor from "./SuitsEditor";
import WeaponEditor from "./WeaponEditor";
import CharacterSelect from "../characters/CharacterSelect";
import MainAttributesEditor from "./MainAttributesEditor";
import SubAttributesEditor from "./SubAttributesEditor";
import { addBuild, editBuild } from "../../store/reducers/build";
import { fromHex } from "../../utils/hex";
import { characterToTheme } from "../../utils/character";
import characterData from "../../data/characters.json";
import weaponData from "../../data/weapons.json";

const gachaImages = import.meta.glob("../../assets/characters/*_gacha.png", {
  eager: true,
  query: "?url",
  import: "default",
});
const coverImages = import.meta.glob("../../assets/characters/*_cover2.png", {
  eager: true,
  query: "?url",
  import: "default",
});
const iconImages = import.meta.glob("../../assets/characters/*_icon.png", {
  eager: true,
  query: "?url",
  import: "default",
});

const characterBackground = (key) =>
  key
    ? gachaImages[`../../assets/characters/${key}_gacha.png`] ??
      coverImages[`../../assets/characters/${key}_cover2.png`] ??
      iconImages[`../../assets/characters/${key}_icon.png`]
    : undefined;

const emptyBuild = () => ({
  name: "",
  character: Character.CHARACTER_UNSPECIFIED,
  weapons: [],
  suits: [],
  flowerAttributes: [AttributeType.HP],
  plumeAttributes: [AttributeType.ATK],
  sandsAttributes: [],
  gobletAttributes: [],
  circletAttributes: [],
  subAttributes: [],
});

const decodeBuildParam = (value) => {
  if (!value) return undefined;
  try {
    const build = Build.decode(fromHex(value));
    return Character[build.character] ? build : undefined;
  } catch {
    return undefined;
  }
};

const BuildEditor = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { setTheme } = useContext(ThemeContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const presets = useSelector((state) => state.presets.builds);
  const id = searchParams.get("id");
  const [initialBuild] = useState(
    () => decodeBuildParam(searchParams.get("build")) ?? emptyBuild()
  );

  const [name, setName] = useState(initialBuild.name);
  const [char, setChar] = useState(initialBuild.character);
  const [weapons, setWeapons] = useState(initialBuild.weapons);
  const [weaponFilterFn, setWeaponFilterFn] = useState(null);
  const [suits, setSuits] = useState(initialBuild.suits);
  const flower = initialBuild.flowerAttributes;
  const plume = initialBuild.plumeAttributes;
  const [sands, setSands] = useState(initialBuild.sandsAttributes);
  const [goblet, setGoblet] = useState(initialBuild.gobletAttributes);
  const [circlet, setCirclet] = useState(initialBuild.circletAttributes);
  const [subAttributes, setSubAttributes] = useState(
    initialBuild.subAttributes
  );

  const build = useMemo(
    () => ({
      name,
      character: char,
      weapons,
      suits,
      flowerAttributes: [AttributeType.HP],
      plumeAttributes: [AttributeType.ATK],
      sandsAttributes: sands,
      gobletAttributes: goblet,
      circletAttributes: circlet,
      subAttributes,
    }),
    [name, char, weapons, suits, sands, goblet, circlet, subAttributes]
  );
  const hash = useMemo(() => hashBuild(build), [build]);
  const imgUrl = useMemo(
    () => characterBackground(Character[char]?.toLowerCase()),
    [char]
  );
  const canSave = char !== Character.CHARACTER_UNSPECIFIED;

  const handleAdd = () => {
    if (!canSave) return;
    if (presets[hash]) {
      alert(t("This build is already in the presets. Please edit it there"));
      return;
    }
    if (id) {
      dispatch(editBuild({ id, build }));
    } else {
      dispatch(addBuild(build));
    }
    navigate(-1);
  };

  useEffect(() => {
    const theme = characterToTheme(char);
    if (theme) setTheme(theme);
    if (char > 0) {
      const data = characterData[Character[char].toLowerCase()];
      if (data) {
        setWeaponFilterFn(() => (weapon) => {
          return (
            weaponData[Weapon[weapon]?.toLowerCase()]?.weapontype ===
            data.weapontype
          );
        });
      }
    }
  }, [char, setTheme]);

  useEffect(() => {
    const encoded = encodeBuild(build);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("build", encoded);
        return next;
      },
      { replace: true }
    );
  }, [build, setSearchParams]);

  return (
    <div
      className={`rounded-box my-auto flex w-full bg-contain bg-center bg-no-repeat shadow-2xl sm:w-3/5 sm:bg-cover`}
      style={imgUrl ? { backgroundImage: `url(${imgUrl})` } : undefined}
    >
      <div className="items-center rounded-box bg-base-200/70 flex w-full justify-center py-10">
        <div className="flex w-full flex-col space-y-2 px-2 xl:w-3/5">
          <NameEditor name={name} setName={setName} isPreset={presets[hash]} />
          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-row items-center justify-start">
              <CharacterSelect char={char} setChar={setChar} />
            </div>
            <button
              className="btn btn-primary btn-sm"
              disabled={!canSave}
              onClick={handleAdd}
            >
              {id ? t("Save") : t("Add")}
            </button>
          </div>
          <div className="flex flex-row items-center justify-between space-x-2">
            <div className="rounded-box border-primary-focus h-full w-1/2 justify-between border-2 border-solid">
              <WeaponEditor
                weapons={weapons}
                setWeapons={setWeapons}
                filterFn={weaponFilterFn}
              />
            </div>
            <div className="rounded-box border-primary-focus h-full w-1/2 justify-between border-2 border-solid">
              <SuitsEditor suits={suits} setSuits={setSuits} />
            </div>
          </div>
          <div className="rounded-box border-primary-focus w-full border-2 border-solid pb-2">
            <label className="label flex flex-row justify-between">
              <span className="text-sm">{t("Main Stats")}</span>
            </label>
            <MainAttributesEditor
              flower={flower}
              plume={plume}
              sands={sands}
              setSands={setSands}
              goblet={goblet}
              setGoblet={setGoblet}
              circlet={circlet}
              setCirclet={setCirclet}
            />
          </div>
          <div className="rounded-box border-primary-focus w-full border-2 border-solid pb-2">
            <SubAttributesEditor
              subAttributes={subAttributes}
              setSubAttributes={setSubAttributes}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildEditor;
