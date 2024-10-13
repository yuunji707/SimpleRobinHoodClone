import React, { useState } from 'react';
import { usePortfolio  } from '../context/PortfolioContext';
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
 * SellStock Component
 * 
 * This component provides a user interface for selling stocks from the user's portfolio.
 * It includes input fields for the stock ticker and quantity, and a button to execute the sale.
 */
const SellStock: React.FC = () => {
  const { sellStockAndUpdatePortfolio } = usePortfolio();
  const [ticker, setTicker] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const toast = useToast();

  /**
   * Handles the stock selling process
   */
  const handleSellStock = async () => {
    if (!ticker.trim() || quantity <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid ticker and quantity.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await sellStockAndUpdatePortfolio(ticker.toUpperCase(), quantity);
      toast({
        title: "Stock Sold",
        description: `${quantity} shares of ${ticker.toUpperCase()} sold successfully.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      // Reset form after successful sale
      setTicker('');
      setQuantity(1);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sell stock. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      <Heading as="h2" size="lg" mb={2}>Sell Stock</Heading>
      <Flex direction="column" bg="red.800" p={4} borderRadius="md" boxShadow="md">
        <Input
          placeholder="Ticker"
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          isInvalid={isSubmitting && !ticker.trim()}
          mb={3}
        />
        <Flex align="center" mb={3}>
          <Text mr={2}>Quantity:</Text>
          <NumberInput 
            value={quantity} 
            min={1} 
            onChange={(_, valueNumber) => setQuantity(valueNumber)}
            isInvalid={isSubmitting && quantity <= 0}
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
          colorScheme="red" 
          onClick={handleSellStock}
          isLoading={isSubmitting}
          loadingText="Selling"
          _hover={{ bg: "red.600" }}
        >
          Sell
        </Button>
      </Flex>
    </VStack>
  );
};

export default SellStock;