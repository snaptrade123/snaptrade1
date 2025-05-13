import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon, ChartLine } from "lucide-react";
import { useTheme } from "next-themes";

const Header = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Hydration fix for theme switcher
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (!mounted) {
    return null;
  }

  return (
    <header className="border-b border-border">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/">
          <a className="flex items-center">
            <ChartLine className="h-6 w-6 text-primary mr-2" />
            <h1 className="text-2xl font-bold text-foreground">SnapTrade</h1>
          </a>
        </Link>
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleTheme} 
            className="flex items-center gap-2"
          >
            {theme === "dark" ? (
              <>
                <MoonIcon className="h-4 w-4 text-primary" />
                <span className="hidden sm:inline">Dark Mode</span>
              </>
            ) : (
              <>
                <SunIcon className="h-4 w-4 text-amber-500" />
                <span className="hidden sm:inline">Light Mode</span>
              </>
            )}
          </Button>
          <Button size="sm">Sign In</Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
