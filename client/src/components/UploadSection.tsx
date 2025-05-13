import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { CloudUploadIcon, SearchIcon, RotateCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ASSETS } from "@/lib/constants";

type UploadSectionProps = {
  onUpload: (file: File, asset: string) => Promise<void>;
  isLoading: boolean;
};

const UploadSection: React.FC<UploadSectionProps> = ({ onUpload, isLoading }) => {
  const [file, setFile] = useState<File | null>(null);
  const [asset, setAsset] = useState<string>("");
  const { toast } = useToast();

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
        <Label htmlFor="market-select" className="mb-2">Select Market/Asset</Label>
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
