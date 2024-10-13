import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { 
  Box, 
  Heading, 
  List, 
  ListItem, 
  Text, 
  useColorModeValue, 
  Tabs, 
  TabList, 
  TabPanels, 
  Tab, 
  TabPanel, 
  Flex, 
  Stat, 
  StatLabel, 
  StatNumber, 
  StatHelpText, 
  StatArrow, 
  StatGroup 
} from '@chakra-ui/react';

// Define interfaces for the stock types
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

// Define a union type for stocks
type Stock = BoughtStock | SoldStock;

/**
 * ViewPortfolio Component
 * 
 * This component displays the user's current portfolio, including both
 * bought and sold stocks. It provides a tabbed interface to switch between
 * viewing current holdings and sold stocks.
 */
const ViewPortfolio: React.FC = () => {
  const { portfolio } = usePortfolio();
  const bg = useColorModeValue('gray.700', 'gray.100');
  const color = useColorModeValue('white', 'black');

  /**
   * Formats a date string to a localized date and time string
   * @param dateString - The date string to format
   * @returns Formatted date and time string
   */
  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  /**
   * Formats a number as a currency string
   * @param value - The numeric value to format
   * @returns Formatted currency string
   */
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  /**
   * Renders a single stock item
   * @param stock - The stock object to render
   * @param isBought - Boolean indicating if this is a bought stock
   * @returns JSX for the stock item
   */
  const StockItem: React.FC<{ stock: Stock; isBought?: boolean }> = ({ stock, isBought = true }) => (
    <Box p={3} shadow="md" borderWidth="1px" borderRadius="md" mb={2}>
      <StatGroup>
        <Stat>
          <StatLabel>{stock.ticker}</StatLabel>
          <StatNumber>{stock.quantity} shares</StatNumber>
          <StatHelpText>
            {isBought 
              ? `Bought on ${formatDateTime((stock as BoughtStock).date_bought)}`
              : `Sold on ${formatDateTime((stock as SoldStock).date_sold)}`
            }
          </StatHelpText>
        </Stat>
        {isBought && (
          <Stat>
            <StatLabel>Current Value</StatLabel>
            <StatNumber>{formatCurrency((stock as BoughtStock).stock_value)}</StatNumber>
            <StatHelpText>
              Price: {formatCurrency((stock as BoughtStock).current_price)}
            </StatHelpText>
          </Stat>
        )}
        <Stat>
          <Box height="100%" display="flex" alignItems="center" justifyContent="flex-end">
            <StatArrow type={isBought ? "increase" : "decrease"} />
          </Box>
        </Stat>
      </StatGroup>
    </Box>
  );

  /**
   * Renders a list of stocks
   * @param stocks - Array of stock objects
   * @param isBought - Boolean indicating if these are bought stocks
   * @returns JSX for the list of stocks
   */
  const renderStockList = (stocks: Stock[], isBought: boolean) => (
    <Box maxHeight="400px" overflowY="auto">
      {stocks.length === 0 ? (
        <Text>{isBought ? "No bought stocks in portfolio" : "No sold stocks in portfolio"}</Text>
      ) : (
        <List spacing={3}>
          {stocks.map((stock, index) => (
            <ListItem key={index}>
              <StockItem stock={stock} isBought={isBought} />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );

  return (
    <Box bg={bg} p={4} borderRadius="md" color={color} height="100%">
      <Heading as="h2" size="lg" mb={4}>Portfolio</Heading>
      <Stat mb={4}>
        <StatLabel>Total Portfolio Value</StatLabel>
        <StatNumber>{formatCurrency(portfolio.total_value)}</StatNumber>
      </Stat>
      <Tabs isFitted variant="enclosed">
        <TabList mb="1em">
          <Tab>Bought Stocks</Tab>
          <Tab>Sold Stocks</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            {renderStockList(portfolio.bought_stocks, true)}
          </TabPanel>
          <TabPanel>
            {renderStockList(portfolio.sold_stocks, false)}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default ViewPortfolio;