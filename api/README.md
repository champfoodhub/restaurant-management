# Restaurant Management API

Backend API for the Restaurant Management System, migrated from frontend logic.

## API Structure

The API is organized into 4 main endpoints:

### 1. `/api/menu` - Menu Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/menu` | Get all menu items |
| GET | `/api/menu?category=X` | Get menu items by category |
| GET | `/api/menu?seasonalMenuId=X` | Get items by seasonal menu |
| GET | `/api/menu/:id` | Get single menu item |
| POST | `/api/menu` | Create new menu item |
| PUT | `/api/menu/:id` | Update menu item |
| DELETE | `/api/menu/:id` | Delete menu item |
| POST | `/api/menu/:itemId/seasonal-menu` | Assign item to seasonal menu |
| DELETE | `/api/menu/:itemId/seasonal-menu` | Remove item from seasonal menu |

### 2. `/api/seasonal-menus` - Seasonal Menu Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/seasonal-menus` | Get all seasonal menus |
| GET | `/api/seasonal-menus/active` | Get currently active menus (time-based) |
| GET | `/api/seasonal-menus/current` | Get current active menu (single) |
| GET | `/api/seasonal-menus/:id` | Get single seasonal menu |
| POST | `/api/seasonal-menus` | Create new seasonal menu |
| PUT | `/api/seasonal-menus/:id` | Update seasonal menu |
| DELETE | `/api/seasonal-menus/:id` | Delete seasonal menu |
| POST | `/api/seasonal-menus/:menuId/items/:itemId` | Add item to seasonal menu |
| DELETE | `/api/seasonal-menus/items/:itemId` | Remove item from seasonal menu |

### 3. `/api/stock` - Stock Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stock?branchId=X` | Get all stock for branch |
| GET | `/api/stock/:itemId?branchId=X` | Get stock for specific item |
| PUT | `/api/stock/:itemId?branchId=X` | Update stock quantity |
| POST | `/api/stock/:itemId/in-stock?branchId=X` | Mark as in stock |
| POST | `/api/stock/:itemId/out-of-stock?branchId=X` | Mark as out of stock |
| POST | `/api/stock/:itemId/toggle?branchId=X` | Toggle stock status |

### 4. `/api/orders` - Order Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | Get all orders |
| GET | `/api/orders?branchId=X&status=X` | Get orders with filters |
| GET | `/api/orders/:id` | Get single order |
| POST | `/api/orders` | Create new order |
| PUT | `/api/orders/:id/status` | Update order status |
| DELETE | `/api/orders/:id` | Cancel order |

## Setup

1. Install dependencies:
```bash
cd api
npm install
```

2. Build the TypeScript:
```bash
npm run build
```

3. Start the server:
```bash
npm start
```

Or for development:
```bash
npm run dev
```

The server will start on `http://localhost:3001` by default.

### Mobile Development

For mobile emulators/simulators, you need to:

1. **Android Emulator**: Use `10.0.2.2` instead of `localhost`
   ```
   EXPO_PUBLIC_API_URL=http://10.0.2.2:3001/api
   ```

2. **iOS Simulator**: Use `localhost` or your machine's IP
   ```
   EXPO_PUBLIC_API_URL=http://localhost:3001/api
   # Or
   EXPO_PUBLIC_API_URL=http://192.168.1.100:3001/api
   ```

3. **Physical Device**: Use your machine's IP address
   ```
   EXPO_PUBLIC_API_URL=http://192.168.1.100:3001/api
   ```

To find your IP address:
- **macOS**: `ipconfig getifaddr en0`
- **Linux**: `hostname -I`
- **Windows**: `ipconfig` (look for IPv4 address)

## Frontend Configuration

Update the frontend `.env` file to point to your API:
```
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

## Features

- **In-memory data store** - Data persists while server is running
- **Sample data initialization** - Automatically creates sample menu items on startup
- **CORS enabled** - Allows cross-origin requests from frontend
- **Request logging** - Logs all API requests to console
- **Error handling** - Returns consistent error responses

## Data Models

### MenuItem
```typescript
{
  id: string;
  name: string;
  description: string;
  price: number;
  basePrice: number;
  image: string;
  category: string;
  isAvailable: boolean;
  inStock: boolean;
  seasonalMenuId?: string;
  createdAt: string;
  updatedAt: string;
}
```

### SeasonalMenu
```typescript
{
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  items: MenuItem[];
  createdAt: string;
  updatedAt: string;
}
```

### StockItem
```typescript
{
  id: string;
  menuItemId: string;
  branchId: string;
  quantity: number;
  lastUpdated: string;
}
```

### Order
```typescript
{
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  branchId: string;
  createdAt: string;
  updatedAt: string;
}
```

## Migration from Frontend Logic

The following frontend logic has been migrated to the backend:

1. **Database Operations** → `/api/menu` and `/api/stock`
   - SQLite operations replaced with API calls
   - CRUD operations handled by respective endpoints

2. **Time-Based Logic** → `/api/seasonal-menus`
   - `SeasonalMenuManager` class logic moved to backend
   - Current menu determination happens on server

3. **Cart/Order Operations** → `/api/orders`
   - Cart to order conversion handled by API
   - Order status management via endpoints

## Future Improvements

- Add database persistence (PostgreSQL/MongoDB)
- Add authentication/authorization
- Add rate limiting
- Add request validation middleware
- Add API documentation (Swagger)
- Add logging to file/cloud
