import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";

import { useSafeNavigation } from "../hooks/useSafeNavigation";
import { addItem, clearCart, removeItem } from "../store/cartSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { toggleTheme } from "../store/themeSlice";
import { getTheme } from "../theme";
import { Loggers } from "../utils/logger";

export default function CartPage() {
  const { safeReplace, safePush } = useSafeNavigation(200);
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.items);
  const mode = useAppSelector((state) => state.theme.mode);
  const flavor = useAppSelector((state) => state.flavor.currentFlavor);
  const system = useColorScheme() ?? "light";
  const resolvedMode = mode === "light" || mode === "dark" ? mode : system;

  const theme = getTheme(flavor, resolvedMode);

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (items.length === 0) {
    return (
      <View
        style={[
          styles.emptyContainer,
          { backgroundColor: theme.background },
        ]}
      >
        <Text style={[styles.emptyText, { color: theme.text }]}>
          Your cart is empty
        </Text>

        <Pressable
          onPress={() => safePush("menu")}
          style={[
            styles.backBtn,
            { backgroundColor: theme.primary },
          ]}
        >
          <Text style={styles.backText}>Browse Menu</Text>
        </Pressable>

        <Pressable
          onPress={() => dispatch(toggleTheme())}
          style={{ marginTop: 16 }}
        >
          <Text style={{ color: theme.text, opacity: 0.7 }}>
            Toggle {resolvedMode === "dark" ? "Light" : "Dark"}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 200 }}
        renderItem={({ item }) => (
          <LinearGradient
            colors={theme.card}
            style={styles.card}
          >
            <View>
              <Text style={[styles.name, { color: theme.text }]}>
                {item.name}
              </Text>
              <Text style={[styles.price, { color: theme.accent }]}>
                ₹{item.price} × {item.quantity}
              </Text>
            </View>

            <View style={styles.controls}>
              <Pressable
                onPress={() => dispatch(removeItem(item.id))}
                style={[styles.circle, { backgroundColor: theme.primary }]}
              >
                <Text style={styles.controlText}>−</Text>
              </Pressable>

              <Text style={[styles.qty, { color: theme.text }]}>
                {item.quantity}
              </Text>

              <Pressable
                onPress={() => dispatch(addItem(item))}
                style={[styles.circle, { backgroundColor: theme.primary }]}
              >
                <Text style={styles.controlText}>+</Text>
              </Pressable>
            </View>
          </LinearGradient>
        )}
      />

      {/* CHECKOUT BAR */}
      <LinearGradient
        colors={[theme.primary, theme.accent]}
        style={styles.checkoutBar}
      >
        <View>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>₹{total}</Text>
        </View>

        <View style={{ alignItems: "flex-end" }}>
          <Pressable
            onPress={() => dispatch(toggleTheme())}
            style={{ marginBottom: 8 }}
          >
            <Text style={{ color: "#FFF", opacity: 0.7, fontSize: 12 }}>
              Toggle {resolvedMode === "dark" ? "Light" : "Dark"}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              try {
                dispatch(clearCart());
                Loggers.cart.info("Cart cleared, navigating to order success");
                router.replace('/order-success');
              } catch (error) {
                Loggers.cart.error("Checkout failed", error);
              }
            }}
          >
            <Text style={styles.checkoutText}>Checkout →</Text>
          </Pressable>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 6,
  },

  name: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 4,
  },

  price: {
    fontSize: 15,
    fontWeight: "600",
  },

  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  circle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  controlText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "700",
  },

  qty: {
    fontSize: 16,
    fontWeight: "600",
    minWidth: 20,
    textAlign: "center",
  },

  checkoutBar: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 20,
  },

  totalLabel: {
    color: "#FFF",
    fontSize: 14,
    opacity: 0.85,
  },

  totalAmount: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "800",
  },

  checkoutText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "800",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
  },

  backBtn: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
  },

  backText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});

