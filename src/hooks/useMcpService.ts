import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Define interfaces for MCP schema and responses
interface McpSchema {
  schema_version: string;
  metadata: {
    name: string;
    description: string;
    version: string;
  };
  functions: McpFunction[];
}

export interface McpFunction {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

export interface McpExecuteResponse<T = any> {
  result: T;
}

export function useMcpService() {
  const [endpoint, setEndpoint] = useState<string | null>(localStorage.getItem('mcpEndpoint'));
  const [schema, setSchema] = useState<McpSchema | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableFunctions, setAvailableFunctions] = useState<McpFunction[]>([]);

  // Initialize MCP connection when endpoint changes
  useEffect(() => {
    if (!endpoint) {
      setIsConnected(false);
      setSchema(null);
      setAvailableFunctions([]);
      localStorage.removeItem('mcpEndpoint');
      return;
    }

    const connectToMcp = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get the MCP schema to verify connection
        const response = await axios.get<McpSchema>(`${endpoint}/mcp`);
        setSchema(response.data);
        setAvailableFunctions(response.data.functions);
        setIsConnected(true);
        localStorage.setItem('mcpEndpoint', endpoint);
      } catch (err) {
        console.error('Failed to connect to MCP endpoint:', err);
        setError('Failed to connect to MCP endpoint. Make sure the server is running and accessible.');
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    connectToMcp();
  }, [endpoint]);

  // Function to update the MCP endpoint
  const setMcpEndpoint = useCallback((newEndpoint: string) => {
    setEndpoint(newEndpoint);
  }, []);

  // Function to execute an MCP function
  const executeMcpFunction = async <T = any>(
    functionName: string, 
    parameters: Record<string, any> = {}
  ): Promise<T> => {
    if (!isConnected || !endpoint) {
      throw new Error('MCP service is not connected');
    }

    try {
      const response = await axios.post<McpExecuteResponse<T>>(
        `${endpoint}/mcp/execute`,
        {
          name: functionName,
          parameters
        }
      );
      return response.data.result;
    } catch (err: any) {
      console.error(`Error executing MCP function ${functionName}:`, err);
      if (err.response?.data?.error) {
        throw new Error(`MCP error: ${err.response.data.error}`);
      }
      throw new Error(`Failed to execute MCP function: ${err.message}`);
    }
  };

  // Function to scan for new memecoins
  const scanNewMemecoins = useCallback(async (limit = 100) => {
    return executeMcpFunction<{
      scannedTransactions: number;
      newMemecoinsFound: number;
      memecoins: Array<{
        address: string;
        name: string;
        symbol: string;
        supply: number;
        holders: number;
        launchDate: string;
        liquidity: number;
      }>;
    }>('scanNewMemecoins', { limit });
  }, [isConnected, endpoint]);

  // Function to get hype scores for all tokens
  const getHypeScores = useCallback(async () => {
    return executeMcpFunction<{
      tokens: Array<{
        address: string;
        name: string;
        symbol: string;
        hypeScore: number;
        priceChange24h: number;
        volume24h: number;
        socialMentions: number;
        lastUpdated: string;
      }>;
    }>('getHypeScores', {});
  }, [isConnected, endpoint]);

  // Function to get hype score for a memecoin
  const getHypeScore = useCallback(async (tokenAddress: string) => {
    return executeMcpFunction<{
      tokenAddress: string;
      name: string;
      symbol: string;
      hypeScore: number;
      socialMetrics: {
        twitterMentions: number;
        redditMentions: number;
        telegramMentions: number;
        totalSentiment: number;
        totalEngagement: number;
      };
      priceMetrics: {
        price: number;
        priceChange24h: number;
        volume24h: number;
      };
      lastUpdated: string;
    }>('getHypeScore', { tokenAddress });
  }, [isConnected, endpoint]);

  // Function to track whale movements
  const trackWhaleMovements = useCallback(async (options: { 
    tokenAddress?: string, 
    limit?: number, 
    minAmount?: number 
  } = {}) => {
    return executeMcpFunction<{
      movements: Array<{
        id: string;
        whaleAddress: string;
        tokenAddress: string;
        tokenName: string;
        tokenSymbol: string;
        amount: number;
        value: number;
        type: 'buy' | 'sell';
        timestamp: string;
      }>;
      whales: Array<{
        address: string;
        totalValue: number;
        tokenCount: number;
        lastActive: string;
      }>;
    }>('trackWhaleMovements', options);
  }, [isConnected, endpoint]);

  // Function to analyze meme correlation
  const analyzeMemeCorrelation = useCallback(async (options: {
    tokenAddress?: string;
    memeName?: string;
  } = {}) => {
    return executeMcpFunction<{
      tokenAddress: string;
      memeName: string;
      correlationScore: number;
      priceChange: number;
      lastUpdated: string;
      socialMetrics: {
        mentions: number;
        engagement: number;
        sentiment: number;
      };
      platformData: {
        reddit: number;
        twitter: number;
        telegram: number;
        other: number;
      };
    }>('analyzeMemeCorrelation', options);
  }, [isConnected, endpoint]);

  // Function to run rugpull scan
  const runRugpullScan = useCallback(async (tokenAddress: string) => {
    return executeMcpFunction<{
      tokenAddress: string;
      name: string;
      symbol: string;
      riskLevel: 'low' | 'medium' | 'high' | 'very high';
      safetyScore: number;
      contractAnalysis: {
        hasRugPullCode: boolean;
        mintable: boolean;
        freezable: boolean;
        hasHiddenOwners: boolean;
        hasBlacklist: boolean;
      };
      liquidityAnalysis: {
        liquidityLocked: boolean;
        lockDuration: number;
        lockPercentage: number;
      };
      holderDistribution: {
        topHolderPercentage: number;
        top10HolderPercentage: number;
        hasConcentratedHoldings: boolean;
      };
      warnings: string[];
      recommendations: string[];
    }>('runRugpullScan', { tokenAddress });
  }, [isConnected, endpoint]);

  // Function to get portfolio strategy
  const getPortfolioStrategy = useCallback(async (options: {
    riskTolerance: 'conservative' | 'moderate' | 'aggressive';
    investmentSize: number;
    existingPortfolio?: Array<{
      address: string;
      amount: number;
    }>;
  }) => {
    return executeMcpFunction<{
      riskTolerance: string;
      investmentSize: number;
      portfolio: {
        recommendations: Array<{
          tokenAddress: string;
          name: string;
          symbol: string;
          allocation: number;
          amount: number;
          reasoning: string;
          riskLevel: string;
        }>;
        riskDistribution: {
          low: number;
          medium: number;
          high: number;
        };
        expectedReturn: {
          conservative: number;
          average: number;
          optimistic: number;
        };
        rebalanceRecommendations?: Array<{
          tokenAddress: string;
          action: 'buy' | 'sell' | 'hold';
          amount: number;
          reason: string;
        }>;
      };
      insights: string[];
    }>('getPortfolioStrategy', options);
  }, [isConnected, endpoint]);

  return {
    isConnected,
    isLoading,
    error,
    schema,
    availableFunctions,
    setMcpEndpoint,
    scanNewMemecoins,
    getHypeScores,
    getHypeScore,
    trackWhaleMovements,
    analyzeMemeCorrelation,
    runRugpullScan,
    getPortfolioStrategy,
  };
} 