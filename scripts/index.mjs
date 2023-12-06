// import generate_gcsim from "./generate-gcsim.mjs";
import { portSets} from "./port-sets.mjs";
import { portWeapons } from "./port-weapons.mjs";
import { portCharacters } from "./port-characters.mjs";

(async () => {
    // generate_gcsim();
    await portSets();
    await portWeapons();
    await portCharacters();
})();