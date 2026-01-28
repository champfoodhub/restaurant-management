import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MenuItem, SeasonalMenu } from '../config/config';
import {
  assignMenuItemToSeasonalMenu,
  addMenuItem as dbAddMenuItem,
  addSeasonalMenu as dbAddSeasonalMenu,
  deleteMenuItem as dbDeleteMenuItem,
  deleteSeasonalMenu as dbDeleteSeasonalMenu,
  updateMenuItem as dbUpdateMenuItem,
  updateSeasonalMenu as dbUpdateSeasonalMenu,
  getAllMenuItems,
  getAllSeasonalMenus,
  initDatabase,
  removeMenuItemFromSeasonalMenu
} from '../database/db';
import { Loggers } from '../utils/logger';

// Generate unique ID
const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// State interfaces
export interface MenuState {
  items: MenuItem[];
  seasonalMenus: SeasonalMenu[];
  currentSeasonalMenu: SeasonalMenu | null;
  activeSeasonalMenus: SeasonalMenu[];
  loading: boolean;
  error: string | null;
  selectedCategory: string | null;
}

const initialState: MenuState = {
  items: [],
  seasonalMenus: [],
  currentSeasonalMenu: null,
  activeSeasonalMenus: [],
  loading: false,
  error: null,
  selectedCategory: null,
};

export const initializeMenuDatabase = createAsyncThunk(
  'menu/initializeDatabase',
  async () => {
    await initDatabase();
    Loggers.menu.info('Menu database initialized');
  }
);

/**
 * Load all menu items from database
 */
export const loadMenuItems = createAsyncThunk(
  'menu/loadItems',
  async () => {
    const items = await getAllMenuItems();
    Loggers.menu.info(`Loaded ${items.length} menu items`);
    return items;
  }
);

/**
 * Add a new menu item (HQ only)
 */
export const addMenuItem = createAsyncThunk(
  'menu/addItem',
  async (item: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const now = new Date().toISOString();
      const newItem: MenuItem = {
        ...item,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      };
      
      await dbAddMenuItem(newItem);
      Loggers.menu.info(`Added menu item: ${newItem.name}`);
      return newItem;
    } catch (error) {
      Loggers.menu.error('Failed to add menu item', error);
      return rejectWithValue('Failed to add menu item');
    }
  }
);

/**
 * Update an existing menu item (HQ only)
 */
export const updateMenuItem = createAsyncThunk(
  'menu/updateItem',
  async (item: MenuItem, { rejectWithValue }) => {
    try {
      const updatedItem = {
        ...item,
        updatedAt: new Date().toISOString(),
      };
      
      await dbUpdateMenuItem(updatedItem);
      Loggers.menu.info(`Updated menu item: ${updatedItem.name}`);
      return updatedItem;
    } catch (error) {
      Loggers.menu.error('Failed to update menu item', error);
      return rejectWithValue('Failed to update menu item');
    }
  }
);

/**
 * Delete a menu item (HQ only)
 */
export const deleteMenuItem = createAsyncThunk(
  'menu/deleteItem',
  async (id: string, { rejectWithValue }) => {
    try {
      await dbDeleteMenuItem(id);
      Loggers.menu.info(`Deleted menu item: ${id}`);
      return id;
    } catch (error) {
      Loggers.menu.error('Failed to delete menu item', error);
      return rejectWithValue('Failed to delete menu item');
    }
  }
);

/**
 * Load all seasonal menus from database
 */
export const loadSeasonalMenus = createAsyncThunk(
  'menu/loadSeasonalMenus',
  async () => {
    const menus = await getAllSeasonalMenus();
    Loggers.menu.info(`Loaded ${menus.length} seasonal menus`);
    return menus;
  }
);

/**
 * Add a new seasonal menu (HQ only)
 */
export const addSeasonalMenu = createAsyncThunk(
  'menu/addSeasonalMenu',
  async (
    menu: Omit<SeasonalMenu, 'id' | 'createdAt' | 'updatedAt' | 'items'>,
    { rejectWithValue }
  ) => {
    try {
      const now = new Date().toISOString();
      const newMenu: SeasonalMenu = {
        ...menu,
        id: generateId(),
        items: [],
        createdAt: now,
        updatedAt: now,
      };
      
      await dbAddSeasonalMenu(newMenu);
      Loggers.menu.info(`Added seasonal menu: ${newMenu.name}`);
      return newMenu;
    } catch (error) {
      Loggers.menu.error('Failed to add seasonal menu', error);
      return rejectWithValue('Failed to add seasonal menu');
    }
  }
);

/**
 * Update an existing seasonal menu (HQ only)
 */
