import thunk from "redux-thunk";
import { combineReducers } from "redux";
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { persistStore, persistReducer } from "redux-persist";
import createIdbStorage from '@piotr-cz/redux-persist-idb-storage'

import reducers from "./reducers";
// import { buildApi, matchApi } from "./api";

// const persistConfig = {
//   key: import.meta.env.DEV
//     ? "genshin-artifact-builds"
//     : "genshin-artifacts-0.0.1",
//   storage,
// };
const persistConfig = {
  key: import.meta.env.DEV
    ? "genshin-artifact-builds"
    : "genshin-artifacts-0.0.1",
  storage: createIdbStorage({name: 'genshin-artifact-builds', storeName: 'redux'}),
  serialize: false, // Data serialization is not required and disabling it allows you to inspect storage value in DevTools; Available since redux-persist@5.4.0
  deserialize: false, // Required to bear same value as `serialize` since redux-persist@6.0
}
const store = configureStore({
  reducer: persistReducer(persistConfig, combineReducers({ ...reducers })),
  devTools: import.meta.env.DEV,
  middleware: [thunk],
});
const persistor = persistStore(store);
setupListeners(store.dispatch);

export { persistor, store };
