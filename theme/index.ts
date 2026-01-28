import { Flavor } from "../config/config";

// Theme colors for each flavor and mode
export const themes = {
  user: {
    light: {
      background: "#FFFFFF",
      text: "#111111",
      primary: "#DC2626",
      accent: "#EF4444",
      muted: "#F5F5F5",
      card: ["#FFFFFF", "#F5F5F5"] as [string, string, ...string[]],
      border: "#E5E5E5",
    },
    dark: {
      background: "#0B0B0B",
      text: "#FFFFFF",
      primary: "#DC2626",
      accent: "#F87171",
      muted: "#1A1A1A",
      card: ["#1A1A1A", "#262626"] as [string, string, ...string[]],
      border: "#404040",
    },
  },

  hq: {
    light: {
      background: "#F8FAFC",
      text: "#0F172A",
      primary: "#7C3AED",
      accent: "#A78BFA",
      muted: "#EEF2FF",
      card: ["#FFFFFF", "#EEF2FF"] as [string, string, ...string[]],
      border: "#E2E8F0",
    },
    dark: {
      background: "#0A061A",
      text: "#FFFFFF",
      primary: "#8B5CF6",
      accent: "#C4B5FD",
      muted: "#1E1B3A",
      card: ["#1E1B3A", "#2D2A5C"] as [string, string, ...string[]],
      border: "#4C1D95",
    },
  },

  branch: {
    light: {
      background: "#F9FAFB",
      text: "#0F172A",
      primary: "#2563EB",
      accent: "#60A5FA",
      muted: "#EFF6FF",
      card: ["#FFFFFF", "#EFF6FF"] as [string, string, ...string[]],
      border: "#E2E8F0",
    },
    dark: {
      background: "#020617",
      text: "#FFFFFF",
      primary: "#3B82F6",
      accent: "#93C5FD",
      muted: "#0F172A",
      card: ["#0F172A", "#1E293B"] as [string, string, ...string[]],
      border: "#1E3A8A",
    },
  },
};

