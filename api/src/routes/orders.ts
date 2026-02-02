/**
 * Orders API Routes
 * /api/orders endpoints
 */

import { Request, Response, Router } from 'express';
import { orderStore } from '../dataStore';

const router = Router();

/**
 * GET /api/orders
 * Get all orders with optional filtering
 * Query params: branchId, status
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const { branchId, status } = req.query;
    
    const orders = orderStore.getAll({
      branchId: branchId as string,
      status: status as string,
    });
    
    res.json({
      success: true,
      data: orders,
      count: orders.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders',
    });
  }
});

/**
 * GET /api/orders/:id
 * Get single order by ID
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const order = orderStore.getById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }
    
    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order',
    });
  }
});

/**
 * POST /api/orders
 * Create new order from cart items
 * Body: { items: CartItem[], branchId: string }
 */
router.post('/', (req: Request, res: Response) => {
  try {
    const { items, branchId } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Items array is required and must not be empty',
      });
    }
    
    if (!branchId) {
      return res.status(400).json({
        success: false,
        error: 'branchId is required',
      });
    }
    
    // Calculate total
    const total = items.reduce((sum: number, item: { price: number; quantity: number }) => {
      return sum + (item.price * item.quantity);
    }, 0);
    
    const order = orderStore.create({
      items,
      total,
      status: 'pending',
      branchId,
    });
    
    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create order',
    });
  }
});

/**
 * PUT /api/orders/:id/status
 * Update order status
 * Body: { status: 'pending' | 'confirmed' | 'completed' | 'cancelled' }
 */
router.put('/:id/status', (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    
    if (!status || !['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Valid status is required (pending, confirmed, completed, cancelled)',
      });
    }
    
    const updated = orderStore.updateStatus(req.params.id, status);
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }
    
    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update order status',
    });
  }
});

/**
 * DELETE /api/orders/:id
 * Cancel/delete order
 */
router.delete('/:id', (req: Request, res: Response) => {
  try {
    // First check if order exists
    const order = orderStore.getById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }
    
    // Update status to cancelled instead of deleting
    orderStore.updateStatus(req.params.id, 'cancelled');
    
    res.json({
      success: true,
      message: 'Order cancelled successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to cancel order',
    });
  }
});

export default router;
