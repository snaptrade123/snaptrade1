import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { getProviderEarnings, getProviderPayouts, requestPayout, ProviderEarning, ProviderPayout } from '@/lib/api';

export default function ProviderEarnings() {
  const [activeTab, setActiveTab] = useState('overview');
  const [earnings, setEarnings] = useState<{
    summary: {
      availableBalance: number;
      pendingBalance: number;
      totalEarned: number;
      totalFees: number;
    };
    transactions: ProviderEarning[];
  }>({
    summary: {
      availableBalance: 0,
      pendingBalance: 0,
      totalEarned: 0,
      totalFees: 0
    },
    transactions: []
  });
  const [payouts, setPayouts] = useState<ProviderPayout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPayoutDialogOpen, setIsPayoutDialogOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState<number>(0);
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);
  
  const { toast } = useToast();

  // Load provider earnings data
  useEffect(() => {
    const loadEarningsData = async () => {
      setIsLoading(true);
      try {
        const earningsData = await getProviderEarnings();
        const payoutsData = await getProviderPayouts();
        
        setEarnings(earningsData);
        setPayouts(payoutsData);
      } catch (error) {
        toast({
          title: "Error loading earnings data",
          description: error instanceof Error ? error.message : "An unknown error occurred",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadEarningsData();
  }, [toast]);

  // Request a payout
  const handleRequestPayout = async () => {
    if (!payoutAmount || payoutAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount to withdraw",
        variant: "destructive"
      });
      return;
    }
    
    // Convert to pence (GBP)
    const amountInPence = Math.round(payoutAmount * 100);
    
    if (amountInPence > earnings.summary.availableBalance) {
      toast({
        title: "Insufficient balance",
        description: `You can only withdraw up to £${(earnings.summary.availableBalance / 100).toFixed(2)}`,
        variant: "destructive"
      });
      return;
    }
    
    setIsRequestingPayout(true);
    
    try {
      const result = await requestPayout(amountInPence);
      
      // Update the UI with the new payout
      setPayouts([result.payout, ...payouts]);
      
      // Update available balance
      setEarnings(prev => ({
        ...prev,
        summary: {
          ...prev.summary,
          availableBalance: prev.summary.availableBalance - amountInPence,
          pendingBalance: prev.summary.pendingBalance + amountInPence
        }
      }));
      
      toast({
        title: "Payout requested",
        description: result.message,
      });
      
      setIsPayoutDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error requesting payout",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsRequestingPayout(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `£${(amount / 100).toFixed(2)}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100';
      case 'pending_payout':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100';
      case 'paid_out':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      case 'pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100';
      case 'paid':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Provider Earnings</h1>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(earnings.summary.availableBalance)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Available for withdrawal
                </p>
              </CardContent>
              <CardFooter>
                <Dialog open={isPayoutDialogOpen} onOpenChange={setIsPayoutDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      disabled={earnings.summary.availableBalance <= 0} 
                      className="w-full"
                    >
                      Request Payout
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Request Payout</DialogTitle>
                      <DialogDescription>
                        Enter the amount you'd like to withdraw from your available balance of {formatCurrency(earnings.summary.availableBalance)}.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">
                          Amount
                        </Label>
                        <div className="col-span-3 relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            £
                          </span>
                          <Input
                            id="amount"
                            type="number"
                            min={0}
                            step={0.01}
                            max={(earnings.summary.availableBalance / 100)}
                            className="pl-7"
                            value={payoutAmount}
                            onChange={(e) => setPayoutAmount(parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        type="submit" 
                        onClick={handleRequestPayout}
                        disabled={isRequestingPayout || payoutAmount <= 0 || (payoutAmount * 100) > earnings.summary.availableBalance}
                      >
                        {isRequestingPayout ? "Processing..." : "Request Payout"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {formatCurrency(earnings.summary.pendingBalance)}
                </div>
                <p className="text-xs text-muted-foreground">
                  In process of being paid
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(earnings.summary.totalEarned)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Gross revenue from all subscriptions
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                  {formatCurrency(earnings.summary.totalFees)}
                </div>
                <p className="text-xs text-muted-foreground">
                  15% of gross revenue
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Your most recent earnings from user subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center p-6">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" 
                       aria-label="Loading" />
                </div>
              ) : earnings.transactions.length > 0 ? (
                <div className="space-y-4">
                  {earnings.transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="font-medium">Signal Subscription</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(transaction.earnedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status.replace('_', ' ')}
                        </Badge>
                        <p className="text-lg font-semibold">
                          {formatCurrency(transaction.netAmount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No transactions found. Start sharing premium signals to earn revenue.
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                onClick={() => setActiveTab('transactions')}
                className="w-full"
              >
                View All Transactions
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>
                A detailed view of all your earnings from signal subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center p-6">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" 
                       aria-label="Loading" />
                </div>
              ) : earnings.transactions.length > 0 ? (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {earnings.transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                        <div className="flex items-center space-x-3">
                          <div>
                            <p className="font-medium">Signal Subscription</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(transaction.earnedAt)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ID: {transaction.id}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-4">
                            <Badge className={getStatusColor(transaction.status)}>
                              {transaction.status.replace('_', ' ')}
                            </Badge>
                            <p className="text-lg font-semibold">
                              {formatCurrency(transaction.netAmount)}
                            </p>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            <span>Gross: {formatCurrency(transaction.grossAmount)}</span>
                            <span className="mx-2">•</span>
                            <span>Fee: {formatCurrency(transaction.feeAmount)} ({transaction.feePercentage}%)</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  No transactions found. Start sharing premium signals to earn revenue.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Payouts Tab */}
        <TabsContent value="payouts">
          <Card>
            <CardHeader>
              <CardTitle>Payout History</CardTitle>
              <CardDescription>
                View all your requested and processed payouts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center p-6">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" 
                       aria-label="Loading" />
                </div>
              ) : payouts.length > 0 ? (
                <div className="space-y-4">
                  {payouts.map((payout) => (
                    <div key={payout.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="font-medium">Payout Request</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(payout.createdAt)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ID: {payout.id}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge className={getStatusColor(payout.status)}>
                          {payout.status}
                        </Badge>
                        <p className="text-lg font-semibold">
                          {formatCurrency(payout.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  No payouts yet. Request a payout from your available balance.
                </div>
              )}
              {earnings.summary.availableBalance > 0 && (
                <div className="mt-6">
                  <Dialog open={isPayoutDialogOpen} onOpenChange={setIsPayoutDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full">Request New Payout</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Request Payout</DialogTitle>
                        <DialogDescription>
                          Enter the amount you'd like to withdraw from your available balance of {formatCurrency(earnings.summary.availableBalance)}.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="payout-amount" className="text-right">
                            Amount
                          </Label>
                          <div className="col-span-3 relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              £
                            </span>
                            <Input
                              id="payout-amount"
                              type="number"
                              min={0}
                              step={0.01}
                              max={(earnings.summary.availableBalance / 100)}
                              className="pl-7"
                              value={payoutAmount}
                              onChange={(e) => setPayoutAmount(parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          type="submit" 
                          onClick={handleRequestPayout}
                          disabled={isRequestingPayout || payoutAmount <= 0 || (payoutAmount * 100) > earnings.summary.availableBalance}
                        >
                          {isRequestingPayout ? "Processing..." : "Request Payout"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}