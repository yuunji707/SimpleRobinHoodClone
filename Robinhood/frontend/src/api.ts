import axios, { AxiosInstance } from 'axios';

// Create an axios instance with the base URL of the backend API
const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:5000',
});

// Define interfaces for the data structures used in API calls
export interface StockData {
  symbol: string;
  currentPrice: number | null;
  previousClose: number | null;
  marketCap: number | null;
  dailyChange: number | null;
  error?: string;
}

export interface Portfolio {
  bought_stocks: BoughtStock[];
  sold_stocks: SoldStock[];
  total_value: number;
}

interface BoughtStock {
  ticker: string;
  quantity: number;
  date_bought: string;
  current_price: number;
  stock_value: number;
}

interface SoldStock {
  ticker: string;
  quantity: number;
  date_sold: string;
}

interface HistoryDataPoint {
  date: string;
  value: number;
}

// Function to query stock data from the backend
export const queryStock = async (ticker: string): Promise<StockData> => {
  try {
    const response = await api.get<StockData>(`/query?ticker=${ticker}`);
    console.log('API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error querying stock data:', error);
    throw new Error('Error querying stock data');
  }
};

// Function to buy stock and update the backend
export const buyStock = async (ticker: string, quantity: number): Promise<void> => {
  try {
    await api.post('/buy', { ticker, quantity });
  } catch (error) {
    console.error('Error buying stock:', error);
    throw new Error('Error buying stock');
  }
};

// Function to sell stock and update the backend
export const sellStock = async (ticker: string, quantity: number): Promise<void> => {
  try {
    await api.post('/sell', { ticker, quantity });
  } catch (error) {
    console.error('Error selling stock:', error);
    throw new Error('Error selling stock');
  }
};

// Function to view the portfolio from the backend
export const viewPortfolio = async (): Promise<Portfolio> => {
  try {
    const response = await api.get<Portfolio>('/portfolio');
    return response.data;
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    throw new Error('Error fetching portfolio');
  }
};

// Function to get portfolio history from the backend
export const getPortfolioHistory = async (days: number): Promise<HistoryDataPoint[]> => {
  try {
    const response = await api.get<HistoryDataPoint[]>(`/portfolio/history?days=${days}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching portfolio history:', error);
    throw new Error('Error fetching portfolio history');
  }
};

// Function to get a review of the portfolio from the backend
export const getPortfolioReview = async (): Promise<string> => {
  try {
    const portfolioData = await viewPortfolio();
    const response = await api.post<string>('/portfolio/review', { portfolio_data: portfolioData });
    return response.data;
  } catch (error) {
    console.error('Error getting portfolio review:', error);
    throw new Error('Error getting portfolio review');
  }
};
