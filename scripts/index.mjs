import { portSets } from "./port-sets.mjs";
import { portWeapons } from "./port-weapons.mjs";
import { portCharacters } from "./port-characters.mjs";
import { generateVersion } from "./generate-version.mjs";
import { createGameDataCatalog } from "./game-data/catalog.mjs";

(async () => {
  const catalog = createGameDataCatalog();
  await portSets(catalog);
  await portWeapons(catalog);
  await portCharacters(catalog);
  await generateVersion(catalog.manifest);
})();
