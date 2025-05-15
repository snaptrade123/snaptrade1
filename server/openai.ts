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
You are an expert financial market analyst and trader. Based on the provided technical pattern analysis and news sentiment analysis for a specific asset, predict the likely market direction and provide actionable trading recommendations including entry points, stop loss, and take profit levels.

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
  },
  "tradingRecommendation": {
    "entryPrice": 123.45, // estimated entry price or null if can't be determined
    "stopLoss": 120.00, // recommended stop loss level or null
    "takeProfit": 130.00, // recommended take profit level or null
    "entryCondition": "Enter long position when price breaks above resistance at 123.45", // text explaining entry condition
    "timeframe": "Short-term (1-2 weeks)", // recommended trading timeframe: "Quick trade (intraday to 3 days)", "Swing trade (1-2 weeks)", or "Position trade (2+ weeks)"
    "riskRewardRatio": 2.5, // calculated risk-reward ratio or null
    "quickTrade": { // for day traders and short-term positions
      "entryPrice": 123.45, // can be the same as main recommendation or slightly different
      "stopLoss": 122.00, // tighter stop loss for quick trades
      "takeProfit": 126.00, // closer target for quick trades
      "timeframe": "Intraday to 3 days"
    },
    "swingTrade": { // for swing traders looking for larger moves
      "entryPrice": 123.45, // often same as main recommendation
      "stopLoss": 120.00, // wider stop loss for swing trades
      "takeProfit": 130.00, // further target for swing trades
      "timeframe": "1-2 weeks"
    }
  }
}

The weights should sum to 100%. Typically technical analysis should be weighted higher (70-80%) unless news sentiment is extremely strong.

