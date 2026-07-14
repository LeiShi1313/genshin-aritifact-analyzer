import { createSlice } from "@reduxjs/toolkit";

export const DEFAULT_FOUR_LINE_START_PROBABILITY = 0.2;

export const configsSlice = createSlice({
  name: "configs",
  initialState: {
    fourLineStartProbability: DEFAULT_FOUR_LINE_START_PROBABILITY,
  },
  reducers: {
    updateFourLineStartProbability: (state, action) => {
      const probability = action.payload;
      if (
        typeof probability === "number" &&
        Number.isFinite(probability) &&
        probability >= 0 &&
        probability <= 1
      ) {
        state.fourLineStartProbability = probability;
      }
    },
    resetFourLineStartProbability: (state) => {
      state.fourLineStartProbability = DEFAULT_FOUR_LINE_START_PROBABILITY;
    },
  },
});

export const { updateFourLineStartProbability, resetFourLineStartProbability } =
  configsSlice.actions;

export default configsSlice.reducer;
