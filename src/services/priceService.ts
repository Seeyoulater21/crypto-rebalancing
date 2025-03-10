import { PriceDataPoint } from "../utils/backtestUtils";

const API_KEY_STORAGE_KEY = 'cmcApiKey';

// Function to get API key from localStorage
const getApiKey = (): string | null => {
  return localStorage.getItem(API_KEY_STORAGE_KEY);
};

// Function to save API key to localStorage
export const saveApiKey = (apiKey: string): void => {
  localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
};

// This function will fetch historical Bitcoin price data from CoinMarketCap
export const fetchHistoricalPrices = async (): Promise<PriceDataPoint[]> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error("Please set your CoinMarketCap API key first");
  }
  
  try {
    // Calculate timestamp for January 1, 2015
    const startDate = new Date('2015-01-01').getTime();
    const endDate = new Date().getTime();
    
    // Using CoinMarketCap API to get daily Bitcoin prices
    const response = await fetch(
      `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/historical?symbol=BTC&time_start=${Math.floor(startDate/1000)}&time_end=${Math.floor(endDate/1000)}&interval=1d&convert=USD`,
      {
        headers: {
          'X-CMC_PRO_API_KEY': apiKey,
          'Accept': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error("Failed to fetch price data");
    }
    
    const data = await response.json();
    
    // Format the data into our PriceDataPoint structure
    const formattedPrices: PriceDataPoint[] = Object.entries(data.data.quotes).map(
      ([timestamp, quote]: [string, any]) => ({
        date: new Date(parseInt(timestamp) * 1000).toISOString().split("T")[0], // YYYY-MM-DD format
        price: quote.USD.price,
      })
    );
    
    // Sort by date
    formattedPrices.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return formattedPrices;
  } catch (error) {
    console.error("Error fetching historical prices:", error);
    // Fallback to mock data
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
