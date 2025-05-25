// Khai báo các module không có file định nghĩa kiểu
declare module '@solana/wallet-adapter-react';
declare module '@solana/wallet-adapter-react-ui';
declare module '@solana/wallet-adapter-wallets';
declare module '@solana/wallet-adapter-base' {
  class BaseMessageSignerWalletAdapter {
    emit(event: string, ...args: any[]): boolean;
  }
}
declare module '@solana/web3.js';
declare module 'lucide-react';
declare module 'bs58';
declare module 'react-redux';

// Khắc phục lỗi __dirname không tồn tại trong ESM
declare const __dirname: string;

// Khắc phục lỗi emit trong PrivateKeyWalletAdapter
declare interface EventEmitter {
  emit(event: string, ...args: any[]): boolean;
}

declare module 'vite';
declare module '@vitejs/plugin-react'; 