import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { Provider as ReduxProvider } from "react-redux";

import { store } from "../store";
import { useAppSelector } from "../store/hooks";

function NavigationWrapper() {
  const mode = useAppSelector((state) => state.theme.mode);
  const system = useColorScheme() ?? "light";
  const resolvedMode = mode === "light" || mode === "dark" ? mode : system;

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
    <ReduxProvider store={store}>
      <NavigationWrapper />
    </ReduxProvider>
  );
}
