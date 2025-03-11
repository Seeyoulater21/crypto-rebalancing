
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PerformanceDataPoint, formatCurrency } from "@/utils/backtestUtils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from "recharts";

interface BacktestChartProps {
  performanceData: PerformanceDataPoint[];
  isLoading: boolean;
}

const BacktestChart = ({ performanceData, isLoading }: BacktestChartProps) => {
  const [timeframe, setTimeframe] = useState<"all" | "1y" | "6m" | "3m">("all");
  
  // Filter data based on selected timeframe
  const filteredData = (() => {
    if (timeframe === "all" || performanceData.length === 0) {
      return performanceData;
    }
    
    const now = new Date();
    let cutoffDate: Date;
    
    if (timeframe === "1y") {
      cutoffDate = new Date(now.setFullYear(now.getFullYear() - 1));
    } else if (timeframe === "6m") {
      cutoffDate = new Date(now.setMonth(now.getMonth() - 6));
    } else {
      cutoffDate = new Date(now.setMonth(now.getMonth() - 3));
    }
    
    const cutoffString = cutoffDate.toISOString().split("T")[0];
    return performanceData.filter(dataPoint => dataPoint.date >= cutoffString);
  })();
  
  // Find rebalance events to mark on chart
  const rebalanceEvents = performanceData.filter(
    (dataPoint) => dataPoint.rebalanced
  );
  
  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-panel p-4 rounded-lg shadow-sm bg-white/90 backdrop-blur-sm text-sm border border-gray-100">
          <p className="font-medium">{data.formattedDate}</p>
          <p className="text-xs text-muted-foreground mb-2">BTC Price: {formatCurrency(data.price)}</p>
          <p className="mb-1">Portfolio Value: <span className="font-medium">{formatCurrency(data.totalBalance)}</span></p>
          <div className="flex justify-between text-xs">
            <span>BTC: {formatCurrency(data.bitcoinBalance)} ({Math.round(data.allocation.bitcoin)}%)</span>
            <span>USD: {formatCurrency(data.usdBalance)} ({Math.round(data.allocation.usd)}%)</span>
          </div>
          {data.rebalanced && (
            <div className="mt-2 text-xs px-2 py-1 bg-bitcoin/10 text-bitcoin rounded-full inline-block">
              Rebalanced
            </div>
          )}
        </div>
      );
    }
    return null;
  };
  
  if (isLoading) {
    return (
      <Card className="rounded-xl smooth-shadow h-[400px] animate-pulse">
        <div className="p-6 h-full flex items-center justify-center">
          <div className="text-muted-foreground">Loading chart data...</div>
        </div>
      </Card>
    );
  }
  
  if (!performanceData.length) {
    return (
      <Card className="rounded-xl smooth-shadow h-[400px]">
        <div className="p-6 h-full flex items-center justify-center">
          <div className="text-muted-foreground">No data available</div>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="rounded-xl smooth-shadow">
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Portfolio Performance</h3>
          <Tabs
            defaultValue="all"
            value={timeframe}
            onValueChange={(value) => setTimeframe(value as any)}
            className="w-[220px]"
          >
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="1y">1Y</TabsTrigger>
              <TabsTrigger value="6m">6M</TabsTrigger>
              <TabsTrigger value="3m">3M</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={filteredData}
              margin={{ top: 20, right: 10, left: 10, bottom: 20 }}
            >
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f7931a" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f7931a" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis 
                dataKey="formattedDate" 
                tickFormatter={(value) => value.slice(0, 6)} 
                tick={{ fontSize: 10, fill: '#888' }} 
                axisLine={{ stroke: '#eee' }}
                tickLine={{ stroke: '#eee' }}
                padding={{ left: 10, right: 10 }}
                interval="preserveStartEnd"
                minTickGap={60}
              />
              <YAxis 
                tickFormatter={(value) => `$${Math.round(value/1000)}k`} 
                tick={{ fontSize: 10, fill: '#888' }} 
                axisLine={{ stroke: '#eee' }}
                tickLine={{ stroke: '#eee' }}
                width={40}
                domain={[(dataMin: number) => Math.floor(dataMin * 0.95), (dataMax: number) => Math.ceil(dataMax * 1.05)]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="totalBalance"
                stroke="#f7931a"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
                isAnimationActive={true}
                animationDuration={1000}
                fill="url(#colorBalance)"
              />
              
              {/* Render Reference Dots for rebalance events */}
              {rebalanceEvents.map((event, index) => (
                <ReferenceDot
                  key={`rebalance-${index}`}
                  x={event.formattedDate}
                  y={event.totalBalance}
                  r={4}
                  fill="#f7931a"
                  stroke="#fff"
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
          
          {rebalanceEvents.length > 0 && (
            <div className="text-xs text-center mt-2 text-muted-foreground">
              <span className="inline-flex items-center">
                <span className="inline-block w-3 h-3 bg-bitcoin rounded-full mr-1"></span>
                {rebalanceEvents.length} Rebalancing Events
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default BacktestChart;
