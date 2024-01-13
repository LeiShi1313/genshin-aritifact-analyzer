import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios';
import { GCSim } from "../../genshin/gcsim"

const fetchGCSim = createAsyncThunk(
  'gcsim/fetchGCSim',
  async () => {
    const response = await axios.get('/gcsim/gcsim.bin',
      {
        responseType: 'arraybuffer'
      });
    // console.log(response);
    return response.data;
  }
)


export const gcsimSlice = createSlice({
  name: 'gcsim',
  initialState: {
    scripts: [],
    isScriptsLoading: true
  },
  reducers: {
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGCSim.pending, (state) => {
        state.isScriptsLoading = true
      })
      .addCase(fetchGCSim.fulfilled, (state, action) => {
        const { scripts } = GCSim.decode(new Uint8Array(action.payload));
        state.scripts = scripts;
        state.isScriptsLoading = false
      })
  }
});

export { fetchGCSim };
export default gcsimSlice.reducer