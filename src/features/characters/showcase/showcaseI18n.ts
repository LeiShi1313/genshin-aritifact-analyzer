import type { TFunction } from "react-i18next";

type GameNamespace = "artifacts" | "characters" | "sets" | "weapons";

export const humanizeGameKey = (key: string | null | undefined): string =>
  (key ?? "")
    .split("_")
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join(" ");

export const translateGameLabel = (
  t: TFunction,
  namespace: GameNamespace,
  key: string | null | undefined,
  fallback = humanizeGameKey(key)
): string => {
  if (!key) return fallback;
  const translated = t(key, { ns: namespace, defaultValue: fallback });
  return typeof translated === "string" && translated.trim()
    ? translated
    : fallback;
};
