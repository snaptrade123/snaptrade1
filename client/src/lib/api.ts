// API Types
export interface PatternDetection {
  name: string;
  type: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
}

export interface NewsArticle {
  title: string;
  source: string;
  time: string;
  summary: string;
  sentiment: number;
  url?: string;
}

export interface NewsSentiment {
  score: number;
  articles: NewsArticle[];
}

// Defines a single trade setup with price levels
export interface TradeSetup {
  entryPrice?: number | null;
  stopLoss?: number | null;
  takeProfit?: number | null;
  timeframe?: string;
  riskRewardRatio?: number | null;
}

export interface TradingRecommendation extends TradeSetup {
  entryCondition?: string;
  quickTrade?: TradeSetup;
  swingTrade?: TradeSetup;
}

export interface Prediction {
  direction: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  explanation: string;
  weights: {
    technical: number;
    news: number;
  };
  tradingRecommendation?: TradingRecommendation;
}

export interface AnalysisResult {
  id?: string;
  asset: string;
  imageUrl: string;
  patterns: PatternDetection[];
  newsSentiment: NewsSentiment;
  prediction: Prediction;
  timestamp?: string;
}

// File to Base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === "string") {
        // Remove the prefix (e.g., "data:image/png;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error("Failed to convert file to base64"));
      }
    };
    reader.onerror = error => reject(error);
  });
};

// API functions
export const analyzeChart = async (file: File, asset: string): Promise<AnalysisResult> => {
  try {
    const base64Image = await fileToBase64(file);

    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        image: base64Image, 
        asset 
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Analysis failed: ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error analyzing chart:', error);
    throw error;
  }
};

export const saveAnalysis = async (analysisName: string, notes: string, result: AnalysisResult): Promise<void> => {
  try {
    const response = await fetch('/api/analysis/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: analysisName,
        notes,
        result,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to save analysis: ${errorText}`);
    }
  } catch (error) {
    console.error('Error saving analysis:', error);
    throw error;
  }
};

export interface SubscriptionStatus {
  active: boolean;
  tier?: string;
  endDate?: string;
}

export const checkSubscription = async (userId: number): Promise<SubscriptionStatus> => {
  try {
    const response = await fetch(`/api/subscription-status/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to check subscription status`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    // Return inactive status when there's an error
    return { active: false };
  }
};
