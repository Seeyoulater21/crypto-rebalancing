import { PriceDataPoint } from "../utils/backtestUtils";

// This function will fetch historical Bitcoin price data
export const fetchHistoricalPrices = async (currency: 'USD' | 'THB' = 'USD'): Promise<PriceDataPoint[]> => {
  try {
    // Use import.meta.env.BASE_URL to get the correct base path for GitHub Pages
    const baseUrl = import.meta.env.BASE_URL || '/';
    
    // Adjust path to work with the base URL from Vite config
    const response = await fetch(`${baseUrl}price_data_with_thb.json`);
    
    if (!response.ok) {
      console.error(`Failed to fetch price data: ${response.status} ${response.statusText}`);
      throw new Error("Failed to fetch price data from local file");
    }
    
    const data = await response.json();
    console.log("Loading price data:", data ? "Data received" : "No data");
    
    // Check if data is in the format we expect (with dates as keys and USD/THB values)
    if (typeof data === 'object' && !Array.isArray(data)) {
      // Convert the object format to our PriceDataPoint array
      const formattedPrices: PriceDataPoint[] = Object.entries(data)
        .filter(([_, priceObj]: [string, any]) => priceObj && typeof priceObj === 'object' && priceObj[currency] !== undefined)
        .map(([dateStr, priceObj]: [string, any]) => ({
          date: dateStr,
          price: Math.round(Number(priceObj[currency])), // Ensure price is a number before rounding
        }));
      
      // Sort by date ascending
      formattedPrices.sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      if (formattedPrices.length === 0) {
        console.error("No price data was extracted from the JSON file");
        throw new Error("No valid price data found");
      }
      
      console.log(`Processed ${formattedPrices.length} price records, first date: ${formattedPrices[0]?.date}, price: ${formattedPrices[0]?.price} ${currency}`);
      console.log(`Last date: ${formattedPrices[formattedPrices.length-1]?.date}, price: ${formattedPrices[formattedPrices.length-1]?.price} ${currency}`);
      
      return formattedPrices;
    }
    
    // Unexpected format
    console.error("Unknown data format:", typeof data, Array.isArray(data) ? "array" : "not array", Object.keys(data).slice(0, 3));
    throw new Error("Unexpected data format in price_data_with_thb.json");
  } catch (error) {
    console.error("Error fetching historical prices:", error);
    // Fallback to mock data
    return mockPriceData(currency);
  }
};

// Fallback mock data in case the API fails
const mockPriceData = (currency: 'USD' | 'THB' = 'USD'): PriceDataPoint[] => {
  // Generate some basic price data for demonstration purposes
  const startDate = new Date("2015-01-01"); // Starting from 2015
  const endDate = new Date();
  const prices: PriceDataPoint[] = [];
  
  // Bitcoin started around $300 in 2015 and had various cycles
  // THB conversion roughly 33 THB per 1 USD
  const conversionRate = currency === 'THB' ? 33 : 1;
  let price = 300 * conversionRate;
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
    price = Math.max(price, 200 * conversionRate);
    
    // Add this day's price to our dataset
    prices.push({
      date: currentDate.toISOString().split("T")[0],
      price: Math.round(price)
    });
    
    // Move to the next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return prices;
};
