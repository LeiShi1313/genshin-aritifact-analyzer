import { Artifact } from "../genshin/artifact";
import { BuildEntry } from "../utils/build";
import { getAllFitsAndAllRarity } from "../utils/weights";

interface CalculatorMessage {
    artifacts: Artifact[];
    builds: BuildEntry;
}

self.onmessage = (e: MessageEvent<CalculatorMessage>) => {
    const { artifacts, builds } = e.data;
    const { allFits, allRarity } = getAllFitsAndAllRarity(artifacts, builds, self);
    self.postMessage({ allFits, allRarity });
};

export {};