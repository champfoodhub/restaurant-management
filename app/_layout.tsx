import { Ionicons } from "@expo/vector-icons";
import { DarkTheme, DefaultTheme, ThemeProvider, useNavigation } from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text, useColorScheme, View } from "react-native";
import { Provider as ReduxProvider } from "react-redux";

import { useEffect } from "react";
import { AppConfig } from "../config/config";
import { store } from "../store";
import { clearUserFromStorage, loadUserFromStorage, logout } from "../store/authSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { getTheme } from "../theme";

function NavigationWrapper() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const router = useRouter();
  const mode = useAppSelector((state) => state.theme.mode);
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
  const system = useColorScheme() ?? "light";
  const resolvedMode = mode === "light" || mode === "dark" ? mode : system;

  const theme = getTheme(AppConfig.flavor, resolvedMode);

  // Load user from storage on app start
  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  const handleLogout = async () => {
    await dispatch(clearUserFromStorage());
    dispatch(logout());
    router.replace("/");
  };

  const ProfileIcon = () => (
    <View style={styles.profileIconContainer}>
      <View style={[styles.profileIcon, { backgroundColor: theme.primary }]}>
        <Ionicons name="person" size={20} color="#FFF" />
      </View>
      {isLoggedIn && (
        <Pressable onPress={handleLogout} style={styles.logoutButton}>
          <Text style={[styles.logoutText, { color: theme.text + "80" }]}>
            Logout
          </Text>
        </Pressable>
      )}
    </View>
  );

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
          headerRight: () => <ProfileIcon />,
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
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  profileIconContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginRight: 12,
  },
  profileIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  logoutButton: {
    marginTop: 6,
  },
  logoutText: {
    fontSize: 12,
    fontWeight: "500",
  },
});

export default function RootLayout() {
  return (
    <ReduxProvider store={store}>
      <NavigationWrapper />
    </ReduxProvider>
  );
}

