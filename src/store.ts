import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define sniper config types
export interface SniperConfig {
  id: string;
  name: string;
  tokenAddress: string;
  buyAmount: string;
  sellTarget: string;
  stopLoss: string;
  maxSlippage: string;
  gasLimit: string;
  autoApprove: boolean;
  notifications: {
    telegram: boolean;
    email: boolean;
  };
}

interface SniperConfigsState {
  configs: SniperConfig[];
}

const initialSniperConfigsState: SniperConfigsState = {
  configs: [],
};

// Create sniper configs slice
const sniperConfigsSlice = createSlice({
  name: 'sniperConfigs',
  initialState: initialSniperConfigsState,
  reducers: {
    addSniperConfig: (state, action: PayloadAction<SniperConfig>) => {
      state.configs.push(action.payload);
    },
    updateSniperConfig: (state, action: PayloadAction<{ id: string; updates: Partial<SniperConfig> }>) => {
      const { id, updates } = action.payload;
      const config = state.configs.find(c => c.id === id);
      if (config) {
        Object.assign(config, updates);
      }
    },
    deleteSniperConfig: (state, action: PayloadAction<string>) => {
      state.configs = state.configs.filter(config => config.id !== action.payload);
    },
  },
});

// Get wallet state from localStorage if available
const getSavedWalletState = () => {
  try {
    const savedWalletState = localStorage.getItem('walletState');
    if (savedWalletState) {
      return JSON.parse(savedWalletState);
    }
  } catch (error) {
    console.error('Error loading wallet state from localStorage:', error);
  }
  
  return {
    connected: false,
    address: null,
  };
};

// Define wallet state
interface WalletState {
  connected: boolean;
  address: string | null;
}

const initialWalletState: WalletState = getSavedWalletState();

// Create wallet slice
const walletSlice = createSlice({
  name: 'wallet',
  initialState: initialWalletState,
  reducers: {
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.connected = action.payload;
      // Save to localStorage
      localStorage.setItem('walletState', JSON.stringify(state));
    },
    setAddress: (state, action: PayloadAction<string | null>) => {
      state.address = action.payload;
      // Save to localStorage
      localStorage.setItem('walletState', JSON.stringify(state));
    },
    disconnect: (state) => {
      state.connected = false;
      state.address = null;
      // Clear from localStorage
      localStorage.removeItem('walletState');
    },
  },
});

// Export actions
export const { setConnected, setAddress, disconnect } = walletSlice.actions;
export const { addSniperConfig, updateSniperConfig, deleteSniperConfig } = sniperConfigsSlice.actions;

// Configure store with all reducers
export const store = configureStore({
  reducer: {
    wallet: walletSlice.reducer,
    sniperConfigs: sniperConfigsSlice.reducer,
  },
});

// Export store types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 