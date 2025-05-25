import { Connection, PublicKey, LAMPORTS_PER_SOL, Keypair } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, Account, getAssociatedTokenAddress } from '@solana/spl-token';
import { notify } from './notifications';

// wSOL mint address
export const WSOL_MINT = new PublicKey("So11111111111111111111111111111111111111112");

// Use official Alchemy endpoint with your API key
export const SOLANA_RPC_ENDPOINT = 'https://solana-mainnet.g.alchemy.com/v2/D484JYgNn30IeypiMaDgUz0C2mIvU9G6';

// Backup RPC endpoints
export const SOLANA_BACKUP_RPC_ENDPOINT = 'https://solana-api.projectserum.com';

// Known token addresses
export const WSOL_TOKEN_ADDRESS = 'So11111111111111111111111111111111111111112';

/**
 * Format a Solana public key for display (first 4 and last 4 characters)
 */
export const formatPublicKey = (publicKey: string | null): string => {
  if (!publicKey) return 'No key';
  
  return `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`;
};

/**
 * Get SOL balance for a wallet address
 */
export const getSolBalance = async (
  connection: Connection, 
  publicKey: string | PublicKey
): Promise<number> => {
  try {
    // Convert to PublicKey if it's a string
    const pubKey = typeof publicKey === 'string' ? new PublicKey(publicKey) : publicKey;
    
    // Get balance in lamports
    const balance = await connection.getBalance(pubKey);
    
    // Convert to SOL
    const solBalance = balance / LAMPORTS_PER_SOL;
    
    console.log(`SOL balance for ${pubKey.toString()}: ${solBalance}`);
    return solBalance;
  } catch (error) {
    console.error('Error fetching SOL balance:', error);
    // Try backup RPC endpoint if primary fails
    try {
      const backupConnection = new Connection(SOLANA_BACKUP_RPC_ENDPOINT, 'confirmed');
      const pubKey = typeof publicKey === 'string' ? new PublicKey(publicKey) : publicKey;
      const balance = await backupConnection.getBalance(pubKey);
      const solBalance = balance / LAMPORTS_PER_SOL;
      console.log(`SOL balance from backup RPC for ${pubKey.toString()}: ${solBalance}`);
      return solBalance;
    } catch (backupError) {
      console.error('Error fetching SOL balance from backup RPC:', backupError);
      return 0; // Return 0 instead of throwing to avoid crashing the app
    }
  }
};

/**
 * Get wSOL balance for an account
 * @param connection The Solana connection
 * @param publicKey The public key to check balance for
 * @returns Balance in wSOL
 */
export async function getWsolBalance(connection: Connection, walletPubkey: PublicKey): Promise<number> {
  try {
    // Get all token accounts for this wallet
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      walletPubkey,
      { programId: TOKEN_PROGRAM_ID }
    );

    // Find the WSOL account
    const wsolAccount = tokenAccounts.value.find(accountInfo => 
      accountInfo.account.data.parsed.info.mint === WSOL_TOKEN_ADDRESS
    );

    if (!wsolAccount) {
      return 0;
    }

    // Get the balance and convert to SOL
    const rawBalance = wsolAccount.account.data.parsed.info.tokenAmount.amount;
    const decimals = wsolAccount.account.data.parsed.info.tokenAmount.decimals;
    
    return parseFloat(rawBalance) / Math.pow(10, decimals);
  } catch (error) {
    console.error('Error fetching WSOL balance:', error);
    
    // Try backup RPC endpoint if primary fails
    try {
      const backupConnection = new Connection(SOLANA_BACKUP_RPC_ENDPOINT, 'confirmed');
      const tokenAccounts = await backupConnection.getParsedTokenAccountsByOwner(
        walletPubkey,
        { programId: TOKEN_PROGRAM_ID }
      );

      const wsolAccount = tokenAccounts.value.find(accountInfo => 
        accountInfo.account.data.parsed.info.mint === WSOL_TOKEN_ADDRESS
      );

      if (!wsolAccount) {
        return 0;
      }

      const rawBalance = wsolAccount.account.data.parsed.info.tokenAmount.amount;
      const decimals = wsolAccount.account.data.parsed.info.tokenAmount.decimals;
      
      return parseFloat(rawBalance) / Math.pow(10, decimals);
    } catch (backupError) {
      console.error('Error fetching WSOL balance from backup RPC:', backupError);
      return 0;
    }
  }
}

/**
 * Check if a string is a valid Solana address
 */
export const isValidSolanaAddress = (address: string): boolean => {
  try {
    new PublicKey(address);
    return true;
  } catch (error) {
    return false;
  }
}; 
