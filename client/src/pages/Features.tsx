import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  BarChart3,
  Newspaper,
  LineChart,
  Target,
  ArrowRight,
  Brain,
  TrendingUp,
  ArrowUpRight
} from "lucide-react";

export default function Features() {
  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-4">SnapTrade Features</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Explore our comprehensive suite of AI-powered tools designed to enhance your trading decisions
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20">
        <Card className="group hover:border-primary transition-colors overflow-hidden">
          <CardHeader className="pb-2">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl">Chart Pattern Detection</CardTitle>
            <CardDescription className="line-clamp-2">
              AI-powered recognition of bullish and bearish patterns in your charts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-2">
                <div className="flex items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 mr-2"></div>
                  <span>Identifies 15+ classic and complex chart patterns</span>
                </div>
                <div className="flex items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 mr-2"></div>
                  <span>Provides confidence ratings for each pattern</span>
                </div>
                <div className="flex items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 mr-2"></div>
                  <span>Detects support and resistance levels</span>
                </div>
              </div>
              
              <Button variant="outline" asChild className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                <Link href="/features/chart-pattern-detection">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="group hover:border-primary transition-colors overflow-hidden">
          <CardHeader className="pb-2">
            <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
              <Newspaper className="h-6 w-6 text-blue-500" />
            </div>
            <CardTitle className="text-xl">Sentiment Analysis</CardTitle>
            <CardDescription className="line-clamp-2">
              Advanced analysis of news and social media to gauge market sentiment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-2">
                <div className="flex items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 mr-2"></div>
                  <span>Analyzes thousands of financial news sources</span>
                </div>
                <div className="flex items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 mr-2"></div>
                  <span>Provides numerical sentiment ratings from -1.0 to +1.0</span>
                </div>
                <div className="flex items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 mr-2"></div>
                  <span>Includes key news article summaries and highlights</span>
                </div>
              </div>
              
              <Button variant="outline" asChild className="w-full group-hover:bg-blue-500 group-hover:text-white">
                <Link href="/features/sentiment-analysis">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="group hover:border-primary transition-colors overflow-hidden">
          <CardHeader className="pb-2">
            <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
              <Brain className="h-6 w-6 text-purple-500" />
            </div>
            <CardTitle className="text-xl">Market Predictions</CardTitle>
            <CardDescription className="line-clamp-2">
              AI-powered forecasts combining technical patterns and sentiment analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-2">
                <div className="flex items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 mr-2"></div>
                  <span>Provides directional forecasts with confidence scores</span>
                </div>
                <div className="flex items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 mr-2"></div>
                  <span>Shows factor weights for technical vs sentiment influences</span>
                </div>
                <div className="flex items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 mr-2"></div>
                  <span>Includes detailed explanations of reasoning behind predictions</span>
                </div>
              </div>
              
              <Button variant="outline" asChild className="w-full group-hover:bg-purple-500 group-hover:text-white">
                <Link href="/features/market-predictions">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="group hover:border-primary transition-colors overflow-hidden">
          <CardHeader className="pb-2">
            <div className="h-12 w-12 rounded-lg bg-amber-500/10 flex items-center justify-center mb-4">
              <Target className="h-6 w-6 text-amber-500" />
            </div>
            <CardTitle className="text-xl">Trading Signals</CardTitle>
            <CardDescription className="line-clamp-2">
              Actionable entry, exit, and risk management recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-2">
                <div className="flex items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 mr-2"></div>
                  <span>Provides specific entry prices and conditions</span>
                </div>
                <div className="flex items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 mr-2"></div>
                  <span>Includes strategic stop loss and take profit levels</span>
                </div>
                <div className="flex items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 mr-2"></div>
                  <span>Offers clear risk-reward ratios and position sizing guidance</span>
                </div>
              </div>
              
              <Button variant="outline" asChild className="w-full group-hover:bg-amber-500 group-hover:text-white">
                <Link href="/features/trading-signals">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-800 rounded-xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/20 to-transparent"></div>
          
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <ArrowUpRight className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">Ready to supercharge your trading?</h2>
            </div>
            
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl">
              Our all-in-one trading analysis platform combines pattern recognition, sentiment analysis, and AI-powered predictions to give you the edge in any market.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/">
                  Try For Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              
              <Button size="lg" variant="outline" asChild>
                <Link href="/pricing">
                  View Pricing
                  <TrendingUp className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}