import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, TrendingUp, Info, Clock, DollarSign, PiggyBank, AlertTriangle, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { 
  TradingSignal, 
  SignalSubscription,
  SubscriberData,
  getFreeTradingSignals,
  getPremiumTradingSignals,
  getTradingSignal,
  getProviderSignals,
  createTradingSignal as createSignalApi,
  subscribeToProvider
} from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Form schema for adding a new signal
const signalFormSchema = z.object({
  title: z.string().min(3, "Title is required").max(100, "Title cannot exceed 100 characters"),
  asset: z.string().min(1, "Trading instrument/pair is required"),
  direction: z.enum(["buy", "sell"]),
  entryPrice: z.coerce.number().min(0, "Entry price is required"),
  stopLoss: z.coerce.number().min(0, "Stop Loss is required"),
  takeProfit: z.coerce.number().min(0, "At least one Take Profit is required"),
  timeframe: z.string().min(1, "Timeframe is required"),
  analysis: z.string().min(10, "Please provide some analysis").max(1000, "Analysis too long"),
  imageUrl: z.string().optional(),
  isPremium: z.boolean().default(false),
  price: z.coerce.number().min(5, "Minimum price is £5").max(100, "Maximum price is £100").optional()
});

// Helper function to calculate risk-reward ratio
function calculateRiskReward(entry: number, sl: number, tp: number): number {
  if (!entry || !sl || !tp) return 0;
  const risk = Math.abs(entry - sl);
  const reward = Math.abs(tp - entry);
  return risk > 0 ? +(reward / risk).toFixed(2) : 0;
}

