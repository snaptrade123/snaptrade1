import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  BarChart3,
  LineChart,
  Newspaper,
  TrendingUp,
  TrendingDown,
  Check,
  ArrowRight,
  Globe,
  ChevronRight,
  ShieldCheck,
  Lightbulb,
  ChartBar
} from "lucide-react";

export default function SentimentAnalysis() {
  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto mb-10">
        <div className="flex items-center space-x-1 text-sm text-muted-foreground mb-4">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/features" className="hover:text-primary transition-colors">Features</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Sentiment Analysis</span>
        </div>
        
        <h1 className="text-4xl font-bold tracking-tight mb-4">Market Sentiment Analysis</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Advanced AI-powered news sentiment analysis for smarter trading decisions
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">How It Works</h2>
            <p className="text-muted-foreground">
              Our sentiment analysis system scans thousands of financial news articles, 
              social media posts, and market reports to gauge market sentiment for your
              selected assets.
            </p>
            <div className="space-y-2">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 mr-3">
                  <Newspaper className="h-3.5 w-3.5 text-primary" />
                </div>
                <p className="text-sm">
                  <span className="font-medium">News Analysis</span> - Evaluates sentiment from thousands of financial news sources, providing a comprehensive view of market opinions
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 mr-3">
                  <Globe className="h-3.5 w-3.5 text-primary" />
                </div>
                <p className="text-sm">
                  <span className="font-medium">Global Coverage</span> - Monitors news from multiple countries and languages, translated and analyzed in real-time
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 mr-3">
                  <ChartBar className="h-3.5 w-3.5 text-primary" />
                </div>
                <p className="text-sm">
                  <span className="font-medium">Sentiment Score</span> - Provides numerical sentiment ratings from -1.0 (extremely bearish) to +1.0 (extremely bullish)
                </p>
              </div>
            </div>
            <div className="pt-4">
              <Button asChild className="gap-2">
                <Link href="/">
                  Try Sentiment Analysis
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent"></div>
            <div className="relative">
              <div className="rounded-lg bg-card p-4 border border-border mb-6">
                <h3 className="text-lg font-medium mb-3 flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5 text-primary" />
                  Sentiment Analysis Results
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Overall Sentiment: BTC/USD</span>
                      <span className="text-sm font-medium text-emerald-500">+0.68</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "84%" }}></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                      <span>Bearish</span>
                      <span>Neutral</span>
                      <span>Bullish</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-border">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
                        <span className="font-medium">Financial Times</span>
                      </div>
                      <span className="text-sm bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded">+0.82</span>
                    </div>
                    
                    <div className="flex items-center justify-between pb-2 border-b border-border">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
                        <span className="font-medium">Bloomberg</span>
                      </div>
                      <span className="text-sm bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded">+0.75</span>
                    </div>
                    
                    <div className="flex items-center justify-between pb-2 border-b border-border">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                        <span className="font-medium">Reuters</span>
                      </div>
                      <span className="text-sm bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded">+0.32</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <div className="flex items-start mb-2">
                  <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                  <span>Updated every 15 minutes with fresh news data</span>
                </div>
                <div className="flex items-start">
                  <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                  <span>Includes market news from 3,000+ sources</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <h2 className="text-2xl font-semibold mb-6">Key Capabilities</h2>
        
        <Tabs defaultValue="sources">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="sources" className="text-sm">News Sources</TabsTrigger>
            <TabsTrigger value="analysis" className="text-sm">Analysis Technology</TabsTrigger>
            <TabsTrigger value="integration" className="text-sm">Trading Integration</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sources" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Newspaper className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Financial Publications</h3>
                    <p className="text-sm text-muted-foreground">
                      We analyze content from major financial publications including Bloomberg, Financial Times, Wall Street Journal, Reuters, and CNBC.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Global Coverage</h3>
                    <p className="text-sm text-muted-foreground">
                      Our system covers news in multiple languages and regions, ensuring you get a truly global perspective on market sentiment.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Market Intelligence</h3>
                    <p className="text-sm text-muted-foreground">
                      Beyond news, we monitor market reports, analyst opinions, and research publications from major financial institutions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <h3 className="text-lg font-medium mb-4">News Categorization</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Our system categorizes news by relevance and impact, giving higher weight to market-moving articles and significant economic reports.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                    <span>Distinguishes between factual reporting and opinion</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                    <span>Assigns relevance scores to each article</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                    <span>Detects and analyzes significant market events</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <h3 className="text-lg font-medium mb-4">Source Reliability</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Not all news sources are created equal. Our system assigns reliability ratings to each source based on historical accuracy and market impact.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                    <span>Evaluates sources based on historical accuracy</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                    <span>Weights sentiment based on source credibility</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                    <span>Continuously updates source reliability ratings</span>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="analysis" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Lightbulb className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Natural Language Processing</h3>
                    <p className="text-sm text-muted-foreground">
                      Our advanced NLP models are specifically trained on financial text to understand nuanced market terminology and sentiment.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                        <span>Understands financial jargon and terminology</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                        <span>Detects subtle sentiment shifts in market commentary</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                        <span>Identifies key events that impact asset prices</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <ChartBar className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Sentiment Quantification</h3>
                    <p className="text-sm text-muted-foreground">
                      We don't just classify news as positive or negative - our system provides nuanced sentiment scoring on a continuous scale.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                        <span>Scores sentiment on a scale from -1.0 to +1.0</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                        <span>Assigns confidence levels to sentiment ratings</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                        <span>Tracks sentiment trends over time</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Trend Analysis</h3>
                    <p className="text-sm text-muted-foreground">
                      Our system tracks sentiment changes over time, helping you identify shifts in market opinion before they impact prices.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                        <span>Tracks sentiment momentum and rate of change</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                        <span>Identifies early signals of sentiment shifts</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                        <span>Compares current sentiment to historical patterns</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Fake News Detection</h3>
                    <p className="text-sm text-muted-foreground">
                      Our system includes advanced fact-checking capabilities to filter out misleading or false information that could distort sentiment analysis.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                        <span>Identifies suspicious or unverified market claims</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                        <span>Cross-references information across multiple sources</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                        <span>Flags potential market manipulation attempts</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="integration" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <LineChart className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Technical Analysis Combination</h3>
                    <p className="text-sm text-muted-foreground">
                      Our system combines sentiment analysis with technical pattern detection to provide a comprehensive market view, balancing news sentiment with price action.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Sentiment-Based Alerts</h3>
                    <p className="text-sm text-muted-foreground">
                      Set up custom alerts that notify you when sentiment for your selected assets crosses specified thresholds or changes significantly.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <TrendingDown className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Contrarian Indicators</h3>
                    <p className="text-sm text-muted-foreground">
                      Our system identifies extreme sentiment readings that often signal market tops or bottoms, helping you spot potential market reversals.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <h3 className="text-lg font-medium mb-4">Custom Asset Lists</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create personalized watchlists of assets to monitor sentiment for specific markets or investment themes that matter to you.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                    <span>Track sentiment for custom asset lists</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                    <span>Compare sentiment across different market sectors</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                    <span>Develop sentiment-based sector rotation strategies</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <h3 className="text-lg font-medium mb-4">Comprehensive Reports</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Receive detailed sentiment reports with article summaries, key insights, and historical sentiment comparisons.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                    <span>Daily and weekly sentiment summary reports</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                    <span>Key news article summaries and highlights</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                    <span>Sentiment trend analysis with historical context</span>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-semibold mb-4">Ready to Try Sentiment Analysis?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Upload a chart screenshot and get not just pattern detection, but a comprehensive sentiment analysis of your selected asset.
          </p>
          <Button size="lg" asChild>
            <Link href="/">
              Try It Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}