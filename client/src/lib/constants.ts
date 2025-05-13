export const CHART_PATTERNS = [
  {
    id: 'double_top',
    name: 'Double Top',
    description: 'A bearish reversal pattern forming after an uptrend where the price reaches a high, retracts, and then reaches a similar high before declining.',
    type: 'bearish'
  },
  {
    id: 'double_bottom',
    name: 'Double Bottom',
    description: 'A bullish reversal pattern forming after a downtrend where the price reaches a low, rebounds, and then reaches a similar low before rising.',
    type: 'bullish'
  },
  {
    id: 'head_and_shoulders',
    name: 'Head and Shoulders',
    description: 'A bearish reversal pattern consisting of three peaks, with the middle peak (head) being the highest and the two outside peaks (shoulders) being lower and roughly equal.',
    type: 'bearish'
  },
  {
    id: 'inverse_head_and_shoulders',
    name: 'Inverse Head and Shoulders',
    description: 'A bullish reversal pattern consisting of three troughs, with the middle trough (head) being the lowest and the two outside troughs (shoulders) being higher and roughly equal.',
    type: 'bullish'
  },
  {
    id: 'bull_flag',
    name: 'Bull Flag',
    description: 'A bullish continuation pattern that forms after a strong upward move, followed by a period of consolidation with parallel downward-sloping trend lines.',
    type: 'bullish'
  },
  {
    id: 'bear_flag',
    name: 'Bear Flag',
    description: 'A bearish continuation pattern that forms after a strong downward move, followed by a period of consolidation with parallel upward-sloping trend lines.',
    type: 'bearish'
  },
  {
    id: 'ascending_triangle',
    name: 'Ascending Triangle',
    description: 'A bullish continuation pattern characterized by a flat upper resistance line and an upward-sloping lower support line.',
    type: 'bullish'
  },
  {
    id: 'descending_triangle',
    name: 'Descending Triangle',
    description: 'A bearish continuation pattern characterized by a flat lower support line and a downward-sloping upper resistance line.',
    type: 'bearish'
  },
  {
    id: 'cup_and_handle',
    name: 'Cup and Handle',
    description: 'A bullish continuation pattern resembling a cup with a handle, where the cup forms a U shape and the handle has a slight downward drift.',
    type: 'bullish'
  },
  {
    id: 'rounding_bottom',
    name: 'Rounding Bottom',
    description: 'A bullish reversal pattern that looks like the bottom of a saucer or rounding bowl, indicating a gradual shift from selling to buying pressure.',
    type: 'bullish'
  }
];

export const ASSETS = {
  forex: [
    { value: 'EUR/USD', label: 'EUR/USD' },
    { value: 'GBP/USD', label: 'GBP/USD' },
    { value: 'USD/JPY', label: 'USD/JPY' },
    { value: 'AUD/USD', label: 'AUD/USD' },
    { value: 'USD/CAD', label: 'USD/CAD' },
    { value: 'USD/CHF', label: 'USD/CHF' }
  ],
  stocks: [
    { value: 'AAPL', label: 'Apple (AAPL)' },
    { value: 'MSFT', label: 'Microsoft (MSFT)' },
    { value: 'GOOGL', label: 'Alphabet (GOOGL)' },
    { value: 'AMZN', label: 'Amazon (AMZN)' },
    { value: 'TSLA', label: 'Tesla (TSLA)' },
    { value: 'META', label: 'Meta (META)' },
    { value: 'NVDA', label: 'NVIDIA (NVDA)' }
  ],
  crypto: [
    { value: 'BTC/USD', label: 'Bitcoin (BTC/USD)' },
    { value: 'ETH/USD', label: 'Ethereum (ETH/USD)' },
    { value: 'SOL/USD', label: 'Solana (SOL/USD)' },
    { value: 'BNB/USD', label: 'Binance Coin (BNB/USD)' },
    { value: 'ADA/USD', label: 'Cardano (ADA/USD)' }
  ]
};
