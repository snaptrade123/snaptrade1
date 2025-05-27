import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Users, Shield, Activity, Search, Settings, Eye, UserCheck, UserX } from "lucide-react";
import { format } from "date-fns";

interface User {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
  adminPermissions: string[];
  isProvider: boolean;
  subscriptionTier: string | null;
  subscriptionStatus: string | null;
  createdAt: string;
}

interface UserDetails {
  user: User;
  subscriptionStatus: any;
  tradingSignals: any[];
  marketAlerts: any[];
  analysisUsage: number;
}

interface AdminAction {
  id: number;
  action: string;
  targetType: string;
  targetId: number | null;
  details: Record<string, any> | null;
  createdAt: string;
  adminUsername: string;
}

const ADMIN_PERMISSIONS = [
  { id: 'view_users', label: 'View Users', description: 'View user accounts and basic information' },
  { id: 'manage_users', label: 'Manage Users', description: 'Edit user accounts and subscriptions' },
  { id: 'manage_admins', label: 'Manage Admins', description: 'Grant or revoke admin privileges' },
  { id: 'view_logs', label: 'View Logs', description: 'Access admin action logs' },
  { id: 'manage_signals', label: 'Manage Signals', description: 'Moderate trading signals' },
  { id: 'support_users', label: 'User Support', description: 'Access user support tools' },
];

