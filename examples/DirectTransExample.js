import React, { useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useTranslation } from "../i18n/snack-useTranslation";
import { Trans } from "react-i18next"; // Import trực tiếp từ react-i18next

const DirectTransExample = () => {
  const { t, changeLanguage, getCurrentLanguage } = useTranslation();
  const [language, setLanguage] = useState(getCurrentLanguage());

  const toggleLanguage = () => {
    const newLanguage = language === "en" ? "vi" : "en";
    changeLanguage(newLanguage);
    setLanguage(newLanguage);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("common.appName")}</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("home.todayShifts")}</Text>
        <Text>{t("home.noShiftsToday")}</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("settings.settings")}</Text>
        <Text>{t("settings.language")}: {language === "en" ? "English" : "Tiếng Việt"}</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trans Component Example:</Text>
        <Trans i18nKey="home.welcomeMessage">
          Welcome to <Text style={styles.highlight}>Workly</Text>, your personal shift management app!
        </Trans>
      </View>
      
      <Button
        title={language === "en" ? "Switch to Vietnamese" : "Chuyển sang tiếng Anh"}
        onPress={toggleLanguage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  section: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: "white",
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#4A6572",
  },
  highlight: {
    fontWeight: "bold",
    color: "#4A6572",
  },
});

export default DirectTransExample;
