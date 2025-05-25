import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Wallet, Copy, RefreshCw, LogOut } from 'lucide-react';
import { truncateAddress } from "../lib/utils";
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { useSolanaBalance } from '../hooks/useSolanaBalance';
import { Connection, PublicKey } from '@solana/web3.js';
import { getWsolBalance, SOLANA_RPC_ENDPOINT } from '../lib/solana';
import { useToast } from '../components/ui/use-toast';
import WalletConnect from './WalletConnect';

export default function WalletDetails() {
  const { connected, address } = useSelector((state: RootState) => state.wallet);
  const { toast } = useToast();
  const dispatch = useDispatch();
  
  // SOL balance
  const { solBalance, isLoading, currentEndpoint, refetch } = useSolanaBalance(address);
  
  // WSOL balance
  const [wsolBalance, setWsolBalance] = useState<number | null>(null);
  const [isLoadingWsol, setIsLoadingWsol] = useState(false);
  
  // Copy address to clipboard
  const copyAddressToClipboard = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        title: 'Address copied',
        description: 'Wallet address copied to clipboard',
      });
    }
  };
  
  // Handle disconnect
  const handleDisconnect = () => {
    dispatch({ type: 'wallet/disconnect' });
  };
  
  // Fetch WSOL balance
  const fetchWsolBalance = async () => {
    if (!address) return;
    
    setIsLoadingWsol(true);
    try {
      const endpoint = currentEndpoint || SOLANA_RPC_ENDPOINT;
      const connection = new Connection(endpoint, 'confirmed');
      const pubKey = new PublicKey(address);
      
      const balance = await getWsolBalance(connection, pubKey);
      setWsolBalance(balance);
    } catch (err) {
      console.error('Error fetching WSOL balance:', err);
      toast({
        title: 'Failed to fetch WSOL',
        description: 'Could not retrieve wrapped SOL balance',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingWsol(false);
    }
  };
  
  // Fetch WSOL on address change
  useEffect(() => {
    if (address) {
      fetchWsolBalance();
    } else {
      setWsolBalance(null);
    }
  }, [address, currentEndpoint]);
  
  // Total balance (SOL + WSOL)
  const totalBalance = (() => {
    if (solBalance === null && wsolBalance === null) return null;
    
    let total = 0;
    if (solBalance !== null) total += solBalance;
    if (wsolBalance !== null) total += wsolBalance;
    
    return total;
  })();

  if (!connected || !address) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No wallet connected</p>
            <WalletConnect />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Wallet Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Address Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Address</span>
            <Button size="icon" variant="ghost" onClick={copyAddressToClipboard}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="font-medium">{truncateAddress(address)}</p>
          <p className="text-xs text-muted-foreground break-all">{address}</p>
        </div>
        
        <div className="h-px bg-border w-full"></div>
        
        {/* SOL Balance */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">SOL Balance</span>
            <Button size="icon" variant="ghost" onClick={refetch} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <h3 className="text-2xl font-bold">
            {isLoading ? (
              <span className="text-muted-foreground">Loading...</span>
            ) : (
              solBalance !== null ? `${solBalance.toFixed(6)} SOL` : 'N/A'
            )}
          </h3>
        </div>
        
        {/* WSOL Balance */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">WSOL Balance</span>
            <Button size="icon" variant="ghost" onClick={fetchWsolBalance} disabled={isLoadingWsol}>
              <RefreshCw className={`h-4 w-4 ${isLoadingWsol ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <h3 className="text-2xl font-bold">
            {isLoadingWsol ? (
              <span className="text-muted-foreground">Loading...</span>
            ) : (
              wsolBalance !== null ? `${wsolBalance.toFixed(6)} WSOL` : 'N/A'
            )}
          </h3>
        </div>
        
        {/* Total Balance */}
        <div className="space-y-2">
          <span className="text-sm text-muted-foreground">Total Balance</span>
          <h3 className="text-2xl font-bold">
            {isLoading || isLoadingWsol ? (
              <span className="text-muted-foreground">Loading...</span>
            ) : (
              totalBalance !== null ? `${totalBalance.toFixed(6)} SOL` : 'N/A'
            )}
          </h3>
        </div>
        
        <div className="h-px bg-border w-full"></div>
        
        {/* Disconnect Button */}
        <Button 
          variant="outline" 
          className="w-full py-6 text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-200 animate-pulse hover:animate-none flex items-center justify-center gap-2 text-red-500 border-red-500 hover:bg-red-500/10"
          onClick={handleDisconnect}
        >
          <LogOut className="h-5 w-5" />
          Disconnect Wallet
        </Button>
      </CardContent>
    </Card>
  );
} 