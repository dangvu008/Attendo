import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../constants/storage";

// Import translations
import en from "./translations/en";
import vi from "./translations/vi";

// Tối ưu hóa bằng cách tách các namespace chính
const resources = {
  en: {
    common: en.common,
    home: en.home,
    settings: en.settings,
    shifts: en.shifts,
    // Các namespace khác
  },
  vi: {
    common: vi.common,
    home: vi.home,
    settings: vi.settings,
    shifts: vi.shifts,
    // Các namespace khác
  }
};

// Hàm lấy ngôn ngữ từ AsyncStorage
const getStoredLanguage = async () => {
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

// Khởi tạo i18next
const initI18n = async () => {
  try {
    const language = await getStoredLanguage();

    await i18next.use(initReactI18next).init({
      compatibilityJSON: "v3",
      resources,
      lng: language,
      fallbackLng: "vi",
      defaultNS: "common",
      interpolation: {
        escapeValue: false,
      },
    });

    return i18next;
  } catch (error) {
    console.error("Error initializing i18n:", error);
    // Khởi tạo với cấu hình tối thiểu để tránh lỗi
    await i18next.use(initReactI18next).init({
      compatibilityJSON: "v3",
      resources: {
        vi: resources.vi,
      },
      lng: "vi",
      fallbackLng: "vi",
      defaultNS: "common",
    });
    return i18next;
  }
};

export { initI18n };
export default i18next;
