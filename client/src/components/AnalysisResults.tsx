import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpIcon, ArrowDownIcon, CheckCircle2 } from "lucide-react";
import { AnalysisResult, PatternDetection, NewsArticle } from "@/lib/api";
import TradingLevelsChart from "./TradingLevelsChart";

type AnalysisResultsProps = {
  result: AnalysisResult | null;
  isLoading: boolean;
};

// Helper function to calculate risk/reward ratio
const calculateRiskReward = (entryPrice: number, stopLoss: number, takeProfit: number): number => {
  const risk = Math.abs(entryPrice - stopLoss);
  const reward = Math.abs(takeProfit - entryPrice);
  return risk > 0 ? reward / risk : 0;
};

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result, isLoading }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'swing' | 'quick'>('swing');

  useEffect(() => {
    if (result?.imageUrl) {
      setImageUrl(result.imageUrl);
    }
  }, [result]);

  if (!result && !isLoading) {
    return null;
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium">Analysis Results</h3>
        <div className="flex items-center gap-3">
          {/* Usage indicator */}
          {result?.usageInfo && (
            <div className="flex items-center gap-2">
              <div className="text-xs text-muted-foreground whitespace-nowrap">
                <span className={`font-medium ${
                  result.usageInfo.tier === 'premium' ? 'text-emerald-500' : 'text-violet-500'
                }`}>
                  {result.usageInfo.tier === 'premium' ? 'Premium' : 'Standard'}:
                </span>
                <span> {result.usageInfo.count}/{result.usageInfo.limit}</span>
              </div>
              <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    result.usageInfo.count / result.usageInfo.limit > 0.8 
                      ? 'bg-amber-500' 
                      : result.usageInfo.tier === 'premium' ? 'bg-emerald-500' : 'bg-violet-500'
                  }`}
                  style={{ 
                    width: `${Math.min(100, (result.usageInfo.count / result.usageInfo.limit) * 100)}%` 
                  }}
                />
              </div>
            </div>
          )}
          {result?.asset && (
            <Badge variant="outline">{result.asset}</Badge>
          )}
          {isLoading && <Skeleton className="h-6 w-32" />}
        </div>
      </div>

      {/* Preview and Detection Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Chart Preview */}
        <div>
          <h4 className="text-sm font-medium mb-3 text-muted-foreground">Chart Preview</h4>
          <div className="relative rounded-lg overflow-hidden border border-border h-48 md:h-64">
            {imageUrl ? (
              <>
                <img 
                  src={imageUrl} 
                  alt="Chart preview" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-background bg-opacity-80 px-2 py-1 rounded text-xs flex items-center">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500 mr-1" />
                  Processed
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-background">
                {isLoading ? (
                  <Skeleton className="w-full h-full" />
                ) : (
                  <p className="text-muted-foreground text-sm">No image uploaded</p>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Pattern Detection */}
        <div>
          <h4 className="text-sm font-medium mb-3 text-muted-foreground">Detected Patterns</h4>
          <div className="space-y-3">
            {isLoading ? (
              <>
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </>
            ) : result?.patterns && result.patterns.length > 0 ? (
              result.patterns.map((pattern: PatternDetection, index: number) => (
                <PatternCard key={index} pattern={pattern} />
              ))
            ) : (
              <div className="bg-background p-4 rounded-lg border border-border text-center">
                <p className="text-muted-foreground">No patterns detected</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* News Sentiment Section */}
      {(isLoading || result?.newsSentiment) && (
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-3 text-muted-foreground">Latest News Sentiment</h4>
          <div className="bg-background p-4 rounded-lg border border-border mb-4">
            {isLoading ? (
              <>
                <Skeleton className="h-6 w-full mb-3" />
                <Skeleton className="h-4 w-full" />
              </>
            ) : result?.newsSentiment ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-16 h-4 bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 rounded"></div>
                    <div className="ml-2 text-sm font-medium">
                      {getSentimentText(result.newsSentiment.score)}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Based on {result.newsSentiment.articles.length} news articles
                  </div>
                </div>
                <div className="w-full bg-border rounded-full h-2 mb-1">
                  <div 
                    className={`${getSentimentGradient(result.newsSentiment.score)} rounded-full h-2`} 
                    style={{ width: `${convertScoreToPercent(result.newsSentiment.score)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Bearish</span>
                  <span>Neutral</span>
                  <span>Bullish</span>
                </div>
              </>
            ) : null}
          </div>

          {/* News Articles */}
          <div className="space-y-3">
            {isLoading ? (
              <>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </>
            ) : result?.newsSentiment?.articles.map((article: NewsArticle, index: number) => (
              <NewsArticleCard key={index} article={article} />
            ))}
          </div>
        </div>
      )}

      {/* Final Prediction Section */}
      {(isLoading || result?.prediction) && (
        <div className="bg-background rounded-lg border border-border p-4">
          {isLoading ? (
            <>
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="flex">
                <Skeleton className="h-16 w-16 rounded-full mr-4" />
                <div className="flex-1">
                  <Skeleton className="h-8 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6 mt-1" />
                </div>
              </div>
            </>
          ) : result?.prediction ? (
            <>
              <h4 className="text-sm font-medium mb-3">Combined Analysis Prediction</h4>
              <div className="flex items-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${result.prediction.direction === 'bullish' ? 'bg-emerald-500/10 border-2 border-emerald-500' : 'bg-red-500/10 border-2 border-red-500'} mr-4`}>
                  {result.prediction.direction === 'bullish' ? (
                    <ArrowUpIcon className="h-8 w-8 text-emerald-500" />
                  ) : (
                    <ArrowDownIcon className="h-8 w-8 text-red-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <h5 className={`font-bold text-xl ${result.prediction.direction === 'bullish' ? 'text-emerald-500' : 'text-red-500'} mr-2`}>
                      {result.prediction.direction === 'bullish' ? 'Bullish Outlook' : 'Bearish Outlook'}
                    </h5>
                    <Badge className={result.prediction.direction === 'bullish' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}>
                      {result.prediction.confidence}% Confidence
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{result.prediction.explanation}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Technical Analysis Weight</span>
                  <span className="text-sm">{result.prediction.weights.technical}%</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-muted-foreground">News Sentiment Weight</span>
                  <span className="text-sm">{result.prediction.weights.news}%</span>
                </div>
              </div>
              
              {/* Trading Recommendations Section */}
              {result.prediction.tradingRecommendation && (
                <div className="mt-4 pt-4 border-t border-border">
                  <h4 className="text-sm font-medium mb-3">Trading Recommendations</h4>
                  
                  {/* Educational Disclaimer */}
                  <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-md mb-3">
                    <p className="text-xs text-amber-600 font-medium">
                      <span className="mr-1">⚠️</span>
                      The following is for educational purposes only and should not be considered financial advice.
                    </p>
                  </div>
                  
                  {/* Entry Condition */}
                  {result.prediction.tradingRecommendation.entryCondition && (
                    <div className="bg-secondary/30 p-3 rounded-md mb-3">
                      <p className="text-sm">
                        {result.prediction.tradingRecommendation.entryCondition.includes("might") ? 
                          result.prediction.tradingRecommendation.entryCondition.split("might").map((part, i) => 
                            i === 0 ? part : <React.Fragment key={i}><i>might</i>{part}</React.Fragment>
                          )
                          : result.prediction.tradingRecommendation.entryCondition
                        }
                      </p>
                    </div>
                  )}
                  
                  {/* Trade Type Tabs */}
                  <div className="mb-4">
                    <div className="flex border-b border-border">
                      <button 
                        className={`px-4 py-2 text-sm font-medium ${activeTab === 'swing' ? 'border-b-2 border-primary' : 'text-muted-foreground'}`}
                        onClick={() => setActiveTab('swing')}
                      >
                        Swing Trade (1-2 weeks)
                      </button>
                      <button 
                        className={`px-4 py-2 text-sm font-medium ${activeTab === 'quick' ? 'border-b-2 border-primary' : 'text-muted-foreground'}`}
                        onClick={() => setActiveTab('quick')}
                      >
                        Quick Trade (1-3 days)
                      </button>
                    </div>
                  </div>
                  
                  {/* Removed Visual Trading Levels Chart due to UI issues */}
                  
                  {/* Price Levels Grid - Show quick or swing trade based on active tab */}
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    {/* Entry Price */}
                    <div className="bg-background border border-primary/30 shadow-md p-4 rounded-md">
                      <p className="text-xs text-muted-foreground mb-2 uppercase font-semibold tracking-wide">Entry Price</p>
                      <p className={`text-xl font-bold ${result.prediction.direction === 'bullish' ? 'text-emerald-500' : 'text-red-500'}`}>
                        {activeTab === 'quick' && result.prediction.tradingRecommendation.quickTrade?.entryPrice
                          ? result.prediction.tradingRecommendation.quickTrade.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })
                          : activeTab === 'swing' && result.prediction.tradingRecommendation.swingTrade?.entryPrice
                          ? result.prediction.tradingRecommendation.swingTrade.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })
                          : result.prediction.tradingRecommendation.entryPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 }) || 'N/A'}
                      </p>
                    </div>
                    
                    {/* Stop Loss */}
                    <div className="bg-background border border-red-500/30 shadow-md p-4 rounded-md">
                      <p className="text-xs text-muted-foreground mb-2 uppercase font-semibold tracking-wide">Stop Loss</p>
                      <p className="text-xl font-bold text-red-500">
                        {activeTab === 'quick' && result.prediction.tradingRecommendation.quickTrade?.stopLoss
                          ? result.prediction.tradingRecommendation.quickTrade.stopLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })
                          : activeTab === 'swing' && result.prediction.tradingRecommendation.swingTrade?.stopLoss
                          ? result.prediction.tradingRecommendation.swingTrade.stopLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })
                          : result.prediction.tradingRecommendation.stopLoss?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 }) || 'N/A'}
                      </p>
                    </div>
                    
                    {/* Take Profit */}
                    <div className="bg-background border border-emerald-500/30 shadow-md p-4 rounded-md">
                      <p className="text-xs text-muted-foreground mb-2 uppercase font-semibold tracking-wide">Take Profit</p>
                      <p className="text-xl font-bold text-emerald-500">
                        {activeTab === 'quick' && result.prediction.tradingRecommendation.quickTrade?.takeProfit
                          ? result.prediction.tradingRecommendation.quickTrade.takeProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })
                          : activeTab === 'swing' && result.prediction.tradingRecommendation.swingTrade?.takeProfit
                          ? result.prediction.tradingRecommendation.swingTrade.takeProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })
                          : result.prediction.tradingRecommendation.takeProfit?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 }) || 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Additional Info */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Timeframe */}
                    <div className="bg-secondary/30 p-3 rounded-md">
                      <p className="text-xs text-muted-foreground mb-1">Timeframe</p>
                      <p className="text-sm">
                        {activeTab === 'quick' && result.prediction.tradingRecommendation.quickTrade?.timeframe
                          ? result.prediction.tradingRecommendation.quickTrade.timeframe
                          : activeTab === 'swing' && result.prediction.tradingRecommendation.swingTrade?.timeframe
                          ? result.prediction.tradingRecommendation.swingTrade.timeframe
                          : result.prediction.tradingRecommendation.timeframe || 'N/A'}
                      </p>
                    </div>
                    
                    {/* Risk-Reward Ratio */}
                    <div className="bg-secondary/30 p-3 rounded-md">
                      <p className="text-xs text-muted-foreground mb-1">Risk:Reward Ratio</p>
                      <p className="text-sm">
                        {activeTab === 'quick' && result.prediction.tradingRecommendation.quickTrade?.entryPrice && 
                          result.prediction.tradingRecommendation.quickTrade?.stopLoss &&
                          result.prediction.tradingRecommendation.quickTrade?.takeProfit
                          ? `1:${calculateRiskReward(
                              result.prediction.tradingRecommendation.quickTrade.entryPrice,
                              result.prediction.tradingRecommendation.quickTrade.stopLoss,
                              result.prediction.tradingRecommendation.quickTrade.takeProfit
                            ).toFixed(1)}`
                          : activeTab === 'swing' && result.prediction.tradingRecommendation.swingTrade?.entryPrice &&
                            result.prediction.tradingRecommendation.swingTrade?.stopLoss &&
                            result.prediction.tradingRecommendation.swingTrade?.takeProfit
                          ? `1:${calculateRiskReward(
                              result.prediction.tradingRecommendation.swingTrade.entryPrice,
                              result.prediction.tradingRecommendation.swingTrade.stopLoss,
                              result.prediction.tradingRecommendation.swingTrade.takeProfit
                            ).toFixed(1)}`
                          : `1:${result.prediction.tradingRecommendation.riskRewardRatio?.toFixed(1) || 'N/A'}`}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      )}
    </div>
  );
};

