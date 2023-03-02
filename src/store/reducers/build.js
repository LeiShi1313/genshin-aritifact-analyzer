import { createSlice } from '@reduxjs/toolkit'
import { hashBuild } from "../../utils/hash"

const initialCnofig = {
  enabled: true,
}

export const buildSlice = createSlice({
  name: 'build',
  initialState: {
    builds: {},
    config: {},
    weights: {},
  },
  reducers: {
    addBuild: (state, action) => {
      const hash = hashBuild(action.payload);
      state.builds[hash] = action.payload;
      state.config[hash] = { ...initialCnofig };
    },
    editBuild: (state, action) => {
      const { id, build } = action.payload;

      const newHash = hashBuild(build);
      if (newHash === id) return;
      delete state.builds[id];
      delete state.config[id];
      state.builds[newHash] = build;
      state.config[newHash] = state.config[id];
    },
    importBuilds: (state, action) => {
      const { builds, replace } = action.payload;
      if (replace) {
        state.builds = {};
        state.config = {};
      }
      state.builds = { ...state.builds, ...builds };
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
        state.config[hash] = { ...initialCnofig };
      }
      state.config[hash].enabled = enabled;
    },
    toggleAllBuilds: (state, action) => {
      const { hashes, enabled } = action.payload;
      for (const hash of hashes) {
        if (state.config[hash] === undefined) {
          state.config[hash] = { ...initialCnofig };
        }
        state.config[hash].enabled = enabled;
      }
    },
    updateBuildWeights: (state, action) => {
      const { hash, weights } = action.payload
      state.weights[hash] = weights;
    }
  },
})

export const { addBuild, editBuild, importBuilds, removeBuild, toggleBuild, updateBuildWeights, toggleAllBuilds } = buildSlice.actions
export default buildSlice.reducer