/**
 * Restaurant Management API Server
 * Main entry point
 */

import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import { initializeSampleData } from './dataStore';
import menuRoutes from './routes/menu';
import orderRoutes from './routes/orders';
import seasonalMenuRoutes from './routes/seasonalMenus';
import stockRoutes from './routes/stock';

const app = express();
const HOST = process.env.HOST || '0.0.0.0';
const PORT = parseInt(process.env.PORT || '3001', 10);

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
app.use('/api/menu', menuRoutes);
app.use('/api/seasonal-menus', seasonalMenuRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/orders', orderRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Start server
app.listen(PORT, HOST, () => {
  console.log(`🚀 Restaurant Management API running on http://localhost:${PORT}`);
  console.log(`📋 API Endpoints:`);
  console.log(`   GET  /api/health`);
  console.log(`   GET  /api/menu`);
  console.log(`   GET  /api/menu/:id`);
  console.log(`   POST /api/menu`);
  console.log(`   PUT  /api/menu/:id`);
  console.log(`   DEL  /api/menu/:id`);
  console.log(`   GET  /api/seasonal-menus`);
  console.log(`   GET  /api/seasonal-menus/active`);
  console.log(`   GET  /api/seasonal-menus/current`);
  console.log(`   POST /api/seasonal-menus`);
  console.log(`   PUT  /api/seasonal-menus/:id`);
  console.log(`   DEL  /api/seasonal-menus/:id`);
  console.log(`   GET  /api/stock`);
  console.log(`   GET  /api/stock/:itemId`);
  console.log(`   PUT  /api/stock/:itemId`);
  console.log(`   POST /api/stock/:itemId/in-stock`);
  console.log(`   POST /api/stock/:itemId/out-of-stock`);
  console.log(`   GET  /api/orders`);
  console.log(`   GET  /api/orders/:id`);
  console.log(`   POST /api/orders`);
  console.log(`   PUT  /api/orders/:id/status`);
  
  // Initialize sample data
  initializeSampleData();
});

export default app;
