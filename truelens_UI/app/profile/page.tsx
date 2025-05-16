"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { verifyNewsOnStellar, stakeXLM, isWalletConnected, connectWallet } from "@/lib/wallet-utils";

// Mock data
const USER_DATA = {
  address: "GBBEEBLN6PQEMMFCRFCGIRRKQNJ74K3OJHG3UHNATMKY26VGVZ3RP5I6",
  username: "StarGazer", // Added Stellar-compatible username
  level: 4,
  pointsEarned: 1425,
  pointsToNextLevel: 575,
  totalVerified: 87,
  accuracy: 94.3,
  tokens: 275.6,
  recent: [
    {
      id: "1",
      title: "Trump Administration Announces New Tax Cuts for Businesses",
      source: "Reuters",
      date: "2 hours ago",
      verified: true,
      points: 35,
      accuracy: 97,
    },
    {
      id: "2",
      title: "Federal Reserve Signals Possible Interest Rate Hike",
      source: "The Guardian",
      date: "6 hours ago",
      verified: true,
      points: 28,
      accuracy: 92,
    },
    {
      id: "3",
      title: "Major Cryptocurrency Exchange Announces New Regulatory Compliance Measures",
      source: "CoinDesk",
      date: "1 day ago",
      verified: false,
      points: 0,
      accuracy: 68,
    }
  ]
};

// IPFS CIDs for verification items (groups 9-12)
const verificationCIDs = [
  "QmeebrosvzYuFgHZdoTNhw3LFrR39Rt5ZS6LwFyEkazMJP", // Group 9
  "QmXbapoF68HFQp4zFz8gEfD43qWR4vZLdobHDaH6ak9jSF", // Group 10
  "QmW3ZmtpE1ms8pZg4zRF8Qd85MjnPGg6jYUzsXnoDHyg3V", // Group 11
  "Qmd9YtZqzLYNNLXZmaWVK8BzqCk3wWenPTRSpozbzsYoKy"  // Group 12
];

