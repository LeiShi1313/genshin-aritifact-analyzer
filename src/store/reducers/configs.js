import { createSlice } from '@reduxjs/toolkit'
import { attributeWeights, rarityWeights, standardRarity, scoreOverhead, nonFiveStarSubstractor, nonSuitSubstractors } from "../../utils/config"


export const configsSlice = createSlice({
  name: 'configs',
  initialState: {
    attributeWeights: attributeWeights,
    rarityWeights: rarityWeights,
    standardRarity: standardRarity,
    scoreOverhead: scoreOverhead,
    nonFiveStarSubstractor: nonFiveStarSubstractor,
    nonSuitSubstractors: nonSuitSubstractors
  },
  reducers: {
    updateAttributeWeights: (state, action) => {
      const { x, y, value } = action.payload;
      state.attributeWeights[x][y] = value;
    },
    resetAttributeWeights: (state) => {
      state.attributeWeights = attributeWeights;
    },
    updateRarityWeights: (state, action) => {
      const { x, y, value } = action.payload;
      state.rarityWeights[x][y] = value;
    },
    resetRarityWeights: (state) => {
      state.rarityWeights = rarityWeights;
    },
    updateStandardRarity: (state, action) => {
      state.standardRarity = action.payload;
    },
    resetStandardRarity: (state) => {
      state.standardRarity = standardRarity;
    },
    updateScoreOverhead: (state, action) => {
      state.scoreOverhead = action.payload;
    },
    resetScoreOverhead: (state) => {
      state.scoreOverhead = scoreOverhead;
    },
    updateNonFiveStarSubstractor: (state, action) => {
      state.nonFiveStarSubstractor = action.payload;
    },
    resetNonFiveStarSubstractor: (state) => {
      state.nonFiveStarSubstractor = nonFiveStarSubstractor;
    },
    updateNonSuitSubstractors: (state, action) => {
      const { position, value } = action.payload;
      state.nonSuitSubstractors[position] = value;
    },
    resetNonSuitSubstractors: (state) => {
      state.nonSuitSubstractors = nonSuitSubstractors;
    }
  },
})

export const {
  updateAttributeWeights,
  resetAttributeWeights,
  updateRarityWeights,
  resetRarityWeights,
  updateStandardRarity,
  resetStandardRarity,
  updateScoreOverhead,
  resetScoreOverhead,
  updateNonFiveStarSubstractor,
  resetNonFiveStarSubstractor,
  updateNonSuitSubstractors,
  resetNonSuitSubstractors,
} = configsSlice.actions
export default configsSlice.reducer