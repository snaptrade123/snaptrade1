import OpenAI from "openai";
import { CHART_PATTERNS } from "../client/src/lib/constants";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Create system prompts
const chartPatternDetectionPrompt = `
You are a financial chart pattern recognition expert. Analyze the provided chart image and identify common trading patterns.
Focus on these patterns: ${CHART_PATTERNS.map(p => p.name).join(', ')}.

For each detected pattern, provide:
1. The pattern name
2. The type (bullish, bearish, or neutral)
3. A confidence score (0-100)

Respond with a JSON array of detected patterns, sorted by confidence (highest first). 
Limit to the 3 most confident detections.
Example format:
[
  {
    "name": "Head and Shoulders",
    "type": "bearish",
    "confidence": 87
  }
]

If no patterns are detected with reasonable confidence, return an empty array.
`;

const newsSentimentPrompt = `
You are a financial news sentiment analyst. Analyze the following news headlines and summaries related to a specific financial asset.

For each article, determine:
1. A sentiment score between -1.0 (extremely negative) and 1.0 (extremely positive)

Then provide an overall sentiment score for all articles combined.

Format your response as JSON:
{
  "score": 0.25,
  "articles": [
    {
      "title": "Article title",
      "sentiment": 0.75
    }
  ]
}
`;

const combinedAnalysisPrompt = `
You are a financial market analyst. Based on the provided technical pattern analysis and news sentiment analysis for a specific asset, predict the likely market direction.

Technical patterns detected:
{{PATTERNS}}

News sentiment:
{{SENTIMENT}}

Asset: {{ASSET}}

Provide your analysis as JSON with the following structure:
{
  "direction": "bullish" | "bearish" | "neutral",
  "confidence": 70, // a number between 0-100
  "explanation": "A brief explanation of your prediction...",
  "weights": {
    "technical": 70, // percentage weight given to technical analysis
    "news": 30 // percentage weight given to news sentiment
  }
}

The weights should sum to 100%. Typically technical analysis should be weighted higher (70-80%) unless news sentiment is extremely strong.
`;

// Helper functions to validate OpenAI responses
function validatePatternResponse(data: any): boolean {
  if (!Array.isArray(data)) return false;
  
  for (const pattern of data) {
    if (typeof pattern !== 'object') return false;
    if (typeof pattern.name !== 'string') return false;
    if (!['bullish', 'bearish', 'neutral'].includes(pattern.type)) return false;
    if (typeof pattern.confidence !== 'number' || pattern.confidence < 0 || pattern.confidence > 100) return false;
  }
  
  return true;
}

function validateSentimentResponse(data: any): boolean {
  if (typeof data !== 'object') return false;
  if (typeof data.score !== 'number' || data.score < -1 || data.score > 1) return false;
  if (!Array.isArray(data.articles)) return false;
  
  for (const article of data.articles) {
    if (typeof article !== 'object') return false;
    if (typeof article.title !== 'string') return false;
    if (typeof article.sentiment !== 'number' || article.sentiment < -1 || article.sentiment > 1) return false;
  }
  
  return true;
}

function validatePredictionResponse(data: any): boolean {
  if (typeof data !== 'object') return false;
  if (!['bullish', 'bearish', 'neutral'].includes(data.direction)) return false;
  if (typeof data.confidence !== 'number' || data.confidence < 0 || data.confidence > 100) return false;
  if (typeof data.explanation !== 'string') return false;
  if (typeof data.weights !== 'object') return false;
  if (typeof data.weights.technical !== 'number' || typeof data.weights.news !== 'number') return false;
  if (data.weights.technical + data.weights.news !== 100) return false;
  
  return true;
}

// Main analysis functions
export async function analyzeChartImage(base64Image: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: chartPatternDetectionPrompt 
        },
        { 
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this financial chart and identify trading patterns."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content in response");
    }

    const patterns = JSON.parse(content);
    
    if (!validatePatternResponse(patterns)) {
      throw new Error("Invalid pattern response format");
    }

    return patterns;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error analyzing chart image:", error);
    throw new Error(`Failed to analyze chart image: ${errorMessage}`);
  }
}

export async function analyzeNewsSentiment(asset: string, newsArticles: any[]) {
  try {
    // If no news articles, return default neutral sentiment
    if (!newsArticles || newsArticles.length === 0) {
      console.log(`No news articles available for ${asset}, returning neutral sentiment`);
      return {
        score: 0,
        articles: []
      };
    }
    
    // Process the available articles
    const articlesText = newsArticles.map(article => {
      const title = article.title || "No title available";
      const summary = article.summary || article.description || "No summary available";
      const source = article.source ? (article.source.name || article.source) : "Unknown source";
      
      return `Title: ${title}\nSummary: ${summary}\nSource: ${source}\n`;
    }).join("\n---\n");

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: newsSentimentPrompt 
        },
        { 
          role: "user",
          content: `Analyze the sentiment of these news articles about ${asset}:\n\n${articlesText}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content in response");
    }

    const sentiment = JSON.parse(content);
    
    if (!validateSentimentResponse(sentiment)) {
      throw new Error("Invalid sentiment response format");
    }

    // Add the original article data to the sentiment result
    const enrichedArticles = sentiment.articles.map((article: any, index: number) => ({
      title: newsArticles[index].title,
      source: newsArticles[index].source.name || newsArticles[index].source,
      time: newsArticles[index].publishedAt || "Recently",
      url: newsArticles[index].url,
      summary: newsArticles[index].summary || newsArticles[index].description,
      sentiment: article.sentiment
    }));

    return {
      score: sentiment.score,
      articles: enrichedArticles
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error analyzing news sentiment:", error);
    throw new Error(`Failed to analyze news sentiment: ${errorMessage}`);
  }
}

export async function generateCombinedPrediction(patterns: any[], sentiment: any, asset: string) {
  try {
    const patternsText = JSON.stringify(patterns, null, 2);
    const sentimentText = JSON.stringify(sentiment, null, 2);
    
    const promptText = combinedAnalysisPrompt
      .replace("{{PATTERNS}}", patternsText)
      .replace("{{SENTIMENT}}", sentimentText)
      .replace("{{ASSET}}", asset);

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "user",
          content: promptText
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content in response");
    }

    const prediction = JSON.parse(content);
    
    if (!validatePredictionResponse(prediction)) {
      throw new Error("Invalid prediction response format");
    }

    return prediction;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error generating combined prediction:", error);
    throw new Error(`Failed to generate prediction: ${errorMessage}`);
  }
}
