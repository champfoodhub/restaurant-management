import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getCurrentFlavor } from '../config/config';
import { updateStock as dbUpdateStock, getAllStock } from '../database/db';
import { Loggers } from '../utils/logger';

// Generate unique ID
const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Stock item interface
export interface StockItem {
  id: string;
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  inStock: boolean;
  lastUpdated: string;
}

// Stock state interface
export interface StockState {
  items: StockItem[];
  loading: boolean;
  error: string | null;
}

const initialState: StockState = {
  items: [],
  loading: false,
  error: null,
};

// Async thunks

/**
 * Load all stock for the current branch
 */
export const loadStock = createAsyncThunk(
  'stock/loadStock',
  async () => {
    const branchId = getCurrentFlavor(); // Use flavor as branch identifier
    const stockData = await getAllStock(branchId);
    Loggers.menu.info(`Loaded stock for branch: ${branchId}`);
    return stockData;
  }
);

/**
 * Update stock for a menu item (Branch only)
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
      await dbUpdateStock(menuItemId, branchId, quantity);
      
      const now = new Date().toISOString();
      
      Loggers.menu.info(`Updated stock for ${menuItemName}: ${inStock ? 'In Stock' : 'Out of Stock'}`);
      
      return {
        id: generateId(),
        menuItemId,
        menuItemName,
        quantity,
        inStock,
        lastUpdated: now,
      };
    } catch (error) {
      Loggers.menu.error('Failed to update stock', error);
      return rejectWithValue('Failed to update stock');
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
      const newStatus = !currentStatus;
      const quantity = newStatus ? 100 : 0; // Default quantity based on status
      
      await dbUpdateStock(menuItemId, branchId, quantity);
      
      const now = new Date().toISOString();
      
      Loggers.menu.info(`Toggled stock for ${menuItemName}: ${newStatus ? 'In Stock' : 'Out of Stock'}`);
      
      return {
        id: generateId(),
        menuItemId,
        menuItemName,
        quantity,
        inStock: newStatus,
        lastUpdated: now,
      };
    } catch (error) {
      Loggers.menu.error('Failed to toggle stock status', error);
      return rejectWithValue('Failed to toggle stock status');
    }
  }
);

/**
 * Set stock status to in stock
 */
export const setInStock = createAsyncThunk(
  'stock/setInStock',
  async (
    { menuItemId, menuItemName }: { menuItemId: string; menuItemName: string },
    { rejectWithValue }
  ) => {
    try {
      const branchId = getCurrentFlavor();
      await dbUpdateStock(menuItemId, branchId, 100); // Default in-stock quantity
      
      const now = new Date().toISOString();
      
      Loggers.menu.info(`Set ${menuItemName} as in stock`);
      
      return {
        id: generateId(),
        menuItemId,
        menuItemName,
        quantity: 100,
        inStock: true,
        lastUpdated: now,
      };
    } catch (error) {
      Loggers.menu.error('Failed to set in stock', error);
      return rejectWithValue('Failed to set in stock');
    }
  }
);

/**
 * Set stock status to out of stock
 */
export const setOutOfStock = createAsyncThunk(
  'stock/setOutOfStock',
  async (
    { menuItemId, menuItemName }: { menuItemId: string; menuItemName: string },
    { rejectWithValue }
  ) => {
    try {
      const branchId = getCurrentFlavor();
      await dbUpdateStock(menuItemId, branchId, 0);
      
      const now = new Date().toISOString();
      
      Loggers.menu.info(`Set ${menuItemName} as out of stock`);
      
      return {
        id: generateId(),
        menuItemId,
        menuItemName,
        quantity: 0,
        inStock: false,
        lastUpdated: now,
      };
    } catch (error) {
      Loggers.menu.error('Failed to set out of stock', error);
      return rejectWithValue('Failed to set out of stock');
    }
  }
);

// Stock slice
const stockSlice = createSlice({
  name: 'stock',
  initialState,
  reducers: {
    setStockItems: (state, action: PayloadAction<StockItem[]>) => {
      state.items = action.payload;
    },
    clearStockError: (state) => {
      state.error = null;
    },
    resetStock: (state) => {
      state.items = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Load stock
    builder
      .addCase(loadStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadStock.fulfilled, (state, action) => {
        state.loading = false;
        // Convert stock data to StockItem format
        state.items = action.payload.map(item => ({
          id: generateId(),
          menuItemId: item.menuItemId,
          menuItemName: '', // Will be populated when syncing with menu items
          quantity: item.quantity,
          inStock: item.quantity > 0,
          lastUpdated: new Date().toISOString(),
        }));
      })
      .addCase(loadStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load stock';
      });

    // Update stock item
    builder
      .addCase(updateStockItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStockItem.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item.menuItemId === action.payload.menuItemId);
        if (index !== -1) {
          state.items[index] = action.payload;
        } else {
          state.items.push(action.payload);
        }
      })
      .addCase(updateStockItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Toggle stock status
    builder
      .addCase(toggleStockStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleStockStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item.menuItemId === action.payload.menuItemId);
        if (index !== -1) {
          state.items[index] = action.payload;
        } else {
          state.items.push(action.payload);
        }
      })
      .addCase(toggleStockStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Set in stock
    builder
      .addCase(setInStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setInStock.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item.menuItemId === action.payload.menuItemId);
        if (index !== -1) {
          state.items[index] = action.payload;
        } else {
          state.items.push(action.payload);
        }
      })
      .addCase(setInStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Set out of stock
    builder
      .addCase(setOutOfStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setOutOfStock.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item.menuItemId === action.payload.menuItemId);
        if (index !== -1) {
          state.items[index] = action.payload;
        } else {
          state.items.push(action.payload);
        }
      })
      .addCase(setOutOfStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  setStockItems,
  clearStockError,
  resetStock,
} = stockSlice.actions;

// Export reducer
export default stockSlice.reducer;

// Selectors

/**
 * Get all stock items
 */
export const selectAllStockItems = (state: { stock: StockState }) => state.stock.items;

/**
 * Get stock status for a specific menu item
 */
export const selectStockByMenuItemId = (menuItemId: string) => (state: { stock: StockState }) =>
  state.stock.items.find(item => item.menuItemId === menuItemId);

/**
 * Check if a menu item is in stock
 */
export const selectIsInStock = (menuItemId: string) => (state: { stock: StockState }) => {
  const stockItem = state.stock.items.find(item => item.menuItemId === menuItemId);
  return stockItem ? stockItem.inStock : true; // Default to true if no stock record
};

/**
 * Get loading state
 */
export const selectStockLoading = (state: { stock: StockState }) => state.stock.loading;

/**
 * Get stock error
 */
export const selectStockError = (state: { stock: StockState }) => state.stock.error;

/**
 * Get out of stock items
 */
export const selectOutOfStockItems = (state: { stock: StockState }) =>
  state.stock.items.filter(item => !item.inStock);

/**
 * Get in stock items count
 */
export const selectInStockCount = (state: { stock: StockState }) =>
  state.stock.items.filter(item => item.inStock).length;