export default function AdminPanel() {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Fetch all users
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/users");
      return response.json();
    },
  });

  // Fetch user details when selected
  const { data: userDetails, isLoading: userDetailsLoading } = useQuery<UserDetails>({
    queryKey: ["/api/admin/users", selectedUserId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/admin/users/${selectedUserId}`);
      return response.json();
    },
    enabled: !!selectedUserId,
  });

  // Fetch admin action logs
  const { data: actionLogs = [], isLoading: logsLoading } = useQuery<AdminAction[]>({
    queryKey: ["/api/admin/action-logs"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/action-logs");
      return response.json();
    },
  });

  // Update admin status mutation
  const updateAdminStatusMutation = useMutation({
    mutationFn: async ({ userId, isAdmin, permissions }: { userId: number; isAdmin: boolean; permissions: string[] }) => {
      const response = await apiRequest("PATCH", `/api/admin/users/${userId}/admin-status`, {
        isAdmin,
        permissions
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "Admin status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update admin status",
        variant: "destructive",
      });
    },
  });

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const AdminStatusDialog = ({ user }: { user: User }) => {
    const [isAdmin, setIsAdmin] = useState(user.isAdmin);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>(user.adminPermissions || []);

    const handlePermissionChange = (permissionId: string, checked: boolean) => {
      if (checked) {
        setSelectedPermissions([...selectedPermissions, permissionId]);
      } else {
        setSelectedPermissions(selectedPermissions.filter(p => p !== permissionId));
      }
    };

    const handleSubmit = () => {
      updateAdminStatusMutation.mutate({
        userId: user.id,
        isAdmin,
        permissions: selectedPermissions
      });
    };

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Admin Settings
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Admin Settings for {user.username}</DialogTitle>
            <DialogDescription>
              Configure admin privileges and permissions
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="admin-status"
                checked={isAdmin}
                onCheckedChange={setIsAdmin}
              />
              <Label htmlFor="admin-status">Grant Admin Access</Label>
            </div>

            {isAdmin && (
              <div className="space-y-4">
                <Label className="text-sm font-medium">Permissions</Label>
                <ScrollArea className="h-48">
                  <div className="space-y-3">
                    {ADMIN_PERMISSIONS.map((permission) => (
                      <div key={permission.id} className="flex items-start space-x-3">
                        <Checkbox
                          id={permission.id}
                          checked={selectedPermissions.includes(permission.id)}
                          onCheckedChange={(checked) => 
                            handlePermissionChange(permission.id, checked as boolean)
                          }
                        />
                        <div className="space-y-1">
                          <Label htmlFor={permission.id} className="text-sm font-medium">
                            {permission.label}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            {permission.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            <Button 
              onClick={handleSubmit} 
              className="w-full"
              disabled={updateAdminStatusMutation.isPending}
            >
              {updateAdminStatusMutation.isPending ? "Updating..." : "Update Admin Status"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Control Panel</h1>
          <p className="text-muted-foreground">Manage users, permissions, and system administration</p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Admin Access
        </Badge>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="details" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            User Details
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Activity Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                View and manage user accounts and admin permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by username or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Account Type</TableHead>
                      <TableHead>Referrals</TableHead>
                      <TableHead>Provider Info</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          Loading users...
                        </TableCell>
                      </TableRow>
                    ) : filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium">{user.username}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {user.isAdmin && (
                                <Badge variant="destructive">
                                  <Shield className="w-3 h-3 mr-1" />
                                  Admin
                                </Badge>
                              )}
                              {user.isProvider && (
                                <Badge variant="secondary">Signal Provider</Badge>
                              )}
                              {user.subscriptionTier && (
                                <Badge variant="outline">{user.subscriptionTier}</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {user.subscriptionStatus === 'active' ? (
                              <Badge variant="default">Active Subscriber</Badge>
                            ) : (
                              <Badge variant="outline">Free User</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Balance:</span>
                                <Badge variant="secondary">£{user.referralBonusBalance}</Badge>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Code: {user.referralCustomName || user.referralCode || 'None'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {user.isProvider ? (
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">Fee:</span>
                                  <Badge variant="default">£{user.signalFee}</Badge>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {user.thumbsUp}👍 {user.thumbsDown}👎
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">Not a provider</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {format(new Date(user.createdAt), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedUserId(user.id)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                              <AdminStatusDialog user={user} />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {!selectedUserId ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center space-y-2">
                  <Eye className="w-12 h-12 mx-auto text-muted-foreground" />
                  <p className="text-lg font-medium">No User Selected</p>
                  <p className="text-muted-foreground">Select a user from the User Management tab to view details</p>
                </div>
              </CardContent>
            </Card>
          ) : userDetailsLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <p>Loading user details...</p>
              </CardContent>
            </Card>
          ) : userDetails ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Username</Label>
                    <p className="text-sm">{userDetails.user.username}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-sm">{userDetails.user.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Account Created</Label>
                    <p className="text-sm">{format(new Date(userDetails.user.createdAt), 'PPP')}</p>
                  </div>
                  <Separator />
                  <div>
                    <Label className="text-sm font-medium">Account Type</Label>
                    <div className="flex gap-2 mt-1">
                      {userDetails.user.isAdmin && (
                        <Badge variant="destructive">Admin</Badge>
                      )}
                      {userDetails.user.isProvider && (
                        <Badge variant="secondary">Signal Provider</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Subscription Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Current Plan</Label>
                    <p className="text-sm">
                      {userDetails.subscriptionStatus?.tier || 'Free'} 
                      {userDetails.subscriptionStatus?.active && ' (Active)'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Daily Analysis Usage</Label>
                    <p className="text-sm">
                      {userDetails.analysisUsage} / {userDetails.subscriptionStatus?.dailyLimit || 'Unlimited'}
                    </p>
                  </div>
                  {userDetails.subscriptionStatus?.endDate && (
                    <div>
                      <Label className="text-sm font-medium">Subscription Ends</Label>
                      <p className="text-sm">{format(new Date(userDetails.subscriptionStatus.endDate), 'PPP')}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Referral Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Referral Code</Label>
                    <p className="text-sm font-mono bg-muted px-2 py-1 rounded">
                      {userDetails.user.referralCustomName || userDetails.user.referralCode || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Current Balance</Label>
                    <p className="text-lg font-semibold text-green-600">
                      £{userDetails.user.referralBonusBalance}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge variant={userDetails.user.referralBonusBalance > 0 ? "default" : "outline"}>
                      {userDetails.user.referralBonusBalance > 0 ? "Active Referrer" : "No Referral Activity"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {userDetails.user.isProvider && (
                <Card>
                  <CardHeader>
                    <CardTitle>Signal Provider Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Display Name</Label>
                      <p className="text-sm">{userDetails.user.providerDisplayName || 'Not set'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Signal Fee</Label>
                      <p className="text-lg font-semibold">£{userDetails.user.signalFee}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Provider Rating</Label>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <span className="text-green-600">👍</span>
                          <span className="font-medium">{userDetails.user.thumbsUp}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-red-600">👎</span>
                          <span className="font-medium">{userDetails.user.thumbsDown}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Bio</Label>
                      <p className="text-sm bg-muted p-2 rounded">
                        {userDetails.user.bio || 'No bio provided'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Trading Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Trading Signals</Label>
                    <p className="text-sm">{userDetails.tradingSignals.length} signals created</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Market Alerts</Label>
                    <p className="text-sm">{userDetails.marketAlerts.length} alerts configured</p>
                  </div>
                </CardContent>
              </Card>

              {userDetails.user.isAdmin && (
                <Card>
                  <CardHeader>
                    <CardTitle>Admin Permissions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {userDetails.user.adminPermissions?.length > 0 ? (
                        userDetails.user.adminPermissions.map(permission => (
                          <Badge key={permission} variant="outline">
                            {ADMIN_PERMISSIONS.find(p => p.id === permission)?.label || permission}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No specific permissions assigned</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <p>Failed to load user details</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Admin Activity Logs</CardTitle>
              <CardDescription>
                Track all administrative actions performed in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logsLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          Loading activity logs...
                        </TableCell>
                      </TableRow>
                    ) : actionLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          No activity logs found
                        </TableCell>
                      </TableRow>
                    ) : (
                      actionLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm')}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.adminUsername}</Badge>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {log.action}
                            </code>
                          </TableCell>
                          <TableCell>
                            {log.targetType}
                            {log.targetId && ` #${log.targetId}`}
                          </TableCell>
                          <TableCell>
                            {log.details && (
                              <code className="text-xs">
                                {JSON.stringify(log.details, null, 2).length > 50 
                                  ? JSON.stringify(log.details).substring(0, 50) + '...'
                                  : JSON.stringify(log.details)
                                }
                              </code>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}