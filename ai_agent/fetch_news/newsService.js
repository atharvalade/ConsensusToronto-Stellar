import { processNewsWithGemini } from './geminiService.js';
import axios from 'axios';

// Default topics to fetch news about
const TOPICS = [
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
 * Fetches latest news articles using a news API
 * We're using NewsAPI.org as an example, but you would need to register for an API key
 */
export async function fetchLatestNews() {
  try {
    // This is a placeholder for your actual news API key
    const NEWS_API_KEY = process.env.NEWS_API_KEY;
    
    if (!NEWS_API_KEY) {
      throw new Error('NEWS_API_KEY is not defined in environment variables');
    }

    // Fetch 10 latest headlines from different categories
    const response = await axios.get(`https://newsapi.org/v2/top-headlines`, {
      params: {
        apiKey: NEWS_API_KEY,
        language: 'en',
        pageSize: 10,
      }
    });

    if (response.data.status !== 'ok') {
      throw new Error(`News API returned status: ${response.data.status}`);
    }

    const rawArticles = response.data.articles;
    
    // Process each article with Gemini API
    const processedArticles = await Promise.all(
      rawArticles.map(async (article) => {
        return await processNewsWithGemini(article);
      })
    );

    return processedArticles;
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
}

/**
 * Alternative implementation using a fake dataset if you don't have an API key
 */
export async function fetchFakeNews() {
  // Sample articles for testing without an API
  const fakeArticles = [
    {
      title: 'Global Economic Summit Yields New Trade Agreement',
      url: 'https://example.com/economics/global-summit',
      urlToImage: 'https://example.com/images/economic-summit.jpg',
      description: 'World leaders agree on new framework for international trade.',
      content: 'Leaders from G20 nations concluded a week-long summit with a new framework agreement on international trade. The deal aims to reduce tariffs and simplify customs procedures across member states. This comes after months of increasing tensions and protectionist policies that threatened to disrupt global supply chains. Experts predict the new agreement could boost global GDP by 0.5% over the next five years, though implementation challenges remain.',
      source: { name: 'Economic Times' },
      publishedAt: new Date().toISOString(),
    },
    {
      title: 'New AI Breakthrough Allows Computers to Understand Context Better',
      url: 'https://example.com/technology/ai-context-breakthrough',
      urlToImage: 'https://example.com/images/ai-research.jpg',
      description: 'Researchers develop new algorithm that improves contextual understanding in AI systems.',
      content: 'A team of researchers from MIT and Google DeepMind have announced a major breakthrough in contextual understanding for artificial intelligence systems. The new algorithm, named "ContextNet," demonstrates a 40% improvement in understanding nuanced human instructions compared to previous models. "This represents a significant step forward in making AI systems that can truly understand the subtleties of human communication," said lead researcher Dr. Sarah Chen. The technology could dramatically improve everything from virtual assistants to automated customer service systems.',
      source: { name: 'Tech Innovator' },
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      title: 'Climate Change: Arctic Ice Reaches Record Low',
      url: 'https://example.com/environment/arctic-ice-record-low',
      urlToImage: 'https://example.com/images/arctic-ice.jpg',
      description: 'Scientists report unprecedented levels of ice melt in the Arctic region.',
      content: 'Climate scientists have reported that Arctic sea ice has reached its lowest extent since satellite monitoring began in 1979. The National Snow and Ice Data Center confirmed that ice coverage is now 40% below the 1981-2010 average for this time of year. "What we\'re seeing is deeply concerning and consistent with climate model predictions for a warming world," explained Dr. Robert Thomson, glaciologist at the Polar Research Institute. The reduced ice coverage is expected to accelerate warming in the region through the albedo effect, where darker ocean water absorbs more heat than reflective ice.',
      source: { name: 'Environmental Monitor' },
      publishedAt: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      title: 'Tensions Rise in Eastern Europe as Peace Talks Stall',
      url: 'https://example.com/politics/eastern-europe-tensions',
      urlToImage: 'https://example.com/images/peace-talks.jpg',
      description: 'Diplomatic efforts fail to resolve growing conflict in Eastern European region.',
      content: 'Peace negotiations between opposing factions in Eastern Europe have broken down after three days of intense talks. UN mediator Javier Santos expressed disappointment but indicated that diplomatic channels remain open. "While we haven\'t reached an agreement today, all parties have expressed commitment to avoiding military escalation," Santos told reporters. Meanwhile, neighboring countries have increased border security, and several nations have issued travel advisories for the region. Analysts fear that continued failure of diplomatic efforts could lead to wider regional instability.',
      source: { name: 'Global Affairs Journal' },
      publishedAt: new Date(Date.now() - 259200000).toISOString(),
    },
    {
      title: 'Breakthrough Cancer Treatment Shows Promise in Clinical Trials',
      url: 'https://example.com/health/cancer-treatment-breakthrough',
      urlToImage: 'https://example.com/images/medical-research.jpg',
      description: 'New immunotherapy approach demonstrates 70% response rate in advanced cancer patients.',
      content: 'A revolutionary cancer treatment approach combining targeted immunotherapy with modified RNA technology has shown remarkable results in early clinical trials. In a study of 50 patients with advanced-stage cancers that had not responded to conventional treatments, 35 showed significant tumor reduction within three months. "These results exceed our most optimistic projections," said Dr. James Wilson, lead researcher at Memorial Cancer Institute. The treatment works by reprogramming the patient\'s immune cells to more effectively target cancer-specific proteins while minimizing damage to healthy tissue. Phase 3 trials are scheduled to begin next year.',
      source: { name: 'Medical Research Today' },
      publishedAt: new Date(Date.now() - 345600000).toISOString(),
    },
    {
      title: 'Major Cryptocurrency Exchange Announces New Regulatory Compliance Measures',
      url: 'https://example.com/business/crypto-exchange-compliance',
      urlToImage: 'https://example.com/images/cryptocurrency.jpg',
      description: 'Leading exchange implements enhanced verification processes amid regulatory scrutiny.',
      content: 'CryptoTrade, one of the world\'s largest cryptocurrency exchanges, has announced a comprehensive set of new compliance measures in response to increasing regulatory pressure. The platform will now require enhanced identity verification for all users and implement more robust transaction monitoring systems. "We believe these steps will set the industry standard for responsible operation while protecting our users," said CEO Marina Kowalski. The move comes as several countries have introduced or proposed stricter regulations for cryptocurrency markets. Industry analysts suggest this could trigger similar actions from other major exchanges seeking to avoid regulatory penalties.',
      source: { name: 'Financial Technology Report' },
      publishedAt: new Date(Date.now() - 432000000).toISOString(),
    },
    {
      title: 'Olympic Committee Announces New Sustainability Requirements for Host Cities',
      url: 'https://example.com/sports/olympic-sustainability',
      urlToImage: 'https://example.com/images/olympic-stadium.jpg',
      description: 'Future Olympic Games will require comprehensive environmental impact plans.',
      content: 'The International Olympic Committee has unveiled stringent new sustainability requirements for cities bidding to host future Olympic Games. Starting with the 2032 Summer Olympics, host cities must demonstrate carbon-neutral plans, use of renewable energy sources, and sustainable transportation systems. "The Olympic movement must lead by example in addressing climate change," stated IOC President Thomas Bach. The decision has been welcomed by environmental organizations but has raised concerns about whether smaller nations can afford the additional infrastructure investments required. Current bidders have been given six months to update their proposals to meet the new criteria.',
      source: { name: 'Sports Global' },
      publishedAt: new Date(Date.now() - 518400000).toISOString(),
    },
    {
      title: 'New Education Policy Emphasizes Critical Thinking Over Standardized Testing',
      url: 'https://example.com/education/critical-thinking-policy',
      urlToImage: 'https://example.com/images/education-policy.jpg',
      description: 'National education reforms shift focus to problem-solving and creativity.',
      content: 'The Department of Education has announced sweeping reforms that will reduce emphasis on standardized testing in favor of assessments that measure critical thinking, creativity, and problem-solving skills. The new framework, which will be implemented over the next three years, represents the most significant change to national education policy in two decades. "Our current system rewards memorization when we should be fostering innovation," explained Education Secretary Dr. Anita Park. Teacher unions have generally supported the changes, though some have expressed concerns about implementation challenges and resource requirements for schools in economically disadvantaged areas.',
      source: { name: 'Education Weekly' },
      publishedAt: new Date(Date.now() - 604800000).toISOString(),
    },
    {
      title: 'Ancient City Discovered beneath Mediterranean Sea',
      url: 'https://example.com/science/underwater-city-discovery',
      urlToImage: 'https://example.com/images/underwater-ruins.jpg',
      description: 'Archaeologists find extensive ruins dating back 3,000 years.',
      content: 'Marine archaeologists have discovered the ruins of an ancient city off the coast of Greece that experts believe could be over 3,000 years old. The underwater site spans approximately 5 square kilometers and contains well-preserved structures including what appears to be a temple complex and fortification walls. "This discovery may require us to reconsider aspects of Mediterranean history during the Bronze Age collapse," said expedition leader Professor Elena Mavros. Preliminary analysis of artifacts recovered from the site suggests the city was suddenly abandoned, possibly due to a tsunami or other natural disaster. The team plans to conduct more extensive mapping and excavation work over the next five years.',
      source: { name: 'Archaeological Review' },
      publishedAt: new Date(Date.now() - 691200000).toISOString(),
    },
    {
      title: 'Global Music Streaming Revenue Surpasses Traditional Media Sales',
      url: 'https://example.com/entertainment/streaming-revenue-milestone',
      urlToImage: 'https://example.com/images/music-streaming.jpg',
      description: 'Industry report shows streaming now accounts for 65% of global music revenue.',
      content: 'For the first time, global revenue from music streaming services has exceeded combined sales from physical media and digital downloads, according to the latest industry report. Streaming platforms now account for 65% of total music industry revenue, marking a definitive shift in how music is consumed worldwide. "The transition to streaming-first business models is now complete," stated music industry analyst Jennifer Reynolds. Major labels report that subscription growth remains strong in established markets while emerging regions show explosive adoption rates. Independent artists have seen particularly significant gains, with self-published music experiencing 43% year-over-year growth on major platforms.',
      source: { name: 'Entertainment Business' },
      publishedAt: new Date(Date.now() - 777600000).toISOString(),
    }
  ];
  
  // Process each article with Gemini API
  const processedArticles = await Promise.all(
    fakeArticles.map(async (article) => {
      return await processNewsWithGemini(article);
    })
  );

  return processedArticles;
} 