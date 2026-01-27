import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";

import { useEffect } from "react";
import { AppConfig } from "../config/config";
import { loadUserFromStorage } from "../store/authSlice";
import { addItem, removeItem } from "../store/cartSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { getTheme } from "../theme";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

const menuItems: MenuItem[] = [
  {
    id: "1",
    name: "Grilled Salmon",
    description: "Fresh Atlantic salmon with herbs",
    price: 24.99,
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400",
    category: "Main Course",
  },
  {
    id: "2",
    name: "Caesar Salad",
    description: "Crisp romaine with parmesan",
    price: 12.99,
    image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400",
    category: "Appetizer",
  },
  {
    id: "3",
    name: "Beef Burger",
    description: "Premium beef with cheddar",
    price: 16.99,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
    category: "Main Course",
  },
  {
    id: "4",
    name: "Margherita Pizza",
    description: "Fresh tomatoes and mozzarella",
    price: 14.99,
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400",
    category: "Main Course",
  },
  {
    id: "5",
    name: "Chocolate Lava Cake",
    description: "Warm chocolate with vanilla ice cream",
    price: 8.99,
    image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400",
    category: "Dessert",
  },
  {
    id: "6",
    name: "Spring Rolls",
    description: "Crispy vegetable rolls",
    price: 7.99,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400",
    category: "Appetizer",
  },
  {
    id: "7",
    name: "Pasta Carbonara",
    description: "Creamy pasta with bacon",
    price: 18.99,
    image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400",
    category: "Main Course",
  },
  {
    id: "8",
    name: "Tiramisu",
    description: "Classic Italian dessert",
    price: 9.99,
    image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400",
    category: "Dessert",
  },
];

export default function MenuPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.items);
  const mode = useAppSelector((state) => state.theme.mode);
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
  const system = useColorScheme() ?? "light";
  const resolvedMode = mode === "light" || mode === "dark" ? mode : system;

  const theme = getTheme(AppConfig.flavor, resolvedMode);

  // Calculate total items in cart for badge
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Ensure user is loaded
  useEffect(() => {
    dispatch(loadUserFromStorage() as any);
  }, [dispatch]);

  const renderMenuItem = ({ item }: { item: MenuItem }) => {
    const cartItem = items.find((i) => i.id === item.id);
    const qty = cartItem?.quantity ?? 0;

    return (
      <LinearGradient colors={theme.card} style={styles.card}>
        <Image source={{ uri: item.image }} style={styles.itemImage} />
        <View style={styles.itemContent}>
          <Text style={[styles.itemName, { color: theme.text }]}>{item.name}</Text>
          <Text style={[styles.itemDesc, { color: theme.text + "80" }]}>
            {item.description}
          </Text>
          <View style={styles.row}>
            <Text style={[styles.itemPrice, { color: theme.accent }]}>
              ₹{item.price}
            </Text>

            {qty === 0 ? (
              <Pressable
                onPress={() => dispatch(addItem(item))}
                style={[styles.addButton, { backgroundColor: theme.primary }]}
              >
                <Text style={styles.addText}>+ Add</Text>
              </Pressable>
            ) : (
              <View style={styles.controls}>
                <Pressable
                  onPress={() => dispatch(removeItem(item.id))}
                  style={[styles.circle, { backgroundColor: theme.primary }]}
                >
                  <Text style={styles.controlText}>−</Text>
                </Pressable>
                <Text style={[styles.qty, { color: theme.text }]}>
                  {qty}
                </Text>
                <Pressable
                  onPress={() => dispatch(addItem(item))}
                  style={[styles.circle, { backgroundColor: theme.primary }]}
                >
                  <Text style={styles.controlText}>+</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <FlatList
        data={menuItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        renderItem={renderMenuItem}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              Our Menu
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.text + "80" }]}>
              {isLoggedIn ? "Welcome back!" : "Please sign in to order"}
            </Text>
          </View>
        }
      />

      {/* Cart Floating Button */}
      <Pressable
        onPress={() => router.push("/cart")}
        style={[styles.cartButton, { backgroundColor: theme.primary }]}
      >
        {totalItems > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{totalItems}</Text>
          </View>
        )}
        <Text style={styles.cartText}>View Cart →</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: 16,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  card: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    elevation: 4,
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  itemContent: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: "center",
  },
  itemName: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  itemDesc: {
    fontSize: 13,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: "700",
  },
  addButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  addText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
  cartButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    elevation: 8,
  },
  cartText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },
});

