import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ThumbsUp, ThumbsDown, User, ChevronLeft, Clock, Info, Award, ArrowRight } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

import { getUser, getProviderSignals, getProviderRatings, getUserRatingForProvider, rateProvider, removeProviderRating, subscribeToProvider } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';

const ProviderProfile = () => {
  const [location, navigate] = useLocation();
  const params = useParams<{ providerId: string }>();
  const providerId = parseInt(params.providerId);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [subscribeDialogOpen, setSubscribeDialogOpen] = useState(false);

  // Fetch the current user's data to see if they're logged in
  const { 
    data: currentUser 
  } = useQuery({
    queryKey: ['/api/user'],
    queryFn: () => apiRequest("GET", "/api/user")
      .then(res => res.ok ? res.json() : null),
  });

  // Fetch provider data with retry and fallback
  const {
    data: provider,
    isLoading: isLoadingProvider,
    error: providerError,
    refetch: refetchProvider
  } = useQuery({
    queryKey: ['/api/user', providerId],
    queryFn: async () => {
      try {
        return await getUser(providerId);
      } catch (error) {
        console.error('Error fetching provider:', error);
        // Return a fallback provider with minimal data
        return {
          id: providerId,
          username: "Provider",
          isProvider: true,
          providerDisplayName: "Provider",
          bio: "Provider information temporarily unavailable",
          createdAt: new Date().toISOString(),
          thumbsUp: 0,
          thumbsDown: 0
        };
      }
    },
    staleTime: 60000, // 1 minute
    retry: 2,
    enabled: !isNaN(providerId)
  });

  // Fetch provider's signals with retry and empty array fallback
  const {
    data: signals = [],
    isLoading: isLoadingSignals,
    error: signalsError,
    refetch: refetchSignals
  } = useQuery({
    queryKey: ['/api/trading-signals/provider', providerId],
    queryFn: async () => {
      try {
        return await getProviderSignals(providerId);
      } catch (error) {
        console.error('Error fetching signals:', error);
        return [];
      }
    },
    staleTime: 60000, // 1 minute
    retry: 2,
    enabled: !isNaN(providerId)
  });

  // Fetch provider ratings with retry and default fallback
  const {
    data: ratings = { thumbsUp: 0, thumbsDown: 0 },
    isLoading: isLoadingRatings,
    error: ratingsError,
    refetch: refetchRatings
  } = useQuery({
    queryKey: ['/api/provider/ratings', providerId],
    queryFn: async () => {
      try {
        return await getProviderRatings(providerId);
      } catch (error) {
        console.error('Error fetching ratings:', error);
        return { thumbsUp: 0, thumbsDown: 0 };
      }
    },
    staleTime: 60000, // 1 minute
    retry: 2,
    enabled: !isNaN(providerId)
  });
  
  // Fetch current user's rating for this provider (only if authenticated)
  const {
    data: userRating = null,
    isLoading: isLoadingUserRating,
    error: userRatingError
  } = useQuery({
    queryKey: ['/api/provider/user-rating', providerId],
    queryFn: () => getUserRatingForProvider(providerId),
    enabled: !isNaN(providerId) && !!currentUser,
    staleTime: 60000, // 1 minute
    retry: 1
  });

  // Submit a rating mutation
  const rateMutation = useMutation({
    mutationFn: ({ isPositive }: { isPositive: boolean }) => 
      rateProvider(providerId, isPositive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/provider/ratings', providerId] });
      queryClient.invalidateQueries({ queryKey: ['/api/provider/user-rating', providerId] });
      toast({
        title: "Rating submitted",
        description: "Thank you for your feedback!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error submitting rating",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Remove rating mutation
  const removeRatingMutation = useMutation({
    mutationFn: () => removeProviderRating(providerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/provider/ratings', providerId] });
      queryClient.invalidateQueries({ queryKey: ['/api/provider/user-rating', providerId] });
      toast({
        title: "Rating removed",
        description: "Your rating has been removed",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error removing rating",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Subscribe to provider mutation
  const subscribeMutation = useMutation({
    mutationFn: () => subscribeToProvider(providerId),
    onSuccess: (data) => {
      // Redirect to Stripe checkout
      window.location.href = data.url;
    },
    onError: (error: Error) => {
      toast({
        title: "Error subscribing",
        description: error.message,
        variant: "destructive"
      });
      setSubscribeDialogOpen(false);
    }
  });

  // Handle rating submission
  const handleRate = (isPositive: boolean) => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to rate providers",
        variant: "destructive"
      });
      return;
    }
    
    if (userRating?.rating === isPositive) {
      // If clicking the same rating again, remove it
      removeRatingMutation.mutate();
    } else {
      // Otherwise submit the new rating
      rateMutation.mutate({ isPositive });
    }
  };

  // Handle subscribe button click
  const handleSubscribe = () => {
    if (!termsAccepted) {
      toast({
        title: "Terms not accepted",
        description: "Please accept the terms and conditions before subscribing",
        variant: "destructive"
      });
      return;
    }
    
    subscribeMutation.mutate();
  };

  const isLoading = isLoadingProvider || isLoadingSignals || isLoadingRatings;
  const hasError = providerError || signalsError || ratingsError;

  if (isNaN(providerId)) {
    return (
      <div className="container py-6">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate('/trading-signals')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold ml-2">Invalid Provider ID</h1>
        </div>
        <p>The provider ID is invalid. Please check the URL and try again.</p>
      </div>
    );
  }

  const retryAllQueries = async () => {
    await Promise.all([
      refetchProvider(),
      refetchSignals(),
      refetchRatings()
    ]);
  };

  if (hasError) {
    return (
      <div className="container py-6">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate('/signals')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold ml-2">Error</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8">
              <h2 className="text-xl font-bold mb-4">Error Loading Provider Profile</h2>
              <p className="text-muted-foreground mb-6">An error occurred while loading the provider profile. Please try again later.</p>
              <Button 
                onClick={retryAllQueries}
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="flex items-center mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate('/trading-signals')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold ml-2">Provider Profile</h1>
      </div>

      {isLoading ? (
        <ProviderProfileSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="relative pb-0">
                <div className="flex flex-col items-center">
                  <Avatar className="h-16 w-16 mb-2">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {provider?.username ? provider.username.charAt(0).toUpperCase() : 'P'}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-center">{provider?.providerDisplayName || provider?.username}</CardTitle>
                  <CardDescription className="text-center">
                    Member since {provider?.createdAt ? formatDistanceToNow(new Date(provider.createdAt), { addSuffix: true }) : 'unknown'}
                  </CardDescription>
                  {provider?.bio && (
                    <p className="text-center text-sm mt-3 text-muted-foreground px-4">
                      {provider.bio}
                    </p>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex justify-center space-x-4 mb-6">
                  <Button 
                    variant={userRating?.rating === true ? "default" : "outline"} 
                    size="sm"
                    onClick={() => handleRate(true)}
                    disabled={rateMutation.isPending || removeRatingMutation.isPending}
                    className="flex items-center"
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    <span>{ratings?.thumbsUp || 0}</span>
                  </Button>
                  <Button 
                    variant={userRating?.rating === false ? "default" : "outline"} 
                    size="sm"
                    onClick={() => handleRate(false)}
                    disabled={rateMutation.isPending || removeRatingMutation.isPending}
                    className="flex items-center"
                  >
                    <ThumbsDown className="h-4 w-4 mr-1" />
                    <span>{ratings?.thumbsDown || 0}</span>
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium mb-1">Active Signals</div>
                    <div className="font-bold text-2xl">
                      {signals?.filter(s => s.status === 'active').length || 0}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-1">Total Signals</div>
                    <div className="font-bold text-2xl">
                      {signals?.length || 0}
                    </div>
                  </div>
                  
                  <Separator />

                  <Dialog open={subscribeDialogOpen} onOpenChange={setSubscribeDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full" size="lg">
                        Subscribe to Signals
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Subscribe to {provider?.providerDisplayName || provider?.username}'s Signals</DialogTitle>
                        <DialogDescription>
                          Get access to all premium signals from this provider.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4 py-4">
                        <div className="flex items-start space-x-2">
                          <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div className="text-sm text-muted-foreground">
                            Subscription costs £{provider?.signalFee || 10} per month. You can cancel at any time.
                          </div>
                        </div>
                        
                        <div className="bg-muted p-3 rounded-md">
                          <div className="flex items-top space-x-2">
                            <Checkbox 
                              id="terms" 
                              checked={termsAccepted}
                              onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                            />
                            <div className="grid gap-1.5">
                              <Label htmlFor="terms" className="text-sm font-medium">
                                I accept the terms and conditions
                              </Label>
                              <p className="text-xs text-muted-foreground">
                                By subscribing, you agree that all trading signals are for educational purposes only and not financial advice. 
                                Subscriptions are non-refundable and no partial refunds will be provided.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <DialogFooter>
                        <Button variant="outline" onClick={() => setSubscribeDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleSubscribe}
                          disabled={!termsAccepted || subscribeMutation.isPending}
                        >
                          {subscribeMutation.isPending ? "Processing..." : "Subscribe"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Tabs defaultValue="signals" className="w-full">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="signals">Signals</TabsTrigger>
                <TabsTrigger value="about">About</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signals" className="p-0 mt-6">
                {signals && signals.length > 0 ? (
                  <div className="space-y-4">
                    {signals.map(signal => (
                      <Card key={signal.id} className="overflow-hidden">
                        <div className="flex justify-between items-center p-4 bg-muted">
                          <div className="flex items-center space-x-2">
                            <Badge variant={signal.direction === 'buy' ? 'secondary' : 'destructive'}>
                              {signal.direction.toUpperCase()}
                            </Badge>
                            <span className="font-semibold">{signal.asset}</span>
                            <span className="text-muted-foreground text-sm">{signal.timeframe}</span>
                          </div>
                          <Badge variant={signal.status === 'active' ? 'outline' : 'secondary'}>
                            {signal.status.toUpperCase()}
                          </Badge>
                        </div>
                        <CardContent className="p-4">
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <div className="text-sm font-medium text-muted-foreground">Entry</div>
                              <div className="font-semibold">{signal.entryPrice}</div>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-muted-foreground">Stop Loss</div>
                              <div className="font-semibold">{signal.stopLoss}</div>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-muted-foreground">Take Profit</div>
                              <div className="font-semibold">{signal.takeProfit}</div>
                            </div>
                          </div>
                          {signal.analysis && (
                            <div className="mt-4">
                              <div className="text-sm font-medium text-muted-foreground">Analysis</div>
                              <p className="text-sm mt-1">{signal.analysis}</p>
                            </div>
                          )}
                        </CardContent>
                        <CardFooter className="flex justify-between p-4 pt-0 text-xs text-muted-foreground">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>
                              {signal.createdAt ? formatDistanceToNow(new Date(signal.createdAt), { addSuffix: true }) : 'unknown'}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="mr-1">Risk/Reward:</span>
                            <span className="font-medium">{signal.riskRewardRatio?.toFixed(2) || 'N/A'}</span>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 px-4">
                    <div className="mb-2 text-lg font-semibold">No signals yet</div>
                    <p className="text-muted-foreground">
                      This provider hasn't published any signals yet.
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="about" className="space-y-4 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About {provider?.username}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Member Since</div>
                        <div className="font-semibold">
                          {provider?.createdAt ? new Date(provider.createdAt).toLocaleDateString() : 'Unknown'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Subscription Tier</div>
                        <div className="font-semibold">
                          {provider?.subscriptionTier || 'Standard'}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-2">Rating</div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <ThumbsUp className="h-4 w-4 mr-1 text-green-500" />
                          <span className="font-semibold">{ratings?.thumbsUp || 0}</span>
                        </div>
                        <div className="flex items-center">
                          <ThumbsDown className="h-4 w-4 mr-1 text-red-500" />
                          <span className="font-semibold">{ratings?.thumbsDown || 0}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-2">Bio</div>
                      {provider?.bio ? (
                        <p className="text-sm">{provider.bio}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          This provider hasn't added a bio yet.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Subscription Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Award className="h-5 w-5 text-primary" />
                      <div className="font-semibold">Premium Signals Access</div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      By subscribing to this provider, you'll get access to all their premium trading signals as soon as they're published.
                    </p>
                    <div className="bg-muted p-4 rounded-md">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold">Monthly subscription</div>
                          <div className="text-sm text-muted-foreground">Billed monthly, cancel anytime</div>
                        </div>
                        <div className="text-xl font-bold">£{provider?.signalFee || 10}<span className="text-sm font-normal text-muted-foreground">/month</span></div>
                      </div>
                    </div>
                    <Button className="w-full" size="lg" onClick={() => setSubscribeDialogOpen(true)}>
                      Subscribe Now <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
};

// Skeleton loader for the provider profile
const ProviderProfileSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <Card>
          <CardHeader className="relative pb-0">
            <div className="flex flex-col items-center">
              <Skeleton className="h-16 w-16 rounded-full mb-2" />
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex justify-center space-x-4 mb-6">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>

            <div className="space-y-4">
              <div>
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-8 w-12" />
              </div>
              
              <div>
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-8 w-12" />
              </div>
              
              <Separator />

              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-2">
        <Tabs defaultValue="signals" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="signals">Signals</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signals" className="p-0 mt-6">
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="overflow-hidden">
                  <div className="p-4 bg-muted">
                    <div className="flex justify-between">
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-24" />
                      </div>
                      <Skeleton className="h-5 w-20" />
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Skeleton className="h-4 w-12 mb-1" />
                        <Skeleton className="h-6 w-20" />
                      </div>
                      <div>
                        <Skeleton className="h-4 w-16 mb-1" />
                        <Skeleton className="h-6 w-20" />
                      </div>
                      <div>
                        <Skeleton className="h-4 w-20 mb-1" />
                        <Skeleton className="h-6 w-20" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Skeleton className="h-4 w-16 mb-2" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProviderProfile;