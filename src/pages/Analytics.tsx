import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Wallet, TrendingUp, Clock, Zap, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface DailyProfit {
  date: string;
  profit: number;
}

interface TokenPerformance {
  name: string;
  profit: number;
  trades: number;
  successRate: number;
}

interface TradingStats {
  totalProfit: number;
  totalTrades: number;
  successRate: number;
  avgProfitPerTrade: number;
  bestTrade: number;
  worstTrade: number;
}

const mockData: {
  dailyProfit: DailyProfit[];
  tokenPerformance: TokenPerformance[];
  tradingStats: TradingStats;
} = {
  dailyProfit: [
    { date: '2024-03-20', profit: 0 },
    { date: '2024-03-21', profit: 0 },
    { date: '2024-03-22', profit: 0 },
    { date: '2024-03-23', profit: 0 },
    { date: '2024-03-24', profit: 0 },
    { date: '2024-03-25', profit: 0 },
  ],
  tokenPerformance: [
    { name: 'PumpFun', profit: 0, trades: 0, successRate: 0 },
    { name: 'Raydium', profit: 0, trades: 0, successRate: 0 },
    { name: 'Jupiter', profit: 0, trades: 0, successRate: 0 },
  ],
  tradingStats: {
    totalProfit: 0,
    totalTrades: 0,
    successRate: 0,
    avgProfitPerTrade: 0,
    bestTrade: 0,
    worstTrade: 0,
  }
};

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  prefix?: string;
  suffix?: string;
}> = ({ title, value, icon, trend, prefix = '', suffix = '' }) => (
  <div className="glass p-2 sm:p-4 rounded-xl hover-card transition-all duration-300">
    <div className="flex items-center justify-between mb-1 sm:mb-2">
      <div className="p-1 sm:p-2 rounded-lg bg-primary/10">
        {icon}
      </div>
      {trend !== undefined && (
        <div className={cn(
          "flex items-center text-xs sm:text-sm font-medium",
          trend >= 0 ? "text-green-500" : "text-red-500"
        )}>
          {trend >= 0 ? <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> : <ArrowDownRight className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <div className="text-lg sm:text-2xl font-bold mb-0.5 sm:mb-1">
      {prefix}{value}{suffix}
    </div>
    <div className="text-xs sm:text-sm text-muted-foreground">{title}</div>
  </div>
);

const TokenPerformanceCard: React.FC<{
  token: typeof mockData.tokenPerformance[0];
}> = ({ token }) => (
  <div className="glass p-2 sm:p-4 rounded-xl hover-card transition-all duration-300">
    <div className="flex items-center justify-between mb-2 sm:mb-4">
      <div className="font-semibold text-base sm:text-lg">{token.name}</div>
      <div className={cn(
        "text-xs sm:text-sm font-medium",
        token.profit >= 0 ? "text-green-500" : "text-red-500"
      )}>
        {token.profit >= 0 ? "+" : ""}{token.profit} SOL
      </div>
    </div>
    <div className="space-y-1 sm:space-y-2">
      <div className="flex justify-between text-xs sm:text-sm">
        <span className="text-muted-foreground">Trades</span>
        <span>{token.trades}</span>
      </div>
      <div className="flex justify-between text-xs sm:text-sm">
        <span className="text-muted-foreground">Success Rate</span>
        <span>{token.successRate}%</span>
      </div>
      <div className="w-full bg-primary/10 rounded-full h-1.5 sm:h-2 mt-1 sm:mt-2">
        <div 
          className="bg-gradient-to-r from-primary to-primary/50 h-1.5 sm:h-2 rounded-full transition-all duration-300"
          style={{ width: `${token.successRate}%` }}
        />
      </div>
    </div>
  </div>
);

const Analytics: React.FC = () => {
  return (
    <div className="flex-1 p-2 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold gradient-text">Analytics Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Track your trading performance and statistics</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <StatCard
            title="Total Profit"
            value={mockData.tradingStats.totalProfit}
            icon={<Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />}
            suffix=" SOL"
          />
          <StatCard
            title="Total Trades"
            value={mockData.tradingStats.totalTrades}
            icon={<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />}
          />
          <StatCard
            title="Success Rate"
            value={mockData.tradingStats.successRate}
            icon={<Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />}
            suffix="%"
          />
          <StatCard
            title="Avg. Profit/Trade"
            value={mockData.tradingStats.avgProfitPerTrade}
            icon={<Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />}
            suffix=" SOL"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-6">
          <div className="lg:col-span-2 glass p-2 sm:p-4 rounded-xl">
            <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4">Profit History</h2>
            <div className="h-[200px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockData.dailyProfit}>
                  <defs>
                    <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgb(14, 165, 233)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="rgb(14, 165, 233)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: 'rgba(255,255,255,0.5)' }}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: 'rgba(255,255,255,0.5)' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(0,0,0,0.8)', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="rgb(14, 165, 233)" 
                    fillOpacity={1}
                    fill="url(#profitGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass p-2 sm:p-4 rounded-xl">
            <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4">Best Performers</h2>
            <div className="space-y-2 sm:space-y-4">
              {mockData.tokenPerformance.map((token, index) => (
                <TokenPerformanceCard key={index} token={token} />
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
          <div className="glass p-3 sm:p-6 rounded-xl">
            <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4">Best Trading Results</h2>
            <div className="space-y-2 sm:space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="p-1 sm:p-2 rounded-lg bg-green-500/10 mr-2 sm:mr-3">
                    <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm">Best Trade</div>
                    <div className="font-semibold text-sm sm:text-base">+0 SOL</div>
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">-</div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="p-1 sm:p-2 rounded-lg bg-green-500/10 mr-2 sm:mr-3">
                    <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm">Best Win Streak</div>
                    <div className="font-semibold text-sm sm:text-base">0 trades</div>
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">-</div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="p-1 sm:p-2 rounded-lg bg-green-500/10 mr-2 sm:mr-3">
                    <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm">Best Day</div>
                    <div className="font-semibold text-sm sm:text-base">+0 SOL</div>
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">-</div>
              </div>
            </div>
          </div>
          
          <div className="glass p-3 sm:p-6 rounded-xl">
            <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4">Worst Trading Results</h2>
            <div className="space-y-2 sm:space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="p-1 sm:p-2 rounded-lg bg-red-500/10 mr-2 sm:mr-3">
                    <ArrowDownRight className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm">Worst Trade</div>
                    <div className="font-semibold text-sm sm:text-base">0 SOL</div>
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">-</div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="p-1 sm:p-2 rounded-lg bg-red-500/10 mr-2 sm:mr-3">
                    <ArrowDownRight className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm">Worst Loss Streak</div>
                    <div className="font-semibold text-sm sm:text-base">0 trades</div>
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">-</div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="p-1 sm:p-2 rounded-lg bg-red-500/10 mr-2 sm:mr-3">
                    <ArrowDownRight className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm">Worst Day</div>
                    <div className="font-semibold text-sm sm:text-base">0 SOL</div>
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">-</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;