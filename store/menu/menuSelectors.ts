/**
 * Menu Selectors
 * Memoized selectors for menu state
 */

import { MenuItem, SeasonalMenu } from '../../config/config';

// State type
export interface MenuState {
  items: MenuItem[];
  seasonalMenus: SeasonalMenu[];
  currentSeasonalMenu: SeasonalMenu | null;
  activeSeasonalMenus: SeasonalMenu[];
  loading: boolean;
  error: string | null;
  selectedCategory: string | null;
}

// Initial state
export const menuInitialState: MenuState = {
  items: [],
  seasonalMenus: [],
  currentSeasonalMenu: null,
  activeSeasonalMenus: [],
  loading: false,
  error: null,
  selectedCategory: null,
};

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

/**
 * Get active seasonal menus
 */
export const selectActiveSeasonalMenus = (state: { menu: MenuState }) => state.menu.activeSeasonalMenus;

/**
 * Get selected category
 */
export const selectSelectedCategory = (state: { menu: MenuState }) => state.menu.selectedCategory;

