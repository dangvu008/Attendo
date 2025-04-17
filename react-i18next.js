/**
 * File này cung cấp các API giả lập cho react-i18next
 * để tương thích với code hiện tại mà không cần thay đổi nhiều
 */

import React from "react";
import { useLocalization } from "./localization";
import Trans from "./Trans";
import TransWithoutContext from "./TransWithoutContext";

// Giả lập useTranslation hook từ react-i18next
export const useTranslation = (namespace) => {
  const { t, changeLanguage, getCurrentLanguage } = useLocalization();

  return {
    t,
    i18n: {
      language: getCurrentLanguage(),
      changeLanguage,
      // Thêm các phương thức giả lập khác nếu cần
      hasResourceBundle: () => true,
      addResourceBundle: () => {},
    },
  };
};

// Export Trans components
export { Trans, TransWithoutContext };

// Giả lập withTranslation HOC
export const withTranslation = (namespace) => (Component) => {
  return (props) => {
    const { t, i18n } = useTranslation(namespace);
    return <Component t={t} i18n={i18n} {...props} />;
  };
};

// Giả lập Translation component
export const Translation = ({ children }) => {
  const { t, i18n } = useTranslation();
  return children({ t, i18n });
};

// Giả lập I18nextProvider
export const I18nextProvider = ({ i18n, children }) => {
  return children;
};

// Export default để tương thích với import * as reactI18next
export default {
  useTranslation,
  withTranslation,
  Trans,
  TransWithoutContext,
  Translation,
  I18nextProvider,
};
