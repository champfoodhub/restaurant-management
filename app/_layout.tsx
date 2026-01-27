import { Ionicons } from "@expo/vector-icons";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, useColorScheme, View } from "react-native";
import { Provider as ReduxProvider } from "react-redux";

import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import ProfileModal from "../components/ProfileModal";
import { AppConfig } from "../config/config";
import useSafeNavigation from "../hooks/useSafeNavigation";
import { store } from "../store";
import { clearUserFromStorage, loadUserFromStorage, logout } from "../store/authSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { getTheme } from "../theme";

// Memoized ProfileIcon to prevent re-creation on every render
// This fixes the "specified child already has a parent" Android crash
const ProfileIcon = memo(function ProfileIcon({ 
  isLoggedIn, 
  onPress, 
  theme 
}: { 
  isLoggedIn: boolean; 
  onPress: () => void; 
  theme: any;
}) {
  return (
    <Pressable 
      onPress={onPress} 
      style={({ pressed }) => [
        styles.profileIconContainer,
        pressed && { opacity: 0.7 }
      ]}
    >
      <View style={[styles.profileIcon, { backgroundColor: theme.primary }]}>
        <Ionicons name="person" size={20} color="#FFF" />
      </View>
    </Pressable>
  );
});

// Stable header right component - prevents ScreenStackHeaderConfig crash
const HeaderRight = memo(function HeaderRight({ 
  isLoggedIn, 
  onPress, 
  theme 
}: { 
  isLoggedIn: boolean; 
  onPress: () => void; 
  theme: any;
}) {
  return <ProfileIcon isLoggedIn={isLoggedIn} onPress={onPress} theme={theme} />;
});

function NavigationWrapper() {
  const { safeReplace } = useSafeNavigation(200);
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.theme.mode);
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
  const user = useAppSelector((state) => state.auth.user);
  const system = useColorScheme() ?? "light";
  const resolvedMode = mode === "light" || mode === "dark" ? mode : system;

  const theme = useMemo(() => getTheme(AppConfig.flavor, resolvedMode), [AppConfig.flavor, resolvedMode]);
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  // Load user from storage on app start
  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  const handleLogout = useCallback(async () => {
    await dispatch(clearUserFromStorage());
    dispatch(logout());
    router.replace('/');
  }, [dispatch]);

  const openProfileModal = useCallback(() => {
    if (isLoggedIn) {
      setProfileModalVisible(true);
    }
  }, [isLoggedIn]);

  // Memoize header right to prevent ScreenStackHeaderConfig crash
  const headerRight = useCallback(() => (
    <HeaderRight 
      isLoggedIn={isLoggedIn} 
      onPress={openProfileModal} 
      theme={theme} 
    />
  ), [isLoggedIn, openProfileModal, theme]);

  return (
    <ThemeProvider
      value={resolvedMode === "dark" ? DarkTheme : DefaultTheme}
    >
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.background,
          },
          headerTintColor: theme.text,
          headerRight: headerRight,
          headerTitleStyle: {
            color: theme.text,
            fontWeight: "700",
          },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="order" options={{ title: "Order" }} />
        <Stack.Screen name="menu" options={{ title: "" }} />
        <Stack.Screen name="cart" options={{ title: "Cart" }} />
      </Stack>

      <StatusBar
        style={resolvedMode === "dark" ? "light" : "dark"}
      />

      <ProfileModal
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
        user={user}
        onLogout={handleLogout}
        theme={theme}
      />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  profileIconContainer: {
    padding: 4,
  },
  profileIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default function RootLayout() {
  return (
    <ReduxProvider store={store}>
      <NavigationWrapper />
    </ReduxProvider>
  );
}



