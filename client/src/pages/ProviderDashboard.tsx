import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Redirect } from 'wouter';
import ProviderEarnings from '@/components/ProviderEarnings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getProviderSubscribers, SubscriberData, updateUserProfile } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export default function ProviderDashboard() {
  const { user, isLoading } = useAuth();
  
  const [bio, setBio] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { 
    data: subscribersData,
    isLoading: isLoadingSubscribers,
    error: subscribersError
  } = useQuery<SubscriberData>({
    queryKey: ['/api/signal-subscribers'],
    queryFn: getProviderSubscribers,
    enabled: !!user,
  });
  
  // Bio update mutation
  const updateBioMutation = useMutation({
    mutationFn: (bio: string) => updateUserProfile({ bio }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: "Profile updated",
        description: "Your bio has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // When user data is loaded, set bio state
  useEffect(() => {
    if (user?.bio) {
      setBio(user.bio);
    }
  }, [user]);

  // Protected route handling
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" 
             aria-label="Loading" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Provider Dashboard</h1>
      
      <Tabs defaultValue="earnings" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="earnings">Earnings & Payouts</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>
        
        <TabsContent value="earnings">
          <ProviderEarnings />
        </TabsContent>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Provider Profile</CardTitle>
              <CardDescription>
                Update your profile information that will be visible to potential subscribers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Your Bio</h3>
                  <p className="text-sm text-muted-foreground">
                    Tell subscribers about your trading experience and expertise. This will appear on your public profile.
                  </p>
                  <Textarea
                    placeholder="I am a professional trader with 5+ years of experience specializing in forex and cryptocurrency markets..."
                    className="min-h-[150px]"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setBio(user?.bio || '')}>
                Cancel
              </Button>
              <Button 
                onClick={() => updateBioMutation.mutate(bio)}
                disabled={updateBioMutation.isPending}
              >
                {updateBioMutation.isPending ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                    Saving...
                  </>
                ) : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="subscribers">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mt-4">
            <h2 className="text-2xl font-bold mb-4">Subscribers</h2>
            
            {isLoadingSubscribers ? (
              <div className="flex items-center justify-center p-10">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" 
                     aria-label="Loading" />
              </div>
            ) : subscribersError ? (
              <div className="text-center py-6 text-red-500">
                Error loading subscribers. Please try again.
              </div>
            ) : subscribersData?.subscribers.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <p className="mb-4">You don't have any subscribers yet.</p>
                <p>Create premium signals to attract subscribers and generate revenue.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                    <p className="text-sm text-muted-foreground">Total Subscribers</p>
                    <p className="text-2xl font-bold">{subscribersData?.metrics.subscriberCount || 0}</p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                    <p className="text-sm text-muted-foreground">Available Balance</p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      £{((subscribersData?.metrics.availableBalance || 0) / 100).toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                    <p className="text-sm text-muted-foreground">Total Earned</p>
                    <p className="text-2xl font-bold">
                      £{((subscribersData?.metrics.totalEarned || 0) / 100).toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                    <p className="text-sm text-muted-foreground">Platform Fees</p>
                    <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                      £{((subscribersData?.metrics.totalFees || 0) / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-3">Active Subscribers</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-900 text-left">
                        <th className="p-3 border-b border-gray-200 dark:border-gray-700">Username</th>
                        <th className="p-3 border-b border-gray-200 dark:border-gray-700">Status</th>
                        <th className="p-3 border-b border-gray-200 dark:border-gray-700">Start Date</th>
                        <th className="p-3 border-b border-gray-200 dark:border-gray-700">End Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscribersData?.subscribers.map((subscriber) => (
                        <tr key={subscriber.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                          <td className="p-3 border-b border-gray-200 dark:border-gray-700">
                            {subscriber.username || 'Anonymous User'}
                          </td>
                          <td className="p-3 border-b border-gray-200 dark:border-gray-700">
                            <span className={`inline-block px-2 py-1 rounded text-xs ${
                              subscriber.status === 'active' 
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100' 
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                            }`}>
                              {subscriber.status}
                            </span>
                          </td>
                          <td className="p-3 border-b border-gray-200 dark:border-gray-700">
                            {new Date(subscriber.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-3 border-b border-gray-200 dark:border-gray-700">
                            {subscriber.status === 'active' 
                              ? (subscriber.endDate 
                                  ? new Date(subscriber.endDate).toLocaleDateString() 
                                  : 'Ongoing')
                              : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}