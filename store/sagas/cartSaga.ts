import { PayloadAction } from "@reduxjs/toolkit";
import { all, takeLatest } from "redux-saga/effects";
import { addItem, clearCart, removeItem } from "../cartSlice";

// Simulated API call for logging cart operations
function* logCartOperation(action: PayloadAction<any>) {
  try {
    // In a real app, this would be an API call
    console.log("Cart operation:", action.type, action.payload);
  } catch (error) {
    console.error("Cart operation failed:", error);
  }
}

// Watch for cart actions
export default function* cartSaga() {
  yield all([
    takeLatest(addItem.type, logCartOperation),
    takeLatest(removeItem.type, logCartOperation),
    takeLatest(clearCart.type, logCartOperation),
  ]);
}

