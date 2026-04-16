type LocalizedMap = Record<string, string | undefined> | undefined;

const SUPPORTED_LOCALES = new Set(["en", "fa", "ps"]);

export function getClientLocale(): string {
  if (typeof window !== "undefined") {
    const segment = window.location.pathname.split("/")[1];
    if (segment && SUPPORTED_LOCALES.has(segment)) return segment;
  }
  if (typeof document !== "undefined") {
    const lang = document.documentElement.lang;
    if (lang && SUPPORTED_LOCALES.has(lang)) return lang;
  }
  return "en";
}

export function resolveLocalizedField(
  baseValue: string | undefined | null,
  i18nMap: LocalizedMap,
  locale?: string
): string {
  const activeLocale = locale || getClientLocale();
  const localized = i18nMap?.[activeLocale];
  const fallbackEn = i18nMap?.en;
  return localized || fallbackEn || baseValue || "";
}
