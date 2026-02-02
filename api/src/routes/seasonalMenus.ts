/**
 * Seasonal Menus API Routes
 * /api/seasonal-menus endpoints
 */

import { Request, Response, Router } from 'express';
import { menuStore, seasonalMenuStore } from '../dataStore';
import { getCurrentDate, getCurrentTime, isDateInRange, isTimeInRange } from '../utils/dateTime';

const router = Router();

/**
 * GET /api/seasonal-menus
 * Get all seasonal menus
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const menus = seasonalMenuStore.getAll();
    
    res.json({
      success: true,
      data: menus,
      count: menus.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch seasonal menus',
    });
  }
});

/**
 * GET /api/seasonal-menus/active
 * Get all currently active seasonal menus (based on date/time)
 */
router.get('/active', (req: Request, res: Response) => {
  try {
    const currentDate = getCurrentDate();
    const currentTime = getCurrentTime();
    
    const allMenus = seasonalMenuStore.getAll();
    const activeMenus = allMenus.filter(menu => {
      if (!menu.isActive) return false;
      
      const inDateRange = isDateInRange(menu.startDate, menu.endDate, currentDate);
      if (!inDateRange) return false;
      
      return isTimeInRange(menu.startTime, menu.endTime, currentTime);
    });
    
    res.json({
      success: true,
      data: activeMenus,
      count: activeMenus.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch active seasonal menus',
    });
  }
});

/**
 * GET /api/seasonal-menus/current
 * Get the current active seasonal menu (single)
 */
router.get('/current', (req: Request, res: Response) => {
  try {
    const currentDate = getCurrentDate();
    const currentTime = getCurrentTime();
    
    const allMenus = seasonalMenuStore.getAll();
    const currentMenu = allMenus.find(menu => {
      if (!menu.isActive) return false;
      
      const inDateRange = isDateInRange(menu.startDate, menu.endDate, currentDate);
      if (!inDateRange) return false;
      
      return isTimeInRange(menu.startTime, menu.endTime, currentTime);
    });
    
    if (!currentMenu) {
      return res.json({
        success: true,
        data: null,
        message: 'No active seasonal menu',
      });
    }
    
    res.json({
      success: true,
      data: currentMenu,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch current seasonal menu',
    });
  }
});

/**
 * GET /api/seasonal-menus/:id
 * Get single seasonal menu by ID
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const menu = seasonalMenuStore.getById(req.params.id);
    
    if (!menu) {
      return res.status(404).json({
        success: false,
        error: 'Seasonal menu not found',
      });
    }
    
    res.json({
      success: true,
      data: menu,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch seasonal menu',
    });
  }
});

/**
 * POST /api/seasonal-menus
 * Create new seasonal menu
 */
router.post('/', (req: Request, res: Response) => {
  try {
    const { name, description, startDate, endDate, startTime, endTime, isActive } = req.body;
    
    if (!name || !startDate || !endDate || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        error: 'Name, startDate, endDate, startTime, and endTime are required',
      });
    }
    
    const menu = seasonalMenuStore.create({
      name,
      description: description || '',
      startDate,
      endDate,
      startTime,
      endTime,
      isActive: isActive !== false,
    });
    
    res.status(201).json({
      success: true,
      data: menu,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create seasonal menu',
    });
  }
});

/**
 * PUT /api/seasonal-menus/:id
 * Update seasonal menu
 */
router.put('/:id', (req: Request, res: Response) => {
  try {
    const updated = seasonalMenuStore.update(req.params.id, req.body);
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Seasonal menu not found',
      });
    }
    
    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update seasonal menu',
    });
  }
});

/**
 * DELETE /api/seasonal-menus/:id
 * Delete seasonal menu
 */
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const deleted = seasonalMenuStore.delete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Seasonal menu not found',
      });
    }
    
    res.json({
      success: true,
      message: 'Seasonal menu deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete seasonal menu',
    });
  }
});

/**
 * POST /api/seasonal-menus/:menuId/items/:itemId
 * Add menu item to seasonal menu
 */
router.post('/:menuId/items/:itemId', (req: Request, res: Response) => {
  try {
    const menu = seasonalMenuStore.getById(req.params.menuId);
    if (!menu) {
      return res.status(404).json({
        success: false,
        error: 'Seasonal menu not found',
      });
    }
    
    const updated = menuStore.assignToSeasonalMenu(req.params.itemId, req.params.menuId);
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Menu item not found',
      });
    }
    
    res.json({
      success: true,
      data: updated,
      message: 'Item added to seasonal menu',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to add item to seasonal menu',
    });
  }
});

/**
 * DELETE /api/seasonal-menus/items/:itemId
 * Remove menu item from seasonal menu
 */
router.delete('/items/:itemId', (req: Request, res: Response) => {
  try {
    const updated = menuStore.assignToSeasonalMenu(req.params.itemId, null);
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Menu item not found',
      });
    }
    
    res.json({
      success: true,
      data: updated,
      message: 'Item removed from seasonal menu',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to remove item from seasonal menu',
    });
  }
});

export default router;
