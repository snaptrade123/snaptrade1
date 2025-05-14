import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SubscriptionSuccess() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionDetails, setSubscriptionDetails] = useState<{
    tier: string;
    endDate?: string;
  } | null>(null);

  useEffect(() => {
    // Get the session ID from the URL
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    if (sessionId) {
      // In a real app, you would verify the session with Stripe
      // For now, we'll just simulate the subscription status
      setTimeout(() => {
        setSubscriptionDetails({
          tier: "premium",
          endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toLocaleDateString()
        });
        setIsLoading(false);
        
        toast({
          title: "Subscription active!",
          description: "Thank you for subscribing to SnapTrade Premium.",
        });
      }, 1500);
    } else {
      setIsLoading(false);
    }
  }, [toast]);

  return (
    <div className="container max-w-md py-12">
      <Card className="shadow-lg border-2 border-emerald-500">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
            <CheckCircle className="h-6 w-6 text-emerald-500" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            Your subscription has been activated
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center pt-4">
          {isLoading ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              <p className="text-muted-foreground">Activating your subscription...</p>
            </div>
          ) : subscriptionDetails ? (
            <div className="space-y-4">
              <div className="p-4 bg-secondary/50 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Subscription Type</div>
                <div className="font-semibold">SnapTrade Premium</div>
              </div>
              
              {subscriptionDetails.endDate && (
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Next Billing Date</div>
                  <div className="font-semibold">{subscriptionDetails.endDate}</div>
                </div>
              )}
              
              <p className="text-sm text-muted-foreground pt-4">
                You'll receive a confirmation email with more details shortly.
              </p>
            </div>
          ) : (
            <p className="text-amber-500">
              No subscription information found. If you believe this is an error, please contact support.
            </p>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <Button
            onClick={() => setLocation("/")}
            variant="outline"
            className="mr-2"
          >
            <Home className="h-4 w-4 mr-2" />
            Return Home
          </Button>
          <Button onClick={() => setLocation("/")}>
            Start Analyzing
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}