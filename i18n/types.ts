import 'react-i18next';
import common from './translations/en/common';
import home from './translations/en/home';
import settings from './translations/en/settings';
import shifts from './translations/en/shifts';
import alarm from './translations/en/alarm';

// Define the structure of your translation resources
declare module 'react-i18next' {
  interface CustomTypeOptions {
    // Custom namespace type mapping
    resources: {
      common: typeof common;
      home: typeof home;
      settings: typeof settings;
      shifts: typeof shifts;
      alarm: typeof alarm;
    };
    // Other custom options
    defaultNS: 'common';
    // Disable the fallback warning
    returnNull: false;
  }
}

// Define the structure of your translation keys
export type TranslationKeys = {
  common: typeof common;
  home: typeof home;
  settings: typeof settings;
  shifts: typeof shifts;
  alarm: typeof alarm;
};

// Helper type to get all possible translation keys with dot notation
export type TranslationKey = 
  | keyof TranslationKeys['common'] 
  | `common.${keyof TranslationKeys['common']}`
  | `home.${keyof TranslationKeys['home']}`
  | `settings.${keyof TranslationKeys['settings']}`
  | `shifts.${keyof TranslationKeys['shifts']}`
  | `alarm.${keyof TranslationKeys['alarm']}`;
