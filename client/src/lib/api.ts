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

// Provider earnings API functions
export async function getProviderEarnings() {
  return apiRequest("GET", "/api/provider/earnings");
}

export async function getProviderPayouts() {
  return apiRequest("GET", "/api/provider/payouts");
}

export async function getProviderSubscribers() {
  return apiRequest("GET", "/api/provider/subscribers");
}

export async function updateUserProfile(userId: number, updates: { bio?: string; email?: string }) {
  return apiRequest("PATCH", `/api/users/${userId}/profile`, updates);
}

export async function getUser(userId: number) {
  return apiRequest("GET", `/api/users/${userId}`);
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
  return apiRequest("POST", "/api/trading-signals", signalData);
}

export async function getProviderSignals(providerId: number) {
  return apiRequest("GET", `/api/trading-signals/provider/${providerId}`);
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
  return apiRequest("POST", `/api/providers/${providerId}/rate`, {
    isPositive
  });
}

export async function deleteRating(providerId: number) {
  return apiRequest("DELETE", `/api/providers/${providerId}/rate`);
}

export async function removeProviderRating(providerId: number) {
  return apiRequest("DELETE", `/api/providers/${providerId}/rate`);
}

export async function getProviderRatings(providerId: number) {
  return apiRequest("GET", `/api/providers/${providerId}/ratings`);
}

export async function getUserRatingForProvider(providerId: number) {
  return apiRequest("GET", `/api/providers/${providerId}/user-rating`);
}

export async function subscribeToProvider(providerId: number) {
  return apiRequest("POST", `/api/providers/${providerId}/subscribe`);
}

// Provider earnings API functions
export async function requestPayout(amount: number) {
  return apiRequest("POST", "/api/provider/request-payout", { amount });
}

// Signal subscription API functions
export async function subscribeToSignal(signalId: number) {
  return apiRequest("POST", `/api/signal-subscriptions/${signalId}`);
}

export async function cancelSignalSubscription(subscriptionId: number) {
  return apiRequest("PATCH", `/api/signal-subscriptions/${subscriptionId}/cancel`);
}