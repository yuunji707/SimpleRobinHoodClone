import React from 'react';
import { ChakraProvider, extendTheme, Grid, GridItem, Box } from '@chakra-ui/react';
import { QueryStock, BuyStock, SellStock, ViewPortfolio, PortfolioReview, PortfolioGraph, AppBar } from './components';
import { PortfolioProvider } from './context/PortfolioContext';
import { GraphProvider } from './context/GraphContext';

// Define the custom theme
const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: 'gray.900',
        color: 'white',
      },
    },
  },
  colors: {
    brand: {
      100: '#f5e1ff',
      200: '#e4c7ff',
      300: '#d3adff',
      400: '#c192ff',
      500: '#b079ff',
      600: '#9d5fff',
      700: '#8b46ff',
      800: '#792eff',
      900: '#6515ff',
    },
  },
});

// Define the layout areas for the grid
const gridAreas = `
  "graph graph"
  "query portfolio"
  "actions portfolio"
  "review review"
`;

const App: React.FC = () => {
  return (
    <ChakraProvider theme={theme}>
      <PortfolioProvider>
        <GraphProvider>
          <Box minHeight="100vh">
            <AppBar />
            <Box p={4}>
              <Grid
                templateAreas={gridAreas}
                gridTemplateRows={'auto auto 1fr auto'}
                gridTemplateColumns={'1fr 1fr'}
                gap={6}
                mt={6}
              >
                <GridItem area={'graph'}>
                  <ComponentWrapper>
                    <PortfolioGraph />
                  </ComponentWrapper>
                </GridItem>
                <GridItem area={'query'}>
                  <ComponentWrapper>
                    <QueryStock />
                  </ComponentWrapper>
                </GridItem>
                <GridItem area={'actions'}>
                  <Grid templateRows={'1fr 1fr'} gap={6}>
                    <ComponentWrapper>
                      <BuyStock />
                    </ComponentWrapper>
                    <ComponentWrapper>
                      <SellStock />
                    </ComponentWrapper>
                  </Grid>
                </GridItem>
                <GridItem area={'portfolio'}>
                  <ComponentWrapper height="100%">
                    <ViewPortfolio />
                  </ComponentWrapper>
                </GridItem>
                <GridItem area={'review'}>
                  <ComponentWrapper>
                    <PortfolioReview />
                  </ComponentWrapper>
                </GridItem>
              </Grid>
            </Box>
          </Box>
        </GraphProvider>
      </PortfolioProvider>
    </ChakraProvider>
  );
};

// Helper component to wrap each main section with consistent styling
const ComponentWrapper: React.FC<{ children: React.ReactNode; height?: string }> = ({ children, height = 'auto' }) => (
  <Box bg="gray.800" p={4} borderRadius="md" height={height}>
    {children}
  </Box>
);

export default App;