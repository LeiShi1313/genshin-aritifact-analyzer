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
import { toHex, fromHex } from "../../utils/hex";
import { characterToTheme } from "../../utils/character";
import characterData from "../../data/characters.json";
import weaponData from "../../data/weapons.json";

const BuildEditor = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { setTheme } = useContext(ThemeContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const presets = useSelector((state) => state.presets.builds);
  const id = searchParams.get("id");
  let build;
  if (searchParams.get("build")) {
    build = Build.decode(fromHex(searchParams.get("build")));
  } else {
    build = {
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
    };
  }

  const [name, setName] = useState(build.name);
  const [char, setChar] = useState(build.character);
  const [weapons, setWeapons] = useState(build.weapons);
  const [weaponFilterFn, setWeaponFilterFn] = useState(null);
  const [suits, setSuits] = useState(build.suits);
  const flower = build.flowerAttributes;
  const plume = build.plumeAttributes;
  const [sands, setSands] = useState(build.sandsAttributes);
  const [goblet, setGoblet] = useState(build.gobletAttributes);
  const [circlet, setCirclet] = useState(build.circletAttributes);
  const [subAttributes, setSubAttributes] = useState(build.subAttributes);
  const [matches, setMatches] = useState(
    window.matchMedia("(min-width: 768px)").matches
  );
  const imgUrl = useMemo(
    () =>
      new URL(
        `../../assets/characters/${Character[char].toLocaleLowerCase()}_${
          matches ? "gacha" : "cover2"
        }.png`,
        import.meta.url
      ).href,
    [char, matches]
  );
  const hash = useMemo(() => hashBuild(build), [build]);

  const handleAdd = () => {
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
    window
      .matchMedia("(min-width: 420px)")
      .addEventListener("change", (e) => setMatches(e.matches));
  }, []);

  useEffect(() => {
    const theme = characterToTheme(char);
    if (theme) setTheme(theme);
    if (char > 0) {
      const data = characterData[Character[char].toLowerCase()];
      console.log(data);
      if (data) {
        setWeaponFilterFn(() => (weapon) => {
          return (
            weaponData[Weapon[weapon].toLowerCase()].weapontype ===
            data.weapontype
          );
        });
      }
    }
  }, [char]);

  useEffect(() => {
    build = {
      name: name,
      character: char,
      weapons: weapons,
      suits: suits,
      flowerAttributes: [AttributeType.HP],
      plumeAttributes: [AttributeType.ATK],
      sandsAttributes: sands,
      gobletAttributes: goblet,
      circletAttributes: circlet,
      subAttributes: subAttributes,
    };
    const encoded = encodeBuild(build);
    let updatedSearchParams = new URLSearchParams(searchParams.toString());
    updatedSearchParams.set("build", encoded);
    setSearchParams(updatedSearchParams.toString(), { replace: true });
  }, [name, char, weapons, suits, sands, goblet, circlet, subAttributes]);

  return (
    <div
      className={`my-auto flex w-full rounded-box bg-contain bg-center bg-no-repeat shadow-2xl sm:w-3/5 sm:bg-cover`}
      style={{ backgroundImage: `url(${imgUrl})` }}
    >
      <div className="items-enter flex w-full justify-center rounded-box bg-base-200 bg-opacity-70 py-10">
        <div className="flex w-full flex-col space-y-2 px-2 xl:w-3/5">
          <NameEditor name={name} setName={setName} isPreset={presets[hash]} />
          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-row items-center justify-start">
              <CharacterSelect char={char} setChar={setChar} />
            </div>
            <button className="btn btn-primary btn-sm" onClick={handleAdd}>
              {id ? t("Save") : t("Add")}
            </button>
          </div>
          <div className="flex flex-row items-center justify-between space-x-2">
            <div className="h-full w-1/2 justify-between rounded-box border-2 border-solid border-primary-focus">
              <WeaponEditor
                weapons={weapons}
                setWeapons={setWeapons}
                filterFn={weaponFilterFn}
              />
            </div>
            <div className="h-full w-1/2 justify-between rounded-box border-2 border-solid border-primary-focus">
              <SuitsEditor suits={suits} setSuits={setSuits} />
            </div>
          </div>
          <div className="w-full rounded-box border-2 border-solid border-primary-focus pb-2">
            <label className="label flex flex-row justify-between">
              <span className="label-text">{t("Main Stats")}</span>
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
              subAttributes={subAttributes}
            />
          </div>
          <div className="w-full rounded-box border-2 border-solid border-primary-focus pb-2">
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
