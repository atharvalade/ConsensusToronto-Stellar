# News Fetcher with Gemini AI and Trading Insights

This module uses Gemini 2.5 Pro to fetch and analyze the latest news from around the world across various topics, and provides stock trading insights related to each news article.

## Features

- Uses Gemini AI to search for and process latest news articles from various categories
- For each article, provides:
  - Full title and catchy one-line title
  - Source link
  - Associated image URL (when available)
  - Source logo URL (e.g., CNN logo, Yahoo Finance logo)
  - A concise 2-paragraph summary
  - Source name
  - Factual rating (1-5 scale)
  - Bias rating
  - Trading insights with stock tickers and actionable insights
- Returns structured JSON data for each article
- No external API keys required - uses Gemini's ability to search the web

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Run the application:
   ```
   npm start
   ```

## Sample Output

Each article in the output will have the following structure:

```json
{
  "title": "Federal Reserve Announces Interest Rate Decision After Latest Economic Data",
  "oneLineTitle": "Fed Holds Rates Steady Amid Inflation Concerns",
  "url": "https://example.com/article",
  "imageUrl": "https://example.com/image.jpg",
  "sourceName": "Yahoo Finance",
  "sourceLogoUrl": "https://s.yimg.com/rz/p/yahoo_finance_en-US_h_p_finance_2.png",
  "publishedAt": "2023-09-20T12:34:56Z",
  "summary": "Two paragraph summary of the article...",
  "factualRating": 4,
  "biasRating": "Center-Left",
  "tradingInsights": [
    {
      "ticker": "AAPL",
      "insight": "Apple may face increased costs due to supply chain disruptions mentioned in the article, potentially impacting short-term profitability."
    },
    {
      "ticker": "MSFT",
      "insight": "Microsoft could benefit from the increased cloud computing demand described in the report, potentially driving revenue growth."
    }
  ],
  "topic": "economics",
  "originalContent": "Original article content or summary"
}
```

## Tech Stack

- Node.js
- Google's Gemini 2.5 Pro AI model 