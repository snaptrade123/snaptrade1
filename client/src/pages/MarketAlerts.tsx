import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Bell, Plus, Edit, Trash2, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { MARKET_ASSETS } from "@/lib/constants";
import type { MarketAlert, InsertMarketAlert } from "@shared/schema";

export default function MarketAlerts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<MarketAlert | null>(null);

  const { data: alerts = [], isLoading } = useQuery<MarketAlert[]>({
    queryKey: ["/api/market-alerts"],
    enabled: !!user,
  });

  const createAlertMutation = useMutation({
    mutationFn: async (alertData: InsertMarketAlert) => {
      const res = await apiRequest("POST", "/api/market-alerts", alertData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/market-alerts"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Alert Created",
        description: "Your market alert has been set up successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateAlertMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<InsertMarketAlert>) => {
      const res = await apiRequest("PATCH", `/api/market-alerts/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/market-alerts"] });
      setEditingAlert(null);
      toast({
        title: "Alert Updated",
        description: "Your market alert has been updated successfully!",
      });
    },
  });

  const deleteAlertMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/market-alerts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/market-alerts"] });
      toast({
        title: "Alert Deleted",
        description: "Your market alert has been removed.",
      });
    },
  });

  const toggleAlertMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await apiRequest("PATCH", `/api/market-alerts/${id}`, { isActive });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/market-alerts"] });
    },
  });

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Market Alerts</h1>
        <p>Please log in to access market alerts.</p>
      </div>
    );
  }

  const activeAlerts = alerts.filter(alert => alert.isActive && !alert.isTriggered);
  const triggeredAlerts = alerts.filter(alert => alert.isTriggered);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8" />
            Market Alerts
          </h1>
          <p className="text-muted-foreground mt-2">
            Get notified when your watched assets hit specific price levels or technical conditions
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Alert
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Market Alert</DialogTitle>
              <DialogDescription>
                Set up a new alert for price movements or technical patterns
              </DialogDescription>
            </DialogHeader>
            <AlertForm 
              onSubmit={(data) => createAlertMutation.mutate(data)}
              isLoading={createAlertMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Active Alerts */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Active Alerts ({activeAlerts.length})
            </h2>
            {activeAlerts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No active alerts. Create your first alert to get started!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeAlerts.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onEdit={setEditingAlert}
                    onDelete={(id) => deleteAlertMutation.mutate(id)}
                    onToggle={(id, isActive) => toggleAlertMutation.mutate({ id, isActive })}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Triggered Alerts */}
          {triggeredAlerts.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Recent Triggers ({triggeredAlerts.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {triggeredAlerts.slice(0, 6).map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onEdit={setEditingAlert}
                    onDelete={(id) => deleteAlertMutation.mutate(id)}
                    onToggle={(id, isActive) => toggleAlertMutation.mutate({ id, isActive })}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Dialog */}
      {editingAlert && (
        <Dialog open={true} onOpenChange={() => setEditingAlert(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Alert</DialogTitle>
              <DialogDescription>
                Update your market alert settings
              </DialogDescription>
            </DialogHeader>
            <AlertForm 
              initialData={editingAlert}
              onSubmit={(data) => updateAlertMutation.mutate({ id: editingAlert.id, ...data })}
              isLoading={updateAlertMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function AlertCard({ 
  alert, 
  onEdit, 
  onDelete, 
  onToggle 
}: { 
  alert: MarketAlert;
  onEdit: (alert: MarketAlert) => void;
  onDelete: (id: number) => void;
  onToggle: (id: number, isActive: boolean) => void;
}) {
  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'price': return '💰';
      case 'technical': return '📊';
      case 'volume': return '📈';
      case 'news': return '📰';
      default: return '🔔';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'above': return 'text-green-600';
      case 'below': return 'text-red-600';
      case 'crosses': return 'text-blue-600';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card className={`relative ${alert.isTriggered ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <span>{getAlertTypeIcon(alert.alertType)}</span>
              {alert.asset}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {alert.assetType}
              </Badge>
              <Badge variant={alert.isTriggered ? "destructive" : "default"} className="text-xs">
                {alert.isTriggered ? "Triggered" : "Active"}
              </Badge>
            </CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(alert)}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(alert.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm font-medium">Condition</p>
          <p className={`text-sm ${getConditionColor(alert.condition)}`}>
            {alert.condition} {alert.targetValue}
          </p>
        </div>
        
        {alert.message && (
          <div>
            <p className="text-sm font-medium">Message</p>
            <p className="text-sm text-muted-foreground">{alert.message}</p>
          </div>
        )}

        {alert.isTriggered && alert.triggeredAt && (
          <div>
            <p className="text-sm font-medium">Triggered</p>
            <p className="text-sm text-muted-foreground">
              {new Date(alert.triggeredAt).toLocaleString()}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-muted-foreground">
            Created {new Date(alert.createdAt).toLocaleDateString()}
          </span>
          <Switch
            checked={alert.isActive}
            onCheckedChange={(checked) => onToggle(alert.id, checked)}
            disabled={alert.isTriggered}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function AlertForm({ 
  initialData, 
  onSubmit, 
  isLoading 
}: { 
  initialData?: MarketAlert;
  onSubmit: (data: InsertMarketAlert) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<InsertMarketAlert>({
    asset: initialData?.asset || "",
    assetType: initialData?.assetType || "",
    alertType: initialData?.alertType || "price",
    condition: initialData?.condition || "above",
    targetValue: initialData?.targetValue || "",
    message: initialData?.message || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Get all assets from constants
  const allAssets = Object.entries(MARKET_ASSETS).flatMap(([type, assets]) =>
    assets.map(asset => ({ ...asset, type }))
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="asset">Asset</Label>
        <Select value={formData.asset} onValueChange={(value) => {
          const selectedAsset = allAssets.find(a => a.value === value);
          setFormData({ 
            ...formData, 
            asset: value,
            assetType: selectedAsset?.type || ""
          });
        }}>
          <SelectTrigger>
            <SelectValue placeholder="Select an asset" />
          </SelectTrigger>
          <SelectContent>
            {allAssets.map((asset) => (
              <SelectItem key={asset.value} value={asset.value}>
                {asset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="alertType">Alert Type</Label>
        <Select value={formData.alertType} onValueChange={(value) => setFormData({ ...formData, alertType: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="price">Price Alert</SelectItem>
            <SelectItem value="technical">Technical Pattern</SelectItem>
            <SelectItem value="volume">Volume Spike</SelectItem>
            <SelectItem value="news">News Event</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="condition">Condition</Label>
        <Select value={formData.condition} onValueChange={(value) => setFormData({ ...formData, condition: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="above">Price Above</SelectItem>
            <SelectItem value="below">Price Below</SelectItem>
            <SelectItem value="crosses">Price Crosses</SelectItem>
            <SelectItem value="pattern_formed">Pattern Formed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="targetValue">Target Value</Label>
        <Input
          id="targetValue"
          value={formData.targetValue || ""}
          onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
          placeholder="e.g., 50000, support level, double top"
          required
        />
      </div>

      <div>
        <Label htmlFor="message">Custom Message (Optional)</Label>
        <Textarea
          id="message"
          value={formData.message || ""}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Custom alert message..."
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating..." : initialData ? "Update Alert" : "Create Alert"}
      </Button>
    </form>
  );
}