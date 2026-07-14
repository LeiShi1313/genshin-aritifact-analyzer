import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

import { GCSimScript } from "../../genshin/gcsim";
import {
  beginGCSimFetch,
  completeGCSimFetch,
  decodeGCSimScripts,
  failGCSimFetch,
  initialGCSimState,
  shouldStartGCSimFetch,
  type GCSimState,
} from "./gcsimState";

interface GCSimRootState {
  gcsim: GCSimState;
}

export const fetchGCSim = createAsyncThunk<
  GCSimScript[],
  void,
  { state: GCSimRootState }
>(
  "gcsim/fetchGCSim",
  async () => {
    const response = await axios.get<ArrayBuffer>("/gcsim/gcsim.bin", {
      responseType: "arraybuffer",
    });
    return decodeGCSimScripts(response.data);
  },
  {
    condition: (_, { getState }) => shouldStartGCSimFetch(getState().gcsim),
  }
);

export const gcsimSlice = createSlice({
  name: "gcsim",
  initialState: initialGCSimState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGCSim.pending, (state, action) => {
        return beginGCSimFetch(state, action.meta.requestId);
      })
      .addCase(fetchGCSim.fulfilled, (state, action) => {
        return completeGCSimFetch(state, action.payload, action.meta.requestId);
      })
      .addCase(fetchGCSim.rejected, (state, action) => {
        return failGCSimFetch(
          state,
          action.error.message ?? "Failed to load GCSim scripts",
          action.meta.requestId
        );
      });
  },
});

export default gcsimSlice.reducer;
