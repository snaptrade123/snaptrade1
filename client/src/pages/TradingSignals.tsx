import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowRight,
  Clock,
  DollarSign,
  Info,
  Loader2,
  PiggyBank,
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
  User,
  Edit,
  Trash2,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getFreeTradingSignals,
  getPremiumTradingSignals,
  getTradingSignal,
  getProviderSignals,
  createTradingSignal as createSignalApi,
  updateTradingSignal,
  deleteTradingSignal,
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
  const [editingSignal, setEditingSignal] = useState<any>(null);
  const [, navigate] = useLocation();
  
  // Get the current user ID for API calls (for development)
  const userId = user?.id;

  // Check if user is a premium subscriber
  const isPremiumProvider = !!user?.subscriptionTier;
  
  // Check if user is already a provider
  const isProvider = !!user?.isProvider;

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

  // Create signal mutation with better error handling
  const createSignalMutation = useMutation({
    mutationFn: async (signalData: any) => {
      if (!userId) {
        throw new Error("You must be logged in to create signals");
      }
      
      // Ensure price field is properly set
      if (signalData.isPremium && (!signalData.price || signalData.price < 5)) {
        throw new Error("Premium signals require a price of at least £5");
      }
      
      // Make the API call with proper error handling
      const response = await createSignalApi(signalData);
      return response;
    },
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

  // Update signal mutation
  const updateSignalMutation = useMutation({
    mutationFn: ({ signalId, signalData }: { signalId: number; signalData: any }) => {
      return updateTradingSignal(signalId, signalData, user?.id);
    },
    onSuccess: () => {
      toast({
        title: "Signal Updated",
        description: "Your trading signal has been updated successfully.",
      });
      setEditingSignal(null);
      setShowNewSignalDialog(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/trading-signals/free'] });
      queryClient.invalidateQueries({ queryKey: ['/api/trading-signals/premium'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  // Delete signal mutation
  const deleteSignalMutation = useMutation({
    mutationFn: (signalId: number) => deleteTradingSignal(signalId, user?.id),
    onSuccess: () => {
      toast({
        title: "Signal Deleted",
        description: "Your trading signal has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/trading-signals/free'] });
      queryClient.invalidateQueries({ queryKey: ['/api/trading-signals/premium'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive"
      });
    },
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

  // Handle dialog opening to check if user is already a provider
  const handleProvideSignalClick = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to provide trading signals.",
        variant: "destructive"
      });
      return;
    }
    
    // If user is not a provider, redirect to become-provider page
    if (!isProvider) {
      toast({
        title: "Provider Setup Required",
        description: "You need to set up your provider profile before providing signals.",
      });
      navigate("/become-provider");
      return;
    }
    
    // Otherwise, open the dialog
    setShowNewSignalDialog(true);
  };

  const handleSubmit = (values: z.infer<typeof signalFormSchema>) => {
    // First check if user is logged in
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create trading signals",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }
    
    // Check if we're editing or creating
    if (editingSignal) {
      // Update existing signal
      updateSignalMutation.mutate({
        signalId: editingSignal.id,
        signalData: values
      });
    } else {
      // Create new signal - validate price for premium signals
      if (values.isPremium && !values.price) {
        form.setError("price", { 
          type: "manual", 
          message: "Price is required for premium signals" 
        });
        return;
      }
      
      // Create the signal
      createSignalMutation.mutate(values);
    }
  };

  // Handler functions for edit/delete
  const handleEditSignal = (signal: any) => {
    setEditingSignal(signal);
    // Pre-fill form with existing signal data
    form.reset({
      title: signal.title,
      asset: signal.asset,
      direction: signal.direction,
      timeframe: signal.timeframe,
      entryPrice: signal.entryPrice,
      stopLoss: signal.stopLoss,
      takeProfit: signal.takeProfit,
      analysis: signal.analysis,
      isPremium: signal.isPremium,
      price: signal.price
    });
    setShowNewSignalDialog(true);
  };

  const handleDeleteSignal = (signalId: number) => {
    if (confirm('Are you sure you want to delete this signal? This action cannot be undone.')) {
      deleteSignalMutation.mutate(signalId);
    }
  };

  const handleCloseDialog = () => {
    setShowNewSignalDialog(false);
    setEditingSignal(null);
    form.reset();
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
          <Button 
            className="mt-4 md:mt-0"
            onClick={handleProvideSignalClick}
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Provide Signal
          </Button>
          
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
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Signal Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. EUR/USD Bullish Setup" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="asset"
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
                </div>
                
                <div className="grid grid-cols-2 gap-4">
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
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="entryPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Entry Price</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.0001" placeholder="e.g. 1.0685" {...field} />
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
                          <Input type="number" step="0.0001" placeholder="e.g. 1.0650" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="takeProfit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Take Profit</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.0001" placeholder="e.g..0725" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {riskRewardRatio > 0 && (
                  <div className="p-3 bg-secondary/50 rounded-md">
                    <p className="text-sm font-medium">Risk/Reward Ratio: {riskRewardRatio}</p>
                    <p className="text-xs text-muted-foreground">
                      {riskRewardRatio >= 1.5 ? "Good risk/reward ratio" : "Consider adjusting your setup for better risk/reward"}
                    </p>
                  </div>
                )}
                
                <FormField
                  control={form.control}
                  name="analysis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Analysis</FormLabel>
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
                
                {isPremiumProvider && (
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
                
                {isPremiumSignal && (
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
                            onChange={e => field.onChange(Number(e.target.value) || undefined)}
                            value={field.value || ""}
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
                
                <DialogFooter>
                  <Button 
                    type="submit"
                    disabled={createSignalMutation.isPending}
                  >
                    {createSignalMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Share Signal
                  </Button>
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
          {freeSignalsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {freeSignals.map((signal) => (
                <SignalCard 
                  key={signal.id} 
                  signal={signal} 
                  onViewDetails={() => openSignalDetails(signal.id)}
                  onEdit={handleEditSignal}
                  onDelete={handleDeleteSignal}
                  currentUserId={userId}
                />
              ))}
              
              {freeSignals.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Info className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No free signals available</h3>
                  <p className="text-muted-foreground mt-2">
                    Be the first to share a free trading signal with the community.
                  </p>
                </div>
              )}
            </>
          )}
        </TabsContent>
        
        <TabsContent value="premium" className="space-y-4">
          {premiumSignalsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {premiumSignals.map((signal) => (
                <SignalCard 
                  key={signal.id} 
                  signal={signal} 
                  onViewDetails={() => openSignalDetails(signal.id)}
                  onSubscribe={() => handleSubscribe(signal.providerId)}
                  isSubscribing={subscribing}
                  onEdit={handleEditSignal}
                  onDelete={handleDeleteSignal}
                  currentUserId={userId}
                />
              ))}
              
              {premiumSignals.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Info className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No premium signals available</h3>
                  <p className="text-muted-foreground mt-2">
                    Premium signals require a subscription to access. Subscribe to a signal provider to view their signals.
                  </p>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Signal Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-[650px]">
          {signalDetailsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : selectedSignal ? (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <DialogTitle>{selectedSignal.title}</DialogTitle>
                  {selectedSignal.isPremium && (
                    <Badge className="bg-amber-500 hover:bg-amber-600">Premium</Badge>
                  )}
                </div>
                <DialogDescription>
                  {selectedSignal.asset} • {selectedSignal.timeframe} • Posted by Provider #{selectedSignal.providerId}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-3 gap-4 my-4">
                <div className="p-3 rounded-md bg-secondary/30 flex flex-col items-center justify-center">
                  <p className="text-xs uppercase text-muted-foreground">Entry</p>
                  <p className="font-medium">{selectedSignal.entryPrice}</p>
                </div>
                <div className="p-3 rounded-md bg-red-500/10 flex flex-col items-center justify-center">
                  <p className="text-xs uppercase text-muted-foreground">Stop Loss</p>
                  <p className="font-medium">{selectedSignal.stopLoss}</p>
                </div>
                <div className="p-3 rounded-md bg-green-500/10 flex flex-col items-center justify-center">
                  <p className="text-xs uppercase text-muted-foreground">Take Profit</p>
                  <p className="font-medium">{selectedSignal.takeProfit}</p>
                </div>
              </div>
              
              <div className="my-4">
                <h4 className="text-sm font-medium mb-2">Analysis</h4>
                <div className="p-4 rounded-md bg-muted whitespace-pre-line text-sm">
                  {selectedSignal.analysis}
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <Badge variant={selectedSignal.direction === 'buy' ? 'default' : 'destructive'}>
                    {selectedSignal.direction === 'buy' ? 'BUY' : 'SELL'}
                  </Badge>
                  <Badge variant="outline">
                    R:R {selectedSignal.riskRewardRatio}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Posted {new Date(selectedSignal.createdAt).toLocaleDateString()}
                </p>
              </div>
              
              {selectedSignal.isPremium && !selectedSignal.hasAccess && (
                <div className="p-4 rounded-md bg-amber-500/10 mt-4">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <PiggyBank className="h-4 w-4" />
                    Premium Signal
                  </h4>
                  <p className="text-sm mt-1">
                    Subscribe to this provider for £{selectedSignal.price}/month to access all their premium signals.
                  </p>
                  <Button 
                    className="mt-2 w-full" 
                    onClick={() => handleSubscribe(selectedSignal.providerId)}
                    disabled={subscribing}
                  >
                    {subscribing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Subscribe Now
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p>Signal not found</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Signal Card Component
interface SignalCardProps {
  signal: any;
  onViewDetails?: () => void;
  onSubscribe?: () => void;
  isSubscribing?: boolean;
  onEdit?: (signal: any) => void;
  onDelete?: (signalId: number) => void;
  currentUserId?: number;
}

function SignalCard({ signal, onViewDetails, onSubscribe, isSubscribing, onEdit, onDelete, currentUserId }: SignalCardProps) {
  const directionColor = signal.direction === "buy" ? "text-emerald-500" : "text-rose-500";
  const directionBg = signal.direction === "buy" ? "bg-emerald-500/10" : "bg-rose-500/10";
  const isOwner = currentUserId === signal.providerId;
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <CardTitle className="text-lg">{signal.title || signal.asset}</CardTitle>
              {signal.isEdited && (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  (edited)
                </Badge>
              )}
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
            <CardDescription className="flex items-center flex-wrap">
              <Clock className="h-3 w-3 mr-1" />
              {new Date(signal.createdAt).toLocaleString()}
              <span className="mx-2">•</span>
              <Link 
                to={`/provider/${signal.providerId}`}
                onClick={(e) => e.stopPropagation()}
                className="text-primary hover:underline font-medium flex items-center"
              >
                <User className="h-3 w-3 mr-1" />
                {signal.providerName || `Provider #${signal.providerId}`}
              </Link>
              
              {signal.providerRating && (
                <>
                  <span className="mx-2">•</span>
                  <div className="flex items-center text-muted-foreground">
                    <ThumbsUp className="h-3 w-3 mr-1 text-emerald-500" />
                    <span className="mr-2">{signal.providerRating.thumbsUp || 0}</span>
                    <ThumbsDown className="h-3 w-3 mr-1 text-rose-500" />
                    <span>{signal.providerRating.thumbsDown || 0}</span>
                  </div>
                </>
              )}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{signal.timeframe}</Badge>
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit?.(signal)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Signal
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete?.(signal.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Signal
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Entry</p>
            <p className="font-medium">{signal.entryPrice}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Stop Loss</p>
            <p className="font-medium text-rose-500">{signal.stopLoss}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Take Profit</p>
            <p className="font-medium text-emerald-500">{signal.takeProfit}</p>
          </div>
        </div>
        
        {signal.analysis && (
          <div className="mt-2 text-sm border-t border-border pt-3">
            <p className="text-muted-foreground mb-1">Analysis:</p>
            <p className="line-clamp-2">{signal.analysis}</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-1">
        {signal.isPremium && !signal.hasAccess ? (
          <div className="w-full space-y-2">
            <Button 
              className="w-full"
              onClick={onSubscribe}
              disabled={isSubscribing}
            >
              {isSubscribing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <PiggyBank className="h-4 w-4 mr-2" />
              )}
              Subscribe to Signals (£{signal.price}/mo)
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            
            <Link to={`/provider/${signal.providerId}`} className="w-full block">
              <Button 
                variant="outline" 
                className="w-full"
                size="sm"
              >
                <User className="h-4 w-4 mr-2" />
                View Provider Profile
              </Button>
            </Link>
          </div>
        ) : (
          <div className="w-full space-y-2">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={onViewDetails}
            >
              View Details
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            
            {signal.providerId && (
              <Link to={`/provider/${signal.providerId}`} className="w-full block">
                <Button 
                  variant="ghost" 
                  className="w-full"
                  size="sm"
                >
                  <User className="h-4 w-4 mr-2" />
                  View Provider Profile
                </Button>
              </Link>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}