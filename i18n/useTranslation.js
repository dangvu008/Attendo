import { useTranslation as useI18nTranslation } from "react-i18next";

// Đơn giản hóa hoàn toàn hook useTranslation cho Snack.expo.dev
export const useTranslation = (namespace = "common") => {
  const { t, i18n } = useI18nTranslation(namespace);

  // Hàm thay đổi ngôn ngữ
  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
  };

  // Hàm lấy ngôn ngữ hiện tại
  const getCurrentLanguage = () => {
    return i18n.language;
  };

  // Hàm dịch với thay thế biến
  const translate = (key, options) => {
    return t(key, options);
  };

  return {
    t: translate,
    changeLanguage,
    getCurrentLanguage,
  };
};
