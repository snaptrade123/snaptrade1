import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import UploadSection from "@/components/UploadSection";
import PatternInfo from "@/components/PatternInfo";
import AnalysisResults from "@/components/AnalysisResults";
import AdditionalFeatures from "@/components/AdditionalFeatures";
import { AnalysisResult, SubscriptionStatus } from "@/lib/api";
import { analyzeChart, checkSubscription } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { LockIcon, ZapIcon } from "lucide-react";

const Home = () => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // In a real app, we would get the user ID from an auth context
  const userId = 1; // Using our test user
  
  // Query subscription status
  const { data: subscriptionData, isLoading: isLoadingSubscription } = useQuery({
    queryKey: ['subscription', userId],
    queryFn: async () => {
      return await checkSubscription(userId);
    }
  });
  
  const analyzeChartMutation = useMutation({
    mutationFn: async ({ file, asset }: { file: File, asset: string }) => {
      const result = await analyzeChart(file, asset);
      return result;
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      toast({
        title: "Analysis complete",
        description: "Your chart has been successfully analyzed",
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  const handleUpload = async (file: File, asset: string) => {
    // Check if the user has an active subscription
    if (subscriptionData?.active) {
      analyzeChartMutation.mutate({ file, asset });
    } else {
      toast({
        title: "Subscription Required",
        description: "You need a subscription to analyze charts. Please subscribe to continue.",
        variant: "destructive",
      });
      
      // Redirect to pricing page after a short delay
      setTimeout(() => {
        setLocation("/pricing");
      }, 1500);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Subscription Status Banner */}
      {!isLoadingSubscription && !subscriptionData?.active && (
        <div className="mb-8 p-4 border-2 border-primary/50 bg-primary/5 rounded-lg flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center mb-4 sm:mb-0">
            <LockIcon className="h-6 w-6 text-primary mr-3" />
            <div>
              <h3 className="font-semibold text-lg">Premium Features Locked</h3>
              <p className="text-sm text-muted-foreground">Subscribe to unlock advanced chart analysis and predictions</p>
            </div>
          </div>
          <Link href="/pricing">
            <Button className="w-full sm:w-auto" size="lg">
              <ZapIcon className="mr-2 h-4 w-4" />
              Get Premium
            </Button>
          </Link>
        </div>
      )}
      
      {/* Subscription Active Banner */}
      {!isLoadingSubscription && subscriptionData?.active && (
        <div className="mb-8 p-4 border-2 border-emerald-500/50 bg-emerald-500/5 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <ZapIcon className="h-6 w-6 text-emerald-500 mr-3" />
            <div>
              <h3 className="font-semibold text-lg">Premium Subscription Active</h3>
              <p className="text-sm text-muted-foreground">
                {subscriptionData.tier === 'yearly' ? 'Annual Plan' : 'Monthly Plan'} 
                {subscriptionData.endDate ? ` · Renews ${new Date(subscriptionData.endDate).toLocaleDateString()}` : ''}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Chart Pattern Analysis</h2>
        <p className="text-muted-foreground">Upload a financial chart to analyze patterns and get market predictions</p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Upload and Asset Selection */}
        <div className="lg:col-span-1">
          <UploadSection 
            onUpload={handleUpload} 
            isLoading={analyzeChartMutation.isPending}
          />
          <PatternInfo />
        </div>

        {/* Middle and Right Columns - Analysis Results */}
        <div className="lg:col-span-2">
          <AnalysisResults 
            result={analysisResult} 
            isLoading={analyzeChartMutation.isPending}
          />
          <AdditionalFeatures />
        </div>
      </div>
    </div>
  );
};

export default Home;
