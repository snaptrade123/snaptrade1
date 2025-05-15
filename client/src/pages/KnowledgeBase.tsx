import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookMarked, SearchIcon, ChevronRight, Lightbulb, BookOpen, BarChart3, TrendingUp, PieChart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

// Knowledge base article categories
const categories = [
  {
    id: "chart-patterns",
    name: "Chart Patterns",
    icon: <BarChart3 className="h-4 w-4" />,
    description: "Detailed explanations of bullish and bearish chart patterns"
  },
  {
    id: "technical-indicators",
    name: "Technical Indicators",
    icon: <TrendingUp className="h-4 w-4" />,
    description: "In-depth guides to using technical indicators"
  },
  {
    id: "market-concepts",
    name: "Market Concepts",
    icon: <PieChart className="h-4 w-4" />,
    description: "Fundamental market concepts and theories"
  },
  {
    id: "trading-strategies",
    name: "Trading Strategies",
    icon: <Lightbulb className="h-4 w-4" />,
    description: "Proven trading strategies and techniques"
  },
  {
    id: "platform-guides",
    name: "Platform Guides",
    icon: <BookOpen className="h-4 w-4" />,
    description: "Guides for using SnapTrade and other platforms"
  }
];

// Knowledge base articles
const articles = [
  {
    id: "head-and-shoulders",
    title: "Head and Shoulders Pattern: Complete Guide",
    category: "chart-patterns",
    tags: ["reversal pattern", "technical analysis", "bearish"],
    dateUpdated: "May 1, 2024",
    excerpt: "Learn how to identify and trade the head and shoulders pattern, one of the most reliable reversal patterns in technical analysis.",
    content: `
      <h2>Head and Shoulders Pattern: Complete Guide</h2>
      
      <p>The head and shoulders pattern is one of the most popular and reliable reversal patterns in technical analysis. It typically forms at the end of an uptrend and signals a potential reversal to a downtrend.</p>
      
      <h3>Pattern Structure</h3>
      
      <p>The head and shoulders pattern consists of three peaks:</p>
      
      <ul>
        <li><strong>Left Shoulder:</strong> Forms during an uptrend and represents a new high followed by a pullback</li>
        <li><strong>Head:</strong> A higher peak than the left shoulder, followed by another pullback</li>
        <li><strong>Right Shoulder:</strong> A lower peak (similar height to the left shoulder), followed by a decline</li>
      </ul>
      
      <p>The "neckline" is a support line drawn by connecting the lows between the left shoulder and head, and the head and right shoulder.</p>
      
      <h3>Identification Criteria</h3>
      
      <ul>
        <li>The pattern should form after a significant uptrend</li>
        <li>The head should be the highest point in the pattern</li>
        <li>The shoulders should be lower than the head and roughly equal in height</li>
        <li>Volume typically decreases from the left shoulder to the head and right shoulder</li>
        <li>The pattern is confirmed when price breaks below the neckline</li>
      </ul>
      
      <h3>Trading the Pattern</h3>
      
      <p><strong>Entry:</strong> Enter a short position when price breaks below the neckline, preferably with increased volume</p>
      
      <p><strong>Stop Loss:</strong> Place a stop loss above the right shoulder</p>
      
      <p><strong>Target:</strong> The typical price target is the distance from the head to the neckline, projected downward from the neckline break point</p>
      
      <h3>Variations</h3>
      
      <p><strong>Inverse Head and Shoulders:</strong> This is the bullish version of the pattern, forming at the end of a downtrend. The structure is inverted (upside down) and signals a potential reversal to an uptrend.</p>
      
      <p><strong>Complex Head and Shoulders:</strong> These formations may have multiple shoulders on each side of the head.</p>
      
      <h3>Success Rate and Limitations</h3>
      
      <p>Studies have shown that the head and shoulders pattern has a success rate of approximately 70-75% when properly identified and traded. However, false breakouts can occur, especially in volatile markets.</p>
      
      <p>Always use this pattern in conjunction with other technical analysis tools and consider the broader market context.</p>
    `
  },
  {
    id: "fibonacci-retracement",
    title: "Fibonacci Retracement Levels Explained",
    category: "technical-indicators",
    tags: ["fibonacci", "support and resistance", "retracement"],
    dateUpdated: "April 20, 2024",
    excerpt: "Discover how to use Fibonacci retracement levels to identify potential support and resistance areas in trending markets.",
    content: `
      <h2>Fibonacci Retracement Levels Explained</h2>
      
      <p>Fibonacci retracement levels are horizontal lines that indicate potential support and resistance levels where price could reverse direction. These levels are based on the Fibonacci sequence and are used to identify potential reversal points during pullbacks in trending markets.</p>
      
      <h3>Understanding Fibonacci Numbers</h3>
      
      <p>The Fibonacci sequence is a series of numbers where each number is the sum of the two preceding ones: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, and so on.</p>
      
      <p>The Fibonacci retracement levels are derived from the ratios between these numbers and are typically set at 23.6%, 38.2%, 50%, 61.8%, and 78.6%. The 50% level is not actually a Fibonacci ratio but is included for its significance in market movements.</p>
      
      <h3>How to Draw Fibonacci Retracement Levels</h3>
      
      <ol>
        <li>Identify a clear uptrend or downtrend</li>
        <li>For an uptrend: Select the Fibonacci retracement tool and drag it from the significant low to the significant high</li>
        <li>For a downtrend: Drag from the significant high to the significant low</li>
        <li>The tool will automatically plot the retracement levels between these two points</li>
      </ol>
      
      <h3>Trading with Fibonacci Retracement Levels</h3>
      
      <p><strong>In Uptrends:</strong></p>
      <ul>
        <li>During pullbacks, watch for price to find support at these retracement levels</li>
        <li>Look for confirmation signals (candlestick patterns, RSI, etc.) at these levels before entering long positions</li>
        <li>Commonly, the 38.2% and 61.8% levels provide strong support in uptrends</li>
      </ul>
      
      <p><strong>In Downtrends:</strong></p>
      <ul>
        <li>During bounces, watch for price to find resistance at these retracement levels</li>
        <li>Look for confirmation signals before entering short positions</li>
        <li>The 38.2% and 61.8% levels often provide strong resistance in downtrends</li>
      </ul>
      
      <h3>Common Mistakes to Avoid</h3>
      
      <ul>
        <li>Relying solely on Fibonacci levels without confirmation from other indicators</li>
        <li>Drawing Fibonacci retracement levels on insignificant price movements</li>
        <li>Ignoring the broader market context and trend</li>
        <li>Not using proper stop loss orders when trading based on Fibonacci levels</li>
      </ul>
      
      <h3>Advanced Fibonacci Techniques</h3>
      
      <p><strong>Fibonacci Extensions:</strong> Used to project potential profit targets beyond the swing high or low</p>
      
      <p><strong>Fibonacci Fans and Arcs:</strong> These tools add a time element to the analysis</p>
      
      <p><strong>Multiple Timeframe Analysis:</strong> Combining Fibonacci retracement levels across different timeframes can identify especially strong support/resistance zones</p>
    `
  },
  {
    id: "market-structure",
    title: "Understanding Market Structure",
    category: "market-concepts",
    tags: ["market structure", "price action", "support and resistance"],
    dateUpdated: "April 15, 2024",
    excerpt: "Learn the fundamental concept of market structure and how to use it to identify trend changes and trading opportunities.",
    content: `
      <h2>Understanding Market Structure</h2>
      
      <p>Market structure refers to the arrangement of highs and lows on a price chart that help traders identify the current trend direction and potential reversal points. It is a foundational concept in technical analysis and price action trading.</p>
      
      <h3>Key Elements of Market Structure</h3>
      
      <p><strong>Higher Highs (HH) and Higher Lows (HL):</strong> In an uptrend, price creates successively higher swing highs and higher swing lows</p>
      
      <p><strong>Lower Highs (LH) and Lower Lows (LL):</strong> In a downtrend, price creates successively lower swing highs and lower swing lows</p>
      
      <p><strong>Equal Highs (EH) and Equal Lows (EL):</strong> These can indicate consolidation or a potential trend shift</p>
      
      <h3>Identifying Trend Direction Using Market Structure</h3>
      
      <ul>
        <li><strong>Uptrend:</strong> Series of HH and HL</li>
        <li><strong>Downtrend:</strong> Series of LH and LL</li>
        <li><strong>Consolidation/Range:</strong> Series of EH and EL</li>
      </ul>
      
      <h3>Market Structure Breaks</h3>
      
      <p>A market structure break (MSB) occurs when the established pattern of highs and lows changes, potentially signaling a shift in trend direction.</p>
      
      <ul>
        <li><strong>Bullish Market Structure Break:</strong> In a downtrend, when price creates a higher low followed by breaking above the previous high (LH), creating a higher high</li>
        <li><strong>Bearish Market Structure Break:</strong> In an uptrend, when price creates a lower high followed by breaking below the previous low (HL), creating a lower low</li>
      </ul>
      
      <h3>Trading Market Structure</h3>
      
      <p><strong>Trend Continuation:</strong></p>
      <ul>
        <li>In uptrends, look for buying opportunities at higher lows</li>
        <li>In downtrends, look for selling opportunities at lower highs</li>
        <li>Use previous swing points to set stop losses and targets</li>
      </ul>
      
      <p><strong>Trend Reversal:</strong></p>
      <ul>
        <li>Enter long positions after a bullish market structure break, with stops below the higher low</li>
        <li>Enter short positions after a bearish market structure break, with stops above the lower high</li>
      </ul>
      
      <h3>Order Blocks in Market Structure</h3>
      
      <p>Order blocks are areas on a chart where significant buying or selling occurred before a strong move in price. These areas often act as strong support/resistance when price returns to them.</p>
      
      <ul>
        <li><strong>Bullish Order Block:</strong> A bearish candle that precedes a strong bullish move, often returning to act as support</li>
        <li><strong>Bearish Order Block:</strong> A bullish candle that precedes a strong bearish move, often returning to act as resistance</li>
      </ul>
      
      <h3>Multiple Timeframe Analysis</h3>
      
      <p>Market structure should be analyzed across multiple timeframes for the most effective trading:</p>
      
      <ul>
        <li>Higher timeframes show the dominant trend</li>
        <li>Lower timeframes show potential entry and exit points</li>
        <li>Align trades with the market structure of higher timeframes for higher probability setups</li>
      </ul>
    `
  },
  {
    id: "vwap-trading",
    title: "VWAP Trading Strategy",
    category: "trading-strategies",
    tags: ["VWAP", "day trading", "volume"],
    dateUpdated: "April 8, 2024",
    excerpt: "Discover how to use the Volume Weighted Average Price (VWAP) indicator as a powerful tool for day trading.",
    content: `
      <h2>VWAP Trading Strategy</h2>
      
      <p>The Volume Weighted Average Price (VWAP) is a trading benchmark that represents the average price a security has traded at throughout the day, based on both volume and price. It's a powerful tool used primarily by day traders and institutional traders.</p>
      
      <h3>Understanding VWAP</h3>
      
      <p>VWAP is calculated by adding up the dollars traded for every transaction (price multiplied by shares traded) and then dividing by the total shares traded.</p>
      
      <p>VWAP = Cumulative (Price × Volume) ÷ Cumulative Volume</p>
      
      <p>On charts, VWAP appears as a single line that resets at the beginning of each trading session.</p>
      
      <h3>VWAP as Support and Resistance</h3>
      
      <ul>
        <li>When price is above VWAP, the market is considered bullish</li>
        <li>When price is below VWAP, the market is considered bearish</li>
        <li>VWAP often acts as dynamic support/resistance throughout the trading day</li>
        <li>The further price moves away from VWAP, the stronger the possibility of a reversion to VWAP</li>
      </ul>
      
      <h3>VWAP Trading Strategies</h3>
      
      <p><strong>VWAP Bounce Strategy:</strong></p>
      <ul>
        <li>Look for price to approach VWAP during a strong trend</li>
        <li>In an uptrend, enter long positions when price bounces off VWAP from above</li>
        <li>In a downtrend, enter short positions when price bounces off VWAP from below</li>
        <li>Use candlestick patterns or momentum indicators for confirmation</li>
        <li>Place stops on the opposite side of VWAP</li>
      </ul>
      
      <p><strong>VWAP Breakout Strategy:</strong></p>
      <ul>
        <li>Look for price to consolidate near VWAP</li>
        <li>Enter long positions when price breaks and closes above VWAP with increased volume</li>
        <li>Enter short positions when price breaks and closes below VWAP with increased volume</li>
        <li>Use initial stop loss orders just on the opposite side of VWAP</li>
      </ul>
      
      <p><strong>VWAP Deviation Strategy:</strong></p>
      <ul>
        <li>Add standard deviation bands around VWAP (typically 1 and 2 standard deviations)</li>
        <li>Look for price reaching the outer bands as potential reversal points</li>
        <li>Enter mean-reversion trades toward VWAP when price reaches these extremes</li>
      </ul>
      
      <h3>Best Markets and Timeframes for VWAP Trading</h3>
      
      <p>VWAP is most effective for:</p>
      <ul>
        <li>Highly liquid stocks, futures, and forex pairs</li>
        <li>Intraday timeframes (1-minute to 60-minute charts)</li>
        <li>Markets with normal to high volume</li>
      </ul>
      
      <p>It's less effective for:</p>
      <ul>
        <li>Low-volume or illiquid securities</li>
        <li>Extended timeframes beyond a single trading day</li>
        <li>Very choppy or news-driven markets</li>
      </ul>
      
      <h3>Key VWAP Trading Tips</h3>
      
      <ul>
        <li>VWAP works best in trending markets with consistent volume</li>
        <li>The validity of VWAP increases with trading volume</li>
        <li>Combine VWAP with other indicators for confirmation</li>
        <li>Remember that VWAP resets at the beginning of each trading session</li>
        <li>Be cautious of trading against the VWAP direction during strong trends</li>
      </ul>
    `
  },
  {
    id: "snaptrade-api",
    title: "SnapTrade API Documentation",
    category: "platform-guides",
    tags: ["API", "integration", "developer"],
    dateUpdated: "April 30, 2024",
    excerpt: "Complete guide to integrating with the SnapTrade API for automated chart pattern analysis.",
    content: `
      <h2>SnapTrade API Documentation</h2>
      
      <p>The SnapTrade API allows developers to integrate our powerful chart pattern recognition and analysis capabilities into their own applications. This guide provides all the information needed to get started with the API.</p>
      
      <h3>API Overview</h3>
      
      <p>Base URL: <code>https://api.snaptrade.co.uk/v1</code></p>
      
      <p>The SnapTrade API is organized around REST principles. It accepts JSON-encoded request bodies, returns JSON-encoded responses, and uses standard HTTP response codes, authentication, and verbs.</p>
      
      <h3>Authentication</h3>
      
      <p>Authentication to the API is performed via HTTP Authorization header with a Bearer token:</p>
      
      <pre><code>Authorization: Bearer YOUR_API_KEY</code></pre>
      
      <p>To obtain an API key, sign up for a developer account on the SnapTrade website and generate a key in the Developer Dashboard.</p>
      
      <h3>Rate Limits</h3>
      
      <p>API requests are rate-limited based on your subscription tier:</p>
      <ul>
        <li>Free tier: 50 requests per day</li>
        <li>Standard tier: 500 requests per day</li>
        <li>Professional tier: 2,000 requests per day</li>
        <li>Enterprise tier: Custom limits</li>
      </ul>
      
      <h3>Endpoints</h3>
      
      <h4>Pattern Analysis</h4>
      
      <p><strong>POST /analyze</strong></p>
      <p>Analyzes a chart image for patterns, support/resistance levels, and trend direction.</p>
      
      <p>Request body:</p>
      <pre><code>
      {
        "image": "base64_encoded_image_string",
        "asset": "BTC/USD",
        "timeframe": "4h"  // Optional
      }
      </code></pre>
      
      <p>Response:</p>
      <pre><code>
      {
        "patterns": [
          {
            "name": "Head and Shoulders",
            "type": "bearish",
            "confidence": 0.87
          }
        ],
        "support_resistance": [
          {
            "type": "support",
            "price": 50243.50,
            "strength": "strong"
          },
          {
            "type": "resistance",
            "price": 51870.25,
            "strength": "medium"
          }
        ],
        "trend": {
          "direction": "bearish",
          "strength": 0.75
        }
      }
      </code></pre>
      
      <h4>News Sentiment</h4>
      
      <p><strong>GET /sentiment/{asset}</strong></p>
      <p>Retrieves current news sentiment analysis for a specific asset.</p>
      
      <p>Response:</p>
      <pre><code>
      {
        "asset": "BTC/USD",
        "sentiment_score": 0.65,  // 0-1 scale, higher is more positive
        "articles": [
          {
            "title": "Bitcoin Sees Renewed Institutional Interest",
            "source": "CoinDesk",
            "url": "https://example.com/article1",
            "published_at": "2024-04-29T10:30:00Z",
            "sentiment": 0.82
          }
        ]
      }
      </code></pre>
      
      <h4>Historical Accuracy</h4>
      
      <p><strong>GET /stats/accuracy/{pattern}</strong></p>
      <p>Retrieves historical accuracy statistics for a specific pattern.</p>
      
      <p>Response:</p>
      <pre><code>
      {
        "pattern": "Head and Shoulders",
        "overall_accuracy": 0.72,
        "by_market": {
          "crypto": 0.78,
          "forex": 0.74,
          "stocks": 0.68
        },
        "by_timeframe": {
          "1h": 0.65,
          "4h": 0.72,
          "1d": 0.79
        }
      }
      </code></pre>
      
      <h3>Error Handling</h3>
      
      <p>The API uses conventional HTTP response codes to indicate the success or failure of an API request:</p>
      <ul>
        <li>200 - OK: Everything worked as expected</li>
        <li>400 - Bad Request: The request was unacceptable, often due to missing parameters</li>
        <li>401 - Unauthorized: No valid API key provided</li>
        <li>403 - Forbidden: The API key doesn't have permissions</li>
        <li>429 - Too Many Requests: Rate limit exceeded</li>
        <li>500 - Server Error: Something went wrong on our end</li>
      </ul>
      
      <h3>Webhooks</h3>
      
      <p>Enterprise tier subscribers can set up webhooks to receive real-time notifications for pattern detections on specific assets and timeframes.</p>
      
      <p>Configure webhooks in the Developer Dashboard by providing:</p>
      <ul>
        <li>Webhook URL: Your server endpoint that will receive the notifications</li>
        <li>Secret key: Used to verify webhook signatures</li>
        <li>Trigger events: Pattern detection, sentiment shifts, etc.</li>
        <li>Assets to monitor: Specific assets you want to track</li>
      </ul>
      
      <h3>SDK Libraries</h3>
      
      <p>We provide SDK libraries for popular programming languages:</p>
      <ul>
        <li>JavaScript/TypeScript: <code>npm install snaptrade-api</code></li>
        <li>Python: <code>pip install snaptrade-api</code></li>
        <li>Java: Available via Maven</li>
        <li>C#: Available via NuGet</li>
      </ul>
    `
  }
];

