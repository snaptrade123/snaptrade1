import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, TrendingUp, BarChart3, LineChart, ArrowRight, BookText, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

// Tutorial categories and their content
const tutorials = {
  basics: [
    {
      id: "intro-trading",
      title: "Introduction to Trading",
      description: "Learn the fundamentals of financial markets and trading",
      duration: "20 min",
      level: "Beginner",
      image: "/images/tutorials/intro-trading.jpg",
      content: `
        <h2>Introduction to Trading</h2>
        <p>Trading is the process of buying and selling financial instruments such as stocks, bonds, currencies, and derivatives with the goal of generating returns that outperform buy-and-hold investing.</p>
        <p>In this tutorial, we'll cover the basic concepts of trading, different market types, and how to get started.</p>
        
        <h3>Key Trading Concepts</h3>
        <ul>
          <li><strong>Market Orders:</strong> Orders to buy or sell at the current market price</li>
          <li><strong>Limit Orders:</strong> Orders to buy or sell at a specified price or better</li>
          <li><strong>Stop Orders:</strong> Orders that become market orders when a specified price is reached</li>
          <li><strong>Risk Management:</strong> Techniques to protect your capital</li>
        </ul>
        
        <h3>Different Market Types</h3>
        <p>Trading occurs across various markets:</p>
        <ul>
          <li><strong>Stock Market:</strong> Trading shares of publicly-listed companies</li>
          <li><strong>Forex Market:</strong> Trading one currency against another</li>
          <li><strong>Cryptocurrency Market:</strong> Trading digital currencies</li>
          <li><strong>Futures Market:</strong> Trading contracts for future delivery</li>
          <li><strong>Options Market:</strong> Trading contracts that give the right to buy or sell assets</li>
        </ul>
      `
    },
    {
      id: "market-structure",
      title: "Understanding Market Structure",
      description: "Learn how markets are organized and how prices move",
      duration: "25 min",
      level: "Beginner",
      image: "/images/tutorials/market-structure.jpg",
      content: `
        <h2>Understanding Market Structure</h2>
        <p>Market structure refers to the organization of a market, including the number of firms, their market share, and the level of competition.</p>
        <p>This tutorial explores how financial markets are structured and how this affects trading.</p>
        
        <h3>Market Participants</h3>
        <ul>
          <li><strong>Retail Traders:</strong> Individual traders who trade with their own money</li>
          <li><strong>Institutional Investors:</strong> Large organizations like pension funds, hedge funds, and banks</li>
          <li><strong>Market Makers:</strong> Firms that provide liquidity by being willing to buy and sell securities</li>
          <li><strong>Brokers:</strong> Intermediaries that execute trades for clients</li>
        </ul>
        
        <h3>Price Formation</h3>
        <p>Prices in financial markets are determined by supply and demand. When more people want to buy than sell, prices rise. When more people want to sell than buy, prices fall.</p>
        
        <h3>Order Flow</h3>
        <p>Order flow represents the buying and selling pressure in a market. Analyzing order flow can provide insights into potential price movements.</p>
      `
    },
    {
      id: "risk-management",
      title: "Risk Management Essentials",
      description: "Learn how to protect your capital and manage risk effectively",
      duration: "30 min",
      level: "Beginner",
      image: "/images/tutorials/risk-management.jpg",
      content: `
        <h2>Risk Management Essentials</h2>
        <p>Risk management is the process of identifying, analyzing, and accepting or mitigating uncertainty in investment decisions.</p>
        <p>This tutorial covers the essential risk management techniques every trader should know.</p>
        
        <h3>Position Sizing</h3>
        <p>Position sizing refers to determining how much of your capital to risk on each trade. A common rule is to risk no more than 1-2% of your trading capital on a single trade.</p>
        
        <h3>Stop Loss Orders</h3>
        <p>A stop loss order is designed to limit an investor's loss on a position. It's placed at a specific price level and automatically closes the trade if the market moves against you.</p>
        
        <h3>Risk-Reward Ratio</h3>
        <p>The risk-reward ratio compares the potential profit to the potential loss of a trade. A favorable risk-reward ratio is typically 1:2 or higher, meaning you're aiming to make at least twice what you're risking.</p>
        
        <h3>Diversification</h3>
        <p>Diversification involves spreading your capital across different assets or markets to reduce overall risk.</p>
      `
    }
  ],
  technical: [
    {
      id: "chart-patterns",
      title: "Essential Chart Patterns",
      description: "Master the most important chart patterns for trading",
      duration: "35 min",
      level: "Intermediate",
      image: "/images/tutorials/chart-patterns.jpg",
      content: `
        <h2>Essential Chart Patterns</h2>
        <p>Chart patterns are specific formations that appear on price charts and can signal potential continuation or reversal of a trend.</p>
        <p>This tutorial covers the most important chart patterns you should know.</p>
        
        <h3>Reversal Patterns</h3>
        <ul>
          <li><strong>Head and Shoulders:</strong> A bearish reversal pattern consisting of three peaks, with the middle peak (the head) being the highest</li>
          <li><strong>Double Top/Bottom:</strong> A reversal pattern that shows two peaks or troughs at approximately the same price level</li>
          <li><strong>Rounding Bottom:</strong> A bullish reversal pattern that signals a long-term change from a downtrend to an uptrend</li>
        </ul>
        
        <h3>Continuation Patterns</h3>
        <ul>
          <li><strong>Flags and Pennants:</strong> Short-term consolidation patterns that typically appear in strong trends</li>
          <li><strong>Triangles:</strong> Patterns formed by converging trendlines, including ascending, descending, and symmetrical triangles</li>
          <li><strong>Rectangles:</strong> Patterns formed by parallel support and resistance lines, indicating a period of consolidation</li>
        </ul>
        
        <h3>Identifying and Trading Patterns</h3>
        <p>Successfully trading chart patterns requires understanding their formation, confirmation signals, and potential targets.</p>
      `
    },
    {
      id: "technical-indicators",
      title: "Technical Indicators",
      description: "Learn how to use popular technical indicators in your trading",
      duration: "40 min",
      level: "Intermediate",
      image: "/images/tutorials/technical-indicators.jpg",
      content: `
        <h2>Technical Indicators</h2>
        <p>Technical indicators are mathematical calculations based on price, volume, or open interest of a security.</p>
        <p>This tutorial explores the most useful technical indicators and how to apply them in your trading.</p>
        
        <h3>Trend Indicators</h3>
        <ul>
          <li><strong>Moving Averages:</strong> Simple and exponential moving averages help identify trends and potential support/resistance levels</li>
          <li><strong>MACD (Moving Average Convergence Divergence):</strong> Shows the relationship between two moving averages of a security's price</li>
          <li><strong>ADX (Average Directional Index):</strong> Measures the strength of a trend</li>
        </ul>
        
        <h3>Momentum Indicators</h3>
        <ul>
          <li><strong>RSI (Relative Strength Index):</strong> Measures the speed and change of price movements on a scale from 0 to 100</li>
          <li><strong>Stochastic Oscillator:</strong> Compares a security's closing price to its price range over a specific time period</li>
          <li><strong>CCI (Commodity Channel Index):</strong> Identifies cyclical trends in a security's price</li>
        </ul>
        
        <h3>Volume Indicators</h3>
        <ul>
          <li><strong>OBV (On-Balance Volume):</strong> Uses volume flow to predict changes in stock price</li>
          <li><strong>Volume Profile:</strong> Shows trading activity at specific price levels</li>
        </ul>
      `
    },
    {
      id: "price-action",
      title: "Price Action Trading",
      description: "Master the art of trading based on price movement without indicators",
      duration: "45 min",
      level: "Advanced",
      image: "/images/tutorials/price-action.jpg",
      content: `
        <h2>Price Action Trading</h2>
        <p>Price action trading focuses on analyzing the movements of price on a chart without using indicators or other technical tools.</p>
        <p>This tutorial explores pure price action trading techniques and strategies.</p>
        
        <h3>Candlestick Patterns</h3>
        <p>Candlestick patterns provide insights into market psychology and potential price movements:</p>
        <ul>
          <li><strong>Doji:</strong> Shows market indecision</li>
          <li><strong>Hammer and Hanging Man:</strong> Potential reversal patterns</li>
          <li><strong>Engulfing Patterns:</strong> Strong reversal signals</li>
          <li><strong>Pin Bars:</strong> Rejection of certain price levels</li>
        </ul>
        
        <h3>Support and Resistance</h3>
        <p>Support is a price level where a downtrend can be expected to pause due to buying interest. Resistance is a price level where an uptrend can be expected to pause due to selling interest.</p>
        
        <h3>Market Structure</h3>
        <p>Analyzing market structure involves identifying higher highs and higher lows in an uptrend, or lower highs and lower lows in a downtrend.</p>
        
        <h3>Order Blocks</h3>
        <p>Order blocks are areas on a chart where institutional orders are placed. These can act as strong support or resistance levels.</p>
      `
    }
  ],
  strategy: [
    {
      id: "day-trading",
      title: "Day Trading Strategies",
      description: "Learn profitable day trading strategies for short-term markets",
      duration: "50 min",
      level: "Intermediate",
      image: "/images/tutorials/day-trading.jpg",
      content: `
        <h2>Day Trading Strategies</h2>
        <p>Day trading involves opening and closing positions within the same trading day, never holding positions overnight.</p>
        <p>This tutorial covers effective day trading strategies and techniques.</p>
        
        <h3>Scalping</h3>
        <p>Scalping involves making multiple trades throughout the day, aiming to profit from small price movements.</p>
        <ul>
          <li>Typically uses 1-5 minute charts</li>
          <li>Focuses on high-liquidity markets</li>
          <li>Requires strict risk management due to high frequency of trades</li>
        </ul>
        
        <h3>Momentum Trading</h3>
        <p>Momentum trading involves identifying and trading in the direction of strong price moves.</p>
        <ul>
          <li>Looks for stocks or assets with significant news catalysts</li>
          <li>Uses volume and price action to confirm momentum</li>
          <li>Sets profit targets based on previous support/resistance levels</li>
        </ul>
        
        <h3>Breakout Trading</h3>
        <p>Breakout trading involves entering positions when price breaks through established support or resistance levels.</p>
        <ul>
          <li>Identifies key levels using price patterns or indicators</li>
          <li>Confirms breakouts with increased volume</li>
          <li>Sets stop losses below the breakout level (for long positions)</li>
        </ul>
      `
    },
    {
      id: "swing-trading",
      title: "Swing Trading Mastery",
      description: "Discover how to capture moves that last several days to weeks",
      duration: "45 min",
      level: "Intermediate",
      image: "/images/tutorials/swing-trading.jpg",
      content: `
        <h2>Swing Trading Mastery</h2>
        <p>Swing trading aims to capture short to medium-term gains in a stock or financial instrument over a period of days to weeks.</p>
        <p>This tutorial covers swing trading methods and best practices.</p>
        
        <h3>Market Environment Assessment</h3>
        <p>Understanding the broader market environment is crucial for swing trading success.</p>
        <ul>
          <li>Analyze market indices for overall direction</li>
          <li>Identify sector rotation and strength</li>
          <li>Evaluate market sentiment indicators</li>
        </ul>
        
        <h3>Entry Strategies</h3>
        <p>Effective swing trading requires precise entry timing.</p>
        <ul>
          <li>Enter on pullbacks in uptrends</li>
          <li>Enter on bounces in downtrends</li>
          <li>Use multiple timeframe analysis to refine entries</li>
        </ul>
        
        <h3>Exit Strategies</h3>
        <p>Having clear exit strategies is essential for consistent profits.</p>
        <ul>
          <li>Set target prices based on previous swing points</li>
          <li>Use trailing stops to lock in profits</li>
          <li>Consider partial position exits to manage risk</li>
        </ul>
      `
    },
    {
      id: "position-trading",
      title: "Position Trading",
      description: "Learn how to hold positions for extended periods to capture major moves",
      duration: "40 min",
      level: "Advanced",
      image: "/images/tutorials/position-trading.jpg",
      content: `
        <h2>Position Trading</h2>
        <p>Position trading involves holding trades for extended periods, from several months to years, to capture significant market moves.</p>
        <p>This tutorial explores position trading techniques and approaches.</p>
        
        <h3>Trend Identification</h3>
        <p>Position trading primarily focuses on identifying and trading with long-term trends.</p>
        <ul>
          <li>Use weekly and monthly charts for analysis</li>
          <li>Identify secular trends using moving averages</li>
          <li>Consider fundamental factors driving long-term trends</li>
        </ul>
        
        <h3>Position Sizing and Risk Management</h3>
        <p>Due to the longer timeframe, position traders must adapt their risk management approach.</p>
        <ul>
          <li>Use wider stop losses based on weekly volatility</li>
          <li>Consider smaller position sizes due to larger stop distances</li>
          <li>Implement portfolio-level risk management</li>
        </ul>
        
        <h3>Fundamental Analysis Integration</h3>
        <p>Position trading often combines technical and fundamental analysis.</p>
        <ul>
          <li>Analyze industry trends and market cycles</li>
          <li>Evaluate earnings growth and financial health</li>
          <li>Consider macroeconomic factors influencing the market</li>
        </ul>
      `
    }
  ],
  psychology: [
    {
      id: "trading-psychology",
      title: "Trading Psychology Fundamentals",
      description: "Master your mind to improve your trading results",
      duration: "35 min",
      level: "All Levels",
      image: "/images/tutorials/trading-psychology.jpg",
      content: `
        <h2>Trading Psychology Fundamentals</h2>
        <p>Trading psychology refers to the emotions and mental state that influence trading decisions.</p>
        <p>This tutorial explores the psychological aspects of trading and how to develop the right mindset.</p>
        
        <h3>Common Psychological Challenges</h3>
        <ul>
          <li><strong>Fear:</strong> Can prevent entering good trades or cause premature exits</li>
          <li><strong>Greed:</strong> Can lead to excessive risk-taking or holding positions too long</li>
          <li><strong>Revenge Trading:</strong> Attempting to recover losses by taking additional risks</li>
          <li><strong>Overconfidence:</strong> Taking excessive risks after a series of winning trades</li>
        </ul>
        
        <h3>Developing Discipline</h3>
        <p>Trading discipline involves strictly following your trading plan and strategy, regardless of emotions.</p>
        <ul>
          <li>Create and follow a detailed trading plan</li>
          <li>Use checklists for entries and exits</li>
          <li>Review trades objectively to reinforce discipline</li>
        </ul>
        
        <h3>Maintaining Emotional Balance</h3>
        <p>Emotional stability is crucial for consistent trading performance.</p>
        <ul>
          <li>Practice mindfulness and self-awareness</li>
          <li>Develop routines to maintain mental clarity</li>
          <li>Implement stress management techniques</li>
        </ul>
      `
    },
    {
      id: "overcoming-bias",
      title: "Overcoming Trading Biases",
      description: "Identify and eliminate psychological biases affecting your trading",
      duration: "40 min",
      level: "Intermediate",
      image: "/images/tutorials/overcoming-bias.jpg",
      content: `
        <h2>Overcoming Trading Biases</h2>
        <p>Cognitive biases are systematic patterns of deviation from norm or rationality in judgment that can negatively impact trading decisions.</p>
        <p>This tutorial helps you identify and overcome common trading biases.</p>
        
        <h3>Confirmation Bias</h3>
        <p>The tendency to search for information that confirms your existing beliefs while ignoring contradictory evidence.</p>
        <ul>
          <li>Actively seek out information that contradicts your trading thesis</li>
          <li>Consider alternative scenarios before entering trades</li>
          <li>Regularly review and update your market assumptions</li>
        </ul>
        
        <h3>Loss Aversion</h3>
        <p>The tendency to prefer avoiding losses over acquiring equivalent gains.</p>
        <ul>
          <li>Focus on the expected value of trades rather than individual outcomes</li>
          <li>Use pre-determined stop losses to remove emotional decision-making</li>
          <li>View losses as a normal part of the trading process</li>
        </ul>
        
        <h3>Recency Bias</h3>
        <p>The tendency to place too much importance on recent events and overlook historical patterns.</p>
        <ul>
          <li>Maintain a trading journal to track performance over time</li>
          <li>Study market history to understand long-term patterns</li>
          <li>Use objective criteria for trade decisions rather than recent results</li>
        </ul>
      `
    }
  ]
};

