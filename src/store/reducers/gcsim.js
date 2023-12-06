import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios';

const fetchGCSimScript = createAsyncThunk(
  'gcsim/fetchGCSimScript',
  async (scriptPath) => {
    const response = await axios.get(scriptPath);
    // console.log(response);
    return response.data;
  }
)


export const gcsimSlice = createSlice({
  name: 'gcsim',
  initialState: {
    scripts: {},
  },
  reducers: {
    // addScript: (state, action) => {
    //   const { script } = action.payload;
    //   const scriptHash = getGCSimScriptHash(script);
    //   state.scripts[hash] = script;
    // },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGCSimScript.fulfilled, (state, action) => {
        console.log(action.payload);
        // const { script } = action.payload;
        // const scriptHash = getGCSimScriptHash(script);
        // state.scripts[scriptHash] = script;
      })
    }
});

export { fetchGCSimScript };
export default gcsimSlice.reducer