export const updateSeasonalMenu = createAsyncThunk(
  'menu/updateSeasonalMenu',
  async (menu: SeasonalMenu, { rejectWithValue }) => {
    try {
      const updatedMenu = {
        ...menu,
        updatedAt: new Date().toISOString(),
      };
      
      await dbUpdateSeasonalMenu(updatedMenu);
      Loggers.menu.info(`Updated seasonal menu: ${updatedMenu.name}`);
      return updatedMenu;
    } catch (error) {
      Loggers.menu.error('Failed to update seasonal menu', error);
      return rejectWithValue('Failed to update seasonal menu');
    }
  }
);

/**
 * Delete a seasonal menu (HQ only)
 */
export const deleteSeasonalMenu = createAsyncThunk(
  'menu/deleteSeasonalMenu',
  async (id: string, { rejectWithValue }) => {
    try {
      await dbDeleteSeasonalMenu(id);
      Loggers.menu.info(`Deleted seasonal menu: ${id}`);
      return id;
    } catch (error) {
      Loggers.menu.error('Failed to delete seasonal menu', error);
      return rejectWithValue('Failed to delete seasonal menu');
    }
  }
);

/**
 * Refresh current seasonal menu based on time
 */
export const refreshCurrentSeasonalMenu = createAsyncThunk(
  'menu/refreshCurrentSeasonalMenu',
  async (_, { getState }) => {
    const state = getState() as { menu: MenuState };
    const seasonalMenus = state.menu.seasonalMenus;
    
    // Create manager locally for computation (not stored in Redux)
    const { createSeasonalMenuManager } = await import('../utils/seasonalMenu');
    const manager = createSeasonalMenuManager(seasonalMenus);
    const currentMenu = manager.getCurrentSeasonalMenu();
    const activeMenus = manager.getAllCurrentlyActiveMenus();
    
    return { currentMenu, activeMenus };
  }
);

/**
 * Assign a menu item to a seasonal menu (HQ only)
 */
export const assignItemToSeasonalMenu = createAsyncThunk(
  'menu/assignItemToSeasonalMenu',
  async (
    { menuItemId, seasonalMenuId }: { menuItemId: string; seasonalMenuId: string },
    { rejectWithValue }
  ) => {
    try {
      await assignMenuItemToSeasonalMenu(menuItemId, seasonalMenuId);
      
      // Get the updated item from menu items
      const state = { menu: { items: [] as MenuItem[], seasonalMenus: [] as SeasonalMenu[] } };
      const { items } = state.menu;
      const item = items.find(i => i.id === menuItemId);
      
      Loggers.menu.info(`Assigned item ${item?.name || menuItemId} to seasonal menu`);
      
      return { menuItemId, seasonalMenuId };
    } catch (error) {
      Loggers.menu.error('Failed to assign item to seasonal menu', error);
      return rejectWithValue('Failed to assign item to seasonal menu');
    }
  }
);

/**
 * Remove a menu item from a seasonal menu (HQ only)
 */
export const removeItemFromSeasonalMenu = createAsyncThunk(
  'menu/removeItemFromSeasonalMenu',
  async (menuItemId: string, { rejectWithValue }) => {
    try {
      await removeMenuItemFromSeasonalMenu(menuItemId);
      Loggers.menu.info(`Removed item ${menuItemId} from seasonal menu`);
      return menuItemId;
    } catch (error) {
      Loggers.menu.error('Failed to remove item from seasonal menu', error);
      return rejectWithValue('Failed to remove item from seasonal menu');
    }
  }
);

