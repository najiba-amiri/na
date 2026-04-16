import logging
from functools import lru_cache


logger = logging.getLogger(__name__)


SUPPORTED_LOCALES = ("en", "fa", "ps")
DEFAULT_LOCALE = "fa"


def normalize_locale(locale: str | None) -> str:
    if not locale:
        return DEFAULT_LOCALE
    normalized = locale.lower().strip().replace("_", "-")
    if "-" in normalized:
        normalized = normalized.split("-", 1)[0]
    return normalized or DEFAULT_LOCALE


def resolve_localized_text(base_text: str, i18n_map: dict | None, locale: str | None) -> str:
    locale = normalize_locale(locale)
    i18n_map = i18n_map or {}

    if i18n_map.get(locale):
        return i18n_map[locale]
    if i18n_map.get(DEFAULT_LOCALE):
        return i18n_map[DEFAULT_LOCALE]
    for fallback_locale in SUPPORTED_LOCALES:
        if i18n_map.get(fallback_locale):
            return i18n_map[fallback_locale]
    for value in i18n_map.values():
        if value:
            return value
    return base_text


def resolve_request_locale(request) -> str:
    locale = None
    if request is not None:
        locale = request.query_params.get("locale") or request.query_params.get("lang")
        if not locale:
            accept_language = request.headers.get("Accept-Language", "")
            if accept_language:
                locale = accept_language.split(",")[0]
    return normalize_locale(locale)


def build_i18n_payload(
    base_text: str,
    existing: dict | None = None,
    manual_overrides: dict | None = None,
    source_locale: str = DEFAULT_LOCALE,
    target_locales: tuple[str, ...] = ("en", "ps"),
) -> dict:
    payload = {}
    if existing:
        payload.update(existing)

    if manual_overrides:
        # Manual edits from admin/seller should always win.
        payload.update({k: v for k, v in manual_overrides.items() if v is not None})

    payload[source_locale] = base_text or ""

    missing_target_locales = tuple(
        locale for locale in target_locales if not payload.get(locale)
    )
    if missing_target_locales:
        auto_translations = translate_text_to_locales(
            text=base_text or "",
            source_locale=source_locale,
            target_locales=missing_target_locales,
        )
        for locale, value in auto_translations.items():
            if not payload.get(locale):
                payload[locale] = value

    payload[source_locale] = base_text or ""
    return payload


@lru_cache(maxsize=1)
def _load_argos():
    from argostranslate import package, translate

    return package, translate


def translate_text_to_locales(
    text: str,
    source_locale: str,
    target_locales: tuple[str, ...],
) -> dict:
    if not text:
        return {locale: "" for locale in target_locales}

    try:
        package, translate = _load_argos()
    except Exception:
        logger.info("Argos Translate is not installed; skipping auto-translation.")
        return {}

    translations = {}
    installed_languages = translate.get_installed_languages()

    source_lang = next((lang for lang in installed_languages if lang.code == source_locale), None)
    if source_lang is None:
        return {}

    for target_locale in target_locales:
        if target_locale == source_locale:
            continue
        try:
            target_lang = next(
                (lang for lang in installed_languages if lang.code == target_locale), None
            )
            if target_lang is None:
                continue

            translation = source_lang.get_translation(target_lang)
            translations[target_locale] = translation.translate(text)
        except Exception:
            logger.warning(
                "Argos translation failed for %s -> %s", source_locale, target_locale, exc_info=True
            )
            continue

    if translations:
        return translations

    # If language pairs are not installed, attempt best-effort install.
    try:
        package.update_package_index()
        available_packages = package.get_available_packages()
    except Exception:
        return {}

    for target_locale in target_locales:
        if target_locale == source_locale:
            continue
        try:
            target_lang = next(
                (lang for lang in translate.get_installed_languages() if lang.code == target_locale),
                None,
            )
            if target_lang:
                continue

            pkg = next(
                (
                    p
                    for p in available_packages
                    if p.from_code == source_locale and p.to_code == target_locale
                ),
                None,
            )
            if pkg:
                package.install_from_path(pkg.download())
        except Exception:
            continue

    try:
        installed_languages = translate.get_installed_languages()
        source_lang = next((lang for lang in installed_languages if lang.code == source_locale), None)
        if source_lang is None:
            return {}

        for target_locale in target_locales:
            target_lang = next(
                (lang for lang in installed_languages if lang.code == target_locale), None
            )
            if target_lang is None:
                continue
            try:
                translations[target_locale] = source_lang.get_translation(target_lang).translate(text)
            except Exception:
                continue
    except Exception:
        return {}

    return translations
