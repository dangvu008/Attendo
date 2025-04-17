import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../constants/storage";

// Import translations
import en from "./translations/en";
import vi from "./translations/vi";

// Khởi tạo i18next ngay lập tức với cấu hình đơn giản
i18next.use(initReactI18next).init({
  compatibilityJSON: "v3",
  resources: {
    en: en,
    vi: vi,
  },
  lng: "vi", // Mặc định là tiếng Việt
  fallbackLng: "vi",
  interpolation: {
    escapeValue: false,
  },
});

// Hàm đơn giản để thay đổi ngôn ngữ
export const changeLanguage = (language) => {
  i18next.changeLanguage(language);
  
  // Lưu ngôn ngữ vào AsyncStorage
  try {
    AsyncStorage.getItem(STORAGE_KEYS.USER_SETTINGS).then(settings => {
      const userSettings = settings ? JSON.parse(settings) : {};
      userSettings.language = language;
      AsyncStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(userSettings));
    });
  } catch (error) {
    console.error("Error saving language setting:", error);
  }
};

// Hàm đơn giản để lấy ngôn ngữ hiện tại
export const getCurrentLanguage = () => {
  return i18next.language;
};

// Hàm đơn giản để dịch
export const translate = (key, options) => {
  return i18next.t(key, options);
};

// Hàm đơn giản để khởi tạo ngôn ngữ từ AsyncStorage
export const initLanguage = async () => {
  try {
    const userSettings = await AsyncStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
    if (userSettings) {
      const { language } = JSON.parse(userSettings);
      if (language) {
        i18next.changeLanguage(language);
      }
    }
  } catch (error) {
    console.error("Error initializing language:", error);
  }
};

// Gọi hàm khởi tạo ngôn ngữ
initLanguage();

export default i18next;
