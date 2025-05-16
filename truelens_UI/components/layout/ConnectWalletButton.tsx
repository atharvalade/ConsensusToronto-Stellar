"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { connectWallet, isWalletConnected, disconnectWallet } from '@/lib/wallet-utils';

const ConnectWalletButton = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Check if wallet is already connected on load
  useEffect(() => {
    const checkWalletConnection = async () => {
      const connected = await isWalletConnected();
      
      if (connected) {
        setWalletConnected(true);
        
        // Try to get the account address if connected
        try {
          const address = await connectWallet(true); // Just check for existing connection
          setWalletAddress(address);
        } catch (error) {
          console.error("Error getting wallet address:", error);
        }
      }
    };
    
    checkWalletConnection();
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    
    try {
      const address = await connectWallet();
      
      if (address) {
        setWalletConnected(true);
        setWalletAddress(address);
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      const success = await disconnectWallet();
      
      if (success) {
        setWalletConnected(false);
        setWalletAddress(null);
        setShowDropdown(false);
      }
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  };

  // Format wallet address for display
  const formatAddress = (address: string | null) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="relative">
      {walletConnected ? (
        <div className="flex items-center gap-3">
          <button
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <span className="hidden sm:inline">Connected:</span> {formatAddress(walletAddress)}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          {showDropdown && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10 border border-gray-200 dark:border-gray-700">
              <div className="p-2">
                <Link href="/profile" className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                  Profile
                </Link>
                <button 
                  onClick={handleDisconnect}
                  className="w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <button
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2"
          onClick={handleConnect}
          disabled={isConnecting}
        >
          {isConnecting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connecting...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Connect with Passkey
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default ConnectWalletButton; 