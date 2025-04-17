import { useTranslation as useI18nTranslation } from "../react-i18next";
import { loadLanguageNamespaces } from "./i18n";
import { TranslationKey } from "./types";

export const useTranslation = (namespace?: string) => {
  const { t, i18n } = useI18nTranslation(namespace);

  // Hàm thay đổi ngôn ngữ
  const changeLanguage = async (language: string) => {
    // Load all namespaces for the new language before changing
    await loadLanguageNamespaces(language);
    i18n.changeLanguage(language);
  };

  // Hàm lấy ngôn ngữ hiện tại
  const getCurrentLanguage = (): string => {
    return i18n.language;
  };

  // Hàm dịch với thay thế biến
  const translate = (key: TranslationKey, options?: any): string => {
    // Extract namespace from key if it contains a dot
    if (key.includes(".")) {
      const [ns, k] = key.split(".", 2);
      // If we're accessing a namespace that's not the current one, ensure it's loaded
      if (namespace !== ns && !i18n.hasResourceBundle(i18n.language, ns)) {
        // This will load the namespace asynchronously, but won't block the UI
        import(`./translations/${i18n.language}/${ns}`)
          .then((module) => {
            i18n.addResourceBundle(i18n.language, ns, module.default);
          })
          .catch((error) => {
            console.error(
              `Error loading namespace ${ns} for ${i18n.language}:`,
              error
            );
          });
      }
    }
    return t(key, options);
  };

  return {
    t: translate,
    changeLanguage,
    getCurrentLanguage,
  };
};