const PatternCard = ({ pattern }: { pattern: PatternDetection }) => {
  return (
    <div className="bg-background p-3 rounded-lg border border-border">
      <div className="flex justify-between items-center mb-1">
        <span className="font-medium">{pattern.name}</span>
        <span className={pattern.type === 'bullish' ? 'text-emerald-500 text-sm' : 'text-red-500 text-sm'}>
          {pattern.type === 'bullish' ? 'Bullish' : 'Bearish'}
        </span>
      </div>
      <div className="w-full bg-border rounded-full h-2 mb-1">
        <div 
          className={`${pattern.type === 'bullish' ? 'bg-emerald-500' : 'bg-red-500'} rounded-full h-2`} 
          style={{ width: `${pattern.confidence}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Confidence</span>
        <span>{pattern.confidence}%</span>
      </div>
    </div>
  );
};

const NewsArticleCard = ({ article }: { article: NewsArticle }) => {
  return (
    <div className="bg-background p-3 rounded-lg border border-border flex justify-between">
      <div className="flex-1">
        <div className="flex items-center mb-1">
          <span 
            className={`inline-block w-2 h-2 rounded-full mr-2 ${
              article.sentiment > 0.3 ? 'bg-emerald-500' : 
              article.sentiment < -0.3 ? 'bg-red-500' : 
              'bg-amber-500'
            }`}
          />
          <span className="text-xs text-muted-foreground">{article.source} • {article.time}</span>
        </div>
        <h5 className="font-medium text-sm mb-1">{article.title}</h5>
        <p className="text-xs text-muted-foreground line-clamp-2">{article.summary}</p>
      </div>
      <div className="flex flex-col items-end justify-between ml-4">
        <span 
          className={`px-2 py-1 rounded bg-card text-xs ${
            article.sentiment > 0.3 ? 'text-emerald-500' : 
            article.sentiment < -0.3 ? 'text-red-500' : 
            'text-amber-500'
          }`}
        >
          {getSentimentLabel(article.sentiment)}
        </span>
        <span className="text-xs text-muted-foreground">{article.sentiment.toFixed(2)}</span>
      </div>
    </div>
  );
};

// Helper functions
function getSentimentText(score: number): string {
  if (score >= 0.5) return "Strongly Positive";
  if (score >= 0.1) return "Slightly Positive";
  if (score <= -0.5) return "Strongly Negative";
  if (score <= -0.1) return "Slightly Negative";
  return "Neutral";
}

function getSentimentLabel(score: number): string {
  if (score >= 0.3) return "Positive";
  if (score <= -0.3) return "Negative";
  return "Neutral";
}

function getSentimentGradient(score: number): string {
  if (score >= 0.5) return "bg-emerald-500";
  if (score >= 0.1) return "bg-gradient-to-r from-amber-500 to-emerald-500";
  if (score <= -0.5) return "bg-red-500";
  if (score <= -0.1) return "bg-gradient-to-r from-red-500 to-amber-500";
  return "bg-amber-500";
}

function convertScoreToPercent(score: number): number {
  // Convert score from -1 to 1 range to 0 to 100 percentage
  return (score + 1) * 50;
}

export default AnalysisResults;
