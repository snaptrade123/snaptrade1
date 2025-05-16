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
    availableBalance: number;
    pendingBalance: number;
    totalEarned: number;
    totalFees: number;
    pendingPayouts: number;
  };
}

export interface ProviderEarning {
  id: number;
  providerId: number;
  subscriptionId: number;
  grossAmount: number;
  feePercentage: number;
  feeAmount: number;
  netAmount: number;
  currency: string;
  status: 'available' | 'pending_payout' | 'paid_out';
  earnedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderEarningsSummary {
  availableBalance: number;
  pendingBalance: number;
  totalEarned: number;
  totalFees: number;
}

export interface ProviderEarningsData {
  summary: ProviderEarningsSummary;
  transactions: ProviderEarning[];
}

export interface ProviderPayout {
  id: number;
  providerId: number;
  amount: number;
  currency: string;
  stripeTransferId?: string;
  status: 'pending' | 'paid' | 'failed';
  periodStart: string;
  periodEnd: string;
  createdAt: string;
  updatedAt: string;
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
        availableBalance: 0,
        pendingBalance: 0,
        totalEarned: 0,
        totalFees: 0,
        pendingPayouts: 0
      }
    };
  }
};

// Function to get provider's earnings
export const getProviderEarnings = async (): Promise<ProviderEarningsData> => {
  try {
    const response = await fetch('/api/provider/earnings');
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required');
      }
      throw new Error('Failed to fetch earnings data');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching provider earnings:', error);
    return { 
      summary: {
        availableBalance: 0,
        pendingBalance: 0,
        totalEarned: 0,
        totalFees: 0
      },
      transactions: []
    };
  }
};

// Function to request a payout
export const requestPayout = async (amount: number): Promise<{ payout: ProviderPayout, message: string }> => {
  try {
    const response = await fetch('/api/provider/request-payout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount }),
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required');
      }
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to request payout');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error requesting payout:', error);
    throw error;
  }
};

// Function to update user profile
export interface ProfileUpdateData {
  bio?: string;
  email?: string;
}

export const updateUserProfile = async (data: ProfileUpdateData): Promise<any> => {
  try {
    const response = await fetch('/api/user/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required');
      }
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update profile');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Get a single user by ID
export const getUser = async (userId: number): Promise<any> => {
  try {
    const response = await fetch(`/api/user/${userId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('User not found');
      }
      throw new Error('Failed to fetch user data');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

// Provider Rating Types
export interface ProviderRatings {
  thumbsUp: number;
  thumbsDown: number;
}

export interface UserRating {
  id?: number;
  userId: number;
  providerId: number;
  rating: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Get a provider's ratings
export const getProviderRatings = async (providerId: number): Promise<ProviderRatings> => {
  try {
    const response = await fetch(`/api/provider/${providerId}/ratings`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch provider ratings');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching provider ratings:', error);
    return { thumbsUp: 0, thumbsDown: 0 };
  }
};

// Get the current user's rating for a provider
export const getUserRatingForProvider = async (providerId: number): Promise<UserRating | null> => {
  try {
    const response = await fetch(`/api/provider/${providerId}/user-rating`);
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required');
      }
      throw new Error('Failed to fetch user rating');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user rating:', error);
    return null;
  }
};

// Rate a provider (thumbs up or down)
export const rateProvider = async (providerId: number, isPositive: boolean): Promise<UserRating> => {
  try {
    const response = await fetch('/api/provider/rate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ providerId, isPositive }),
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required to rate providers');
      }
      if (response.status === 400) {
        const data = await response.json();
        throw new Error(data.message || 'Invalid rating request');
      }
      throw new Error('Failed to submit rating');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error rating provider:', error);
    throw error;
  }
};

// Remove a rating for a provider
export const removeProviderRating = async (providerId: number): Promise<void> => {
  try {
    const response = await fetch(`/api/provider/rate/${providerId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required');
      }
      throw new Error('Failed to remove rating');
    }
  } catch (error) {
    console.error('Error removing rating:', error);
    throw error;
  }
};

// Function to get provider's payout history
export const getProviderPayouts = async (): Promise<ProviderPayout[]> => {
  try {
    const response = await fetch('/api/provider/payouts');
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required');
      }
      throw new Error('Failed to fetch payout history');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching provider payouts:', error);
    return [];
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

export interface ProviderProfileData {
  displayName: string;
  bio: string;
  signalFee: number;
  isProvider?: boolean;
}

export const updateProviderProfile = async (data: ProviderProfileData): Promise<any> => {
  try {
    console.log('Updating provider profile with data:', data);
    
    // Use the apiRequest utility which already handles credentials and errors
    const response = await fetch('/api/provider/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include credentials for session-based auth
      body: JSON.stringify(data),
    });
    
    console.log('Provider profile update response status:', response.status);
    
    if (!response.ok) {
      // Log the error response for debugging
      const errorText = await response.text();
      console.error('Provider profile update failed:', errorText);
      
      if (response.status === 401) {
        throw new Error('Authentication required - please log in');
      }
      throw new Error(`Failed to update provider profile: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating provider profile:', error);
    throw error;
  }
};
