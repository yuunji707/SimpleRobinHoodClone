import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getPortfolioHistory } from '../api';
import io from 'socket.io-client';

/**
 * Represents a single data point in the portfolio history
 */
interface HistoryDataPoint {
  date: string;
  value: number;
}

/**
 * Defines the shape of the context value provided by GraphContext
 */
interface GraphContextType {
  historyData: HistoryDataPoint[];
  timeRange: number;
  setTimeRange: (range: number) => void;
  updateGraphData: () => Promise<void>;
}

// Create the context with a default undefined value
const GraphContext = createContext<GraphContextType | undefined>(undefined);

/**
 * Custom hook to use the graph context
 * @throws {Error} If used outside of a GraphProvider
 */
export const useGraph = (): GraphContextType => {
  const context = useContext(GraphContext);
  if (!context) {
    throw new Error('useGraph must be used within a GraphProvider');
  }
  return context;
};

interface GraphProviderProps {
  children: React.ReactNode;
}

/**
 * GraphProvider component
 * Manages the state for portfolio history data and provides it to child components
 */
export const GraphProvider: React.FC<GraphProviderProps> = ({ children }) => {
  const [historyData, setHistoryData] = useState<HistoryDataPoint[]>([]);
  // Set default time range to 1 day (24 hours)
  const [timeRange, setTimeRange] = useState<number>(1);

  /**
   * Fetches and updates graph data based on the current time range
   */
  const updateGraphData = useCallback(async () => {
    try {
      const data = await getPortfolioHistory(timeRange);
      setHistoryData(data);
    } catch (error) {
      console.error('Error fetching portfolio history:', error);
    }
  }, [timeRange]);

  useEffect(() => {
    // Initial data fetch
    updateGraphData();

    // Set up WebSocket connection
    const socket = io('http://localhost:5000');

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('portfolioUpdated', (updatedPortfolio) => {
      // When we receive an update, add a new data point to the history
      const newDataPoint: HistoryDataPoint = {
        date: new Date().toISOString(),
        value: updatedPortfolio.total_value
      };
      setHistoryData(prevData => [...prevData, newDataPoint]);
    });

    // Clean up function to disconnect socket when component unmounts
    return () => {
      socket.disconnect();
    };
  }, [updateGraphData]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({
    historyData,
    timeRange,
    setTimeRange,
    updateGraphData
  }), [historyData, timeRange, updateGraphData]);

  return (
    <GraphContext.Provider value={contextValue}>
      {children}
    </GraphContext.Provider>
  );
};