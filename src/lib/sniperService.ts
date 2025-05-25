import { PublicKey } from '@solana/web3.js';
import toast from './toast-shim';
import { SniperConfig } from '../store/slices/sniperConfigsSlice';
import { store } from '../store';
import { Transaction, addTransaction as addTx, getTransactions, initGlobalTransactionStorage } from './transactionStore';
import { getTokenInfo, TokenInfo, formatTokenAmount } from './tokenService';

// Store active snipe tasks
const activeSnipeTasks: Map<string, NodeJS.Timeout> = new Map();

// Initialize transaction store
initGlobalTransactionStorage();

// Validate token address
export function validateTokenAddress(address: string): boolean {
  if (!address || address.trim() === '') return false;
  
  try {
    new PublicKey(address);
    return true;
  } catch (error) {
    return false;
  }
}

// Function to add new transaction
export const addTransaction = (transaction: Transaction) => {
  console.log("Added transaction from sniperService:", transaction);
  return addTx(transaction);
};

// Function to create new transaction
export const createTransaction = (config: SniperConfig, type: 'buy' | 'sell', status: 'pending' | 'confirmed' | 'failed' = 'pending', profit?: number): Transaction => {
  const id = `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const buyAmount = parseFloat(config.buyAmount) || 0.1;
  const tokenType = config.tokenType || 'sol';
  
  return {
    id,
    tokenName: config.name || "Unknown Token",
    tokenAddress: config.tokenAddress,
    type,
    amount: type === 'buy' ? Math.floor(Math.random() * 10000) + 1000 : Math.floor(Math.random() * 10000) + 1000, // Random token amount
    price: type === 'buy' ? buyAmount : buyAmount * (1 + (Math.random() * 0.2 - 0.1)), // Price with some variation for sells
    profit,
    status,
    timestamp: Date.now(),
    txId: `simulated-${id}`, // In reality, this would be the actual transaction hash
    tokenType, // Add tokenType to the transaction
  };
};

// Simulate transaction success/failure
const simulateTransactionResult = (): boolean => {
  return Math.random() > 0.2; // 80% chance of success
};

// Function to buy token
export const buyToken = (config: SniperConfig): Promise<Transaction> => {
  return new Promise((resolve) => {
    console.log("buyToken called with config:", config);
    
    if (!validateTokenAddress(config.tokenAddress)) {
      toast.error("Invalid token address");
      // Create failed transaction so user can see it
      const failedTx = createTransaction(config, 'buy', 'failed');
      addTransaction(failedTx);
      resolve(failedTx);
      return;
    }

    // Create pending transaction
    const pendingTx = createTransaction(config, 'buy', 'pending');
    console.log("Created new pending transaction in buyToken:", pendingTx);
    addTransaction(pendingTx);
    
    // Simulate transaction (will be replaced with actual blockchain call)
    console.log("Starting transaction simulation, will complete in 3 seconds");
    setTimeout(() => {
      const success = simulateTransactionResult();
      
      if (success) {
        // Create confirmed transaction
        const confirmedTx = { 
          ...pendingTx, 
          status: 'confirmed' as const,
          price: parseFloat(config.buyAmount) || 0.1
        };
        console.log("Transaction successful, updating to confirmed:", confirmedTx);
        addTransaction(confirmedTx);
        toast.success(`Successfully bought ${config.name}`);
        resolve(confirmedTx);

        // Automatically setup sell order if profit target/stop loss exists
        setupAutoSell(config, confirmedTx);
      } else {
        const failedTx = { 
          ...pendingTx, 
          status: 'failed' as const 
        };
        console.log("Transaction failed:", failedTx);
        addTransaction(failedTx);
        toast.error(`Failed to buy ${config.name}`);
        resolve(failedTx);
      }
    }, 3000);
  });
};

// Function to sell token
export const sellToken = (config: SniperConfig, profitPercentage?: number): Promise<Transaction> => {
  return new Promise((resolve) => {
    // Create pending transaction
    const pendingTx = createTransaction(
      config, 
      'sell', 
      'pending', 
      profitPercentage ? (parseFloat(config.buyAmount) * profitPercentage / 100) : undefined
    );
    addTransaction(pendingTx);
    console.log("Created sell transaction:", pendingTx);
    
    // Simulate transaction
    setTimeout(() => {
      const success = simulateTransactionResult();
      
      if (success) {
        const profit = profitPercentage 
          ? (parseFloat(config.buyAmount) * profitPercentage / 100) 
          : (Math.random() * parseFloat(config.buyAmount) * 0.5 - parseFloat(config.buyAmount) * 0.1);
        
        const confirmedTx = { 
          ...pendingTx, 
          status: 'confirmed' as const,
          price: Math.random() * 0.01, // Random sell price
          profit
        };
        addTransaction(confirmedTx);
        
        const profitMsg = profit >= 0 
          ? `profit: +${profit.toFixed(4)} ${config.tokenType?.toUpperCase() || 'SOL'}` 
          : `loss: ${profit.toFixed(4)} ${config.tokenType?.toUpperCase() || 'SOL'}`;
        
        toast.success(`Successfully sold ${config.name} (${profitMsg})`);
        resolve(confirmedTx);
      } else {
        const failedTx = { 
          ...pendingTx, 
          status: 'failed' as const 
        };
        addTransaction(failedTx);
        toast.error(`Failed to sell ${config.name}`);
        resolve(failedTx);
      }
    }, 3000);
  });
};

// Auto sell function when target or stop loss is reached
const setupAutoSell = (config: SniperConfig, buyTx: Transaction) => {
  const sellTarget = parseFloat(config.sellTarget);
  const stopLoss = parseFloat(config.stopLoss);
  
  if (!sellTarget && !stopLoss) return;
  
  // Simulate price volatility
  const simulatePriceChange = () => {
    // Random price change from -10% to +15%
    const changePercent = (Math.random() * 25) - 10;
    
    console.log(`[Sniper] Simulating price change for ${config.name}: ${changePercent.toFixed(2)}%`);
    
    // Check if take profit or stop loss is reached
    if (changePercent >= sellTarget) {
      console.log(`[Sniper] Sell target reached for ${config.name}: +${changePercent.toFixed(2)}%`);
      clearInterval(priceCheckInterval);
      activeSnipeTasks.delete(config.id);
      
      sellToken(config, changePercent)
        .then(() => {
          toast.success(`🚀 Take profit executed: +${changePercent.toFixed(2)}%`);
        })
        .catch(error => {
          console.error("Auto-sell error:", error);
        });
    } else if (changePercent <= -stopLoss) {
      console.log(`[Sniper] Stop loss triggered for ${config.name}: -${changePercent.toFixed(2)}%`);
      clearInterval(priceCheckInterval);
      activeSnipeTasks.delete(config.id);
      
      sellToken(config, changePercent)
        .then(() => {
          toast.warning(`⚠️ Stop loss executed: ${changePercent.toFixed(2)}%`);
        })
        .catch(error => {
          console.error("Auto-sell error:", error);
        });
    }
  };
  
  // Check price every 5-10 seconds
  const priceCheckInterval = setInterval(simulatePriceChange, 5000 + Math.random() * 5000);
  
  // Save task so it can be cancelled later
  activeSnipeTasks.set(config.id, priceCheckInterval);
};

// Function to cancel all snipe tasks
export const cancelAllSnipeTasks = () => {
  activeSnipeTasks.forEach((interval) => {
    clearInterval(interval);
  });
  activeSnipeTasks.clear();
};

// Snipe function
export const snipe = async (config: SniperConfig, pendingTx?: Transaction): Promise<void> => {
  try {
    console.log("Snipe function called with config:", config);
    console.log("Using pending transaction:", pendingTx);
    
    // Always call buyToken to simulate token purchase
    const result = await buyToken(config);
    console.log("Buy token result:", result);
  } catch (error) {
    console.error("Snipe error:", error);
    toast.error(`Error sniping ${config.name || config.tokenAddress}: ${error.message}`);
  }
};

// Function to use in component
export const startSnipe = (config: SniperConfig) => {
  console.log("startSnipe called with config:", config);
  
  // Validate token address first
  if (!validateTokenAddress(config.tokenAddress)) {
    toast.error("Invalid token address");
    return; // Don't create transaction if token address is invalid
  }
  
  // Ensure transaction store is initialized
  initGlobalTransactionStorage();
  
  // Create unique transaction ID
  const timestamp = Date.now();
  const randomId = Math.floor(Math.random() * 1000000);
  const transactionId = `tx-${timestamp}-${randomId}`;
  
  // Get token type, default to sol if not specified
  const tokenType = config.tokenType || 'sol';
  
  // Create and display pending transaction immediately
  const pendingTx: Transaction = {
    id: transactionId,
    tokenName: config.name || "Unknown Token",
    tokenAddress: config.tokenAddress,
    type: 'buy',
    amount: Math.floor(Math.random() * 10000) + 1000,
    price: parseFloat(config.buyAmount) || 0.1,
    status: 'pending',
    timestamp: timestamp,
    txId: `simulated-${timestamp}-${randomId}`,
    tokenType,
  };
  
  // Add transaction to localStorage
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      let existingTransactions: Transaction[] = [];
      const storedData = localStorage.getItem('transactions');
      if (storedData) {
        try {
          existingTransactions = JSON.parse(storedData);
          if (!Array.isArray(existingTransactions)) {
            existingTransactions = [];
          }
        } catch (e) {
          existingTransactions = [];
        }
      }
      
      // Add new transaction to the beginning of the array
      existingTransactions = [pendingTx, ...existingTransactions].slice(0, 100);
      localStorage.setItem('transactions', JSON.stringify(existingTransactions));
      
      // Update global variable
      if ((window as any).transactionsStore) {
        (window as any).transactionsStore = existingTransactions;
      }
    }
  } catch (e) {
    console.error("Error saving transaction to localStorage:", e);
  }
  
  // Add via API
  addTransaction(pendingTx);
  
  // Display notification
  toast.success(`Starting snipe for ${config.name || config.tokenAddress} with ${tokenType.toUpperCase()}`);
  
  // Proceed with snipe after 1 second
  setTimeout(() => {
    snipe(config, pendingTx).catch(error => {
      console.error("Snipe failed:", error);
    });
  }, 1000);
};