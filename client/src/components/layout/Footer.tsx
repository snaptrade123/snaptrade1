import { Link } from "wouter";
import { ChartLine } from "lucide-react";
import { 
  FaTwitter, 
  FaLinkedin, 
  FaGithub 
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-12 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <ChartLine className="h-5 w-5 text-primary mr-2" />
              <h3 className="text-xl font-bold text-foreground">SnapTrade</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Analyze financial chart patterns with AI-powered technology for smarter trading decisions.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <FaTwitter />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <FaLinkedin />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <FaGithub />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Features</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Chart Pattern Detection</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Sentiment Analysis</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Market Predictions</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Trading Signals</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Pattern Guide</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">API Documentation</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Trading Tutorials</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Knowledge Base</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              <li><Link href="/terms-of-service" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground mb-4 md:mb-0">© {new Date().getFullYear()} SnapTrade. All rights reserved.</p>
          <div className="flex items-center">
            <span className="text-xs text-muted-foreground mr-2">Powered by</span>
            <span className="text-xs bg-background px-2 py-1 rounded mr-2">OpenCV</span>
            <span className="text-xs bg-background px-2 py-1 rounded mr-2">OpenAI</span>
            <span className="text-xs bg-background px-2 py-1 rounded">Financial APIs</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
