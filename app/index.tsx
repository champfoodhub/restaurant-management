import { LinearGradient } from "expo-linear-gradient";
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";

import { useEffect } from "react";
import { AppConfig } from "../config/config";
import useSafeNavigation from "../hooks/useSafeNavigation";
import { loadUserFromStorage } from "../store/authSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { toggleTheme } from "../store/themeSlice";
import { getTheme } from "../theme";
import { Loggers } from "../utils/logger";

export default function Home() {
  const { safeReplace, safePush } = useSafeNavigation(200);
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.theme.mode);
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
  const loading = useAppSelector((state) => state.auth.loading);
  const system = useColorScheme() ?? "light";
  const resolvedMode = mode === "light" || mode === "dark" ? mode : system;

  const theme = getTheme(AppConfig.flavor, resolvedMode);

  // Load user from storage and redirect if logged in
  useEffect(() => {
    Loggers.auth.info("App started, loading user from storage");
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  // Redirect to menu if already logged in using safe navigation
  useEffect(() => {
    if (!loading && isLoggedIn) {
      safeReplace("menu");
    }
  }, [loading, isLoggedIn, safeReplace]);

  const handleOrderNow = () => {
    safePush("order");
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5",
        }}
        style={styles.hero}
      >
        <LinearGradient
          colors={[
            "rgba(0,0,0,0.85)",
            "rgba(0,0,0,0.55)",
            "rgba(0,0,0,0.95)",
          ]}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.heroContent}>
          <Text style={[styles.brand, { color: "#FFF" }]}>
            FoodHub
          </Text>

          <Text style={[styles.tagline, { color: theme.accent }]}>
            Fresh ingredients. Bold flavors.
          </Text>

          <Pressable
            style={[styles.cta, { backgroundColor: theme.primary }]}
            onPress={handleOrderNow}
          >
            <Text style={styles.ctaText}>Order Now</Text>
          </Pressable>

          <Pressable
            onPress={() => dispatch(toggleTheme())}
            style={{ marginTop: 12 }}
          >
            <Text style={{ color: "#FFF", opacity: 0.7 }}>
              Toggle {resolvedMode === "dark" ? "Light" : "Dark"}
            </Text>
          </Pressable>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  hero: {
    height: "100%",
    justifyContent: "flex-end",
  },
  heroContent: {
    padding: 24,
  },
  brand: {
    fontSize: 42,
    fontWeight: "800",
  },
  tagline: {
    fontSize: 18,
    marginTop: 12,
  },
  cta: {
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  ctaText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

