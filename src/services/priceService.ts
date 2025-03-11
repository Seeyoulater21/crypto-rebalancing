
import { PriceDataPoint } from "../utils/backtestUtils";

// This function will fetch historical Bitcoin price data
export const fetchHistoricalPrices = async (): Promise<PriceDataPoint[]> => {
  try {
    // First, try to fetch from the local data.json file
    const response = await fetch("/data.json");
    
    if (!response.ok) {
      throw new Error("Failed to fetch price data from local file");
    }
    
    const data = await response.json();
    
    // If data.json has the expected format with prices array
    if (Array.isArray(data.prices)) {
      // Format the data into our PriceDataPoint structure
      const formattedPrices: PriceDataPoint[] = data.prices.map(
        (price: [number, number]) => ({
          date: new Date(price[0]).toISOString().split("T")[0], // YYYY-MM-DD format
          price: price[1],
        })
      );
      
      return formattedPrices;
    } 
    // If data.json is already in our format
    else if (Array.isArray(data) && data.length > 0 && 'date' in data[0] && 'price' in data[0]) {
      return data;
    }
    // Unexpected format
    else {
      throw new Error("Unexpected data format in data.json");
    }
  } catch (error) {
    console.error("Error fetching historical prices:", error);
    // Fallback to mock data
    return mockPriceData();
  }
};

// Fallback mock data in case the API fails
const mockPriceData = (): PriceDataPoint[] => {
  // Generate some basic price data for demonstration purposes
  const startDate = new Date("2015-01-01"); // Starting from 2015
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
    const growthFactor = Math.pow(1.5, yearsSince2015) * 0.001;
    
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
