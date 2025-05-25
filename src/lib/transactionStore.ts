// Transaction interface 
export interface Transaction {
  id: string;
  tokenName: string;
  tokenAddress: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  profit?: number;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: number;
  txId: string;
  tokenType?: 'sol' | 'wsol'; // Optional for backward compatibility
}

// Đọc transactions từ localStorage
const loadTransactionsFromStorage = (): Transaction[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const storedData = localStorage.getItem('transactions');
    if (storedData) {
      const parsed = JSON.parse(storedData);
      if (Array.isArray(parsed)) {
        return parsed;
      } else {
        console.error('Invalid transaction data in localStorage, resetting');
        localStorage.removeItem('transactions');
      }
    }
  } catch (error) {
    console.error('Error loading transactions from localStorage:', error);
    // Xóa dữ liệu lỗi
    localStorage.removeItem('transactions');
  }
  
  return [];
};

// Lưu transactions vào localStorage
const saveTransactionsToStorage = (transactions: Transaction[]) => {
  if (typeof window === 'undefined') return;
  
  try {
    // Kiểm tra dữ liệu trước khi lưu
    if (!Array.isArray(transactions)) {
      console.error('Attempted to save invalid transaction data, aborting');
      return;
    }
    
    // Giới hạn số lượng transaction để tránh vượt quá giới hạn localStorage
    const trimmedTransactions = transactions.slice(0, 100);
    localStorage.setItem('transactions', JSON.stringify(trimmedTransactions));
    console.log(`Đã lưu ${trimmedTransactions.length} giao dịch vào localStorage`);
  } catch (error) {
    console.error('Error saving transactions to localStorage:', error);
  }
};

// Khởi tạo global transaction storage
export const initGlobalTransactionStorage = () => {
  if (typeof window === 'undefined') return;

  // Khởi tạo transaction store từ localStorage nếu chưa tồn tại
  if (!(window as any).transactionsStoreInitialized) {
    console.log("Khởi tạo transactionsStore từ localStorage");
    const savedTransactions = loadTransactionsFromStorage();
    
    // Set window.transactionsStore và đánh dấu đã khởi tạo
    (window as any).transactionsStore = savedTransactions;
    (window as any).transactionsStoreInitialized = true;
    
    console.log(`Đã khởi tạo transactionsStore với ${savedTransactions.length} transactions`);
  }

  // Khởi tạo addTransaction function nếu chưa tồn tại
  if (!(window as any).addTransaction) {
    console.log("Khởi tạo addTransaction function");
    (window as any).addTransaction = (transaction: Transaction) => {
      console.log("addTransaction được gọi với:", transaction);
      
      // Đảm bảo store tồn tại
      if (!(window as any).transactionsStore) {
        (window as any).transactionsStore = loadTransactionsFromStorage();
      }
      
      // Kiểm tra transaction đã tồn tại chưa để tránh trùng lặp
      const existingIndex = (window as any).transactionsStore.findIndex(
        (tx: Transaction) => tx.id === transaction.id
      );
      
      if (existingIndex >= 0) {
        // Nếu transaction đã tồn tại, cập nhật nó
        console.log("Transaction đã tồn tại, cập nhật status");
        (window as any).transactionsStore[existingIndex] = {
          ...(window as any).transactionsStore[existingIndex],
          ...transaction
        };
      } else {
        // Thêm giao dịch mới vào đầu mảng
        (window as any).transactionsStore = [transaction, ...(window as any).transactionsStore].slice(0, 100);
      }
      
      // Lưu vào localStorage
      saveTransactionsToStorage((window as any).transactionsStore);
      
      console.log("transactionsStore sau khi thêm:", (window as any).transactionsStore);
      console.log("Số lượng transactions hiện tại:", (window as any).transactionsStore.length);
    };
  }
};

// Helper để thêm transaction
export const addTransaction = (transaction: Transaction) => {
  // Đảm bảo storage đã được khởi tạo
  initGlobalTransactionStorage();
  
  if (typeof window !== 'undefined' && (window as any).addTransaction) {
    (window as any).addTransaction(transaction);
    return true;
  }
  
  return false;
};

// Helper để lấy transactions
export const getTransactions = (): Transaction[] => {
  if (typeof window === 'undefined') return [];
  
  // Đảm bảo transactionsStore đã được khởi tạo
  if (!(window as any).transactionsStoreInitialized) {
    initGlobalTransactionStorage();
  }
  
  // Nếu window.transactionsStore vẫn chưa tồn tại, load trực tiếp từ localStorage
  if (!(window as any).transactionsStore) {
    (window as any).transactionsStore = loadTransactionsFromStorage();
  }
  
  return [...(window as any).transactionsStore];
};

// Helper để xóa tất cả transactions
export const clearTransactions = () => {
  if (typeof window !== 'undefined') {
    // Trước khi xóa, kiểm tra xem có đang ở trang transactions với tham số new=true không
    if (typeof window.location !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const isNewTransaction = urlParams.get('new') === 'true';
      
      if (isNewTransaction) {
        console.log("Skipping clearTransactions due to new=true parameter");
        return;
      }
      
      // Cũng kiểm tra xem hiện tại đang ở trang nào
      // Nếu đang ở trang Transactions, không xóa transactions khi chuyển tab
      const currentPath = window.location.pathname;
      if (currentPath.includes('transactions')) {
        console.log("Skipping clearTransactions on transactions page");
        return;
      }
    }
    
    (window as any).transactionsStore = [];
    localStorage.removeItem('transactions');
    console.log("Đã xóa tất cả transactions");
  }
};

// Helper để xóa một transaction cụ thể theo ID
export const deleteTransaction = (transactionId: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Đảm bảo transactionsStore đã được khởi tạo
  if (!(window as any).transactionsStoreInitialized) {
    initGlobalTransactionStorage();
  }
  
  // Lấy transactions hiện tại
  const currentTransactions = (window as any).transactionsStore || [];
  
  // Kiểm tra nếu có transaction với ID này
  const index = currentTransactions.findIndex((tx: Transaction) => tx.id === transactionId);
  
  if (index === -1) {
    console.log(`Không tìm thấy transaction với ID: ${transactionId}`);
    return false;
  }
  
  // Xóa transaction
  currentTransactions.splice(index, 1);
  (window as any).transactionsStore = currentTransactions;
  
  // Lưu vào localStorage
  saveTransactionsToStorage(currentTransactions);
  
  console.log(`Đã xóa transaction với ID: ${transactionId}`);
  console.log(`Còn lại ${currentTransactions.length} transactions`);
  
  return true;
};

// Khởi tạo ngay khi module được load
initGlobalTransactionStorage();

// Remove error data
export const clearErrorData = (): void => {
  errorStore = {};
  errorCount = 0;
  saveErrorStore();
}

// Check data before saving
export function sanitizeTransaction(transaction: SniperTransaction): SniperTransaction {
  const copy = { ...transaction };
  
  // Ensure ID exists
  if (!copy.id) {
    copy.id = String(Date.now() + Math.floor(Math.random() * 1000));
  }
  
  // Validate dates
  if (typeof copy.timestamp !== 'number' || isNaN(copy.timestamp) || copy.timestamp <= 0) {
    copy.timestamp = Date.now();
  }
  
  return copy;
} 