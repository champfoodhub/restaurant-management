/**
 * Stock API Routes
 * /api/stock endpoints
 */

import { Request, Response, Router } from 'express';
import { stockStore } from '../dataStore';

const router = Router();

/**
 * GET /api/stock
 * Get all stock for a branch
 * Query params: branchId (required)
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const branchId = req.query.branchId as string;
    
    if (!branchId) {
      return res.status(400).json({
        success: false,
        error: 'branchId is required',
      });
    }
    
    const stock = stockStore.getAll(branchId);
    
    res.json({
      success: true,
      data: stock,
      count: stock.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stock',
    });
  }
});

/**
 * GET /api/stock/:itemId
 * Get stock for specific item in a branch
 * Query params: branchId (required)
 */
router.get('/:itemId', (req: Request, res: Response) => {
  try {
    const branchId = req.query.branchId as string;
    
    if (!branchId) {
      return res.status(400).json({
        success: false,
        error: 'branchId is required',
      });
    }
    
    const stock = stockStore.get(req.params.itemId, branchId);
    
    if (!stock) {
      return res.json({
        success: true,
        data: { menuItemId: req.params.itemId, branchId, quantity: 100, inStock: true },
      });
    }
    
    res.json({
      success: true,
      data: {
        ...stock,
        inStock: stock.quantity > 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stock',
    });
  }
});

/**
 * PUT /api/stock/:itemId
 * Update stock quantity for an item
 * Query params: branchId (required)
 * Body: { quantity }
 */
router.put('/:itemId', (req: Request, res: Response) => {
  try {
    const branchId = req.query.branchId as string;
    const { quantity } = req.body;
    
    if (!branchId) {
      return res.status(400).json({
        success: false,
        error: 'branchId is required',
      });
    }
    
    if (quantity === undefined) {
      return res.status(400).json({
        success: false,
        error: 'quantity is required',
      });
    }
    
    const stock = stockStore.update(req.params.itemId, branchId, Number(quantity));
    
    res.json({
      success: true,
      data: {
        ...stock,
        inStock: stock.quantity > 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update stock',
    });
  }
});

/**
 * POST /api/stock/:itemId/in-stock
 * Mark item as in stock
 * Query params: branchId (required)
 */
router.post('/:itemId/in-stock', (req: Request, res: Response) => {
  try {
    const branchId = req.query.branchId as string;
    
    if (!branchId) {
      return res.status(400).json({
        success: false,
        error: 'branchId is required',
      });
    }
    
    const stock = stockStore.setInStock(req.params.itemId, branchId);
    
    res.json({
      success: true,
      data: {
        ...stock,
        inStock: true,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to set in stock',
    });
  }
});

/**
 * POST /api/stock/:itemId/out-of-stock
 * Mark item as out of stock
 * Query params: branchId (required)
 */
router.post('/:itemId/out-of-stock', (req: Request, res: Response) => {
  try {
    const branchId = req.query.branchId as string;
    
    if (!branchId) {
      return res.status(400).json({
        success: false,
        error: 'branchId is required',
      });
    }
    
    const stock = stockStore.setOutOfStock(req.params.itemId, branchId);
    
    res.json({
      success: true,
      data: {
        ...stock,
        inStock: false,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to set out of stock',
    });
  }
});

/**
 * POST /api/stock/:itemId/toggle
 * Toggle stock status
 * Query params: branchId (required)
 */
router.post('/:itemId/toggle', (req: Request, res: Response) => {
  try {
    const branchId = req.query.branchId as string;
    
    if (!branchId) {
      return res.status(400).json({
        success: false,
        error: 'branchId is required',
      });
    }
    
    const isCurrentlyInStock = stockStore.isInStock(req.params.itemId, branchId);
    const newQuantity = isCurrentlyInStock ? 0 : 100;
    
    const stock = stockStore.update(req.params.itemId, branchId, newQuantity);
    
    res.json({
      success: true,
      data: {
        ...stock,
        inStock: !isCurrentlyInStock,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to toggle stock status',
    });
  }
});

export default router;
