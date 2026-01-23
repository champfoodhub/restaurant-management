import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { AppConfig } from "../config/config";
import { useThemeMode } from "../context/ThemeContext";
import { getTheme } from "../theme";

export default function Welcome() {
  const router = useRouter();
  const { mode, toggle } = useThemeMode();

  const flavor = AppConfig.flavor;
  const theme = getTheme(flavor, mode);
  const designation = AppConfig.roles[flavor].designation;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Toggle Button */}
      <Pressable
        onPress={toggle}
        style={{
          position: "absolute",
          top: 50,
          right: 20,
          padding: 10,
          backgroundColor: theme.primary,
          borderRadius: 20,
        }}
      >
        <Text style={{ color: theme.text }}>
          {mode === "dark" ? "🌙" : "☀️"}
        </Text>
      </Pressable>

      <Text style={{ color: theme.text, fontSize: 28 }}>
        Welcome
      </Text>

      <Text
        style={{
          color: theme.primary,
          fontSize: 20,
          marginVertical: 12,
        }}
      >
        {designation}
      </Text>

      <Pressable
        onPress={() => router.push("/order")}
        style={{
          backgroundColor: theme.primary,
          paddingHorizontal: 20,
          paddingVertical: 10,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: theme.text, fontSize: 16 }}>
          Go to Orders
        </Text>
      </Pressable>
    </View>
  );
}
