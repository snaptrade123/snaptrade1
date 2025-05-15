import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  BarChart3,
  LineChart,
  ArrowRight,
  ChevronRight,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  Clock,
  AlertCircle,
  Percent,
  Bell,
  RefreshCw,
  Shield
} from "lucide-react";

export default function TradingSignals() {
  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto mb-10">
        <div className="flex items-center space-x-1 text-sm text-muted-foreground mb-4">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/features" className="hover:text-primary transition-colors">Features</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Trading Signals</span>
        </div>
        
        <h1 className="text-4xl font-bold tracking-tight mb-4">Precise Trading Signals</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Actionable entry, exit, and risk management recommendations for smarter trading
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">How It Works</h2>
            <p className="text-muted-foreground">
              Our trading signals provide precise entry and exit points along with risk
              management recommendations based on pattern detection, market sentiment,
              and support/resistance levels.
            </p>
            <div className="space-y-2">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 mr-3">
                  <Target className="h-3.5 w-3.5 text-primary" />
                </div>
                <p className="text-sm">
                  <span className="font-medium">Precise Levels</span> - Specific entry points, stop loss, and take profit levels with clear rationale
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 mr-3">
                  <Percent className="h-3.5 w-3.5 text-primary" />
                </div>
                <p className="text-sm">
                  <span className="font-medium">Risk-Reward</span> - Clear risk-reward ratios and position sizing recommendations based on account risk parameters
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 mr-3">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                </div>
                <p className="text-sm">
                  <span className="font-medium">Timeframe Guidance</span> - Recommended timeframes for trade execution and monitoring
                </p>
              </div>
            </div>
            <div className="pt-4">
              <Button asChild className="gap-2">
                <Link href="/">
                  Try Trading Signals
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent"></div>
            <div className="relative">
              <div className="rounded-lg bg-card p-4 border border-border mb-6">
                <h3 className="text-lg font-medium mb-3 flex items-center">
                  <Target className="mr-2 h-5 w-5 text-primary" />
                  Trading Signal
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div>
                      <div className="text-sm text-muted-foreground">BTC/USD</div>
                      <div className="font-semibold flex items-center">
                        <ArrowUpRight className="h-4 w-4 text-emerald-500 mr-1" />
                        Bullish Signal
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Timeframe</div>
                      <div className="font-semibold">4 Hour</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-xs text-muted-foreground">Entry Price</div>
                        <div className="font-medium">$51,250</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Entry Condition</div>
                        <div className="font-medium">Break of resistance</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-xs text-muted-foreground">Stop Loss</div>
                        <div className="font-medium text-rose-500">$50,380</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Take Profit</div>
                        <div className="font-medium text-emerald-500">$53,100</div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground mt-2">
                      <div className="font-medium text-foreground mb-1">Risk-Reward Ratio: 1:2.5</div>
                      <p>Based on bullish flag breakout with volume confirmation. Strong support at $50,380.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <div className="flex items-start mb-2">
                  <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                  <span>Comprehensive risk management guidance</span>
                </div>
                <div className="flex items-start">
                  <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                  <span>Based on pattern detection and key market levels</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <h2 className="text-2xl font-semibold mb-6">Key Capabilities</h2>
        
        <Tabs defaultValue="entry">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="entry" className="text-sm">Entry & Exit Strategy</TabsTrigger>
            <TabsTrigger value="risk" className="text-sm">Risk Management</TabsTrigger>
            <TabsTrigger value="alerts" className="text-sm">Signal Alerts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="entry" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Precision Entry Points</h3>
                    <p className="text-sm text-muted-foreground">
                      Our system provides specific price levels for entry, based on key support/resistance levels and pattern formations.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <AlertCircle className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Entry Conditions</h3>
                    <p className="text-sm text-muted-foreground">
                      Beyond price levels, we provide specific conditions that should be met before entry, such as volume confirmation or price action validation.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Timeframe Guidance</h3>
                    <p className="text-sm text-muted-foreground">
                      Each signal includes recommended timeframes for execution and monitoring, ensuring you're trading in the appropriate market context.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <h3 className="text-lg font-medium mb-4">Multiple Take Profit Levels</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Our premium signals include multiple take profit targets, allowing for partial position exits to lock in profits while maintaining exposure.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                    <span>Up to three take profit targets per signal</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                    <span>Position sizing recommendations for each target</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                    <span>Target probabilities based on historical data</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <h3 className="text-lg font-medium mb-4">Adaptive Exit Strategy</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Our signals include adaptive exit strategies that adjust based on market conditions and trade development.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                    <span>Trailing stop recommendations for trending markets</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                    <span>Breakeven stop move recommendations</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                    <span>Time-based exit strategies for ranging markets</span>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="risk" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <ArrowDownRight className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Strategic Stop Loss Placement</h3>
                    <p className="text-sm text-muted-foreground">
                      Our system places stop losses at logical market levels, not arbitrary distances from entry, ensuring they're below support or above resistance.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                        <span>Places stops at logical market levels</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                        <span>Accounts for volatile price zones</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                        <span>Considers market volatility for stop distance</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Percent className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Position Sizing Guidance</h3>
                    <p className="text-sm text-muted-foreground">
                      Each signal includes position sizing recommendations based on optimal risk percentage per trade and account protection principles.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                        <span>Recommends 1-2% risk per trade</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                        <span>Adjusts size based on signal confidence</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                        <span>Includes position calculator with adjustable risk parameters</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <LineChart className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Risk-Reward Analysis</h3>
                    <p className="text-sm text-muted-foreground">
                      Every signal includes a detailed risk-reward analysis, ensuring you only take trades with favorable probabilities and ratios.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                        <span>Minimum 1:2 risk-reward ratio for all signals</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                        <span>Historical win rate for similar setups</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                        <span>Expected value calculation for each trade</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Disclaimer</h3>
                    <p className="text-sm text-muted-foreground">
                      While our signals are based on comprehensive analysis and have shown strong historical performance, all trading carries risk.
                    </p>
                    <div className="rounded-lg bg-card p-4 border border-border">
                      <p className="text-xs text-muted-foreground">
                        Trading signals are provided for educational purposes only and are not financial advice. 
                        Past performance is not indicative of future results. Only trade with capital you can afford to lose.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Bell className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Real-Time Notifications</h3>
                    <p className="text-sm text-muted-foreground">
                      Receive instant alerts when new trading signals are generated for your selected assets, ensuring you never miss a high-quality opportunity.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <RefreshCw className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Signal Updates</h3>
                    <p className="text-sm text-muted-foreground">
                      Get updates when market conditions change, including stop loss adjustments, target modifications, or signal cancellations.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <ArrowUpRight className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Performance Tracking</h3>
                    <p className="text-sm text-muted-foreground">
                      Each signal is tracked to completion, with performance metrics and analysis provided to help you understand what worked and why.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <h3 className="text-lg font-medium mb-4">Customized Alert Settings</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure your notification preferences to receive only the alerts that matter most to you.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                    <span>Filter by asset class or specific instruments</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                    <span>Set minimum confidence thresholds</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                    <span>Choose notification channels (email, mobile, browser)</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <h3 className="text-lg font-medium mb-4">Signal Dashboard</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Access all your active and historical signals in one organized dashboard, making it easy to track and manage your trades.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                    <span>Track active signals in real-time</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                    <span>Review historical signal performance</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                    <span>Export signal data for external analysis</span>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-semibold mb-4">Ready to Get Trading Signals?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Subscribe now to receive precise trading signals with entry/exit points and risk management recommendations.
          </p>
          <Button size="lg" asChild>
            <Link href="/pricing">
              View Pricing
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}