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

export interface UsageInfo {
  count: number;
  limit: number;
  tier: string;
}

export interface AnalysisResult {
  id?: string;
  asset: string;
  imageUrl: string;
  patterns: PatternDetection[];
  newsSentiment: NewsSentiment;
  prediction: Prediction;
  timestamp?: string;
  usageInfo?: UsageInfo;
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
      const errorData = await response.json().catch(() => null);
      
      // If we received structured error data
      if (errorData) {
        if (errorData.limitReached) {
          throw new Error(
            `Daily analysis limit reached (${errorData.usage}/${errorData.limit}). ` +
            `Your ${errorData.tier} plan allows ${errorData.limit} analyses per day.`
          );
        } else if (errorData.subscriptionRequired) {
          throw new Error("Active subscription required");
        } else {
          throw new Error(errorData.message || "Analysis failed");
        }
      } else {
        // Fallback to text error
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(`Analysis failed: ${errorText}`);
      }
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
  dailyLimit?: number;
  usageCount?: number;
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

// Trading Signals Types
export interface TradingSignal {
  id: number;
  providerId: number;
  title: string;
  asset: string;
  timeframe: string;
  direction: 'buy' | 'sell';
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  riskRewardRatio: number;
  analysis: string;
  imageUrl?: string;
  isPremium: boolean;
  price: number;
  expiresAt?: string;
  status: 'active' | 'expired' | 'closed';
  outcome?: 'win' | 'loss' | 'breakeven';
  actualPips?: number;
  createdAt: string;
  updatedAt: string;
  hasAccess?: boolean; // Added client-side for access control
}

export interface SignalSubscription {
  id: number;
  userId: number;
  providerId: number;
  price: number;
  status: 'active' | 'cancelled' | 'expired';
  stripeSubscriptionId?: string;
  createdAt: string;
  updatedAt: string;
  providerUsername?: string; // Enhanced field from the API
}

export interface SubscriberData {
  subscribers: SignalSubscription[];
  metrics: {
    subscriberCount: number;
    totalRevenue: number;
    pendingRevenue: number;
  };
}

// Function to get all free trading signals
export const getFreeTradingSignals = async (limit?: number): Promise<TradingSignal[]> => {
  try {
    const url = new URL('/api/trading-signals/free', window.location.origin);
    if (limit) {
      url.searchParams.append('limit', limit.toString());
    }
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error('Failed to fetch free trading signals');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching free trading signals:', error);
    return [];
  }
};

// Function to get all premium trading signals
export const getPremiumTradingSignals = async (limit?: number, userId?: number): Promise<TradingSignal[]> => {
  try {
    const url = new URL('/api/trading-signals/premium', window.location.origin);
    if (limit) {
      url.searchParams.append('limit', limit.toString());
    }
    
    const headers: Record<string, string> = {};
    
    // If we have a userId, add it as a header for development
    if (userId) {
      headers['X-User-ID'] = userId.toString();
    }
    
    const response = await fetch(url.toString(), { headers });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required to view premium signals');
      }
      throw new Error('Failed to fetch premium trading signals');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching premium trading signals:', error);
    return [];
  }
};

// Function to get a specific trading signal by ID
export const getTradingSignal = async (id: number): Promise<TradingSignal> => {
  try {
    const response = await fetch(`/api/trading-signals/${id}`);
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required to view this signal');
      }
      if (response.status === 403) {
        const data = await response.json();
        throw new Error(data.message || 'Subscription required to view this signal');
      }
      if (response.status === 404) {
        throw new Error('Trading signal not found');
      }
      throw new Error('Failed to fetch trading signal');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching trading signal:', error);
    throw error;
  }
};

// Function to get signals from a specific provider
export const getProviderSignals = async (providerId: number): Promise<TradingSignal[]> => {
  try {
    const response = await fetch(`/api/trading-signals/provider/${providerId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch provider signals');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching provider signals:', error);
    return [];
  }
};

// Function to create a new trading signal
export const createTradingSignal = async (
  signalData: Omit<TradingSignal, 'id' | 'providerId' | 'createdAt' | 'updatedAt'>,
  userId?: number
): Promise<TradingSignal> => {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // If we have a userId, add it as a header for development
    if (userId) {
      headers['X-User-ID'] = userId.toString();
    }
    
    console.log('Creating trading signal with headers:', headers);
    console.log('Signal data:', signalData);
    
    const response = await fetch('/api/trading-signals', {
      method: 'POST',
      headers,
      body: JSON.stringify(signalData),
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required to create signals');
      }
      if (response.status === 403) {
        throw new Error('You must be a SnapTrade subscriber to create premium signals');
      }
      const data = await response.json();
      throw new Error(data.message || 'Failed to create trading signal');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating trading signal:', error);
    throw error;
  }
};

// Function to update a trading signal
export const updateTradingSignal = async (id: number, updates: Partial<TradingSignal>): Promise<TradingSignal> => {
  try {
    const response = await fetch(`/api/trading-signals/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required to update signals');
      }
      if (response.status === 403) {
        throw new Error('You can only update your own signals');
      }
      if (response.status === 404) {
        throw new Error('Trading signal not found');
      }
      const data = await response.json();
      throw new Error(data.message || 'Failed to update trading signal');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating trading signal:', error);
    throw error;
  }
};

// Function to delete a trading signal
export const deleteTradingSignal = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`/api/trading-signals/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required to delete signals');
      }
      if (response.status === 403) {
        throw new Error('You can only delete your own signals');
      }
      if (response.status === 404) {
        throw new Error('Trading signal not found');
      }
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || 'Failed to delete trading signal');
    }
  } catch (error) {
    console.error('Error deleting trading signal:', error);
    throw error;
  }
};

// Function to subscribe to a provider's signals
export const subscribeToProvider = async (providerId: number): Promise<{ sessionId: string, url: string }> => {
  try {
    const response = await fetch('/api/signal-subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ providerId }),
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required to subscribe');
      }
      if (response.status === 400) {
        const data = await response.json();
        throw new Error(data.message || 'Invalid subscription request');
      }
      throw new Error('Failed to create subscription');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error subscribing to provider:', error);
    throw error;
  }
};

// Function to get user's signal subscriptions
export const getUserSubscriptions = async (): Promise<SignalSubscription[]> => {
  try {
    const response = await fetch('/api/signal-subscriptions');
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required');
      }
      throw new Error('Failed to fetch subscriptions');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user subscriptions:', error);
    return [];
  }
};

// Function to get provider's subscribers
export const getProviderSubscribers = async (): Promise<SubscriberData> => {
  try {
    const response = await fetch('/api/signal-subscribers');
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required');
      }
      throw new Error('Failed to fetch subscribers');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching provider subscribers:', error);
    return { 
      subscribers: [],
      metrics: {
        subscriberCount: 0,
        totalRevenue: 0,
        pendingRevenue: 0
      }
    };
  }
};

// Function to cancel a signal subscription
export const cancelSubscription = async (subscriptionId: number): Promise<SignalSubscription> => {
  try {
    const response = await fetch(`/api/signal-subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required');
      }
      if (response.status === 403) {
        throw new Error('You can only cancel your own subscriptions');
      }
      if (response.status === 404) {
        throw new Error('Subscription not found');
      }
      const data = await response.json();
      throw new Error(data.message || 'Failed to cancel subscription');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
};
