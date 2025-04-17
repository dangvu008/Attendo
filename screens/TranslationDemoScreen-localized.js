import React from 'react';
import { View, StyleSheet } from 'react-native';
import TranslationExample from '../components/TranslationExample-localized';

const TranslationDemoScreen = () => {
  return (
    <View style={styles.container}>
      <TranslationExample />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default TranslationDemoScreen;
