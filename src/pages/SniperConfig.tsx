import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { addSniperConfig, updateSniperConfig, deleteSniperConfig } from '../store';
import { Plus, Trash2, Save, Zap, Target, Timer, DollarSign, AlertCircle, ChevronDown, ChevronUp, X, Wallet } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useWallet } from '@solana/wallet-adapter-react';
import { startSnipe } from '../lib/sniperService';
import toast from '../lib/toast-shim';
import { useNavigate } from 'react-router-dom';
import { initGlobalTransactionStorage, getTransactions } from '../lib/transactionStore';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getSolBalance, getWsolBalance, SOLANA_RPC_ENDPOINT } from '../lib/solana';

// Initialize transaction storage immediately when module is loaded
initGlobalTransactionStorage();

const SniperConfig: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const sniperConfigs = useSelector((state: RootState) => state.sniperConfigs.configs);
  const walletState = useSelector((state: RootState) => state.wallet);
  const [expandedConfig, setExpandedConfig] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [pendingSnipeConfig, setPendingSnipeConfig] = useState<any>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [wsolBalance, setWsolBalance] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [configToDelete, setConfigToDelete] = useState<string | null>(null);
  const [newConfig, setNewConfig] = useState({
    name: '',
    tokenAddress: '',
    buyAmount: '',
    sellTarget: '',
    stopLoss: '',
    maxSlippage: '1',
    tokenType: 'sol' as 'sol' | 'wsol', // Default to SOL
    autoApprove: false,
    notifications: {
      telegram: false,
      email: false,
    },
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const wallet = useWallet();
  const { connected, publicKey } = wallet;

  // Fetch wallet balances when connected
  useEffect(() => {
    const fetchBalances = async () => {
      if (!connected || !publicKey) return;
      
      setLoadingBalance(true);
      try {
        const connection = new Connection(SOLANA_RPC_ENDPOINT, 'confirmed');
        
        // Fetch SOL balance
        const sol = await getSolBalance(connection, publicKey);
        setSolBalance(sol);
        
        // Fetch wSOL balance
        const wsol = await getWsolBalance(connection, publicKey);
        setWsolBalance(wsol);
      } catch (error) {
        console.error('Error fetching balances:', error);
        toast.error('Failed to fetch wallet balances');
      } finally {
        setLoadingBalance(false);
      }
    };
    
    fetchBalances();
  }, [connected, publicKey]);

  // Fetch wallet balances when connected via Redux
  useEffect(() => {
    const fetchBalancesFromRedux = async () => {
      // Only perform if connected via Redux but not via adapter
      if (!walletState.connected || connected || !walletState.address) return;
      
      setLoadingBalance(true);
      try {
        const connection = new Connection(SOLANA_RPC_ENDPOINT, 'confirmed');
        
        // Fetch SOL balance
        const sol = await getSolBalance(connection, walletState.address);
        setSolBalance(sol);
        
        // Fetch wSOL balance
        const pubKey = new PublicKey(walletState.address);
        const wsol = await getWsolBalance(connection, pubKey);
        setWsolBalance(wsol);
      } catch (error) {
        console.error('Error fetching balances from Redux state:', error);
        toast.error('Failed to fetch wallet balances');
      } finally {
        setLoadingBalance(false);
      }
    };
    
    fetchBalancesFromRedux();
  }, [walletState.connected, walletState.address, connected]);

  // Simulate wallet connection in demo environment - currently skipped to check real connection status
  useEffect(() => {
    // Only log the initial connection status, no override
    console.log("Wallet connection status (initial):", connected);
    console.log("Wallet object (initial):", wallet);
    
    // Ensure transaction storage is initialized when component mounts
    initGlobalTransactionStorage();
  }, []);

  // Check if new configuration can be saved
  const canSaveConfig = (): boolean => {
    // Only check if name and token address are provided
    return !!newConfig.name && !!newConfig.tokenAddress;
  };

  const handleAddConfig = () => {
    if (canSaveConfig()) {
      dispatch(addSniperConfig({ ...newConfig, id: Date.now().toString() }));
      setNewConfig({
        name: '',
        tokenAddress: '',
        buyAmount: '',
        sellTarget: '',
        stopLoss: '',
        maxSlippage: '1',
        tokenType: 'sol',
        autoApprove: false,
        notifications: {
          telegram: false,
          email: false,
        },
      });
      setIsModalOpen(false);
    }
  };

  const handleUpdateConfig = (id: string, updates: any) => {
    dispatch(updateSniperConfig({ id, updates }));
  };

  const handleDeleteConfig = (id: string) => {
    dispatch(deleteSniperConfig(id));
    // Ensure expanded view is closed if the deleted config was expanded
    if (expandedConfig === id) {
      setExpandedConfig(null);
    }
  };

  const openDeleteConfirmation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfigToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (configToDelete) {
      handleDeleteConfig(configToDelete);
      setConfigToDelete(null);
      setIsDeleteModalOpen(false);
    }
  };

  // Check if the user has enough balance for a transaction
  const hasEnoughBalance = (config: any): boolean => {
    const buyAmount = parseFloat(config.buyAmount) || 0;
    
    if (config.tokenType === 'sol') {
      // Not enough SOL for fees (< 0.1 SOL)
      if (solBalance !== null && solBalance < 0.1) {
        setErrorMessage(`Insufficient SOL balance for fees. You have ${solBalance?.toFixed(4)} SOL but need at least 0.1 SOL for transaction fees.`);
        return false;
      }
      
      // Check input amount
      if (buyAmount < 0.3) {
        setErrorMessage(`Amount too small. You need at least 0.3 SOL to execute a snipe order.`);
        return false;
      }
      
      // Check if balance is sufficient for the order
      return (solBalance !== null) && (solBalance >= buyAmount + 0.01);
    } else {
      // wSOL
      // Not enough wSOL for fees (< 0.1 wSOL)
      if (wsolBalance !== null && wsolBalance < 0.1) {
        setErrorMessage(`Insufficient wSOL balance for fees. You have ${wsolBalance?.toFixed(4)} wSOL but need at least 0.1 wSOL for transaction fees.`);
        return false;
      }
      
      // Check input amount
      if (buyAmount < 0.3) {
        setErrorMessage(`Amount too small. You need at least 0.3 wSOL to execute a snipe order.`);
        return false;
      }
      
      // Check if balance is sufficient for the order
      return (wsolBalance !== null) && (wsolBalance >= buyAmount);
    }
  };

  const handleSnipe = (config: any) => {
    // Clear previous error messages
    setErrorMessage(null);
    
    // Debug log
    console.log("handleSnipe called for config:", config);
    
    // Check wallet connection
    if (!connected && !walletState.connected) {
      console.log("Wallet not connected, showing modal");
      setPendingSnipeConfig(config);
      setIsWalletModalOpen(true);
      return;
    }
    
    // Check balance
    if (!hasEnoughBalance(config)) {
      // Error message has been set in hasEnoughBalance function
      if (!errorMessage) {
        const tokenTypeLabel = config.tokenType === 'sol' ? 'SOL' : 'wSOL';
        const currentBalance = config.tokenType === 'sol' ? solBalance : wsolBalance;
        setErrorMessage(`Insufficient ${tokenTypeLabel} balance. You have ${currentBalance?.toFixed(4)} ${tokenTypeLabel} but need ${config.buyAmount} ${tokenTypeLabel}.`);
      }
      toast.error(errorMessage || "Insufficient balance");
      return;
    }
    
    // Execute snipe
    executeSnipe(config);
  };

  const executeSnipe = (config: any) => {
    console.log("executeSnipe called with config:", config);
    
    try {
      // Ensure tokenType is present
      const updatedConfig = {
        ...config,
        tokenType: config.tokenType || 'sol'
      };
      
      // Call service
      startSnipe(updatedConfig);
      
      // Redirect to transactions page after 1 second
      setTimeout(() => {
        console.log("Redirecting to transactions page");
        navigate('/transactions?new=true');
      }, 1000);
    } catch (error) {
      console.error("Error executing snipe:", error);
      toast.error("Failed to start snipe");
    }
  };

  const handleConnectWallet = () => {
    // Check if wallet is already connected to avoid reconnecting
    if (connected || walletState.connected) {
      setIsWalletModalOpen(false);
      // If there is a pending snipe config, execute it
      if (pendingSnipeConfig) {
        executeSnipe(pendingSnipeConfig);
        setPendingSnipeConfig(null);
      }
      return;
    }

    // Close modal
    setIsWalletModalOpen(false);

    // Find wallet connection button in header
    // Select all buttons and find the one with "Connect Wallet" text or wallet icon
    const walletButtons = document.querySelectorAll('button');
    let walletButton = null;
    
    for (const button of walletButtons) {
      const buttonHTML = button.innerHTML || '';
      const buttonText = button.textContent || '';
      
      if (buttonText.includes('Connect Wallet') || 
          buttonHTML.toLowerCase().includes('wallet') ||
          buttonHTML.includes('connect')) {
        walletButton = button;
        break;
      }
    }
    
    if (walletButton) {
      // Click the wallet button to open the connect wallet modal
      walletButton.click();
      
      // Track changes in wallet connection
      const checkWalletConnection = setInterval(() => {
        if (wallet.connected || walletState.connected) {
          clearInterval(checkWalletConnection);
          // If connection is successful and there is a pendingSnipeConfig, execute snipe
          if (pendingSnipeConfig) {
            executeSnipe(pendingSnipeConfig);
            setPendingSnipeConfig(null);
          }
        }
      }, 1000); // Check every second
      
      // Set timeout to avoid waiting too long
      setTimeout(() => {
        clearInterval(checkWalletConnection);
      }, 30000); // Timeout after 30 seconds
    } else {
      toast.info("Please use the wallet button in the top navigation bar to connect your wallet");
    }
  };

  return (
    <div className="flex-1 h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold gradient-text">Sniper Configuration</h1>
            <p className="text-sm text-muted-foreground mt-1">Configure your token sniping strategies</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="modern-button solana-glow flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Sniper
          </button>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="glass p-4 rounded-xl mb-6 border border-red-500 bg-red-500/10">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
              <span className="text-red-500 font-medium">{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Wallet balances display */}
        {(connected || walletState.connected) && (
          <div className="glass p-4 rounded-xl mb-6">
            <div className="flex items-center mb-2">
              <Wallet className="w-4 h-4 mr-2 text-primary" />
              <span className="text-sm font-medium">Wallet Balances</span>
              {!connected && walletState.connected && (
                <span className="text-xs text-yellow-500 ml-2">(Connected via Redux)</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted-foreground">SOL Balance</div>
                <div className="font-semibold">
                  {loadingBalance ? 'Loading...' : solBalance !== null ? `${solBalance.toFixed(4)} SOL` : 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">wSOL Balance</div>
                <div className="font-semibold">
                  {loadingBalance ? 'Loading...' : wsolBalance !== null ? `${wsolBalance.toFixed(4)} wSOL` : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {sniperConfigs.length === 0 && (
          <div className="glass p-6 rounded-xl text-center animate-fade-in">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <AlertCircle className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">No Sniper Configurations</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
              Create your first sniper configuration to start sniping tokens
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="modern-button solana-glow flex items-center mx-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Sniper
            </button>
          </div>
        )}

        {/* New Config Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="glass p-6 rounded-xl w-full max-w-lg mx-4 animate-scale-in">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold gradient-text">Create New Sniper</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-lg hover:bg-accent/10 transition-colors duration-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <input
                    type="text"
                    value={newConfig.name}
                    onChange={(e) => setNewConfig({ ...newConfig, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter sniper name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Token Address</label>
                  <input
                    type="text"
                    value={newConfig.tokenAddress}
                    onChange={(e) => setNewConfig({ ...newConfig, tokenAddress: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                    placeholder="Enter token address"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Token Type</label>
                    <select
                      value={newConfig.tokenType}
                      onChange={(e) => setNewConfig({ ...newConfig, tokenType: e.target.value as 'sol' | 'wsol' })}
                      className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="sol">SOL</option>
                      <option value="wsol">wSOL</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Buy Amount</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={newConfig.buyAmount}
                        onChange={(e) => setNewConfig({ ...newConfig, buyAmount: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Enter amount"
                      />
                      <span className="absolute right-3 top-2 text-sm text-muted-foreground">
                        {newConfig.tokenType.toUpperCase()}
                      </span>
                    </div>
                    
                    {(connected || walletState.connected) && newConfig.buyAmount && (
                      <div className="text-xs mt-1">
                        {newConfig.tokenType === 'sol' && solBalance !== null && (
                          <span className={parseFloat(newConfig.buyAmount) > solBalance ? 'text-red-500' : 'text-green-500'}>
                            Balance: {solBalance.toFixed(4)} SOL
                          </span>
                        )}
                        {newConfig.tokenType === 'wsol' && wsolBalance !== null && (
                          <span className={parseFloat(newConfig.buyAmount) > wsolBalance ? 'text-red-500' : 'text-green-500'}>
                            Balance: {wsolBalance.toFixed(4)} wSOL
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sell Target (%)</label>
                  <input
                    type="number"
                    value={newConfig.sellTarget}
                    onChange={(e) => setNewConfig({ ...newConfig, sellTarget: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter target"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Stop Loss (%)</label>
                  <input
                    type="number"
                    value={newConfig.stopLoss}
                    onChange={(e) => setNewConfig({ ...newConfig, stopLoss: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter stop loss"
                  />
                </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Slippage (%)</label>
                  <input
                    type="number"
                    value={newConfig.maxSlippage}
                    onChange={(e) => setNewConfig({ ...newConfig, maxSlippage: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter slippage"
                  />
                </div>

                <div className="space-y-3 bg-background/50 p-4 rounded-lg border border-border">
                  <label className="text-sm font-medium">Options</label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="autoApprove"
                      checked={newConfig.autoApprove}
                      onChange={(e) => setNewConfig({ ...newConfig, autoApprove: e.target.checked })}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                    />
                      <label htmlFor="autoApprove" className="text-sm">Auto-approve transactions</label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="telegramNotif"
                        checked={newConfig.notifications.telegram}
                        onChange={(e) => setNewConfig({
                          ...newConfig,
                          notifications: { ...newConfig.notifications, telegram: e.target.checked }
                        })}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <label htmlFor="telegramNotif" className="text-sm">Telegram notifications</label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="emailNotif"
                        checked={newConfig.notifications.email}
                        onChange={(e) => setNewConfig({
                          ...newConfig,
                          notifications: { ...newConfig.notifications, email: e.target.checked }
                        })}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <label htmlFor="emailNotif" className="text-sm">Email notifications</label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    onClick={() => setIsModalOpen(false)}
                    variant="outline"
                    className="px-4 py-2"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddConfig}
                    className="modern-button solana-glow px-4 py-2"
                    disabled={!canSaveConfig()}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Config
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wallet Connection Modal */}
        {isWalletModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="glass p-8 rounded-xl w-full max-w-md mx-4 animate-scale-in">
              <div className="flex flex-col items-center text-center">
                <div className="p-4 rounded-full bg-primary/10 mb-4">
                  <Wallet className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-xl font-bold mb-2">Wallet Connection Required</h2>
                <p className="text-muted-foreground mb-6 max-w-sm">
                  You need to connect your wallet before you can start sniping tokens.
                </p>
                <div className="flex space-x-3 w-full">
                  <button
                    onClick={() => setIsWalletModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConnectWallet}
                    className="flex-1 modern-button solana-glow px-4 py-2"
                  >
                    Connect Wallet
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Config List */}
        <div className="space-y-4">
          {sniperConfigs.map((config) => (
            <div key={config.id} className="glass p-4 rounded-xl hover-card transition-all duration-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex items-center space-x-3 mb-3 md:mb-0 md:w-1/3">
                  <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <div className="truncate">
                    <div className="font-semibold">{config.name}</div>
                    <div className="text-xs text-muted-foreground font-mono truncate w-full" title={config.tokenAddress}>
                      {config.tokenAddress.slice(0, 8)}...{config.tokenAddress.slice(-8)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between md:justify-end md:space-x-4 md:w-2/3">
                  <div className="grid grid-cols-3 gap-2 md:gap-4 flex-grow md:flex-grow-0">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Amount</div>
                      <div className="font-semibold whitespace-nowrap">
                        {config.buyAmount} {config.tokenType?.toUpperCase() || 'SOL'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Target</div>
                      <div className="font-semibold">{config.sellTarget}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Stop</div>
                      <div className="font-semibold">{config.stopLoss}%</div>
                    </div>
                  </div>
                  <div className="flex md:ml-2 space-x-1">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("Small Snipe button clicked!");
                        if (!connected && !walletState.connected) {
                          console.log("Wallet not connected, showing modal");
                          setPendingSnipeConfig(config);
                          setIsWalletModalOpen(true);
                          return;
                        }
                        handleSnipe(config);
                      }}
                      className={`p-2 rounded-lg transition-colors duration-200 ${(connected || walletState.connected) ? 'text-green-500 hover:bg-green-500/10 cursor-pointer' : 'text-gray-500 hover:bg-gray-500/10'}`}
                      title={(connected || walletState.connected) ? "Activate Sniper" : "Connect Wallet to Snipe"}
                    >
                      <Zap className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setExpandedConfig(expandedConfig === config.id ? null : config.id)}
                      className="p-2 rounded-lg hover:bg-accent/10 transition-colors duration-200"
                    >
                      {expandedConfig === config.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={(e) => openDeleteConfirmation(config.id, e)}
                      className="p-2 rounded-lg hover:bg-red-500/10 transition-colors duration-200 text-red-500"
                      aria-label="Delete configuration"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              {expandedConfig === config.id && (
                <div className="mt-4 pt-4 border-t border-border animate-fade-in">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Token Type</div>
                      <div className="font-semibold bg-primary/10 p-2 rounded-lg">{config.tokenType?.toUpperCase() || 'SOL'}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Slippage</div>
                      <div className="font-semibold bg-primary/10 p-2 rounded-lg">{config.maxSlippage}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Auto-approve</div>
                      <div className="font-semibold bg-primary/10 p-2 rounded-lg">{config.autoApprove ? 'Yes' : 'No'}</div>
                    </div>
                    <div className="col-span-3 mt-2">
                      <div className="text-xs text-muted-foreground mb-1">Token Address</div>
                      <div className="font-mono text-xs bg-primary/5 p-2 rounded-lg overflow-auto whitespace-nowrap mb-4">{config.tokenAddress}</div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log("Start Snipe button clicked!");
                          if (!connected && !walletState.connected) {
                            console.log("Wallet not connected, showing modal");
                            setPendingSnipeConfig(config);
                            setIsWalletModalOpen(true);
                            return;
                          }
                          handleSnipe(config);
                        }}
                        className={`modern-button px-4 py-3 w-full flex items-center justify-center ${(connected || walletState.connected) ? 'solana-glow cursor-pointer' : 'opacity-80 hover:opacity-100'}`}
                      >
                        <Zap className="w-5 h-5 mr-2" />
                        {(connected || walletState.connected) ? `Start Snipe with ${config.tokenType?.toUpperCase() || 'SOL'}` : 'Connect Wallet to Snipe'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass p-8 rounded-xl w-full max-w-md mx-4 animate-scale-in">
            <div className="flex flex-col items-center text-center">
              <div className="p-4 rounded-full bg-primary/10 mb-4">
                <Trash2 className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-xl font-bold mb-2">Confirm Delete</h2>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Are you sure you want to delete this sniper configuration?
              </p>
              <div className="flex space-x-3 w-full">
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent/10 transition-colors"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SniperConfig;