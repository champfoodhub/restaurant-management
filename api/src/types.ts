/**
 * API Types for Restaurant Management System
 */

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  basePrice: number;
  image: string;
  category: string;
  isAvailable: boolean;
  inStock: boolean;
  seasonalMenuId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SeasonalMenu {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  items: MenuItem[];
  createdAt: string;
  updatedAt: string;
}

export interface StockItem {
  id: string;
  menuItemId: string;
  branchId: string;
  quantity: number;
  lastUpdated: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  branchId: string;
  createdAt: string;
  updatedAt: string;
}

// Request/Response types
export interface CreateMenuItemRequest {
  name: string;
  description: string;
  price: number;
  basePrice: number;
  image: string;
  category: string;
  isAvailable: boolean;
  inStock: boolean;
  seasonalMenuId?: string;
}

export interface CreateSeasonalMenuRequest {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface UpdateStockRequest {
  quantity: number;
}

export interface CreateOrderRequest {
  items: CartItem[];
  branchId: string;
}
