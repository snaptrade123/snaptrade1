import { ChartBarIcon } from "lucide-react";

const patterns = [
  {
    name: "Double Top",
    description: "A bearish reversal pattern forming after an uptrend.",
  },
  {
    name: "Head and Shoulders",
    description: "A top reversal pattern with three peaks.",
  },
  {
    name: "Bull Flag",
    description: "A consolidation pattern signaling continuation.",
  },
  {
    name: "Cup and Handle",
    description: "A bullish continuation pattern resembling a teacup.",
  },
  {
    name: "Triangle Pattern",
    description: "A consolidation pattern showing convergence.",
  },
];

const PatternInfo = () => {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="text-lg font-medium mb-4">Pattern Guide</h3>
      <div className="space-y-3 mb-4">
        {patterns.slice(0, 3).map((pattern, index) => (
          <div key={index} className="flex items-start">
            <div className="bg-background p-2 rounded mr-3">
              <ChartBarIcon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">{pattern.name}</h4>
              <p className="text-sm text-muted-foreground">{pattern.description}</p>
            </div>
          </div>
        ))}
      </div>
      <a href="/pattern-guide" className="text-primary hover:underline text-sm flex items-center">
        View all patterns
        <svg className="h-3 w-3 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </a>
    </div>
  );
};

export default PatternInfo;
