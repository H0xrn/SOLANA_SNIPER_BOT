import axios from 'axios';
import toast from './toast-shim';

// Interface cho token thông thường
export interface Token {
  id: string;
  name: string;
  symbol: string;
  address: string;
  price?: number;
  change24h?: number;
  volume24h?: number;
  marketCap?: number;
  imageUrl?: string;
}

// Interface for token information
export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: number;
  address: string;
  logoUrl?: string;
  price?: number;
  priceChangePercent?: number;
  marketcap?: number;
}

// Các hàm lấy token thông thường

// Lấy thông tin về 1 token
export const getTokenDetails = async (tokenAddress: string): Promise<Token | null> => {
  try {
    // Code hiện tại lấy thông tin token
    return null;
  } catch (error) {
    console.error('Error fetching token details:', error);
    return null;
  }
};

// Tìm kiếm token
export const searchTokens = async (query: string): Promise<Token[]> => {
  try {
    // Code hiện tại cho searchTokens
    return [];
  } catch (error) {
    console.error('Error searching tokens:', error);
    return [];
  }
};

// Lọc token theo các tiêu chí
export const filterTokensByPlatform = async (platform: string): Promise<Token[]> => {
  try {
    // Code hiện tại cho filterTokensByPlatform
    return [];
  } catch (error) {
    console.error('Error filtering tokens by platform:', error);
    return [];
  }
};

// Function to validate if a string is a valid Solana address
export const isValidSolanaAddress = (address: string): boolean => {
  const solanaAddressRegex = /^[A-HJ-NP-Za-km-z1-9]{32,44}$/;
  return solanaAddressRegex.test(address);
};

// Function to fetch token information from Solscan API
export const fetchTokenInfo = async (tokenAddress: string): Promise<TokenInfo | null> => {
  if (!isValidSolanaAddress(tokenAddress)) {
    console.error("Invalid Solana address format");
    return null;
  }

  try {
    // First try to get token metadata
    const metadataUrl = `https://api.solscan.io/token/meta?token=${tokenAddress}`;
    const metadataResponse = await fetch(metadataUrl);
    if (!metadataResponse.ok) {
      throw new Error(`Failed to fetch token metadata: ${metadataResponse.status}`);
    }
    const metadataData = await metadataResponse.json();
    
    // Then try to get token market data (price, etc.)
    const marketUrl = `https://api.solscan.io/market?token=${tokenAddress}`;
    const marketResponse = await fetch(marketUrl);
    let marketData = { priceUsdt: 0, priceChange24h: 0, volumeUsdt: 0 };
    if (marketResponse.ok) {
      marketData = await marketResponse.json();
    }

    // Extract data from response
    const tokenInfo: TokenInfo = {
      name: metadataData.data?.name || 'Unknown Token',
      symbol: metadataData.data?.symbol || 'UNKNOWN',
      decimals: metadataData.data?.decimals || 9,
      totalSupply: metadataData.data?.supply || 0,
      address: tokenAddress,
      logoUrl: metadataData.data?.icon || '',
      price: marketData.priceUsdt || 0,
      priceChangePercent: marketData.priceChange24h || 0,
      marketcap: (marketData.priceUsdt || 0) * (metadataData.data?.supply || 0)
    };

    return tokenInfo;
  } catch (error) {
    console.error("Error fetching token information:", error);
    return null;
  }
};

// Function to format token amount based on decimals
export const formatTokenAmount = (amount: number, decimals: number = 9): string => {
  const divisor = Math.pow(10, decimals);
  const formattedAmount = amount / divisor;
  
  if (formattedAmount < 0.01) {
    return formattedAmount.toExponential(2);
  }
  
  return formattedAmount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  });
};

// Function to format price in USD
export const formatUsdPrice = (price: number | undefined): string => {
  if (price === undefined || price === 0) return '$0.00';
  
  if (price < 0.01) {
    return `$${price.toExponential(2)}`;
  }
  
  return `$${price.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  })}`;
};

// Function to calculate price in SOL based on USD price
export const calculateSolPrice = (usdPrice: number, solPrice: number = 150): number => {
  if (usdPrice === 0 || solPrice === 0) return 0;
  return usdPrice / solPrice;
};

// Cache for token information to avoid repeated API calls
const tokenInfoCache: Record<string, TokenInfo & { timestamp: number }> = {};
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

// Function to get token info with caching
export const getTokenInfo = async (tokenAddress: string): Promise<TokenInfo | null> => {
  // Check cache first
  const cachedInfo = tokenInfoCache[tokenAddress];
  if (cachedInfo && (Date.now() - cachedInfo.timestamp < CACHE_EXPIRY)) {
    return cachedInfo;
  }
  
  // Fetch new data if not in cache or expired
  const tokenInfo = await fetchTokenInfo(tokenAddress);
  if (tokenInfo) {
    // Store in cache with timestamp
    tokenInfoCache[tokenAddress] = { ...tokenInfo, timestamp: Date.now() };
  }
  
  return tokenInfo;
}; 