import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  FlatList,
  Pressable, // ✅ REQUIRED
  StyleSheet,
  Text,
  View
} from "react-native";
;


import { AppConfig } from "../config/config";
import { useCart } from "../context/CartContext";
import { useThemeMode } from "../context/ThemeContext";
import { getTheme } from "../theme";

const MENU = [
  { id: "1", name: "Margherita Pizza", price: 249 },
  { id: "2", name: "Pasta Alfredo", price: 299 },
  { id: "3", name: "Veg Supreme Burger", price: 199 },
  { id: "4", name: "Loaded Fries", price: 179 },
];

export default function OrderPage() {
  const { items, addItem, removeItem } = useCart();
  const { resolvedMode } = useThemeMode();
  const router = useRouter();

  const theme = getTheme(AppConfig.flavor, resolvedMode);

  const totalItems = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={MENU}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item }) => {
          const qty =
            items.find((i) => i.id === item.id)?.quantity ?? 0;

          return (
            <LinearGradient colors={theme.card} style={styles.card}>
              <View>
                <Text style={[styles.name, { color: theme.text }]}>
                  {item.name}
                </Text>

                <Text style={[styles.price, { color: theme.primary }]}>
                  ₹{item.price}
                </Text>
              </View>

              <View style={styles.controls}>
                <Pressable
                  onPress={() => removeItem(item.id)}
                  style={[
                    styles.circle,
                    { backgroundColor: theme.primary, opacity: qty === 0 ? 0.3 : 1 },
                  ]}
                >
                  <Text style={styles.controlText}>−</Text>
                </Pressable>

                <Text style={[styles.qty, { color: theme.text }]}>
                  {qty}
                </Text>

                <Pressable
                  onPress={() => addItem(item)}
                  style={[
                    styles.circle,
                    { backgroundColor: theme.primary },
                  ]}
                >
                  <Text style={styles.controlText}>+</Text>
                </Pressable>
              </View>
            </LinearGradient>
          );
        }}
      />

      {totalItems > 0 && (
        <Pressable onPress={() => router.push("/cart")}>
          <LinearGradient
            colors={[theme.primary, theme.accent]}
            style={styles.cartBar}
          >
            <Text style={styles.cartText}>
              {totalItems} item{totalItems > 1 ? "s" : ""} added
            </Text>
            <Text style={styles.cartCTA}>View Cart →</Text>
          </LinearGradient>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  price: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: "600",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  controlText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: -2,
  },
  qty: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: "bold",
  },
  cartBar: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  cartText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cartCTA: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
