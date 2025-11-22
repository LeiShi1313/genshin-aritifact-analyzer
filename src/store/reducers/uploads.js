import { createSlice } from '@reduxjs/toolkit'


export const uploadsSlice = createSlice({
  name: 'uploads',
  initialState: {
    artifacts: {},
  },
  reducers: {
    uploadArtifacts: (state, action) => {
      const { key, artifacts, format, name, characters, weapons } = action.payload;
      state.artifacts[key] = {
        items: artifacts,
        format,
        name,
        date: new Date(),
        characters: characters || [],
        weapons: weapons || [],
      }
    },
    removeUploadedArtifacts: (state, action) => {
      const key = action.payload;
      delete state.artifacts[key];
    }
  },
})

export const { uploadArtifacts, removeUploadedArtifacts } = uploadsSlice.actions
export default uploadsSlice.reducer