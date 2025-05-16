"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import NewsCard from "../marketplace/news-card";
import Image from "next/image";
import { signVerificationOnRootstock, getMetaMaskProvider, isWalletConnected, connectWallet } from "@/lib/wallet-utils";

interface NewsItem {
  id: string;
  title: string;
  source: string;
  date: string;
  summary: string;
  imageUrl: string;
  content: string;
  aiSummary: string;
  tradingInsights: string;
  sentiment: "positive" | "negative" | "neutral";
  confidence: number;
  verified: boolean;
  tradeRecommendations?: { direction: 'buy' | 'sell'; symbol: string; rationale?: string; targetPrice?: string }[];
  ipfsHash?: string;
  socialSources?: string[];
  sourceLinks?: { url: string; source: string; date?: string }[];
}

// IPFS CIDs for news content (groups 1-8)
const newsCIDs = [
  "Qmc2oEhdPHevGJ4tSsrasohYabMPpxMLLJj5xt19GYh9rP", 
  "QmTjTvjm3LCg8uSDHb5LUxysi1CcpoEVhDbhLo1vH5avyH", 
  "QmW47pENknnq1Lo9XzZw3dLHzD2GbNvHSkz96ecvVVSXSU", // Group 3
  // "QmRD26ryLf3KYKzGBhKoM2Mnbuw18UGYudtrSEhXAP128L", // Group 4
  // "QmWXqEJqT9vGmPYdrrPqHQx7zx3676HB9HkJxoANV1Q82K", // Group 5
  "QmdJrCRCKoLDbBMSpr6CbM3q12Dm8KSUhGU18niLKKTghQ", // Group 6
  "QmSxdsFiW5t3MeQMoZLqjTyKjRxEnZGQtEFSgYrcjr9Jrf", // Group 7
  "QmYbWsko1qGmDHehs6DpHRvnBT4rrmw9NPcs2DH84wsZ2W"  // Group 8
];

// Logo path constants
const LOGO_PATHS = {
  REUTERS: "/source-logos/reuters.svg",
  GUARDIAN: "/source-logos/guardian.svg",
  BLOOMBERG: "/source-logos/bloomberg.svg",
  COINDESK: "/source-logos/coindesk.svg",
  TECHCRUNCH: "/source-logos/techcrunch.svg",
  X: "/source-logos/x.svg",
  TRUTH: "/source-logos/truth-social.svg",
  YOUTUBE: "/source-logos/youtube.svg",
  YAHOO_FINANCE: "/source-logos/yahoo-finance.svg",
  YAHOO: "/source-logos/yahoo.svg",
  USNEWS: "/source-logos/usnews.svg",
  ABC_NEWS: "/source-logos/abc-news.svg",
  DEFAULT: "/source-logos/news.svg"
};

// Add helper function to determine source logos
const getSourceLogo = (source: string) => {
  // Normalize the source name for comparison
  const normalizedSource = source.toLowerCase().trim();
  
  if (normalizedSource.includes('reuters')) return LOGO_PATHS.REUTERS;
  if (normalizedSource.includes('guardian')) return LOGO_PATHS.GUARDIAN;
  if (normalizedSource.includes('bloomberg')) return LOGO_PATHS.BLOOMBERG;
  if (normalizedSource.includes('coindesk')) return LOGO_PATHS.COINDESK;
  if (normalizedSource.includes('techcrunch')) return LOGO_PATHS.TECHCRUNCH;
  if (normalizedSource.includes('x') || normalizedSource.includes('twitter')) return LOGO_PATHS.X;
  if (normalizedSource.includes('truth')) return LOGO_PATHS.TRUTH;
  if (normalizedSource.includes('youtube')) return LOGO_PATHS.YOUTUBE;
  if (normalizedSource.includes('yahoo finance')) return LOGO_PATHS.YAHOO_FINANCE;
  if (normalizedSource.includes('yahoo')) return LOGO_PATHS.YAHOO;
  if (normalizedSource.includes('u.s. news') || normalizedSource.includes('usnews')) return LOGO_PATHS.USNEWS;
  if (normalizedSource.includes('abc news') || normalizedSource.includes('abcnews')) return LOGO_PATHS.ABC_NEWS;
  
  // Default logo for unknown sources
  return LOGO_PATHS.DEFAULT;
};

