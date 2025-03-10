
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PerformanceDataPoint, formatCurrency } from "@/utils/backtestUtils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot, Legend } from "recharts";

interface BacktestChartProps {
  performanceData: PerformanceDataPoint[];
  isLoading: boolean;
}

const BacktestChart = ({ performanceData, isLoading }: BacktestChartProps) => {
  const [timeframe, setTimeframe] = useState<"all" | "1y" | "6m" | "3m">("all");
  const [autoUpdate, setAutoUpdate] = useState(false);
  
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
        <div className="glass-panel p-4 rounded-lg text-sm bg-white/90 border border-gray-200 shadow-lg">
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
  
  // Responsive font sizes
  const getFontSize = () => {
    return window.innerWidth < 768 ? "10px" : "12px";
  };
  
  // Auto-update effect (simulating real-time)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (autoUpdate) {
      interval = setInterval(() => {
        // This would be where you'd fetch the latest price
        // For now, we'll just simulate by refreshing the view
        console.log("Auto-updating chart data...");
      }, 60000); // Every minute
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoUpdate]);
  
  if (isLoading) {
    return (
      <Card className="rounded-xl smooth-shadow h-[400px] animate-pulse">
        <div className="p-4 h-full flex items-center justify-center">
          <div className="text-muted-foreground">Loading chart data...</div>
        </div>
      </Card>
    );
  }
  
  if (!performanceData.length) {
    return (
      <Card className="rounded-xl smooth-shadow h-[400px]">
        <div className="p-4 h-full flex items-center justify-center">
          <div className="text-muted-foreground">No data available</div>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="rounded-xl smooth-shadow">
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm">Portfolio Performance</h3>
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
              margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="formattedDate" 
                tickFormatter={(value) => value.slice(0, 6)} 
                tick={{ fontSize: getFontSize() }} 
                padding={{ left: 20, right: 20 }}
                interval="preserveStartEnd"
                minTickGap={30}
              />
              <YAxis 
                tickFormatter={(value) => `$${Math.round(value).toLocaleString()}`} 
                tick={{ fontSize: getFontSize() }} 
                width={60}
                domain={[(dataMin: number) => Math.floor(dataMin * 0.9), (dataMax: number) => Math.ceil(dataMax * 1.1)]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend align="right" verticalAlign="top" />
              <Line
                name="Portfolio Value"
                type="monotone"
                dataKey="totalBalance"
                stroke="#f7931a"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
                isAnimationActive={true}
                animationDuration={1000}
              />
              
              {/* Render Reference Dots for rebalance events */}
              {rebalanceEvents.map((event, index) => (
                <ReferenceDot
                  key={`rebalance-${index}`}
                  x={event.formattedDate}
                  y={event.totalBalance}
                  r={5}
                  fill="#f7931a"
                  stroke="#fff"
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex justify-between items-center text-xs text-muted-foreground pt-2">
          <div>
            <span className="mr-2">Data since 2015</span>
            {rebalanceEvents.length > 0 && (
              <span className="inline-flex items-center">
                <span className="h-2 w-2 rounded-full bg-bitcoin mr-1 inline-block"></span>
                {rebalanceEvents.length} rebalances
              </span>
            )}
          </div>
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={autoUpdate}
              onChange={(e) => setAutoUpdate(e.target.checked)}
              className="sr-only peer"
            />
            <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-bitcoin/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-bitcoin"></div>
            <span className="ml-2">Auto-update</span>
          </label>
        </div>
      </div>
    </Card>
  );
};

export default BacktestChart;
