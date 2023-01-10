import { createSlice } from '@reduxjs/toolkit'


export const uploadsSlice = createSlice({
  name: 'uploads',
  initialState: {
    artifacts: {},
  },
  reducers: {
    uploadArtifacts: (state, action) => {
      const { key, artifacts } = action.payload;
      state.artifacts[key] = artifacts;
    },
  },
})

export const { uploadArtifacts } = uploadsSlice.actions
export default uploadsSlice.reducer