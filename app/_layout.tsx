import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { CartProvider } from "../context/CartContext";
import { ThemeModeProvider, useThemeMode } from "../context/ThemeContext";

function NavigationWrapper() {
  const { resolvedMode } = useThemeMode();

  return (
    <ThemeProvider
      value={resolvedMode === "dark" ? DarkTheme : DefaultTheme}
    >
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="order" options={{ title: "Menu" }} />
        <Stack.Screen name="cart" options={{ title: "Cart" }} />
      </Stack>

      <StatusBar
        style={resolvedMode === "dark" ? "light" : "dark"}
      />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeModeProvider>
      <CartProvider>
        <NavigationWrapper />
      </CartProvider>
    </ThemeModeProvider>
  );
}
