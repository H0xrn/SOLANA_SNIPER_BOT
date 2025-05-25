import React, { memo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { AlertCircle, Wallet, Loader2 } from 'lucide-react';
import { formatPublicKey } from '../lib/solana';

// Use React.memo to prevent re-renders when props don't change
const WalletBalanceDisplay: React.FC = memo(() => {
  const { address, solBalance, wsolBalance, connected } = useSelector((state: RootState) => state.wallet);
  
  const isLoading = solBalance === null || wsolBalance === null;

  if (!connected || !address) {
    return null;
  }

  return (
    <div className="w-full p-4 rounded-lg bg-gray-900/70 border border-gray-800 backdrop-blur-sm">
      <div className="flex items-center space-x-2 mb-3">
        <Wallet className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-white">Wallet Connected</h3>
        {isLoading && (
          <Loader2 className="h-4 w-4 text-primary animate-spin ml-auto" />
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Address:</span>
          <span className="font-mono text-white">{formatPublicKey(address)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-400">SOL Balance:</span>
          <span className={`font-semibold ${isLoading ? 'text-gray-400' : 'text-white'}`}>
            {solBalance !== null ? `${solBalance.toFixed(4)} SOL` : 'Loading...'}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-400">wSOL Balance:</span>
          <span className={`font-semibold ${isLoading ? 'text-gray-400' : 'text-white'}`}>
            {wsolBalance !== null ? `${wsolBalance.toFixed(4)} wSOL` : 'Loading...'}
          </span>
        </div>
      </div>
      
      <div className="mt-3 text-xs text-gray-500 flex items-start space-x-1">
        <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
        <span>SOL is the native token of Solana. wSOL is wrapped SOL (SPL token).</span>
      </div>
    </div>
  );
});

// Add display name for debugging
WalletBalanceDisplay.displayName = 'WalletBalanceDisplay';

export { WalletBalanceDisplay }; 