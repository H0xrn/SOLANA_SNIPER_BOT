import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Crosshair, History, LineChart, Settings as SettingsIcon } from 'lucide-react';
import WalletConnect from './WalletConnect';
import { ThemeToggle } from './ThemeToggle';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Sniper', href: '/sniper', icon: Crosshair },
    { name: 'Transactions', href: '/transactions', icon: History },
    { name: 'Analytics', href: '/analytics', icon: LineChart },
    { name: 'Settings', href: '/settings', icon: SettingsIcon },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 glass transition-all duration-300 z-50">
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          <h1 className="text-xl font-bold gradient-text">Solana Sniper Bot</h1>
          <ThemeToggle />
        </div>
        <nav className="mt-6">
          <div className="space-y-1 px-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md
                    transition-all duration-200 hover-card
                    ${location.pathname === item.href
                      ? 'bg-primary/10 text-primary neon-glow'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }
                  `}
                >
                  <Icon className="mr-3 h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 ml-64">
        <header className="h-16 glass border-b border-border flex items-center justify-end px-4 gap-4">
          <WalletConnect />
        </header>
        <main className="p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;