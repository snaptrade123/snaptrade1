import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Copy, Link as LinkIcon, RefreshCw, CheckIcon, ZapIcon, Users, ExternalLink } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Interfaces
interface ReferralInfo {
  referralCode: string;
  referralCustomName: string | null;
  referralUrl: string;
  referralBonusBalance: number;
  totalReferrals: number;
  successfulReferrals: number;
  bonusAmount: number;
}

export default function UserProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [customName, setCustomName] = useState("");
  const [redeemAmount, setRedeemAmount] = useState(10);
  const [copied, setCopied] = useState(false);

  // Fetch referral info
  const {
    data: referralInfo,
    isLoading,
    error,
    refetch
  } = useQuery<ReferralInfo>({
    queryKey: ["/api/referral", user?.id],
    queryFn: async () => {
      if (!user) return null as any;
      const res = await apiRequest("GET", `/api/referral/${user.id}`);
      return await res.json();
    },
    enabled: !!user,
  });

  // Update referral name mutation
  const updateReferralName = useMutation({
    mutationFn: async (name: string) => {
      if (!user?.id) throw new Error("User ID required");
      
      // Use direct route that doesn't require authentication
      const res = await apiRequest("POST", `/api/referral/update-name-direct/${user.id}`, { 
        customName: name
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Referral link updated",
        description: "Your custom referral name has been updated successfully",
      });
      setCustomName("");
      queryClient.invalidateQueries({ queryKey: ["/api/referral", user?.id] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update referral name",
        variant: "destructive",
      });
    },
  });

  // Redeem referral bonus mutation
  const redeemBonus = useMutation({
    mutationFn: async (amount: number) => {
      const res = await apiRequest("POST", "/api/referral/redeem", { amount });
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Bonus redeemed",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/referral", user?.id] });
    },
    onError: (error: Error) => {
      toast({
        title: "Redemption failed",
        description: error.message || "Failed to redeem bonus",
        variant: "destructive",
      });
    },
  });

  // Handler for updating custom name
  const handleUpdateName = () => {
    if (!customName.trim()) {
      toast({
        title: "Empty name",
        description: "Please enter a custom name for your referral link",
        variant: "destructive",
      });
      return;
    }
    updateReferralName.mutate(customName);
  };

  // Handler for redeeming bonus
  const handleRedeemBonus = () => {
    if (!referralInfo || referralInfo.referralBonusBalance < redeemAmount) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough bonus balance to redeem this amount",
        variant: "destructive",
      });
      return;
    }
    redeemBonus.mutate(redeemAmount);
  };

  // Copy referral link to clipboard
  const copyReferralLink = () => {
    if (referralInfo?.referralUrl) {
      navigator.clipboard.writeText(referralInfo.referralUrl);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Your referral link has been copied to clipboard",
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!user) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Login Required</CardTitle>
            <CardDescription>You must be logged in to view your profile</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

      <Tabs defaultValue="referrals" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        {/* Referrals Tab */}
        <TabsContent value="referrals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Your Referral Program
              </CardTitle>
              <CardDescription>
                Earn £10 in bonus credit for each person who subscribes using your referral link
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Referral Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-primary/5">
                  <CardHeader className="py-4 px-4">
                    <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2 px-4">
                    {isLoading ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      <span className="text-2xl font-bold">{referralInfo?.totalReferrals || 0}</span>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-primary/5">
                  <CardHeader className="py-4 px-4">
                    <CardTitle className="text-sm font-medium">Successful Referrals</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2 px-4">
                    {isLoading ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      <span className="text-2xl font-bold">{referralInfo?.successfulReferrals || 0}</span>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-primary/5">
                  <CardHeader className="py-4 px-4">
                    <CardTitle className="text-sm font-medium">Bonus Balance</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2 px-4">
                    {isLoading ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      <div className="space-y-2">
                        <span className="text-2xl font-bold">£{referralInfo?.referralBonusBalance || 0}</span>
                        {(referralInfo?.referralBonusBalance || 0) > 0 && (
                          <div className="flex flex-col space-y-2">
                            <div className="text-sm text-muted-foreground">
                              Use your bonus credit towards your next subscription
                            </div>
                            <Button 
                              size="sm" 
                              className="bg-emerald-600 hover:bg-emerald-700 text-white w-full md:w-auto"
                              onClick={() => window.location.href = "/pricing"}
                            >
                              <ZapIcon className="mr-2 h-4 w-4" />
                              Redeem on Subscription
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Bonus Balance Redemption */}
              {(referralInfo?.referralBonusBalance || 0) > 0 && (
                <Card className="bg-emerald-50 border-emerald-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center text-emerald-800">
                      <ZapIcon className="mr-2 h-5 w-5 text-emerald-600" />
                      Redeem Your Bonus Credit
                    </CardTitle>
                    <CardDescription className="text-emerald-700">
                      You have <span className="font-bold">£{referralInfo.referralBonusBalance}</span> available to use towards your subscription
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-white p-3 rounded-md border border-emerald-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Monthly Subscription</div>
                            <div className="text-sm text-muted-foreground">Regular price: £59</div>
                          </div>
                          <Button
                            onClick={() => window.location.href = "/pricing"}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            Apply £{Math.min(referralInfo.referralBonusBalance, 59)}
                            <ExternalLink className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="bg-white p-3 rounded-md border border-emerald-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Annual Subscription</div>
                            <div className="text-sm text-muted-foreground">Regular price: £399</div>
                          </div>
                          <Button
                            onClick={() => window.location.href = "/pricing"}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            Apply £{Math.min(referralInfo.referralBonusBalance, 399)}
                            <ExternalLink className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Referral Link */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="referral-link">Your Referral Link</Label>
                  <div className="flex mt-1.5">
                    <Input 
                      id="referral-link" 
                      readOnly
                      value={isLoading ? "Loading..." : referralInfo?.referralUrl || ""}
                      className="flex-1 pr-10"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="ml-2" 
                      onClick={copyReferralLink}
                      disabled={isLoading}
                    >
                      {copied ? <CheckIcon className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Customize Referral Link */}
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-medium mb-2">Customize Your Referral Link</h3>
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <Input
                        placeholder="Enter a custom name for your link"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Your link will be: https://snaptrade.co.uk/r/{customName || "custom-name"}
                      </p>
                    </div>
                    <Button 
                      onClick={handleUpdateName}
                      disabled={updateReferralName.isPending || !customName.trim()}
                    >
                      {updateReferralName.isPending ? (
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <LinkIcon className="h-4 w-4 mr-2" />
                      )}
                      Update
                    </Button>
                  </div>
                </div>

                {/* Redeem Bonus */}
                {(referralInfo?.referralBonusBalance ?? 0) > 0 && (
                  <div className="bg-emerald-50 border-emerald-200 border p-4 rounded-md mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-emerald-700">Redeem Bonus Credit</h3>
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 font-semibold">
                        Available: £{referralInfo?.referralBonusBalance || 0}
                      </Badge>
                    </div>
                    <div className="mb-2">
                      <p className="text-sm text-slate-600">
                        You can use your referral credits to get a discount on your next subscription payment.
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <Input
                          type="number"
                          min={1}
                          max={referralInfo?.referralBonusBalance || 0}
                          value={redeemAmount}
                          onChange={(e) => setRedeemAmount(parseInt(e.target.value) || 0)}
                          className="border-emerald-200 focus:border-emerald-300"
                        />
                        <p className="text-xs text-emerald-700 font-medium mt-1">
                          This credit will be automatically applied to your next subscription payment
                        </p>
                      </div>
                      <Button
                        onClick={handleRedeemBonus}
                        disabled={redeemBonus.isPending || !redeemAmount || redeemAmount > (referralInfo?.referralBonusBalance || 0)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        {redeemBonus.isPending ? (
                          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <ZapIcon className="h-4 w-4 mr-2" />
                        )}
                        Redeem Now
                      </Button>
                    </div>
                    <div className="mt-3 flex items-center">
                      <ExternalLink className="h-4 w-4 mr-2 text-emerald-600" />
                      <a href="/pricing" className="text-sm text-emerald-600 hover:text-emerald-800 font-medium">
                        Go to pricing page to subscribe with your credit
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Tab - Basic info for now */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                View and update your profile details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={user.username} readOnly />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user.email || "No email provided"} readOnly />
              </div>
              {/* Additional profile fields can be added here */}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}