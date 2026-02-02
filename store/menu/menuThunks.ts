/**
 * Menu Async Thunks
 * Async operations for menu management using API
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import { menuApi, seasonalMenuApi } from '../../apiService';
import { MenuItem, SeasonalMenu } from '../../config/config';

// Generate unique ID (fallback for local creation)
const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Load all menu items from API
 */
export const loadMenuItems = createAsyncThunk(
  'menu/loadItems',
  async () => {
    const items = await menuApi.getAll();
    return items;
  }
);

/**
 * Add a new menu item
 */
export const addMenuItemAsync = createAsyncThunk(
  'menu/addItem',
  async (item: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const newItem = await menuApi.create(item);
      return newItem;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add menu item');
    }
  }
);

/**
 * Update an existing menu item
 */
export const updateMenuItemAsync = createAsyncThunk(
  'menu/updateItem',
  async (item: MenuItem, { rejectWithValue }) => {
    try {
      const updatedItem = await menuApi.update(item);
      return updatedItem;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update menu item');
    }
  }
);

/**
 * Delete a menu item
 */
export const deleteMenuItemAsync = createAsyncThunk(
  'menu/deleteItem',
  async (id: string, { rejectWithValue }) => {
    try {
      await menuApi.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete menu item');
    }
  }
);

/**
 * Load all seasonal menus from API
 */
export const loadSeasonalMenus = createAsyncThunk(
  'menu/loadSeasonalMenus',
  async () => {
    const menus = await seasonalMenuApi.getAll();
    return menus;
  }
);

/**
 * Get current seasonal menu based on date/time
 */
export const getCurrentSeasonalMenu = createAsyncThunk(
  'menu/getCurrentSeasonalMenu',
  async () => {
    const currentMenu = await seasonalMenuApi.getCurrent();
    return currentMenu;
  }
);

/**
 * Add a new seasonal menu
 */
export const addSeasonalMenuAsync = createAsyncThunk(
  'menu/addSeasonalMenu',
  async (
    menu: Omit<SeasonalMenu, 'id' | 'createdAt' | 'updatedAt' | 'items'>,
    { rejectWithValue }
  ) => {
    try {
      const newMenu = await seasonalMenuApi.create(menu);
      return newMenu;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add seasonal menu');
    }
  }
);

/**
 * Update an existing seasonal menu
 */
export const updateSeasonalMenuAsync = createAsyncThunk(
  'menu/updateSeasonalMenu',
  async (menu: SeasonalMenu, { rejectWithValue }) => {
    try {
      const updatedMenu = await seasonalMenuApi.update(menu);
      return updatedMenu;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update seasonal menu');
    }
  }
);

/**
 * Delete a seasonal menu
 */
export const deleteSeasonalMenuAsync = createAsyncThunk(
  'menu/deleteSeasonalMenu',
  async (id: string, { rejectWithValue }) => {
    try {
      await seasonalMenuApi.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete seasonal menu');
    }
  }
);

/**
 * Assign a menu item to a seasonal menu
 */
export const assignItemToSeasonalMenuAsync = createAsyncThunk(
  'menu/assignItemToSeasonalMenu',
  async (
    { menuItemId, seasonalMenuId }: { menuItemId: string; seasonalMenuId: string },
    { rejectWithValue }
  ) => {
    try {
      const updatedItem = await menuApi.assignToSeasonalMenu(menuItemId, seasonalMenuId);
      return { menuItemId, seasonalMenuId, updatedItem };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to assign item to seasonal menu');
    }
  }
);

/**
 * Remove a menu item from a seasonal menu
 */
export const removeItemFromSeasonalMenuAsync = createAsyncThunk(
  'menu/removeItemFromSeasonalMenu',
  async (menuItemId: string, { rejectWithValue }) => {
    try {
      const updatedItem = await menuApi.removeFromSeasonalMenu(menuItemId);
      return { menuItemId, updatedItem };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to remove item from seasonal menu');
    }
  }
);
