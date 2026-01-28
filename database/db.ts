import * as SQLite from 'expo-sqlite';
import { MenuItem, MenuSchedule, SeasonalMenu } from '../config/config';
import { Loggers } from '../utils/logger';

// Database instance
let db: SQLite.SQLiteDatabase | null = null;

/**
 * Initialize the SQLite database
 */
export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) {
    return db;
  }

  try {
    Loggers.database.info("Initializing database...");
    db = SQLite.openDatabaseSync('restaurant.db');
    Loggers.database.info("Database opened successfully");

    // Create tables
    await createTables();
    Loggers.database.info("Database tables created successfully");

    return db;
  } catch (error) {
    Loggers.database.error("Failed to initialize database:", error);
    // Return a mock database to prevent app crash
    // The app will use sample data instead
    throw error;
  }
}

/**
 * Create all required tables
 */
export async function createTables(): Promise<void> {
  if (!db) {
    throw new Error('Database not initialized');
  }

  try {
    // Menu items table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        basePrice REAL NOT NULL,
        image TEXT,
        category TEXT NOT NULL,
        isAvailable INTEGER DEFAULT 1,
        inStock INTEGER DEFAULT 1,
        seasonalMenuId TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `);

    // Seasonal menus table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS seasonal_menus (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        startDate TEXT NOT NULL,
        endDate TEXT NOT NULL,
        startTime TEXT NOT NULL,
        endTime TEXT NOT NULL,
        isActive INTEGER DEFAULT 1,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `);

    // Menu schedules table (time-based switching)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS menu_schedules (
        id TEXT PRIMARY KEY,
        seasonalMenuId TEXT NOT NULL,
        dayOfWeek INTEGER NOT NULL,
        startTime TEXT NOT NULL,
        endTime TEXT NOT NULL,
        isActive INTEGER DEFAULT 1,
        FOREIGN KEY (seasonalMenuId) REFERENCES seasonal_menus(id)
      );
    `);

    // Stock management table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS stock (
        id TEXT PRIMARY KEY,
        menuItemId TEXT NOT NULL,
        branchId TEXT NOT NULL,
        quantity INTEGER DEFAULT 0,
        lastUpdated TEXT NOT NULL,
        FOREIGN KEY (menuItemId) REFERENCES menu_items(id)
      );
    `);

    Loggers.database.info("All database tables created successfully");
  } catch (error) {
    Loggers.database.error("Failed to create database tables:", error);
    throw error;
  }
}

/**
 * Get the database instance
 */
export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

// ============================================
// MENU ITEMS OPERATIONS
// ============================================

