import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Box, Heading, Select, Text } from '@chakra-ui/react';
import { useGraph } from '../context/GraphContext';

const PortfolioGraph: React.FC = () => {
  const { historyData, timeRange, setTimeRange } = useGraph();

  const convertToPST = (utcDateString: string): Date => {
    const date = new Date(utcDateString);
    return new Date(date.toLocaleString("en-US", {timeZone: "America/Los_Angeles"}));
  };

  const formatDate = (dateString: string): string => {
    const date = convertToPST(dateString);
    if (timeRange === 1) {
      // For 24-hour view, return time in HH:MM format
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    } else {
      // For other views, return date in short format (e.g., Jan 1, 2023)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const formatValue = (value: number): string => `$${value.toFixed(2)}`;

  const adjustedData = useMemo(() => {
    return historyData.map(item => ({
      ...item,
      date: convertToPST(item.date).toISOString(),
    }));
  }, [historyData]);

  return (
    <Box>
      <Heading size="md" mb={4}>Portfolio Value Over Time (PST)</Heading>
      <Select 
        value={timeRange} 
        onChange={(e) => setTimeRange(Number(e.target.value))} 
        mb={4}
        width="auto"
      >
        <option value={1}>Last 24 hours</option>
        <option value={7}>Last 7 days</option>
        <option value={30}>Last 30 days</option>
        <option value={90}>Last 90 days</option>
        <option value={365}>Last year</option>
      </Select>
      {adjustedData.length === 0 && <Text>No historical data available</Text>}
      {adjustedData.length > 0 && (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={adjustedData} margin={{ left: 20, right: 20, top: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate} 
              tick={{ fontSize: 12 }}
              tickMargin={10}
              interval="preserveStartEnd"
            />
            <YAxis 
              tickFormatter={formatValue} 
              tick={{ fontSize: 12 }}
              tickMargin={10}
              width={80}
            />
            <Tooltip
              labelFormatter={(label: string) => formatDate(label)}
              formatter={(value: number) => [formatValue(value), 'Portfolio Value']}
            />
            <Line type="monotone" dataKey="value" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
};

export default PortfolioGraph;