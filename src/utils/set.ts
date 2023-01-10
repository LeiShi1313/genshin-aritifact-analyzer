import { Set } from '../genshin/set';

export const monaSetToSet = (setName: string): Set => {
  if (setName === 'gladiatorFinale') return Set.GLADIATORS_FINALE;
  if (setName === 'exile') return Set.THE_EXILE;
  if (setName === 'wandererTroupe') return Set.WANDERERS_TROUPE;
  if (setName === 'shimenawaReminiscence') return Set.SHIMENAWAS_REMINISCENCE;

  const name = setName.charAt(0).toLowerCase() + setName.slice(1);
  const key = name.replace(/[A-Z]/g, x => `_${x}`).toUpperCase();
  let set = Set[key];
  if (set !== undefined) return set;
  return Set.SET_UNSPECIFIED;
}