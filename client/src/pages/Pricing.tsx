import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Zap } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const features = [
  "Advanced pattern detection",
  "News sentiment analysis",
  "Market direction predictions",
  "Entry/exit price recommendations",
  "Stop loss & take profit levels",
  "Risk-reward ratio calculation",
  "Timeframe suggestions"
];

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);
  const { toast } = useToast();

  // Mutations for subscriptions
  const monthlySubscription = useMutation({
    mutationFn: async () => {
      // In a real app, you would get the user ID from auth context
      const userId = 1; // Using our test user for demonstration
      const response = await apiRequest("POST", "/api/create-monthly-subscription", { 
        userId,
        email: "test@example.com" 
      });
      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      if (data.url) {
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

  const yearlySubscription = useMutation({
    mutationFn: async () => {
      // In a real app, you would get the user ID from auth context
      const userId = 1; // Using our test user for demonstration
      const response = await apiRequest("POST", "/api/create-yearly-subscription", { 
        userId,
        email: "test@example.com" 
      });
      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      if (data.url) {
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

  const handleSubscribe = (plan: "monthly" | "yearly") => {
    if (plan === "monthly") {
      monthlySubscription.mutate();
    } else {
      yearlySubscription.mutate();
    }
  };

  return (
    <div className="container max-w-6xl py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Simple, Transparent Pricing</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Choose the plan that's right for you and start making smarter trading decisions today.
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="bg-secondary rounded-full p-1 flex items-center">
          <button 
            className={`px-4 py-2 rounded-full ${!isYearly ? 'bg-primary text-primary-foreground' : ''}`}
            onClick={() => setIsYearly(false)}
          >
            Monthly
          </button>
          <button 
            className={`px-4 py-2 rounded-full ${isYearly ? 'bg-primary text-primary-foreground' : ''}`}
            onClick={() => setIsYearly(true)}
          >
            Yearly <span className="text-xs ml-1 text-emerald-500">Save 50%</span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Monthly Plan */}
        <Card className={`border-2 ${!isYearly ? 'border-primary' : 'border-border'} shadow-lg`}>
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">Monthly Plan</CardTitle>
            <CardDescription>Perfect for active traders</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">${isYearly ? "29" : "59"}</span>
              <span className="text-muted-foreground ml-1">/month</span>
            </div>
            {isYearly && (
              <div className="mt-1 inline-block bg-emerald-500/10 text-emerald-500 text-xs px-2 py-1 rounded-full">
                Billed annually (${349}/year)
              </div>
            )}
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {features.map((feature) => (
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
              onClick={() => handleSubscribe(isYearly ? "yearly" : "monthly")}
              disabled={monthlySubscription.isPending || yearlySubscription.isPending}
            >
              {monthlySubscription.isPending || yearlySubscription.isPending ? (
                "Processing..."
              ) : (
                <>Subscribe Now <ArrowRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Yearly Plan */}
        <Card className={`border-2 ${isYearly ? 'border-primary' : 'border-border'} shadow-lg relative overflow-hidden`}>
          {!isYearly && (
            <div className="absolute top-5 right-5">
              <div className="bg-emerald-500 text-white text-xs px-3 py-1 rounded-full font-medium flex items-center">
                <Zap className="h-3 w-3 mr-1" /> Best Value
              </div>
            </div>
          )}
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">Annual Plan</CardTitle>
            <CardDescription>Best value for serious traders</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">${isYearly ? "349" : "439"}</span>
              <span className="text-muted-foreground ml-1">/year</span>
            </div>
            <div className="mt-1 inline-block bg-emerald-500/10 text-emerald-500 text-xs px-2 py-1 rounded-full">
              Save ${isYearly ? "359" : "269"} compared to monthly
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {features.map((feature) => (
                <li key={feature} className="flex items-center">
                  <Check className="h-4 w-4 text-emerald-500 mr-2" />
                  <span>{feature}</span>
                </li>
              ))}
              <li className="flex items-center font-medium text-primary">
                <Check className="h-4 w-4 text-emerald-500 mr-2" />
                <span>Priority support</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              size="lg"
              variant="default"
              onClick={() => handleSubscribe("yearly")}
              disabled={monthlySubscription.isPending || yearlySubscription.isPending}
            >
              {monthlySubscription.isPending || yearlySubscription.isPending ? (
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
        <p className="mt-2">Need help? Contact us at support@snaptrade.com</p>
      </div>
    </div>
  );
}