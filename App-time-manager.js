"use client";

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LocalizationProvider } from './localization';
import TimeManagerHomeScreen from './screens/TimeManagerHomeScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <LocalizationProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              cardStyle: { backgroundColor: '#0a0e17' }
            }}
          >
            <Stack.Screen name="TimeManagerHome" component={TimeManagerHomeScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </LocalizationProvider>
    </SafeAreaProvider>
  );
}
