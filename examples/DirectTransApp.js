import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../i18n/translations/en";
import vi from "../i18n/translations/vi";
import DirectTransExample from './DirectTransExample';

// Khởi tạo i18next trực tiếp
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

export default function DirectTransApp() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A6572" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return <DirectTransExample />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#4A6572',
  },
});
