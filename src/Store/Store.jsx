import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import {
  pickupLocationReducer,
  categoriesReducer,
  newPassReducer,
  orderReducer,
  ordersReducer,
  otpCodeReducer,
  productsCardReducer,
  productsDiscountFilterReducer,
  productsDiscountReducer,
  productsFilterReducer,
  productsReducer,
  signUpTypeReducer,
  taxTypeReducer,
  totalPriceReducer,
  userReducer,
  languageReducer,
  mainDataReducer,
  companyInfoReducer,
} from "./CreateSlices";
import { combineReducers } from 'redux';

const reducers = combineReducers({
  user: userReducer,
  signUpType: signUpTypeReducer,
  otp: otpCodeReducer,
  newPass: newPassReducer,
  mainData: mainDataReducer,
  companyInfo: companyInfoReducer,
  taxType: taxTypeReducer,
  products: productsReducer,
  categories: categoriesReducer,
  productsCard: productsCardReducer,
  order: orderReducer,
  totalPrice: totalPriceReducer,
  language: languageReducer,
  productsFilter: productsFilterReducer,
  productsDiscount: productsDiscountReducer,
  productsDiscountFilter: productsDiscountFilterReducer,
  pickupLocation: pickupLocationReducer,
});

const persistConfig = {
  key: 'root',
  storage,
  whitelist: [
    'user',
    'otp',
    'newPass',
    'productsCard',
    'order',
    'totalPrice',
    'pickupLocation',
    'language',
    'taxType',
    'products',
    'categories',
    'mainData',
    'companyInfo',
  ],
};

const persistedReducer = persistReducer(persistConfig, reducers);

export const StoreApp = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable for redux-persist compatibility
      immutableCheck: false, // Optional: Disable if you don’t need immutable state checks
    }),
});

export const persistor = persistStore(StoreApp);