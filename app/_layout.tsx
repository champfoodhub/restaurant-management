import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { ThemeProvider as ThemeProviderCustom, useThemeMode } from "../context/ThemeContext";

export const unstable_settings = {
  anchor: "(tabs)",
};

function NavigationWrapper() {
  const themeMode = useThemeMode();
  const resolvedMode =
    (themeMode as any).resolvedMode ?? (themeMode as any).mode ?? "light";

  return (
    <ThemeProvider value={resolvedMode === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style={resolvedMode === "dark" ? "light" : "dark"} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProviderCustom>
      <NavigationWrapper />
    </ThemeProviderCustom>
  );
}
