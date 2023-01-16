import { createSlice } from '@reduxjs/toolkit'


export const uploadsSlice = createSlice({
  name: 'uploads',
  initialState: {
    artifacts: {},
  },
  reducers: {
    uploadArtifacts: (state, action) => {
      const { key, artifacts, format } = action.payload;
      state.artifacts[key] = {
        items: artifacts,
        format,
      }
    },
  },
})

export const { uploadArtifacts } = uploadsSlice.actions
export default uploadsSlice.reducer