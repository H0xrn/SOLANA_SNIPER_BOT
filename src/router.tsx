import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import SniperConfig from './pages/SniperConfig';
import Transactions from './pages/Transactions';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout>
      <Dashboard />
    </Layout>,
  },
  {
    path: '/sniper',
    element: <Layout>
      <SniperConfig />
    </Layout>,
  },
  {
    path: '/transactions',
    element: <Layout>
      <Transactions />
    </Layout>,
  },
  {
    path: '/analytics',
    element: <Layout>
      <Analytics />
    </Layout>,
  },
  {
    path: '/settings',
    element: <Layout>
      <Settings />
    </Layout>,
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
} 