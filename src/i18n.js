import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import Backend from "i18next-http-backend";
import ChainedBackend from "i18next-chained-backend";
import {
  SUPPORTED_LOCALES,
  cacheSupportedLocale,
  detectSupportedLocale,
} from "./i18nLocale";
// import resourcesToBackend from 'i18next-resources-to-backend';
// don't want to use this?
// have a look at the Quick start guide
// for passing in lng and translations on init

if (typeof document !== "undefined") {
  i18n.on("languageChanged", (language) => {
    document.documentElement.lang = language;
    cacheSupportedLocale(language);
  });
}

i18n
  // load translation using http -> see /public/locales (i.e. https://github.com/i18next/react-i18next/tree/master/example/react/public/locales)
  // learn more: https://github.com/i18next/i18next-http-backend
  // want your translations to be loaded from a professional CDN? => https://github.com/locize/react-tutorial#step-2---use-the-locize-cdn
  .use(ChainedBackend)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    ns: [
      "common",
      "artifacts",
      "characters",
      "sets",
      "weapons",
      "enemy",
      "showcase",
    ],
    defaultNS: "common",
    backend: {
      backends: [Backend],
    },
    lng: detectSupportedLocale(),
    fallbackLng: "en",
    supportedLngs: [...SUPPORTED_LOCALES],
    load: "currentOnly",
    debug: import.meta.env.DEV,

    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
  });

export default i18n;
