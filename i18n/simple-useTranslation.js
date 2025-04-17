import { useTranslation as useI18nTranslation } from "react-i18next";
import { changeLanguage, getCurrentLanguage } from "./simple-i18n";

// Hook đơn giản hóa cho Snack.expo.dev
export const useTranslation = () => {
  const { t } = useI18nTranslation();

  return {
    t,
    changeLanguage,
    getCurrentLanguage,
  };
};
