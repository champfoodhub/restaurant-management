import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";

import { AppConfig } from "../config/config";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { toggleTheme } from "../store/themeSlice";
import { getTheme } from "../theme";

export default function Home() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.theme.mode);
  const system = useColorScheme() ?? "light";
  const resolvedMode = mode === "light" || mode === "dark" ? mode : system;

  const theme = getTheme(AppConfig.flavor, resolvedMode);

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
            onPress={() => router.push("/order")}
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
