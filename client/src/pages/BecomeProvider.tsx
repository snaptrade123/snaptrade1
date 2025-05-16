import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Redirect, useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

// API function to create provider profile (we'll implement this)
const createProviderProfile = async (data: ProviderFormValues): Promise<any> => {
  const response = await fetch('/api/provider/profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create provider profile');
  }
  
  return response.json();
};

// Form schema
const providerFormSchema = z.object({
  displayName: z.string().min(3, { message: 'Display name must be at least 3 characters' }).optional(),
  bio: z.string().min(20, { message: 'Bio must be at least 20 characters' }).max(500, { message: 'Bio cannot exceed 500 characters' }),
  signalFee: z.coerce.number().min(1, { message: 'Fee must be at least £1' }).max(50, { message: 'Fee cannot exceed £50' }),
  termsAccepted: z.boolean().refine(val => val === true, { message: 'You must accept the terms and conditions' })
});

type ProviderFormValues = z.infer<typeof providerFormSchema>;

export default function BecomeProvider() {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Form setup
  const form = useForm<ProviderFormValues>({
    resolver: zodResolver(providerFormSchema),
    defaultValues: {
      displayName: user?.username || '',
      bio: '',
      signalFee: 5,
      termsAccepted: false
    }
  });
  
  // Create provider mutation
  const createProviderMutation = useMutation({
    mutationFn: createProviderProfile,
    onSuccess: () => {
      toast({
        title: 'Provider profile created',
        description: 'You can now provide trading signals',
      });
      navigate('/provider-dashboard');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error creating provider profile',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // Handle form submission
  const onSubmit = (data: ProviderFormValues) => {
    createProviderMutation.mutate(data);
  };
  
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
    return <Redirect to="/auth?redirect=/become-provider" />;
  }

  return (
    <div className="container max-w-3xl mx-auto py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Become a Signal Provider</h1>
          <p className="text-muted-foreground mt-2">
            Set up your provider profile to start sharing trading signals and earning income
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Provider Information</CardTitle>
            <CardDescription>
              Tell others about your trading experience and set your subscription fee
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder={user.username} {...field} />
                      </FormControl>
                      <FormDescription>
                        Leave blank to use your username ({user.username})
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
                      <FormLabel>Provider Bio</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your trading experience, expertise, and strategy..."
                          className="min-h-[120px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Your bio will be visible to potential subscribers
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="signalFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Subscription Fee (£)</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} max={50} {...field} />
                      </FormControl>
                      <FormDescription>
                        Amount subscribers will pay monthly for access to your premium signals (SnapTrade takes a 15% service fee)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Separator className="my-6" />
                
                <FormField
                  control={form.control}
                  name="termsAccepted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Provider Terms & Conditions</FormLabel>
                        <FormDescription>
                          I agree to the SnapTrade Provider Terms of Service. I understand that:
                          <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Signals I provide are for educational purposes only and not financial advice</li>
                            <li>SnapTrade will deduct 15% of subscription revenue as a service fee</li>
                            <li>Payouts are processed on a monthly basis after verification</li>
                            <li>My provider account can be terminated if I violate platform guidelines</li>
                          </ul>
                        </FormDescription>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                
                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={createProviderMutation.isPending}
                  >
                    {createProviderMutation.isPending ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                        Creating Profile...
                      </>
                    ) : "Create Provider Profile"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}