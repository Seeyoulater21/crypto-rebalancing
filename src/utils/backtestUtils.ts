
import { format } from "date-fns";

export interface BacktestParams {
  initialCapital: number;
  bitcoinRatio: number;
  rebalanceThreshold: number;
  startDate: string;
  endDate: string;
}

export interface BacktestResult {
  finalBalance: number;
  finalBitcoinAmount: number;
  finalUsdAmount: number;
  totalRebalances: number;
  cagr: number;
  maxDrawdown: number;
  performanceData: PerformanceDataPoint[];
  buyHoldBalance: number;
  buyHoldBitcoin: number;
}

export interface PerformanceDataPoint {
  date: string;
  formattedDate: string;
  price: number;
  totalBalance: number;
  bitcoinBalance: number;
  usdBalance: number;
  bitcoinAmount: number;
  allocation: {
    bitcoin: number;
    usd: number;
  };
  rebalanced: boolean;
  action?: 'BUY' | 'SELL' | null;
}

export interface PriceDataPoint {
  date: string;
  price: number;
}

export const runBacktest = (
  priceData: PriceDataPoint[], 
  params: BacktestParams
): BacktestResult => {
  const { initialCapital, bitcoinRatio, rebalanceThreshold, startDate, endDate } = params;
  
  // Filter data by date range
  const filteredPriceData = priceData.filter(
    (point) => point.date >= startDate && point.date <= endDate
  );
  
  // Round all prices to integer values
  filteredPriceData.forEach(point => {
    point.price = Math.round(point.price);
  });
  
  // If no data in range, return error
  if (!filteredPriceData.length) {
    throw new Error("No price data available in the selected date range");
  }
  
  // The target ratio in decimal form (e.g., 0.5 for 50%)
  const targetRatio = bitcoinRatio / 100;
  
  // The threshold in decimal form (e.g., 0.05 for 5%)
  const threshold = rebalanceThreshold / 100;
  
  // Upper and lower bounds for when to rebalance
  const upperBound = targetRatio + threshold;
  const lowerBound = targetRatio - threshold;
  
  console.log(`Strategy parameters: Target ratio: ${targetRatio * 100}%, Threshold: ${threshold * 100}%`);
  console.log(`Rebalance when Bitcoin allocation ≥ ${upperBound * 100}% or ≤ ${lowerBound * 100}%`);
  
  // Initial allocation
  const initialBitcoinAllocation = initialCapital * targetRatio;
  const initialUsdAllocation = initialCapital - initialBitcoinAllocation;
  
  // Initial state
  let bitcoinAmount = initialBitcoinAllocation / filteredPriceData[0].price;
  let usdAmount = initialUsdAllocation;
  let totalRebalances = 0;
  
  const performanceData: PerformanceDataPoint[] = [];
  let maxPortfolioValue = initialCapital;
  let minDrawdown = 0;
  
  // Buy and hold comparison
  const buyHoldBitcoin = initialBitcoinAllocation / filteredPriceData[0].price;
  const buyHoldUsd = initialUsdAllocation;
  
  console.log(`Day 1: Initial split - Bitcoin: ${formatCurrency(initialBitcoinAllocation)} (${bitcoinAmount.toFixed(8)} BTC), USD: ${formatCurrency(initialUsdAllocation)}`);
  
  // For each day in our price data
  for (let i = 0; i < filteredPriceData.length; i++) {
    const { date, price } = filteredPriceData[i];
    
    // Calculate current portfolio value
    const bitcoinValue = bitcoinAmount * price;
    const totalValue = bitcoinValue + usdAmount;
    
    // Calculate current allocation ratio
    const currentBitcoinRatio = bitcoinValue / totalValue;
    
    // Check if we need to rebalance
    let rebalanced = false;
    let action: 'BUY' | 'SELL' | null = null;
    
    if (currentBitcoinRatio > upperBound || currentBitcoinRatio < lowerBound) {
      // Calculate the target bitcoin value and USD value
      const targetBitcoinValue = totalValue * targetRatio;
      const targetUsdValue = totalValue - targetBitcoinValue;
      
      // Determine if we're buying or selling bitcoin
      if (currentBitcoinRatio > upperBound) {
        action = 'SELL';
        console.log(`${date}: SELL Bitcoin - Ratio too high: ${(currentBitcoinRatio * 100).toFixed(2)}% > ${upperBound * 100}%`);
      } else {
        action = 'BUY';
        console.log(`${date}: BUY Bitcoin - Ratio too low: ${(currentBitcoinRatio * 100).toFixed(2)}% < ${lowerBound * 100}%`);
      }
      
      // Log before rebalance
      console.log(`  Before rebalance: BTC ${bitcoinAmount.toFixed(8)} (${formatCurrency(bitcoinValue)}) | USD ${formatCurrency(usdAmount)} | Total ${formatCurrency(totalValue)}`);
      
      // Update amounts
      bitcoinAmount = targetBitcoinValue / price;
      usdAmount = targetUsdValue;
      
      // Log after rebalance
      console.log(`  After rebalance: BTC ${bitcoinAmount.toFixed(8)} (${formatCurrency(targetBitcoinValue)}) | USD ${formatCurrency(usdAmount)} | Total ${formatCurrency(totalValue)}`);
      console.log(`  Rebalanced to ${targetRatio * 100}% BTC / ${(1 - targetRatio) * 100}% USD`);
      
      totalRebalances++;
      rebalanced = true;
    }
    
    // Track maximum portfolio value for drawdown calculation
    if (totalValue > maxPortfolioValue) {
      maxPortfolioValue = totalValue;
    }
    
    // Calculate current drawdown
    const currentDrawdown = (maxPortfolioValue - totalValue) / maxPortfolioValue;
    if (currentDrawdown < minDrawdown) {
      minDrawdown = currentDrawdown;
    }
    
    // Store performance data
    performanceData.push({
      date,
      formattedDate: format(new Date(date), "MMM yyyy"),  // Changed to month and year only
      price,
      totalBalance: totalValue,
      bitcoinBalance: bitcoinAmount * price,
      usdBalance: usdAmount,
      bitcoinAmount,
      allocation: {
        bitcoin: (bitcoinAmount * price) / totalValue * 100,
        usd: usdAmount / totalValue * 100
      },
      rebalanced,
      action
    });
  }
  
  // Calculate final values
  const finalPrice = filteredPriceData[filteredPriceData.length - 1].price;
  const finalBitcoinValue = bitcoinAmount * finalPrice;
  const finalBalance = finalBitcoinValue + usdAmount;
  
  // Calculate buy and hold final balance
  const buyHoldBalance = (buyHoldBitcoin * finalPrice) + buyHoldUsd;
  
  // Calculate CAGR (Compound Annual Growth Rate)
  const startDateObj = new Date(filteredPriceData[0].date);
  const endDateObj = new Date(filteredPriceData[filteredPriceData.length - 1].date);
  const yearsDiff = (endDateObj.getTime() - startDateObj.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  
  // Handle edge case where dates are too close
  const cagr = yearsDiff > 0.01 
    ? (Math.pow(finalBalance / initialCapital, 1 / yearsDiff) - 1) * 100
    : ((finalBalance / initialCapital - 1) * 100); // Use simple return instead for very short periods
  
  return {
    finalBalance,
    finalBitcoinAmount: bitcoinAmount,
    finalUsdAmount: usdAmount,
    totalRebalances,
    cagr,
    maxDrawdown: Math.abs(minDrawdown) * 100,
    performanceData,
    buyHoldBalance,
    buyHoldBitcoin
  };
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
};

export const formatBitcoin = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  }).format(value);
};
