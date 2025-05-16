import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, CheckCircle2, Clock, DollarSign } from "lucide-react";
import { updateProviderProfile } from "@/lib/api";

// Form schema for provider profile
const providerFormSchema = z.object({
  displayName: z.string()
    .min(3, "Display name must be at least 3 characters")
    .max(50, "Display name cannot exceed 50 characters"),
  bio: z.string()
    .min(20, "Bio must be at least 20 characters")
    .max(500, "Bio cannot exceed 500 characters"),
  signalFee: z.coerce
    .number()
    .min(5, "Minimum fee is £5")
    .max(50, "Maximum fee is £50"),
});

type ProviderFormValues = z.infer<typeof providerFormSchema>;

export default function BecomeProvider() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  
  // Redirect to auth page if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to become a provider",
        variant: "destructive"
      });
      navigate("/auth");
    }
  }, [user, isLoading, navigate, toast]);
  
  // Form setup
  const form = useForm<ProviderFormValues>({
    resolver: zodResolver(providerFormSchema),
    defaultValues: {
      displayName: user?.providerDisplayName || user?.username || "",
      bio: user?.bio || "",
      signalFee: user?.signalFee || 10,
    },
  });
  
  // Create provider profile mutation
  const providerMutation = useMutation({
    mutationFn: (data: ProviderFormValues) => updateProviderProfile(data),
    onSuccess: () => {
      toast({
        title: "Provider Profile Created",
        description: "You can now provide trading signals to the community!",
      });
      
      // Invalidate user query to refresh the user data
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      
      // Navigate to the provider dashboard
      navigate("/provider-dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create provider profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: ProviderFormValues) => {
    providerMutation.mutate(data);
  };
  
  const nextStep = () => {
    const fieldsToValidate = currentStep === 1 
      ? ['displayName', 'bio'] 
      : ['signalFee'];
      
    form.trigger(fieldsToValidate as any).then((isValid) => {
      if (isValid) {
        setCurrentStep(prev => Math.min(prev + 1, 3));
      }
    });
  };
  
  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };
  
  return (
    <div className="container max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Become a Signal Provider</h1>
        <p className="text-muted-foreground mt-2">
          Share your trading expertise and earn from your recommendations
        </p>
      </div>
      
      {/* Progress indicator */}
      <div className="flex justify-between mb-8 relative">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-muted -translate-y-1/2 z-0"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
            currentStep >= 1 ? "bg-primary border-primary text-primary-foreground" : "bg-background border-muted text-muted-foreground"
          }`}>
            {currentStep > 1 ? <CheckCircle2 className="h-5 w-5" /> : "1"}
          </div>
          <span className="text-sm mt-2">Profile</span>
        </div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
            currentStep >= 2 ? "bg-primary border-primary text-primary-foreground" : "bg-background border-muted text-muted-foreground"
          }`}>
            {currentStep > 2 ? <CheckCircle2 className="h-5 w-5" /> : "2"}
          </div>
          <span className="text-sm mt-2">Pricing</span>
        </div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
            currentStep >= 3 ? "bg-primary border-primary text-primary-foreground" : "bg-background border-muted text-muted-foreground"
          }`}>
            3
          </div>
          <span className="text-sm mt-2">Review</span>
        </div>
      </div>
      
      <Card className="border-muted-foreground/20">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Step 1: Profile Information */}
            {currentStep === 1 && (
              <>
                <CardHeader>
                  <CardTitle>Provider Profile</CardTitle>
                  <CardDescription>
                    Tell the community about yourself and your trading experience
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your trading pseudonym" {...field} />
                        </FormControl>
                        <FormDescription>
                          This is the name that will be visible to other users
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trading Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Share your trading experience, strategy, and expertise..."
                            className="min-h-[120px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Describe your trading experience, preferred markets, and trading style
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                
                <CardFooter className="flex justify-between">
                  <Button variant="ghost" type="button" disabled>
                    Back
                  </Button>
                  <Button type="button" onClick={nextStep}>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </>
            )}
            
            {/* Step 2: Pricing Information */}
            {currentStep === 2 && (
              <>
                <CardHeader>
                  <CardTitle>Signal Pricing</CardTitle>
                  <CardDescription>
                    Set your fee for premium trading signals
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="signalFee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Signal Fee (£)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                              type="number" 
                              className="pl-10" 
                              placeholder="10.00" 
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          This is the amount subscribers will pay to access each of your premium signals.
                          SnapTrade takes a 15% service fee from each subscription.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Signal price</span>
                      <span className="font-medium">£{form.watch("signalFee").toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2 text-muted-foreground">
                      <span className="text-sm">SnapTrade fee (15%)</span>
                      <span>-£{(form.watch("signalFee") * 0.15).toFixed(2)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between items-center font-medium">
                      <span>Your earnings per signal</span>
                      <span className="text-primary">£{(form.watch("signalFee") * 0.85).toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between">
                  <Button variant="ghost" type="button" onClick={prevStep}>
                    Back
                  </Button>
                  <Button type="button" onClick={nextStep}>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </>
            )}
            
            {/* Step 3: Review and Submit */}
            {currentStep === 3 && (
              <>
                <CardHeader>
                  <CardTitle>Review Your Provider Profile</CardTitle>
                  <CardDescription>
                    Make sure everything looks good before becoming a provider
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Display Name</h3>
                      <p className="mt-1">{form.getValues("displayName")}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Trading Bio</h3>
                      <p className="mt-1">{form.getValues("bio")}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Signal Fee</h3>
                      <p className="mt-1">£{form.getValues("signalFee")}</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <h3 className="font-medium flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      Provider Benefits
                    </h3>
                    <ul className="mt-2 space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span>Earn 85% of your signal subscription fees</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span>Payments processed automatically when subscribers purchase your signals</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span>Build your reputation with our rating system</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between">
                  <Button variant="ghost" type="button" onClick={prevStep}>
                    Back
                  </Button>
                  <Button 
                    type="submit"
                    disabled={providerMutation.isPending}
                  >
                    {providerMutation.isPending && (
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    )}
                    Create Provider Profile
                  </Button>
                </CardFooter>
              </>
            )}
          </form>
        </Form>
      </Card>
    </div>
  );
}