export default function NewsFeed() {
  const [selectedNewsItem, setSelectedNewsItem] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
    txHash?: string;
    gasFee?: string;
    totalCost?: string;
  }>({
    show: false,
    type: 'success',
    message: ''
  });

  // Fetch data from IPFS
  useEffect(() => {
    const fetchNewsFromIPFS = async () => {
      setIsLoading(true);
      try {
        const newsPromises = newsCIDs.map(async (cid, index) => {
          try {
            const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
            if (!response.ok) {
              throw new Error(`Failed to fetch from IPFS: ${response.statusText}`);
            }
            const data = await response.json();
            
            // Map the IPFS response to our NewsItem structure
            const buyRecs = data.trading_recommendations?.buy || [];
            const sellRecs = data.trading_recommendations?.sell || [];
            
            const tradeRecommendations = [
              ...buyRecs.map((rec: any) => ({
                direction: 'buy' as const,
                symbol: rec.symbol,
                rationale: rec.reason,
                targetPrice: ''
              })),
              ...sellRecs.map((rec: any) => ({
                direction: 'sell' as const,
                symbol: rec.symbol,
                rationale: rec.reason,
                targetPrice: ''
              }))
            ];
            
            // Determine the source
            const source = data.sources?.[0] || 'Unknown';
            
            // Get source links if available
            const sourceLinks = data.source_links || [];
            
            return {
              id: (index + 1).toString(),
              title: data.title,
              source: source,
              date: "Today",
              summary: data.summary,
              imageUrl: data.image_url || `https://images.unsplash.com/photo-${1540000000 + index * 10000}?auto=format&fit=crop`,
              content: data.summary + "\n\n" + (data.sentiment_explanation || ""),
              aiSummary: data.summary,
              tradingInsights: data.sentiment_explanation || "This news item may impact trading decisions.",
              sentiment: data.sentiment as "positive" | "negative" | "neutral",
              confidence: Math.floor(70 + Math.random() * 30), // Random confidence between 70-100%
              verified: true,
              tradeRecommendations,
              ipfsHash: cid,
              socialSources: data.sources || [],
              sourceLinks: sourceLinks
            };
          } catch (err) {
            console.error(`Error fetching CID ${cid}:`, err);
            // Return a fallback news item if fetching fails
            return {
              id: (index + 1).toString(),
              title: `News from IPFS (CID: ${cid.substring(0, 8)}...)`,
              source: "IPFS",
              date: "Today",
              summary: "This content could not be loaded from IPFS.",
              imageUrl: `https://images.unsplash.com/photo-${1540000000 + index * 10000}?auto=format&fit=crop`,
              content: "Content unavailable. Please try again later.",
              aiSummary: "Content unavailable.",
              tradingInsights: "No trading insights available.",
              sentiment: "neutral" as "positive" | "negative" | "neutral",
              confidence: 0,
              verified: false,
              ipfsHash: cid,
              sourceLinks: []
            };
          }
        });
        
        const fetchedNews = await Promise.all(newsPromises);
        setNewsItems(fetchedNews);
        setSelectedNewsItem("1"); // Select the first news item by default
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNewsFromIPFS();
  }, []);

  // Function to handle search
  const filteredNewsItems = searchQuery.trim() === "" 
    ? newsItems 
    : newsItems.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.source.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // Function to handle selecting a news item
  const handleSelectNews = (news: NewsItem) => {
    setSelectedNewsItem(news.id);
  };

  // Function to handle flagging news
  const handleFlagNews = async (id: string) => {
    console.log("Flagging news with ID:", id);
    
    const newsToFlag = newsItems.find(item => item.id === id);
    if (!newsToFlag) {
      console.error("Could not find news item with ID:", id);
      return;
    }
    
    try {
      // Use the simple approach - first check if wallet is connected
      const connected = await isWalletConnected();
      if (!connected) {
        const account = await connectWallet();
        if (!account) {
          setNotification({
            show: true,
            type: 'error',
            message: 'Please connect your MetaMask wallet to flag content.'
          });
          setTimeout(() => setNotification(prev => ({...prev, show: false})), 5000);
          return;
        }
      }
      
      // Directly sign the message on Rootstock - this will trigger MetaMask
      const signResult = await signVerificationOnRootstock(
        parseInt(newsToFlag.id), 
        'flag',
        {
          title: newsToFlag.title,
          source: newsToFlag.source,
          date: newsToFlag.date,
          summary: newsToFlag.summary,
          ipfsHash: newsToFlag.ipfsHash
        }
      );
      
      if (signResult.success) {
        // Show success notification
        setNotification({
          show: true,
          type: 'success',
          message: `Thank you for flagging "${newsToFlag.title}" as potentially fake news. Your flag has been recorded on the Rootstock testnet.`,
          txHash: signResult.hash,
          gasFee: signResult.gasFee,
          totalCost: signResult.totalCost
        });
        setTimeout(() => setNotification(prev => ({...prev, show: false})), 8000);
      } else {
        // Show error notification
        setNotification({
          show: true,
          type: 'error',
          message: 'There was an error flagging this content. Please try again.'
        });
        setTimeout(() => setNotification(prev => ({...prev, show: false})), 5000);
      }
    } catch (error) {
      console.error("Error flagging news:", error);
      setNotification({
        show: true,
        type: 'error',
        message: 'An unexpected error occurred. Please try again later.'
      });
      setTimeout(() => setNotification(prev => ({...prev, show: false})), 5000);
    }
  };

  // Framer Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-50 text-green-700 border-green-200";
      case "negative":
        return "bg-red-50 text-red-700 border-red-200";
      case "neutral":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return (
          <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="9" cy="9" r="1" fill="currentColor" />
            <circle cx="15" cy="9" r="1" fill="currentColor" />
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      case "negative":
        return (
          <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 16C16 16 14.5 14 12 14C9.5 14 8 16 8 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="9" cy="9" r="1" fill="currentColor" />
            <circle cx="15" cy="9" r="1" fill="currentColor" />
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="9" cy="9" r="1" fill="currentColor" />
            <circle cx="15" cy="9" r="1" fill="currentColor" />
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          </svg>
        );
    }
  };

  const selectedNews = newsItems.find((item) => item.id === selectedNewsItem);

  return (
    <>
      {/* Global styles for animations */}
      <style jsx global>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.2); }
          70% { box-shadow: 0 0 0 15px rgba(79, 70, 229, 0); }
          100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
        }
        
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        .animate-pulse-subtle {
          animation: pulse 2s infinite;
        }
        
        .card-hover-effect {
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        .card-hover-effect:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .button-hover-effect {
          transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .button-hover-effect:hover {
          transform: translateY(-1px);
        }
        
        .button-hover-effect:active {
          transform: translateY(1px);
        }
        
        .shimmer-bg {
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%);
          background-size: 1000px 100%;
          animation: shimmer 2s infinite linear;
        }
        
        .morphing-bg {
          background-size: 300% 300%;
          animation: gradient 15s ease infinite;
        }
        
        @keyframes gradient {
          0% { background-position: 0% 0%; }
          50% { background-position: 100% 100%; }
          100% { background-position: 0% 0%; }
        }
      `}</style>

      {/* Enhanced selectors to properly hide gradient backgrounds and ensure white background */}
      <style jsx global>{`
        body {
          background: white !important;
        }
        
        /* Override any gradient backgrounds from parent components */
        main {
          background: white !important;
          padding: 0 !important;
        }
        
        /* More specific selectors to target and hide the gradient footer and background elements */
        footer, 
        .footer-container, 
        main > div:last-child:not(.news-feed-container),
        main + div,
        div[class*="footer"],
        div[style*="gradient"],
        main > div > div:last-child:not(.news-feed-container) {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
        }
      `}</style>
      
      <div className="w-full flex flex-col news-feed-container">
        {/* Add top padding to account for the header */}
        <div className="pt-5"></div>
        
        {/* News feed layout - Full-width container with proper spacing */}
        <div className="flex flex-col md:flex-row w-full h-[calc(100vh-6rem)]">
          {/* News items sidebar - Redesigned with improved item separation */}
          <div className="w-full md:w-[350px] bg-white h-full flex flex-col shadow-sm">
            <div className="px-4 py-4 bg-white/95 backdrop-blur-sm border-b border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs uppercase tracking-wider text-slate-500 font-medium">LATEST NEWS</h2>
                <div className="flex items-center space-x-1">
                  <div className="bg-slate-100 rounded-full h-5 w-5 flex items-center justify-center">
                    <svg className="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                  </div>
                  <div className="bg-slate-100 rounded-full h-5 w-5 flex items-center justify-center">
                    <svg className="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search news..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-slate-200"
                />
                {searchQuery ? (
                  <button 
                    onClick={() => setSearchQuery("")} 
                    className="absolute right-3 top-2.5"
                  >
                    <svg className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                ) : (
                  <div className="absolute right-3 top-2.5">
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto px-3 py-3 divide-y divide-slate-100/80">
              {isLoading ? (
                <div className="p-6 flex flex-col items-center justify-center h-full">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
                  </div>
                  <p className="mt-6 text-slate-600 text-sm font-medium">Loading latest verified news...</p>
                  <div className="mt-4 w-48 h-2 bg-slate-100 rounded overflow-hidden">
                    <div className="h-full w-full shimmer-bg"></div>
                  </div>
                </div>
              ) : filteredNewsItems.length === 0 ? (
                <div className="p-6 flex flex-col items-center justify-center h-full animate-fadeIn">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                    <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <p className="text-slate-600 text-sm font-medium">No results found</p>
                  <p className="text-slate-500 text-xs mt-1">Try different search terms</p>
                </div>
              ) : (
                filteredNewsItems.map((item, index) => (
                  <div className="py-2" key={item.id}>
                    <button
                      onClick={() => setSelectedNewsItem(item.id)}
                      className={`w-full text-left p-3 hover:bg-slate-50 transition-all duration-300 rounded-xl card-hover-effect ${
                        selectedNewsItem === item.id 
                          ? "bg-slate-50 ring-1 ring-slate-200/70 shadow-sm" 
                          : "bg-white hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1.5">
                        {/* Source with logo */}
                        <div className="flex items-center">
                          <div className="h-4 w-4 mr-1.5 relative">
                            <Image 
                              src={getSourceLogo(item.source)} 
                              alt={item.source}
                              width={16}
                              height={16}
                              className="h-full w-full object-contain"
                            />
                          </div>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              item.source === "Reuters"
                                ? "bg-blue-50 text-blue-700"
                                : item.source === "Bloomberg"
                                ? "bg-purple-50 text-purple-700"
                                : item.source === "The Guardian"
                                ? "bg-amber-50 text-amber-700"
                                : item.source === "CoinDesk"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-orange-50 text-orange-700"
                            }`}
                          >
                            {item.source}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">{item.date}</span>
                      </div>
                      <h3 className="font-medium text-slate-900 line-clamp-2 leading-snug text-sm">{item.title}</h3>
                      
                      {/* Display trade recommendations if available */}
                      {item.tradeRecommendations && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {item.tradeRecommendations.map((rec, idx) => (
                            <span key={idx} className={`text-xs px-1.5 py-0.5 rounded ${
                              rec.direction === 'buy' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                            }`}>
                              {rec.direction === 'buy' ? '↑' : '↓'} {rec.symbol}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {/* IPFS verification link */}
                      <div className="mt-2 flex items-center">
                        <svg className="h-3 w-3 mr-1 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <a 
                          href={`https://ipfs.io/ipfs/${item.ipfsHash || 'QmXZ4YEWQfKRKvDYYBNqFtfFhUazdJPEzuzh6BDFnj4xJr'}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-slate-500 hover:text-slate-700 hover:underline"
                        >
                          Verified on IPFS
                        </a>
                      </div>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* News content */}
          <div className="hidden md:flex flex-1 h-full bg-slate-50/80 backdrop-blur-sm overflow-y-auto border-l border-slate-100">
            {selectedNewsItem ? (
              <div className="w-full max-w-3xl mx-auto px-8 py-12">
                {selectedNews && (
                  <div className="bg-white rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.05)] p-8 ring-1 ring-slate-200/50">
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center space-x-3">
                          {/* Source with logo */}
                          <div className="flex items-center space-x-2">
                            <div className="h-5 w-5 relative">
                              <Image 
                                src={getSourceLogo(selectedNews.source)} 
                                alt={selectedNews.source}
                                width={20}
                                height={20}
                                className="h-full w-full object-contain"
                              />
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100/70 text-blue-800">
                              {selectedNews.source}
                            </span>
                          </div>
                          <span className="text-sm text-slate-500">{selectedNews.date}</span>
                        </div>
                        
                        {/* Verification badge */}
                        <div className="flex items-center">
                          <div 
                            className={`flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              selectedNews.verified 
                                ? "bg-green-100/70 text-green-800 border border-green-200/70" 
                                : "bg-red-100/70 text-red-800 border border-red-200/70"
                            }`}
                          >
                            <svg 
                              className={`w-3.5 h-3.5 mr-1 ${selectedNews.verified ? "text-green-500" : "text-red-500"}`} 
                              viewBox="0 0 20 20" 
                              fill="currentColor"
                            >
                              {selectedNews.verified ? (
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              ) : (
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              )}
                            </svg>
                            {selectedNews.verified ? "Verified" : "Not Verified"}
                          </div>
                        </div>
                      </div>
                      
                      <h1 className="text-3xl font-semibold text-slate-900 leading-tight mb-5">{selectedNews.title}</h1>
                      
                      {/* Social Media Sources */}
                      {selectedNews.socialSources && (
                        <div className="flex items-center mb-6 mt-4">
                          <span className="text-xs text-slate-500 mr-2">Also reported on:</span>
                          <div className="flex space-x-2">
                            {selectedNews.socialSources.map((platform, idx) => (
                              <div key={idx} className="h-6 w-6 relative">
                                <Image 
                                  src={getSourceLogo(platform)} 
                                  alt={platform}
                                  width={24}
                                  height={24}
                                  className="h-full w-full object-contain"
                                  title={platform}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-7 mb-9">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <span className="text-sm font-medium text-slate-600">Factual Rating:</span>
                            <div className="relative inline-flex">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((rating) => (
                                  <svg
                                    key={rating}
                                    className={`w-4 h-4 ${
                                      rating <= 4 ? "text-yellow-400" : "text-slate-200"
                                    }`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="h-4 w-px bg-slate-200"></div>
                          <div className="flex items-center space-x-1">
                            <span className="text-sm font-medium text-slate-600">Bias Rating:</span>
                            <span className="text-sm font-medium text-slate-900">Center-Right</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-slate-500">5 min read</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Display article image */}
                    {selectedNews.imageUrl && (
                      <div className="mb-9 -mx-8">
                        <Image
                          src={selectedNews.imageUrl}
                          alt={selectedNews.title}
                          className="w-full h-[320px] object-cover rounded-lg shadow-sm"
                          width={1280}
                          height={720}
                        />
                      </div>
                    )}
                    
                    {/* Article Content */}
                    <div className="prose prose-slate max-w-none">
                      {selectedNews.content.split('\n\n').map((paragraph, idx) => (
                        <p key={idx} className="mb-5 text-slate-700 leading-relaxed text-base">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                    
                    {/* Trading Recommendations Section */}
                    {selectedNews.tradeRecommendations && selectedNews.tradeRecommendations.length > 0 && (
                      <div className="mt-8 border-t border-gray-100 pt-8">
                        <h4 className="text-lg font-semibold mb-4 text-gray-900">Trading Insights</h4>
                        <p className="mb-5 text-gray-700">{selectedNews.tradingInsights}</p>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h5 className="text-sm font-semibold mb-3 text-gray-900">Recommendations</h5>
                          <div className="space-y-3">
                            {selectedNews.tradeRecommendations.map((rec, idx) => (
                              <div key={idx} className="flex items-center space-x-3">
                                <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full ${
                                  rec.direction === 'buy' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                }`}>
                                  {rec.direction === 'buy' ? (
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M16 10L12 6L8 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                      <path d="M12 6V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  ) : (
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M8 14L12 18L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                      <path d="M12 18V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center">
                                    <span className="font-medium text-gray-900">{rec.symbol}</span>
                                    <span className="ml-2 text-xs text-gray-500">{rec.targetPrice}</span>
                                  </div>
                                  <p className="text-xs text-gray-600">{rec.rationale}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Original Sources with Links */}
                    {selectedNews?.sourceLinks && selectedNews.sourceLinks.length > 0 && (
                      <div className="mt-8 border-t border-gray-100 pt-6">
                        <h4 className="text-lg font-semibold mb-4 text-gray-900">Original Sources</h4>
                        <div className="space-y-3">
                          {selectedNews.sourceLinks.map((sourceLink: any, idx: number) => (
                            <a 
                              key={idx}
                              href={sourceLink.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-300 button-hover-effect"
                            >
                              <div className="h-8 w-8 relative mr-3">
                                <Image 
                                  src={getSourceLogo(sourceLink.source)}
                                  alt={sourceLink.source}
                                  width={32}
                                  height={32}
                                  className="h-full w-full object-contain"
                                />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{sourceLink.source}</p>
                                <p className="text-xs text-gray-500">Published: {sourceLink.date || "N/A"}</p>
                              </div>
                              <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10 6H6C4.89543 6 4 6.89543 4 8V18C4 19.1046 4.89543 20 6 20H16C17.1046 20 18 19.1046 18 18V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M14 4H20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M20 4L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* IPFS Verification */}
                    {selectedNews.ipfsHash && (
                      <div className="mt-8 border-t border-gray-100 pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-indigo-500 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M15 9L9 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M9 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span className="text-sm font-medium text-gray-700">Verified on IPFS</span>
                          </div>
                          <a 
                            href={`https://ipfs.io/ipfs/${selectedNews.ipfsHash}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center button-hover-effect"
                          >
                            View on IPFS
                            <svg className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M10 6H6C4.89543 6 4 6.89543 4 8V18C4 19.1046 4.89543 20 6 20H16C17.1046 20 18 19.1046 18 18V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M14 4H20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M20 4L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </a>
                        </div>
                        
                        {/* Flag as Fake News Button */}
                        <div className="mt-6">
                          <button
                            onClick={(e) => {
                              e.preventDefault(); 
                              e.stopPropagation();
                              console.log("Flag button clicked for news ID:", selectedNews.id);
                              handleFlagNews(selectedNews.id);
                            }}
                            className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-medium flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-300 button-hover-effect"
                            type="button"
                          >
                            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0378 2.66667 10.2679 4L3.33978 16C2.56998 17.3333 3.53223 19 5.07183 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Flag as Fake News
                          </button>
                          <p className="text-xs text-gray-500 mt-2 text-center">
                            Flag this news if you believe it's fake. You'll earn TRUE tokens if your prediction is correct.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 6H16M8 10H16M8 14H11M6 22H18C19.1046 22 20 21.1046 20 20V4C20 2.89543 19.1046 2 18 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <h3 className="text-xl font-medium text-gray-400">Select a news item to view details</h3>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Custom footer with proper white background and explicit positioning */}
        <div className="w-full py-3 border-t border-slate-100 bg-white relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-sm text-slate-500">TrueLens - Verified News for Better Trading</p>
            <p className="text-xs text-slate-400 mt-1">© {new Date().getFullYear()} TrueLens. All rights reserved.</p>
          </div>
        </div>
        
        {/* Transaction Notification */}
        {notification.show && (
          <div 
            className={`fixed bottom-6 right-6 max-w-md w-full shadow-lg rounded-lg overflow-hidden z-50 transform transition-all duration-300 ease-in-out ${
              notification.show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            <div className={`p-4 ${notification.type === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-start">
                <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                  notification.type === 'success' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {notification.type === 'success' ? (
                    <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <h3 className={`text-sm font-medium ${notification.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                    {notification.type === 'success' ? 'Transaction Successful' : 'Transaction Failed'}
                  </h3>
                  <p className="mt-1 text-sm text-gray-700">{notification.message}</p>
                  
                  {notification.type === 'success' && notification.txHash && (
                    <div className="mt-3 bg-white rounded p-3 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500">Transaction Hash</span>
                        <a 
                          href={`https://explorer.testnet.rsk.co/tx/${notification.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer" 
                          className="text-xs text-indigo-600 hover:text-indigo-800"
                        >
                          View on Explorer
                        </a>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs font-mono text-gray-800 truncate">{notification.txHash}</span>
                        <button
                          onClick={() => navigator.clipboard.writeText(notification.txHash || '')}
                          className="ml-2 text-gray-500 hover:text-gray-700"
                        >
                          <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                        <div>
                          <span className="text-gray-500">Network</span>
                          <p className="font-medium text-gray-800">Rootstock Testnet</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Status</span>
                          <p className="font-medium text-green-600">Confirmed</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Gas Fee</span>
                          <p className="font-medium text-gray-800">{notification.gasFee}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Total Cost</span>
                          <p className="font-medium text-gray-800">{notification.totalCost}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center">
                          <svg className="h-4 w-4 text-yellow-500 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-xs text-gray-600">
                            You've staked 10 TRUE tokens. If your flag is correct, you'll be rewarded with up to 50 TRUE tokens.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    className="bg-transparent rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={() => setNotification(prev => ({...prev, show: false}))}
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
} 