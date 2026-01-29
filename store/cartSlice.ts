import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { Loggers } from "../utils/logger";

export type CartItemType = 'regular' | 'seasonal' | 'special';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  itemType?: CartItemType;
};

export interface CartState {
  items: CartItem[];
  error: string | null;
}

const initialState: CartState = {
  items: [],
  error: null,
};

// Payload type for adding items with itemType
export type AddItemPayload = Omit<CartItem, "quantity"> & { itemType?: CartItemType };

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<AddItemPayload>) => {
      const existing = state.items.find((i) => i.id === action.payload.id);
      if (existing) {
        state.items = state.items.map((i) =>
          i.id === action.payload.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
        Loggers.cart.info(`Increased quantity for ${action.payload.name}`);
      } else {
        // Preserve itemType if provided, otherwise default to 'regular'
        const itemType = action.payload.itemType || 'regular';
        state.items.push({ ...action.payload, quantity: 1, itemType });
        Loggers.cart.info(`Added new item: ${action.payload.name} (${itemType})`);
      }
      state.error = null;
    },
    removeItem: (state, action: PayloadAction<string>) => {
      const item = state.items.find((i) => i.id === action.payload);
      state.items = state.items
        .map((i) =>
          i.id === action.payload ? { ...i, quantity: i.quantity - 1 } : i
        )
        .filter((i) => i.quantity > 0);
      if (item && item.quantity > 1) {
        Loggers.cart.info(`Decreased quantity for ${item.name}`);
      } else if (item) {
        Loggers.cart.info(`Removed item: ${item.name}`);
      }
      state.error = null;
    },
    clearCart: (state) => {
      const itemCount = state.items.length;
      state.items = [];
      state.error = null;
      Loggers.cart.info(`Cleared cart (${itemCount} items removed)`);
    },
  },
});

export const { addItem, removeItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;

