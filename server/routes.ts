import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeChartImage, analyzeNewsSentiment, generateCombinedPrediction } from "./openai";
import axios from "axios";

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoint for image analysis
  app.post("/api/analyze", async (req, res) => {
    try {
      const { image, asset } = req.body;
      
      if (!image) {
        return res.status(400).json({ message: "No image provided" });
      }
      
      if (!asset) {
        return res.status(400).json({ message: "No asset provided" });
      }

      // 1. Detect patterns in the chart image
      const patterns = await analyzeChartImage(image);

      // 2. Fetch recent news for the asset
      const newsApiKey = process.env.NEWS_API_KEY || "";
      if (!newsApiKey) {
        return res.status(500).json({ message: "News API key not configured" });
      }

      // Convert asset name to a search query
      const searchQuery = asset.replace('/', ' ').replace('-', ' ');
      
      let newsArticles = [];
      try {
        const newsResponse = await axios.get(`https://newsapi.org/v2/everything`, {
          params: {
            q: searchQuery,
            sortBy: 'publishedAt',
            language: 'en',
            pageSize: 10,
            apiKey: newsApiKey
          }
        });

        newsArticles = newsResponse.data.articles || [];
        
        // Ensure we have at least one article
        if (newsArticles.length === 0) {
          console.log(`No news articles found for ${searchQuery}. Trying broader search...`);
          
          // Try a more general search - extract the first part of the asset name
          const broadSearchTerm = searchQuery.split(' ')[0];
          const broadNewsResponse = await axios.get(`https://newsapi.org/v2/everything`, {
            params: {
              q: broadSearchTerm,
              sortBy: 'publishedAt',
              language: 'en',
              pageSize: 5,
              apiKey: newsApiKey
            }
          });
          
          newsArticles = broadNewsResponse.data.articles || [];
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error("Error fetching news:", errorMessage);
        // Continue without news data if there's an error
        newsArticles = [];
      }

      // 3. Analyze sentiment of news articles
      const newsSentiment = await analyzeNewsSentiment(asset, newsArticles);

      // 4. Generate combined prediction
      const prediction = await generateCombinedPrediction(patterns, newsSentiment, asset);

      // 5. Save analysis to storage
      const result = {
        asset,
        imageUrl: `data:image/jpeg;base64,${image}`,
        patterns,
        newsSentiment,
        prediction,
        timestamp: new Date() // Use Date object directly
      };

      const savedAnalysis = await storage.createAnalysis(result);

      return res.status(200).json(savedAnalysis);
    } catch (error) {
      console.error("Error in /api/analyze:", error);
      return res.status(500).json({ 
        message: error instanceof Error ? error.message : "An unknown error occurred" 
      });
    }
  });

  // API endpoint to save analysis with name and notes
  app.post("/api/analysis/save", async (req, res) => {
    try {
      const { name, notes, result } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: "Analysis name is required" });
      }
      
      if (!result) {
        return res.status(400).json({ message: "Analysis result is required" });
      }

      const savedResult = await storage.saveNamedAnalysis({
        name,
        notes: notes || "",
        result,
        timestamp: new Date()
      });

      return res.status(200).json(savedResult);
    } catch (error) {
      console.error("Error in /api/analysis/save:", error);
      return res.status(500).json({ 
        message: error instanceof Error ? error.message : "An unknown error occurred" 
      });
    }
  });

  // API endpoint to get saved analyses
  app.get("/api/analyses", async (req, res) => {
    try {
      const analyses = await storage.getAnalyses();
      return res.status(200).json(analyses);
    } catch (error) {
      console.error("Error in /api/analyses:", error);
      return res.status(500).json({ 
        message: error instanceof Error ? error.message : "An unknown error occurred" 
      });
    }
  });

  // API endpoint to get a specific analysis
  app.get("/api/analysis/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const analysis = await storage.getAnalysis(parseInt(id));
      
      if (!analysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }
      
      return res.status(200).json(analysis);
    } catch (error) {
      console.error(`Error in /api/analysis/${req.params.id}:`, error);
      return res.status(500).json({ 
        message: error instanceof Error ? error.message : "An unknown error occurred" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
