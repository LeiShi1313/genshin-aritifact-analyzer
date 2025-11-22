import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import App from "./App";
import "./index.css";
import "./i18n";
import { store, persistor } from "./store";

if (!import.meta.env.DEV) {
  // Load tracking script
  const trackingScript = document.createElement("script");
  trackingScript.src = "https://track.leishi.io/api/script.js";
  trackingScript.setAttribute("data-site-id", "2");
  trackingScript.defer = true;
  document.head.appendChild(trackingScript);
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
