import { useEffect, useState } from 'react';

// Types for DexScreener API responses
export interface TokenData {
  symbol: string;
  name: string;
  address: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    symbol: string;
  };
  priceUsd: string;
  priceChange: {
    h1: number;
    h24: number;
    d7: number;
  };
  volume: {
    h24: number;
  };
  liquidity: {
    usd: number;
  };
  fdv: number; // Fully Diluted Valuation
  pairCreatedAt: number;
}

export interface DexScreenerResponse {
  schemaVersion: string;
  pairs: TokenData[];
}

// Cache data for 1 minute
const CACHE_DURATION = 60 * 1000;
let cachedData: TokenData[] | null = null;
let lastFetchTime = 0;

// Fetch top Solana tokens by volume
export async function fetchTopSolanaTokens(): Promise<TokenData[]> {
  // Return cached data if available and not expired
  const now = Date.now();
  if (cachedData && now - lastFetchTime < CACHE_DURATION) {
    return cachedData;
  }

  try {
    // DexScreener API for top Solana tokens (sorted by volume)
    const response = await fetch('https://api.dexscreener.com/latest/dex/tokens/So11111111111111111111111111111111111111112');
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data: DexScreenerResponse = await response.json();
    
    // Sort by volume and take top 20
    const sortedTokens = data.pairs
      .filter(token => token.liquidity?.usd > 10000) // Filter out low liquidity tokens
      .sort((a, b) => (b.volume?.h24 || 0) - (a.volume?.h24 || 0))
      .slice(0, 20);
    
    // Update cache
    cachedData = sortedTokens;
    lastFetchTime = now;
    
    return sortedTokens;
  } catch (error) {
    console.error('Error fetching market data:', error);
    // Return cached data if available even if expired, otherwise empty array
    return cachedData || [];
  }
}

// Hook for using the market data
export function useMarketData() {
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await fetchTopSolanaTokens();
        setTokens(data);
        setError(null);
      } catch (e) {
        setError('Failed to fetch market data');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Refresh data every minute
    const intervalId = setInterval(fetchData, CACHE_DURATION);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Calculate market data summaries
  const marketSummary = {
    totalVolume: tokens.reduce((sum, token) => sum + (token.volume?.h24 || 0), 0),
    avgPriceChange24h: tokens.length ? 
      tokens.reduce((sum, token) => sum + (token.priceChange?.h24 || 0), 0) / tokens.length 
      : 0,
    totalLiquidity: tokens.reduce((sum, token) => sum + (token.liquidity?.usd || 0), 0),
  };
  
  return { tokens, loading, error, marketSummary };
} 