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
    { value: 'AUD/JPY', label: 'AUD/JPY - Australian Dollar/Yen' },
    { value: 'AUD/CAD', label: 'AUD/CAD - Australian Dollar/Canadian Dollar' },
    { value: 'AUD/CHF', label: 'AUD/CHF - Australian Dollar/Swiss Franc' },
    { value: 'AUD/NZD', label: 'AUD/NZD - Australian Dollar/New Zealand Dollar' },
    { value: 'CAD/CHF', label: 'CAD/CHF - Canadian Dollar/Swiss Franc' },
    { value: 'CAD/JPY', label: 'CAD/JPY - Canadian Dollar/Japanese Yen' },
    { value: 'CHF/JPY', label: 'CHF/JPY - Swiss Franc/Japanese Yen' },
    { value: 'EUR/AUD', label: 'EUR/AUD - Euro/Australian Dollar' },
    { value: 'EUR/CAD', label: 'EUR/CAD - Euro/Canadian Dollar' },
    { value: 'EUR/CHF', label: 'EUR/CHF - Euro/Swiss Franc' },
    { value: 'EUR/NOK', label: 'EUR/NOK - Euro/Norwegian Krone' },
    { value: 'EUR/NZD', label: 'EUR/NZD - Euro/New Zealand Dollar' },
    { value: 'EUR/SEK', label: 'EUR/SEK - Euro/Swedish Krona' },
    { value: 'GBP/AUD', label: 'GBP/AUD - British Pound/Australian Dollar' },
    { value: 'GBP/CAD', label: 'GBP/CAD - British Pound/Canadian Dollar' },
    { value: 'GBP/CHF', label: 'GBP/CHF - British Pound/Swiss Franc' },
    { value: 'GBP/NZD', label: 'GBP/NZD - British Pound/New Zealand Dollar' },
    { value: 'NZD/CAD', label: 'NZD/CAD - New Zealand Dollar/Canadian Dollar' },
    { value: 'NZD/CHF', label: 'NZD/CHF - New Zealand Dollar/Swiss Franc' },
    { value: 'NZD/JPY', label: 'NZD/JPY - New Zealand Dollar/Japanese Yen' },
    { value: 'USD/MXN', label: 'USD/MXN - US Dollar/Mexican Peso' },
    { value: 'USD/NOK', label: 'USD/NOK - US Dollar/Norwegian Krone' },
    { value: 'USD/SEK', label: 'USD/SEK - US Dollar/Swedish Krona' },
    { value: 'USD/SGD', label: 'USD/SGD - US Dollar/Singapore Dollar' },
    { value: 'USD/ZAR', label: 'USD/ZAR - US Dollar/South African Rand' },
    { value: 'XAU/USD', label: 'XAU/USD - Gold' },
    { value: 'XAG/USD', label: 'XAG/USD - Silver' },
    { value: 'USD/CNH', label: 'USD/CNH - US Dollar/Chinese Yuan' },
    { value: 'USD/HKD', label: 'USD/HKD - US Dollar/Hong Kong Dollar' }
  ],
  stocks: [
    // US Large Cap Tech
    { value: 'AAPL', label: 'Apple (AAPL)' },
    { value: 'MSFT', label: 'Microsoft (MSFT)' },
    { value: 'GOOGL', label: 'Alphabet (GOOGL)' },
    { value: 'GOOG', label: 'Alphabet Class C (GOOG)' },
    { value: 'AMZN', label: 'Amazon (AMZN)' },
    { value: 'TSLA', label: 'Tesla (TSLA)' },
    { value: 'META', label: 'Meta Platforms (META)' },
    { value: 'NVDA', label: 'NVIDIA (NVDA)' },
    { value: 'NFLX', label: 'Netflix (NFLX)' },
    
    // US Financial Sector
    { value: 'JPM', label: 'JPMorgan Chase (JPM)' },
    { value: 'BAC', label: 'Bank of America (BAC)' },
    { value: 'WFC', label: 'Wells Fargo (WFC)' },
    { value: 'C', label: 'Citigroup (C)' },
    { value: 'GS', label: 'Goldman Sachs (GS)' },
    { value: 'MS', label: 'Morgan Stanley (MS)' },
    
    // US Retail
    { value: 'WMT', label: 'Walmart (WMT)' },
    { value: 'COST', label: 'Costco (COST)' },
    { value: 'TGT', label: 'Target (TGT)' },
    { value: 'HD', label: 'Home Depot (HD)' },
    { value: 'LOW', label: 'Lowe\'s (LOW)' },
    
    // US Entertainment/Media
    { value: 'DIS', label: 'Disney (DIS)' },
    { value: 'CMCSA', label: 'Comcast (CMCSA)' },
    { value: 'PARA', label: 'Paramount (PARA)' },
    { value: 'WBD', label: 'Warner Bros Discovery (WBD)' },
    
    // US Semiconductor
    { value: 'INTC', label: 'Intel (INTC)' },
    { value: 'AMD', label: 'AMD (AMD)' },
    { value: 'QCOM', label: 'Qualcomm (QCOM)' },
    { value: 'MU', label: 'Micron Technology (MU)' },
    { value: 'TXN', label: 'Texas Instruments (TXN)' },
    
    // US Tech/Fintech
    { value: 'PYPL', label: 'PayPal (PYPL)' },
    { value: 'SQ', label: 'Block (SQ)' },
    { value: 'V', label: 'Visa (V)' },
    { value: 'MA', label: 'Mastercard (MA)' },
    { value: 'ADBE', label: 'Adobe (ADBE)' },
    { value: 'CRM', label: 'Salesforce (CRM)' },
    
    // Tech/Consumer
    { value: 'UBER', label: 'Uber (UBER)' },
    { value: 'LYFT', label: 'Lyft (LYFT)' },
    { value: 'ABNB', label: 'Airbnb (ABNB)' },
    { value: 'DASH', label: 'DoorDash (DASH)' },
    
    // Consumer Goods
    { value: 'SBUX', label: 'Starbucks (SBUX)' },
    { value: 'MCD', label: 'McDonald\'s (MCD)' },
    { value: 'KO', label: 'Coca-Cola (KO)' },
    { value: 'PEP', label: 'PepsiCo (PEP)' },
    { value: 'NKE', label: 'Nike (NKE)' },
    
    // Healthcare
    { value: 'JNJ', label: 'Johnson & Johnson (JNJ)' },
    { value: 'PFE', label: 'Pfizer (PFE)' },
    { value: 'MRNA', label: 'Moderna (MRNA)' },
    { value: 'UNH', label: 'UnitedHealth Group (UNH)' },
    
    // UK Stocks
    { value: 'HSBA.L', label: 'HSBC Holdings (HSBA.L)' },
    { value: 'BARC.L', label: 'Barclays (BARC.L)' },
    { value: 'LLOY.L', label: 'Lloyds Banking Group (LLOY.L)' },
    { value: 'BP.L', label: 'BP (BP.L)' },
    { value: 'SHEL.L', label: 'Shell (SHEL.L)' },
    { value: 'VOD.L', label: 'Vodafone Group (VOD.L)' },
    { value: 'GSK.L', label: 'GSK (GSK.L)' },
    { value: 'AZN.L', label: 'AstraZeneca (AZN.L)' },
    { value: 'ULVR.L', label: 'Unilever (ULVR.L)' },
    { value: 'TSCO.L', label: 'Tesco (TSCO.L)' }
  ],
  crypto: [
    // Major Cryptocurrencies
    { value: 'BTC/USD', label: 'Bitcoin (BTC/USD)' },
    { value: 'ETH/USD', label: 'Ethereum (ETH/USD)' },
    { value: 'SOL/USD', label: 'Solana (SOL/USD)' },
    { value: 'BNB/USD', label: 'Binance Coin (BNB/USD)' },
    { value: 'ADA/USD', label: 'Cardano (ADA/USD)' },
    { value: 'XRP/USD', label: 'Ripple (XRP/USD)' },
    { value: 'DOT/USD', label: 'Polkadot (DOT/USD)' },
    { value: 'DOGE/USD', label: 'Dogecoin (DOGE/USD)' },
    { value: 'AVAX/USD', label: 'Avalanche (AVAX/USD)' },
    { value: 'MATIC/USD', label: 'Polygon (MATIC/USD)' },
    
    // Additional Top-50 Cryptocurrencies
    { value: 'SHIB/USD', label: 'Shiba Inu (SHIB/USD)' },
    { value: 'LTC/USD', label: 'Litecoin (LTC/USD)' },
    { value: 'TRX/USD', label: 'TRON (TRX/USD)' },
    { value: 'UNI/USD', label: 'Uniswap (UNI/USD)' },
    { value: 'LINK/USD', label: 'Chainlink (LINK/USD)' },
    { value: 'XLM/USD', label: 'Stellar (XLM/USD)' },
    { value: 'ATOM/USD', label: 'Cosmos (ATOM/USD)' },
    { value: 'ETC/USD', label: 'Ethereum Classic (ETC/USD)' },
    { value: 'FIL/USD', label: 'Filecoin (FIL/USD)' },
    { value: 'VET/USD', label: 'VeChain (VET/USD)' },
    { value: 'NEAR/USD', label: 'NEAR Protocol (NEAR/USD)' },
    { value: 'ALGO/USD', label: 'Algorand (ALGO/USD)' },
    { value: 'FTM/USD', label: 'Fantom (FTM/USD)' },
    { value: 'XTZ/USD', label: 'Tezos (XTZ/USD)' },
    { value: 'SAND/USD', label: 'The Sandbox (SAND/USD)' },
    { value: 'MANA/USD', label: 'Decentraland (MANA/USD)' },
    { value: 'FLOW/USD', label: 'Flow (FLOW/USD)' },
    { value: 'ICP/USD', label: 'Internet Computer (ICP/USD)' },
    { value: 'HBAR/USD', label: 'Hedera (HBAR/USD)' },
    { value: 'THETA/USD', label: 'Theta Network (THETA/USD)' },
    { value: 'APE/USD', label: 'ApeCoin (APE/USD)' },
    { value: 'CRO/USD', label: 'Cronos (CRO/USD)' },
    { value: 'QNT/USD', label: 'Quant (QNT/USD)' }
  ],
  commodities: [
    // Precious Metals
    { value: 'XAU/USD', label: 'Gold (XAU/USD)' },
    { value: 'XAG/USD', label: 'Silver (XAG/USD)' },
    { value: 'XPT/USD', label: 'Platinum (XPT/USD)' },
    { value: 'XPD/USD', label: 'Palladium (XPD/USD)' },
    
    // Energy
    { value: 'CL/USD', label: 'Crude Oil WTI (CL/USD)' },
    { value: 'BZ/USD', label: 'Brent Crude Oil (BZ/USD)' },
    { value: 'NG/USD', label: 'Natural Gas (NG/USD)' },
    { value: 'HO/USD', label: 'Heating Oil (HO/USD)' },
    { value: 'RB/USD', label: 'Gasoline (RB/USD)' },
    
    // Agricultural
    { value: 'ZS/USD', label: 'Soybeans (ZS/USD)' },
    { value: 'ZC/USD', label: 'Corn (ZC/USD)' },
    { value: 'ZW/USD', label: 'Wheat (ZW/USD)' },
    { value: 'KC/USD', label: 'Coffee (KC/USD)' },
    { value: 'SB/USD', label: 'Sugar (SB/USD)' },
    { value: 'CC/USD', label: 'Cocoa (CC/USD)' },
    { value: 'CT/USD', label: 'Cotton (CT/USD)' },
    { value: 'LC/USD', label: 'Live Cattle (LC/USD)' },
    { value: 'LH/USD', label: 'Lean Hogs (LH/USD)' },
    
    // Industrial Metals
    { value: 'HG/USD', label: 'Copper (HG/USD)' },
    { value: 'ZN/USD', label: 'Zinc (ZN/USD)' },
    { value: 'AL/USD', label: 'Aluminum (AL/USD)' },
    { value: 'NI/USD', label: 'Nickel (NI/USD)' },
    { value: 'PB/USD', label: 'Lead (PB/USD)' }
  ],
  indices: [
    // US Indices
    { value: 'SPX500', label: 'S&P 500 (SPX500)' },
    { value: 'NAS100', label: 'NASDAQ 100 (NAS100)' },
    { value: 'DJI30', label: 'Dow Jones Industrial Average (DJI30)' },
    { value: 'RUT2000', label: 'Russell 2000 (RUT2000)' },
    { value: 'VIX', label: 'VIX Volatility Index (VIX)' },
    
    // European Indices
    { value: 'FTSE100', label: 'FTSE 100 (FTSE100)' },
    { value: 'DAX40', label: 'DAX 40 (DAX40)' },
    { value: 'CAC40', label: 'CAC 40 (CAC40)' },
    { value: 'SMI20', label: 'SMI 20 (SMI20)' },
    { value: 'IBEX35', label: 'IBEX 35 (IBEX35)' },
    { value: 'MIB40', label: 'FTSE MIB (MIB40)' },
    { value: 'AEX25', label: 'AEX 25 (AEX25)' },
    { value: 'BEL20', label: 'BEL 20 (BEL20)' },
    { value: 'OMXS30', label: 'OMX Stockholm 30 (OMXS30)' },
    { value: 'OBX25', label: 'OBX 25 (OBX25)' },
    
    // Asian Indices
    { value: 'N225', label: 'Nikkei 225 (N225)' },
    { value: 'HSI', label: 'Hang Seng Index (HSI)' },
    { value: 'CSI300', label: 'CSI 300 (CSI300)' },
    { value: 'ASX200', label: 'ASX 200 (ASX200)' },
    { value: 'KOSPI', label: 'KOSPI (KOSPI)' },
    { value: 'SET50', label: 'SET 50 (SET50)' },
    { value: 'SENSEX', label: 'BSE Sensex (SENSEX)' },
    { value: 'NIFTY50', label: 'Nifty 50 (NIFTY50)' },
    
    // Other Regional Indices
    { value: 'BOVESPA', label: 'Bovespa (BOVESPA)' },
    { value: 'MEX35', label: 'IPC Mexico (MEX35)' },
    { value: 'TSX60', label: 'S&P/TSX 60 (TSX60)' },
    { value: 'JSE40', label: 'FTSE/JSE Top 40 (JSE40)' }
  ],
  bonds: [
    // US Government Bonds
    { value: 'US02Y', label: 'US 2-Year Treasury Note (US02Y)' },
    { value: 'US05Y', label: 'US 5-Year Treasury Note (US05Y)' },
    { value: 'US10Y', label: 'US 10-Year Treasury Note (US10Y)' },
    { value: 'US30Y', label: 'US 30-Year Treasury Bond (US30Y)' },
    
    // European Government Bonds
    { value: 'DE02Y', label: 'German 2-Year Bund (DE02Y)' },
    { value: 'DE10Y', label: 'German 10-Year Bund (DE10Y)' },
    { value: 'DE30Y', label: 'German 30-Year Bund (DE30Y)' },
    { value: 'UK02Y', label: 'UK 2-Year Gilt (UK02Y)' },
    { value: 'UK10Y', label: 'UK 10-Year Gilt (UK10Y)' },
    { value: 'UK30Y', label: 'UK 30-Year Gilt (UK30Y)' },
    { value: 'FR10Y', label: 'French 10-Year OAT (FR10Y)' },
    { value: 'IT10Y', label: 'Italian 10-Year BTP (IT10Y)' },
    { value: 'ES10Y', label: 'Spanish 10-Year Bond (ES10Y)' },
    
    // Other Government Bonds
    { value: 'JP02Y', label: 'Japan 2-Year Bond (JP02Y)' },
    { value: 'JP10Y', label: 'Japan 10-Year Bond (JP10Y)' },
    { value: 'AU02Y', label: 'Australia 2-Year Bond (AU02Y)' },
    { value: 'AU10Y', label: 'Australia 10-Year Bond (AU10Y)' },
    { value: 'CA02Y', label: 'Canada 2-Year Bond (CA02Y)' },
    { value: 'CA10Y', label: 'Canada 10-Year Bond (CA10Y)' }
  ],
  etfs: [
    // Broad Market ETFs
    { value: 'SPY', label: 'SPDR S&P 500 ETF (SPY)' },
    { value: 'QQQ', label: 'Invesco QQQ Trust (QQQ)' },
    { value: 'IWM', label: 'iShares Russell 2000 ETF (IWM)' },
    { value: 'VTI', label: 'Vanguard Total Stock Market ETF (VTI)' },
    { value: 'VOO', label: 'Vanguard S&P 500 ETF (VOO)' },
    
    // Sector ETFs
    { value: 'XLF', label: 'Financial Select Sector SPDR Fund (XLF)' },
    { value: 'XLK', label: 'Technology Select Sector SPDR Fund (XLK)' },
    { value: 'XLE', label: 'Energy Select Sector SPDR Fund (XLE)' },
    { value: 'XLV', label: 'Health Care Select Sector SPDR Fund (XLV)' },
    { value: 'XLI', label: 'Industrial Select Sector SPDR Fund (XLI)' },
    { value: 'XLP', label: 'Consumer Staples Select Sector SPDR Fund (XLP)' },
    { value: 'XLY', label: 'Consumer Discretionary Select Sector SPDR Fund (XLY)' },
    { value: 'XLU', label: 'Utilities Select Sector SPDR Fund (XLU)' },
    { value: 'XLB', label: 'Materials Select Sector SPDR Fund (XLB)' },
    { value: 'XLRE', label: 'Real Estate Select Sector SPDR Fund (XLRE)' },
    
    // International ETFs
    { value: 'EFA', label: 'iShares MSCI EAFE ETF (EFA)' },
    { value: 'EEM', label: 'iShares MSCI Emerging Markets ETF (EEM)' },
    { value: 'VEA', label: 'Vanguard FTSE Developed Markets ETF (VEA)' },
    { value: 'VWO', label: 'Vanguard FTSE Emerging Markets ETF (VWO)' },
    { value: 'FXI', label: 'iShares China Large-Cap ETF (FXI)' },
    { value: 'EWJ', label: 'iShares MSCI Japan ETF (EWJ)' },
    { value: 'EWZ', label: 'iShares MSCI Brazil ETF (EWZ)' },
    { value: 'INDA', label: 'iShares MSCI India ETF (INDA)' },
    
    // Bond ETFs
    { value: 'TLT', label: 'iShares 20+ Year Treasury Bond ETF (TLT)' },
    { value: 'IEF', label: 'iShares 7-10 Year Treasury Bond ETF (IEF)' },
    { value: 'AGG', label: 'iShares Core US Aggregate Bond ETF (AGG)' },
    { value: 'BND', label: 'Vanguard Total Bond Market ETF (BND)' },
    { value: 'HYG', label: 'iShares iBoxx High Yield Corporate Bond ETF (HYG)' },
    { value: 'LQD', label: 'iShares iBoxx Investment Grade Corporate Bond ETF (LQD)' },
    
    // Commodity ETFs
    { value: 'GLD', label: 'SPDR Gold Shares (GLD)' },
    { value: 'SLV', label: 'iShares Silver Trust (SLV)' },
    { value: 'USO', label: 'United States Oil Fund (USO)' },
    { value: 'UNG', label: 'United States Natural Gas Fund (UNG)' },
    { value: 'DBA', label: 'Invesco DB Agriculture Fund (DBA)' },
    
    // Currency ETFs
    { value: 'UUP', label: 'Invesco DB US Dollar Index Bullish Fund (UUP)' },
    { value: 'FXE', label: 'Invesco CurrencyShares Euro Trust (FXE)' },
    { value: 'FXY', label: 'Invesco CurrencyShares Japanese Yen Trust (FXY)' },
    { value: 'FXB', label: 'Invesco CurrencyShares British Pound Sterling Trust (FXB)' }
  ],
  futures: [
    // Equity Index Futures
    { value: 'ES', label: 'E-mini S&P 500 (ES)' },
    { value: 'NQ', label: 'E-mini NASDAQ-100 (NQ)' },
    { value: 'YM', label: 'E-mini Dow Jones (YM)' },
    { value: 'RTY', label: 'E-mini Russell 2000 (RTY)' },
    
    // Currency Futures
    { value: '6E', label: 'Euro FX (6E)' },
    { value: '6B', label: 'British Pound (6B)' },
    { value: '6J', label: 'Japanese Yen (6J)' },
    { value: '6A', label: 'Australian Dollar (6A)' },
    { value: '6C', label: 'Canadian Dollar (6C)' },
    { value: '6S', label: 'Swiss Franc (6S)' },
    
    // Interest Rate Futures
    { value: 'ZN', label: '10-Year T-Note (ZN)' },
    { value: 'ZB', label: '30-Year T-Bond (ZB)' },
    { value: 'ZF', label: '5-Year T-Note (ZF)' },
    { value: 'ZT', label: '2-Year T-Note (ZT)' },
    
    // Energy Futures
    { value: 'CL', label: 'Crude Oil (CL)' },
    { value: 'NG', label: 'Natural Gas (NG)' },
    { value: 'HO', label: 'Heating Oil (HO)' },
    { value: 'RB', label: 'RBOB Gasoline (RB)' },
    
    // Metal Futures
    { value: 'GC', label: 'Gold (GC)' },
    { value: 'SI', label: 'Silver (SI)' },
    { value: 'HG', label: 'Copper (HG)' },
    { value: 'PL', label: 'Platinum (PL)' },
    { value: 'PA', label: 'Palladium (PA)' },
    
    // Agricultural Futures
    { value: 'ZS', label: 'Soybeans (ZS)' },
    { value: 'ZC', label: 'Corn (ZC)' },
    { value: 'ZW', label: 'Wheat (ZW)' },
    { value: 'KC', label: 'Coffee (KC)' },
    { value: 'SB', label: 'Sugar #11 (SB)' },
    { value: 'CC', label: 'Cocoa (CC)' },
    { value: 'CT', label: 'Cotton (CT)' },
    { value: 'LC', label: 'Live Cattle (LC)' },
    { value: 'LH', label: 'Lean Hogs (LH)' }
  ],
  options: [
    // Major Stock Options
    { value: 'AAPL_OPTIONS', label: 'Apple Options (AAPL)' },
    { value: 'MSFT_OPTIONS', label: 'Microsoft Options (MSFT)' },
    { value: 'TSLA_OPTIONS', label: 'Tesla Options (TSLA)' },
    { value: 'NVDA_OPTIONS', label: 'NVIDIA Options (NVDA)' },
    { value: 'SPY_OPTIONS', label: 'SPDR S&P 500 ETF Options (SPY)' },
    { value: 'QQQ_OPTIONS', label: 'Invesco QQQ Trust Options (QQQ)' },
    { value: 'IWM_OPTIONS', label: 'iShares Russell 2000 ETF Options (IWM)' },
    
    // Index Options
    { value: 'SPX_OPTIONS', label: 'S&P 500 Index Options (SPX)' },
    { value: 'NDX_OPTIONS', label: 'NASDAQ-100 Index Options (NDX)' },
    { value: 'RUT_OPTIONS', label: 'Russell 2000 Index Options (RUT)' },
    { value: 'VIX_OPTIONS', label: 'VIX Options (VIX)' }
  ],
  reits: [
    // Retail REITs
    { value: 'SPG', label: 'Simon Property Group (SPG)' },
    { value: 'O', label: 'Realty Income Corporation (O)' },
    { value: 'REG', label: 'Regency Centers Corporation (REG)' },
    { value: 'FRT', label: 'Federal Realty Investment Trust (FRT)' },
    
    // Residential REITs
    { value: 'EXR', label: 'Extended Stay America (EXR)' },
    { value: 'AVB', label: 'AvalonBay Communities (AVB)' },
    { value: 'EQR', label: 'Equity Residential (EQR)' },
    { value: 'UDR', label: 'UDR Inc. (UDR)' },
    
    // Healthcare REITs
    { value: 'WELL', label: 'Welltower Inc. (WELL)' },
    { value: 'VTR', label: 'Ventas Inc. (VTR)' },
    { value: 'HCP', label: 'Healthpeak Properties (HCP)' },
    
    // Office REITs
    { value: 'BXP', label: 'Boston Properties (BXP)' },
    { value: 'VNO', label: 'Vornado Realty Trust (VNO)' },
    { value: 'SLG', label: 'SL Green Realty Corp. (SLG)' }
  ],
  alternatives: [
    // Private Equity & Venture Capital
    { value: 'BX', label: 'Blackstone Inc. (BX)' },
    { value: 'KKR', label: 'KKR & Co. Inc. (KKR)' },
    { value: 'APO', label: 'Apollo Global Management (APO)' },
    { value: 'CG', label: 'Carlyle Group (CG)' },
    
    // Hedge Fund Proxies
    { value: 'GBTC', label: 'Grayscale Bitcoin Trust (GBTC)' },
    { value: 'ETHE', label: 'Grayscale Ethereum Trust (ETHE)' },
    
    // Infrastructure & Utilities
    { value: 'AMT', label: 'American Tower Corporation (AMT)' },
    { value: 'CCI', label: 'Crown Castle International (CCI)' },
    { value: 'SBAC', label: 'SBA Communications (SBAC)' },
    
    // Collectibles & Art (Tokenized)
    { value: 'MASTERWORKS', label: 'Masterworks Art Investment' },
    { value: 'RALLY', label: 'Rally Alternative Assets' }
  ],
  emerging: [
    // NFTs & Digital Assets
    { value: 'NFT_INDEX', label: 'NFT Index' },
    { value: 'METAVERSE_INDEX', label: 'Metaverse Index' },
    
    // DeFi Tokens
    { value: 'COMP/USD', label: 'Compound (COMP/USD)' },
    { value: 'AAVE/USD', label: 'Aave (AAVE/USD)' },
    { value: 'MKR/USD', label: 'Maker (MKR/USD)' },
    { value: 'CRV/USD', label: 'Curve DAO Token (CRV/USD)' },
    { value: 'SUSHI/USD', label: 'SushiSwap (SUSHI/USD)' },
    
    // Layer 2 & Infrastructure
    { value: 'LRC/USD', label: 'Loopring (LRC/USD)' },
    { value: 'IMX/USD', label: 'Immutable X (IMX/USD)' },
    { value: 'RNDR/USD', label: 'Render Token (RNDR/USD)' },
    
    // Carbon Credits & ESG
    { value: 'CARBON_CREDITS', label: 'Carbon Credits Index' },
    { value: 'ESG_INDEX', label: 'ESG Investment Index' },
    
    // Prediction Markets
    { value: 'AUGUR', label: 'Augur Prediction Markets' },
    { value: 'POLYMARKET', label: 'Polymarket' }
  ]
};