export interface MenuItemRow {
  id: string;
  name: string;
  description: string;
  price: number;
  basePrice: number;
  image: string;
  category: string;
  isAvailable: number;
  inStock: number;
  seasonalMenuId: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Add a new menu item
 */
export async function addMenuItem(item: MenuItem): Promise<void> {
  const database = getDatabase();
  
  await database.runAsync(
    `INSERT INTO menu_items (id, name, description, price, basePrice, image, category, isAvailable, inStock, seasonalMenuId, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      item.id,
      item.name,
      item.description,
      item.price,
      item.basePrice,
      item.image,
      item.category,
      item.isAvailable ? 1 : 0,
      item.inStock ? 1 : 0,
      item.seasonalMenuId || null,
      item.createdAt,
      item.updatedAt,
    ]
  );
}

/**
 * Get all menu items
 */
export async function getAllMenuItems(): Promise<MenuItem[]> {
  const database = getDatabase();
  
  const result = await database.getAllAsync<MenuItemRow>(
    'SELECT * FROM menu_items ORDER BY category, name'
  );
  
  return result.map(row => ({
    ...row,
    isAvailable: Boolean(row.isAvailable),
    inStock: Boolean(row.inStock),
    seasonalMenuId: row.seasonalMenuId || undefined,
  }));
}

/**
 * Get menu item by ID
 */
export async function getMenuItemById(id: string): Promise<MenuItem | null> {
  const database = getDatabase();
  
  const result = await database.getFirstAsync<MenuItemRow>(
    'SELECT * FROM menu_items WHERE id = ?',
    [id]
  );
  
  if (!result) return null;
  
  return {
    ...result,
    isAvailable: Boolean(result.isAvailable),
    inStock: Boolean(result.inStock),
    seasonalMenuId: result.seasonalMenuId || undefined,
  };
}

/**
 * Update a menu item
 */
export async function updateMenuItem(item: MenuItem): Promise<void> {
  const database = getDatabase();
  
  await database.runAsync(
    `UPDATE menu_items SET 
      name = ?, description = ?, price = ?, basePrice = ?, image = ?, 
      category = ?, isAvailable = ?, inStock = ?, seasonalMenuId = ?, updatedAt = ?
     WHERE id = ?`,
    [
      item.name,
      item.description,
      item.price,
      item.basePrice,
      item.image,
      item.category,
      item.isAvailable ? 1 : 0,
      item.inStock ? 1 : 0,
      item.seasonalMenuId || null,
      item.updatedAt,
      item.id,
    ]
  );
}

/**
 * Delete a menu item
 */
export async function deleteMenuItem(id: string): Promise<void> {
  const database = getDatabase();
  
  await database.runAsync('DELETE FROM menu_items WHERE id = ?', [id]);
}

/**
 * Assign a menu item to a seasonal menu
 */
export async function assignMenuItemToSeasonalMenu(
  menuItemId: string,
  seasonalMenuId: string
): Promise<void> {
  const database = getDatabase();
  
  await database.runAsync(
    'UPDATE menu_items SET seasonalMenuId = ?, updatedAt = ? WHERE id = ?',
    [seasonalMenuId, new Date().toISOString(), menuItemId]
  );
}

/**
 * Remove a menu item from a seasonal menu (make it a regular item)
 */
export async function removeMenuItemFromSeasonalMenu(menuItemId: string): Promise<void> {
  const database = getDatabase();
  
  await database.runAsync(
    'UPDATE menu_items SET seasonalMenuId = NULL, updatedAt = ? WHERE id = ?',
    [new Date().toISOString(), menuItemId]
  );
}

/**
 * Get menu items by seasonal menu ID
 */
export async function getMenuItemsBySeasonalMenu(seasonalMenuId: string): Promise<MenuItem[]> {
  const database = getDatabase();
  
  const result = await database.getAllAsync<MenuItemRow>(
    'SELECT * FROM menu_items WHERE seasonalMenuId = ?',
    [seasonalMenuId]
  );
  
  return result.map(row => ({
    ...row,
    isAvailable: Boolean(row.isAvailable),
    inStock: Boolean(row.inStock),
    seasonalMenuId: row.seasonalMenuId || undefined,
  }));
}

// ============================================
// SEASONAL MENU OPERATIONS
// ============================================

export interface SeasonalMenuRow {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Add a new seasonal menu
 */
export async function addSeasonalMenu(menu: SeasonalMenu): Promise<void> {
  const database = getDatabase();
  
  await database.runAsync(
    `INSERT INTO seasonal_menus (id, name, description, startDate, endDate, startTime, endTime, isActive, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      menu.id,
      menu.name,
      menu.description,
      menu.startDate,
      menu.endDate,
      menu.startTime,
      menu.endTime,
      menu.isActive ? 1 : 0,
      menu.createdAt,
      menu.updatedAt,
    ]
  );
}

/**
 * Get all seasonal menus
 */
export async function getAllSeasonalMenus(): Promise<SeasonalMenu[]> {
  const database = getDatabase();
  
  const result = await database.getAllAsync<SeasonalMenuRow>(
    'SELECT * FROM seasonal_menus ORDER BY startDate DESC'
  );
  
  return result.map(row => ({
    ...row,
    isActive: Boolean(row.isActive),
    items: [],
  }));
}

/**
 * Get seasonal menu by ID
 */
export async function getSeasonalMenuById(id: string): Promise<SeasonalMenu | null> {
  const database = getDatabase();
  
  const result = await database.getFirstAsync<SeasonalMenuRow>(
    'SELECT * FROM seasonal_menus WHERE id = ?',
    [id]
  );
  
  if (!result) return null;
  
  return {
    ...result,
    isActive: Boolean(result.isActive),
    items: [],
  };
}

/**
 * Update a seasonal menu
 */
export async function updateSeasonalMenu(menu: SeasonalMenu): Promise<void> {
  const database = getDatabase();
  
  await database.runAsync(
    `UPDATE seasonal_menus SET 
      name = ?, description = ?, startDate = ?, endDate = ?, 
      startTime = ?, endTime = ?, isActive = ?, updatedAt = ?
     WHERE id = ?`,
    [
      menu.name,
      menu.description,
      menu.startDate,
      menu.endDate,
      menu.startTime,
      menu.endTime,
      menu.isActive ? 1 : 0,
      menu.updatedAt,
      menu.id,
    ]
  );
}

/**
 * Delete a seasonal menu
 */
export async function deleteSeasonalMenu(id: string): Promise<void> {
  const database = getDatabase();
  
  // First remove seasonal menu reference from menu items
  await database.runAsync('UPDATE menu_items SET seasonalMenuId = NULL WHERE seasonalMenuId = ?', [id]);
  
  // Delete the seasonal menu
  await database.runAsync('DELETE FROM seasonal_menus WHERE id = ?', [id]);
}

// ============================================
// MENU SCHEDULE OPERATIONS
// ============================================

export interface MenuScheduleRow {
  id: string;
  seasonalMenuId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: number;
}

/**
 * Add a menu schedule
 */
export async function addMenuSchedule(schedule: MenuSchedule): Promise<void> {
  const database = getDatabase();
  
  await database.runAsync(
    `INSERT INTO menu_schedules (id, seasonalMenuId, dayOfWeek, startTime, endTime, isActive)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      schedule.id,
      schedule.seasonalMenuId,
      schedule.dayOfWeek,
      schedule.startTime,
      schedule.endTime,
      schedule.isActive ? 1 : 0,
    ]
  );
}

/**
 * Get all menu schedules
 */
export async function getAllMenuSchedules(): Promise<MenuSchedule[]> {
  const database = getDatabase();
  
  const result = await database.getAllAsync<MenuScheduleRow>(
    'SELECT * FROM menu_schedules'
  );
  
  return result.map(row => ({
    ...row,
    isActive: Boolean(row.isActive),
  }));
}

/**
 * Get schedules for a specific seasonal menu
 */
export async function getSchedulesBySeasonalMenu(seasonalMenuId: string): Promise<MenuSchedule[]> {
  const database = getDatabase();
  
  const result = await database.getAllAsync<MenuScheduleRow>(
    'SELECT * FROM menu_schedules WHERE seasonalMenuId = ?',
    [seasonalMenuId]
  );
  
  return result.map(row => ({
    ...row,
    isActive: Boolean(row.isActive),
  }));
}

/**
 * Delete a menu schedule
 */
export async function deleteMenuSchedule(id: string): Promise<void> {
  const database = getDatabase();
  
  await database.runAsync('DELETE FROM menu_schedules WHERE id = ?', [id]);
}

// ============================================
// STOCK OPERATIONS
// ============================================

export interface StockRow {
  id: string;
  menuItemId: string;
  branchId: string;
  quantity: number;
  lastUpdated: string;
}

/**
 * Update stock for a menu item
 */
export async function updateStock(menuItemId: string, branchId: string, quantity: number): Promise<void> {
  const database = getDatabase();
  const now = new Date().toISOString();
  
  // Upsert stock record
  await database.runAsync(
    `INSERT OR REPLACE INTO stock (id, menuItemId, branchId, quantity, lastUpdated)
     VALUES (?, ?, ?, ?, ?)`,
    [`${branchId}_${menuItemId}`, menuItemId, branchId, quantity, now]
  );
}

/**
 * Get stock for a menu item in a branch
 */
export async function getStock(menuItemId: string, branchId: string): Promise<number> {
  const database = getDatabase();
  
  const result = await database.getFirstAsync<StockRow>(
    'SELECT quantity FROM stock WHERE menuItemId = ? AND branchId = ?',
    [menuItemId, branchId]
  );
  
  return result?.quantity ?? 0;
}

/**
 * Get all stock for a branch
 */
export async function getAllStock(branchId: string): Promise<{ menuItemId: string; quantity: number }[]> {
  const database = getDatabase();
  
  const result = await database.getAllAsync<StockRow>(
    'SELECT menuItemId, quantity FROM stock WHERE branchId = ?',
    [branchId]
  );
  
  return result.map(row => ({
    menuItemId: row.menuItemId,
    quantity: row.quantity,
  }));
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Close the database connection
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    db.closeAsync();
    db = null;
  }
}

/**
 * Clear all data from tables (useful for testing)
 */
export async function clearAllData(): Promise<void> {
  const database = getDatabase();
  
  await database.runAsync('DELETE FROM stock');
  await database.runAsync('DELETE FROM menu_schedules');
  await database.runAsync('DELETE FROM menu_items');
  await database.runAsync('DELETE FROM seasonal_menus');
}

