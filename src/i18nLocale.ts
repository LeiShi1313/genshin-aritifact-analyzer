export const LANGUAGE_OPTIONS = Object.freeze([
  { locale: "en", label: "English", flag: "1f1fa-1f1f8" },
  { locale: "zh", label: "简体中文", flag: "1f1e8-1f1f3" },
  { locale: "zh-Hant", label: "繁体中文", flag: "1f1ed-1f1f0" },
  { locale: "ja", label: "日本語", flag: "1f1ef-1f1f5" },
  { locale: "ko", label: "한국어", flag: "1f1f0-1f1f7" },
  { locale: "fr", label: "Français", flag: "1f1eb-1f1f7" },
  { locale: "es", label: "Español", flag: "1f1ea-1f1f8" },
  { locale: "de", label: "Deutsch", flag: "1f1e9-1f1ea" },
] as const);

export type SupportedLocale = (typeof LANGUAGE_OPTIONS)[number]["locale"];

export const SUPPORTED_LOCALES: readonly SupportedLocale[] = Object.freeze(
  LANGUAGE_OPTIONS.map(({ locale }) => locale)
);

const EXACT_LOCALES = new Map<string, SupportedLocale>(
  SUPPORTED_LOCALES.map((locale) => [locale.toLowerCase(), locale])
);

const LANGUAGE_LOCALES = new Map<string, SupportedLocale>([
  ["de", "de"],
  ["en", "en"],
  ["es", "es"],
  ["fr", "fr"],
  ["ja", "ja"],
  ["ko", "ko"],
]);

export const resolveSupportedLocale = (
  locale: string | null | undefined
): SupportedLocale | undefined => {
  if (!locale) return undefined;

  const normalized = locale.trim().replaceAll("_", "-").toLowerCase();
  if (!normalized) return undefined;

  const exact = EXACT_LOCALES.get(normalized);
  if (exact) return exact;

  const [language, regionOrScript] = normalized.split("-");
  if (language === "zh") {
    if (
      regionOrScript === "hant" ||
      regionOrScript === "tw" ||
      regionOrScript === "hk" ||
      regionOrScript === "mo"
    ) {
      return "zh-Hant";
    }
    return "zh";
  }

  return LANGUAGE_LOCALES.get(language);
};

export const pickSupportedLocale = (
  candidates: readonly (string | null | undefined)[]
): SupportedLocale => {
  for (const candidate of candidates) {
    const locale = resolveSupportedLocale(candidate);
    if (locale) return locale;
  }
  return "en";
};

const safelyRead = (read: () => string | null | undefined) => {
  try {
    return read();
  } catch {
    return undefined;
  }
};

const browserLocaleCandidates = (): readonly (string | null | undefined)[] => {
  if (typeof window === "undefined") return [];

  const queryLanguage = safelyRead(() =>
    new URLSearchParams(window.location.search).get("lng")
  );
  const cookieLanguage = safelyRead(() => {
    const entry = document.cookie
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith("i18next="));
    return entry
      ? decodeURIComponent(entry.slice("i18next=".length))
      : undefined;
  });
  const localLanguage = safelyRead(() =>
    window.localStorage.getItem("i18nextLng")
  );
  const sessionLanguage = safelyRead(() =>
    window.sessionStorage.getItem("i18nextLng")
  );
  const navigatorLanguages = [
    ...(window.navigator.languages ?? []),
    window.navigator.language,
  ];

  return [
    queryLanguage,
    cookieLanguage,
    localLanguage,
    sessionLanguage,
    ...navigatorLanguages,
    document.documentElement.lang,
  ];
};

export const detectSupportedLocale = (): SupportedLocale =>
  pickSupportedLocale(browserLocaleCandidates());

export const cacheSupportedLocale = (locale: string): void => {
  if (typeof window === "undefined") return;
  const supportedLocale = resolveSupportedLocale(locale);
  if (!supportedLocale) return;

  try {
    window.localStorage.setItem("i18nextLng", supportedLocale);
  } catch {
    // Language selection still works when storage is blocked or unavailable.
  }
};
