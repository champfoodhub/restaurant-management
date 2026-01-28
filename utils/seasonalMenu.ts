import { MenuItem, SeasonalMenu } from '../config/config';
import {
  formatTimeRange,
  getCurrentDate,
  getCurrentDayOfWeek,
  getCurrentTime,
  isDateInRange,
  isTimeInRange,
  parseDate
} from './dateTime';

/**
 * Seasonal Menu Manager
 * Handles time-based menu switching
 */
export class SeasonalMenuManager {
  private seasonalMenus: SeasonalMenu[];

  constructor(seasonalMenus: SeasonalMenu[] = []) {
    this.seasonalMenus = seasonalMenus;
  }

  /**
   * Update the list of seasonal menus
   */
  setSeasonalMenus(menus: SeasonalMenu[]): void {
    this.seasonalMenus = menus;
  }

  /**
   * Get all active seasonal menus
   */
  getActiveSeasonalMenus(): SeasonalMenu[] {
    return this.seasonalMenus.filter(menu => menu.isActive);
  }

  /**
   * Get the current applicable seasonal menu based on date and time
   */
  getCurrentSeasonalMenu(): SeasonalMenu | null {
    const currentDate = getCurrentDate();
    const currentTime = getCurrentTime();
    const currentDay = getCurrentDayOfWeek();

    // Find a menu that matches the current date and time
    for (const menu of this.seasonalMenus) {
      if (!menu.isActive) continue;

      // Check date range
      const isInDateRange = isDateInRange(menu.startDate, menu.endDate);
      if (!isInDateRange) continue;

      // Check time range
      const isInTimeRange = isTimeInRange(menu.startTime, menu.endTime);
      if (!isInTimeRange) continue;

      return menu;
    }

    return null;
  }

  /**
   * Get all menus that are currently active (for preview/admin view)
   */
  getAllCurrentlyActiveMenus(): SeasonalMenu[] {
    const currentDate = getCurrentDate();
    const currentTime = getCurrentTime();

    return this.seasonalMenus.filter(menu => {
      if (!menu.isActive) return false;
      
      const isInDateRange = isDateInRange(menu.startDate, menu.endDate);
      if (!isInDateRange) return false;

      const isInTimeRange = isTimeInRange(menu.startTime, menu.endTime);
      return isInTimeRange;
    });
  }

  /**
   * Get menus by date range (for admin calendar view)
   */
  getMenusByDateRange(startDate: string, endDate: string): SeasonalMenu[] {
    return this.seasonalMenus.filter(menu => {
      return (
        menu.startDate <= endDate &&
        menu.endDate >= startDate
      );
    });
  }

  /**
   * Check if a menu is currently active
   */
  isMenuActive(menuId: string): boolean {
    const menu = this.seasonalMenus.find(m => m.id === menuId);
    if (!menu) return false;

    const currentDate = getCurrentDate();
    const currentTime = getCurrentTime();

    if (!menu.isActive) return false;
    if (currentDate < menu.startDate || currentDate > menu.endDate) return false;
    if (!isTimeInRange(menu.startTime, menu.endTime)) return false;

    return true;
  }

  /**
   * Get menu duration in days
   */
  getMenuDurationDays(menu: SeasonalMenu): number {
    const start = parseDate(menu.startDate);
    const end = parseDate(menu.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  /**
   * Get time until menu ends (in hours)
   */
  getHoursUntilMenuEnd(menu: SeasonalMenu): number | null {
    if (!this.isMenuActive(menu.id)) return null;

    const now = new Date();
    const [endHours, endMinutes] = menu.endTime.split(':').map(Number);
    
    const endDateTime = new Date(now);
    endDateTime.setHours(endHours, endMinutes, 0, 0);

    // If end time is earlier than current time, assume next day
    if (endDateTime <= now) {
      endDateTime.setDate(endDateTime.getDate() + 1);
    }

    const diffMs = endDateTime.getTime() - now.getTime();
    return Math.max(0, diffMs / (1000 * 60 * 60));
  }

  /**
   * Format menu duration for display
   */
  formatMenuDuration(menu: SeasonalMenu): string {
    const start = parseDate(menu.startDate);
    const end = parseDate(menu.endDate);
    
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    const duration = this.getMenuDurationDays(menu);
    
    return `${startStr} - ${endStr} (${duration} day${duration > 1 ? 's' : ''})`;
  }

  /**
   * Format time range for display
   */
  formatTimeRange(startTime: string, endTime: string): string {
    return formatTimeRange(startTime, endTime);
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Filter menu items by seasonal menu
 */
export function filterItemsBySeasonalMenu(items: MenuItem[], seasonalMenuId?: string): MenuItem[] {
  if (!seasonalMenuId) {
    return items.filter(item => !item.seasonalMenuId);
  }
  return items.filter(item => item.seasonalMenuId === seasonalMenuId);
}

/**
 * Get only available items (in stock and available)
 */
export function getAvailableItems(items: MenuItem[]): MenuItem[] {
  return items.filter(item => item.isAvailable && item.inStock);
}

/**
 * Create a seasonal menu manager instance
 */
export function createSeasonalMenuManager(menus: SeasonalMenu[]): SeasonalMenuManager {
  return new SeasonalMenuManager(menus);
}

