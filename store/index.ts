import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import authReducer from "./authSlice";
import cartReducer from "./cartSlice";
import rootSaga from "./sagas";
import themeReducer from "./themeSlice";

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    theme: themeReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

