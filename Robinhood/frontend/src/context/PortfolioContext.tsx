import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { viewPortfolio, buyStock, sellStock } from '../api';

// Define interfaces for the portfolio data structure
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

interface Portfolio {
  bought_stocks: BoughtStock[];
  sold_stocks: SoldStock[];
  total_value: number;
}

// Define the shape of the context value
interface PortfolioContextType {
  portfolio: Portfolio;
  buyStockAndUpdatePortfolio: (ticker: string, quantity: number) => Promise<void>;
  sellStockAndUpdatePortfolio: (ticker: string, quantity: number) => Promise<void>;
}

// Create the context with a default undefined value
const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

// Custom hook to use the portfolio context
export const usePortfolio = (): PortfolioContextType => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};

interface PortfolioProviderProps {
  children: React.ReactNode;
}

export const PortfolioProvider: React.FC<PortfolioProviderProps> = ({ children }) => {
  const [portfolio, setPortfolio] = useState<Portfolio>({ bought_stocks: [], sold_stocks: [], total_value: 0 });

  // Function to fetch the latest portfolio data
  const fetchPortfolio = useCallback(async () => {
    try {
      const data = await viewPortfolio();
      setPortfolio(data);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    }
  }, []);

  // Fetch portfolio data on component mount
  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  // Function to buy stock and update portfolio
  const buyStockAndUpdatePortfolio = useCallback(async (ticker: string, quantity: number) => {
    try {
      await buyStock(ticker, quantity);
      await fetchPortfolio();
    } catch (error) {
      console.error('Error buying stock:', error);
      throw error;
    }
  }, [fetchPortfolio]);

  // Function to sell stock and update portfolio
  const sellStockAndUpdatePortfolio = useCallback(async (ticker: string, quantity: number) => {
    try {
      await sellStock(ticker, quantity);
      await fetchPortfolio();
    } catch (error) {
      console.error('Error selling stock:', error);
      throw error;
    }
  }, [fetchPortfolio]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({
    portfolio,
    buyStockAndUpdatePortfolio,
    sellStockAndUpdatePortfolio
  }), [portfolio, buyStockAndUpdatePortfolio, sellStockAndUpdatePortfolio]);

  return (
    <PortfolioContext.Provider value={contextValue}>
      {children}
    </PortfolioContext.Provider>
  );
};