export default function TradingTutorials() {
  const [selectedCategory, setSelectedCategory] = useState("basics");
  const [selectedTutorial, setSelectedTutorial] = useState<string | null>(null);
  
  const tutorialData = tutorials[selectedCategory as keyof typeof tutorials];
  const currentTutorial = selectedTutorial 
    ? tutorialData.find(t => t.id === selectedTutorial) 
    : null;

  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Trading Tutorials</h1>
        <p className="text-xl text-muted-foreground">
          Comprehensive guides to help you master trading techniques and strategies
        </p>
      </div>

      <Tabs defaultValue="basics" className="w-full" onValueChange={value => {
        setSelectedCategory(value);
        setSelectedTutorial(null);
      }}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8">
          <TabsTrigger value="basics" className="flex items-center">
            <BookOpen className="h-4 w-4 mr-2" />
            <span>Basics</span>
          </TabsTrigger>
          <TabsTrigger value="technical" className="flex items-center">
            <LineChart className="h-4 w-4 mr-2" />
            <span>Technical Analysis</span>
          </TabsTrigger>
          <TabsTrigger value="strategy" className="flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            <span>Strategies</span>
          </TabsTrigger>
          <TabsTrigger value="psychology" className="flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            <span>Psychology</span>
          </TabsTrigger>
        </TabsList>
        
        {Object.keys(tutorials).map((category) => (
          <TabsContent key={category} value={category} className="space-y-6">
            {selectedTutorial ? (
              <div className="space-y-4">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedTutorial(null)}
                  className="mb-4"
                >
                  Back to List
                </Button>
                
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-2xl">{currentTutorial?.title}</CardTitle>
                        <CardDescription className="mt-2">{currentTutorial?.description}</CardDescription>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{currentTutorial?.duration}</span>
                        <span className="mx-2">•</span>
                        <span>{currentTutorial?.level}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="prose dark:prose-invert max-w-none" 
                      dangerouslySetInnerHTML={{ __html: currentTutorial?.content || "" }}
                    />
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tutorials[category as keyof typeof tutorials].map((tutorial) => (
                  <Card 
                    key={tutorial.id} 
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => setSelectedTutorial(tutorial.id)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle>{tutorial.title}</CardTitle>
                      <CardDescription>{tutorial.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{tutorial.duration}</span>
                        </div>
                        <div className="text-sm font-medium">{tutorial.level}</div>
                      </div>
                      <Button 
                        className="w-full mt-4" 
                        variant="secondary"
                        onClick={() => setSelectedTutorial(tutorial.id)}
                      >
                        Read Tutorial
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}