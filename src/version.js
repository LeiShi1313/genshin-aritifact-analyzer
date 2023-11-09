const Storage = window.localStorage;
const APP_VERSION_KEY = 'genshin-aritifact-builds-app-version';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION; 

export function checkAppVersionAndRefresh() {
    const storedAppVersion = Storage.getItem(APP_VERSION_KEY);
    if (storedAppVersion !== APP_VERSION) {
      Storage.setItem(APP_VERSION_KEY, APP_VERSION);
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          registration.unregister().then(() => {
            window.location.reload(true);
          });
        });
      } else {
        window.location.reload(true);
      }
    }
  }
