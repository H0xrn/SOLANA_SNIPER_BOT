import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Loader2, CheckCircle2, XCircle, ExternalLink, TrendingUp, TrendingDown, AlertCircle, Wallet, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useWallet } from '@solana/wallet-adapter-react';
import toast from '../lib/toast-shim';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Transaction, initGlobalTransactionStorage, getTransactions, deleteTransaction, clearTransactions } from '../lib/transactionStore';

// Khởi tạo ngay khi module được load
initGlobalTransactionStorage();

interface TransactionRowProps {
  transaction: Transaction;
  onDelete: (id: string) => void;
}

const TransactionRow: React.FC<TransactionRowProps> = ({ transaction, onDelete }) => {
  const statusIcon = {
    pending: <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />,
    confirmed: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    failed: <XCircle className="w-5 h-5 text-red-500" />,
  };

  const formatProfit = (profit: number | undefined) => {
    if (profit === undefined) return '-';
    return `${profit >= 0 ? '+' : ''}${profit.toFixed(2)}`;
  };

  const getProfitColor = (profit: number | undefined) => {
    if (profit === undefined) return 'text-muted-foreground';
    return profit >= 0 ? 'text-green-500' : 'text-red-500';
  };

  // Chỉ hiển thị liên kết solscan cho giao dịch đã confirmed
  const showSolscanLink = transaction.status === 'confirmed' && !transaction.txId.startsWith('simulated');

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(transaction.id);
  };

  return (
    <div className="glass p-4 rounded-xl hover-card transition-all duration-300 group">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-2 rounded-lg bg-primary/10">
            {transaction.type === 'buy' ? (
              <TrendingUp className="w-5 h-5 text-primary" />
            ) : (
              <TrendingDown className="w-5 h-5 text-primary" />
            )}
          </div>
          <div>
            <div className="font-semibold">{transaction.tokenName}</div>
            <div className="text-xs text-muted-foreground font-mono overflow-hidden text-ellipsis">
              {transaction.tokenAddress}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <div>
            <div className="text-sm text-muted-foreground">Amount</div>
            <div className="font-semibold">{transaction.amount.toLocaleString()} tokens</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Price</div>
            <div className="font-semibold">{transaction.price} {transaction.tokenType?.toUpperCase() || 'SOL'}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Profit</div>
            <div className={cn("font-semibold", getProfitColor(transaction.profit))}>
              {formatProfit(transaction.profit)} {transaction.tokenType?.toUpperCase() || 'SOL'}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {statusIcon[transaction.status]}
            <span className="text-sm capitalize">{transaction.status}</span>
          </div>
          {showSolscanLink ? (
            <a
              href={`https://solscan.io/tx/${transaction.txId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-accent/10 transition-colors duration-200"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <span className="p-2 opacity-50 cursor-not-allowed">
              <ExternalLink className="w-4 h-4" />
            </span>
          )}
          <button
            onClick={handleDeleteClick}
            className="p-2 rounded-lg hover:bg-red-500/10 transition-colors duration-200 text-red-500"
            title="Delete transaction"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-border hidden group-hover:block animate-fade-in">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Transaction Hash</div>
            <div className="font-mono text-sm overflow-hidden text-ellipsis">
              {showSolscanLink ? (
                <a
                  href={`https://solscan.io/tx/${transaction.txId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {transaction.txId}
                </a>
              ) : (
                <span className="text-muted-foreground">
                  {transaction.status === 'pending' ? 'Pending confirmation...' : transaction.txId}
                </span>
              )}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Time</div>
            <div className="text-sm">
              {new Date(transaction.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Transactions: React.FC = () => {
  const { connected, disconnect } = useWallet();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWithoutWallet, setShowWithoutWallet] = useState(() => {
    // Initialize with true if coming from Sniper page or if there are transactions in localStorage
    if (typeof window !== 'undefined') {
      // Check URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const isNewTransaction = urlParams.get('new') === 'true';
      
      if (isNewTransaction) {
        return true;
      }
      
      // Check localStorage for existing transactions
      try {
        const storedData = localStorage.getItem('transactions');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            // If we find transactions in localStorage, set showWithoutWallet to true
            console.log("Found transactions in localStorage during initialization, showing without wallet");
            return true;
          }
        }
      } catch (e) {
        console.error("Error checking localStorage during initialization:", e);
      }
    }
    return false;
  });

  // Force reload transactions when component is mounted or re-mounted
  useEffect(() => {
    console.log("Transaction component mounted/re-mounted");
    console.log("Initial showWithoutWallet state:", showWithoutWallet);
    
    // Check URL parameters again to be sure
    const urlParams = new URLSearchParams(window.location.search);
    const isNewTransaction = urlParams.get('new') === 'true';
    
    // If coming from Sniper page, set showWithoutWallet to true
    if (isNewTransaction && !showWithoutWallet) {
      console.log("Detected new=true parameter, setting showWithoutWallet=true");
      setShowWithoutWallet(true);
    }
    
    // Force re-load transactions from localStorage
    try {
      // Đọc trực tiếp từ localStorage để đảm bảo có dữ liệu mới nhất
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const storedData = localStorage.getItem('transactions');
        if (storedData) {
          try {
            let parsedTransactions = JSON.parse(storedData);
            if (Array.isArray(parsedTransactions)) {
              // Đếm số lượng pending transactions để debug
              const pendingTxs = parsedTransactions.filter(tx => tx.status === 'pending');
              if (pendingTxs.length > 0) {
                console.log("Có", pendingTxs.length, "giao dịch pending:", 
                  pendingTxs.map(tx => `${tx.tokenName} (${tx.id})`));
              }
              
              // Xóa các giao dịch thất bại
              const failedTxs = parsedTransactions.filter(tx => tx.status === 'failed');
              if (failedTxs.length > 0) {
                console.log("Xóa", failedTxs.length, "giao dịch failed");
                // Lọc bỏ các giao dịch failed
                parsedTransactions = parsedTransactions.filter(tx => tx.status !== 'failed');
                // Lưu lại vào localStorage
                localStorage.setItem('transactions', JSON.stringify(parsedTransactions));
              }
              
              if (parsedTransactions.length > 0) {
                console.log("Đọc trực tiếp từ localStorage, tìm thấy:", parsedTransactions.length, "transactions");
                setTransactions(parsedTransactions);
                setShowWithoutWallet(true);
              }
            }
          } catch (e) {
            console.error("Lỗi khi parse dữ liệu từ localStorage:", e);
          }
        }
      }
    } catch (e) {
      console.error("Lỗi khi đọc từ localStorage:", e);
    }
    
    // Cũng đọc qua API
    const currentTransactions = getTransactions();
    console.log("Loaded transactions from API, found:", currentTransactions.length);
    
    if (currentTransactions.length > 0 && transactions.length === 0) {
      setShowWithoutWallet(true);
      setTransactions(currentTransactions);
    }
    
    setLoading(false);

    // Nếu chuyển từ trang sniper với tham số new=true, tiếp tục kiểm tra transactions
    if (isNewTransaction) {
      console.log("Detected new=true parameter, checking transactions again...");
      
      const checkLocalStorage = () => {
        try {
          const storedTransactions = localStorage.getItem('transactions');
          if (!storedTransactions) return [];
          
          try {
            return JSON.parse(storedTransactions);
          } catch (e) {
            console.error("Error parsing data from localStorage:", e);
            return [];
          }
        } catch (e) {
          console.error("Error checking transactions:", e);
          return [];
        }
      };

      // Try checking immediately
      const initialCheck = checkLocalStorage();
      if (initialCheck.length > 0) {
        setTransactions(initialCheck);
        setLoading(false);
        return;
      }
    }
  }, []);

  // Monitor wallet connection state
  useEffect(() => {
    // Handle wallet disconnection - clear transactions
    const handleWalletDisconnect = (isConnected: boolean) => {
      // Skip clearing transactions in these cases:
      // 1. If we're coming from the Sniper page with new=true parameter
      // 2. If we're on the Transactions page (just switching tabs)
      // 3. If transactions were already loaded and should be shown
      
      const urlParams = new URLSearchParams(window.location.search);
      const isNewTransaction = urlParams.get('new') === 'true';
      
      // Skip clearing if transactions should be shown
      if (isNewTransaction || showWithoutWallet) {
        console.log("Skipping transaction clear on wallet disconnect due to showWithoutWallet=true or new=true");
        return;
      }
      
      // Only clear transactions when wallet actually disconnects
      if (!isConnected && transactions.length > 0) {
        // Clear all transactions when wallet disconnects
        clearTransactions();
        setTransactions([]);
        setShowWithoutWallet(false);
        toast.info("All transactions have been cleared");
      }
    };

    // Watch for changes in connected status
    handleWalletDisconnect(connected);
  }, [connected, transactions.length, showWithoutWallet]);
  
  // Update transactions immediately and periodically when connection state changes
  useEffect(() => {
    // Skip if already loaded in the first useEffect
    if (loading) return;
    
    // Ensure transaction store is initialized (will load from localStorage)
    initGlobalTransactionStorage();
    
    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const isNewTransaction = urlParams.get('new') === 'true';
    
    // If redirected from sniper page with new=true parameter, show transactions without wallet
    if (isNewTransaction) {
      setShowWithoutWallet(true);
    }
    
    // ALWAYS update to check transactions from localStorage, regardless of wallet connection

    // Function to update transactions from store
    const updateTransactions = () => {
      try {
        // Read directly from localStorage first
        let foundTransactions = false;
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          const storedData = localStorage.getItem('transactions');
          if (storedData) {
            try {
              const parsedTransactions = JSON.parse(storedData);
              if (Array.isArray(parsedTransactions)) {
                // Count pending transactions for debug
                const pendingCount = parsedTransactions.filter(tx => tx.status === 'pending').length;
                if (pendingCount > 0) {
                  console.log(`Displaying ${pendingCount} pending transactions from localStorage`);
                }
                
                // Remove failed transactions
                const failedCount = parsedTransactions.filter(tx => tx.status === 'failed').length;
                if (failedCount > 0) {
                  console.log(`Removing ${failedCount} failed transactions from localStorage`);
                  // Filter out failed transactions
                  const filteredTxs = parsedTransactions.filter(tx => tx.status !== 'failed');
                  // Save back to localStorage
                  localStorage.setItem('transactions', JSON.stringify(filteredTxs));
                  
                  if (filteredTxs.length > 0) {
                    // Have transactions, display them even without wallet
                    setShowWithoutWallet(true);
                    setTransactions(filteredTxs);
                    foundTransactions = true;
                  }
                  return;
                }
                
                if (parsedTransactions.length > 0) {
                  // Have transactions, display them even without wallet
                  setShowWithoutWallet(true);
                  setTransactions(parsedTransactions);
                  foundTransactions = true;
                }
              }
            } catch (e) {
              console.error("Error parsing data from localStorage:", e);
            }
          }
        }
        
        // If not found from localStorage, try to get via API
        if (!foundTransactions) {
          // Use helper from lib to get transactions
          const currentTransactions = getTransactions();
          
          // Count pending transactions for debug
          const pendingCount = currentTransactions.filter(tx => tx.status === 'pending').length;
          if (pendingCount > 0) {
            console.log(`Displaying ${pendingCount} pending transactions from API`);
          }
          
          if (currentTransactions.length > 0) {
            // Have transactions, display them even without wallet
            setShowWithoutWallet(true);
            setTransactions(currentTransactions);
          } else if (transactions.length > 0) {
            // If previously had transactions but now don't, update state
            setTransactions([]);
          }
        }
      } catch (error) {
        console.error("Error updating transactions:", error);
      } finally {
        // Ensure loading state is set to false in all cases
        setLoading(false);
      }
    };
    
    // Update immediately when component mounts
    updateTransactions();
    
    // Update periodically every 500ms
    const intervalId = setInterval(updateTransactions, 500);
    
    return () => clearInterval(intervalId);
  }, [connected, showWithoutWallet, loading]);

  // Handle transaction deletion
  const handleDeleteTransaction = (id: string) => {
    const success = deleteTransaction(id);
    if (success) {
      // Update local state
      setTransactions(prev => prev.filter(tx => tx.id !== id));
      toast.success("Transaction deleted successfully");
    } else {
      toast.error("Could not delete transaction");
    }
  };

  // Handle clear all transactions
  const handleClearAll = () => {
    if (transactions.length > 0) {
      clearTransactions();
      setTransactions([]);
      toast.success("All transactions cleared");
    }
  };

  // Kiểm tra tham số URL để xem có cần focus vào transaction mới không
  useEffect(() => {
    // Kiểm tra nếu URL có tham số ?new=true thì tự động scroll đến transaction mới nhất
    const urlParams = new URLSearchParams(window.location.search);
    const isNewTransaction = urlParams.get('new') === 'true';
    if (isNewTransaction && transactions.length > 0) {
      // Có thể thêm code scroll đến transaction đầu tiên ở đây nếu cần
      console.log("Có transaction mới, transaction đầu tiên:", transactions[0]);
    }
  }, [transactions]);

  // Hiển thị loader khi đang tải
  if (loading) {
    return (
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold gradient-text">Transactions</h1>
            <p className="text-sm text-muted-foreground mt-1">View your recent trading activity</p>
          </div>
          
          <div className="glass p-8 rounded-xl text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Loading Transactions</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
              Please wait while we fetch your trading activity
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Hiển thị thông báo khi không có giao dịch 
  if (!loading && transactions.length === 0) {
    // Kiểm tra lại localStorage một lần nữa để đảm bảo không bỏ sót transactions
    let hasTransactionsInStorage = false;
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const storedData = localStorage.getItem('transactions');
        if (storedData) {
          const parsedTransactions = JSON.parse(storedData);
          if (Array.isArray(parsedTransactions) && parsedTransactions.length > 0) {
            // Nếu có transactions trong localStorage, hiển thị chúng
            console.log("Found transactions in localStorage during final check");
            setTransactions(parsedTransactions);
            setShowWithoutWallet(true);
            hasTransactionsInStorage = true;
          }
        }
      }
    } catch (e) {
      console.error("Error in final localStorage check:", e);
    }
    
    // Hiển thị thông báo không có giao dịch, chung cho cả trường hợp có wallet và không có wallet
    if (!hasTransactionsInStorage) {
      return (
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold gradient-text">Transactions</h1>
              <p className="text-sm text-muted-foreground mt-1">View your recent trading activity</p>
            </div>
            
            <div className="glass p-8 rounded-xl text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <AlertCircle className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">No Transactions Yet</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                {connected 
                  ? "Configure and activate a sniper to start trading tokens" 
                  : "Configure a sniper to start trading tokens"}
              </p>
            </div>
          </div>
        </div>
      );
    }
  }

  // Tính tổng profit - reset về 0 theo yêu cầu
  const totalProfit = 0; // Always show 0 as requested

  return (
    <div className="flex-1 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold gradient-text">Transactions</h1>
            <p className="text-sm text-muted-foreground mt-1">View your recent trading activity</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="glass px-4 py-2 rounded-lg">
              <div className="text-sm text-muted-foreground">Total Profit</div>
              <div className="text-lg font-bold text-green-500">
                +0.00 SOL
              </div>
            </div>
            
            {transactions.length > 0 && (
              <button
                onClick={handleClearAll}
                className="modern-button bg-red-500/80 hover:bg-red-500 flex items-center space-x-2 px-3 py-2"
                title="Clear all transactions"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {transactions.map(tx => (
            <TransactionRow 
              key={tx.id} 
              transaction={tx} 
              onDelete={handleDeleteTransaction} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Transactions;