
import { Card, CardContent } from "@/components/ui/card";
import { BacktestResult, formatCurrency, formatPercentage, formatBitcoin } from "@/utils/backtestUtils";
import { Skeleton } from "@/components/ui/skeleton";
import { Bitcoin, TrendingUp, RotateCw, Wallet, BarChart3, DollarSign } from "lucide-react";

interface BacktestResultsProps {
  result: BacktestResult | null;
  isLoading: boolean;
}

const BacktestResults = ({ result, isLoading }: BacktestResultsProps) => {
  if (isLoading) {
    return <ResultsSkeleton />;
  }

  if (!result) {
    return (
      <Card className="rounded-xl shadow-sm">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Configure parameters and run backtest to see results
          </div>
        </CardContent>
      </Card>
    );
  }

  const rebalancePerformance = (result.finalBalance - result.buyHoldBalance) / result.buyHoldBalance * 100;
  const isRebalancingBetter = rebalancePerformance > 0;

  return (
    <Card className="rounded-xl smooth-shadow">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-3 flex items-center justify-between border-b">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-bitcoin" />
          <h3 className="font-medium">Backtest Results</h3>
        </div>
      </div>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 stagger-children">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Final Portfolio Value</span>
              </div>
              <div className="text-xl font-semibold">
                {formatCurrency(result.finalBalance)}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bitcoin className="h-4 w-4 text-bitcoin" />
                <span className="text-sm">Final BTC Amount</span>
              </div>
              <div className="font-medium">
                {formatBitcoin(result.finalBitcoinAmount)} BTC
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Final USD Amount</span>
              </div>
              <div className="font-medium">
                {formatCurrency(result.finalUsdAmount)}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Annual Return (CAGR)</span>
              </div>
              <div className="font-medium text-green-600">
                {result.cagr.toFixed(2)}%
              </div>
            </div>
          </div>
          
          <div className="space-y-4 stagger-children">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <RotateCw className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Total Rebalances</span>
              </div>
              <div className="font-medium">
                {result.totalRebalances}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Maximum Drawdown</span>
              </div>
              <div className="font-medium text-red-500">
                {result.maxDrawdown.toFixed(2)}%
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bitcoin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Buy & Hold Result</span>
              </div>
              <div className="font-medium">
                {formatCurrency(result.buyHoldBalance)}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">vs. Buy & Hold</span>
              </div>
              <div className={`font-medium ${isRebalancingBetter ? 'text-green-600' : 'text-red-500'}`}>
                {isRebalancingBetter ? '+' : ''}{rebalancePerformance.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ResultsSkeleton = () => (
  <Card className="rounded-xl smooth-shadow animate-pulse">
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-3 flex items-center justify-between border-b">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-medium">Backtest Results</h3>
      </div>
    </div>
    <CardContent className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-6 w-24" />
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-6 w-24" />
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default BacktestResults;
