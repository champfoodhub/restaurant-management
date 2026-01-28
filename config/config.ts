export type Flavor = "HQ" | "USER" | "BRANCH";
export type Role = "HQ" | "USER" | "BRANCH";

// Role configuration type
type RoleConfig = {
  designation: string;
  permissions: Permission[];
};

// Role configurations
const roleConfigs: Record<Role, RoleConfig> = {
  HQ: {
    designation: "Headquarters",
    permissions: [
      "menu:create",
      "menu:read",
      "menu:update",
      "menu:delete",
      "seasonal_menu:manage",
      "stock:view",
      "pricing:manage",
    ],
  },
  USER: {
    designation: "Customer",
    permissions: [
      "menu:read",
      "seasonal_menu:view",
    ],
  },
  BRANCH: {
    designation: "Branch Admin",
    permissions: [
      "menu:read",
      "menu:update",
      "stock:manage",
      "pricing:manage",
    ],
  },
};

// AppConfig - uses a function to get dynamic flavor
export const AppConfig = {
  // This will be replaced at runtime with the actual flavor from Redux
  getFlavor: (): Flavor => {
    return "BRANCH";
  },
  setFlavorGetter: (getter: () => Flavor) => {
    AppConfig.getFlavor = getter;
  },
  appName: "Restaurant Management",
  roles: roleConfigs,
};

// Helper to get current flavor (used by components)
export const getCurrentFlavor = (): Flavor => {
  return AppConfig.getFlavor();
};

// Flavor configurations
export const flavors = {
  hq: {
    appName: "Restaurant HQ",
    role: "HQ" as Role,
  },
  user: {
    appName: "Restaurant User",
    role: "USER" as Role,
  },
  branch: {
    appName: "Restaurant Branch",
    role: "BRANCH" as Role,
  },
};

// Permission types
export type Permission =
  | "menu:create"
  | "menu:read"
  | "menu:update"
  | "menu:delete"
  | "seasonal_menu:manage"
  | "seasonal_menu:view"
  | "stock:manage"
  | "stock:view"
  | "pricing:manage"
  | "pricing:view";

// User data interface
export interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  dob: string;
  email: string;
  role: Role;
}

// Menu item interface with stock management
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  basePrice: number; // Original pricing set by HQ
  image: string;
  category: string;
  isAvailable: boolean; // Stock status (in stock/out of stock)
  inStock: boolean; // Boolean for stock management
  seasonalMenuId?: string; // Link to seasonal menu if applicable
  createdAt: string;
  updatedAt: string;
}

// Seasonal menu interface
export interface SeasonalMenu {
  id: string;
  name: string;
  description: string;
  startDate: string; // ISO Date string
  endDate: string; // ISO Date string
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  isActive: boolean;
  items: MenuItem[];
  createdAt: string;
  updatedAt: string;
}

// Menu schedule for time-based switching
export interface MenuSchedule {
  id: string;
  seasonalMenuId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  isActive: boolean;
}

