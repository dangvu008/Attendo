import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../constants/storage";

// Import only the common translations for initial load
import enCommon from "./translations/en/common";
import viCommon from "./translations/vi/common";

// Hàm lấy ngôn ngữ từ AsyncStorage
const getStoredLanguage = async (): Promise<string> => {
  try {
    const userSettings = await AsyncStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
    if (userSettings) {
      const { language } = JSON.parse(userSettings);
      return language || "vi"; // Mặc định là tiếng Việt nếu không có
    }
    return "vi"; // Mặc định là tiếng Việt
  } catch (error) {
    console.error("Error getting stored language:", error);
    return "vi"; // Mặc định là tiếng Việt nếu có lỗi
  }
};

// Load a namespace dynamically
const loadNamespace = async (language: string, namespace: string): Promise<void> => {
  try {
    // Only load if not already loaded
    if (!i18next.hasResourceBundle(language, namespace)) {
      const module = await import(`./translations/${language}/${namespace}`);
      i18next.addResourceBundle(language, namespace, module.default);
      console.log(`Loaded namespace: ${namespace} for language: ${language}`);
    }
  } catch (error) {
    console.error(`Error loading namespace ${namespace} for ${language}:`, error);
  }
};

// Load all namespaces for a language
export const loadLanguageNamespaces = async (language: string): Promise<void> => {
  const namespaces = ["home", "settings", "shifts", "notes", "weather", "backup", "alarm"];

  await Promise.all(namespaces.map((namespace) => loadNamespace(language, namespace)));
  console.log(`All namespaces loaded for ${language}`);
};

// Khởi tạo i18next
const initI18n = async (): Promise<typeof i18next> => {
  try {
    const language = await getStoredLanguage();

    await i18next.use(initReactI18next).init({
      compatibilityJSON: "v3",
      resources: {
        en: { common: enCommon },
        vi: { common: viCommon },
      },
      ns: ["common"],
      defaultNS: "common",
      lng: language,
      fallbackLng: "vi",
      interpolation: {
        escapeValue: false,
      },
      partialBundledLanguages: true,
    });

    // Load additional namespaces in the background
    loadLanguageNamespaces(language);

    return i18next;
  } catch (error) {
    console.error("Error initializing i18n:", error);
    // Khởi tạo với cấu hình tối thiểu để tránh lỗi
    await i18next.use(initReactI18next).init({
      compatibilityJSON: "v3",
      resources: {
        vi: { common: viCommon },
      },
      ns: ["common"],
      defaultNS: "common",
      lng: "vi",
      fallbackLng: "vi",
    });
    return i18next;
  }
};

export { initI18n };
export default i18next;
