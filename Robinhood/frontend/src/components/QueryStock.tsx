import React, { useState } from 'react';
import { queryStock, StockData } from '../api';
import {
  Box,
  Input,
  Button,
  VStack,
  Heading,
  Text,
  Flex,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';

/**
 * QueryStock Component
 * 
 * This component provides a user interface for querying stock information.
 * It allows users to enter a stock ticker and displays relevant stock data.
 */
const QueryStock: React.FC = () => {
  const [ticker, setTicker] = useState<string>('');
  const [stockInfo, setStockInfo] = useState<StockData | null>(null);
  const toast = useToast();

  /**
   * Handles the stock query process
   */
  const handleQuery = async () => {
    if (!ticker.trim()) {
      toast({
        title: "Error",
        description: "Please enter a stock ticker.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await queryStock(ticker);
      setStockInfo(response);
    } catch (error) {
      console.error('Error querying stock data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch stock data. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setStockInfo(null);
    }
  };

  /**
   * Renders the stock information
   */
  const renderStockInfo = () => {
    if (!stockInfo) return null;

    return (
      <Box 
        bg="gray.700" 
        p={4} 
        borderRadius="md" 
        boxShadow="xl"
        border="1px"
        borderColor="gray.600"
      >
        <Heading as="h3" size="md" mb={4}>{stockInfo.symbol}</Heading>
        {stockInfo.error ? (
          <Text color="red.500">{stockInfo.error}</Text>
        ) : (
          <Flex justify="space-between">
            <Stat>
              <StatLabel>Price</StatLabel>
              <StatNumber>${stockInfo.currentPrice?.toFixed(2) ?? 'N/A'}</StatNumber>
              <StatHelpText>
                <StatArrow type={stockInfo.dailyChange && stockInfo.dailyChange > 0 ? "increase" : "decrease"} />
                {stockInfo.dailyChange ? `${stockInfo.dailyChange.toFixed(2)}%` : 'N/A'}
              </StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Market Cap</StatLabel>
              <StatNumber>
                {stockInfo.marketCap 
                  ? `$${(stockInfo.marketCap / 1e9).toFixed(2)}B` 
                  : 'N/A'}
              </StatNumber>
            </Stat>
          </Flex>
        )}
      </Box>
    );
  };

  return (
    <VStack spacing={4} align="stretch">
      <Heading as="h2" size="lg" mb={2}>Stock Query</Heading>
      <Flex>
        <Input
          placeholder="Enter stock ticker"
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          borderRightRadius="0"
        />
        <Button 
          leftIcon={<SearchIcon />}
          colorScheme="brand"
          onClick={handleQuery}
          borderLeftRadius="0"
        >
          Search
        </Button>
      </Flex>
      {renderStockInfo()}
    </VStack>
  );
};

export default QueryStock;