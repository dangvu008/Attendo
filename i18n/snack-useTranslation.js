import { useTranslation as useI18nTranslation } from "react-i18next";
import i18next from "i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../constants/storage";

// Hook đơn giản hóa cho Snack.expo.dev
export const useTranslation = () => {
  const { t } = useI18nTranslation();

  // Hàm thay đổi ngôn ngữ
  const changeLanguage = (language) => {
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

  // Hàm lấy ngôn ngữ hiện tại
  const getCurrentLanguage = () => {
    return i18next.language;
  };

  return {
    t,
    changeLanguage,
    getCurrentLanguage,
  };
};
