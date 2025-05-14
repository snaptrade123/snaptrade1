export const CHART_PATTERNS = [
  {
    id: 'double_top',
    name: 'Double Top',
    description: 'A bearish reversal pattern forming after an uptrend where the price reaches a high, retracts, and then reaches a similar high before declining.',
    type: 'bearish',
    characteristics: [
      'Forms after an established uptrend',
      'Two distinct peaks at approximately the same price level',
      'Volume often decreases on the second peak',
      'Confirmation occurs when price breaks below the neckline (the trough between the two peaks)'
    ],
    strategy: 'Enter short when price breaks below the neckline with a stop loss above the second peak. Target is typically the distance from the peaks to the neckline, projected downward from the breakout point.',
    image: '/images/patterns/double_top.svg'
  },
  {
    id: 'double_bottom',
    name: 'Double Bottom',
    description: 'A bullish reversal pattern forming after a downtrend where the price reaches a low, rebounds, and then reaches a similar low before rising.',
    type: 'bullish',
    characteristics: [
      'Forms after an established downtrend',
      'Two distinct troughs at approximately the same price level',
      'Volume often increases on the second trough',
      'Confirmation occurs when price breaks above the neckline (the peak between the two troughs)'
    ],
    strategy: 'Enter long when price breaks above the neckline with a stop loss below the second trough. Target is typically the distance from the troughs to the neckline, projected upward from the breakout point.',
    image: '/images/patterns/double_bottom.svg'
  },
  {
    id: 'head_and_shoulders',
    name: 'Head and Shoulders',
    description: 'A bearish reversal pattern consisting of three peaks, with the middle peak (head) being the highest and the two outside peaks (shoulders) being lower and roughly equal.',
    type: 'bearish',
    characteristics: [
      'Forms after an established uptrend',
      'Three peaks with the middle peak (head) higher than the two shoulders',
      'Neckline connects the lows between the peaks',
      'Volume typically decreases with each peak and increases on the breakdown'
    ],
    strategy: 'Enter short when price breaks below the neckline with a stop loss above the right shoulder. Price target is typically the distance from the head to the neckline, projected downward from the breakout point.',
    image: '/images/patterns/head_and_shoulders.svg'
  },
  {
    id: 'inverse_head_and_shoulders',
    name: 'Inverse Head and Shoulders',
    description: 'A bullish reversal pattern consisting of three troughs, with the middle trough (head) being the lowest and the two outside troughs (shoulders) being higher and roughly equal.',
    type: 'bullish',
    characteristics: [
      'Forms after an established downtrend',
      'Three troughs with the middle trough (head) lower than the two shoulders',
      'Neckline connects the peaks between the troughs',
      'Volume typically decreases with each trough and increases on the breakout'
    ],
    strategy: 'Enter long when price breaks above the neckline with a stop loss below the right shoulder. Price target is typically the distance from the head to the neckline, projected upward from the breakout point.',
    image: '/images/patterns/inverse_head_and_shoulders.svg'
  },
  {
    id: 'bull_flag',
    name: 'Bull Flag',
    description: 'A bullish continuation pattern that forms after a strong upward move, followed by a period of consolidation with parallel downward-sloping trend lines.',
    type: 'bullish',
    characteristics: [
      'Preceded by a strong, sharp price move upward (the flagpole)',
      'Consolidation phase with parallel or slightly converging downward trend lines',
      'Usually forms over a shorter time period (1-3 weeks)',
      'Volume typically decreases during the flag formation and increases upon breakout'
    ],
    strategy: 'Enter long when price breaks above the upper trendline of the flag with a stop loss below the lowest point of the flag. Target is typically the height of the flagpole added to the breakout point.',
    image: '/images/patterns/bull_flag.svg'
  },
  {
    id: 'bear_flag',
    name: 'Bear Flag',
    description: 'A bearish continuation pattern that forms after a strong downward move, followed by a period of consolidation with parallel upward-sloping trend lines.',
    type: 'bearish',
    characteristics: [
      'Preceded by a strong, sharp price move downward (the flagpole)',
      'Consolidation phase with parallel or slightly converging upward trend lines',
      'Usually forms over a shorter time period (1-3 weeks)',
      'Volume typically decreases during the flag formation and increases upon breakdown'
    ],
    strategy: 'Enter short when price breaks below the lower trendline of the flag with a stop loss above the highest point of the flag. Target is typically the height of the flagpole subtracted from the breakdown point.',
    image: '/images/patterns/bear_flag.svg'
  },
  {
    id: 'ascending_triangle',
    name: 'Ascending Triangle',
    description: 'A bullish continuation pattern characterized by a flat upper resistance line and an upward-sloping lower support line.',
    type: 'bullish',
    characteristics: [
      'Horizontal resistance line at the top',
      'Rising support line connecting the lows',
      'Volume typically decreases as the pattern forms and increases upon breakout',
      'Usually forms over several weeks to months'
    ],
    strategy: 'Enter long when price breaks above the horizontal resistance line with a stop loss below the most recent swing low. Target is typically the height of the triangle added to the breakout point.',
    image: '/images/patterns/ascending_triangle.svg'
  },
  {
    id: 'descending_triangle',
    name: 'Descending Triangle',
    description: 'A bearish continuation pattern characterized by a flat lower support line and a downward-sloping upper resistance line.',
    type: 'bearish',
    characteristics: [
      'Horizontal support line at the bottom',
      'Declining resistance line connecting the highs',
      'Volume typically decreases as the pattern forms and increases upon breakdown',
      'Usually forms over several weeks to months'
    ],
    strategy: 'Enter short when price breaks below the horizontal support line with a stop loss above the most recent swing high. Target is typically the height of the triangle subtracted from the breakdown point.',
    image: '/images/patterns/descending_triangle.svg'
  },
  {
    id: 'cup_and_handle',
    name: 'Cup and Handle',
    description: 'A bullish continuation pattern resembling a cup with a handle, where the cup forms a U shape and the handle has a slight downward drift.',
    type: 'bullish',
    characteristics: [
      'U-shaped cup formation (not V-shaped) over a longer period',
      'Shallower handle forms on the right side of the cup (usually less than 1/3 the depth of the cup)',
      'Volume typically decreases during the cup formation, is lower in the handle, and increases upon breakout',
      'Usually forms over several months (cup) and weeks (handle)'
    ],
    strategy: 'Enter long when price breaks above the resistance level (the lip of the cup) with a stop loss below the lowest point of the handle. Target is typically the depth of the cup added to the breakout point.',
    image: '/images/patterns/cup_and_handle.svg'
  },
  {
    id: 'rounding_bottom',
    name: 'Rounding Bottom',
    description: 'A bullish reversal pattern that looks like the bottom of a saucer or rounding bowl, indicating a gradual shift from selling to buying pressure.',
    type: 'bullish',
    characteristics: [
      'Gradual change in trend direction creating a bowl or saucer shape',
      'Volume typically decreases as the price falls, and increases as the price rises',
      'Forms over an extended period (often several months)',
      'No clear resistance level until the pattern is complete'
    ],
    strategy: 'Enter long when price breaks above the level where the rounding began with a stop loss below the lowest point of the pattern. Target is typically the depth of the bowl added to the breakout point.',
    image: '/images/patterns/rounding_bottom.svg'
  },
  {
    id: 'symmetrical_triangle',
    name: 'Symmetrical Triangle',
    description: 'A neutral continuation pattern where price consolidates between converging trendlines with similar slopes.',
    type: 'neutral',
    characteristics: [
      'Upper descending trendline connecting lower highs',
      'Lower ascending trendline connecting higher lows',
      'Volume typically decreases as the pattern forms and increases upon breakout',
      'The breakout direction determines whether it is bullish or bearish'
    ],
    strategy: 'Enter in the direction of the breakout with a stop loss on the opposite side of the triangle. Target is typically the height of the triangle (at its widest point) added to or subtracted from the breakout point.',
    image: '/images/patterns/symmetrical_triangle.svg'
  },
  {
    id: 'wedge_rising',
    name: 'Rising Wedge',
    description: 'A bearish pattern characterized by converging upward sloping trendlines, where the slope of the lower line is steeper than the upper line.',
    type: 'bearish',
    characteristics: [
      'Both trendlines slope upward but converge',
      'Lower trendline has a steeper slope than the upper line',
      'Volume typically decreases as the pattern progresses',
      'Often appears after a prolonged uptrend'
    ],
    strategy: 'Enter short when price breaks below the lower trendline with a stop loss above the most recent swing high. Target is typically the height of the wedge at its widest point, subtracted from the breakdown point.',
    image: '/images/patterns/wedge_rising.svg'
  },
  {
    id: 'wedge_falling',
    name: 'Falling Wedge',
    description: 'A bullish pattern characterized by converging downward sloping trendlines, where the slope of the upper line is steeper than the lower line.',
    type: 'bullish',
    characteristics: [
      'Both trendlines slope downward but converge',
      'Upper trendline has a steeper slope than the lower line',
      'Volume typically decreases as the pattern progresses',
      'Often appears after a prolonged downtrend'
    ],
    strategy: 'Enter long when price breaks above the upper trendline with a stop loss below the most recent swing low. Target is typically the height of the wedge at its widest point, added to the breakout point.',
    image: '/images/patterns/wedge_falling.svg'
  },
  {
    id: 'rectangle',
    name: 'Rectangle',
    description: 'A neutral continuation pattern where price consolidates between parallel support and resistance lines before continuing the prior trend.',
    type: 'neutral',
    characteristics: [
      'Horizontal support and resistance lines forming a rectangle',
      'Price bounces between these lines multiple times',
      'Volume tends to be higher at the boundaries and lower in the middle',
      'Breakout direction typically follows the prior trend'
    ],
    strategy: 'Enter in the direction of the breakout with a stop loss on the opposite side of the rectangle. Target is typically the height of the rectangle added to or subtracted from the breakout point.',
    image: '/images/patterns/rectangle.svg'
  }
];

