"use client";

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LocalizationProvider } from './localization';
import { useLocalization } from './localization';

// Import các màn hình
import TimeManagerHomeScreen from './screens/TimeManagerHomeScreen';
import ShiftListScreen from './screens/ShiftListScreen';
import ShiftDetailScreen from './screens/ShiftDetailScreen';
import NotesScreen from './screens/NotesScreen';
import SettingsScreen from './screens/SettingsScreen';
import WeatherScreen from './screens/WeatherScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack Navigator cho Shifts
const ShiftsStack = () => {
  const { t } = useLocalization();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0a0e17',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="ShiftList" 
        component={ShiftListScreen} 
        options={{ title: "Ca làm việc" }} 
      />
      <Stack.Screen 
        name="ShiftDetail" 
        component={ShiftDetailScreen} 
        options={({ route }) => ({ 
          title: route.params?.isNew ? "Thêm ca làm việc" : "Chi tiết ca làm việc" 
        })} 
      />
    </Stack.Navigator>
  );
};

// Main App Component
const AppWithTabs = () => {
  const { t } = useLocalization();
  
  return (
    <SafeAreaProvider>
      <LocalizationProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;

                if (route.name === 'Home') {
                  iconName = focused ? 'home' : 'home-outline';
                } else if (route.name === 'Shifts') {
                  iconName = focused ? 'calendar' : 'calendar-outline';
                } else if (route.name === 'Notes') {
                  iconName = focused ? 'document-text' : 'document-text-outline';
                } else if (route.name === 'Weather') {
                  iconName = focused ? 'cloud' : 'cloud-outline';
                } else if (route.name === 'Settings') {
                  iconName = focused ? 'settings' : 'settings-outline';
                }

                return <Ionicons name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: '#3498db',
              tabBarInactiveTintColor: '#95a5a6',
              tabBarStyle: {
                backgroundColor: '#1a1f2c',
                borderTopWidth: 0,
                elevation: 0,
                height: 60,
                paddingBottom: 8,
              },
              tabBarLabelStyle: {
                fontSize: 12,
              },
              headerShown: false,
            })}
          >
            <Tab.Screen 
              name="Home" 
              component={TimeManagerHomeScreen} 
              options={{ tabBarLabel: "Trang chủ" }}
            />
            <Tab.Screen 
              name="Shifts" 
              component={ShiftsStack} 
              options={{ tabBarLabel: "Ca làm việc" }}
            />
            <Tab.Screen 
              name="Notes" 
              component={NotesScreen} 
              options={{ tabBarLabel: "Ghi chú" }}
            />
            <Tab.Screen 
              name="Weather" 
              component={WeatherScreen} 
              options={{ tabBarLabel: "Thời tiết" }}
            />
            <Tab.Screen 
              name="Settings" 
              component={SettingsScreen} 
              options={{ tabBarLabel: "Cài đặt" }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </LocalizationProvider>
    </SafeAreaProvider>
  );
};

export default AppWithTabs;
