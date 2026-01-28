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
import useSafeNavigation from "../hooks/useSafeNavigation";
import { loadUserFromStorage } from "../store/authSlice";
import { Flavor, loadFlavorFromStorage, saveFlavorToStorage, setFlavor } from "../store/flavorSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { toggleTheme } from "../store/themeSlice";
import { getTheme } from "../theme";
import { Loggers } from "../utils/logger";

// Flavor options
const FLAVOR_OPTIONS: { id: Flavor; name: string; description: string; color: string }[] = [
  { 
    id: "HQ", 
    name: "Headquarters", 
    description: "Manage menus & pricing",
    color: "#7C3AED"
  },
  { 
    id: "USER", 
    name: "Customer", 
    description: "Browse & order food",
    color: "#E11D48"
  },
  { 
    id: "BRANCH", 
    name: "Branch", 
    description: "Manage stock & orders",
    color: "#2563EB"
  },
];

export default function Home() {
  const { safeReplace, safePush } = useSafeNavigation(200);
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.theme.mode);
  const flavor = useAppSelector((state) => state.flavor.currentFlavor);
  const flavorLoading = useAppSelector((state) => state.flavor.loading);
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
  const loading = useAppSelector((state) => state.auth.loading);
  const system = useColorScheme() ?? "light";
  const resolvedMode = mode === "light" || mode === "dark" ? mode : system;

  const theme = getTheme(flavor, resolvedMode);

  // Load user from storage and redirect if logged in
  useEffect(() => {
    Loggers.auth.info("App started, loading user from storage");
    dispatch(loadUserFromStorage());
    // Load saved flavor
    dispatch(loadFlavorFromStorage());
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

  const handleFlavorChange = (newFlavor: Flavor) => {
    dispatch(setFlavor(newFlavor));
    dispatch(saveFlavorToStorage(newFlavor));
    Loggers.flavor.info(`Flavor changed to ${newFlavor}`, { newFlavor });
  };

  if (loading || flavorLoading) {
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

          {/* Flavor Selector */}
          <View style={styles.flavorSelector}>
            <Text style={[styles.flavorLabel, { color: "#FFF" }]}>
              Select Mode:
            </Text>
            <View style={styles.flavorButtons}>
              {FLAVOR_OPTIONS.map((option) => (
                <Pressable
                  key={option.id}
                  onPress={() => handleFlavorChange(option.id)}
                  style={[
                    styles.flavorButton,
                    { 
                      backgroundColor: flavor === option.id ? option.color : "rgba(255,255,255,0.15)",
                      borderColor: flavor === option.id ? option.color : "rgba(255,255,255,0.3)",
                    },
                  ]}
                >
                  <Text style={[
                    styles.flavorButtonText,
                    { color: flavor === option.id ? "#FFF" : "rgba(255,255,255,0.7)" },
                  ]}>
                    {option.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

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
  flavorSelector: {
    marginTop: 24,
  },
  flavorLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    opacity: 0.8,
  },
  flavorButtons: {
    flexDirection: "row",
    gap: 8,
  },
  flavorButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  flavorButtonText: {
    fontSize: 14,
    fontWeight: "600",
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

