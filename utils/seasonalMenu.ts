import { MenuItem, SeasonalMenu } from '../config/config';

/**
 * DateTime utility for seasonal menu management
 * Uses native JavaScript Date API for time-based menu switching
 */

// Days of week enum
export enum DayOfWeek {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}

/**
 * Get current date and time
 */
export function getCurrentDateTime(): Date {
  return new Date();
}

/**
 * Get current time in HH:mm format
 */
export function getCurrentTime(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Get current day of week (0-6, Sunday-Saturday)
 */
export function getCurrentDayOfWeek(): DayOfWeek {
  return getCurrentDateTime().getDay() as DayOfWeek;
}

/**
 * Get current date in ISO format (YYYY-MM-DD)
 */
export function getCurrentDate(): string {
  const now = getCurrentDateTime();
  return now.toISOString().split('T')[0];
}

/**
 * Parse time string (HH:mm) to minutes since midnight
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Compare two time strings
 * Returns -1 if time1 < time2, 0 if equal, 1 if time1 > time2
 */
export function compareTime(time1: string, time2: string): number {
  const mins1 = timeToMinutes(time1);
  const mins2 = timeToMinutes(time2);
  
  if (mins1 < mins2) return -1;
  if (mins1 > mins2) return 1;
  return 0;
}

/**
 * Check if current time is within the specified time range
 */
export function isTimeInRange(startTime: string, endTime: string): boolean {
  const currentTime = getCurrentTime();
  
  // Handle overnight ranges (e.g., 22:00 to 06:00)
  if (startTime > endTime) {
    return currentTime >= startTime || currentTime <= endTime;
  }
  
  return currentTime >= startTime && currentTime <= endTime;
}

/**
 * Parse date string (YYYY-MM-DD) to Date object
 */
export function parseDate(dateString: string): Date {
  return new Date(dateString + 'T00:00:00');
}

/**
 * Check if current date is within the specified date range
 */
export function isDateInRange(startDate: string, endDate: string): boolean {
  const currentDate = getCurrentDate();
  return currentDate >= startDate && currentDate <= endDate;
}

/**
 * Check if a date is valid
 */
export function isValidDate(dateString: string): boolean {
  const date = parseDate(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Check if a time string is valid (HH:mm format)
 */
export function isValidTime(timeString: string): boolean {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeString);
}

/**
 * Format Date object to ISO date string (YYYY-MM-DD)
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Format Date object to time string (HH:mm)
 */
export function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Get day name from day of week
 */
export function getDayName(dayOfWeek: DayOfWeek): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek];
}

/**
 * Get day abbreviation from day of week
 */
export function getDayAbbreviation(dayOfWeek: DayOfWeek): string {
  const abbreviations = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return abbreviations[dayOfWeek];
}

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
      const isInDateRange = currentDate >= menu.startDate && currentDate <= menu.endDate;
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
      
      const isInDateRange = currentDate >= menu.startDate && currentDate <= menu.endDate;
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
    const formatSingleTime = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
    };

    return `${formatSingleTime(startTime)} - ${formatSingleTime(endTime)}`;
  }
}

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

