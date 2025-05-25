import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Lock, Eye, EyeOff, AlertCircle, Import } from 'lucide-react';
import { Button } from './ui/button';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface PrivateKeyWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (privateKey: string) => Promise<void>;
}

export const PrivateKeyWalletModal: React.FC<PrivateKeyWalletModalProps> = ({
  isOpen,
  onClose,
  onConnect,
}) => {
  const [privateKey, setPrivateKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [connectionSuccess, setConnectionSuccess] = useState(false);
  
  // Check if wallet is connected from Redux store
  const { connected } = useSelector((state: RootState) => state.wallet);

  // Handle ESC key press
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Reset states when opening modal
      setPrivateKey('');
      setError(null);
      setConnectionSuccess(false);
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // Close modal when connection is successful and connected === true
  useEffect(() => {
    if (connectionSuccess && connected && isOpen) {
      console.log("PrivateKeyWalletModal: Connection successful, closing modal");
      onClose();
    }
  }, [connectionSuccess, connected, isOpen, onClose]);
  
  // Debug log connection information
  useEffect(() => {
    if (isOpen) {
      console.log("PrivateKeyWalletModal: Current connection state from Redux:", connected);
      console.log("PrivateKeyWalletModal: Connection success state:", connectionSuccess);
    }
  }, [isOpen, connected, connectionSuccess]);

  const handleConnectWallet = async () => {
    if (!privateKey.trim()) {
      setError('Private key is required');
      return;
    }

    try {
      setError(null);
      setLoading(true);
      console.log("PrivateKeyWalletModal: Attempting to connect wallet");
      await onConnect(privateKey);
      console.log("PrivateKeyWalletModal: Connection attempt completed");
      // Mark connection as successful
      setConnectionSuccess(true);
    } catch (err: any) {
      console.error("PrivateKeyWalletModal: Connection error:", err);
      setError(err.message || 'Failed to connect wallet');
      setConnectionSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConnectWallet();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="modalLayer">
      {/* Backdrop with blur */}
      <div 
        className="modalBackdrop"
        style={{ 
          animation: "backdropAppear 0.2s ease-out forwards",
          cursor: "pointer" 
        }}
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div 
        className="modalContent rounded-xl border border-gray-800/50 bg-gray-900/95 shadow-2xl"
        style={{ 
          width: "410px",
          maxWidth: "90vw",
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          animation: "modalAppear 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 flex justify-between items-center border-b border-gray-800">
          <div className="flex items-center text-primary space-x-2">
            <Import className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-primary">
              Import Private Key
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        
        <div className="p-5 space-y-4">
          {/* Warning message */}
          <div className="bg-yellow-500/10 rounded-lg p-3 mb-4 border border-yellow-500/30">
            <div className="flex space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
              <div className="text-sm text-gray-300">
                <span className="text-yellow-500 font-medium">Security Warning:</span> Enter your private key only on trusted sites. Never share your private key with anyone.
              </div>
            </div>
          </div>
          
          {/* Private key input */}
          <div>
            <div className="flex items-center space-x-1 mb-2">
              <Lock className="w-4 h-4 text-gray-400" />
              <label className="text-sm font-medium text-gray-200">Private Key</label>
            </div>
            
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-500">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type={showPrivateKey ? 'text' : 'password'}
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter private key (Base58 or byte array)"
                className="w-full h-12 pl-10 pr-10 py-3 bg-gray-900/70 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-gray-100"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPrivateKey(!showPrivateKey)}
                className="absolute right-3 top-3 text-gray-400 hover:text-white"
                aria-label={showPrivateKey ? "Hide private key" : "Show private key"}
              >
                {showPrivateKey ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              You can enter a base58 encoded private key or a JSON array of bytes.
            </p>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex justify-end space-x-3 mt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="text-gray-300 hover:bg-gray-800 transition-all"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConnectWallet}
              disabled={loading}
              className="bg-gradient-to-r from-primary/90 to-primary hover:opacity-90 transition-all shadow-lg"
            >
              {loading ? 'Connecting...' : 'Import'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // Use React Portal to render the modal outside the normal DOM hierarchy
  return ReactDOM.createPortal(
    modalContent,
    document.body
  );
}; 