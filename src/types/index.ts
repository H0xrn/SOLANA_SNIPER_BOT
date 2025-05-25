export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  price: number;
  change24h: number;
}

export interface SniperConfig {
  tokenAddress: string;
  amount: number;
  maxPrice: number;
  slippage: number;
  enabled: boolean;
  tokenType?: 'sol' | 'wsol';
}

export interface Transaction {
  hash: string;
  type: 'buy' | 'sell';
  token: Token;
  amount: number;
  price: number;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
}

export interface WalletState {
  connected: boolean;
  address: string | null;
  balance: number;
}

export interface RootState {
  wallet: WalletState;
  transactions: Transaction[];
  sniperConfigs: SniperConfig[];
}