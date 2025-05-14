import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Share2Icon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const saveAnalysisSchema = z.object({
  name: z.string().min(3, { message: "Analysis name must be at least 3 characters" }).max(50),
  notes: z.string().optional(),
});

type SaveAnalysisForm = z.infer<typeof saveAnalysisSchema>;

const AdditionalFeatures = () => {
  const { toast } = useToast();
  const form = useForm<SaveAnalysisForm>({
    resolver: zodResolver(saveAnalysisSchema),
    defaultValues: {
      name: "",
      notes: "",
    },
  });

  const onSubmit = (data: SaveAnalysisForm) => {
    toast({
      title: "Analysis saved",
      description: `Saved as "${data.name}"`,
    });
    
    form.reset();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Historical Accuracy</h3>
          <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded">BETA</span>
        </div>
        <div className="flex items-center justify-center p-4">
          {/* Donut chart for accuracy */}
          <div className="relative w-32 h-32">
            <svg viewBox="0 0 36 36" className="w-full h-full">
              <path 
                className="fill-border" 
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
              />
              <path 
                className="fill-primary" 
                strokeDasharray="73, 100" 
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
              />
              <text x="18" y="20.5" className="fill-foreground text-xl font-bold" textAnchor="middle">73%</text>
            </svg>
          </div>
        </div>
        <div className="text-center mt-2">
          <p className="text-sm text-muted-foreground">
            Based on pattern detection accuracy over the last 100 analyses
          </p>
        </div>
      </div>
      
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-lg font-medium mb-4">Save Analysis</h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Analysis Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Tesla Head & Shoulders Jun 2023" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add your trading notes..." 
                      rows={3} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex space-x-2">
              <Button type="submit" className="flex-1">
                Save Analysis
              </Button>
              <Button variant="outline" type="button" size="icon">
                <Share2Icon className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default AdditionalFeatures;
