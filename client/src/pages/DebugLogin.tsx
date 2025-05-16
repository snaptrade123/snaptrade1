import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function DebugLogin() {
  const { user, loginMutation } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showStatus, setShowStatus] = useState(false);
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ username, password });
  };
  
  const checkAuthStatus = () => {
    setShowStatus(true);
    console.log("Current auth state:", user);
    
    fetch('/api/check-auth', {
      credentials: 'include',
    })
      .then(res => {
        if (res.ok) {
          return res.json();
        }
        return { authenticated: false, message: "Not authenticated" };
      })
      .then(data => {
        toast({
          title: data.authenticated ? "Authenticated" : "Not Authenticated",
          description: data.message || (data.authenticated ? "You are logged in" : "You are not logged in"),
          variant: data.authenticated ? "default" : "destructive",
        });
      })
      .catch(err => {
        toast({
          title: "Error checking authentication",
          description: err.message,
          variant: "destructive",
        });
      });
  };
  
  return (
    <div className="container max-w-lg mx-auto py-12 px-4">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Debug Authentication</CardTitle>
          <CardDescription>
            Test the authentication system and diagnose issues
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {user ? (
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Currently logged in as:</h3>
              <pre className="bg-background p-3 rounded-md text-xs overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          ) : (
            <form onSubmit={handleLogin}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username"
                    placeholder="Enter your username" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password"
                    type="password" 
                    placeholder="Enter your password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Login
                </Button>
              </div>
            </form>
          )}
          
          {showStatus && (
            <div className="mt-4 border-t pt-4">
              <h3 className="font-medium mb-2">Auth Status Check Results:</h3>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">User in React context:</span> {user ? "Available" : "Not available"}
                </div>
                <div>
                  <span className="font-medium">Session status:</span> Loading...
                </div>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col gap-4">
          <Button 
            onClick={checkAuthStatus} 
            variant="outline" 
            className="w-full"
          >
            Check Authentication Status
          </Button>
          
          {user && (
            <Button 
              onClick={() => navigate("/become-provider")} 
              className="w-full"
            >
              Try Become Provider
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}