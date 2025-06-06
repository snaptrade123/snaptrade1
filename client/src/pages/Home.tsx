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
      // Check if this is a limit reached error
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      
      if (errorMessage.includes("Daily analysis limit reached")) {
        // Extract usage information, if available
        const limitMatch = errorMessage.match(/\((\d+)\/(\d+)\)/);
        const usageCount = limitMatch?.[1] ? parseInt(limitMatch[1]) : 0;
        const limit = limitMatch?.[2] ? parseInt(limitMatch[2]) : 0;
        
        toast({
          title: "Daily Limit Reached",
          description: `You've used ${usageCount} of ${limit} analyses today. Upgrade to Premium tier for more analyses.`,
          variant: "destructive",
        });
        
        // Optionally redirect to pricing page after a delay
        setTimeout(() => {
          setLocation("/pricing");
        }, 3000);
      } else if (errorMessage.includes("subscription required") || errorMessage.includes("Authentication required")) {
        toast({
          title: "Subscription Required",
          description: "You need an active subscription to analyze charts.",
          variant: "destructive",
        });
        
        // Redirect to pricing page
        setTimeout(() => {
          setLocation("/pricing");
        }, 1500);
      } else {
        toast({
          title: "Analysis failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
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
      {/* Subscription banner - only shown when active */}
      {subscriptionData?.active && (
        <div className={`mb-8 p-4 border-2 rounded-lg flex items-center justify-between ${
          subscriptionData.tier === 'premium' 
            ? 'border-emerald-500/50 bg-emerald-500/5' 
            : 'border-violet-500/50 bg-violet-500/5'
        }`}>
          <div className="flex items-center">
            <ZapIcon className={`h-6 w-6 mr-3 ${
              subscriptionData.tier === 'premium' ? 'text-emerald-500' : 'text-violet-500'
            }`} />
            <div>
              <h3 className="font-semibold text-lg">
                {subscriptionData.tier === 'premium' ? 'Premium' : 'Standard'} Subscription Active
              </h3>
              <p className="text-sm text-muted-foreground">
                {subscriptionData.dailyLimit ? `${subscriptionData.dailyLimit} analyses per day` : ''} 
                {subscriptionData.endDate ? ` - Expires: ${new Date(subscriptionData.endDate).toLocaleDateString()}` : ''}
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
