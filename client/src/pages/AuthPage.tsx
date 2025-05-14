import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Loader2, ChevronRight, Lock, Mail, User } from "lucide-react";
import { Link } from "wouter";

// Login schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Register schema
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const { user, loginMutation, registerMutation } = useAuth();
  const [_, setLocation] = useLocation();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onLoginSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onRegisterSubmit = (values: RegisterFormValues) => {
    // Omit confirmPassword when sending to API
    const { confirmPassword, ...registerData } = values;
    registerMutation.mutate(registerData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left side: Form */}
        <Card className="w-full max-w-md mx-auto shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {activeTab === "login" ? "Welcome back" : "Create an account"}
            </CardTitle>
            <CardDescription className="text-center">
              {activeTab === "login" 
                ? "Enter your credentials to sign in" 
                : "Fill in your details to create a new account"}
            </CardDescription>
          </CardHeader>
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            {/* Login Form */}
            <TabsContent value="login">
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                <CardContent className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-username">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>Username</span>
                      </div>
                    </Label>
                    <Input 
                      id="login-username"
                      placeholder="Enter your username" 
                      {...loginForm.register("username")}
                    />
                    {loginForm.formState.errors.username && (
                      <p className="text-sm text-destructive">
                        {loginForm.formState.errors.username.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">
                      <div className="flex items-center space-x-2">
                        <Lock className="h-4 w-4" />
                        <span>Password</span>
                      </div>
                    </Label>
                    <Input 
                      id="login-password"
                      type="password" 
                      placeholder="Enter your password" 
                      {...loginForm.register("password")}
                    />
                    {loginForm.formState.errors.password && (
                      <p className="text-sm text-destructive">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ChevronRight className="mr-2 h-4 w-4" />
                    )}
                    Login
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
            
            {/* Register Form */}
            <TabsContent value="register">
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                <CardContent className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-username">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>Username</span>
                      </div>
                    </Label>
                    <Input 
                      id="register-username"
                      placeholder="Choose a username" 
                      {...registerForm.register("username")}
                    />
                    {registerForm.formState.errors.username && (
                      <p className="text-sm text-destructive">
                        {registerForm.formState.errors.username.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span>Email</span>
                      </div>
                    </Label>
                    <Input 
                      id="register-email"
                      type="email" 
                      placeholder="Enter your email" 
                      {...registerForm.register("email")}
                    />
                    {registerForm.formState.errors.email && (
                      <p className="text-sm text-destructive">
                        {registerForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">
                      <div className="flex items-center space-x-2">
                        <Lock className="h-4 w-4" />
                        <span>Password</span>
                      </div>
                    </Label>
                    <Input 
                      id="register-password"
                      type="password" 
                      placeholder="Create a password" 
                      {...registerForm.register("password")}
                    />
                    {registerForm.formState.errors.password && (
                      <p className="text-sm text-destructive">
                        {registerForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password">
                      <div className="flex items-center space-x-2">
                        <Lock className="h-4 w-4" />
                        <span>Confirm Password</span>
                      </div>
                    </Label>
                    <Input 
                      id="register-confirm-password"
                      type="password" 
                      placeholder="Confirm your password" 
                      {...registerForm.register("confirmPassword")}
                    />
                    {registerForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-destructive">
                        {registerForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    By registering, you agree to our <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ChevronRight className="mr-2 h-4 w-4" />
                    )}
                    Create Account
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Right side: Information */}
        <div className="hidden md:flex flex-col space-y-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">SnapTrade</h2>
            <p className="text-xl text-muted-foreground mt-2">
              AI-Powered Chart Analysis for Smarter Trading Decisions
            </p>
          </div>
          
          <div className="space-y-8">
            <div className="border rounded-lg p-5">
              <h3 className="text-lg font-semibold mb-2">Pattern Recognition</h3>
              <p className="text-muted-foreground">
                Identify key trading patterns instantly with our advanced AI analysis
              </p>
            </div>
            
            <div className="border rounded-lg p-5">
              <h3 className="text-lg font-semibold mb-2">News Sentiment</h3>
              <p className="text-muted-foreground">
                Get real-time market sentiment analysis from financial news
              </p>
            </div>
            
            <div className="border rounded-lg p-5">
              <h3 className="text-lg font-semibold mb-2">Trading Recommendations</h3>
              <p className="text-muted-foreground">
                Receive specific entry, stop-loss, and take-profit levels for your trades
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}