const LEADERBOARD = [
  { address: "GCIFVZJ34WQNFEYM0DAXO2TWHV6ZIKSDDURSJIQXJHFI45ZSEL6YIKYY", username: "StellarPioneer", level: 12, verified: 342, tokens: 1240.5 },
  { address: "GDD5R622WLVQ4GCM4KYDJHYZFM3TCGIXJHKXNLV6BVLVKBEJEPKTQ44X", username: "LumenHodler", level: 10, verified: 287, tokens: 875.2 },
  { address: "GC3N4UTQFUTGS67HYAQZ375NF4MWYP6XILFZJ3KHVHSXCB5IGGZXJTVW", username: "TruthSeeker", level: 9, verified: 251, tokens: 810.7 },
  { address: "GBBEEBLN6PQEMMFCRFCGIRRKQNJ74K3OJHG3UHNATMKY26VGVZ3RP5I6", username: "StarGazer", level: 4, verified: 87, tokens: 275.6 }, // Current user
  { address: "GA6DQ5UCVNKDVBQPUAKMQD5SV3XVUJT3LETMXYZB6WEJXWL6CUMGHAP2", username: "LumenTrader", level: 3, verified: 62, tokens: 184.3 },
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

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Simulate loading state
  const [loading, setLoading] = useState(true);
  // Add state for verification dialog
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [showVerifySuccess, setShowVerifySuccess] = useState(false);
  const [pendingNewsItem, setPendingNewsItem] = useState<null | {id: number, title: string}>(null);
  const [verificationChoice, setVerificationChoice] = useState<'verify' | 'flag' | null>(null);
  // Add state for pending verification items from IPFS
  const [pendingVerifications, setPendingVerifications] = useState<any[]>([]);
  const [loadingVerifications, setLoadingVerifications] = useState(false);

  // Add state for the news detail dialog
  const [showNewsDetailDialog, setShowNewsDetailDialog] = useState(false);
  const [selectedVerificationItem, setSelectedVerificationItem] = useState<any>(null);
  
  // Add state for cross-chain interactions
  const [processingStake, setProcessingStake] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [verificationStep, setVerificationStep] = useState<'initial' | 'staking' | 'verifying' | 'complete'>('initial');
  const [walletConnected, setWalletConnected] = useState(false);
  
  // Check if wallet is connected
  useEffect(() => {
    const checkWallet = async () => {
      const connected = await isWalletConnected();
      setWalletConnected(connected);
    };
    
    checkWallet();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Fetch verification items from IPFS
  useEffect(() => {
    const fetchVerificationItems = async () => {
      if (activeTab === "verifications") {
        setLoadingVerifications(true);
        try {
          const verificationPromises = verificationCIDs.map(async (cid, index) => {
            try {
              const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
              if (!response.ok) {
                throw new Error(`Failed to fetch from IPFS: ${response.statusText}`);
              }
              const data = await response.json();
              
              // Determine source and verification progress
              const source = data.sources?.[0] || 'Unknown';
              const progress = Math.floor(Math.random() * 85); // Random progress for demo
              
              return {
                id: index,
                cid,
                title: data.title,
                source,
                summary: data.summary,
                sentiment_explanation: data.sentiment_explanation || '',
                date: "Today",
                verificationCount: Math.floor(Math.random() * 50) + 10,
                verificationProgress: progress,
                sentiment: data.sentiment,
                image_url: data.image_url,
                trading_recommendations: data.trading_recommendations || { buy: [], sell: [] },
                source_links: data.source_links || []
              };
            } catch (err) {
              console.error(`Error fetching verification CID ${cid}:`, err);
              return {
                id: index,
                cid,
                title: `Content from IPFS (${cid.substring(0, 8)}...)`,
                source: "IPFS",
                summary: "This content could not be loaded from IPFS.",
                sentiment_explanation: '',
                date: "Today",
                verificationCount: 0,
                verificationProgress: 0,
                sentiment: "neutral",
                image_url: null,
                trading_recommendations: { buy: [], sell: [] },
                source_links: []
              };
            }
          });
          
          const fetchedItems = await Promise.all(verificationPromises);
          setPendingVerifications(fetchedItems);
        } catch (error) {
          console.error("Error fetching verification items:", error);
        } finally {
          setLoadingVerifications(false);
        }
      }
    };
    
    fetchVerificationItems();
  }, [activeTab]);

  const handleVerifyClick = (item: {id: number, title: string}, choice: 'verify' | 'flag') => {
    setPendingNewsItem(item);
    setVerificationChoice(choice);
    
    console.log(`Attempting to ${choice} news item ${item.id} using Freighter`);
    
    // Directly try to use the Freighter wallet
    if (typeof window !== 'undefined' && (window as any).freighter) {
      try {
        // Create a simple dummy transaction XDR for demo
        const dummyXdr = "AAAAAgAAAADXWUYw0l5WiLZYWIgsB7cuJj8UaNRlf2PPXy3VMmDlGAAAAGQABrH/AAAAAwAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAQAAAADXWYw0l5WiLZYWIgsB7cuJj8UaNRlf2PPXy3VMmDlGAAAAAAAAAACYloAAAAAAAAAAAA==";
        
        // This will directly show the Freighter popup
        console.log("Signing transaction with Freighter...");
        (window as any).freighter.signTransaction(dummyXdr)
          .then((result: any) => {
            console.log(`${choice} transaction signed:`, result);
            
            // Show success message
            setShowVerifySuccess(true);
            setTimeout(() => setShowVerifySuccess(false), 3000);
          })
          .catch((err: any) => {
            console.error("Error signing with Freighter:", err);
            
            // Fall back to showing the verification dialog if Freighter fails
            setShowVerificationDialog(true);
          });
      } catch (error) {
        console.error("General error using Freighter:", error);
        // Fall back to showing the verification dialog
        setShowVerificationDialog(true);
      }
    } else {
      console.warn("Freighter extension not detected, showing verification dialog instead");
      // Fall back to showing the verification dialog if Freighter is not available
      setShowVerificationDialog(true);
    }
    
    setVerificationStep('initial');
    setTxHash(null);
  };

  const handleVerificationConfirm = async () => {
    if (!pendingNewsItem || !verificationChoice) return;
    
    setProcessingStake(true);
    setVerificationStep('staking');
    
    try {
      // First, ensure wallet is connected
      if (!walletConnected) {
        const account = await connectWallet();
        setWalletConnected(!!account);
        if (!account) {
          setProcessingStake(false);
          return;
        }
      }
      
      // If the Freighter extension is available, use it for the transaction
      if (typeof window !== 'undefined' && (window as any).freighter) {
        try {
          // Get the public key from Freighter
          const publicKey = await (window as any).freighter.getPublicKey();
          
          // Check network
          const network = await (window as any).freighter.getNetwork();
          console.log(`Using Freighter on network: ${network}`);
          
          // Construct a basic transaction for the operation (simplified for demo)
          const signedXDR = await (window as any).freighter.signTransaction(
            // This is a simplified XDR for demo purposes - in reality you'd have a proper XDR
            "AAAAAgAAAADXWUYw0l5WiLZYWIgsB7cuJj8UaNRlf2PPXy3VMmDlGAAAAGQABrH/AAAAAwAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAQAAAADXWYw0l5WiLZYWIgsB7cuJj8UaNRlf2PPXy3VMmDlGAAAAAAAAAACYloAAAAAAAAAAAA=="
          );
          
          console.log("Transaction signed with Freighter:", signedXDR);
          
          // In a real app, you would submit this XDR to the Stellar network
          // For demo purposes, we'll just simulate success
          setTimeout(() => {
            setProcessingStake(false);
            setShowVerificationDialog(false);
            setShowVerifySuccess(true);
            
            // Auto-hide success message after 3 seconds
            setTimeout(() => {
              setShowVerifySuccess(false);
            }, 3000);
          }, 1000);
        } catch (error) {
          console.error("Error with Freighter transaction:", error);
          setProcessingStake(false);
        }
      } else {
        // Fallback if Freighter is not available
        console.warn("Freighter extension not detected, using mock implementation");
        
        // Simulate transaction success after a short delay
        setTimeout(() => {
          setProcessingStake(false);
          setShowVerificationDialog(false);
          setShowVerifySuccess(true);
          
          // Auto-hide success message after 3 seconds
          setTimeout(() => {
            setShowVerifySuccess(false);
          }, 3000);
        }, 1000);
      }
    } catch (error) {
      console.error("Error during verification process:", error);
      setProcessingStake(false);
    }
  };

  // Function to handle opening news detail dialog
  const handleNewsDetailClick = (item: any) => {
    setSelectedVerificationItem(item);
    setShowNewsDetailDialog(true);
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

  // Helper function to determine source color
  const getSourceColor = (source: string) => {
    // Normalize source name for comparison
    const normalizedSource = source.toLowerCase().trim();
    
    if (normalizedSource.includes('reuters')) return "bg-blue-600 text-white";
    if (normalizedSource.includes('guardian')) return "bg-purple-600 text-white";
    if (normalizedSource.includes('bloomberg')) return "bg-green-600 text-white";
    if (normalizedSource.includes('yahoo')) return "bg-purple-600 text-white";
    if (normalizedSource.includes('u.s. news') || normalizedSource.includes('usnews')) return "bg-blue-600 text-white";
    
    // Default color for unknown sources
    return "bg-red-600 text-white";
  };

  // Update the verification buttons in the list
  {pendingVerifications.map((item) => (
    <div 
      key={item.id} 
      className="border border-gray-200 rounded-lg p-6 transition-all hover:shadow-md cursor-pointer"
      onClick={() => handleNewsDetailClick(item)}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* ... existing content ... */}
        
        <div className="flex flex-col gap-3">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              // Access Freighter directly
              if (typeof window !== 'undefined' && (window as any).freighter) {
                try {
                  // Create a simple dummy transaction XDR
                  const dummyXdr = "AAAAAgAAAADXWUYw0l5WiLZYWIgsB7cuJj8UaNRlf2PPXy3VMmDlGAAAAGQABrH/AAAAAwAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAQAAAADXWYw0l5WiLZYWIgsB7cuJj8UaNRlf2PPXy3VMmDlGAAAAAAAAAACYloAAAAAAAAAAAA==";
                  
                  // This will show Freighter popup
                  (window as any).freighter.signTransaction(dummyXdr)
                    .then((result: any) => {
                      console.log("Transaction signed:", result);
                      setShowVerifySuccess(true);
                      setTimeout(() => setShowVerifySuccess(false), 3000);
                    })
                    .catch((err: any) => {
                      console.error("Freighter error:", err);
                      alert("Failed to sign transaction. Make sure Freighter is set up correctly.");
                    });
                } catch (err) {
                  console.error("Error using Freighter:", err);
                }
              } else {
                alert("Freighter wallet not detected. Please install the extension.");
              }
            }}
            className="inline-flex items-center justify-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Verify (Stake 10 XLM)
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              // Access Freighter directly
              if (typeof window !== 'undefined' && (window as any).freighter) {
                try {
                  // Create a simple dummy transaction XDR
                  const dummyXdr = "AAAAAgAAAADXWUYw0l5WiLZYWIgsB7cuJj8UaNRlf2PPXy3VMmDlGAAAAGQABrH/AAAAAwAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAQAAAADXWYw0l5WiLZYWIgsB7cuJj8UaNRlf2PPXy3VMmDlGAAAAAAAAAACYloAAAAAAAAAAAA==";
                  
                  // This will show Freighter popup
                  (window as any).freighter.signTransaction(dummyXdr)
                    .then((result: any) => {
                      console.log("Transaction signed:", result);
                      setShowVerifySuccess(true);
                      setTimeout(() => setShowVerifySuccess(false), 3000);
                    })
                    .catch((err: any) => {
                      console.error("Freighter error:", err);
                      alert("Failed to sign transaction. Make sure Freighter is set up correctly.");
                    });
                } catch (err) {
                  console.error("Error using Freighter:", err);
                }
              } else {
                alert("Freighter wallet not detected. Please install the extension.");
              }
            }}
            className="inline-flex items-center justify-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            Flag as Fake (Stake 10 XLM)
          </button>
        </div>
      </div>
    </div>
  ))}

  // Update the news detail dialog button
  <button
    onClick={() => {
      setShowNewsDetailDialog(false);
      // Access Freighter directly
      if (typeof window !== 'undefined' && (window as any).freighter) {
        try {
          // Create a simple dummy transaction XDR
          const dummyXdr = "AAAAAgAAAADXWUYw0l5WiLZYWIgsB7cuJj8UaNRlf2PPXy3VMmDlGAAAAGQABrH/AAAAAwAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAQAAAADXWYw0l5WiLZYWIgsB7cuJj8UaNRlf2PPXy3VMmDlGAAAAAAAAAACYloAAAAAAAAAAAA==";
          
          // This will show Freighter popup
          (window as any).freighter.signTransaction(dummyXdr)
            .then((result: any) => {
              console.log("Transaction signed:", result);
              setShowVerifySuccess(true);
              setTimeout(() => setShowVerifySuccess(false), 3000);
            })
            .catch((err: any) => {
              console.error("Freighter error:", err);
              alert("Failed to sign transaction. Make sure Freighter is set up correctly.");
            });
        } catch (err) {
          console.error("Error using Freighter:", err);
        }
      } else {
        alert("Freighter wallet not detected. Please install the extension.");
      }
    }}
    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
  >
    Verify this News
  </button>

  if (loading) {
    return (
      <div className="w-full min-h-[calc(100vh-6rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50">
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
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }

        .freighter-modal {
          animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .freighter-modal-content {
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      
      {/* Profile Header - Updated with modern UI and Stellar branding */}
      <div className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 mt-[-1px]">
        <div className="max-w-[1440px] mx-auto px-6 py-10">
          <div className="relative rounded-2xl bg-white/10 backdrop-blur-md shadow-xl overflow-hidden p-6 border border-white/20">
            {/* Background design elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-purple-500/20 blur-2xl"></div>
              <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-blue-500/20 blur-2xl"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-32 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 blur-3xl"></div>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative z-10">
              <div className="flex items-center">
                <div className="bg-white/15 backdrop-blur-lg rounded-full p-4 mr-5 shadow-lg border border-white/20">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white" viewBox="0 0 512 512">
                    <path fill="currentColor" d="M502.6 278.6c-7.8-10.9-21.5-12.5-35.2-11.8-4.1.2-8.5.7-13 .6-30.7-.7-59.9-7.3-89.1-14.5-42.5-10.5-83.1-27.6-126.2-35-18.3-3.1-36.7-4.9-55.1-4.9-18.4 0-37.3 1.7-55.9 5C47.3 229.3 2.2 263.4 2.2 263.4-3.6 268.6-4.5 278.4 3 285c3.3 3 7.5 4.5 11.8 4.5 3.8 0 7.8-1.2 11-3.7 0 0 44.9-34.2 123.7-45.6 84.1-12.2 167.7 14.5 250.3 40.6 36.1 11.4 73 12.3 97.1-4.2 5.5-3.7 8.5-8.9 6.9-14.5-.5-1.5-.8-2.5-1.2-3.5zM255.6 233c73.3 0 133.6-13.1 180.3-36.5-19.3-11.9-42.4-15.7-64.9-15.7-91.5 0-167.2 38.5-253.9 38.5-18.2 0-35.9-1.9-53.2-5.9-1.6-.4-3.2-.8-4.8-1.1 26.2 12.8 65.3 20.7 110.6 20.7h85.9z"/>
                  </svg>
                </div>
                <div>
                  <div className="flex items-center">
                    <h1 className="text-2xl md:text-3xl font-bold text-white">{USER_DATA.username}</h1>
                    <div className="ml-3 bg-white/20 border border-white/40 rounded-full px-4 py-1 text-sm font-medium text-white shadow-sm backdrop-blur-md">
                      Level {USER_DATA.level}
                    </div>
                  </div>
                  <p className="text-white/80 mt-2 font-medium">
                    <span className="text-xs font-normal">Stellar ID: </span>
                    {USER_DATA.address.substring(0, 8)}...{USER_DATA.address.substring(USER_DATA.address.length - 4)}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 w-full md:w-auto">
                <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-xl p-5 text-center shadow-lg transform transition-transform hover:scale-105">
                  <div className="text-2xl font-bold text-white">{USER_DATA.tokens}</div>
                  <div className="text-sm text-white/80 font-medium">XLM Balance</div>
                </div>
                <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-xl p-5 text-center shadow-lg transform transition-transform hover:scale-105">
                  <div className="text-2xl font-bold text-white">{USER_DATA.totalVerified}</div>
                  <div className="text-sm text-white/80 font-medium">News Verified</div>
                </div>
                <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-xl p-5 text-center shadow-lg transform transition-transform hover:scale-105">
                  <div className="text-2xl font-bold text-white">{USER_DATA.pointsEarned}</div>
                  <div className="text-sm text-white/80 font-medium">Points Earned</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs - Update styling slightly */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`py-4 px-1 inline-flex items-center border-b-2 text-sm font-medium ${
                activeTab === "dashboard"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("verifications")}
              className={`py-4 px-1 inline-flex items-center border-b-2 text-sm font-medium ${
                activeTab === "verifications"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Verifications
            </button>
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`py-4 px-1 inline-flex items-center border-b-2 text-sm font-medium ${
                activeTab === "leaderboard"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Leaderboard
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`py-4 px-1 inline-flex items-center border-b-2 text-sm font-medium ${
                activeTab === "settings"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Settings
            </button>
          </div>
        </div>
      </div>
      
      {/* Content - slightly reduce the top padding */}
      <div className="max-w-[1440px] mx-auto px-6 py-8">
        {activeTab === "dashboard" && (
          <div className="space-y-10">
            {/* Progress to next level */}
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Level Progress</h2>
              <div className="mb-2 flex justify-between">
                <span className="text-gray-700">Level {USER_DATA.level}</span>
                <span className="text-gray-700">Level {USER_DATA.level + 1}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2.5 rounded-full" 
                  style={{width: `${(USER_DATA.pointsEarned / (USER_DATA.pointsEarned + USER_DATA.pointsToNextLevel)) * 100}%`}}
                ></div>
              </div>
              <p className="text-sm text-gray-500">
                {USER_DATA.pointsToNextLevel} more points needed to reach Level {USER_DATA.level + 1}
              </p>
              
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Level Benefits</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">+{USER_DATA.level * 3} XLM per verification</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Access to exclusive verification opportunities</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Reduced staking requirements</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Next Level Benefits</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-indigo-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">+{(USER_DATA.level+1) * 3} XLM per verification</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-indigo-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Priority verification submissions</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-indigo-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{USER_DATA.level >= 3 ? 'Higher' : 'Access to'} token swap limits</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
              
            
            {/* Token Swap Feature - New Addition */}
            <div className="bg-white p-8 rounded-xl shadow-sm overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">XLM Token Swap</h2>
                
                {USER_DATA.level >= 3 ? (
                  <div className="flex items-center px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-100">
                    <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                    Swap Available
                  </div>
                ) : (
                  <div className="flex items-center px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-sm font-medium border border-amber-100">
                    <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 9V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 16V16.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                    Level 3+ Required
                  </div>
                )}
              </div>
              
              {/* Animated swap card with gradient background */}
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-0.5 transition-all duration-300 hover:p-1">
                <div className="absolute inset-0 bg-white opacity-[0.02]">
                  <div className="absolute inset-0" style={{ 
                    background: 'url(/noise-texture.svg)', 
                    backgroundSize: '200px', 
                    mixBlendMode: 'overlay', 
                    opacity: 0.4 
                  }}></div>
                </div>
                
                <div className="relative bg-white rounded-lg shadow-sm p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* From Section */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Swap From</label>
                      <div className="relative mb-4">
                        <div className={`relative flex items-center border ${USER_DATA.level >= 3 ? 'border-gray-300' : 'border-gray-200 bg-gray-50'} rounded-lg p-3`}>
                          <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-600" viewBox="0 0 512 512">
                              <path fill="currentColor" d="M502.6 278.6c-7.8-10.9-21.5-12.5-35.2-11.8-4.1.2-8.5.7-13 .6-30.7-.7-59.9-7.3-89.1-14.5-42.5-10.5-83.1-27.6-126.2-35-18.3-3.1-36.7-4.9-55.1-4.9-18.4 0-37.3 1.7-55.9 5C47.3 229.3 2.2 263.4 2.2 263.4-3.6 268.6-4.5 278.4 3 285c3.3 3 7.5 4.5 11.8 4.5 3.8 0 7.8-1.2 11-3.7 0 0 44.9-34.2 123.7-45.6 84.1-12.2 167.7 14.5 250.3 40.6 36.1 11.4 73 12.3 97.1-4.2 5.5-3.7 8.5-8.9 6.9-14.5-.5-1.5-.8-2.5-1.2-3.5zM255.6 233c73.3 0 133.6-13.1 180.3-36.5-19.3-11.9-42.4-15.7-64.9-15.7-91.5 0-167.2 38.5-253.9 38.5-18.2 0-35.9-1.9-53.2-5.9-1.6-.4-3.2-.8-4.8-1.1 26.2 12.8 65.3 20.7 110.6 20.7h85.9z"/>
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <p className="text-sm font-medium text-gray-700">XLM</p>
                              <p className="text-sm text-gray-500">Balance: {USER_DATA.tokens}</p>
                            </div>
                            <input 
                              type="number" 
                              placeholder="0.0" 
                              className={`mt-1 block w-full text-lg bg-transparent border-0 focus:ring-0 p-0 ${USER_DATA.level >= 3 ? 'text-gray-900' : 'text-gray-400'}`}
                              disabled={USER_DATA.level < 3}
                              max={USER_DATA.tokens}
                            />
                          </div>
                        </div>
                        
                        {/* Swap Icon */}
                        <div className="absolute left-1/2 top-full z-10 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 bg-white rounded-full shadow-sm border border-gray-200">
                          <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17 4L20 7L17 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M20 7H9C6.79086 7 5 8.79086 5 11V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M7 20L4 17L7 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M4 17H15C17.2091 17 19 15.2091 19 13V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                      
                      <div className="mt-8">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Swap To</label>
                        <div className={`border ${USER_DATA.level >= 3 ? 'border-gray-300' : 'border-gray-200 bg-gray-50'} rounded-lg p-3 mb-4`}>
                          <div className="flex items-center">
                            <div className="relative">
                              <select 
                                className={`appearance-none bg-gray-100 border-0 rounded-lg py-2 pl-3 pr-10 text-sm font-medium ${USER_DATA.level >= 3 ? 'text-gray-900' : 'text-gray-400'}`}
                                disabled={USER_DATA.level < 3}
                              >
                                <option>BTC</option>
                                <option>ETH</option>
                                <option>USDC</option>
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                            
                            <div className="flex-1 ml-3">
                              <input 
                                type="number" 
                                placeholder="0.0" 
                                className={`block w-full text-lg bg-transparent border-0 focus:ring-0 p-0 ${USER_DATA.level >= 3 ? 'text-gray-900' : 'text-gray-400'}`}
                                disabled={USER_DATA.level < 3}
                                readOnly
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Info Section */}
                    <div className="flex flex-col">
                      <div className={`flex-1 rounded-lg p-5 ${USER_DATA.level >= 3 ? 'bg-gray-50' : 'bg-gray-50/50'}`}>
                        <h3 className="font-medium text-gray-900 mb-4">Swap Information</h3>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Swap Rate</span>
                            <span className={USER_DATA.level >= 3 ? 'text-gray-900' : 'text-gray-400'}>1 XLM = 0.00012 BTC</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Minimum XLM</span>
                            <span className={USER_DATA.level >= 3 ? 'text-gray-900' : 'text-gray-400'}>50 XLM</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Maximum XLM</span>
                            <span className={USER_DATA.level >= 3 ? 'text-gray-900' : 'text-gray-400'}>
                              {USER_DATA.level === 3 ? '500' : 
                               USER_DATA.level === 4 ? '1,000' : 
                               USER_DATA.level >= 5 ? '5,000' : '250'} XLM
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Transaction Fee</span>
                            <span className={USER_DATA.level >= 3 ? 'text-gray-900' : 'text-gray-400'}>1.0%</span>
                          </div>
                          
                          <div className="pt-3 mt-3 border-t border-gray-200">
                            <div className="flex justify-between text-sm font-medium">
                              <span className="text-gray-700">Estimated Receive</span>
                              <span className={USER_DATA.level >= 3 ? 'text-gray-900' : 'text-gray-400'}>0.00000 BTC</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-6">
                          <button
                            disabled={USER_DATA.level < 3}
                            className={`w-full flex items-center justify-center px-4 py-3 rounded-lg text-white font-medium transition-colors ${
                              USER_DATA.level >= 3
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-sm'
                                : 'bg-gray-300 cursor-not-allowed'
                            }`}
                          >
                            {USER_DATA.level >= 3 ? (
                              <>
                                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M17 4L20 7L17 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M20 7H9C6.79086 7 5 8.79086 5 11V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M7 20L4 17L7 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M4 17H15C17.2091 17 19 15.2091 19 13V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Swap Tokens
                              </>
                            ) : (
                              <>
                                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5"/>
                                  <path d="M12 16V16.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                  <path d="M12 8V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                </svg>
                                Reach Level 3 to Swap
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Token Swap Requirements */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 flex items-start">
                  <div className="mt-1 mr-3 flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15.0001 5.00012C16.4588 5.00012 17.9116 5.52796 18.9997 6.46492C20.0877 7.40187 20.7229 8.67448 20.7808 10.0313C20.8387 11.3881 20.3152 12.7069 19.3227 13.7236C18.3302 14.7404 16.9437 15.3784 15.4731 15.4936" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 16.0001C14.2091 16.0001 16 14.2093 16 12.0001C16 9.79098 14.2091 8.00012 12 8.00012C9.79086 8.00012 8 9.79098 8 12.0001C8 14.2093 9.79086 16.0001 12 16.0001Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8.97805 16.6271C7.21798 16.4362 5.6283 15.5503 4.5486 14.1921C3.46889 12.8339 3.00171 11.1205 3.25119 9.43059C3.50067 7.74069 4.44797 6.21268 5.87718 5.19913C7.30639 4.18557 9.09948 3.77375 10.8276 4.05707" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8.99976 19.0001C10.0537 19.0001 10.9098 19.8561 10.9098 20.9101C10.9098 21.964 10.0537 22.8201 8.99976 22.8201C7.94583 22.8201 7.08978 21.964 7.08978 20.9101C7.08978 19.8561 7.94583 19.0001 8.99976 19.0001Z" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M16.0002 19.0001C17.0541 19.0001 17.9102 19.8561 17.9102 20.9101C17.9102 21.964 17.0541 22.8201 16.0002 22.8201C14.9463 22.8201 14.0902 21.964 14.0902 20.9101C14.0902 19.8561 14.9463 19.0001 16.0002 19.0001Z" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M16 8.00012C17.0539 8.00012 17.91 7.14407 17.91 6.09014C17.91 5.0362 17.0539 4.18016 16 4.18016C14.9461 4.18016 14.09 5.0362 14.09 6.09014C14.09 7.14407 14.9461 8.00012 16 8.00012Z" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Level 3+</h4>
                    <p className="text-xs text-gray-500 mt-1">Required to access token swap functionality</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 flex items-start">
                  <div className="mt-1 mr-3 flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-600">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 19V5C4 3.89543 4.89543 3 6 3H19.4C19.7314 3 20 3.26863 20 3.6V16.7143" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M16 8.99998H8M12 13H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M20 7L20 20C20 20.5523 19.5523 21 19 21H5C4.44772 21 4 20.5523 4 20V7" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Verification History</h4>
                    <p className="text-xs text-gray-500 mt-1">Consistent accurate verifications help boost swap rates</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 flex items-start">
                  <div className="mt-1 mr-3 flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Daily Limits</h4>
                    <p className="text-xs text-gray-500 mt-1">Swap limits increase with your level progression</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent activity */}
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recent Verifications</h2>
                <button className="text-sm text-indigo-600 hover:text-indigo-800">
                  View All
                </button>
              </div>
              
              <div className="overflow-hidden">
                <div className="flex flex-col divide-y divide-gray-200">
                  {USER_DATA.recent.map((item) => (
                    <div key={item.id} className="py-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 pr-4">
                          <div className="flex items-center mb-1">
                            <div className={`text-xs font-medium px-2 py-0.5 rounded-full mr-2 ${
                              item.source === "Reuters" ? "bg-blue-600 text-white" : 
                              item.source === "The Guardian" ? "bg-purple-600 text-white" : 
                              "bg-yellow-600 text-white"
                            }`}>
                              {item.source}
                            </div>
                            <span className="text-xs text-gray-500">{item.date}</span>
                          </div>
                          <p className="text-sm font-medium text-gray-900 mb-1 line-clamp-1">{item.title}</p>
                          
                          <div className="flex items-center mt-2">
                            {item.verified ? (
                              <>
                                <span className="inline-flex items-center text-xs text-green-700 bg-green-50 rounded-full px-2 py-0.5 border border-green-200">
                                  <svg className="w-3 h-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  Verified
                                </span>
                                <span className="text-xs text-gray-500 ml-2">Accuracy: {item.accuracy}%</span>
                              </>
                            ) : (
                              <>
                                <span className="inline-flex items-center text-xs text-red-700 bg-red-50 rounded-full px-2 py-0.5 border border-red-200">
                                  <svg className="w-3 h-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                  </svg>
                                  Not Verified
                                </span>
                                <span className="text-xs text-gray-500 ml-2">Accuracy: {item.accuracy}%</span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {item.verified && (
                          <div className="text-right">
                            <div className="inline-flex items-center bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full px-3 py-1">
                              <svg className="w-3 h-3 mr-1 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                              +{item.points} points
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === "leaderboard" && (
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Top Verifiers</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Level
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      News Verified
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      XLM Tokens
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {LEADERBOARD.map((user, index) => (
                    <tr 
                      key={user.address} 
                      className={user.address === USER_DATA.address ? "bg-blue-50" : (index % 2 === 0 ? "bg-white" : "bg-gray-50")}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div className="flex items-center">
                          {user.address === USER_DATA.address ? (
                            <>
                              <span className="font-medium">{user.username}</span>
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                You
                              </span>
                              <span className="ml-2 text-xs text-gray-500">
                                {user.address.substring(0, 4)}...{user.address.substring(user.address.length - 4)}
                              </span>
                            </>
                          ) : (
                            <>
                              <span>{user.username}</span>
                              <span className="ml-2 text-xs text-gray-500">
                                {user.address.substring(0, 4)}...{user.address.substring(user.address.length - 4)}
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Level {user.level}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {user.verified}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {user.tokens}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === "verifications" && (
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">News Pending Verification</h2>
            
            {loadingVerifications ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-900"></div>
                <span className="ml-3 text-gray-600">Loading verification items...</span>
              </div>
            ) : pendingVerifications.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-lg">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12H15M12 9V15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h3 className="text-lg font-medium text-gray-500">No pending verification items</h3>
                <p className="text-gray-400 mt-2">Check back later for new content to verify</p>
              </div>
            ) : (
              <div className="space-y-6">
                {pendingVerifications.map((item) => (
                  <div 
                    key={item.id} 
                    className="border border-gray-200 rounded-lg p-6 transition-all hover:shadow-md cursor-pointer"
                    onClick={() => handleNewsDetailClick(item)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <div className={`text-xs font-medium px-2 py-0.5 rounded-full mr-2 ${getSourceColor(item.source)}`}>
                            {item.source}
                          </div>
                          <span className="text-xs text-gray-500">{item.date}</span>
                        </div>
                        
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {item.title}
                        </h3>
                        
                        <p className="text-sm text-gray-600 mb-4">
                          {item.summary.length > 200 ? item.summary.substring(0, 200) + '...' : item.summary}
                        </p>
                        
                        <div className="flex items-center text-gray-500 text-sm">
                          <div className="flex items-center mr-4">
                            <svg className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                            </svg>
                            {item.verificationCount} verifications
                          </div>
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            {item.verificationProgress}% verified
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-3">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVerifyClick(item, 'verify');
                          }}
                          className="inline-flex items-center justify-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Verify (Stake 10 XLM)
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVerifyClick(item, 'flag');
                          }}
                          className="inline-flex items-center justify-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          Flag as Fake (Stake 10 XLM)
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === "settings" && (
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Personalization Settings</h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">News Preferences</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">News Categories</label>
                    <div className="flex flex-wrap gap-2">
                      {["Politics", "Economy", "Cryptocurrency", "Stock Market", "Technology", "Business", "International"].map((category) => (
                        <div key={category} className="flex items-center">
                          <input
                            id={`category-${category}`}
                            name={`category-${category}`}
                            type="checkbox"
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            defaultChecked={["Economy", "Cryptocurrency", "Stock Market"].includes(category)}
                          />
                          <label htmlFor={`category-${category}`} className="ml-2 mr-4 text-sm text-gray-700">
                            {category}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Sources</label>
                    <div className="flex flex-wrap gap-2">
                      {["Reuters", "Bloomberg", "The Guardian", "TruthSocial", "X (Twitter)", "YouTube", "CNBC", "Wall Street Journal"].map((source) => (
                        <div key={source} className="flex items-center">
                          <input
                            id={`source-${source}`}
                            name={`source-${source}`}
                            type="checkbox"
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            defaultChecked={["Reuters", "Bloomberg", "TruthSocial", "X (Twitter)"].includes(source)}
                          />
                          <label htmlFor={`source-${source}`} className="ml-2 mr-4 text-sm text-gray-700">
                            {source}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Trading Preferences</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notification Settings</label>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          id="notifications-verified"
                          name="notifications-verified"
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          defaultChecked
                        />
                        <label htmlFor="notifications-verified" className="ml-2 text-sm text-gray-700">
                          Notify me about highly verified news (&gt;90% verification)
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="notifications-trading"
                          name="notifications-trading"
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          defaultChecked
                        />
                        <label htmlFor="notifications-trading" className="ml-2 text-sm text-gray-700">
                          Notify me about trading suggestions based on verified news
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="notifications-sentiment"
                          name="notifications-sentiment"
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          defaultChecked
                        />
                        <label htmlFor="notifications-sentiment" className="ml-2 text-sm text-gray-700">
                          Notify me about significant market sentiment changes
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trading Interests</label>
                    <div className="flex flex-wrap gap-2">
                      {["Stocks", "Cryptocurrencies", "ETFs", "Forex", "Commodities", "Options"].map((interest) => (
                        <div key={interest} className="flex items-center">
                          <input
                            id={`interest-${interest}`}
                            name={`interest-${interest}`}
                            type="checkbox"
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            defaultChecked={["Stocks", "Cryptocurrencies"].includes(interest)}
                          />
                          <label htmlFor={`interest-${interest}`} className="ml-2 mr-4 text-sm text-gray-700">
                            {interest}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Verification Dialog */}
      {showVerificationDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all"
            style={{ animation: 'slideUp 0.4s ease-out forwards' }}
          >
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg md:text-xl font-bold text-white">
                  {verificationChoice === 'verify' ? 'Verify News Content' : 'Flag as Fake News'}
                </h3>
                <button 
                  onClick={() => !processingStake && setShowVerificationDialog(false)}
                  className={`text-white hover:text-gray-200 focus:outline-none ${processingStake ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={processingStake}
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="px-6 py-6">
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {pendingNewsItem?.title}
                </h4>
                
                {verificationStep === 'initial' && (
                  <>
                    <p className="text-gray-600 text-sm mb-4">
                      You are about to {verificationChoice === 'verify' ? 'verify' : 'flag'} this news item.
                    </p>
                    
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-sm text-gray-700 font-medium mb-1">Staking Required</p>
                          <p className="text-sm text-gray-600">
                            To participate in the verification process, you need to stake 10 XLM. These tokens will be:
                          </p>
                          <ul className="mt-2 space-y-1 text-sm text-gray-600 list-disc list-inside">
                            <li>Added to the verification pool for this news item</li>
                            <li>Returned with rewards if your verification matches the consensus</li>
                            <li>Lost if your verification is incorrect (against 90%+ consensus)</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-6">
                      <div>
                        <span className="block text-sm text-gray-500">Current Balance</span>
                        <span className="block text-xl font-semibold text-gray-900">{USER_DATA.tokens} XLM</span>
                      </div>
                      <div>
                        <span className="block text-sm text-gray-500">Staking Amount</span>
                        <span className="block text-xl font-semibold text-indigo-600">10 XLM</span>
                      </div>
                    </div>
                  </>
                )}
                
                {(verificationStep === 'staking' || verificationStep === 'verifying') && (
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 my-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600 mb-4"></div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        {verificationStep === 'staking' 
                          ? "Processing Stake Transaction..." 
                          : "Signing Verification on Rootstock..."}
                      </h4>
                      <p className="text-sm text-gray-600 mb-4">
                        {verificationStep === 'staking' 
                          ? "Please confirm the transaction using your Stellar Passkey to stake 10 XLM." 
                          : "Please sign the verification message in your wallet on the Rootstock network."}
                      </p>
                      
                      {txHash && (
                        <div className="w-full mt-2 p-2 bg-gray-100 rounded overflow-auto text-xs text-gray-700 font-mono break-all">
                          Transaction Hash: {txHash}
                        </div>
                      )}
                      
                      {verificationStep === 'staking' ? (
                        <div className="mt-4 flex flex-col w-full">
                          <p className="text-xs text-gray-500 mb-1">Step 1/2: Staking on Stellar</p>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div className="bg-blue-600 h-1.5 rounded-full w-1/2"></div>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 flex flex-col w-full">
                          <p className="text-xs text-gray-500 mb-1">Step 2/2: Verifying on Rootstock</p>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div className="bg-blue-600 h-1.5 rounded-full w-full"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => !processingStake && setShowVerificationDialog(false)}
                  className={`px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors ${
                    processingStake ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={processingStake}
                >
                  Cancel
                </button>
                {verificationStep === 'initial' && (
                  <button
                    onClick={handleVerificationConfirm}
                    className={`px-4 py-2 rounded-lg text-white transition-colors ${
                      verificationChoice === 'verify' 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    Confirm & Stake 10 XLM
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showVerifySuccess && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-fadeIn">
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="font-medium">Transaction Confirmed</p>
              <p className="text-sm text-green-100">Successfully signed with Freighter wallet</p>
            </div>
          </div>
        </div>
      )}

      {/* News Detail Dialog */}
      {showNewsDetailDialog && selectedVerificationItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all"
            style={{ animation: 'slideUp 0.4s ease-out forwards' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Dialog Content */}
            <div className="relative">
              {/* Close button */}
              <button 
                onClick={() => setShowNewsDetailDialog(false)}
                className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Image (if available) */}
              {selectedVerificationItem.image_url && (
                <div className="w-full h-72 relative">
                  <img 
                    src={selectedVerificationItem.image_url} 
                    alt={selectedVerificationItem.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 w-full p-6">
                    <div className="flex items-center">
                      <div className={`text-xs font-medium px-2 py-0.5 rounded-full bg-white/90 text-gray-800 backdrop-blur-sm mr-2`}>
                        {selectedVerificationItem.source}
                      </div>
                      <span className="text-xs text-white/90">{selectedVerificationItem.date}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mt-2 drop-shadow-sm">{selectedVerificationItem.title}</h2>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="p-6 pt-8">
                {!selectedVerificationItem.image_url && (
                  <>
                    <div className="flex items-center mb-4">
                      <div className={`text-xs font-medium px-2 py-0.5 rounded-full mr-2 ${getSourceColor(selectedVerificationItem.source)}`}>
                        {selectedVerificationItem.source}
                      </div>
                      <span className="text-xs text-gray-500">{selectedVerificationItem.date}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">{selectedVerificationItem.title}</h2>
                  </>
                )}

                {/* Summary */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Summary</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedVerificationItem.summary}</p>
                </div>

                {/* Sentiment Analysis */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Sentiment Analysis</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium 
                        ${selectedVerificationItem.sentiment === 'positive' ? 'bg-green-100 text-green-800' : 
                          selectedVerificationItem.sentiment === 'negative' ? 'bg-red-100 text-red-800' : 
                          'bg-blue-100 text-blue-800'}`
                      }>
                        {selectedVerificationItem.sentiment.charAt(0).toUpperCase() + selectedVerificationItem.sentiment.slice(1)}
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm">{selectedVerificationItem.sentiment_explanation}</p>
                  </div>
                </div>

                {/* Trading Recommendations */}
                {(selectedVerificationItem.trading_recommendations.buy.length > 0 || 
                  selectedVerificationItem.trading_recommendations.sell.length > 0) && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Trading Recommendations</h3>
                    <div className="space-y-4">
                      {selectedVerificationItem.trading_recommendations.buy.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Buy</h4>
                          <div className="space-y-2">
                            {selectedVerificationItem.trading_recommendations.buy.map((rec: any, idx: number) => (
                              <div key={`buy-${idx}`} className="bg-green-50 p-3 rounded-lg border border-green-100">
                                <div className="flex items-center mb-1">
                                  <span className="font-medium text-green-800 mr-2">{rec.symbol}</span>
                                  <svg className="w-3.5 h-3.5 text-green-700" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-9.293a1 1 0 00-1.414 0l-3 3a1 1 0 101.414 1.414L10 10.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <p className="text-sm text-gray-700">{rec.reason}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {selectedVerificationItem.trading_recommendations.sell.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Sell</h4>
                          <div className="space-y-2">
                            {selectedVerificationItem.trading_recommendations.sell.map((rec: any, idx: number) => (
                              <div key={`sell-${idx}`} className="bg-red-50 p-3 rounded-lg border border-red-100">
                                <div className="flex items-center mb-1">
                                  <span className="font-medium text-red-800 mr-2">{rec.symbol}</span>
                                  <svg className="w-3.5 h-3.5 text-red-700" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.707-7.707a1 1 0 01-1.414 0l-3 3a1 1 0 101.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <p className="text-sm text-gray-700">{rec.reason}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Original Sources with Links */}
                {selectedVerificationItem.source_links && selectedVerificationItem.source_links.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Original Sources</h3>
                    <div className="space-y-3">
                      {selectedVerificationItem.source_links.map((sourceLink: any, idx: number) => (
                        <a 
                          key={idx}
                          href={sourceLink.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="h-8 w-8 relative mr-3">
                            <img 
                              src={getSourceLogo(sourceLink.source)}
                              alt={sourceLink.source}
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
                <div className="pt-4 border-t border-gray-200">
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
                      href={`https://gateway.pinata.cloud/ipfs/${selectedVerificationItem.cid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                    >
                      View on IPFS
                      <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 6H6C4.89543 6 4 6.89543 4 8V18C4 19.1046 4.89543 20 6 20H16C17.1046 20 18 19.1046 18 18V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14 4H20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M20 4L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-8 flex justify-end gap-3">
                  <button
                    onClick={() => setShowNewsDetailDialog(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowNewsDetailDialog(false);
                      handleVerifyClick(selectedVerificationItem, 'verify');
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Verify this News
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add css styles for animations */}
      <style jsx global>{`
        .verification-item {
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        .verification-item:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.1), 0 6px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        .verification-dialog-appear {
          animation: dialogAppear 0.3s ease-out forwards;
        }
        
        @keyframes dialogAppear {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .item-appear {
          animation: itemAppear 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
          transform: translateY(15px);
        }
        
        @keyframes itemAppear {
          to { opacity: 1; transform: translateY(0); }
        }
        
        .shimmer-effect {
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%);
          background-size: 1000px 100%;
          animation: shimmer 2s infinite linear;
        }
        
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        
        .progress-indicator {
          position: relative;
          overflow: hidden;
        }
        
        .progress-indicator::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, rgba(99,102,241,0) 0%, rgba(99,102,241,0.15) 50%, rgba(99,102,241,0) 100%);
          transform: translateX(-100%);
          animation: progressShimmer 2s infinite;
        }
        
        @keyframes progressShimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
} 