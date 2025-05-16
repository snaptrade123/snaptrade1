import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  ThumbsUp,
  ThumbsDown,
  Loader2,
  Clock,
  Users,
  Award,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import {
  getUser,
  getProviderRatings,
  getUserRatingForProvider,
  rateProvider,
  removeProviderRating,
  getProviderSignals,
  subscribeToProvider
} from "@/lib/api";

export default function ProviderProfile() {
  const { providerId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("signals");
  const [subscribing, setSubscribing] = useState(false);
  
  const numericProviderId = providerId ? parseInt(providerId) : 0;
  
  // Query provider info
  const { data: provider, isLoading: providerLoading } = useQuery({
    queryKey: ['/api/user', numericProviderId],
    queryFn: () => getUser(numericProviderId),
    enabled: !!numericProviderId
  });
  
  // Query provider signals
  const { data: signals = [], isLoading: signalsLoading } = useQuery({
    queryKey: ['/api/trading-signals/provider', numericProviderId],
    queryFn: () => getProviderSignals(numericProviderId),
    enabled: !!numericProviderId
  });
  
  // Get provider ratings
  const { data: ratings, isLoading: ratingsLoading } = useQuery({
    queryKey: ['/api/provider/ratings', numericProviderId],
    queryFn: () => getProviderRatings(numericProviderId),
    enabled: !!numericProviderId
  });
  
  // Get user's current rating for this provider
  const { data: userRating, isLoading: userRatingLoading } = useQuery({
    queryKey: ['/api/provider/user-rating', numericProviderId],
    queryFn: () => getUserRatingForProvider(numericProviderId),
    enabled: !!numericProviderId && !!user
  });
  
  // Rate provider mutation
  const rateMutation = useMutation({
    mutationFn: ({ providerId, isPositive }: { providerId: number, isPositive: boolean }) => 
      rateProvider(providerId, isPositive),
    onSuccess: () => {
      toast({
        title: "Rating Submitted",
        description: "Thank you for your feedback!"
      });
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/provider/ratings', numericProviderId] });
      queryClient.invalidateQueries({ queryKey: ['/api/provider/user-rating', numericProviderId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Rating Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Remove rating mutation
  const removeRatingMutation = useMutation({
    mutationFn: (providerId: number) => removeProviderRating(providerId),
    onSuccess: () => {
      toast({
        title: "Rating Removed",
        description: "Your rating has been removed."
      });
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/provider/ratings', numericProviderId] });
      queryClient.invalidateQueries({ queryKey: ['/api/provider/user-rating', numericProviderId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Remove Rating",
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
        title: "Subscription Failed",
        description: error.message,
        variant: "destructive"
      });
      setSubscribing(false);
    }
  });
  
  // Handle rating the provider
  const handleRate = (isPositive: boolean) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to rate providers.",
        variant: "destructive"
      });
      return;
    }
    
    if (user.id === numericProviderId) {
      toast({
        title: "Invalid Action",
        description: "You cannot rate yourself.",
        variant: "destructive"
      });
      return;
    }
    
    rateMutation.mutate({ providerId: numericProviderId, isPositive });
  };
  
  // Handle removing rating
  const handleRemoveRating = () => {
    if (!user) return;
    removeRatingMutation.mutate(numericProviderId);
  };
  
  // Handle subscription
  const handleSubscribe = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to subscribe to premium signals.",
        variant: "destructive"
      });
      return;
    }
    
    setSubscribing(true);
    subscribeMutation.mutate(numericProviderId);
  };
  
  // Loading state
  if (providerLoading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Provider not found
  if (!provider) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle>Provider Not Found</CardTitle>
            <CardDescription>The provider you are looking for doesn't exist.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
  
  // Determine if the user has already subscribed to this provider
  const isSubscribed = false; // This would need to be determined based on actual subscription data
  
  return (
    <div className="container max-w-4xl mx-auto px-4 py-12">
      <Card className="mb-8 overflow-hidden">
        <div className="h-36 bg-gradient-to-r from-primary/20 to-secondary/20"></div>
        <CardHeader className="pt-0">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 -mt-12">
            <Avatar className="h-24 w-24 border-4 border-background">
              <AvatarFallback className="text-2xl font-bold">
                {provider.username ? provider.username.charAt(0).toUpperCase() : 'P'}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <CardTitle className="text-2xl">{provider.username || `Provider #${provider.id}`}</CardTitle>
                {isSubscribed && (
                  <Badge className="bg-primary/20 text-primary">Subscribed</Badge>
                )}
              </div>
              <CardDescription className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{signals.length} signals published</span>
                <span className="mx-1">•</span>
                <Clock className="h-4 w-4" />
                <span>Joined {new Date(provider.createdAt).toLocaleDateString()}</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-1">
              <ThumbsUp className={`h-5 w-5 ${userRating?.rating === true ? 'text-primary fill-primary' : ''}`} />
              <span className="font-medium">{ratings?.thumbsUp || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <ThumbsDown className={`h-5 w-5 ${userRating?.rating === false ? 'text-primary fill-primary' : ''}`} />
              <span className="font-medium">{ratings?.thumbsDown || 0}</span>
            </div>
            
            {user && user.id !== numericProviderId && (
              <div className="flex ml-auto gap-2">
                {userRating?.rating !== undefined ? (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1"
                      onClick={handleRemoveRating}
                      disabled={removeRatingMutation.isPending}
                    >
                      {removeRatingMutation.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                      Remove Rating
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1"
                      onClick={() => handleRate(true)}
                      disabled={rateMutation.isPending}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      Like
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1"
                      onClick={() => handleRate(false)}
                      disabled={rateMutation.isPending}
                    >
                      <ThumbsDown className="h-4 w-4" />
                      Dislike
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
          
          {!isSubscribed && (
            <Button 
              className="w-full"
              onClick={handleSubscribe}
              disabled={subscribing || user?.id === numericProviderId}
            >
              {subscribing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Award className="h-4 w-4 mr-2" />
              )}
              Subscribe to {provider.username || `Provider #${provider.id}`}'s Signals
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </CardContent>
      </Card>
      
      <Tabs defaultValue="signals" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="signals">Signals</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>
        
        <TabsContent value="signals">
          {signalsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-border" />
            </div>
          ) : signals.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {signals.map((signal) => (
                <Card key={signal.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base">{signal.title || signal.asset}</CardTitle>
                        <CardDescription className="flex items-center text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(signal.createdAt).toLocaleString()}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">{signal.timeframe}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Entry</p>
                        <p className="font-medium">{signal.entryPrice}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Stop Loss</p>
                        <p className="font-medium text-rose-500">{signal.stopLoss}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Take Profit</p>
                        <p className="font-medium text-emerald-500">{signal.takeProfit}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Signals</CardTitle>
                <CardDescription>
                  This provider hasn't published any signals yet.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Performance Stats</CardTitle>
              <CardDescription>
                Performance metrics and statistics will be available soon.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>More detailed statistics about this provider's performance will be added in a future update.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}