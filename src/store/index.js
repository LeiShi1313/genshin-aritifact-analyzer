import thunk from "redux-thunk";
import storage from 'redux-persist/lib/storage'
import { combineReducers } from "redux";
import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { persistStore, persistReducer } from 'redux-persist'

import reducers from "./reducers";
// import { buildApi, matchApi } from "./api";

const persistConfig = {
  key: 'genshin-artifacts-0.0.1',
  storage,
}
const store = configureStore({
  reducer: persistReducer(persistConfig, combineReducers({ ...reducers }) ),
  devTools: import.meta.env.DEV,
  middleware: [thunk]
})
const persistor = persistStore(store)
setupListeners(store.dispatch)

export { persistor, store }
