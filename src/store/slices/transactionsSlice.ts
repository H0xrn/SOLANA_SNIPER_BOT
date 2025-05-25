import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Transaction } from '../../types';

const initialState: Transaction[] = [];

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.push(action.payload);
    },
    updateTransactionStatus: (
      state,
      action: PayloadAction<{ hash: string; status: Transaction['status'] }>
    ) => {
      const transaction = state.find(tx => tx.hash === action.payload.hash);
      if (transaction) {
        transaction.status = action.payload.status;
      }
    },
    clearTransactions: (state) => {
      state.length = 0;
    },
  },
});

export const { addTransaction, updateTransactionStatus, clearTransactions } = transactionsSlice.actions;
export default transactionsSlice.reducer;