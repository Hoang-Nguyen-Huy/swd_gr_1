import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CryptoData } from '../types/crypto';

interface PriceChartProps {
  data: CryptoData[];
  isLoading: boolean;
}

interface ChartDataPoint {
  name: string;
  price: number;
  marketCap: number;
  timestamp: number;
}

export default function PriceChart({ data, isLoading }: PriceChartProps) {
  const [selectedCoin, setSelectedCoin] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  // When data changes or a new coin is selected, update chart data
  useEffect(() => {
    if (!data.length) return;
    
    // Default to Bitcoin if no coin is selected or the selected coin isn't in the data
    const coinToShow = selectedCoin || 'BTC';
    const coinData = data.find(c => c.symbol === coinToShow) || data[0];
    
    if (!coinData) return;
    
    // For a real app, this would be historical data from an API
    // For this demo, we'll create some fake historical data based on current price
    const now = new Date();
    const fakeHistoricalData: ChartDataPoint[] = [];
    
    // Create 24 data points (hourly for the last day)
    for (let i = 0; i < 24; i++) {
      const timestamp = new Date(now);
      timestamp.setHours(now.getHours() - (23 - i));
      
      // Create some random variation around the current price
      const randomFactor = 0.98 + (Math.random() * 0.04); // Between 0.98 and 1.02
      const price = coinData.price * randomFactor;
      
      // Create some random variation around the current market cap
      const marketCapFactor = 0.99 + (Math.random() * 0.02); // Between 0.99 and 1.01
      const marketCap = coinData.market_cap * marketCapFactor;
      
      fakeHistoricalData.push({
        name: `${timestamp.getHours()}:00`,
        price,
        marketCap,
        timestamp: timestamp.getTime()
      });
    }
    
    setChartData(fakeHistoricalData);
  }, [data, selectedCoin]);

  // Get top 5 coins by market cap for the selector
  const topCoins = [...data]
    .sort((a, b) => a.market_cap_rank - b.market_cap_rank)
    .slice(0, 5);

  return (
    <div className="w-full bg-white p-4 rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Price Chart (24h)</h2>
        <div className="flex gap-2">
          {topCoins.map(coin => (
            <button
              key={coin.symbol}
              onClick={() => setSelectedCoin(coin.symbol)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedCoin === coin.symbol || (!selectedCoin && coin.symbol === 'BTC')
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {coin.symbol}
            </button>
          ))}
        </div>
      </div>

      <div className="h-80">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <p>Loading chart data...</p>
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis 
                domain={['auto', 'auto']}
                tickFormatter={(value) => 
                  new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                    notation: 'compact'
                  }).format(value)
                }
              />
              <Tooltip 
                formatter={(value: number) => 
                  new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  }).format(value)
                }
              />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="#8884d8" 
                fill="#8884d8" 
                fillOpacity={0.3} 
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p>No chart data available</p>
          </div>
        )}
      </div>
    </div>
  );
}
