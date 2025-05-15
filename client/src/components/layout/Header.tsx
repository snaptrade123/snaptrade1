import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  MoonIcon, 
  SunIcon, 
  ChartLine, 
  Home, 
  LogOut, 
  User, 
  Loader2,
  CreditCard,
  BookOpen,
  BarChart
} from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Header = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user, isLoading, logoutMutation } = useAuth();
  const [_, setLocation] = useLocation();

  // Hydration fix for theme switcher
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleProfileClick = () => {
    setLocation("/profile");
  };

  if (!mounted) {
    return null;
  }

  return (
    <header className="border-b border-border">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center cursor-pointer">
            <ChartLine className="h-6 w-6 text-primary mr-2" />
            <h1 className="text-2xl font-bold text-foreground">SnapTrade</h1>
          </div>
        </Link>
        
        <div className="flex items-center space-x-1 md:space-x-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="hidden md:flex">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </Link>
          
          <Link href="/features">
            <Button variant="ghost" size="sm">
              <BarChart className="h-4 w-4 mr-2 md:mr-1" />
              <span className="hidden md:inline">Features</span>
            </Button>
          </Link>
          
          <Link href="/pattern-guide">
            <Button variant="ghost" size="sm">
              <BookOpen className="h-4 w-4 mr-2 md:mr-1" />
              <span className="hidden md:inline">Patterns</span>
            </Button>
          </Link>
          
          <Link href="/pricing">
            <Button variant="ghost" size="sm">
              <CreditCard className="h-4 w-4 mr-2 md:mr-1" />
              <span className="hidden md:inline">Pricing</span>
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleTheme} 
            className="flex items-center gap-1"
          >
            {theme === "dark" ? (
              <>
                <MoonIcon className="h-4 w-4 text-primary" />
                <span className="hidden md:inline">Dark</span>
              </>
            ) : (
              <>
                <SunIcon className="h-4 w-4 text-amber-500" />
                <span className="hidden md:inline">Light</span>
              </>
            )}
          </Button>
          
          {isLoading ? (
            <Button size="sm" disabled>
              <Loader2 className="h-4 w-4 animate-spin" />
            </Button>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {user.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline truncate max-w-[100px]">
                    {user.username}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleProfileClick}>
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth">
              <Button size="sm">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
