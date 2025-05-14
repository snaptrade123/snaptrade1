import { useState } from 'react';
import { useQuery, useMutation, UseQueryResult } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export type AssetItem = {
  type: string;
  value: string;
  label: string;
};

export type AssetList = {
  id: number;
  name: string;
  userId: number;
  assets: AssetItem[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export function useAssetLists(userId: number): {
  assetLists: AssetList[];
  isLoading: boolean;
  error: Error | null;
  createAssetList: (data: { name: string; assets: AssetItem[]; isDefault?: boolean }) => Promise<void>;
  updateAssetList: (id: number, data: { name?: string; assets?: AssetItem[]; isDefault?: boolean }) => Promise<void>;
  deleteAssetList: (id: number) => Promise<void>;
  setDefaultAssetList: (id: number) => Promise<void>;
} {
  const { toast } = useToast();
  
  // Query to get all asset lists for a user
  const {
    data: assetLists = [],
    isLoading,
    error,
  } = useQuery<AssetList[], Error>({
    queryKey: ['/api/asset-lists'],
    enabled: !!userId,
  });

  // Mutation to create a new asset list
  const createMutation = useMutation({
    mutationFn: async (data: { name: string; assets: AssetItem[]; isDefault?: boolean }) => {
      const res = await apiRequest('POST', '/api/asset-lists', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/asset-lists'] });
      toast({
        title: 'Asset list created',
        description: 'Your asset list has been created successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error creating asset list',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutation to update an asset list
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { name?: string; assets?: AssetItem[]; isDefault?: boolean } }) => {
      const res = await apiRequest('PUT', `/api/asset-lists/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/asset-lists'] });
      toast({
        title: 'Asset list updated',
        description: 'Your asset list has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating asset list',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutation to delete an asset list
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/asset-lists/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/asset-lists'] });
      toast({
        title: 'Asset list deleted',
        description: 'Your asset list has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error deleting asset list',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutation to set an asset list as default
  const setDefaultMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('POST', `/api/asset-lists/${id}/set-default`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/asset-lists'] });
      toast({
        title: 'Default asset list set',
        description: 'Your default asset list has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error setting default asset list',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Create wrapper functions to make the API easier to use
  const createAssetList = async (data: { name: string; assets: AssetItem[]; isDefault?: boolean }) => {
    await createMutation.mutateAsync(data);
  };

  const updateAssetList = async (id: number, data: { name?: string; assets?: AssetItem[]; isDefault?: boolean }) => {
    await updateMutation.mutateAsync({ id, data });
  };

  const deleteAssetList = async (id: number) => {
    await deleteMutation.mutateAsync(id);
  };

  const setDefaultAssetList = async (id: number) => {
    await setDefaultMutation.mutateAsync(id);
  };

  return {
    assetLists,
    isLoading,
    error,
    createAssetList,
    updateAssetList,
    deleteAssetList,
    setDefaultAssetList,
  };
}

// Hook to get the default asset list for a user
export function useDefaultAssetList(userId: number): UseQueryResult<AssetList | undefined, Error> & { defaultAssetList: AssetList | undefined } {
  const result = useQuery<AssetList[], Error>({
    queryKey: ['/api/asset-lists'],
    enabled: !!userId,
    select: (data) => data.filter(list => list.isDefault),
  });

  const defaultAssetList = result.data && result.data.length > 0 ? result.data[0] : undefined;

  return {
    ...result,
    defaultAssetList
  };
}