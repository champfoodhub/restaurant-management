/**
 * Menu API Routes
 * /api/menu endpoints
 */

import { Request, Response, Router } from 'express';
import { menuStore } from '../dataStore';

const router = Router();

/**
 * GET /api/menu
 * Get all menu items with optional filtering
 * Query params: category, seasonalMenuId
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const { category, seasonalMenuId } = req.query;
    
    const items = menuStore.getAll({
      category: category as string,
      seasonalMenuId: seasonalMenuId as string,
    });
    
    res.json({
      success: true,
      data: items,
      count: items.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch menu items',
    });
  }
});

/**
 * GET /api/menu/:id
 * Get single menu item by ID
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const item = menuStore.getById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Menu item not found',
      });
    }
    
    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch menu item',
    });
  }
});

/**
 * POST /api/menu
 * Create new menu item
 */
router.post('/', (req: Request, res: Response) => {
  try {
    const { name, description, price, basePrice, image, category, isAvailable, inStock, seasonalMenuId } = req.body;
    
    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        error: 'Name, price, and category are required',
      });
    }
    
    const item = menuStore.create({
      name,
      description: description || '',
      price: Number(price),
      basePrice: Number(basePrice) || Number(price),
      image: image || '',
      category,
      isAvailable: isAvailable !== false,
      inStock: inStock !== false,
      seasonalMenuId,
    });
    
    res.status(201).json({
      success: true,
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create menu item',
    });
  }
});

/**
 * PUT /api/menu/:id
 * Update menu item
 */
router.put('/:id', (req: Request, res: Response) => {
  try {
    const updated = menuStore.update(req.params.id, req.body);
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Menu item not found',
      });
    }
    
    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update menu item',
    });
  }
});

/**
 * DELETE /api/menu/:id
 * Delete menu item
 */
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const deleted = menuStore.delete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Menu item not found',
      });
    }
    
    res.json({
      success: true,
      message: 'Menu item deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete menu item',
    });
  }
});

/**
 * POST /api/menu/:itemId/seasonal-menu
 * Assign item to seasonal menu
 */
router.post('/:itemId/seasonal-menu', (req: Request, res: Response) => {
  try {
    const { seasonalMenuId } = req.body;
    
    const updated = menuStore.assignToSeasonalMenu(
      req.params.itemId,
      seasonalMenuId
    );
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Menu item not found',
      });
    }
    
    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to assign item to seasonal menu',
    });
  }
});

/**
 * DELETE /api/menu/:itemId/seasonal-menu
 * Remove item from seasonal menu
 */
router.delete('/:itemId/seasonal-menu', (req: Request, res: Response) => {
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
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to remove item from seasonal menu',
    });
  }
});

export default router;