For the tradingRecommendation:
- If exact price levels cannot be determined from the data, provide estimates based on the patterns or set the values to null
- For forex and crypto, use appropriate precision (e.g., 4-5 decimal places for forex majors)
- Ensure the risk-reward ratio is favorable (generally at least 1:2) for the direction recommended
- Format the entry condition as: "In this example, a professional trader *might* consider an entry around [entry price], with a stop below support at [stop loss], and a target near resistance at [take profit]. This is for educational purposes only."
- If direction is "neutral", you may provide recommendations for both bullish and bearish scenarios or indicate to wait for clearer signals
`;

// Helper functions to validate OpenAI responses
function validatePatternResponse(data: any): boolean {
  console.log("Validating pattern response:", JSON.stringify(data, null, 2));
  
  // Check if the response has a "patterns" array property (this is common in GPT-4o responses)
  if (data.patterns && Array.isArray(data.patterns)) {
    data = data.patterns;
  }
  
  // Handle case where response is not wrapped in an array
  if (!Array.isArray(data)) {
    if (typeof data === 'object' && data !== null) {
      // If it's a single object with pattern properties, convert to array
      if (data.name && data.type && 'confidence' in data) {
        data = [data];
      } else {
        console.error("Invalid pattern format - not an array and not a single valid pattern");
        return false;
      }
    } else {
      console.error("Invalid pattern format - not an array or object:", data);
      return false;
    }
  }
  
  for (const pattern of data) {
    if (typeof pattern !== 'object') {
      console.error("Pattern is not an object:", pattern);
      return false;
    }
    
    if (typeof pattern.name !== 'string') {
      console.error("Pattern name is not a string:", pattern.name);
      return false;
    }
    
    if (!['bullish', 'bearish', 'neutral'].includes(pattern.type)) {
      console.error("Invalid pattern type:", pattern.type);
      return false;
    }
    
    if (typeof pattern.confidence !== 'number' || pattern.confidence < 0 || pattern.confidence > 100) {
      console.error("Invalid confidence value:", pattern.confidence);
      return false;
    }
  }
  
  return true;
}

function validateSentimentResponse(data: any): boolean {
  console.log("Validating sentiment response:", JSON.stringify(data, null, 2));
  
  if (typeof data !== 'object') {
    console.error("Sentiment data is not an object");
    return false;
  }
  
  // Check for score field
  if (typeof data.score !== 'number' || data.score < -1 || data.score > 1) {
    console.error("Invalid sentiment score:", data.score);
    
    // Special case: if score is outside range but otherwise valid, clamp it
    if (typeof data.score === 'number') {
      data.score = Math.max(-1, Math.min(1, data.score));
      console.log("Clamped sentiment score to valid range:", data.score);
    } else {
      return false;
    }
  }
  
  // Check for articles array
  if (!Array.isArray(data.articles)) {
    console.error("Articles is not an array");
    
    // If there are no articles, set to empty array
    data.articles = [];
    console.log("Set articles to empty array");
  }
  
  // Validate each article
  for (const article of data.articles) {
    if (typeof article !== 'object') {
      console.error("Article is not an object:", article);
      continue; // Skip this invalid article but don't fail
    }
    
    if (typeof article.title !== 'string') {
      console.error("Article title is not a string:", article.title);
      article.title = "Untitled Article";
      console.log("Set article title to 'Untitled Article'");
    }
    
    if (typeof article.sentiment !== 'number' || article.sentiment < -1 || article.sentiment > 1) {
      console.error("Invalid article sentiment:", article.sentiment);
      
      // If sentiment is a number but outside range, clamp it
      if (typeof article.sentiment === 'number') {
        article.sentiment = Math.max(-1, Math.min(1, article.sentiment));
        console.log("Clamped article sentiment to valid range:", article.sentiment);
      } else {
        // Default to neutral sentiment
        article.sentiment = 0;
        console.log("Set article sentiment to neutral (0)");
      }
    }
  }
  
  return true;
}

function validatePredictionResponse(data: any): boolean {
  console.log("Validating prediction response:", JSON.stringify(data, null, 2));
  
  if (typeof data !== 'object') {
    console.error("Prediction data is not an object");
    return false;
  }
  
  // Check direction
  if (!['bullish', 'bearish', 'neutral'].includes(data.direction)) {
    console.error("Invalid direction:", data.direction);
    
    // Default to neutral if invalid
    data.direction = 'neutral';
    console.log("Set direction to 'neutral'");
  }
  
  // Check confidence
  if (typeof data.confidence !== 'number' || data.confidence < 0 || data.confidence > 100) {
    console.error("Invalid confidence:", data.confidence);
    
    // If it's a number but outside range, clamp it
    if (typeof data.confidence === 'number') {
      data.confidence = Math.max(0, Math.min(100, data.confidence));
      console.log("Clamped confidence to valid range:", data.confidence);
    } else {
      // Default to medium confidence
      data.confidence = 50;
      console.log("Set confidence to default (50)");
    }
  }
  
  // Check explanation
  if (typeof data.explanation !== 'string') {
    console.error("Invalid explanation:", data.explanation);
    data.explanation = "No explanation provided";
    console.log("Set explanation to default text");
  }
  
  // Check weights
  if (typeof data.weights !== 'object' || data.weights === null) {
    console.error("Invalid weights object:", data.weights);
    data.weights = { technical: 70, news: 30 };
    console.log("Set weights to default values");
  } else {
    // Check individual weight values
    if (typeof data.weights.technical !== 'number') {
      console.error("Invalid technical weight:", data.weights.technical);
      data.weights.technical = 70;
      console.log("Set technical weight to default (70)");
    }
    
    if (typeof data.weights.news !== 'number') {
      console.error("Invalid news weight:", data.weights.news);
      data.weights.news = 30;
      console.log("Set news weight to default (30)");
    }
    
    // Ensure weights sum to 100
    if (data.weights.technical + data.weights.news !== 100) {
      console.error("Weights don't sum to 100:", data.weights);
      
      // Normalize weights
      const total = data.weights.technical + data.weights.news;
      if (total > 0) {
        data.weights.technical = Math.round((data.weights.technical / total) * 100);
        data.weights.news = 100 - data.weights.technical;
      } else {
        data.weights.technical = 70;
        data.weights.news = 30;
      }
      
      console.log("Normalized weights to sum to 100:", data.weights);
    }
  }
  
  // Validate trading recommendation if present
  if (data.tradingRecommendation === undefined || data.tradingRecommendation === null) {
    console.log("No trading recommendation provided, creating default");
    data.tradingRecommendation = {
      entryPrice: null,
      stopLoss: null,
      takeProfit: null,
      entryCondition: "In this example, a professional trader *might* consider waiting for confirmation before entering. This is for educational purposes only.",
      timeframe: "Medium-term",
      riskRewardRatio: null,
      quickTrade: {
        entryPrice: null,
        stopLoss: null,
        takeProfit: null,
        timeframe: "Intraday to 3 days"
      },
      swingTrade: {
        entryPrice: null,
        stopLoss: null,
        takeProfit: null,
        timeframe: "1-2 weeks"
      }
    };
  } else if (typeof data.tradingRecommendation !== 'object') {
    console.error("Invalid trading recommendation (not an object):", data.tradingRecommendation);
    data.tradingRecommendation = {
      entryPrice: null,
      stopLoss: null,
      takeProfit: null,
      entryCondition: "In this example, a professional trader *might* consider waiting for confirmation before entering. This is for educational purposes only.",
      timeframe: "Medium-term",
      riskRewardRatio: null,
      quickTrade: {
        entryPrice: null,
        stopLoss: null,
        takeProfit: null,
        timeframe: "Intraday to 3 days"
      },
      swingTrade: {
        entryPrice: null,
        stopLoss: null,
        takeProfit: null,
        timeframe: "1-2 weeks"
      }
    };
  } else {
    // Validate entry price
    if (data.tradingRecommendation.entryPrice !== undefined && 
        data.tradingRecommendation.entryPrice !== null && 
        typeof data.tradingRecommendation.entryPrice !== 'number') {
      console.error("Invalid entry price:", data.tradingRecommendation.entryPrice);
      data.tradingRecommendation.entryPrice = null;
    }
    
    // Validate stop loss
    if (data.tradingRecommendation.stopLoss !== undefined && 
        data.tradingRecommendation.stopLoss !== null && 
        typeof data.tradingRecommendation.stopLoss !== 'number') {
      console.error("Invalid stop loss:", data.tradingRecommendation.stopLoss);
      data.tradingRecommendation.stopLoss = null;
    }
    
    // Validate take profit
    if (data.tradingRecommendation.takeProfit !== undefined && 
        data.tradingRecommendation.takeProfit !== null && 
        typeof data.tradingRecommendation.takeProfit !== 'number') {
      console.error("Invalid take profit:", data.tradingRecommendation.takeProfit);
      data.tradingRecommendation.takeProfit = null;
    }
    
    // Validate entry condition
    if (data.tradingRecommendation.entryCondition === undefined || 
        typeof data.tradingRecommendation.entryCondition !== 'string') {
      console.error("Invalid entry condition:", data.tradingRecommendation.entryCondition);
      data.tradingRecommendation.entryCondition = "In this example, a professional trader *might* consider waiting for confirmation before entering. This is for educational purposes only.";
    } else if (!data.tradingRecommendation.entryCondition.includes("*might*") && 
               !data.tradingRecommendation.entryCondition.includes("might")) {
      // Add *might* if it's missing
      data.tradingRecommendation.entryCondition = data.tradingRecommendation.entryCondition.replace(
        "trader", "professional trader *might*"
      );
    }
    
    // Add educational purposes disclaimer if missing
    if (!data.tradingRecommendation.entryCondition.includes("educational purposes")) {
      data.tradingRecommendation.entryCondition += " This is for educational purposes only.";
    }
    
    // Validate timeframe
    if (data.tradingRecommendation.timeframe === undefined || 
        typeof data.tradingRecommendation.timeframe !== 'string') {
      console.error("Invalid timeframe:", data.tradingRecommendation.timeframe);
      data.tradingRecommendation.timeframe = "Medium-term";
    }
    
    // Validate risk reward ratio
    if (data.tradingRecommendation.riskRewardRatio !== undefined && 
        data.tradingRecommendation.riskRewardRatio !== null && 
        typeof data.tradingRecommendation.riskRewardRatio !== 'number') {
      console.error("Invalid risk reward ratio:", data.tradingRecommendation.riskRewardRatio);
      data.tradingRecommendation.riskRewardRatio = null;
    }
    
    // Check and create quickTrade if missing
    if (!data.tradingRecommendation.quickTrade || typeof data.tradingRecommendation.quickTrade !== 'object') {
      console.log("Creating default quick trade setup");
      data.tradingRecommendation.quickTrade = {
        entryPrice: data.tradingRecommendation.entryPrice,
        stopLoss: data.tradingRecommendation.stopLoss,
        takeProfit: data.tradingRecommendation.takeProfit ? 
          // For quick trades, set a closer target (halfway to the main target)
          data.tradingRecommendation.entryPrice + 
          ((data.tradingRecommendation.takeProfit - data.tradingRecommendation.entryPrice) * 0.5) :
          null,
        timeframe: "Intraday to 3 days"
      };
    }
    
    // Check and create swingTrade if missing
    if (!data.tradingRecommendation.swingTrade || typeof data.tradingRecommendation.swingTrade !== 'object') {
      console.log("Creating default swing trade setup");
      data.tradingRecommendation.swingTrade = {
        entryPrice: data.tradingRecommendation.entryPrice,
        stopLoss: data.tradingRecommendation.stopLoss,
        takeProfit: data.tradingRecommendation.takeProfit,
        timeframe: "1-2 weeks"
      };
    }
  }
  
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

    console.log("Raw OpenAI response:", content);
    
    try {
      const patterns = JSON.parse(content);
      
      if (!validatePatternResponse(patterns)) {
        throw new Error("Invalid pattern response format");
      }
      
      // If the response has a "patterns" property, return that
      if (patterns.patterns && Array.isArray(patterns.patterns)) {
        return patterns.patterns;
      }
      
      // Otherwise return the patterns directly
      return Array.isArray(patterns) ? patterns : [patterns];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Error parsing pattern response:", error);
      throw new Error(`Failed to parse pattern response: ${errorMessage}`);
    }
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
