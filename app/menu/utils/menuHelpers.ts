import { useCallback, useMemo } from "react";
import { MenuItem as ConfigMenuItem, SeasonalMenu } from "../../../config/config";
import { SAMPLE_MENU_ITEMS } from "../../../utils/menuConstants";

/**
 * Get displayed menu items based on current seasonal menu
 */
export function getDisplayedItems(
  menuItems: ConfigMenuItem[],
  currentSeasonalMenu: SeasonalMenu | null,
  isHQ: () => boolean
): ConfigMenuItem[] {
  if (currentSeasonalMenu && isHQ()) {
    return menuItems.length > 0 ? menuItems : SAMPLE_MENU_ITEMS;
  }
  if (currentSeasonalMenu) {
    const seasonalItems = menuItems.filter(
      (item) => item.seasonalMenuId === currentSeasonalMenu.id
    );
    if (seasonalItems.length > 0) return seasonalItems;
  }
  return menuItems.length > 0 ? menuItems : SAMPLE_MENU_ITEMS;
}

/**
 * Filter items by category
 */
export function filterByCategory(
  items: ConfigMenuItem[],
  category: string | null
): ConfigMenuItem[] {
  if (!category) return items;
  return items.filter((item) => item.category === category);
}

/**
 * Create a hook for filtering displayed items
 */
export function useFilteredItems(
  menuItems: ConfigMenuItem[],
  currentSeasonalMenu: SeasonalMenu | null,
  selectedCategory: string | null,
  isHQ: () => boolean
) {
  const displayedItems = useMemo(
    () => getDisplayedItems(menuItems, currentSeasonalMenu, isHQ),
    [menuItems, currentSeasonalMenu, isHQ]
  );

  const filteredItems = useMemo(
    () => filterByCategory(displayedItems, selectedCategory),
    [displayedItems, selectedCategory]
  );

  return { displayedItems, filteredItems };
}

/**
 * Get items not already in the selected seasonal menu
 */
export function getAvailableItemsForSeasonalMenu(
  menuItems: ConfigMenuItem[],
  selectedSeasonalMenu: SeasonalMenu | null
): ConfigMenuItem[] {
  if (!selectedSeasonalMenu) return [];
  return menuItems.filter(
    (item) => item.seasonalMenuId !== selectedSeasonalMenu.id
  );
}

/**
 * Filter items by search query
 */
export function filterBySearchQuery(
  items: ConfigMenuItem[],
  query: string
): ConfigMenuItem[] {
  if (!query.trim()) return items;
  const lowerQuery = query.toLowerCase();
  return items.filter(
    (item) =>
      item.name.toLowerCase().includes(lowerQuery) ||
      item.category.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Create a hook for filtering items by search query
 */
export function useSearchFilteredItems(
  getAvailableItems: () => ConfigMenuItem[],
  searchQuery: string
) {
  return useCallback(() => {
    const availableItems = getAvailableItems();
    return filterBySearchQuery(availableItems, searchQuery);
  }, [getAvailableItems, searchQuery]);
}

