import { useState, useEffect, useCallback } from 'react';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useToast } from '../components/ui/use-toast';
import { SOLANA_RPC_ENDPOINT, SOLANA_BACKUP_RPC_ENDPOINT } from '../lib/solana';

// Chỉ sử dụng 2 RPC endpoint chính thức
const SOLANA_RPC_ENDPOINTS = [
  SOLANA_RPC_ENDPOINT, // Alchemy endpoint chính thức
  SOLANA_BACKUP_RPC_ENDPOINT, // Solana endpoint chính thức
];

export function useSolanaBalance(walletAddress: string | null) {
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentEndpoint, setCurrentEndpoint] = useState(SOLANA_RPC_ENDPOINTS[0]);
  const { toast } = useToast();

  const fetchBalance = useCallback(async () => {
    if (!walletAddress) {
      setSolBalance(null);
      return;
    }

    setIsLoading(true);
    let successfulEndpoint = false;
    
    // Try each endpoint until one works
    for (const endpoint of SOLANA_RPC_ENDPOINTS) {
      try {
        console.log(`Attempting to fetch SOL balance using endpoint: ${endpoint}`);
        const connection = new Connection(endpoint, 'confirmed');
        const pubKey = new PublicKey(walletAddress);
        const balance = await connection.getBalance(pubKey);
        
        // Convert lamports to SOL
        const solAmount = balance / LAMPORTS_PER_SOL;
        
        console.log(`SOL Balance: ${solAmount} SOL from ${endpoint}`);
        setSolBalance(solAmount);
        setCurrentEndpoint(endpoint);
        setIsLoading(false);
        successfulEndpoint = true;
        break; // Exit the loop after a successful endpoint is found
      } catch (err) {
        console.error(`Error with endpoint ${endpoint}:`, err);
        // Continue to try the next endpoint
      }
    }
    
    // If all endpoints failed
    if (!successfulEndpoint) {
      console.error('All RPC endpoints failed');
      setIsLoading(false);
      
      // Keep the previous balance if it exists, don't show toast if this is just a refresh
      if (solBalance === null) {
        toast({
          title: 'Connection issue',
          description: 'Could not connect to Solana network. Using fallback data.',
          variant: 'destructive',
        });
      }
    }
  }, [walletAddress, toast, solBalance]);

  useEffect(() => {
    fetchBalance();
    
    // Set up polling every 60 seconds if wallet is connected
    let intervalId: NodeJS.Timeout | null = null;
    if (walletAddress) {
      intervalId = setInterval(fetchBalance, 60000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [walletAddress, fetchBalance]);

  const refetch = useCallback(() => {
    fetchBalance();
  }, [fetchBalance]);

  return { solBalance, isLoading, currentEndpoint, refetch };
} 