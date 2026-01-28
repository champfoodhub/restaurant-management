import { LinearGradient } from "expo-linear-gradient";
import React, { memo, useCallback, useMemo } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { hasPermission, isBranch, isHQ, isUser } from "../config/accessControl";
import { MenuItem as ConfigMenuItem, SeasonalMenu } from "../config/config";
import { addItem, removeItem } from "../store/cartSlice";
import { useAppDispatch } from "../store/hooks";
import { selectAllStockItems, toggleStockStatus } from "../store/stockSlice";

// Stock toggle helper - defined outside component to prevent recreation
const handleStockToggle = (
  dispatch: ReturnType<typeof useAppDispatch>,
  itemId: string,
  itemName: string,
  currentStatus: boolean
) => {
  void dispatch(
    toggleStockStatus({
      menuItemId: itemId,
      menuItemName: itemName,
      currentStatus,
    })
  );
};

interface MenuItemCardProps {
  item: ConfigMenuItem;
  items: { id: string; quantity: number }[];
  stockItems: ReturnType<typeof selectAllStockItems>;
  seasonalMenus: SeasonalMenu[];
  theme: any;
  onDelete?: (id: string) => void;
}

// Memoized MenuItemCard to prevent unnecessary re-renders
export const MenuItemCard = memo(function MenuItemCard({
  item,
  items,
  stockItems,
  seasonalMenus,
  theme,
  onDelete,
}: MenuItemCardProps) {
  const dispatch = useAppDispatch();
  
  // Memoize cart item lookup
  const cartItem = useMemo(() => items.find((i) => i.id === item.id), [items, item.id]);
  const qty = cartItem?.quantity ?? 0;
  
  // Memoize stock status lookup
  const stockStatus = useMemo(() => {
    if (isUser()) return { inStock: true };
    const stock = stockItems.find((s) => s.menuItemId === item.id);
    return stock || { inStock: true };
  }, [stockItems, item.id]);
  
  const isInStock = stockStatus.inStock;
  
  // Memoize permission checks
  const { canManageStock, canManageMenu } = useMemo(() => ({
    canManageStock: isBranch() && hasPermission("stock:manage"),
    canManageMenu: isHQ() && hasPermission("menu:delete"),
  }), []);
  
  // Memoize seasonal menu name lookup
  const seasonalMenuName = useMemo(() => {
    if (!item.seasonalMenuId) return null;
    return seasonalMenus.find((m) => m.id === item.seasonalMenuId)?.name || "Seasonal";
  }, [item.seasonalMenuId, seasonalMenus]);
  
  // Memoize handlers to prevent re-creation on each render
  const handleAddItem = useCallback(() => {
    dispatch(addItem({ id: item.id, name: item.name, price: item.price }));
  }, [dispatch, item.id, item.name, item.price]);
  
  const handleRemoveItem = useCallback(() => {
    dispatch(removeItem(item.id));
  }, [dispatch, item.id]);
  
  const handleDelete = useCallback(() => {
    onDelete?.(item.id);
  }, [onDelete, item.id]);
  
  const handleStockToggleCallback = useCallback(() => {
    handleStockToggle(dispatch, item.id, item.name, isInStock);
  }, [dispatch, item.id, item.name, isInStock]);
  
  // Determine text color with opacity safely
  const textSecondaryColor = useMemo(() => {
    if (theme.text && theme.text.startsWith('#')) {
      return theme.text + "80";
    }
    return theme.text;
  }, [theme.text]);
  
  const textMutedColor = useMemo(() => {
    if (theme.text && theme.text.startsWith('#')) {
      return theme.text + "60";
    }
    return theme.text;
  }, [theme.text]);

  return (
    <LinearGradient colors={theme.card as [string, string, ...string[]]} style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />

      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text style={[styles.itemName, { color: theme.text }]}>{item.name}</Text>
          {seasonalMenuName && (
            <View style={[styles.seasonalBadge, { backgroundColor: theme.primary }]}>
              <Text style={styles.seasonalBadgeText}>{seasonalMenuName}</Text>
            </View>
          )}
        </View>

        <Text style={[styles.itemDesc, { color: textSecondaryColor }]}>
          {item.description}
        </Text>

        <View style={styles.row}>
          <View>
            <Text style={[styles.itemPrice, { color: theme.accent }]}>
              ₹{item.price.toFixed(2)}
            </Text>
            {item.basePrice !== item.price && isHQ() && (
              <Text style={[styles.basePrice, { color: textMutedColor }]}>
                Base: ₹{item.basePrice.toFixed(2)}
              </Text>
            )}
          </View>

          {/* Add/Remove controls */}
          {isUser() && isInStock && (
            <>
              {qty === 0 ? (
                <Pressable
                  onPress={handleAddItem}
                  style={[styles.addButton, { backgroundColor: theme.primary }]}
                >
                  <Text style={styles.addText}>+ Add</Text>
                </Pressable>
              ) : (
                <View style={styles.controls}>
                  <Pressable
                    onPress={handleRemoveItem}
                    style={[styles.circle, { backgroundColor: theme.primary }]}
                  >
                    <Text style={styles.controlText}>−</Text>
                  </Pressable>
                  <Text style={[styles.qty, { color: theme.text }]}>{qty}</Text>
                  <Pressable
                    onPress={handleAddItem}
                    style={[styles.circle, { backgroundColor: theme.primary }]}
                  >
                    <Text style={styles.controlText}>+</Text>
                  </Pressable>
                </View>
              )}
            </>
          )}

          {/* Delete button for HQ */}
          {canManageMenu && onDelete && (
            <Pressable
              onPress={handleDelete}
              style={[styles.deleteButton, { backgroundColor: "#EF4444" }]}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          )}
        </View>

        {/* Stock indicator and toggle */}
        {canManageStock && (
          <View style={styles.stockControlsContainer}>
            <View
              style={[
                styles.stockIndicator,
                { backgroundColor: isInStock ? "#10B981" : "#EF4444" },
              ]}
            >
              <Text style={styles.stockText}>
                {isInStock ? "In Stock" : "Out of Stock"}
              </Text>
            </View>
            <Switch
              value={isInStock}
              onValueChange={handleStockToggleCallback}
              trackColor={{ false: "#767577", true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        )}
      </View>
    </LinearGradient>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    flexDirection: "row",
    elevation: 2,
  },
  stockControlsContainer: {
    position: "absolute",
    bottom: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stockIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  stockText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "600",
  },
  itemImage: {
    width: 90,
    height: 90,
    borderRadius: 10,
  },
  itemContent: {
    flex: 1,
    paddingLeft: 14,
    justifyContent: "center",
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
    flex: 1,
  },
  itemDesc: {
    fontSize: 13,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: "700",
  },
  basePrice: {
    fontSize: 12,
    textDecorationLine: "line-through",
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
  deleteButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  deleteText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 12,
  },
  seasonalBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  seasonalBadgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "600",
  },
});
