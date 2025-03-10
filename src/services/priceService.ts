
import { PriceDataPoint } from "../utils/backtestUtils";

// This function will fetch historical Bitcoin price data from 2017 to now
export const fetchHistoricalPrices = async (): Promise<PriceDataPoint[]> => {
  try {
    // Use CoinGecko API to fetch historical Bitcoin prices
    const response = await fetch(
      "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=max&interval=daily"
    );
    
    if (!response.ok) {
      throw new Error("Failed to fetch price data");
    }
    
    const data = await response.json();
    
    // Filter data from 2017-01-01 onwards
    const startTimestamp = new Date("2017-01-01").getTime();
    
    // CoinGecko returns prices as [timestamp, price] pairs
    const prices = data.prices.filter(
      (price: [number, number]) => price[0] >= startTimestamp
    );
    
    // Format the data into our PriceDataPoint structure
    const formattedPrices: PriceDataPoint[] = prices.map(
      (price: [number, number]) => ({
        date: new Date(price[0]).toISOString().split("T")[0], // YYYY-MM-DD format
        price: price[1],
      })
    );
    
    return formattedPrices;
  } catch (error) {
    console.error("Error fetching historical prices:", error);
    // Fallback to local data or show an error
    return mockPriceData();
  }
};

// Fallback mock data in case the API fails
const mockPriceData = (): PriceDataPoint[] => {
  // Generate some basic price data for demonstration purposes
  const startDate = new Date("2017-01-01");
  const endDate = new Date();
  const prices: PriceDataPoint[] = [];
  
  // Bitcoin started around $1,000 in 2017 and had various cycles
  let price = 1000;
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    // Add some randomness and trend to simulate price movements
    const dayOfYear = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
    
    // Add bull/bear market cycles
    const cyclePosition = (dayOfYear % 365) / 365;
    const cycleFactor = Math.sin(cyclePosition * Math.PI * 2) * 0.1;
    
    // Add long-term growth trend
    const yearsSince2017 = dayOfYear / 365;
    const growthFactor = Math.pow(1.5, yearsSince2017) * 0.001;
    
    // Add some daily noise
    const noiseFactor = (Math.random() - 0.5) * 0.05;
    
    // Combine factors to update price
    price = price * (1 + cycleFactor + growthFactor + noiseFactor);
    
    // Ensure we don't go below a certain threshold
    price = Math.max(price, 200);
    
    // Add this day's price to our dataset
    prices.push({
      date: currentDate.toISOString().split("T")[0],
      price: price
    });
    
    // Move to the next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return prices;
};
