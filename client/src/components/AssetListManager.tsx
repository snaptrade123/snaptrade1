import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useAssetLists, AssetItem, AssetList } from '@/hooks/use-asset-lists';
import { ASSETS, MARKET_CATEGORIES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Check, Edit, Plus, Star, StarOff, Trash, Search, Filter } from 'lucide-react';

export default function AssetListManager() {
  const { user } = useAuth();
  const { assetLists, isLoading, createAssetList, updateAssetList, deleteAssetList, setDefaultAssetList } = useAssetLists(user?.id || 0);
  const [activeTab, setActiveTab] = useState<string>('forex');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedList, setSelectedList] = useState<AssetList | null>(null);
  
  // Form states
  const [listName, setListName] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<AssetItem[]>([]);
  const [assetFilter, setAssetFilter] = useState('');
  
  // Reset form when dialogs close
  useEffect(() => {
    if (!showCreateDialog && !showEditDialog) {
      setListName('');
      setIsDefault(false);
      setSelectedAssets([]);
      setAssetFilter('');
      setSelectedList(null);
    }
  }, [showCreateDialog, showEditDialog]);
  
  // Populate form when editing
  useEffect(() => {
    if (selectedList) {
      setListName(selectedList.name);
      setIsDefault(selectedList.isDefault);
      setSelectedAssets(selectedList.assets);
    }
  }, [selectedList]);
  
  const handleCreateList = async () => {
    if (!listName || selectedAssets.length === 0) return;
    
    await createAssetList({
      name: listName,
      assets: selectedAssets,
      isDefault
    });
    
    setShowCreateDialog(false);
  };
  
  const handleUpdateList = async () => {
    if (!selectedList || !listName || selectedAssets.length === 0) return;
    
    await updateAssetList(selectedList.id, {
      name: listName,
      assets: selectedAssets,
      isDefault
    });
    
    setShowEditDialog(false);
  };
  
  const handleDeleteList = async (list: AssetList) => {
    if (window.confirm(`Are you sure you want to delete "${list.name}"?`)) {
      await deleteAssetList(list.id);
    }
  };
  
  const handleSetDefault = async (list: AssetList) => {
    await setDefaultAssetList(list.id);
  };
  
  const handleEditList = (list: AssetList) => {
    setSelectedList(list);
    setShowEditDialog(true);
  };
  
  const toggleAsset = (asset: AssetItem) => {
    const exists = selectedAssets.some(a => a.value === asset.value && a.type === asset.type);
    
    if (exists) {
      setSelectedAssets(selectedAssets.filter(a => !(a.value === asset.value && a.type === asset.type)));
    } else {
      setSelectedAssets([...selectedAssets, { ...asset }]);
    }
  };
  
  const isAssetSelected = (asset: AssetItem) => {
    return selectedAssets.some(a => a.value === asset.value && a.type === asset.type);
  };
  
  const filteredAssets = (type: string) => {
    return ASSETS[type as keyof typeof ASSETS].filter(asset => 
      asset.label.toLowerCase().includes(assetFilter.toLowerCase()) ||
      asset.value.toLowerCase().includes(assetFilter.toLowerCase())
    );
  };
  
  if (!user) {
    return (
      <div className="py-6 text-center">
        <p>Please log in to manage your asset lists.</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Asset Lists</h1>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create New List
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center my-10">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : assetLists.length === 0 ? (
        <Card className="p-8 text-center">
          <CardHeader>
            <CardTitle>No Asset Lists</CardTitle>
            <CardDescription>
              Create your first asset list to easily select your favorite trading instruments.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create New List
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assetLists.map(list => (
            <Card key={list.id} className={list.isDefault ? "border-primary" : ""}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle>{list.name}</CardTitle>
                  <div className="flex space-x-1">
                    {list.isDefault ? (
                      <Badge variant="outline" className="bg-primary/10">
                        <Star className="h-3 w-3 mr-1 fill-primary text-primary" />
                        Default
                      </Badge>
                    ) : (
                      <Button variant="ghost" size="icon" onClick={() => handleSetDefault(list)} title="Set as default">
                        <StarOff className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => handleEditList(list)} title="Edit list">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteList(list)} title="Delete list">
                      <Trash className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {list.assets.length} assets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {list.assets.slice(0, 8).map(asset => (
                    <Badge key={`${asset.type}-${asset.value}`} variant="secondary" className="text-xs">
                      {asset.value}
                    </Badge>
                  ))}
                  {list.assets.length > 8 && (
                    <Badge variant="outline" className="text-xs">
                      +{list.assets.length - 8} more
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Create Asset List Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Asset List</DialogTitle>
            <DialogDescription>
              Create a custom asset list with your favorite trading instruments.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="list-name" className="text-right">
                List Name
              </Label>
              <Input
                id="list-name"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                className="col-span-3"
                placeholder="My Favorite Assets"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="default-list" className="text-right">
                Set as Default
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="default-list"
                  checked={isDefault}
                  onCheckedChange={setIsDefault}
                />
                <Label htmlFor="default-list">
                  Use this list by default when analyzing charts
                </Label>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Select Assets</h3>
              <div className="mb-4">
                <Input
                  placeholder="Filter assets..."
                  value={assetFilter}
                  onChange={(e) => setAssetFilter(e.target.value)}
                  className="mb-2"
                />
                <div className="text-sm text-muted-foreground">
                  {selectedAssets.length} assets selected
                </div>
              </div>
              
              <Tabs defaultValue="forex" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="forex">Forex</TabsTrigger>
                  <TabsTrigger value="stocks">Stocks</TabsTrigger>
                  <TabsTrigger value="crypto">Crypto</TabsTrigger>
                </TabsList>
                
                <TabsContent value="forex" className="max-h-[40vh] overflow-y-auto">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {filteredAssets('forex').map(asset => (
                      <div key={asset.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`asset-${asset.value}`}
                          checked={isAssetSelected({ ...asset, type: 'forex' })}
                          onCheckedChange={() => toggleAsset({ ...asset, type: 'forex' })}
                        />
                        <Label htmlFor={`asset-${asset.value}`} className="cursor-pointer text-sm">
                          {asset.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="stocks" className="max-h-[40vh] overflow-y-auto">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {filteredAssets('stocks').map(asset => (
                      <div key={asset.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`asset-${asset.value}`}
                          checked={isAssetSelected({ ...asset, type: 'stocks' })}
                          onCheckedChange={() => toggleAsset({ ...asset, type: 'stocks' })}
                        />
                        <Label htmlFor={`asset-${asset.value}`} className="cursor-pointer text-sm">
                          {asset.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="crypto" className="max-h-[40vh] overflow-y-auto">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {filteredAssets('crypto').map(asset => (
                      <div key={asset.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`asset-${asset.value}`}
                          checked={isAssetSelected({ ...asset, type: 'crypto' })}
                          onCheckedChange={() => toggleAsset({ ...asset, type: 'crypto' })}
                        />
                        <Label htmlFor={`asset-${asset.value}`} className="cursor-pointer text-sm">
                          {asset.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateList} 
              disabled={!listName || selectedAssets.length === 0}
            >
              Create List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Asset List Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Asset List</DialogTitle>
            <DialogDescription>
              Update your custom asset list.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-list-name" className="text-right">
                List Name
              </Label>
              <Input
                id="edit-list-name"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-default-list" className="text-right">
                Set as Default
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="edit-default-list"
                  checked={isDefault}
                  onCheckedChange={setIsDefault}
                />
                <Label htmlFor="edit-default-list">
                  Use this list by default when analyzing charts
                </Label>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Select Assets</h3>
              <div className="mb-4">
                <Input
                  placeholder="Filter assets..."
                  value={assetFilter}
                  onChange={(e) => setAssetFilter(e.target.value)}
                  className="mb-2"
                />
                <div className="text-sm text-muted-foreground">
                  {selectedAssets.length} assets selected
                </div>
              </div>
              
              <Tabs defaultValue="forex" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="forex">Forex</TabsTrigger>
                  <TabsTrigger value="stocks">Stocks</TabsTrigger>
                  <TabsTrigger value="crypto">Crypto</TabsTrigger>
                </TabsList>
                
                <TabsContent value="forex" className="max-h-[40vh] overflow-y-auto">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {filteredAssets('forex').map(asset => (
                      <div key={asset.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-asset-${asset.value}`}
                          checked={isAssetSelected({ ...asset, type: 'forex' })}
                          onCheckedChange={() => toggleAsset({ ...asset, type: 'forex' })}
                        />
                        <Label htmlFor={`edit-asset-${asset.value}`} className="cursor-pointer text-sm">
                          {asset.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="stocks" className="max-h-[40vh] overflow-y-auto">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {filteredAssets('stocks').map(asset => (
                      <div key={asset.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-asset-${asset.value}`}
                          checked={isAssetSelected({ ...asset, type: 'stocks' })}
                          onCheckedChange={() => toggleAsset({ ...asset, type: 'stocks' })}
                        />
                        <Label htmlFor={`edit-asset-${asset.value}`} className="cursor-pointer text-sm">
                          {asset.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="crypto" className="max-h-[40vh] overflow-y-auto">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {filteredAssets('crypto').map(asset => (
                      <div key={asset.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-asset-${asset.value}`}
                          checked={isAssetSelected({ ...asset, type: 'crypto' })}
                          onCheckedChange={() => toggleAsset({ ...asset, type: 'crypto' })}
                        />
                        <Label htmlFor={`edit-asset-${asset.value}`} className="cursor-pointer text-sm">
                          {asset.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateList} 
              disabled={!listName || selectedAssets.length === 0}
            >
              Update List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}