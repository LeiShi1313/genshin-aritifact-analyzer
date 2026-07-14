import { createSlice } from "@reduxjs/toolkit";
import { hashBuild } from "../../utils/hash";

const initialConfig = {
  enabled: true,
};

export const buildSlice = createSlice({
  name: "build",
  initialState: {
    builds: {},
    config: {},
  },
  reducers: {
    addBuild: (state, action) => {
      const hash = hashBuild(action.payload);
      state.builds[hash] = action.payload;
      state.config[hash] = { ...initialConfig };
    },
    editBuild: (state, action) => {
      const { id, build } = action.payload;

      const newHash = hashBuild(build);
      if (newHash === id) return;
      const previousConfig = { ...(state.config[id] ?? initialConfig) };
      delete state.builds[id];
      delete state.config[id];
      state.builds[newHash] = build;
      state.config[newHash] = previousConfig;
    },
    importBuilds: (state, action) => {
      const { builds, replace } = action.payload;
      if (!builds || typeof builds !== "object" || Array.isArray(builds))
        return;
      const hashes = Object.keys(builds);
      if (hashes.length === 0) return;
      if (replace) {
        state.builds = {};
        state.config = {};
      }
      state.builds = { ...state.builds, ...builds };
      for (const hash of hashes) {
        if (state.config[hash] === undefined) {
          state.config[hash] = { ...initialConfig };
        }
      }
    },
    removeBuild: (state, action) => {
      const build = action.payload;
      const hash = hashBuild(build);
      delete state.builds[hash];
      delete state.config[hash];
    },
    toggleBuild: (state, action) => {
      const { hash, enabled } = action.payload;
      if (state.config[hash] === undefined) {
        state.config[hash] = { ...initialConfig };
      }
      state.config[hash].enabled = enabled;
    },
    toggleAllBuilds: (state, action) => {
      const { hashes, enabled } = action.payload;
      for (const hash of hashes) {
        if (state.config[hash] === undefined) {
          state.config[hash] = { ...initialConfig };
        }
        state.config[hash].enabled = enabled;
      }
    },
  },
});

export const {
  addBuild,
  editBuild,
  importBuilds,
  removeBuild,
  toggleBuild,
  toggleAllBuilds,
} = buildSlice.actions;
export default buildSlice.reducer;
