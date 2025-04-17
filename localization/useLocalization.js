import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { languages } from './languages';
import { STORAGE_KEYS } from '../constants/storage';

// Hook đơn giản để sử dụng đa ngôn ngữ
export const useLocalization = () => {
  const [currentLanguage, setCurrentLanguage] = useState('vi');
  const [isLoaded, setIsLoaded] = useState(false);

  // Tải ngôn ngữ từ AsyncStorage khi khởi động
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const userSettings = await AsyncStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
        if (userSettings) {
          const { language } = JSON.parse(userSettings);
          if (language && languages[language]) {
            setCurrentLanguage(language);
          }
        }
      } catch (error) {
        console.error('Error loading language:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadLanguage();
  }, []);

  // Thay đổi ngôn ngữ và lưu vào AsyncStorage
  const changeLanguage = useCallback(async (language) => {
    if (languages[language]) {
      setCurrentLanguage(language);
      
      try {
        const userSettings = await AsyncStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
        const settings = userSettings ? JSON.parse(userSettings) : {};
        settings.language = language;
        await AsyncStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(settings));
      } catch (error) {
        console.error('Error saving language setting:', error);
      }
    }
  }, []);

  // Hàm dịch với thay thế biến
  const t = useCallback((key, params = {}) => {
    const translations = languages[currentLanguage] || languages.vi;
    let text = translations[key] || key;
    
    // Thay thế các biến trong chuỗi
    Object.keys(params).forEach(param => {
      text = text.replace(new RegExp(`{${param}}`, 'g'), params[param]);
    });
    
    return text;
  }, [currentLanguage]);

  // Hàm lấy ngôn ngữ hiện tại
  const getCurrentLanguage = useCallback(() => {
    return currentLanguage;
  }, [currentLanguage]);

  return {
    t,
    changeLanguage,
    getCurrentLanguage,
    isLoaded,
  };
};
