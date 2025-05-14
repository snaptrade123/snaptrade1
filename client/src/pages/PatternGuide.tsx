import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CHART_PATTERNS } from "@/lib/constants";

type PatternType = 'bullish' | 'bearish' | 'neutral';
type Pattern = {
  id: string;
  name: string;
  description: string;
  type: PatternType;
  characteristics?: string[];
  strategy?: string;
  image?: string;
};

type PatternsByType = {
  [key in PatternType]?: Pattern[];
};

export default function PatternGuide() {
  const [selectedTab, setSelectedTab] = useState<PatternType>("bullish");
  
  const patternsByType = CHART_PATTERNS.reduce<PatternsByType>((acc, pattern) => {
    const type = pattern.type as PatternType;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type]?.push(pattern as unknown as Pattern);
    return acc;
  }, {});

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Trading Pattern Guide</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Learn about common chart patterns and how to identify them in your technical analysis
          </p>
        </div>

        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Introduction to Chart Patterns</CardTitle>
              <CardDescription>Understanding the building blocks of technical analysis</CardDescription>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                Chart patterns are specific formations on price charts that can help traders predict future price movements. 
                These patterns have been observed and documented over decades of market analysis and are considered a fundamental 
                part of technical analysis.
              </p>
              <p>
                Patterns typically form due to the psychology of market participants - the collective actions of buyers and sellers 
                create recognizable shapes on charts that tend to repeat over time. By identifying these patterns, traders can make 
                more informed decisions about potential market direction.
              </p>
              <p>
                In this guide, we've organized patterns into three categories:
              </p>
              <ul>
                <li><strong>Bullish patterns</strong> - Formations that typically signal potential upward price movement</li>
                <li><strong>Bearish patterns</strong> - Formations that typically signal potential downward price movement</li>
                <li><strong>Neutral/Continuation patterns</strong> - Formations that may signal a continuation of the current trend or consolidation before the next move</li>
              </ul>
              <div className="bg-muted p-4 rounded-md border border-border">
                <p className="text-sm italic">
                  <strong>Important:</strong> Remember that no pattern is 100% reliable. Always use patterns as part of a comprehensive 
                  trading strategy that includes other forms of analysis, risk management, and proper entry/exit planning.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as PatternType)} className="w-full">
          <div className="flex justify-center mb-6">
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="bullish" className="px-8">Bullish</TabsTrigger>
              <TabsTrigger value="bearish" className="px-8">Bearish</TabsTrigger>
              <TabsTrigger value="neutral" className="px-8">Neutral</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="bullish" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {patternsByType.bullish?.map((pattern) => (
                <PatternCard 
                  key={pattern.name}
                  pattern={pattern}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="bearish" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {patternsByType.bearish?.map((pattern) => (
                <PatternCard 
                  key={pattern.name}
                  pattern={pattern}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="neutral" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {patternsByType.neutral?.map((pattern) => (
                <PatternCard 
                  key={pattern.name}
                  pattern={pattern}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="border-t pt-8 mt-12">
          <Link href="/" className="text-primary hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

const PatternCard = ({ pattern }: { pattern: Pattern }) => {
  const typeColors = {
    bullish: "bg-emerald-500",
    bearish: "bg-red-500",
    neutral: "bg-amber-500"
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{pattern.name}</CardTitle>
          <div className={`h-3 w-3 rounded-full ${typeColors[pattern.type]}`} />
        </div>
        <CardDescription className="capitalize">{pattern.type} Pattern</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="bg-muted rounded-md p-4 flex justify-center">
            <img 
              src={pattern.image} 
              alt={pattern.name} 
              className="max-h-36" 
            />
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium mb-1">Description</h4>
            <p className="text-sm text-muted-foreground">{pattern.description}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Key Characteristics</h4>
            <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
              {pattern.characteristics?.map((characteristic, index) => (
                <li key={index}>{characteristic}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Trading Strategy</h4>
            <p className="text-sm text-muted-foreground">{pattern.strategy}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};