export default function TradingSignals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("free");
  const [showNewSignalDialog, setShowNewSignalDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedSignalId, setSelectedSignalId] = useState<number | null>(null);
  const [subscribing, setSubscribing] = useState(false);

  // Check if user is a premium subscriber
  const isPremiumProvider = !!user?.subscriptionTier;

  // Query to get free trading signals
  const { 
    data: freeSignals = [], 
    isLoading: freeSignalsLoading 
  } = useQuery({
    queryKey: ['/api/trading-signals/free'],
    queryFn: () => getFreeTradingSignals(),
  });

  // Query to get premium trading signals
  const { 
    data: premiumSignals = [], 
    isLoading: premiumSignalsLoading 
  } = useQuery({
    queryKey: ['/api/trading-signals/premium'],
    queryFn: () => getPremiumTradingSignals(),
  });

  // Query to get signal details when selected
  const { 
    data: selectedSignal,
    isLoading: signalDetailsLoading
  } = useQuery({
    queryKey: ['/api/trading-signals', selectedSignalId],
    queryFn: () => selectedSignalId ? getTradingSignal(selectedSignalId) : null,
    enabled: !!selectedSignalId,
  });

  const form = useForm<z.infer<typeof signalFormSchema>>({
    resolver: zodResolver(signalFormSchema),
    defaultValues: {
      title: "",
      asset: "",
      direction: "buy",
      entryPrice: 0,
      stopLoss: 0,
      takeProfit: 0,
      timeframe: "",
      analysis: "",
      isPremium: false,
      price: undefined
    }
  });

  // Create signal mutation
  const createSignalMutation = useMutation({
    mutationFn: (signalData: any) => createSignalApi(signalData),
    onSuccess: () => {
      toast({
        title: "Signal Published",
        description: "Your trading signal has been shared successfully.",
      });
      setShowNewSignalDialog(false);
      form.reset();
      // Invalidate queries to refresh the signals lists
      queryClient.invalidateQueries({ queryKey: ['/api/trading-signals/free'] });
      queryClient.invalidateQueries({ queryKey: ['/api/trading-signals/premium'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to publish signal",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Subscribe to provider mutation
  const subscribeMutation = useMutation({
    mutationFn: (providerId: number) => subscribeToProvider(providerId),
    onSuccess: (data) => {
      // Open Stripe checkout in a new window
      window.open(data.url, '_blank');
      setSubscribing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Subscription failed",
        description: error.message,
        variant: "destructive"
      });
      setSubscribing(false);
    }
  });

  // Watch values to calculate risk-reward ratio
  const entryPrice = form.watch("entryPrice");
  const stopLoss = form.watch("stopLoss");
  const takeProfit = form.watch("takeProfit");
  const isPremiumSignal = form.watch("isPremium");
  
  // Calculate risk-reward ratio when values change
  const riskRewardRatio = calculateRiskReward(entryPrice, stopLoss, takeProfit);

  // Add price validation when premium status changes
  useEffect(() => {
    form.trigger("price");
  }, [isPremiumSignal, form]);

  const handleSubmit = (values: z.infer<typeof signalFormSchema>) => {
    // Validate price for premium signals
    if (values.isPremium && !values.price) {
      form.setError("price", { 
        type: "manual", 
        message: "Price is required for premium signals" 
      });
      return;
    }
    
    const signalData = {
      ...values,
      riskRewardRatio,
      // Default to active status
      status: 'active' as const
    };
    createSignalMutation.mutate(signalData);
  };
  
  // Function to open signal details
  const openSignalDetails = (id: number) => {
    setSelectedSignalId(id);
    setShowDetailDialog(true);
  };
  
  // Function to handle subscription
  const handleSubscribe = (providerId: number) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to subscribe to premium signals.",
        variant: "destructive"
      });
      return;
    }
    
    setSubscribing(true);
    subscribeMutation.mutate(providerId);
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trading Signals</h1>
          <p className="text-muted-foreground mt-2">
            Discover and share trade setups with the community
          </p>
        </div>
        
        <Dialog open={showNewSignalDialog} onOpenChange={setShowNewSignalDialog}>
          <DialogTrigger asChild>
            <Button className="mt-4 md:mt-0">
              <TrendingUp className="mr-2 h-4 w-4" />
              Provide Signal
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Share Trading Signal</DialogTitle>
              <DialogDescription>
                Share your trade setup with the community. Be precise with entry, stop loss, and take profit levels.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="pair"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trading Pair/Instrument</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. EUR/USD, AAPL, BTC/USD" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="direction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Direction</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select direction" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="buy">Buy (Long)</SelectItem>
                            <SelectItem value="sell">Sell (Short)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="entry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Entry Price/Range</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 1.0685 or 1.0685-1.0695" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="stopLoss"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stop Loss</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 1.0650" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="takeProfit1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Take Profit 1</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 1.0725" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="takeProfit2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Take Profit 2 (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 1.0750" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="takeProfit3"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Take Profit 3 (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 1.0775" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="timeframe"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timeframe</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select timeframe" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="5m">5 Minutes</SelectItem>
                            <SelectItem value="15m">15 Minutes</SelectItem>
                            <SelectItem value="30m">30 Minutes</SelectItem>
                            <SelectItem value="1H">1 Hour</SelectItem>
                            <SelectItem value="4H">4 Hours</SelectItem>
                            <SelectItem value="Daily">Daily</SelectItem>
                            <SelectItem value="Weekly">Weekly</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {user?.subscriptionTier && ( // Only show for subscribers
                    <FormField
                      control={form.control}
                      name="isPremium"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
                          <div className="space-y-0.5">
                            <FormLabel>Premium Signal</FormLabel>
                            <FormDescription>
                              Charge for access to this signal
                            </FormDescription>
                          </div>
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="accent-primary h-4 w-4"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}
                </div>
                
                {form.watch("isPremium") && (
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Subscription Price (£)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Enter price (min £5, max £100)" 
                            onChange={e => field.onChange(Number(e.target.value))}
                            value={field.value}
                          />
                        </FormControl>
                        <FormDescription>
                          15% service fee applies to all premium signals. You will receive 85% of the subscription revenue.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Add details about setups, patterns, conditions, etc."
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit">Share Signal</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="free">Free Signals</TabsTrigger>
          <TabsTrigger value="premium">Premium Signals</TabsTrigger>
        </TabsList>
        
        <TabsContent value="free" className="space-y-4">
          {signals.filter(signal => !signal.isPremium).map(signal => (
            <SignalCard key={signal.id} signal={signal} />
          ))}
          
          {signals.filter(signal => !signal.isPremium).length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Info className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No free signals available</h3>
              <p className="text-muted-foreground mt-2">
                Be the first to share a free trading signal with the community.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="premium" className="space-y-4">
          {signals.filter(signal => signal.isPremium).map(signal => (
            <SignalCard key={signal.id} signal={signal} />
          ))}
          
          {signals.filter(signal => signal.isPremium).length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Info className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No premium signals available</h3>
              <p className="text-muted-foreground mt-2">
                Premium signals from expert traders will appear here.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <div className="mt-12 p-5 bg-slate-900 rounded-lg border border-slate-800">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
          <div>
            <h3 className="font-medium">Important Disclaimer</h3>
            <p className="text-sm text-muted-foreground mt-1">
              All trading signals shared on this platform are for educational purposes only and do not constitute financial advice. 
              Trading signals are created by individual users, not by SnapTrade. Always do your own research and trade at your own risk.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Signal card component
function SignalCard({ signal }: { signal: any }) {
  const directionColor = signal.direction === "buy" ? "text-emerald-500" : "text-rose-500";
  const directionBg = signal.direction === "buy" ? "bg-emerald-500/10" : "bg-rose-500/10";
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <CardTitle className="text-lg">{signal.pair}</CardTitle>
              <Badge className={`uppercase ${directionBg} ${directionColor}`}>
                {signal.direction}
              </Badge>
              {signal.isPremium && (
                <Badge variant="secondary" className="bg-primary/20 text-primary font-medium">
                  <DollarSign className="h-3 w-3 mr-1" />
                  Premium £{signal.price}/mo
                </Badge>
              )}
            </div>
            <CardDescription className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {new Date(signal.timestamp).toLocaleString()}
              <span className="mx-2">•</span>
              Provider: {signal.provider}
            </CardDescription>
          </div>
          <Badge variant="outline">{signal.timeframe}</Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Entry</p>
            <p className="font-medium">{signal.entry}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Stop Loss</p>
            <p className="font-medium text-rose-500">{signal.stopLoss}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Take Profit 1</p>
            <p className="font-medium text-emerald-500">{signal.takeProfit1}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              Take Profit {signal.takeProfit3 ? "2 & 3" : "2"}
            </p>
            <p className="font-medium text-emerald-500">
              {signal.takeProfit2}
              {signal.takeProfit3 && ` & ${signal.takeProfit3}`}
            </p>
          </div>
        </div>
        
        {signal.notes && (
          <div className="mt-2 text-sm border-t border-border pt-3">
            <p className="text-muted-foreground mb-1">Notes:</p>
            <p>{signal.notes}</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-1">
        {signal.isPremium ? (
          <Button className="w-full">
            <PiggyBank className="h-4 w-4 mr-2" />
            Subscribe to {signal.provider}'s Signals
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button variant="outline" className="w-full">
            View {signal.provider}'s Profile
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}