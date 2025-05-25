import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setNetwork } from '../store/slices/walletSlice';
import { useConnection } from '@solana/wallet-adapter-react';
import { memo } from 'react';
import { Network } from 'lucide-react';

// Sử dụng memo để tránh re-render không cần thiết
const NetworkSelector = memo(() => {
  const dispatch = useDispatch();
  const { network } = useSelector((state: RootState) => state.wallet);

  const handleNetworkChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    // Nếu giá trị không thay đổi, không làm gì
    if (value === network) return;
    
    dispatch(setNetwork(value as any));
    
    // Reload trang để áp dụng thay đổi network
    // Đây là cách đơn giản nhất để thay đổi connection endpoint
    if (confirm('Changing network requires a page reload. Continue?')) {
      window.location.reload();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Network className="w-4 h-4 text-gray-400" />
      <select
        value={network}
        onChange={handleNetworkChange}
        className="bg-gray-800 text-white rounded-md px-3 py-1.5 border border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
      >
        <option value="mainnet-beta">Mainnet</option>
        <option value="devnet">Devnet</option>
        <option value="testnet">Testnet</option>
      </select>
    </div>
  );
});

// Thêm displayName để dễ debug
NetworkSelector.displayName = 'NetworkSelector';

export default NetworkSelector; 