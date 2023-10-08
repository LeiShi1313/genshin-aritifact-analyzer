const port_sets = require("./port-sets.cjs");
const port_weapons = require("./port-weapons.cjs");
const port_characters = require("./port-characters.cjs");

(async () => {
    await port_sets.portSets();
    await port_weapons.portWeapons();
    await port_characters.portCharacters();
})();