// Menu slice
const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
    },
    setItems: (state, action: PayloadAction<MenuItem[]>) => {
      state.items = action.payload;
    },
    setSeasonalMenus: (state, action: PayloadAction<SeasonalMenu[]>) => {
      state.seasonalMenus = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Initialize database
    builder
      .addCase(initializeMenuDatabase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeMenuDatabase.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(initializeMenuDatabase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to initialize database';
      });

    // Load menu items
    builder
      .addCase(loadMenuItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadMenuItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadMenuItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load menu items';
      });

    // Add menu item
    builder
      .addCase(addMenuItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addMenuItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(addMenuItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update menu item
    builder
      .addCase(updateMenuItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMenuItem.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateMenuItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete menu item
    builder
      .addCase(deleteMenuItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMenuItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item.id !== action.payload);
      })
      .addCase(deleteMenuItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Load seasonal menus
    builder
      .addCase(loadSeasonalMenus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadSeasonalMenus.fulfilled, (state, action) => {
        state.loading = false;
        state.seasonalMenus = action.payload;
      })
      .addCase(loadSeasonalMenus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load seasonal menus';
      });

    // Add seasonal menu
    builder
      .addCase(addSeasonalMenu.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addSeasonalMenu.fulfilled, (state, action) => {
        state.loading = false;
        state.seasonalMenus.push(action.payload);
      })
      .addCase(addSeasonalMenu.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update seasonal menu
    builder
      .addCase(updateSeasonalMenu.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSeasonalMenu.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.seasonalMenus.findIndex(m => m.id === action.payload.id);
        if (index !== -1) {
          state.seasonalMenus[index] = action.payload;
        }
      })
      .addCase(updateSeasonalMenu.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete seasonal menu
    builder
      .addCase(deleteSeasonalMenu.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSeasonalMenu.fulfilled, (state, action) => {
        state.loading = false;
        state.seasonalMenus = state.seasonalMenus.filter(m => m.id !== action.payload);
      })
      .addCase(deleteSeasonalMenu.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Refresh current seasonal menu
    builder
      .addCase(refreshCurrentSeasonalMenu.fulfilled, (state, action) => {
        state.currentSeasonalMenu = action.payload.currentMenu;
        state.activeSeasonalMenus = action.payload.activeMenus;
      });

    // Assign item to seasonal menu
    builder
      .addCase(assignItemToSeasonalMenu.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignItemToSeasonalMenu.fulfilled, (state, action) => {
        state.loading = false;
        // Update the item's seasonalMenuId
        const index = state.items.findIndex(item => item.id === action.payload.menuItemId);
        if (index !== -1) {
          state.items[index] = {
            ...state.items[index],
            seasonalMenuId: action.payload.seasonalMenuId,
            updatedAt: new Date().toISOString(),
          };
        }
      })
      .addCase(assignItemToSeasonalMenu.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Remove item from seasonal menu
    builder
      .addCase(removeItemFromSeasonalMenu.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeItemFromSeasonalMenu.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item.id === action.payload);
        if (index !== -1) {
          state.items[index] = {
            ...state.items[index],
            seasonalMenuId: undefined,
            updatedAt: new Date().toISOString(),
          };
        }
      })
      .addCase(removeItemFromSeasonalMenu.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  setSelectedCategory,
  setItems,
  setSeasonalMenus,
  clearError,
} = menuSlice.actions;

// Export reducer
export default menuSlice.reducer;

// Selectors

/**
 * Get all menu items
 */
export const selectAllMenuItems = (state: { menu: MenuState }) => state.menu.items;

/**
 * Get all categories (memoized with stable reference)
 * Fix: Use JSON stringify comparison instead of reference since Redux creates new array references
 */
let cachedCategories: string[] | null = null;
let lastItemsJson: string | null = null;

export const selectCategories = (state: { menu: MenuState }) => {
  const items = state.menu.items;
  
  // Create a stable representation for comparison
  const currentItemsJson = JSON.stringify(items.map(i => i.category).sort());
  
  // Return cached categories if items haven't changed
  if (cachedCategories !== null && lastItemsJson === currentItemsJson) {
    return cachedCategories;
  }
  
  // Compute and cache
  const categories = new Set(items.map(item => item.category));
  cachedCategories = Array.from(categories).sort();
  lastItemsJson = currentItemsJson;
  
  return cachedCategories;
};

/**
 * Get filtered items by category
 */
export const selectItemsByCategory = (state: { menu: MenuState }, category: string | null) => {
  if (!category) return state.menu.items;
  return state.menu.items.filter(item => item.category === category);
};

/**
 * Get current seasonal menu
 */
export const selectCurrentSeasonalMenu = (state: { menu: MenuState }) => state.menu.currentSeasonalMenu;

/**
 * Get all seasonal menus
 */
export const selectAllSeasonalMenus = (state: { menu: MenuState }) => state.menu.seasonalMenus;

/**
 * Get items for current seasonal menu
 */
export const selectCurrentSeasonalMenuItems = (state: { menu: MenuState }) => {
  const currentMenu = state.menu.currentSeasonalMenu;
  if (!currentMenu) return [];
  return state.menu.items.filter(item => item.seasonalMenuId === currentMenu.id);
};

/**
 * Get loading state
 */
export const selectMenuLoading = (state: { menu: MenuState }) => state.menu.loading;

/**
 * Get menu error
 */
export const selectMenuError = (state: { menu: MenuState }) => state.menu.error;

/**
 * Get menu item by ID
 */
export const selectMenuItemById = (id: string) => (state: { menu: MenuState }) =>
  state.menu.items.find(item => item.id === id);