// Export both ASSETS and MARKET_ASSETS for compatibility
export const MARKET_ASSETS = ASSETS;

export const MARKET_CATEGORIES = [
  { value: 'forex', label: 'Forex', icon: '💱', description: 'Currency pairs and foreign exchange markets' },
  { value: 'stocks', label: 'Stocks', icon: '📈', description: 'Individual company stocks and equities' },
  { value: 'crypto', label: 'Cryptocurrency', icon: '₿', description: 'Digital currencies and crypto assets' },
  { value: 'commodities', label: 'Commodities', icon: '🛢️', description: 'Precious metals, energy, and agricultural products' },
  { value: 'indices', label: 'Indices', icon: '📊', description: 'Stock market indices and benchmarks' },
  { value: 'bonds', label: 'Bonds', icon: '🏛️', description: 'Government and corporate bonds' },
  { value: 'etfs', label: 'ETFs', icon: '🗂️', description: 'Exchange-traded funds' },
  { value: 'futures', label: 'Futures', icon: '⏳', description: 'Futures contracts and derivatives' },
  { value: 'options', label: 'Options', icon: '🎯', description: 'Options contracts and derivatives' },
  { value: 'reits', label: 'REITs', icon: '🏢', description: 'Real Estate Investment Trusts' },
  { value: 'alternatives', label: 'Alternatives', icon: '🔮', description: 'Alternative investments and assets' },
  { value: 'emerging', label: 'Emerging Markets', icon: '🌱', description: 'New and emerging asset classes' }
];
