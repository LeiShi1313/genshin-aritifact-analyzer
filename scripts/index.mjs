import { generate_gcsim } from "./generate-gcsim.mjs";
import { portSets} from "./port-sets.mjs";
import { portWeapons } from "./port-weapons.mjs";
import { portCharacters } from "./port-characters.mjs";
import { generateVersion } from "./generate-version.mjs";

(async () => {
    await generateVersion();
    await portSets();
    await portWeapons();
    await portCharacters();
    await generate_gcsim();
})();