
import React, { useState, useEffect } from "react";
import BacktestForm from "@/components/BacktestForm";
import BacktestResults from "@/components/BacktestResults";
import BacktestChart from "@/components/BacktestChart";
import { BacktestParams, BacktestResult, runBacktest } from "@/utils/backtestUtils";
import { fetchHistoricalPrices } from "@/services/priceService";
import { Bitcoin } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const { toast } = useToast();
  
  // State management
  const [params, setParams] = useState<BacktestParams>({
    initialCapital: 10000,
    bitcoinRatio: 50,
    rebalanceThreshold: 5,
    startDate: "",
    endDate: "",
  });
  
  const [priceData, setPriceData] = useState<any[]>([]);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [earliestDate, setEarliestDate] = useState<string>("");
  const [latestDate, setLatestDate] = useState<string>("");

  // Fetch historical price data on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchHistoricalPrices();
        
        if (data.length > 0) {
          // Sort data by date
          data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          
          // Set the earliest and latest dates
          const earliest = data[0].date;
          const latest = data[data.length - 1].date;
          
          setEarliestDate(earliest);
          setLatestDate(latest);
          
          // Default to full date range
          setParams(prev => ({
            ...prev,
            startDate: earliest,
            endDate: latest
          }));
          
          setPriceData(data);
        } else {
          toast({
            title: "No Data",
            description: "No price data available. Using mock data.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Failed to load price data:", error);
        toast({
          title: "Error",
          description: "Failed to load price data. Using mock data instead.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [toast]);

  // Run backtest with current parameters
  const handleRunBacktest = () => {
    if (priceData.length === 0) {
      toast({
        title: "No Data",
        description: "No price data available to run backtest.",
        variant: "destructive"
      });
      return;
    }
    
    if (!params.startDate || !params.endDate) {
      toast({
        title: "Missing Dates",
        description: "Please select both start and end dates.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    // Use setTimeout to ensure UI updates before heavy computation
    setTimeout(() => {
      try {
        const backtestResult = runBacktest(priceData, params);
        setResult(backtestResult);
      } catch (error) {
        console.error("Error running backtest:", error);
        toast({
          title: "Backtest Error",
          description: error instanceof Error ? error.message : "An unknown error occurred during backtest.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <header className="border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bitcoin className="h-8 w-8 text-bitcoin animate-pulse-subtle" />
              <h1 className="text-2xl font-bold tracking-tight">
                Crypto <span className="text-bitcoin">Rebalance</span> Backtester
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 text-center max-w-2xl mx-auto animate-fade-in">
          <h2 className="text-3xl font-semibold mb-3">Bitcoin-USD Portfolio Backtesting</h2>
          <p className="text-muted-foreground">
            Test how different rebalancing strategies would have performed historically.
            Adjust parameters to find your optimal portfolio strategy.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <BacktestForm
              params={params}
              onParamsChange={setParams}
              onRunBacktest={handleRunBacktest}
              isLoading={isLoading}
              earliestDate={earliestDate}
              latestDate={latestDate}
            />
          </div>
          
          <div className="lg:col-span-2 space-y-8">
            <BacktestResults result={result} isLoading={isLoading} />
            <BacktestChart 
              performanceData={result?.performanceData || []} 
              isLoading={isLoading} 
            />
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-100 py-6 mt-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Historical Bitcoin data provided by CoinGecko API. Past performance is not indicative of future results.
            </p>
            <p className="mt-2">
              © {new Date().getFullYear()} Crypto Rebalance Backtester
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
