import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { MaterialIcons } from "@expo/vector-icons";
import { AppProvider } from "./context/AppContext";
import { ThemeProvider } from "./context/ThemeContext";
import HomeScreen from "./screens/HomeScreen";
import ShiftsScreen from "./screens/ShiftsScreen";
import ShiftDetailScreen from "./screens/ShiftDetailScreen";
import SettingsScreen from "./screens/SettingsScreen";
import WeatherScreen from "./screens/WeatherScreen";
import BackupRestoreScreen from "./screens/BackupRestoreScreen";
import NotesScreen from "./screens/NotesScreen";
import { COLORS } from "./constants/colors";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./i18n/translations/en";
import vi from "./i18n/translations/vi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "./constants/storage";
import * as SplashScreen from "expo-splash-screen";
import AnimatedSplashScreen from "./components/AnimatedSplashScreen";

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

// Hàm đơn giản để khởi tạo ngôn ngữ từ AsyncStorage
const initLanguage = async () => {
  try {
    const userSettings = await AsyncStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
    if (userSettings) {
      const { language } = JSON.parse(userSettings);
      if (language) {
        i18next.changeLanguage(language);
      }
    }
  } catch (error) {
    console.error("Error initializing language:", error);
  }
};

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack navigator cho màn hình Shifts
const ShiftsStackNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: COLORS.primary,
      },
      headerTintColor: COLORS.white,
    }}
  >
    <Stack.Screen name="ShiftsList" component={ShiftsScreen} options={{ title: "Shifts" }} />
    <Stack.Screen
      name="ShiftDetail"
      component={ShiftDetailScreen}
      options={({ route }) => ({
        title: route.params?.shiftId ? "Edit Shift" : "Add Shift",
      })}
    />
  </Stack.Navigator>
);

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Giữ splash screen hiển thị
        await SplashScreen.preventAutoHideAsync();
        
        // Khởi tạo ngôn ngữ
        await initLanguage();
        
        // Đánh dấu đã tải xong
        setIsLoading(false);
        
        // Cho phép ẩn splash screen
        await SplashScreen.hideAsync();
      } catch (error) {
        console.error("Initialization error:", error);
        setIsLoading(false);
        await SplashScreen.hideAsync();
      }
    };

    initialize();
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (showSplash) {
    return <AnimatedSplashScreen onAnimationComplete={handleSplashComplete} />;
  }

  return (
    <ThemeProvider>
      <AppProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;

                if (route.name === "Home") {
                  iconName = "home";
                } else if (route.name === "Shifts") {
                  iconName = "event";
                } else if (route.name === "Notes") {
                  iconName = "note";
                } else if (route.name === "Weather") {
                  iconName = "cloud";
                } else if (route.name === "Settings") {
                  iconName = "settings";
                }

                return <MaterialIcons name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: COLORS.primary,
              tabBarInactiveTintColor: COLORS.darkGray,
            })}
          >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Shifts" component={ShiftsStackNavigator} options={{ headerShown: false }} />
            <Tab.Screen name="Notes" component={NotesScreen} />
            <Tab.Screen name="Weather" component={WeatherScreen} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </AppProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#4A6572",
  },
});
