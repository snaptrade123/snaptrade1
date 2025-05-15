import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  BarChart3, 
  LineChart, 
  Brain, 
  Eye, 
  Check, 
  ArrowRight, 
  MousePointerClick,
  Shield,
  ChevronRight
} from "lucide-react";

export default function ChartPatternDetection() {
  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto mb-10">
        <div className="flex items-center space-x-1 text-sm text-muted-foreground mb-4">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/features" className="hover:text-primary transition-colors">Features</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Chart Pattern Detection</span>
        </div>
        
        <h1 className="text-4xl font-bold tracking-tight mb-4">Chart Pattern Detection</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Advanced AI-powered technology that identifies trading patterns with high precision
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">How It Works</h2>
            <p className="text-muted-foreground">
              Our sophisticated computer vision algorithms analyze your chart screenshots 
              to identify classic and complex trading patterns that might indicate future 
              price movements.
            </p>
            <div className="space-y-2">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 mr-3">
                  <Eye className="h-3.5 w-3.5 text-primary" />
                </div>
                <p className="text-sm">
                  <span className="font-medium">Pattern Recognition</span> - Identifies over 15 classic chart patterns including head & shoulders, double tops/bottoms, triangles, and more
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 mr-3">
                  <Brain className="h-3.5 w-3.5 text-primary" />
                </div>
                <p className="text-sm">
                  <span className="font-medium">AI Analysis</span> - Uses deep learning to continuously improve pattern detection accuracy over time
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 mr-3">
                  <BarChart3 className="h-3.5 w-3.5 text-primary" />
                </div>
                <p className="text-sm">
                  <span className="font-medium">Confidence Rating</span> - Provides probability score for each identified pattern, helping you focus on the most reliable signals
                </p>
              </div>
            </div>
            <div className="pt-4">
              <Button asChild className="gap-2">
                <Link href="/">
                  Try Pattern Detection
                  <MousePointerClick className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
            <div className="relative">
              <div className="rounded-lg bg-card p-4 border border-border mb-6">
                <h3 className="text-lg font-medium mb-3 flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5 text-primary" />
                  Pattern Detection Results
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
                      <span className="font-medium">Bullish Flag</span>
                    </div>
                    <span className="text-sm bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded">94% confidence</span>
                  </div>
                  
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
                      <span className="font-medium">Ascending Triangle</span>
                    </div>
                    <span className="text-sm bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded">87% confidence</span>
                  </div>
                  
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                      <span className="font-medium">Support Level</span>
                    </div>
                    <span className="text-sm bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded">78% confidence</span>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <div className="flex items-start mb-2">
                  <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                  <span>Highly accurate detection with 73% historical success rate</span>
                </div>
                <div className="flex items-start">
                  <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                  <span>Compatible with any trading platform screenshot</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <h2 className="text-2xl font-semibold mb-6">Key Capabilities</h2>
        
        <Tabs defaultValue="detection">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="detection" className="text-sm">Detection Technology</TabsTrigger>
            <TabsTrigger value="patterns" className="text-sm">Supported Patterns</TabsTrigger>
            <TabsTrigger value="accuracy" className="text-sm">Historical Accuracy</TabsTrigger>
          </TabsList>
          
          <TabsContent value="detection" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Eye className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Computer Vision</h3>
                    <p className="text-sm text-muted-foreground">
                      Our system applies advanced computer vision techniques to identify visual patterns in candlestick charts with high precision, regardless of the platform or timeframe.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Brain className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Neural Networks</h3>
                    <p className="text-sm text-muted-foreground">
                      Trained on millions of chart examples, our neural networks can detect even subtle patterns that might be missed by human traders, including complex formations.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <LineChart className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Trend Analysis</h3>
                    <p className="text-sm text-muted-foreground">
                      Beyond pattern recognition, our system analyzes trend strength, volume patterns, and technical indicators to provide a comprehensive market view.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <h3 className="text-lg font-medium mb-4">Continuous Learning</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Our AI models continuously learn from new market data and user feedback, constantly improving detection accuracy and adapting to changing market conditions.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                    <span>Regular model updates every two weeks</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                    <span>Trained on diverse market types (forex, crypto, stocks)</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                    <span>Adjusts to various chart styles and indicators</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <h3 className="text-lg font-medium mb-4">Confidence Scoring</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Each detected pattern receives a confidence score, helping you prioritize the most promising trading opportunities and filter out potential false signals.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                    <span>Probability-based confidence metrics</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                    <span>Pattern quality assessment based on formation characteristics</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                    <span>Historical success rate for similar patterns</span>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="patterns" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div>
                    <h3 className="font-medium text-lg mb-4">Bullish Patterns</h3>
                    <ul className="space-y-3">
                      <li className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 mr-3"></div>
                        <span>Ascending Triangle</span>
                      </li>
                      <li className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 mr-3"></div>
                        <span>Bullish Flag</span>
                      </li>
                      <li className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 mr-3"></div>
                        <span>Cup and Handle</span>
                      </li>
                      <li className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 mr-3"></div>
                        <span>Double Bottom</span>
                      </li>
                      <li className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 mr-3"></div>
                        <span>Inverse Head and Shoulders</span>
                      </li>
                      <li className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 mr-3"></div>
                        <span>Bullish Engulfing</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-lg mb-4">Bearish Patterns</h3>
                    <ul className="space-y-3">
                      <li className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-rose-500 mr-3"></div>
                        <span>Descending Triangle</span>
                      </li>
                      <li className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-rose-500 mr-3"></div>
                        <span>Bearish Flag</span>
                      </li>
                      <li className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-rose-500 mr-3"></div>
                        <span>Head and Shoulders</span>
                      </li>
                      <li className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-rose-500 mr-3"></div>
                        <span>Double Top</span>
                      </li>
                      <li className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-rose-500 mr-3"></div>
                        <span>Rising Wedge</span>
                      </li>
                      <li className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-rose-500 mr-3"></div>
                        <span>Bearish Engulfing</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-lg mb-4">Continuation Patterns</h3>
                    <ul className="space-y-3">
                      <li className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-amber-500 mr-3"></div>
                        <span>Symmetrical Triangle</span>
                      </li>
                      <li className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-amber-500 mr-3"></div>
                        <span>Rectangle</span>
                      </li>
                      <li className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-amber-500 mr-3"></div>
                        <span>Pennant</span>
                      </li>
                      <li className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-amber-500 mr-3"></div>
                        <span>Falling Wedge (in downtrend)</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-lg mb-4">Support & Resistance</h3>
                    <ul className="space-y-3">
                      <li className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-500 mr-3"></div>
                        <span>Horizontal Support Levels</span>
                      </li>
                      <li className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-500 mr-3"></div>
                        <span>Horizontal Resistance Levels</span>
                      </li>
                      <li className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-500 mr-3"></div>
                        <span>Trendlines</span>
                      </li>
                      <li className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-500 mr-3"></div>
                        <span>Price Channels</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h3 className="text-lg font-medium mb-4">Learn More About Patterns</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Visit our comprehensive Pattern Guide to learn more about each pattern, how to identify them, and their trading implications.
              </p>
              <Button variant="secondary" asChild>
                <Link href="/pattern-guide">
                  View Pattern Guide
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="accuracy" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Historical Performance</h3>
                    <p className="text-sm text-muted-foreground">
                      Our pattern detection system has been extensively tested against historical market data across various asset classes and timeframes.
                    </p>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Overall accuracy</span>
                          <span className="text-sm font-medium">73%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: "73%" }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Bullish patterns</span>
                          <span className="text-sm font-medium">76%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                          <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "76%" }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Bearish patterns</span>
                          <span className="text-sm font-medium">71%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                          <div className="bg-rose-500 h-2 rounded-full" style={{ width: "71%" }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Continuation patterns</span>
                          <span className="text-sm font-medium">68%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                          <div className="bg-amber-500 h-2 rounded-full" style={{ width: "68%" }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Accuracy by Market Type</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Forex</span>
                          <span className="text-sm font-medium">75%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: "75%" }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Cryptocurrency</span>
                          <span className="text-sm font-medium">72%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{ width: "72%" }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Stocks</span>
                          <span className="text-sm font-medium">74%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                          <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "74%" }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Commodities</span>
                          <span className="text-sm font-medium">71%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                          <div className="bg-amber-500 h-2 rounded-full" style={{ width: "71%" }}></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="rounded-lg bg-card p-4 border border-border">
                      <div className="flex items-start">
                        <div className="mr-3">
                          <Shield className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-1">Disclaimer</h4>
                          <p className="text-xs text-muted-foreground">
                            Past performance is not indicative of future results. Pattern detection is provided for 
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
        </Tabs>
        
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-semibold mb-4">Ready to Try Chart Pattern Detection?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Upload a chart screenshot and let our AI identify patterns, support/resistance levels, and provide trading insights.
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