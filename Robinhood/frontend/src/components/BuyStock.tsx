import React, { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import {
  Box,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Button,
  VStack,
  Heading,
  useToast,
  Flex,
  Text,
} from '@chakra-ui/react';

/**
 * BuyStock Component
 * 
 * This component provides a user interface for buying stocks. It includes
 * input fields for the stock ticker and quantity, and a button to execute
 * the purchase. It uses the PortfolioContext to update the user's portfolio
 * after a successful purchase.
 */
const BuyStock: React.FC = () => {
  // Access the buyStockAndUpdatePortfolio function from the PortfolioContext
  const { buyStockAndUpdatePortfolio } = usePortfolio();

  // State for form inputs and submission status
  const [ticker, setTicker] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [submitted, setSubmitted] = useState<boolean>(false);

  // Hook for displaying toast notifications
  const toast = useToast();

  /**
   * Handles the stock purchase process
   */
  const handleBuyStock = async () => {
    setSubmitted(true);
    if (ticker && quantity > 0) {
      try {
        await buyStockAndUpdatePortfolio(ticker.toUpperCase(), quantity);
        toast({
          title: "Stock Purchased",
          description: `${quantity} shares of ${ticker.toUpperCase()} purchased successfully.`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        // Reset form after successful purchase
        setTicker('');
        setQuantity(1);
        setSubmitted(false);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to purchase stock. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } else {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid ticker and quantity.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      <Heading as="h2" size="lg" mb={2}>Buy Stock</Heading>
      <Flex direction="column" bg="green.800" p={4} borderRadius="md" boxShadow="md">
        <Input
          placeholder="Ticker"
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          isInvalid={submitted && !ticker}
          mb={3}
        />
        <Flex align="center" mb={3}>
          <Text mr={2}>Quantity:</Text>
          <NumberInput 
            value={quantity} 
            min={1} 
            onChange={(_, valueNumber) => setQuantity(valueNumber)}
            isInvalid={submitted && quantity <= 0}
            flex={1}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </Flex>
        <Button 
          colorScheme="green" 
          onClick={handleBuyStock}
          _hover={{ bg: "green.600" }}
        >
          Buy
        </Button>
      </Flex>
    </VStack>
  );
};

export default BuyStock;

