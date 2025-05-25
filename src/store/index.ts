import { configureStore } from '@reduxjs/toolkit';
import sniperConfigsReducer from './slices/sniperConfigsSlice';
import walletReducer from './slices/walletSlice';

export const store = configureStore({
  reducer: {
    sniperConfigs: sniperConfigsReducer,
    wallet: walletReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false,
  }),
  devTools: true
});

// Mở log store state khi có thay đổi
store.subscribe(() => {
  console.log('Redux state updated:', store.getState());
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;