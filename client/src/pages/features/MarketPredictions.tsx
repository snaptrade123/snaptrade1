import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  BarChart3,
  LineChart,
  ArrowRight,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  Brain,
  GitMerge,
  PieChart,
  Scale,
  Shield
} from "lucide-react";

export default function MarketPredictions() {
  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto mb-10">
        <div className="flex items-center space-x-1 text-sm text-muted-foreground mb-4">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/features" className="hover:text-primary transition-colors">Features</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Market Predictions</span>
        </div>
        
        <h1 className="text-4xl font-bold tracking-tight mb-4">AI-Powered Market Predictions</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Smart market direction forecasts combining technical patterns and sentiment analysis
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">How It Works</h2>
            <p className="text-muted-foreground">
              Our prediction system combines pattern recognition and sentiment analysis
              results to forecast potential market direction, confidence levels, and 
              explanation of key factors influencing the prediction.
            </p>
            <div className="space-y-2">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 mr-3">
                  <Brain className="h-3.5 w-3.5 text-primary" />
                </div>
                <p className="text-sm">
                  <span className="font-medium">Machine Learning</span> - Uses advanced ML algorithms trained on millions of historical market scenarios
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 mr-3">
                  <GitMerge className="h-3.5 w-3.5 text-primary" />
                </div>
                <p className="text-sm">
                  <span className="font-medium">Multi-Factor</span> - Combines technical pattern signals, sentiment analysis, and market context
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 mr-3">
                  <Scale className="h-3.5 w-3.5 text-primary" />
                </div>
                <p className="text-sm">
                  <span className="font-medium">Confidence Scoring</span> - Provides probability assessments for each prediction with transparency
                </p>
              </div>
            </div>
            <div className="pt-4">
              <Button asChild className="gap-2">
                <Link href="/">
                  Try Market Predictions
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent"></div>
            <div className="relative">
              <div className="rounded-lg bg-card p-4 border border-border mb-6">
                <h3 className="text-lg font-medium mb-3 flex items-center">
                  <LineChart className="mr-2 h-5 w-5 text-primary" />
                  Market Prediction Results
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div>
                      <div className="text-sm text-muted-foreground">BTC/USD</div>
                      <div className="font-semibold flex items-center">
                        <ArrowUpRight className="h-4 w-4 text-emerald-500 mr-1" />
                        Bullish
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Confidence</div>
                      <div className="font-semibold text-emerald-500">76%</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Factors Influencing Prediction</div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Technical Patterns</span>
                        <span className="text-emerald-500">70%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5">
                        <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: "70%" }}></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>News Sentiment</span>
                        <span className="text-emerald-500">85%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5">
                        <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: "85%" }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs border-t border-border pt-3">
                    <div className="font-medium mb-1">Explanation:</div>
                    <p className="text-muted-foreground">
                      Bullish flag pattern confirmed with strong volume. Recent positive news about institutional adoption. Potential resistance at $52,800.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <div className="flex items-start mb-2">
                  <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                  <span>Transparent weighting of technical and sentiment factors</span>
                </div>
                <div className="flex items-start">
                  <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                  <span>Clear confidence scoring for informed decision making</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <h2 className="text-2xl font-semibold mb-6">Key Capabilities</h2>
        
        <Tabs defaultValue="algorithm">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="algorithm" className="text-sm">Prediction Technology</TabsTrigger>
            <TabsTrigger value="accuracy" className="text-sm">Accuracy & Performance</TabsTrigger>
            <TabsTrigger value="usage" className="text-sm">Using Predictions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="algorithm" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Brain className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Advanced AI Models</h3>
                    <p className="text-sm text-muted-foreground">
                      Our prediction system uses deep learning neural networks specifically trained on financial market data to identify complex relationships and patterns.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <GitMerge className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Multi-Factor Analysis</h3>
                    <p className="text-sm text-muted-foreground">
                      We combine technical pattern detection, sentiment analysis, and market context to provide a holistic view of potential market direction.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <PieChart className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Adaptive Weighting</h3>
                    <p className="text-sm text-muted-foreground">
                      Our system dynamically adjusts the weighting of different factors based on market conditions and historical effectiveness.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <h3 className="text-lg font-medium mb-4">Continuous Learning</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Our prediction models continuously learn from market outcomes, improving accuracy and adapting to changing market conditions.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                    <span>Models retrained with the latest market data</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                    <span>Performance monitoring and feedback loops</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                    <span>Automatic detection of market regime changes</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <h3 className="text-lg font-medium mb-4">Market Context Integration</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Our system considers broader market context, including volatility regimes, major economic events, and inter-market correlations.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                    <span>Volatility-adjusted prediction confidence</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                    <span>Correlated asset movement analysis</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                    <span>Economic calendar event integration</span>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="accuracy" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Historical Performance</h3>
                    <p className="text-sm text-muted-foreground">
                      Our prediction system's performance has been backTested against years of historical market data across various assets and market conditions.
                    </p>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Overall directional accuracy</span>
                          <span className="text-sm font-medium">73%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: "73%" }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Bullish prediction accuracy</span>
                          <span className="text-sm font-medium">76%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                          <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "76%" }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Bearish prediction accuracy</span>
                          <span className="text-sm font-medium">71%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                          <div className="bg-rose-500 h-2 rounded-full" style={{ width: "71%" }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Performance by Confidence Level</h3>
                    <p className="text-sm text-muted-foreground">
                      Our system's accuracy correlates strongly with its confidence scoring, allowing users to focus on high-confidence predictions.
                    </p>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">High confidence (80%+)</span>
                          <span className="text-sm font-medium">82%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                          <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "82%" }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Medium confidence (60-80%)</span>
                          <span className="text-sm font-medium">70%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                          <div className="bg-amber-500 h-2 rounded-full" style={{ width: "70%" }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Low confidence (<60%)</span>
                          <span className="text-sm font-medium">55%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: "55%" }}></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="rounded-lg bg-card p-4 border border-border mt-2">
                      <div className="flex items-start">
                        <div className="mr-3">
                          <Shield className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-1">Disclaimer</h4>
                          <p className="text-xs text-muted-foreground">
                            Past performance is not indicative of future results. Predictions are provided for 
                            educational purposes only and should not be considered financial advice.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="usage" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <ArrowUpRight className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Directional Bias</h3>
                    <p className="text-sm text-muted-foreground">
                      Use predictions to establish a directional bias for your trading decisions, focusing on setups that align with the predicted market direction.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Scale className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Risk Management</h3>
                    <p className="text-sm text-muted-foreground">
                      Consider the confidence level when sizing positions, allocating larger positions to higher-confidence predictions and smaller positions to lower-confidence ones.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <ArrowDownRight className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Counter-Trend Awareness</h3>
                    <p className="text-sm text-muted-foreground">
                      Use prediction factors to identify potential trend reversals and exercise caution when technical and sentiment signals diverge significantly.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <h3 className="text-lg font-medium mb-4">Trading Recommendation Integration</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Our premium subscription includes specific entry points, stop loss, and take profit levels based on predicted market direction and key levels.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                    <span>Specific entry price levels and conditions</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                    <span>Risk-based stop loss placement recommendations</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                    <span>Multiple take profit targets with probabilities</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <h3 className="text-lg font-medium mb-4">Educational Interpretations</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Each prediction includes detailed explanations of the factors influencing the forecast, helping you understand the market dynamics at play.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                    <span>Detailed pattern explanation and significance</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                    <span>Sentiment factor analysis with key news highlights</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                    <span>Key price levels and potential reversal points</span>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-semibold mb-4">Ready to Try Market Predictions?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Upload a chart screenshot and receive comprehensive market forecasts combining pattern detection and sentiment analysis.
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