// Popular and featured articles
const popularArticles = ["head-and-shoulders", "fibonacci-retracement", "vwap-trading"];
const featuredArticles = ["market-structure", "snaptrade-api"];

export default function KnowledgeBase() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Filter articles based on search query and/or selected category
  const filteredArticles = articles.filter(article => {
    const matchesSearch = searchQuery.trim() === "" || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === null || article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Get the currently selected article
  const currentArticle = selectedArticle 
    ? articles.find(a => a.id === selectedArticle) 
    : null;
  
  // Function to handle category selection
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(prevCategory => 
      prevCategory === categoryId ? null : categoryId
    );
    setSelectedArticle(null);
  };
  
  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Knowledge Base</h1>
        <p className="text-xl text-muted-foreground">
          Comprehensive resources and guides for technical analysis and trading
        </p>
      </div>
      
      {!selectedArticle && (
        <div className="relative max-w-2xl mx-auto mb-8">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            placeholder="Search for articles, topics, or keywords..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}
      
      {selectedArticle ? (
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="outline" 
            onClick={() => setSelectedArticle(null)}
            className="mb-4"
          >
            Back to Knowledge Base
          </Button>
          
          <Card className="mb-6">
            <CardHeader>
              <div className="flex flex-col space-y-2">
                {categories.find(c => c.id === currentArticle?.category) && (
                  <Badge className="w-fit">
                    {categories.find(c => c.id === currentArticle?.category)?.name}
                  </Badge>
                )}
                <CardTitle className="text-2xl md:text-3xl">{currentArticle?.title}</CardTitle>
                <CardDescription className="text-sm">
                  Last updated: {currentArticle?.dateUpdated}
                </CardDescription>
                <div className="flex flex-wrap gap-2 mt-2">
                  {currentArticle?.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div 
                className="prose dark:prose-invert max-w-none" 
                dangerouslySetInnerHTML={{ __html: currentArticle?.content || "" }}
              />
            </CardContent>
          </Card>
          
          <h3 className="text-xl font-semibold mb-4">Related Articles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {articles
              .filter(a => 
                a.id !== selectedArticle && 
                (a.category === currentArticle?.category || 
                a.tags.some(tag => currentArticle?.tags.includes(tag)))
              )
              .slice(0, 2)
              .map(article => (
                <Card 
                  key={article.id} 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setSelectedArticle(article.id)}
                >
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg">{article.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{article.excerpt}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <BookMarked className="h-5 w-5 mr-2" />
                Categories
              </h3>
              
              <ScrollArea className="h-[calc(100vh-250px)]">
                <div className="space-y-2 pr-4">
                  {categories.map(category => (
                    <div
                      key={category.id}
                      className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                        selectedCategory === category.id 
                          ? 'bg-primary/10 text-primary' 
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => handleCategorySelect(category.id)}
                    >
                      <div className="flex items-center">
                        <span className="mr-2">{category.icon}</span>
                        <span>{category.name}</span>
                      </div>
                      <ChevronRight className={`h-4 w-4 transition-transform ${
                        selectedCategory === category.id ? 'rotate-90' : ''
                      }`} />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
          
          <div className="lg:col-span-3">
            {filteredArticles.length > 0 ? (
              <>
                {!searchQuery && !selectedCategory && (
                  <Tabs defaultValue="all" className="mb-8">
                    <TabsList>
                      <TabsTrigger value="all">All Articles</TabsTrigger>
                      <TabsTrigger value="popular">Popular</TabsTrigger>
                      <TabsTrigger value="featured">Featured</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="all" className="mt-6">
                      <div className="grid grid-cols-1 gap-4">
                        {articles.map(article => (
                          <Card 
                            key={article.id} 
                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => setSelectedArticle(article.id)}
                          >
                            <CardHeader className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <Badge className="mb-2">
                                  {categories.find(c => c.id === article.category)?.name}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {article.dateUpdated}
                                </span>
                              </div>
                              <CardTitle className="text-xl mb-2">{article.title}</CardTitle>
                              <CardDescription className="line-clamp-2">{article.excerpt}</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0 pb-4 px-4">
                              <div className="flex justify-between items-center">
                                <div className="flex flex-wrap gap-2">
                                  {article.tags.slice(0, 2).map(tag => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {article.tags.length > 2 && (
                                    <Badge variant="outline" className="text-xs">+{article.tags.length - 2} more</Badge>
                                  )}
                                </div>
                                <Button variant="ghost" size="sm" className="text-primary" onClick={() => setSelectedArticle(article.id)}>
                                  Read More <ArrowRight className="ml-1 h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="popular" className="mt-6">
                      <div className="grid grid-cols-1 gap-4">
                        {articles
                          .filter(article => popularArticles.includes(article.id))
                          .map(article => (
                            <Card 
                              key={article.id} 
                              className="cursor-pointer hover:bg-muted/50 transition-colors"
                              onClick={() => setSelectedArticle(article.id)}
                            >
                              <CardHeader className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <Badge className="mb-2">
                                    {categories.find(c => c.id === article.category)?.name}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {article.dateUpdated}
                                  </span>
                                </div>
                                <CardTitle className="text-xl mb-2">{article.title}</CardTitle>
                                <CardDescription className="line-clamp-2">{article.excerpt}</CardDescription>
                              </CardHeader>
                              <CardContent className="pt-0 pb-4 px-4">
                                <div className="flex justify-between items-center">
                                  <div className="flex flex-wrap gap-2">
                                    {article.tags.slice(0, 2).map(tag => (
                                      <Badge key={tag} variant="outline" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                    {article.tags.length > 2 && (
                                      <Badge variant="outline" className="text-xs">+{article.tags.length - 2} more</Badge>
                                    )}
                                  </div>
                                  <Button variant="ghost" size="sm" className="text-primary" onClick={() => setSelectedArticle(article.id)}>
                                    Read More <ArrowRight className="ml-1 h-4 w-4" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="featured" className="mt-6">
                      <div className="grid grid-cols-1 gap-4">
                        {articles
                          .filter(article => featuredArticles.includes(article.id))
                          .map(article => (
                            <Card 
                              key={article.id} 
                              className="cursor-pointer hover:bg-muted/50 transition-colors"
                              onClick={() => setSelectedArticle(article.id)}
                            >
                              <CardHeader className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <Badge className="mb-2">
                                    {categories.find(c => c.id === article.category)?.name}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {article.dateUpdated}
                                  </span>
                                </div>
                                <CardTitle className="text-xl mb-2">{article.title}</CardTitle>
                                <CardDescription className="line-clamp-2">{article.excerpt}</CardDescription>
                              </CardHeader>
                              <CardContent className="pt-0 pb-4 px-4">
                                <div className="flex justify-between items-center">
                                  <div className="flex flex-wrap gap-2">
                                    {article.tags.slice(0, 2).map(tag => (
                                      <Badge key={tag} variant="outline" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                    {article.tags.length > 2 && (
                                      <Badge variant="outline" className="text-xs">+{article.tags.length - 2} more</Badge>
                                    )}
                                  </div>
                                  <Button variant="ghost" size="sm" className="text-primary" onClick={() => setSelectedArticle(article.id)}>
                                    Read More <ArrowRight className="ml-1 h-4 w-4" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                )}
                
                {(searchQuery || selectedCategory) && (
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-4">
                      {searchQuery 
                        ? `Search Results for "${searchQuery}"` 
                        : `${categories.find(c => c.id === selectedCategory)?.name} Articles`}
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {filteredArticles.map(article => (
                        <Card 
                          key={article.id} 
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => setSelectedArticle(article.id)}
                        >
                          <CardHeader className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <Badge className="mb-2">
                                {categories.find(c => c.id === article.category)?.name}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {article.dateUpdated}
                              </span>
                            </div>
                            <CardTitle className="text-xl mb-2">{article.title}</CardTitle>
                            <CardDescription className="line-clamp-2">{article.excerpt}</CardDescription>
                          </CardHeader>
                          <CardContent className="pt-0 pb-4 px-4">
                            <div className="flex justify-between items-center">
                              <div className="flex flex-wrap gap-2">
                                {article.tags.slice(0, 2).map(tag => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {article.tags.length > 2 && (
                                  <Badge variant="outline" className="text-xs">+{article.tags.length - 2} more</Badge>
                                )}
                              </div>
                              <Button variant="ghost" size="sm" className="text-primary" onClick={() => setSelectedArticle(article.id)}>
                                Read More <ArrowRight className="ml-1 h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-10">
                <div className="inline-block p-4 rounded-full bg-muted mb-4">
                  <SearchIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No articles found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or browsing by category instead.
                </p>
                <Button onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory(null);
                }}>
                  Clear Search
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}