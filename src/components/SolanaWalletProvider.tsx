import React from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  CoinbaseWalletAdapter,
  LedgerWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { SOLANA_RPC_ENDPOINT } from '../lib/solana';

// Default Solana network
// Remove unused network variable
// Use the Alchemy endpoint
const endpoint = SOLANA_RPC_ENDPOINT;

// Create WebSocket endpoint from RPC endpoint
const wsEndpoint = endpoint.replace('https://', 'wss://').replace('http://', 'ws://');

const SolanaWalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize wallet adapters
  const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new CoinbaseWalletAdapter(),
    new LedgerWalletAdapter(),
  ];

  return (
    <ConnectionProvider endpoint={endpoint} config={{ commitment: 'confirmed', wsEndpoint }}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default SolanaWalletProvider; 