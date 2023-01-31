import * as defaultConfig from "../config";
import { store } from "../store";

export const getConfig = (
  config?: defaultConfig.ConfigOptions
): defaultConfig.ConfigOptions => ({
  ...defaultConfig,
  ...store.getState().configs,
  ...config,
});
