/**
 * Stock Thunks
 * Async operations for stock management using API
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import { stockApi } from '../../apiService';
import { getCurrentFlavor } from '../../config/config';

// Generate unique ID (fallback for local creation)
const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Load all stock for the current branch
 */
export const loadStock = createAsyncThunk(
  'stock/loadStock',
  async () => {
    const branchId = getCurrentFlavor();
    const stockData = await stockApi.getAll(branchId);
    return stockData;
  }
);

/**
 * Update stock for a menu item
 */
export const updateStockItem = createAsyncThunk(
  'stock/updateStock',
  async (
    { menuItemId, menuItemName, quantity, inStock }: {
      menuItemId: string;
      menuItemName: string;
      quantity: number;
      inStock: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      const branchId = getCurrentFlavor();
      const result = await stockApi.update(menuItemId, branchId, quantity);
      
      return {
        id: generateId(),
        menuItemId: result.menuItemId,
        menuItemName,
        quantity: result.quantity,
        inStock: result.inStock,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update stock');
    }
  }
);

/**
 * Toggle stock status (in stock/out of stock)
 */
export const toggleStockStatus = createAsyncThunk(
  'stock/toggleStatus',
  async (
    { menuItemId, menuItemName, currentStatus }: {
      menuItemId: string;
      menuItemName: string;
      currentStatus: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      const branchId = getCurrentFlavor();
      const result = await stockApi.toggle(menuItemId, branchId);
      
      return {
        id: generateId(),
        menuItemId: result.menuItemId,
        menuItemName,
        quantity: result.quantity,
        inStock: result.inStock,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to toggle stock status');
    }
  }
);

/**
 * Set stock status to in stock
 */
export const setInStockStatus = createAsyncThunk(
  'stock/setInStock',
  async (
    { menuItemId, menuItemName }: { menuItemId: string; menuItemName: string },
    { rejectWithValue }
  ) => {
    try {
      const branchId = getCurrentFlavor();
      const result = await stockApi.setInStock(menuItemId, branchId);
      
      return {
        id: generateId(),
        menuItemId: result.menuItemId,
        menuItemName,
        quantity: result.quantity,
        inStock: true,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to set in stock');
    }
  }
);

/**
 * Set stock status to out of stock
 */
export const setOutOfStockStatus = createAsyncThunk(
  'stock/setOutOfStock',
  async (
    { menuItemId, menuItemName }: { menuItemId: string; menuItemName: string },
    { rejectWithValue }
  ) => {
    try {
      const branchId = getCurrentFlavor();
      const result = await stockApi.setOutOfStock(menuItemId, branchId);
      
      return {
        id: generateId(),
        menuItemId: result.menuItemId,
        menuItemName,
        quantity: result.quantity,
        inStock: false,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to set out of stock');
    }
  }
);
