import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import { useLocalization } from '../localization';
import { LocalizedText, RichLocalizedText } from '../localization';

const TranslationExample = () => {
  const { t, changeLanguage, getCurrentLanguage } = useLocalization();
  const [language, setLanguage] = useState(getCurrentLanguage());

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'vi' : 'en';
    changeLanguage(newLanguage);
    setLanguage(newLanguage);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{t('appName')}</Text>
      
      <View style={styles.section}>
        <LocalizedText textKey="todayShifts" style={styles.sectionTitle} />
        <LocalizedText textKey="noShiftsToday" />
      </View>
      
      <View style={styles.section}>
        <LocalizedText textKey="settings" style={styles.sectionTitle} />
        <Text>
          {t('language')}: {language === 'en' ? 'English' : 'Tiếng Việt'}
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rich Text Example:</Text>
        <RichLocalizedText 
          textKey="welcomeMessage"
          components={[
            { 
              tag: 'app', 
              component: <Text style={styles.highlight}>Workly</Text> 
            }
          ]}
        />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Parameters Example:</Text>
        <LocalizedText 
          textKey="weatherAlert" 
          params={{ temperature: 28, condition: 'Sunny' }}
        />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Working with Time:</Text>
        <LocalizedText 
          textKey="workingFor" 
          params={{ duration: '2h 30m' }}
        />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shift Information:</Text>
        <LocalizedText 
          textKey="shiftStartingSoon" 
          params={{ name: 'Morning Shift', minutes: 15 }}
        />
      </View>
      
      <Button
        title={language === 'en' ? 'Switch to Vietnamese' : 'Chuyển sang tiếng Anh'}
        onPress={toggleLanguage}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#4A6572',
  },
  highlight: {
    fontWeight: 'bold',
    color: '#4A6572',
  },
});

export default TranslationExample;
