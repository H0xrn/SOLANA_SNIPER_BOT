import React, { useState } from 'react';
import { Bell, Shield, Wallet, Zap, Mail, MessageSquare, Moon, Sun, Sliders, Save } from 'lucide-react';
import { cn } from '../lib/utils';
import { useWallet } from '@solana/wallet-adapter-react';

interface SettingsSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
}

const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState('general');
  const [settings, setSettings] = useState({
    theme: 'dark',
    slippage: 1,
    autoApprove: false,
    notifications: {
      email: true,
      telegram: false,
      desktop: true,
    },
    rpcEndpoint: 'https://api.mainnet-beta.solana.com',
    privateRpc: '',
    telegramBotToken: '',
    telegramChatId: '',
    emailAddress: '',
    profitTarget: 50,
    stopLoss: 20,
    maxConcurrentTrades: 3,
  });

  const { connected } = useWallet();

  const sections: SettingsSection[] = [
    {
      id: 'general',
      title: 'General Settings',
      icon: <Sliders className="w-5 h-5" />,
      description: 'Configure basic bot settings and preferences',
    },
    {
      id: 'trading',
      title: 'Trading Settings',
      icon: <Zap className="w-5 h-5" />,
      description: 'Set up your trading parameters and limits',
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: <Bell className="w-5 h-5" />,
      description: 'Manage your notification preferences',
    },
    {
      id: 'security',
      title: 'Security',
      icon: <Shield className="w-5 h-5" />,
      description: 'Configure security settings and permissions',
    },
  ];

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }));
  };

  const handleSave = () => {
    // Animation for save button
    const button = document.getElementById('saveButton');
    if (button) {
      button.classList.add('animate-success');
      setTimeout(() => {
        button.classList.remove('animate-success');
      }, 1000);
    }
  };

  return (
    <div className="flex-1 p-2 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold gradient-text">Settings</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Configure your bot settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-6">
          {/* Sidebar - Responsive layout */}
          <div className="flex lg:block overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 space-x-2 lg:space-x-0 lg:space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "flex-shrink-0 lg:flex-shrink w-auto lg:w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all duration-200",
                  activeSection === section.id
                    ? "glass text-primary"
                    : "hover:glass hover:text-primary"
                )}
              >
                <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
                  {section.icon}
                </div>
                <div className="text-left">
                  <div className="text-sm sm:text-base font-medium">{section.title}</div>
                  <div className="hidden lg:block text-xs sm:text-sm text-muted-foreground">{section.description}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Main Content - Responsive padding and spacing */}
          <div className="lg:col-span-3 glass rounded-xl p-3 sm:p-4 md:p-6">
            {activeSection === 'general' && (
              <div className="space-y-4 sm:space-y-6 animate-fade-in">
                <div>
                  <label className="text-sm font-medium mb-1.5 sm:mb-2 block">Theme</label>
                  <div className="flex space-x-2 sm:space-x-4">
                    <button
                      onClick={() => handleSettingChange('theme', 'dark')}
                      className={cn(
                        "flex items-center space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all duration-200",
                        settings.theme === 'dark' ? "glass text-primary" : "hover:glass"
                      )}
                    >
                      <Moon className="w-4 h-4" />
                      <span className="text-sm sm:text-base">Dark</span>
                    </button>
                    <button
                      onClick={() => handleSettingChange('theme', 'light')}
                      className={cn(
                        "flex items-center space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all duration-200",
                        settings.theme === 'light' ? "glass text-primary" : "hover:glass"
                      )}
                    >
                      <Sun className="w-4 h-4" />
                      <span className="text-sm sm:text-base">Light</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 sm:mb-2 block">RPC Endpoint</label>
                  <input
                    type="text"
                    value={settings.rpcEndpoint}
                    onChange={(e) => handleSettingChange('rpcEndpoint', e.target.value)}
                    className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg glass border border-border focus:border-primary transition-colors duration-200"
                    placeholder="Enter RPC endpoint"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 sm:mb-2 block">Private RPC (Optional)</label>
                  <input
                    type="text"
                    value={settings.privateRpc}
                    onChange={(e) => handleSettingChange('privateRpc', e.target.value)}
                    className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg glass border border-border focus:border-primary transition-colors duration-200"
                    placeholder="Enter private RPC endpoint"
                  />
                </div>
              </div>
            )}

            {activeSection === 'trading' && (
              <div className="space-y-4 sm:space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 sm:mb-2 block">Max Slippage (%)</label>
                    <input
                      type="number"
                      value={settings.slippage}
                      onChange={(e) => handleSettingChange('slippage', parseFloat(e.target.value))}
                      className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg glass border border-border focus:border-primary transition-colors duration-200"
                      min="0.1"
                      max="100"
                      step="0.1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 sm:mb-2 block">Profit Target (%)</label>
                    <input
                      type="number"
                      value={settings.profitTarget}
                      onChange={(e) => handleSettingChange('profitTarget', parseFloat(e.target.value))}
                      className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg glass border border-border focus:border-primary transition-colors duration-200"
                      min="0"
                      step="1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 sm:mb-2 block">Stop Loss (%)</label>
                    <input
                      type="number"
                      value={settings.stopLoss}
                      onChange={(e) => handleSettingChange('stopLoss', parseFloat(e.target.value))}
                      className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg glass border border-border focus:border-primary transition-colors duration-200"
                      min="0"
                      step="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 sm:mb-2 block">Max Concurrent Trades</label>
                  <input
                    type="number"
                    value={settings.maxConcurrentTrades}
                    onChange={(e) => handleSettingChange('maxConcurrentTrades', parseInt(e.target.value))}
                    className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg glass border border-border focus:border-primary transition-colors duration-200"
                    min="1"
                    max="10"
                    step="1"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autoApprove"
                    checked={settings.autoApprove}
                    onChange={(e) => handleSettingChange('autoApprove', e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <label htmlFor="autoApprove" className="text-sm sm:text-base font-medium">
                    Auto-approve transactions
                  </label>
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="space-y-4 sm:space-y-6 animate-fade-in">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      <span className="text-sm sm:text-base">Email Notifications</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.email}
                      onChange={(e) => handleNotificationChange('email', e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                    />
                  </div>

                  {settings.notifications.email && (
                    <input
                      type="email"
                      value={settings.emailAddress}
                      onChange={(e) => handleSettingChange('emailAddress', e.target.value)}
                      className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg glass border border-border focus:border-primary transition-colors duration-200"
                      placeholder="Enter your email address"
                    />
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      <span className="text-sm sm:text-base">Telegram Notifications</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.telegram}
                      onChange={(e) => handleNotificationChange('telegram', e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                    />
                  </div>

                  {settings.notifications.telegram && (
                    <div className="space-y-3 sm:space-y-4">
                      <input
                        type="text"
                        value={settings.telegramBotToken}
                        onChange={(e) => handleSettingChange('telegramBotToken', e.target.value)}
                        className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg glass border border-border focus:border-primary transition-colors duration-200"
                        placeholder="Enter Telegram bot token"
                      />
                      <input
                        type="text"
                        value={settings.telegramChatId}
                        onChange={(e) => handleSettingChange('telegramChatId', e.target.value)}
                        className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg glass border border-border focus:border-primary transition-colors duration-200"
                        placeholder="Enter Telegram chat ID"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="space-y-4 sm:space-y-6 animate-fade-in">
                <div className="p-3 sm:p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <div className="flex items-center space-x-2 text-yellow-500">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base font-medium">Security Notice</span>
                  </div>
                  <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                    Never share your private keys or seed phrases. Keep your wallet secure at all times.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 sm:mb-2 block">Wallet Address</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg glass border border-border focus:border-primary transition-colors duration-200"
                      placeholder="Connect your wallet to view address"
                      disabled
                    />
                    <button className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg glass text-primary hover:bg-primary/10 transition-colors duration-200">
                      <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 sm:mt-6 flex justify-end">
              <button
                id="saveButton"
                onClick={handleSave}
                className="modern-button solana-glow flex items-center space-x-2 text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;