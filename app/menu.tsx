import { LinearGradient } from "expo-linear-gradient";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { hasPermission, isBranch, isHQ, isUser } from "../config/accessControl";
import { MenuItem as ConfigMenuItem } from "../config/config";
import useSafeNavigation from "../hooks/useSafeNavigation";
import { loadUserFromStorage } from "../store/authSlice";
import { addItem, removeItem } from "../store/cartSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  addMenuItem,
  addSeasonalMenu,
  assignItemToSeasonalMenu,
  deleteMenuItem,
  deleteSeasonalMenu,
  initializeMenuDatabase,
  loadMenuItems,
  loadSeasonalMenus,
  selectAllMenuItems,
  selectAllSeasonalMenus,
  selectCategories,
  selectCurrentSeasonalMenu,
  selectMenuLoading
} from "../store/menuSlice";
import {
  selectAllStockItems,
  toggleStockStatus,
} from "../store/stockSlice";
import { getTheme } from "../theme";
import { Loggers } from "../utils/logger";
import { createSeasonalMenuManager, SeasonalMenuManager } from "../utils/seasonalMenu";

// Sample menu items for initial display (fallback when no database)
const sampleMenuItems: ConfigMenuItem[] = [
  {
    id: "1",
    name: "Grilled Salmon",
    description: "Fresh Atlantic salmon with herbs",
    price: 24.99,
    basePrice: 24.99,
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400",
    category: "Main Course",
    isAvailable: true,
    inStock: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Caesar Salad",
    description: "Crisp romaine with parmesan",
    price: 12.99,
    basePrice: 12.99,
    image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400",
    category: "Appetizer",
    isAvailable: true,
    inStock: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Beef Burger",
    description: "Premium beef with cheddar",
    price: 16.99,
    basePrice: 16.99,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
    category: "Main Course",
    isAvailable: true,
    inStock: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Margherita Pizza",
    description: "Fresh tomatoes and mozzarella",
    price: 14.99,
    basePrice: 14.99,
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400",
    category: "Main Course",
    isAvailable: true,
    inStock: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "5",
    name: "Chocolate Lava Cake",
    description: "Warm chocolate with vanilla ice cream",
    price: 8.99,
    basePrice: 8.99,
    image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400",
    category: "Dessert",
    isAvailable: true,
    inStock: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "6",
    name: "Spring Rolls",
    description: "Crispy vegetable rolls",
    price: 7.99,
    basePrice: 7.99,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400",
    category: "Appetizer",
    isAvailable: true,
    inStock: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "7",
    name: "Pasta Carbonara",
    description: "Creamy pasta with bacon",
    price: 18.99,
    basePrice: 18.99,
    image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400",
    category: "Main Course",
    isAvailable: true,
    inStock: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "8",
    name: "Tiramisu",
    description: "Classic Italian dessert",
    price: 9.99,
    basePrice: 9.99,
    image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400",
    category: "Dessert",
    isAvailable: true,
    inStock: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Timeout for database initialization (5 seconds)
const DB_INIT_TIMEOUT = 5000;

// Helper function to handle stock toggle without Promise return type issues
const handleStockToggle = (
  dispatch: ReturnType<typeof useAppDispatch>,
  toggleStockStatus: typeof import("../store/stockSlice").toggleStockStatus,
  menuItemId: string,
  menuItemName: string,
  currentStatus: boolean
) => {
  void dispatch(
    toggleStockStatus({
      menuItemId,
      menuItemName,
      currentStatus,
    })
  );
};

export default function MenuPage() {
  const { safePush } = useSafeNavigation(200);
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.items);
  const mode = useAppSelector((state) => state.theme.mode);
  const flavor = useAppSelector((state) => state.flavor.currentFlavor);
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
  const system = useColorScheme() ?? "light";
  const resolvedMode = mode === "light" || mode === "dark" ? mode : system;

  // Menu state from Redux
  const menuItems = useAppSelector(selectAllMenuItems);
  const seasonalMenus = useAppSelector(selectAllSeasonalMenus);
  const currentSeasonalMenu = useAppSelector(selectCurrentSeasonalMenu);
  const loading = useAppSelector(selectMenuLoading);
  const categories = useAppSelector(selectCategories);
  const stockItems = useAppSelector(selectAllStockItems);

  const theme = getTheme(flavor, resolvedMode);

  // Local state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [showSeasonalMenuModal, setShowSeasonalMenuModal] = useState(false);
  const [showSeasonalMenuList, setShowSeasonalMenuList] = useState(false);
  const [showAddItemsModal, setShowAddItemsModal] = useState(false);
  const [selectedSeasonalMenu, setSelectedSeasonalMenu] = useState<SeasonalMenu | null>(null);
  const [itemSearchQuery, setItemSearchQuery] = useState("");
  const [seasonalMenuManager, setSeasonalMenuManager] = useState<SeasonalMenuManager | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);

  // New menu item form state
  const [newItemName, setNewItemName] = useState("");
  const [newItemDescription, setNewItemDescription] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("");

  // New seasonal menu form state
  const [seasonalName, setSeasonalName] = useState("");
  const [seasonalDescription, setSeasonalDescription] = useState("");
  const [seasonalStartDate, setSeasonalStartDate] = useState("");
  const [seasonalEndDate, setSeasonalEndDate] = useState("");
  const [seasonalStartTime, setSeasonalStartTime] = useState("12:00");
  const [seasonalEndTime, setSeasonalEndTime] = useState("23:59");

  // Calculate total items in cart for badge
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Initialize database and load data with timeout
  useEffect(() => {
    const initData = async () => {
      try {
        Loggers.menu.info("Initializing menu data...");

        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error("Database initialization timed out"));
          }, DB_INIT_TIMEOUT);
        });

        // Race between initialization and timeout
        await Promise.race([
          dispatch(initializeMenuDatabase()).unwrap(),
          timeoutPromise,
        ]);

        await dispatch(loadMenuItems()).unwrap();
        await dispatch(loadSeasonalMenus()).unwrap();
        Loggers.menu.info("Menu data loaded successfully");
        setDbError(null);
      } catch (error) {
        Loggers.menu.error("Failed to initialize menu data", error);
        setDbError("Using sample menu data - database unavailable");
        // Continue with sample data
      }
    };

    initData();
  }, [dispatch]);

  // Update seasonal menu manager when menus change
  useEffect(() => {
    if (seasonalMenus.length > 0) {
      setSeasonalMenuManager(createSeasonalMenuManager(seasonalMenus));
    }
  }, [seasonalMenus]);

  // Ensure user is loaded
  useEffect(() => {
    Loggers.auth.info("Loading user from storage");
    dispatch(loadUserFromStorage() as any);
  }, [dispatch]);

  // Get displayed menu items based on current seasonal menu
  const getDisplayedItems = useCallback(() => {
    if (currentSeasonalMenu && isHQ()) {
      return menuItems.length > 0 ? menuItems : sampleMenuItems;
    }
    if (currentSeasonalMenu) {
      const seasonalItems = menuItems.filter(
        (item) => item.seasonalMenuId === currentSeasonalMenu.id
      );
      if (seasonalItems.length > 0) return seasonalItems;
    }
    return menuItems.length > 0 ? menuItems : sampleMenuItems;
  }, [menuItems, currentSeasonalMenu]);

  // Filter by category
  const displayedItems = selectedCategory
    ? getDisplayedItems().filter((item) => item.category === selectedCategory)
    : getDisplayedItems();

  // Check if item is in stock
  const isItemInStock = useCallback(
    (itemId: string) => {
      if (isUser()) return true;
      const stockItem = stockItems.find((s) => s.menuItemId === itemId);
      return stockItem ? stockItem.inStock : true;
    },
    [stockItems]
  );

  const renderMenuItem = ({ item }: { item: ConfigMenuItem }) => {
    const cartItem = items.find((i) => i.id === item.id);
    const qty = cartItem?.quantity ?? 0;
    const inStock = isItemInStock(item.id);
    const canManageStock = isBranch() && hasPermission("stock:manage");
    const canManageMenu = isHQ() && hasPermission("menu:delete");

    return (
      <LinearGradient colors={theme.card as [string, string, ...string[]]} style={styles.card}>
        <Image source={{ uri: item.image }} style={styles.itemImage} />
        
        {/* Stock indicator for branch users */}
        {canManageStock && (
          <View style={[
            styles.stockIndicator,
            { backgroundColor: inStock ? "#10B981" : "#EF4444" }
          ]}>
            <Text style={styles.stockText}>
              {inStock ? "In Stock" : "Out of Stock"}
            </Text>
          </View>
        )}

        <View style={styles.itemContent}>
          <View style={styles.itemHeader}>
            <Text style={[styles.itemName, { color: theme.text }]}>{item.name}</Text>
            {item.seasonalMenuId && (
              <View style={[styles.seasonalBadge, { backgroundColor: theme.primary }]}>
                <Text style={styles.seasonalBadgeText}>
                  {seasonalMenus.find(m => m.id === item.seasonalMenuId)?.name || "Seasonal"}
                </Text>
              </View>
            )}
          </View>
          
          <Text style={[styles.itemDesc, { color: theme.text + "80" }]}>
            {item.description}
          </Text>
          
          <View style={styles.row}>
            <View>
              <Text style={[styles.itemPrice, { color: theme.accent }]}>
                ₹{item.price.toFixed(2)}
              </Text>
              {item.basePrice !== item.price && isHQ() && (
                <Text style={[styles.basePrice, { color: theme.text + "60" }]}>
                  Base: ₹{item.basePrice.toFixed(2)}
                </Text>
              )}
            </View>

            {/* Add/Remove controls */}
            {(isUser() || isBranch()) && inStock && (
              <>
                {qty === 0 ? (
                  <Pressable
                    onPress={() =>
                      dispatch(addItem({ id: item.id, name: item.name, price: item.price }))
                    }
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
                    <Text style={[styles.qty, { color: theme.text }]}>{qty}</Text>
                    <Pressable
                      onPress={() =>
                        dispatch(addItem({ id: item.id, name: item.name, price: item.price }))
                      }
                      style={[styles.circle, { backgroundColor: theme.primary }]}
                    >
                      <Text style={styles.controlText}>+</Text>
                    </Pressable>
                  </View>
                )}
              </>
            )}

            {/* Stock toggle for branch */}
            {canManageStock && (
              <Switch
                value={inStock}
                onValueChange={() => {
                  handleStockToggle(
                    dispatch,
                    toggleStockStatus,
                    item.id,
                    item.name,
                    inStock
                  );
                }}
                trackColor={{ false: "#767577", true: theme.primary }}
                thumbColor="#FFFFFF"
              />
            )}

            {/* Delete button for HQ */}
            {canManageMenu && (
              <Pressable
                onPress={() => dispatch(deleteMenuItem(item.id))}
                style={[styles.deleteButton, { backgroundColor: "#EF4444" }]}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </Pressable>
            )}
          </View>
        </View>
      </LinearGradient>
    );
  };

  const handleAddMenuItem = () => {
    if (!newItemName || !newItemPrice || !newItemCategory) {
      Loggers.menu.warn("Please fill all required fields");
      return;
    }

    const newItem: Omit<ConfigMenuItem, "id" | "createdAt" | "updatedAt"> = {
      name: newItemName,
      description: newItemDescription,
      price: parseFloat(newItemPrice),
      basePrice: parseFloat(newItemPrice),
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
      category: newItemCategory,
      isAvailable: true,
      inStock: true,
    };

    dispatch(addMenuItem(newItem));
    setShowAddMenuModal(false);
    setNewItemName("");
    setNewItemDescription("");
    setNewItemPrice("");
    setNewItemCategory("");
  };

  const handleAddSeasonalMenu = () => {
    if (!seasonalName || !seasonalStartDate || !seasonalEndDate) {
      Loggers.menu.warn("Please fill all required fields");
      return;
    }

    const newMenu = {
      name: seasonalName,
      description: seasonalDescription,
      startDate: seasonalStartDate,
      endDate: seasonalEndDate,
      startTime: seasonalStartTime,
      endTime: seasonalEndTime,
      isActive: true,
      items: [],
    };

    dispatch(addSeasonalMenu(newMenu));
    setShowSeasonalMenuModal(false);
    setSeasonalName("");
    setSeasonalDescription("");
    setSeasonalStartDate("");
    setSeasonalEndDate("");
  };

  // Get items not already in the selected seasonal menu
  const getAvailableItemsForSeasonalMenu = useCallback(() => {
    if (!selectedSeasonalMenu) return [];
    return menuItems.filter(
      (item) => item.seasonalMenuId !== selectedSeasonalMenu.id
    );
  }, [menuItems, selectedSeasonalMenu]);

  // Filter items by search query
  const filteredAvailableItems = useCallback(() => {
    const availableItems = getAvailableItemsForSeasonalMenu();
    if (!itemSearchQuery.trim()) return availableItems;
    return availableItems.filter(
      (item) =>
        item.name.toLowerCase().includes(itemSearchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(itemSearchQuery.toLowerCase())
    );
  }, [getAvailableItemsForSeasonalMenu, itemSearchQuery]);

  // Handle adding item to seasonal menu
  const handleAddItemToSeasonalMenu = (menuItem: ConfigMenuItem) => {
    if (!selectedSeasonalMenu) return;
    
    dispatch(
      assignItemToSeasonalMenu({
        menuItemId: menuItem.id,
        seasonalMenuId: selectedSeasonalMenu.id,
      })
    );
    
    Loggers.menu.info(`Added ${menuItem.name} to seasonal menu ${selectedSeasonalMenu.name}`);
  };

  // Open add items modal for a seasonal menu
  const openAddItemsModal = (menu: SeasonalMenu) => {
    setSelectedSeasonalMenu(menu);
    setShowAddItemsModal(true);
  };

  const renderHeaderActions = () => {
    const actions: React.ReactNode[] = [];

    if (isHQ() && hasPermission("menu:create")) {
      actions.push(
        <Pressable
          key="add"
          onPress={() => setShowAddMenuModal(true)}
          style={[styles.headerAction, { backgroundColor: theme.primary }]}
        >
          <Text style={styles.headerActionText}>+ Add</Text>
        </Pressable>
      );
    }

    return actions;
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Database Error Banner */}
      {dbError && (
        <View style={[styles.dbErrorBanner, { backgroundColor: "#FEF3C7" }]}>
          <Ionicons name="warning" size={20} color="#D97706" />
          <Text style={[styles.dbErrorText, { color: "#92400E" }]}>{dbError}</Text>
        </View>
      )}

      {/* Seasonal Menu Banner */}
      {currentSeasonalMenu && (
        <View style={[styles.seasonalBanner, { backgroundColor: theme.primary }]}>
          <Text style={styles.seasonalBannerTitle}>🎉 {currentSeasonalMenu.name}</Text>
          <Text style={styles.seasonalBannerSubtitle}>{currentSeasonalMenu.description}</Text>
          <Text style={styles.seasonalBannerTime}>
            {seasonalMenuManager?.formatTimeRange(currentSeasonalMenu.startTime, currentSeasonalMenu.endTime)}
          </Text>
        </View>
      )}

      {/* Category Filter */}
      {categories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryContainer}
          contentContainerStyle={styles.categoryContent}
        >
          <Pressable
            onPress={() => setSelectedCategory(null)}
            style={[styles.categoryChip, { backgroundColor: selectedCategory === null ? theme.primary : theme.muted }]}
          >
            <Text style={[styles.categoryText, { color: selectedCategory === null ? "#FFF" : theme.text }]}>All</Text>
          </Pressable>
          {categories.map((category) => (
            <Pressable
              key={category}
              onPress={() => setSelectedCategory(category)}
              style={[styles.categoryChip, { backgroundColor: selectedCategory === category ? theme.primary : theme.muted }]}
            >
              <Text style={[styles.categoryText, { color: selectedCategory === category ? "#FFF" : theme.text }]}>{category}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Loading menu...</Text>
        </View>
      ) : (
        <FlatList
          data={displayedItems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          renderItem={renderMenuItem}
          ListHeaderComponent={
            <View style={styles.header}>
              <View style={styles.headerRow}>
                <View>
                  <Text style={[styles.headerTitle, { color: theme.text }]}>
                    {currentSeasonalMenu ? currentSeasonalMenu.name : "Our Menu"}
                  </Text>
                  <Text style={[styles.headerSubtitle, { color: theme.text + "80" }]}>
                    {isLoggedIn ? `Welcome, ${isHQ() ? "HQ Admin" : isBranch() ? "Branch Admin" : "Customer"}!` : "Please sign in to order"}
                  </Text>
                </View>
                {renderHeaderActions()}
              </View>
            </View>
          }
        />
      )}

      {/* Floating Action Button */}
      <Pressable 
        onPress={() => {
          if (isHQ()) {
            setShowSeasonalMenuList(true);
          } else {
            safePush("cart");
          }
        }} 
        style={[styles.cartButton, { backgroundColor: theme.primary }]}
      >
        {totalItems > 0 && !isHQ() && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{totalItems}</Text>
          </View>
        )}
        <Text style={styles.cartText}>{isHQ() ? "Seasonal Menu →" : "View Cart →"}</Text>
      </Pressable>

      {/* Add Menu Item Modal (HQ Only) */}
      <Modal visible={showAddMenuModal} animationType="slide" transparent={true} onRequestClose={() => setShowAddMenuModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Add New Menu Item</Text>

            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholder="Item Name"
              placeholderTextColor={theme.text + "80"}
              value={newItemName}
              onChangeText={setNewItemName}
            />
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholder="Description"
              placeholderTextColor={theme.text + "80"}
              value={newItemDescription}
              onChangeText={setNewItemDescription}
              multiline
            />
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholder="Price"
              placeholderTextColor={theme.text + "80"}
              value={newItemPrice}
              onChangeText={setNewItemPrice}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholder="Category"
              placeholderTextColor={theme.text + "80"}
              value={newItemCategory}
              onChangeText={setNewItemCategory}
            />

            <View style={styles.modalButtons}>
              <Pressable onPress={() => setShowAddMenuModal(false)} style={[styles.modalButton, { backgroundColor: theme.muted }]}>
                <Text style={[styles.modalButtonText, { color: theme.text }]}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleAddMenuItem} style={[styles.modalButton, { backgroundColor: theme.primary }]}>
                <Text style={styles.modalButtonText}>Add Item</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Seasonal Menu Modal (HQ Only) */}
      <Modal visible={showSeasonalMenuModal} animationType="slide" transparent={true} onRequestClose={() => setShowSeasonalMenuModal(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Create Seasonal Menu</Text>

            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholder="Seasonal Menu Name"
              placeholderTextColor={theme.text + "80"}
              value={seasonalName}
              onChangeText={setSeasonalName}
            />
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholder="Description"
              placeholderTextColor={theme.text + "80"}
              value={seasonalDescription}
              onChangeText={setSeasonalDescription}
              multiline
            />
            <Text style={[styles.inputLabel, { color: theme.text }]}>Start Date (YYYY-MM-DD)</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholder="2024-12-01"
              placeholderTextColor={theme.text + "80"}
              value={seasonalStartDate}
              onChangeText={setSeasonalStartDate}
            />
            <Text style={[styles.inputLabel, { color: theme.text }]}>End Date (YYYY-MM-DD)</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholder="2024-12-31"
              placeholderTextColor={theme.text + "80"}
              value={seasonalEndDate}
              onChangeText={setSeasonalEndDate}
            />
            <Text style={[styles.inputLabel, { color: theme.text }]}>Start Time (HH:mm)</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholder="12:00"
              placeholderTextColor={theme.text + "80"}
              value={seasonalStartTime}
              onChangeText={setSeasonalStartTime}
            />
            <Text style={[styles.inputLabel, { color: theme.text }]}>End Time (HH:mm)</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholder="23:59"
              placeholderTextColor={theme.text + "80"}
              value={seasonalEndTime}
              onChangeText={setSeasonalEndTime}
            />

            <View style={styles.modalButtons}>
              <Pressable onPress={() => setShowSeasonalMenuModal(false)} style={[styles.modalButton, { backgroundColor: theme.muted }]}>
                <Text style={[styles.modalButtonText, { color: theme.text }]}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleAddSeasonalMenu} style={[styles.modalButton, { backgroundColor: theme.primary }]}>
                <Text style={styles.modalButtonText}>Create Menu</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Seasonal Menu List Modal (HQ Only) */}
      <Modal visible={showSeasonalMenuList} animationType="slide" transparent={true} onRequestClose={() => setShowSeasonalMenuList(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Seasonal Menus</Text>

            {seasonalMenus.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.text + "80" }]}>No seasonal menus created yet</Text>
            ) : (
              seasonalMenus.map((menu) => (
                <View key={menu.id} style={[styles.seasonalMenuItem, { borderColor: theme.border }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.seasonalMenuName, { color: theme.text }]}>{menu.name}</Text>
                    <Text style={[styles.seasonalMenuDate, { color: theme.text + "80" }]}>{menu.startDate} - {menu.endDate}</Text>
                    <Text style={[styles.seasonalMenuTime, { color: theme.text + "80" }]}>
                      {seasonalMenuManager?.formatTimeRange(menu.startTime, menu.endTime)}
                    </Text>
                  </View>
                  <View style={styles.seasonalMenuActions}>
                    <Switch
                      value={menu.isActive}
                      onValueChange={() => {}}
                      trackColor={{ false: "#767577", true: theme.primary }}
                      thumbColor="#FFFFFF"
                    />
                    <Pressable 
                      onPress={() => openAddItemsModal(menu)} 
                      style={[styles.addItemButton, { backgroundColor: theme.accent }]}
                    >
                      <Text style={styles.addItemButtonText}>+ Items</Text>
                    </Pressable>
                    <Pressable onPress={() => dispatch(deleteSeasonalMenu(menu.id))} style={[styles.deleteButton, { backgroundColor: "#EF4444" }]}>
                      <Text style={styles.deleteText}>Delete</Text>
                    </Pressable>
                  </View>
                </View>
              ))
            )}

            <Pressable
              onPress={() => { setShowSeasonalMenuList(false); setShowSeasonalMenuModal(true); }}
              style={[styles.addSeasonalButton, { backgroundColor: theme.primary }]}
            >
              <Text style={styles.addSeasonalButtonText}>+ Create New Seasonal Menu</Text>
            </Pressable>

            <Pressable onPress={() => setShowSeasonalMenuList(false)} style={[styles.modalButton, { backgroundColor: theme.muted, marginTop: 16 }]}>
              <Text style={[styles.modalButtonText, { color: theme.text }]}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Add Items to Seasonal Menu Modal (HQ Only) */}
      <Modal visible={showAddItemsModal} animationType="slide" transparent={true} onRequestClose={() => setShowAddItemsModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Add Items to {selectedSeasonalMenu?.name}
            </Text>

            {/* Search Bar */}
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholder="Search items..."
              placeholderTextColor={theme.text + "80"}
              value={itemSearchQuery}
              onChangeText={setItemSearchQuery}
            />

            {/* Available Items List */}
            <ScrollView style={styles.itemsListContainer} showsVerticalScrollIndicator={true}>
              {filteredAvailableItems().length === 0 ? (
                <Text style={[styles.emptyText, { color: theme.text + "80" }]}>
                  {itemSearchQuery.trim() 
                    ? "No items match your search" 
                    : "All items are already in this seasonal menu"}
                </Text>
              ) : (
                filteredAvailableItems().map((item) => (
                  <View key={item.id} style={[styles.menuItemRow, { borderColor: theme.border }]}>
                    <View style={styles.menuItemInfo}>
                      <Text style={[styles.menuItemName, { color: theme.text }]}>{item.name}</Text>
                      <Text style={[styles.menuItemCategory, { color: theme.text + "80" }]}>{item.category}</Text>
                    </View>
                    <View style={styles.menuItemActions}>
                      <Text style={[styles.menuItemPrice, { color: theme.accent }]}>₹{item.price.toFixed(2)}</Text>
                      <Pressable
                        onPress={() => handleAddItemToSeasonalMenu(item)}
                        style={[styles.addItemButton, { backgroundColor: theme.primary }]}
                      >
                        <Text style={styles.addItemButtonText}>Add</Text>
                      </Pressable>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>

            <Pressable onPress={() => setShowAddItemsModal(false)} style={[styles.modalButton, { backgroundColor: theme.muted, marginTop: 16 }]}>
              <Text style={[styles.modalButtonText, { color: theme.text }]}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingVertical: 16, marginBottom: 8 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  headerTitle: { fontSize: 28, fontWeight: "800", marginBottom: 4 },
  headerSubtitle: { fontSize: 16 },
  headerAction: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  headerActionText: { color: "#FFF", fontWeight: "600", fontSize: 14 },
  categoryContainer: { maxHeight: 50, marginBottom: 8 },
  categoryContent: { paddingHorizontal: 16, gap: 8 },
  categoryChip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginRight: 8 },
  categoryText: { fontWeight: "600", fontSize: 14 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 16, fontSize: 16 },
  dbErrorBanner: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  dbErrorText: { flex: 1, fontSize: 14, fontWeight: "600" },
  card: { borderRadius: 16, padding: 12, marginBottom: 12, flexDirection: "row", elevation: 4 },
  stockIndicator: { position: "absolute", top: 8, right: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  stockText: { color: "#FFF", fontSize: 10, fontWeight: "600" },
  itemImage: { width: 100, height: 100, borderRadius: 12 },
  itemContent: { flex: 1, paddingLeft: 12, justifyContent: "center" },
  itemHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  itemName: { fontSize: 18, fontWeight: "700", marginBottom: 4, flex: 1 },
  itemDesc: { fontSize: 13, marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  itemPrice: { fontSize: 18, fontWeight: "700" },
  basePrice: { fontSize: 12, textDecorationLine: "line-through" },
  addButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  addText: { color: "#FFF", fontWeight: "600", fontSize: 14 },
  controls: { flexDirection: "row", alignItems: "center", gap: 12 },
  circle: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  controlText: { color: "#FFF", fontSize: 20, fontWeight: "700" },
  qty: { fontSize: 16, fontWeight: "600", minWidth: 20, textAlign: "center" },
  deleteButton: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  deleteText: { color: "#FFF", fontWeight: "600", fontSize: 12 },
  seasonalBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  seasonalBadgeText: { color: "#FFF", fontSize: 10, fontWeight: "600" },
  seasonalBanner: { padding: 12, marginHorizontal: 16, marginTop: 8, borderRadius: 12 },
  seasonalBannerTitle: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  seasonalBannerSubtitle: { color: "#FFF", fontSize: 14, opacity: 0.9 },
  seasonalBannerTime: { color: "#FFF", fontSize: 12, marginTop: 4, opacity: 0.8 },
  cartButton: { position: "absolute", bottom: 24, right: 24, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 30, elevation: 8 },
  cartText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
  badge: { position: "absolute", top: -6, right: -6, backgroundColor: "#FF3B30", borderRadius: 10, minWidth: 20, height: 20, alignItems: "center", justifyContent: "center" },
  badgeText: { color: "#FFF", fontSize: 12, fontWeight: "700" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: "90%", maxHeight: "80%", borderRadius: 16, padding: 20, elevation: 8 },
  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: "600", marginBottom: 8, marginTop: 8 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 8 },
  modalButtons: { flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 16 },
  modalButton: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8 },
  modalButtonText: { color: "#FFF", fontWeight: "600", fontSize: 16 },
  seasonalMenuItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 8 },
  seasonalMenuName: { fontSize: 16, fontWeight: "600" },
  seasonalMenuDate: { fontSize: 12, marginTop: 4 },
  seasonalMenuTime: { fontSize: 12, marginTop: 2 },
  seasonalMenuActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  addSeasonalButton: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, marginTop: 16 },
  addSeasonalButtonText: { color: "#FFF", fontWeight: "600", fontSize: 16, textAlign: "center" },
  emptyText: { fontSize: 16, textAlign: "center", marginVertical: 20 },
  addItemButton: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  addItemButtonText: { color: "#FFF", fontWeight: "600", fontSize: 12 },
  itemsListContainer: { maxHeight: 400, marginVertical: 12 },
  menuItemRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 8 },
  menuItemInfo: { flex: 1 },
  menuItemName: { fontSize: 16, fontWeight: "600" },
  menuItemCategory: { fontSize: 12, marginTop: 2 },
  menuItemActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  menuItemPrice: { fontSize: 16, fontWeight: "600" },
});

