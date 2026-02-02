/**
 * Date and Time Utilities
 * Helper functions for date/time operations
 */

/**
 * Get current date in YYYY-MM-DD format
 */
export const getCurrentDate = (): string => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

/**
 * Get current time in HH:MM format
 */
export const getCurrentTime = (): string => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Get current day of week (0-6, Sunday = 0)
 */
export const getCurrentDayOfWeek = (): number => {
  return new Date().getDay();
};

/**
 * Check if a date is within a range
 */
export const isDateInRange = (startDate: string, endDate: string, checkDate?: string): boolean => {
  const current = checkDate || getCurrentDate();
  return current >= startDate && current <= endDate;
};

/**
 * Check if a time is within a range
 */
export const isTimeInRange = (startTime: string, endTime: string, checkTime?: string): boolean => {
  const current = checkTime || getCurrentTime();
  return current >= startTime && current <= endTime;
};

/**
 * Parse date string to Date object
 */
export const parseDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Format time range for display
 */
export const formatTimeRange = (startTime: string, endTime: string): string => {
  return `${startTime} - ${endTime}`;
};

export default {
  getCurrentDate,
  getCurrentTime,
  getCurrentDayOfWeek,
  isDateInRange,
  isTimeInRange,
  parseDate,
  formatTimeRange,
};