export const ASSETS = {
  forex: [
    { value: 'EUR/USD', label: 'EUR/USD - Euro' },
    { value: 'GBP/USD', label: 'GBP/USD - British Pound' },
    { value: 'USD/JPY', label: 'USD/JPY - Japanese Yen' },
    { value: 'AUD/USD', label: 'AUD/USD - Australian Dollar' },
    { value: 'USD/CAD', label: 'USD/CAD - Canadian Dollar' },
    { value: 'USD/CHF', label: 'USD/CHF - Swiss Franc' },
    { value: 'NZD/USD', label: 'NZD/USD - New Zealand Dollar' },
    { value: 'EUR/GBP', label: 'EUR/GBP - Euro/Pound' },
    { value: 'EUR/JPY', label: 'EUR/JPY - Euro/Yen' },
    { value: 'GBP/JPY', label: 'GBP/JPY - Pound/Yen' },
    { value: 'XAU/USD', label: 'XAU/USD - Gold' },
    { value: 'XAG/USD', label: 'XAG/USD - Silver' },
    { value: 'USD/CNH', label: 'USD/CNH - Chinese Yuan' },
    { value: 'USD/HKD', label: 'USD/HKD - Hong Kong Dollar' }
  ],
  stocks: [
    { value: 'AAPL', label: 'Apple (AAPL)' },
    { value: 'MSFT', label: 'Microsoft (MSFT)' },
    { value: 'GOOGL', label: 'Alphabet (GOOGL)' },
    { value: 'AMZN', label: 'Amazon (AMZN)' },
    { value: 'TSLA', label: 'Tesla (TSLA)' },
    { value: 'META', label: 'Meta (META)' },
    { value: 'NVDA', label: 'NVIDIA (NVDA)' },
    { value: 'JPM', label: 'JPMorgan Chase (JPM)' },
    { value: 'BAC', label: 'Bank of America (BAC)' },
    { value: 'WMT', label: 'Walmart (WMT)' },
    { value: 'NFLX', label: 'Netflix (NFLX)' },
    { value: 'DIS', label: 'Disney (DIS)' },
    { value: 'INTC', label: 'Intel (INTC)' },
    { value: 'AMD', label: 'AMD (AMD)' },
    { value: 'PYPL', label: 'PayPal (PYPL)' },
    { value: 'UBER', label: 'Uber (UBER)' },
    { value: 'ABNB', label: 'Airbnb (ABNB)' },
    { value: 'SBUX', label: 'Starbucks (SBUX)' },
    { value: 'KO', label: 'Coca-Cola (KO)' },
    { value: 'PEP', label: 'PepsiCo (PEP)' }
  ],
  crypto: [
    { value: 'BTC/USD', label: 'Bitcoin (BTC/USD)' },
    { value: 'ETH/USD', label: 'Ethereum (ETH/USD)' },
    { value: 'SOL/USD', label: 'Solana (SOL/USD)' },
    { value: 'BNB/USD', label: 'Binance Coin (BNB/USD)' },
    { value: 'ADA/USD', label: 'Cardano (ADA/USD)' },
    { value: 'XRP/USD', label: 'Ripple (XRP/USD)' },
    { value: 'DOT/USD', label: 'Polkadot (DOT/USD)' },
    { value: 'DOGE/USD', label: 'Dogecoin (DOGE/USD)' },
    { value: 'AVAX/USD', label: 'Avalanche (AVAX/USD)' },
    { value: 'MATIC/USD', label: 'Polygon (MATIC/USD)' }
  ]
};
