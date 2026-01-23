import { Pressable, Text, View } from "react-native";
import { AppConfig } from "../config/config";
import { useThemeMode } from "../context/ThemeContext";
import { getTheme } from "../theme";

export default function OrderPage() {
  const { mode, toggle } = useThemeMode();
  const flavor = AppConfig.flavor;
  const theme = getTheme(flavor, mode);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background, padding: 20 }}>
      <Pressable
        onPress={toggle}
        style={{
          alignSelf: "flex-end",
          marginBottom: 20,
          padding: 8,
          backgroundColor: theme.primary,
          borderRadius: 20,
        }}
      >
        <Text style={{ color: theme.text }}>
          {mode === "dark" ? "🌙" : "☀️"}
        </Text>
      </Pressable>

      <Text style={{ color: theme.text, fontSize: 24, marginBottom: 16 }}>
        Menu
      </Text>

      {["Burger", "Pizza", "Pasta"].map((item) => (
        <Text
          key={item}
          style={{
            color: theme.primary,
            fontSize: 18,
            marginBottom: 10,
          }}
        >
          • {item}
        </Text>
      ))}
    </View>
  );
}
