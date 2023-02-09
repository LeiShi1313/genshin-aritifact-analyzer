import { Artifact } from "../genshin/artifact";
import { BuildEntry } from "../utils/build";
import { ConfigOptions } from "../config";
import { getAllFitsAndAllRarity } from "../utils/fitsAndRarity";

interface CalculatorMessage {
    artifacts: Artifact[];
    builds: BuildEntry;
    config: ConfigOptions;
}

self.onmessage = (e: MessageEvent<CalculatorMessage>) => {
    const { artifacts, builds, config } = e.data;
    const { allFits, allRarity, configHash } = getAllFitsAndAllRarity(artifacts, builds, self, config);
    self.postMessage({ allFits, allRarity, configHash });
};

export {};