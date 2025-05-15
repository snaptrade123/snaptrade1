import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Zap, GiftIcon, Loader2 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const standardFeatures = [
  "Advanced pattern detection",
  "News sentiment analysis",
  "Market direction predictions",
  "Entry/exit price education",
  "Stop loss & take profit levels",
  "Risk-reward ratio calculation",
  "10 analyses per day"
];

const premiumFeatures = [
  "Advanced pattern detection",
  "News sentiment analysis",
  "Market direction predictions",
  "Entry/exit price education",
  "Stop loss & take profit levels",
  "Risk-reward ratio calculation",
  "20 analyses per day",
  "Priority support"
];

export default function Pricing() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [applyReferralCredit, setApplyReferralCredit] = useState(false);

  // Get user referral info
  const { data: referralInfo, isLoading: referralLoading } = useQuery({
    queryKey: ["/api/referral", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const res = await apiRequest("GET", `/api/referral/${user.id}`);
      return res.json();
    },
    enabled: !!user,
  });
  
  const referralBalance = referralInfo?.referralBonusBalance || 0;
  const hasReferralBalance = referralBalance > 0;

  // Mutations for subscriptions
  const createSubscription = useMutation({
    mutationFn: async ({
      plan,
      tier
    }: {
      plan: "monthly" | "yearly";
      tier: "standard" | "premium";
    }) => {
      if (!user) {
        // Redirect to login if not authenticated
        window.location.href = "/auth";
        return null;
      }
      
      const endpoint = plan === "monthly" 
        ? "/api/create-monthly-subscription" 
        : "/api/create-yearly-subscription";
      
      const response = await apiRequest("POST", endpoint, { 
        userId: user.id,
        email: user.email,
        applyReferralCredit: applyReferralCredit,
        tier: tier
      });
      
      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      if (data?.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create subscription. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubscribe = (selectedPlan: "monthly" | "yearly" | "monthly-premium" | "yearly-premium") => {
    const tier = selectedPlan.includes("premium") ? "premium" : "standard";
    const plan = selectedPlan.includes("monthly") ? "monthly" : "yearly";
    
    createSubscription.mutate({ plan, tier });
  };

  return (
    <div className="container max-w-6xl py-12 mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Simple, Transparent Pricing</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Choose the plan that's right for you and start making smarter trading decisions today.
        </p>
      </div>
      
      {/* Referral Credits Section */}
      {user && (
        <div className="mb-8 bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col md:flex-row items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center mb-4 md:mb-0">
            <GiftIcon className="h-5 w-5 mr-3 text-primary" />
            <div>
              {referralLoading ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Loading referral information...</span>
                </div>
              ) : hasReferralBalance ? (
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-200">
                    You have <Badge variant="secondary" className="ml-1 mr-1 bg-primary/20 text-primary font-bold">£{referralBalance}</Badge> 
                    in referral credits!
                  </span>
                  <span className="text-sm text-slate-400 mt-1">
                    Apply your credits to your subscription for an instant discount.
                  </span>
                </div>
              ) : (
                <div>
                  <span className="font-medium text-slate-200">Earn £10 in credit for each friend who subscribes.</span>
                  <div className="flex items-center mt-1">
                    <ArrowRight className="h-3 w-3 mr-1 text-primary" />
                    <a href="/profile" className="text-sm text-primary hover:text-primary/80 font-medium">
                      Visit your profile to get your referral link
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {hasReferralBalance ? (
            <div className="flex items-center space-x-3 bg-slate-800 py-2 px-4 rounded-lg border border-slate-700">
              <Checkbox 
                id="applyCredit" 
                checked={applyReferralCredit}
                onCheckedChange={(checked) => setApplyReferralCredit(checked === true)}
                className="border-primary/60 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
              />
              <Label 
                htmlFor="applyCredit" 
                className="cursor-pointer font-medium text-slate-200"
              >
                Apply £{Math.min(referralBalance, 59)} credit to my subscription
              </Label>
            </div>
          ) : null}
        </div>
      )}

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">Choose Your Plan</h2>
        <p className="text-muted-foreground mt-2">Select the tier that best fits your trading needs</p>
      </div>

      {/* Tier Selection - 2x2 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* STANDARD TIER - Monthly */}
        <Card className="border-2 border-violet-500/30 shadow-lg">
          <CardHeader>
            <div className="bg-violet-500/10 inline-block py-1 px-3 rounded-full text-violet-500 text-sm font-medium mb-2">STANDARD</div>
            <CardTitle className="flex items-center text-2xl">Monthly Plan</CardTitle>
            <CardDescription>Perfect for regular traders</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">£59</span>
              <span className="text-muted-foreground ml-1">/month</span>
              
              {hasReferralBalance && applyReferralCredit && (
                <div className="mt-2 bg-emerald-900/20 border border-emerald-700/40 rounded-md p-2 flex items-center">
                  <Check className="h-4 w-4 text-emerald-500 mr-2" />
                  <div>
                    <div className="text-emerald-500 font-semibold text-sm">
                      £{Math.min(referralBalance, 59)} referral credit applied
                    </div>
                    <div className="text-emerald-400 text-xs font-medium">
                      Total: £{Math.max(0, 59 - Math.min(referralBalance, 59))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {standardFeatures.map((feature) => (
                <li key={feature} className="flex items-center">
                  <Check className="h-4 w-4 text-emerald-500 mr-2" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => handleSubscribe("monthly")}
              disabled={createSubscription.isPending}
            >
              {createSubscription.isPending ? (
                "Processing..."
              ) : (
                <>Subscribe Now <ArrowRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* PREMIUM TIER - Monthly */}
        <Card className="border-2 border-primary shadow-lg">
          <CardHeader>
            <div className="bg-primary/10 inline-block py-1 px-3 rounded-full text-primary text-sm font-medium mb-2">PREMIUM</div>
            <CardTitle className="flex items-center text-2xl">Monthly Plan</CardTitle>
            <CardDescription>Advanced features for serious traders</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">£79</span>
              <span className="text-muted-foreground ml-1">/month</span>
              
              {hasReferralBalance && applyReferralCredit && (
                <div className="mt-2 bg-emerald-50 border border-emerald-200 rounded-md p-2 flex items-center">
                  <Check className="h-4 w-4 text-emerald-600 mr-2" />
                  <div>
                    <div className="text-emerald-700 font-semibold text-sm">
                      £{Math.min(referralBalance, 79)} referral credit applied
                    </div>
                    <div className="text-emerald-600 text-xs font-medium">
                      Total: £{Math.max(0, 79 - Math.min(referralBalance, 79))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {premiumFeatures.map((feature) => (
                <li key={feature} className="flex items-center">
                  <Check className="h-4 w-4 text-emerald-500 mr-2" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => handleSubscribe("monthly-premium")}
              disabled={createSubscription.isPending}
            >
              {createSubscription.isPending ? (
                "Processing..."
              ) : (
                <>Subscribe Now <ArrowRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* STANDARD TIER - Annual */}
        <Card className="border-2 border-violet-500/30 shadow-lg">
          <CardHeader>
            <div className="bg-violet-500/10 inline-block py-1 px-3 rounded-full text-violet-500 text-sm font-medium mb-2">STANDARD</div>
            <CardTitle className="flex items-center text-2xl">Annual Plan</CardTitle>
            <CardDescription>Great value for regular traders</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">£399</span>
              <span className="text-muted-foreground ml-1">/year</span>
              
              {hasReferralBalance && applyReferralCredit && (
                <div className="mt-2 bg-emerald-900/20 border border-emerald-700/40 rounded-md p-2 flex items-center">
                  <Check className="h-4 w-4 text-emerald-500 mr-2" />
                  <div>
                    <div className="text-emerald-500 font-semibold text-sm">
                      £{Math.min(referralBalance, 399)} referral credit applied
                    </div>
                    <div className="text-emerald-400 text-xs font-medium">
                      Total: £{Math.max(0, 399 - Math.min(referralBalance, 399))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-1 inline-block bg-emerald-500/10 text-emerald-500 text-xs px-2 py-1 rounded-full">
              Save £309 compared to monthly
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {standardFeatures.map((feature) => (
                <li key={feature} className="flex items-center">
                  <Check className="h-4 w-4 text-emerald-500 mr-2" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => handleSubscribe("yearly")}
              disabled={createSubscription.isPending}
            >
              {createSubscription.isPending ? (
                "Processing..."
              ) : (
                <>Subscribe Now <ArrowRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* PREMIUM TIER - Annual */}
        <Card className="border-2 border-primary shadow-lg relative overflow-hidden">
          <div className="absolute top-5 right-5">
            <div className="bg-emerald-500 text-white text-xs px-3 py-1 rounded-full font-medium flex items-center">
              <Zap className="h-3 w-3 mr-1" /> Best Value
            </div>
          </div>
          <CardHeader>
            <div className="bg-primary/10 inline-block py-1 px-3 rounded-full text-primary text-sm font-medium mb-2">PREMIUM</div>
            <CardTitle className="flex items-center text-2xl">Annual Plan</CardTitle>
            <CardDescription>Best value for serious traders</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">£549</span>
              <span className="text-muted-foreground ml-1">/year</span>
              
              {hasReferralBalance && applyReferralCredit && (
                <div className="mt-2 bg-emerald-50 border border-emerald-200 rounded-md p-2 flex items-center">
                  <Check className="h-4 w-4 text-emerald-600 mr-2" />
                  <div>
                    <div className="text-emerald-700 font-semibold text-sm">
                      £{Math.min(referralBalance, 549)} referral credit applied
                    </div>
                    <div className="text-emerald-600 text-xs font-medium">
                      Total: £{Math.max(0, 549 - Math.min(referralBalance, 549))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-1 inline-block bg-emerald-500/10 text-emerald-500 text-xs px-2 py-1 rounded-full">
              Save £399 compared to monthly
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {premiumFeatures.map((feature) => (
                <li key={feature} className="flex items-center">
                  <Check className="h-4 w-4 text-emerald-500 mr-2" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              size="lg"
              variant="default"
              onClick={() => handleSubscribe("yearly-premium")}
              disabled={createSubscription.isPending}
            >
              {createSubscription.isPending ? (
                "Processing..."
              ) : (
                <>Subscribe Now <ArrowRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-12 text-center text-muted-foreground text-sm">
        <p>All plans include a 7-day money-back guarantee. No questions asked.</p>
        <p className="mt-2">Need help? Contact us at support@snaptrade.co.uk</p>
      </div>
    </div>
  );
}