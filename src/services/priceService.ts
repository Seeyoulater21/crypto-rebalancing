
import { PriceDataPoint } from "../utils/backtestUtils";

const API_KEY_STORAGE_KEY = 'cryptoCompareApiKey';

// Function to get API key from localStorage
const getApiKey = (): string | null => {
  return localStorage.getItem(API_KEY_STORAGE_KEY);
};

// Function to save API key to localStorage
export const saveApiKey = (apiKey: string): void => {
  localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
};

// This function will fetch historical Bitcoin price data from CryptoCompare
export const fetchHistoricalPrices = async (): Promise<PriceDataPoint[]> => {
  const apiKey = getApiKey();
  
  try {
    // Calculate timestamp for January 1, 2015
    const startDate = new Date('2015-01-01').getTime();
    const endDate = new Date().getTime();
    
    // Using CryptoCompare API to get daily Bitcoin prices
    const url = 'https://min-api.cryptocompare.com/data/v2/histoday';
    const params = new URLSearchParams({
      fsym: 'BTC',
      tsym: 'USD',
      limit: '2000', // Maximum allowed by API
      toTs: Math.floor(endDate / 1000).toString()
    });

    const headers: HeadersInit = {
      'Accept': 'application/json'
    };
    
    // Add API key to headers if available
    if (apiKey) {
      headers['authorization'] = `Apikey ${apiKey}`;
    }
    
    const response = await fetch(`${url}?${params.toString()}`, { headers });
    
    if (!response.ok) {
      throw new Error("Failed to fetch price data");
    }
    
    const data = await response.json();
    
    if (data.Response === 'Error') {
      throw new Error(data.Message || "CryptoCompare API Error");
    }
    
    // Format the data into our PriceDataPoint structure
    const formattedPrices: PriceDataPoint[] = data.Data.Data.map(
      (item: any) => ({
        date: new Date(item.time * 1000).toISOString().split("T")[0], // YYYY-MM-DD format
        price: item.close,
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

// Function to fetch current Bitcoin price for real-time updates
export const fetchCurrentPrice = async (): Promise<number> => {
  try {
    const response = await fetch(
      'https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD'
    );
    
    if (!response.ok) {
      throw new Error("Failed to fetch current price");
    }
    
    const data = await response.json();
    return data.USD;
  } catch (error) {
    console.error("Error fetching current price:", error);
    throw error;
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