// Content for each flavor
export const flavorContent = {
  hq: {
    appName: "Restaurant HQ Management",
    role: "Headquarters",
    description: "Manage menus, seasonal offerings, and branch operations",
    
    // Menu management
    menu: {
      title: "Menu Management",
      addItem: "Add Menu Item",
      editItem: "Edit Item",
      deleteItem: "Delete Item",
      seasonalMenu: "Seasonal Menu",
      createSeasonal: "Create Seasonal Menu",
      managePricing: "Manage Pricing",
    },
    
    // Seasonal menu
    seasonal: {
      title: "Seasonal Menus",
      activeNow: "Currently Active",
      upcoming: "Upcoming",
      expired: "Expired",
      createNew: "Create New Seasonal Menu",
      setDuration: "Set Duration",
      setTimeRange: "Set Time Range",
      timeFormat: "Time Format: HH:mm",
      dateFormat: "Date Format: YYYY-MM-DD",
    },
    
    // Stock management
    stock: {
      title: "Stock Overview",
      viewOnly: "View stock levels across branches",
      manageBranch: "Branch stock management only",
    },
    
    // Branch management
    branch: {
      title: "Branch Management",
      addBranch: "Add New Branch",
      viewBranches: "View All Branches",
      managePricing: "Branch can set pricing",
      manageStock: "Branch can manage stock",
    },
    
    // Dashboard
    dashboard: {
      title: "HQ Dashboard",
      totalBranches: "Total Branches",
      activeMenus: "Active Menus",
      seasonalItems: "Seasonal Items",
      totalOrders: "Total Orders Today",
    },
    
    // Permissions
    permissions: [
      "Create, Update, Delete Menu Items",
      "Manage Seasonal Menus",
      "Set Base Pricing",
      "View All Branches",
      "View Reports",
      "Manage Branch Settings",
    ],
    
    // Flavor specific features
    features: [
      "Full Menu CRUD Operations",
      "Seasonal Menu Management with DateTime Scheduling",
      "Time-based Menu Switching",
      "Multi-branch Stock Overview",
      "Pricing Management",
      "Analytics Dashboard",
    ],
  },

  branch: {
    appName: "Restaurant Branch Admin",
    role: "Branch Admin",
    description: "Manage stock, pricing, and daily operations",
    
    // Menu
    menu: {
      title: "Branch Menu",
      viewOnly: "View Menu Items",
      updateStock: "Update Stock Status",
      inStock: "In Stock",
      outOfStock: "Out of Stock",
      setPricing: "Set Branch Pricing",
    },
    
    // Stock management
    stock: {
      title: "Stock Management",
      toggleStock: "Toggle Stock Status",
      markInStock: "Mark as In Stock",
      markOutOfStock: "Mark as Out of Stock",
      viewStock: "View Current Stock",
      updateQuantity: "Update Quantity",
      stockLevel: "Stock Level",
      lowStock: "Low Stock Alert",
    },
    
    // Pricing
    pricing: {
      title: "Branch Pricing",
      basePrice: "Base Price",
      branchPrice: "Branch Price",
      setPrice: "Set Price",
      adjustPricing: "Adjust Pricing",
      pricingEnabled: "Can modify prices",
    },
    
    // Orders
    orders: {
      title: "Orders",
      viewOrders: "View Orders",
      processOrders: "Process Orders",
      pendingOrders: "Pending Orders",
      completedOrders: "Completed Orders",
    },
    
    // Permissions
    permissions: [
      "View Menu Items",
      "Manage Stock (In Stock/Out of Stock)",
      "Set Branch-specific Pricing",
      "View Orders",
      "Process Orders",
    ],
    
    // Flavor specific features
    features: [
      "Stock Toggle (In Stock/Out of Stock)",
      "Branch-specific Pricing",
      "View Current Menu",
      "Order Management",
      "Daily Operations",
    ],
  },

  user: {
    appName: "Restaurant User",
    role: "Customer",
    description: "Browse menu and place orders",
    
    // Menu
    menu: {
      title: "Our Menu",
      viewMenu: "Browse Menu",
      seasonal: "Seasonal Specials",
      viewSeasonal: "View Seasonal Menu",
      categories: "Categories",
      allCategories: "All Categories",
      searchMenu: "Search menu...",
    },
    
    // Ordering
    ordering: {
      title: "Order",
      addToCart: "Add to Cart",
      viewCart: "View Cart",
      checkout: "Checkout",
      placeOrder: "Place Order",
      orderPlaced: "Order Placed Successfully",
      orderHistory: "Order History",
      currentOrders: "Current Orders",
    },
    
    // Cart
    cart: {
      title: "Shopping Cart",
      emptyCart: "Your cart is empty",
      addItems: "Add items from the menu",
      total: "Total",
      removeItem: "Remove Item",
      increaseQty: "Increase Quantity",
      decreaseQty: "Decrease Quantity",
    },
    
    // Seasonal menu for users
    seasonal: {
      title: "Seasonal Specials",
      availableNow: "Available Now",
      limitedTime: "Limited Time Only",
      endsAt: "Ends at",
      startsAt: "Starts at",
      viewItems: "View Items",
    },
    
    // Permissions
    permissions: [
      "View Menu Items",
      "View Seasonal Menus",
      "Add Items to Cart",
      "Place Orders",
      "View Order History",
    ],
    
    // Flavor specific features
    features: [
      "Browse Full Menu",
      "View Seasonal Specials",
      "Add to Cart",
      "Place Orders",
      "Order History",
      "Easy Checkout",
    ],
  },
};

// Get theme for a specific flavor and mode
export function getTheme(
  flavor: Flavor,
  mode: "light" | "dark"
) {
  const flavorKey = flavor.toLowerCase() as keyof typeof themes;
  return themes[flavorKey][mode];
}

// Get content for a specific flavor
export function getFlavorContent(flavor: Flavor) {
  const flavorKey = flavor.toLowerCase() as keyof typeof flavorContent;
  return flavorContent[flavorKey];
}

// Helper to get the full theme object (colors + content)
export function getFullTheme(flavor: Flavor, mode: "light" | "dark") {
  return {
    ...getTheme(flavor, mode),
    content: getFlavorContent(flavor),
  };
}

