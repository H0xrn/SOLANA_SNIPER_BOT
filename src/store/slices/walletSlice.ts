import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WalletState {
  connected: boolean;
  address: string | null;
  balance: number | null;
  solBalance: number | null;
  wsolBalance: number | null;
  network: 'mainnet-beta' | 'testnet' | 'devnet' | 'localnet';
  tokenAccounts: Record<string, { mint: string, balance: number }[]>;
  name: string | null;
  loading: boolean;
}

const initialState: WalletState = {
  connected: false,
  address: null,
  balance: null,
  solBalance: null,
  wsolBalance: null,
  network: 'mainnet-beta',
  tokenAccounts: {},
  name: null,
  loading: false,
};

interface WalletInfo {
  address: string | null;
  connected: boolean;
  name: string | null;
}

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.connected = action.payload;
    },
    setAddress: (state, action: PayloadAction<string | null>) => {
      state.address = action.payload;
    },
    setBalance: (state, action: PayloadAction<number | null>) => {
      state.balance = action.payload;
    },
    setSolBalance: (state, action: PayloadAction<number | null>) => {
      state.solBalance = action.payload;
    },
    setWsolBalance: (state, action: PayloadAction<number | null>) => {
      state.wsolBalance = action.payload;
    },
    setNetwork: (state, action: PayloadAction<string | null>) => {
      state.network = action.payload;
    },
    setTokenAccounts: (state, action: PayloadAction<Record<string, { mint: string, balance: number }[]>>) => {
      state.tokenAccounts = action.payload;
    },
    disconnect: (state) => {
      state.connected = false;
      state.address = null;
      state.balance = null;
      state.solBalance = null;
      state.wsolBalance = null;
      state.tokenAccounts = {};
    },
    setWallet: (state, action: PayloadAction<WalletInfo>) => {
      state.address = action.payload.address;
      state.connected = action.payload.connected;
      state.name = action.payload.name;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { 
  setConnected, 
  setAddress, 
  setBalance, 
  setSolBalance,
  setWsolBalance,
  setNetwork,
  setTokenAccounts,
  disconnect,
  setWallet,
  setLoading
} = walletSlice.actions;

export default walletSlice.reducer;