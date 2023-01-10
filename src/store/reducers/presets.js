import { createSlice } from '@reduxjs/toolkit'
import { hashBuild } from '../../utils/hash';


export const presetsSlice = createSlice({
  name: 'presets',
  initialState: {
    builds: {},
  },
  reducers: {
    loadPresets: (state, action) => {
      state.builds = {};
      for (const preset of action.payload) {
        const hash = hashBuild(preset)
        state.builds[hash] = preset;
      }
    },
  },
})

export const { loadPresets } = presetsSlice.actions
export default presetsSlice.reducer