/**
 * In-Memory Data Store
 * Replaces SQLite database for API operations
 */

import { v4 as uuidv4 } from 'uuid';
import { MenuItem, Order, SeasonalMenu, StockItem } from './types';

// In-memory storage
const menuItems: Map<string, MenuItem> = new Map();
const seasonalMenus: Map<string, SeasonalMenu> = new Map();
const stockItems: Map<string, StockItem> = new Map();
const orders: Map<string, Order> = new Map();

// Helper to generate IDs
export const generateId = (): string => {
  return `${Date.now()}_${uuidv4().split('-')[0]}`;
};

// Helper to get current timestamp
export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};

// Menu Items Operations
export const menuStore = {
  getAll: (filters?: { category?: string; seasonalMenuId?: string }): MenuItem[] => {
    let items = Array.from(menuItems.values());
    
    if (filters?.category) {
      items = items.filter(item => item.category === filters.category);
    }
    if (filters?.seasonalMenuId) {
      items = items.filter(item => item.seasonalMenuId === filters.seasonalMenuId);
    }
    
    return items.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  },
  
  getById: (id: string): MenuItem | undefined => {
    return menuItems.get(id);
  },
  
  create: (data: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>): MenuItem => {
    const now = getCurrentTimestamp();
    const item: MenuItem = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    menuItems.set(item.id, item);
    return item;
  },
  
  update: (id: string, data: Partial<MenuItem>): MenuItem | null => {
    const existing = menuItems.get(id);
    if (!existing) return null;
    
    const updated: MenuItem = {
      ...existing,
      ...data,
      id: existing.id, // Prevent ID change
      createdAt: existing.createdAt, // Prevent createdAt change
      updatedAt: getCurrentTimestamp(),
    };
    menuItems.set(id, updated);
    return updated;
  },
  
  delete: (id: string): boolean => {
    return menuItems.delete(id);
  },
  
  // Assign item to seasonal menu
  assignToSeasonalMenu: (itemId: string, seasonalMenuId: string | null): MenuItem | null => {
    const item = menuItems.get(itemId);
    if (!item) return null;
    
    const updated: MenuItem = {
      ...item,
      seasonalMenuId: seasonalMenuId || undefined,
      updatedAt: getCurrentTimestamp(),
    };
    menuItems.set(itemId, updated);
    return updated;
  },
};

