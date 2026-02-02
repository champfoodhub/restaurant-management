/**
 * API Service for Frontend
 * Handles all HTTP requests to the backend API
 */

import { MenuItem, SeasonalMenu } from './config/config';

// API Base URL - configure this based on your environment
// For mobile development:
// - Android Emulator: Use 10.0.2.2 instead of localhost
// - iOS Simulator: Use localhost or your machine's IP
// - Physical Device: Use your machine's IP address
//
// Set EXPO_PUBLIC_API_URL in your .env file
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

// Generic fetch wrapper with error handling
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  };
  
  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Request failed');
    }
    
    return data.data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// Menu API
export const menuApi = {
  getAll: (filters?: { category?: string; seasonalMenuId?: string }): Promise<MenuItem[]> => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.seasonalMenuId) params.append('seasonalMenuId', filters.seasonalMenuId);
    
    const query = params.toString();
    return fetchApi<MenuItem[]>(`/menu${query ? `?${query}` : ''}`);
  },
  
  getById: (id: string): Promise<MenuItem> => {
    return fetchApi<MenuItem>(`/menu/${id}`);
  },
  
  create: (item: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<MenuItem> => {
    return fetchApi<MenuItem>('/menu', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },
  
  update: (item: MenuItem): Promise<MenuItem> => {
    return fetchApi<MenuItem>(`/menu/${item.id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
  },
  
  delete: (id: string): Promise<void> => {
    return fetchApi<void>(`/menu/${id}`, {
      method: 'DELETE',
    });
  },
  
  assignToSeasonalMenu: (itemId: string, seasonalMenuId: string | null): Promise<MenuItem> => {
    return fetchApi<MenuItem>(`/menu/${itemId}/seasonal-menu`, {
      method: 'POST',
      body: JSON.stringify({ seasonalMenuId }),
    });
  },
  
  removeFromSeasonalMenu: (itemId: string): Promise<MenuItem> => {
    return fetchApi<MenuItem>(`/menu/${itemId}/seasonal-menu`, {
      method: 'DELETE',
    });
  },
};

// Seasonal Menu API
export const seasonalMenuApi = {
  getAll: (): Promise<SeasonalMenu[]> => {
    return fetchApi<SeasonalMenu[]>('/seasonal-menus');
  },
  
  getActive: (): Promise<SeasonalMenu[]> => {
    return fetchApi<SeasonalMenu[]>('/seasonal-menus/active');
  },
  
  getCurrent: (): Promise<SeasonalMenu | null> => {
    return fetchApi<SeasonalMenu | null>('/seasonal-menus/current');
  },
  
  getById: (id: string): Promise<SeasonalMenu> => {
    return fetchApi<SeasonalMenu>(`/seasonal-menus/${id}`);
  },
  
  create: (menu: Omit<SeasonalMenu, 'id' | 'createdAt' | 'updatedAt' | 'items'>): Promise<SeasonalMenu> => {
    return fetchApi<SeasonalMenu>('/seasonal-menus', {
      method: 'POST',
      body: JSON.stringify(menu),
    });
  },
  
  update: (menu: SeasonalMenu): Promise<SeasonalMenu> => {
    return fetchApi<SeasonalMenu>(`/seasonal-menus/${menu.id}`, {
      method: 'PUT',
      body: JSON.stringify(menu),
    });
  },
  
  delete: (id: string): Promise<void> => {
    return fetchApi<void>(`/seasonal-menus/${id}`, {
      method: 'DELETE',
    });
  },
  
  addItem: (menuId: string, itemId: string): Promise<MenuItem> => {
    return fetchApi<MenuItem>(`/seasonal-menus/${menuId}/items/${itemId}`, {
      method: 'POST',
    });
  },
  
  removeItem: (itemId: string): Promise<MenuItem> => {
    return fetchApi<MenuItem>(`/seasonal-menus/items/${itemId}`, {
      method: 'DELETE',
    });
  },
};

// Stock API
export const stockApi = {
  getAll: (branchId: string): Promise<{ menuItemId: string; quantity: number }[]> => {
    return fetchApi(`/stock?branchId=${branchId}`);
  },
  
  get: (itemId: string, branchId: string): Promise<{ menuItemId: string; quantity: number; inStock: boolean }> => {
    return fetchApi(`/stock/${itemId}?branchId=${branchId}`);
  },
  
  update: (itemId: string, branchId: string, quantity: number): Promise<{ menuItemId: string; quantity: number; inStock: boolean }> => {
    return fetchApi(`/stock/${itemId}?branchId=${branchId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  },
  
  setInStock: (itemId: string, branchId: string): Promise<{ menuItemId: string; quantity: number; inStock: boolean }> => {
    return fetchApi(`/stock/${itemId}/in-stock?branchId=${branchId}`, {
      method: 'POST',
    });
  },
  
  setOutOfStock: (itemId: string, branchId: string): Promise<{ menuItemId: string; quantity: number; inStock: boolean }> => {
    return fetchApi(`/stock/${itemId}/out-of-stock?branchId=${branchId}`, {
      method: 'POST',
    });
  },
  
  toggle: (itemId: string, branchId: string): Promise<{ menuItemId: string; quantity: number; inStock: boolean }> => {
    return fetchApi(`/stock/${itemId}/toggle?branchId=${branchId}`, {
      method: 'POST',
    });
  },
};

// Cart Item type (for order creation)
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

// Order API
export const orderApi = {
  getAll: (filters?: { branchId?: string; status?: string }): Promise<any[]> => {
    const params = new URLSearchParams();
    if (filters?.branchId) params.append('branchId', filters.branchId);
    if (filters?.status) params.append('status', filters.status);
    
    const query = params.toString();
    return fetchApi<any[]>(`/orders${query ? `?${query}` : ''}`);
  },
  
  getById: (id: string): Promise<any> => {
    return fetchApi<any>(`/orders/${id}`);
  },
  
  create: (items: CartItem[], branchId: string): Promise<any> => {
    return fetchApi('/orders', {
      method: 'POST',
      body: JSON.stringify({ items, branchId }),
    });
  },
  
  updateStatus: (id: string, status: string): Promise<any> => {
    return fetchApi(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
  
  cancel: (id: string): Promise<void> => {
    return fetchApi<void>(`/orders/${id}`, {
      method: 'DELETE',
    });
  },
};

export default {
  menu: menuApi,
  seasonalMenu: seasonalMenuApi,
  stock: stockApi,
  order: orderApi,
};
