import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TokenInfo } from '../../lib/tokenService';

export interface SniperConfig {
  id: string;
  name: string;
  tokenAddress: string;
  buyAmount: string;
  sellTarget: string;
  stopLoss: string;
  maxSlippage: string;
  autoApprove: boolean;
  notifications: {
    telegram: boolean;
    email: boolean;
  };
  tokenInfo?: TokenInfo | {
    name: string;
    symbol: string;
    decimals: number;
    logoUrl?: string;
    price?: number;
  };
}

interface SniperConfigsState {
  configs: SniperConfig[];
}

const initialState: SniperConfigsState = {
  configs: [],
};

const sniperConfigsSlice = createSlice({
  name: 'sniperConfigs',
  initialState,
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

export const { addSniperConfig, updateSniperConfig, deleteSniperConfig } = sniperConfigsSlice.actions;
export default sniperConfigsSlice.reducer;