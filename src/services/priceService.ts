
import { PriceDataPoint } from "../utils/backtestUtils";

// This function will fetch historical Bitcoin price data
export const fetchHistoricalPrices = async (): Promise<PriceDataPoint[]> => {
  try {
    // Fetch from the price_data_with_thb.json file
    const response = await fetch("/price_data_with_thb.json");
    
    if (!response.ok) {
      throw new Error("Failed to fetch price data from local file");
    }
    
    const data = await response.json();
    console.log("Loaded data format:", data.slice(0, 2));
    
    // Check data format and process accordingly
    if (Array.isArray(data.prices)) {
      // Format the data into our PriceDataPoint structure
      const formattedPrices: PriceDataPoint[] = data.prices.map(
        (price: [number, number]) => ({
          date: new Date(price[0]).toISOString().split("T")[0], // YYYY-MM-DD format
          price: Math.round(price[1]), // Round to integer as requested
        })
      );
      
      console.log("Processed data format:", formattedPrices.slice(0, 2));
      return formattedPrices;
    } 
    // If data is already in our format
    else if (Array.isArray(data) && data.length > 0 && 'date' in data[0] && 'price' in data[0]) {
      // Ensure prices are rounded to integers
      return data.map((item: any) => ({
        date: item.date,
        price: Math.round(item.price)
      }));
    }
    // If data has a different known format (coinbase, etc)
    else if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0]) && data[0].length >= 2) {
      return data.map((item: any[]) => ({
        date: new Date(item[0]).toISOString().split("T")[0],
        price: Math.round(parseFloat(item[1]))
      }));
    }
    // Unexpected format
    else {
      console.error("Unknown data format:", data);
      throw new Error("Unexpected data format in price_data_with_thb.json");
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
