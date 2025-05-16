import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// IPFS CIDs for news content
const NEWS_CIDS = [
  "Qmc2oEhdPHevGJ4tSsrasohYabMPpxMLLJj5xt19GYh9rP", 
  "QmTjTvjm3LCg8uSDHb5LUxysi1CcpoEVhDbhLo1vH5avyH", 
  "QmW47pENknnq1Lo9XzZw3dLHzD2GbNvHSkz96ecvVVSXSU",
  "QmdJrCRCKoLDbBMSpr6CbM3q12Dm8KSUhGU18niLKKTghQ",
  "QmSxdsFiW5t3MeQMoZLqjTyKjRxEnZGQtEFSgYrcjr9Jrf",
  "QmYbWsko1qGmDHehs6DpHRvnBT4rrmw9NPcs2DH84wsZ2W",
  "QmeebrosvzYuFgHZdoTNhw3LFrR39Rt5ZS6LwFyEkazMJP",
  "QmXbapoF68HFQp4zFz8gEfD43qWR4vZLdobHDaH6ak9jSF"
];

// Mock sources
const SOURCES = [
  "Reuters",
  "Bloomberg",
  "The Guardian",
  "CoinDesk",
  "Wall Street Journal",
  "TechCrunch",
  "CNBC",
  "Financial Times"
];

// Mock sentiment types
const SENTIMENTS = ["positive", "negative", "neutral"];

// Mock news API endpoint
export async function GET(request: NextRequest) {
  try {
    // Parse parameters
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10');
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
    const category = request.nextUrl.searchParams.get('category');
    const source = request.nextUrl.searchParams.get('source');
    
    // Generate mock news items
    const mockNews = Array.from({ length: Math.min(limit, 20) }, (_, i) => {
      const index = (page - 1) * limit + i;
      const id = (index + 1).toString();
      const ipfsIndex = index % NEWS_CIDS.length;
      const sourceIndex = index % SOURCES.length;
      const sentimentIndex = index % SENTIMENTS.length;
      
      // Randomly generate title and summary
      const titles = [
        "Fed Announces New Interest Rate Policy",
        "Tech Giants Face Regulatory Scrutiny",
        "Market Volatility Increases Amid Global Tensions",
        "New Cryptocurrency Regulations Proposed",
        "Inflation Data Raises Concerns for Investors",
        "Stock Market Rally Continues Despite Economic Warnings",
        "Central Banks Coordinate Policy Response",
        "Energy Prices Impact Economic Outlook",
        "Global Supply Chain Issues Continue",
        "New AI Regulation Framework Announced"
      ];
      
      const title = titles[index % titles.length];
      
      return {
        id,
        title,
        source: SOURCES[sourceIndex],
        date: new Date(Date.now() - Math.floor(Math.random() * 86400000 * 3)).toISOString(),
        summary: `This is a summary of the news article about ${title.toLowerCase()}. It contains important information that traders and investors should be aware of.`,
        imageUrl: `https://source.unsplash.com/random/800x500?${encodeURIComponent(title.split(' ')[0])}`,
        content: `This is the full content of the news article about ${title.toLowerCase()}. It contains detailed information and analysis.\n\nParagraph 2: More details about the topic.\n\nParagraph 3: Analysis of the impact on markets.`,
        aiSummary: `AI summary of the article: The ${title.toLowerCase()} will likely impact markets in the following ways...`,
        tradingInsights: `Based on historical data, news about ${title.split(' ')[0].toLowerCase()} typically impacts related stocks by 2-5% in the short term.`,
        sentiment: SENTIMENTS[sentimentIndex],
        confidence: Math.floor(Math.random() * 30) + 70, // 70-100%
        verified: Math.random() > 0.3, // 70% chance of being verified
        ipfsHash: NEWS_CIDS[ipfsIndex],
        verificationStats: {
          verified: Math.floor(Math.random() * 100) + 20,
          flagged: Math.floor(Math.random() * 40) + 5,
          consensus: Math.floor(Math.random() * 30) + 60 // 60-90%
        },
        tradeRecommendations: [
          {
            direction: Math.random() > 0.5 ? 'buy' : 'sell',
            symbol: ['AAPL', 'TSLA', 'MSFT', 'AMZN', 'GOOGL'][Math.floor(Math.random() * 5)],
            rationale: `Based on this news, we expect ${Math.random() > 0.5 ? 'positive' : 'negative'} movement in the short term.`,
            targetPrice: `$${(Math.floor(Math.random() * 100) + 100).toFixed(2)}`
          }
        ]
      };
    });
    
    // Add a small delay to simulate network latency
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Return paginated response
    return NextResponse.json({
      data: mockNews,
      pagination: {
        page,
        limit,
        total: 100, // Mock total count
        totalPages: Math.ceil(100 / limit)
      }
    });
  } catch (error) {
    console.error('Error in news API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}

// For creating a new news item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, source } = body;
    
    // Validate required parameters
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // Mock IPFS upload delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate mock IPFS hash
    const ipfsHash = 'Qm' + Array(44).fill(0).map(() => 
      '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 62)]).join('');
    
    // Mock successful response
    return NextResponse.json({
      success: true,
      id: Math.floor(Math.random() * 1000).toString(),
      title,
      content,
      source: source || 'User Submitted',
      date: new Date().toISOString(),
      ipfsHash,
      ipfsUrl: `https://ipfs.io/ipfs/${ipfsHash}`
    });
  } catch (error) {
    console.error('Error in news submission API:', error);
    return NextResponse.json(
      { error: 'Failed to upload news to IPFS' },
      { status: 500 }
    );
  }
} 