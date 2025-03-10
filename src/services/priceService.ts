import { PriceDataPoint } from "../utils/backtestUtils";

// This function will fetch historical Bitcoin price data from CoinGecko
export const fetchHistoricalPrices = async (): Promise<PriceDataPoint[]> => {
  try {
    // Calculate timestamp for January 1, 2015 (in milliseconds)
    const startDate = new Date('2015-01-01').getTime();
    const endDate = new Date().getTime();
    
    // Using CoinGecko API to get daily Bitcoin prices since 2015
    // Note: CoinGecko's free tier has rate limits, so we're requesting the maximum allowed data
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=usd&from=${Math.floor(startDate/1000)}&to=${Math.floor(endDate/1000)}`
    );
    
    if (!response.ok) {
      throw new Error("Failed to fetch price data");
    }
    
    const data = await response.json();
    
    // Format the data into our PriceDataPoint structure
    const formattedPrices: PriceDataPoint[] = data.prices.map(
      (price: [number, number]) => ({
        date: new Date(price[0]).toISOString().split("T")[0], // YYYY-MM-DD format
        price: price[1],
      })
    );
    
    // Filter out duplicate dates (keep only the last price for each day)
    const uniquePrices: PriceDataPoint[] = [];
    const dateMap = new Map<string, number>();
    
    formattedPrices.forEach((point) => {
      dateMap.set(point.date, point.price);
    });
    
    dateMap.forEach((price, date) => {
      uniquePrices.push({ date, price });
    });
    
    // Sort by date
    uniquePrices.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return uniquePrices;
  } catch (error) {
    console.error("Error fetching historical prices:", error);
    // Fallback to local data or show an error
    return mockPriceData();
  }
};

// Fallback mock data in case the API fails
const mockPriceData = (): PriceDataPoint[] => {
  // Generate some basic price data for demonstration purposes
  const startDate = new Date("2015-01-01");
  const endDate = new Date();
  const prices: PriceDataPoint[] = [];
  
  // Bitcoin started around $300 in 2015 and had various cycles
  let price = 300;
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    // Add some randomness and trend to simulate price movements
    const dayOfYear = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
    
    // Add bull/bear market cycles
    const cyclePosition = (dayOfYear % 365) / 365;
    const cycleFactor = Math.sin(cyclePosition * Math.PI * 2) * 0.1;
    
    // Add long-term growth trend
    const yearsSince2015 = dayOfYear / 365;
    const growthFactor = Math.pow(1.8, yearsSince2015) * 0.001;
    
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
