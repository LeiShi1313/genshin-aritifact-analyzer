import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import App from './App'
import './index.css'
import './i18n'
import { store, persistor } from './store';
import ThemedSuspense from './features/ThemedSuspense';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
          <Suspense fallback={<ThemedSuspense />}>
            <App />
          </Suspense>
      </PersistGate>
    </Provider>
  </React.StrictMode>
)
