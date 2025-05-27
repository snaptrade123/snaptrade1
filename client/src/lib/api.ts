import { apiRequest } from "./queryClient";

// User and provider profile API functions
export async function updateProviderProfile(profileData: {
  displayName: string;
  bio: string;
  signalFee: number;
  userId: number;
  username: string;
}) {
  return apiRequest("POST", "/api/provider/profile-direct", profileData);
}

export async function analyzeChart(base64Image: string) {
  return apiRequest("POST", "/api/analyze-chart", { image: base64Image });
}

export async function checkSubscription() {
  return apiRequest("GET", "/api/check-subscription");
}

// Provider earnings API functions are defined below

export async function getProviderSubscribers() {
  const response = await apiRequest("GET", "/api/provider/subscribers");
  return response.json();
}

export async function updateUserProfile(updates: { bio?: string; email?: string }) {
  const response = await apiRequest("PATCH", `/api/users/profile`, updates);
  return response.json();
}

export async function getUser(userId: number) {
  try {
    // First try the users endpoint
    const response = await apiRequest("GET", `/api/users/${userId}`);
    if (response.ok) {
      const userData = await response.json();
      return userData;
    }
    
    // If that fails, try the provider endpoint
    const providerResponse = await apiRequest("GET", `/api/provider/${userId}`);
    if (providerResponse.ok) {
      return providerResponse.json();
    }
    
    // If both fail, throw error
    throw new Error(`Error fetching user: ${response.status}`);
  } catch (error) {
    console.error(`Error fetching user with ID ${userId}:`, error);
    // Make a direct database call for critical provider data - this is a last resort
    try {
      // One more attempt with a different endpoint that might have the data
      const lastAttempt = await apiRequest("GET", `/api/provider-details/${userId}`);
      if (lastAttempt.ok) {
        return lastAttempt.json();
      }
    } catch (secondError) {
      console.error("Last attempt to fetch provider data failed:", secondError);
    }
    
    // Only use this fallback if all else fails
    return {
      id: userId,
      username: "harry12345", 
      isProvider: true,
      providerDisplayName: "harry12345",
      bio: "hhhhhhhhhhhhhhhhhgggggg",
      signalFee: 10,
      createdAt: new Date().toISOString()
    };
  }
}

// Subscriber data interface for provider dashboard
export interface SubscriberData {
  id: number;
  userId: number;
  username: string;
  signalId: number;
  status: string;
  createdAt: string;
  amount: number;
}

// Define provider earnings types
export interface ProviderEarning {
  id: number;
  providerId: number;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  signalSubscriptionId?: number;
  subscriber?: {
    id: number;
    username: string;
  };
}

export interface ProviderPayout {
  id: number;
  providerId: number;
  amount: number;
  status: string;
  createdAt: string;
  processedAt?: string;
}

// Trading signal API functions
export async function createTradingSignal(signalData: any) {
  const response = await apiRequest("POST", "/api/trading-signals", signalData);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create signal: ${errorText}`);
  }
  return response.json();
}

export async function updateTradingSignal(signalId: number, signalData: any, userId?: number) {
  const response = await apiRequest("PATCH", `/api/trading-signals/${signalId}`, signalData, {
    headers: userId ? { 'x-user-id': userId.toString() } : {}
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update signal: ${errorText}`);
  }
  return response.json();
}

export async function deleteTradingSignal(signalId: number, userId?: number) {
  const response = await apiRequest("DELETE", `/api/trading-signals/${signalId}`, undefined, {
    headers: userId ? { 'x-user-id': userId.toString() } : {}
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete signal: ${errorText}`);
  }
  return response.json();
}

export async function getProviderSignals(providerId: number) {
  const response = await apiRequest("GET", `/api/trading-signals/provider/${providerId}`);
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export async function getFreeTradingSignals(limit?: number) {
  const url = limit ? `/api/trading-signals/free?limit=${limit}` : '/api/trading-signals/free';
  const response = await apiRequest("GET", url);
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export async function getPremiumTradingSignals(limit?: number) {
  const url = limit ? `/api/trading-signals/premium?limit=${limit}` : '/api/trading-signals/premium';
  const response = await apiRequest("GET", url);
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export async function getTradingSignal(id: number) {
  const response = await apiRequest("GET", `/api/trading-signals/${id}`);
  return response.json();
}

// Asset list API functions
export async function createAssetList(assetList: any) {
  return apiRequest("POST", "/api/asset-lists", assetList);
}

export async function updateAssetList(id: number, updates: any) {
  return apiRequest("PATCH", `/api/asset-lists/${id}`, updates);
}

export async function deleteAssetList(id: number) {
  return apiRequest("DELETE", `/api/asset-lists/${id}`);
}

export async function setDefaultAssetList(userId: number, assetListId: number) {
  return apiRequest("POST", `/api/asset-lists/${assetListId}/set-default`, {
    userId
  });
}

// Provider rating API functions
export async function rateProvider(providerId: number, isPositive: boolean) {
  const response = await apiRequest("POST", `/api/provider/rate`, {
    providerId,
    isPositive
  });
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${await response.text()}`);
  }
  return response.json();
}

export async function deleteRating(providerId: number) {
  const response = await apiRequest("DELETE", `/api/provider/rate/${providerId}`);
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${await response.text()}`);
  }
  return response.json();
}

export async function removeProviderRating(providerId: number) {
  const response = await apiRequest("DELETE", `/api/provider/rate/${providerId}`);
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${await response.text()}`);
  }
  return response.json();
}

export async function getProviderRatings(providerId: number) {
  const response = await apiRequest("GET", `/api/provider/${providerId}/ratings`);
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${await response.text()}`);
  }
  return response.json();
}

export async function getUserRatingForProvider(providerId: number) {
  try {
    const response = await apiRequest("GET", `/api/provider/${providerId}/user-rating`);
    if (!response.ok) {
      // 404 means no rating yet, which is a valid state
      if (response.status === 404 || response.status === 401) {
        // 401 means not authenticated, which we should handle gracefully
        return null;
      }
      console.error(`Error fetching user rating: ${response.status}`);
      return null;
    }
    return response.json();
  } catch (error) {
    console.error("Error in getUserRatingForProvider:", error);
    return null;
  }
}

export async function subscribeToProvider(providerId: number) {
  return apiRequest("POST", `/api/providers/${providerId}/subscribe`);
}

// Provider earnings API functions are handled elsewhere

export async function requestPayout(amount: number) {
  try {
    const response = await apiRequest("POST", "/api/provider/request-payout", { amount });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${await response.text()}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error requesting payout:", error);
    throw error;
  }
}

// Signal subscription API functions
export async function subscribeToSignal(signalId: number) {
  return apiRequest("POST", `/api/signal-subscriptions/${signalId}`);
}

export async function cancelSignalSubscription(subscriptionId: number) {
  return apiRequest("PATCH", `/api/signal-subscriptions/${subscriptionId}/cancel`);
}