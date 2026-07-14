import { generate_gcsim } from "./generate-gcsim.mjs";
import { generate_enemy } from "./generate-enemy.mjs";
import { portSets } from "./port-sets.mjs";
import { portWeapons } from "./port-weapons.mjs";
import { portCharacters } from "./port-characters.mjs";
import { generateVersion } from "./generate-version.mjs";
import fs from "node:fs";

(async () => {
  await portSets();
  await portWeapons();
  await portCharacters();
  if (fs.existsSync("gcsim/internal")) {
    await generate_gcsim();
    await generate_enemy();
  } else {
    console.warn(
      "Skipping gcsim generation because the submodule is not initialized"
    );
  }
  await generateVersion();
})();
