import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { CloudUploadIcon, SearchIcon, RotateCwIcon, ListChecks, ListPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useAssetLists, useDefaultAssetList } from "@/hooks/use-asset-lists";
import AssetListManager from "@/components/AssetListManager";
import { ASSETS } from "@/lib/constants";

type UploadSectionProps = {
  onUpload: (file: File, asset: string) => Promise<void>;
  isLoading: boolean;
};

const UploadSection: React.FC<UploadSectionProps> = ({ onUpload, isLoading }) => {
  const [file, setFile] = useState<File | null>(null);
  const [asset, setAsset] = useState<string>("");
  const [assetListView, setAssetListView] = useState<"standard" | "custom">("standard");
  const [showAssetManager, setShowAssetManager] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Get user's asset lists
  const { assetLists } = useAssetLists(user?.id || 0);
  const { defaultAssetList } = useDefaultAssetList(user?.id || 0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      // Check file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 5MB",
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
      toast({
        title: "File uploaded",
        description: `${selectedFile.name} is ready for analysis`,
      });
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
    },
    maxFiles: 1,
  });

  const handleAnalyze = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please upload a chart image first",
        variant: "destructive",
      });
      return;
    }

    if (!asset) {
      toast({
        title: "No asset selected",
        description: "Please select a market/asset first",
        variant: "destructive",
      });
      return;
    }

    await onUpload(file, asset);
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 mb-6">
      <h3 className="text-lg font-medium mb-4">Upload Chart</h3>
      
      {/* Upload Zone */}
      <div 
        {...getRootProps()} 
        className={`upload-zone ${isDragActive ? 'upload-zone-active' : ''} ${file ? 'border-primary' : ''}`}
      >
        <input {...getInputProps()} aria-label="Upload chart image" />
        <CloudUploadIcon className="h-10 w-10 text-primary mb-4 mx-auto" />
        <p className="mb-2">Drag and drop your chart screenshot</p>
        <p className="text-sm text-muted-foreground mb-4">or click to browse files</p>
        <p className="text-xs text-muted-foreground">Supported formats: PNG, JPG, JPEG (Max 5MB)</p>
        
        {file && (
          <div className="mt-4 p-2 bg-secondary rounded-md">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
        )}
      </div>
      
      {/* Asset Selection */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <Label htmlFor="market-select">Select Market/Asset</Label>
          {user && (
            <Dialog open={showAssetManager} onOpenChange={setShowAssetManager}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <ListChecks className="h-4 w-4 mr-2" />
                  Manage Lists
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <AssetListManager />
              </DialogContent>
            </Dialog>
          )}
        </div>
        
        {user && (
          <Tabs defaultValue="standard" value={assetListView} onValueChange={(value) => setAssetListView(value as "standard" | "custom")} className="mb-4">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="standard">Standard Assets</TabsTrigger>
              <TabsTrigger value="custom" disabled={!user || assetLists.length === 0}>
                {assetLists.length === 0 ? "My Lists (Create a list first)" : "My Asset Lists"}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
        
        {assetListView === "standard" ? (
          <Select value={asset} onValueChange={setAsset}>
            <SelectTrigger id="market-select" className="w-full">
              <SelectValue placeholder="Select an asset" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              <SelectGroup>
                <SelectLabel>Forex</SelectLabel>
                {ASSETS.forex.map((item) => (
                  <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                ))}
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Stocks</SelectLabel>
                {ASSETS.stocks.map((item) => (
                  <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                ))}
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Crypto</SelectLabel>
                {ASSETS.crypto.map((item) => (
                  <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        ) : (
          <div className="space-y-2">
            {defaultAssetList && (
              <div className="mb-2">
                <Badge variant="outline" className="bg-primary/10 mb-1">
                  <Star className="h-3 w-3 mr-1 fill-primary text-primary" />
                  Default List
                </Badge>
                <Card className="p-4">
                  <CardTitle className="text-sm font-medium mb-2">{defaultAssetList.name}</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    {defaultAssetList.assets.map((assetItem) => (
                      <Button
                        key={`${assetItem.type}-${assetItem.value}`}
                        variant={asset === assetItem.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAsset(assetItem.value)}
                        className="text-xs"
                      >
                        {assetItem.label}
                      </Button>
                    ))}
                  </div>
                </Card>
              </div>
            )}
            
            {assetLists.filter(list => !list.isDefault).map(list => (
              <Card key={list.id} className="p-4">
                <CardTitle className="text-sm font-medium mb-2">{list.name}</CardTitle>
                <div className="flex flex-wrap gap-2">
                  {list.assets.map((assetItem) => (
                    <Button
                      key={`${assetItem.type}-${assetItem.value}`}
                      variant={asset === assetItem.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAsset(assetItem.value)}
                      className="text-xs"
                    >
                      {assetItem.label}
                    </Button>
                  ))}
                </div>
              </Card>
            ))}
            
            {assetLists.length === 0 && (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-2">You don't have any asset lists yet</p>
                <Button variant="outline" onClick={() => setShowAssetManager(true)}>
                  <ListPlus className="h-4 w-4 mr-2" />
                  Create Asset List
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      
      <Button 
        onClick={handleAnalyze} 
        disabled={isLoading || !file || !asset} 
        className="w-full py-6" 
        size="lg"
      >
        {isLoading ? (
          <>
            <RotateCwIcon className="h-4 w-4 mr-2 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <SearchIcon className="h-4 w-4 mr-2" />
            Analyze Chart
          </>
        )}
      </Button>
    </div>
  );
};

export default UploadSection;
