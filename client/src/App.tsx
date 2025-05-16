import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Pricing from "@/pages/Pricing";
import SubscriptionSuccess from "@/pages/SubscriptionSuccess";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/ProtectedRoute";
import AuthPage from "./pages/AuthPage";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import PatternGuide from "./pages/PatternGuide";
import UserProfile from "./pages/UserProfile";
import TradingTutorials from "./pages/TradingTutorials";
import KnowledgeBase from "./pages/KnowledgeBase";
import Features from "./pages/Features";
import ProviderDashboard from "./pages/ProviderDashboard";
import ProviderProfile from "./pages/ProviderProfile";
import BecomeProvider from "./pages/BecomeProvider";

// Feature pages
import ChartPatternDetection from "./pages/features/ChartPatternDetection";
import SentimentAnalysis from "./pages/features/SentimentAnalysis";
import MarketPredictions from "./pages/features/MarketPredictions";
import FeatureTradingSignals from "./pages/features/TradingSignals";
import TradingSignals from "./pages/TradingSignals";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/patterns" component={PatternGuide} />
      <Route path="/pattern-guide" component={PatternGuide} />
      <Route path="/tutorials" component={TradingTutorials} />
      <Route path="/trading-tutorials" component={TradingTutorials} />
      <Route path="/knowledge-base" component={KnowledgeBase} />
      <Route path="/knowledge" component={KnowledgeBase} />
      <Route path="/subscription-success" component={SubscriptionSuccess} />
      <Route path="/features" component={Features} />
      
      {/* Feature pages */}
      <Route path="/features/chart-pattern-detection" component={ChartPatternDetection} />
      <Route path="/features/sentiment-analysis" component={SentimentAnalysis} />
      <Route path="/features/market-predictions" component={MarketPredictions} />
      <Route path="/features/trading-signals" component={FeatureTradingSignals} />
      
      <ProtectedRoute path="/trading-signals" component={TradingSignals} />
      
      <ProtectedRoute path="/profile" component={UserProfile} />
      
      <ProtectedRoute path="/provider-dashboard" component={ProviderDashboard} />
      
      <ProtectedRoute path="/become-provider" component={BecomeProvider} />
      
      <Route path="/provider/:providerId" component={ProviderProfile} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">
                <Router />
              </main>
              <Footer />
              <Toaster />
            </div>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
