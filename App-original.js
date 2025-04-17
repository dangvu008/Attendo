"use client";

import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AppProvider } from "./context/AppContext";
import HomeScreen from "./screens/HomeScreen";
import ShiftListScreen from "./screens/ShiftListScreen";
import ShiftDetailScreen from "./screens/ShiftDetailScreen";
import SettingsScreen from "./screens/SettingsScreen";
import CheckInOutScreen from "./screens/CheckInOutScreen";
import WeatherScreen from "./screens/WeatherScreen";
import BackupRestoreScreen from "./screens/BackupRestoreScreen";
import NotesScreen from "./screens/NotesScreen";
import { COLORS } from "./constants/colors";
import { LocalizationProvider } from "./localization";
import { useLocalization } from "./localization";
import * as SplashScreen from "expo-splash-screen";
import AnimatedSplashScreen from "./components/AnimatedSplashScreen";
import TranslationDemoScreen from "./screens/TranslationDemoScreen";
import { ThemeProvider, useTheme } from "./context/ThemeContext";

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might trigger some race conditions, ignore them */
});

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Component tạm thời hiển thị khi đang tải i18n
const LoadingScreen = () => (
  <View
    style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: COLORS.background,
    }}
  >
    <ActivityIndicator size="large" color={COLORS.primary} />
    <Text style={{ marginTop: 16, color: COLORS.darkGray }}>
      Đang tải ứng dụng...
    </Text>
  </View>
);

// Stack Navigator cho Home
const HomeStack = () => {
  const { t } = useLocalization();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ title: t("appName") }}
      />
      <Stack.Screen
        name="CheckInOut"
        component={CheckInOutScreen}
        options={{
          title: `${t("checkIn")} / ${t("checkOut")}`,
        }}
      />
    </Stack.Navigator>
  );
};

// Stack Navigator cho Shifts
const ShiftsStack = () => {
  const { t } = useLocalization();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="ShiftList"
        component={ShiftListScreen}
        options={{ title: t("shiftList") }}
      />
      <Stack.Screen
        name="ShiftDetail"
        component={ShiftDetailScreen}
        options={({ route }) => ({
          title: route.params?.isNew
            ? t("addShift")
            : t("shiftDetails"),
        })}
      />
    </Stack.Navigator>
  );
};

// Stack Navigator cho Settings
const SettingsStack = () => {
  const { t } = useLocalization();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="SettingsScreen"
        component={SettingsScreen}
        options={{ title: t("settings") }}
      />
      <Stack.Screen
        name="BackupRestore"
        component={BackupRestoreScreen}
        options={{ title: t("backupRestore") }}
      />
      <Stack.Screen
        name="TranslationDemo"
        component={TranslationDemoScreen}
        options={{ title: t("language") }}
      />
    </Stack.Navigator>
  );
};

// Tab Navigator
const TabNavigator = () => {
  const { t } = useLocalization();
  const { isDarkMode } = useTheme();

  return (
    <>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.gray,
          tabBarStyle: {
            backgroundColor: COLORS.white,
            borderTopWidth: 1,
            borderTopColor: COLORS.lightGray,
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
          },
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeStack}
          options={{
            tabBarLabel: t("appName"),
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Shifts"
          component={ShiftsStack}
          options={{
            tabBarLabel: t("shiftList"),
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="work" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Notes"
          component={NotesScreen}
          options={{
            tabBarLabel: t("notes"),
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="note" size={size} color={color} />
            ),
            headerStyle: {
              backgroundColor: COLORS.primary,
            },
            headerTintColor: COLORS.white,
            headerTitleStyle: {
              fontWeight: "bold",
            },
            headerShown: true,
            title: t("notes"),
          }}
        />
        <Tab.Screen
          name="Weather"
          component={WeatherScreen}
          options={{
            tabBarLabel: t("weather"),
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="cloud" size={size} color={color} />
            ),
            headerStyle: {
              backgroundColor: COLORS.primary,
            },
            headerTintColor: COLORS.white,
            headerTitleStyle: {
              fontWeight: "bold",
            },
            headerShown: true,
            title: t("weather"),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsStack}
          options={{
            tabBarLabel: t("settings"),
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="settings" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </>
  );
};

// Component chính sau khi đã tải i18n
const AppWithNavigation = () => {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true);

  useEffect(() => {
    // When app is ready, we can show our animated splash screen
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  const onAnimationComplete = () => {
    setShowAnimatedSplash(false);
  };

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LocalizationProvider>
          <AppProvider>
            <NavigationContainer>
              {showAnimatedSplash ? (
                <AnimatedSplashScreen
                  onAnimationComplete={onAnimationComplete}
                />
              ) : null}
              <TabNavigator />
            </NavigationContainer>
          </AppProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

// Component gốc của ứng dụng
export default function App() {
  const [i18nInitialized, setI18nInitialized] = useState(false);
  const [initError, setInitError] = useState(null);
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    // Khởi tạo i18n và prepare app
    const prepare = async () => {
      try {
        // No need to initialize i18n, LocalizationProvider handles it
        setI18nInitialized(true);

        // Simulate some loading time for resources
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // App is ready
        setAppIsReady(true);
      } catch (error) {
        console.error("Error initializing app:", error);
        setInitError(error.message);
        // Still set initialized to avoid infinite loading
        setI18nInitialized(true);
        setAppIsReady(true);
      }
    };

    prepare();
  }, []);

  // Hiển thị màn hình loading khi đang khởi tạo i18n
  if (!i18nInitialized) {
    return <LoadingScreen />;
  }

  // Hiển thị thông báo lỗi nếu có
  if (initError) {
    console.warn("App initialized with errors:", initError);
  }

  // Hiển thị ứng dụng sau khi đã khởi tại
  return <AppWithNavigation />;
}
