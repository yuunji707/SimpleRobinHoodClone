import React, { useState } from 'react';
import { getPortfolioReview } from '../api';
import { usePortfolio } from '../context/PortfolioContext';
import {
  Box,
  Button,
  Text,
  useToast,
  VStack,
  Heading,
  Spinner,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  List,
  ListItem,
  Badge,
} from '@chakra-ui/react';

/**
 * PortfolioReview Component
 * 
 * This component displays a comprehensive review of the user's portfolio,
 * including current holdings and sold stocks. It also provides functionality
 * to generate an AI-powered portfolio review.
 */
const PortfolioReview: React.FC = () => {
  const [review, setReview] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const toast = useToast();
  const { portfolio } = usePortfolio();

  /**
   * Generates a portfolio review using an AI service
   */
  const handleGenerateReview = async () => {
    setIsLoading(true);
    try {
      const reviewText = await getPortfolioReview();
      setReview(reviewText);
      toast({
        title: 'Portfolio review generated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error generating portfolio review:', error);
      toast({
        title: 'Error generating portfolio review',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Renders a list of stocks (either bought or sold)
   * @param stocks - Array of stock objects
   * @param isBought - Boolean indicating if these are bought stocks
   */
  const renderStockList = (stocks: any[], isBought: boolean) => (
    <List spacing={3}>
      {stocks.map((stock, index) => (
        <ListItem key={index} color="white">
          <Badge colorScheme={isBought ? "green" : "red"} mr={2}>
            {stock.ticker}
          </Badge>
          Quantity: {stock.quantity} | 
          {isBought 
            ? `Bought: ${new Date(stock.date_bought).toLocaleString()}`
            : `Sold: ${new Date(stock.date_sold).toLocaleString()}`
          }
        </ListItem>
      ))}
    </List>
  );

  return (
    <Box mt={8} p={6} bg="purple.800" borderRadius="lg" boxShadow="xl">
      <VStack spacing={6} align="stretch">
        <Heading as="h2" size="xl" color="white">
          Portfolio Review
        </Heading>

        <Accordion allowMultiple>
          <AccordionItem>
            <h3>
              <AccordionButton>
                <Box flex="1" textAlign="left" fontWeight="bold" color="white">
                  Current Holdings
                </Box>
                <AccordionIcon color="white" />
              </AccordionButton>
            </h3>
            <AccordionPanel pb={4}>
              {portfolio.bought_stocks.length > 0 
                ? renderStockList(portfolio.bought_stocks, true)
                : <Text color="white">No current holdings</Text>
              }
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem>
            <h3>
              <AccordionButton>
                <Box flex="1" textAlign="left" fontWeight="bold" color="white">
                  Sold Stocks
                </Box>
                <AccordionIcon color="white" />
              </AccordionButton>
            </h3>
            <AccordionPanel pb={4}>
              {portfolio.sold_stocks.length > 0
                ? renderStockList(portfolio.sold_stocks, false)
                : <Text color="white">No sold stocks</Text>
              }
            </AccordionPanel>
          </AccordionItem>
        </Accordion>

        <Button
          colorScheme="teal"
          onClick={handleGenerateReview}
          isLoading={isLoading}
          loadingText="Generating Review"
          size="lg"
        >
          Generate Portfolio Review
        </Button>

        {isLoading && (
          <Box textAlign="center">
            <Spinner size="xl" color="white" />
            <Text color="white" mt={2}>
              Analyzing your portfolio...
            </Text>
          </Box>
        )}

        {review && (
          <Box
            mt={4}
            p={4}
            bg="rgba(255, 255, 255, 0.1)"
            borderRadius="md"
            boxShadow="inner"
          >
            <Text color="white" whiteSpace="pre-wrap" fontSize="md">
              {review}
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default PortfolioReview;