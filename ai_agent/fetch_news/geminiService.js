import { GoogleGenAI } from "@google/genai";

// Initialize the Google GenAI client with hard-coded API key
const apiKey = "AIzaSyBnpTrUpfVmBkqXBFTMl_7C81OkXaoh8kw";
const ai = new GoogleGenAI({ apiKey });

// Default topics to fetch news about
const NEWS_TOPICS = [
  'economics',
  'war',
  'politics',
  'technology',
  'science',
  'health',
  'environment',
  'sports',
  'entertainment',
  'business'
];

/**
 * Fetches the latest news using Gemini's capabilities
 * @returns {Promise<Array>} Array of processed news articles
 */
export async function fetchNewsWithGemini() {
  try {
    // Get news for each topic
    const allArticles = [];
    
    // Only fetch a subset of topics to stay within token limits and reduce processing time
    const topicsToFetch = NEWS_TOPICS.slice(0, 3);
    
    for (const topic of topicsToFetch) {
      const articles = await fetchNewsByTopic(topic);
      allArticles.push(...articles);
    }
    
    // Return only up to 10 articles
    return allArticles.slice(0, 10);
  } catch (error) {
    console.error('Error fetching news with Gemini:', error);
    throw error;
  }
}

/**
 * Fetches news for a specific topic using Gemini
 * @param {string} topic - The news topic
 * @returns {Promise<Array>} - Array of news articles for the topic
 */
async function fetchNewsByTopic(topic) {
  try {
    const prompt = `
You are a helpful assistant that finds, summarizes, and analyzes current news with financial implications.

I need you to search the web for the latest news about "${topic}".
Find 3-4 recent important news stories on this topic.

For each news story, provide the following information in a valid JSON array format:
[
  {
    "title": "Full article title",
    "oneLineTitle": "Very brief, catchy one-line title (maximum 50 characters)",
    "url": "The URL to the full article",
    "imageUrl": "URL to a relevant image (leave empty if not available)",
    "sourceName": "Name of the news source",
    "sourceLogoUrl": "URL to the logo image of the news source (e.g., CNN logo, Yahoo Finance logo)",
    "publishedAt": "Publication date if available, otherwise use current date",
    "summary": "A concise 2-paragraph summary of the article",
    "factualRating": A number from 1-5 representing factual accuracy (5 being most factual),
    "biasRating": "Political bias on a scale from: Extreme Left, Left, Center-Left, Center, Center-Right, Right, Extreme Right",
    "tradingInsights": [
      {
        "ticker": "Stock ticker symbol (e.g., AAPL, MSFT)",
        "insight": "A brief, actionable trading insight explaining how this news might impact this specific stock"
      },
      ... more stocks affected by this news (at least 2-3 tickers per article if relevant)
    ]
  },
  ... more articles
]

For the tradingInsights field:
- Include 2-3 relevant stock tickers that might be affected by this news
- For each ticker, provide a clear, concise explanation of potential impact
- Focus on direct effects rather than speculative outcomes
- If the news has no clear stock market implications, provide an empty array

For the oneLineTitle:
- Create a catchy, concise version of the title (max 50 characters)
- Capture the essence of the news story in a way that's attention-grabbing
- Ensure it's accurate and not misleading

For the sourceLogoUrl:
- Provide the URL to the official logo of the news source
- If unsure about the exact URL, provide a reasonable estimate based on the source's main domain
- If completely unavailable, use an empty string

Only return the valid JSON array.
Do not include any other text before or after the JSON.
`;

    // Generate response from Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: prompt,
    });
    const generatedText = response.text;
    
    // Parse the JSON response
    let jsonMatch = generatedText.match(/\[[\s\S]*\]/);
    
    // Extract JSON from the response
    if (jsonMatch) {
      const articles = JSON.parse(jsonMatch[0]);
      
      // Add original content placeholder and topic
      return articles.map(article => ({
        ...article,
        topic,
        originalContent: article.summary // Use summary as original content since we don't have the full text
      }));
    } else {
      console.error('Failed to extract JSON array from response for topic:', topic);
      return [];
    }
  } catch (error) {
    console.error(`Error fetching news for topic ${topic}:`, error);
    return [];
  }
}

/**
 * Processes a single news article with Gemini to extract and enhance information
 * This function is kept for backward compatibility or if you have article data from another source
 * @param {Object} article - The raw article data
 * @returns {Promise<Object>} - Enhanced article with AI-generated content
 */
export async function processNewsWithGemini(article) {
  try {
    const prompt = `
You are an expert news analyst, fact-checker, and financial advisor.

Please analyze this news article and provide the following in a JSON structure:
1. A concise 2-paragraph summary of the article
2. A factual accuracy rating on a scale of 1-5 (where 5 is completely factual)
3. A bias rating on a scale from "Extreme Left", "Left", "Center-Left", "Center", "Center-Right", "Right", "Extreme Right"
4. Trading insights for stocks that might be affected by this news
5. A very brief, catchy one-line title (max 50 characters)
6. The URL to the logo image of the news source

Here is the article information:
Title: ${article.title}
Content: ${article.content || article.description}
Source: ${article.source?.name || 'Unknown'}
URL: ${article.url}

Return ONLY a valid JSON object with these fields:
- summary (string, 2 paragraphs)
- factualRating (number 1-5)
- biasRating (string)
- tradingInsights (array of objects with ticker and insight fields)
- oneLineTitle (string, max 50 characters)
- sourceLogoUrl (string URL to the news source logo)

For tradingInsights, include 2-3 stock tickers that might be affected by this news, with a brief explanation for each.
`;

    // Generate response from Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: prompt,
    });
    const generatedText = response.text;
    
    // Parse the JSON response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    
    // Extract JSON from the response
    let geminiResult;
    if (jsonMatch) {
      geminiResult = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Could not extract valid JSON from Gemini response');
    }

    // Return the enhanced article
    return {
      title: article.title,
      oneLineTitle: geminiResult.oneLineTitle || article.title,
      url: article.url,
      imageUrl: article.urlToImage,
      sourceName: article.source?.name || 'Unknown',
      sourceLogoUrl: geminiResult.sourceLogoUrl || "",
      publishedAt: article.publishedAt,
      summary: geminiResult.summary,
      factualRating: geminiResult.factualRating,
      biasRating: geminiResult.biasRating,
      tradingInsights: geminiResult.tradingInsights || [],
      // Include the original content for reference
      originalContent: article.content || article.description
    };
  } catch (error) {
    console.error('Error processing article with Gemini:', error);
    
    // Return a partial result in case of error
    return {
      title: article.title,
      oneLineTitle: article.title,
      url: article.url,
      imageUrl: article.urlToImage,
      sourceName: article.source?.name || 'Unknown',
      sourceLogoUrl: "",
      publishedAt: article.publishedAt,
      summary: "Error processing this article with AI.",
      factualRating: null,
      biasRating: null,
      tradingInsights: [],
      originalContent: article.content || article.description,
      error: error.message
    };
  }
} 