import { Set, setFromJSON } from '../genshin/set';
import data2pc from "../data/set2pcEffect.json";

export const monaSetToSet = (setName: string): Set => {
  if (setName === 'gladiatorFinale') return Set.GLADIATORS_FINALE;
  if (setName === 'exile') return Set.THE_EXILE;
  if (setName === 'wandererTroupe') return Set.WANDERERS_TROUPE;
  if (setName === 'shimenawaReminiscence') return Set.SHIMENAWAS_REMINISCENCE;
  if (setName === 'crimsonWitch') return Set.CRIMSON_WITCH_OF_FLAMES;

  const name = setName.charAt(0).toLowerCase() + setName.slice(1);
  const key = name.replace(/[A-Z]/g, x => `_${x}`).toUpperCase();
  let set = Set[key];
  if (set !== undefined) return set;
  return Set.SET_UNSPECIFIED;
}

export const goodSetToSet = (setName: string): Set => {
  const name = setName.charAt(0).toLowerCase() + setName.slice(1);
  const key = name.replace(/[A-Z]/g, x => `_${x}`).toUpperCase();
  let set = Set[key];
  if (set !== undefined) return set;
  return Set.SET_UNSPECIFIED;
}

// use substrings to map 2-piece bonus description string to 2-piece bonus CATEGORY
const TwoPcBonusCateToSubstrs={
elemental_damage: ["Geo DMG","Cryo DMG", "Pyro DMG", "Dendro DMG", "Anemo DMG", "Hydro DMG", "Electro DMG"],
physical_damage: ["Physical DMG"],
hp: ["HP"],
atk: ["ATK"],
def: ["DEF"],
em: ["Elemental Mastery"],
crit: ["CRIT"],
healing: ["Healing"],
er: ["Energy Recharge"],
shield_strength: ["Shield Strength"],
elemental_res: ["Pyro RES", "Electro RES", "Elemental RES"],
talents_damage: ["Elemental Skill DMG", "Normal and Charged Attack DMG", "Elemental Burst DMG"],
}

// {2-piece bonus description string: SET ENUM}
const TwoPcStrToSets = {};
Object.keys(data2pc).map((key) => {
  if (!TwoPcStrToSets[key]) TwoPcStrToSets[key] = [];
  data2pc[key].map((artifact) => {
    TwoPcStrToSets[key].push(setFromJSON(artifact.toUpperCase()));
  })
});

// {2-piece bonus CATEGORY: SET ENUM}
export const TwoPcBonusCateToSets = {};
Object.keys(TwoPcBonusCateToSubstrs).map((key) => {
  if (!TwoPcBonusCateToSets[key]) TwoPcBonusCateToSets[key] = [];
})
TwoPcBonusCateToSets["less_affected_time"] = [
  Set.PRAYERS_FOR_ILLUMINATION,
  Set.PRAYERS_FOR_DESTINY,
  Set.PRAYERS_FOR_WISDOM,
  Set.PRAYERS_TO_SPRINGTIME
];

// {substring: 2-piece bonus CATEGORY}
const subStrsTo2PcBonusCate = {};
Object.keys(TwoPcBonusCateToSubstrs).map((category) => {
  TwoPcBonusCateToSubstrs[category].map((substr) => {
    subStrsTo2PcBonusCate[substr] = category;
  })
})

// Finally transfer data from {2-piece bonus description string: SET ENUM} to {2-piece bonus CATEGORY: SET ENUM}
Object.keys(TwoPcStrToSets).map((str) => {
  let foundSubstr = Object.keys(subStrsTo2PcBonusCate).find((substr) => str.includes(substr));
  if (foundSubstr) {
    let currentCate = subStrsTo2PcBonusCate[foundSubstr];
    TwoPcBonusCateToSets[currentCate] = [...TwoPcBonusCateToSets[currentCate], ...TwoPcStrToSets[str]];
  }
})