// Seasonal Menus Operations
export const seasonalMenuStore = {
  getAll: (): SeasonalMenu[] => {
    return Array.from(seasonalMenus.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },
  
  getById: (id: string): SeasonalMenu | undefined => {
    return seasonalMenus.get(id);
  },
  
  getActive: (): SeasonalMenu[] => {
    return Array.from(seasonalMenus.values()).filter(menu => menu.isActive);
  },
  
  create: (data: Omit<SeasonalMenu, 'id' | 'createdAt' | 'updatedAt' | 'items'>): SeasonalMenu => {
    const now = getCurrentTimestamp();
    const menu: SeasonalMenu = {
      ...data,
      id: generateId(),
      items: [],
      createdAt: now,
      updatedAt: now,
    };
    seasonalMenus.set(menu.id, menu);
    return menu;
  },
  
  update: (id: string, data: Partial<SeasonalMenu>): SeasonalMenu | null => {
    const existing = seasonalMenus.get(id);
    if (!existing) return null;
    
    const updated: SeasonalMenu = {
      ...existing,
      ...data,
      id: existing.id,
      items: existing.items,
      createdAt: existing.createdAt,
      updatedAt: getCurrentTimestamp(),
    };
    seasonalMenus.set(id, updated);
    return updated;
  },
  
  delete: (id: string): boolean => {
    // Remove seasonal menu reference from all items
    Array.from(menuItems.values()).forEach(item => {
      if (item.seasonalMenuId === id) {
        menuStore.assignToSeasonalMenu(item.id, null);
      }
    });
    return seasonalMenus.delete(id);
  },
};

// Stock Operations
export const stockStore = {
  getAll: (branchId: string): StockItem[] => {
    return Array.from(stockItems.values())
      .filter(item => item.branchId === branchId);
  },
  
  get: (menuItemId: string, branchId: string): StockItem | undefined => {
    return Array.from(stockItems.values())
      .find(item => item.menuItemId === menuItemId && item.branchId === branchId);
  },
  
  update: (menuItemId: string, branchId: string, quantity: number): StockItem => {
    const id = `${branchId}_${menuItemId}`;
    const now = getCurrentTimestamp();
    
    const existing = stockItems.get(id);
    const stock: StockItem = {
      id,
      menuItemId,
      branchId,
      quantity,
      lastUpdated: now,
    };
    stockItems.set(id, stock);
    return stock;
  },
  
  setInStock: (menuItemId: string, branchId: string): StockItem => {
    return stockStore.update(menuItemId, branchId, 100);
  },
  
  setOutOfStock: (menuItemId: string, branchId: string): StockItem => {
    return stockStore.update(menuItemId, branchId, 0);
  },
  
  isInStock: (menuItemId: string, branchId: string): boolean => {
    const stock = stockStore.get(menuItemId, branchId);
    return stock ? stock.quantity > 0 : true; // Default to in-stock if not found
  },
};

// Order Operations
export const orderStore = {
  getAll: (filters?: { branchId?: string; status?: string }): Order[] => {
    let ordersList = Array.from(orders.values());
    
    if (filters?.branchId) {
      ordersList = ordersList.filter(order => order.branchId === filters.branchId);
    }
    if (filters?.status) {
      ordersList = ordersList.filter(order => order.status === filters.status);
    }
    
    return ordersList.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },
  
  getById: (id: string): Order | undefined => {
    return orders.get(id);
  },
  
  create: (data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Order => {
    const now = getCurrentTimestamp();
    const order: Order = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    orders.set(order.id, order);
    return order;
  },
  
  updateStatus: (id: string, status: Order['status']): Order | null => {
    const existing = orders.get(id);
    if (!existing) return null;
    
    const updated: Order = {
      ...existing,
      status,
      updatedAt: getCurrentTimestamp(),
    };
    orders.set(id, updated);
    return updated;
  },
  
  delete: (id: string): boolean => {
    return orders.delete(id);
  },
};

// Initialize with sample data
export const initializeSampleData = (): void => {
  // Sample menu items
  const sampleItems: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>[] = [
    { name: 'Margherita Pizza', description: 'Classic Italian pizza with mozzarella', price: 12.99, basePrice: 10.99, image: 'https://example.com/pizza.jpg', category: 'Pizza', isAvailable: true, inStock: true },
    { name: 'Pepperoni Pizza', description: 'Pizza with pepperoni slices', price: 14.99, basePrice: 12.99, image: 'https://example.com/pepperoni.jpg', category: 'Pizza', isAvailable: true, inStock: true },
    { name: 'Caesar Salad', description: 'Fresh romaine with caesar dressing', price: 8.99, basePrice: 7.99, image: 'https://example.com/salad.jpg', category: 'Salads', isAvailable: true, inStock: true },
    { name: 'Grilled Chicken', description: 'Seasoned grilled chicken breast', price: 16.99, basePrice: 14.99, image: 'https://example.com/chicken.jpg', category: 'Main Course', isAvailable: true, inStock: true },
    { name: 'Pasta Carbonara', description: 'Creamy pasta with bacon', price: 13.99, basePrice: 11.99, image: 'https://example.com/pasta.jpg', category: 'Pasta', isAvailable: true, inStock: true },
    { name: 'Tiramisu', description: 'Classic Italian dessert', price: 6.99, basePrice: 5.99, image: 'https://example.com/tiramisu.jpg', category: 'Desserts', isAvailable: true, inStock: true },
  ];
  
  sampleItems.forEach(item => {
    menuStore.create(item);
  });
  
  // Sample seasonal menu
  const summerMenu = seasonalMenuStore.create({
    name: 'Summer Special Menu',
    description: 'Fresh and light summer dishes',
    startDate: '2024-06-01',
    endDate: '2024-08-31',
    startTime: '11:00',
    endTime: '21:00',
    isActive: true,
  });
  
  console.log('Sample data initialized');
  console.log(`Created ${menuItems.size} menu items`);
  console.log(`Created ${seasonalMenus.size} seasonal menus`);
};
